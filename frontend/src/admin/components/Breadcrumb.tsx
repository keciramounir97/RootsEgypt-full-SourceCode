import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { useThemeStore } from "../../store/theme";
import { useLanguage } from "../../i18n";

const LABELS: Record<string, string> = {
  admin: "admin",
  users: "users",
  books: "books",
  trees: "trees",
  gallery: "gallery",
  settings: "settings",
  activity: "activity",
  contact: "contact",
  audio: "audio_library",
  articles: "articles",
  audios: "audios",
  documents: "documents",
  suggestions: "suggestions",
  newsletter: "newsletter",
  "contact-messages": "contactMessages",
  "validation-approvals": "validation_approvals",
  "password-reset-requests": "password_reset_requests",
  "account-deletion-requests": "account_deletion_requests",
  "role-distribution": "role_distribution",
  "hero-images": "hero_images",
  "background-images": "background_images",
  "footer-settings": "footer_settings",
  admins: "admins",
};

export default function Breadcrumb() {
  const { pathname } = useLocation();
  const { theme } = useThemeStore();
  const { t } = useLanguage();
  const isDark = theme === "dark";

  const parts = pathname.split("/").filter(Boolean);

  const segments = parts.map((p, i) => ({
    raw: p,
    label: LABELS[p] ? t(LABELS[p], LABELS[p]) : t(p, p.charAt(0).toUpperCase() + p.slice(1)),
    to: "/" + parts.slice(0, i + 1).join("/"),
  }));

  const baseText = isDark ? "text-[#f8f5ef]" : "text-[#0d1b2a]";
  const accent = isDark ? "text-teal" : "text-[#0c4a6e]";
  const muted = isDark ? "text-[#f8f5ef]/50" : "text-[#0d1b2a]/50";

  return (
    <nav className={`text-sm mb-4 ${baseText}`}>
      <ol className="flex items-center gap-2 flex-wrap">
        {/* Home */}
        <li>
          <Link
            to="/"
            className={`inline-flex items-center gap-2 ${accent} hover:underline`}
          >
            <Home className="w-4 h-4" />
            <span>{t("legacy.home", "Home")}</span>
          </Link>
        </li>

        {/* Segments */}
        {segments.map((s, i) => (
          <li key={s.to} className="flex items-center gap-2">
            <ChevronRight className={`w-4 h-4 ${muted}`} />

            {i === segments.length - 1 ? (
              <span className="font-semibold">
                {String(s.label).split("-").join(" ")}
              </span>
            ) : (
              <Link
                to={s.to}
                className={`${accent} hover:underline capitalize`}
              >
                {String(s.label).split("-").join(" ")}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
