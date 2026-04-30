"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AllExceptionsFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
let AllExceptionsFilter = AllExceptionsFilter_1 = class AllExceptionsFilter {
    constructor() {
        this.logger = new common_1.Logger(AllExceptionsFilter_1.name);
    }
    catch(exception, host) {
        var _a;
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const isProduction = process.env.NODE_ENV === "production";
        const status = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const message = exception instanceof common_1.HttpException
            ? exception.getResponse()
            : "Internal server error";
        const errorMessage = typeof message === "object" &&
            (message === null || message === void 0 ? void 0 : message.message)
            ? message.message
            : message;
        const requestId = request.id || "-";
        if (!(exception instanceof common_1.HttpException) && exception instanceof Error) {
            this.logger.error(`[${requestId}] UNHANDLED ${((_a = exception.constructor) === null || _a === void 0 ? void 0 : _a.name) || "Error"}: ${exception.message}`, exception.stack);
        }
        else {
            this.logger.error(`[${requestId}] HTTP ${status} - ${Array.isArray(errorMessage) ? errorMessage[0] : errorMessage}`);
        }
        if (requestId !== "-") {
            response.setHeader("X-Request-Id", requestId);
        }
        const safeMessage = isProduction && status >= 500
            ? "Internal server error"
            : Array.isArray(errorMessage)
                ? errorMessage[0]
                : errorMessage;
        const realErrorMessage = !(exception instanceof common_1.HttpException) && exception instanceof Error
            ? exception.message
            : undefined;
        const errorPayload = isProduction && status >= 500
            ? { message: "Internal server error" }
            : typeof message === "object"
                ? message
                : { message: realErrorMessage !== null && realErrorMessage !== void 0 ? realErrorMessage : message };
        response.status(status).json(Object.assign({ statusCode: status, message: safeMessage, data: null, error: errorPayload, timestamp: new Date().toISOString(), path: request.url }, (requestId !== "-" && { requestId })));
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = AllExceptionsFilter_1 = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map