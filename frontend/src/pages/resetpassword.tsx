import { useThemeStore } from "../store/theme";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, KeyRound, Lock, Mail, Send, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../admin/components/AuthContext";
import { useTranslation } from "../context/TranslationContext";
import { api } from "../api/client";
import EgyptianLogoMark from "../components/EgyptianLogoMark";

const bgImage = "/assets/egypt-bg.jpeg";

export default function ForgotPassword() {
  const { theme } = useThemeStore();
  const { requestReset, verifyReset } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = String(searchParams.get("token") || "");
  const tokenEmail = String(searchParams.get("email") || "").trim().toLowerCase();

  const [step] = useState(token || !tokenEmail ? 1 : 2);
  const [email, setEmail] = useState(tokenEmail);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const isDark = theme === "dark";

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmedEmail = email.trim().toLowerCase();
    if (!emailPattern.test(trimmedEmail)) {
      setError(t("invalid_email", "Please enter a valid email address"));
      return;
    }
    setLoading(true);
    try {
      await requestReset(trimmedEmail);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || t("reset_email_failed", "Failed to send reset email"));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!code.trim()) {
      setError(t("code_required", "Verification code is required"));
      return;
    }
    if (newPassword.length < 8) {
      setError(t("password_strength", "Password must be at least 8 characters long"));
      return;
    }
    setLoading(true);
    try {
      await verifyReset(email.trim().toLowerCase(), code.trim(), newPassword);
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || t("invalid_code_or_password", "Invalid code or password"));
    } finally {
      setLoading(false);
    }
  };

  const handleTokenReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!token || !tokenEmail) {
      setError(t("invalid_reset_link", "Invalid reset link"));
      return;
    }
    if (newPassword.length < 8) {
      setError(t("password_strength", "Password must be at least 8 characters long"));
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/reset/token", { email: tokenEmail, token, newPassword });
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || t("invalid_code_or_password", "Invalid code or password"));
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
          <p className="text-white/85 text-lg max-w-md leading-relaxed">
            {t(
              "reset_password_side_text",
              "Securely recover your account and continue preserving your Egyptian family archive.",
            )}
          </p>
        </div>
      </div>

      <div
        className={`flex-1 flex items-center justify-center p-6 sm:p-10 ${isDark ? "bg-[#071827]" : "bg-[#f7f2e8]"}`}
      >
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <div className="w-16 h-16 rounded-xl mb-4 shadow-lg bg-gradient-to-br from-[#d4a843]/20 to-[#c45c3e]/20 backdrop-blur-sm border-2 border-[#d4a843]/30 flex items-center justify-center p-3">
              <EgyptianLogoMark size={40} className="text-[#d4a843]" />
            </div>
            <h2 className="text-2xl font-bold font-cinzel">RootsEgypt</h2>
          </div>

          <h1
            className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-[#0f2742]"}`}
          >
            {token
              ? t("set_new_password", "Set New Password")
              : step === 1
                ? t("reset_password", "Reset Password")
                : t("verify_and_reset", "Verify & Reset")}
          </h1>
          <p
            className={`text-base mb-8 ${isDark ? "text-white/60" : "text-[#162238]/60"}`}
          >
            {token
              ? t(
                  "set_new_password_desc",
                  "Choose a new password for your account.",
                )
              : step === 1
                ? t(
                    "reset_step1_desc",
                    "Enter your email to request a reset code.",
                  )
                : t(
                    "reset_step2_desc",
                    "Use the approved code and set a new secure password.",
                  )}
          </p>

          {submitted && !token ? (
            <div
              className={`mt-6 rounded-2xl border-2 p-5 ${isDark ? "bg-white/5 border-white/10 text-white/80" : "bg-white border-[#e8e4dc] text-[#162238]/80"}`}
            >
              <p className="font-semibold mb-2">
                {t(
                  "reset_request_submitted",
                  "Password reset request submitted.",
                )}
              </p>
              <p className="text-sm leading-relaxed">
                {t(
                  "reset_request_submitted_desc",
                  "A super admin will review it. If approved, you will receive a 24-hour one-time code by email.",
                )}
              </p>
              <p
                className={`text-center text-sm pt-5 ${isDark ? "text-white/50" : "text-[#162238]/50"}`}
              >
                {t("back_to", "Back to")}{" "}
                <NavLink to="/login" className="text-[#24766f] font-bold">
                  {t("login", "Login")}
                </NavLink>
              </p>
            </div>
          ) : (
            <form
              className="space-y-5"
              onSubmit={
                token
                  ? handleTokenReset
                  : step === 1
                    ? handleRequest
                    : handleReset
              }
            >
              {!token && step === 1 && (
                <div>
                  <label className={labelCls}>{t("email", "Email")}</label>
                  <div className={inputCls}>
                    <Mail className="w-5 h-5 text-[#d9a441] shrink-0" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("email_placeholder", "example@email.com")}
                      className={inputTextCls}
                    />
                  </div>
                </div>
              )}

              {!token && step === 2 && (
                <div>
                  <label className={labelCls}>
                    {t("verification_code", "Verification Code")}
                  </label>
                  <div className={inputCls}>
                    <ShieldCheck className="w-5 h-5 text-[#d9a441] shrink-0" />
                    <input
                      type="text"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder={t("code_placeholder", "6-digit code")}
                      className={`${inputTextCls} tracking-widest`}
                    />
                  </div>
                </div>
              )}

              {(token || step === 2) && (
                <div>
                  <label className={labelCls}>
                    {t("new_password", "New Password")}
                  </label>
                  <div className={inputCls}>
                    <Lock className="w-5 h-5 text-[#d9a441] shrink-0" />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="********"
                      className={inputTextCls}
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                  <p className="text-red-500 text-sm text-center font-medium">
                    {error}
                  </p>
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
                ) : step === 1 && !token ? (
                  <>
                    <Send className="w-5 h-5" />
                    {t("send_code", "Send Code")}
                  </>
                ) : (
                  <>
                    <KeyRound className="w-5 h-5" />
                    {t("reset_password", "Reset Password")}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <p
                className={`text-center text-sm pt-2 ${isDark ? "text-white/50" : "text-[#162238]/50"}`}
              >
                {t("back_to", "Back to")}{" "}
                <NavLink
                  to="/login"
                  className="text-[#24766f] font-bold hover:text-[#d9a441] transition-colors"
                >
                  {t("login", "Login")}
                </NavLink>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
