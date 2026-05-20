const fs = require("fs");
const s =
  fs.readFileSync("frontend/src/utils/translations.ts", "utf8") +
  fs.readFileSync("frontend/src/utils/generatedTranslations.ts", "utf8");
const need = process.argv.slice(2);
for (const k of need) {
  const re = new RegExp("\\b" + k + ':\\s*["`]', "g");
  const n = (s.match(re) || []).length;
  console.log(`${n.toString().padStart(2)}  ${k}`);
}
