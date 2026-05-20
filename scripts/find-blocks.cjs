const fs = require("fs");
const s = fs.readFileSync("frontend/src/utils/translations.ts", "utf8");
for (const l of ["en", "fr", "ar", "es"]) {
  const re = new RegExp("\\n\\s*" + l + "\\s*:\\s*\\{", "m");
  const m = re.exec(s);
  if (!m) { console.log(l, "NOT FOUND"); continue; }
  let i = m.index + m[0].length, d = 1;
  while (i < s.length && d > 0) {
    if (s[i] === "{") d++;
    else if (s[i] === "}") d--;
    if (d === 0) break;
    i++;
  }
  const openLine = s.slice(0, m.index).split("\n").length;
  const closeLine = s.slice(0, i).split("\n").length;
  console.log(l, "open line", openLine, "close line", closeLine);
}
