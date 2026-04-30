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
exports.SearchController = exports.OptionalJwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const search_service_1 = require("./search.service");
const common_2 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
let OptionalJwtAuthGuard = class OptionalJwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
    handleRequest(err, user, info) {
        return user;
    }
};
exports.OptionalJwtAuthGuard = OptionalJwtAuthGuard;
exports.OptionalJwtAuthGuard = OptionalJwtAuthGuard = __decorate([
    (0, common_2.Injectable)()
], OptionalJwtAuthGuard);
let SearchController = class SearchController {
    constructor(searchService) {
        this.searchService = searchService;
    }
    async search(q, req) {
        return this.searchService.search(q, req.user);
    }
    async suggest(q, req) {
        const results = await this.searchService.search(q, req.user);
        return {
            trees: Array.isArray(results === null || results === void 0 ? void 0 : results.trees) ? results.trees.slice(0, 8) : [],
            people: Array.isArray(results === null || results === void 0 ? void 0 : results.people) ? results.people.slice(0, 8) : [],
        };
    }
};
exports.SearchController = SearchController;
__decorate([
    (0, common_1.Get)("search"),
    (0, common_1.UseGuards)(OptionalJwtAuthGuard),
    __param(0, (0, common_1.Query)("q")),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "search", null);
__decorate([
    (0, common_1.Get)("search/suggest"),
    (0, common_1.UseGuards)(OptionalJwtAuthGuard),
    __param(0, (0, common_1.Query)("q")),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "suggest", null);
exports.SearchController = SearchController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [search_service_1.SearchService])
], SearchController);
//# sourceMappingURL=search.controller.js.map