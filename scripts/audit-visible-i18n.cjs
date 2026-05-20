const fs = require("fs");
const path = require("path");
const ts = require("../frontend/node_modules/typescript");

const root = path.join(process.cwd(), "frontend", "src");

const VISIBLE_ATTRS = new Set([
  "placeholder",
  "title",
  "aria-label",
  "alt",
  "label",
]);

const IGNORE_TEXT = new Set([
  "Roots",
  "ROOTS",
  "Egypt",
  "RootsEgypt",
  "Facebook",
  "X",
  "WhatsApp",
  "Telegram",
  "OpenStreetMap",
  "GEDCOM",
  "GEDCOM X",
  "GEDCOM 7.0",
  "MB",
  "U",
  "i",
  "true",
  "false",
  "editor",
  "metadata",
  "user",
  "wait",
  "initial",
  "enter",
  "exit",
  "hidden",
  "show",
  "none",
  "round",
  "share-article-title",
  "marcousorilious@gmail.com",
]);

const TECHNICAL_ATTRS = new Set([
  "accept",
  "aria-controls",
  "aria-current",
  "aria-expanded",
  "aria-haspopup",
  "aria-hidden",
  "aria-live",
  "aria-modal",
  "autoComplete",
  "capture",
  "className",
  "color",
  "d",
  "data-aos",
  "data-aos-delay",
  "dir",
  "download",
  "fill",
  "height",
  "href",
  "htmlFor",
  "id",
  "initial",
  "inputMode",
  "key",
  "method",
  "mode",
  "name",
  "pattern",
  "points",
  "preload",
  "preserveAspectRatio",
  "role",
  "src",
  "stopColor",
  "strokeLinecap",
  "target",
  "to",
  "type",
  "value",
  "viewBox",
  "width",
]);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(fullPath, out);
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) out.push(fullPath);
  }
  return out;
}

function hasHumanText(value) {
  return /[A-Za-zÀ-ÿ\u0600-\u06ff]/.test(value);
}

function normalize(value) {
  return value.replace(/\s+/g, " ").trim();
}

function classify(file) {
  const rel = path.relative(root, file).replace(/\\/g, "/");
  if (rel.startsWith("admin/pages/")) return "admin page";
  if (rel.startsWith("admin/components/")) return "admin component";
  if (rel.startsWith("pages/")) return "website page";
  if (rel === "components/Navbar.tsx") return "website navbar";
  if (rel === "components/Footer.tsx") return "website footer";
  if (rel.startsWith("components/")) return "shared component";
  if (rel.startsWith("context/")) return "context";
  return "other";
}

function isIgnored(value) {
  if (!value) return true;
  if (IGNORE_TEXT.has(value)) return true;
  if (/^#(?:[0-9a-f]{3}){1,2}$/i.test(value)) return true;
  if (/^[A-Z0-9_.:/?&=+#%-]+$/.test(value) && value.length <= 80) return true;
  if (/^\d+(\.\d+)?$/.test(value)) return true;
  return false;
}

const hits = [];
const files = walk(root);

for (const file of files) {
  if (!/\.(tsx|jsx)$/.test(file)) continue;
  const source = fs.readFileSync(file, "utf8");
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.JSX);

  const addHit = (node, kind, text) => {
    const value = normalize(text);
    if (!hasHumanText(value) || isIgnored(value)) return;
    const { line } = sf.getLineAndCharacterOfPosition(node.getStart(sf));
    hits.push({
      layer: classify(file),
      file: path.relative(root, file).replace(/\\/g, "/"),
      line: line + 1,
      kind,
      text: value,
    });
  };

  const visit = (node) => {
    if (ts.isJsxText(node)) {
      addHit(node, "jsx-text", node.getText(sf));
    }

    if (ts.isJsxAttribute(node) && node.initializer && ts.isStringLiteral(node.initializer)) {
      const name = node.name.getText(sf);
      if (VISIBLE_ATTRS.has(name)) {
        addHit(node, `attr:${name}`, node.initializer.text);
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sf);
}

const grouped = hits.reduce((acc, hit) => {
  acc[hit.layer] = acc[hit.layer] || [];
  acc[hit.layer].push(hit);
  return acc;
}, {});

console.log(`Visible hardcoded candidates: ${hits.length}`);
for (const layer of Object.keys(grouped).sort()) {
  console.log(`\n## ${layer} (${grouped[layer].length})`);
  for (const hit of grouped[layer]) {
    console.log(`${hit.file}:${hit.line} [${hit.kind}] ${hit.text}`);
  }
}
