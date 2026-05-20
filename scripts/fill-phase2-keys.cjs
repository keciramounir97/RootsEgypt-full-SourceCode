const fs = require("fs");
const path = require("path");

const TRANS = path.join(__dirname, "..", "frontend", "src", "utils", "translations.ts");
let s = fs.readFileSync(TRANS, "utf8");

const entries = {
  copy_link:                { en: "Copy link",                   fr: "Copier le lien",                ar: "نسخ الرابط",                 es: "Copiar enlace" },
  show_less:                { en: "Show less",                   fr: "Réduire",                       ar: "عرض أقل",                   es: "Mostrar menos" },
  collapse:                 { en: "Collapse",                    fr: "Réduire",                       ar: "طيّ",                       es: "Contraer" },
  image_too_large:          { en: "Image too large (max ~1.2MB)", fr: "Image trop grande (max ~1,2 Mo)", ar: "الصورة كبيرة جدًا (الحد ~1.2 ميغابايت)", es: "Imagen demasiado grande (máx. ~1,2 MB)" },
  remove_image:             { en: "Remove image",                fr: "Supprimer l'image",              ar: "إزالة الصورة",              es: "Quitar imagen" },
  categories:               { en: "Categories",                  fr: "Catégories",                    ar: "الفئات",                    es: "Categorías" },
  loading_map:              { en: "Loading map…",                fr: "Chargement de la carte…",       ar: "جارٍ تحميل الخريطة…",       es: "Cargando mapa…" },
  tribes_of_western_sahara: { en: "Tribes of Western Sahara",    fr: "Tribus du Sahara occidental",   ar: "قبائل الصحراء الغربية",    es: "Tribus del Sáhara Occidental" },
  major_cities:             { en: "Major cities",                fr: "Grandes villes",                ar: "المدن الكبرى",              es: "Ciudades principales" },
  loading_comments:         { en: "Loading comments…",           fr: "Chargement des commentaires…",  ar: "جارٍ تحميل التعليقات…",     es: "Cargando comentarios…" },
  no_comments_yet:          { en: "No comments yet. Be the first!", fr: "Aucun commentaire. Soyez le premier !", ar: "لا توجد تعليقات بعد. كن أول من يعلّق!", es: "Aún no hay comentarios. ¡Sé el primero!" },
  something_went_wrong:     { en: "Something went wrong.",       fr: "Une erreur est survenue.",      ar: "حدث خطأ ما.",               es: "Algo salió mal." },
  link_copied:              { en: "Link copied!",                fr: "Lien copié !",                  ar: "تم نسخ الرابط!",            es: "¡Enlace copiado!" },
  no_other_people_available:{ en: "No other people available",   fr: "Aucune autre personne disponible", ar: "لا يوجد أشخاص آخرون متاحون", es: "No hay otras personas disponibles" },
  example_location:         { en: "e.g. Cairo, Egypt",           fr: "ex. Le Caire, Égypte",          ar: "مثال: القاهرة، مصر",        es: "p. ej. El Cairo, Egipto" },
  comment_placeholder:      { en: "Write a comment…",            fr: "Écrire un commentaire…",        ar: "اكتب تعليقًا…",             es: "Escribe un comentario…" },
  reply_placeholder:        { en: "Write a reply…",              fr: "Écrire une réponse…",           ar: "اكتب ردًا…",                es: "Escribe una respuesta…" },
};

function formatEntry(key, value) {
  const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `    ${key}: "${escaped}",\n`;
}
function insertAtLocaleClose(src, locale, lines) {
  // Find "<locale>: {" then walk brace depth to find matching "  },"
  const openRe = new RegExp("\\n  " + locale + ":\\s*\\{");
  const m = openRe.exec(src);
  if (!m) throw new Error("anchor missing for " + locale);
  let i = m.index + m[0].length;
  let depth = 1;
  while (i < src.length && depth > 0) {
    const ch = src[i];
    if (ch === "{") depth++;
    else if (ch === "}") depth--;
    if (depth === 0) break;
    i++;
  }
  // i points to closing }
  // Find start of that line to inject before it
  let j = i;
  while (j > 0 && src[j - 1] !== "\n") j--;
  return src.slice(0, j) + lines + src.slice(j);
}

const newLines = { en: "", fr: "", ar: "", es: "" };
for (const [k, v] of Object.entries(entries)) {
  for (const l of ["en", "fr", "ar", "es"]) newLines[l] += formatEntry(k, v[l]);
}
for (const l of ["en", "fr", "ar", "es"]) s = insertAtLocaleClose(s, l, newLines[l]);
fs.writeFileSync(TRANS, s);
console.log("Phase 2 keys added:", Object.keys(entries).length);
