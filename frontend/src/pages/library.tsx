import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useThemeStore } from "../store/theme";
import {
  AnimatePresence,
  motion,
  type Variants,
} from "framer-motion";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  Grid3X3,
  Heart,
  Layers,
  Search,
  Share2,
  Star,
  X,
} from "lucide-react";
import { api } from "../api/client";
import { getApiErrorMessage, getApiRoot } from "../api/helpers";
import { useTranslation } from "../context/TranslationContext";
import { useFavorites } from "../context/FavoritesContext";
import RootsPageShell from "../components/RootsPageShell";
import ScrollReveal from "../components/motion/ScrollReveal";
import {
  StaggerContainer,
  StaggerItem,
} from "../components/motion/StaggerChildren";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const formatBytes = (bytes: unknown) => {
  const n = Number(bytes) || 0;
  if (!n) return "";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(n) / Math.log(1024)), units.length - 1);
  const v = n / Math.pow(1024, i);
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
};

const itemTime = (x: any) => {
  const raw = x?.createdAt ?? x?.created_at;
  return raw ? new Date(raw).getTime() : 0;
};

const sortByDateDesc = (items: any[]) =>
  [...items].sort((a, b) => itemTime(b) - itemTime(a));

const DOC_HINT =
  /(document|archive|register|manuscript|wathaeq|record|nasab|deed|court|pdf|نسخ|وثيقة|سجل|مخطوطة|registre|archives)/i;

function isDocumentBook(b: any) {
  const cat = String(b.category || "");
  const title = String(b.title || "");
  return DOC_HINT.test(cat) || DOC_HINT.test(title);
}

/* ------------------------------------------------------------------ */
/*  Star rating component                                              */
/* ------------------------------------------------------------------ */
function StarRating({ rating = 0 }: { rating?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${
            s <= Math.round(rating)
              ? "fill-[#d4a843] text-[#d4a843]"
              : "text-gray-300 dark:text-gray-600"
          }`}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Horizontal scroll shelf                                            */
/* ------------------------------------------------------------------ */
function BookShelf({
  title,
  icon,
  items,
  onBookClick,
  renderCard,
  accentColor = "border-teal",
}: {
  title: string;
  icon: React.ReactNode;
  items: any[];
  onBookClick: (book: any) => void;
  renderCard: (book: any, onClick: () => void) => React.ReactNode;
  accentColor?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) el.addEventListener("scroll", checkScroll, { passive: true });
    return () => el?.removeEventListener("scroll", checkScroll);
  }, [checkScroll, items.length]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.7;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (items.length === 0) return null;

  return (
    <ScrollReveal className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-bold border-l-4 ${accentColor} pl-3 flex items-center gap-2`}>
          {icon}
          {title}
        </h2>
      </div>
      <div className="relative group/shelf">
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/shelf:opacity-100 transition-opacity backdrop-blur-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/shelf:opacity-100 transition-opacity backdrop-blur-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scroll-smooth pb-4 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: "none" }}
        >
          {items.map((book) => (
            <div key={book.id} className="snap-start shrink-0">
              {renderCard(book, () => onBookClick(book))}
            </div>
          ))}
        </div>
      </div>
    </ScrollReveal>
  );
}

/* ------------------------------------------------------------------ */
/*  Book detail modal                                                  */
/* ------------------------------------------------------------------ */
const modalVariants: Variants = {
  hidden: { opacity: 0, x: 80, scale: 0.95 },
  visible: { opacity: 1, x: 0, scale: 1, transition: { type: "spring", damping: 25, stiffness: 200 } },
  exit: { opacity: 0, x: 80, scale: 0.95, transition: { duration: 0.25 } },
};

