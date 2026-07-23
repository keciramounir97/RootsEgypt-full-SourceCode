import { useState, useEffect } from "react";
import { useLanguage as useTranslation } from "../../i18n";
import { api } from "../../api/client";
import { Search, Crown, Loader2, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

export default function UserUpgrade() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<any[]>([]);
  const [tiers, setTiers] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedTierId, setSelectedTierId] = useState<number>(2);
  const [upgrading, setUpgrading] = useState(false);
  const [status, setStatus] = useState<{ type: string; msg: string }>({ type: "", msg: "" });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [uRes, tRes, sRes, pRes] = await Promise.all([
        api.get("/admin/users").catch(() => ({ data: [] })),
        api.get("/subscriptions/tiers").catch(() => ({ data: [] })),
        api.get("/admin/subscriptions").catch(() => ({ data: [] })),
        api.get("/admin/subscription-payments").catch(() => ({ data: [] })),
      ]);
      setUsers(Array.isArray(uRes.data) ? uRes.data : uRes.data?.data || []);
      setTiers(Array.isArray(tRes.data) ? tRes.data : tRes.data?.data || []);
      setSubscriptions(Array.isArray(sRes.data) ? sRes.data : sRes.data?.data || []);
      setPayments(Array.isArray(pRes.data) ? pRes.data : pRes.data?.data || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleUpgrade = async () => {
    if (!selectedUser) return;
    setUpgrading(true);
    setStatus({ type: "", msg: "" });
    try {
      await api.patch(`/admin/users/${selectedUser.id}/subscription`, { tier_id: selectedTierId });
      setStatus({ type: "success", msg: `User #${selectedUser.id} upgraded` });
      setSelectedUser(null);
      fetchAll();
    } catch (err: any) {
      setStatus({ type: "error", msg: err.response?.data?.message || "Failed to upgrade user" });
    } finally { setUpgrading(false); }
  };

  const getUserSub = (userId: number) => subscriptions.find((s: any) => s.user_id === userId);
  const getUserPayment = (userId: number) => payments.find((p: any) => p.user_id === userId && p.status === "approved");

  const filtered = users.filter(u =>
    String(u.id).includes(search) || (u.email || "").toLowerCase().includes(search.toLowerCase()) || (u.fullName || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-6 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--brand-gold)]" /></div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Crown className="w-8 h-8 text-[var(--brand-gold)]" />
          <h1 className="text-2xl font-bold font-cinzel text-[var(--text-color)]">{t("upgrade_users", "Manage Subscriptions")}</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-color)] opacity-40" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("search_users", "Search users...")} className="pl-9 pr-4 py-2 rounded-xl border border-[var(--border-color)] bg-white dark:bg-gray-900 text-[var(--text-color)] text-sm w-64 outline-none focus:ring-2 focus:ring-[var(--brand-gold)]/30" />
        </div>
      </div>

      {status.msg && (
        <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${
          status.type === "success" ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400" : "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
        }`}>
          {status.type === "success" ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span className="text-sm">{status.msg}</span>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-sm">
        <table className="w-full text-sm text-gray-900 dark:text-white">
          <thead>
            <tr className="border-b border-[var(--border-color)] bg-[var(--paper-color)]">
              <th className="text-left px-4 py-3 font-semibold text-[var(--text-color)]">ID</th>
              <th className="text-left px-4 py-3 font-semibold text-[var(--text-color)]">{t("name", "Name")}</th>
              <th className="text-left px-4 py-3 font-semibold text-[var(--text-color)]">{t("email", "Email")}</th>
              <th className="text-left px-4 py-3 font-semibold text-[var(--text-color)]">{t("plan", "Plan")}</th>
              <th className="text-left px-4 py-3 font-semibold text-[var(--text-color)]">{t("status", "Status")}</th>
              <th className="text-left px-4 py-3 font-semibold text-[var(--text-color)]">{t("date", "End Date")}</th>
              <th className="text-left px-4 py-3 font-semibold text-[var(--text-color)]">{t("actions", "Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => {
              const sub = getUserSub(u.id);
              const pmt = getUserPayment(u.id);
              const tierName = sub ? (tiers.find((t: any) => t.id === sub.tier_id)?.name || `Tier #${sub.tier_id}`) : "—";
              const subStatus = sub?.status || "none";
              const endDate = sub?.period_end ? new Date(sub.period_end).toLocaleDateString() : "—";
              return (
                <tr key={u.id} className="border-b border-[var(--border-color)] hover:bg-[var(--paper-color)] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs opacity-60">#{u.id}</td>
                  <td className="px-4 py-3 font-semibold">{u.fullName || "—"}</td>
                  <td className="px-4 py-3 opacity-70">{u.email}</td>
                  <td className="px-4 py-3">{tierName}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      subStatus === "active" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                      subStatus === "canceled" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                      subStatus === "expired" ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" :
                      "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                    }`}>{subStatus}</span>
                  </td>
                  <td className="px-4 py-3 opacity-70">{endDate}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => { setSelectedUser(u); setExpanded(expanded === u.id ? null : u.id); setStatus({ type: "", msg: "" }); }} className="px-3 py-1.5 rounded-lg bg-[var(--brand-gold)]/10 text-[var(--brand-gold)] hover:bg-[var(--brand-gold)]/20 text-xs font-semibold transition-colors">
                      {expanded === u.id ? t("cancel", "Cancel") : t("upgrade", "Upgrade")}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => { if (!upgrading) setSelectedUser(null); }}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-[var(--border-color)] p-6 shadow-2xl w-full max-w-md relative" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{t("upgrade_user", "Upgrade User")}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">#{selectedUser.id} — {selectedUser.email}</p>

            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t("select_tier", "Select Tier")}</label>
            <select value={selectedTierId} onChange={e => setSelectedTierId(parseInt(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm mb-4 outline-none focus:ring-2 focus:ring-[var(--brand-gold)]/30">
              {tiers.map((tier: any) => (
                <option key={tier.id} value={tier.id}>{tier.name} — ${tier.price}/{tier.interval || "month"}</option>
              ))}
            </select>

            <button onClick={handleUpgrade} disabled={upgrading} className="w-full py-3 rounded-full bg-gradient-to-r from-[var(--brand-gold)] to-[var(--gold-light)] text-[var(--teal-dark)] font-bold text-sm flex items-center justify-center gap-2 transition-all hover:shadow-lg disabled:opacity-50">
              {upgrading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
              {t("apply_upgrade", "Apply Upgrade")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
