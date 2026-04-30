import { useEffect, useMemo, useState, useCallback } from "react";
import { useThemeStore } from "../store/theme";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scroll,
  Landmark,
  Building,
  Map,
  BookOpen,
  FileText,
  Archive,
  ShieldCheck,
  Library,
  Mic,
  Globe,
  Lock,
  FileSearch,
  AlertTriangle,
  CheckCircle2,
  Scale,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Menu,
  Search,
  Filter,
  Star,
  Hash,
  ScrollText,
  Church,
} from "lucide-react";
import { useTranslation } from "../context/TranslationContext";
import RootsPageShell from "../components/RootsPageShell";
import ScrollReveal from "../components/motion/ScrollReveal";
import { StaggerContainer, StaggerItem } from "../components/motion/StaggerChildren";
import CountUp from "../components/motion/CountUp";

/* ------------------------------------------------------------------ */
/*  Archive filter types                                               */
/* ------------------------------------------------------------------ */
type ArchiveFilterType = "all" | "ottoman" | "colonial" | "religious" | "modern";

/* ------------------------------------------------------------------ */
/*  Section IDs — expanded with Jewish sources                         */
/* ------------------------------------------------------------------ */
const SECTION_IDS = [
  "quick-stats",
  "official-archives",
  "international-archives",
  "jewish-archives",
  "archive-types",
  "primary-sources",
  "secondary-sources",
  "access-guidelines",
  "reliability",
  "how-to-access",
];

