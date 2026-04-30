import { NavLink } from "react-router-dom";
import { useThemeStore } from "../store/theme";
import {
  Archive,
  ArrowRight,
  BookOpen,
  Compass,
  Download,
  Eye,
  Feather,
  FileText,
  Headphones,
  Heart,
  Image,
  Layers,
  Map,
  MessageCircle,
  Newspaper,
  Scroll,
  Search,
  Shield,
  Sparkles,
  Star,
  TreePine,
  UserCircle2,
  Users,
  X,
} from "lucide-react";
import { useTranslation } from "../context/TranslationContext";
import { useState, useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { api } from "../api/client";
import { getApiRoot, normalizeTree } from "../api/helpers";
import TreesBuilder, {
  parseGedcom,
  parseGedcomX,
} from "../admin/components/TreesBuilder";
import ErrorBoundary from "../components/ErrorBoundary";
import ScrollReveal from "../components/motion/ScrollReveal";
import {
  StaggerContainer,
  StaggerItem,
} from "../components/motion/StaggerChildren";
import CountUp from "../components/motion/CountUp";
import {
  EyeOfHorus,
  NileWave,
  EGYPT_COLORS,
  EGYPT_EASE,
} from "../components/motion/EgyptianMotion";

/* ------------------------------------------------------------------ */
/*  Animated Ankh symbol                                               */
/* ------------------------------------------------------------------ */
function AnkhSymbol({
  className = "",
  delay = 0,
}: {
  className?: string;
  delay?: number;
}) {
  return (
    <motion.svg
      viewBox="0 0 60 100"
      className={className}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 0.12, y: 0 }}
      transition={{ delay, duration: 2, ease: "easeOut" }}
    >
      <ellipse
        cx="30"
        cy="22"
        rx="14"
        ry="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      <line
        x1="30"
        y1="40"
        x2="30"
        y2="95"
        stroke="currentColor"
        strokeWidth="3"
      />
      <line
        x1="12"
        y1="58"
        x2="48"
        y2="58"
        stroke="currentColor"
        strokeWidth="3"
      />
    </motion.svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Pyramid silhouette (CSS/SVG)                                       */
/* ------------------------------------------------------------------ */
function PyramidSilhouette({ isDark }: { isDark: boolean }) {
  const color = isDark ? "#d4a843" : "#c45c3e";
  return (
    <svg
      viewBox="0 0 1440 200"
      className="absolute bottom-0 left-0 w-full"
      preserveAspectRatio="none"
      style={{ height: "120px" }}
    >
      {/* Big pyramid */}
      <polygon points="400,200 560,40 720,200" fill={color} opacity="0.07" />
      {/* Medium pyramid */}
      <polygon points="620,200 740,70 860,200" fill={color} opacity="0.05" />
      {/* Small pyramid */}
      <polygon points="800,200 880,100 960,200" fill={color} opacity="0.04" />
      {/* Ground line */}
      <rect x="0" y="195" width="1440" height="5" fill={color} opacity="0.03" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Floating particle dots                                             */
/* ------------------------------------------------------------------ */
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-[#d4a843]"
          style={{
            left: `${8 + ((i * 5.2) % 85)}%`,
            top: `${10 + ((i * 7.3) % 80)}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.15, 0.4, 0.15],
          }}
          transition={{
            duration: 4 + (i % 3),
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/** Mock GEDCOM node fill */
const MOCK_TREE_NODE_COLOR = "#f7f3eb";

interface FeaturedTree {
  id: string | number;
  title: string;
  description?: string;
  owner?: string;
  owner_name?: string;
  isPublic: boolean;
  hasGedcom: boolean;
  data_format?: string;
  archiveSource?: string;
  documentCode?: string;
  createdAt?: string;
}

interface Person {
  id: string;
  names: { en: string; ar: string };
  gender: string;
  birthYear: string;
  details: string;
  color: string;
  children?: string[];
  spouse?: string;
  father?: string;
  mother?: string;
}

export default function Home() {
  const { theme } = useThemeStore();
  const { t } = useTranslation();
  const isDark = theme === "dark";
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const [viewTree, setViewTree] = useState<FeaturedTree | null>(null);
  const [viewPeople, setViewPeople] = useState<Person[]>([]);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewTreeError, setViewTreeError] = useState("");
  const [featuredTrees, setFeaturedTrees] = useState<FeaturedTree[]>([]);
  const [treesError, setTreesError] = useState("");
  const [treesLoading, setTreesLoading] = useState(true);

  const cardBg = isDark ? "bg-dark2" : "bg-white";
  const borderColor = isDark ? "border-[#24304A]" : "border-[#d8c7b0]";
  const metaPanel = isDark
    ? "bg-white/5 border-white/10"
    : "bg-primary-brown/5 border-[#d8c7b0]/60";
  const apiRoot = String(api.defaults.baseURL || "").replace(/\/api\/?$/, "");
  const downloadTreeUrl = (id: string | number) =>
    `${apiRoot}/api/trees/${id}/gedcom`;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setTreesLoading(true);
        setTreesError("");
        const { data } = await api.get("/trees");
        if (mounted && Array.isArray(data)) {
          const apiRootVal = getApiRoot();
          setFeaturedTrees(
            data
              .slice(0, 3)
              .map((t) =>
                normalizeTree(t, { apiRoot: apiRootVal, isPublic: true }),
              ),
          );
        }
      } catch (err: any) {
        if (mounted)
          setTreesError(
            err?.response?.data?.message || t("featured_trees_error"),
          );
      } finally {
        if (mounted) setTreesLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [t]);

  const handleViewTree = async (tree: FeaturedTree) => {
    setViewTree(tree);
    setViewPeople([]);
    setViewTreeError("");
    setViewLoading(true);

    try {
      if (String(tree.id).startsWith("mock-")) {
        const familyName = tree.title.split(" ").pop() || "Mock";
        const mockPeople: Person[] = [
          {
            id: "m1",
            names: { en: `Ahmed ${familyName}`, ar: `أحمد ${familyName}` },
            gender: "Male",
            birthYear: "1920",
            details: "The patriarch.",
            color: MOCK_TREE_NODE_COLOR,
            children: ["m3", "m4"],
            spouse: "m2",
          },
          {
            id: "m2",
            names: { en: `Fatima ${familyName}`, ar: `فاطمة ${familyName}` },
            gender: "Female",
            birthYear: "1925",
            details: "Matriarch.",
            color: MOCK_TREE_NODE_COLOR,
            children: ["m3", "m4"],
            spouse: "m1",
          },
          {
            id: "m3",
            names: { en: `Omar ${familyName}`, ar: `عمر ${familyName}` },
            gender: "Male",
            birthYear: "1950",
            details: "Eldest son.",
            color: MOCK_TREE_NODE_COLOR,
            father: "m1",
            mother: "m2",
            children: ["m5", "m6"],
            spouse: "s1",
          },
          {
            id: "m4",
            names: { en: `Layla ${familyName}`, ar: `ليلى ${familyName}` },
            gender: "Female",
            birthYear: "1955",
            details: "Daughter.",
            color: MOCK_TREE_NODE_COLOR,
            father: "m1",
            mother: "m2",
            children: ["m7"],
            spouse: "s2",
          },
          {
            id: "s1",
            names: { en: "Amina Al-Masri", ar: "آمنة المصري" },
            gender: "Female",
            birthYear: "1952",
            details: "Wife of Omar.",
            color: MOCK_TREE_NODE_COLOR,
            spouse: "m3",
            children: ["m5", "m6"],
          },
          {
            id: "s2",
            names: { en: "Youssef Al-Misri", ar: "يوسف المصري" },
            gender: "Male",
            birthYear: "1950",
            details: "Husband of Layla.",
            color: MOCK_TREE_NODE_COLOR,
            spouse: "m4",
            children: ["m7"],
          },
          {
            id: "m5",
            names: { en: `Khaled ${familyName}`, ar: `خالد ${familyName}` },
            gender: "Male",
            birthYear: "1980",
            details: "Grandson.",
            color: MOCK_TREE_NODE_COLOR,
            father: "m3",
            mother: "s1",
          },
          {
            id: "m6",
            names: { en: `Zainab ${familyName}`, ar: `زينب ${familyName}` },
            gender: "Female",
            birthYear: "1985",
            details: "Granddaughter.",
            color: MOCK_TREE_NODE_COLOR,
            father: "m3",
            mother: "s1",
          },
          {
            id: "m7",
            names: { en: `Hassan Al-Misri`, ar: `حسن المصري` },
            gender: "Male",
            birthYear: "1982",
            details: "Grandson.",
            color: MOCK_TREE_NODE_COLOR,
            father: "s2",
            mother: "m4",
          },
        ];
        setViewPeople(mockPeople);
        setViewLoading(false);
        return;
      }
      if (!tree.hasGedcom) {
        setViewTreeError(
          t("no_gedcom_available", "No GEDCOM file available yet."),
        );
        setViewLoading(false);
        return;
      }
      const { data } = await api.get(`/trees/${tree.id}/gedcom`, {
        responseType: "text",
      });
      const raw =
        typeof data === "string"
          ? data
          : data && (data as any).data != null
            ? String((data as any).data)
            : "";
      const isGedcomX = /^\s*(\{|\<\?xml)/.test(raw);
      const people = isGedcomX ? parseGedcomX(raw) : parseGedcom(raw);
      const list = Array.isArray(people) ? people : [];
      setViewPeople(list);
      if (!list.length)
        setViewTreeError(
          t("gedcom_no_people", "No individuals found in GEDCOM."),
        );
    } catch (err: any) {
      setViewPeople([]);
      setViewTreeError(
        err?.response?.data?.message || err?.message || t("tree_builder_error"),
      );
    } finally {
      setViewLoading(false);
    }
  };

  /* ================================================================== */
  /*  RENDER                                                            */
  /* ================================================================== */
  return (
    <div className="heritage-page-root">
      {/* ==================== HERO SECTION — Photo Background ==================== */}
      <section
        ref={heroRef}
        className="relative min-h-[92vh] flex items-center justify-center overflow-hidden rounded-2xl"
      >
        {/* Photo background with parallax */}
        <motion.div
          style={{ y: heroY }}
          className="absolute inset-0 -top-[10%] -bottom-[10%]"
        >
          <img
            src="/assets/roots-hero.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Dark overlay for readability */}
        <div
          className={`absolute inset-0 ${
            isDark
              ? "bg-gradient-to-b from-[#060e1c]/80 via-[#0d1b2a]/70 to-[#0a1520]/90"
              : "bg-gradient-to-b from-[#0d1b2a]/55 via-[#0d1b2a]/45 to-[#0d1b2a]/65"
          }`}
        />

        {/* Gold vignette edges */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.3) 100%)",
          }}
        />

        {/* Floating particles over the photo */}
        <FloatingParticles />

        {/* Decorative ankhs */}
        <AnkhSymbol
          className="absolute top-[15%] left-[8%] w-12 h-20 text-[#d4a843]"
          delay={0.5}
        />
        <AnkhSymbol
          className="absolute top-[25%] right-[10%] w-10 h-16 text-[#d4a843]"
          delay={1}
        />
        <AnkhSymbol
          className="absolute bottom-[30%] left-[15%] w-8 h-14 text-[#d4a843]"
          delay={1.5}
        />

        {/* Content */}
        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 text-center px-6 max-w-5xl mx-auto space-y-8"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease: EGYPT_EASE.pharaoh }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[#d4a843]/40 bg-black/30 backdrop-blur-sm"
          >
            <EyeOfHorus size={18} color={EGYPT_COLORS.gold} />
            <span className="text-sm font-medium text-[#d4a843]">
              {t("home_badge", "Preserving the Memory of Roots Egypt")}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ color: "#ffffff" }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
          >
            {t("home_hero_title", "Discover Your Egyptian Heritage")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]"
          >
            {t(
              "home_hero_subtitle",
              "Discover the stories, photographs, records, and family connections that define Roots Egypt. Explore a modern archive dedicated to Egyptian heritage, memory, and belonging.",
            )}
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <NavLink
              to="/library"
              className="px-8 py-4 rounded-xl font-semibold text-[#0a1220] bg-gradient-to-r from-[#d4a843] to-[#c45c3e] shadow-lg shadow-[#d4a843]/30 hover:shadow-xl hover:shadow-[#d4a843]/40 transition-all hover:-translate-y-0.5 flex items-center gap-2 backdrop-blur-sm"
            >
              {t("start_exploring", "Start Exploring")}
              <ArrowRight className="w-5 h-5" />
            </NavLink>
            <NavLink
              to="/genealogy-gallery"
              className="px-8 py-4 rounded-xl font-semibold border-2 border-[#d4a843]/50 text-[#d4a843] hover:bg-[#d4a843]/15 transition-all hover:-translate-y-0.5 flex items-center gap-2 backdrop-blur-sm bg-black/20"
            >
              <TreePine className="w-5 h-5" />
              {t("browse_trees", "Browse Family Trees")}
            </NavLink>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-white/25 flex items-start justify-center pt-2"
          >
            <div className="w-1.5 h-3 rounded-full bg-white/40" />
          </motion.div>
        </motion.div>

        {/* Nile wave at bottom of hero */}
        <NileWave className="absolute bottom-0 left-0 right-0 z-[5]" />
      </section>

      {/* ==================== STATS SECTION ==================== */}
      <ScrollReveal>
        <section className="px-4 sm:px-6 lg:px-10 xl:px-14 py-8 md:py-10">
          <div
            className={`w-full max-w-[var(--content-max,1600px)] mx-auto py-16 rounded-[2rem] border overflow-hidden ${isDark ? "bg-[#0d1b2a] border-[#d4a843]/15" : "bg-[#f5f1e8] border-[#d8c7b0]/45"}`}
          >
            <div className="w-full px-6 md:px-8 lg:px-10">
              <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                {[
                  {
                    value: 5000,
                    suffix: "+",
                    label: t("home_stat_years", "Years of History"),
                    icon: Scroll,
                    color: "text-[#d4a843]",
                  },
                  {
                    value: 50,
                    suffix: "+",
                    label: t("home_stat_archives", "Archive Sources"),
                    icon: Archive,
                    color: "text-teal",
                  },
                  {
                    value: 27,
                    suffix: "",
                    label: t("home_stat_regions", "Egyptian Governorates"),
                    icon: Map,
                    color: "text-terracotta",
                  },
                  {
                    value: 10,
                    suffix: "+",
                    label: t("home_stat_periods", "Historical Periods"),
                    icon: Layers,
                    color: "text-[#d4a843]",
                  },
                ].map((stat, i) => (
                  <StaggerItem key={i}>
                    <motion.div
                      whileHover={{ y: -4, scale: 1.02 }}
                      className={`text-center p-6 rounded-2xl border ${
                        isDark
                          ? "bg-white/[0.03] border-white/[0.06]"
                          : "bg-white/60 border-[#d8c7b0]/40"
                      } backdrop-blur-sm`}
                    >
                      <stat.icon
                        className={`w-7 h-7 mx-auto mb-3 ${stat.color}`}
                      />
                      <div className="text-3xl sm:text-4xl font-bold text-[#d4a843]">
                        <CountUp end={stat.value} duration={2.5} />
                        {stat.suffix}
                      </div>
                      <p className="text-xs sm:text-sm opacity-60 mt-2 font-medium">
                        {stat.label}
                      </p>
                    </motion.div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ==================== HOW IT WORKS ==================== */}
      <ScrollReveal>
        <section className="roots-section roots-section-alt">
          <div className="max-w-6xl mx-auto text-center space-y-10">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-teal font-semibold mb-3">
                {t("home_how_label", "How It Works")}
              </p>
              <h2 className="roots-heading">
                {t("home_how_title", "Your Heritage Journey in Three Steps")}
              </h2>
            </div>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  icon: Search,
                  color: "text-teal",
                  bg: isDark ? "bg-teal/10" : "bg-teal/5",
                  title: t("home_how_step1_title", "Research & Discover"),
                  desc: t(
                    "home_how_step1_desc",
                    "Search through Ottoman court records, Coptic church registers, civil archives, and regional tribal documents to uncover your family's paper trail across Egypt.",
                  ),
                },
                {
                  step: "02",
                  icon: TreePine,
                  color: "text-[#d4a843]",
                  bg: isDark ? "bg-[#d4a843]/10" : "bg-[#d4a843]/5",
                  title: t("home_how_step2_title", "Build Your Tree"),
                  desc: t(
                    "home_how_step2_desc",
                    "Connect parents, grandparents, and distant ancestors. Upload GEDCOM files, attach documents, and visualize your lineage interactively with our heritage-focused tree builder.",
                  ),
                },
                {
                  step: "03",
                  icon: Heart,
                  color: "text-terracotta",
                  bg: isDark ? "bg-terracotta/10" : "bg-terracotta/5",
                  title: t("home_how_step3_title", "Preserve & Share"),
                  desc: t(
                    "home_how_step3_desc",
                    "Record oral histories, digitize old photographs, and share your family's story with relatives in Egypt and the diaspora. Keep your heritage alive for future generations.",
                  ),
                },
              ].map((item, i) => (
                <StaggerItem key={i}>
                  <motion.div
                    whileHover={{ y: -6 }}
                    className={`roots-card text-center p-8 space-y-4 relative overflow-hidden`}
                  >
                    <span
                      className={`absolute top-3 right-4 text-5xl font-black opacity-[0.06] ${item.color}`}
                    >
                      {item.step}
                    </span>
                    <div
                      className={`w-16 h-16 rounded-2xl ${item.bg} flex items-center justify-center mx-auto`}
                    >
                      <item.icon className={`w-8 h-8 ${item.color}`} />
                    </div>
                    <h3 className="text-xl font-bold">{item.title}</h3>
                    <p className="opacity-80 text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      </ScrollReveal>

      {/* ==================== EXPLORE PLATFORM ==================== */}
      <ScrollReveal>
        <section className="roots-section">
          <div className="max-w-6xl mx-auto text-center space-y-10">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#d4a843] font-semibold mb-3">
                {t("home_explore_label", "Explore the Platform")}
              </p>
              <h2 className="roots-heading">
                {t(
                  "home_explore_title",
                  "Everything You Need to Trace Your Roots",
                )}
              </h2>
              <p className="max-w-3xl mx-auto text-lg opacity-80">
                {t(
                  "home_explore_desc",
                  "From family trees to audio recordings of elders' stories — a complete toolkit for Egyptian genealogy and cultural preservation.",
                )}
              </p>
            </div>

            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
              {[
                {
                  icon: TreePine,
                  to: "/genealogy-gallery",
                  color: "text-teal",
                  accent: isDark
                    ? "border-teal/20 hover:border-teal/50"
                    : "border-teal/15 hover:border-teal/40",
                  title: t("home_card_trees_title", "Family Trees"),
                  desc: t(
                    "home_card_trees_desc",
                    "Interactive multi-generational trees with GEDCOM import/export. Supports Arabic, Coptic, and Ottoman naming.",
                  ),
                },
                {
                  icon: Image,
                  to: "/gallery",
                  color: "text-terracotta",
                  accent: isDark
                    ? "border-terracotta/20 hover:border-terracotta/50"
                    : "border-terracotta/15 hover:border-terracotta/40",
                  title: t("home_card_gallery_title", "Photo Gallery"),
                  desc: t(
                    "home_card_gallery_desc",
                    "Browse archival photographs, family portraits, historical documents, and maps in a Pinterest-style masonry layout.",
                  ),
                },
                {
                  icon: BookOpen,
                  to: "/library",
                  color: "text-[#d4a843]",
                  accent: isDark
                    ? "border-[#d4a843]/20 hover:border-[#d4a843]/50"
                    : "border-[#d4a843]/15 hover:border-[#d4a843]/40",
                  title: t("home_card_library_title", "Library & Documents"),
                  desc: t(
                    "home_card_library_desc",
                    "Digitized books, manuscripts, civil registers, nasab texts, and court documents spanning centuries.",
                  ),
                },
                {
                  icon: Headphones,
                  to: "/audio",
                  color: "text-teal",
                  accent: isDark
                    ? "border-teal/20 hover:border-teal/50"
                    : "border-teal/15 hover:border-teal/40",
                  title: t("home_card_audio_title", "Oral Histories"),
                  desc: t(
                    "home_card_audio_desc",
                    "Record and listen to interviews, poetry recitations, and family stories. Spotify-inspired audio player with playlists.",
                  ),
                },
                {
                  icon: Newspaper,
                  to: "/articles",
                  color: "text-terracotta",
                  accent: isDark
                    ? "border-terracotta/20 hover:border-terracotta/50"
                    : "border-terracotta/15 hover:border-terracotta/40",
                  title: t("home_card_articles_title", "Articles & Stories"),
                  desc: t(
                    "home_card_articles_desc",
                    "Share research findings, publish family narratives, and engage with the community through likes, comments, and discussions.",
                  ),
                },
                {
                  icon: Archive,
                  to: "/sourcesandarchives",
                  color: "text-[#d4a843]",
                  accent: isDark
                    ? "border-[#d4a843]/20 hover:border-[#d4a843]/50"
                    : "border-[#d4a843]/15 hover:border-[#d4a843]/40",
                  title: t("home_card_archives_title", "Sources & Archives"),
                  desc: t(
                    "home_card_archives_desc",
                    "Navigate Egypt's major archival institutions: Dar al-Wathaeq, Sharia courts, Awqaf registries, colonial census, and more.",
                  ),
                },
              ].map((item, i) => (
                <StaggerItem key={i}>
                  <NavLink to={item.to}>
                    <motion.div
                      whileHover={{ y: -4, scale: 1.01 }}
                      className={`${cardBg} border ${item.accent} rounded-2xl p-6 text-left space-y-3 transition-all shadow-sm hover:shadow-lg group cursor-pointer h-full flex flex-col`}
                    >
                      <div className="flex items-center justify-between">
                        <item.icon className={`w-8 h-8 ${item.color}`} />
                        <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-60 transition-opacity -translate-x-2 group-hover:translate-x-0 transition-transform" />
                      </div>
                      <h3 className="text-lg font-bold leading-snug min-h-[3.5rem]">
                        {item.title}
                      </h3>
                      <p className="text-sm opacity-70 leading-relaxed line-clamp-4">
                        {item.desc}
                      </p>
                    </motion.div>
                  </NavLink>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      </ScrollReveal>

      {/* ==================== FEATURED TREES ==================== */}
      <ScrollReveal>
        <section className="roots-section roots-section-alt">
          <div className="w-full max-w-7xl mx-auto space-y-10">
            <div className="text-center">
              <p className="text-sm uppercase tracking-[0.3em] text-teal font-semibold mb-3">
                {t("home_featured_label", "Featured")}
              </p>
              <h2 className="roots-heading">
                {t("family_tree_builder", "Family Tree Builder")}
              </h2>
              <p className="max-w-3xl mx-auto text-base sm:text-lg opacity-90">
                {t("home_family_tree_intro")}
              </p>
            </div>

            {treesLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`${cardBg} border ${borderColor} rounded-2xl shadow-xl overflow-hidden animate-pulse`}
                  >
                    <div className="p-5 border-b border-white/5 space-y-3">
                      <div className="h-3 w-1/3 bg-primary-brown/20 rounded" />
                      <div className="h-6 w-2/3 bg-primary-brown/30 rounded" />
                      <div className="h-3 w-1/4 bg-primary-brown/20 rounded" />
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="h-4 w-full bg-primary-brown/10 rounded" />
                      <div className="h-4 w-3/4 bg-primary-brown/10 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {treesError && !treesLoading && (
              <div className="text-center py-8 text-amber-600 dark:text-amber-400 font-medium">
                {treesError}
              </div>
            )}

            {featuredTrees.length > 0 && !treesLoading && (
              <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredTrees.map((tree) => {
                  const canDownload =
                    Number.isFinite(Number(tree.id)) && tree.hasGedcom;
                  return (
                    <StaggerItem key={tree.id}>
                      <motion.div
                        whileHover={{ y: -4 }}
                        className={`${cardBg} border ${borderColor} rounded-2xl shadow-xl overflow-hidden transition-all hover:shadow-2xl hover:border-teal/35`}
                      >
                        <div className="p-5 border-b border-white/5 bg-gradient-to-r from-primary-brown/10 via-teal/5 to-terracotta/5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] uppercase tracking-[0.3em] text-primary-brown opacity-70">
                                {t("trees", "Family Trees")}
                              </p>
                              <h3 className="text-xl font-bold truncate">
                                {tree.title}
                              </h3>
                              <p className="text-sm opacity-70 flex items-center gap-1">
                                <UserCircle2 className="w-3 h-3" />
                                {tree.owner ||
                                  tree.owner_name ||
                                  t("admin", "Admin")}
                              </p>
                            </div>
                            <span
                              className={`text-[10px] uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${borderColor}`}
                            >
                              {tree.isPublic
                                ? t("public", "Public")
                                : t("private", "Private")}
                            </span>
                          </div>
                        </div>

                        <div className="p-5 space-y-4">
                          <p className="text-sm opacity-80 line-clamp-3">
                            {tree.description || t("tree_card_default_desc")}
                          </p>
                          <div className="grid sm:grid-cols-2 gap-3">
                            <div
                              className={`${metaPanel} border rounded-xl p-3 flex items-start gap-2`}
                            >
                              <Archive className="w-4 h-4 text-terracotta mt-0.5" />
                              <div>
                                <p className="text-[10px] uppercase opacity-60">
                                  {t("archive_source", "Archive Source")}
                                </p>
                                <p className="text-xs font-semibold break-words">
                                  {tree.archiveSource ||
                                    t("not_provided", "Not provided")}
                                </p>
                              </div>
                            </div>
                            <div
                              className={`${metaPanel} border rounded-xl p-3 flex items-start gap-2`}
                            >
                              <FileText className="w-4 h-4 text-teal mt-0.5" />
                              <div>
                                <p className="text-[10px] uppercase opacity-60">
                                  {t("document_code", "Document Code")}
                                </p>
                                <p className="text-xs font-semibold font-mono break-words">
                                  {tree.documentCode ||
                                    t("not_provided", "Not provided")}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleViewTree(tree)}
                              className="interactive-btn btn-neu px-4 py-2.5 inline-flex items-center gap-2 text-sm"
                            >
                              <Eye className="w-4 h-4" />
                              {t("view_tree", "View Tree")}
                            </motion.button>
                            {canDownload && (
                              <a
                                href={downloadTreeUrl(tree.id)}
                                className="interactive-btn btn-neu btn-neu--primary px-4 py-2.5 inline-flex items-center gap-2 text-sm"
                                target="_blank"
                                rel="noreferrer"
                              >
                                <Download className="w-4 h-4" />
                                {t("download", "Download")}
                              </a>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>
            )}
          </div>
        </section>
      </ScrollReveal>

      {/* ==================== EGYPTIAN TIMELINE — DETAILED ERAS ==================== */}
      <ScrollReveal>
        <section className="roots-section">
          <div className="max-w-6xl mx-auto space-y-10 text-center">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-terracotta font-semibold mb-3">
                {t("home_timeline_label", "Through the Ages")}
              </p>
              <h2 className="roots-heading">
                {t(
                  "home_timeline_title",
                  "Records Spanning Egypt's Rich History",
                )}
              </h2>
            </div>

            {/* Main horizontal timeline line */}
            <div className="relative">
              <div
                className={`hidden lg:block absolute top-6 left-8 right-8 h-0.5 ${isDark ? "bg-gradient-to-r from-transparent via-[#d4a843]/30 to-transparent" : "bg-gradient-to-r from-transparent via-[#c45c3e]/20 to-transparent"}`}
              />

              <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {[
                  {
                    era: t("home_era_pharaonic", "Pharaonic"),
                    sub: t(
                      "home_era_pharaonic_sub",
                      "Old · Middle · New Kingdoms",
                    ),
                    date: "3100–332 BC",
                    color: "text-[#d4a843]",
                    accent: isDark
                      ? "border-[#d4a843]/20"
                      : "border-[#d4a843]/25",
                    icon: Scroll,
                  },
                  {
                    era: t("home_era_ptolemaic", "Ptolemaic & Roman"),
                    sub: t(
                      "home_era_ptolemaic_sub",
                      "Greek rule · Roman province · Coptic era",
                    ),
                    date: "332 BC–641 AD",
                    color: "text-teal",
                    accent: isDark ? "border-teal/20" : "border-teal/25",
                    icon: Shield,
                  },
                  {
                    era: t("home_era_rashidun", "Early Islamic"),
                    sub: t(
                      "home_era_rashidun_sub",
                      "Rashidun · Umayyad · Abbasid",
                    ),
                    date: "641–969",
                    color: "text-terracotta",
                    accent: isDark
                      ? "border-terracotta/20"
                      : "border-terracotta/25",
                    icon: Star,
                  },
                  {
                    era: t("home_era_fatimid", "Fatimid & Ayyubid"),
                    sub: t(
                      "home_era_fatimid_sub",
                      "Fatimid caliphate · Saladin's dynasty",
                    ),
                    date: "969–1250",
                    color: "text-[#d4a843]",
                    accent: isDark
                      ? "border-[#d4a843]/20"
                      : "border-[#d4a843]/25",
                    icon: Sparkles,
                  },
                  {
                    era: t("home_era_mamluk", "Mamluk"),
                    sub: t("home_era_mamluk_sub", "Bahri · Burji sultanates"),
                    date: "1250–1517",
                    color: "text-teal",
                    accent: isDark ? "border-teal/20" : "border-teal/25",
                    icon: Shield,
                  },
                  {
                    era: t("home_era_ottoman", "Ottoman"),
                    sub: t(
                      "home_era_ottoman_sub",
                      "Eyalet · Khedivate of Egypt",
                    ),
                    date: "1517–1882",
                    color: "text-terracotta",
                    accent: isDark
                      ? "border-terracotta/20"
                      : "border-terracotta/25",
                    icon: Map,
                  },
                  {
                    era: t("home_era_colonial", "British Period"),
                    sub: t(
                      "home_era_colonial_sub",
                      "Veiled protectorate · Kingdom of Egypt",
                    ),
                    date: "1882–1952",
                    color: "text-[#d4a843]",
                    accent: isDark
                      ? "border-[#d4a843]/20"
                      : "border-[#d4a843]/25",
                    icon: Compass,
                  },
                  {
                    era: t("home_era_nasserist", "Nasserist"),
                    sub: t(
                      "home_era_nasserist_sub",
                      "Republic · United Arab Republic",
                    ),
                    date: "1952–1970",
                    color: "text-teal",
                    accent: isDark ? "border-teal/20" : "border-teal/25",
                    icon: Feather,
                  },
                  {
                    era: t("home_era_sadat_mubarak", "Sadat & Mubarak"),
                    sub: t(
                      "home_era_sadat_mubarak_sub",
                      "Open-door policy · Modern state",
                    ),
                    date: "1970–2011",
                    color: "text-terracotta",
                    accent: isDark
                      ? "border-terracotta/20"
                      : "border-terracotta/25",
                    icon: Layers,
                  },
                  {
                    era: t("home_era_contemporary", "Contemporary"),
                    sub: t(
                      "home_era_contemporary_sub",
                      "Revolution · New Republic",
                    ),
                    date: "2011–Present",
                    color: "text-[#d4a843]",
                    accent: isDark
                      ? "border-[#d4a843]/20"
                      : "border-[#d4a843]/25",
                    icon: Star,
                  },
                ].map((item, i) => (
                  <StaggerItem key={i}>
                    <motion.div
                      whileHover={{ y: -5, scale: 1.03 }}
                      className={`relative ${cardBg} border ${item.accent} rounded-xl p-4 text-center space-y-2 shadow-sm hover:shadow-lg transition-shadow`}
                    >
                      {/* Timeline dot */}
                      <div
                        className={`hidden lg:block absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 ${
                          isDark
                            ? "bg-[#0d1b2a] border-[#d4a843]/50"
                            : "bg-[#f5f1e8] border-[#c45c3e]/40"
                        }`}
                      />
                      <item.icon className={`w-6 h-6 mx-auto ${item.color}`} />
                      <p className="font-bold text-sm leading-tight">
                        {item.era}
                      </p>
                      <p className="text-[11px] opacity-50 leading-snug">
                        {item.sub}
                      </p>
                      <p className="text-xs opacity-40 font-mono">
                        {item.date}
                      </p>
                    </motion.div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>

            <NavLink
              to="/periods"
              className="inline-flex items-center gap-2 text-teal font-semibold hover:underline"
            >
              {t("home_explore_periods", "Explore All Periods")}
              <ArrowRight className="w-4 h-4" />
            </NavLink>
          </div>
        </section>
      </ScrollReveal>

      {/* ==================== ANCESTRAL STORIES ==================== */}
      <ScrollReveal>
        <section className="roots-section roots-section-alt">
          <div className="max-w-6xl mx-auto space-y-10 text-center">
            <div>
              <h2 className="roots-heading">
                {t("ancestral_stories", "Ancestral Stories")}
              </h2>
              <p className="max-w-3xl mx-auto text-lg opacity-90">
                {t("home_ancestral_intro")}
              </p>
            </div>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Feather,
                  color: "text-teal",
                  title: t("home_ancestral_oral_title"),
                  desc: t("home_ancestral_oral_desc"),
                },
                {
                  icon: BookOpen,
                  color: "text-[#d4a843]",
                  title: t("home_ancestral_traditions_title"),
                  desc: t("home_ancestral_traditions_desc"),
                },
                {
                  icon: Users,
                  color: "text-terracotta",
                  title: t("home_ancestral_branches_title"),
                  desc: t("home_ancestral_branches_desc"),
                },
              ].map((item, i) => (
                <StaggerItem key={i}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="roots-card text-center"
                  >
                    <item.icon
                      className={`w-12 h-12 mx-auto mb-4 ${item.color}`}
                    />
                    <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                    <p className="opacity-90">{item.desc}</p>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      </ScrollReveal>

      {/* ==================== LIBRARY TAGS ==================== */}
      <ScrollReveal>
        <section className="roots-section">
          <div className="max-w-6xl mx-auto space-y-10 text-center">
            <div>
              <h2 className="roots-heading">
                {t("library_title", "Egyptian Genealogy Library")}
              </h2>
              <p className="max-w-3xl mx-auto text-lg opacity-90">
                {t("home_library_intro")}
              </p>
            </div>

            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                {
                  tag: t("home_library_tag_manuscripts"),
                  icon: Scroll,
                  color: "text-[#d4a843]",
                },
                {
                  tag: t("home_library_tag_civil"),
                  icon: FileText,
                  color: "text-teal",
                },
                {
                  tag: t("home_library_tag_nasab"),
                  icon: Users,
                  color: "text-terracotta",
                },
                {
                  tag: t("home_library_tag_ottoman"),
                  icon: Shield,
                  color: "text-[#d4a843]",
                },
                {
                  tag: t("home_library_tag_coptic"),
                  icon: BookOpen,
                  color: "text-teal",
                },
                {
                  tag: t("home_library_tag_maps"),
                  icon: Map,
                  color: "text-terracotta",
                },
              ].map((item, i) => (
                <StaggerItem key={i}>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    className="roots-card flex items-center gap-3 p-5"
                  >
                    <item.icon className={`w-6 h-6 shrink-0 ${item.color}`} />
                    <p className="font-bold text-sm">{item.tag}</p>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>

            <NavLink
              to="/library"
              className="inline-flex items-center gap-2 text-teal font-semibold hover:underline"
            >
              {t("home_visit_library", "Visit the Library")}
              <ArrowRight className="w-4 h-4" />
            </NavLink>
          </div>
        </section>
      </ScrollReveal>

      {/* ==================== COMMUNITY CTA ==================== */}
      <ScrollReveal>
        <section className="roots-section roots-section-alt">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className={`relative overflow-hidden rounded-3xl p-10 sm:p-14 ${
                isDark
                  ? "bg-gradient-to-br from-[#0d1b2a] to-[#1a2332] border border-[#d4a843]/20"
                  : "bg-gradient-to-br from-[#f5f1e8] to-[#e8dcc8] border border-[#d4a843]/30"
              }`}
            >
              {/* Gold decorative corners */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[#d4a843]/30 rounded-tl-3xl" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-[#d4a843]/30 rounded-br-3xl" />

              <Sparkles className="w-8 h-8 text-[#d4a843] mx-auto mb-4" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                {t("join_our_community", "Join Our Community")}
              </h2>
              <p className="text-lg opacity-80 max-w-2xl mx-auto mb-8">
                {t("join_community_desc")}
              </p>
              <NavLink
                to="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-[#d4a843] to-[#8b6914] shadow-lg shadow-[#d4a843]/25 hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                {t("join_now", "Join Now")}
                <ArrowRight className="w-5 h-5" />
              </NavLink>
            </motion.div>
          </div>
        </section>
      </ScrollReveal>

      {/* TREE VIEWER MODAL */}
      <AnimatePresence>
        {viewTree && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-dark2 w-full max-w-[90vw] h-[90vh] rounded-lg shadow-2xl border border-dark-beige flex flex-col overflow-hidden relative"
            >
              <div className="p-4 border-b border-teal/25 flex items-center justify-between bg-paper-color dark:bg-leather-brown">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2 text-primary-brown dark:text-teal">
                    <Users className="w-5 h-5" />
                    {viewTree.title}
                  </h2>
                  <p className="text-xs opacity-60">
                    {t("viewing_mode", "Viewing Mode - Read Only")}
                  </p>
                </div>
                <button
                  onClick={() => setViewTree(null)}
                  className="interactive-btn btn-neu p-2.5 rounded-full shrink-0"
                  aria-label={t("close", "Close")}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 relative bg-light-beige dark:bg-dark-coffee overflow-hidden">
                {viewLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal" />
                  </div>
                ) : viewTreeError ? (
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    <div className="rounded-lg border border-dark-beige bg-white/90 dark:bg-dark2 dark:border-brand px-6 py-5 text-sm text-primary-brown dark:text-papyrus shadow-xl text-center max-w-md">
                      <div className="font-semibold">
                        {t(
                          "tree_builder_error",
                          "Tree builder failed to load.",
                        )}
                      </div>
                      <p className="mt-2 opacity-80">{viewTreeError}</p>
                    </div>
                  </div>
                ) : (
                  <ErrorBoundary
                    fallback={({ error, reset }) => (
                      <div className="absolute inset-0 flex items-center justify-center p-6">
                        <div className="rounded-lg border border-dark-beige bg-white/90 px-6 py-5 text-sm text-primary-brown shadow-xl">
                          <div className="font-semibold">
                            {t("tree_builder_error")}
                          </div>
                          <div className="opacity-70">
                            {error?.message || t("tree_builder_try_again")}
                          </div>
                          <button
                            onClick={reset}
                            className="interactive-btn btn-neu btn-neu--primary mt-3 px-4 py-2 text-xs font-semibold uppercase tracking-wide"
                          >
                            {t("retry", "Retry")}
                          </button>
                        </div>
                      </div>
                    )}
                  >
                    <TreesBuilder
                      people={viewPeople as never}
                      setPeople={setViewPeople}
                      readOnly={true}
                      onAutoSave={undefined}
                    />
                  </ErrorBoundary>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
