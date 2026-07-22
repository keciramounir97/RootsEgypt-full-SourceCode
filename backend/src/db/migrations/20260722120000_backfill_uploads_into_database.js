const fs = require("fs");
const path = require("path");

// Mirrors backend/src/common/utils/file.utils.ts path conventions, but kept
// self-contained (plain JS, no TS import) since migrations run standalone.
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
const PRIVATE_UPLOADS_DIR = path.join(process.cwd(), "private_uploads");

const MIME_BY_EXT = {
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".m4a": "audio/mp4",
  ".ogg": "audio/ogg",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".txt": "text/plain",
  ".ged": "text/plain",
};

function resolveOnDisk(storedPath) {
  const rel = String(storedPath || "").trim();
  if (!rel) return null;
  if (rel.startsWith("/uploads/"))
    return path.join(UPLOADS_DIR, rel.replace(/^\/uploads\/?/, ""));
  if (rel.startsWith("uploads/"))
    return path.join(UPLOADS_DIR, rel.replace(/^uploads\/?/, ""));
  if (rel.startsWith("private/"))
    return path.join(PRIVATE_UPLOADS_DIR, rel.replace(/^private\/?/, ""));
  if (path.isAbsolute(rel)) return rel;
  return path.join(UPLOADS_DIR, rel.replace(/^\//, ""));
}

/**
 * Copies the on-disk file for every row missing its DB-stored copy into the
 * given binary column, so existing (pre-migration) rows get the same
 * "safe even if the uploads folder is lost" protection new rows already have.
 */
async function backfillBinaryColumn(knex, table, idCol, pathCol, dataCol, mimeCol, label) {
  if (!(await knex.schema.hasTable(table))) return;
  if (!(await knex.schema.hasColumn(table, dataCol))) return;
  if (!(await knex.schema.hasColumn(table, pathCol))) return;

  const rows = await knex(table)
    .select(idCol, pathCol)
    .whereNotNull(pathCol)
    .whereNull(dataCol);

  let backfilled = 0;
  let missing = 0;
  for (const row of rows) {
    const diskPath = resolveOnDisk(row[pathCol]);
    try {
      if (diskPath && fs.existsSync(diskPath)) {
        const buffer = fs.readFileSync(diskPath);
        const update = { [dataCol]: buffer };
        if (mimeCol && (await knex.schema.hasColumn(table, mimeCol))) {
          const ext = path.extname(diskPath).toLowerCase();
          update[mimeCol] = MIME_BY_EXT[ext] || "application/octet-stream";
        }
        await knex(table).where(idCol, row[idCol]).update(update);
        backfilled += 1;
      } else {
        missing += 1;
      }
    } catch (err) {
      missing += 1;
      console.warn(
        `[backfill] ${label}: could not read "${diskPath}" for row #${row[idCol]}: ${err && err.message}`,
      );
    }
  }

  if (backfilled || missing) {
    console.log(
      `[backfill] ${label}: copied ${backfilled} file(s) into the database; ${missing} source file(s) were not found on disk (already lost or path stale).`,
    );
  }
}

/** Same idea as backfillBinaryColumn, but for text columns (e.g. GEDCOM text). */
async function backfillTextColumn(knex, table, idCol, pathCol, textCol, label) {
  if (!(await knex.schema.hasTable(table))) return;
  if (!(await knex.schema.hasColumn(table, textCol))) return;
  if (!(await knex.schema.hasColumn(table, pathCol))) return;

  const rows = await knex(table)
    .select(idCol, pathCol, textCol)
    .whereNotNull(pathCol);

  let backfilled = 0;
  let missing = 0;
  for (const row of rows) {
    const existing = row[textCol];
    if (typeof existing === "string" && existing.trim()) continue;

    const diskPath = resolveOnDisk(row[pathCol]);
    try {
      if (diskPath && fs.existsSync(diskPath)) {
        const content = fs.readFileSync(diskPath, "utf8");
        if (content.trim()) {
          await knex(table)
            .where(idCol, row[idCol])
            .update({ [textCol]: content });
          backfilled += 1;
        }
      } else {
        missing += 1;
      }
    } catch (err) {
      missing += 1;
      console.warn(
        `[backfill] ${label}: could not read "${diskPath}" for row #${row[idCol]}: ${err && err.message}`,
      );
    }
  }

  if (backfilled || missing) {
    console.log(
      `[backfill] ${label}: copied ${backfilled} file(s) into the database; ${missing} source file(s) were not found on disk (already lost or path stale).`,
    );
  }
}

exports.up = async function up(knex) {
  // Trees: the GEDCOM text column was added after some trees already existed,
  // so any tree not re-saved since then still depends entirely on its file in
  // uploads/private_uploads. Backfilling makes every existing tree recoverable
  // straight from the database even if that folder is deleted or overwritten.
  await backfillTextColumn(
    knex,
    "family_trees",
    "id",
    "gedcom_path",
    "gedcom_text",
    "family_trees.gedcom_text",
  );

  await backfillBinaryColumn(
    knex,
    "books",
    "id",
    "file_path",
    "file_data",
    "file_mime_type",
    "books.file_data",
  );
  await backfillBinaryColumn(
    knex,
    "books",
    "id",
    "cover_path",
    "cover_data",
    "cover_mime_type",
    "books.cover_data",
  );
  await backfillBinaryColumn(
    knex,
    "documents",
    "id",
    "file_path",
    "file_data",
    "file_mime_type",
    "documents.file_data",
  );
  await backfillBinaryColumn(
    knex,
    "gallery",
    "id",
    "image_path",
    "image_data",
    "image_mime_type",
    "gallery.image_data",
  );
};

exports.down = async function down() {
  // Backfilling is additive and non-destructive; nothing to reverse.
};
