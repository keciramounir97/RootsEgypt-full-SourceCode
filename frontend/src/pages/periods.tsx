import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useThemeStore } from "../store/theme";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scroll,
  Crown,
  Shield,
  BookOpen,
  Map,
  Landmark,
  Archive,
  FileText,
  ChevronDown,
  ChevronRight,
  Calendar,
  Star,
  Filter,
  X,
  ChevronLeft,
} from "lucide-react";
import { useTranslation } from "../context/TranslationContext";
import RootsPageShell from "../components/RootsPageShell";
import ScrollReveal from "../components/motion/ScrollReveal";
import {
  StaggerContainer,
  StaggerItem,
} from "../components/motion/StaggerChildren";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface JewishHeritage {
  title: string;
  sources: string[];
}

interface Period {
  id: string;
  title: string;
  shortTitle: string;
  dateRange: string;
  year: number; // for sorting / positioning
  icon: React.ElementType;
  accent: string;
  description: string;
  bullets: string[];
  recordTypes: string[];
  jewish: JewishHeritage;
}

/* ------------------------------------------------------------------ */
/*  Record type filter options                                         */
/* ------------------------------------------------------------------ */
const RECORD_TYPES = [
  "court_records",
  "census",
  "religious",
  "military",
  "land_property",
  "civil_registry",
  "scholarly",
  "migration",
] as const;

