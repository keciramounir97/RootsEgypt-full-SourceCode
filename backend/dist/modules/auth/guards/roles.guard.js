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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const ROLE_NAME_BY_ID = {
    1: 'admin',
    2: 'user',
    3: 'super_admin',
};
let RolesGuard = class RolesGuard {
    constructor(reflector) {
        this.reflector = reflector;
    }
    parsePermissions(user) {
        var _a, _b;
        const raw = (_b = (_a = user === null || user === void 0 ? void 0 : user.permissions) !== null && _a !== void 0 ? _a : user === null || user === void 0 ? void 0 : user.adminPrivileges) !== null && _b !== void 0 ? _b : user === null || user === void 0 ? void 0 : user.admin_privileges;
        if (!raw)
            return [];
        if (Array.isArray(raw))
            return raw.map((value) => String(value));
        try {
            const parsed = JSON.parse(String(raw));
            return Array.isArray(parsed) ? parsed.map((value) => String(value)) : [];
        }
        catch (_c) {
            return String(raw)
                .split(',')
                .map((value) => value.trim())
                .filter(Boolean);
        }
    }
    permissionFromRequestPath(path) {
        const normalized = String(path || '').toLowerCase();
        if (normalized.includes('/admin/users/validation'))
            return 'validation-approvals';
        if (/\/admin\/users\/\d+\/(validate|approve|reject|reject-validation)/.test(normalized)) {
            return 'validation-approvals';
        }
        if (normalized.includes('/admin/role-distribution'))
            return 'role-distribution';
        if (normalized.includes('/admin/trees'))
            return 'trees';
        if (normalized.includes('/admin/gallery'))
            return 'gallery';
        if (normalized.includes('/admin/audios'))
            return 'audios';
        if (normalized.includes('/admin/documents'))
            return 'documents';
        if (normalized.includes('/admin/books'))
            return 'books';
        if (normalized.includes('/admin/articles'))
            return 'articles';
        if (normalized.includes('/admin/users') || normalized.includes('/admin/roles'))
            return 'users';
        if (normalized.includes('/admin/suggestions'))
            return 'suggestions';
        if (normalized.includes('/admin/contact'))
            return 'contact-messages';
        if (normalized.includes('/admin/newsletter'))
            return 'newsletter';
        if (normalized.includes('/admin/activity'))
            return 'activity';
        if (normalized.includes('/admin/settings'))
            return 'settings';
        if (normalized.includes('/admin/site-images/hero'))
            return 'hero-images';
        if (normalized.includes('/admin/site-images/background'))
            return 'background-images';
        if (normalized.includes('/admin/site-images'))
            return 'settings';
        if (normalized.includes('/admin/footer'))
            return 'footer-settings';
        if (normalized.includes('/admin/stats'))
            return 'dashboard';
        return null;
    }
    canActivate(context) {
        var _a, _b, _c, _d, _e;
        const requiredRoles = this.reflector.getAllAndOverride('roles', [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles || requiredRoles.length === 0)
            return true;
        const request = context.switchToHttp().getRequest();
        const { user } = request;
        if (!user)
            return false;
        const roleId = Number((_c = (_b = (_a = user.role_id) !== null && _a !== void 0 ? _a : user.roleId) !== null && _b !== void 0 ? _b : user.role) !== null && _c !== void 0 ? _c : 0);
        const roleName = String((_e = (_d = user.roleName) !== null && _d !== void 0 ? _d : user.role_name) !== null && _e !== void 0 ? _e : '').toLowerCase().trim();
        const normalizedRequired = requiredRoles.map((r) => String(r).toLowerCase());
        const normalizedRoleName = roleName || ROLE_NAME_BY_ID[roleId] || '';
        if (normalizedRoleName === 'super_admin')
            return true;
        if (normalizedRequired.includes(normalizedRoleName)) {
            const permissions = this.parsePermissions(user);
            if (roleId === 1 && permissions.length > 0) {
                if (permissions.includes('all'))
                    return true;
                const requiredPermission = this.permissionFromRequestPath(request.path || request.url);
                return !requiredPermission || permissions.includes(requiredPermission);
            }
            return true;
        }
        return false;
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], RolesGuard);
//# sourceMappingURL=roles.guard.js.map