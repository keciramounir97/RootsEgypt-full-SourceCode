const fs = require("fs");
const path = require("path");
const ts = require("typescript");

const root = path.join(__dirname, "..", "src");
const translationsPath = path.join(root, "utils", "translations.ts");
const generatedPath = path.join(root, "utils", "generatedTranslations.ts");

const JSX_ATTRIBUTE_IGNORELIST = new Set([
  "accept",
  "align",
  "aria-haspopup",
  "aria-hidden",
  "aria-live",
  "attribution",
  "autoComplete",
  "buttonClassName",
  "className",
  "cols",
  "cx",
  "cy",
  "d",
  "data-aos",
  "data-aos-delay",
  "decoding",
  "download",
  "encType",
  "fill",
  "height",
  "href",
  "htmlFor",
  "id",
  "inputMode",
  "loading",
  "max",
  "method",
  "min",
  "name",
  "path",
  "pattern",
  "points",
  "position",
  "r",
  "referrerPolicy",
  "rel",
  "role",
  "rows",
  "src",
  "step",
  "stroke",
  "strokeWidth",
  "style",
  "target",
  "to",
  "transform",
  "type",
  "url",
  "value",
  "viewBox",
  "width",
  "x",
  "x1",
  "x2",
  "xmlns",
  "y",
  "y1",
  "y2",
]);

const JSX_TEXT_ALLOWLIST = new Set([
  "GEDCOM 7.0",
  "GEDCOM X",
  "MB",
  "ROOTS",
  "Egypt",
  "RootsEgypt",
  "U",
  "WhatsApp",
  "WhatsApp:",
  "i",
]);

const isStringLiteral = (node) =>
  node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node));

const propName = (node) =>
  node && (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node))
    ? node.text
    : null;

const walk = (dir, out = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(fullPath, out);
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) out.push(fullPath);
  }
  return out;
};

const collectSupportedLocales = () => {
  const source = fs.readFileSync(translationsPath, "utf8");
  const sf = ts.createSourceFile(translationsPath, source, ts.ScriptTarget.Latest, true);

  let locales = [];
  const visit = (node) => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === "SUPPORTED_LOCALES"
    ) {
      const arrayNode = ts.isAsExpression(node.initializer)
        ? node.initializer.expression
        : node.initializer;
      if (arrayNode && ts.isArrayLiteralExpression(arrayNode)) {
        locales = arrayNode.elements
          .filter(isStringLiteral)
          .map((item) => item.text);
      }
    }
    ts.forEachChild(node, visit);
  };

  visit(sf);
  return locales;
};

const collectStaticTranslationCalls = () => {
  const calls = new Map();
  let dynamicCallCount = 0;

  for (const file of walk(root)) {
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
        node.expression.text === "t"
      ) {
        const keyArg = node.arguments[0];
        if (isStringLiteral(keyArg)) {
          const key = keyArg.text;
          const files = calls.get(key) || new Set();
          files.add(path.relative(process.cwd(), file).replace(/\\/g, "/"));
          calls.set(key, files);
        } else {
          dynamicCallCount += 1;
        }
      }
      ts.forEachChild(node, visit);
    };

    visit(sf);
  }

  return { calls, dynamicCallCount };
};

const normalizeJsxText = (value) => value.replace(/\s+/g, " ").trim();

const containsHumanText = (value) => /[A-Za-zÀ-ÿא-תء-ي]/.test(value);

