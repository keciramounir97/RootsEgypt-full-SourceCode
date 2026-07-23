import { useState, useEffect } from "react";
import { useLanguage as useTranslation } from "../../i18n";
import { api } from "../../api/client";
import { getApiRoot } from "../../api/helpers";
import { Search, CheckCircle, XCircle, Crown, Loader2, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

interface Payment {
  id: number;
  user_id: number;
  tier_id: number;
  amount: number;
  currency: string;
  proof_url?: string;
  notes?: string;
  status: "pending" | "approved" | "rejected";
  reviewed_by?: number;
  reviewed_at?: string;
  created_at: string;
  user_email?: string;
  user_name?: string;
  tier_name?: string;
}

export default function SubscriptionPayments() {
  const { t } = useTranslation();
  const apiRoot = getApiRoot();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("pending");
  const [expanded, setExpanded] = useState<number | null>(null);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = filter ? `?status=${filter}` : "";
      const { data } = await api.get(`/admin/subscription-payments${params}`);
      setPayments(Array.isArray(data) ? data : data?.data || []);
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, [filter]);

  const reviewPayment = async (id: number, decision: "approved" | "rejected") => {
    try {
      await api.patch(`/admin/subscription-payments/${id}/review`, { decision });
      fetchPayments();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to review payment");
    }
  };

  const filtered = payments.filter(p =>
    [p.id, p.user_id, p.user_email, p.user_name, p.tier_name, p.status].some((value) => String(value ?? "").toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Crown className="w-8 h-8 text-[var(--brand-gold)]" />
          <h1 className="text-2xl font-bold font-cinzel text-[var(--text-color)]">
            {t("subscription_payments", "Subscription Payments")}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-[var(--paper-color)] rounded-xl p-1 border border-[var(--border-color)]">
            {["all", "pending", "approved", "rejected"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f === "all" ? "" : f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  (f === "all" && !filter) || filter === f
                    ? "bg-[var(--brand-gold)] text-white shadow"
                    : "text-[var(--text-color)] opacity-60 hover:opacity-100"
                }`}
              >
                {t(f, f.charAt(0).toUpperCase() + f.slice(1))}
              </button>
            ))}
          </div>
          <button onClick={fetchPayments} className="p-2 rounded-lg hover:bg-[var(--paper-color)] text-[var(--text-color)] transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-color)] opacity-40" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t("search", "Search...")}
              className="pl-9 pr-4 py-2 rounded-xl border border-[var(--border-color)] bg-white dark:bg-gray-900 text-[var(--text-color)] text-sm w-48"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-[var(--border-color)] overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-gold)]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-color)] opacity-40">{t("no_payments", "No payments found")}</div>
        ) : (
          <table className="w-full text-sm text-gray-900 dark:text-white">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--paper-color)]">
                <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white">ID</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white">{t("user", "User")}</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white">{t("tier", "Tier")}</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white">{t("amount", "Amount")}</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white">{t("status", "Status")}</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white">{t("date", "Date")}</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white">{t("actions", "Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(payment => (
                <>
                  <tr key={payment.id} className="border-b border-[var(--border-color)] hover:bg-[var(--paper-color)] transition-colors cursor-pointer" onClick={() => setExpanded(expanded === payment.id ? null : payment.id)}>
                    <td className="px-4 py-3 font-mono text-xs">#{payment.id}</td>
                    <td className="px-4 py-3">{payment.user_name || payment.user_email || `User #${payment.user_id}`}</td>
                    <td className="px-4 py-3">{payment.tier_name || `Tier #${payment.tier_id}`}</td>
                    <td className="px-4 py-3 font-semibold">${payment.amount.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        payment.status === "approved" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                        payment.status === "rejected" ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" :
                        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 opacity-60">{new Date(payment.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      {expanded === payment.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </td>
                  </tr>
                  {expanded === payment.id && (
                    <tr key={`${payment.id}-detail`} className="bg-[var(--paper-color)]">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="space-y-3">
                          {payment.proof_url && (
                            <div>
                              <p className="text-xs font-semibold opacity-60 mb-1">{t("proof", "Proof")}</p>
                              {payment.proof_url.startsWith("/uploads/") ? (
                                <a
                                  href={`${apiRoot}${payment.proof_url}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <img
                                    src={`${apiRoot}${payment.proof_url}`}
                                    alt={t("proof", "Proof")}
                                    className="max-w-[220px] rounded-lg border border-[var(--border-color)]"
                                  />
                                </a>
                              ) : (
                                <a
                                  href={payment.proof_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-sm text-[var(--brand-gold)] hover:underline break-all"
                                >
                                  {payment.proof_url}
                                </a>
                              )}
                            </div>
                          )}
                          {payment.notes && (
                            <div>
                              <p className="text-xs font-semibold opacity-60 mb-1">{t("notes", "Notes")}</p>
                              <p className="text-sm">{payment.notes}</p>
                            </div>
                          )}
                          {payment.status === "pending" && (
                            <div className="flex gap-3 pt-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); reviewPayment(payment.id, "approved"); }}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
                              >
                                <CheckCircle className="w-4 h-4" />
                                {t("approve", "Approve")}
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); reviewPayment(payment.id, "rejected"); }}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
                              >
                                <XCircle className="w-4 h-4" />
                                {t("reject", "Reject")}
                              </button>
                            </div>
                          )}
                          {payment.reviewed_at && (
                            <p className="text-xs opacity-50">
                              {t("reviewed_by", "Reviewed by")} {t("admin_hash", "admin #")}{payment.reviewed_by} {t("reviewed_on_prefix", "on")} {new Date(payment.reviewed_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
