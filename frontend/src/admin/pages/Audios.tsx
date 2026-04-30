import { useCallback, useEffect, useState } from "react";
import { useThemeStore } from "../../store/theme";
import { useTranslation } from "../../context/TranslationContext";
import { api } from "../../api/client";
import { getApiErrorMessage, requestWithFallback } from "../../api/helpers";
import { Upload, Trash2, Edit, Music, Play, Pause, Clock } from "lucide-react";
import Toast from "../../components/Toast";

interface Audio {
  id: number | string;
  title: string;
  description?: string;
  audioPath?: string;
  duration?: number;
  category?: string;
  isPublic?: boolean;
  createdAt?: string;
  [key: string]: unknown;
}

export default function AdminAudios() {
  const { theme } = useThemeStore();
  const { t } = useTranslation();
  const isDark = theme === "dark";

  const pageBg = isDark ? "bg-[#0d1b2a]" : "bg-[#f5f1e8]";
  const text = isDark ? "text-[#f8f5ef]" : "text-[#0d1b2a]";
  const card = isDark ? "bg-[#0d1b2a]" : "bg-white";
  const border = isDark ? "border-white/10" : "border-black/10";
  const muted = isDark ? "text-[#7a8fa3]" : "text-gray-500";

  const [audios, setAudios] = useState<Audio[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [playingId, setPlayingId] = useState<number | string | null>(null);
  const [toast, setToast] = useState({ message: "", tone: "success" });
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    isPublic: true,
  });
  const [audioFile, setAudioFile] = useState<File | null>(null);

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

  const loadAudios = useCallback(
    async ({ notify: notifyToast = false } = {}) => {
      try {
        setLoading(true);
        const { data } = await requestWithFallback([
          () => api.get("/admin/audios"),
          () => api.get("/audios"),
        ]);
        setAudios(Array.isArray(data) ? data : []);
        if (notifyToast) {
          notify(t("audios_loaded", "Audios loaded."));
        }
      } catch (err: unknown) {
        notify(getApiErrorMessage(err, "Failed to load audios"), "error");
      } finally {
        setLoading(false);
      }
    },
    [notify, t],
  );

  useEffect(() => {
    loadAudios();
  }, [loadAudios]);

  const resetForm = () => {
    setForm({ title: "", description: "", category: "", isPublic: true });
    setAudioFile(null);
    setEditingId(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("category", form.category);
      fd.append("isPublic", String(form.isPublic));
      if (audioFile) fd.append("audio", audioFile);

      if (editingId) {
        await api.patch(`/admin/audios/${editingId}`, fd);
        notify(t("audioUpdated", "Audio updated"));
      } else {
        await api.post("/admin/audios", fd);
        notify(t("audioCreated", "Audio created"));
      }
      resetForm();
      loadAudios({ notify: true });
    } catch (err: unknown) {
      notify(getApiErrorMessage(err, "Failed to save audio"), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm(t("confirmDelete", "Are you sure?"))) return;
    try {
      await api.delete(`/admin/audios/${id}`);
      notify(t("audioDeleted", "Audio deleted"));
      loadAudios({ notify: true });
    } catch (err: unknown) {
      notify(getApiErrorMessage(err, "Failed to delete audio"), "error");
    }
  };

  const startEdit = (audio: Audio) => {
    setEditingId(audio.id);
    setForm({
      title: audio.title || "",
      description: audio.description || "",
      category: audio.category || "",
      isPublic: audio.isPublic ?? true,
    });
    setAudioFile(null);
  };

  const togglePlay = (id: number | string) => {
    setPlayingId((prev) => (prev === id ? null : id));
  };

  return (
    <div className={`min-h-screen ${pageBg} ${text} p-6`}>
      <Toast message={toast.message} tone={toast.tone} />
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? "bg-teal/15" : "bg-teal/10"}`}
            >
              <Music className="w-6 h-6 text-teal" />
            </div>
            <div>
              <h1 className="text-2xl font-cinzel font-bold">
                {t("adminAudios", "Audio Management")}
              </h1>
              <p className={`text-sm ${muted}`}>
                {audios.length} {t("totalItems", "items")}
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div
          className={`${card} border ${border} rounded-2xl overflow-hidden mb-8 shadow-sm hover:shadow-md transition-shadow`}
        >
          <div
            className={`px-6 py-4 border-b ${border} ${isDark ? "bg-gradient-to-r from-teal/5 to-transparent" : "bg-gradient-to-r from-teal/5 to-transparent"}`}
          >
            <h2 className="text-lg font-semibold flex items-center gap-2">
              {editingId ? (
                <>
                  <Edit className="w-4 h-4 text-terracotta" />{" "}
                  {t("editAudio", "Edit Audio")}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 text-teal" />{" "}
                  {t("addAudio", "Add Audio")}
                </>
              )}
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider opacity-60">
                  {t("title", "Title")}
                </label>
                <input
                  placeholder={t("title", "Title")}
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  className={`w-full px-4 py-2.5 rounded-xl border ${border} ${isDark ? "bg-white/5" : "bg-black/5"} outline-none focus:ring-2 focus:ring-teal/30 transition-shadow`}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider opacity-60">
                  {t("category", "Category")}
                </label>
                <input
                  placeholder={t("category", "Category")}
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                  className={`w-full px-4 py-2.5 rounded-xl border ${border} ${isDark ? "bg-white/5" : "bg-black/5"} outline-none focus:ring-2 focus:ring-teal/30 transition-shadow`}
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider opacity-60">
                  {t("description", "Description")}
                </label>
                <textarea
                  placeholder={t("description", "Description")}
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={3}
                  className={`w-full px-4 py-2.5 rounded-xl border ${border} ${isDark ? "bg-white/5" : "bg-black/5"} outline-none focus:ring-2 focus:ring-teal/30 transition-shadow resize-none`}
                />
              </div>
              <div className="flex items-center gap-3">
                <label
                  className={`px-4 py-2.5 rounded-xl border ${border} ${isDark ? "bg-white/5" : "bg-black/5"} cursor-pointer flex items-center gap-2 hover:border-teal/40 transition-colors`}
                >
                  <Upload className="w-4 h-4 text-teal" />
                  <span className="text-sm truncate max-w-[180px]">
                    {audioFile
                      ? audioFile.name
                      : t("chooseFile", "Choose audio file")}
                  </span>
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
              <label
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${border} ${isDark ? "bg-white/5" : "bg-black/5"} cursor-pointer w-fit hover:border-teal/40 transition-colors`}
              >
                <div
                  className={`w-10 h-5 rounded-full transition-colors relative ${form.isPublic ? "bg-teal" : isDark ? "bg-white/20" : "bg-black/20"}`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.isPublic ? "translate-x-5" : "translate-x-0.5"}`}
                  />
                </div>
                <input
                  type="checkbox"
                  checked={form.isPublic}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isPublic: e.target.checked }))
                  }
                  className="hidden"
                />
                <span className="text-sm">{t("public", "Public")}</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={saving || !form.title}
                className="px-6 py-2.5 bg-gradient-to-r from-teal to-tealDark text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-teal/25 disabled:opacity-50 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                {saving
                  ? t("saving", "Saving...")
                  : editingId
                    ? t("update", "Update")
                    : t("create", "Create")}
              </button>
              {editingId && (
                <button
                  onClick={resetForm}
                  className={`px-6 py-2.5 border ${border} rounded-xl hover:bg-black/5 transition-colors`}
                >
                  {t("cancel", "Cancel")}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Audio Grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-[3px] border-teal border-t-transparent rounded-full animate-spin" />
          </div>
        ) : audios.length === 0 ? (
          <div
            className={`text-center py-16 ${card} border ${border} rounded-2xl`}
          >
            <Music className={`w-12 h-12 mx-auto mb-4 ${muted}`} />
            <p className={`${muted} text-lg`}>
              {t("noAudios", "No audios yet")}
            </p>
            <p className={`text-sm ${muted} mt-1`}>
              {t("addFirstItem", "Use the form above to add your first item")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {audios.map((audio) => (
              <div
                key={audio.id}
                className={`${card} border ${border} rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all group`}
              >
                <div
                  className={`px-4 py-3 border-b ${border} ${isDark ? "bg-gradient-to-r from-teal/5 to-transparent" : "bg-gradient-to-r from-teal/5 to-transparent"}`}
                >
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Music className="w-4 h-4 text-teal" />
                      {audio.title}
                    </h3>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(audio)}
                        className="p-1.5 rounded-lg hover:bg-teal/10 text-teal transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(audio.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {audio.description && (
                    <p className={`text-sm ${muted} line-clamp-2`}>
                      {audio.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-sm flex-wrap">
                    {audio.audioPath && (
                      <button
                        onClick={() => togglePlay(audio.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                          playingId === audio.id
                            ? "bg-teal text-white"
                            : "bg-teal/10 text-teal hover:bg-teal/20"
                        }`}
                      >
                        {playingId === audio.id ? (
                          <Pause className="w-3.5 h-3.5" />
                        ) : (
                          <Play className="w-3.5 h-3.5" />
                        )}
                        {playingId === audio.id
                          ? t("pause", "Pause")
                          : t("play", "Play")}
                      </button>
                    )}
                    {audio.duration && (
                      <span
                        className={`flex items-center gap-1 ${muted} text-xs`}
                      >
                        <Clock className="w-3 h-3" />
                        {Math.round(audio.duration)}s
                      </span>
                    )}
                    {audio.category && (
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium ${isDark ? "bg-terracotta/15 text-terracotta" : "bg-terracotta/10 text-terracotta"}`}
                      >
                        {audio.category}
                      </span>
                    )}
                    {audio.isPublic !== undefined && (
                      <span
                        className={`px-2 py-0.5 rounded-lg text-xs ${audio.isPublic ? "bg-green-500/10 text-green-400" : "bg-amber-500/10 text-amber-400"}`}
                      >
                        {audio.isPublic
                          ? t("public", "Public")
                          : t("private", "Private")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
