import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  OnModuleInit,
} from "@nestjs/common";
import { Knex } from "knex";
import { Tree } from "../../models/Tree";
import { Person } from "../../models/Person";
import { ActivityService } from "../activity/activity.service";
import {
  resolveStoredFilePath,
  resolveExistingStoredFilePath,
  safeUnlink,
  safeMoveFile,
  PRIVATE_TREE_UPLOADS_DIR,
  TREE_UPLOADS_DIR,
} from "../../common/utils/file.utils";
import {
  detectGedcomXFormat,
  parseGedcomXFromJson,
  parseGedcomXFromXml,
} from "../../common/utils/gedcomx.util";
import * as path from "path";
import * as fs from "fs";

type TreePersonInput = { name?: string | null };

export async function insertTreePeopleRows(
  knex: Knex,
  treeId: number,
  people: TreePersonInput[],
  chunkSize = 500,
) {
  const rows = people.map((p) => ({
    tree_id: treeId,
    name: (p.name || "").trim() || "Unknown",
  }));

  if (!rows.length) return;
  await knex.batchInsert(Person.tableName, rows, chunkSize);
}

@Injectable()
export class TreesService implements OnModuleInit {
  constructor(
    @Inject("KnexConnection") private readonly knex: Knex,
    private readonly activityService: ActivityService,
  ) {}

  async onModuleInit() {
    try {
      await this.ensureTreeSchema();
    } catch (err: any) {
      console.warn(
        `Skipping tree schema startup check: ${err?.message || err}`,
      );
    }
  }

  private async ensureTreeSchema() {
    if (!(await this.knex.schema.hasTable("family_trees"))) return;
    if (!(await this.knex.schema.hasColumn("family_trees", "category"))) {
      await this.knex.schema.alterTable("family_trees", (table) => {
        table.string("category", 255).nullable();
      });
    }
    if (!(await this.knex.schema.hasColumn("family_trees", "gedcom_text"))) {
      await this.knex.schema.alterTable("family_trees", (table) => {
        table.text("gedcom_text", "longtext").nullable();
      });
    }
  }

  private parseBoolean(value: unknown, fallback = false) {
    if (value === undefined || value === null || value === "") return fallback;
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value === 1;

    const normalized = String(value).trim().toLowerCase();
    if (["true", "1", "yes", "on"].includes(normalized)) return true;
    if (["false", "0", "no", "off"].includes(normalized)) return false;

    return fallback;
  }

  private getPublicInput(data: any, fallback = false) {
    return this.parseBoolean(data?.isPublic ?? data?.is_public, fallback);
  }

  async listPublic() {
    await this.ensureTreeSchema();
    return Tree.query(this.knex)
      .where("is_public", true)
      .orderBy("created_at", "desc")
      .withGraphFetched("owner")
      .modifyGraph("owner", (builder) => builder.select("id", "full_name"));
  }

  async getPublic(id: number) {
    await this.ensureTreeSchema();
    const tree = await Tree.query(this.knex)
      .findById(id)
      .where("is_public", true)
      .withGraphFetched("owner")
      .modifyGraph("owner", (builder) => builder.select("id", "full_name"));

    if (!tree) throw new NotFoundException("Tree not found");
    return tree;
  }

  async listByUser(userId: number) {
    await this.ensureTreeSchema();
    return Tree.query(this.knex)
      .where("user_id", userId)
      .orderBy("created_at", "desc")
      .withGraphFetched("owner")
      .modifyGraph("owner", (builder: any) =>
        builder.select("id", "full_name", "email"),
      )
      .withGraphFetched("people");
  }

  async listAdmin() {
    await this.ensureTreeSchema();
    return Tree.query(this.knex)
      .orderBy("created_at", "desc")
      .withGraphFetched("owner")
      .modifyGraph("owner", (builder: any) =>
        builder.select("id", "full_name", "email"),
      );
  }

  async findOne(id: number) {
    await this.ensureTreeSchema();
    const tree = await Tree.query(this.knex)
      .findById(id)
      .withGraphFetched("owner");
    if (!tree) throw new NotFoundException("Tree not found");
    return tree;
  }

