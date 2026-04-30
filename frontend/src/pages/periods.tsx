import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Building2,
  CalendarRange,
  ChevronDown,
  Crown,
  Landmark,
  MapPinned,
  ScrollText,
  Shield,
} from "lucide-react";

import { useThemeStore } from "../store/theme";
import { useTranslation } from "../context/TranslationContext";
import RootsPageShell from "../components/RootsPageShell";
import ScrollReveal from "../components/motion/ScrollReveal";
import {
  StaggerContainer,
  StaggerItem,
} from "../components/motion/StaggerChildren";

type RecordFilter =
  | "all"
  | "state"
  | "religious"
  | "court"
  | "land"
  | "community";

interface EraCard {
  id: string;
  icon: typeof Crown;
  accent: string;
  range: string;
  title: string;
  summary: string;
  records: RecordFilter[];
  bullets: string[];
}

export default function Periods() {
  const { theme } = useThemeStore();
  const { t } = useTranslation();
  const isDark = theme === "dark";

  const [activeFilter, setActiveFilter] = useState<RecordFilter>("all");
  const [openRegion, setOpenRegion] = useState<string>("greater-cairo");

  const eras = useMemo<EraCard[]>(
    () => [
      {
        id: "ancient",
        icon: Crown,
        accent: "#c45c3e",
        range: t("periods_range_ancient", "Ancient to Late Antique"),
        title: t("periods_title_ancient_new", "Pharaonic, Ptolemaic, and Roman Egypt"),
        summary: t(
          "periods_summary_ancient_new",
          "Best for elite, temple, military-colony, and place-based research rather than continuous household reconstruction."
        ),
        records: ["religious", "state", "community"],
        bullets: [
          t("periods_ancient_b1_new", "Temple inscriptions, papyri, and elite genealogical references"),
          t("periods_ancient_b2_new", "Administrative rolls, tax notes, and local documentary fragments"),
          t("periods_ancient_b3_new", "Context-rich but uneven for ordinary families"),
        ],
      },
      {
        id: "early-islamic",
        icon: ScrollText,
        accent: "#0d9488",
        range: t("periods_range_early_islamic", "641 - 969"),
        title: t("periods_title_early_islamic_new", "Early Islamic Egypt"),
        summary: t(
          "periods_summary_early_islamic_new",
          "Useful for tax, land, and emerging judicial frameworks that later become the backbone of family reconstruction."
        ),
        records: ["state", "court", "land"],
        bullets: [
          t("periods_early_islamic_b1_new", "Administrative papyri and tax structures"),
          t("periods_early_islamic_b2_new", "Early legal and inheritance patterns"),
          t("periods_early_islamic_b3_new", "Bridge period for later urban and provincial archive habits"),
        ],
      },
      {
        id: "fatimid-ayyubid",
        icon: Shield,
        accent: "#d4a843",
        range: t("periods_range_fatimid_ayyubid", "969 - 1250"),
        title: t("periods_title_fatimid_ayyubid_new", "Fatimid and Ayyubid Egypt"),
        summary: t(
          "periods_summary_fatimid_ayyubid_new",
          "A key era for Cairo's scholarly, mercantile, and communal worlds, especially when combined with Geniza-adjacent and judicial evidence."
        ),
        records: ["religious", "court", "community"],
        bullets: [
          t("periods_fatimid_b1_new", "Urban court culture and endowment documentation"),
          t("periods_fatimid_b2_new", "Scholarly networks, teaching circles, and institutional references"),
          t("periods_fatimid_b3_new", "Powerful for urban social history and named family clusters"),
        ],
      },
      {
        id: "mamluk",
        icon: Landmark,
        accent: "#8b5e3c",
        range: t("periods_range_mamluk", "1250 - 1517"),
        title: t("periods_title_mamluk_new", "Mamluk Egypt"),
        summary: t(
          "periods_summary_mamluk_new",
          "A strong period for court, waqf, guild, and urban property research, especially where families held status, craft identity, or endowments."
        ),
        records: ["court", "land", "community"],
        bullets: [
          t("periods_mamluk_b1_new", "Marriage, inheritance, and waqf records"),
          t("periods_mamluk_b2_new", "Urban craft, trade, and quarter-based references"),
          t("periods_mamluk_b3_new", "Helpful for reconstructing socially visible lineages"),
        ],
      },
      {
        id: "ottoman",
        icon: Building2,
        accent: "#0c4a6e",
        range: t("periods_range_ottoman_new", "1517 - 1882"),
        title: t("periods_title_ottoman_new_2", "Ottoman and Khedival Egypt"),
        summary: t(
          "periods_summary_ottoman_new_2",
          "For most Roots Egypt research, this is where archival reconstruction becomes much more practical and repeatable."
        ),
        records: ["state", "court", "land", "religious"],
        bullets: [
          t("periods_ottoman_b1_new_2", "Court registers, taxation, and provincial administration"),
          t("periods_ottoman_b2_new_2", "Landholding, waqf chains, and local authority records"),
          t("periods_ottoman_b3_new_2", "Excellent for tracing families across governorates and districts"),
        ],
      },
      {
        id: "colonial",
        icon: CalendarRange,
        accent: "#2563eb",
        range: t("periods_range_colonial", "1882 - 1952"),
        title: t("periods_title_colonial_new", "British Occupation and the Kingdom of Egypt"),
        summary: t(
          "periods_summary_colonial_new",
          "One of the best eras for combining census-style administration, civil registration, photography, and changing urban identity."
        ),
        records: ["state", "land", "community"],
        bullets: [
          t("periods_colonial_b1_new", "Cadastral surveys, census-related administration, and municipality records"),
          t("periods_colonial_b2_new", "Studio portrait culture and expanding paper trails"),
          t("periods_colonial_b3_new", "Very useful for matching modern families to late Ottoman roots"),
        ],
      },
      {
        id: "republic",
        icon: MapPinned,
        accent: "#059669",
        range: t("periods_range_republic", "1952 - Present"),
        title: t("periods_title_republic_new", "Republican and Contemporary Egypt"),
        summary: t(
          "periods_summary_republic_new",
          "The modern bridge to living memory, civil registration, consular records, migration histories, and family-held photographs."
        ),
        records: ["state", "community", "religious"],
        bullets: [
          t("periods_republic_b1_new", "Civil registry continuity and official extracts"),
          t("periods_republic_b2_new", "Diaspora, migration, military service, and education trails"),
          t("periods_republic_b3_new", "Critical for validating oral history before going backward"),
        ],
      },
    ],
    [t]
  );

  const filters = useMemo(
    () => [
      { id: "all" as const, label: t("periods_filter_all_new", "All records") },
      { id: "state" as const, label: t("periods_filter_state_new", "State") },
      { id: "religious" as const, label: t("periods_filter_religious_new", "Religious") },
      { id: "court" as const, label: t("periods_filter_court_new", "Court") },
      { id: "land" as const, label: t("periods_filter_land_new", "Land and waqf") },
      { id: "community" as const, label: t("periods_filter_community_new", "Community") },
    ],
    [t]
  );

  const visibleEras = useMemo(
    () =>
      eras.filter((era) =>
        activeFilter === "all" ? true : era.records.includes(activeFilter)
      ),
    [activeFilter, eras]
  );

  const regionalGuides = useMemo(
    () => [
      {
        id: "greater-cairo",
        title: t("periods_region_cairo_title", "Greater Cairo"),
        summary: t(
          "periods_region_cairo_summary",
          "The densest mix of civil, court, scholarly, communal, and photographic evidence."
        ),
        bullets: [
          t("periods_region_cairo_b1", "Strongest for urban court, parish, school, and notarial trails"),
          t("periods_region_cairo_b2", "Use quarter names, mosque or church links, and occupational clues"),
          t("periods_region_cairo_b3", "Dar al-Wathaeq and institutional archives often connect here"),
        ],
      },
      {
        id: "delta",
        title: t("periods_region_delta_title", "Nile Delta"),
        summary: t(
          "periods_region_delta_summary",
          "Research often pivots on village continuity, landholding, migration to Cairo, and family branch names."
        ),
        bullets: [
          t("periods_region_delta_b1", "Track district and village spellings carefully"),
          t("periods_region_delta_b2", "Land, waqf, and marriage ties can connect branches across nearby settlements"),
          t("periods_region_delta_b3", "Useful when family memory preserves an origin place but not exact dates"),
        ],
      },
      {
        id: "upper-egypt",
        title: t("periods_region_upper_title", "Upper Egypt"),
        summary: t(
          "periods_region_upper_summary",
          "Oral continuity is often strong here, and it becomes especially powerful when paired with church, court, waqf, and local civil records."
        ),
        bullets: [
          t("periods_region_upper_b1", "Build from parish, family, and village memory together"),
          t("periods_region_upper_b2", "Note nisba names, branch names, and migration to canal or capital cities"),
          t("periods_region_upper_b3", "Upper Egypt research often rewards patience and multi-source validation"),
        ],
      },
      {
        id: "alexandria-canal",
        title: t("periods_region_alex_title", "Alexandria and Canal Cities"),
        summary: t(
          "periods_region_alex_summary",
          "Trade, mobility, ports, schools, and foreign contact create richer twentieth-century paper trails."
        ),
        bullets: [
          t("periods_region_alex_b1", "Look for municipal, port, school, and consular clues"),
          t("periods_region_alex_b2", "Families may appear under mixed-language spellings"),
          t("periods_region_alex_b3", "Particularly strong for late Ottoman, colonial, and modern periods"),
        ],
      },
    ],
    [t]
  );

  const filterBadgeClass = isDark
    ? "bg-white/7 text-white/70 hover:bg-white/12"
    : "bg-[#0c4a6e]/6 text-[#0c4a6e] hover:bg-[#0c4a6e]/10";

  return (
    <RootsPageShell
      hero={
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.28em] text-[#d4a843]">
            {t("periods_eyebrow_new", "Timeline and Context")}
          </p>
          <h1>{t("periods_hero_title_new", "Historical Periods for Roots Egypt Research")}</h1>
          <p className="text-lg opacity-90">
            {t(
              "periods_hero_intro_new",
              "A clearer period guide for deciding which records to expect, which names to trust, and how far a specific archive trail can really take your family."
            )}
          </p>
        </div>
      }
    >
      <section className="roots-section">
        <div className="mb-6 flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeFilter === filter.id
                  ? "bg-gradient-to-r from-[#0c4a6e] to-teal text-white shadow-lg shadow-[#0c4a6e]/20"
                  : filterBadgeClass
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <StaggerContainer className="grid gap-6 xl:grid-cols-2">
          {visibleEras.map((era) => (
            <StaggerItem key={era.id}>
              <motion.article whileHover={{ y: -4 }} className="roots-card h-full p-7">
                <div className="mb-5 flex items-start gap-4">
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: `${era.accent}18`, color: era.accent }}
                  >
                    <era.icon className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: era.accent }}>
                      {era.range}
                    </p>
                    <h2 className="mt-2 text-3xl font-bold leading-tight">{era.title}</h2>
                  </div>
                </div>

                <p className="mb-5 text-sm leading-7 opacity-90">{era.summary}</p>

                <ul className="space-y-3">
                  {era.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3 text-sm leading-6 opacity-85">
                      <span
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: era.accent }}
                      />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-wrap gap-2">
                  {era.records.map((record) => (
                    <span
                      key={record}
                      className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]"
                      style={{
                        backgroundColor: `${era.accent}12`,
                        color: era.accent,
                        border: `1px solid ${era.accent}25`,
                      }}
                    >
                      {filters.find((item) => item.id === record)?.label ?? record}
                    </span>
                  ))}
                </div>
              </motion.article>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      <ScrollReveal>
        <section className="roots-section roots-section-alt">
          <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="roots-card p-7">
              <h2 className="roots-heading">
                {t("periods_strategy_title_new", "How to Use the Timeline")}
              </h2>
              <div className="space-y-4">
                {[
                  {
                    title: t("periods_strategy_1_title", "Start from the latest secure point"),
                    text: t("periods_strategy_1_text", "Modern civil and family-held records should define the line before earlier eras are used for extension."),
                  },
                  {
                    title: t("periods_strategy_2_title", "Choose the right period expectation"),
                    text: t("periods_strategy_2_text", "Not every era can support the same level of family reconstruction. Use each period for the type of proof it is actually strong at."),
                  },
                  {
                    title: t("periods_strategy_3_title", "Let place guide period depth"),
                    text: t("periods_strategy_3_text", "Cairo, Delta, Upper Egypt, and coastal cities do not preserve the same paper trail. Regional context should shape the search plan."),
                  },
                ].map((item, index) => (
                  <div key={item.title} className="rounded-2xl border p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#d4a843]">
                      {t("periods_strategy_step_label", "Step")} {index + 1}
                    </p>
                    <h3 className="text-xl font-bold">{item.title}</h3>
                    <p className="mt-2 text-sm opacity-85">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="roots-card p-7">
              <h2 className="roots-heading">
                {t("periods_regions_title_new", "Research by Egyptian Region")}
              </h2>
              <div className="space-y-4">
                {regionalGuides.map((region) => {
                  const isOpen = openRegion === region.id;
                  return (
                    <div key={region.id} className="overflow-hidden rounded-2xl border">
                      <button
                        type="button"
                        onClick={() => setOpenRegion(isOpen ? "" : region.id)}
                        className="flex w-full items-start gap-4 px-5 py-4 text-left"
                      >
                        <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-teal/10 text-teal">
                          <MapPinned className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-xl font-bold">{region.title}</h3>
                          <p className={`mt-2 text-sm opacity-80 ${isOpen ? "" : "line-clamp-2"}`}>
                            {region.summary}
                          </p>
                        </div>
                        <ChevronDown
                          className={`mt-2 h-5 w-5 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        />
                      </button>

                      {isOpen ? (
                        <div className="px-5 pb-5">
                          <div className={`rounded-2xl border p-4 ${isDark ? "bg-white/5" : "bg-white/80"}`}>
                            <ul className="space-y-3">
                              {region.bullets.map((bullet) => (
                                <li key={bullet} className="flex gap-3 text-sm leading-6 opacity-90">
                                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d4a843]" />
                                  <span>{bullet}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </RootsPageShell>
  );
}
