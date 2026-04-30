import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useThemeStore } from "../store/theme";
import {
  AnimatePresence,
  motion,
  type Variants,
} from "framer-motion";
import {
  Archive,
  ChevronLeft,
  ChevronRight,
  FileText,
  Heart,
  Image as ImageIcon,
  Loader2,
  Search,
  Share2,
  X,
} from "lucide-react";
import { api } from "../api/client";
import { getApiErrorMessage, getApiRoot } from "../api/helpers";
import { useTranslation } from "../context/TranslationContext";
import { useFavorites } from "../context/FavoritesContext";
import RootsPageShell from "../components/RootsPageShell";
import ScrollReveal from "../components/motion/ScrollReveal";
import { curatedGalleryItems } from "../content/curatedGallery";
import {
  StaggerContainer,
  StaggerItem,
} from "../components/motion/StaggerChildren";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const itemTime = (x: any) => {
  const raw = x?.createdAt ?? x?.created_at;
  return raw ? new Date(raw).getTime() : 0;
};

const sortByDateDesc = (items: any[]) =>
  [...items].sort((a, b) => itemTime(b) - itemTime(a));

const formatDate = (raw: string | undefined) => {
  if (!raw) return "";
  try {
    return new Date(raw).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
};

const ITEMS_PER_PAGE = 12;

/* ------------------------------------------------------------------ */
/*  Framer-motion variants                                             */
/* ------------------------------------------------------------------ */

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const lightboxVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", damping: 28, stiffness: 260 },
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    y: 30,
    transition: { duration: 0.22 },
  },
};

const filterPillVariants: Variants = {
  inactive: { scale: 1 },
  active: { scale: 1 },
};

/* ------------------------------------------------------------------ */
/*  Component: GalleryCard                                             */
/* ------------------------------------------------------------------ */

interface GalleryCardProps {
  item: any;
  imageSrc: string;
  isDark: boolean;
  isFav: boolean;
  onOpen: () => void;
  onToggleFav: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
  t: (key: string, fallback?: string) => string;
}