type RecordType = (typeof RECORD_TYPES)[number];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function Periods() {
  const { theme } = useThemeStore();
  const { t } = useTranslation();
  const isDark = theme === "dark";

  const [expandedCountry, setExpandedCountry] = useState<string | null>(
    "region_upper_egypt"
  );
  const [expandedTimelineId, setExpandedTimelineId] = useState<string | null>(
    null
  );
  const [showJewishHeritage, setShowJewishHeritage] = useState(false);
  const [expandedJewishMoment, setExpandedJewishMoment] = useState<string | null>(
    "elephantine"
  );
  const [activeFilters, setActiveFilters] = useState<Set<RecordType>>(
    new Set()
  );
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  const hoverBg = isDark
    ? "hover:bg-[color-mix(in_srgb,var(--leather-brown)_85%,#000)]"
    : "hover:bg-[color-mix(in_srgb,var(--paper-color)_70%,#fff)]";

  /* ------------------------------------------------------------------ */
  /*  Record type labels                                                 */
  /* ------------------------------------------------------------------ */
  const recordTypeLabels: Record<RecordType, string> = {
    court_records: t("filter_court_records", "Court Records"),
    census: t("filter_census", "Census"),
    religious: t("filter_religious", "Religious"),
    military: t("filter_military", "Military"),
    land_property: t("filter_land_property", "Land & Property"),
    civil_registry: t("filter_civil_registry", "Civil Registry"),
    scholarly: t("filter_scholarly", "Scholarly"),
    migration: t("filter_migration", "Migration"),
  };

  /* ------------------------------------------------------------------ */
  /*  Period data (all 8 eras, enhanced with Jewish heritage)            */
  /* ------------------------------------------------------------------ */
  const periods: Period[] = useMemo(
    () => [
      {
        id: "pharaonic",
        title: t(
          "periods_pharaonic_title",
          "Pharaonic & Ancient Era (3100 BC - 332 BC)"
        ),
        shortTitle: t("periods_pharaonic_short", "Pharaonic"),
        dateRange: "3100 BC - 332 BC",
        year: -3100,
        icon: Crown,
        accent: "#c45c3e",
        description: t(
          "periods_pharaonic_desc",
          "Ancient Egypt's dynastic records, temple inscriptions, and papyrus documents preserve some of the earliest genealogical information in human history."
        ),
        bullets: [
          t("periods_pharaonic_b1", "Royal cartouches and king lists"),
          t(
            "periods_pharaonic_b2",
            "Temple and tomb genealogical inscriptions"
          ),
          t(
            "periods_pharaonic_b3",
            "Papyrus family records and census documents"
          ),
          t("periods_pharaonic_b4", "Priestly lineage records"),
        ],
        recordTypes: ["religious", "scholarly", "census"],
        jewish: {
          title: t(
            "jewish_pharaonic_title",
            "Israelites & Early Jewish Communities"
          ),
          sources: [
            t(
              "jewish_pharaonic_s1",
              "Elephantine papyri documenting a Jewish military colony (5th century BC)"
            ),
            t(
              "jewish_pharaonic_s2",
              "References to Israelite communities in New Kingdom records"
            ),
            t(
              "jewish_pharaonic_s3",
              "Aramaic legal documents from Jewish settlements in Upper Egypt"
            ),
            t(
              "jewish_pharaonic_s4",
              "Temple records of the Elephantine Jewish colony including marriage and property deeds"
            ),
          ],
        },
      },
      {
        id: "ptolemaic",
        title: t(
          "periods_ptolemaic_title",
          "Ptolemaic & Roman Period (332 BC - 641 AD)"
        ),
        shortTitle: t("periods_ptolemaic_short", "Ptolemaic & Roman"),
        dateRange: "332 BC - 641 AD",
        year: -332,
        icon: Shield,
        accent: "#0c4a6e",
        description: t(
          "periods_ptolemaic_desc",
          "Greek and Roman administrative systems introduced census records and tax documents that preserved family information across Egypt's diverse communities."
        ),
        bullets: [
          t("periods_ptolemaic_b1", "Ptolemaic census and tax rolls"),
          t("periods_ptolemaic_b2", "Roman civil administration records"),
          t(
            "periods_ptolemaic_b3",
            "Coptic church birth and baptism records"
          ),
          t(
            "periods_ptolemaic_b4",
            "Land ownership and inheritance documents"
          ),
        ],
        recordTypes: ["census", "court_records", "religious", "land_property"],
        jewish: {
          title: t(
            "jewish_ptolemaic_title",
            "Alexandrian Jewish Golden Age"
          ),
          sources: [
            t(
              "jewish_ptolemaic_s1",
              "The Septuagint translation project (3rd century BC) and its community records"
            ),
            t(
              "jewish_ptolemaic_s2",
              "Philo of Alexandria's writings documenting Jewish communal life"
            ),
            t(
              "jewish_ptolemaic_s3",
              "Synagogue inscriptions and Jewish community registers in Alexandria"
            ),
            t(
              "jewish_ptolemaic_s4",
              "Papyrus records of Jewish tax collectors, merchants, and landowners"
            ),
          ],
        },
      },
      {
        id: "early_islamic",
        title: t(
          "periods_early_islamic_title",
          "Early Islamic Period (641 - 969)"
        ),
        shortTitle: t("periods_early_islamic_short", "Early Islamic"),
        dateRange: "641 - 969",
        year: 641,
        icon: BookOpen,
        accent: "#00695c",
        description: t(
          "periods_early_islamic_desc",
          "The Rashidun, Umayyad, and Abbasid caliphates introduced Islamic legal frameworks to Egypt, establishing Sharia courts and early waqf institutions that began documenting lineage and family affairs."
        ),
        bullets: [
          t(
            "periods_early_islamic_b1",
            "Rashidun-era conversion and land grant records"
          ),
          t(
            "periods_early_islamic_b2",
            "Umayyad tax registers and administrative papyri"
          ),
          t(
            "periods_early_islamic_b3",
            "Early Sharia court marriage and inheritance records"
          ),
          t(
            "periods_early_islamic_b4",
            "Abbasid scholarly lineage documentation"
          ),
        ],
        recordTypes: ["court_records", "land_property", "religious", "scholarly"],
        jewish: {
          title: t(
            "jewish_early_islamic_title",
            "Jewish & Coptic Dhimmi Communities"
          ),
          sources: [
            t(
              "jewish_early_islamic_s1",
              "Dhimmi tax (jizya) registers listing Jewish and Coptic households"
            ),
            t(
              "jewish_early_islamic_s2",
              "Jewish communal court records under the Exilarch system"
            ),
            t(
              "jewish_early_islamic_s3",
              "Correspondence between Egyptian Jews and Babylonian academies"
            ),
            t(
              "jewish_early_islamic_s4",
              "Early Rabbinic responsa documenting Jewish family law in Egypt"
            ),
          ],
        },
      },
      {
        id: "fatimid",
        title: t(
          "periods_fatimid_title",
          "Fatimid & Ayyubid Era (969 - 1250)"
        ),
        shortTitle: t("periods_fatimid_short", "Fatimid & Ayyubid"),
        dateRange: "969 - 1250",
        year: 969,
        icon: Crown,
        accent: "#6d4c41",
        description: t(
          "periods_fatimid_desc",
          "The Fatimid caliphate founded Cairo and established Al-Azhar, while Saladin's Ayyubid dynasty brought Sunni restoration and military records. Both eras left rich genealogical documentation."
        ),
        bullets: [
          t(
            "periods_fatimid_b1",
            "Fatimid royal genealogies and court records"
          ),
          t(
            "periods_fatimid_b2",
            "Al-Azhar enrollment and scholarly lineage registers"
          ),
          t(
            "periods_fatimid_b3",
            "Ayyubid military rolls and land grants"
          ),
          t(
            "periods_fatimid_b4",
            "Waqf endowment deeds and property chains"
          ),
        ],
        recordTypes: [
          "court_records",
          "scholarly",
          "military",
          "land_property",
          "religious",
        ],
        jewish: {
          title: t(
            "jewish_fatimid_title",
            "Cairo Geniza & Maimonides"
          ),
          sources: [
            t(
              "jewish_fatimid_s1",
              "The Cairo Geniza: over 400,000 manuscript fragments from the Ben Ezra Synagogue"
            ),
            t(
              "jewish_fatimid_s2",
              "Maimonides' community records as Nagid (leader) of Egyptian Jewry"
            ),
            t(
              "jewish_fatimid_s3",
              "Jewish merchant correspondence across the Mediterranean trade network"
            ),
            t(
              "jewish_fatimid_s4",
              "Ketubot (marriage contracts) and divorce documents from the Geniza collection"
            ),
          ],
        },
      },
      {
        id: "mamluk",
        title: t("periods_mamluk_title", "Mamluk Sultanate (1250 - 1517)"),
        shortTitle: t("periods_mamluk_short", "Mamluk"),
        dateRange: "1250 - 1517",
        year: 1250,
        icon: Shield,
        accent: "#b71c1c",
        description: t(
          "periods_mamluk_desc",
          "The Bahri and Burji Mamluk sultanates maintained detailed court records, extensive waqf systems, and military registers that documented families across social classes."
        ),
        bullets: [
          t(
            "periods_mamluk_b1",
            "Sharia court registers (marriage, divorce, inheritance)"
          ),
          t(
            "periods_mamluk_b2",
            "Mamluk military recruitment and emancipation records"
          ),
          t(
            "periods_mamluk_b3",
            "Extensive Awqaf endowment registries"
          ),
          t(
            "periods_mamluk_b4",
            "Merchant guild and trade guild membership records"
          ),
        ],
        recordTypes: [
          "court_records",
          "military",
          "religious",
          "land_property",
        ],
        jewish: {
          title: t(
            "jewish_mamluk_title",
            "Jewish Quarter Records"
          ),
          sources: [
            t(
              "jewish_mamluk_s1",
              "Harat al-Yahud (Jewish Quarter) property and residency records"
            ),
            t(
              "jewish_mamluk_s2",
              "Synagogue community ledgers and charitable endowments"
            ),
            t(
              "jewish_mamluk_s3",
              "Jewish court (Beth Din) records of marriages, divorces, and commercial disputes"
            ),
            t(
              "jewish_mamluk_s4",
              "Tax records and guild memberships for Jewish artisans and physicians"
            ),
          ],
        },
      },
      {
        id: "ottoman",
        title: t("periods_ottoman_title", "Ottoman Period (1517 - 1882)"),
        shortTitle: t("periods_ottoman_short", "Ottoman"),
        dateRange: "1517 - 1882",
        year: 1517,
        icon: Map,
        accent: "#e65100",
        description: t(
          "periods_ottoman_desc",
          "Ottoman administration of Egypt as an eyalet, then a khedivate, created comprehensive census, taxation, and court records that are among the richest genealogical sources for Egyptian families."
        ),
        bullets: [
          t(
            "periods_ottoman_b1",
            "Ottoman census and taxation registers (tahrir defterleri)"
          ),
          t(
            "periods_ottoman_b2",
            "Sharia court records under Ottoman jurisdiction"
          ),
          t(
            "periods_ottoman_b3",
            "Khedivate-era civil status and land surveys"
          ),
          t(
            "periods_ottoman_b4",
            "Muhammad Ali dynasty administrative records"
          ),
        ],
        recordTypes: [
          "census",
          "court_records",
          "land_property",
          "military",
        ],
        jewish: {
          title: t(
            "jewish_ottoman_title",
            "Ottoman Jewish Community Records"
          ),
          sources: [
            t(
              "jewish_ottoman_s1",
              "Karaite Jewish community registers and liturgical records in Cairo"
            ),
            t(
              "jewish_ottoman_s2",
              "Rabbinical court records from the Hakhambashi (Chief Rabbi) system"
            ),
            t(
              "jewish_ottoman_s3",
              "Ottoman millet system documentation for the Jewish community"
            ),
            t(
              "jewish_ottoman_s4",
              "Sephardic immigration records following the Spanish expulsion"
            ),
          ],
        },
      },
      {
        id: "british",
        title: t("periods_british_title", "British Period (1882 - 1952)"),
        shortTitle: t("periods_british_short", "British"),
        dateRange: "1882 - 1952",
        year: 1882,
        icon: Landmark,
        accent: "#1565c0",
        description: t(
          "periods_british_desc",
          "British colonial administration introduced modern census methods, civil registration, and detailed land surveys, while Egyptian national movements generated their own documentation."
        ),
        bullets: [
          t("periods_british_b1", "British census records (1882 onward)"),
          t("periods_british_b2", "Land surveys and irrigation maps"),
          t(
            "periods_british_b3",
            "Colonial administrative and military rolls"
          ),
          t(
            "periods_british_b4",
            "Kingdom of Egypt (1922-1952) civil registers"
          ),
        ],
        recordTypes: [
          "census",
          "land_property",
          "military",
          "civil_registry",
        ],
        jewish: {
          title: t(
            "jewish_british_title",
            "Multi-Community Census & Jewish Institutions"
          ),
          sources: [
            t(
              "jewish_british_s1",
              "Mixed-community census records listing Jewish households by neighborhood"
            ),
            t(
              "jewish_british_s2",
              "Jewish school enrollment records (Lycee Francais, Alliance Israelite Universelle)"
            ),
            t(
              "jewish_british_s3",
              "Synagogue birth, marriage, and death registers (Sha'ar Hashamayim, Eliyahu Hanavi)"
            ),
            t(
              "jewish_british_s4",
              "B'nai B'rith lodge records and Jewish charitable organization documents"
            ),
          ],
        },
      },
      {
        id: "modern",
        title: t(
          "periods_modern_egypt_title",
          "Modern Egypt (1952 - Present)"
        ),
        shortTitle: t("periods_modern_egypt_short", "Modern"),
        dateRange: "1952 - Present",
        year: 1952,
        icon: Landmark,
        accent: "#0d9488",
        description: t(
          "periods_modern_egypt_desc",
          "From Nasser's republic through the contemporary era, Egypt's centralized civil registry, national archives, and digital initiatives provide comprehensive family documentation."
        ),
        bullets: [
          t(
            "periods_modern_egypt_b1",
            "Civil registry birth/marriage/death records"
          ),
          t("periods_modern_egypt_b2", "National ID registration system"),
          t(
            "periods_modern_egypt_b3",
            "Dar al-Wathaeq National Archives"
          ),
          t(
            "periods_modern_egypt_b4",
            "Diaspora documentation and consular records"
          ),
        ],
        recordTypes: ["civil_registry", "migration", "census"],
        jewish: {
          title: t(
            "jewish_modern_title",
            "Post-1956 Jewish Emigration & Preservation"
          ),
          sources: [
            t(
              "jewish_modern_s1",
              "Emigration records documenting the departure of over 80,000 Egyptian Jews after 1956"
            ),
            t(
              "jewish_modern_s2",
              "Preservation efforts at Bassatine Cemetery, the oldest Jewish cemetery in Egypt"
            ),
            t(
              "jewish_modern_s3",
              "Restoration records for historic synagogues (Eliyahu Hanavi, Ben Ezra, Maimonides)"
            ),
            t(
              "jewish_modern_s4",
              "Oral history projects and diaspora community archives in Israel, France, and Brazil"
            ),
          ],
        },
      },
    ],
    [t]
  );

  /* ------------------------------------------------------------------ */
  /*  Filtered periods                                                   */
  /* ------------------------------------------------------------------ */
  const filteredPeriods = useMemo(() => {
    if (activeFilters.size === 0) return periods;
    return periods.filter((p) =>
      p.recordTypes.some((rt) => activeFilters.has(rt as RecordType))
    );
  }, [periods, activeFilters]);

  /* ------------------------------------------------------------------ */
  /*  Research Focus cards                                               */
  /* ------------------------------------------------------------------ */
  const recordHighlights = useMemo(
    () => [
      {
        icon: Scroll,
        title: t("periods_highlight_ancient_title", "Ancient Records"),
        detail: t(
          "periods_highlight_ancient_desc",
          "Temple inscriptions, papyrus documents, and royal genealogies preserved in museums and archaeological archives."
        ),
      },
      {
        icon: Archive,
        title: t("periods_highlight_islamic_title", "Islamic Registers"),
        detail: t(
          "periods_highlight_islamic_desc",
          "Sharia court records, Awqaf deeds, and religious endowments anchor family histories across centuries."
        ),
      },
      {
        icon: FileText,
        title: t("periods_highlight_modern_title", "Modern Civil Status"),
        detail: t(
          "periods_highlight_modern_desc",
          "Civil registry offices maintain certified birth, marriage, and death extracts for verification."
        ),
      },
      {
        icon: Map,
        title: t("periods_highlight_migration_title", "Migration Maps"),
        detail: t(
          "periods_highlight_migration_desc",
          "Administrative records and historical maps trace movement between the Nile Valley, Delta, and desert oases."
        ),
      },
    ],
    [t]
  );

  const jewishTimelineMoments = useMemo(
    () => [
      {
        id: "elephantine",
        era: t("jewish_moment_elephantine_era", "5th c. BCE"),
        title: t("jewish_moment_elephantine_title", "Elephantine Community"),
        detail: t(
          "jewish_moment_elephantine_detail",
          "Aramaic papyri from Elephantine record military families, contracts, and cross-community legal life in Upper Egypt."
        ),
      },
      {
        id: "alexandria",
        era: t("jewish_moment_alexandria_era", "Hellenistic-Roman"),
        title: t("jewish_moment_alexandria_title", "Alexandrian Networks"),
        detail: t(
          "jewish_moment_alexandria_detail",
          "Large Jewish neighborhoods in Alexandria produced institutional, educational, and trade records tied to Mediterranean routes."
        ),
      },
      {
        id: "geniza",
        era: t("jewish_moment_geniza_era", "10th-13th c."),
        title: t("jewish_moment_geniza_title", "Cairo Geniza"),
        detail: t(
          "jewish_moment_geniza_detail",
          "Geniza fragments preserve marriage contracts, court correspondence, and migration trails across Egypt, North Africa, and the Levant."
        ),
      },
      {
        id: "modern",
        era: t("jewish_moment_modern_era", "19th-20th c."),
        title: t("jewish_moment_modern_title", "Modern Communal Registers"),
        detail: t(
          "jewish_moment_modern_detail",
          "Synagogue, school, and civil records in Cairo and Alexandria help reconnect families before and after diaspora migrations."
        ),
      },
    ],
    [t]
  );

  /* ------------------------------------------------------------------ */
  /*  Region accordion data                                              */
  /* ------------------------------------------------------------------ */
  const periodsByCountry = useMemo(
    () => [
      {
        countryKey: "region_upper_egypt",
        country: t("region_upper_egypt", "Upper Egypt (Sa'id)"),
        intro: t(
          "periods_region_intro_upper",
          "From Aswan to Beni Suef \u2014 the heartland of ancient Egyptian civilization with rich genealogical traditions."
        ),
        periods: [
          {
            key: "periods_upper_ancient",
            label: t(
              "periods_upper_ancient",
              "Ancient & Pharaonic (temples, royal records)"
            ),
            desc: t(
              "periods_upper_ancient_desc",
              "Ancient & Pharaonic (temples, royal records)"
            ),
          },
          {
            key: "periods_upper_islamic",
            label: t(
              "periods_upper_islamic",
              "Islamic Era (Sufi orders, tribal councils)"
            ),
            desc: t(
              "periods_upper_islamic_desc",
              "Islamic Era (Sufi orders, tribal councils)"
            ),
          },
          {
            key: "periods_upper_modern",
            label: t(
              "periods_upper_modern",
              "Modern (civil registry, tribal genealogies)"
            ),
            desc: t(
              "periods_upper_modern_desc",
              "Modern (civil registry, tribal genealogies)"
            ),
          },
        ],
      },
      {
        countryKey: "region_lower_egypt",
        country: t("region_lower_egypt", "Lower Egypt (Delta)"),
        intro: t(
          "periods_region_intro_lower",
          "The fertile Nile Delta region \u2014 Alexandria, Tanta, Mansoura \u2014 with diverse genealogical sources."
        ),
        periods: [
          {
            key: "periods_lower_ptolemaic",
            label: t(
              "periods_lower_ptolemaic",
              "Ptolemaic & Roman (Alexandria's archives)"
            ),
            desc: t(
              "periods_lower_ptolemaic_desc",
              "Ptolemaic & Roman (Alexandria's archives)"
            ),
          },
          {
            key: "periods_lower_ottoman",
            label: t(
              "periods_lower_ottoman",
              "Ottoman Period (port city records, trade documentation)"
            ),
            desc: t(
              "periods_lower_ottoman_desc",
              "Ottoman Period (port city records, trade documentation)"
            ),
          },
          {
            key: "periods_lower_modern",
            label: t(
              "periods_lower_modern",
              "Modern (urban civil registries, church records)"
            ),
            desc: t(
              "periods_lower_modern_desc",
              "Modern (urban civil registries, church records)"
            ),
          },
        ],
      },
      {
        countryKey: "region_cairo",
        country: t("region_cairo", "Cairo & Greater Cairo"),
        intro: t(
          "periods_region_intro_cairo",
          "The capital region \u2014 rich Ottoman, Mamluk, and modern administrative records."
        ),
        periods: [
          {
            key: "periods_cairo_mamluk",
            label: t(
              "periods_cairo_mamluk",
              "Mamluk & Ottoman (court records, Al-Azhar)"
            ),
            desc: t(
              "periods_cairo_mamluk_desc",
              "Mamluk & Ottoman (court records, Al-Azhar)"
            ),
          },
          {
            key: "periods_cairo_british",
            label: t(
              "periods_cairo_british",
              "British Period (census, urban administration)"
            ),
            desc: t(
              "periods_cairo_british_desc",
              "British Period (census, urban administration)"
            ),
          },
          {
            key: "periods_cairo_modern",
            label: t(
              "periods_cairo_modern",
              "Modern (centralized civil registry, Dar al-Wathaeq)"
            ),
            desc: t(
              "periods_cairo_modern_desc",
              "Modern (centralized civil registry, Dar al-Wathaeq)"
            ),
          },
        ],
      },
      {
        countryKey: "region_sinai",
        country: t("region_sinai", "Sinai & Eastern Desert"),
        intro: t(
          "periods_region_intro_sinai",
          "Bedouin tribal genealogies and monastic records from the Sinai Peninsula."
        ),
        periods: [
          {
            key: "periods_sinai_tribal",
            label: t(
              "periods_sinai_tribal",
              "Tribal oral genealogies (nasab)"
            ),
            desc: t(
              "periods_sinai_tribal_desc",
              "Tribal oral genealogies (nasab)"
            ),
          },
          {
            key: "periods_sinai_ottoman",
            label: t(
              "periods_sinai_ottoman",
              "Ottoman & British administration records"
            ),
            desc: t(
              "periods_sinai_ottoman_desc",
              "Ottoman & British administration records"
            ),
          },
          {
            key: "periods_sinai_modern",
            label: t(
              "periods_sinai_modern",
              "Modern tribal and civil documentation"
            ),
            desc: t(
              "periods_sinai_modern_desc",
              "Modern tribal and civil documentation"
            ),
          },
        ],
      },
      {
        countryKey: "region_nubia",
        country: t("region_nubia", "Nubia & Southern Egypt"),
        intro: t(
          "periods_region_intro_nubia",
          "Ancient Nubian heritage and genealogies, impacted by the Aswan Dam relocation."
        ),
        periods: [
          {
            key: "periods_nubia_ancient",
            label: t(
              "periods_nubia_ancient",
              "Ancient Nubian kingdoms (Kerma, Kush, Meroe)"
            ),
            desc: t(
              "periods_nubia_ancient_desc",
              "Ancient Nubian kingdoms (Kerma, Kush, Meroe)"
            ),
          },
          {
            key: "periods_nubia_islamic",
            label: t(
              "periods_nubia_islamic",
              "Islamic period (Nubian conversion records)"
            ),
            desc: t(
              "periods_nubia_islamic_desc",
              "Islamic period (Nubian conversion records)"
            ),
          },
          {
            key: "periods_nubia_modern",
            label: t(
              "periods_nubia_modern",
              "Modern (relocation records, cultural preservation)"
            ),
            desc: t(
              "periods_nubia_modern_desc",
              "Modern (relocation records, cultural preservation)"
            ),
          },
        ],
      },
    ],
    [t]
  );

  /* ------------------------------------------------------------------ */
  /*  Filter toggle handler                                              */
  /* ------------------------------------------------------------------ */
  const toggleFilter = useCallback((filter: RecordType) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(filter)) next.delete(filter);
      else next.add(filter);
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setActiveFilters(new Set());
  }, []);

  /* ------------------------------------------------------------------ */
  /*  Timeline scroll helpers                                            */
  /* ------------------------------------------------------------------ */
  const scrollTimeline = useCallback((direction: "left" | "right") => {
    if (!timelineRef.current) return;
    const amount = 340;
    timelineRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }, []);

  /* ------------------------------------------------------------------ */
  /*  Expand / collapse a timeline node                                  */
  /* ------------------------------------------------------------------ */
  const toggleTimelineNode = useCallback((id: string) => {
    setExpandedTimelineId((prev) => (prev === id ? null : id));
  }, []);

  /* ------------------------------------------------------------------ */
  /*  Render                                                             */
  /* ------------------------------------------------------------------ */
  return (
    <RootsPageShell
      heroClassName="surface-nile text-on-nile"
      hero={
        <div className="space-y-4 text-on-nile">
          <p className="text-sm uppercase tracking-[0.3em] text-on-nile opacity-90">
            {t("periods_hero_label", "Historical Periods")}
          </p>
          <h1 className="text-5xl font-bold text-on-nile">
            {t("periods_hero_title", "Egyptian Genealogy Through Time")}
          </h1>
          <p className="mx-auto max-w-4xl text-lg text-on-nile opacity-95">
            {t(
              "periods_hero_intro",
              "Chart the shifts from Pharaonic dynasties through Islamic conquests, Ottoman administration, to modern civil archives."
            )}
          </p>
        </div>
      }
    >
      {/* ================================================================ */}
      {/*  INTERACTIVE VISUAL TIMELINE                                      */}
      {/* ================================================================ */}
      <ScrollReveal>
        <section className="roots-section roots-section-alt">
          <h2 className="text-3xl font-bold text-center mb-2">
            {t("periods_timeline_title", "Timeline Overview")}
          </h2>
          <p className="text-center opacity-70 mb-8 text-sm">
            {t(
              "periods_timeline_hint",
              "Click any era to explore its records. Scroll horizontally to navigate."
            )}
          </p>

          {/* Scroll arrows */}
          <div className="relative">
            <button
              onClick={() => scrollTimeline("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center bg-teal/20 hover:bg-teal/40 text-teal transition-colors backdrop-blur-sm"
              aria-label={t("timeline_scroll_left", "Scroll timeline left")}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollTimeline("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center bg-teal/20 hover:bg-teal/40 text-teal transition-colors backdrop-blur-sm"
              aria-label={t("timeline_scroll_right", "Scroll timeline right")}
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Horizontal scrollable timeline */}
            <div
              ref={timelineRef}
              className="overflow-x-auto px-14 pb-4"
              style={{ scrollbarWidth: "none" }}
            >
              <div className="relative min-w-max flex items-start pt-6 pb-2">
                {/* Timeline bar */}
                <div className="absolute top-[52px] left-0 right-0 h-1 bg-gradient-to-r from-terracotta via-teal to-[#d4a843] rounded-full" />

                {periods.map((period, idx) => {
                  const isExpanded = expandedTimelineId === period.id;
                  const Icon = period.icon;
                  const isFiltered =
                    activeFilters.size > 0 &&
                    !period.recordTypes.some((rt) =>
                      activeFilters.has(rt as RecordType)
                    );

                  return (
                    <div
                      key={period.id}
                      className="flex flex-col items-center relative"
                      style={{
                        minWidth: "160px",
                        marginRight:
                          idx < periods.length - 1 ? "16px" : "0",
                        opacity: isFiltered ? 0.3 : 1,
                        transition: "opacity 0.3s ease",
                      }}
                    >
                      {/* Clickable node */}
                      <motion.button
                        onClick={() => toggleTimelineNode(period.id)}
                        whileHover={{ scale: 1.12 }}
                        whileTap={{ scale: 0.95 }}
                        className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center border-[3px] transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-teal ${
                          isExpanded
                            ? "border-teal shadow-lg shadow-teal/30"
                            : "border-current/20 hover:border-teal/60"
                        }`}
                        style={{
                          background: isExpanded
                            ? `${period.accent}25`
                            : isDark
                            ? "rgba(15,23,41,0.9)"
                            : "rgba(247,243,235,0.95)",
                        }}
                        aria-expanded={isExpanded}
                        aria-label={`${period.shortTitle}: ${period.dateRange}`}
                      >
                        <Icon
                          className="w-6 h-6"
                          style={{ color: period.accent }}
                        />
                      </motion.button>

                      {/* Connector dot on the bar */}
                      <div
                        className={`w-3 h-3 rounded-full mt-1 transition-colors duration-300 ${
                          isExpanded ? "bg-teal" : "bg-current/30"
                        }`}
                      />

                      {/* Label */}
                      <p
                        className={`mt-2 text-xs font-semibold text-center max-w-[140px] transition-colors duration-300 ${
                          isExpanded ? "text-teal" : "opacity-70"
                        }`}
                      >
                        {period.shortTitle}
                      </p>
                      <p className="text-[10px] opacity-50 text-center mt-0.5">
                        {period.dateRange}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Expanded detail panel */}
          <AnimatePresence mode="wait">
            {expandedTimelineId && (
              <motion.div
                key={expandedTimelineId}
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                {(() => {
                  const period = periods.find(
                    (p) => p.id === expandedTimelineId
                  );
                  if (!period) return null;
                  const Icon = period.icon;

                  return (
                    <div className="roots-card p-8 rounded-2xl border-l-4" style={{ borderColor: period.accent }}>
                      <div className="flex items-start gap-5 mb-5">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                          style={{
                            background: `${period.accent}15`,
                          }}
                        >
                          <Icon
                            className="w-8 h-8"
                            style={{ color: period.accent }}
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold mb-1">
                            {period.title}
                          </h3>
                          <p className="opacity-80 leading-relaxed">
                            {period.description}
                          </p>
                        </div>
                        <button
                          onClick={() => setExpandedTimelineId(null)}
                          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center hover:bg-teal/15 text-teal transition-colors"
                          aria-label={t("timeline_close", "Close details")}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        {/* Key Records */}
                        <div>
                          <h4 className="text-sm font-bold uppercase tracking-wider text-teal mb-3">
                            {t("timeline_key_records", "Key Records")}
                          </h4>
                          <ul className="space-y-2">
                            {period.bullets.map((bullet, i) => (
                              <motion.li
                                key={i}
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  delay: i * 0.08,
                                  duration: 0.35,
                                }}
                                className="flex items-start gap-2.5"
                              >
                                <span
                                  className="inline-block w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                                  style={{
                                    background: period.accent,
                                  }}
                                />
                                <span className="opacity-90 text-sm leading-relaxed">
                                  {bullet}
                                </span>
                              </motion.li>
                            ))}
                          </ul>
                        </div>

                        {/* Jewish Heritage (always visible when panel is open) */}
                        <div
                          className="rounded-xl p-5"
                          style={{
                            background: isDark
                              ? "rgba(212,168,67,0.06)"
                              : "rgba(212,168,67,0.08)",
                            border: "1px solid rgba(212,168,67,0.2)",
                          }}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <Star className="w-4 h-4 text-[#d4a843]" />
                            <h4 className="text-sm font-bold uppercase tracking-wider text-[#d4a843]">
                              {period.jewish.title}
                            </h4>
                          </div>
                          <ul className="space-y-2">
                            {period.jewish.sources.map((src, i) => (
                              <motion.li
                                key={i}
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  delay: 0.15 + i * 0.08,
                                  duration: 0.35,
                                }}
                                className="flex items-start gap-2.5"
                              >
                                <span className="inline-block w-1.5 h-1.5 rounded-full mt-2 shrink-0 bg-[#d4a843]" />
                                <span className="opacity-85 text-sm leading-relaxed">
                                  {src}
                                </span>
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Record type badges */}
                      <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-teal/10">
                        {period.recordTypes.map((rt) => (
                          <span
                            key={rt}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                            style={{
                              background: `${period.accent}12`,
                              color: period.accent,
                              border: `1px solid ${period.accent}30`,
                            }}
                          >
                            {recordTypeLabels[rt as RecordType] || rt}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="roots-section">
          <h2 className="text-3xl font-bold text-center mb-2">
            {t("periods_jewish_timeline_title", "Jewish History in Egypt: Key Moments")}
          </h2>
          <p className="text-center opacity-70 mb-8 text-sm">
            {t(
              "periods_jewish_timeline_hint",
              "Select a moment to view the archival value for genealogical research."
            )}
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {jewishTimelineMoments.map((moment) => {
              const isOpen = expandedJewishMoment === moment.id;
              return (
                <button
                  key={moment.id}
                  type="button"
                  onClick={() => setExpandedJewishMoment(isOpen ? null : moment.id)}
                  className={`roots-card text-left p-5 transition-all ${
                    isOpen ? "ring-2 ring-[#d4a843]/45" : ""
                  }`}
                  aria-expanded={isOpen}
                >
                  <p className="text-xs font-semibold tracking-wide uppercase text-[#d4a843]">
                    {moment.era}
                  </p>
                  <h3 className="text-xl font-bold mt-2 mb-2">{moment.title}</h3>
                  <p className={`text-sm opacity-85 leading-relaxed ${isOpen ? "" : "line-clamp-3"}`}>
                    {moment.detail}
                  </p>
                </button>
              );
            })}
          </div>
        </section>
      </ScrollReveal>

      {/* ================================================================ */}
      {/*  TOOLBAR: Filters + Jewish Heritage Toggle                       */}
      {/* ================================================================ */}
      <section className="roots-section">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h2 className="text-3xl font-bold">
            {t("periods_eras_title", "Explore All Eras")}
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            {/* Jewish Heritage toggle */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowJewishHeritage((v) => !v)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                showJewishHeritage
                  ? "bg-[#d4a843]/15 border-[#d4a843]/40 text-[#d4a843]"
                  : isDark
                  ? "border-white/10 opacity-70 hover:opacity-100"
                  : "border-black/10 opacity-70 hover:opacity-100"
              }`}
              aria-pressed={showJewishHeritage}
            >
              <Star className="w-4 h-4" />
              {t("toggle_jewish_heritage", "Jewish Heritage")}
            </motion.button>

            {/* Filter toggle */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowFilterPanel((v) => !v)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                showFilterPanel || activeFilters.size > 0
                  ? "bg-teal/15 border-teal/40 text-teal"
                  : isDark
                  ? "border-white/10 opacity-70 hover:opacity-100"
                  : "border-black/10 opacity-70 hover:opacity-100"
              }`}
              aria-pressed={showFilterPanel}
            >
              <Filter className="w-4 h-4" />
              {t("toggle_filters", "Filter by Records")}
              {activeFilters.size > 0 && (
                <span className="ml-1 w-5 h-5 rounded-full bg-teal text-white text-xs flex items-center justify-center">
                  {activeFilters.size}
                </span>
              )}
            </motion.button>
          </div>
        </div>

        {/* Filter panel */}
        <AnimatePresence>
          {showFilterPanel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden mb-8"
            >
              <div
                className="roots-card p-6 rounded-2xl"
                style={{
                  border: isDark
                    ? "1px solid rgba(255,255,255,0.08)"
                    : "1px solid rgba(0,0,0,0.06)",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-teal">
                    {t(
                      "filter_by_record_type",
                      "Filter by Record Type"
                    )}
                  </h3>
                  {activeFilters.size > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-terracotta hover:underline flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      {t("filter_clear_all", "Clear all")}
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {RECORD_TYPES.map((rt) => (
                    <button
                      key={rt}
                      onClick={() => toggleFilter(rt)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                        activeFilters.has(rt)
                          ? "bg-teal/15 border-teal/40 text-teal"
                          : isDark
                          ? "border-white/10 hover:border-white/25 opacity-70 hover:opacity-100"
                          : "border-black/10 hover:border-black/20 opacity-70 hover:opacity-100"
                      }`}
                    >
                      {recordTypeLabels[rt]}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================================================================ */}
        {/*  PERIOD CARDS (all 8 eras, with optional Jewish Heritage)        */}
        {/* ================================================================ */}
        <StaggerContainer className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 md:items-stretch">
          {filteredPeriods.map((period) => {
            const Icon = period.icon;
            return (
              <StaggerItem key={period.id}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="roots-card flex h-full flex-col p-8 rounded-2xl"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ background: `${period.accent}15` }}
                    >
                      <Icon
                        className="w-8 h-8"
                        style={{ color: period.accent }}
                      />
                    </div>
                    <h2 className="text-2xl font-bold">{period.title}</h2>
                  </div>

                  <p className="opacity-90 mb-4">{period.description}</p>

                  <ul className="list-disc pl-6 space-y-3 opacity-90 mb-4">
                    {period.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>

                  {/* Jewish Heritage (toggled) */}
                  <AnimatePresence>
                    {showJewishHeritage && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{
                          duration: 0.35,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="overflow-hidden"
                      >
                        <div
                          className="rounded-xl p-5 mt-2"
                          style={{
                            background: isDark
                              ? "rgba(212,168,67,0.06)"
                              : "rgba(212,168,67,0.08)",
                            border: "1px solid rgba(212,168,67,0.2)",
                          }}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <Star className="w-4 h-4 text-[#d4a843]" />
                            <h4 className="text-sm font-bold uppercase tracking-wider text-[#d4a843]">
                              {period.jewish.title}
                            </h4>
                          </div>
                          <ul className="space-y-2">
                            {period.jewish.sources.map((src, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2.5"
                              >
                                <span className="inline-block w-1.5 h-1.5 rounded-full mt-2 shrink-0 bg-[#d4a843]" />
                                <span className="opacity-85 text-sm leading-relaxed">
                                  {src}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Record type badges */}
                  <div className="flex flex-wrap gap-2 mt-auto pt-4">
                    {period.recordTypes.map((rt) => (
                      <span
                        key={rt}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                          activeFilters.has(rt as RecordType)
                            ? "bg-teal/15 text-teal"
                            : isDark
                            ? "bg-white/5 opacity-50"
                            : "bg-black/5 opacity-50"
                        }`}
                      >
                        {recordTypeLabels[rt as RecordType] || rt}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* No results */}
        {filteredPeriods.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 opacity-60"
          >
            <Filter className="w-10 h-10 mx-auto mb-3 text-teal" />
            <p className="text-lg font-medium">
              {t(
                "filter_no_results",
                "No periods match the selected filters."
              )}
            </p>
            <button
              onClick={clearFilters}
              className="mt-3 text-teal hover:underline text-sm"
            >
              {t("filter_clear_all", "Clear all")}
            </button>
          </motion.div>
        )}
      </section>

      {/* ================================================================ */}
      {/*  RESEARCH FOCUS CARDS                                            */}
      {/* ================================================================ */}
      <ScrollReveal>
        <section className="roots-section roots-section-alt">
          <h2 className="text-3xl font-bold text-center mb-8">
            {t("periods_research_focus_title", "Research Focus by Period")}
          </h2>
          <StaggerContainer className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:items-stretch">
            {recordHighlights.map((item) => {
              const HIcon = item.icon;
              return (
                <StaggerItem key={item.title}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="roots-card flex h-full flex-col p-6 rounded-2xl"
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <HIcon className="w-9 h-9 text-terracotta" />
                      <h3 className="text-2xl font-bold">{item.title}</h3>
                    </div>
                    <p className="opacity-90">{item.detail}</p>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </section>
      </ScrollReveal>

      {/* ================================================================ */}
      {/*  PERIODS BY REGION (Interactive Accordion)                       */}
      {/* ================================================================ */}
      <section
        className="roots-section roots-section-alt"
        id="periods-by-country"
      >
        <h2 className="text-4xl font-bold mb-4 border-l-8 border-teal pl-4">
          {t("periods_by_country_title", "Periods by Egyptian Region")}
        </h2>
        <p className="text-lg opacity-90 mb-6">
          {t(
            "periods_by_country_intro",
            "Historical periods and key sources for genealogical research in each region of Egypt."
          )}
        </p>
        <p className="text-sm opacity-75 mb-8">
          {t(
            "periods_click_to_expand",
            "Click a country to expand and see detailed periods and research tips."
          )}
        </p>

        <div className="space-y-4">
          {periodsByCountry.map((c) => {
            const isExpanded = expandedCountry === c.countryKey;
            return (
              <div
                key={c.countryKey}
                className={`roots-card overflow-hidden border-2 transition-all duration-300 ${
                  isExpanded
                    ? "ring-2 ring-teal ring-offset-2 dark:ring-offset-[#050c16]"
                    : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedCountry(isExpanded ? null : c.countryKey)
                  }
                  className={`w-full flex items-center justify-between gap-4 p-6 text-left ${hoverBg} transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 rounded-t-2xl`}
                  aria-expanded={isExpanded}
                  aria-controls={`periods-content-${c.countryKey}`}
                  id={`periods-header-${c.countryKey}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-teal/15 text-teal">
                      <Map className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-teal">
                        {c.country}
                      </h3>
                      <p className="text-sm opacity-80 mt-0.5 max-w-2xl">
                        {c.intro}
                      </p>
                    </div>
                  </div>
                  <span className="flex-shrink-0 text-teal" aria-hidden>
                    {isExpanded ? (
                      <ChevronDown className="w-7 h-7" />
                    ) : (
                      <ChevronRight className="w-7 h-7" />
                    )}
                  </span>
                </button>

                <div
                  id={`periods-content-${c.countryKey}`}
                  role="region"
                  aria-labelledby={`periods-header-${c.countryKey}`}
                  className={`grid transition-all duration-300 ease-out ${
                    isExpanded
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="pt-2 pb-6 px-6 border-t border-teal/20">
                      <div className="relative pl-8 space-y-6">
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal via-date-palm/60 to-terracotta/40 rounded-full" />
                        {c.periods.map((p) => (
                          <div key={p.key} className="relative">
                            <div className="absolute -left-8 flex items-center justify-center w-6 h-6 rounded-full bg-terracotta text-white">
                              <Calendar className="w-3.5 h-3.5" />
                            </div>
                            <div className="roots-card border p-4 shadow-sm">
                              <h4 className="font-bold text-lg text-terracotta mb-2">
                                {p.label}
                              </h4>
                              <p className="opacity-90 text-sm leading-relaxed">
                                {p.desc}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </RootsPageShell>
  );
}
