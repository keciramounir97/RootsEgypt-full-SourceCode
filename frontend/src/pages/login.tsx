import { useThemeStore } from "../store/theme";
import { NavLink, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  Mail,
  Shield,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../admin/components/AuthContext";
import { useTranslation } from "../context/TranslationContext";
import logoImage from "../assets/new-logo-dark.png";

const bgImage = "/assets/egypt-bg.jpeg";

export default function Login() {
  const { theme } = useThemeStore();
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [notValidated, setNotValidated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  useEffect(() => {
    if (user) navigate("/admin", { replace: true });
  }, [user, navigate]);

  const isDark = theme === "dark";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotValidated(false);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !emailPattern.test(trimmedEmail)) {
      setError(t("invalid_email", "Please provide a valid email before logging in"));
      return;
    }
    if (!password) {
      setError(t("password_required", "Password is required to sign you in"));
      return;
    }

    setLoading(true);
    try {
      const loggedInUser = await login(trimmedEmail, password);
      if (loggedInUser) {
        if (loggedInUser.status === "pending" || loggedInUser.status === "unvalidated") {
          setNotValidated(true);
        } else {
          navigate("/admin", { replace: true });
        }
      } else {
        setError(t("login_failed_no_user", "Login failed: No user data received"));
      }
    } catch (err: any) {
      const message =
        err.userMessage ||
        err.response?.data?.message ||
        err.message ||
        t("invalid_credentials", "Invalid credentials. Please check your email and password.");

      if (
        String(message).toLowerCase().includes("validat") ||
        String(message).toLowerCase().includes("pending") ||
        String(message).toLowerCase().includes("not approved") ||
        err.response?.status === 403
      ) {
        setNotValidated(true);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#071827]/90 via-[#0f2742]/80 to-[#24766f]/60" />
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-center">
          <img src={logoImage} alt="RootsEgypt" className="w-24 h-24 rounded-2xl mb-8 shadow-2xl bg-white p-2 object-contain" />
          <h2 className="text-4xl font-bold !text-white mb-4 drop-shadow-md font-cinzel">
            RootsEgypt
          </h2>
          <p className="text-white/80 text-lg max-w-md leading-relaxed">
            {t(
              "login_with_email_password",
              "Securely log in and continue building your Egyptian family archive.",
            )}
          </p>
        </div>
      </div>

      <div className={`flex-1 flex items-center justify-center p-6 sm:p-10 ${isDark ? "bg-[#071827]" : "bg-[#f7f2e8]"}`}>
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <img src={logoImage} alt="RootsEgypt" className="w-16 h-16 rounded-xl mb-4 shadow-lg bg-white p-1.5 object-contain" />
            <h2 className="text-2xl font-bold font-cinzel">RootsEgypt</h2>
          </div>

          <div className="mb-8">
            <h1 className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-[#0f2742]"}`}>
              {t("welcome_back", "Welcome Back")}
            </h1>
            <p className={`text-base ${isDark ? "text-white/60" : "text-[#162238]/60"}`}>
              {t("login_subtitle", "Sign in to your account")}
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className={`text-sm font-medium mb-2 block ${isDark ? "text-white/80" : "text-[#162238]/80"}`}>
                {t("email", "Email")}
              </label>
              <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 transition-all focus-within:border-[#d9a441] focus-within:shadow-lg focus-within:shadow-[#d9a441]/10 ${isDark ? "bg-white/5 border-white/10" : "bg-white border-[#e8e4dc]"}`}>
                <Mail className="w-5 h-5 text-[#d9a441] shrink-0" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("email_placeholder", "example@email.com")}
                  className={`bg-transparent outline-none flex-1 text-base ${isDark ? "text-white placeholder:text-white/30" : "text-[#162238] placeholder:text-[#162238]/30"}`}
                />
              </div>
            </div>

            <div>
              <label className={`text-sm font-medium mb-2 block ${isDark ? "text-white/80" : "text-[#162238]/80"}`}>
                {t("password", "Password")}
              </label>
              <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 transition-all focus-within:border-[#d9a441] focus-within:shadow-lg focus-within:shadow-[#d9a441]/10 ${isDark ? "bg-white/5 border-white/10" : "bg-white border-[#e8e4dc]"}`}>
                <Lock className="w-5 h-5 text-[#d9a441] shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  className={`bg-transparent outline-none flex-1 text-base ${isDark ? "text-white placeholder:text-white/30" : "text-[#162238] placeholder:text-[#162238]/30"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#d9a441]/60 hover:text-[#d9a441] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <NavLink to="/resetpassword" className="text-sm text-[#d9a441] hover:text-[#24766f] transition-colors font-medium">
                {t("forgot_password", "Forgot password?")}
              </NavLink>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                <p className="text-red-500 text-sm text-center font-medium">{error}</p>
              </div>
            )}

            {notValidated && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-600 dark:text-amber-400 text-sm font-medium">
                      {t("account_pending_validation", "Your account is pending validation.")}
                    </p>
                    <p className="text-amber-600/60 dark:text-amber-400/60 text-xs mt-1">
                      {t("account_pending_desc", "A super admin must approve your account before you can log in.")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group w-full py-4 rounded-2xl text-white font-bold text-base shadow-xl bg-gradient-to-r from-[#0f2742] via-[#24766f] to-[#d9a441] hover:shadow-2xl hover:shadow-[#d9a441]/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t("please_wait", "Please wait...")}
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  {t("login", "Login")}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <p className={`text-center text-sm pt-2 ${isDark ? "text-white/50" : "text-[#162238]/50"}`}>
              {t("no_account_yet", "Don't have an account?")}{" "}
              <NavLink to="/signup" className="text-[#24766f] font-bold hover:text-[#d9a441] transition-colors">
                {t("create_account", "Create account")}
              </NavLink>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