function GalleryCard({
  item,
  imageSrc,
  isDark,
  isFav,
  onOpen,
  onToggleFav,
  onShare,
  t,
}: GalleryCardProps) {
  const [loaded, setLoaded] = useState(false);

  const category =
    item.category ||
    item.archiveSource ||
    t("images", "Images");

  const date = formatDate(item.createdAt ?? item.created_at);

  return (
    <motion.div
      layout
      layoutId={`gallery-card-${item.id}`}
      className={`
        gallery-masonry-card group relative cursor-pointer
        rounded-2xl overflow-hidden break-inside-avoid mb-5
        transition-all duration-500 ease-out
        ${isDark
          ? "shadow-[0_2px_20px_rgba(13,148,136,0.08)] hover:shadow-[0_8px_40px_rgba(13,148,136,0.18)] border border-white/[0.06] hover:border-teal/30"
          : "shadow-[0_2px_16px_rgba(12,74,110,0.08)] hover:shadow-[0_12px_48px_rgba(12,74,110,0.16)]"
        }
      `}
      onClick={onOpen}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {/* Image container with variable aspect ratio */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0c4a6e]/10 via-teal/5 to-[#d4a84b]/8">
        {imageSrc ? (
          <>
            {/* Blur-up placeholder */}
            {!loaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-[#0c4a6e]/20 via-teal/10 to-[#d4a84b]/15 animate-pulse" />
            )}
            <img
              src={imageSrc}
              alt={item.title || "Gallery image"}
              className={`
                w-full h-auto block transition-all duration-700 ease-out
                group-hover:scale-[1.05]
                ${loaded ? "opacity-100" : "opacity-0"}
              `}
              loading="lazy"
              onLoad={() => setLoaded(true)}
            />
          </>
        ) : (
          <div className="w-full aspect-[4/3] flex items-center justify-center text-[#0c4a6e]/40">
            <ImageIcon className="w-14 h-14" />
          </div>
        )}

        {/* Hover overlay gradient */}
        <div
          className="
            absolute inset-0
            bg-gradient-to-t from-black/70 via-black/20 to-transparent
            opacity-0 group-hover:opacity-100
            transition-opacity duration-400
          "
        />

        {/* Always-visible subtle bottom gradient for readability */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

        {/* Heart icon - top right, appears on hover */}
        <button
          type="button"
          className={`
            absolute top-3 right-3 p-2 rounded-full z-10
            opacity-0 group-hover:opacity-100
            transform translate-y-1 group-hover:translate-y-0
            transition-all duration-300
            backdrop-blur-md
            ${isFav
              ? "bg-teal/80 text-white"
              : "bg-black/30 hover:bg-black/50 text-white/90"
            }
          `}
          aria-label={t("add_to_favorites", "Save to favorites")}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFav(e);
          }}
        >
          <Heart
            className={`w-4 h-4 transition-transform duration-200 ${
              isFav ? "fill-white scale-110" : "group-hover:scale-110"
            }`}
          />
        </button>

        {/* Share button - top right below heart, appears on hover */}
        <button
          type="button"
          className="
            absolute top-14 right-3 p-2 rounded-full z-10
            opacity-0 group-hover:opacity-100
            transform translate-y-1 group-hover:translate-y-0
            transition-all duration-300 delay-75
            bg-black/30 hover:bg-black/50 text-white/90
            backdrop-blur-md
          "
          aria-label={t("share", "Share")}
          onClick={(e) => {
            e.stopPropagation();
            onShare(e);
          }}
        >
          <Share2 className="w-4 h-4" />
        </button>

        {/* Bottom info overlay - appears on hover */}
        <div
          className="
            absolute left-0 right-0 bottom-0 p-4 z-10
            transform translate-y-2 group-hover:translate-y-0
            opacity-0 group-hover:opacity-100
            transition-all duration-400
          "
        >
          {category && (
            <span className="inline-block text-[10px] font-semibold uppercase tracking-[0.25em] text-[#d4a843] mb-1">
              {category}
            </span>
          )}
          <h3 className="text-white font-bold text-sm leading-snug line-clamp-2 drop-shadow-md">
            {item.title || t("untitled", "Untitled")}
          </h3>
          {date && (
            <p className="text-white/60 text-[11px] mt-1">{date}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component: Lightbox                                                */
/* ------------------------------------------------------------------ */

interface LightboxProps {
  item: any;
  items: any[];
  isDark: boolean;
  fileUrl: (path: string | undefined, opts?: { isGallery?: boolean }) => string;
  isFavorite: boolean;
  onToggleFav: () => void;
  onShare: () => void;
  onClose: () => void;
  onNavigate: (direction: -1 | 1) => void;
  t: (key: string, fallback?: string) => string;
  metaPanel: string;
}

function Lightbox({
  item,
  isDark,
  fileUrl,
  isFavorite: isFav,
  onToggleFav,
  onShare,
  onClose,
  onNavigate,
  t,
  metaPanel,
}: LightboxProps) {
  const imgSrc = fileUrl(item.image_path ?? item.imagePath, {
    isGallery: true,
  });

  const category =
    item.category || item.archiveSource || t("images", "Images");
  const date = formatDate(item.createdAt ?? item.created_at);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.25 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/85 backdrop-blur-xl"
        onClick={onClose}
      />

      {/* Navigation arrows */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onNavigate(-1);
        }}
        className="
          absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-[110]
          p-2.5 sm:p-3 rounded-full
          bg-white/10 hover:bg-white/20 text-white
          backdrop-blur-md border border-white/10
          transition-all duration-200 hover:scale-110
        "
        aria-label={t("previous", "Previous")}
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onNavigate(1);
        }}
        className="
          absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-[110]
          p-2.5 sm:p-3 rounded-full
          bg-white/10 hover:bg-white/20 text-white
          backdrop-blur-md border border-white/10
          transition-all duration-200 hover:scale-110
        "
        aria-label={t("next", "Next")}
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="
          absolute top-4 right-4 sm:top-6 sm:right-6 z-[110]
          p-2.5 rounded-full
          bg-white/10 hover:bg-red-500/70 text-white
          backdrop-blur-md border border-white/10
          transition-all duration-200 hover:scale-110
        "
        aria-label={t("close", "Close")}
      >
        <X className="w-5 h-5" />
      </button>

      {/* Content */}
      <motion.div
        className={`
          relative z-[105] flex flex-col lg:flex-row
          max-w-6xl w-[96vw] sm:w-[95vw] max-h-[90vh]
          rounded-2xl overflow-hidden
          ${isDark
            ? "bg-[#0d1b2a]/95 border border-white/10"
            : "bg-white/95 border border-[#d8c7b0]/40"
          }
          shadow-2xl
        `}
        variants={lightboxVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image side */}
        <div className="relative flex-1 min-h-[25vh] sm:min-h-[35vh] lg:min-h-0 bg-black/90 flex items-center justify-center">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={item.title}
              className="w-full h-full object-contain max-h-[50vh] lg:max-h-[85vh]"
            />
          ) : (
            <div className="flex items-center justify-center text-white/30 p-12">
              <ImageIcon className="w-24 h-24" />
            </div>
          )}

          {/* Egyptian decorative corner accents */}
          <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-[#d4a843]/30 rounded-tl-lg pointer-events-none" />
          <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-[#d4a843]/30 rounded-tr-lg pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-[#d4a843]/30 rounded-bl-lg pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-[#d4a843]/30 rounded-br-lg pointer-events-none" />
        </div>

        {/* Info side */}
        <div className="lg:w-[320px] xl:w-[380px] flex flex-col overflow-y-auto">
          <div className="p-6 space-y-4 flex-1">
            {/* Category badge */}
            {category && (
              <span
                className={`
                  inline-block text-[10px] font-bold uppercase tracking-[0.3em] px-3 py-1 rounded-full
                  ${isDark
                    ? "bg-teal/20 text-teal"
                    : "bg-[#0c4a6e]/10 text-[#0c4a6e]"
                  }
                `}
              >
                {category}
              </span>
            )}

            <h3
              className={`text-xl font-bold leading-snug ${
                isDark ? "text-white" : "text-[#091326]"
              }`}
            >
              {item.title || t("untitled", "Untitled")}
            </h3>

            {date && (
              <p className={`text-xs ${isDark ? "text-white/50" : "text-gray-400"}`}>
                {date}
              </p>
            )}

            {item.description && (
              <p
                className={`text-sm leading-relaxed ${
                  isDark ? "text-white/70" : "text-gray-600"
                }`}
              >
                {item.description}
              </p>
            )}

            {item.location && (
              <p
                className={`text-sm ${isDark ? "text-white/50" : "text-gray-500"}`}
              >
                {item.location}
              </p>
            )}

            {/* Archive / Document metadata */}
            {(item.archiveSource || item.documentCode) && (
              <div className="space-y-2 pt-2">
                {item.archiveSource && (
                  <div className={`${metaPanel} border rounded-xl p-3`}>
                    <p className="text-[10px] uppercase opacity-50 mb-1 tracking-wider">
                      {t("archive_source", "Archive Source")}
                    </p>
                    <p className="text-xs font-semibold flex items-start gap-2">
                      <Archive className="w-3.5 h-3.5 text-terracotta shrink-0 mt-0.5" />
                      {item.archiveSource}
                    </p>
                  </div>
                )}
                {item.documentCode && (
                  <div className={`${metaPanel} border rounded-xl p-3`}>
                    <p className="text-[10px] uppercase opacity-50 mb-1 tracking-wider">
                      {t("document_code", "Document Code")}
                    </p>
                    <p className="text-xs font-semibold font-mono flex items-start gap-2">
                      <FileText className="w-3.5 h-3.5 text-teal shrink-0 mt-0.5" />
                      {item.documentCode}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Egyptian decorative divider */}
            <div className="flex items-center gap-3 py-2">
              <div className={`flex-1 h-px ${isDark ? "bg-white/10" : "bg-[#d8c7b0]/40"}`} />
              <div className="w-1.5 h-1.5 rotate-45 bg-[#d4a843]/60" />
              <div className={`flex-1 h-px ${isDark ? "bg-white/10" : "bg-[#d8c7b0]/40"}`} />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFav();
                }}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${isFav
                    ? isDark
                      ? "bg-teal/20 text-teal border border-teal/30"
                      : "bg-teal/10 text-teal border border-teal/20"
                    : isDark
                      ? "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
                  }
                `}
              >
                <Heart
                  className={`w-4 h-4 ${isFav ? "fill-current" : ""}`}
                />
                {isFav ? t("saved", "Saved") : t("save", "Save")}
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onShare();
                }}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${isDark
                    ? "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
                  }
                `}
              >
                <Share2 className="w-4 h-4" />
                {t("share", "Share")}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ================================================================== */
/*  Main Gallery Page                                                  */
/* ================================================================== */

export default function GalleryPage() {
  const { theme } = useThemeStore();
  const { t } = useTranslation();
  const location = useLocation();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [gallery, setGallery] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [loadingMore, setLoadingMore] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const apiRoot = useMemo(() => getApiRoot(), []);
  const isDark = theme === "dark";

  /* ---------- URL search param sync ---------- */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qParam = params.get("q");
    setQuery(qParam || "");
  }, [location.search]);

  /* ---------- Fetch gallery data ---------- */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api
          .get("/gallery")
          .catch(() => ({ data: { gallery: [] } }));
        if (!mounted) return;
        const galleryData = res?.data;
        const raw =
          galleryData?.gallery && Array.isArray(galleryData.gallery)
            ? galleryData.gallery
            : Array.isArray(galleryData)
              ? galleryData
              : [];
        const curated = curatedGalleryItems.map((item) => ({
          ...item,
          imagePath: item.imagePath,
        }));
        const merged = [...curated, ...raw].reduce<any[]>((acc, item) => {
          const nextPath = String(item.image_path ?? item.imagePath ?? "");
          const duplicate = acc.some(
            (existing) =>
              String(existing.id) === String(item.id) ||
              String(existing.image_path ?? existing.imagePath ?? "") === nextPath
          );
          if (!duplicate) acc.push(item);
          return acc;
        }, []);
        setGallery(
          merged.map((item: any) => ({
            ...item,
            imagePath: item.image_path ?? item.imagePath,
          }))
        );
      } catch (err) {
        if (!mounted) return;
        setError(
          getApiErrorMessage(err, t("gallery_load_failed", "Could not load images."))
        );
        setGallery([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [t]);

  /* ---------- file URL resolver ---------- */
  const fileUrl = useCallback(
    (path: string | undefined, { isGallery = false } = {}) => {
      if (!path) return "";
      const raw = String(path).trim();
      if (raw.startsWith("http")) return raw;
      let p = raw.startsWith("/") ? raw : `/${raw}`;
      if (isGallery && !p.startsWith("/uploads/")) {
        p = `/uploads/gallery/${raw.replace(/^\/+/, "")}`;
      }
      return `${apiRoot.replace(/\/+$/, "")}${p}`;
    },
    [apiRoot]
  );

  /* ---------- Extract unique categories ---------- */
  const categories = useMemo(() => {
    const cats = new Set<string>();
    gallery.forEach((item) => {
      const cat =
        item.category || item.archiveSource;
      if (cat) cats.add(cat);
    });
    return ["all", ...Array.from(cats)];
  }, [gallery]);

  /* ---------- Filter + search ---------- */
  const filteredGallery = useMemo(() => {
    let result = gallery;

    // Category filter
    if (activeCategory !== "all") {
      result = result.filter(
        (item) =>
          item.category === activeCategory ||
          item.archiveSource === activeCategory
      );
    }

    // Text search
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (item) =>
          item.title?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.archiveSource?.toLowerCase().includes(q) ||
          item.documentCode?.toLowerCase().includes(q) ||
          item.location?.toLowerCase().includes(q)
      );
    }

    return sortByDateDesc(result);
  }, [gallery, query, activeCategory]);

  /* ---------- Reset visible count on filter change ---------- */
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [query, activeCategory]);

  /* ---------- Visible slice ---------- */
  const visibleItems = useMemo(
    () => filteredGallery.slice(0, visibleCount),
    [filteredGallery, visibleCount]
  );
  const hasMore = visibleCount < filteredGallery.length;

  /* ---------- Infinite scroll / Load More ---------- */
  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    // Small delay to show loading indicator
    setTimeout(() => {
      setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
      setLoadingMore(false);
    }, 300);
  }, [hasMore, loadingMore]);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  /* ---------- Lightbox navigation ---------- */
  const navigateLightbox = useCallback(
    (direction: -1 | 1) => {
      if (!selectedImage) return;
      const currentIdx = filteredGallery.findIndex(
        (item) => item.id === selectedImage.id
      );
      if (currentIdx === -1) return;
      const nextIdx =
        (currentIdx + direction + filteredGallery.length) %
        filteredGallery.length;
      setSelectedImage(filteredGallery[nextIdx]);
    },
    [selectedImage, filteredGallery]
  );

  /* ---------- Keyboard navigation ---------- */
  useEffect(() => {
    if (!selectedImage) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedImage(null);
      if (e.key === "ArrowLeft") navigateLightbox(-1);
      if (e.key === "ArrowRight") navigateLightbox(1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedImage, navigateLightbox]);

  /* ---------- Lock body scroll when lightbox open ---------- */
  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedImage]);

  /* ---------- Share helper ---------- */
  const shareImage = useCallback(
    (item: any) => {
      const url =
        window.location.href.split("?")[0] +
        `?q=${encodeURIComponent(item.title || "")}`;
      if (navigator.share) {
        navigator
          .share({ title: item.title, text: item.description, url })
          .catch(() => {});
      } else {
        navigator.clipboard?.writeText(url);
      }
    },
    []
  );

  /* ---------- Theme-aware classes ---------- */
  const borderColor = isDark ? "border-white/10" : "border-[#d8c7b0]/60";
  const metaPanel = isDark
    ? "bg-white/5 border-white/10"
    : "bg-[#0c4a6e]/5 border-[#d8c7b0]/60";

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */

  return (
    <RootsPageShell
      hero={
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-teal">
            {t("gallery", "Gallery")}
          </p>
          <h1 className="text-5xl font-bold">
            {t("gallery_title", "Roots Egypt Photo Gallery")}
          </h1>
          <p className="max-w-4xl mx-auto text-lg opacity-90">
            {t(
              "gallery_intro_images_only",
              "Explore the Roots Egypt photo collection, a curated mix of heritage portraits, archival visuals, and cultural imagery shaped for family-history storytelling."
            )}
          </p>
        </div>
      }
    >
      {/* =============================== */}
      {/*  Search + Filter Bar             */}
      {/* =============================== */}
      <ScrollReveal>
        <section className="roots-section" style={{ paddingBottom: 0 }}>
          <div className="space-y-5">
            {/* Search input */}
            <div className="relative max-w-2xl mx-auto">
              <Search
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  isDark ? "text-white/40" : "text-[#0c4a6e]/50"
                }`}
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t(
                  "search_images_placeholder",
                  "Search by title, location, archive reference..."
                )}
                className={`
                  w-full pl-12 pr-4 py-3.5 rounded-2xl
                  bg-transparent border ${borderColor}
                  outline-none transition-all duration-300
                  focus:ring-2 focus:ring-teal/30 focus:border-teal/50
                  ${isDark ? "text-white placeholder:text-white/30" : "text-[#091326] placeholder:text-gray-400"}
                `}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors ${
                    isDark ? "text-white/40 hover:text-white/70" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category filter pills */}
            {categories.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 justify-center flex-wrap">
                {categories.map((cat) => {
                  const isActive = activeCategory === cat;
                  const label =
                    cat === "all" ? t("all", "All") : cat;
                  return (
                    <motion.button
                      key={cat}
                      type="button"
                      variants={filterPillVariants}
                      animate={isActive ? "active" : "inactive"}
                      onClick={() => setActiveCategory(cat)}
                      className={`
                        relative px-5 py-2 rounded-full text-sm font-medium
                        whitespace-nowrap transition-colors duration-300
                        ${isActive
                          ? isDark
                            ? "text-white"
                            : "text-white"
                          : isDark
                            ? "text-white/60 hover:text-white/80 border border-white/10 hover:border-white/20"
                            : "text-gray-500 hover:text-gray-700 border border-[#d8c7b0]/40 hover:border-[#d8c7b0]/70"
                        }
                      `}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="gallery-filter-active"
                          className="absolute inset-0 rounded-full bg-gradient-to-r from-[#0c4a6e] via-teal to-[#0c4a6e]"
                          transition={{
                            type: "spring",
                            stiffness: 350,
                            damping: 30,
                          }}
                        />
                      )}
                      <span className="relative z-10">{label}</span>
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* Results count + decorative divider */}
            {!loading && !error && (
              <div className="flex items-center gap-4 pt-1">
                <div className={`flex-1 h-px ${isDark ? "bg-white/10" : "bg-[#d8c7b0]/30"}`} />
                <span
                  className={`text-xs uppercase tracking-[0.2em] font-medium ${
                    isDark ? "text-white/40" : "text-gray-400"
                  }`}
                >
                  {filteredGallery.length}{" "}
                  {filteredGallery.length === 1
                    ? t("image", "image")
                    : t("images_count", "images")}
                </span>
                <div className={`flex-1 h-px ${isDark ? "bg-white/10" : "bg-[#d8c7b0]/30"}`} />
              </div>
            )}
          </div>
        </section>
      </ScrollReveal>

      {/* =============================== */}
      {/*  Loading / Error states          */}
      {/* =============================== */}
      {loading ? (
        <section className="roots-section">
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 text-teal animate-spin" />
            <p className={`text-sm ${isDark ? "text-white/50" : "text-gray-400"}`}>
              {t("loading_gallery", "Loading gallery...")}
            </p>
          </div>
        </section>
      ) : error ? (
        <section className="roots-section">
          <div className="text-center text-red-500 font-semibold py-12">
            {error}
          </div>
        </section>
      ) : null}

      {/* =============================== */}
      {/*  Masonry Gallery Grid            */}
      {/* =============================== */}
      {!loading && !error && (
        <section className="roots-section roots-section-alt" style={{ paddingTop: "1rem" }}>
          {filteredGallery.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <ImageIcon
                className={`w-16 h-16 ${isDark ? "text-white/20" : "text-gray-200"}`}
              />
              <p
                className={`text-lg font-medium ${isDark ? "text-white/40" : "text-gray-400"}`}
              >
                {t("no_images_found", "No images found.")}
              </p>
              <p
                className={`text-sm max-w-md text-center ${isDark ? "text-white/25" : "text-gray-300"}`}
              >
                {t(
                  "try_different_search",
                  "Try adjusting your search or selecting a different category."
                )}
              </p>
            </div>
          ) : (
            <>
              {/* CSS columns-based masonry grid */}
              <StaggerContainer
                className="
                  [columns:1] sm:[columns:2] lg:[columns:3] xl:[columns:4]
                  [column-gap:1.25rem]
                  gallery-masonry
                "
              >
                {visibleItems.map((item) => {
                  const imageSrc = item.imagePath
                    ? fileUrl(item.imagePath, { isGallery: true })
                    : "";
                  const fav = isFavorite("image", item.id);

                  return (
                    <StaggerItem key={item.id}>
                      <GalleryCard
                        item={item}
                        imageSrc={imageSrc}
                        isDark={isDark}
                        isFav={fav}
                        onOpen={() => setSelectedImage(item)}
                        onToggleFav={() => toggleFavorite("image", item.id)}
                        onShare={() => shareImage(item)}
                        t={t}
                      />
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>

              {/* Infinite scroll sentinel + Load More */}
              {hasMore && (
                <div className="flex flex-col items-center gap-4 pt-8 pb-4">
                  <div ref={sentinelRef} className="h-1" />
                  {loadingMore ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 text-teal animate-spin" />
                      <span
                        className={`text-sm ${isDark ? "text-white/40" : "text-gray-400"}`}
                      >
                        {t("loading_more", "Loading more...")}
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={loadMore}
                      className={`
                        px-8 py-3 rounded-2xl text-sm font-semibold
                        transition-all duration-300
                        border
                        ${isDark
                          ? "border-teal/30 text-teal hover:bg-teal/10 hover:border-teal/50"
                          : "border-[#0c4a6e]/20 text-[#0c4a6e] hover:bg-[#0c4a6e]/5 hover:border-[#0c4a6e]/40"
                        }
                      `}
                    >
                      {t("load_more", "Load More")} ({filteredGallery.length - visibleCount}{" "}
                      {t("remaining", "remaining")})
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* =============================== */}
      {/*  Lightbox Modal                  */}
      {/* =============================== */}
      <AnimatePresence mode="wait">
        {selectedImage && (
          <Lightbox
            key={selectedImage.id}
            item={selectedImage}
            items={filteredGallery}
            isDark={isDark}
            fileUrl={fileUrl}
            isFavorite={isFavorite("image", selectedImage.id)}
            onToggleFav={() => toggleFavorite("image", selectedImage.id)}
            onShare={() => shareImage(selectedImage)}
            onClose={() => setSelectedImage(null)}
            onNavigate={navigateLightbox}
            t={t}
            metaPanel={metaPanel}
          />
        )}
      </AnimatePresence>
    </RootsPageShell>
  );
}
