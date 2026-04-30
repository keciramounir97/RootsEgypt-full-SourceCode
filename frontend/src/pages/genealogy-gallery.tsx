import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useThemeStore } from "../store/theme";
import { motion, AnimatePresence } from "framer-motion";
import {
  Archive,
  Download,
  Eye,
  Filter,
  FileText,
  Heart,
  Search,
  Share2,
  Trees,
  Users,
  X,
} from "lucide-react";
import { api } from "../api/client";
import { getApiErrorMessage, getApiRoot, normalizeTree } from "../api/helpers";
import { useTranslation } from "../context/TranslationContext";
import { useFavorites } from "../context/FavoritesContext";
import RootsPageShell from "../components/RootsPageShell";
import TreesBuilder, { parseGedcom, parseGedcomX } from "../admin/components/TreesBuilder";
import ErrorBoundary from "../components/ErrorBoundary";

const sortByDateDesc = (items) =>
  [...items].sort((a, b) => {
    const da = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
    const db = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
    return db - da;
  });

export default function GenealogyGallery() {
  const { theme } = useThemeStore();
  const { t } = useTranslation();
  const location = useLocation();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [treesError, setTreesError] = useState("");
  const [query, setQuery] = useState("");
  const [treeFilter, setTreeFilter] = useState("all");
  const [viewTree, setViewTree] = useState(null);
  const [viewPeople, setViewPeople] = useState([]);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewTreeError, setViewTreeError] = useState("");

  const apiRoot = useMemo(() => getApiRoot(), []);

  useEffect(() => {
    // Animations handled by framer-motion
  }, []);

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
        setTreesError("");

        const treesRes = await api.get("/trees");

        if (!mounted) return;

        const apiRootVal = getApiRoot();
        let nextTrees =
          treesRes.status === 200 && Array.isArray(treesRes.data)
            ? treesRes.data.map((t) => normalizeTree(t, { apiRoot: apiRootVal, isPublic: true }))
            : [];

        const treesErrorMessage =
          treesRes.status !== 200
            ? getApiErrorMessage(treesRes, "Failed to load trees")
            : "";

        setTrees(nextTrees);
        setTreesError(treesErrorMessage);
      } catch (err) {
        if (!mounted) return;
        const message = getApiErrorMessage(err, "Failed to load trees");
        setError(message);
        setTreesError(message);
        setTrees([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const fileUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${apiRoot}${path}`;
  };

  const downloadTreeUrl = (id) => {
    return `${apiRoot}/api/trees/${id}/gedcom`;
  };

  const shareTree = (tree) => {
    const url = `${window.location.origin}/genealogy-gallery`;
    const title = tree?.title || t("trees", "Family Trees");
    if (navigator.share) {
      void navigator.share({ title, text: `${title} — Roots Egypt`, url });
    } else {
      void navigator.clipboard.writeText(url);
    }
  };

  const filteredTrees = useMemo(() => {
    let result = trees;

    // Search filter
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (tree) =>
          tree.title?.toLowerCase().includes(q) ||
          tree.description?.toLowerCase().includes(q) ||
          tree.archiveSource?.toLowerCase().includes(q) ||
          tree.documentCode?.toLowerCase().includes(q) ||
          tree.owner?.toLowerCase().includes(q)
      );
    }

    // Tree filter
    if (treeFilter === "with-gedcom") {
      result = result.filter((tree) => tree.hasGedcom);
    }

    return sortByDateDesc(result);
  }, [trees, query, treeFilter]);

  const latestTree = useMemo(() => {
    return sortByDateDesc(trees)[0] || null;
  }, [trees]);

  const handleViewTree = async (tree) => {
    setViewTree(tree);
    setViewPeople([]);
    setViewTreeError("");
    setViewLoading(true);

    try {
      if (!tree.hasGedcom || !tree.gedcomUrl) {
        setViewTreeError(t("no_gedcom_available", "No GEDCOM file available yet."));
        setViewLoading(false);
        return;
      }

      const gedcomUrl = fileUrl(tree.gedcomUrl);
      const response = await fetch(gedcomUrl);
      if (!response.ok) {
        setViewTreeError(t("tree_builder_error", "Failed to load tree."));
        setViewLoading(false);
        return;
      }
      const text = await response.text();
      const isGedcomX = /^\s*(\{|\<\?xml)/.test(text);
      const people = isGedcomX ? parseGedcomX(text) : parseGedcom(text);
      const list = Array.isArray(people) ? people : [];
      setViewPeople(list);
      if (!list.length) {
        setViewTreeError(t("gedcom_no_people", "No individuals found in GEDCOM."));
      }
    } catch (err) {
      setViewPeople([]);
      setViewTreeError(t("tree_builder_error", "Failed to load tree."));
    } finally {
      setViewLoading(false);
    }
  };

  const isDark = theme === "dark";
  const borderColor = isDark
    ? "border-white/10"
    : "border-[#d8c7b0]/60";
  const cardBg = isDark ? "bg-[#0d1b2a]" : "bg-white";
  const metaPanel = isDark
    ? "bg-white/5 border-white/10"
    : "bg-[#0c4a6e]/5 border-[#d8c7b0]/60";

  return (
    <RootsPageShell
      hero={
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-teal">
            {t("genealogy_gallery", "Genealogy Gallery")}
          </p>
          <h1 className="text-5xl font-bold">
            {t("genealogy_gallery_title", "Egyptian Genealogy Gallery")}
          </h1>
          <p className="max-w-4xl mx-auto text-lg opacity-90">
            {t(
              "genealogy_gallery_trees_only",
              "This page lists published family trees only — open one to explore GEDCOM data, save favourites, or share a link."
            )}
          </p>
        </div>
      }
    >
      <section className="roots-section roots-section-alt" data-aos="fade-up">
        <div className="space-y-6">
            <h2 className="text-3xl font-bold border-l-8 border-l-teal pl-4">
            {t("search_trees_section", "Find a tree")}
          </h2>
          <div
            className={`grid gap-4 md:grid-cols-[2fr_1fr] items-center p-6 rounded-xl border ${borderColor}`}
          >
            <div className="relative">
              <Search className="absolute left-3 top-3 text-[#0c4a6e] dark:text-teal opacity-80 w-5 h-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("search_trees", "Search trees...")}
                className={`w-full pl-10 py-3 rounded-md bg-transparent border ${borderColor} outline-none ${
                  theme === "dark" ? "text-white" : "text-[#091326]"
                }`}
              />
            </div>
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-[#0c4a6e] dark:text-teal" />
              <select
                value={treeFilter}
                onChange={(e) => setTreeFilter(e.target.value)}
                className={`w-full px-4 py-3 rounded-md bg-transparent border ${borderColor} outline-none ${
                  theme === "dark" ? "text-white" : "text-[#091326]"
                }`}
              >
                <option value="all">{t("all_trees", "All Trees")}</option>
                <option value="with-gedcom">
                  {t("with_gedcom", "With GEDCOM file")}
                </option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="roots-section" data-aos="fade-up">
        <div className={`${cardBg} p-6 rounded-2xl shadow-lg border ${borderColor}`}>
            <Trees className="w-8 h-8 text-teal mb-4" />
          <p className="text-sm uppercase tracking-[0.2em] text-[#0c4a6e] dark:text-teal mb-2">
            {t("latest_tree", "Latest tree")}
          </p>
          {latestTree ? (
            <>
              <h3 className="text-xl font-bold">{latestTree.title}</h3>
              <p className="text-sm opacity-80 mt-1">
                {latestTree.owner || t("unknown", "Unknown")}
              </p>
              <p className="text-sm opacity-80 mt-3">
                {latestTree.description || t("no_description", "No description.")}
              </p>
              {latestTree.archiveSource && (
                <p className="text-xs opacity-70 mt-2">
                  <Archive className="w-3 h-3 inline mr-1" />
                  {latestTree.archiveSource}
                </p>
              )}
              {latestTree.documentCode && (
                <p className="text-xs opacity-70 mt-1">
                  <FileText className="w-3 h-3 inline mr-1" />
                  {latestTree.documentCode}
                </p>
              )}
            </>
          ) : (
            <p className="opacity-70">{t("no_trees_found", "No trees found.")}</p>
          )}
        </div>
      </section>

      {loading ? (
        <section className="roots-section">
          <div className="text-center opacity-70">
            {t("loading", "Loading...")}
          </div>
        </section>
      ) : error ? (
        <section className="roots-section">
          <div className="text-center text-red-500 font-semibold">{error}</div>
        </section>
      ) : null}

      {!loading && !error && (
        <section className="roots-section" data-aos="fade-up">
          <h2 className="text-3xl font-bold border-l-8 border-l-teal pl-4 mb-6">
            {t("trees", "Family Trees")} ({filteredTrees.length})
          </h2>
          {treesError ? (
            <div className="mb-4 text-sm text-red-500 font-semibold">
              {treesError}
            </div>
          ) : null}
          {filteredTrees.length === 0 ? (
            <div
              className={`${cardBg} p-8 rounded-xl shadow-xl border ${borderColor} text-center opacity-70`}
            >
              {treesError
                ? t("trees_unavailable", "Trees are temporarily unavailable.")
                : t("no_trees_found", "No trees found.")}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {filteredTrees.map((tree) => {
                const canDownload =
                  Number.isFinite(Number(tree.id)) && tree.hasGedcom;
                return (
                  <div
                    key={tree.id}
                    className={`${cardBg} border ${borderColor} rounded-2xl shadow-xl overflow-hidden`}
                                     >
                    <div className="p-5 border-b border-white/5 bg-gradient-to-r from-primary-brown/10 via-teal/5 to-terracotta/5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-[0.3em] text-[#0c4a6e] dark:text-teal opacity-70">
                            {t("trees", "Family Trees")}
                          </p>
                          <h3 className="text-2xl font-bold truncate">
                            {tree.title}
                          </h3>
                          <p className="text-sm opacity-70">
                            {tree.owner || t("unknown", "Unknown")}
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
                      <p className="text-sm opacity-80">
                        {tree.description ||
                          t("no_description", "No description.")}
                      </p>

                      <div className="grid sm:grid-cols-2 gap-3">
                        <div
                          className={`${metaPanel} border rounded-xl p-3 flex items-start gap-2`}
                        >
                          <Archive className="w-4 h-4 text-teal mt-0.5" />
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

                      <div className="text-xs opacity-70 flex items-center gap-2 flex-wrap">
                        <Users className="w-4 h-4" />
                        {tree.hasGedcom
                          ? t("has_file", "Has file")
                          : t("no_file", "No file")}
                        {tree.hasGedcom && tree.data_format === "gedcomx" ? (
                          <span className="px-2 py-0.5 rounded bg-[#0c4a6e]/20 text-[#0c4a6e] dark:text-teal font-medium">
                            {t("saved_with_gedcomx", "Saved with GEDCOM X")}
                          </span>
                        ) : null}
                        {tree.hasGedcom && tree.data_format === "gedcom7" ? (
                          <span className="px-2 py-0.5 rounded bg-[#0c4a6e]/20 text-[#0c4a6e] dark:text-teal font-medium">
                            {t("saved_with_gedcom7", "Saved with GEDCOM 7.0")}
                          </span>
                        ) : null}
                        {tree.hasGedcom && tree.data_format !== "gedcomx" && tree.data_format !== "gedcom7" ? (
                          <span className="px-2 py-0.5 rounded bg-[#0c4a6e]/10 text-[#0c4a6e] dark:text-teal/80 font-medium">
                            {t("saved_with_gedcom551", "Saved with GEDCOM 5.5.1")}
                          </span>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap gap-2 items-center">
                        <button
                          type="button"
                          onClick={() =>
                            Number.isFinite(Number(tree.id)) &&
                            toggleFavorite("tree", tree.id)
                          }
                          className="btn-neu-icon"
                          aria-label={t("favorites", "Favourites")}
                          title={t("favorites", "Favourites")}
                        >
                          <Heart
                            className={`w-5 h-5 ${
                              isFavorite("tree", tree.id)
                                ? "fill-[#fb7185] text-[#fb7185]"
                                : ""
                            }`}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => shareTree(tree)}
                          className="btn-neu-icon"
                          aria-label={t("share", "Share")}
                          title={t("share", "Share")}
                        >
                          <Share2 className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleViewTree(tree)}
                          className={`interactive-btn btn-neu btn-neu--sage px-4 py-2 inline-flex items-center gap-2`}
                        >
                          <Eye className="w-4 h-4" />
                          {t("view_tree", "View Tree")}
                        </button>
                        {canDownload ? (
                          <a
                            href={downloadTreeUrl(tree.id)}
                            className="interactive-btn btn-neu btn-neu--primary px-4 py-2 inline-flex items-center gap-2"
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Download className="w-4 h-4" />
                            {tree.data_format === "gedcomx"
                              ? t("download_gedcomx", "Download GEDCOM X")
                              : tree.data_format === "gedcom7"
                                ? t("download_gedcom7", "Download GEDCOM 7.0")
                                : t("download_gedcom551", "Download GEDCOM 5.5.1")}
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {viewTree && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => {
            setViewTree(null);
            setViewPeople([]);
            setViewTreeError("");
          }}
        >
          <ErrorBoundary>
            <div
              className={`${cardBg} w-full max-w-[92vw] h-[calc(90vh-6rem)] mt-16 rounded-2xl border ${borderColor} shadow-2xl flex flex-col overflow-hidden`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/5">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Trees className="w-5 h-5 text-teal" />
                    {viewTree.title}
                  </h2>
                  <p className="text-xs opacity-60">
                    {t("viewing_mode", "Viewing Mode - Read Only")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {Number.isFinite(Number(viewTree.id)) && viewTree.hasGedcom ? (
                    <a
                      href={downloadTreeUrl(viewTree.id)}
                      className="interactive-btn btn-neu btn-neu--primary px-3 py-2 inline-flex items-center gap-2 text-sm"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Download className="w-4 h-4" />
                      {viewTree.data_format === "gedcomx"
                        ? t("download_gedcomx", "Download GEDCOM X")
                        : viewTree.data_format === "gedcom7"
                          ? t("download_gedcom7", "Download GEDCOM 7.0")
                          : t("download_gedcom551", "Download GEDCOM 5.5.1")}
                    </a>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => {
                      setViewTree(null);
                      setViewPeople([]);
                      setViewTreeError("");
                    }}
                    className="p-2 rounded-full hover:bg-black/10 transition"
                    aria-label={t("close", "Close")}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="flex-1 relative bg-black/5 overflow-hidden">
                {viewLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center opacity-70">
                      {t("loading", "Loading...")}
                    </div>
                  </div>
                ) : viewTreeError ? (
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    <div className="rounded-lg border border-[#d8c7b0] bg-white/90 dark:bg-[#091326] dark:border-[#0c4a6e] px-6 py-5 text-sm text-[#0c4a6e] dark:text-[#e8dfca] shadow-xl text-center max-w-md">
                      <div className="font-semibold">
                        {t("tree_builder_error", "Tree builder failed to load.")}
                      </div>
                      <p className="mt-2 opacity-80">{viewTreeError}</p>
                    </div>
                  </div>
                ) : (
                  <TreesBuilder people={viewPeople} readOnly />
                )}
              </div>
            </div>
          </ErrorBoundary>
        </div>
      )}
    </RootsPageShell>
  );
}