const collectHardcodedJsxLiterals = () => {
  const hits = [];

  for (const file of walk(root)) {
    if (!file.endsWith(".tsx") && !file.endsWith(".jsx")) continue;

    const source = fs.readFileSync(file, "utf8");
    const sf = ts.createSourceFile(
      file,
      source,
      ts.ScriptTarget.Latest,
      true,
      file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.JSX,
    );

    const addHit = (node, type, text) => {
      const value = normalizeJsxText(text);
      if (!value || !containsHumanText(value) || JSX_TEXT_ALLOWLIST.has(value)) return;
      const { line } = sf.getLineAndCharacterOfPosition(node.getStart(sf));
      hits.push({
        file: path.relative(process.cwd(), file).replace(/\\/g, "/"),
        line: line + 1,
        type,
        text: value,
      });
    };

    const visit = (node) => {
      if (ts.isJsxText(node)) {
        addHit(node, "text", node.getText(sf));
      }

      if (
        ts.isJsxAttribute(node) &&
        node.initializer &&
        ts.isStringLiteral(node.initializer)
      ) {
        const attrName = node.name.getText(sf);
        if (!JSX_ATTRIBUTE_IGNORELIST.has(attrName)) {
          addHit(node, `attr:${attrName}`, node.initializer.text);
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(sf);
  }

  return hits;
};

const collectTranslationObject = (filePath, variableName) => {
  if (!fs.existsSync(filePath)) return {};

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
};

const hasTargetScript = (locale, value) => {
  if (locale === "ar") return /[\u0600-\u06ff]/.test(value);
  return true;
};

const hasSuspiciousQuestionMark = (locale, value) => {
  if (!value) return false;
  if (/\uFFFD|\?{2,}/.test(value)) return true;

  if (locale === "fr" && value.includes("?")) {
    const trimmed = value.trim();
    for (let index = 0; index < trimmed.length; index += 1) {
      if (trimmed[index] !== "?") continue;
      const after = trimmed.slice(index + 1);
      if (!after || /^\s+[A-Z\u00c0-\u00de]/.test(after)) continue;
      return true;
    }
    return false;
  }

  if (locale === "ar" && value.includes("?")) {
    return !hasTargetScript(locale, value);
  }

  return false;
};

const supportedLocales = collectSupportedLocales();
const { calls, dynamicCallCount } = collectStaticTranslationCalls();
const hardcodedJsx = collectHardcodedJsxLiterals();
const curated = collectTranslationObject(translationsPath, "translations");
const generated = collectTranslationObject(generatedPath, "AUTO_TRANSLATIONS");
const keys = [...calls.keys()].sort();

let hasFailure = false;

console.log(`Translation audit: ${keys.length} static keys, ${dynamicCallCount} dynamic calls`);
for (const locale of supportedLocales) {
  const effective = {
    ...(generated[locale] || {}),
    ...(curated[locale] || {}),
  };
  const missing = keys.filter((key) => !effective[key]);
  const suspicious = Object.entries(effective).filter(([, value]) =>
    hasSuspiciousQuestionMark(locale, value),
  );

  console.log(
    `${locale}: ${Object.keys(effective).length} effective entries, ${missing.length} missing, ${suspicious.length} suspicious`,
  );

  if (missing.length) {
    hasFailure = true;
    for (const key of missing.slice(0, 20)) {
      console.log(`  - ${key}: ${[...calls.get(key)].slice(0, 3).join(", ")}`);
    }
    if (missing.length > 20) console.log(`  ... ${missing.length - 20} more`);
  }

  if (suspicious.length) {
    hasFailure = true;
    for (const [key, value] of suspicious.slice(0, 20)) {
      console.log(`  - suspicious ${key}: ${value}`);
    }
    if (suspicious.length > 20) {
      console.log(`  ... ${suspicious.length - 20} more suspicious entries`);
    }
  }
}

console.log(`Hard-coded JSX text: ${hardcodedJsx.length}`);
if (hardcodedJsx.length) {
  for (const hit of hardcodedJsx.slice(0, 30)) {
    console.log(`  - ${hit.file}:${hit.line} [${hit.type}] ${hit.text}`);
  }
  if (hardcodedJsx.length > 30) {
    console.log(`  ... ${hardcodedJsx.length - 30} more`);
  }
}

if (hasFailure) {
  process.exitCode = 1;
} else {
  console.log("Translation audit passed: no supported locale is missing a static key.");
}
