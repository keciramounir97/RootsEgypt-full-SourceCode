import { useLanguage as useTranslation } from "../i18n";
import { Link } from "react-router-dom";
import { Shield, Lock, FileText, Mail } from "lucide-react";
import RootsPageShell from "../components/RootsPageShell";

export default function About() {
  const { t } = useTranslation();
  return (
    <RootsPageShell
      hero={
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-[#d9a441]">
            {t("legacy.about_us", "About Us")}
          </p>
          <h1 className="text-5xl font-bold">
            {t("about_hero_title", "About Roots Egypt")}
          </h1>
          <p className="max-w-2xl mx-auto text-lg opacity-90">
            {t("about_hero_desc", "Preserving the genealogical heritage of Egypt through technology and community.")}
          </p>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Link to="/terms" className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--paper-color)] hover:shadow-lg transition-all group">
            <Shield className="w-10 h-10 text-[var(--brand-gold)] mb-3" />
            <h3 className="text-xl font-bold font-cinzel text-[var(--brand-teal)] dark:text-[var(--gold-light)] mb-2">{t("terms_of_service", "Terms of Service")}</h3>
            <p className="text-sm opacity-70">Read our terms and conditions for using Roots Egypt.</p>
          </Link>
          <Link to="/privacy" className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--paper-color)] hover:shadow-lg transition-all group">
            <Lock className="w-10 h-10 text-[var(--brand-gold)] mb-3" />
            <h3 className="text-xl font-bold font-cinzel text-[var(--brand-teal)] dark:text-[var(--gold-light)] mb-2">{t("privacy_policy", "Privacy Policy")}</h3>
            <p className="text-sm opacity-70">Learn how we protect your personal data and privacy.</p>
          </Link>
          <Link to="/cookies" className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--paper-color)] hover:shadow-lg transition-all group">
            <FileText className="w-10 h-10 text-[var(--brand-gold)] mb-3" />
            <h3 className="text-xl font-bold font-cinzel text-[var(--brand-teal)] dark:text-[var(--gold-light)] mb-2">{t("cookie_policy", "Cookie Policy")}</h3>
            <p className="text-sm opacity-70">Understand how we use cookies to improve your experience.</p>
          </Link>
          <a href="mailto:contact@rootsegypt.com" className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--paper-color)] hover:shadow-lg transition-all group">
            <Mail className="w-10 h-10 text-[var(--brand-gold)] mb-3" />
            <h3 className="text-xl font-bold font-cinzel text-[var(--brand-teal)] dark:text-[var(--gold-light)] mb-2">{t("contact", "Contact")}</h3>
            <p className="text-sm opacity-70">contact@rootsegypt.com</p>
          </a>
        </div>

        <div className="p-8 rounded-2xl border border-[var(--border-color)] bg-[var(--paper-color)]">
          <h2 className="text-2xl font-bold font-cinzel text-[var(--brand-teal)] dark:text-[var(--gold-light)] mb-4">Our Mission</h2>
          <p className="opacity-80 leading-relaxed mb-4">
            Roots Egypt is dedicated to preserving and connecting the genealogical heritage of Egypt. We provide tools for families to build, share, and explore their ancestral histories across Cairo, Alexandria, the Nile Delta, Upper Egypt, and the wider Egyptian diaspora.
          </p>
          <p className="opacity-80 leading-relaxed">
            Our platform bridges civil status registers, Ottoman-era archives, church and mosque records, waqf deeds, court sijills, and family oral histories into a unified genealogy experience.
          </p>
        </div>
      </div>
    </RootsPageShell>
  );
}