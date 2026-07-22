import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  FileText,
  Lock,
  Plus,
  Save,
  Scale,
  Shield,
  Trash2,
} from "lucide-react";
import { api } from "../../api/client";
import { getApiErrorMessage } from "../../api/helpers";
import { useThemeStore } from "../../store/theme";
import { useLanguage } from "../../i18n";
import { notifyAdminSaved } from "../utils/notifications";

type LegalSection = { heading: string; body: string };

type LegalDocument = {
  slug: string;
  locale: string;
  title: string;
  intro: string;
  sections: LegalSection[];
  translated?: boolean;
};

const SLUGS: { slug: string; labelKey: string; label: string; Icon: typeof FileText }[] = [
  { slug: "terms", labelKey: "terms_of_service", label: "Terms of Service", Icon: Scale },
  { slug: "privacy", labelKey: "privacy_policy", label: "Privacy Policy", Icon: Lock },
  { slug: "cookies", labelKey: "cookie_policy", label: "Cookie Policy", Icon: Shield },
];

const LOCALES: { value: string; label: string }[] = [
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
  { value: "ar", label: "العربية" },
  { value: "es", label: "Español" },
];

export default function LegalContent() {
  const { theme } = useThemeStore();
  const { t } = useLanguage();
  const isDark = theme === "dark";

  const [slug, setSlug] = useState("terms");
  const [locale, setLocale] = useState("en");
  const [doc, setDoc] = useState<LegalDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const pageBg = isDark ? "bg-[#071827] text-[#f5f1e8]" : "bg-[#f5f1e8] text-[#162238]";
  const panel = isDark ? "bg-[#0f1f33] border-white/10" : "bg-white border-[#24766f]/15";
  const subtlePanel = isDark ? "bg-white/5 border-white/10" : "bg-[#f8f5ef] border-[#24766f]/10";
  const inputClass = `w-full rounded-md border px-3 py-2 text-sm outline-none transition ${
    isDark
      ? "bg-[#071827] border-white/15 text-white placeholder-white/35 focus:border-[#d9a441]"
      : "bg-white border-[#24766f]/20 text-[#162238] placeholder-[#162238]/45 focus:border-[#24766f]"
  } focus:ring-2 focus:ring-[#d9a441]/20`;
  const labelClass = `text-xs font-semibold uppercase tracking-wide ${isDark ? "text-[#d9a441]" : "text-[#24766f]"}`;

  const loadDocument = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/admin/legal/${slug}`, { params: { locale } });
      setDoc(data);
    } catch (err) {
      setError(getApiErrorMessage(err, t("legal_content_load_failed", "Failed to load legal document")));
      setDoc(null);
    } finally {
      setLoading(false);
    }
  }, [slug, locale, t]);

  useEffect(() => {
    void loadDocument();
  }, [loadDocument]);

  const handleSave = async () => {
    if (!doc) return;
    setSaving(true);
    setError("");
    try {
      const { data } = await api.put(`/admin/legal/${slug}`, {
        locale,
        title: doc.title,
        intro: doc.intro,
        sections: doc.sections,
      });
      setDoc(data);
      setSaved(true);
      notifyAdminSaved(t("legacy.settings_saved", "Saved."));
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(getApiErrorMessage(err, t("legal_content_save_failed", "Failed to save legal document")));
    } finally {
      setSaving(false);
    }
  };

  const updateSection = (index: number, patch: Partial<LegalSection>) => {
    setDoc((prev) =>
      prev
        ? {
            ...prev,
            sections: prev.sections.map((section, i) => (i === index ? { ...section, ...patch } : section)),
          }
        : prev,
    );
  };

  const addSection = () => {
    setDoc((prev) =>
      prev ? { ...prev, sections: [...prev.sections, { heading: "", body: "" }] } : prev,
    );
  };

  const removeSection = (index: number) => {
    setDoc((prev) =>
      prev ? { ...prev, sections: prev.sections.filter((_, i) => i !== index) } : prev,
    );
  };

  return (
    <div className={`min-h-screen p-4 md:p-6 ${pageBg}`}>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className={`rounded-lg border ${panel} p-5 shadow-sm`}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className={labelClass}>{t("legacy.admin", "Admin")}</p>
              <h1 className="mt-1 text-2xl font-bold">
                {t("legal_content", "Legal Content")}
              </h1>
              <p className="mt-2 max-w-2xl text-sm opacity-70">
                {t(
                  "legal_content_desc",
                  "Edit the Terms of Service, Privacy Policy, and Cookie Policy shown on the public site, per language.",
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading || !doc}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#d9a441] px-5 text-sm font-semibold text-[#071827] shadow-sm transition hover:bg-[#c4932e] disabled:opacity-50"
            >
              {saved ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {saved
                ? t("legacy.settings_saved", "Saved")
                : saving
                  ? t("legacy.saving", "Saving...")
                  : t("legacy.save_settings", "Save Settings")}
            </button>
          </div>
        </div>

        <div className={`rounded-lg border ${panel} p-4 shadow-sm flex flex-wrap items-start gap-3`}>
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
          <p className="text-sm opacity-80">
            {t(
              "legal_content_disclaimer",
              "This starting content is a general template covering common EU (GDPR) and US (CCPA/CPRA) concepts. It is not a substitute for legal advice — have qualified counsel review it before relying on it for your jurisdiction.",
            )}
          </p>
        </div>

        <div className={`rounded-lg border ${panel} p-4 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`}>
          <div className="flex flex-wrap gap-2">
            {SLUGS.map(({ slug: s, label, Icon }) => (
              <button
                key={s}
                type="button"
                onClick={() => setSlug(s)}
                className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition ${
                  slug === s
                    ? "bg-[#24766f] text-white"
                    : isDark
                      ? "bg-white/10 text-white/70 hover:bg-white/15"
                      : "bg-black/5 text-[#162238]/70 hover:bg-black/10"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t(SLUGS.find((item) => item.slug === s)!.labelKey, label)}
              </button>
            ))}
          </div>

          <select
            value={locale}
            onChange={(event) => setLocale(event.target.value)}
            className={`${inputClass} sm:w-40`}
          >
            {LOCALES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
            {error}
          </div>
        ) : null}

        {doc && doc.translated === false ? (
          <div className={`rounded-lg border ${subtlePanel} p-4 text-sm opacity-80`}>
            {t(
              "legal_content_not_translated",
              "No content saved yet for this language — showing the English version as a starting point. Edit and save to create the translation.",
            )}
          </div>
        ) : null}

        {loading ? (
          <div className={`rounded-lg border ${panel} p-10 text-center text-sm opacity-70`}>
            {t("legacy.loading", "Loading...")}
          </div>
        ) : doc ? (
          <div className={`rounded-lg border ${panel} p-5 shadow-sm space-y-5`}>
            <label className="block space-y-2">
              <span className={labelClass}>{t("legal_content_title", "Title")}</span>
              <input
                type="text"
                value={doc.title}
                onChange={(event) => setDoc((prev) => (prev ? { ...prev, title: event.target.value } : prev))}
                className={inputClass}
              />
            </label>

            <label className="block space-y-2">
              <span className={labelClass}>{t("legal_content_intro", "Introduction")}</span>
              <textarea
                value={doc.intro}
                onChange={(event) => setDoc((prev) => (prev ? { ...prev, intro: event.target.value } : prev))}
                rows={3}
                className={inputClass}
              />
            </label>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={labelClass}>{t("legal_content_sections", "Sections")}</span>
                <button
                  type="button"
                  onClick={addSection}
                  className="inline-flex items-center gap-2 rounded-md bg-[#24766f] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#1f625d]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t("legal_content_add_section", "Add Section")}
                </button>
              </div>

              {doc.sections.map((section, index) => (
                <div key={index} className={`rounded-md border ${subtlePanel} p-4 space-y-3`}>
                  <div className="flex items-start gap-3">
                    <input
                      type="text"
                      value={section.heading}
                      onChange={(event) => updateSection(index, { heading: event.target.value })}
                      placeholder={t("legal_content_section_heading", "Section heading")}
                      className={`${inputClass} font-semibold`}
                    />
                    <button
                      type="button"
                      onClick={() => removeSection(index)}
                      className="shrink-0 rounded-md p-2 text-red-500 transition hover:bg-red-500/10"
                      title={t("legacy.remove", "Remove")}
                      aria-label={t("legacy.remove", "Remove")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <textarea
                    value={section.body}
                    onChange={(event) => updateSection(index, { body: event.target.value })}
                    rows={4}
                    placeholder={t("legal_content_section_body", "Section body text")}
                    className={inputClass}
                  />
                </div>
              ))}

              {doc.sections.length === 0 ? (
                <div className={`rounded-md border ${subtlePanel} p-8 text-center text-sm opacity-70`}>
                  {t("legal_content_no_sections", "No sections yet.")}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
