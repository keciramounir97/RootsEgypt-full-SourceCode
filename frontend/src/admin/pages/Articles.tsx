import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useThemeStore } from "../../store/theme";
import { useLanguage } from "../../i18n";
import { api } from "../../api/client";
import { getApiErrorMessage, getApiRoot, requestWithFallback, shouldFallbackRoute } from "../../api/helpers";
import { Edit, Globe, Image as ImageIcon, Lock, MessageCircle, Play, Send, Trash2, Users, X } from "lucide-react";
import Toast from "../../components/Toast";
import articleFallbackImage from "../../assets/galleryimage.png";

interface Article {
  id: number | string;
  title?: string;
  category?: string;
  content: string;
  images?: string[];
  videos?: string[];
  visibility?: "public" | "community" | "private";
  createdAt?: string;
  likes?: number;
  userName?: string;
}

const parseMediaList = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => String(item || "").trim()).filter(Boolean);
  if (typeof value === "object") {
    const item = value as Record<string, unknown>;
    const url = item.url || item.src || item.path || item.image_path;
    return url ? [String(url).trim()] : [];
  }
  const raw = String(value || "").trim();
  if (!raw) return [];
  try {
    return parseMediaList(JSON.parse(raw));
  } catch {
    return raw.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
  }
};

const resolveMediaUrl = (url: string, apiRoot: string) => {
  const clean = String(url || "").trim();
  if (!clean) return articleFallbackImage;
  if (/^(https?:)?\/\//i.test(clean) || clean.startsWith("data:") || clean.startsWith("blob:")) return clean;
  if (clean.startsWith("/uploads/")) return `${apiRoot}${clean}`;
  return clean;
};

const normalizeArticle = (item: any, apiRoot: string): Article => {
  const author = item?.author && typeof item.author === "object" ? item.author : null;
  const images = parseMediaList(item?.images).map((url) => resolveMediaUrl(url, apiRoot));
  const videos = parseMediaList(item?.videos).map((url) => resolveMediaUrl(url, apiRoot));

  return {
    id: item?.id,
    title: item?.title || "",
    category: item?.category || "",
    content: item?.content || "",
    images,
    videos,
    visibility: item?.visibility || (item?.is_public === false ? "private" : "public"),
    createdAt: item?.createdAt || item?.created_at,
    likes: Number(item?.likes || 0),
    userName:
      item?.userName ||
      item?.user_name ||
      item?.author_name ||
      author?.full_name ||
      author?.fullName ||
      "User",
  };
};

export default function AdminArticles() {
  const { theme } = useThemeStore();
  const { t } = useLanguage();
  const isDark = theme === "dark";
  const apiRoot = useMemo(() => getApiRoot(), []);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [imageInput, setImageInput] = useState("");
  const [videoInput, setVideoInput] = useState("");
  const [form, setForm] = useState({
    title: "",
    category: "",
    content: "",
    visibility: "public" as "public" | "community" | "private",
    images: [] as string[],
    videos: [] as string[],
  });
  const [toast, setToast] = useState({ message: "", tone: "success" as "success" | "error" });

  const notify = useCallback((message: string, tone: "success" | "error" = "success") => {
    setToast({ message, tone });
  }, []);

  useEffect(() => {
    if (!toast.message) return;
    const timer = setTimeout(() => setToast({ message: "", tone: "success" }), 3500);
    return () => clearTimeout(timer);
  }, [toast.message]);

  const loadArticles = useCallback(async () => {
    try {
      setLoading(true);
      const shouldFallback = (err: any) => shouldFallbackRoute(err) || [401, 403, 500].includes(err?.response?.status);
      const { data } = await requestWithFallback([() => api.get("/admin/articles"), () => api.get("/my/articles"), () => api.get("/articles")], shouldFallback);
      const list =
        (data?.success && Array.isArray(data.data) ? data.data : null) ||
        (Array.isArray(data?.articles) && data.articles) ||
        (Array.isArray(data) && data) ||
        [];
      setArticles(list.map((item: any) => normalizeArticle(item, apiRoot)));
    } catch (err) {
      setArticles([]);
      notify(
        getApiErrorMessage(err, t("legacy.posts_load_failed", "Failed to load posts")),
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [apiRoot, notify, t]);

  useEffect(() => {
    void loadArticles();
  }, [loadArticles]);

  const resetForm = () => {
    setEditingId(null);
    setImageInput("");
    setVideoInput("");
    setForm({ title: "", category: "", content: "", visibility: "public", images: [], videos: [] });
  };

  const addMedia = (kind: "images" | "videos", url: string) => {
    const clean = String(url || "").trim();
    if (!clean) return;
    setForm((prev) => (prev[kind].includes(clean) ? prev : { ...prev, [kind]: [...prev[kind], clean] }));
  };

  const removeMedia = (kind: "images" | "videos", url: string) => {
    setForm((prev) => ({ ...prev, [kind]: prev[kind].filter((u) => u !== url) }));
  };

  const saveArticle = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.content.trim()) {
      notify(t("legacy.content_required", "Please enter content"), "error");
      return;
    }

    const payload = {
      title: form.title.trim() || form.content.trim().slice(0, 90),
      category: form.category.trim(),
      content: form.content.trim(),
      visibility: form.visibility,
      images: form.images,
      videos: form.videos,
    };

    try {
      setSaving(true);
      const shouldFallback = (err: any) => shouldFallbackRoute(err) || [401, 403, 500].includes(err?.response?.status);
      if (editingId) {
        await requestWithFallback([() => api.put(`/admin/articles/${editingId}`, payload), () => api.put(`/my/articles/${editingId}`, payload)], shouldFallback);
        notify(t("legacy.article_updated", "Post updated."));
      } else {
        await requestWithFallback([() => api.post("/admin/articles", payload), () => api.post("/my/articles", payload)], shouldFallback);
        notify(t("legacy.article_created", "Post published."));
      }
      resetForm();
      await loadArticles();
    } catch (err) {
      notify(
        getApiErrorMessage(err, t("legacy.post_save_failed", "Failed to save post")),
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteArticle = async (id: number | string) => {
    if (!window.confirm(t("legacy.confirm_delete", "Are you sure you want to delete this item?"))) return;
    try {
      const shouldFallback = (err: any) => shouldFallbackRoute(err) || [401, 403, 500].includes(err?.response?.status);
      await requestWithFallback([() => api.delete(`/admin/articles/${id}`), () => api.delete(`/my/articles/${id}`)], shouldFallback);
      notify(t("legacy.article_deleted", "Post deleted."));
      await loadArticles();
    } catch (err) {
      notify(
        getApiErrorMessage(err, t("legacy.post_delete_failed", "Failed to delete post")),
        "error",
      );
    }
  };

  const editArticle = (item: Article) => {
    setEditingId(item.id);
    setForm({
      title: item.title || "",
      category: item.category || "",
      content: item.content || "",
      visibility: item.visibility || "public",
      images: Array.isArray(item.images) ? item.images : [],
      videos: Array.isArray(item.videos) ? item.videos : [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const stats = useMemo(() => {
    const total = articles.length;
    const media = articles.filter((a) => (a.images?.length || 0) + (a.videos?.length || 0) > 0).length;
    const community = articles.filter((a) => a.visibility === "community").length;
    return { total, media, community };
  }, [articles]);

  const pageBg = isDark ? "bg-[#071827]" : "bg-[#f5f1e8]";
  const text = isDark ? "text-[#f5f1e8]" : "text-[#162238]";
  const card = isDark ? "bg-[#0f1f33]" : "bg-white";
  const border = isDark ? "border-[#d9a441]/20" : "border-[#24766f]/20";
  const inputBg = isDark ? "bg-[#071827]" : "bg-[#f7f2e8]";

  return (
    <div className={`min-h-screen p-6 ${pageBg}`}>
      <Toast message={toast.message} tone={toast.tone} />
      <div className="max-w-6xl mx-auto space-y-6">
        <section className={`${card} border ${border} rounded-2xl p-6`}>
          <h1 className={`text-3xl font-bold ${text}`}>{t("legacy.article_management", "Genealogy Social Feed")}</h1>
          <p className={`${text} opacity-70 mt-1`}>{t("legacy.article_desc", "Publish discoveries, stories, and media-rich family updates.")}</p>
          <div className="grid md:grid-cols-3 gap-3 mt-4">
            <div className="rounded-xl p-3 bg-[#24766f]/10"><p className="text-xs opacity-70">{t("legacy.posts", "Posts")}</p><p className="text-xl font-bold">{stats.total}</p></div>
            <div className="rounded-xl p-3 bg-[#d9a441]/10"><p className="text-xs opacity-70">{t("legacy.with_media", "With Media")}</p><p className="text-xl font-bold">{stats.media}</p></div>
            <div className="rounded-xl p-3 bg-[#0f2742]/10"><p className="text-xs opacity-70">{t("legacy.community", "Community")}</p><p className="text-xl font-bold">{stats.community}</p></div>
          </div>
        </section>

        <section className={`${card} border ${border} rounded-2xl p-6`}>
          <form onSubmit={saveArticle} className="space-y-4">
            <input
              value={form.title}
              onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
              placeholder={t("legacy.post_title", "Post title")}
              className={`w-full rounded-xl border ${border} ${inputBg} ${text} px-4 py-3 outline-none`}
            />
            <input
              value={form.category}
              onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}
              placeholder={t("legacy.custom_category_placeholder", "Name this category...")}
              className={`w-full rounded-xl border ${border} ${inputBg} ${text} px-4 py-3 outline-none`}
            />
            <textarea
              rows={5}
              value={form.content}
              onChange={(e) => setForm((s) => ({ ...s, content: e.target.value }))}
              placeholder={t("legacy.share_story_placeholder", "Share a family discovery, migration story, or archival finding...")}
              className={`w-full rounded-xl border ${border} ${inputBg} ${text} p-4 outline-none`}
            />

            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex gap-2">
                <input value={imageInput} onChange={(e) => setImageInput(e.target.value)} placeholder={t("legacy.image_url", "Image URL")} className={`flex-1 rounded-lg border ${border} ${inputBg} px-3 py-2`} />
                <button type="button" onClick={() => { addMedia("images", imageInput); setImageInput(""); }} className="px-3 rounded-lg border inline-flex items-center gap-1"><ImageIcon className="w-4 h-4" />{t("legacy.add", "Add")}</button>
              </div>
              <div className="flex gap-2">
                <input value={videoInput} onChange={(e) => setVideoInput(e.target.value)} placeholder={t("legacy.video_url", "Video URL")} className={`flex-1 rounded-lg border ${border} ${inputBg} px-3 py-2`} />
                <button type="button" onClick={() => { addMedia("videos", videoInput); setVideoInput(""); }} className="px-3 rounded-lg border inline-flex items-center gap-1"><Play className="w-4 h-4" />{t("legacy.add", "Add")}</button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {form.images.map((u) => <span key={u} className="text-xs px-2 py-1 rounded-full bg-[#24766f]/15 inline-flex items-center gap-1"><ImageIcon className="w-3 h-3" />{u.slice(0, 42)}{u.length > 42 ? "..." : ""}<button type="button" onClick={() => removeMedia("images", u)}><X className="w-3 h-3" /></button></span>)}
              {form.videos.map((u) => <span key={u} className="text-xs px-2 py-1 rounded-full bg-[#d9a441]/15 inline-flex items-center gap-1"><Play className="w-3 h-3" />{u.slice(0, 42)}{u.length > 42 ? "..." : ""}<button type="button" onClick={() => removeMedia("videos", u)}><X className="w-3 h-3" /></button></span>)}
            </div>

            {form.images.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {form.images.slice(0, 3).map((url) => (
                  <img
                    key={url}
                    src={resolveMediaUrl(url, apiRoot)}
                    alt=""
                    onError={(event) => {
                      event.currentTarget.src = articleFallbackImage;
                    }}
                    className="h-32 w-full rounded-xl object-cover border border-black/5"
                  />
                ))}
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-3">
              <select value={form.visibility} onChange={(e) => setForm((s) => ({ ...s, visibility: e.target.value as any }))} className={`rounded-lg border ${border} ${inputBg} px-3 py-2`}>
                <option value="public">{t("legacy.public", "Public")}</option>
                <option value="community">{t("legacy.community", "Community")}</option>
                <option value="private">{t("legacy.private", "Private")}</option>
              </select>
              <button disabled={saving} className="px-4 py-2 rounded-lg bg-[#24766f] text-white inline-flex items-center gap-2">
                <Send className="w-4 h-4" />
                {saving ? t("legacy.posting", "Posting...") : editingId ? t("legacy.update", "Update") : t("legacy.post", "Post")}
              </button>
              {editingId ? <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg border inline-flex items-center gap-2"><X className="w-4 h-4" />{t("legacy.cancel", "Cancel")}</button> : null}
            </div>
          </form>
        </section>

        <section className={`${card} border ${border} rounded-2xl p-6`}>
          {loading ? (
            <div className="py-12 text-center opacity-60">{t("legacy.loading", "Loading...")}</div>
          ) : articles.length === 0 ? (
            <div className="py-12 text-center opacity-60">{t("legacy.no_articles", "No posts yet.")}</div>
          ) : (
            <div className="space-y-4">
              {articles.map((article) => (
                <article key={article.id} className={`rounded-xl border ${border} overflow-hidden ${isDark ? "bg-white/5" : "bg-black/[0.02]"}`}>
                  {(article.images || [])[0] ? (
                    <a href={(article.images || [])[0]} target="_blank" rel="noreferrer" className="block">
                      <img
                        src={(article.images || [])[0]}
                        alt={article.title || t("legacy.article_image", "Article image")}
                        onError={(event) => {
                          event.currentTarget.src = articleFallbackImage;
                        }}
                        className="h-56 w-full object-cover"
                      />
                    </a>
                  ) : null}
                  <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#24766f] to-[#d9a441] text-white grid place-items-center text-xs font-bold">
                        {(article.userName || t("legacy.user", "User")).charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold">{article.userName || t("legacy.user", "User")}</p>
                        <p className="text-xs opacity-60">{article.createdAt ? new Date(article.createdAt).toLocaleString() : "-"}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => editArticle(article)} className="p-2 rounded-lg hover:bg-[#24766f]/20"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => deleteArticle(article.id)} className="p-2 rounded-lg hover:bg-red-500/20 text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  {article.title ? <h3 className={`mt-4 text-xl font-bold ${text}`}>{article.title}</h3> : null}
                  {article.category ? (
                    <span className="mt-3 inline-flex px-2.5 py-1 rounded-full bg-[#24766f]/10 text-[#24766f] text-xs font-semibold">
                      {article.category}
                    </span>
                  ) : null}
                  <p className={`mt-2 whitespace-pre-wrap ${text}`}>{article.content}</p>
                  {(article.images?.length || article.videos?.length) ? (
                    <div className="mt-3 grid md:grid-cols-2 gap-3">
                      {(article.images || []).slice((article.images || []).length > 1 ? 1 : 0, 3).map((url) => (
                        <a key={url} href={url} target="_blank" rel="noreferrer" className="rounded-lg border overflow-hidden block">
                          <img
                            src={url}
                            alt={article.title || t("legacy.article_image", "Article image")}
                            onError={(event) => {
                              event.currentTarget.src = articleFallbackImage;
                            }}
                            className="w-full h-40 object-cover"
                          />
                        </a>
                      ))}
                      {(article.videos || []).slice(0, 2).map((url) => <a key={url} href={url} target="_blank" rel="noreferrer" className={`rounded-lg border p-3 inline-flex items-center gap-2 ${text}`}><Play className="w-4 h-4" />{url}</a>)}
                    </div>
                  ) : null}
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs opacity-80">
                    <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-white/10">
                      {article.visibility === "public" ? <Globe className="w-3 h-3" /> : article.visibility === "community" ? <Users className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      {article.visibility || "public"}
                    </span>
                    <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-white/10">
                      <MessageCircle className="w-3 h-3" />
                      {article.likes || 0} {t("legacy.likes", "likes")}
                    </span>
                  </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
