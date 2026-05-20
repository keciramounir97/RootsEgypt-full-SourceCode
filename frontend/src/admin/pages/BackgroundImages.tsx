import { useCallback, useEffect, useMemo, useState } from "react";
import { EyeOff, Image as ImageIcon, RefreshCw, Trash2, Upload } from "lucide-react";
import { api } from "../../api/client";
import { getApiErrorMessage } from "../../api/helpers";
import {
  resolveSiteImageUrl,
  type SiteImageSettings,
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

export default function BackgroundImages() {
  const { t } = useLanguage();
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
  const [settings, setSettings] = useState<SiteImageSettings>(EMPTY_SETTINGS);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: "", tone: "success" as "success" | "error" });

  const palette = useMemo(
    () => ({
      page: isDark ? "bg-[#071827] text-[#f5f1e8]" : "bg-[#f5f1e8] text-[#162238]",
      panel: isDark ? "bg-[#0f1f33] border-white/10" : "bg-white border-[#d8e2ea]",
      input: isDark ? "bg-[#071827] border-white/10" : "bg-white border-[#d8e2ea]",
      muted: isDark ? "text-[#f5f1e8]/65" : "text-[#162238]/65",
      accent: isDark ? "text-[#d9a441]" : "text-[#24766f]",
    }),
    [isDark],
  );

  const notify = useCallback((message: string, tone: "success" | "error" = "success") => {
    setToast({ message, tone });
  }, []);

  useEffect(() => {
    if (!toast.message) return;
    const timer = window.setTimeout(() => setToast({ message: "", tone: "success" }), 3500);
    return () => window.clearTimeout(timer);
  }, [toast.message]);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/site-images/background");
      setSettings({ ...EMPTY_SETTINGS, ...data });
    } catch (err) {
      notify(getApiErrorMessage(err, t("legacy.site_images_load_failed", "Failed to load site images.")), "error");
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
      const { data } = await api.put("/admin/site-images/background", {
        backgroundUseDefault: checked,
      });
      setSettings({ ...EMPTY_SETTINGS, ...data });
      notify(t("legacy.background_images_saved", "Background image settings saved."));
    } catch (err) {
      notify(getApiErrorMessage(err, t("legacy.background_images_save_failed", "Failed to save background image.")), "error");
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
      const { data } = await api.post("/admin/site-images/background", formData);
      setSettings({ ...EMPTY_SETTINGS, ...data });
      setFiles([]);
      notify(t("legacy.background_image_uploaded", "Background image uploaded."));
    } catch (err) {
      notify(getApiErrorMessage(err, t("legacy.background_image_upload_failed", "Failed to upload background image.")), "error");
    } finally {
      setSaving(false);
    }
  };

  const deleteImage = async (id: number) => {
    if (!window.confirm(t("legacy.confirm_delete", "Are you sure you want to delete this item?"))) return;
    try {
      setSaving(true);
      const { data } = await api.delete(`/admin/site-images/background/${id}`);
      setSettings({ ...EMPTY_SETTINGS, ...data });
      notify(t("legacy.background_image_deleted", "Background image deleted."));
    } catch (err) {
      notify(getApiErrorMessage(err, t("legacy.delete_failed", "Failed to delete")), "error");
    } finally {
      setSaving(false);
    }
  };

  const backgroundItems = useMemo(
    () =>
      settings.backgroundImages.length
        ? settings.backgroundImages
        : settings.backgroundImage
          ? [settings.backgroundImage]
          : [],
    [settings.backgroundImage, settings.backgroundImages],
  );

  return (
    <div className={`min-h-screen p-6 ${palette.page}`}>
      <Toast message={toast.message} tone={toast.tone} />
      <div className="max-w-6xl mx-auto space-y-6">
        <div className={`rounded-xl border p-6 ${palette.panel}`}>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className={`text-sm uppercase tracking-[0.2em] ${palette.accent}`}>
                {t("legacy.background_images", "Background Images")}
              </p>
              <h1 className="text-3xl font-bold mt-1">
                {t("legacy.background_image_page_title", "Arriere Plan Image")}
              </h1>
              <p className={`mt-2 max-w-2xl ${palette.muted}`}>
                {t("legacy.background_image_page_desc",
                  "Upload one or more background images for the site sections. Multiple images rotate as a slideshow.",
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
            <span>
              <span className="inline-flex items-center gap-2 font-semibold">
                <EyeOff className="w-4 h-4 text-[#24766f]" />
                {t("legacy.show_default_background_image", "Show default background image")}
              </span>
              <span className={`mt-1 block text-sm ${palette.muted}`}>
                {t("legacy.background_diaporama_hint",
                  "Keep the default visible to include it in the background slideshow, or hide it to use only uploaded images.",
                )}
              </span>
            </span>
            <input
              type="checkbox"
              checked={settings.backgroundUseDefault}
              onChange={(event) => void updateDefaultVisibility(event.target.checked)}
              className="w-5 h-5"
              disabled={saving}
            />
          </label>

          <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => setFiles(Array.from(event.target.files || []))}
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
            {t("legacy.uploaded_background_images", "Uploaded background images")}
          </h2>
          {loading ? (
            <div className="py-10 text-center opacity-70">{t("legacy.loading", "Loading...")}</div>
          ) : backgroundItems.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {backgroundItems.map((image, index) => {
                const backgroundUrl = resolveSiteImageUrl(image.imagePath);
                return (
                  <div key={image.id} className="rounded-lg border border-current/10 overflow-hidden">
                    <img src={backgroundUrl} alt="" className="h-56 w-full object-cover" />
                    <div className="p-3 flex items-center justify-between">
                      <span className="text-sm opacity-70">
                        {t("legacy.background_image", "Background image")} #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => void deleteImage(image.id)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-500/10"
                        disabled={saving}
                        title={t("legacy.delete", "Delete")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center opacity-70">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-40" />
              {t("legacy.no_background_images", "No custom background images uploaded yet.")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
