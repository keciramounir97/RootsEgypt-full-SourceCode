#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const knexLib = require("knex");

process.env.NODE_ENV = "development";

require("ts-node/register/transpile-only");
require("reflect-metadata");

const { bootstrapEnv } = require("../env-bootstrap");
const { resolveDbConfig } = require("../db-config");
const {
  parseTreePeopleFromContent,
  TreesService,
} = require("../src/modules/trees/trees.service");

const createKnex = knexLib.default || knexLib;
const APP_ROOT = path.resolve(__dirname, "..");
const SAMPLE_DIR = path.join(APP_ROOT, "sample-data");

const GEDCOM_7_WITH_GALLICA = `0 HEAD
1 SOUR RootsEgypt
1 GEDC
2 VERS 7.0
1 CHAR UTF-8
0 @m1@ INDI
1 NAME Mariem /Bint Salem/
1 SEX F
1 WWW https://gallica.bnf.fr/ark:/12148/bpt6k7654321
0 @m2@ INDI
1 NAME Salem /Ould Ahmed/
1 SEX M
1 SOUR https://gallica.bnf.fr/ark:/12148/bpt6k1234567
0 TRLR
`;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function hasStoredGedcomText(content) {
  const text = String(content || "");
  return (
    /^0\s+@[^@]+@\s+INDI\b/im.test(text) ||
    /<[\w:-]*person\b/i.test(text) ||
    /"persons"\s*:\s*\[/i.test(text)
  );
}

function quoteIdentifier(value) {
  return `\`${String(value).replace(/`/g, "``")}\``;
}

function assertLocalHost(host) {
  const normalized = String(host || "").toLowerCase();
  const allowed = new Set(["localhost", "127.0.0.1", "::1"]);
  assert(
    allowed.has(normalized),
    `Refusing to run smoke test against non-local database host "${host}". Set DB_HOST=localhost or DATABASE_URL=mysql://...@localhost/... for this disposable test.`,
  );
}

async function ensureColumns(knex, expectations) {
  for (const [tableName, columns] of Object.entries(expectations)) {
    assert(await knex.schema.hasTable(tableName), `Missing table ${tableName}`);
    for (const column of columns) {
      assert(
        await knex.schema.hasColumn(tableName, column),
        `Missing column ${tableName}.${column}`,
      );
    }
  }
}

async function insertTree(knex, row) {
  const [id] = await knex("family_trees").insert(row);
  return Number(id);
}

async function verifyTree(knex, service, treeId, expectedNames, expectedLink) {
  await service.rebuildPeople(treeId, `/uploads/trees/missing-${treeId}.ged`);
  const tree = await knex("family_trees").where({ id: treeId }).first();
  const storedGedcom = hasStoredGedcomText(tree.gedcom_text)
    ? tree.gedcom_text
    : null;
  assert(storedGedcom, `Tree ${treeId} did not return GEDCOM text from database`);
  assert(
    storedGedcom.includes(expectedLink),
    `Tree ${treeId} lost expected Gallica/source link`,
  );

  const parsedNames = parseTreePeopleFromContent(
    storedGedcom,
    tree.data_format === "gedcomx" ? "tree.gedx" : "tree.ged",
  ).map((person) => person.name);
  for (const expectedName of expectedNames) {
    assert(
      parsedNames.includes(expectedName),
      `Tree ${treeId} parser missed ${expectedName}`,
    );
  }

  const cachedNames = (
    await knex("persons").where({ tree_id: treeId }).orderBy("name", "asc")
  ).map((person) => person.name);
  for (const expectedName of expectedNames) {
    assert(
      cachedNames.includes(expectedName),
      `Tree ${treeId} DB rebuild missed cached person ${expectedName}`,
    );
  }
}

