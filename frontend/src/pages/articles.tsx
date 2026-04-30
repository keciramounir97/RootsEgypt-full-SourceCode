import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import {
  Archive,
  BookOpen,
  Heart,
  Image as ImageIcon,
  MessageCircle,
  Search,
  Share2,
  SlidersHorizontal,
  Trees,
} from "lucide-react";
import { useThemeStore } from "../store/theme";
import { useTranslation } from "../context/TranslationContext";
import { useAuth } from "../admin/components/AuthContext";
import { dispatchAppNotification } from "../context/NotificationContext";
import { api } from "../api/client";
import { getApiRoot } from "../api/helpers";
import { useFavorites } from "../context/FavoritesContext";
import RootsPageShell from "../components/RootsPageShell";
import CreatePostCard from "../components/articles/CreatePostCard";
import ArticlePostCard from "../components/articles/ArticlePostCard";
import ShareArticleModal from "../components/articles/ShareArticleModal";
import {
  type ArticlePost,
  type ArticleComment,
  loadArticles,
  saveArticles,
  loadComments,
  saveComments,
  loadLikeCounts,
  saveLikeCounts,
  loadLikeMine,
  saveLikeMine,
  loadShareCounts,
  saveShareCounts,
  loadCommentLikeCounts,
  saveCommentLikeCounts,
  loadCommentLikeMine,
  saveCommentLikeMine,
  EGYPTIAN_CATEGORIES,
} from "../components/articles/articleStorage";

export type { ArticlePost, ArticleComment } from "../components/articles/articleStorage";

const PAGE_SIZE = 8;
const MEDIA_REACT_COUNTS_KEY = "rootsegypt_media_react_counts_v1";
const MEDIA_REACT_MINE_KEY = "rootsegypt_media_react_mine_v1";
const MEDIA_COMMENTS_KEY = "rootsegypt_media_comments_v1";

type MediaKind = "tree" | "image" | "document";

interface MediaItem {
  id: string;
  kind: MediaKind;
  title: string;
  body: string;
  authorName: string;
  createdAt: number;
  imageUrl?: string;
  sourceLabel?: string;
}

interface MediaComment {
  id: string;
  mediaKey: string;
  authorName: string;
  body: string;
  createdAt: number;
}

function safeJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function roleLabelFor(user: { role: number; roleName?: string } | null): string {
  if (!user) return "";
  if (user.roleName) return user.roleName;
  if (user.role === 1) return "Admin";
  if (user.role === 3) return "Super Admin";
  return "Member";
}

