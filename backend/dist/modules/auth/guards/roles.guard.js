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
    canActivate(context) {
        var _a, _b, _c, _d, _e;
        const requiredRoles = this.reflector.getAllAndOverride('roles', [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles || requiredRoles.length === 0)
            return true;
        const { user } = context.switchToHttp().getRequest();
        if (!user)
            return false;
        const roleId = Number((_c = (_b = (_a = user.role_id) !== null && _a !== void 0 ? _a : user.roleId) !== null && _b !== void 0 ? _b : user.role) !== null && _c !== void 0 ? _c : 0);
        const roleName = String((_e = (_d = user.roleName) !== null && _d !== void 0 ? _d : user.role_name) !== null && _e !== void 0 ? _e : '').toLowerCase().trim();
        const normalizedRequired = requiredRoles.map((r) => String(r).toLowerCase());
        const normalizedRoleName = roleName || ROLE_NAME_BY_ID[roleId] || '';
        if (normalizedRoleName === 'super_admin')
            return true;
        if (normalizedRequired.includes(normalizedRoleName))
            return true;
        return false;
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], RolesGuard);
//# sourceMappingURL=roles.guard.js.map