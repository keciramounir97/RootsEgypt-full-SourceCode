"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const User_1 = require("../../models/User");
const Book_1 = require("../../models/Book");
const Tree_1 = require("../../models/Tree");
const Gallery_1 = require("../../models/Gallery");
const ActivityLog_1 = require("../../models/ActivityLog");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const activity_service_1 = require("../activity/activity.service");
let UsersService = class UsersService {
    constructor(knex, activityService) {
        this.knex = knex;
        this.activityService = activityService;
    }
    parsePrivileges(value) {
        if (!value)
            return [];
        if (Array.isArray(value))
            return value.map((v) => String(v));
        try {
            const parsed = JSON.parse(String(value));
            return Array.isArray(parsed) ? parsed.map((v) => String(v)) : [];
        }
        catch (_a) {
            return String(value)
                .split(',')
                .map((v) => v.trim())
                .filter(Boolean);
        }
    }
    serializePrivileges(value) {
        if (!value)
            return null;
        if (!Array.isArray(value))
            return null;
        const cleaned = value.map((v) => String(v).trim()).filter(Boolean);
        return cleaned.length ? JSON.stringify(cleaned) : null;
    }
    async findAll() {
        return User_1.User.query(this.knex)
            .select('users.id', 'users.full_name as fullName', 'users.phone_number as phoneNumber', 'users.email', 'users.role_id as roleId', 'users.status', 'users.admin_privileges as adminPrivileges', 'users.created_at as createdAt', 'users.last_login as lastLogin', 'role.name as roleName')
            .joinRelated('role')
            .orderBy('users.created_at', 'desc')
            .limit(100)
            .then((rows) => rows.map((row) => (Object.assign(Object.assign({}, row), { permissions: this.parsePrivileges(row.adminPrivileges) }))));
    }
    async findOne(id) {
        var _a, _b;
        const row = await this.knex('users')
            .select('users.id', 'users.full_name as fullName', 'users.phone_number as phoneNumber', 'users.email', 'users.role_id', 'users.role_id as roleId', 'users.status', 'users.admin_privileges as adminPrivileges', 'users.created_at as createdAt', 'users.last_login as lastLogin', 'roles.name as roleName')
            .leftJoin('roles', 'users.role_id', 'roles.id')
            .where('users.id', id)
            .first();
        if (!row)
            throw new common_1.NotFoundException('User not found');
        row.role_id = (_a = row.role_id) !== null && _a !== void 0 ? _a : row.roleId;
        row.roleId = (_b = row.roleId) !== null && _b !== void 0 ? _b : row.role_id;
        row.permissions = this.parsePrivileges(row.adminPrivileges);
        return row;
    }
    async findByEmail(email) {
        return User_1.User.query(this.knex).findOne({ email });
    }
    async create(data, adminId) {
        var _a, _b;
        const existing = await this.findByEmail(data.email);
        if (existing)
            throw new common_1.BadRequestException('Email already registered');
        let passwordHash;
        if (adminId != null) {
            const randomPassword = crypto.randomBytes(24).toString('hex');
            passwordHash = await bcrypt.hash(randomPassword, 10);
        }
        else {
            if (!data.password || String(data.password).length < 6) {
                throw new common_1.BadRequestException('Password must be at least 6 characters');
            }
            passwordHash = await bcrypt.hash(data.password, 10);
        }
        const privileges = this.serializePrivileges(data.privileges);
        const insertPayload = {
            full_name: data.fullName || data.full_name,
            phone_number: data.phone || data.phoneNumber || data.phone_number || null,
            email: data.email,
            password: passwordHash,
            role_id: (_b = (_a = data.roleId) !== null && _a !== void 0 ? _a : data.role_id) !== null && _b !== void 0 ? _b : 2,
            status: "active",
        };
        if (privileges !== null) {
            insertPayload.admin_privileges = privileges;
        }
        const newUser = await User_1.User.query(this.knex).insertAndFetch(insertPayload);
        if (adminId != null) {
            await this.activityService.log(adminId, 'users', `Created user: ${data.email}`);
        }
        else {
            await this.activityService.log(newUser.id, 'users', `Signed up: ${data.email}`);
        }
        return newUser;
    }
    async update(id, data, adminId) {
        const user = await User_1.User.query(this.knex).findById(id);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const actor = await User_1.User.query(this.knex).findById(adminId);
        if (!actor)
            throw new common_1.NotFoundException('Actor not found');
        const isAdminActor = Number(actor.role_id) === 1 || Number(actor.role_id) === 3;
        const isSelfUpdate = Number(adminId) === Number(id);
        if (!isAdminActor && !isSelfUpdate) {
            throw new common_1.ForbiddenException('You can only update your own account');
        }
        const updateData = {};
        if (data.fullName !== undefined)
            updateData.full_name = data.fullName;
        if (data.full_name !== undefined)
            updateData.full_name = data.full_name;
        if (data.phone !== undefined)
            updateData.phone_number = data.phone;
        if (data.phoneNumber !== undefined)
            updateData.phone_number = data.phoneNumber;
        if (data.phone_number !== undefined)
            updateData.phone_number = data.phone_number;
        if (isAdminActor) {
            if (data.roleId !== undefined)
                updateData.role_id = data.roleId;
            if (data.role_id !== undefined)
                updateData.role_id = data.role_id;
            if (data.privileges !== undefined)
                updateData.admin_privileges = this.serializePrivileges(data.privileges);
            if (data.status !== undefined)
                updateData.status = data.status;
        }
        await User_1.User.query(this.knex).patch(updateData).where('id', id);
        await this.activityService.log(adminId, 'users', `Updated user #${id}`);
        return { message: 'User updated' };
    }
    async delete(id, adminId) {
        if (Number(id) === Number(adminId)) {
            throw new common_1.BadRequestException('You cannot delete your own account');
        }
        const user = await User_1.User.query(this.knex).findById(id);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        await User_1.User.transaction(this.knex, async (trx) => {
            await Book_1.Book.query(trx).patch({ uploaded_by: null }).where('uploaded_by', id);
            await Tree_1.Tree.query(trx).patch({ user_id: null }).where('user_id', id);
            await Gallery_1.Gallery.query(trx).patch({ uploaded_by: null }).where('uploaded_by', id);
            await ActivityLog_1.ActivityLog.query(trx).patch({ actor_user_id: null }).where('actor_user_id', id);
            await trx('password_resets').delete().where('email', user.email);
            await User_1.User.query(trx).deleteById(id);
        });
        await this.activityService.log(adminId, 'users', `Deleted user #${id}`);
        return { message: 'User deleted' };
    }
    async findAdmins() {
        return this.findAll().then((rows) => rows.filter((u) => Number(u.roleId) === 1 || Number(u.roleId) === 3));
    }
    async createAdmin(data, superAdminId) {
        const payload = Object.assign(Object.assign({}, data), { roleId: 1, privileges: data.privileges || [] });
        return this.create(payload, superAdminId);
    }
    async updateAdmin(id, data, superAdminId) {
        const target = await this.findOne(id);
        if (Number(target.roleId) === 3) {
            throw new common_1.ForbiddenException('Cannot edit super admin through admin manager');
        }
        return this.update(id, Object.assign(Object.assign({}, data), { roleId: 1 }), superAdminId);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('KnexConnection')),
    __metadata("design:paramtypes", [Object, activity_service_1.ActivityService])
], UsersService);
//# sourceMappingURL=users.service.js.map