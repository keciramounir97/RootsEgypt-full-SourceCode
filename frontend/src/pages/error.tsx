import { Link } from "react-router-dom";
import { Home, Search, ArrowLeft } from "lucide-react";
import RootsPageShell from "../components/RootsPageShell";
import { useLanguage } from "../i18n";

export default function Error() {
  const { t } = useLanguage();
  return (
    <RootsPageShell
      hero={
        <div className="space-y-6 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-teal/15 border-4 border-teal/35">
            <Search className="w-12 h-12 text-teal" />
          </div>
          <p className="text-sm uppercase tracking-[0.25em] text-terracotta font-semibold">
            {t("legacy.page_not_found", "404 • Page Not Found")}
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-primary-brown dark:text-white">
            {t("legacy.lost_in_archives", "Lost in the Archives")}
          </h1>
          <p className="max-w-xl mx-auto text-lg opacity-85">
            {t("legacy.error_404_description", "The page you're looking for doesn't exist or has been moved. Return home to continue exploring your Egyptian heritage.")}
          </p>
        </div>
      }
    >
      <section className="roots-section roots-section-alt">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="roots-cta interactive-btn btn-neu btn-neu--primary inline-flex items-center justify-center gap-2 px-8 py-3 text-base"
          >
            <Home className="w-5 h-5" />
            {t("legacy.go_to_home", "Go to Home")}
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="interactive-btn btn-neu btn-neu--gold inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            {t("legacy.go_back", "Go Back")}
          </button>
        </div>
      </section>
    </RootsPageShell>
  );
}
