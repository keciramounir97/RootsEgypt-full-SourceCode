import { useCallback, useEffect, useMemo, useState } from "react";
import { useThemeStore } from "../../store/theme";
import { useLanguage } from "../../i18n";
import { api } from "../../api/client";
import {
  getApiErrorMessage,
  getApiRoot,
  requestWithFallback,
  shouldFallbackRoute,
} from "../../api/helpers";
import {
  Upload,
  Trash2,
  Edit,
  X,
  Music,
  Play,
  Pause,
  Clock,
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
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
}

export default function AdminAudios() {
  const { theme } = useThemeStore();
  const { t } = useLanguage();
  const isDark = theme === "dark";
  const apiRoot = useMemo(() => getApiRoot(), []);

  const maxAudioBytes = 50 * 1024 * 1024;
  const allowedAudioExts = new Set(["mp3", "wav", "m4a", "ogg", "aac"]);

  const [audios, setAudios] = useState<Audio[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    isPublic: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [playingId, setPlayingId] = useState<number | string | null>(null);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [toast, setToast] = useState({ message: "", tone: "success" });
  const audioStats = useMemo(() => {
    const total = audios.length;
    const publicCount = audios.filter((a) => !!a.isPublic).length;
    const withDuration = audios.filter((a) => Number(a.duration) > 0).length;
    return { total, publicCount, withDuration };
  }, [audios]);

  const getExtension = (name: string) => {
    const parts = String(name || "").toLowerCase().split(".");
    return parts.length > 1 ? parts.pop() : "";
  };

  const validateAudioFile = (file: File, { required = false } = {}) => {
    if (!file) {
      return required ? t("legacy.audio_required", "Please select an audio file") : "";
    }
    if (file.size > maxAudioBytes) {
      return t("legacy.file_too_large", "File is too large (max 50MB).");
    }
    const ext = getExtension(file.name);
    const isAudioType = file.type ? file.type.startsWith("audio/") : false;
    if (!isAudioType && ext && !allowedAudioExts.has(ext)) {
      return t("legacy.invalid_audio_type", "Only audio files are allowed.");
    }
    return "";
  };

  const notify = useCallback((message: string, tone: "success" | "error" = "success") => {
    setToast({ message, tone });
  }, []);

  useEffect(() => {
    if (!toast.message) return;
    const timer = setTimeout(() => {
      setToast({ message: "", tone: "success" });
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast.message]);

  const resolveAudioUrl = (value: string | undefined) => {
    const raw = String(value || "").trim();
    if (!raw) return "";
    if (raw.startsWith("http")) return raw;
    let path = raw.startsWith("/") ? raw : `/${raw}`;
    if (!path.startsWith("/uploads/")) {
      path = `/uploads/audios/${raw.replace(/^\/+/, "")}`;
    }
    return `${apiRoot.replace(/\/+$/, "")}${path}`;
  };

  const loadAudios = useCallback(async ({ notify: notifyToast = false } = {}) => {
    try {
      setLoading(true);
      const shouldFallbackAdminRead = (err: any) =>
        shouldFallbackRoute(err) ||
        err?.response?.status === 401 ||
        err?.response?.status === 403 ||
        err?.response?.status === 500;
      const { data } = await requestWithFallback(
        [
          () => api.get("/admin/audios"),
          () => api.get("/my/audios"),
          () => api.get("/audios"),
        ],
        shouldFallbackAdminRead
      );
      const list =
        (data?.success && Array.isArray(data.data) ? data.data : null) ||
        (Array.isArray(data?.audios) && data.audios) ||
        (Array.isArray(data) && data) ||
        [];
      setAudios(list);
      if (notifyToast) {
        notify(t("legacy.audios_loaded", "Audio archives loaded."));
      }
    } catch (error) {
      console.error("Failed to load audios:", error);
      setAudios([]);
      notify(
        getApiErrorMessage(
          error,
          t("legacy.audios_load_failed", "Failed to load audios"),
        ),
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [notify, t]);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    loadAudios({ notify: true });
  }, [loadAudios]);

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      category: "",
      isPublic: true,
    });
    setSelectedFile(null);
    setEditingId(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const audioError = validateAudioFile(file);
    if (audioError) {
      notify(audioError, "error");
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const handleEdit = (item: Audio) => {
    setEditingId(item.id);
    setForm({
      title: item.title || "",
      description: item.description || "",
      category: item.category || "",
      isPublic: item.isPublic ?? true,
    });
    setSelectedFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) {
      notify(t("legacy.fill_required_fields", "Please fill all required fields"), "error");
      return;
    }

    const formData = new FormData();
    const audioError = selectedFile ? validateAudioFile(selectedFile) : (editingId ? "" : t("legacy.audio_required", "Please select an audio file"));
    if (audioError) {
      notify(audioError, "error");
      return;
    }
    if (selectedFile) formData.append("audio", selectedFile);
    formData.append("title", form.title.trim());
    if (form.description.trim()) formData.append("description", form.description.trim());
    formData.append("category", form.category || "");
    formData.append("isPublic", String(form.isPublic));

    const shouldFallbackWrite = (err: any) =>
      shouldFallbackRoute(err) ||
      err?.response?.status === 401 ||
      err?.response?.status === 403 ||
      err?.response?.status === 500;

    try {
      setUploading(true);

      if (editingId) {
        await requestWithFallback(
          [
            () => api.put(`/admin/audios/${editingId}`, formData),
            () => api.post(`/admin/audios/${editingId}/save`, formData),
            () => api.put(`/my/audios/${editingId}`, formData),
          ],
          shouldFallbackWrite
        );
        notify(t("legacy.audio_updated", "Audio updated."));
      } else {
        await requestWithFallback(
          [() => api.post("/admin/audios", formData), () => api.post("/my/audios", formData)],
          shouldFallbackWrite
        );
        notify(t("legacy.audio_created", "Audio uploaded."));
      }

      resetForm();
      loadAudios();
    } catch (error) {
      console.error("Operation failed:", error);
      notify(getApiErrorMessage(error, t("legacy.operation_failed", "Operation failed")), "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!window.confirm(t("legacy.confirm_delete", "Are you sure you want to delete this item?"))) {
      return;
    }

    try {
      const shouldFallbackWrite = (err: any) =>
        shouldFallbackRoute(err) ||
        err?.response?.status === 401 ||
        err?.response?.status === 403 ||
        err?.response?.status === 500;
      await requestWithFallback(
        [
          () => api.delete(`/admin/audios/${id}`),
          () => api.delete(`/my/audios/${id}`),
        ],
        shouldFallbackWrite
      );
      loadAudios();
      notify(t("legacy.audio_deleted", "Audio deleted."));
    } catch (error) {
      console.error("Delete failed:", error);
      notify(getApiErrorMessage(error, t("legacy.delete_failed", "Failed to delete")), "error");
    }
  };

  const handlePlayPause = (audio: Audio) => {
    const url = resolveAudioUrl(audio.audioPath);
    if (!url) return;

    if (playingId === audio.id) {
      audioRef?.pause();
      setPlayingId(null);
    } else {
      if (audioRef) {
        audioRef.pause();
      }
      const newAudio = new Audio(url);
      newAudio.onended = () => setPlayingId(null);
      newAudio.play();
      setAudioRef(newAudio);
      setPlayingId(audio.id);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const cardBg = isDark ? "bg-[#0f1f33]" : "bg-white";
  const border = isDark ? "border-[#d9a441]/20" : "border-[#24766f]/20";
  const inputBg = isDark ? "bg-[#071827]" : "bg-[#f7f2e8]";
  const textColor = isDark ? "text-[#f5f1e8]" : "text-[#162238]";

  return (
    <div className={`min-h-screen p-6 ${isDark ? "bg-[#071827]" : "bg-[#f5f1e8]"}`}>
      <Toast message={toast.message} tone={toast.tone} />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8" data-aos="fade-down">
          <h1 className={`text-4xl font-bold font-serif ${isDark ? "text-[#d9a441]" : "text-[#24766f]"} mb-2`}>
            {t("legacy.audio_management", "Audio Archives Management")}
          </h1>
          <p className={`${textColor} opacity-70`}>
            {t("legacy.audio_desc", "Upload and manage oral histories, songs, and audio recordings")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-3 mb-6">
          <div className={`${cardBg} border ${border} rounded-xl p-3`}><p className="text-xs opacity-70">{t("legacy.total", "Total")}</p><p className="text-xl font-bold">{audioStats.total}</p></div>
          <div className={`${cardBg} border ${border} rounded-xl p-3`}><p className="text-xs opacity-70">{t("legacy.public", "Public")}</p><p className="text-xl font-bold">{audioStats.publicCount}</p></div>
          <div className={`${cardBg} border ${border} rounded-xl p-3`}><p className="text-xs opacity-70">{t("legacy.timed", "Timed")}</p><p className="text-xl font-bold">{audioStats.withDuration}</p></div>
        </div>

        {/* Upload/Edit Form */}
        <div className={`${cardBg} border ${border} rounded-xl p-6 mb-8 shadow-lg`} data-aos="fade-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-bold font-serif ${isDark ? "text-[#d9a441]" : "text-[#24766f]"} flex items-center gap-2`}>
              {editingId ? (
                <>
                  <Edit className="w-6 h-6" />
                  {t("legacy.edit_audio", "Edit Audio")}
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6" />
                  {t("legacy.upload_new_audio", "Upload New Audio")}
                </>
              )}
            </h2>
            {editingId && (
              <button
                onClick={resetForm}
                className={`${textColor} opacity-70 hover:opacity-100 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-500/10 transition`}
              >
                <X className="w-5 h-5" />
                {t("legacy.cancel", "Cancel")}
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Input */}
            <div>
              <label className={`block text-sm font-semibold ${textColor} mb-2`}>
                {t("legacy.select_audio", "Select Audio File")} {!editingId && <span className="text-red-500">*</span>}
              </label>
              <div
                className={`border-2 border-dashed ${border} rounded-lg p-6 text-center cursor-pointer transition hover:border-[#d9a441] hover:bg-[#d9a441]/5`}
                onClick={() => document.getElementById("audioInput")?.click()}
              >
                {selectedFile ? (
                  <div className="py-4">
                    <Music className={`w-12 h-12 mx-auto ${isDark ? "text-[#24766f]" : "text-[#d9a441]"} mb-2`} />
                    <p className={`${textColor} font-medium`}>{selectedFile.name}</p>
                    <p className={`${textColor} opacity-50 text-sm`}>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div className="py-8">
                    <Music className={`w-16 h-16 mx-auto ${textColor} opacity-20 mb-4`} />
                    <p className={`${textColor} opacity-50 text-lg`}>{t("legacy.click_to_upload_audio", "Click to upload audio")}</p>
                    <p className={`${textColor} opacity-30 text-sm mt-2`}>
                      {t("legacy.audio_file_formats", "MP3, WAV, M4A, OGG (max 50MB)")}
                    </p>
                  </div>
                )}
              </div>
              <input
                id="audioInput"
                type="file"
                accept="audio/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Title */}
            <div>
              <label className={`block text-sm font-semibold ${textColor} mb-2`}>
                {t("legacy.title", "Title")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg ${inputBg} border ${border} ${textColor} outline-none focus:border-[#d9a441]`}
                placeholder={t("legacy.title_placeholder", "Audio title")}
              />
            </div>

            {/* Category */}
            <div>
              <label className={`block text-sm font-semibold ${textColor} mb-2`}>
                {t("legacy.category", "Category")}
              </label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg ${inputBg} border ${border} ${textColor} outline-none`}
                placeholder={t("legacy.custom_category_placeholder", "Name this category...")}
              />
            </div>

            {/* Description */}
            <div>
              <label className={`block text-sm font-semibold ${textColor} mb-2`}>
                {t("legacy.description", "Description")}
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className={`w-full px-4 py-3 rounded-lg ${inputBg} border ${border} ${textColor} outline-none focus:border-[#d9a441] resize-none`}
                placeholder={t("legacy.description_placeholder", "Description")}
              />
            </div>

            {/* Public Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isPublic"
                checked={form.isPublic}
                onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
                className="w-5 h-5 rounded"
              />
              <label htmlFor="isPublic" className={`${textColor} font-medium`}>
                {t("legacy.make_public", "Make Public")}
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading}
              className={`w-full py-3 rounded-lg font-semibold transition ${
                uploading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#24766f] text-white hover:bg-[#24766f]/90"
              }`}
            >
              {uploading ? t("legacy.uploading", "Uploading...") : editingId ? t("legacy.update", "Update") : t("legacy.upload", "Upload")}
            </button>
          </form>
        </div>

        {/* Audio List */}
        <div className={`${cardBg} border ${border} rounded-xl p-6 shadow-lg`} data-aos="fade-up">
          <h2 className={`text-2xl font-bold font-serif ${isDark ? "text-[#d9a441]" : "text-[#24766f]"} mb-6`}>
            {t("legacy.audio_list", "Audio Archives")} ({audios.length})
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-[#d9a441] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className={textColor}>{t("legacy.loading", "Loading...")}</p>
            </div>
          ) : audios.length === 0 ? (
            <div className="text-center py-8">
              <Music className={`w-16 h-16 mx-auto ${textColor} opacity-20 mb-4`} />
              <p className={`${textColor} opacity-70`}>{t("legacy.no_audios", "No audio archives yet.")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {audios.map((audio) => (
                <div
                  key={audio.id}
                  className={`flex items-center gap-4 p-4 rounded-lg ${isDark ? "bg-white/5" : "bg-black/5"} hover:shadow-md transition`}
                >
                  {/* Play Button */}
                  <button
                    onClick={() => handlePlayPause(audio)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      playingId === audio.id
                        ? "bg-[#24766f] text-white"
                        : isDark
                        ? "bg-white/10 hover:bg-[#24766f]"
                        : "bg-black/10 hover:bg-[#24766f] hover:text-white"
                    } transition`}
                  >
                    {playingId === audio.id ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5 ml-0.5" />
                    )}
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold truncate ${textColor}`}>{audio.title}</h3>
                    <div className="flex items-center gap-3 text-sm opacity-60">
                      {audio.category && <span>{audio.category}</span>}
                      {audio.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(audio.duration)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(audio)}
                      className={`p-2 rounded-lg hover:bg-[#24766f]/20 transition ${textColor} opacity-70 hover:opacity-100`}
                      title={t("legacy.edit", "Edit")}
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(audio.id)}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-red-500 transition"
                      title={t("legacy.delete", "Delete")}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