export default function SourcesAndArchives() {
  const { theme } = useThemeStore();
  const { t } = useTranslation();
  const [navOpen, setNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<ArchiveFilterType>("all");
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const isDark = theme === "dark";

  /* ------------------------------------------------------------------ */
  /*  Toggle expanded card                                               */
  /* ------------------------------------------------------------------ */
  const toggleCard = useCallback((key: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  /* ------------------------------------------------------------------ */
  /*  Archive items with filter tags                                     */
  /* ------------------------------------------------------------------ */
  const archiveItems = useMemo(() => [
    { icon: Scroll, title: t("archives_ottoman_title", "Ottoman & Mamluk Archives"), accent: "#0d9488", filterTag: "ottoman" as ArchiveFilterType, description: t("archives_ottoman_desc", "Registers from Egyptian Sharia courts, Ottoman administration of Egypt, and Mamluk-era records preserve centuries of lineage documentation."), bullets: [t("archives_ottoman_b1", "Sharia court registers (marriage, inheritance, guardianship)"), t("archives_ottoman_b2", "Awqaf & religious endowment ledgers"), t("archives_ottoman_b3", "Ottoman taxation and census records for Egypt")] },
    { icon: Landmark, title: t("archives_colonial_title", "British Colonial Archives"), accent: "#0c4a6e", filterTag: "colonial" as ArchiveFilterType, description: t("archives_colonial_desc", "British administration records for Egypt document civil status, land ownership, and population during the colonial period."), bullets: [t("archives_colonial_b1", "Census records (1882 onward)"), t("archives_colonial_b2", "Colonial administrative & military rolls"), t("archives_colonial_b3", "Land surveys and irrigation maps")] },
    { icon: Building, title: t("archives_apc_title", "Modern Civil Registry"), accent: "#556b2f", filterTag: "modern" as ArchiveFilterType, description: t("archives_apc_desc", "Modern Egyptian civil status offices hold contemporary records that bridge families into the present."), bullets: [t("archives_apc_b1", "Birth/marriage/death registers"), t("archives_apc_b2", "National ID & family documents"), t("archives_apc_b3", "Modern migration documentation")] },
    { icon: Map, title: t("archives_maps_title", "Maps & Territorial Archives"), accent: "#c45c3e", filterTag: "colonial" as ArchiveFilterType, description: t("archives_maps_desc", "Historical cartography traces family territories, agricultural lands, and migration routes across Egypt."), bullets: [t("archives_maps_b1", "Nile Valley survey maps"), t("archives_maps_b2", "Ottoman land records for Egypt"), t("archives_maps_b3", "British cadastral surveys")] },
    { icon: BookOpen, title: t("archives_manuscripts_title", "Manuscripts & Nasab Texts"), accent: "#0c4a6e", filterTag: "ottoman" as ArchiveFilterType, description: t("archives_manuscripts_desc", "Genealogical manuscripts, scholarly lineage records, and tribal chronicles provide narrative context for Egyptian families."), bullets: [t("archives_manuscripts_b1", "Egyptian tribal nasab manuscripts"), t("archives_manuscripts_b2", "Al-Azhar scholarly lineage records"), t("archives_manuscripts_b3", "Regional chronicle compilations")] },
    { icon: FileText, title: t("archives_private_title", "Private Collections"), accent: "#556b2f", filterTag: "modern" as ArchiveFilterType, description: t("archives_private_desc", "Family-held deeds, letters, and oral histories often fill missing branches in public records."), bullets: [t("archives_private_b1", "Property deeds and waqf deeds"), t("archives_private_b2", "Family correspondences"), t("archives_private_b3", "Oral testimonies and photos")] },
  ], [t]);

  /* ------------------------------------------------------------------ */
  /*  Jewish genealogical sources                                        */
  /* ------------------------------------------------------------------ */
  const jewishSources = useMemo(() => [
    {
      key: "cairo_geniza",
      icon: ScrollText,
      accent: "#7c3aed",
      title: t("jewish_geniza_title", "Cairo Geniza Documents"),
      description: t("jewish_geniza_desc", "The Cairo Geniza is one of the most important collections of medieval Jewish manuscripts in the world, discovered in the storeroom of the Ben Ezra Synagogue in Old Cairo. Over 400,000 manuscript fragments spanning nearly a thousand years (870-1880 CE) document daily life, commerce, family relationships, and communal affairs of Egyptian Jewish communities."),
      bullets: [
        t("jewish_geniza_b1", "Marriage contracts (ketubot), divorce documents, and family correspondence"),
        t("jewish_geniza_b2", "Commercial records and letters revealing family trade networks across the Mediterranean"),
        t("jewish_geniza_b3", "Community leadership records and rabbinic court (bet din) proceedings"),
        t("jewish_geniza_b4", "Personal letters documenting migrations, family ties, and social networks"),
      ],
      links: [
        { label: t("jewish_geniza_link1", "Cambridge Digital Library -- Geniza Collection"), url: "https://cudl.lib.cam.ac.uk/collections/genizah" },
        { label: t("jewish_geniza_link2", "Princeton Geniza Lab"), url: "https://geniza.princeton.edu/" },
        { label: t("jewish_geniza_link3", "Friedberg Genizah Project"), url: "https://fgp.genizah.org/" },
      ],
    },
    {
      key: "ben_ezra",
      icon: Church,
      accent: "#a16207",
      title: t("jewish_ben_ezra_title", "Ben Ezra Synagogue Archives"),
      description: t("jewish_ben_ezra_desc", "The Ben Ezra Synagogue in Fustat (Old Cairo), one of the oldest synagogues in Egypt, served as the repository for the famous Cairo Geniza. Beyond the Geniza itself, the synagogue community maintained extensive communal records documenting births, marriages, deaths, and community governance of Egyptian Jews from the medieval period through the modern era."),
      bullets: [
        t("jewish_ben_ezra_b1", "Synagogue communal registers and membership records"),
        t("jewish_ben_ezra_b2", "Burial society (Chevra Kadisha) records from Cairo Jewish cemeteries"),
        t("jewish_ben_ezra_b3", "Charitable foundation records documenting communal support networks"),
        t("jewish_ben_ezra_b4", "Correspondence between Egyptian and Palestinian Jewish communities"),
      ],
      links: [
        { label: t("jewish_ben_ezra_link1", "Jewish Virtual Library -- Ben Ezra Synagogue"), url: "https://www.jewishvirtuallibrary.org/ben-ezra-synagogue" },
      ],
    },
    {
      key: "jewish_community",
      icon: Library,
      accent: "#0369a1",
      title: t("jewish_community_title", "Jewish Community Records in Egypt"),
      description: t("jewish_community_desc", "Egypt's Jewish communities -- including Rabbanite, Karaite, and Sephardic congregations -- maintained detailed communal records across Cairo, Alexandria, and other cities. These records are invaluable for tracing Jewish Egyptian genealogy from the medieval period through the 20th-century diaspora following the 1956 Suez Crisis."),
      bullets: [
        t("jewish_community_b1", "Civil status records from the Cairo and Alexandria Jewish communal councils"),
        t("jewish_community_b2", "Karaite community archives preserving a distinct Egyptian Jewish heritage"),
        t("jewish_community_b3", "Records from the Sephardic Chief Rabbinate of Egypt"),
        t("jewish_community_b4", "Immigration and emigration records documenting the post-1948 and post-1956 Jewish exodus"),
        t("jewish_community_b5", "School enrollment records from Jewish schools (Alliance Israelite, Lycee Francais)"),
      ],
      links: [
        { label: t("jewish_community_link1", "The Association of Jews from Egypt"), url: "https://www.jewsofegypt.org/" },
        { label: t("jewish_community_link2", "JIMENA -- Jews Indigenous to the Middle East and North Africa"), url: "https://www.jimena.org/" },
        { label: t("jewish_community_link3", "Historical Society of Jews from Egypt"), url: "https://www.hsje.org/" },
      ],
    },
  ], [t]);

  /* ------------------------------------------------------------------ */
  /*  Filter + search logic                                              */
  /* ------------------------------------------------------------------ */
  const filteredArchiveItems = useMemo(() => {
    let items = archiveItems;
    if (activeFilter !== "all") {
      items = items.filter((item) => item.filterTag === activeFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.bullets.some((b) => b.toLowerCase().includes(q))
      );
    }
    return items;
  }, [archiveItems, activeFilter, searchQuery]);

  const filterOptions: { value: ArchiveFilterType; label: string; color: string }[] = useMemo(
    () => [
      { value: "all", label: t("filter_all", "All"), color: isDark ? "#e8c96a" : "#0c4a6e" },
      { value: "ottoman", label: t("filter_ottoman", "Ottoman"), color: "#0d9488" },
      { value: "colonial", label: t("filter_colonial", "Colonial"), color: "#0c4a6e" },
      { value: "religious", label: t("filter_religious", "Religious"), color: "#7c3aed" },
      { value: "modern", label: t("filter_modern", "Modern"), color: "#556b2f" },
    ],
    [t, isDark]
  );

  const jewishSourceKeys = useMemo(
    () => jewishSources.map((source) => source.key),
    [jewishSources]
  );
  const filteredArchiveCardKeys = useMemo(
    () => filteredArchiveItems.map((item) => `archive-${item.title}`),
    [filteredArchiveItems]
  );

  /* ------------------------------------------------------------------ */
  /*  Quick stats data                                                   */
  /* ------------------------------------------------------------------ */
  const quickStats = useMemo(
    () => [
      {
        icon: Archive,
        value: 16,
        label: t("stat_total_archives", "Total Archives"),
        color: "#0d9488",
      },
      {
        icon: FileText,
        value: 6,
        label: t("stat_primary_sources", "Primary Source Types"),
        color: "#0c4a6e",
      },
      {
        icon: Globe,
        value: 8,
        label: t("stat_countries_covered", "Institutions Referenced"),
        color: "#c45c3e",
      },
      {
        icon: ScrollText,
        value: 400000,
        suffix: "+",
        label: t("stat_geniza_fragments", "Geniza Fragments"),
        color: "#7c3aed",
      },
    ],
    [t]
  );

  const primarySources = [
    { icon: Scroll, title: t("sources_manuscripts_title", "Manuscripts & Nasab"), description: t("sources_manuscripts_desc", "Genealogical manuscripts and zawiya registries capture lineage chains and tribal narratives.") },
    { icon: FileText, title: t("sources_civil_title", "Civil Status Records"), description: t("sources_civil_desc", "Birth, marriage, and death certificates anchor relationships with verified dates.") },
    { icon: Mic, title: t("sources_oral_title", "Oral Histories"), description: t("sources_oral_desc", "Recorded testimonies from elders provide context for migrations, alliances, and patronymics.") },
    { icon: Library, title: t("sources_private_title", "Private Family Archives"), description: t("sources_private_desc", "Letters, property deeds, and family notebooks often contain missing branches.") },
  ];

  const secondarySources = [
    { icon: BookOpen, title: t("sources_academic_title", "Academic Studies"), description: t("sources_academic_desc", "Anthropology and history publications contextualize tribal movements and social structures.") },
    { icon: Globe, title: t("sources_digital_title", "Digital Collections"), description: t("sources_digital_desc", "ANOM, Gallica, and regional digitization portals provide searchable scans.") },
  ];

  const accessGuides = [
    { icon: Lock, title: t("access_requirements_title", "Access Requirements"), description: t("access_requirements_desc", "Some archives require appointment letters, national IDs, or family proof. Always confirm before visiting.") },
    { icon: FileSearch, title: t("access_reference_title", "Reference Tracking"), description: t("access_reference_desc", "Record archive box codes, shelf numbers, and page references to validate each citation.") },
    { icon: ShieldCheck, title: t("access_protection_title", "Data Protection"), description: t("access_protection_desc", "Respect privacy laws for modern civil records and avoid publishing sensitive personal data.") },
  ];

  const reliabilityChecks = [
    { icon: CheckCircle2, title: t("reliability_cross_title", "Cross-check sources"), description: t("reliability_cross_desc", "Validate the same lineage across multiple registers and oral testimonies.") },
    { icon: AlertTriangle, title: t("reliability_gaps_title", "Identify gaps"), description: t("reliability_gaps_desc", "Flag missing years, name variations, and inconsistent patronymics.") },
    { icon: Scale, title: t("reliability_balance_title", "Balance narratives"), description: t("reliability_balance_desc", "Combine written documentation with oral histories to avoid biased records.") },
  ];

  const accessSteps = [
    { icon: Archive, title: t("archives_access_step1_title", "Plan your archive visit"), description: t("archives_access_step1_desc", "Confirm opening hours, required IDs, and file request procedures before you travel.") },
    { icon: BookOpen, title: t("archives_access_step2_title", "Use catalog references"), description: t("archives_access_step2_desc", "Record shelf codes, archive boxes, and series numbers to retrieve documents efficiently.") },
    { icon: ShieldCheck, title: t("archives_access_step3_title", "Document provenance"), description: t("archives_access_step3_desc", "Capture archive citations and metadata to validate sources later.") },
  ];

  const officialArchives = [
    { countryKey: "country_egypt", country: t("country_egypt", "Egypt"), nameKey: "official_archive_egypt", name: t("official_archive_egypt", "Dar al-Wathaeq al-Qawmiyya (Egyptian National Archives)"), url: "https://www.darelkotob.gov.eg/", description: t("archive_desc_egypt", "Egypt's national archives holding Ottoman, khedival, and modern state records, civil status documents, court records, and historical photographs.") },
    { countryKey: "country_alazhar", country: t("country_alazhar", "Al-Azhar Archives"), nameKey: "official_archive_alazhar", name: t("official_archive_alazhar", "Al-Azhar University Archives"), url: "https://www.azhar.eg/", description: t("archive_desc_alazhar", "Islamic scholarly records, student enrollment registers, and lineage documentation maintained by Al-Azhar, one of the oldest centers of Islamic learning.") },
    { countryKey: "country_coptic", country: t("country_coptic", "Coptic Orthodox Church Archives"), nameKey: "official_archive_coptic", name: t("official_archive_coptic", "Coptic Orthodox Patriarchate Archives"), url: "https://www.copticchurch.net/", description: t("archive_desc_coptic", "Baptism, marriage, and death records from Coptic churches across Egypt, preserving centuries of Christian genealogical documentation.") },
    { countryKey: "country_museum", country: t("country_museum", "Egyptian Museum Archives"), nameKey: "official_archive_museum", name: t("official_archive_museum", "Egyptian Museum & Antiquities Archives"), url: "https://www.gem.gov.eg/", description: t("archive_desc_museum", "Ancient Egyptian genealogical records, royal lineage inscriptions, and archaeological documentation spanning millennia of Egyptian civilization.") },
  ];

  const internationalArchives = [
    { key: "archive_anom", name: t("archive_anom_name", "Archives Nationales d'Outre-Mer (ANOM)"), url: "https://www.archives-nationales-outre-mer.culture.gouv.fr/", description: t("archive_anom_desc", "French overseas archives holding Egypt-related documents from Napoleon's expedition (1798-1801), scientific surveys, and diplomatic correspondence. Based in Aix-en-Provence; online search available.") },
    { key: "archive_ottoman", name: t("archive_ottoman_name", "Turkish State Archives (Ottoman Archives)"), url: "https://www.devletarsivleri.gov.tr/", description: t("archive_ottoman_desc", "Ottoman imperial holdings for Egypt: provincial administration, Sharia court records, taxation, and census documents spanning centuries of Ottoman rule. Millions of documents; catalog at katalog.devletarsivleri.gov.tr. Reading room in Istanbul; researcher card required.") },
    { key: "archive_tna", name: t("archive_tna_name", "British National Archives (TNA)"), url: "https://www.nationalarchives.gov.uk/", description: t("archive_tna_desc", "British colonial administration of Egypt (1882-1952): census, administrative, and military records. Extensive holdings on the Suez Canal, Anglo-Egyptian Sudan, and protectorate-era governance.") },
    { key: "archive_france", name: t("archive_france_name", "Archives Nationales (France)"), url: "https://www.archives-nationales.culture.gouv.fr/", description: t("archive_france_desc", "National archives in Paris and Pierrefitte: holdings from Napoleon's Egypt expedition (1798-1801), including scientific surveys, the Description de l'Egypte, and diplomatic records relevant to Egyptian genealogy.") },
  ];

  const navLabels: Record<string, string> = useMemo(() => ({
    "quick-stats": t("quick_stats_nav", "Overview"),
    "official-archives": t("official_archives_title", "Official Archives of Egypt"),
    "international-archives": t("international_archives_title", "International Archives for Egyptian Genealogy"),
    "jewish-archives": t("jewish_archives_nav", "Jewish Genealogical Sources"),
    "archive-types": t("archive_types", "Archive Types & Repositories"),
    "primary-sources": t("primary_sources", "Primary Sources"),
    "secondary-sources": t("secondary_sources", "Secondary Sources"),
    "access-guidelines": t("access_guidelines", "Access Guidelines"),
    "reliability": t("reliability_checks", "Reliability & Validation"),
    "how-to-access": t("archives_access", "How to Access Archives"),
  }), [t]);

  const toggleAllJewishSources = useCallback((expand: boolean) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      jewishSourceKeys.forEach((key) => {
        if (expand) next.add(key);
        else next.delete(key);
      });
      return next;
    });
  }, [jewishSourceKeys]);

  const toggleAllArchiveCards = useCallback((expand: boolean) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      filteredArchiveCardKeys.forEach((key) => {
        if (expand) next.add(key);
        else next.delete(key);
      });
      return next;
    });
  }, [filteredArchiveCardKeys]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActiveSection(e.target.id || null);
        }
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen">
      <RootsPageShell
        heroClassName="surface-nile text-on-nile"
        hero={
          <div className="relative mx-auto max-w-5xl">
            <div
              className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d4af37\' fill-opacity=\'0.06\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-80"
              aria-hidden
            />
            <div className="relative px-6 py-12 sm:py-16 text-center text-on-nile">
              <p className="text-on-nile mb-3 text-xs font-medium uppercase tracking-[0.35em] opacity-90 sm:text-sm">
                {t("sources_and_archives", "Archives")}
              </p>
              <h1 className="text-5xl font-bold">
                {t("sources_archives_title", "Archives & Records")}
              </h1>
              <p className="text-on-nile mx-auto mt-4 max-w-2xl text-base sm:text-lg opacity-95">
                {t(
                  "sources_archives_intro",
                  "Navigate historical archives, explore primary sources, and learn how to access and validate genealogical information across pharaonic records, Ottoman registers, and modern civil archives.",
                )}
              </p>
            </div>
          </div>
        }
      >
        {/* Sticky nav */}
        <nav
          className={`sticky top-0 z-30 rounded-xl border border-[var(--border-color)] px-4 py-3 shadow-lg backdrop-blur-md ${
            isDark
              ? "bg-[color-mix(in_srgb,var(--leather-brown)_90%,transparent)]"
              : "bg-[color-mix(in_srgb,var(--paper-color)_94%,transparent)]"
          }`}
        >
          <button
            type="button"
            className="interactive-btn btn-neu md:hidden flex items-center gap-2 w-full py-2.5 px-3 font-medium justify-between"
            onClick={() => setNavOpen((o) => !o)}
            aria-expanded={navOpen}
          >
            <Menu className="w-5 h-5" />
            {t("sources_and_archives", "Archives")}
          </button>
          <div className={`${navOpen ? "block" : "hidden"} md:block`}>
            <ul className="flex flex-wrap gap-x-4 gap-y-2 md:gap-6 py-2">
              {SECTION_IDS.map((id) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    onClick={() => setNavOpen(false)}
                    className={`text-sm font-medium transition-colors hover:text-teal ${activeSection === id ? "text-teal" : "text-[color:var(--text-color)] opacity-90"}`}
                  >
                    {navLabels[id] || id}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* ============================================================= */}
        {/*  Quick Stats Counter Bar                                       */}
        {/* ============================================================= */}
        <section id="quick-stats" className="roots-section scroll-mt-28">
          <ScrollReveal>
            <div className="mb-6">
              <h2 className="roots-heading !mb-4">
                {t("quick_stats_title", "Archive Overview")}
              </h2>
              <p className="mt-2 text-lg text-[color:var(--text-color)] opacity-90">
                {t(
                  "quick_stats_desc",
                  "A snapshot of the genealogical resources cataloged in this guide.",
                )}
              </p>
            </div>
          </ScrollReveal>
          <StaggerContainer className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {quickStats.map((stat) => (
              <StaggerItem key={stat.label}>
                <motion.div
                  className="roots-card text-center py-6 px-4"
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div
                    className="flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-3"
                    style={{
                      backgroundColor: `${stat.color}22`,
                      color: stat.color,
                    }}
                  >
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div
                    className="text-3xl sm:text-4xl font-bold mb-1"
                    style={{ color: stat.color }}
                  >
                    <CountUp
                      end={stat.value}
                      duration={2.5}
                      suffix={
                        "suffix" in stat && stat.suffix
                          ? (stat.suffix as string)
                          : ""
                      }
                    />
                  </div>
                  <p className="text-sm opacity-80 font-medium">{stat.label}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* ============================================================= */}
        {/*  Official Archives                                             */}
        {/* ============================================================= */}
        <section id="official-archives" className="roots-section scroll-mt-28">
          <ScrollReveal>
            <div className="mb-8">
              <h2 className="roots-heading !mb-4">
                {t("official_archives_title", "Official Archives of Egypt")}
              </h2>
              <p className="mt-2 text-lg text-[color:var(--text-color)] opacity-90">
                {t(
                  "official_archives_intro",
                  "Visit the official archives of Egypt for civil status, historical records, and genealogical sources. Links open in a new tab.",
                )}
              </p>
              <p className="mt-2 text-sm text-[color:var(--text-color)] opacity-80">
                {t(
                  "official_archives_quick_jump",
                  "Browse archives by location: ",
                )}
                {officialArchives.map((item, idx) => (
                  <span key={item.countryKey}>
                    <a
                      href={`#archive-${item.countryKey}`}
                      className="text-teal hover:text-tealDark hover:underline font-medium"
                    >
                      {item.country}
                    </a>
                    {idx < officialArchives.length - 1 ? ", " : ""}
                  </span>
                ))}
              </p>
            </div>
          </ScrollReveal>
          <StaggerContainer className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {officialArchives.map((item) => (
              <StaggerItem key={item.countryKey}>
                <article
                  id={`archive-${item.countryKey}`}
                  className="roots-card flex flex-col overflow-hidden transition-all duration-300 hover:border-teal h-full"
                >
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-teal/20 text-teal">
                        <Globe className="w-6 h-6" />
                      </div>
                      <ExternalLink
                        className="w-5 h-5 opacity-50"
                        aria-hidden
                      />
                    </div>
                    <h3 className="text-xl font-bold text-teal mb-1">
                      {item.country}
                    </h3>
                    <p className="font-semibold opacity-95 mb-3">{item.name}</p>
                    <p className="text-sm opacity-85 leading-relaxed flex-1 mb-5">
                      {item.description}
                    </p>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="roots-cta interactive-btn btn-neu btn-neu--gold inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-bold text-sm no-underline"
                    >
                      {t("visit_official_site", "Visit official site")}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* ============================================================= */}
        {/*  International Archives                                        */}
        {/* ============================================================= */}
        <section
          id="international-archives"
          className="roots-section roots-section-alt scroll-mt-28"
        >
          <ScrollReveal>
            <div className="mb-8">
              <h2
                className="roots-heading !mb-4"
                style={{ borderLeftColor: "#0c4a6e" }}
              >
                {t(
                  "international_archives_title",
                  "International Archives for Egyptian Genealogy",
                )}
              </h2>
              <p className="mt-2 text-lg text-[color:var(--text-color)] opacity-90">
                {t(
                  "international_archives_intro",
                  "Major archives of former colonial powers and the Ottoman Empire hold essential records for Egyptian genealogy.",
                )}
              </p>
            </div>
          </ScrollReveal>
          <StaggerContainer className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {internationalArchives.map((item) => (
              <StaggerItem key={item.key}>
                <article className="roots-card flex flex-col overflow-hidden transition-all duration-300 hover:border-[#0c4a6e] h-full">
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#0c4a6e]/20 text-[#0c4a6e]">
                        <Landmark className="w-6 h-6" />
                      </div>
                      <ExternalLink
                        className="w-5 h-5 opacity-50"
                        aria-hidden
                      />
                    </div>
                    <h3 className="text-xl font-bold text-[#0c4a6e] mb-3">
                      {item.name}
                    </h3>
                    <p className="text-sm opacity-85 leading-relaxed flex-1 mb-5">
                      {item.description}
                    </p>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="roots-cta interactive-btn btn-neu btn-neu--primary inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-bold text-sm no-underline"
                    >
                      {t("visit_official_site", "Visit official site")}
                      <ChevronRight className="w-4 h-4" />
                    </a>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* ============================================================= */}
        {/*  Jewish Genealogical Sources (NEW)                             */}
        {/* ============================================================= */}
        <section id="jewish-archives" className="roots-section scroll-mt-28">
          <ScrollReveal>
            <div className="mb-8">
              <h2
                className="roots-heading !mb-4"
                style={{ borderLeftColor: "#7c3aed" }}
              >
                {t(
                  "jewish_archives_title",
                  "Jewish Genealogical Sources in Egypt",
                )}
              </h2>
              <p className="mt-2 text-lg text-[color:var(--text-color)] opacity-90">
                {t(
                  "jewish_archives_intro",
                  "Egypt's Jewish communities have left a rich documentary heritage spanning over a millennium. From the medieval Cairo Geniza to modern communal records, these sources are essential for tracing Jewish Egyptian families and their connections across the Mediterranean world.",
                )}
              </p>
              <p className="mt-2 text-sm text-[color:var(--text-color)] opacity-80">
                {t(
                  "jewish_archives_note",
                  "Many original documents are now held by international libraries and research institutions. Digital access is increasingly available through collaborative projects.",
                )}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => toggleAllJewishSources(true)}
                  className="interactive-btn btn-neu px-3 py-2 text-xs"
                >
                  {t("expand_all", "Expand all")}
                </button>
                <button
                  type="button"
                  onClick={() => toggleAllJewishSources(false)}
                  className="interactive-btn btn-neu px-3 py-2 text-xs"
                >
                  {t("collapse_all", "Collapse all")}
                </button>
              </div>
            </div>
          </ScrollReveal>
          <StaggerContainer className="grid gap-8 lg:grid-cols-1">
            {jewishSources.map((source) => {
              const isExpanded = expandedCards.has(source.key);
              return (
                <StaggerItem key={source.key}>
                  <motion.article
                    className="roots-card overflow-hidden transition-all duration-300"
                    style={{
                      borderLeftWidth: "4px",
                      borderLeftColor: source.accent,
                    }}
                    whileHover={{ y: -2 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    <button
                      type="button"
                      className="w-full text-left p-6 cursor-pointer"
                      onClick={() => toggleCard(source.key)}
                      aria-expanded={isExpanded}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="flex items-center justify-center w-14 h-14 rounded-full shrink-0"
                          style={{
                            backgroundColor: `${source.accent}18`,
                            color: source.accent,
                          }}
                        >
                          <source.icon className="w-7 h-7" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-3">
                            <h3
                              className="text-2xl font-bold"
                              style={{ color: source.accent }}
                            >
                              {source.title}
                            </h3>
                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.3 }}
                              className="shrink-0"
                            >
                              <ChevronDown className="w-5 h-5 opacity-60" />
                            </motion.div>
                          </div>
                          <p className="opacity-90 mt-2 line-clamp-2">
                            {source.description}
                          </p>
                        </div>
                      </div>
                    </button>
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            duration: 0.35,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 pt-0">
                            <p className="opacity-90 mb-4">
                              {source.description}
                            </p>
                            <ul className="list-disc pl-6 space-y-1.5 opacity-90 text-sm mb-5">
                              {source.bullets.map((bullet, idx) => (
                                <li key={idx}>{bullet}</li>
                              ))}
                            </ul>
                            {source.links.length > 0 && (
                              <div className="border-t border-[var(--border-color)] pt-4">
                                <p className="text-sm font-semibold mb-2 opacity-80">
                                  {t(
                                    "jewish_resources_label",
                                    "Key Resources:",
                                  )}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {source.links.map((link, idx) => (
                                    <a
                                      key={idx}
                                      href={link.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
                                      style={{
                                        backgroundColor: `${source.accent}15`,
                                        color: source.accent,
                                      }}
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                      {link.label}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.article>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </section>

        {/* ============================================================= */}
        {/*  Archive Types with Search & Filter                            */}
        {/* ============================================================= */}
        <section id="archive-types" className="roots-section scroll-mt-28">
          <ScrollReveal>
            <div className="mb-8">
              <h2 className="roots-heading !mb-4">
                {t("archive_types", "Archive Types & Repositories")}
              </h2>
              <p className="mt-2 text-lg text-[color:var(--text-color)] opacity-90">
                {t(
                  "archive_types_desc",
                  "Comprehensive overview of historical and modern archives preserving Egyptian genealogy.",
                )}
              </p>
            </div>
          </ScrollReveal>

          {/* Search & Filter Bar */}
          <div className="mb-6 space-y-4">
            {/* Search input */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t(
                  "search_archives_placeholder",
                  "Search archives...",
                )}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border-color)] text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-teal/40 ${
                  isDark
                    ? "bg-[var(--neu-surface)] text-[var(--text-color)]"
                    : "bg-white text-[var(--text-color)]"
                }`}
              />
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="w-4 h-4 opacity-60 mr-1" />
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setActiveFilter(opt.value)}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all border ${
                    activeFilter === opt.value
                      ? "text-white shadow-md"
                      : `border-[var(--border-color)] opacity-75 hover:opacity-100 ${
                          isDark
                            ? "text-[var(--text-color)]"
                            : "text-[var(--text-color)]"
                        }`
                  }`}
                  style={
                    activeFilter === opt.value
                      ? { backgroundColor: opt.color, borderColor: opt.color }
                      : undefined
                  }
                >
                  {opt.label}
                </button>
              ))}
              {(searchQuery || activeFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveFilter("all");
                  }}
                  className="ml-2 text-xs opacity-60 hover:opacity-100 underline transition-opacity"
                >
                  {t("clear_filters", "Clear filters")}
                </button>
              )}
            </div>

            {/* Results count */}
            <p className="text-sm opacity-70 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5" />
              {t("showing_results", "Showing")} {filteredArchiveItems.length}{" "}
              {t("of_total", "of")} {archiveItems.length}{" "}
              {t("archives_label", "archives")}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => toggleAllArchiveCards(true)}
                className="interactive-btn btn-neu px-3 py-2 text-xs"
                disabled={filteredArchiveItems.length === 0}
              >
                {t("expand_all", "Expand all")}
              </button>
              <button
                type="button"
                onClick={() => toggleAllArchiveCards(false)}
                className="interactive-btn btn-neu px-3 py-2 text-xs"
                disabled={filteredArchiveItems.length === 0}
              >
                {t("collapse_all", "Collapse all")}
              </button>
            </div>
          </div>

          {/* Archive cards grid with expand/collapse */}
          <AnimatePresence mode="popLayout">
            <motion.div layout className="grid gap-6 lg:grid-cols-2">
              {filteredArchiveItems.map((item) => {
                const cardKey = `archive-${item.title}`;
                const isExpanded = expandedCards.has(cardKey);
                return (
                  <motion.div
                    key={item.title}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="roots-card transition-all duration-300 hover:border-terracotta/50 cursor-pointer"
                    onClick={() => toggleCard(cardKey)}
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleCard(cardKey);
                      }
                    }}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className="flex items-center justify-center w-12 h-12 rounded-full shrink-0"
                        style={{
                          backgroundColor: `${item.accent}22`,
                          color: item.accent,
                        }}
                      >
                        <item.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-2xl font-bold">{item.title}</h3>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="shrink-0"
                      >
                        <ChevronDown className="w-5 h-5 opacity-50" />
                      </motion.div>
                    </div>
                    <p
                      className={`opacity-90 mb-4 ${isExpanded ? "" : "line-clamp-2"}`}
                    >
                      {item.description}
                    </p>
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            duration: 0.3,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="overflow-hidden"
                        >
                          <ul className="list-disc pl-6 space-y-1 opacity-90 text-sm">
                            {item.bullets.map((bullet, idx) => (
                              <li key={idx}>{bullet}</li>
                            ))}
                          </ul>
                          <div className="mt-3 flex items-center gap-1.5">
                            <Star
                              className="w-3.5 h-3.5"
                              style={{ color: item.accent }}
                            />
                            <span className="text-xs font-medium opacity-70">
                              {item.filterTag.charAt(0).toUpperCase() +
                                item.filterTag.slice(1)}{" "}
                              {t("archive_category_label", "archive")}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {/* No results */}
          {filteredArchiveItems.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 opacity-70"
            >
              <Search className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-lg font-medium">
                {t("no_archives_found", "No archives match your search")}
              </p>
              <p className="text-sm mt-1">
                {t(
                  "try_different_search",
                  "Try a different search term or clear your filters.",
                )}
              </p>
            </motion.div>
          )}
        </section>

        {/* ============================================================= */}
        {/*  Primary & Secondary in two columns                            */}
        {/* ============================================================= */}
        <div className="grid gap-8 lg:grid-cols-2">
          <section id="primary-sources" className="roots-section scroll-mt-28">
            <ScrollReveal>
              <h2 className="roots-heading !mb-4">
                {t("primary_sources", "Primary Sources")}
              </h2>
              <p className="mb-6 text-lg text-[color:var(--text-color)] opacity-90">
                {t(
                  "primary_sources_desc",
                  "Direct evidence from original documents and testimonies that form the foundation of genealogical research.",
                )}
              </p>
            </ScrollReveal>
            <StaggerContainer className="space-y-4">
              {primarySources.map((item) => (
                <StaggerItem key={item.title}>
                  <div className="roots-card transition-all hover:shadow-lg">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-teal/20 text-teal shrink-0">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold mb-1">{item.title}</h3>
                        <p className="text-sm opacity-90">{item.description}</p>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>
          <section
            id="secondary-sources"
            className="roots-section scroll-mt-28"
          >
            <ScrollReveal>
              <h2 className="roots-heading !mb-4">
                {t("secondary_sources", "Secondary Sources")}
              </h2>
              <p className="mb-6 text-lg text-[color:var(--text-color)] opacity-90">
                {t(
                  "secondary_sources_desc",
                  "Academic research and digital collections that provide context and additional verification.",
                )}
              </p>
            </ScrollReveal>
            <StaggerContainer className="space-y-4">
              {secondarySources.map((item) => (
                <StaggerItem key={item.title}>
                  <div className="roots-card transition-all hover:shadow-lg">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#0c4a6e]/20 text-[#0c4a6e] shrink-0">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold mb-1">{item.title}</h3>
                        <p className="text-sm opacity-90">{item.description}</p>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>
        </div>

        {/* ============================================================= */}
        {/*  Access Guidelines                                             */}
        {/* ============================================================= */}
        <section
          id="access-guidelines"
          className="roots-section roots-section-alt scroll-mt-28"
        >
          <ScrollReveal>
            <h2 className="roots-heading !mb-4">
              {t("access_guidelines", "Access Guidelines")}
            </h2>
            <p className="mb-8 text-lg text-[color:var(--text-color)] opacity-90">
              {t(
                "access_guidelines_desc",
                "Essential information for accessing archives and protecting personal data in genealogical research.",
              )}
            </p>
          </ScrollReveal>
          <StaggerContainer className="grid gap-6 md:grid-cols-3">
            {accessGuides.map((item) => (
              <StaggerItem key={item.title}>
                <div className="roots-card">
                  <item.icon className="w-10 h-10 text-terracotta mb-4" />
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-sm opacity-90">{item.description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* ============================================================= */}
        {/*  Reliability                                                   */}
        {/* ============================================================= */}
        <section id="reliability" className="roots-section scroll-mt-28">
          <ScrollReveal>
            <h2 className="roots-heading !mb-4">
              {t("reliability_checks", "Reliability & Validation")}
            </h2>
            <p className="mb-8 text-lg text-[color:var(--text-color)] opacity-90">
              {t(
                "reliability_checks_desc",
                "Best practices for validating genealogical information and ensuring research accuracy.",
              )}
            </p>
          </ScrollReveal>
          <StaggerContainer className="grid gap-6 md:grid-cols-3">
            {reliabilityChecks.map((item) => (
              <StaggerItem key={item.title}>
                <div className="roots-card">
                  <item.icon className="w-10 h-10 text-[#0c4a6e] mb-4" />
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-sm opacity-90">{item.description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* ============================================================= */}
        {/*  How to Access                                                 */}
        {/* ============================================================= */}
        <section
          id="how-to-access"
          className="roots-section roots-section-alt scroll-mt-28"
        >
          <ScrollReveal>
            <h2 className="roots-heading !mb-4">
              {t("archives_access", "How to Access Archives")}
            </h2>
            <p className="mb-8 text-lg text-[color:var(--text-color)] opacity-90">
              {t(
                "archives_access_desc",
                "Step-by-step guide to planning your archive visit and documenting sources effectively.",
              )}
            </p>
          </ScrollReveal>
          <StaggerContainer className="grid gap-6 md:grid-cols-3">
            {accessSteps.map((step, idx) => (
              <StaggerItem key={step.title}>
                <div className="roots-card flex flex-col">
                  <span className="text-2xl font-bold text-teal/80 mb-2">
                    0{idx + 1}
                  </span>
                  <step.icon className="w-10 h-10 text-teal mb-3" />
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-sm opacity-90 mt-auto">
                    {step.description}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      </RootsPageShell>
    </div>
  );
}