export default function ArticlesPage() {
  const { theme } = useThemeStore();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const themeMode = theme === "dark" ? "dark" : "light";
  const apiRoot = useMemo(() => getApiRoot(), []);

  const [articles, setArticles] = useState<ArticlePost[]>([]);
  const [comments, setComments] = useState<ArticleComment[]>([]);
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>(() =>
    loadLikeCounts()
  );
  const [likeMine, setLikeMine] = useState<Record<string, boolean>>(() =>
    loadLikeMine()
  );
  const [shareCounts, setShareCounts] = useState<Record<string, number>>(() =>
    loadShareCounts()
  );
  const [commentLikeCounts, setCommentLikeCounts] = useState<
    Record<string, number>
  >(() => loadCommentLikeCounts());
  const [commentLikeMine, setCommentLikeMine] = useState<
    Record<string, boolean>
  >(() => loadCommentLikeMine());

  const [categoryFilter, setCategoryFilter] = useState<string | "all">("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"latest" | "likes" | "comments">("latest");
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>(
    {}
  );
  const [commentsOpenId, setCommentsOpenId] = useState<string | null>(null);
  const [shareTarget, setShareTarget] = useState<ArticlePost | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [feedView, setFeedView] = useState<"articles" | "media">("articles");
  const [mediaFeed, setMediaFeed] = useState<MediaItem[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaError, setMediaError] = useState("");
  const [mediaReactCounts, setMediaReactCounts] = useState<Record<string, number>>(() =>
    safeJson<Record<string, number>>(localStorage.getItem(MEDIA_REACT_COUNTS_KEY), {})
  );
  const [mediaReactMine, setMediaReactMine] = useState<Record<string, boolean>>(() =>
    safeJson<Record<string, boolean>>(localStorage.getItem(MEDIA_REACT_MINE_KEY), {})
  );
  const [mediaComments, setMediaComments] = useState<MediaComment[]>(() =>
    safeJson<MediaComment[]>(localStorage.getItem(MEDIA_COMMENTS_KEY), [])
  );
  const [mediaCommentDrafts, setMediaCommentDrafts] = useState<Record<string, string>>(
    {}
  );

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const feedLenRef = useRef(0);

  useEffect(() => {
    setArticles(loadArticles());
    setComments(loadComments());
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setMediaLoading(true);
        setMediaError("");
        const [treesRes, galleryRes, booksRes] = await Promise.all([
          api.get("/trees").catch(() => ({ data: [] })),
          api.get("/gallery").catch(() => ({ data: [] })),
          api.get("/books").catch(() => ({ data: [] })),
        ]);
        if (!mounted) return;
        const trees = Array.isArray(treesRes.data) ? treesRes.data : [];
        const galleryRaw = Array.isArray(galleryRes.data?.gallery)
          ? galleryRes.data.gallery
          : Array.isArray(galleryRes.data)
          ? galleryRes.data
          : [];
        const books = Array.isArray(booksRes.data)
          ? booksRes.data
          : Array.isArray(booksRes.data?.data)
          ? booksRes.data.data
          : [];

        const next: MediaItem[] = [
          ...trees.slice(0, 20).map((tree: any) => ({
            id: `tree:${tree.id}`,
            kind: "tree" as const,
            title: tree.title || t("untitled", "Untitled"),
            body:
              tree.description ||
              t("tree_card_default_desc", "Family tree shared by the community."),
            authorName: tree.owner || tree.owner_name || t("unknown", "Unknown"),
            createdAt: tree.createdAt ? new Date(tree.createdAt).getTime() : Date.now(),
            sourceLabel: tree.archiveSource || "",
          })),
          ...galleryRaw.slice(0, 24).map((img: any) => ({
            id: `image:${img.id}`,
            kind: "image" as const,
            title: img.title || t("untitled", "Untitled"),
            body: img.description || t("images", "Image from the heritage gallery."),
            authorName: img.author || t("community", "Community"),
            createdAt: img.createdAt ? new Date(img.createdAt).getTime() : Date.now(),
            imageUrl: img.image_path
              ? String(img.image_path).startsWith("http")
                ? String(img.image_path)
                : `${apiRoot.replace(/\/+$/, "")}/uploads/gallery/${String(img.image_path).replace(/^\/+/, "")}`
              : undefined,
            sourceLabel: img.archiveSource || "",
          })),
          ...books.slice(0, 20).map((book: any) => ({
            id: `document:${book.id}`,
            kind: "document" as const,
            title: book.title || t("untitled", "Untitled"),
            body: book.description || t("documents", "Document from library collections."),
            authorName: book.author || t("unknown", "Unknown"),
            createdAt: book.createdAt ? new Date(book.createdAt).getTime() : Date.now(),
            sourceLabel: book.category || "",
          })),
        ].sort((a, b) => b.createdAt - a.createdAt);
        setMediaFeed(next);
      } catch {
        if (!mounted) return;
        setMediaError(t("media_feed_load_failed", "Could not load media feed."));
      } finally {
        if (mounted) setMediaLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [apiRoot, t]);

  useEffect(() => {
    localStorage.setItem(MEDIA_REACT_COUNTS_KEY, JSON.stringify(mediaReactCounts));
  }, [mediaReactCounts]);
  useEffect(() => {
    localStorage.setItem(MEDIA_REACT_MINE_KEY, JSON.stringify(mediaReactMine));
  }, [mediaReactMine]);
  useEffect(() => {
    localStorage.setItem(MEDIA_COMMENTS_KEY, JSON.stringify(mediaComments));
  }, [mediaComments]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "rootsegypt_article_like_counts_v1" && e.newValue) {
        try {
          const next = JSON.parse(e.newValue) as Record<string, number>;
          if (next && typeof next === "object") setLikeCounts(next);
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const commentsByArticle = useMemo(() => {
    const m: Record<string, ArticleComment[]> = {};
    for (const c of comments) {
      if (!m[c.articleId]) m[c.articleId] = [];
      m[c.articleId].push(c);
    }
    for (const k of Object.keys(m)) {
      m[k].sort((a, b) => a.createdAt - b.createdAt);
    }
    return m;
  }, [comments]);

  const trendingIds = useMemo(() => {
    const scored = articles.map((a) => ({
      id: a.id,
      n: likeCounts[a.id] ?? 0,
    }));
    scored.sort((a, b) => b.n - a.n);
    return new Set(scored.slice(0, 3).map((x) => x.id));
  }, [articles, likeCounts]);

  const filteredSorted = useMemo(() => {
    let list = [...articles];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== "all") {
      list = list.filter((a) => a.categories?.includes(categoryFilter));
    }
    if (sort === "latest") {
      list.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sort === "likes") {
      list.sort(
        (a, b) =>
          (likeCounts[b.id] ?? 0) - (likeCounts[a.id] ?? 0) ||
          b.createdAt - a.createdAt
      );
    } else {
      list.sort((a, b) => {
        const cb = (commentsByArticle[b.id] ?? []).length;
        const ca = (commentsByArticle[a.id] ?? []).length;
        return cb - ca || b.createdAt - a.createdAt;
      });
    }
    return list;
  }, [
    articles,
    search,
    categoryFilter,
    sort,
    likeCounts,
    commentsByArticle,
  ]);

  const visibleList = useMemo(
    () => filteredSorted.slice(0, visibleCount),
    [filteredSorted, visibleCount]
  );

  feedLenRef.current = filteredSorted.length;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, categoryFilter, sort]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting);
        if (hit) {
          setVisibleCount((c) => {
            const max = feedLenRef.current;
            if (c >= max) return c;
            return Math.min(c + PAGE_SIZE, max);
          });
        }
      },
      { root: null, rootMargin: "200px", threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const publish = useCallback(
    (payload: {
      title: string;
      body: string;
      coverImage: string | null;
      categories: string[];
    }) => {
      if (!user) return;
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `art-${Date.now()}`;
      const post: ArticlePost = {
        id,
        title: payload.title,
        body: payload.body,
        authorName: user.fullName || user.email,
        authorId: user.id,
        roleLabel: roleLabelFor(user),
        createdAt: Date.now(),
        coverImage: payload.coverImage,
        categories: payload.categories,
      };
      setArticles((prev) => {
        const next = [post, ...prev];
        saveArticles(next);
        return next;
      });
      dispatchAppNotification(
        t("article_published", "Article published"),
        payload.title
      );
    },
    [user, t]
  );

  const addComment = useCallback(
    (articleId: string, body: string, parentId: string | null) => {
      const trimmed = body.trim();
      if (!trimmed) return;
      const name = user
        ? user.fullName || user.email
        : t("articles_guest_name", "Guest");
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `c-${Date.now()}`;
      const c: ArticleComment = {
        id,
        articleId,
        authorName: name,
        authorId: user?.id,
        body: trimmed,
        createdAt: Date.now(),
        parentId: parentId || null,
      };
      setComments((prev) => {
        const next = [...prev, c];
        saveComments(next);
        return next;
      });
      dispatchAppNotification(
        t("comment_posted", "New comment"),
        trimmed.slice(0, 80)
      );
    },
    [user, t]
  );

  const toggleLike = useCallback((articleId: string) => {
    setLikeMine((prevMine) => {
      const had = Boolean(prevMine[articleId]);
      const nextMine = { ...prevMine, [articleId]: !had };
      saveLikeMine(nextMine);
      setLikeCounts((prevCnt) => {
        const n = { ...prevCnt };
        const base = n[articleId] || 0;
        n[articleId] = Math.max(0, base + (had ? -1 : 1));
        saveLikeCounts(n);
        return n;
      });
      return nextMine;
    });
  }, []);

  const toggleCommentLike = useCallback((commentId: string) => {
    setCommentLikeMine((prevMine) => {
      const had = Boolean(prevMine[commentId]);
      const nextMine = { ...prevMine, [commentId]: !had };
      saveCommentLikeMine(nextMine);
      setCommentLikeCounts((prevCnt) => {
        const n = { ...prevCnt };
        const base = n[commentId] || 0;
        n[commentId] = Math.max(0, base + (had ? -1 : 1));
        saveCommentLikeCounts(n);
        return n;
      });
      return nextMine;
    });
  }, []);

  const deleteArticle = useCallback((id: string) => {
    setArticles((prev) => {
      const next = prev.filter((a) => a.id !== id);
      saveArticles(next);
      return next;
    });
    setComments((prev) => {
      const next = prev.filter((c) => c.articleId !== id);
      saveComments(next);
      return next;
    });
    setLikeCounts((prev) => {
      const n = { ...prev };
      delete n[id];
      saveLikeCounts(n);
      return n;
    });
    setLikeMine((prev) => {
      const n = { ...prev };
      delete n[id];
      saveLikeMine(n);
      return n;
    });
    setCommentsOpenId((open) => (open === id ? null : open));
  }, []);

  const bumpShare = useCallback((articleId: string) => {
    setShareCounts((prev) => {
      const n = { ...prev };
      n[articleId] = (n[articleId] ?? 0) + 1;
      saveShareCounts(n);
      return n;
    });
  }, []);

  const toolbarBg =
    themeMode === "dark"
      ? "bg-[#121a28]/95 border-[#24304A]"
      : "bg-white/95 border-[#e8dfd0]";

  const filteredMedia = useMemo(() => {
    const q = search.trim().toLowerCase();
    return mediaFeed.filter((m) => {
      if (q && !`${m.title} ${m.body} ${m.authorName} ${m.sourceLabel || ""}`.toLowerCase().includes(q)) {
        return false;
      }
      if (categoryFilter !== "all") {
        if (
          (categoryFilter === "archives" && m.kind !== "document") ||
          (categoryFilter === "genealogy" && m.kind !== "tree")
        ) {
          return false;
        }
      }
      return true;
    });
  }, [mediaFeed, search, categoryFilter]);

  const mediaCommentsByItem = useMemo(() => {
    const map: Record<string, MediaComment[]> = {};
    mediaComments.forEach((c) => {
      if (!map[c.mediaKey]) map[c.mediaKey] = [];
      map[c.mediaKey].push(c);
    });
    Object.keys(map).forEach((k) =>
      map[k].sort((a, b) => a.createdAt - b.createdAt)
    );
    return map;
  }, [mediaComments]);

  const toggleMediaLike = useCallback((mediaKey: string) => {
    setMediaReactMine((prev) => {
      const had = Boolean(prev[mediaKey]);
      const next = { ...prev, [mediaKey]: !had };
      setMediaReactCounts((counts) => ({
        ...counts,
        [mediaKey]: Math.max(0, (counts[mediaKey] ?? 0) + (had ? -1 : 1)),
      }));
      return next;
    });
  }, []);

  const addMediaComment = useCallback(
    (mediaKey: string) => {
      const body = String(mediaCommentDrafts[mediaKey] || "").trim();
      if (!body) return;
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `mc-${Date.now()}`;
      const name = user ? user.fullName || user.email : t("articles_guest_name", "Guest");
      setMediaComments((prev) => [
        ...prev,
        { id, mediaKey, authorName: name, body, createdAt: Date.now() },
      ]);
      setMediaCommentDrafts((prev) => ({ ...prev, [mediaKey]: "" }));
    },
    [mediaCommentDrafts, t, user]
  );

  const shareMedia = useCallback((item: MediaItem) => {
    const url = `${window.location.origin}/articles`;
    const text = `${item.title} — Roots Egypt`;
    if (navigator.share) {
      void navigator.share({ title: item.title, text, url });
    } else {
      void navigator.clipboard.writeText(url);
    }
  }, []);

  return (
    <RootsPageShell
      hero={
        <div className="space-y-3 px-2">
          <p className="text-sm uppercase tracking-[0.3em] text-teal">
            {t("articles", "Articles")}
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold">
            {t("articles_title", "Community writing")}
          </h1>
          <p className="max-w-xl mx-auto text-base opacity-90">
            {t(
              "articles_intro",
              "Stories from researchers and families — a living feed of Egyptian heritage."
            )}
          </p>
        </div>
      }
    >
      <section className="roots-section roots-section-alt px-3 sm:px-4">
        <div className="mx-auto w-full max-w-[680px] space-y-4">
          {/* Filters & search */}
          <div
            className={`sticky top-0 z-30 -mx-1 rounded-2xl border px-3 py-3 backdrop-blur-md ${toolbarBg} shadow-lg`}
          >
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <button
                type="button"
                onClick={() => setFeedView("articles")}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  feedView === "articles"
                    ? "bg-teal text-white"
                    : "bg-black/5 dark:bg-white/10"
                }`}
              >
                {t("articles_feed_tab", "Articles Feed")}
              </button>
              <button
                type="button"
                onClick={() => setFeedView("media")}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  feedView === "media"
                    ? "bg-teal text-white"
                    : "bg-black/5 dark:bg-white/10"
                }`}
              >
                {t("media_feed_tab", "Media Feed")}
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <SlidersHorizontal className="w-4 h-4 text-teal shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider opacity-60">
                {t("articles_sort", "Sort")}
              </span>
              {(
                [
                  ["latest", t("articles_sort_latest", "Latest")],
                  ["likes", t("articles_sort_likes", "Most liked")],
                  ["comments", t("articles_sort_comments", "Most commented")],
                ] as const
              ).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setSort(k)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    sort === k
                      ? "bg-teal text-white"
                      : "bg-black/5 dark:bg-white/10 hover:bg-black/10"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("articles_search", "Search articles…")}
                className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-transparent py-2.5 pl-10 pr-3 text-sm"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
              <button
                type="button"
                onClick={() => setCategoryFilter("all")}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${
                  categoryFilter === "all"
                    ? "bg-[var(--accent-gold)]/25 text-[var(--primary-brown)] dark:text-[var(--accent-gold)] ring-1 ring-[var(--accent-gold)]/40"
                    : "bg-black/5 dark:bg-white/10"
                }`}
              >
                {t("articles_cat_all", "All")}
              </button>
              {EGYPTIAN_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryFilter(c.id)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-transform active:scale-95 ${
                    categoryFilter === c.id ? "ring-2 ring-offset-2 ring-offset-[var(--paper-color)]" : ""
                  }`}
                  style={{
                    backgroundColor: `${c.color}22`,
                    color: c.color,
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {user && feedView === "articles" ? (
            <CreatePostCard
              theme={themeMode}
              user={user}
              placeholder={t(
                "articles_compose_hint",
                "What's on your mind about Egyptian heritage?"
              )}
              titleLabel={t("articles_title_placeholder", "Title")}
              bodyLabel={t("articles_body_placeholder", "Your article…")}
              imageHint={t("articles_cover_hint", "Add a cover image")}
              postLabel={t("articles_publish", "Post")}
              onPublish={publish}
            />
          ) : feedView === "articles" ? (
            <motion.div
              initial={{ opacity: 0.9 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-dashed border-teal/35 px-4 py-6 text-center text-sm opacity-90"
            >
              {t(
                "articles_login_hint",
                "Sign in to publish. Everyone can read, like, and comment."
              )}
            </motion.div>
          ) : null}

          <div className="space-y-8 pb-16">
            {feedView === "articles" ? (
            visibleList.length === 0 ? (
              <div
                className={`rounded-2xl border p-12 text-center opacity-80 ${
                  themeMode === "dark"
                    ? "bg-[#151a21] border-[#24304A]"
                    : "bg-white border-black/10 shadow-md"
                }`}
              >
                {t("articles_empty", "No articles yet — be the first to publish.")}
              </div>
            ) : (
              visibleList.map((a, index) => (
                <div key={a.id} className="relative">
                  {index < visibleList.length - 1 ? (
                    <div
                      className="absolute -bottom-4 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[#c9a227]/25 to-transparent"
                      aria-hidden
                    />
                  ) : null}
                  <ArticlePostCard
                    article={a}
                    theme={themeMode}
                    user={user}
                    isTrending={trendingIds.has(a.id)}
                    likeCount={likeCounts[a.id] ?? 0}
                    liked={Boolean(likeMine[a.id])}
                    onLike={() => toggleLike(a.id)}
                    commentCount={(commentsByArticle[a.id] ?? []).length}
                    shareCount={shareCounts[a.id] ?? 0}
                    comments={commentsByArticle[a.id] ?? []}
                    commentLikeCounts={commentLikeCounts}
                    commentLiked={commentLikeMine}
                    onToggleCommentLike={toggleCommentLike}
                    commentDraft={commentDrafts[a.id] ?? ""}
                    onCommentDraft={(v) =>
                      setCommentDrafts((d) => ({ ...d, [a.id]: v }))
                    }
                    onAddComment={(body, parentId) =>
                      addComment(a.id, body, parentId)
                    }
                    onDeleteArticle={deleteArticle}
                    onOpenShare={() => setShareTarget(a)}
                    commentsExpanded={commentsOpenId === a.id}
                    onToggleCommentsExpanded={() =>
                      setCommentsOpenId((id) => (id === a.id ? null : a.id))
                    }
                    readMore={t("articles_read_more", "Read more")}
                    commentsTitle={t("articles_comments", "Comments")}
                    replyLabel={t("articles_reply", "Reply")}
                    guestName={t("articles_guest_name", "Guest")}
                    staggerIndex={index}
                  />
                </div>
              ))
            )) : mediaLoading ? (
              <div className="rounded-2xl border border-black/10 dark:border-white/10 p-10 text-center opacity-70">
                {t("loading", "Loading...")}
              </div>
            ) : mediaError ? (
              <div className="rounded-2xl border border-red-300/50 p-6 text-center text-red-500">
                {mediaError}
              </div>
            ) : filteredMedia.length === 0 ? (
              <div className="rounded-2xl border border-black/10 dark:border-white/10 p-10 text-center opacity-70">
                {t("media_feed_empty", "No media posts match your filters.")}
              </div>
            ) : (
              filteredMedia.slice(0, visibleCount).map((m) => {
                const mediaKey = m.id;
                const commentsList = mediaCommentsByItem[mediaKey] || [];
                const kindLabel =
                  m.kind === "tree"
                    ? t("trees", "Trees")
                    : m.kind === "image"
                    ? t("gallery", "Gallery")
                    : t("documents", "Documents");
                return (
                  <motion.article
                    key={m.id}
                    className={`rounded-2xl border p-4 sm:p-5 ${
                      themeMode === "dark"
                        ? "bg-[#151a21] border-[#24304A]"
                        : "bg-white border-black/10"
                    }`}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal/20 text-teal flex items-center justify-center">
                        {m.kind === "tree" ? (
                          <Trees className="w-5 h-5" />
                        ) : m.kind === "image" ? (
                          <ImageIcon className="w-5 h-5" />
                        ) : (
                          <BookOpen className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs uppercase tracking-wider opacity-60">{kindLabel}</div>
                        <h3 className="text-xl font-bold leading-snug">{m.title}</h3>
                        <p className="text-xs opacity-60 mt-0.5">{m.authorName}</p>
                        {m.imageUrl ? (
                          <img
                            src={m.imageUrl}
                            alt=""
                            className="mt-3 rounded-xl w-full max-h-[380px] object-cover"
                          />
                        ) : null}
                        <p className="mt-3 text-sm opacity-85 whitespace-pre-wrap">{m.body}</p>
                        {m.sourceLabel ? (
                          <p className="mt-2 text-xs opacity-65 inline-flex items-center gap-1.5">
                            <Archive className="w-3.5 h-3.5" />
                            {m.sourceLabel}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-4 border-t border-black/5 dark:border-white/10 pt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => toggleMediaLike(mediaKey)}
                        className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${
                          mediaReactMine[mediaKey] ? "text-red-500" : "opacity-80 hover:bg-black/5 dark:hover:bg-white/10"
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${mediaReactMine[mediaKey] ? "fill-current" : ""}`} />
                        {mediaReactCounts[mediaKey] ?? 0}
                      </button>
                      <button
                        type="button"
                        onClick={() => shareMedia(m)}
                        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm opacity-80 hover:bg-black/5 dark:hover:bg-white/10"
                      >
                        <Share2 className="w-4 h-4" />
                        {t("share", "Share")}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          toggleFavorite(
                            m.kind === "document" ? "document" : m.kind,
                            m.id.split(":")[1] || m.id
                          )
                        }
                        className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${
                          isFavorite(
                            m.kind === "document" ? "document" : m.kind,
                            m.id.split(":")[1] || m.id
                          )
                            ? "text-pink-500"
                            : "opacity-80 hover:bg-black/5 dark:hover:bg-white/10"
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${
                          isFavorite(
                            m.kind === "document" ? "document" : m.kind,
                            m.id.split(":")[1] || m.id
                          )
                            ? "fill-current"
                            : ""
                        }`} />
                        {t("save_to_favorites", "Save")}
                      </button>
                    </div>
                    <div className="mt-3 space-y-2">
                      {commentsList.length > 0 ? (
                        <ul className="space-y-2">
                          {commentsList.slice(-3).map((c) => (
                            <li key={c.id} className="text-sm rounded-lg bg-black/[0.03] dark:bg-white/[0.04] px-3 py-2">
                              <span className="font-semibold">{c.authorName}: </span>
                              <span className="opacity-85">{c.body}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 opacity-50" />
                        <input
                          type="text"
                          value={mediaCommentDrafts[mediaKey] || ""}
                          onChange={(e) =>
                            setMediaCommentDrafts((prev) => ({
                              ...prev,
                              [mediaKey]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") addMediaComment(mediaKey);
                          }}
                          placeholder={t("write_comment", "Write a comment…")}
                          className="flex-1 rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                  </motion.article>
                );
              })
            )}
            {(feedView === "articles"
              ? filteredSorted.length > visibleList.length
              : filteredMedia.length > visibleCount) ? (
              <div ref={loadMoreRef} className="h-12 flex items-center justify-center text-xs opacity-50">
                {t("articles_loading_more", "Loading more…")}
              </div>
            ) : (
              <div className="h-6" />
            )}
          </div>
        </div>
      </section>

      <ShareArticleModal
        open={Boolean(shareTarget)}
        onClose={() => setShareTarget(null)}
        article={shareTarget}
        onShareCount={bumpShare}
        titleShare={t("articles_share_title", "Share article")}
        labelCopy={t("articles_copy_link", "Copy link")}
        labelInternal={t("articles_share_internal", "Share internally (notification)")}
        labelClose={t("close", "Close")}
      />
    </RootsPageShell>
  );
}
