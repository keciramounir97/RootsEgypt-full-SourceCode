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
exports.TreesService = void 0;
const common_1 = require("@nestjs/common");
const knex_1 = require("knex");
const Tree_1 = require("../../models/Tree");
const Person_1 = require("../../models/Person");
const activity_service_1 = require("../activity/activity.service");
const file_utils_1 = require("../../common/utils/file.utils");
const gedcomx_util_1 = require("../../common/utils/gedcomx.util");
const path = require("path");
const fs = require("fs");
let TreesService = class TreesService {
    constructor(knex, activityService) {
        this.knex = knex;
        this.activityService = activityService;
    }
    async listPublic() {
        return Tree_1.Tree.query(this.knex)
            .where("is_public", true)
            .orderBy("created_at", "desc")
            .withGraphFetched("owner")
            .modifyGraph("owner", (builder) => builder.select("id", "full_name"));
    }
    async getPublic(id) {
        const tree = await Tree_1.Tree.query(this.knex)
            .findById(id)
            .where("is_public", true)
            .withGraphFetched("owner")
            .modifyGraph("owner", (builder) => builder.select("id", "full_name"));
        if (!tree)
            throw new common_1.NotFoundException("Tree not found");
        return tree;
    }
    async listByUser(userId) {
        return Tree_1.Tree.query(this.knex)
            .where("user_id", userId)
            .orderBy("created_at", "desc")
            .withGraphFetched("owner")
            .modifyGraph("owner", (builder) => builder.select("id", "full_name", "email"))
            .withGraphFetched("people");
    }
    async listAdmin() {
        return Tree_1.Tree.query(this.knex)
            .orderBy("created_at", "desc")
            .withGraphFetched("owner")
            .modifyGraph("owner", (builder) => builder.select("id", "full_name", "email"));
    }
    async findOne(id) {
        const tree = await Tree_1.Tree.query(this.knex)
            .findById(id)
            .withGraphFetched("owner");
        if (!tree)
            throw new common_1.NotFoundException("Tree not found");
        return tree;
    }
    async create(data, userId, file) {
        var _a, _b;
        const title = (_a = data.title) !== null && _a !== void 0 ? _a : data.name;
        if (!title) {
            throw new common_1.BadRequestException("Title is required");
        }
        const isPublic = data.isPublic === "true" || data.isPublic === true;
        let gedcomPath = file ? `/uploads/trees/${file.filename}` : null;
        let dataFormat = "gedcom";
        if (file) {
            const explicit = (_b = data.data_format) !== null && _b !== void 0 ? _b : data.dataFormat;
            if (explicit === "gedcom7" ||
                explicit === "gedcomx" ||
                explicit === "gedcom")
                dataFormat = explicit;
            else {
                const content = fs.readFileSync(file.path, "utf8").slice(0, 4000);
                dataFormat = this.inferDataFormat(file.originalname, content);
            }
        }
        if (file && !isPublic) {
            const src = file.path;
            const dest = path.join(file_utils_1.PRIVATE_TREE_UPLOADS_DIR, file.filename);
            (0, file_utils_1.safeMoveFile)(src, dest);
            gedcomPath = `private/trees/${file.filename}`;
        }
        const newTree = await Tree_1.Tree.query(this.knex).insertAndFetch({
            title,
            description: data.description,
            archive_source: data.archiveSource,
            document_code: data.documentCode,
            gedcom_path: gedcomPath,
            data_format: dataFormat,
            user_id: userId,
            is_public: isPublic,
        });
        if (gedcomPath) {
            await this.rebuildPeople(newTree.id, gedcomPath);
        }
        await this.activityService.log(userId, "trees", `Created tree: ${title}`);
        return newTree;
    }
    async update(id, data, userId, userRole, file) {
        var _a, _b;
        const tree = await this.findOne(id);
        const roleId = Number(userRole !== null && userRole !== void 0 ? userRole : 0);
        const isAdmin = roleId === 1 || roleId === 3;
        const isOwner = tree.user_id === userId;
        if (!isAdmin && !isOwner) {
            throw new common_1.ForbiddenException("Forbidden");
        }
        const updateData = {};
        const title = (_a = data.title) !== null && _a !== void 0 ? _a : data.name;
        if (title)
            updateData.title = title;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.archiveSource !== undefined)
            updateData.archive_source = data.archiveSource;
        if (data.documentCode !== undefined)
            updateData.document_code = data.documentCode;
        const isPublic = data.isPublic !== undefined
            ? data.isPublic === "true" ||
                data.isPublic === true ||
                data.isPublic === 1
            : !!tree.is_public;
        updateData.is_public = Boolean(isPublic);
        let gedcomPath = tree.gedcom_path;
        if (file) {
            if (tree.gedcom_path)
                (0, file_utils_1.safeUnlink)((0, file_utils_1.resolveStoredFilePath)(tree.gedcom_path));
            let newPath = `/uploads/trees/${file.filename}`;
            if (!isPublic) {
                const dest = path.join(file_utils_1.PRIVATE_TREE_UPLOADS_DIR, file.filename);
                (0, file_utils_1.safeMoveFile)(file.path, dest);
                newPath = `private/trees/${file.filename}`;
            }
            updateData.gedcom_path = newPath;
            const explicit = (_b = data.data_format) !== null && _b !== void 0 ? _b : data.dataFormat;
            if (explicit === "gedcom7" ||
                explicit === "gedcomx" ||
                explicit === "gedcom") {
                updateData.data_format = explicit;
            }
            else {
                const content = fs.readFileSync(file.path, "utf8").slice(0, 4000);
                updateData.data_format = this.inferDataFormat(file.originalname, content);
            }
            gedcomPath = newPath;
        }
        else if (tree.is_public !== isPublic && tree.gedcom_path) {
            const currentPath = (0, file_utils_1.resolveStoredFilePath)(tree.gedcom_path);
            if (currentPath && fs.existsSync(currentPath)) {
                const filename = path.basename(currentPath);
                if (isPublic) {
                    const dest = path.join(file_utils_1.TREE_UPLOADS_DIR, filename);
                    (0, file_utils_1.safeMoveFile)(currentPath, dest);
                    updateData.gedcom_path = `/uploads/trees/${filename}`;
                }
                else {
                    const dest = path.join(file_utils_1.PRIVATE_TREE_UPLOADS_DIR, filename);
                    (0, file_utils_1.safeMoveFile)(currentPath, dest);
                    updateData.gedcom_path = `private/trees/${filename}`;
                }
                gedcomPath = updateData.gedcom_path;
            }
        }
        await Tree_1.Tree.query(this.knex).patch(updateData).where("id", id);
        if (file || (gedcomPath && tree.is_public !== isPublic)) {
            if (file) {
                await this.rebuildPeople(id, gedcomPath);
            }
        }
        await this.activityService.log(userId, "trees", `Updated tree: ${tree.title}`);
        return { id };
    }
    async delete(id, userId, userRole) {
        const tree = await this.findOne(id);
        const roleId = Number(userRole !== null && userRole !== void 0 ? userRole : 0);
        const isAdmin = roleId === 1 || roleId === 3;
        const isOwner = tree.user_id === userId;
        if (!isAdmin && !isOwner) {
            throw new common_1.ForbiddenException("Forbidden");
        }
        if (tree.gedcom_path)
            (0, file_utils_1.safeUnlink)((0, file_utils_1.resolveStoredFilePath)(tree.gedcom_path));
        await Person_1.Person.query(this.knex).delete().where("tree_id", id);
        await Tree_1.Tree.query(this.knex).deleteById(id);
        await this.activityService.log(userId, "trees", `Deleted tree: ${tree.title}`);
        return { message: "Deleted" };
    }
    getGedcomPath(tree) {
        return (0, file_utils_1.resolveStoredFilePath)(tree.gedcom_path);
    }
    inferDataFormat(filename, content) {
        const ext = (filename || "").toLowerCase().split(".").pop() || "";
        if (ext === "json" || ext === "xml" || ext === "gedx")
            return "gedcomx";
        if ((ext === "ged" || ext === "gedcom") &&
            content &&
            /VERS\s+7\.0/i.test(content))
            return "gedcom7";
        return "gedcom";
    }
    normalizeGedcomName(raw) {
        const cleaned = String(raw || "")
            .replace(/\//g, " ")
            .replace(/\s+/g, " ")
            .trim();
        return cleaned || null;
    }
    parseGedcomPeople(text) {
        const lines = String(text || "").split(/\r\n|\n|\r/);
        const people = [];
        let current = null;
        const flush = () => {
            if (!current)
                return;
            let name = current.name ||
                [
                    this.normalizeGedcomName(current.given),
                    this.normalizeGedcomName(current.surname),
                ]
                    .filter(Boolean)
                    .join(" ")
                    .trim() ||
                null;
            if (name)
                people.push({ name });
            current = null;
        };
        for (const rawLine of lines) {
            const line = String(rawLine || "").trim();
            if (!line)
                continue;
            const parts = line.split(/\s+/);
            if (parts[0] === "0") {
                if (/^0\s+@[^@]+@\s+INDI\b/i.test(line) || /^0\s+INDI\b/i.test(line)) {
                    flush();
                    current = { name: null, given: "", surname: "" };
                }
                else {
                    flush();
                    current = null;
                }
                continue;
            }
            if (!current)
                continue;
            const tag = String(parts[1] || "").toUpperCase();
            const value = parts.slice(2).join(" ").trim();
            if (tag === "NAME")
                current.name = this.normalizeGedcomName(value);
            if (tag === "GIVN")
                current.given = value;
            if (tag === "SURN")
                current.surname = value;
        }
        flush();
        return people;
    }
    async rebuildPeople(treeId, gedcomPath) {
        if (!treeId)
            return;
        try {
            const filePath = (0, file_utils_1.resolveStoredFilePath)(gedcomPath);
            if (!filePath || !fs.existsSync(filePath)) {
                await Person_1.Person.query(this.knex).delete().where("tree_id", treeId);
                return;
            }
            const content = fs.readFileSync(filePath, "utf8");
            const format = (0, gedcomx_util_1.detectGedcomXFormat)(content, path.basename(filePath));
            let people = [];
            if (format === "json") {
                try {
                    const data = JSON.parse(content);
                    const parsed = (0, gedcomx_util_1.parseGedcomXFromJson)(data);
                    people = parsed.map((p) => ({
                        name: (p.names && p.names.en) ||
                            [p.given, p.surname].filter(Boolean).join(" ") ||
                            "Unknown",
                    }));
                }
                catch (e) {
                    console.warn("GEDCOM X JSON parse failed:", e === null || e === void 0 ? void 0 : e.message);
                    return;
                }
            }
            else if (format === "xml") {
                try {
                    const parsed = (0, gedcomx_util_1.parseGedcomXFromXml)(content);
                    people = parsed.map((p) => ({
                        name: (p.names && p.names.en) ||
                            [p.given, p.surname].filter(Boolean).join(" ") ||
                            "Unknown",
                    }));
                }
                catch (e) {
                    console.warn("GEDCOM X XML parse failed:", e === null || e === void 0 ? void 0 : e.message);
                    return;
                }
            }
            else {
                try {
                    people = this.parseGedcomPeople(content) || [];
                }
                catch (parseErr) {
                    console.warn("GEDCOM parse failed, keeping existing people:", parseErr === null || parseErr === void 0 ? void 0 : parseErr.message);
                    return;
                }
            }
            await Person_1.Person.query(this.knex).delete().where("tree_id", treeId);
            if (!people.length)
                return;
            const chunkSize = 500;
            for (let i = 0; i < people.length; i += chunkSize) {
                const chunk = people
                    .slice(i, i + chunkSize)
                    .map((p) => ({ tree_id: treeId, name: p.name }));
                await Person_1.Person.query(this.knex).insert(chunk);
            }
        }
        catch (err) {
            console.error("Failed to rebuild tree people", err === null || err === void 0 ? void 0 : err.message);
        }
    }
};
exports.TreesService = TreesService;
exports.TreesService = TreesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)("KnexConnection")),
    __metadata("design:paramtypes", [Function, activity_service_1.ActivityService])
], TreesService);
//# sourceMappingURL=trees.service.js.map