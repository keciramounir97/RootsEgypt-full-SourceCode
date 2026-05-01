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
exports.JwtStrategy = void 0;
const passport_jwt_1 = require("passport-jwt");
const passport_1 = require("@nestjs/passport");
const common_1 = require("@nestjs/common");
const users_service_1 = require("../../users/users.service");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor(usersService) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET ||
                "d1cb88c3dc305de2f683da0b2174fb18b18be5276b9f44d26487f2d5b34c9bb329644049d51364bf68d80a94eefe708e716277663319b8b7f51bd8590c37d31e",
        });
        this.usersService = usersService;
    }
    async validate(payload) {
        if (payload === null || payload === void 0 ? void 0 : payload.seedAdmin) {
            return {
                id: payload.sub,
                email: payload.email,
                fullName: payload.fullName,
                full_name: payload.fullName,
                role_id: payload.role,
                roleId: payload.role,
                roleName: payload.roleName || "admin",
                status: "active",
                permissions: ["all"],
                seedAdmin: true,
                database: "unavailable",
            };
        }
        const user = await this.usersService.findOne(payload.sub);
        if (!user) {
            throw new common_1.UnauthorizedException();
        }
        return user;
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map