import { useEffect, useMemo, useState } from "react";
import { Check, Crown, Sparkles, Star, Zap } from "lucide-react";
import { useLanguage as useTranslation } from "../i18n";
import { useThemeStore } from "../store/theme";
import { Link } from "react-router-dom";
import RootsPageShell from "../components/RootsPageShell";
import { api } from "../api/client";

type Tier = {
  id?: number;
  slug: string;
  name: string;
  price: number;
  trial_days?: number;
  tagline?: string;
  description?: string;
  features: string[];
  is_active?: boolean;
};

const ICON_BY_SLUG: Record<string, typeof Star> = {
  basic: Star,
  premium: Crown,
  pro: Sparkles,
};

const FALLBACK_TIERS: Tier[] = [
  {
    slug: "basic",
    name: "Basic",
    price: 0,
    trial_days: 14,
    features: [
      "Build up to 3 family trees",
      "Basic tree visualization",
      "Add up to 50 people per tree",
      "Community access",
      "Email support",
    ],
  },
  {
    slug: "premium",
    name: "Premium",
    price: 9.99,
    trial_days: 14,
    features: [
      "Unlimited family trees",
      "Advanced tree visualization",
      "Unlimited people per tree",
      "Archive document uploads",
      "GEDCOM import/export",
      "Priority email support",
      "Advanced search & filters",
    ],
  },
  {
    slug: "pro",
    name: "Family Historian",
    price: 19.99,
    trial_days: 14,
    features: [
      "Everything in Premium",
      "AI-powered tree suggestions",
      "AI note summarization",
      "Task management & reminders",
      "WhatsApp priority support",
      "Early access to new features",
      "Contribute to archive database",
    ],
  },
];

