import { useCallback, useEffect, useState } from "react";
import { useLanguage as useTranslation } from "../../i18n";
import { api } from "../../api/client";
import { getApiErrorMessage } from "../../api/helpers";
import { notifyAdmin } from "../utils/notifications";
import { ListChecks, Loader2, Plus, RefreshCw, Trash2 } from "lucide-react";

type Tier = { id: number; slug: string; name: string };

type FeatureRow = {
  featureKey: string;
  label: string;
  tiers: Record<string, { enabled: boolean; tierSlug: string; tierName: string }>;
};

export default function TierFeatures() {
  const { t } = useTranslation();
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [features, setFeatures] = useState<FeatureRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyCell, setBusyCell] = useState<string | null>(null);
  const [newKey, setNewKey] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [tiersRes, featuresRes] = await Promise.all([
        api.get("/admin/subscription-tiers"),
        api.get("/admin/subscription-tier-features"),
      ]);
      setTiers(Array.isArray(tiersRes.data) ? tiersRes.data : []);
      setFeatures(Array.isArray(featuresRes.data) ? featuresRes.data : []);
    } catch (err) {
      setError(getApiErrorMessage(err, t("tier_features_failed", "Failed to load feature flags")));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggle = async (tierId: number, featureKey: string, enabled: boolean) => {
    const cellKey = `${tierId}-${featureKey}`;
    setBusyCell(cellKey);
    try {
      const { data } = await api.put(`/admin/subscription-tier-features/${tierId}/${featureKey}`, { enabled });
      setFeatures(Array.isArray(data) ? data : features);
    } catch (err) {
      notifyAdmin(getApiErrorMessage(err, t("tier_feature_update_failed", "Failed to update feature flag")), "error");
    } finally {
      setBusyCell(null);
    }
  };

  const addFeature = async () => {
    if (!newKey.trim() || !newLabel.trim()) return;
    setCreating(true);
    try {
      const { data } = await api.post("/admin/subscription-tier-features", {
        featureKey: newKey.trim(),
        label: newLabel.trim(),
      });
      setFeatures(Array.isArray(data) ? data : features);
      setNewKey("");
      setNewLabel("");
      notifyAdmin(t("feature_added", "Feature added."));
    } catch (err) {
      notifyAdmin(getApiErrorMessage(err, t("feature_add_failed", "Failed to add feature")), "error");
    } finally {
      setCreating(false);
    }
  };

  const removeFeature = async (featureKey: string) => {
    try {
      const { data } = await api.delete(`/admin/subscription-tier-features/${featureKey}`);
      setFeatures(Array.isArray(data) ? data : features);
    } catch (err) {
      notifyAdmin(getApiErrorMessage(err, t("feature_remove_failed", "Failed to remove feature")), "error");
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ListChecks className="w-8 h-8 text-[var(--brand-gold)]" />
          <div>
            <h1 className="text-2xl font-bold font-cinzel text-[var(--text-color)]">
              {t("tier_features_title", "Tier Features")}
            </h1>
            <p className="text-sm opacity-60 max-w-xl">
              {t(
                "tier_features_desc",
                "Toggle which features and pages each subscription tier unlocks. Only \"Download files without a request\" is currently wired to real behavior — other flags are stored for future use.",
              )}
            </p>
          </div>
        </div>
        <button
          onClick={() => void load()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border-color)] text-sm text-[var(--text-color)] hover:bg-[var(--paper-color)] transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {t("legacy.refresh", "Refresh")}
        </button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-500 mb-4">{error}</div>
      ) : null}

      <div className="rounded-2xl border border-[var(--border-color)] bg-white dark:bg-[#1a2e2d] p-5 mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-teal)] dark:text-[var(--gold-light)] mb-3">
          {t("add_feature", "Add Feature")}
        </p>
        <div className="flex flex-wrap gap-3">
          <input
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder={t("feature_key_placeholder", "feature_key (e.g. priority_support)")}
            className="flex-1 min-w-[200px] px-3 py-2 rounded-lg border border-[var(--border-color)] bg-gray-50 dark:bg-[#0d2220] text-sm text-gray-900 dark:text-white"
          />
          <input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder={t("feature_label_placeholder", "Display label")}
            className="flex-1 min-w-[200px] px-3 py-2 rounded-lg border border-[var(--border-color)] bg-gray-50 dark:bg-[#0d2220] text-sm text-gray-900 dark:text-white"
          />
          <button
            onClick={() => void addFeature()}
            disabled={creating || !newKey.trim() || !newLabel.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--brand-gold)] text-white text-sm font-semibold disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {t("add", "Add")}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-gold)]" />
        </div>
      ) : features.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border-color)] p-10 text-center text-sm opacity-60">
          {t("no_features_yet", "No feature flags yet.")}
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--brand-teal)] border-b border-white/20">
                <th className="text-left px-4 py-3.5 font-semibold text-white">{t("feature", "Feature")}</th>
                {tiers.map((tier) => (
                  <th key={tier.id} className="text-center px-4 py-3.5 font-semibold text-white">
                    {tier.name}
                  </th>
                ))}
                <th className="px-4 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {features.map((feature) => (
                <tr
                  key={feature.featureKey}
                  className="border-b border-[var(--border-color)] bg-white dark:bg-[#1a2e2d] hover:bg-[#f5f1e8] dark:hover:bg-[#1f3836] transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-900 dark:text-white">{feature.label}</div>
                    <div className="text-xs opacity-50 font-mono">{feature.featureKey}</div>
                  </td>
                  {tiers.map((tier) => {
                    const cell = feature.tiers[tier.id];
                    const cellKey = `${tier.id}-${feature.featureKey}`;
                    return (
                      <td key={tier.id} className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={Boolean(cell?.enabled)}
                          disabled={busyCell === cellKey}
                          onChange={(e) => void toggle(tier.id, feature.featureKey, e.target.checked)}
                          className="w-4 h-4 accent-[var(--brand-gold)]"
                        />
                      </td>
                    );
                  })}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => void removeFeature(feature.featureKey)}
                      className="p-1.5 rounded-lg bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                      title={t("delete", "Delete")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
