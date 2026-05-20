import { useEffect, useMemo, useState } from "react";
import { useThemeStore } from "../store/theme";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  Archive,
  Download,
  Eye,
  FileText,
  Filter,
  Network,
  Search,
  TreeDeciduous,
  Users,
  X,
} from "lucide-react";
import { api } from "../api/client";
import { getApiErrorMessage, getApiRoot, normalizeTree } from "../api/helpers";
import { useLanguage } from "../i18n";
import RootsPageShell from "../components/RootsPageShell";
import TreesBuilder, { parseGedcom, parseGedcomX } from "../admin/components/TreesBuilder";

const sortByDateDesc = (items: any[]) =>
  [...items].sort((a, b) => {
    const da = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
    const db = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
    return db - da;
  });

export default function GalleryTrees() {
  const { theme } = useThemeStore();
  const { t } = useLanguage();

  const [trees, setTrees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [treeFilter, setTreeFilter] = useState("all");
  const [viewTree, setViewTree] = useState<any>(null);
  const [viewPeople, setViewPeople] = useState<any[]>([]);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewTreeError, setViewTreeError] = useState("");

  const apiRoot = useMemo(() => getApiRoot(), []);

  useEffect(() => {
    AOS.init({ duration: 900, once: true });
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const treesRes = await api.get("/trees");

        if (!mounted) return;

        const apiRootVal = getApiRoot();
        const nextTrees =
          Array.isArray(treesRes.data)
            ? treesRes.data.map((t: any) => normalizeTree(t, { apiRoot: apiRootVal, isPublic: true }))
            : [];

        setTrees(nextTrees);
      } catch (err) {
        if (!mounted) return;
        const message = getApiErrorMessage(err, "Failed to load trees");
        setError(message);
        setTrees([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const fileUrl = (path: string) => {
    if (!path) return "";
    const raw = String(path).trim();
    if (raw.startsWith("http")) return raw;
    let p = raw.startsWith("/") ? raw : `/${raw}`;
    return `${apiRoot.replace(/\/+$/, "")}${p}`;
  };

  const downloadTreeUrl = (id: number | string) => {
    return `${apiRoot}/api/trees/${id}/gedcom`;
  };

  const filteredTrees = useMemo(() => {
    let result = trees;

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (tree) =>
          tree.title?.toLowerCase().includes(q) ||
          tree.description?.toLowerCase().includes(q) ||
          tree.archiveSource?.toLowerCase().includes(q) ||
          tree.documentCode?.toLowerCase().includes(q) ||
          tree.owner?.toLowerCase().includes(q),
      );
    }

    if (treeFilter === "with-gedcom") {
      result = result.filter((tree) => tree.hasGedcom);
    }

    return sortByDateDesc(result);
  }, [trees, query, treeFilter]);

  const handleViewTree = async (tree: any) => {
    setViewTree(tree);
    setViewPeople([]);
    setViewTreeError("");
    setViewLoading(true);

    try {
      if (!tree.hasGedcom || !tree.gedcomUrl) {
        setViewTreeError(t("legacy.no_gedcom_available", "No GEDCOM file available yet."));
        setViewLoading(false);
        return;
      }

      const gedcomUrl = fileUrl(tree.gedcomUrl);
      const response = await fetch(gedcomUrl);
      if (!response.ok) {
        setViewTreeError(t("legacy.tree_builder_error", "Failed to load tree."));
        setViewLoading(false);
        return;
      }
      const text = await response.text();
      const isGedcomX = /^\s*(\{|\<\?xml)/.test(text);
      const people = isGedcomX ? parseGedcomX(text) : parseGedcom(text);
      const list = Array.isArray(people) ? people : [];
      setViewPeople(list);
      if (!list.length) {
        setViewTreeError(t("legacy.gedcom_no_people", "No individuals found in GEDCOM."));
      }
    } catch (err) {
      setViewPeople([]);
      setViewTreeError(t("legacy.tree_builder_error", "Failed to load tree."));
    } finally {
      setViewLoading(false);
    }
  };

  const isDark = theme === "dark";
  const borderColor = isDark ? "border-[#1a3048]" : "border-[#e8e4dc]";
  const cardBg = isDark ? "bg-[#0f1f33]" : "bg-white";
  return (
    <RootsPageShell
      hero={
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Network className="w-12 h-12 text-[#d9a441]" />
          </div>
          <p className="text-sm uppercase tracking-[0.3em] text-[#d9a441]">
            {t("legacy.family_collections", "Family Collections")}
          </p>
          <h1 className="text-5xl font-bold">
            {t("legacy.family_trees", "Family Trees")}
          </h1>
          <p className="max-w-4xl mx-auto text-lg opacity-90">
            {t("legacy.trees_intro",
              "Explore Egyptian family trees shared with RootsEgypt. View lineages, download GEDCOM files, and connect with your heritage.",
            )}
          </p>
        </div>
      }
    >
      <section className="roots-section roots-section-alt" data-aos="fade-up">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold border-l-8 border-[#d9a441] pl-4">
            {t("legacy.search_trees", "Search Family Trees")}
          </h2>
          <div
            className={`grid gap-4 md:grid-cols-[2fr_1fr] items-center p-6 rounded-xl border ${borderColor} ${isDark ? "bg-[#0f1f33]/50" : "bg-white/50"}`}
          >
            <div className="relative">
              <Search className="absolute left-3 top-3 text-[#24766f] opacity-80 w-5 h-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("legacy.search_trees_placeholder",
                  "Search by name, community, archive...",
                )}
                className={`w-full pl-10 py-3 rounded-md bg-transparent border ${borderColor} outline-none focus:border-[#d9a441] transition-colors ${
                  isDark ? "text-white placeholder-white/50" : "text-[#162238] placeholder-[#162238]/50"
                }`}
              />
            </div>
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-[#24766f]" />
              <select
                value={treeFilter}
                onChange={(e) => setTreeFilter(e.target.value)}
                className={`w-full px-4 py-3 rounded-md bg-transparent border ${borderColor} outline-none focus:border-[#d9a441] transition-colors ${
                  isDark ? "text-white" : "text-[#162238]"
                }`}
              >
                <option value="all">{t("legacy.all_trees", "All Trees")}</option>
                <option value="with-gedcom">
                  {t("legacy.with_gedcom", "With GEDCOM file")}
                </option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <section className="roots-section">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-[#d9a441] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-lg opacity-70">{t("legacy.loading", "Loading...")}</p>
          </div>
        </section>
      ) : error ? (
        <section className="roots-section">
          <div className="text-center text-red-500 font-semibold py-10">{error}</div>
        </section>
      ) : (
        <section className="roots-section" data-aos="fade-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold border-l-8 border-[#d9a441] pl-4">
              {t("legacy.trees", "Family Trees")} <span className="text-[#24766f]">({filteredTrees.length})</span>
            </h2>
          </div>
          
          {filteredTrees.length === 0 ? (
            <div
              className={`${cardBg} p-12 rounded-2xl shadow-xl border ${borderColor} text-center`}
            >
              <TreeDeciduous className="w-16 h-16 mx-auto text-[#24766f]/50 mb-4" />
              <p className="text-xl opacity-70">{t("legacy.no_trees_found", "No trees found.")}</p>
              <p className="text-sm opacity-50 mt-2">{t("legacy.try_different_search", "Try a different search term.")}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrees.map((tree, index) => {
                const canDownload = Number.isFinite(Number(tree.id)) && tree.hasGedcom;
                return (
                  <div
                    key={tree.id}
                    className={`group ${cardBg} border ${borderColor} rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1`}
                    data-aos="fade-up"
                    data-aos-delay={index * 50}
                  >
                    <div className="p-5 border-b ${borderColor} bg-gradient-to-r from-[#24766f]/10 via-[#d9a441]/5 to-transparent">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] uppercase tracking-[0.3em] text-[#24766f] opacity-70 mb-1">
                            {t("legacy.family_tree", "Family Tree")}
                          </p>
                          <h3 className="text-xl font-bold truncate group-hover:text-[#d9a441] transition-colors">
                            {tree.title}
                          </h3>
                        </div>
                        <span
                          className={`text-[10px] uppercase tracking-[0.15em] px-2.5 py-1 rounded-full ${
                            tree.isPublic
                              ? "bg-[#24766f]/15 text-[#24766f] border border-[#24766f]/30"
                              : "bg-[#d9a441]/15 text-[#d9a441] border border-[#d9a441]/30"
                          }`}
                        >
                          {tree.isPublic ? t("legacy.public", "Public") : t("legacy.private", "Private")}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-4">
                      <p className="text-sm opacity-80 line-clamp-2">
                        {tree.description || t("legacy.no_description", "No description.")}
                      </p>

                      <div className="space-y-2">
                        <div className={`flex items-center gap-2 text-sm ${isDark ? "text-white/70" : "text-[#162238]/70"}`}>
                          <Users className="w-4 h-4 text-[#d9a441]" />
                          <span>{tree.owner || t("legacy.unknown", "Unknown")}</span>
                        </div>
                        
                        {tree.archiveSource && (
                          <div className={`flex items-center gap-2 text-sm ${isDark ? "text-white/70" : "text-[#162238]/70"}`}>
                            <Archive className="w-4 h-4 text-[#24766f]" />
                            <span className="truncate">{tree.archiveSource}</span>
                          </div>
                        )}

                        {tree.documentCode && (
                          <div className={`flex items-center gap-2 text-sm ${isDark ? "text-white/70" : "text-[#162238]/70"}`}>
                            <FileText className="w-4 h-4 text-[#24766f]" />
                            <span className="font-mono text-xs">{tree.documentCode}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        {tree.hasGedcom && (
                          <button
                            onClick={() => handleViewTree(tree)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#24766f] text-white text-sm font-medium hover:bg-[#24766f]/90 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            {t("legacy.view", "View")}
                          </button>
                        )}
                        {canDownload && (
                          <a
                            href={downloadTreeUrl(tree.id)}
                            download
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${borderColor} text-sm font-medium hover:bg-[#d9a441]/10 hover:border-[#d9a441] transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            {t("legacy.download", "Download")}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Tree Viewer Modal */}
      {viewTree && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setViewTree(null)}
        >
          <div
            className={`w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden ${cardBg} border ${borderColor}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b ${borderColor}">
              <h3 className="text-xl font-bold">{viewTree.title}</h3>
              <button
                onClick={() => setViewTree(null)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="h-[70vh] overflow-auto">
              {viewLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-2 border-[#d9a441] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : viewTreeError ? (
                <div className="flex items-center justify-center h-full text-red-500">
                  {viewTreeError}
                </div>
              ) : (
                <TreesBuilder
                  people={viewPeople}
                  isPublicView
                />
              )}
            </div>
          </div>
        </div>
      )}
    </RootsPageShell>
  );
}
