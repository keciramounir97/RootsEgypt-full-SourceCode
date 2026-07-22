/* eslint-disable no-unused-vars */
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";
import { useThemeStore } from "../../store/theme";
import { useLanguage } from "../../i18n";
import LanguageMenu from "../../components/LanguageMenu";
import { useAuth } from "./AuthContext";
import {
  EyeOfHorus,
  EGYPT_COLORS,
} from "../../components/motion/EgyptianMotion";
import {
  LayoutDashboard,
  Network,
  Image,
  BookOpen,
  Settings,
  Activity,
  Users,
  Music,
  FileText,
  MessageSquare,
  Mail,
  Shield,
  UserCheck,
  Newspaper,
  Globe,
  KeyRound,
  Trash2,
  UserCog,
  ShieldCheck,
  Scale,
  X,
  LogOut,
  ChevronRight,
  PanelLeftClose,
} from "lucide-react";

// Navigation Config
const links = [
  { to: "/admin", end: true, labelKey: "dashboard", Icon: LayoutDashboard },
  { to: "/admin/trees", labelKey: "trees", Icon: Network },
  { to: "/admin/gallery", labelKey: "gallery", Icon: Image },
  { to: "/admin/books", labelKey: "books", Icon: BookOpen },
  { to: "/admin/audios", labelKey: "audios", Icon: Music },
  { to: "/admin/documents", labelKey: "documents", Icon: FileText },
  { to: "/admin/articles", labelKey: "articles", Icon: Newspaper },
  { to: "/admin/suggestions", labelKey: "suggestions", Icon: MessageSquare },
  { to: "/admin/newsletter", labelKey: "newsletter", Icon: Mail },
  { to: "/admin/contact-messages", labelKey: "contactMessages", Icon: Mail },
  { to: "/admin/users", labelKey: "users", Icon: Users },
  { to: "/admin/validation-approvals", labelKey: "validation_approvals", Icon: ShieldCheck },
  { to: "/admin/hero-images", labelKey: "hero_images", Icon: Image },
  { to: "/admin/background-images", labelKey: "background_images", Icon: Globe },
  { to: "/admin/approvals", labelKey: "approvals", Icon: UserCheck },
  { to: "/admin/password-reset-requests", labelKey: "password_reset_requests", Icon: KeyRound },
  { to: "/admin/account-deletion-requests", labelKey: "account_deletion_requests", Icon: Trash2 },
  { to: "/admin/role-distribution", labelKey: "role_distribution", Icon: UserCog },
  { to: "/admin/admins", labelKey: "admins", Icon: Shield },
  { to: "/admin/activity", labelKey: "activity", Icon: Activity },
  { to: "/admin/settings", labelKey: "settings", Icon: Settings },
  { to: "/admin/footer-settings", labelKey: "footer_settings", Icon: Globe },
  { to: "/admin/legal-content", labelKey: "legal_content", Icon: Scale },
];

const labelFallbacks: Record<string, string> = {
  validation_approvals: "Validation Approvals",
  password_reset_requests: "Password Reset Requests",
  account_deletion_requests: "Account Deletion Requests",
  role_distribution: "Role Distribution",
  hero_images: "Hero Images",
  background_images: "Background Images",
  footer_settings: "Footer Settings",
  contactMessages: "Contact Messages",
  legal_content: "Legal Content",
};

