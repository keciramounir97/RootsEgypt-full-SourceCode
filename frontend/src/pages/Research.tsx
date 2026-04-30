import { useThemeStore } from "../store/theme";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Scroll,
  Map,
  BookOpen,
  Users,
  Compass,
  FileText,
  Download,
  ExternalLink,
  UserCircle2,
  Eye,
  X,
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import { useTranslation } from "../context/TranslationContext";
import { api } from "../api/client";
import TreesBuilder, { parseGedcom, parseGedcomX } from "../admin/components/TreesBuilder";
import ErrorBoundary from "../components/ErrorBoundary";
import RootsPageShell from "../components/RootsPageShell";

export default function Research() {
  const { theme } = useThemeStore();
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState({ trees: [], books: [], people: [] });
  const [suggestedTrees, setSuggestedTrees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [viewTree, setViewTree] = useState(null);
  const [viewPeople, setViewPeople] = useState([]);
  const [viewTreeError, setViewTreeError] = useState("");
  const [viewLoading, setViewLoading] = useState(false);
  const searchTimerRef = useRef(null);

  const apiRoot = useMemo(() => {
    const base = String(api.defaults.baseURL || "");
    return base.replace(/\/api\/?$/, "");
  }, []);

  const downloadUrl = useCallback(
    (id) => `${apiRoot}/api/books/${id}/download`,
    [apiRoot]
  );


  const handleSearch = useCallback(
    async (queryOverride) => {
      const q = typeof queryOverride === "string" ? queryOverride : searchQuery;
      if (!q.trim()) {
        setSearched(false);
        return;
      }

      setLoading(true);
      setSearched(true);

      try {
        const { data } = await api.get(`/search?q=${encodeURIComponent(q)}`);
        setResults({
          trees: Array.isArray(data?.trees) ? data.trees : [],
          books: Array.isArray(data?.books) ? data.books : [],
          people: Array.isArray(data?.people) ? data.people : [],
        });
      } catch (err) {
        // Search error
      } finally {
        setLoading(false);
      }
    },
    [searchQuery]
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) {
      setSearchQuery(q);
    } else {
      (async () => {
        try {
          const { data } = await api.get("/trees");
          setSuggestedTrees(Array.isArray(data) ? data.slice(0, 6) : []);
        } catch {
          // Silently fail for suggestions
        }
      })();
    }
  }, []);

  useEffect(() => {
    const q = String(searchQuery || "").trim();
    if (!q) {
      setSearched(false);
      return;
    }

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    searchTimerRef.current = window.setTimeout(() => handleSearch(q), 350);

    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, [searchQuery, handleSearch]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleViewTree = useCallback(async (tree) => {
    if (!tree) return;
    setViewTree(tree);
    setViewPeople([]);
    setViewTreeError("");
    setViewLoading(true);

    try {
      const isPublic =
        tree?.isPublic ?? tree?.is_public ?? tree?.tree_is_public ?? true;
      const endpoint = isPublic
        ? `/trees/${tree.id}/gedcom`
        : `/my/trees/${tree.id}/gedcom`;
      const { data } = await api.get(endpoint, { responseType: "text" });
      const raw = typeof data === "string" ? data : (data && data.data != null ? String(data.data) : "");
      const isGedcomX = /^\s*(\{|\<\?xml)/.test(raw);
      const people = isGedcomX ? parseGedcomX(raw) : parseGedcom(raw);
      const list = Array.isArray(people) ? people : [];
      setViewPeople(list);
      if (!list.length) {
        setViewTreeError(t("gedcom_no_people", "No individuals found in GEDCOM."));
      }
    } catch (err) {
      setViewPeople([]);
      setViewTreeError(err?.response?.data?.message || err?.message || t("tree_builder_error", "Failed to load tree."));
    } finally {
      setViewLoading(false);
    }
  }, [t]);

  const heroContent = (
    <div className="space-y-5 text-center max-w-3xl mx-auto">
      <p className="text-xs uppercase tracking-[0.35em] text-teal">
        {t("research_hero_kicker", "Research Center")}
      </p>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
        {t("research_center_title", "Genealogical Research Center")}
      </h1>
      <p className="max-w-2xl mx-auto text-base sm:text-lg opacity-90 text-pretty">
        {t(
          "research_intro",
          "Explore archival methods and record types for Egyptian genealogy — from Ottoman-era registers and waqf deeds to modern civil status."
        )}
      </p>
    </div>
  );

  const sectionCard = theme === "dark" ? "bg-[#121a28]" : "bg-[#f7f3eb]";
  const sectionBorder =
    theme === "dark" ? "border-white/10" : "border-[color:var(--border-color)]";

  const researchCategories = useMemo(
    () => [
      {
        icon: Scroll,
        title: t("research_cat_court_title", "Ottoman & Islamic courts in Egypt"),
        desc: t(
          "research_cat_court_desc",
          "Sharia registers, waqf ledgers, and provincial administration in Cairo, Alexandria, and Upper Egypt."
        ),
      },
      {
        icon: FileText,
        title: t("research_cat_civil_title", "Colonial & civil status"),
        desc: t(
          "research_cat_civil_desc",
          "British administration files, overseas archives (e.g. ANOM), and modern Egyptian civil registry extracts."
        ),
      },
      {
        icon: Users,
        title: t("research_cat_lineage_title", "Lineage & communities"),
        desc: t(
          "research_cat_lineage_desc",
          "Coptic parish registers, rural leadership records, Sa‘idi and Delta oral histories, and family manuscripts."
        ),
      },
    ],
    [t]
  );

  const researchGuides = useMemo(
    () => [
      {
        icon: BookOpen,
        title: t("research_guide_ottoman_title", "Reading Ottoman-era documents"),
        desc: t("research_guide_ottoman_desc", "Scripts, formulas, and naming patterns in Egyptian court registers."),
      },
      {
        icon: Compass,
        title: t("research_guide_trace_title", "Tracing displaced branches"),
        desc: t("research_guide_trace_desc", "Follow migrations within Egypt and the diaspora using several sources."),
      },
      {
        icon: Map,
        title: t("research_guide_archive_title", "Using Egyptian archives"),
        desc: t("research_guide_archive_desc", "Dar al-Wathaeq, governorate civil offices, and church-held registers."),
      },
      {
        icon: Users,
        title: t("research_guide_oral_title", "Oral history interviews"),
        desc: t("research_guide_oral_desc", "Structured conversations with elders about names, places, and kinship."),
      },
    ],
    [t]
  );

  const researchTimeline = useMemo(
    () => [
      {
        period: t("research_tl_1_period", "3100 BC – 641 AD — Ancient to late antique"),
        detail: t(
          "research_tl_1_detail",
          "Royal and temple inscriptions, papyri, and late antique sources where they survive."
        ),
      },
      {
        period: t("research_tl_2_period", "641 – 1517 — Islamic & Mamluk Egypt"),
        detail: t("research_tl_2_detail", "Chronicles, waqf, and early Sharia documentation of families and property."),
      },
      {
        period: t("research_tl_3_period", "1517 – 1882 — Ottoman Egypt"),
        detail: t("research_tl_3_detail", "Provincial courts, tax rolls, and patrilineal naming in imperial registers."),
      },
      {
        period: t("research_tl_4_period", "1882 – present — Modern Egypt"),
        detail: t(
          "research_tl_4_detail",
          "Civil status, national ID, Dar al-Wathaeq, and diaspora consular documentation."
        ),
      },
    ],
    [t]
  );

  return (
    <RootsPageShell hero={heroContent}>
      <section className="roots-section" data-aos="fade-up">
        <div className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold border-l-4 border-teal pl-4">
            {t("search_research_materials", "Search Research Materials")}
          </h2>
          <div
            className={`flex flex-col md:flex-row gap-4 p-6 rounded-2xl border ${sectionBorder} ${sectionCard} shadow-neu`}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-[color:var(--color-nile)] opacity-80 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!e.target.value) setSearched(false);
                }}
                onKeyDown={handleKeyDown}
                placeholder={t(
                  "search_placeholder",
                  "Search ancestors, archives, regions..."
                )}
                className={`w-full pl-10 py-3 rounded-md bg-transparent border ${sectionBorder} outline-none ${theme === "dark" ? "text-white" : "text-[#091326]"
                  }`}
              />
            </div>
            <button
              type="button"
              onClick={() => handleSearch()}
              className="interactive-btn btn-neu btn-neu--primary px-8 py-3 shrink-0"
            >
              {t("search_button", "Search")}
            </button>
          </div>

          {searched && (
            <div className="space-y-8">
              {loading ? (
                <div className="text-center opacity-70">{t("searching", "Searching...")}</div>
              ) : (
                <div className="space-y-8">
                  <ResultSection
                    title={t("books_and_documents", "Books & Documents")}
                    count={results.books.length}
                    borderColor={sectionBorder}
                    items={results.books}
                    renderItem={(book, idx) => (
                      <BookResult
                        key={book.id || idx}
                        book={book}
                        downloadUrl={downloadUrl}
                        borderColor={sectionBorder}
                      />
                    )}
                  />
                  <ResultSection
                    title={t("people_label", "People")}
                    count={results.people.length}
                    borderColor={sectionBorder}
                    items={results.people}
                    renderItem={(person, idx) => (
                      <PersonResult
                        key={person.id || idx}
                        person={person}
                        borderColor={sectionBorder}
                        onView={() =>
                          handleViewTree({
                            id: person.tree_id,
                            title: person.tree_title || t("unknown_tree_title", "Unknown tree"),
                            description: person.tree_description || "",
                            owner_name: person.owner_name || person.owner || "",
                            isPublic: person.tree_is_public,
                          })
                        }
                      />
                    )}
                  />
                  <ResultSection
                    title={t("trees", "Family Trees")}
                    count={results.trees.length}
                    borderColor={sectionBorder}
                    items={results.trees}
                    renderItem={(tree, idx) => (
                      <TreeResult
                        key={tree.id || idx}
                        tree={tree}
                        borderColor={sectionBorder}
                        onView={() => handleViewTree(tree)}
                      />
                    )}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {!searched && suggestedTrees.length > 0 && (
        <section className="roots-section roots-section-alt" data-aos="fade-up">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">
              {t("suggested_public_trees", "Suggested Public Family Trees")}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestedTrees.map((tree, idx) => (
                <div
                  key={tree.id || idx}
                  className={`${sectionCard} p-6 rounded-2xl border ${sectionBorder} shadow-neu`}
                >
                  <div className="w-12 h-12 rounded-full bg-[color:var(--color-nile)]/10 flex items-center justify-center mb-4 text-[color:var(--color-nile)]">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{tree.title}</h3>
                  <p className="text-sm opacity-70 mb-4 line-clamp-3">
                    {tree.description ||
                      t("explore_public_tree_desc", "Explore this public family tree to discover connections.")}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-500/10 mb-4">
                    <span className="text-xs opacity-60">
                      {t("owner", "Owner")}: {tree.owner_name || tree.owner || "Admin"}
                    </span>
                    <span className="text-xs bg-teal/15 text-teal px-2 py-1 rounded">
                      {t("public", "Public")}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleViewTree(tree)}
                    className="interactive-btn btn-neu btn-neu--primary w-full py-2.5 flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    {t("view_tree", "View Tree")}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="roots-section" data-aos="fade-up">
        <div className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold border-l-4 border-terracotta pl-4">
            {t("research_categories", "Research Categories")}
          </h2>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {researchCategories.map((item, idx) => {
              const catTone = ["text-teal", "text-primary-brown", "text-terracotta"][idx % 3];
              return (
              <div
                key={idx}
                className={`${sectionCard} p-8 rounded-2xl border ${sectionBorder} shadow-neu text-center`}
              >
                <item.icon className={`w-12 h-12 mx-auto mb-4 ${catTone}`} />
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="opacity-90 text-pretty">{item.desc}</p>
              </div>
            );
            })}
          </div>
        </div>
      </section>

      <section className="roots-section roots-section-alt" data-aos="fade-up">
        <div className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold border-l-4 border-terracotta pl-4">
            {t("research_guides_title", "Research Guides & Tutorials")}
          </h2>
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {researchGuides.map((item, idx) => {
              const guideIconTone = ["text-teal", "text-terracotta", "text-lotus-deep", "text-date-palm"][idx % 4];
              return (
              <div
                key={idx}
                className={`${sectionCard} p-6 rounded-2xl border ${sectionBorder} shadow-neu`}
              >
                <item.icon className={`w-10 h-10 mb-4 ${guideIconTone}`} />
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="opacity-90 text-pretty">{item.desc}</p>
              </div>
            );
            })}
          </div>
        </div>
      </section>

      <section data-aos="fade-up">
        <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">
          {t("research_timeline_heading", "Egypt — timeline for genealogists")}
        </h2>
        <div className="relative border-l-4 border-teal ml-4 sm:ml-6 space-y-8">
          {researchTimeline.map((item, idx) => (
            <div
              key={item.period}
              className="pl-6 sm:pl-8"
              data-aos="fade-right"
              data-aos-delay={idx * 120}
            >
              <h3 className="text-lg sm:text-xl font-bold">{item.period}</h3>
              <p className="opacity-80 mt-1 text-pretty">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {viewTree && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`${sectionCard} w-full max-w-[90vw] h-[calc(90vh-6rem)] mt-24 rounded-lg shadow-2xl border ${sectionBorder} flex flex-col overflow-hidden relative`}
          >
            <div className="p-4 border-b border-gray-500/20 flex items-center justify-between bg-black/5">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-[color:var(--color-nile)]" />
                  {viewTree.title}
                </h2>
                <p className="text-xs opacity-60">{t("viewing_mode_read_only", "Viewing Mode - Read Only")}</p>
              </div>
              <button
                onClick={() => {
                  setViewTree(null);
                  setViewPeople([]);
                  setViewTreeError("");
                }}
                className="p-2 rounded-full hover:bg-black/10 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 relative bg-gray-50/50 dark:bg-black/20 overflow-hidden">
              {viewLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--color-nile)]"></div>
                </div>
              ) : viewTreeError ? (
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <div className="rounded-lg border border-[#e8dfca] bg-white/90 dark:bg-[#091326] dark:border-[color:var(--color-nile)] px-6 py-5 text-sm text-[color:var(--color-nile)] dark:text-[#e8dfca] shadow-xl text-center max-w-md">
                    <div className="font-semibold">
                      {t("tree_builder_error", "Tree builder failed to load.")}
                    </div>
                    <p className="mt-2 opacity-80">{viewTreeError}</p>
                  </div>
                </div>
              ) : (
                <ErrorBoundary
                  fallback={({ error, reset }) => (
                    <div className="absolute inset-0 flex items-center justify-center p-6">
                      <div className="rounded-lg border border-[#e8dfca] bg-white/90 px-6 py-5 text-sm text-[color:var(--color-nile)] shadow-xl">
                        <div className="font-semibold">
                          {t("tree_builder_error", "Tree builder failed to load.")}
                        </div>
                        <div className="opacity-70">
                          {error?.message ||
                            t("tree_builder_try_again", "Please try again.")}
                        </div>
                        <button
                          type="button"
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
                    people={viewPeople}
                    setPeople={setViewPeople}
                    readOnly
                  />
                </ErrorBoundary>
              )}
            </div>
          </div>
        </div>
      )}
    </RootsPageShell>
  );
}

function ResultSection({ title, count, borderColor, items, renderItem }) {
  const { t } = useTranslation();
  if (!items) return null;
  return (
    <div>
      <h3 className="font-bold opacity-80 mb-3 flex items-center gap-2">
        <span className="text-lg">{title}</span>
        <span className="text-xs opacity-70">({count})</span>
      </h3>
      {items.length ? (
        <div className="space-y-3">
          {items.map((item, idx) => renderItem(item, idx))}
        </div>
      ) : (
        <div className="text-sm opacity-60 italic">
          {t("research_empty_category", "No results in this category for your search.")}
        </div>
      )}
      <div className={`w-full h-px my-4 ${borderColor}`}></div>
    </div>
  );
}

function BookResult({ book, downloadUrl, borderColor }) {
  const { t } = useTranslation();
  return (
    <div
      className={`p-4 rounded-2xl border ${borderColor} flex flex-col sm:flex-row gap-4`}
    >
      <div>
        <div className="font-bold">{book.title}</div>
        <div className="text-sm opacity-60">
          {t("by_prefix", "by")} {book.author || t("unknown", "Unknown")}
        </div>
        <div className="text-xs bg-[color:var(--color-nile)]/10 text-[color:var(--color-nile)] px-2 py-1 rounded inline-block mt-1">
          {book.category}
        </div>
      </div>
      {book?.id ? (
        <a
          href={downloadUrl(book.id)}
          target="_blank"
          rel="noreferrer"
          className="interactive-btn btn-neu btn-neu--primary px-4 py-2 text-sm flex items-center gap-2 self-start sm:self-center shrink-0"
        >
          <Download className="w-4 h-4" />
          {t("download", "Download")}
        </a>
      ) : (
        <span className="text-xs opacity-50 italic self-start sm:self-center">
          {t("unavailable", "Unavailable")}
        </span>
      )}
    </div>
  );
}

function PersonResult({ person, borderColor, onView }) {
  const { t } = useTranslation();
  const treeTitle = person.tree_title || t("unknown_tree_title", "Unknown tree");
  return (
    <div
      className={`interactive-card p-4 rounded-2xl border ${borderColor} hover:border-[color:var(--color-nile)]/50 transition-colors`}
    >
      <div className="font-bold text-lg">{person.name || t("unknown", "Unknown")}</div>
      <div className="text-sm opacity-70 mb-2">{t("tree_label", "Tree")}: {treeTitle}</div>
      <div className="text-xs opacity-50 flex items-center gap-1">
        <UserCircle2 className="w-3 h-3" />
        {t("owner", "Owner")}: {person.owner_name || person.owner || t("unknown", "Unknown")}
      </div>
      {onView ? (
        <button
          onClick={onView}
          className="interactive-btn btn-neu btn-neu--primary mt-3 w-full py-2.5 font-bold text-sm flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4" />
          {t("view_tree", "View Tree")}
        </button>
      ) : null}
    </div>
  );
}

function TreeResult({ tree, borderColor, onView }) {
  const { t } = useTranslation();
  return (
    <div
      className={`interactive-card p-4 rounded-2xl border ${borderColor} hover:border-[color:var(--color-nile)]/50 transition-colors`}
    >
      <div className="font-bold text-lg">{tree.title}</div>
      <div className="text-sm opacity-70 mb-2 line-clamp-2">
        {tree.description || t("no_description_provided", "No description provided.")}
      </div>
      <div className="text-xs opacity-50 flex items-center gap-1">
        <UserCircle2 className="w-3 h-3" />
        {t("owner", "Owner")}: {tree.owner_name || tree.owner || t("unknown", "Unknown")}
      </div>
      <button
        onClick={onView}
        className="interactive-btn btn-neu btn-neu--primary mt-3 w-full py-2.5 font-bold text-sm flex items-center justify-center gap-2"
      >
        <Eye className="w-4 h-4" />
        {t("view_and_explore", "View & Explore")}
      </button>
    </div>
  );
}








