import { useLanguage as useTranslation } from "../i18n";
import { FileText } from "lucide-react";
import RootsPageShell from "../components/RootsPageShell";

export default function Cookies() {
  const { t } = useTranslation();
  return (
    <RootsPageShell
      hero={
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <FileText className="w-12 h-12 text-[#d9a441]" />
          </div>
          <p className="text-sm uppercase tracking-[0.3em] text-[#d9a441]">
            {t("legacy.legal", "Legal")}
          </p>
          <h1 className="text-5xl font-bold">
            {t("cookie_policy", "Cookie Policy")}
          </h1>
          <p className="text-sm opacity-70">{t("last_updated", "Last updated")}: June 2026</p>
        </div>
      }
    >
      <div className="max-w-3xl mx-auto">
        <div className="space-y-6">
          <p className="opacity-80">{t("cookies_intro", "We use cookies and similar technologies to enhance your experience on Roots Egypt.")}</p>
          <section>
            <h2 className="text-xl font-bold font-cinzel text-[var(--brand-teal)] dark:text-[var(--gold-light)] mb-3">1. What Are Cookies</h2>
            <p className="opacity-80">Cookies are small text files stored on your device by your web browser. They help us remember your preferences and improve site functionality.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold font-cinzel text-[var(--brand-teal)] dark:text-[var(--gold-light)] mb-3">2. Types We Use</h2>
            <ul className="list-disc pl-6 space-y-2 opacity-80">
              <li><strong>Essential:</strong> Required for authentication and basic site functions</li>
              <li><strong>Preference:</strong> Remember your language and theme settings</li>
              <li><strong>Analytics:</strong> Help us understand how you use our site to improve it</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-bold font-cinzel text-[var(--brand-teal)] dark:text-[var(--gold-light)] mb-3">3. Managing Cookies</h2>
            <p className="opacity-80">You can control cookies through your browser settings. Disabling cookies may affect certain functionalities.</p>
          </section>
        </div>
      </div>
    </RootsPageShell>
  );
}