export default function AdminSidebar({
  open,
  onClose,
  onToggle,
}: {
  open: boolean;
  onClose: () => void;
  onToggle: () => void;
}) {
  const { theme } = useThemeStore();
  const { logout, user } = useAuth();
  const { t } = useLanguage();
  const isDark = theme === "dark";
  const granted = Array.isArray(user?.permissions) ? user.permissions : [];
  const hasAllPermissions = granted.includes("all");
  const isSuperAdmin = user?.role === 3 || hasAllPermissions;

  const visibleLinks = links.filter((link) => {
    if (isSuperAdmin) return true;
    const superAdminOnly = [
      "/admin/approvals",
      "/admin/password-reset-requests",
      "/admin/account-deletion-requests",
      "/admin/role-distribution",
      "/admin/admins",
      "/admin/legal-content",
    ];
    if ((user?.role === 1 || user?.role === 3) && granted.length === 0) {
      return !superAdminOnly.includes(link.to);
    }
    if (superAdminOnly.includes(link.to)) return false;
    if (link.to === "/admin") return granted.includes("dashboard");
    const key = link.to.replace("/admin/", "");
    return granted.includes(key);
  });

  return (
    <>
      {/* Backdrop - mobile/tablet when sidebar overlays */}
      <AnimatePresence>
        {open && (
          <motion.div
            onClick={onClose}
            className="fixed inset-0 z-40 lg:hidden bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Panel - Egyptian themed */}
      <motion.aside
        className={`fixed top-0 left-0 bottom-0 w-72 z-50 flex flex-col shadow-2xl overflow-hidden
        ${isDark ? "bg-[#060e1c] border-r border-[#d4a843]/15" : "bg-[#0d1b2a] border-r border-[#d4a843]/20"}`}
        initial={false}
        animate={{ x: open ? 0 : -288 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Egyptian gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{
            background: `
              radial-gradient(ellipse at top left, rgba(212,168,67,0.12) 0%, transparent 55%),
              radial-gradient(ellipse at bottom right, rgba(196,92,62,0.08) 0%, transparent 50%)
            `,
          }}
        />

        {/* Subtle papyrus texture lines */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, ${EGYPT_COLORS.gold} 40px, ${EGYPT_COLORS.gold} 41px)`,
          }}
        />

        {/* Header with Eye of Horus */}
        <div className="relative h-20 flex items-center justify-between px-5 border-b border-[#d4a843]/15 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${EGYPT_COLORS.gold}, ${EGYPT_COLORS.terracotta})`,
              }}
            >
              <EyeOfHorus size={32} color="#0a1220" />
            </div>
            <div>
              <span className="font-cinzel font-bold text-xl tracking-wider text-[#d4a843] block leading-tight">
                ROOTS
              </span>
              <span className="text-[10px] tracking-[0.2em] text-[#d4a843]/70 uppercase font-medium">
                {t("legacy.admin_brand_subtitle", "Egypt Admin")}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onToggle}
              className="hidden lg:flex p-2 rounded-lg hover:bg-[#d4a843]/10 text-[#d4a843]/60 hover:text-[#d4a843] transition-colors"
              aria-label={
                open
                  ? t("legacy.close_sidebar", "Close sidebar")
                  : t("legacy.open_sidebar", "Open sidebar")
              }
              title={
                open
                  ? t("legacy.close_sidebar", "Close sidebar")
                  : t("legacy.open_sidebar", "Open sidebar")
              }
            >
              <PanelLeftClose className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-[#d4a843]/10 text-[#d4a843]/60 hover:text-[#d4a843] transition-colors"
              aria-label={t("legacy.close_sidebar", "Close sidebar")}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="relative flex-1 overflow-y-auto py-5 px-3 flex flex-col gap-1 scrollbar-thin">
          <div className="px-3 mb-3">
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#d4a843]/50">
              {t("legacy.menu", "Main Menu")}
            </span>
          </div>

          {visibleLinks.map(({ to, end, labelKey, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-[#d4a843]/20 to-[#c45c3e]/10 text-[#d4a843] font-semibold shadow-lg shadow-[#d4a843]/10 ring-1 ring-[#d4a843]/20"
                    : "text-[#e8dfca]/70 hover:bg-[#d4a843]/8 hover:text-[#d4a843]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <motion.div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isActive
                        ? "bg-[#d4a843]/20"
                        : "bg-white/5 group-hover:bg-[#d4a843]/10"
                    }`}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon
                      className={`w-4 h-4 ${isActive ? "text-[#d4a843]" : "text-[#0d9488]"}`}
                    />
                  </motion.div>
                  <span className="text-sm tracking-wide flex-1">
                    {t(labelKey, labelFallbacks[labelKey] || labelKey)}
                  </span>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight className="w-4 h-4 text-[#d4a843]/60 shrink-0" />
                    </motion.div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer with Egyptian accent */}
        <div className="relative p-4 border-t border-[#d4a843]/15 bg-black/20 shrink-0 space-y-3">
          {/* Gold accent line */}
          <div
            className="absolute top-0 left-4 right-4 h-[1px]"
            style={{
              background: `linear-gradient(90deg, transparent, ${EGYPT_COLORS.gold}44, transparent)`,
            }}
          />
          <div className="grid grid-cols-2 gap-2">
            <LanguageMenu
              align="up"
              buttonClassName="w-full justify-center px-3 py-2 rounded-lg border border-[#d4a843]/15 bg-[#d4a843]/5 text-[#d4a843] hover:bg-[#d4a843]/10 transition-colors text-xs font-medium"
            />
            <ThemeToggle className="w-full justify-center px-3 py-2 rounded-lg border border-[#d4a843]/15 bg-[#d4a843]/5 text-[#d4a843] hover:bg-[#d4a843]/10 transition-colors" />
          </div>

          <motion.button
            type="button"
            onClick={() => {
              logout();
              onClose();
            }}
            className="admin-sidebar-logout interactive-btn w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut className="w-4 h-4" />
            <span>{t("legacy.logout", "Sign Out")}</span>
          </motion.button>
        </div>
      </motion.aside>
    </>
  );
}
