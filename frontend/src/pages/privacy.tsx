import { useEffect, useState } from "react";
import { useLanguage as useTranslation } from "../i18n";
import { Lock } from "lucide-react";
import RootsPageShell from "../components/RootsPageShell";
import { api } from "../api/client";

type LegalSection = { heading: string; body: string };
type LegalDocument = { title: string; intro: string; sections: LegalSection[] };

const FALLBACK: LegalDocument = {
  title: "Privacy Policy",
  intro: "We respect your privacy and are committed to protecting your personal data.",
  sections: [
    {
      heading: "1. Data We Collect",
      body: "We collect information you provide when creating an account, uploading family trees, and using our services. This includes name, email address, and genealogical data.",
    },
    {
      heading: "2. How We Use Data",
      body: "Your data is used solely to provide and improve our genealogical services. We do not sell your personal information to third parties.",
    },
    {
      heading: "3. Data Security",
      body: "We implement industry-standard security measures to protect your data against unauthorized access, alteration, or destruction.",
    },
    {
      heading: "4. Your Rights",
      body: "You have the right to access, correct, or delete your personal data at any time. Contact us for assistance.",
    },
  ],
};

export default function Privacy() {
  const { t, language } = useTranslation();
  const [doc, setDoc] = useState<LegalDocument>(FALLBACK);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/legal/privacy", { params: { locale: language } })
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
            <Lock className="w-12 h-12 text-[#d9a441]" />
          </div>
          <p className="text-sm uppercase tracking-[0.3em] text-[#d9a441]">
            {t("legacy.legal", "Legal")}
          </p>
          <h1 className="text-5xl font-bold">
            {doc.title || t("privacy_policy", "Privacy Policy")}
          </h1>
          <p className="text-sm opacity-70">{t("last_updated", "Last updated")}: June 2026</p>
        </div>
      }
    >
      <div className="max-w-3xl mx-auto">
        <div className="space-y-6">
          <p className="opacity-80">{doc.intro || t("privacy_intro", "We respect your privacy and are committed to protecting your personal data.")}</p>
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
