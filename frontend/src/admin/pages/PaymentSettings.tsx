import { useEffect, useState } from "react";
import { Save, Wallet } from "lucide-react";
import { api } from "../../api/client";
import { useLanguage } from "../../i18n";

type PaymentSettings = { enabled: boolean; method: string; beneficiary: string; bank: string; account: string; reference: string; currency: string; instructions: string; proofRequired: boolean };
const EMPTY: PaymentSettings = { enabled: true, method: "Bank Transfer", beneficiary: "", bank: "", account: "", reference: "", currency: "USD", instructions: "", proofRequired: true };

export default function PaymentSettings() {
  const { t } = useLanguage();
  const [form, setForm] = useState<PaymentSettings>(EMPTY);
  const [status, setStatus] = useState("");
  useEffect(() => { api.get("/admin/settings/payment").then(({ data }) => setForm({ ...EMPTY, ...data })).catch(() => setStatus(t("payment_settings_load_failed", "Unable to load payment settings."))); }, [t]);
  const set = (key: keyof PaymentSettings, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  const save = async () => { setStatus(""); try { await api.put("/admin/settings/payment", form); setStatus(t("payment_settings_saved", "Payment settings saved.")); } catch { setStatus(t("payment_settings_save_failed", "Unable to save payment settings.")); } };
  return <section className="p-6 space-y-6 text-[var(--text-color)]">
    <header className="flex items-center gap-3"><Wallet className="h-7 w-7 text-[var(--brand-gold)]" /><div><h1 className="text-2xl font-bold">{t("payment_settings", "Payment Settings")}</h1><p className="opacity-70 text-sm">{t("payment_settings_help", "These details are shown before a user submits payment proof.")}</p></div></header>
    <div className="grid gap-4 md:grid-cols-2 rounded-2xl border border-[var(--border-color)] bg-[var(--paper-color)] p-5">
      {([['beneficiary','Beneficiary'],['bank','Bank'],['account','Account / IBAN'],['reference','Reference'],['currency','Currency'],['method','Payment method']] as const).map(([key,label]) => <label key={key} className="space-y-1 text-sm"><span>{t(`payment_${key}`, label)}</span><input value={String(form[key])} onChange={(e) => set(key, e.target.value)} className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--input-bg)] px-3 py-2 text-[var(--text-color)] placeholder:text-[var(--placeholder-color)]" /></label>)}
      <label className="md:col-span-2 space-y-1 text-sm"><span>{t("payment_instructions", "Instructions")}</span><textarea value={form.instructions} onChange={(e) => set("instructions", e.target.value)} rows={4} className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--input-bg)] px-3 py-2 text-[var(--text-color)] placeholder:text-[var(--placeholder-color)]" /></label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.enabled} onChange={(e) => set("enabled", e.target.checked)} />{t("payment_enabled", "Accept payment requests")}</label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.proofRequired} onChange={(e) => set("proofRequired", e.target.checked)} />{t("payment_proof_required", "Require payment proof")}</label>
    </div>
    <div className="flex items-center gap-4"><button onClick={save} className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-gold)] px-5 py-2.5 font-semibold text-[var(--teal-dark)]"><Save className="h-4 w-4" />{t("save", "Save")}</button>{status && <span className="text-sm opacity-75">{status}</span>}</div>
  </section>;
}
