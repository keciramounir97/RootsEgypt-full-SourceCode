import { useEffect, useState } from "react";
import { useLanguage as useTranslation } from "../i18n";
import { FileText } from "lucide-react";
import RootsPageShell from "../components/RootsPageShell";
import { api } from "../api/client";

type LegalSection = { heading: string; body: string };
type LegalDocument = { title: string; intro: string; sections: LegalSection[] };

const FALLBACK: LegalDocument = {
  title: "Cookie Policy",
  intro: "We use cookies and similar technologies to enhance your experience on Roots Egypt.",
  sections: [
    {
      heading: "1. What Are Cookies",
      body: "Cookies are small text files stored on your device by your web browser. They help us remember your preferences and improve site functionality.",
    },
    {
      heading: "2. Types We Use",
      body: "Essential: Required for authentication and basic site functions.\nPreference: Remember your language and theme settings.\nAnalytics: Help us understand how you use our site to improve it.",
    },
    {
      heading: "3. Managing Cookies",
      body: "You can control cookies through your browser settings. Disabling cookies may affect certain functionalities.",
    },
  ],
};

export default function Cookies() {
  const { t, language } = useTranslation();
  const [doc, setDoc] = useState<LegalDocument>(FALLBACK);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/legal/cookies", { params: { locale: language } })
      .then(({ data }) => {
        if (!cancelled && data && Array.isArray(data.sections)) {
          setDoc({ title: data.title, intro: data.intro || "", sections: data.sections });
        }
      })
      .catch(() => {
        // Keep the built-in fallback content if the API is unavailable.
      });
    return () => {
      cancelled = true;
    };
  }, [language]);

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
            {doc.title || t("cookie_policy", "Cookie Policy")}
          </h1>
          <p className="text-sm opacity-70">{t("last_updated", "Last updated")}: June 2026</p>
        </div>
      }
    >
      <div className="max-w-3xl mx-auto">
        <div className="space-y-6">
          <p className="opacity-80">{doc.intro || t("cookies_intro", "We use cookies and similar technologies to enhance your experience on Roots Egypt.")}</p>
          {doc.sections.map((section, index) => (
            <section key={index}>
              <h2 className="text-xl font-bold font-cinzel text-[var(--brand-teal)] dark:text-[var(--gold-light)] mb-3">
                {section.heading}
              </h2>
              <p className="opacity-80 whitespace-pre-line">{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </RootsPageShell>
  );
}
