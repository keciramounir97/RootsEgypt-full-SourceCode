import { useThemeStore } from "../store/theme";
import { NavLink, useNavigate } from "react-router-dom";
import { Lock, Mail, ShieldCheck, User } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../admin/components/AuthContext";
import { useTranslation } from "../context/TranslationContext";
import RootsPageShell from "../components/RootsPageShell";
import { isMockMode } from "../lib/mockApi";
import {
  EyeOfHorus,
  PapyrusCard,
  EgyptianButton,
  SandParticleField,
  HieroglyphicBorder,
  ScarabLoader,
  EGYPT_COLORS,
  EGYPT_EASE,
} from "../components/motion/EgyptianMotion";

const DEMO_ACCOUNTS = [
  {
    label: "Admin",
    email: "admin@rootsegypt.org",
    password: "password123",
    color: "text-amber-600 dark:text-amber-400",
    badge: "bg-amber-100 dark:bg-amber-900/40",
  },
  {
    label: "Researcher",
    email: "researcher@rootsegypt.org",
    password: "research123",
    color: "text-teal-600 dark:text-teal-400",
    badge: "bg-teal-100 dark:bg-teal-900/40",
  },
  {
    label: "Member",
    email: "demo@rootsegypt.org",
    password: "demo123",
    color: "text-blue-600 dark:text-blue-400",
    badge: "bg-blue-100 dark:bg-blue-900/40",
  },
];

