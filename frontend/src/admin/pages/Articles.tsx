import { useCallback, useEffect, useState } from "react";
import { useThemeStore } from "../../store/theme";
import { useTranslation } from "../../context/TranslationContext";
import { api } from "../../api/client";
import { getApiErrorMessage, requestWithFallback, shouldFallbackRoute } from "../../api/helpers";
import { Edit, Globe, Image as ImageIcon, Link2, Lock, MessageCircle, Play, Send, Trash2, Users, X } from "lucide-react";
import Toast from "../../components/Toast";

interface Article {
  id: number | string;
  content: string;
  images?: string[];
  videos?: string[];
  visibility?: "public" | "community" | "private";
  createdAt?: string;
  userName?: string;
  [key: string]: unknown;
}

export default function AdminArticles() {
  const { theme } = useThemeStore();
  const { t } = useTranslation();
  const isDark = theme === "dark";

  const pageBg = isDark ? "bg-[#0d1b2a]" : "bg-[#f5f1e8]";
  const text = isDark ? "text-[#f8f5ef]" : "text-[#0d1b2a]";
  const card = isDark ? "bg-[#0d1b2a]" : "bg-white";
  const border = isDark ? "border-white/10" : "border-black/10";
  const muted = isDark ? "text-[#7a8fa3]" : "text-gray-500";

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [toast, setToast] = useState({ message: "", tone: "success" });
  const [imageInput, setImageInput] = useState("");
  const [videoInput, setVideoInput] = useState("");
  const [form, setForm] = useState({
    content: "",
    visibility: "public" as "public" | "community" | "private",
    images: [] as string[],
    videos: [] as string[],
  });

  const notify = useCallback((message: string, tone = "success") => {
    setToast({ message, tone });
  }, []);

  useEffect(() => {
    if (!toast.message) return;
    const timer = setTimeout(() => {
      setToast({ message: "", tone: "success" });
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast.message]);

  const loadArticles = useCallback(async ({ notify: notifyToast = false } = {}) => {
    try {
      setLoading(true);
      const { data } = await requestWithFallback([
        () => api.get("/admin/articles"),
        () => api.get("/articles"),
      ]);
      setArticles(Array.isArray(data) ? data : []);
      if (notifyToast) {
        notify(t("articles_loaded", "Articles loaded."));
      }
    } catch (err: unknown) {
      notify(getApiErrorMessage(err, "Failed to load articles"), "error");
    } finally {
      setLoading(false);
    }
  }, [notify, t]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const resetForm = () => {
    setForm({ content: "", visibility: "public", images: [], videos: [] });
    setImageInput("");
    setVideoInput("");
    setEditingId(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = { ...form };
      if (editingId) {
        await api.patch(`/admin/articles/${editingId}`, payload);
        notify(t("articleUpdated", "Article updated"));
      } else {
        await api.post("/admin/articles", payload);
        notify(t("articleCreated", "Article created"));
      }
      resetForm();
      loadArticles({ notify: true });
    } catch (err: unknown) {
      notify(getApiErrorMessage(err, "Failed to save article"), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm(t("confirmDelete", "Are you sure?"))) return;
    try {
      await api.delete(`/admin/articles/${id}`);
      notify(t("articleDeleted", "Article deleted"));
      loadArticles({ notify: true });
    } catch (err: unknown) {
      notify(getApiErrorMessage(err, "Failed to delete article"), "error");
    }
  };

  const startEdit = (article: Article) => {
    setEditingId(article.id);
    setForm({
      content: article.content || "",
      visibility: article.visibility || "public",
      images: article.images || [],
      videos: article.videos || [],
    });
    setImageInput("");
    setVideoInput("");
  };

  const addImage = () => {
    if (imageInput.trim()) {
      setForm((f) => ({ ...f, images: [...f.images, imageInput.trim()] }));
      setImageInput("");
    }
  };

  const addVideo = () => {
    if (videoInput.trim()) {
      setForm((f) => ({ ...f, videos: [...f.videos, videoInput.trim()] }));
      setVideoInput("");
    }
  };

  const visibilityIcon = (v: string) => {
    if (v === "private") return <Lock className="w-3 h-3" />;
    if (v === "community") return <Users className="w-3 h-3" />;
    return <Globe className="w-3 h-3" />;
  };

  return (
    <div className={`min-h-screen ${pageBg} ${text} p-6`}>
      <Toast message={toast.message} tone={toast.tone} />
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-cinzel font-bold mb-6 flex items-center gap-3">
          <MessageCircle className="w-7 h-7 text-teal" />
          {t("adminArticles", "Article Management")}
        </h1>

        {/* Form */}
        <div className={`${card} border ${border} rounded-xl p-6 mb-8`}>
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? t("editArticle", "Edit Article") : t("addArticle", "Add Article")}
          </h2>
          <div className="space-y-4">
            <textarea
              placeholder={t("content", "Content")}
              value={form.content}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm((f) => ({ ...f, content: e.target.value }))}
              rows={4}
              className={`w-full px-4 py-2 rounded-lg border ${border} ${isDark ? "bg-white/5" : "bg-black/5"} outline-none`}
            />
            <div className="flex items-center gap-3">
              <label className={`px-4 py-2 rounded-lg border ${border} ${isDark ? "bg-white/5" : "bg-black/5"} flex items-center gap-2`}>
                {visibilityIcon(form.visibility)}
                <select
                  value={form.visibility}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm((f) => ({ ...f, visibility: e.target.value as "public" | "community" | "private" }))}
                  className={`${isDark ? "bg-transparent" : "bg-transparent"} outline-none`}
                >
                  <option value="public">{t("public", "Public")}</option>
                  <option value="community">{t("community", "Community")}</option>
                  <option value="private">{t("private", "Private")}</option>
                </select>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                placeholder={t("imageUrl", "Image URL")}
                value={imageInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImageInput(e.target.value)}
                className={`flex-1 px-4 py-2 rounded-lg border ${border} ${isDark ? "bg-white/5" : "bg-black/5"} outline-none`}
              />
              <button onClick={addImage} className="p-2 text-teal hover:text-teal/80"><ImageIcon className="w-5 h-5" /></button>
            </div>
            {form.images.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.images.map((img, i) => (
                  <span key={i} className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${isDark ? "bg-teal/15 text-teal" : "bg-teal/10 text-teal"}`}>
                    {img.length > 30 ? img.slice(0, 30) + "..." : img}
                    <button onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, j) => j !== i) }))}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                placeholder={t("videoUrl", "Video URL")}
                value={videoInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVideoInput(e.target.value)}
                className={`flex-1 px-4 py-2 rounded-lg border ${border} ${isDark ? "bg-white/5" : "bg-black/5"} outline-none`}
              />
              <button onClick={addVideo} className="p-2 text-teal hover:text-teal/80"><Play className="w-5 h-5" /></button>
            </div>
            {form.videos.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.videos.map((vid, i) => (
                  <span key={i} className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${isDark ? "bg-teal/15 text-teal" : "bg-teal/10 text-teal"}`}>
                    {vid.length > 30 ? vid.slice(0, 30) + "..." : vid}
                    <button onClick={() => setForm((f) => ({ ...f, videos: f.videos.filter((_, j) => j !== i) }))}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSave}
              disabled={saving || !form.content}
              className="px-6 py-2 bg-teal text-white rounded-lg font-semibold hover:bg-teal/80 disabled:opacity-50"
            >
              {saving ? t("saving", "Saving...") : editingId ? t("update", "Update") : t("create", "Create")}
            </button>
            {editingId && (
              <button onClick={resetForm} className="px-6 py-2 border border-current rounded-lg hover:bg-black/5">
                {t("cancel", "Cancel")}
              </button>
            )}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-3 border-teal border-t-transparent rounded-full animate-spin" />
          </div>
        ) : articles.length === 0 ? (
          <p className={`${muted} text-center py-12`}>{t("noArticles", "No articles yet")}</p>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <div key={article.id} className={`${card} border ${border} rounded-xl p-4`}>
                <div className="flex items-start justify-between mb-2">
                  <p className="flex-1 whitespace-pre-wrap">{article.content}</p>
                  <div className="flex gap-2 ml-4">
                    <button onClick={() => startEdit(article)} className="p-1 hover:text-teal"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(article.id)} className="p-1 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className={`flex items-center gap-1 ${muted}`}>
                    {visibilityIcon(article.visibility || "public")}
                    {article.visibility || "public"}
                  </span>
                  {article.userName && <span className={muted}>{article.userName}</span>}
                  {article.createdAt && <span className={muted}>{new Date(article.createdAt).toLocaleDateString()}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
