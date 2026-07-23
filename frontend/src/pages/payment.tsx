import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage as useTranslation } from "../i18n";
import { useAuth } from "../admin/components/AuthContext";
import { api } from "../api/client";
import { getApiRoot } from "../api/helpers";
import {
  CheckCircle2,
  AlertCircle,
  Upload,
  Loader2,
  ArrowLeft,
  ImageIcon,
  X,
} from "lucide-react";
import { useThemeStore } from "../store/theme";

type Tier = { id: number; slug: string; name: string; price: number };

export default function Payment() {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
  const { tier } = useParams<{ tier: string }>();
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tierData, setTierData] = useState<Tier | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [proofPath, setProofPath] = useState("");
  const [proofPreviewUrl, setProofPreviewUrl] = useState("");
  const [uploadingProof, setUploadingProof] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: string; msg: string }>({ type: "", msg: "" });

  const apiRoot = getApiRoot();

  useEffect(() => {
    let cancelled = false;
    api
      .get("/subscriptions/tiers")
      .then(({ data }) => {
        if (cancelled || !Array.isArray(data)) return;
        const match = data.find((row: Tier) => row.slug === tier);
        if (match) {
          setTierData(match);
          setAmount(String(match.price));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tier]);

  const handleProofChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProofPreviewUrl(URL.createObjectURL(file));
    setUploadingProof(true);
    setStatus({ type: "", msg: "" });
    try {
      const formData = new FormData();
      formData.append("proof", file);
      const { data } = await api.post("/my/subscription/payment/proof", formData);
      setProofPath(data?.path || "");
    } catch (err: any) {
      setStatus({
        type: "error",
        msg: err.response?.data?.message || t("proof_upload_failed", "Failed to upload proof. Please try again."),
      });
      setProofPreviewUrl("");
    } finally {
      setUploadingProof(false);
    }
  };

  const clearProof = () => {
    setProofPath("");
    setProofPreviewUrl("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    if (!amount || parseFloat(amount) <= 0 || !tierData) return;

    setSubmitting(true);
    setStatus({ type: "", msg: "" });

    try {
      await api.post("/my/subscription/payment", {
        tier_id: tierData.id,
        amount: parseFloat(amount),
        proof_url: proofPath || undefined,
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
            <label className="block text-sm font-semibold text-[var(--text-color)] mb-1.5">{t("proof_screenshot", "Proof of Payment (Screenshot)")}</label>
            {proofPreviewUrl ? (
              <div className="relative w-full max-w-[220px]">
                <img
                  src={proofPath ? `${apiRoot}${proofPath}` : proofPreviewUrl}
                  alt={t("proof_screenshot", "Proof of Payment (Screenshot)")}
                  className="w-full rounded-xl border border-[var(--border-color)] object-cover"
                />
                {uploadingProof && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={clearProof}
                  className="absolute -top-2 -right-2 p-1 rounded-full bg-red-600 text-white shadow-lg"
                  aria-label={t("remove", "Remove")}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label
                className={`flex flex-col items-center justify-center gap-2 w-full py-8 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                  isDark ? "border-white/15 hover:border-[var(--brand-gold)] text-white/60" : "border-gray-300 hover:border-[var(--brand-teal)] text-gray-500"
                }`}
              >
                <ImageIcon className="w-6 h-6" />
                <span className="text-sm">{t("upload_screenshot", "Click to upload a screenshot")}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleProofChange} />
              </label>
            )}
            <p className="text-xs text-[var(--text-color)] opacity-50 mt-1.5">{t("upload_proof_hint_v2", "Upload a screenshot of your bank transfer receipt.")}</p>
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
            disabled={submitting || uploadingProof || !amount || parseFloat(amount) <= 0}
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
