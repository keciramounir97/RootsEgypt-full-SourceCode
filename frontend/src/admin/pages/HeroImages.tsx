import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowUp,
  ArrowDown,
  Edit,
  EyeOff,
  Image as ImageIcon,
  RefreshCw,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { api } from "../../api/client";
import { getApiErrorMessage } from "../../api/helpers";
import {
  resolveSiteImageUrl,
  type SiteImageSettings,
  type SiteImageRecord,
} from "../../hooks/useSiteImages";
import { useLanguage } from "../../i18n";
import { useThemeStore } from "../../store/theme";
import Toast from "../../components/Toast";

const EMPTY_SETTINGS: SiteImageSettings = {
  heroUseDefault: true,
  backgroundUseDefault: true,
  heroImages: [],
  backgroundImages: [],
  backgroundImage: null,
};

export default function HeroImages() {
  const { t } = useLanguage();
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
  const [settings, setSettings] = useState<SiteImageSettings>(EMPTY_SETTINGS);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({
    message: "",
    tone: "success" as "success" | "error",
  });
  const [editingImage, setEditingImage] = useState<SiteImageRecord | null>(
    null,
  );
  const [editForm, setEditForm] = useState({ title: "", caption: "" });

  const palette = useMemo(
    () => ({
      page: isDark
        ? "bg-[#071827] text-[#f5f1e8]"
        : "bg-[#f5f1e8] text-[#162238]",
      panel: isDark
        ? "bg-[#0f1f33] border-white/10"
        : "bg-white border-[#d8e2ea]",
      input: isDark
        ? "bg-[#071827] border-white/10"
        : "bg-white border-[#d8e2ea]",
      muted: isDark ? "text-[#f5f1e8]/65" : "text-[#162238]/65",
      accent: isDark ? "text-[#d9a441]" : "text-[#24766f]",
    }),
    [isDark],
  );

  const notify = useCallback(
    (message: string, tone: "success" | "error" = "success") => {
      setToast({ message, tone });
    },
    [],
  );

  useEffect(() => {
    if (!toast.message) return;
    const timer = window.setTimeout(
      () => setToast({ message: "", tone: "success" }),
      3500,
    );
    return () => window.clearTimeout(timer);
  }, [toast.message]);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/site-images/hero");
      setSettings({
        ...EMPTY_SETTINGS,
        ...data,
        heroImages: Array.isArray(data?.heroImages) ? data.heroImages : [],
      });
    } catch (err) {
      notify(
        getApiErrorMessage(
          err,
          t("legacy.site_images_load_failed", "Failed to load site images."),
        ),
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [notify, t]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const updateDefaultVisibility = async (checked: boolean) => {
    try {
      setSaving(true);
      const { data } = await api.put("/admin/site-images/hero", {
        heroUseDefault: checked,
      });
      setSettings({ ...EMPTY_SETTINGS, ...data });
      notify(t("legacy.hero_images_saved", "Hero image settings saved."));
    } catch (err) {
      notify(
        getApiErrorMessage(
          err,
          t("legacy.hero_images_save_failed", "Failed to save hero images."),
        ),
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const uploadImages = async () => {
    if (!files.length) {
      notify(t("legacy.image_required", "Please select an image"), "error");
      return;
    }
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    try {
      setSaving(true);
      const { data } = await api.post("/admin/site-images/hero", formData);
      setSettings({ ...EMPTY_SETTINGS, ...data });
      setFiles([]);
      notify(t("legacy.hero_images_uploaded", "Hero image uploaded."));
    } catch (err) {
      notify(
        getApiErrorMessage(
          err,
          t("legacy.hero_images_upload_failed", "Failed to upload hero image."),
        ),
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteImage = async (id: number) => {
    if (
      !window.confirm(
        t("legacy.confirm_delete", "Are you sure you want to delete this item?"),
      )
    )
      return;
    try {
      setSaving(true);
      const { data } = await api.delete(`/admin/site-images/hero/${id}`);
      setSettings({ ...EMPTY_SETTINGS, ...data });
      notify(t("legacy.hero_image_deleted", "Hero image deleted."));
    } catch (err) {
      notify(
        getApiErrorMessage(err, t("legacy.delete_failed", "Failed to delete")),
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (image: SiteImageRecord) => {
    setEditingImage(image);
    setEditForm({ title: image.title || "", caption: image.caption || "" });
  };

  const handleSaveEdit = async () => {
    if (!editingImage) return;
    try {
      setSaving(true);
      const { data } = await api.patch(
        `/admin/site-images/hero/${editingImage.id}`,
        editForm,
      );
      setSettings({ ...EMPTY_SETTINGS, ...data });
      notify(t("legacy.hero_image_updated", "Hero image updated."));
      setEditingImage(null);
      setEditForm({ title: "", caption: "" });
    } catch (err) {
      notify(
        getApiErrorMessage(err, t("legacy.update_failed", "Failed to update")),
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingImage(null);
    setEditForm({ title: "", caption: "" });
  };

  const handleReorder = async (fromIndex: number, direction: "up" | "down") => {
    const images = [...settings.heroImages];
    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= images.length) return;

    [images[fromIndex], images[toIndex]] = [images[toIndex], images[fromIndex]];
    const newOrder = images.map((img) => img.id);

    try {
      setSaving(true);
      const { data } = await api.put("/admin/site-images/hero/reorder", {
        ids: newOrder,
      });
      setSettings({ ...EMPTY_SETTINGS, ...data });
      notify(t("legacy.hero_images_reordered", "Hero images reordered."));
    } catch (err) {
      notify(
        getApiErrorMessage(err, t("legacy.reorder_failed", "Failed to reorder")),
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`min-h-screen p-6 ${palette.page}`}>
      <Toast message={toast.message} tone={toast.tone} />
      <div className="max-w-6xl mx-auto space-y-6">
        <div className={`rounded-xl border p-6 ${palette.panel}`}>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p
                className={`text-sm uppercase tracking-[0.2em] ${palette.accent}`}
              >
                {t("legacy.hero_images", "Hero Images")}
              </p>
              <h1 className="text-3xl font-bold mt-1">
                {t("legacy.hero_image_page_title", "Hero Image")}
              </h1>
              <p className={`mt-2 max-w-2xl ${palette.muted}`}>
                {t("legacy.hero_image_page_desc",
                  "Upload one or more hero images. Multiple images rotate as a slideshow.",
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadSettings()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-current/15"
              disabled={loading || saving}
            >
              <RefreshCw className="w-4 h-4" />
              {t("legacy.refresh", "Refresh")}
            </button>
          </div>
        </div>

        <div className={`rounded-xl border p-6 ${palette.panel}`}>
          <label className="flex items-center justify-between gap-4 rounded-lg border border-current/10 px-4 py-3">
            <span className="inline-flex items-center gap-2 font-semibold">
              <EyeOff className="w-4 h-4 text-[#24766f]" />
              {t("legacy.show_default_hero_image", "Show default hero image")}
            </span>
            <input
              type="checkbox"
              checked={settings.heroUseDefault}
              onChange={(event) =>
                void updateDefaultVisibility(event.target.checked)
              }
              className="w-5 h-5"
              disabled={saving}
            />
          </label>

          <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(event) =>
                setFiles(Array.from(event.target.files || []))
              }
              className={`px-4 py-3 rounded-lg border ${palette.input}`}
              disabled={saving}
            />
            <button
              type="button"
              onClick={() => void uploadImages()}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#24766f] text-white font-semibold disabled:opacity-60"
              disabled={saving}
            >
              <Upload className="w-4 h-4" />
              {saving ? t("legacy.saving", "Saving...") : t("legacy.upload", "Upload")}
            </button>
          </div>
        </div>

        <div className={`rounded-xl border p-6 ${palette.panel}`}>
          <h2 className="text-xl font-bold mb-4">
            {t("legacy.uploaded_hero_images", "Uploaded hero images")} (
            {settings.heroImages.length})
          </h2>
          {loading ? (
            <div className="py-10 text-center opacity-70">
              {t("legacy.loading", "Loading...")}
            </div>
          ) : settings.heroImages.length ? (
            <div className="space-y-4">
              {settings.heroImages.map((image, index) => (
                <div
                  key={image.id}
                  className={`rounded-lg border border-current/10 overflow-hidden ${editingImage?.id === image.id ? "ring-2 ring-[#24766f]" : ""}`}
                >
                  <div className="relative h-44 bg-black/5">
                    <img
                      src={resolveSiteImageUrl(image.imagePath)}
                      alt={image.title || ""}
                      className="h-full w-full object-cover cursor-pointer"
                      onClick={() => handleEdit(image)}
                    />
                    <div
                      className="absolute inset-0 bg-black/0 hover:bg-black/20 transition cursor-pointer"
                      onClick={() => handleEdit(image)}
                    />
                  </div>

                  {editingImage?.id === image.id ? (
                    <div className="p-4 space-y-3 bg-[#24766f]/5">
                      <div>
                        <label className="block text-xs font-semibold mb-1">
                          {t("legacy.title", "Title")}
                        </label>
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={(e) =>
                            setEditForm({ ...editForm, title: e.target.value })
                          }
                          className={`w-full px-3 py-2 rounded border ${palette.input} ${palette.page} text-sm`}
                          placeholder={t("legacy.enter_title", "Enter title...")}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">
                          {t("legacy.caption", "Caption")}
                        </label>
                        <textarea
                          value={editForm.caption}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              caption: e.target.value,
                            })
                          }
                          className={`w-full px-3 py-2 rounded border ${palette.input} ${palette.page} text-sm`}
                          rows={2}
                          placeholder={t("legacy.enter_caption", "Enter caption...")}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleSaveEdit}
                          disabled={saving}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded bg-[#24766f] text-white text-sm font-medium disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          {t("legacy.save", "Save")}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          disabled={saving}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded border border-current/20 text-sm font-medium disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                          {t("legacy.cancel", "Cancel")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        {image.title && (
                          <p className="text-sm font-medium truncate">
                            {image.title}
                          </p>
                        )}
                        {image.caption && (
                          <p className="text-xs opacity-60 truncate">
                            {image.caption}
                          </p>
                        )}
                        {!image.title && !image.caption && (
                          <p className="text-sm opacity-50">
                            {t("legacy.no_details", "No details")}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleReorder(index, "up")}
                          disabled={saving || index === 0}
                          className="p-2 rounded hover:bg-black/5 disabled:opacity-30"
                          title={t("legacy.move_up", "Move up")}
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReorder(index, "down")}
                          disabled={
                            saving || index === settings.heroImages.length - 1
                          }
                          className="p-2 rounded hover:bg-black/5 disabled:opacity-30"
                          title={t("legacy.move_down", "Move down")}
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(image)}
                          className="p-2 rounded hover:bg-black/5"
                          title={t("legacy.edit", "Edit")}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteImage(image.id)}
                          className="p-2 rounded text-red-500 hover:bg-red-500/10"
                          disabled={saving}
                          title={t("legacy.delete", "Delete")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center opacity-70">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-40" />
              {t("legacy.no_hero_images", "No hero images uploaded yet.")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