  async create(data: any, userId: number, file?: Express.Multer.File) {
    await this.ensureTreeSchema();
    const title = data.title ?? data.name;
    if (!title) {
      throw new BadRequestException("Title is required");
    }

    const isPublic = this.getPublicInput(data, false);
    let gedcomPath = file ? `/uploads/trees/${file.filename}` : null;
    const gedcomText = file ? fs.readFileSync(file.path, "utf8") : null;

    let dataFormat: "gedcom" | "gedcomx" | "gedcom7" = "gedcom";
    if (file) {
      const explicit = data.data_format ?? data.dataFormat;
      if (
        explicit === "gedcom7" ||
        explicit === "gedcomx" ||
        explicit === "gedcom"
      )
        dataFormat = explicit;
      else {
        const content = (gedcomText || "").slice(0, 4000);
        dataFormat = this.inferDataFormat(file.originalname, content);
      }
    }

    if (file && !isPublic) {
      const src = file.path;
      const dest = path.join(PRIVATE_TREE_UPLOADS_DIR, file.filename);
      safeMoveFile(src, dest);
      gedcomPath = `private/trees/${file.filename}`;
    }
    const newTree = await Tree.query(this.knex).insertAndFetch({
      title,
      description: data.description,
      category: data.category,
      archive_source: data.archiveSource,
      document_code: data.documentCode,
      gedcom_path: gedcomPath,
      gedcom_text: gedcomText,
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

  async update(
    id: number,
    data: any,
    userId: number,
    userRole: number,
    file?: Express.Multer.File,
  ) {
    const tree = await this.findOne(id);

    const roleId = Number(userRole ?? 0);
    const isAdmin = roleId === 1 || roleId === 3;
    const isOwner = tree.user_id === userId;
    if (!isAdmin && !isOwner) {
      throw new ForbiddenException("Forbidden");
    }

    const updateData: any = {};
    const title = data.title ?? data.name;
    if (title) updateData.title = title;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.archiveSource !== undefined)
      updateData.archive_source = data.archiveSource;
    if (data.documentCode !== undefined)
      updateData.document_code = data.documentCode;

    const isPublic =
      data.isPublic !== undefined || data.is_public !== undefined
        ? this.getPublicInput(data, !!tree.is_public)
        : !!tree.is_public;
    updateData.is_public = Boolean(isPublic);

    let gedcomPath = tree.gedcom_path;

    if (file) {
      // Delete old
      if (tree.gedcom_path) safeUnlink(resolveStoredFilePath(tree.gedcom_path));

      const fullFileContent = fs.readFileSync(file.path, "utf8");
      const fileContent = fullFileContent.slice(0, 4000);

      // Save new (store as-is, no conversion)
      let newPath = `/uploads/trees/${file.filename}`;
      if (!isPublic) {
        const dest = path.join(PRIVATE_TREE_UPLOADS_DIR, file.filename);
        safeMoveFile(file.path, dest);
        newPath = `private/trees/${file.filename}`;
      }
      updateData.gedcom_path = newPath;
      updateData.gedcom_text = fullFileContent;
      const explicit = data.data_format ?? data.dataFormat;
      if (
        explicit === "gedcom7" ||
        explicit === "gedcomx" ||
        explicit === "gedcom"
      ) {
        updateData.data_format = explicit;
      } else {
        updateData.data_format = this.inferDataFormat(
          file.originalname,
          fileContent,
        );
      }
      gedcomPath = newPath;
    } else if (tree.is_public !== isPublic && tree.gedcom_path) {
      // Move existing file
      const currentPath = resolveStoredFilePath(tree.gedcom_path);
      if (currentPath && fs.existsSync(currentPath)) {
        const filename = path.basename(currentPath);
        if (isPublic) {
          const dest = path.join(TREE_UPLOADS_DIR, filename);
          safeMoveFile(currentPath, dest);
          updateData.gedcom_path = `/uploads/trees/${filename}`;
        } else {
          const dest = path.join(PRIVATE_TREE_UPLOADS_DIR, filename);
          safeMoveFile(currentPath, dest);
          updateData.gedcom_path = `private/trees/${filename}`;
        }
        gedcomPath = updateData.gedcom_path;
      }
    }

    await Tree.query(this.knex).patch(updateData).where("id", id);

    if (file || (gedcomPath && tree.is_public !== isPublic)) {
      await this.rebuildPeople(id, gedcomPath);
    }

    await this.activityService.log(
      userId,
      "trees",
      `Updated tree: ${tree.title}`,
    );
    return { id };
  }

  async delete(id: number, userId: number, userRole: number) {
    const tree = await this.findOne(id);

    const roleId = Number(userRole ?? 0);
    const isAdmin = roleId === 1 || roleId === 3;
    const isOwner = tree.user_id === userId;
    if (!isAdmin && !isOwner) {
      throw new ForbiddenException("Forbidden");
    }

    if (tree.gedcom_path) safeUnlink(resolveStoredFilePath(tree.gedcom_path));

    // Delete people first (cascade usually handles this in DB, but safe to do manual)
    await Person.query(this.knex).delete().where("tree_id", id);
    await Tree.query(this.knex).deleteById(id);

    await this.activityService.log(
      userId,
      "trees",
      `Deleted tree: ${tree.title}`,
    );
    return { message: "Deleted" };
  }

  getGedcomPath(tree: Tree) {
    return resolveExistingStoredFilePath(tree.gedcom_path);
  }

  /** Infer data_format from file extension and optional content. .ged with VERS 7.0 -> gedcom7. */
  private inferDataFormat(
    filename?: string,
    content?: string,
  ): "gedcom" | "gedcomx" | "gedcom7" {
    const ext = (filename || "").toLowerCase().split(".").pop() || "";
    if (ext === "json" || ext === "xml" || ext === "gedx") return "gedcomx";
    if (
      (ext === "ged" || ext === "gedcom") &&
      content &&
      /VERS\s+7\.0/i.test(content)
    )
      return "gedcom7";
    return "gedcom";
  }

  // GEDCOM Parsing Logic
  private normalizeGedcomName(raw: string) {
    const cleaned = String(raw || "")
      .replace(/\//g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return cleaned || null;
  }

  private parseGedcomPeople(text: string) {
    const lines = String(text || "").split(/\r\n|\n|\r/);
    const people = [];
    let current = null;

    const flush = () => {
      if (!current) return;
      let name =
        current.name ||
        [
          this.normalizeGedcomName(current.given),
          this.normalizeGedcomName(current.surname),
        ]
          .filter(Boolean)
          .join(" ")
          .trim() ||
        null;
      if (name) people.push({ name });
      current = null;
    };

    for (const rawLine of lines) {
      const line = String(rawLine || "").trim();
      if (!line) continue;
      const parts = line.split(/\s+/);

      if (parts[0] === "0") {
        if (/^0\s+@[^@]+@\s+INDI\b/i.test(line) || /^0\s+INDI\b/i.test(line)) {
          flush();
          current = { name: null, given: "", surname: "" };
        } else {
          flush();
          current = null;
        }
        continue;
      }

      if (!current) continue;

      const tag = String(parts[1] || "").toUpperCase();
      const value = parts.slice(2).join(" ").trim();

      if (tag === "NAME") current.name = this.normalizeGedcomName(value);
      if (tag === "GIVN") current.given = value;
      if (tag === "SURN") current.surname = value;
    }
    flush();
    return people;
  }

  async rebuildPeople(treeId: number, gedcomPath: string) {
    if (!treeId) return;
    try {
      const filePath = resolveStoredFilePath(gedcomPath);
      if (!filePath || !fs.existsSync(filePath)) {
        await Person.query(this.knex).delete().where("tree_id", treeId);
        return;
      }

      const content = fs.readFileSync(filePath, "utf8");
      const format = detectGedcomXFormat(content, path.basename(filePath));
      let people: { name?: string }[] = [];

      if (format === "json") {
        try {
          const data = JSON.parse(content);
          const parsed = parseGedcomXFromJson(data);
          people = parsed.map((p) => ({
            name:
              (p.names && (p.names as any).en) ||
              [p.given, p.surname].filter(Boolean).join(" ") ||
              "Unknown",
          }));
        } catch (e) {
          console.warn("GEDCOM X JSON parse failed:", (e as Error)?.message);
          return;
        }
      } else if (format === "xml") {
        try {
          const parsed = parseGedcomXFromXml(content);
          people = parsed.map((p) => ({
            name:
              (p.names && (p.names as any).en) ||
              [p.given, p.surname].filter(Boolean).join(" ") ||
              "Unknown",
          }));
        } catch (e) {
          console.warn("GEDCOM X XML parse failed:", (e as Error)?.message);
          return;
        }
      } else {
        try {
          people = this.parseGedcomPeople(content) || [];
        } catch (parseErr) {
          console.warn(
            "GEDCOM parse failed, keeping existing people:",
            (parseErr as Error)?.message,
          );
          return;
        }
      }

      await Person.query(this.knex).delete().where("tree_id", treeId);
      if (!people.length) return;

      await insertTreePeopleRows(this.knex, treeId, people);
    } catch (err) {
      console.error("Failed to rebuild tree people", (err as Error)?.message);
    }
  }
}