export default function Login() {
  const { theme } = useThemeStore();
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const mockMode = isMockMode();

  useEffect(() => {
    if (user) {
      navigate("/admin", { replace: true });
    }
  }, [user, navigate]);

  const isDark = theme === "dark";
  const inputBg = isDark ? "bg-white/5" : "bg-black/5";
  const borderColor = isDark ? "border-[#d4a843]/20" : "border-[#d4a843]/25";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !emailPattern.test(trimmedEmail)) {
      setError(
        t("invalid_email", "Please provide a valid email before logging in"),
      );
      return;
    }
    if (!password) {
      setError(t("password_required", "Password is required to sign you in"));
      return;
    }

    setLoading(true);
    try {
      const result = await login(trimmedEmail, password);
      if (result) {
        navigate("/admin", { replace: true });
      } else {
        setError(
          t("login_failed_no_user", "Login failed: No user data received"),
        );
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          t(
            "invalid_credentials",
            "Invalid credentials. Please check your email and password.",
          ),
      );
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (account: (typeof DEMO_ACCOUNTS)[0]) => {
    setEmail(account.email);
    setPassword(account.password);
    setError("");
  };

  return (
    <RootsPageShell
      hero={
        <motion.div
          className="space-y-3 flex flex-col items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EGYPT_EASE.pharaoh }}
        >
          <EyeOfHorus
            size={80}
            color={isDark ? EGYPT_COLORS.gold : EGYPT_COLORS.terracotta}
          />
          <h1
            className={`text-4xl font-bold text-center font-cinzel ${isDark ? "text-[#d4a843]" : "text-[#0c4a6e]"}`}
          >
            {t("welcome_back", "Welcome Back")}
          </h1>
          <p className="text-lg opacity-80 text-center max-w-md">
            {t(
              "login_with_email_password",
              "Securely log in and continue building your Roots Egypt archive.",
            )}
          </p>
        </motion.div>
      }
      className="min-h-[calc(100vh-120px)] relative"
    >
      {/* Sand particles background */}
      <SandParticleField
        count={12}
        className="absolute inset-0 -z-[1] pointer-events-none"
      />

      <section className="roots-section">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: EGYPT_EASE.pharaoh }}
          className="relative mx-auto w-full max-w-md"
        >
          <PapyrusCard
            isDark={isDark}
            className="px-4 sm:px-6 md:px-10 py-6 sm:py-8 md:py-12"
          >
            {/* Top hieroglyphic border */}
            <HieroglyphicBorder position="top" className="mb-4" />

            {/* Demo credentials panel — only shown in mock mode */}
            {mockMode && (
              <motion.div
                className={`mb-6 rounded-xl border ${isDark ? "border-[#d4a843]/20 bg-[#d4a843]/5" : "border-[#d4a843]/25 bg-[#d4a843]/5"} p-4`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck
                    className={`w-4 h-4 ${isDark ? "text-[#d4a843]" : "text-[#c45c3e]"}`}
                  />
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-[#d4a843]" : "text-[#c45c3e]"}`}
                  >
                    Demo Mode — click to fill credentials
                  </span>
                </div>
                <div className="space-y-2">
                  {DEMO_ACCOUNTS.map((acc, i) => (
                    <motion.button
                      key={acc.email}
                      type="button"
                      onClick={() => fillDemo(acc)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border ${isDark ? "border-[#d4a843]/15 hover:border-[#d4a843]/30 bg-white/5 hover:bg-white/10" : "border-[#d4a843]/15 hover:border-[#d4a843]/30 bg-white hover:bg-[#d4a843]/5"} transition-colors text-left`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-2">
                        <User className={`w-3.5 h-3.5 ${acc.color}`} />
                        <span className={`text-xs font-semibold ${acc.color}`}>
                          {acc.label}
                        </span>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-xs ${isDark ? "text-white/60" : "text-gray-500"}`}
                        >
                          {acc.email}
                        </div>
                        <div
                          className={`text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}
                        >
                          pw: {acc.password}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="space-y-2">
                <label
                  className={`text-sm font-semibold ${isDark ? "text-[#d4a843]/80" : "text-[#0c4a6e]"}`}
                >
                  {t("email", "Email")}
                </label>
                <motion.div
                  className={`flex items-center gap-3 p-3 rounded-md border ${borderColor} ${inputBg} focus-within:border-[#d4a843]/50 transition-colors`}
                  whileFocus={{ borderColor: `${EGYPT_COLORS.gold}80` }}
                >
                  <Mail
                    className={`w-5 h-5 ${isDark ? "text-[#d4a843]/60" : "text-[#c45c3e]/60"}`}
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    className={`bg-transparent outline-none flex-1 ${isDark ? "text-white" : "text-[#091326]"}`}
                  />
                </motion.div>
              </div>

              <div className="space-y-2">
                <label
                  className={`text-sm font-semibold ${isDark ? "text-[#d4a843]/80" : "text-[#0c4a6e]"}`}
                >
                  {t("password", "Password")}
                </label>
                <div
                  className={`flex items-center gap-3 p-3 rounded-md border ${borderColor} ${inputBg} focus-within:border-[#d4a843]/50 transition-colors`}
                >
                  <Lock
                    className={`w-5 h-5 ${isDark ? "text-[#d4a843]/60" : "text-[#c45c3e]/60"}`}
                  />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    className={`bg-transparent outline-none flex-1 ${isDark ? "text-white" : "text-[#091326]"}`}
                  />
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    className="text-red-500 text-sm text-center"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <EgyptianButton
                type="submit"
                variant="gold"
                isDark={isDark}
                disabled={loading}
                onClick={() => {}}
                className="w-full"
              >
                {loading ? <ScarabLoader size={24} /> : t("login", "Login")}
              </EgyptianButton>

              {/* Gold divider */}
              <div
                className="w-full h-px"
                style={{
                  background: `linear-gradient(90deg, transparent, ${EGYPT_COLORS.gold}44, transparent)`,
                }}
              />

              <div className="flex justify-between text-sm">
                <NavLink
                  to="/resetpassword"
                  className={`interactive-link ${isDark ? "text-[#d4a843]/70 hover:text-[#d4a843]" : "text-[#c45c3e] hover:text-[#0c4a6e]"}`}
                >
                  {t("forgot_password", "Forgot password?")}
                </NavLink>
                <NavLink
                  to="/signup"
                  className={`interactive-link font-semibold ${isDark ? "text-[#d4a843]/70 hover:text-[#d4a843]" : "text-[#c45c3e] hover:text-[#0c4a6e]"}`}
                >
                  {t("create_account", "Create account")}
                </NavLink>
              </div>
            </form>

            {/* Bottom hieroglyphic border */}
            <HieroglyphicBorder position="bottom" className="mt-4" />
          </PapyrusCard>
        </motion.div>
      </section>
    </RootsPageShell>
  );
}
