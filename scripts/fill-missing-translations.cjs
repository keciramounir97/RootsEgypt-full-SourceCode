// Fills missing translation keys in frontend/src/utils/translations.ts.
// Inserts the same set of new keys (with hand-translated AR/FR/ES) at the
// end of each of the en/fr/ar/es blocks in the main `translations` object.
const fs = require("fs");
const path = require("path");

const TRANS = path.join(
  __dirname,
  "..",
  "frontend",
  "src",
  "utils",
  "translations.ts",
);
let s = fs.readFileSync(TRANS, "utf8");

// All entries are { key: { en, fr, ar, es } }.
// Sources: 114 missing keys identified by audit + a few related extras.
const entries = {
  // Generic
  access_denied: {
    en: "Access denied",
    fr: "Accès refusé",
    ar: "تم رفض الوصول",
    es: "Acceso denegado",
  },
  approved: {
    en: "Approved",
    fr: "Approuvé",
    ar: "تمت الموافقة",
    es: "Aprobado",
  },
  rejected: { en: "Rejected", fr: "Rejeté", ar: "مرفوض", es: "Rechazado" },
  pending: {
    en: "Pending",
    fr: "En attente",
    ar: "قيد الانتظار",
    es: "Pendiente",
  },
  pending_approval: {
    en: "Pending approval",
    fr: "En attente d'approbation",
    ar: "بانتظار الموافقة",
    es: "Pendiente de aprobación",
  },
  archived: { en: "Archived", fr: "Archivé", ar: "مؤرشف", es: "Archivado" },
  validated: { en: "Validated", fr: "Validé", ar: "تم التحقق", es: "Validado" },
  coded: { en: "Coded", fr: "Codé", ar: "مُرمَّز", es: "Codificado" },
  timed: { en: "Timed", fr: "Chronométré", ar: "مُؤقَّت", es: "Cronometrado" },
  total: { en: "Total", fr: "Total", ar: "الإجمالي", es: "Total" },
  total_signups: {
    en: "Total signups",
    fr: "Inscriptions totales",
    ar: "إجمالي التسجيلات",
    es: "Registros totales",
  },
  signed_up: { en: "Signed up", fr: "Inscrit", ar: "مسجَّل", es: "Registrado" },
  more: { en: "More", fr: "Plus", ar: "المزيد", es: "Más" },
  message: { en: "Message", fr: "Message", ar: "الرسالة", es: "Mensaje" },
  preview: { en: "Preview", fr: "Aperçu", ar: "معاينة", es: "Vista previa" },
  show_details: {
    en: "Show details",
    fr: "Afficher les détails",
    ar: "عرض التفاصيل",
    es: "Mostrar detalles",
  },
  move_up: { en: "Move up", fr: "Monter", ar: "تحريك للأعلى", es: "Subir" },
  move_down: {
    en: "Move down",
    fr: "Descendre",
    ar: "تحريك للأسفل",
    es: "Bajar",
  },
  with_media: {
    en: "With media",
    fr: "Avec médias",
    ar: "مع الوسائط",
    es: "Con medios",
  },
  custom_category: {
    en: "Custom category",
    fr: "Catégorie personnalisée",
    ar: "فئة مخصّصة",
    es: "Categoría personalizada",
  },
  caption: { en: "Caption", fr: "Légende", ar: "تعليق", es: "Leyenda" },
  enter_caption: {
    en: "Enter caption",
    fr: "Saisir la légende",
    ar: "أدخل التعليق",
    es: "Introduzca la leyenda",
  },
  short_description: {
    en: "Short description",
    fr: "Description courte",
    ar: "وصف موجز",
    es: "Descripción breve",
  },

  // Placeholders
  title_placeholder: {
    en: "Enter title",
    fr: "Saisir le titre",
    ar: "أدخل العنوان",
    es: "Introduzca el título",
  },
  description_placeholder: {
    en: "Enter description",
    fr: "Saisir la description",
    ar: "أدخل الوصف",
    es: "Introduzca la descripción",
  },
  location_placeholder: {
    en: "Location (optional)",
    fr: "Lieu (facultatif)",
    ar: "الموقع (اختياري)",
    es: "Ubicación (opcional)",
  },
  photographer_placeholder: {
    en: "Photographer (optional)",
    fr: "Photographe (facultatif)",
    ar: "المصوّر (اختياري)",
    es: "Fotógrafo (opcional)",
  },
  year_placeholder: {
    en: "Year (e.g. 1952)",
    fr: "Année (ex. 1952)",
    ar: "السنة (مثال: 1952)",
    es: "Año (p. ej. 1952)",
  },
  book_title_placeholder: {
    en: "Enter book title",
    fr: "Saisir le titre du livre",
    ar: "أدخل عنوان الكتاب",
    es: "Introduzca el título del libro",
  },
  post_title: {
    en: "Post title",
    fr: "Titre du billet",
    ar: "عنوان المنشور",
    es: "Título de la publicación",
  },

  // Articles / Posts
  posts: {
    en: "Posts",
    fr: "Publications",
    ar: "المنشورات",
    es: "Publicaciones",
  },
  no_articles: {
    en: "No articles found",
    fr: "Aucun article trouvé",
    ar: "لا توجد مقالات",
    es: "No se encontraron artículos",
  },
  article_created: {
    en: "Article created",
    fr: "Article créé",
    ar: "تم إنشاء المقال",
    es: "Artículo creado",
  },
  article_updated: {
    en: "Article updated",
    fr: "Article mis à jour",
    ar: "تم تحديث المقال",
    es: "Artículo actualizado",
  },
  article_deleted: {
    en: "Article deleted",
    fr: "Article supprimé",
    ar: "تم حذف المقال",
    es: "Artículo eliminado",
  },
  article_desc: {
    en: "Manage articles, blog posts, and editorial content.",
    fr: "Gérez les articles, les billets de blog et le contenu éditorial.",
    ar: "إدارة المقالات والتدوينات والمحتوى التحريري.",
    es: "Gestione artículos, entradas de blog y contenido editorial.",
  },
  article_image: {
    en: "Article image",
    fr: "Image de l'article",
    ar: "صورة المقال",
    es: "Imagen del artículo",
  },
  article_management: {
    en: "Article management",
    fr: "Gestion des articles",
    ar: "إدارة المقالات",
    es: "Gestión de artículos",
  },
  posts_load_failed: {
    en: "Failed to load posts",
    fr: "Échec du chargement des publications",
    ar: "تعذّر تحميل المنشورات",
    es: "No se pudieron cargar las publicaciones",
  },
  post_save_failed: {
    en: "Failed to save post",
    fr: "Échec de l'enregistrement",
    ar: "تعذّر حفظ المنشور",
    es: "No se pudo guardar la publicación",
  },
  post_delete_failed: {
    en: "Failed to delete post",
    fr: "Échec de la suppression",
    ar: "تعذّر حذف المنشور",
    es: "No se pudo eliminar la publicación",
  },
  content_required: {
    en: "Content is required",
    fr: "Le contenu est obligatoire",
    ar: "المحتوى مطلوب",
    es: "El contenido es obligatorio",
  },
  video_url: {
    en: "Video URL",
    fr: "URL de la vidéo",
    ar: "رابط الفيديو",
    es: "URL del vídeo",
  },

  // Audio
  audio: { en: "Audio", fr: "Audio", ar: "صوت", es: "Audio" },
  audios_load_failed: {
    en: "Failed to load audios",
    fr: "Échec du chargement des audios",
    ar: "تعذّر تحميل الملفات الصوتية",
    es: "No se pudieron cargar los audios",
  },
  audio_list: {
    en: "Audio list",
    fr: "Liste audio",
    ar: "قائمة الملفات الصوتية",
    es: "Lista de audios",
  },
  audio_management: {
    en: "Audio management",
    fr: "Gestion des audios",
    ar: "إدارة الصوتيات",
    es: "Gestión de audios",
  },
  audio_desc: {
    en: "Manage audio recordings, oral histories and recorded interviews.",
    fr: "Gérez les enregistrements audio, témoignages oraux et interviews.",
    ar: "إدارة التسجيلات الصوتية والروايات الشفهية والمقابلات.",
    es: "Gestione grabaciones de audio, historias orales y entrevistas.",
  },
  audio_created: {
    en: "Audio created",
    fr: "Audio créé",
    ar: "تم إنشاء الملف الصوتي",
    es: "Audio creado",
  },
  audio_updated: {
    en: "Audio updated",
    fr: "Audio mis à jour",
    ar: "تم تحديث الملف الصوتي",
    es: "Audio actualizado",
  },
  audio_deleted: {
    en: "Audio deleted",
    fr: "Audio supprimé",
    ar: "تم حذف الملف الصوتي",
    es: "Audio eliminado",
  },
  audio_required: {
    en: "Audio file is required",
    fr: "Fichier audio obligatoire",
    ar: "الملف الصوتي مطلوب",
    es: "Se requiere un archivo de audio",
  },
  audio_file_formats: {
    en: "MP3, WAV, OGG, M4A",
    fr: "MP3, WAV, OGG, M4A",
    ar: "MP3, WAV, OGG, M4A",
    es: "MP3, WAV, OGG, M4A",
  },
  invalid_audio_type: {
    en: "Invalid audio file type",
    fr: "Type de fichier audio invalide",
    ar: "نوع ملف صوتي غير صالح",
    es: "Tipo de archivo de audio no válido",
  },
  click_to_upload_audio: {
    en: "Click to upload audio",
    fr: "Cliquez pour téléverser l'audio",
    ar: "انقر لرفع ملف صوتي",
    es: "Haga clic para subir audio",
  },
  upload_new_audio: {
    en: "Upload new audio",
    fr: "Téléverser un nouvel audio",
    ar: "رفع ملف صوتي جديد",
    es: "Subir nuevo audio",
  },
  select_audio: {
    en: "Select audio",
    fr: "Sélectionner un audio",
    ar: "اختيار ملف صوتي",
    es: "Seleccionar audio",
  },
  edit_audio: {
    en: "Edit audio",
    fr: "Modifier l'audio",
    ar: "تعديل الملف الصوتي",
    es: "Editar audio",
  },
  no_audios: {
    en: "No audios found",
    fr: "Aucun audio trouvé",
    ar: "لا توجد ملفات صوتية",
    es: "No se encontraron audios",
  },

  // Documents
  document: { en: "Document", fr: "Document", ar: "مستند", es: "Documento" },
  document_list: {
    en: "Document list",
    fr: "Liste des documents",
    ar: "قائمة المستندات",
    es: "Lista de documentos",
  },
  document_management: {
    en: "Document management",
    fr: "Gestion des documents",
    ar: "إدارة المستندات",
    es: "Gestión de documentos",
  },
  document_desc: {
    en: "Manage scanned documents, manuscripts and historical records.",
    fr: "Gérez les documents numérisés, manuscrits et archives historiques.",
    ar: "إدارة المستندات الممسوحة والمخطوطات والسجلات التاريخية.",
    es: "Gestione documentos escaneados, manuscritos y archivos históricos.",
  },
  document_created: {
    en: "Document created",
    fr: "Document créé",
    ar: "تم إنشاء المستند",
    es: "Documento creado",
  },
  document_updated: {
    en: "Document updated",
    fr: "Document mis à jour",
    ar: "تم تحديث المستند",
    es: "Documento actualizado",
  },
  document_deleted: {
    en: "Document deleted",
    fr: "Document supprimé",
    ar: "تم حذف المستند",
    es: "Documento eliminado",
  },
  document_file_formats: {
    en: "PDF, DOC, DOCX, TXT",
    fr: "PDF, DOC, DOCX, TXT",
    ar: "PDF, DOC, DOCX, TXT",
    es: "PDF, DOC, DOCX, TXT",
  },
  invalid_doc_type: {
    en: "Invalid document type",
    fr: "Type de document invalide",
    ar: "نوع المستند غير صالح",
    es: "Tipo de documento no válido",
  },
  click_to_upload_document: {
    en: "Click to upload document",
    fr: "Cliquez pour téléverser le document",
    ar: "انقر لرفع المستند",
    es: "Haga clic para subir el documento",
  },
  upload_new_document: {
    en: "Upload new document",
    fr: "Téléverser un nouveau document",
    ar: "رفع مستند جديد",
    es: "Subir nuevo documento",
  },
  edit_document: {
    en: "Edit document",
    fr: "Modifier le document",
    ar: "تعديل المستند",
    es: "Editar documento",
  },
  no_documents: {
    en: "No documents found",
    fr: "Aucun document trouvé",
    ar: "لا توجد مستندات",
    es: "No se encontraron documentos",
  },
  open_file: {
    en: "Open file",
    fr: "Ouvrir le fichier",
    ar: "فتح الملف",
    es: "Abrir archivo",
  },
  open_failed: {
    en: "Failed to open",
    fr: "Échec de l'ouverture",
    ar: "تعذّر الفتح",
    es: "No se pudo abrir",
  },
  select_file: {
    en: "Select file",
    fr: "Sélectionner un fichier",
    ar: "اختيار ملف",
    es: "Seleccionar archivo",
  },
  image_file_formats: {
    en: "JPG, PNG, WEBP, GIF",
    fr: "JPG, PNG, WEBP, GIF",
    ar: "JPG, PNG, WEBP, GIF",
    es: "JPG, PNG, WEBP, GIF",
  },
  image_not_found: {
    en: "Image not found",
    fr: "Image introuvable",
    ar: "الصورة غير موجودة",
    es: "Imagen no encontrada",
  },

  // Books
  book_cover: {
    en: "Book cover",
    fr: "Couverture du livre",
    ar: "غلاف الكتاب",
    es: "Portada del libro",
  },
  cover_preview: {
    en: "Cover preview",
    fr: "Aperçu de la couverture",
    ar: "معاينة الغلاف",
    es: "Vista previa de portada",
  },

  // Hero / sliders
  hero_image_updated: {
    en: "Hero image updated",
    fr: "Image principale mise à jour",
    ar: "تم تحديث الصورة الرئيسية",
    es: "Imagen principal actualizada",
  },
  hero_images_reordered: {
    en: "Hero images reordered",
    fr: "Images principales réorganisées",
    ar: "تمت إعادة ترتيب الصور الرئيسية",
    es: "Imágenes principales reordenadas",
  },
  reorder_failed: {
    en: "Reorder failed",
    fr: "Échec du réordonnancement",
    ar: "فشل إعادة الترتيب",
    es: "Error al reordenar",
  },
  slider_prev: {
    en: "Previous slide",
    fr: "Diapositive précédente",
    ar: "الشريحة السابقة",
    es: "Diapositiva anterior",
  },
  slider_next: {
    en: "Next slide",
    fr: "Diapositive suivante",
    ar: "الشريحة التالية",
    es: "Diapositiva siguiente",
  },
  slider_goto: {
    en: "Go to slide",
    fr: "Aller à la diapositive",
    ar: "الانتقال إلى الشريحة",
    es: "Ir a la diapositiva",
  },

  // Admin / Super-admin
  admins: {
    en: "Admins",
    fr: "Administrateurs",
    ar: "المسؤولون",
    es: "Administradores",
  },
  no_admins: {
    en: "No admins found",
    fr: "Aucun administrateur trouvé",
    ar: "لا يوجد مسؤولون",
    es: "No hay administradores",
  },
  super_admin: {
    en: "Super admin",
    fr: "Super administrateur",
    ar: "المسؤول الأعلى",
    es: "Super administrador",
  },
  super_admins: {
    en: "Super admins",
    fr: "Super administrateurs",
    ar: "المسؤولون الأعلى",
    es: "Super administradores",
  },
  super_admin_only: {
    en: "Super admin only",
    fr: "Réservé au super administrateur",
    ar: "للمسؤول الأعلى فقط",
    es: "Solo super administrador",
  },
  super_admin_only_notice: {
    en: "Only super admins can perform this action.",
    fr: "Seuls les super administrateurs peuvent effectuer cette action.",
    ar: "يمكن للمسؤولين الأعلى فقط تنفيذ هذا الإجراء.",
    es: "Solo los super administradores pueden realizar esta acción.",
  },
  only_super_admin: {
    en: "Only super admin",
    fr: "Super administrateur uniquement",
    ar: "المسؤول الأعلى فقط",
    es: "Solo super administrador",
  },
  admin_management: {
    en: "Admin management",
    fr: "Gestion des administrateurs",
    ar: "إدارة المسؤولين",
    es: "Gestión de administradores",
  },
  admin_management_desc: {
    en: "Create, update, suspend, or remove administrator accounts.",
    fr: "Créer, mettre à jour, suspendre ou supprimer des comptes administrateurs.",
    ar: "إنشاء حسابات المسؤولين أو تحديثها أو تعليقها أو حذفها.",
    es: "Cree, actualice, suspenda o elimine cuentas de administrador.",
  },
  create_admin: {
    en: "Create admin",
    fr: "Créer un administrateur",
    ar: "إنشاء مسؤول",
    es: "Crear administrador",
  },
  create_new_admin: {
    en: "Create new admin",
    fr: "Créer un nouvel administrateur",
    ar: "إنشاء مسؤول جديد",
    es: "Crear nuevo administrador",
  },
  edit_admin: {
    en: "Edit admin",
    fr: "Modifier l'administrateur",
    ar: "تعديل المسؤول",
    es: "Editar administrador",
  },
  admin_created: {
    en: "Admin created",
    fr: "Administrateur créé",
    ar: "تم إنشاء المسؤول",
    es: "Administrador creado",
  },
  admin_updated: {
    en: "Admin updated",
    fr: "Administrateur mis à jour",
    ar: "تم تحديث المسؤول",
    es: "Administrador actualizado",
  },
  admin_deleted: {
    en: "Admin deleted",
    fr: "Administrateur supprimé",
    ar: "تم حذف المسؤول",
    es: "Administrador eliminado",
  },
  confirm_delete_admin: {
    en: "Are you sure you want to delete this admin?",
    fr: "Voulez-vous vraiment supprimer cet administrateur ?",
    ar: "هل أنت متأكد من حذف هذا المسؤول؟",
    es: "¿Seguro que quieres eliminar este administrador?",
  },
  privileges: {
    en: "Privileges",
    fr: "Privilèges",
    ar: "الصلاحيات",
    es: "Privilegios",
  },
  privileges_desc: {
    en: "Permissions assigned to this role.",
    fr: "Permissions attribuées à ce rôle.",
    ar: "الأذونات المخصّصة لهذا الدور.",
    es: "Permisos asignados a este rol.",
  },

  // User approvals / suggestions
  user_approvals: {
    en: "User approvals",
    fr: "Approbations d'utilisateurs",
    ar: "موافقات المستخدمين",
    es: "Aprobaciones de usuarios",
  },
  user_approvals_desc: {
    en: "Review and approve new user registrations.",
    fr: "Examinez et approuvez les nouvelles inscriptions.",
    ar: "مراجعة تسجيلات المستخدمين الجدد والموافقة عليها.",
    es: "Revise y apruebe los registros de usuarios nuevos.",
  },
  no_pending_users: {
    en: "No pending users",
    fr: "Aucun utilisateur en attente",
    ar: "لا يوجد مستخدمون في الانتظار",
    es: "No hay usuarios pendientes",
  },
  user_approved: {
    en: "User approved",
    fr: "Utilisateur approuvé",
    ar: "تمت الموافقة على المستخدم",
    es: "Usuario aprobado",
  },
  user_rejected: {
    en: "User rejected",
    fr: "Utilisateur rejeté",
    ar: "تم رفض المستخدم",
    es: "Usuario rechazado",
  },
  suggestions_management: {
    en: "Suggestions management",
    fr: "Gestion des suggestions",
    ar: "إدارة الاقتراحات",
    es: "Gestión de sugerencias",
  },
  suggestions_desc: {
    en: "Review user-submitted suggestions and proposals.",
    fr: "Examinez les suggestions et propositions soumises par les utilisateurs.",
    ar: "مراجعة الاقتراحات والمقترحات المُرسلة من المستخدمين.",
    es: "Revise las sugerencias y propuestas enviadas por los usuarios.",
  },
  no_suggestions: {
    en: "No suggestions found",
    fr: "Aucune suggestion trouvée",
    ar: "لا توجد اقتراحات",
    es: "No hay sugerencias",
  },
  suggestion_approved: {
    en: "Suggestion approved",
    fr: "Suggestion approuvée",
    ar: "تمت الموافقة على الاقتراح",
    es: "Sugerencia aprobada",
  },
  suggestion_rejected: {
    en: "Suggestion rejected",
    fr: "Suggestion rejetée",
    ar: "تم رفض الاقتراح",
    es: "Sugerencia rechazada",
  },

  update_failed: {
    en: "Update failed",
    fr: "Échec de la mise à jour",
    ar: "فشل التحديث",
    es: "Error al actualizar",
  },
  gallery_assets_need_backend: {
    en: "Gallery assets require a backend connection.",
    fr: "Les ressources de la galerie nécessitent une connexion au backend.",
    ar: "تتطلب وسائط المعرض اتصالاً بالخادم.",
    es: "Los recursos de la galería requieren una conexión con el backend.",
  },

  // Egypt-period gaps in ES (also helpful to have EN/FR/AR aligned via auto)
  // We will rely on AUTO_TRANSLATIONS for fr/ar, but explicitly add ES here.
  // English/French/Arabic stay undefined here so existing definitions are kept.
};

