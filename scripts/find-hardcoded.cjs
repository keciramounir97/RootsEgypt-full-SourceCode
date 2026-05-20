// Find candidate hardcoded user-visible English strings.
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "frontend", "src");
const SKIP_DIRS = new Set(["utils", "config", "constants", "content", "store"]);
const SKIP_FILES = new Set(["main.tsx", "vite-env.d.ts"]);

function walk(d, files = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      walk(p, files);
    } else if (/\.(tsx|jsx)$/.test(e.name) && !SKIP_FILES.has(e.name)) {
      files.push(p);
    }
  }
  return files;
}

const results = [];
for (const f of walk(ROOT)) {
  const c = fs.readFileSync(f, "utf8");
  const lines = c.split("\n");
  let count = 0;
  const samples = [];
  // patterns: JSX text with letters, placeholder=, aria-label=, title=, alt=, toast(...), alert(...)
  // Match JSX text that contains 2+ words with letters
  const patterns = [
    { re: /placeholder=["']([^"']*[A-Za-z][^"']*)["']/g, kind: "placeholder" },
    { re: /aria-label=["']([^"']*[A-Za-z][^"']*)["']/g, kind: "aria-label" },
    { re: /title=["']([^"']*[A-Za-z][^"']*)["']/g, kind: "title" },
    { re: /alt=["']([^"']*[A-Za-z][^"']*)["']/g, kind: "alt" },
    { re: /toast(?:\.(?:success|error|info|warning))?\(\s*["'`]([^"'`\n]+)["'`]/g, kind: "toast" },
    { re: /\balert\(\s*["'`]([^"'`\n]+)["'`]/g, kind: "alert" },
    { re: />\s*([A-Z][A-Za-z0-9 ,.'!?\-&/]{6,})\s*</g, kind: "jsx-text" },
  ];
  for (const { re, kind } of patterns) {
    let m;
    while ((m = re.exec(c))) {
      const text = m[1].trim();
      // skip things that look like dynamic refs, single words, or {jsx}
      if (text.includes("{") || text.includes("}")) continue;
      if (text === text.toUpperCase() && text.length < 10) continue;
      // skip if surrounded by t(
      const start = Math.max(0, m.index - 30);
      const ctx = c.slice(start, m.index);
      if (/\bt\($/.test(ctx) || /\bt\(\s*["'`]?$/.test(ctx)) continue;
      count++;
      if (samples.length < 4) samples.push(`${kind}: ${text}`);
    }
  }
  if (count > 0) {
    results.push({ file: path.relative(ROOT, f), count, samples });
  }
}
results.sort((a, b) => b.count - a.count);
console.log("Files with candidate hardcoded strings (top 60):");
for (const r of results.slice(0, 60)) {
  console.log(`  ${r.count.toString().padStart(4)}  ${r.file}`);
}
console.log(`\nTotal files: ${results.length}`);
console.log(`Grand total candidates: ${results.reduce((a, b) => a + b.count, 0)}`);
fs.writeFileSync(path.join(__dirname, "..", "hardcoded-candidates.json"), JSON.stringify(results, null, 2));
