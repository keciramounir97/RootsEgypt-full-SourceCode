import { useEffect, useState } from "react";
import { useLanguage as useTranslation } from "../i18n";
import { Shield } from "lucide-react";
import RootsPageShell from "../components/RootsPageShell";
import { api } from "../api/client";

type LegalSection = { heading: string; body: string };
type LegalDocument = { title: string; intro: string; sections: LegalSection[] };

const FALLBACK: LegalDocument = {
  title: "Terms of Service",
  intro: "Please read these terms carefully before using Roots Egypt.",
  sections: [
    {
      heading: "1. Acceptance of Terms",
      body: "By accessing and using Roots Egypt, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.",
    },
    {
      heading: "2. User Accounts",
      body: "You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.",
    },
    {
      heading: "3. Data & Privacy",
      body: "We respect your privacy. Please refer to our Privacy Policy for information on how we collect, use, and protect your personal data.",
    },
    {
      heading: "4. Intellectual Property",
      body: "All content uploaded by users remains their property. Roots Egypt claims no ownership over user-generated family trees, documents, or narratives.",
    },
    {
      heading: "5. Limitation of Liability",
      body: "Roots Egypt provides genealogical research tools but cannot guarantee the accuracy of user-submitted data or third-party archive records.",
    },
  ],
};

export default function Terms() {
  const { t, language } = useTranslation();
  const [doc, setDoc] = useState<LegalDocument>(FALLBACK);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/legal/terms", { params: { locale: language } })
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
            <Shield className="w-12 h-12 text-[#d9a441]" />
          </div>
          <p className="text-sm uppercase tracking-[0.3em] text-[#d9a441]">
            {t("legacy.legal", "Legal")}
          </p>
          <h1 className="text-5xl font-bold">
            {doc.title || t("terms_of_service", "Terms of Service")}
          </h1>
          <p className="text-sm opacity-70">{t("last_updated", "Last updated")}: June 2026</p>
        </div>
      }
    >
      <div className="max-w-3xl mx-auto">
        <div className="prose prose-lg max-w-none space-y-6">
          <p className="opacity-80">{doc.intro || t("terms_intro", "Please read these terms carefully before using Roots Egypt.")}</p>
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
