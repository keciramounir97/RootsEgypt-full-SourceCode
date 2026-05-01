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
var AuthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const login_dto_1 = require("./dto/login.dto");
const signup_dto_1 = require("./dto/signup.dto");
const request_reset_dto_1 = require("./dto/request-reset.dto");
const verify_reset_dto_1 = require("./dto/verify-reset.dto");
const users_service_1 = require("../users/users.service");
let AuthController = AuthController_1 = class AuthController {
    constructor(authService, usersService) {
        this.authService = authService;
        this.usersService = usersService;
        this.logger = new common_1.Logger(AuthController_1.name);
    }
    isDatabaseUnavailable(error) {
        const message = error instanceof Error ? error.message : String(error || "");
        const code = (error === null || error === void 0 ? void 0 : error.code) || "";
        return (code === "ENOTFOUND" ||
            code === "ECONNREFUSED" ||
            code === "ETIMEDOUT" ||
            message.includes("getaddrinfo") ||
            message.includes("ECONNREFUSED") ||
            message.includes("ETIMEDOUT"));
    }
    serviceUnavailable() {
        return new common_1.ServiceUnavailableException({
            message: "Database is temporarily unavailable",
            database: "disconnected",
        });
    }
    async login(loginDto) {
        try {
            const user = await this.authService.validateUser(loginDto.email, loginDto.password);
            if (!user)
                throw new common_1.UnauthorizedException("Invalid credentials");
            return await this.authService.login(user);
        }
        catch (err) {
            if (err instanceof common_1.UnauthorizedException)
                throw err;
            if (this.isDatabaseUnavailable(err))
                throw this.serviceUnavailable();
            this.logger.error(`login error: ${err instanceof Error ? err.message : String(err)}`, err instanceof Error ? err.stack : undefined);
            throw new common_1.InternalServerErrorException(err instanceof Error ? err.message : "Login failed");
        }
    }
    async signup(signupDto) {
        try {
            return await this.authService.signup(signupDto);
        }
        catch (err) {
            if (err === null || err === void 0 ? void 0 : err.status)
                throw err;
            if (this.isDatabaseUnavailable(err))
                throw this.serviceUnavailable();
            this.logger.error(`signup error: ${err instanceof Error ? err.message : String(err)}`, err instanceof Error ? err.stack : undefined);
            throw new common_1.InternalServerErrorException(err instanceof Error ? err.message : "Signup failed");
        }
    }
    async refresh(body) {
        try {
            return await this.authService.refreshToken(body === null || body === void 0 ? void 0 : body.refreshToken);
        }
        catch (err) {
            if (err === null || err === void 0 ? void 0 : err.status)
                throw err;
            if (this.isDatabaseUnavailable(err))
                throw this.serviceUnavailable();
            throw err;
        }
    }
    async verifyReset(dto) {
        return this.authService.verifyReset(dto.email, dto.code, dto.newPassword);
    }
    async verifyResetByToken(dto) {
        return this.authService.verifyResetByToken(dto.email, dto.token, dto.newPassword);
    }
    async requestReset(dto) {
        try {
            return await this.authService.requestReset(dto.email);
        }
        catch (err) {
            this.logger.error(`requestReset error: ${err instanceof Error ? err.message : String(err)}`, err instanceof Error ? err.stack : undefined);
            return { message: "If the email exists, a reset link will be sent." };
        }
    }
    async logout(req) {
        return this.authService.logout(req.user.id);
    }
    async me(req) {
        return req.user;
    }
    async updateMe(body, req) {
        await this.usersService.update(req.user.id, body, req.user.id);
        return this.usersService.findOne(req.user.id);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)("login"),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)("signup"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [signup_dto_1.SignupDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signup", null);
__decorate([
    (0, common_1.Post)("refresh"),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)("reset/verify"),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_reset_dto_1.VerifyResetDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyReset", null);
__decorate([
    (0, common_1.Post)("reset/token"),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyResetByToken", null);
__decorate([
    (0, common_1.Post)("reset"),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_reset_dto_1.RequestResetDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "requestReset", null);
__decorate([
    (0, common_1.Post)("logout"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)("me"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "me", null);
__decorate([
    (0, common_1.Patch)("me"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateMe", null);
exports.AuthController = AuthController = AuthController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        users_service_1.UsersService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map