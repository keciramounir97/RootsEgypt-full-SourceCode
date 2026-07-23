import { useEffect, useState } from "react";
import { useLanguage as useTranslation } from "../../i18n";
import { api } from "../../api/client";
import { getApiErrorMessage } from "../../api/helpers";
import { notifyAdmin } from "../utils/notifications";
import { Crown, Edit3, Check, X, Loader2, RefreshCw } from "lucide-react";

interface SubscriptionTier {
  id: number;
  slug: string;
  name: string;
  price: number;
  tagline?: string;
  description?: string;
  features: string[];
  is_active: boolean;
}

type EditState = {
  name: string;
  price: string;
  tagline: string;
  description: string;
  featuresText: string;
  is_active: boolean;
};

export default function Subscriptions() {
  const { t } = useTranslation();
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<number | null>(null);
  const [editData, setEditData] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);

  const loadTiers = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/admin/subscription-tiers");
      setTiers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getApiErrorMessage(err, t("subscription_tiers_failed", "Failed to load subscription tiers")));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTiers();
  }, []);

  const startEdit = (tier: SubscriptionTier) => {
    setEditing(tier.id);
    setEditData({
      name: tier.name,
      price: String(tier.price),
      tagline: tier.tagline || "",
      description: tier.description || "",
      featuresText: (tier.features || []).join("\n"),
      is_active: tier.is_active,
    });
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditData(null);
  };

  const saveEdit = async () => {
    if (editing == null || !editData) return;
    setSaving(true);
    try {
      await api.patch(`/admin/subscription-tiers/${editing}`, {
        name: editData.name,
        price: parseFloat(editData.price) || 0,
        tagline: editData.tagline,
        description: editData.description,
        features: editData.featuresText.split("\n").map((f) => f.trim()).filter(Boolean),
        is_active: editData.is_active,
      });
      notifyAdmin(t("legacy.settings_saved", "Saved."));
      setEditing(null);
      setEditData(null);
      await loadTiers();
    } catch (err) {
      notifyAdmin(getApiErrorMessage(err, t("subscription_tier_save_failed", "Failed to save tier")), "error");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-white dark:bg-[#1a2e2d] text-gray-900 dark:text-white text-sm";

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Crown className="w-8 h-8 text-[var(--brand-gold)]" />
          <h1 className="text-2xl font-bold font-cinzel text-[var(--text-color)]">
            {t("subscription_management", "Subscription Management")}
          </h1>
        </div>
        <button
          onClick={() => void loadTiers()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border-color)] text-sm text-[var(--text-color)] hover:bg-[var(--paper-color)] transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {t("legacy.refresh", "Refresh")}
        </button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-500 mb-4">{error}</div>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-gold)]" />
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className="rounded-2xl border border-[var(--border-color)] bg-white dark:bg-[#1a2e2d] p-5 shadow-sm space-y-4"
            >
              {editing === tier.id && editData ? (
                <div className="space-y-3">
                  <label className="block space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-teal)] dark:text-[var(--gold-light)]">
                      {t("tier_name", "Name")}
                    </span>
                    <input
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className={inputClass}
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-teal)] dark:text-[var(--gold-light)]">
                      {t("price", "Price")} ({t("usd_per_month_suffix", "USD/mo")})
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={editData.price}
                      onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                      className={inputClass}
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-teal)] dark:text-[var(--gold-light)]">
                      {t("tier_tagline", "Tagline")}
                    </span>
                    <input
                      value={editData.tagline}
                      onChange={(e) => setEditData({ ...editData, tagline: e.target.value })}
                      className={inputClass}
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-teal)] dark:text-[var(--gold-light)]">
                      {t("tier_description", "Description")}
                    </span>
                    <textarea
                      value={editData.description}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      rows={2}
                      className={inputClass}
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-teal)] dark:text-[var(--gold-light)]">
                      {t("tier_features", "Features")} ({t("one_per_line", "one per line")})
                    </span>
                    <textarea
                      value={editData.featuresText}
                      onChange={(e) => setEditData({ ...editData, featuresText: e.target.value })}
                      rows={6}
                      className={inputClass}
                    />
                  </label>
                  <label className="flex items-center gap-2 text-sm text-[var(--text-color)]">
                    <input
                      type="checkbox"
                      checked={editData.is_active}
                      onChange={(e) => setEditData({ ...editData, is_active: e.target.checked })}
                    />
                    {t("tier_visible_on_site", "Visible on public pricing page")}
                  </label>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => void saveEdit()}
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      {t("save", "Save")}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 text-sm font-semibold"
                    >
                      <X className="w-4 h-4" />
                      {t("cancel", "Cancel")}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{tier.name}</h3>
                      <p className="text-sm opacity-60">${tier.price.toFixed(2)}{t("per_month_suffix", "/mo")}</p>
                    </div>
                    <button
                      onClick={() => startEdit(tier)}
                      className="p-1.5 rounded-lg bg-[var(--brand-gold)]/10 text-[var(--brand-gold)] hover:bg-[var(--brand-gold)]/20 transition-colors"
                      title={t("edit", "Edit")}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                  {tier.tagline ? <p className="text-sm italic opacity-70">{tier.tagline}</p> : null}
                  <div className="flex flex-wrap gap-1.5">
                    {(tier.features || []).map((f, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 rounded-full bg-[var(--brand-gold)]/10 text-[var(--brand-gold)] dark:bg-[var(--brand-gold)]/20 dark:text-[var(--gold-light)]"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      tier.is_active
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400"
                    }`}
                  >
                    {tier.is_active ? t("active", "Active") : t("inactive", "Inactive")}
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