export default function Subscriptions() {
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const [annual, setAnnual] = useState(false);
  const [tiers, setTiers] = useState<Tier[]>(FALLBACK_TIERS);
  const isDark = theme === "dark";

  useEffect(() => {
    let cancelled = false;
    api
      .get("/subscriptions/tiers")
      .then(({ data }) => {
        if (cancelled || !Array.isArray(data) || !data.length) return;
        const active = data.filter((tier: Tier) => tier.is_active !== false);
        if (active.length) setTiers(active);
      })
      .catch(() => {
        // Keep the built-in fallback tiers if the API is unavailable.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const displayTiers = useMemo(
    () =>
      tiers.map((tier, index) => ({
        ...tier,
        icon: ICON_BY_SLUG[tier.slug] || [Star, Crown, Sparkles][index % 3],
        popular: tier.slug === "premium",
      })),
    [tiers],
  );

  return (
    <RootsPageShell
      hero={
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-[#d4af37]">
            {t("pricing", "Pricing")}
          </p>
          <h1 className="text-5xl font-bold">
            {t("subscriptions", "Subscriptions")}
          </h1>
          <p className="max-w-3xl mx-auto text-lg opacity-90">
            {t(
              "subscriptions_intro",
              "Choose the plan that fits your genealogy research needs. All plans include a 14-day free trial."
            )}
          </p>
        </div>
      }
    >
      {/* Billing toggle */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 bg-[var(--paper-color)] border border-[var(--border-color)] rounded-full p-1.5 shadow-sm">
          <button
            onClick={() => setAnnual(false)}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
              !annual
                ? "bg-[var(--brand-gold)] text-white shadow-md"
                : isDark
                  ? "text-white/70 hover:text-white"
                  : "text-[var(--text-color)] hover:text-[var(--brand-teal)]"
            }`}
          >
            {t("monthly", "Monthly")}
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
              annual
                ? "bg-[var(--brand-gold)] text-white shadow-md"
                : isDark
                  ? "text-white/70 hover:text-white"
                  : "text-[var(--text-color)] hover:text-[var(--brand-teal)]"
            }`}
          >
            {t("yearly", "Yearly")}
            <span className="ml-1.5 text-xs bg-[var(--brand-teal)] text-white px-2 py-0.5 rounded-full">
              -20%
            </span>
          </button>
        </div>
      </div>

      {/* Tier cards */}
      <div className="grid md:grid-cols-3 gap-8">
        {displayTiers.map((tier) => {
          const Icon = tier.icon;
          const price = annual
            ? (tier.price * 10 * 0.8).toFixed(2)
            : tier.price.toFixed(2);
          const features = tier.features;

          const isPopular = tier.popular;

          // Card styles — ensure text contrast
          const cardBg = isPopular
            ? isDark
              ? "bg-gradient-to-br from-[#134E4A] to-[#092C2B] border-[var(--brand-gold)]"
              : "bg-gradient-to-br from-[#134E4A] to-[#0d3532] border-[var(--brand-gold)]"
            : isDark
              ? "bg-[var(--paper-color)] border-[var(--border-color)]"
              : "bg-white border-[var(--border-color)]";

          // Text colors — white on teal backgrounds, normal elsewhere
          const titleColor = isPopular ? "text-white" : "text-[var(--text-color)]";
          const priceColor = isPopular ? "text-white" : "text-[var(--text-color)]";
          const featureColor = isPopular ? "text-white/90" : "text-[var(--text-color)]";
          const subTextColor = isPopular ? "text-white/60" : "text-[var(--text-color)] opacity-60";
          const taglineColor = isPopular ? "text-white/75" : "text-[var(--text-color)] opacity-70";
          const checkColor = isPopular ? "text-[var(--brand-gold)]" : "text-[var(--brand-teal)]";

          return (
            <div
              key={tier.slug}
              className={`relative rounded-2xl border-2 p-8 transition-all hover:shadow-xl ${cardBg} ${
                isPopular ? "shadow-lg scale-105 md:scale-[1.06]" : ""
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--brand-gold)] text-white text-xs font-bold uppercase tracking-wider px-4 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                  <Zap className="w-3.5 h-3.5" />
                  {t("most_popular", "Most Popular")}
                </div>
              )}

              <div className="text-center mb-6">
                <div
                  className={`w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center ${
                    isPopular
                      ? "bg-[var(--brand-gold)] text-white"
                      : "bg-[var(--brand-teal)]/10 text-[var(--brand-teal)]"
                  }`}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className={`text-2xl font-bold font-cinzel ${titleColor}`}>
                  {t(`tier_${tier.slug}`, tier.name)}
                </h3>
                {tier.tagline && (
                  <p className={`mt-1.5 text-sm ${taglineColor}`}>{tier.tagline}</p>
                )}
                <div className="mt-3">
                  <span className={`text-4xl font-bold ${priceColor}`}>
                    ${price}
                  </span>
                  <span className={`text-sm ml-1 ${subTextColor}`}>
                    {annual ? t("per_year", "/year") : t("per_month", "/month")}
                  </span>
                </div>
                {(tier.trial_days || 0) > 0 && (
                  <p className="text-sm text-[var(--brand-gold)] font-semibold mt-2">
                    {t("trial_days", "14-day free trial")}
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {features.map((feat, i) => (
                  <li
                    key={i}
                    className={`flex items-start gap-3 text-sm ${featureColor}`}
                  >
                    <Check
                      className={`w-5 h-5 ${checkColor} shrink-0 mt-0.5`}
                    />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={`/payment/${tier.slug}`}
                className={`block w-full py-3.5 rounded-full text-center font-bold text-sm uppercase tracking-wider transition-all ${
                  isPopular
                    ? "bg-gradient-to-r from-[var(--brand-gold)] to-[var(--gold-light)] text-[#092C2B] shadow-lg hover:shadow-xl hover:scale-[1.02]"
                    : isDark
                      ? "border-2 border-white/30 text-white hover:bg-white/10"
                      : "border-2 border-[var(--brand-teal)] text-[var(--brand-teal)] hover:bg-[var(--brand-teal)] hover:text-white"
                }`}
              >
                {tier.price === 0
                  ? t("start_free_trial", "Start Free Trial")
                  : t("subscribe_now", "Subscribe Now")}
              </Link>
            </div>
          );
        })}
      </div>
    </RootsPageShell>
  );
}