// Egypt-period ES-only gaps from audit (keys already exist in en/fr/ar):
const esOnly = {
  home_era_islamic: "Era islámica",
  home_era_modern: "Era moderna",
  images_unavailable: "Imágenes no disponibles",
  periods_pharaonic_title: "Era faraónica",
  periods_pharaonic_desc:
    "Tres milenios de civilización a lo largo del Nilo: dinastías, jeroglíficos, templos y tumbas.",
  periods_pharaonic_b1:
    "Sucesión de dinastías y unificación del Alto y Bajo Egipto.",
  periods_pharaonic_b2: "Pirámides, templos y arte monumental.",
  periods_pharaonic_b3: "Escritura jeroglífica y administración del estado.",
  periods_pharaonic_b4: "Comercio con Nubia, el Levante y el mar Egeo.",
  periods_ptolemaic_title: "Era ptolemaica",
  periods_ptolemaic_desc:
    "Egipto helenístico bajo la dinastía ptolemaica con Alejandría como capital intelectual.",
  periods_ptolemaic_b1:
    "Fundación de Alejandría como centro de cultura y comercio.",
  periods_ptolemaic_b2: "Biblioteca y faro de Alejandría.",
  periods_ptolemaic_b3: "Mezcla de tradiciones griegas y egipcias.",
  periods_ptolemaic_b4: "Final con Cleopatra VII y la conquista romana.",
  periods_early_islamic_title: "Era islámica temprana",
  periods_early_islamic_desc:
    "Llegada del islam y fundación de Fustat tras la conquista árabe del siglo VII.",
  periods_early_islamic_b1: "Conquista árabe en 641 y fundación de Fustat.",
  periods_early_islamic_b2: "Difusión del islam y de la lengua árabe.",
  periods_early_islamic_b3: "Administraciones omeya y abasí.",
  periods_early_islamic_b4: "Auge de la mezquita de Amr ibn al-As.",
  periods_fatimid_title: "Era fatimí",
  periods_fatimid_desc:
    "Califato chiita ismailí que fundó El Cairo en 969 y promovió el saber.",
  periods_fatimid_b1: "Fundación de El Cairo como nueva capital.",
  periods_fatimid_b2:
    "Universidad de Al-Azhar como centro de estudios islámicos.",
  periods_fatimid_b3:
    "Ruta comercial entre el Mediterráneo y el océano Índico.",
  periods_fatimid_b4: "Tolerancia relativa hacia comunidades coptas y judías.",
  periods_mamluk_title: "Era mameluca",
  periods_mamluk_desc:
    "Sultanato dirigido por una élite militar de soldados-esclavos liberados.",
  periods_mamluk_b1: "Defensa frente a mongoles y cruzados.",
  periods_mamluk_b2: "Edad de oro de la arquitectura cairota.",
  periods_mamluk_b3: "Comercio del azúcar, especias y manuscritos.",
  periods_mamluk_b4:
    "Decadencia tras las rutas oceánicas y la conquista otomana.",
  periods_british_title: "Ocupación británica",
  periods_british_desc:
    "Egipto bajo dominio británico de facto entre 1882 y 1952.",
  periods_british_b1: "Ocupación tras la revuelta Urabi en 1882.",
  periods_british_b2: "Protectorado formal durante la Primera Guerra Mundial.",
  periods_british_b3: "Movimiento nacionalista del Wafd y revolución de 1919.",
  periods_british_b4: "Independencia formal en 1922 y revolución de 1952.",
  periods_timeline_ottoman_egypt: "Egipto otomano",
  periods_timeline_ottoman_egypt_desc:
    "1517–1798: provincia otomana administrada por valíes y mamelucos.",
  periods_timeline_early_islamic: "Era islámica temprana",
  periods_timeline_early_islamic_desc:
    "641–969: tras la conquista árabe; capitales Fustat y al-Askar.",
  periods_timeline_fatimid: "Era fatimí",
  periods_timeline_fatimid_desc:
    "969–1171: fundación de El Cairo y de Al-Azhar.",
  periods_timeline_mamluk: "Era mameluca",
  periods_timeline_mamluk_desc:
    "1250–1517: sultanato mameluco y arquitectura monumental.",
  periods_timeline_british: "Periodo británico",
  periods_timeline_british_desc:
    "1882–1952: ocupación británica hasta la independencia.",
};

