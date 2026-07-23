import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  Compass,
  CreditCard,
  HelpCircle,
  LifeBuoy,
  Lock,
  Network,
  Search,
  UserCircle2,
} from "lucide-react";
import { useLanguage as useTranslation } from "../i18n";
import { useThemeStore } from "../store/theme";
import RootsPageShell from "../components/RootsPageShell";

type FaqItem = { q: string; a: string };
type FaqCategory = { key: string; icon: typeof Compass; title: string; items: FaqItem[] };

function useFaqCategories(t: (key: string, fallback: string) => string): FaqCategory[] {
  return [
    {
      key: "getting-started",
      icon: Compass,
      title: t("help_cat_getting_started", "Getting Started"),
      items: [
        {
          q: t("help_q_create_account", "How do I create an account?"),
          a: t(
            "help_a_create_account",
            "Click Sign Up in the top navigation, enter your name, email, and password. You'll get a 14-day free trial on any plan — no payment required to start exploring.",
          ),
        },
        {
          q: t("help_q_first_tree", "How do I build my first family tree?"),
          a: t(
            "help_a_first_tree",
            "From your dashboard, choose \"New Tree,\" add yourself as the first person, then use \"Add relative\" to add parents, children, and spouses one at a time. You can also import an existing GEDCOM file instead of starting from scratch.",
          ),
        },
        {
          q: t("help_q_language", "Can I use the site in another language?"),
          a: t(
            "help_a_language",
            "Yes — use the language switcher in the navigation bar to change between English, French, Arabic, and Spanish at any time.",
          ),
        },
      ],
    },
    {
      key: "trees-gedcom",
      icon: Network,
      title: t("help_cat_trees", "Family Trees & GEDCOM"),
      items: [
        {
          q: t("help_q_gedcom_import", "What GEDCOM formats can I import?"),
          a: t(
            "help_a_gedcom_import",
            "We support GEDCOM 5.5.1, GEDCOM 7.0, and GEDCOM X (XML, JSON, or .gedx). Use the Import GEDCOM button inside the tree builder toolbar and pick the matching format.",
          ),
        },
        {
          q: t("help_q_view_vs_download", "Why can I view a tree but not download it?"),
          a: t(
            "help_a_view_vs_download",
            "Viewing a tree you don't own renders it read-only in the browser. Downloading the underlying GEDCOM file requires either owning the tree or an approved download request — this protects contributors' research from being copied wholesale without their knowledge.",
          ),
        },
        {
          q: t("help_q_request_download", "How do I request to download someone else's tree?"),
          a: t(
            "help_a_request_download",
            "Open the tree and click \"Request to Download.\" The owner (or an admin) will be notified and can approve or deny it from their Download Requests page. You can track the status from \"My Requests\" in the navigation menu.",
          ),
        },
      ],
    },
    {
      key: "subscriptions-billing",
      icon: CreditCard,
      title: t("help_cat_subscriptions", "Subscriptions & Billing"),
      items: [
        {
          q: t("help_q_plans_differ", "How do the plans differ?"),
          a: t(
            "help_a_plans_differ",
            "Basic is free and covers small trees. Premium and Family Historian unlock unlimited trees, archive uploads, GEDCOM import/export, and priority support. See the Subscriptions page for the full feature list.",
          ),
        },
        {
          q: t("help_q_how_to_pay", "How do I pay for a plan?"),
          a: t(
            "help_a_how_to_pay",
            "Choose a plan, then submit a bank transfer using the details shown on the payment page and upload a screenshot of your receipt as proof. Our team reviews and activates it, usually within one business day.",
          ),
        },
        {
          q: t("help_q_payment_review_time", "How long does payment review take?"),
          a: t(
            "help_a_payment_review_time",
            "Most submissions are reviewed within 24 hours. You'll see your plan update automatically once approved — no need to log out and back in.",
          ),
        },
      ],
    },
    {
      key: "privacy-data",
      icon: Lock,
      title: t("help_cat_privacy", "Privacy & Data"),
      items: [
        {
          q: t("help_q_who_sees_tree", "Who can see my family tree?"),
          a: t(
            "help_a_who_sees_tree",
            "You control whether a tree is public or private when you create it. Private trees are visible only to you; public trees appear in the gallery for others to view (and request to download, subject to your approval).",
          ),
        },
        {
          q: t("help_q_data_rights", "What are my data rights?"),
          a: t(
            "help_a_data_rights",
            "Our Privacy Policy covers your rights under GDPR (EU/EEA/UK) and US state privacy laws, including access, correction, deletion, and opting out of data sharing. See the Privacy Policy page for full details.",
          ),
        },
      ],
    },
    {
      key: "account-login",
      icon: UserCircle2,
      title: t("help_cat_account", "Account & Login"),
      items: [
        {
          q: t("help_q_forgot_password", "I forgot my password — what now?"),
          a: t(
            "help_a_forgot_password",
            "Click \"Forgot password\" on the login page and follow the emailed instructions to set a new one.",
          ),
        },
        {
          q: t("help_q_delete_account", "How do I delete my account?"),
          a: t(
            "help_a_delete_account",
            "Go to My Profile and submit an account deletion request. A super admin reviews and processes these manually to make sure any shared family trees are handled correctly first.",
          ),
        },
      ],
    },
  ];
}

