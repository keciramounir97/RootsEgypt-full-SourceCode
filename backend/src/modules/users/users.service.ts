import { Injectable, Inject, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Knex } from "knex";
import { User } from '../../models/User';
import { Book } from '../../models/Book';
import { Tree } from '../../models/Tree';
import { Gallery } from '../../models/Gallery';
import { ActivityLog } from '../../models/ActivityLog';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { ActivityService } from '../activity/activity.service';

@Injectable()
export class UsersService {
  constructor(
    @Inject("KnexConnection") private readonly knex: Knex,
    private readonly activityService: ActivityService,
  ) {}

  private parsePrivileges(value: any): string[] {
    if (!value) return [];
    if (Array.isArray(value)) return value.map((v) => String(v));
    try {
      const parsed = JSON.parse(String(value));
      return Array.isArray(parsed) ? parsed.map((v) => String(v)) : [];
    } catch {
      return String(value)
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
    }
  }

  private serializePrivileges(value: any): string | null {
    if (!value) return null;
    if (!Array.isArray(value)) return null;
    const cleaned = value.map((v) => String(v).trim()).filter(Boolean);
    return cleaned.length ? JSON.stringify(cleaned) : null;
  }

  async findAll() {
    return User.query(this.knex)
      .select(
        "users.id",
        "users.full_name as fullName",
        "users.phone_number as phoneNumber",
        "users.email",
        "users.role_id as roleId",
        "users.status",
        "users.admin_privileges as adminPrivileges",
        "users.created_at as createdAt",
        "users.last_login as lastLogin",
        "role.name as roleName",
      )
      .joinRelated("role")
      .orderBy("users.created_at", "desc")
      .limit(100)
      .then((rows) =>
        rows.map((row: any) => ({
          ...row,
          permissions: this.parsePrivileges(row.adminPrivileges),
        })),
      );
  }

  async findOne(id: number) {
    const row = await this.knex("users")
      .select(
        "users.id",
        "users.full_name as fullName",
        "users.phone_number as phoneNumber",
        "users.email",
        "users.role_id",
        "users.role_id as roleId",
        "users.status",
        "users.admin_privileges as adminPrivileges",
        "users.created_at as createdAt",
        "users.last_login as lastLogin",
        "roles.name as roleName",
      )
      .leftJoin("roles", "users.role_id", "roles.id")
      .where("users.id", id)
      .first();

    if (!row) throw new NotFoundException("User not found");
    // Ensure role_id/roleId for guards (some expect role_id, some roleId)
    row.role_id = row.role_id ?? row.roleId;
    row.roleId = row.roleId ?? row.role_id;
    row.permissions = this.parsePrivileges(row.adminPrivileges);
    return row;
  }

  async findByEmail(email: string) {
    return User.query(this.knex).findOne({ email });
  }

  async create(data: any, adminId: number | null) {
    const existing = await this.findByEmail(data.email);
    if (existing) throw new BadRequestException("Email already registered");

    let passwordHash: string;
    if (adminId != null) {
      // Admin creating user: generate random password (user must reset)
      const randomPassword = crypto.randomBytes(24).toString("hex");
      passwordHash = await bcrypt.hash(randomPassword, 10);
    } else {
      // Self-signup: use provided password
      if (!data.password || String(data.password).length < 6) {
        throw new BadRequestException("Password must be at least 6 characters");
      }
      passwordHash = await bcrypt.hash(data.password, 10);
    }

    const privileges = this.serializePrivileges(data.privileges);
    const insertPayload: Record<string, any> = {
      full_name: data.fullName || data.full_name,
      phone_number: data.phone || data.phoneNumber || data.phone_number || null,
      email: data.email,
      password: passwordHash,
      role_id: data.roleId ?? data.role_id ?? 2,
      status: "active",
    };
    if (privileges !== null) {
      insertPayload.admin_privileges = privileges;
    }
    const newUser = await User.query(this.knex).insertAndFetch(insertPayload);

    if (adminId != null) {
      await this.activityService.log(
        adminId,
        "users",
        `Created user: ${data.email}`,
      );
    } else {
      await this.activityService.log(
        newUser.id,
        "users",
        `Signed up: ${data.email}`,
      );
    }

    return newUser;
  }

  async update(id: number, data: any, adminId: number) {
    const user = await User.query(this.knex).findById(id);
    if (!user) throw new NotFoundException("User not found");
    const actor = await User.query(this.knex).findById(adminId);
    if (!actor) throw new NotFoundException("Actor not found");
    const isAdminActor =
      Number(actor.role_id) === 1 || Number(actor.role_id) === 3;
    const isSelfUpdate = Number(adminId) === Number(id);
    if (!isAdminActor && !isSelfUpdate) {
      throw new ForbiddenException("You can only update your own account");
    }

    const updateData: any = {};
    if (data.fullName !== undefined) updateData.full_name = data.fullName;
    if (data.full_name !== undefined) updateData.full_name = data.full_name;

    if (data.phone !== undefined) updateData.phone_number = data.phone;
    if (data.phoneNumber !== undefined)
      updateData.phone_number = data.phoneNumber;
    if (data.phone_number !== undefined)
      updateData.phone_number = data.phone_number;

    if (isAdminActor) {
      if (data.roleId !== undefined) updateData.role_id = data.roleId;
      if (data.role_id !== undefined) updateData.role_id = data.role_id;
      if (data.privileges !== undefined)
        updateData.admin_privileges = this.serializePrivileges(data.privileges);
      if (data.status !== undefined) updateData.status = data.status;
    }

    await User.query(this.knex).patch(updateData).where("id", id);
    await this.activityService.log(adminId, "users", `Updated user #${id}`);

    return { message: "User updated" };
  }

  async delete(id: number, adminId: number) {
    if (Number(id) === Number(adminId)) {
      throw new BadRequestException("You cannot delete your own account");
    }

    const user = await User.query(this.knex).findById(id);
    if (!user) throw new NotFoundException("User not found");

    // Transactional deletion
    await User.transaction(this.knex, async (trx) => {
      await Book.query(trx)
        .patch({ uploaded_by: null })
        .where("uploaded_by", id);
      await Tree.query(trx).patch({ user_id: null }).where("user_id", id);
      await Gallery.query(trx)
        .patch({ uploaded_by: null })
        .where("uploaded_by", id);
      await ActivityLog.query(trx)
        .patch({ actor_user_id: null })
        .where("actor_user_id", id);

      // Delete password resets if table exists model
      await trx("password_resets").delete().where("email", user.email);

      await User.query(trx).deleteById(id);
    });

    await this.activityService.log(adminId, "users", `Deleted user #${id}`);
    return { message: "User deleted" };
  }

  async findAdmins() {
    return this.findAll().then((rows: any[]) =>
      rows.filter((u) => Number(u.roleId) === 1 || Number(u.roleId) === 3),
    );
  }

  async createAdmin(data: any, superAdminId: number) {
    const payload = {
      ...data,
      roleId: 1,
      privileges: data.privileges || [],
    };
    return this.create(payload, superAdminId);
  }

  async updateAdmin(id: number, data: any, superAdminId: number) {
    const target = await this.findOne(id);
    if (Number(target.roleId) === 3) {
      throw new ForbiddenException(
        "Cannot edit super admin through admin manager",
      );
    }
    return this.update(id, { ...data, roleId: 1 }, superAdminId);
  }
}
