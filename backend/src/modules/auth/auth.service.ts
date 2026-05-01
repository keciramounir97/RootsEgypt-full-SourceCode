import { Injectable, UnauthorizedException, BadRequestException, Inject } from '@nestjs/common';
import { Knex } from "knex";
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RefreshToken } from '../../models/RefreshToken';
import { ActivityService } from '../activity/activity.service';
import * as crypto from 'crypto';
import { PasswordResetRequest } from '../../models/PasswordResetRequest';

type SeedAdmin = {
  id: number;
  email: string;
  password: string;
  fullName: string;
  roleId: number;
};

const SEED_ADMINS: SeedAdmin[] = [
  {
    id: 900001,
    email: "karimadmin@rootsegypt.org",
    password: "admin2025$",
    fullName: "Karim Admin",
    roleId: 1,
  },
  {
    id: 900002,
    email: "kameladmin@rootsegypt.org",
    password: "vivreplusfort18041972SS",
    fullName: "Kamel Admin",
    roleId: 1,
  },
  {
    id: 900003,
    email: "devteam@rootsegypt.org",
    password: "admin2025$",
    fullName: "Dev Team Admin",
    roleId: 1,
  },
];

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private activityService: ActivityService,
    @Inject("KnexConnection") private readonly knex: Knex,
  ) {}

  private isDatabaseUnavailable(error: unknown) {
    const message =
      error instanceof Error ? error.message : String((error as any) || "");
    const code = (error as any)?.code || "";
    return (
      code === "ENOTFOUND" ||
      code === "ECONNREFUSED" ||
      code === "ETIMEDOUT" ||
      message.includes("getaddrinfo") ||
      message.includes("ECONNREFUSED") ||
      message.includes("ETIMEDOUT")
    );
  }

  private getSeedAdmin(email: string, password: string) {
    return SEED_ADMINS.find(
      (admin) => admin.email === email && admin.password === password,
    );
  }

  private toSeedAdminUser(admin: SeedAdmin) {
    return {
      id: admin.id,
      email: admin.email,
      fullName: admin.fullName,
      full_name: admin.fullName,
      role_id: admin.roleId,
      roleId: admin.roleId,
      roleName: admin.roleId === 3 ? "super_admin" : "admin",
      status: "active",
      permissions: ["all"],
      seedAdmin: true,
      database: "unavailable",
    };
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const normalizedEmail = String(email ?? "")
      .trim()
      .toLowerCase();
    try {
      const user = await this.usersService.findByEmail(normalizedEmail);
      if (user && user.password && (await bcrypt.compare(pass, user.password))) {
        const { password, ...result } = user;
        return result;
      }
      return null;
    } catch (error) {
      if (!this.isDatabaseUnavailable(error)) {
        throw error;
      }

      const seedAdmin = this.getSeedAdmin(normalizedEmail, pass);
      if (!seedAdmin) {
        throw error;
      }
      return this.toSeedAdminUser(seedAdmin);
    }
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role_id || user.roleId,
      fullName: user.fullName || user.full_name,
      roleName: user.roleName,
      seedAdmin: Boolean(user.seedAdmin),
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = crypto.randomBytes(40).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    if (user.seedAdmin) {
      return {
        token: accessToken,
        refreshToken: null,
        user,
        degraded: true,
        message:
          "Logged in with seed admin fallback while the database is unavailable.",
      };
    }

    // Store refresh token
    await RefreshToken.query(this.knex).insert({
      token: refreshToken,
      user_id: user.id,
      expires_at: expiresAt.toISOString().slice(0, 19).replace("T", " "),
    });

    await this.activityService.log(
      user.id,
      "security",
      `User logged in: ${user.email}`,
    );

    // Fetch full user data for response
    const fullUser = await this.usersService.findOne(user.id);

    return {
      token: accessToken, // Frontend expects 'token'
      refreshToken,
      user: fullUser,
    };
  }

  async signup(data: any) {
    const payload = { ...data, full_name: data.full_name ?? data.fullName };
    const user = await this.usersService.create(payload, null); // null adminId for self-signup
    return this.login(user);
  }

  async refreshToken(token: string) {
    if (!token || typeof token !== "string") {
      throw new UnauthorizedException("Refresh token is required");
    }
    const storedToken = await RefreshToken.query(this.knex)
      .findOne({ token })
      .withGraphFetched("user");

    if (!storedToken || new Date(storedToken.expires_at) < new Date()) {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }
    const user = storedToken.user;
    if (!user) {
      await RefreshToken.query(this.knex).deleteById(storedToken.id);
      throw new UnauthorizedException("User no longer exists");
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role_id,
    };

    // Rotate refresh token
    const newRefreshToken = crypto.randomBytes(40).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await RefreshToken.query(this.knex).deleteById(storedToken.id);
    await RefreshToken.query(this.knex).insert({
      token: newRefreshToken,
      user_id: user.id,
      expires_at: expiresAt.toISOString().slice(0, 19).replace("T", " "),
    });

    return {
      token: this.jwtService.sign(payload),
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId: number) {
    await RefreshToken.query(this.knex).delete().where("user_id", userId);
    await this.activityService.log(userId, "security", "User logged out");
    return { message: "Logged out" };
  }

  async requestReset(email: string) {
    const normalized = String(email ?? "")
      .trim()
      .toLowerCase();
    if (!normalized) {
      throw new BadRequestException("Email is required");
    }
    const user = await this.usersService.findByEmail(normalized);
    if (!user)
      return { message: "If the email exists, a reset link will be sent." };
    const code = crypto.randomBytes(6).toString("hex");
    const codeHash = await bcrypt.hash(code, 10);
    await this.knex("password_resets").del().where("email", normalized);
    await this.knex("password_resets").insert({
      email: normalized,
      code_hash: codeHash,
      expires_at: this.knex.raw("DATE_ADD(NOW(), INTERVAL 15 MINUTE)"),
    });
    // TODO: send email via MailerService
    return {
      message: "If the email exists, a reset code will be sent.",
      code: process.env.NODE_ENV === "development" ? code : undefined,
    };
  }

  async verifyReset(email: string, code: string, newPassword: string) {
    const normalizedEmail = String(email ?? "")
      .trim()
      .toLowerCase();
    const trimmedCode = String(code ?? "").trim();
    const pass = String(newPassword ?? "");

    if (!normalizedEmail || !trimmedCode || !pass) {
      throw new BadRequestException(
        "Email, code, and new password are required",
      );
    }
    if (pass.length < 6) {
      throw new BadRequestException("Password must be at least 6 characters");
    }
    const row = await this.knex("password_resets")
      .where("email", normalizedEmail)
      .where("expires_at", ">", this.knex.fn.now())
      .first();
    if (!row) {
      await this.knex("password_resets").del().where("email", normalizedEmail);
      throw new BadRequestException("Invalid or expired reset code");
    }
    const valid = await bcrypt.compare(trimmedCode, row.code_hash);
    if (!valid) throw new BadRequestException("Invalid reset code");
    const hash = await bcrypt.hash(pass, 10);
    await this.knex("users")
      .where("email", normalizedEmail)
      .update({ password: hash });
    await this.knex("password_resets").del().where("email", normalizedEmail);
    return { message: "Password reset successful" };
  }

  async verifyResetByToken(email: string, token: string, newPassword: string) {
    const normalizedEmail = String(email ?? "")
      .trim()
      .toLowerCase();
    const trimmedToken = String(token ?? "").trim();
    const pass = String(newPassword ?? "");
    if (!normalizedEmail || !trimmedToken || !pass) {
      throw new BadRequestException(
        "Email, token, and new password are required",
      );
    }
    if (pass.length < 6) {
      throw new BadRequestException("Password must be at least 6 characters");
    }

    const request = await PasswordResetRequest.query(this.knex)
      .where("email", normalizedEmail)
      .where("reset_token", trimmedToken)
      .where("status", "approved")
      .where("token_expires_at", ">", this.knex.fn.now())
      .first();

    if (!request) {
      throw new BadRequestException("Invalid or expired reset token");
    }

    const hash = await bcrypt.hash(pass, 10);
    await this.knex("users")
      .where("email", normalizedEmail)
      .update({ password: hash });
    await PasswordResetRequest.query(this.knex)
      .patch({
        status: "completed",
        reset_token: null,
        token_expires_at: null,
      })
      .where("id", request.id);

    await this.activityService.log(
      request.user_id,
      "security",
      `Password reset completed: ${normalizedEmail}`,
    );
    return { message: "Password reset successful" };
  }
}
