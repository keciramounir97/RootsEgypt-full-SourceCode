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
exports.PersonsController = void 0;
const common_1 = require("@nestjs/common");
const trees_service_1 = require("./trees.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const Person_1 = require("../../models/Person");
const common_2 = require("@nestjs/common");
let PersonsController = class PersonsController {
    constructor(treesService, knex) {
        this.treesService = treesService;
        this.knex = knex;
    }
    async ensureTreeAccess(treeId, user) {
        var _a, _b, _c;
        const tree = await this.treesService.findOne(treeId);
        if (!tree)
            throw new common_1.NotFoundException('Tree not found');
        const canManageAll = user.roleName === 'admin' || user.roleName === 'super_admin';
        const roleId = Number((_c = (_b = (_a = user.role_id) !== null && _a !== void 0 ? _a : user.roleId) !== null && _b !== void 0 ? _b : user.role) !== null && _c !== void 0 ? _c : 0);
        const isAdmin = roleId === 1 || roleId === 3 || user.roleName === 'admin' || user.roleName === 'super_admin';
        if (!isAdmin && tree.user_id !== user.id) {
            throw new common_1.ForbiddenException('Forbidden');
        }
        return tree;
    }
    async listPublicPeople(treeId) {
        const tree = await this.treesService.getPublic(treeId);
        return Person_1.Person.query(this.knex).where('tree_id', treeId).orderBy('name', 'asc');
    }
    async getPublicPerson(id) {
        const person = await Person_1.Person.query(this.knex).findById(id).withGraphFetched('tree');
        if (!person || !person.tree)
            throw new common_1.NotFoundException('Not found');
        if (!person.tree.is_public)
            throw new common_1.ForbiddenException('Forbidden');
        return {
            id: person.id,
            name: person.name,
            tree: { id: person.tree.id, title: person.tree.title }
        };
    }
    async listMyPeople(treeId, req) {
        await this.ensureTreeAccess(treeId, req.user);
        return Person_1.Person.query(this.knex).where('tree_id', treeId).orderBy('name', 'asc');
    }
    async getMyPerson(id, req) {
        const person = await Person_1.Person.query(this.knex).findById(id).withGraphFetched('tree');
        if (!person || !person.tree)
            throw new common_1.NotFoundException('Not found');
        await this.ensureTreeAccess(person.tree.id, req.user);
        return {
            id: person.id,
            name: person.name,
            tree: { id: person.tree.id, title: person.tree.title }
        };
    }
    async createMyPerson(treeId, body, req) {
        await this.ensureTreeAccess(treeId, req.user);
        if (!body.name)
            throw new common_1.BadRequestException('Name is required');
        const created = await Person_1.Person.query(this.knex).insertAndFetch({
            name: body.name,
            tree_id: treeId
        });
        return { id: created.id };
    }
    async updateMyPerson(treeId, id, body, req) {
        await this.ensureTreeAccess(treeId, req.user);
        const person = await Person_1.Person.query(this.knex).findById(id);
        if (!person || person.tree_id !== treeId)
            throw new common_1.NotFoundException('Not found');
        if (!body.name)
            throw new common_1.BadRequestException('Name is required');
        const updated = await Person_1.Person.query(this.knex).patchAndFetchById(id, { name: body.name });
        return { id: updated.id };
    }
    async deleteMyPerson(treeId, id, req) {
        await this.ensureTreeAccess(treeId, req.user);
        const person = await Person_1.Person.query(this.knex).findById(id);
        if (!person || person.tree_id !== treeId)
            throw new common_1.NotFoundException('Not found');
        await Person_1.Person.query(this.knex).deleteById(id);
        return { message: 'Deleted' };
    }
};
exports.PersonsController = PersonsController;
__decorate([
    (0, common_1.Get)('trees/:treeId/people'),
    __param(0, (0, common_1.Param)('treeId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PersonsController.prototype, "listPublicPeople", null);
__decorate([
    (0, common_1.Get)('people/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PersonsController.prototype, "getPublicPerson", null);
__decorate([
    (0, common_1.Get)('my/trees/:treeId/people'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('treeId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PersonsController.prototype, "listMyPeople", null);
__decorate([
    (0, common_1.Get)('my/people/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PersonsController.prototype, "getMyPerson", null);
__decorate([
    (0, common_1.Post)('my/trees/:treeId/people'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('treeId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], PersonsController.prototype, "createMyPerson", null);
__decorate([
    (0, common_1.Put)('my/trees/:treeId/people/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('treeId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object, Object]),
    __metadata("design:returntype", Promise)
], PersonsController.prototype, "updateMyPerson", null);
__decorate([
    (0, common_1.Delete)('my/trees/:treeId/people/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('treeId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], PersonsController.prototype, "deleteMyPerson", null);
exports.PersonsController = PersonsController = __decorate([
    (0, common_1.Controller)(),
    __param(1, (0, common_2.Inject)('KnexConnection')),
    __metadata("design:paramtypes", [trees_service_1.TreesService, Object])
], PersonsController);
//# sourceMappingURL=persons.controller.js.map