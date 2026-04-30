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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcryptjs");
const RefreshToken_1 = require("../../models/RefreshToken");
const activity_service_1 = require("../activity/activity.service");
const crypto = require("crypto");
const PasswordResetRequest_1 = require("../../models/PasswordResetRequest");
let AuthService = class AuthService {
    constructor(usersService, jwtService, activityService, knex) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.activityService = activityService;
        this.knex = knex;
    }
    async validateUser(email, pass) {
        const normalizedEmail = String(email !== null && email !== void 0 ? email : "")
            .trim()
            .toLowerCase();
        const user = await this.usersService.findByEmail(normalizedEmail);
        if (user &&
            user.password &&
            (await bcrypt.compare(pass, user.password))) {
            const { password } = user, result = __rest(user, ["password"]);
            return result;
        }
        return null;
    }
    async login(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role_id || user.roleId
        };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = crypto.randomBytes(40).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await RefreshToken_1.RefreshToken.query(this.knex).insert({
            token: refreshToken,
            user_id: user.id,
            expires_at: expiresAt.toISOString().slice(0, 19).replace('T', ' '),
        });
        await this.activityService.log(user.id, 'security', `User logged in: ${user.email}`);
        const fullUser = await this.usersService.findOne(user.id);
        return {
            token: accessToken,
            refreshToken,
            user: fullUser,
        };
    }
    async signup(data) {
        var _a;
        const payload = Object.assign(Object.assign({}, data), { full_name: (_a = data.full_name) !== null && _a !== void 0 ? _a : data.fullName });
        const user = await this.usersService.create(payload, null);
        return this.login(user);
    }
    async refreshToken(token) {
        if (!token || typeof token !== 'string') {
            throw new common_1.UnauthorizedException('Refresh token is required');
        }
        const storedToken = await RefreshToken_1.RefreshToken.query(this.knex)
            .findOne({ token })
            .withGraphFetched('user');
        if (!storedToken || new Date(storedToken.expires_at) < new Date()) {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
        const user = storedToken.user;
        if (!user) {
            await RefreshToken_1.RefreshToken.query(this.knex).deleteById(storedToken.id);
            throw new common_1.UnauthorizedException('User no longer exists');
        }
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role_id
        };
        const newRefreshToken = crypto.randomBytes(40).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await RefreshToken_1.RefreshToken.query(this.knex).deleteById(storedToken.id);
        await RefreshToken_1.RefreshToken.query(this.knex).insert({
            token: newRefreshToken,
            user_id: user.id,
            expires_at: expiresAt.toISOString().slice(0, 19).replace('T', ' '),
        });
        return {
            token: this.jwtService.sign(payload),
            refreshToken: newRefreshToken,
        };
    }
    async logout(userId) {
        await RefreshToken_1.RefreshToken.query(this.knex).delete().where('user_id', userId);
        await this.activityService.log(userId, 'security', 'User logged out');
        return { message: 'Logged out' };
    }
    async requestReset(email) {
        const normalized = String(email !== null && email !== void 0 ? email : '').trim().toLowerCase();
        if (!normalized) {
            throw new common_1.BadRequestException('Email is required');
        }
        const user = await this.usersService.findByEmail(normalized);
        if (!user)
            return { message: 'If the email exists, a reset link will be sent.' };
        const code = crypto.randomBytes(6).toString('hex');
        const codeHash = await bcrypt.hash(code, 10);
        await this.knex('password_resets').del().where('email', normalized);
        await this.knex('password_resets').insert({
            email: normalized,
            code_hash: codeHash,
            expires_at: this.knex.raw('DATE_ADD(NOW(), INTERVAL 15 MINUTE)'),
        });
        return { message: 'If the email exists, a reset code will be sent.', code: process.env.NODE_ENV === 'development' ? code : undefined };
    }
    async verifyReset(email, code, newPassword) {
        const normalizedEmail = String(email !== null && email !== void 0 ? email : '').trim().toLowerCase();
        const trimmedCode = String(code !== null && code !== void 0 ? code : '').trim();
        const pass = String(newPassword !== null && newPassword !== void 0 ? newPassword : '');
        if (!normalizedEmail || !trimmedCode || !pass) {
            throw new common_1.BadRequestException('Email, code, and new password are required');
        }
        if (pass.length < 6) {
            throw new common_1.BadRequestException('Password must be at least 6 characters');
        }
        const row = await this.knex('password_resets')
            .where('email', normalizedEmail)
            .where('expires_at', '>', this.knex.fn.now())
            .first();
        if (!row) {
            await this.knex('password_resets').del().where('email', normalizedEmail);
            throw new common_1.BadRequestException('Invalid or expired reset code');
        }
        const valid = await bcrypt.compare(trimmedCode, row.code_hash);
        if (!valid)
            throw new common_1.BadRequestException('Invalid reset code');
        const hash = await bcrypt.hash(pass, 10);
        await this.knex('users').where('email', normalizedEmail).update({ password: hash });
        await this.knex('password_resets').del().where('email', normalizedEmail);
        return { message: 'Password reset successful' };
    }
    async verifyResetByToken(email, token, newPassword) {
        const normalizedEmail = String(email !== null && email !== void 0 ? email : '').trim().toLowerCase();
        const trimmedToken = String(token !== null && token !== void 0 ? token : '').trim();
        const pass = String(newPassword !== null && newPassword !== void 0 ? newPassword : '');
        if (!normalizedEmail || !trimmedToken || !pass) {
            throw new common_1.BadRequestException('Email, token, and new password are required');
        }
        if (pass.length < 6) {
            throw new common_1.BadRequestException('Password must be at least 6 characters');
        }
        const request = await PasswordResetRequest_1.PasswordResetRequest.query(this.knex)
            .where('email', normalizedEmail)
            .where('reset_token', trimmedToken)
            .where('status', 'approved')
            .where('token_expires_at', '>', this.knex.fn.now())
            .first();
        if (!request) {
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
        const hash = await bcrypt.hash(pass, 10);
        await this.knex('users').where('email', normalizedEmail).update({ password: hash });
        await PasswordResetRequest_1.PasswordResetRequest.query(this.knex)
            .patch({
            status: 'completed',
            reset_token: null,
            token_expires_at: null,
        })
            .where('id', request.id);
        await this.activityService.log(request.user_id, 'security', `Password reset completed: ${normalizedEmail}`);
        return { message: 'Password reset successful' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, common_1.Inject)('KnexConnection')),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        activity_service_1.ActivityService, Object])
], AuthService);
//# sourceMappingURL=auth.service.js.map