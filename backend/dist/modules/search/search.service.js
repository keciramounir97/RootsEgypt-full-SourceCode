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
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const Book_1 = require("../../models/Book");
const Tree_1 = require("../../models/Tree");
const Person_1 = require("../../models/Person");
let SearchService = class SearchService {
    constructor(knex) {
        this.knex = knex;
    }
    async search(query, user) {
        var _a, _b, _c;
        if (!query)
            return { books: [], trees: [], people: [] };
        const q = query.trim();
        const roleId = Number((_c = (_b = (_a = user === null || user === void 0 ? void 0 : user.role_id) !== null && _a !== void 0 ? _a : user === null || user === void 0 ? void 0 : user.roleId) !== null && _b !== void 0 ? _b : user === null || user === void 0 ? void 0 : user.role) !== null && _c !== void 0 ? _c : 0);
        const canSeeAllTrees = user && (roleId === 1 || roleId === 3 || user.roleName === 'admin' || user.roleName === 'super_admin');
        const books = await Book_1.Book.query(this.knex)
            .where('is_public', true)
            .andWhere((builder) => {
            builder.where('title', 'like', `${q}%`)
                .orWhere('author', 'like', `${q}%`)
                .orWhere('category', 'like', `${q}%`)
                .orWhere('description', 'like', `%${q}%`);
        })
            .orderBy('title', 'asc')
            .limit(20);
        const treeQuery = Tree_1.Tree.query(this.knex)
            .where((builder) => {
            builder.where('title', 'like', `${q}%`)
                .orWhere('title', 'like', `%${q}%`)
                .orWhere('description', 'like', `${q}%`)
                .orWhere('description', 'like', `%${q}%`);
        });
        if (!canSeeAllTrees) {
            if (user) {
                treeQuery.andWhere((builder) => {
                    builder.where('is_public', true).orWhere('user_id', user.id);
                });
            }
            else {
                treeQuery.where('is_public', true);
            }
        }
        const trees = await treeQuery.orderBy('title', 'asc').limit(20)
            .withGraphFetched('owner')
            .modifyGraph('owner', (builder) => builder.select('id', 'full_name'));
        const peopleQuery = Person_1.Person.query(this.knex)
            .joinRelated('tree')
            .where('name', 'like', `%${q}%`);
        if (!canSeeAllTrees) {
            if (user) {
                peopleQuery.where((builder) => {
                    builder.where('tree.is_public', true).orWhere('tree.user_id', user.id);
                });
            }
            else {
                peopleQuery.where('tree.is_public', true);
            }
        }
        const people = await peopleQuery
            .orderBy('name', 'asc')
            .limit(30)
            .withGraphFetched('tree.owner')
            .modifyGraph('tree.owner', (builder) => builder.select('id', 'full_name'));
        return {
            books,
            trees: trees.map((t) => {
                var _a;
                return (Object.assign(Object.assign({}, t), { owner_name: (_a = t.owner) === null || _a === void 0 ? void 0 : _a.full_name }));
            }),
            people: people.map((p) => {
                var _a, _b, _c, _d, _e, _f;
                return ({
                    id: p.id,
                    name: p.name,
                    tree_id: (_a = p.tree) === null || _a === void 0 ? void 0 : _a.id,
                    tree_title: (_b = p.tree) === null || _b === void 0 ? void 0 : _b.title,
                    tree_description: (_c = p.tree) === null || _c === void 0 ? void 0 : _c.description,
                    tree_is_public: !!((_d = p.tree) === null || _d === void 0 ? void 0 : _d.is_public),
                    owner_name: (_f = (_e = p.tree) === null || _e === void 0 ? void 0 : _e.owner) === null || _f === void 0 ? void 0 : _f.full_name
                });
            })
        };
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('KnexConnection')),
    __metadata("design:paramtypes", [Object])
], SearchService);
//# sourceMappingURL=search.service.js.map