import { useState } from "react";
import { useLanguage as useTranslation } from "../../i18n";
import { Search, Plus, Edit3, X, Check, Crown, Trash2 } from "lucide-react";

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  interval: "monthly" | "yearly";
  features: string[];
  active: boolean;
}

const initialTiers: SubscriptionTier[] = [
  { id: "1", name: "Basic", price: 0, interval: "monthly", features: ["3 trees", "50 people/tree", "Basic viz"], active: true },
  { id: "2", name: "Premium", price: 9.99, interval: "monthly", features: ["Unlimited trees", "Unlimited people", "Archive uploads", "GEDCOM"], active: true },
  { id: "3", name: "Family Historian", price: 19.99, interval: "monthly", features: ["AI suggestions", "Notes AI", "Tasks", "Priority support"], active: true },
];

export default function Subscriptions() {
  const { t } = useTranslation();
  const [tiers, setTiers] = useState<SubscriptionTier[]>(initialTiers);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<SubscriptionTier>>({});

  const filtered = tiers.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  const startEdit = (tier: SubscriptionTier) => {
    setEditing(tier.id);
    setEditData({ ...tier });
  };

  const saveEdit = () => {
    if (!editing || !editData.name) return;
    setTiers(tiers.map(t => t.id === editing ? { ...t, ...editData } as SubscriptionTier : t));
    setEditing(null);
    setEditData({});
  };

  const deleteTier = (id: string) => {
    setTiers(tiers.filter(t => t.id !== id));
  };

  // Text and bg classes that ensure proper contrast in both modes
  const thBg = "bg-[var(--brand-teal)]";
  const thText = "text-white";
  const rowBg = "bg-white dark:bg-[#1a2e2d]";
  const rowText = "text-gray-900 dark:text-white";
  const rowHover = "hover:bg-[#f5f1e8] dark:hover:bg-[#1f3836]";

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Crown className="w-8 h-8 text-[var(--brand-gold)]" />
          <h1 className="text-2xl font-bold font-cinzel text-[var(--text-color)]">
            {t("subscription_management", "Subscription Management")}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t("search", "Search...")}
              className="pl-9 pr-4 py-2 rounded-xl border border-[var(--border-color)] bg-white dark:bg-[#1a2e2d] text-[#2c1810] dark:text-[#e8dfca] text-sm w-48"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--brand-gold)] text-white font-semibold text-sm hover:shadow-lg transition-all">
            <Plus className="w-4 h-4" />
            {t("add_tier", "Add Tier")}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className={`${thBg} border-b border-white/20`}>
              <th className={`text-left px-4 py-3.5 font-semibold ${thText}`}>{t("tier_name", "Name")}</th>
              <th className={`text-left px-4 py-3.5 font-semibold ${thText}`}>{t("price", "Price")}</th>
              <th className={`text-left px-4 py-3.5 font-semibold ${thText}`}>{t("interval", "Interval")}</th>
              <th className={`text-left px-4 py-3.5 font-semibold ${thText}`}>{t("features", "Features")}</th>
              <th className={`text-left px-4 py-3.5 font-semibold ${thText}`}>{t("status", "Status")}</th>
              <th className={`text-left px-4 py-3.5 font-semibold ${thText}`}>{t("actions", "Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(tier => (
              <tr key={tier.id} className={`border-b border-[var(--border-color)] ${rowBg} ${rowHover} transition-colors`}>
                {editing === tier.id ? (
                  <>
                    <td className="px-4 py-3">
                      <input value={editData.name || ""} onChange={e => setEditData({ ...editData, name: e.target.value })} className={`w-full px-2 py-1 rounded border border-[var(--border-color)] bg-white dark:bg-[#1a2e2d] ${rowText}`} />
                    </td>
                    <td className="px-4 py-3">
                      <input type="number" value={editData.price ?? 0} onChange={e => setEditData({ ...editData, price: parseFloat(e.target.value) })} className={`w-24 px-2 py-1 rounded border border-[var(--border-color)] bg-white dark:bg-[#1a2e2d] ${rowText}`} />
                    </td>
                    <td className="px-4 py-3">
                      <select value={editData.interval || "monthly"} onChange={e => setEditData({ ...editData, interval: e.target.value as "monthly" | "yearly" })} className={`px-2 py-1 rounded border border-[var(--border-color)] bg-white dark:bg-[#1a2e2d] ${rowText}`}>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input value={editData.features?.join(", ") || ""} onChange={e => setEditData({ ...editData, features: e.target.value.split(", ").map(f => f.trim()) })} className={`w-full px-2 py-1 rounded border border-[var(--border-color)] bg-white dark:bg-[#1a2e2d] ${rowText}`} />
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setEditData({ ...editData, active: !editData.active })} className={`px-3 py-1 rounded-full text-xs font-semibold ${editData.active ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400"}`}>
                        {editData.active ? t("active", "Active") : t("inactive", "Inactive")}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={saveEdit} className="p-1.5 rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" title={t("save", "Save")}><Check className="w-4 h-4" /></button>
                        <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400" title={t("cancel", "Cancel")}><X className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className={`px-4 py-3 font-semibold ${rowText}`}>{tier.name}</td>
                    <td className={`px-4 py-3 ${rowText}`}>${tier.price.toFixed(2)}</td>
                    <td className={`px-4 py-3 capitalize ${rowText}`}>{tier.interval}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {tier.features.map((f, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-[var(--brand-gold)]/10 text-[var(--brand-gold)] dark:bg-[var(--brand-gold)]/20 dark:text-[var(--gold-light)]">{f}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tier.active ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400"}`}>
                        {tier.active ? t("active", "Active") : t("inactive", "Inactive")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(tier)} className="p-1.5 rounded-lg bg-[var(--brand-gold)]/10 text-[var(--brand-gold)] hover:bg-[var(--brand-gold)]/20 transition-colors" title={t("edit", "Edit")}>
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteTier(tier.id)} className="p-1.5 rounded-lg bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors" title={t("delete", "Delete")}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