// images_unavailable also missing in fr/ar
const fillFrAr = {
  images_unavailable: { fr: "Images indisponibles", ar: "الصور غير متاحة" },
};

function formatEntry(key, value) {
  // basic JSON-like quoting, ensure no double-quotes inside
  const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `    ${key}: "${escaped}",\n`;
}

function insertAtLocaleClose(src, locale, lines) {
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
  let j = i;
  while (j > 0 && src[j - 1] !== "\n") j--;
  return src.slice(0, j) + lines + src.slice(j);
}

// Build insertion strings for each locale
const newLines = { en: "", fr: "", ar: "", es: "" };
for (const [k, v] of Object.entries(entries)) {
  for (const l of ["en", "fr", "ar", "es"]) {
    if (v[l]) newLines[l] += formatEntry(k, v[l]);
  }
}
// Add fr/ar for images_unavailable
for (const [k, v] of Object.entries(fillFrAr)) {
  for (const l of Object.keys(v)) newLines[l] += formatEntry(k, v[l]);
}
// Add ES-only Egypt-period keys
for (const [k, v] of Object.entries(esOnly)) {
  newLines.es += formatEntry(k, v);
}

for (const l of ["en", "fr", "ar", "es"]) {
  s = insertAtLocaleClose(s, l, newLines[l]);
}

fs.writeFileSync(TRANS, s);
console.log("Inserted keys:");
for (const l of ["en", "fr", "ar", "es"]) {
  const count = (newLines[l].match(/\n/g) || []).length;
  console.log(`  ${l}: ${count} lines`);
}
