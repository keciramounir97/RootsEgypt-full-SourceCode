const fs = require("fs");
const https = require("https");
const path = require("path");
const ts = require("../frontend/node_modules/typescript");

const root = path.join(process.cwd(), "frontend", "src");
const outputPath = path.join(root, "utils", "sourceFallbackTranslations.ts");

const isStringLiteral = (node) =>
  node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node));

const propName = (node) =>
  node && (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node))
    ? node.text
    : null;

function humanize(key) {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(fullPath, out);
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) out.push(fullPath);
  }
  return out;
}

function collectObject(filePath, variableName) {
  const source = fs.readFileSync(filePath, "utf8");
  const sf = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true);
  const dictionaries = {};

  const visit = (node) => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === variableName &&
      ts.isObjectLiteralExpression(node.initializer)
    ) {
      for (const localeProp of node.initializer.properties) {
        if (!ts.isPropertyAssignment(localeProp)) continue;
        const locale = propName(localeProp.name);
        if (!locale || !ts.isObjectLiteralExpression(localeProp.initializer)) continue;
        dictionaries[locale] = dictionaries[locale] || {};
        for (const entry of localeProp.initializer.properties) {
          if (!ts.isPropertyAssignment(entry)) continue;
          const key = propName(entry.name);
          if (key && isStringLiteral(entry.initializer)) {
            dictionaries[locale][key] = entry.initializer.text;
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  };

  visit(sf);
  return dictionaries;
}

function collectCalls() {
  const calls = new Map();
  for (const file of walk(root)) {
    if (file.includes(`${path.sep}utils${path.sep}`)) continue;
    const source = fs.readFileSync(file, "utf8");
    const sf = ts.createSourceFile(
      file,
      source,
      ts.ScriptTarget.Latest,
      true,
      file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );

    const visit = (node) => {
      if (
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === "t" &&
        node.arguments.length > 0 &&
        isStringLiteral(node.arguments[0])
      ) {
        const rawKey = node.arguments[0].text;
        if (rawKey.startsWith("legacy.")) {
          const key = rawKey.slice("legacy.".length);
          const fallback = isStringLiteral(node.arguments[1])
            ? node.arguments[1].text
            : "";
          if (!calls.has(key) || fallback) {
            calls.set(key, fallback || humanize(key));
          }
        }
      }
      ts.forEachChild(node, visit);
    };

    visit(sf);
  }
  return calls;
}

function translate(text, target) {
  if (!text || target === "en") return Promise.resolve(text);
  const url =
    "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=" +
    encodeURIComponent(target) +
    "&dt=t&q=" +
    encodeURIComponent(text);

  return new Promise((resolve) => {
    const request = https.get(
      url,
      { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 10000 },
      (response) => {
        let body = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => {
          try {
            const parsed = JSON.parse(body);
            const translated = parsed?.[0]?.map((part) => part?.[0] || "").join("");
            resolve(translated || text);
          } catch {
            resolve(text);
          }
        });
      },
    );
    request.on("timeout", () => {
      request.destroy();
      resolve(text);
    });
    request.on("error", () => resolve(text));
  });
}

async function mapWithLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let index = 0;
  const workers = Array.from({ length: limit }, async () => {
    while (index < items.length) {
      const current = index++;
      results[current] = await mapper(items[current], current);
    }
  });
  await Promise.all(workers);
  return results;
}

(async () => {
  const manual = collectObject(path.join(root, "utils", "translations.ts"), "translations");
  const auto = collectObject(path.join(root, "utils", "generatedTranslations.ts"), "AUTO_TRANSLATIONS");
  const calls = collectCalls();

  const keys = [...calls.keys()]
    .filter((key) => auto.en?.[key])
    .filter((key) => {
      const manualValues = ["en", "fr", "ar", "es"].map((locale) => manual[locale]?.[key]);
      return manualValues.some((value) => !value || value.trim() === "");
    })
    .sort();

  const overlay = {
    en: {},
    fr: {},
    ar: {},
    es: {},
  };

  for (const key of keys) {
    overlay.en[key] = calls.get(key) || humanize(key);
  }

  for (const locale of ["fr", "ar", "es"]) {
    await mapWithLimit(keys, 8, async (key) => {
      overlay[locale][key] = await translate(overlay.en[key], locale);
    });
  }

  const content =
    "export const SOURCE_FALLBACK_TRANSLATIONS: Record<string, Record<string, string>> = " +
    JSON.stringify(overlay, null, 2) +
    ";\n";
  fs.writeFileSync(outputPath, content);
  console.log(`Wrote ${keys.length} source fallback translation keys to ${outputPath}`);
})();

