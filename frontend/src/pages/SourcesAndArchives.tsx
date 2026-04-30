import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Archive,
  BookOpen,
  Building2,
  ChevronDown,
  FileBadge2,
  FileSearch,
  Landmark,
  Library,
  MapPinned,
  Scale,
  Search,
  ShieldCheck,
} from "lucide-react";

import { useThemeStore } from "../store/theme";
import { useTranslation } from "../context/TranslationContext";
import RootsPageShell from "../components/RootsPageShell";
import ScrollReveal from "../components/motion/ScrollReveal";
import {
  StaggerContainer,
  StaggerItem,
} from "../components/motion/StaggerChildren";

type ArchiveFamily = "all" | "state" | "religious" | "legal" | "community";

interface ArchiveCard {
  id: string;
  family: ArchiveFamily;
  icon: typeof Archive;
  title: string;
  subtitle: string;
  description: string;
  bullets: string[];
}

export default function SourcesAndArchives() {
  const { theme } = useThemeStore();
  const { t } = useTranslation();
  const isDark = theme === "dark";

  const [query, setQuery] = useState("");
  const [family, setFamily] = useState<ArchiveFamily>("all");
  const [openCard, setOpenCard] = useState<string>("dar-al-wathaeq");

  const archiveCards = useMemo<ArchiveCard[]>(
    () => [
      {
        id: "dar-al-wathaeq",
        family: "state",
        icon: Archive,
        title: t("sources_roots_card_archives_title", "Dar al-Wathaeq al-Qawmiyya"),
        subtitle: t("sources_roots_card_archives_subtitle", "Egypt's core national archive"),
        description: t(
          "sources_roots_card_archives_desc",
          "The strongest starting point for families working from Ottoman, khedival, royal, and republican state documentation."
        ),
        bullets: [
          t("sources_roots_card_archives_b1", "Administrative series, censuses, land files, and court-adjacent references"),
          t("sources_roots_card_archives_b2", "Useful when oral history points to a governorate, district, or official post"),
          t("sources_roots_card_archives_b3", "Best paired with exact dates, family names, and village-level clues"),
        ],
      },
      {
        id: "civil-status",
        family: "state",
        icon: FileBadge2,
        title: t("sources_roots_card_civil_title", "Civil Status Offices"),
        subtitle: t("sources_roots_card_civil_subtitle", "Birth, marriage, death, and household continuity"),
        description: t(
          "sources_roots_card_civil_desc",
          "Modern civil records bridge living families to earlier generations and usually anchor the first verified steps of the tree."
        ),
        bullets: [
          t("sources_roots_card_civil_b1", "Birth, marriage, and death extracts"),
          t("sources_roots_card_civil_b2", "Family registration details and identity-document connections"),
          t("sources_roots_card_civil_b3", "Most powerful when combined with neighborhood, village, and mother/father names"),
        ],
      },
      {
        id: "sharia-awqaf",
        family: "legal",
        icon: Scale,
        title: t("sources_roots_card_courts_title", "Sharia Courts and Awqaf Records"),
        subtitle: t("sources_roots_card_courts_subtitle", "Marriage, inheritance, guardianship, and endowments"),
        description: t(
          "sources_roots_card_courts_desc",
          "These records often reveal kinship structures that civil extracts do not: spouses, guardians, heirs, properties, and family obligations."
        ),
        bullets: [
          t("sources_roots_card_courts_b1", "Marriage contracts, inheritance settlements, guardianship cases"),
          t("sources_roots_card_courts_b2", "Awqaf deeds that preserve lineage, place, and social role"),
          t("sources_roots_card_courts_b3", "Excellent for rebuilding missing branches and confirming relationships"),
        ],
      },
      {
        id: "al-azhar",
        family: "religious",
        icon: Library,
        title: t("sources_roots_card_azhar_title", "Al-Azhar and Scholarly Registers"),
        subtitle: t("sources_roots_card_azhar_subtitle", "Families of scholars, judges, teachers, and students"),
        description: t(
          "sources_roots_card_azhar_desc",
          "For lineages tied to religious education, scholarship, or judicial circles, Al-Azhar-related records can reveal generational continuity."
        ),
        bullets: [
          t("sources_roots_card_azhar_b1", "Study circles, appointments, ijazat, and biographical references"),
          t("sources_roots_card_azhar_b2", "Particularly useful for urban scholarly families in Cairo and beyond"),
          t("sources_roots_card_azhar_b3", "Works best with nisba names, titles, and place associations"),
        ],
      },
      {
        id: "coptic-registers",
        family: "religious",
        icon: BookOpen,
        title: t("sources_roots_card_coptic_title", "Coptic Church Registers"),
        subtitle: t("sources_roots_card_coptic_subtitle", "Baptism, marriage, burial, and parish continuity"),
        description: t(
          "sources_roots_card_coptic_desc",
          "For Coptic families, parish records often preserve the most continuous thread of identity across generations."
        ),
        bullets: [
          t("sources_roots_card_coptic_b1", "Sacramental records linked to parish life"),
          t("sources_roots_card_coptic_b2", "Can clarify naming patterns, godparents, and family clusters"),
          t("sources_roots_card_coptic_b3", "Especially useful when civil records are late or incomplete"),
        ],
      },
      {
        id: "community-private",
        family: "community",
        icon: Building2,
        title: t("sources_roots_card_private_title", "Community and Private Collections"),
        subtitle: t("sources_roots_card_private_subtitle", "Family notebooks, deeds, letters, studio portraits"),
        description: t(
          "sources_roots_card_private_desc",
          "Some of the most precise family evidence never enters a formal archive. Roots Egypt should treat private collections as first-class sources."
        ),
        bullets: [
          t("sources_roots_card_private_b1", "Sale deeds, waqf copies, memorial cards, letters, notebooks"),
          t("sources_roots_card_private_b2", "Helps decode nicknames, branch names, and migration stories"),
          t("sources_roots_card_private_b3", "Always record provenance before copying details into the tree"),
        ],
      },
      {
        id: "regional-maps",
        family: "community",
        icon: MapPinned,
        title: t("sources_roots_card_maps_title", "Regional Maps and Local Gazetteers"),
        subtitle: t("sources_roots_card_maps_subtitle", "Villages, quarters, hamlets, and migration routes"),
        description: t(
          "sources_roots_card_maps_desc",
          "Place names shift over time. Mapping old and current administrative names is often what unlocks the next archive request."
        ),
        bullets: [
          t("sources_roots_card_maps_b1", "Use district names, village variants, and old quarter references"),
          t("sources_roots_card_maps_b2", "Track movement between Cairo, Delta, Upper Egypt, canal cities, and diaspora"),
          t("sources_roots_card_maps_b3", "Essential when a family keeps the memory of origin but not the exact modern spelling"),
        ],
      },
    ],
    [t]
  );

  const archiveFamilies = useMemo(
    () => [
      { id: "all" as const, label: t("sources_filter_all", "All repositories") },
      { id: "state" as const, label: t("sources_filter_state", "State archives") },
      { id: "legal" as const, label: t("sources_filter_legal", "Courts and deeds") },
      { id: "religious" as const, label: t("sources_filter_religious", "Religious records") },
      { id: "community" as const, label: t("sources_filter_community", "Community collections") },
    ],
    [t]
  );

  const researchLanes = useMemo(
    () => [
      {
        icon: Search,
        title: t("sources_lane_1_title", "Start with what the family already knows"),
        text: t(
          "sources_lane_1_text",
          "Collect names in Arabic, nicknames, branch names, occupations, village memories, and migration stories before you request a single document."
        ),
      },
      {
        icon: Landmark,
        title: t("sources_lane_2_title", "Anchor the line with official records"),
        text: t(
          "sources_lane_2_text",
          "Move from living civil records toward court, waqf, parish, and archival material until names repeat across independent sources."
        ),
      },
      {
        icon: ShieldCheck,
        title: t("sources_lane_3_title", "Record provenance at every step"),
        text: t(
          "sources_lane_3_text",
          "Every date, relationship, and title should keep its source note so the tree remains defensible when the family returns to review it."
        ),
      },
    ],
    [t]
  );

  const verificationSteps = useMemo(
    () => [
      t("sources_verify_1", "Match people through at least two independent record families whenever possible."),
      t("sources_verify_2", "Preserve variant spellings rather than forcing one modern spelling too early."),
      t("sources_verify_3", "Separate what is documented, inferred, and still oral-only."),
      t("sources_verify_4", "Note archive shelfmarks, office names, parish names, and retrieval dates."),
    ],
    [t]
  );

  const visibleCards = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return archiveCards.filter((card) => {
      if (family !== "all" && card.family !== family) return false;
      if (!needle) return true;
      return [card.title, card.subtitle, card.description, ...card.bullets]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [archiveCards, family, query]);

  const surfaceClass = isDark
    ? "bg-white/5 border-white/10"
    : "bg-white/80 border-[#d8c7b0]/60";

  return (
    <RootsPageShell
      hero={
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.28em] text-[#d4a843]">
            {t("sources_archives_eyebrow", "Research Resources")}
          </p>
          <h1>{t("sources_archives_title", "Sources and Archives for Roots Egypt")}</h1>
          <p className="text-lg opacity-90">
            {t(
              "sources_archives_intro_new",
              "A cleaner route through Egypt's civil, court, religious, and community records - built to help families move from memory to evidence with confidence."
            )}
          </p>
        </div>
      }
    >
      <section className="roots-section">
        <StaggerContainer className="grid gap-6 lg:grid-cols-3">
          {researchLanes.map((lane) => (
            <StaggerItem key={lane.title}>
              <div className="roots-card h-full p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0c4a6e]/10 text-teal">
                  <lane.icon className="h-6 w-6" />
                </div>
                <h2 className="mb-3 text-2xl font-bold">{lane.title}</h2>
                <p className="opacity-85">{lane.text}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      <section className="roots-section roots-section-alt">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="roots-heading">
              {t("sources_archive_hubs_title", "Archive Hubs and Evidence Families")}
            </h2>
            <p className="max-w-3xl opacity-85">
              {t(
                "sources_archive_hubs_intro",
                "Filter the repository types below, then open a card to see when that source is strong and what kind of genealogical proof it usually gives you."
              )}
            </p>
          </div>
          <div className={`flex w-full max-w-xl items-center gap-3 rounded-2xl border px-4 py-3 ${surfaceClass}`}>
            <Search className="h-4 w-4 shrink-0 opacity-60" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("sources_search_placeholder_new", "Search archive types, document families, and workflows...")}
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {archiveFamilies.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFamily(item.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                family === item.id
                  ? "bg-gradient-to-r from-[#0c4a6e] to-teal text-white shadow-lg shadow-[#0c4a6e]/20"
                  : isDark
                    ? "bg-white/6 text-white/75 hover:bg-white/10"
                    : "bg-[#0c4a6e]/6 text-[#0c4a6e] hover:bg-[#0c4a6e]/10"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          {visibleCards.map((card) => {
            const isOpen = openCard === card.id;
            return (
              <motion.article
                key={card.id}
                layout
                className="roots-card overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenCard(isOpen ? "" : card.id)}
                  className="flex w-full items-start gap-4 p-6 text-left"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#d4a843]/12 text-[#d4a843]">
                    <card.icon className="h-7 w-7" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal/80">
                      {card.subtitle}
                    </p>
                    <h3 className="mt-2 text-2xl font-bold leading-tight">{card.title}</h3>
                    <p className={`mt-3 text-sm opacity-80 ${isOpen ? "" : "line-clamp-2"}`}>
                      {card.description}
                    </p>
                  </div>
                  <ChevronDown
                    className={`mt-2 h-5 w-5 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.24 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6">
                        <div className={`rounded-2xl border p-4 ${surfaceClass}`}>
                          <ul className="space-y-3">
                            {card.bullets.map((bullet) => (
                              <li key={bullet} className="flex items-start gap-3 text-sm leading-6">
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d4a843]" />
                                <span>{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.article>
            );
          })}
        </div>

        {visibleCards.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-[#d4a843]/30 px-6 py-10 text-center opacity-80">
            {t("sources_no_results", "No archive groups matched that search. Try a broader family name, office type, or record category.")}
          </div>
        ) : null}
      </section>

      <ScrollReveal>
        <section className="roots-section">
          <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="roots-card p-7">
              <h2 className="roots-heading">
                {t("sources_workflow_title", "A Strong Roots Egypt Workflow")}
              </h2>
              <div className="space-y-4">
                {verificationSteps.map((step, index) => (
                  <div key={step} className={`rounded-2xl border p-4 ${surfaceClass}`}>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.25em] text-[#d4a843]">
                      {t("sources_step_label", "Step")} {index + 1}
                    </p>
                    <p className="text-sm leading-6 opacity-90">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="roots-card p-7">
              <h2 className="roots-heading">
                {t("sources_checklist_title", "Before You Request a Record")}
              </h2>
              <div className="space-y-4">
                {[
                  {
                    icon: FileSearch,
                    title: t("sources_checklist_1_title", "Normalize names"),
                    text: t("sources_checklist_1_text", "Write Arabic spellings, common Latin spellings, branch names, and honorifics together."),
                  },
                  {
                    icon: MapPinned,
                    title: t("sources_checklist_2_title", "Lock the place"),
                    text: t("sources_checklist_2_text", "List governorate, district, village, quarter, and any older local name you have heard in the family."),
                  },
                  {
                    icon: ShieldCheck,
                    title: t("sources_checklist_3_title", "Define the proof you need"),
                    text: t("sources_checklist_3_text", "Know whether you are proving identity, marriage, parentage, inheritance, or migration before searching."),
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4 rounded-2xl border p-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal/10 text-teal">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{item.title}</h3>
                      <p className="mt-2 text-sm opacity-85">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </RootsPageShell>
  );
}