export default function HelpCenter() {
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
  const [query, setQuery] = useState("");
  const [openKey, setOpenKey] = useState<string | null>(null);

  const categories = useFaqCategories(t);

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q),
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [categories, query]);

  return (
    <RootsPageShell
      hero={
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <LifeBuoy className="w-12 h-12 text-[#d9a441]" />
          </div>
          <p className="text-sm uppercase tracking-[0.3em] text-[#d9a441]">
            {t("legacy.support", "Support")}
          </p>
          <h1 className="text-5xl font-bold">{t("help_center", "Help Center")}</h1>
          <p className="max-w-2xl mx-auto text-lg opacity-90">
            {t("help_center_intro", "Answers to common questions about building trees, subscriptions, and your account.")}
          </p>
        </div>
      }
    >
      <div className="max-w-3xl mx-auto space-y-10">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("help_search_placeholder", "Search help articles...")}
            className={`w-full pl-12 pr-4 py-3.5 rounded-full border outline-none transition-colors ${
              isDark
                ? "bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-[#d9a441]"
                : "bg-white border-[#e8e4dc] text-[#162238] placeholder-[#162238]/40 focus:border-[#24766f]"
            }`}
          />
        </div>

        {filteredCategories.length === 0 ? (
          <div className="text-center py-12 opacity-60">
            <HelpCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>{t("help_no_results", "No help articles match your search.")}</p>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <section key={category.key} className="space-y-4">
              <h2 className="flex items-center gap-2.5 text-xl font-bold font-cinzel text-[var(--brand-teal)] dark:text-[var(--gold-light)]">
                <category.icon className="w-5 h-5" />
                {category.title}
              </h2>
              <div className="space-y-3">
                {category.items.map((item) => {
                  const itemKey = `${category.key}:${item.q}`;
                  const isOpen = openKey === itemKey;
                  return (
                    <div
                      key={itemKey}
                      className={`rounded-xl border overflow-hidden ${
                        isDark ? "border-white/10 bg-white/5" : "border-[#e8e4dc] bg-white"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenKey(isOpen ? null : itemKey)}
                        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left font-semibold"
                        aria-expanded={isOpen}
                      >
                        {item.q}
                        <ChevronDown
                          className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4 text-sm opacity-80 leading-relaxed">{item.a}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}

        <div
          className={`text-center rounded-2xl border p-8 ${
            isDark ? "border-white/10 bg-white/5" : "border-[#e8e4dc] bg-white"
          }`}
        >
          <p className="font-semibold mb-2">{t("help_still_need_help", "Still need help?")}</p>
          <p className="text-sm opacity-70 mb-4">
            {t("help_contact_intro", "Reach out and our team will get back to you.")}
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#24766f] text-white text-sm font-semibold hover:bg-[#24766f]/90 transition-colors"
          >
            {t("legacy.contact_us", "Contact Us")}
          </Link>
        </div>
      </div>
    </RootsPageShell>
  );
}