async function main() {
  process.chdir(APP_ROOT);
  bootstrapEnv({ cwd: APP_ROOT, env: process.env });

  const resolved = resolveDbConfig(undefined, process.env);
  const { host, port, user, password } = resolved.connection;
  assert(host && user, "Local DB credentials are incomplete");
  assertLocalHost(host);

  const dbName = `roots_egypt_smoke_${Date.now()}`;
  const adminKnex = createKnex({
    client: "mysql2",
    connection: {
      host,
      port,
      user,
      password,
      charset: "utf8mb4",
      multipleStatements: true,
    },
  });
  const smokeKnex = createKnex({
    client: "mysql2",
    connection: {
      host,
      port,
      user,
      password,
      database: dbName,
      charset: "utf8mb4",
    },
    migrations: {
      directory: path.join(APP_ROOT, "src", "db", "migrations"),
      extension: "js",
    },
  });

  try {
    await adminKnex.raw(
      `CREATE DATABASE ${quoteIdentifier(dbName)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    const [batchNo, migrations] = await smokeKnex.migrate.latest();
    assert(Number(batchNo) >= 1, "Migrations did not run");
    assert(Array.isArray(migrations), "Migration result was not a file list");

    await ensureColumns(smokeKnex, {
      family_trees: ["gedcom_text", "data_format", "category"],
      books: ["file_data", "file_mime_type", "cover_data", "cover_mime_type"],
      gallery: ["image_data", "image_mime_type"],
      persons: ["tree_id", "name"],
    });

    await smokeKnex("roles").insert({ id: 2, name: "user", permissions: "{}" });
    const [userId] = await smokeKnex("users").insert({
      full_name: "Smoke Tester",
      email: `smoke-${Date.now()}@rootsegypt.local`,
      password: "not-used",
      role_id: 2,
      status: "active",
    });

    const gedcom551 = fs.readFileSync(
      path.join(SAMPLE_DIR, "gallica-family-gedcom-5.5.1.ged"),
      "utf8",
    );
    const gedcomx = fs.readFileSync(
      path.join(SAMPLE_DIR, "gallica-family-gedcomx.gedx"),
      "utf8",
    );
    const service = new TreesService(smokeKnex, { log: async () => undefined });

    const gedcom551Id = await insertTree(smokeKnex, {
      user_id: userId,
      title: "Smoke GEDCOM 5.5.1 Gallica",
      description: "Folderless GEDCOM 5.5.1 source-link smoke test",
      category: "smoke",
      gedcom_path: "/uploads/trees/deleted-gedcom-551.ged",
      gedcom_text: gedcom551,
      data_format: "gedcom",
      is_public: true,
    });
    const gedcom7Id = await insertTree(smokeKnex, {
      user_id: userId,
      title: "Smoke GEDCOM 7 Gallica",
      description: "Folderless GEDCOM 7 source-link smoke test",
      category: "smoke",
      gedcom_path: "/uploads/trees/deleted-gedcom-7.ged",
      gedcom_text: GEDCOM_7_WITH_GALLICA,
      data_format: "gedcom7",
      is_public: true,
    });
    const gedcomxId = await insertTree(smokeKnex, {
      user_id: userId,
      title: "Smoke GEDCOM X Gallica",
      description: "Folderless GEDCOM X source-link smoke test",
      category: "smoke",
      gedcom_path: "/uploads/trees/deleted-gedcom-x.gedx",
      gedcom_text: gedcomx,
      data_format: "gedcomx",
      is_public: true,
    });

    await verifyTree(smokeKnex, service, gedcom551Id, [
      "Ould Mohamed Abdallahi",
      "Fatimetou Mint Ahmed",
      "Sidi Mohamed",
    ], "https://gallica.bnf.fr/ark:/12148/bpt6k9760202w");
    await verifyTree(smokeKnex, service, gedcom7Id, [
      "Mariem Bint Salem",
      "Salem Ould Ahmed",
    ], "https://gallica.bnf.fr/ark:/12148/bpt6k7654321");
    await verifyTree(smokeKnex, service, gedcomxId, [
      "Ould Mohamed Abdallahi",
      "Fatimetou Mint Ahmed",
      "Sidi Mohamed",
    ], "https://gallica.bnf.fr/ark:/12148/bpt6k9760202w");

    console.log(
      `SMOKE ok db=${dbName} migrations=${migrations.length} trees=3 folderlessGedcom=ok cachedPeople=ok gallicaLinks=ok`,
    );
  } finally {
    await smokeKnex.destroy();
    await adminKnex.raw(`DROP DATABASE IF EXISTS ${quoteIdentifier(dbName)}`);
    await adminKnex.destroy();
    console.log(`SMOKE cleanup dropped database ${dbName}`);
  }
}

main().catch((error) => {
  console.error(`SMOKE failed: ${error?.message || error}`);
  process.exit(1);
});
