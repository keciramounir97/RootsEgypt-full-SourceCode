import { useThemeStore } from "../store/theme";
import { NavLink } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  User,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../admin/components/AuthContext";
import { useLanguage } from "../i18n";
import EgyptianLogoMark from "../components/EgyptianLogoMark";

const bgImage = "/assets/egypt-bg.jpeg";

export default function Signup() {
  const { theme } = useThemeStore();
  const { signup } = useAuth();
  const { t } = useLanguage();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const isDark = theme === "dark";

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!fullName.trim()) {
      setError(t("legacy.full_name_required", "Full name is required"));
      return;
    }
    if (!emailPattern.test(email.trim().toLowerCase())) {
      setError(t("legacy.invalid_email", "Please enter a valid email address"));
      return;
    }
    if (String(password).length < 8) {
      setError(t("legacy.password_strength", "Password must be at least 8 characters long"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("legacy.passwords_dont_match", "Passwords do not match"));
      return;
    }

    setLoading(true);
    try {
      await signup(fullName.trim(), phone.trim(), email.trim().toLowerCase(), password);
      setSuccess(
        t("legacy.signup_success_pending",
          "Account created. A super admin will review and validate your account.",
        ),
      );
    } catch (err: any) {
      setError(err.response?.data?.message || t("legacy.signup_failed", "Signup failed"));
    } finally {
      setLoading(false);
    }
  };

  const inputCls = `flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 transition-all focus-within:border-[#d9a441] focus-within:shadow-lg focus-within:shadow-[#d9a441]/10 ${isDark ? "bg-white/5 border-white/10" : "bg-white border-[#e8e4dc]"}`;
  const inputTextCls = `bg-transparent outline-none flex-1 text-base ${isDark ? "text-white placeholder:text-white/30" : "text-[#162238] placeholder:text-[#162238]/30"}`;
  const labelCls = `text-sm font-medium mb-2 block ${isDark ? "text-white/80" : "text-[#162238]/80"}`;

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={bgImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#071827]/90 via-[#0f2742]/80 to-[#24766f]/60" />
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-center">
          <div className="w-24 h-24 rounded-2xl mb-8 shadow-2xl bg-gradient-to-br from-[#d4a843]/20 to-[#c45c3e]/20 backdrop-blur-sm border-2 border-[#d4a843]/30 flex items-center justify-center p-4">
            <EgyptianLogoMark size={64} className="text-[#d4a843]" />
          </div>
          <h2 className="text-4xl font-bold !text-white mb-4 drop-shadow-md font-cinzel">
            RootsEgypt
          </h2>
          <p className="text-white/80 text-lg max-w-md leading-relaxed">
            {t("legacy.signup_desc",
              "Join RootsEgypt to preserve Egyptian family stories, records, and relationships across generations.",
            )}
          </p>
        </div>
      </div>

      <div
        className={`flex-1 flex items-center justify-center p-6 sm:p-10 ${isDark ? "bg-[#071827]" : "bg-[#f7f2e8]"}`}
      >
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-6 lg:hidden">
            <div className="w-16 h-16 rounded-xl mb-4 shadow-lg bg-gradient-to-br from-[#d4a843]/20 to-[#c45c3e]/20 backdrop-blur-sm border-2 border-[#d4a843]/30 flex items-center justify-center p-3">
              <EgyptianLogoMark size={40} className="text-[#d4a843]" />
            </div>
            <h2 className="text-2xl font-bold font-cinzel">RootsEgypt</h2>
          </div>

          <div className="mb-6">
            <h1
              className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-[#0f2742]"}`}
            >
              {t("legacy.create_account", "Create Account")}
            </h1>
            <p
              className={`text-base ${isDark ? "text-white/60" : "text-[#162238]/60"}`}
            >
              {t("legacy.signup_subtitle", "Fill in your details to get started")}
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSignup}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>
                  {t("legacy.full_name", "Full Name")}
                </label>
                <div className={inputCls}>
                  <User className="w-5 h-5 text-[#d9a441] shrink-0" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t("legacy.full_name_placeholder", "Your name")}
                    className={inputTextCls}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>{t("legacy.phone", "Phone")}</label>
                <div className={inputCls}>
                  <Phone className="w-5 h-5 text-[#d9a441] shrink-0" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t("legacy.phone_placeholder",
                      "e.g. +20 100 123 4567",
                    )}
                    className={inputTextCls}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={labelCls}>{t("legacy.email", "Email")}</label>
              <div className={inputCls}>
                <Mail className="w-5 h-5 text-[#d9a441] shrink-0" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("legacy.email_placeholder", "example@email.com")}
                  className={inputTextCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>{t("legacy.password", "Password")}</label>
                <div className={inputCls}>
                  <Lock className="w-5 h-5 text-[#d9a441] shrink-0" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    className={inputTextCls}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[#d9a441]/60 hover:text-[#d9a441] transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className={labelCls}>
                  {t("legacy.confirm_password", "Confirm")}
                </label>
                <div className={inputCls}>
                  <Lock className="w-5 h-5 text-[#d9a441] shrink-0" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="********"
                    className={inputTextCls}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-[#d9a441]/60 hover:text-[#d9a441] transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                <p className="text-red-500 text-sm text-center font-medium">
                  {error}
                </p>
              </div>
            )}

            {success && (
              <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-green-600 dark:text-green-400 text-sm font-medium">
                      {t("legacy.account_created", "Account Created")}
                    </p>
                    <p className="text-green-600/60 dark:text-green-400/60 text-xs mt-1">
                      {success}
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
                  {t("legacy.please_wait", "Please wait...")}
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  {t("legacy.signup", "Sign Up")}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <p
              className={`text-center text-sm pt-2 ${isDark ? "text-white/50" : "text-[#162238]/50"}`}
            >
              {t("legacy.already_have_account", "Already have an account?")}{" "}
              <NavLink
                to="/login"
                className="text-[#24766f] font-bold hover:text-[#d9a441] transition-colors"
              >
                {t("legacy.login", "Login")}
              </NavLink>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
