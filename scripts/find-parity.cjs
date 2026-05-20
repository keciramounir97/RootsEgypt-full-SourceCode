const fs = require("fs");
const s = fs.readFileSync("frontend/src/utils/translations.ts", "utf8");
const lines = s.split("\n");
function findStart(needle) {
  for (let i = 0; i < lines.length; i++) if (lines[i].includes(needle)) return i + 1;
  return -1;
}
console.log("parityTranslations declaration line:", findStart("parityTranslations: Record"));
console.log("contentOverrides declaration line:", findStart("contentOverrides"));
// Find each locale block within parityTranslations
const startIdx = s.indexOf("parityTranslations: Record");
const block = s.slice(startIdx);
for (const l of ["en", "fr", "ar", "es"]) {
  const re = new RegExp("\\n  " + l + ":\\s*\\{");
  const m = re.exec(block);
  if (m) {
    const lineNo = s.slice(0, startIdx + m.index).split("\n").length + 1;
    let i = startIdx + m.index + m[0].length, d = 1;
    while (i < s.length && d > 0) {
      if (s[i] === "{") d++; else if (s[i] === "}") d--;
      if (d === 0) break;
      i++;
    }
    const closeLine = s.slice(0, i).split("\n").length;
    console.log("parity", l, "open", lineNo, "close", closeLine);
  }
}
