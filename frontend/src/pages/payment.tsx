import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage as useTranslation } from "../i18n";
import { useAuth } from "../admin/components/AuthContext";
import { api } from "../api/client";
import { CheckCircle2, AlertCircle, Upload, Loader2, ArrowLeft } from "lucide-react";
import { useThemeStore } from "../store/theme";

export default function Payment() {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
  const { tier } = useParams<{ tier: string }>();
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tierData, setTierData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: string; msg: string }>({ type: "", msg: "" });

  const tierNames: Record<string, { name: string; price: number }> = {
    basic: { name: "Basic", price: 0 },
    premium: { name: "Premium", price: 9.99 },
    pro: { name: "Family Historian", price: 19.99 },
  };

  useEffect(() => {
    if (tier && tierNames[tier]) {
      setTierData(tierNames[tier]);
      setAmount(tierNames[tier].price.toString());
    }
    setLoading(false);
  }, [tier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) return;

    setSubmitting(true);
    setStatus({ type: "", msg: "" });

    try {
      const tierId = tier === "basic" ? 1 : tier === "premium" ? 2 : 3;
      await api.post("/my/subscription/payment", {
        tier_id: tierId,
        amount: parseFloat(amount),
        proof_url: proofUrl || undefined,
        notes: notes || undefined,
      });
      setStatus({ type: "success", msg: t("payment_submitted", "Payment confirmation submitted! We will review it shortly.") });
      setTimeout(() => navigate("/subscriptions"), 3000);
    } catch (err: any) {
      setStatus({ type: "error", msg: err.response?.data?.message || t("payment_failed", "Failed to submit payment. Please try again.") });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container py-12 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-gold)]" />
      </div>
    );
  }

  if (!tierData) {
    return (
      <div className="page-container py-12 text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
        <p className="text-lg text-[var(--text-color)]">{t("tier_not_found", "Subscription tier not found")}</p>
        <button onClick={() => navigate("/subscriptions")} className="mt-4 text-[var(--brand-gold)] hover:underline">{t("back", "Back")}</button>
      </div>
    );
  }

  return (
    <div className="page-container py-12">
      <button onClick={() => navigate("/subscriptions")} className="flex items-center gap-2 text-[var(--text-color)] opacity-60 hover:opacity-100 mb-6 transition-opacity">
        <ArrowLeft className="w-4 h-4" />
        {t("back_to_subscriptions", "Back to Subscriptions")}
      </button>

      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-cinzel text-[var(--brand-teal)] dark:text-[var(--gold-light)] mb-2">
            {t("confirm_payment", "Confirm Payment")}
          </h1>
          <p className="text-[var(--text-color)] opacity-70">
            {t("payment_plan", "Plan")}: <strong>{tierData.name}</strong> — ${tierData.price}/mo
          </p>
        </div>

        {status.msg && (
          <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${
            status.type === "success" ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400" : "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
          }`}>
            {status.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <span className="text-sm">{status.msg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 rounded-2xl border border-[var(--border-color)] bg-white dark:bg-gray-900 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[var(--text-color)] mb-1.5">{t("amount_usd", "Amount (USD)")}</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
              className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none ${isDark ? "bg-[#0d2220] border-white/10 text-white placeholder:text-white/30 focus:border-[var(--brand-gold)]" : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[var(--brand-teal)]"}`}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--text-color)] mb-1.5">{t("payment_method", "Payment Method")}</label>
            <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--paper-color)] text-sm text-[var(--text-color)]">
              <p className="font-semibold mb-1">{t("bank_transfer", "Bank Transfer")}</p>
              <p className="opacity-70">Beneficiary: Roots Egypt</p>
              <p className="opacity-70">IBAN: XX00 0000 0000 0000 0000 0000</p>
              <p className="opacity-70">Bank: Example Bank</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--text-color)] mb-1.5">{t("proof_url", "Proof URL / Screenshot Link")}</label>
            <input
              value={proofUrl}
              onChange={e => setProofUrl(e.target.value)}
              placeholder="https://imgur.com/..."
              className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none ${isDark ? "bg-[#0d2220] border-white/10 text-white placeholder:text-white/30 focus:border-[var(--brand-gold)]" : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[var(--brand-teal)]"}`}
            />
            <p className="text-xs text-[var(--text-color)] opacity-50 mt-1">{t("upload_proof_hint", "Upload your transfer receipt to any image hosting and paste the link")}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--text-color)] mb-1.5">{t("notes_optional", "Notes (optional)")}</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder={t("payment_notes_placeholder", "Any additional information...")}
              className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none resize-none ${isDark ? "bg-[#0d2220] border-white/10 text-white placeholder:text-white/30 focus:border-[var(--brand-gold)]" : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[var(--brand-teal)]"}`}
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !amount || parseFloat(amount) <= 0}
            className="w-full py-3 rounded-full bg-gradient-to-r from-[var(--brand-gold)] to-[var(--gold-light)] text-[var(--teal-dark)] font-bold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> {t("submitting", "Submitting...")}</>
            ) : (
              <><Upload className="w-4 h-4" /> {t("submit_payment", "Submit Payment Confirmation")}</>
            )}
          </button>
        </form>

        {!user && (
          <div className="mt-4 p-4 rounded-xl bg-[var(--brand-gold)]/10 border border-[var(--brand-gold)]/20 text-sm text-[var(--brand-gold)] text-center">
            {t("login_to_subscribe", "Please log in to subscribe")}
          </div>
        )}
      </div>
    </div>
  );
}
