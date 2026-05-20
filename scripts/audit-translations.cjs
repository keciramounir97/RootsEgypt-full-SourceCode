// Translation audit helper.
// Extracts every t("key") usage in frontend/src and diffs against
// the four locale tables in frontend/src/utils/translations.ts.
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "frontend", "src");
const TRANS = path.join(ROOT, "utils", "translations.ts");
const GEN = path.join(ROOT, "utils", "generatedTranslations.ts");

function walk(dir, files = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, files);
    else if (/\.(tsx?|jsx?)$/.test(e.name)) files.push(p);
  }
  return files;
}

// 1) Collect all t("key") keys used in code
const usedKeys = new Set();
const usagesByFile = {};
const KEY_RE = /\bt\(\s*["'`]([A-Za-z0-9_\-.]+)["'`]/g;

for (const f of walk(ROOT)) {
  if (f === TRANS || f === GEN) continue;
  const c = fs.readFileSync(f, "utf8");
  let m;
  while ((m = KEY_RE.exec(c))) {
    usedKeys.add(m[1]);
    (usagesByFile[f] = usagesByFile[f] || new Set()).add(m[1]);
  }
}

// 2) Parse the four locale blocks of translations.ts
const transSrc = fs.readFileSync(TRANS, "utf8");
function extractLocaleKeys(src, locale) {
  // find "  <locale>: {" then walk braces
  const re = new RegExp("\\n\\s*" + locale + "\\s*:\\s*\\{", "m");
  const m = re.exec(src);
  if (!m) return new Set();
  let i = m.index + m[0].length;
  let depth = 1;
  const start = i;
  while (i < src.length && depth > 0) {
    const ch = src[i];
    if (ch === "{") depth++;
    else if (ch === "}") depth--;
    if (depth === 0) break;
    i++;
  }
  const block = src.slice(start, i);
  const keys = new Set();
  // matches:    keyName: "..."   or   "key-name": "..."
  const kre = /(?:^|\n|,|\{)\s*(?:"([^"\n]+)"|([A-Za-z_][A-Za-z0-9_]*))\s*:/g;
  let km;
  while ((km = kre.exec(block))) {
    keys.add(km[1] || km[2]);
  }
  return keys;
}

const locales = ["en", "fr", "ar", "es"];
const localeKeys = {};
for (const l of locales) localeKeys[l] = extractLocaleKeys(transSrc, l);

// 3) Also parse AUTO_TRANSLATIONS keys per locale (best-effort)
let autoKeys = { en: new Set(), fr: new Set(), ar: new Set(), es: new Set() };
try {
  const genSrc = fs.readFileSync(GEN, "utf8");
  for (const l of locales) autoKeys[l] = extractLocaleKeys(genSrc, l);
} catch (_) {}

// 3b) parityTranslations sub-block at end of translations.ts
function extractSubblockKeys(src, headerNeedle, locale) {
  const startIdx = src.indexOf(headerNeedle);
  if (startIdx < 0) return new Set();
  const sub = src.slice(startIdx);
  const re = new RegExp("\\n  " + locale + ":\\s*\\{");
  const m = re.exec(sub);
  if (!m) return new Set();
  let i = m.index + m[0].length, d = 1;
  const start = i;
  while (i < sub.length && d > 0) {
    if (sub[i] === "{") d++;
    else if (sub[i] === "}") d--;
    if (d === 0) break;
    i++;
  }
  const block = sub.slice(start, i);
  const keys = new Set();
  const kre = /(?:^|\n|,|\{)\s*(?:"([^"\n]+)"|([A-Za-z_][A-Za-z0-9_]*))\s*:/g;
  let km;
  while ((km = kre.exec(block))) keys.add(km[1] || km[2]);
  return keys;
}
const parityKeys = {};
for (const l of locales) parityKeys[l] = extractSubblockKeys(transSrc, "parityTranslations: Record", l);

// contentOverrides applies to all locales
function extractFlatObject(src, headerNeedle) {
  const startIdx = src.indexOf(headerNeedle);
  if (startIdx < 0) return new Set();
  const sub = src.slice(startIdx);
  const open = sub.indexOf("{");
  let i = open + 1, d = 1;
  while (i < sub.length && d > 0) {
    if (sub[i] === "{") d++;
    else if (sub[i] === "}") d--;
    if (d === 0) break;
    i++;
  }
  const block = sub.slice(open + 1, i);
  const keys = new Set();
  const kre = /(?:^|\n|,|\{)\s*(?:"([^"\n]+)"|([A-Za-z_][A-Za-z0-9_]*))\s*:/g;
  let km;
  while ((km = kre.exec(block))) keys.add(km[1] || km[2]);
  return keys;
}
const overrideKeys = extractFlatObject(transSrc, "contentOverrides:");

// 4) Diff
const allLocaleKeys = {};
for (const l of locales) {
  allLocaleKeys[l] = new Set([
    ...localeKeys[l],
    ...autoKeys[l],
    ...parityKeys[l],
    ...overrideKeys,
  ]);
}

const missingPerLocale = {};
for (const l of locales) {
  missingPerLocale[l] = [...usedKeys].filter((k) => !allLocaleKeys[l].has(k)).sort();
}

const allInEn = allLocaleKeys.en;
const enMissingInOther = {};
for (const l of locales.filter((x) => x !== "en")) {
  enMissingInOther[l] = [...allInEn].filter((k) => !allLocaleKeys[l].has(k)).sort();
}

// 5) Write report
const out = [];
out.push("# Translation key audit (machine generated)");
out.push("");
out.push(`Used keys total: **${usedKeys.size}**`);
for (const l of locales) {
  out.push(`Keys defined in ${l} (manual+auto): **${allLocaleKeys[l].size}** (manual ${localeKeys[l].size} / auto ${autoKeys[l].size})`);
}
out.push("");
out.push("## Used-in-code but missing per locale");
for (const l of locales) {
  out.push(`\n### ${l} — ${missingPerLocale[l].length} missing`);
  if (missingPerLocale[l].length) {
    out.push("```");
    out.push(missingPerLocale[l].join("\n"));
    out.push("```");
  }
}
out.push("\n## Defined in EN but missing in other locales");
for (const l of locales.filter((x) => x !== "en")) {
  out.push(`\n### ${l} — ${enMissingInOther[l].length} missing`);
  if (enMissingInOther[l].length && enMissingInOther[l].length < 1500) {
    out.push("```");
    out.push(enMissingInOther[l].slice(0, 1500).join("\n"));
    out.push("```");
  } else if (enMissingInOther[l].length) {
    out.push(`(too many to list — ${enMissingInOther[l].length})`);
  }
}

fs.writeFileSync(path.join(__dirname, "..", "translation-audit-report.md"), out.join("\n"));

// JSON dump for downstream tooling
fs.writeFileSync(
  path.join(__dirname, "..", "translation-audit.json"),
  JSON.stringify(
    {
      usedKeys: [...usedKeys].sort(),
      locales,
      manualKeyCounts: Object.fromEntries(locales.map((l) => [l, localeKeys[l].size])),
      autoKeyCounts: Object.fromEntries(locales.map((l) => [l, autoKeys[l].size])),
      missingPerLocale,
      enMissingInOther,
    },
    null,
    2
  )
);

console.log("used keys:", usedKeys.size);
for (const l of locales) console.log(`${l}: defined=${allLocaleKeys[l].size}, missingFromUsed=${missingPerLocale[l].length}`);
for (const l of locales.filter((x) => x !== "en")) console.log(`en->${l}: ${enMissingInOther[l].length} en-only keys`);
