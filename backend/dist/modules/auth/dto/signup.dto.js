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
exports.SignupDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class SignupDto {
}
exports.SignupDto = SignupDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Transform)(({ value }) => String(value !== null && value !== void 0 ? value : '').trim().toLowerCase()),
    __metadata("design:type", String)
], SignupDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], SignupDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SignupDto.prototype, "fullName", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => !o.fullName),
    (0, class_validator_1.IsNotEmpty)({ message: 'Full name is required' }),
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Transform)(({ value, obj }) => { var _a, _b, _c; return String((_c = (_b = (_a = obj === null || obj === void 0 ? void 0 : obj.fullName) !== null && _a !== void 0 ? _a : obj === null || obj === void 0 ? void 0 : obj.full_name) !== null && _b !== void 0 ? _b : value) !== null && _c !== void 0 ? _c : '').trim(); }, { toClassOnly: true }),
    __metadata("design:type", String)
], SignupDto.prototype, "full_name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value, obj }) => { var _a, _b, _c; return (_c = (_b = (_a = obj === null || obj === void 0 ? void 0 : obj.phone) !== null && _a !== void 0 ? _a : obj === null || obj === void 0 ? void 0 : obj.phoneNumber) !== null && _b !== void 0 ? _b : obj === null || obj === void 0 ? void 0 : obj.phone_number) !== null && _c !== void 0 ? _c : value; }),
    __metadata("design:type", String)
], SignupDto.prototype, "phone_number", void 0);
//# sourceMappingURL=signup.dto.js.map