function BookDetailModal({
  book,
  onClose,
  isDark,
  fileUrl,
  apiRoot,
  t,
  isFavorite,
  toggleFavorite,
  shareItem,
}: {
  book: any;
  onClose: () => void;
  isDark: boolean;
  fileUrl: (p: any) => string;
  apiRoot: string;
  t: (key: string, fallback?: string) => string;
  isFavorite: (type: string, id: string) => boolean;
  toggleFavorite: (type: string, id: string) => void;
  shareItem: (title: string) => void;
}) {
  const coverPath = book.coverUrl || book.cover_path || book.coverPath || "";
  const coverSrc = coverPath ? fileUrl(coverPath) : "";
  const kind = isDocumentBook(book) ? "document" : "book";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={`relative w-full max-w-lg h-full ${
          isDark ? "bg-[#0f1923]" : "bg-[#faf8f4]"
        } shadow-2xl overflow-y-auto`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cover */}
        <div className="relative h-80 overflow-hidden">
          {coverSrc ? (
            <img src={coverSrc} alt={book.title} className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${isDark ? "bg-[#1a2332]" : "bg-[#e8e0d4]"}`}>
              {kind === "document" ? (
                <FileText className="w-20 h-20 text-teal/40" />
              ) : (
                <BookOpen className="w-20 h-20 text-terracotta/40" />
              )}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-6 right-6">
            <span className="text-xs uppercase tracking-[0.3em] text-[#d4a843]">
              {kind === "document" ? t("documents", "Documents") : t("books", "Books")}
            </span>
            <h2 className="text-2xl font-bold text-white mt-1">{book.title}</h2>
            <p className="text-white/80 text-sm mt-1">{book.author || t("unknown", "Unknown")}</p>
          </div>
        </div>

        {/* Details */}
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-4">
            <StarRating rating={book.rating || Math.floor(Math.random() * 2) + 3} />
            <span className="text-xs opacity-60">{book.category || t("uncategorized", "Uncategorized")}</span>
          </div>

          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleFavorite(kind, book.id)}
              className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition ${
                isFavorite(kind, book.id)
                  ? "bg-pink-500/20 text-pink-500"
                  : isDark
                    ? "bg-white/10 text-white hover:bg-white/15"
                    : "bg-black/5 text-black hover:bg-black/10"
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite(kind, book.id) ? "fill-current" : ""}`} />
              {isFavorite(kind, book.id) ? t("saved", "Saved") : t("save", "Save")}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => shareItem(book.title)}
              className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition ${
                isDark ? "bg-white/10 text-white hover:bg-white/15" : "bg-black/5 text-black hover:bg-black/10"
              }`}
            >
              <Share2 className="w-5 h-5" />
              {t("share", "Share")}
            </motion.button>
          </div>

          <div className={`p-4 rounded-xl ${isDark ? "bg-white/5" : "bg-black/5"}`}>
            <p className="text-sm leading-relaxed opacity-85">
              {book.description || t("no_description", "No description available.")}
            </p>
          </div>

          {book.fileSize && (
            <p className="text-xs opacity-60">
              {t("file_label", "File")}: {formatBytes(book.fileSize)}
              {typeof book.downloads === "number" && ` · ${book.downloads} ${t("downloads_label", "downloads")}`}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            {Number.isFinite(Number(book.id)) && (
              <a
                href={`${apiRoot}/api/books/${book.id}/download`}
                className="flex-1 py-3 rounded-xl font-semibold bg-gradient-to-r from-teal to-[#0c4a6e] text-white flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-teal/20 transition"
                target="_blank"
                rel="noreferrer"
              >
                <Download className="w-5 h-5" />
                {t("download", "Download")}
              </a>
            )}
            {(book.fileUrl || book.file_path || book.filePath) && (
              <button
                onClick={() =>
                  window.open(fileUrl(book.fileUrl || book.file_path || book.filePath), "_blank", "noopener,noreferrer")
                }
                className={`flex-1 py-3 rounded-xl font-semibold border flex items-center justify-center gap-2 ${
                  isDark ? "border-white/20 text-white hover:bg-white/10" : "border-black/20 text-black hover:bg-black/5"
                } transition`}
              >
                <ExternalLink className="w-5 h-5" />
                {t("open", "Open")}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ================================================================== */
/*  Main Library Page                                                  */
/* ================================================================== */
export default function Library() {
  const { theme } = useThemeStore();
  const { t } = useTranslation();
  const location = useLocation();
  const { isFavorite, toggleFavorite } = useFavorites();
  const isDark = theme === "dark";

  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [bookCategory, setBookCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"shelf" | "grid">("shelf");
  const [selectedBook, setSelectedBook] = useState<any>(null);

  const apiRoot = useMemo(() => getApiRoot(), []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qParam = params.get("q");
    setQuery(qParam || "");
  }, [location.search]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/books");
        const data = res?.data;
        const bookList = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        if (mounted) setBooks(bookList);
      } catch (err) {
        if (mounted) setError(getApiErrorMessage(err, t("library_load_failed", "Could not load library.")));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [t]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const b of books) {
      const c = String(b.category || "").trim();
      if (c) set.add(c);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [books]);

  const queryLower = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    return books.filter((b) => {
      if (bookCategory !== "all" && String(b.category || "") !== bookCategory) return false;
      if (!queryLower) return true;
      const hay = [b.title, b.author, b.description, b.category].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(queryLower);
    });
  }, [books, bookCategory, queryLower]);

  const bookItems = useMemo(() => sortByDateDesc(filtered.filter((b) => !isDocumentBook(b))), [filtered]);
  const documentItems = useMemo(() => sortByDateDesc(filtered.filter((b) => isDocumentBook(b))), [filtered]);
  const popularBooks = useMemo(
    () => [...filtered].sort((a, b) => (Number(b.downloads) || 0) - (Number(a.downloads) || 0)).slice(0, 12),
    [filtered]
  );
  const recentBooks = useMemo(() => sortByDateDesc(filtered).slice(0, 12), [filtered]);

  const featuredBook = useMemo(
    () => sortByDateDesc(books.filter((b) => !isDocumentBook(b)))[0],
    [books]
  );

  const fileUrl = useCallback(
    (p: any) => {
      const raw = String(p || "").trim();
      if (!raw) return "";
      if (raw.startsWith("http")) return raw;
      const path = raw.startsWith("/") ? raw : `/${raw}`;
      return `${apiRoot.replace(/\/+$/, "")}${path}`;
    },
    [apiRoot]
  );

  const shareItem = (title: string) => {
    const url = `${window.location.origin}/library`;
    const text = `${title} — ${t("library", "Library")} · Roots Egypt`;
    if (navigator.share) navigator.share({ title, text, url }).catch(() => {});
    else void navigator.clipboard.writeText(url);
  };

  const cardBg = isDark ? "bg-[#151a21]" : "bg-white";
  const borderColor = isDark ? "border-[#24304A]" : "border-[#d8c7b0]";

  /* ------------------------------------------------------------------ */
  /*  Book card (Google Play style)                                     */
  /* ------------------------------------------------------------------ */
  const renderBookCard = (book: any, onClick: () => void) => {
    const coverPath = book.coverUrl || book.cover_path || book.coverPath || "";
    const coverSrc = coverPath ? fileUrl(coverPath) : "";
    const kind = isDocumentBook(book) ? "document" : "book";

    return (
      <motion.div
        whileHover={{ y: -8, scale: 1.03 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        onClick={onClick}
        className="cursor-pointer w-[140px] sm:w-[160px] md:w-[180px]"
      >
        {/* Cover */}
        <div
          className={`relative aspect-[3/4] rounded-lg overflow-hidden shadow-lg ${
            isDark ? "shadow-black/40" : "shadow-black/20"
          } group`}
        >
          {coverSrc ? (
            <img
              src={coverSrc}
              alt={book.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div
              className={`w-full h-full flex items-center justify-center ${
                isDark ? "bg-gradient-to-br from-[#1a2332] to-[#0d1b2a]" : "bg-gradient-to-br from-[#e8e0d4] to-[#d8c7b0]"
              }`}
            >
              {kind === "document" ? (
                <FileText className="w-12 h-12 text-teal/50" />
              ) : (
                <BookOpen className="w-12 h-12 text-terracotta/50" />
              )}
            </div>
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(kind, book.id);
                }}
                className="p-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition"
              >
                <Heart className={`w-4 h-4 ${isFavorite(kind, book.id) ? "fill-pink-500 text-pink-500" : ""}`} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  shareItem(book.title);
                }}
                className="p-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          {/* Free badge */}
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#d4a843] text-white uppercase tracking-wider">
            {t("free", "Free")}
          </div>
        </div>
        {/* Info */}
        <div className="mt-3 space-y-1 px-0.5">
          <h3 className="text-sm font-semibold line-clamp-2 leading-tight">{book.title}</h3>
          <p className="text-xs opacity-60 truncate">{book.author || t("unknown", "Unknown")}</p>
          <StarRating rating={book.rating || 4} />
        </div>
      </motion.div>
    );
  };

  /* ------------------------------------------------------------------ */
  /*  Grid view card                                                    */
  /* ------------------------------------------------------------------ */
  const renderGridCard = (book: any) => {
    const coverPath = book.coverUrl || book.cover_path || book.coverPath || "";
    const coverSrc = coverPath ? fileUrl(coverPath) : "";
    const kind = isDocumentBook(book) ? "document" : "book";

    return (
      <motion.div
        key={book.id}
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ y: -6 }}
        onClick={() => setSelectedBook(book)}
        className={`${cardBg} border ${borderColor} rounded-xl overflow-hidden shadow-lg cursor-pointer group transition-shadow hover:shadow-xl`}
      >
        <div className="relative aspect-[3/4] overflow-hidden">
          {coverSrc ? (
            <img src={coverSrc} alt={book.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${isDark ? "bg-[#1a2332]" : "bg-[#e8e0d4]"}`}>
              {kind === "document" ? <FileText className="w-14 h-14 text-teal/40" /> : <BookOpen className="w-14 h-14 text-terracotta/40" />}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#d4a843] text-white uppercase">
            {t("free", "Free")}
          </div>
        </div>
        <div className="p-4 space-y-2">
          <h3 className="font-semibold line-clamp-2 text-sm">{book.title}</h3>
          <p className="text-xs opacity-60 truncate">{book.author || t("unknown", "Unknown")}</p>
          <StarRating rating={book.rating || 4} />
          <div className="flex gap-2 pt-1">
            <button
              onClick={(e) => { e.stopPropagation(); toggleFavorite(kind, book.id); }}
              className="p-1.5 rounded-full hover:bg-pink-500/10 transition"
            >
              <Heart className={`w-4 h-4 ${isFavorite(kind, book.id) ? "fill-pink-500 text-pink-500" : "opacity-50"}`} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); shareItem(book.title); }}
              className="p-1.5 rounded-full hover:bg-teal/10 transition"
            >
              <Share2 className="w-4 h-4 opacity-50" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <RootsPageShell
      hero={
        <div className="space-y-4">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm uppercase tracking-[0.3em] text-[#d4a843]"
          >
            {t("library", "Library")}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-bold"
          >
            {t("library_title", "Egyptian Genealogy Library")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-4xl mx-auto text-lg opacity-90"
          >
            {t(
              "library_intro_books_docs",
              "Books and archival documents — civil registers, manuscripts, family papers, and digitized records from Egypt and the diaspora."
            )}
          </motion.p>
        </div>
      }
    >
      {/* Featured Banner */}
      {featuredBook && (
        <ScrollReveal>
          <section className="roots-section">
            <motion.div
              whileHover={{ scale: 1.01 }}
              onClick={() => setSelectedBook(featuredBook)}
              className={`relative overflow-hidden rounded-2xl cursor-pointer ${
                isDark ? "bg-gradient-to-r from-[#0d1b2a] to-[#1a2332]" : "bg-gradient-to-r from-[#f5f1e8] to-[#e8e0d4]"
              } border ${borderColor}`}
            >
              <div className="flex flex-col md:flex-row items-center gap-8 p-8 md:p-12">
                <div className="relative w-48 h-64 shrink-0 rounded-lg overflow-hidden shadow-2xl">
                  {(featuredBook.coverUrl || featuredBook.cover_path) ? (
                    <img
                      src={fileUrl(featuredBook.coverUrl || featuredBook.cover_path)}
                      alt={featuredBook.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${isDark ? "bg-[#1a2332]" : "bg-[#d8c7b0]"}`}>
                      <BookOpen className="w-16 h-16 text-teal/40" />
                    </div>
                  )}
                </div>
                <div className="flex-1 text-center md:text-left space-y-3">
                  <span className="text-xs uppercase tracking-[0.3em] text-[#d4a843] font-semibold">
                    {t("featured", "Featured")}
                  </span>
                  <h2 className="text-3xl font-bold">{featuredBook.title}</h2>
                  <p className="opacity-70">{featuredBook.author || t("unknown", "Unknown")}</p>
                  <StarRating rating={4} />
                  <p className="text-sm opacity-80 line-clamp-3 max-w-xl">
                    {featuredBook.description || t("no_description", "No description.")}
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-teal to-[#0c4a6e] text-white shadow-lg shadow-teal/20"
                    >
                      {t("read_now", "Read Now")}
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite("book", featuredBook.id);
                      }}
                      className={`px-6 py-2.5 rounded-xl font-semibold border ${
                        isDark ? "border-white/20 hover:bg-white/10" : "border-black/20 hover:bg-black/5"
                      } transition flex items-center gap-2`}
                    >
                      <Heart className={`w-4 h-4 ${isFavorite("book", featuredBook.id) ? "fill-pink-500 text-pink-500" : ""}`} />
                      {t("add_to_library", "Add to Library")}
                    </motion.button>
                  </div>
                </div>
              </div>
              {/* Decorative papyrus pattern */}
              <div
                className="absolute top-0 right-0 w-1/3 h-full opacity-[0.04] pointer-events-none"
                style={{
                  backgroundImage: `repeating-linear-gradient(45deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 8px)`,
                }}
              />
            </motion.div>
          </section>
        </ScrollReveal>
      )}

      {/* Search + Filters */}
      <ScrollReveal>
        <section className="roots-section roots-section-alt">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("search_library_books_docs", "Search books and documents...")}
                  className={`w-full pl-12 pr-4 py-3.5 rounded-xl bg-transparent border ${borderColor} outline-none focus:border-teal transition ${
                    isDark ? "text-white placeholder-white/40" : "text-[#091326] placeholder-black/40"
                  }`}
                />
              </div>
              <select
                value={bookCategory}
                onChange={(e) => setBookCategory(e.target.value)}
                className={`px-4 py-3.5 rounded-xl bg-transparent border ${borderColor} outline-none ${
                  isDark ? "text-white" : "text-[#091326]"
                }`}
              >
                <option value="all">{t("all_categories", "All Categories")}</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <div className="flex rounded-xl overflow-hidden border border-teal/30">
                <button
                  onClick={() => setViewMode("shelf")}
                  className={`px-4 py-3 transition ${viewMode === "shelf" ? "bg-teal text-white" : "hover:bg-teal/10"}`}
                >
                  <Layers className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-4 py-3 transition ${viewMode === "grid" ? "bg-teal text-white" : "hover:bg-teal/10"}`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Loading / Error */}
      {loading && (
        <section className="roots-section">
          <div className="flex justify-center py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-10 h-10 border-3 border-teal border-t-transparent rounded-full"
            />
          </div>
        </section>
      )}

      {error && (
        <section className="roots-section">
          <div className="text-center text-red-500 font-semibold py-8">{error}</div>
        </section>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          {viewMode === "shelf" ? (
            <section className="roots-section space-y-10">
              {/* Recently Added Shelf */}
              <BookShelf
                title={t("recently_added", "Recently Added")}
                icon={<BookOpen className="w-6 h-6 text-teal" />}
                items={recentBooks}
                onBookClick={setSelectedBook}
                renderCard={renderBookCard}
                accentColor="border-teal"
              />

              {/* Popular Shelf */}
              <BookShelf
                title={t("most_popular", "Most Popular")}
                icon={<Star className="w-6 h-6 text-[#d4a843]" />}
                items={popularBooks}
                onBookClick={setSelectedBook}
                renderCard={renderBookCard}
                accentColor="border-[#d4a843]"
              />

              {/* Books Shelf */}
              {bookItems.length > 0 && (
                <BookShelf
                  title={`${t("books", "Books")} (${bookItems.length})`}
                  icon={<BookOpen className="w-6 h-6 text-terracotta" />}
                  items={bookItems}
                  onBookClick={setSelectedBook}
                  renderCard={renderBookCard}
                  accentColor="border-terracotta"
                />
              )}

              {/* Documents Shelf */}
              {documentItems.length > 0 && (
                <BookShelf
                  title={`${t("documents", "Documents")} (${documentItems.length})`}
                  icon={<FileText className="w-6 h-6 text-teal" />}
                  items={documentItems}
                  onBookClick={setSelectedBook}
                  renderCard={renderBookCard}
                  accentColor="border-teal"
                />
              )}
            </section>
          ) : (
            <section className="roots-section">
              <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                <AnimatePresence mode="popLayout">
                  {filtered.map((book) => (
                    <StaggerItem key={book.id}>
                      {renderGridCard(book)}
                    </StaggerItem>
                  ))}
                </AnimatePresence>
              </StaggerContainer>
              {filtered.length === 0 && (
                <div className={`${cardBg} p-10 rounded-2xl border ${borderColor} text-center opacity-70 mt-8`}>
                  {t("no_books_found", "No books found.")}
                </div>
              )}
            </section>
          )}
        </>
      )}

      {/* Book Detail Modal */}
      <AnimatePresence>
        {selectedBook && (
          <BookDetailModal
            book={selectedBook}
            onClose={() => setSelectedBook(null)}
            isDark={isDark}
            fileUrl={fileUrl}
            apiRoot={apiRoot}
            t={t}
            isFavorite={isFavorite}
            toggleFavorite={toggleFavorite}
            shareItem={shareItem}
          />
        )}
      </AnimatePresence>
    </RootsPageShell>
  );
}
