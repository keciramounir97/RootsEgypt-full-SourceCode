import { useState, useRef } from "react";
import { useThemeStore } from "../store/theme";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslation } from "../context/TranslationContext";
import { api } from "../api/client";
import RootsPageShell from "../components/RootsPageShell";
import ScrollReveal from "../components/motion/ScrollReveal";
import FloatingCard from "../components/motion/FloatingCard";
import MagneticButton from "../components/motion/MagneticButton";

/* ------------------------------------------------------------------ */
/*  Egyptian decorative SVG elements                                   */
/* ------------------------------------------------------------------ */

/** Lotus divider rendered as a pure-CSS / inline-SVG ornament */
function LotusDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <span
        className="block h-px flex-1 max-w-[120px]"
        style={{
          background:
            "linear-gradient(90deg, transparent, #d4a843 50%, transparent)",
        }}
      />
      {/* Lotus flower using a simple SVG */}
      <svg
        width="38"
        height="22"
        viewBox="0 0 38 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M19 2C17 8 12 14 6 18C10 16 15 15.5 19 20C23 15.5 28 16 32 18C26 14 21 8 19 2Z"
          fill="#d4a843"
          fillOpacity="0.6"
        />
        <path
          d="M19 6C18 10 15 14 11 17C14 16 17 16 19 19C21 16 24 16 27 17C23 14 20 10 19 6Z"
          fill="#d4a843"
          fillOpacity="0.85"
        />
      </svg>
      <span
        className="block h-px flex-1 max-w-[120px]"
        style={{
          background:
            "linear-gradient(90deg, transparent, #d4a843 50%, transparent)",
        }}
      />
    </div>
  );
}

/** Eye of Horus decorative watermark */
function EyeOfHorus({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M60 20C40 20 20 35 10 45C20 42 40 38 60 38C80 38 100 42 110 45C100 35 80 20 60 20Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        opacity="0.25"
      />
      <circle
        cx="60"
        cy="36"
        r="8"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        opacity="0.3"
      />
      <circle cx="60" cy="36" r="3" fill="currentColor" opacity="0.2" />
      <path
        d="M52 44C48 52 44 60 38 68"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        opacity="0.2"
      />
      <path
        d="M56 44C58 54 56 60 52 68"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        opacity="0.15"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Stagger animation variants for form fields                         */
/* ------------------------------------------------------------------ */
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
};

const fieldVariants = {
  hidden: { opacity: 0, y: 28, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function ContactUs() {
  const { theme } = useThemeStore();
  const { t } = useTranslation();
  const isDark = theme === "dark";

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });

  /* parallax on the hero background */
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", msg: "" });

    try {
      await api.post("/contact", {
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
      });
      setStatus({
        type: "success",
        msg: t("message_sent_success", "Message sent successfully!"),
      });
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      setStatus({
        type: "error",
        msg:
          err.response?.data?.message ||
          t("message_send_failed", "Failed to send message."),
      });
    } finally {
      setLoading(false);
    }
  };

  /* ---- theme-aware tokens ---- */
  const glassBg = isDark
    ? "rgba(13, 27, 42, 0.72)"
    : "rgba(255, 253, 247, 0.68)";
  const glassBorder = isDark
    ? "rgba(212, 168, 67, 0.22)"
    : "rgba(212, 168, 67, 0.35)";
  const inputBg = isDark
    ? "rgba(15, 23, 41, 0.65)"
    : "rgba(247, 243, 235, 0.7)";
  const inputBorder = isDark
    ? "rgba(212, 168, 67, 0.18)"
    : "rgba(12, 74, 110, 0.15)";
  const inputFocusBorder = isDark ? "#d4a843" : "#0c4a6e";
  const textPrimary = isDark ? "#f1f4f8" : "#0d1b2a";
  const textSecondary = isDark
    ? "rgba(241,244,248,0.7)"
    : "rgba(13,27,42,0.65)";
  const cardInfoBg = isDark
    ? "rgba(13, 27, 42, 0.8)"
    : "rgba(255, 253, 247, 0.82)";

  /* shared input class builder */
  const inputCls =
    "w-full px-4 py-3 rounded-xl outline-none transition-all duration-300 " +
    "placeholder:opacity-50 backdrop-blur-sm " +
    "focus:ring-2 focus:ring-offset-0";

  const contactItems = [
    {
      icon: Phone,
      label: t("call_us", "Call Us"),
      value: t("contact_phone_primary", "+20 2 XXX XXXX"),
      gradient: isDark
        ? "linear-gradient(135deg, rgba(13,148,136,0.15), rgba(12,74,110,0.25))"
        : "linear-gradient(135deg, rgba(13,148,136,0.08), rgba(12,74,110,0.12))",
      iconColor: "#0d9488",
    },
    {
      icon: Mail,
      label: t("email", "Email"),
      value: "contact@rootsegypt.org",
      gradient: isDark
        ? "linear-gradient(135deg, rgba(196,92,62,0.15), rgba(212,168,67,0.2))"
        : "linear-gradient(135deg, rgba(196,92,62,0.08), rgba(212,168,67,0.1))",
      iconColor: "#c45c3e",
    },
    {
      icon: MapPin,
      label: t("visit_us", "Visit Us"),
      value: t("location_opening_soon", "Location opening soon"),
      gradient: isDark
        ? "linear-gradient(135deg, rgba(90,124,58,0.15), rgba(92,133,112,0.2))"
        : "linear-gradient(135deg, rgba(90,124,58,0.08), rgba(92,133,112,0.1))",
      iconColor: "#5a7c3a",
    },
    {
      icon: Clock,
      label: t("opening_hours", "Opening Hours"),
      value: t(
        "contact_hours_week",
        "Sun\u2013Thu: 9:00\u201318:00 (Cairo time)",
      ),
      gradient: isDark
        ? "linear-gradient(135deg, rgba(212,168,67,0.15), rgba(201,168,138,0.2))"
        : "linear-gradient(135deg, rgba(212,168,67,0.08), rgba(201,168,138,0.1))",
      iconColor: "#d4a843",
    },
  ];

  return (
    <RootsPageShell
      hero={
        <div className="space-y-5">
          <h1 className="text-4xl md:text-5xl font-bold drop-shadow">
            {t("contact_us", "Contact Us")}
          </h1>
          <p className="max-w-3xl mx-auto text-lg opacity-90">
            {t(
              "contact_hero_para",
              "We\u2019re ready to assist you with your Egyptian genealogical research, archive queries, and story preservation. Drop us a line and our team will get back within 24 hours.",
            )}
          </p>
        </div>
      }
    >
      {/* Permanent Egyptian photo background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <img
          src="/assets/egypt-bg.jpeg"
          alt=""
          className="w-full h-full object-cover"
        />
        <div
          className={`absolute inset-0 ${
            isDark ? "bg-[#060e1c]/88" : "bg-[#f5f1e8]/85"
          }`}
        />
      </div>
      {/* ==============================================================
          SECTION 1 -- Full-bleed Egyptian background + glassmorphism form
          ============================================================== */}
      <section
        ref={heroRef}
        className="relative overflow-hidden rounded-2xl mx-1 sm:mx-2 lg:mx-4"
        style={{ minHeight: "max(680px, 75vh)" }}
      >
        {/* --- Parallax Egyptian-art background --- */}
        <motion.div
          className="absolute inset-0 -top-[15%] -bottom-[15%] pointer-events-none"
          style={{ y: bgY }}
        >
          {/* Multi-layer gradient evoking desert sand, Nile blue, gold leaf */}
          <div
            className="absolute inset-0"
            style={{
              background: isDark
                ? `
                    linear-gradient(170deg,
                      #0a0e1a 0%,
                      rgba(13,27,42,0.97) 15%,
                      rgba(30,42,74,0.92) 35%,
                      rgba(15,23,41,0.95) 60%,
                      rgba(6,14,28,0.98) 100%),
                    radial-gradient(ellipse 60% 50% at 25% 20%,
                      rgba(212,168,67,0.12) 0%, transparent 60%),
                    radial-gradient(ellipse 55% 45% at 80% 75%,
                      rgba(13,148,136,0.08) 0%, transparent 55%)
                  `
                : `
                    linear-gradient(170deg,
                      #f5f0e8 0%,
                      rgba(244,228,193,0.85) 18%,
                      rgba(232,220,200,0.78) 35%,
                      rgba(201,168,138,0.45) 55%,
                      rgba(245,240,232,0.9) 100%),
                    radial-gradient(ellipse 55% 45% at 20% 25%,
                      rgba(212,168,67,0.18) 0%, transparent 55%),
                    radial-gradient(ellipse 50% 40% at 80% 70%,
                      rgba(12,74,110,0.08) 0%, transparent 50%)
                  `,
            }}
          />

          {/* Hieroglyphic-inspired repeating pattern using CSS */}
          <div
            className="absolute inset-0"
            style={{
              opacity: isDark ? 0.04 : 0.06,
              backgroundImage: `
                repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 58px,
                  ${isDark ? "rgba(212,168,67,0.5)" : "rgba(12,74,110,0.3)"} 58px,
                  transparent 59px
                ),
                repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 58px,
                  ${isDark ? "rgba(212,168,67,0.5)" : "rgba(12,74,110,0.3)"} 58px,
                  transparent 59px
                ),
                repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 28px,
                  ${isDark ? "rgba(212,168,67,0.25)" : "rgba(12,74,110,0.15)"} 28px,
                  transparent 29px
                )
              `,
              backgroundSize: "60px 60px, 60px 60px, 40px 40px",
            }}
          />

          {/* Scattered Egyptian dot/circle pattern */}
          <div
            className="absolute inset-0"
            style={{
              opacity: isDark ? 0.035 : 0.05,
              backgroundImage: `
                radial-gradient(circle 3px at 15px 15px, ${isDark ? "#d4a843" : "#0c4a6e"} 1.5px, transparent 1.5px),
                radial-gradient(circle 2px at 45px 35px, ${isDark ? "#d4a843" : "#0c4a6e"} 1px, transparent 1px),
                radial-gradient(circle 2.5px at 30px 50px, ${isDark ? "#d4a843" : "#0c4a6e"} 1.2px, transparent 1.2px)
              `,
              backgroundSize: "60px 60px",
            }}
          />

          {/* Gold edge vignette */}
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 100% 100% at 50% 50%,
                  transparent 45%,
                  ${isDark ? "rgba(10,14,26,0.7)" : "rgba(245,240,232,0.5)"} 100%)
              `,
            }}
          />
        </motion.div>

        {/* Eye of Horus decorative watermarks */}
        <EyeOfHorus
          className="absolute top-8 right-8 w-28 h-20 opacity-[0.06] pointer-events-none"
          style={{} as any}
        />
        <EyeOfHorus
          className="absolute bottom-12 left-6 w-24 h-16 opacity-[0.04] pointer-events-none rotate-12"
          style={{} as any}
        />

        {/* Ankh decorative elements */}
        <div
          className="absolute top-16 left-12 pointer-events-none select-none"
          style={{
            fontSize: "4rem",
            opacity: isDark ? 0.04 : 0.06,
            color: "#d4a843",
            transform: "rotate(-15deg)",
          }}
          aria-hidden="true"
        >
          &#9765;
        </div>
        <div
          className="absolute bottom-20 right-16 pointer-events-none select-none"
          style={{
            fontSize: "3.2rem",
            opacity: isDark ? 0.035 : 0.05,
            color: "#d4a843",
            transform: "rotate(10deg)",
          }}
          aria-hidden="true"
        >
          &#9765;
        </div>

        {/* --- Content overlay --- */}
        <div className="relative z-10 flex items-center justify-center py-16 sm:py-20 lg:py-24 px-4">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-xl"
          >
            {/* Glassmorphism form card */}
            <div
              className="relative rounded-3xl p-8 sm:p-10"
              style={{
                background: glassBg,
                backdropFilter: "blur(24px) saturate(1.3)",
                WebkitBackdropFilter: "blur(24px) saturate(1.3)",
                border: `1px solid ${glassBorder}`,
                boxShadow: isDark
                  ? "0 24px 80px rgba(0,0,0,0.5), 0 1px 0 rgba(212,168,67,0.1) inset"
                  : "0 24px 80px rgba(12,74,110,0.08), 0 1px 0 rgba(255,255,255,0.7) inset",
              }}
            >
              {/* Gold accent line at top */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full"
                style={{
                  width: "60%",
                  background:
                    "linear-gradient(90deg, transparent, #d4a843, transparent)",
                }}
              />

              <div className="text-center mb-8">
                <h2
                  className="text-2xl sm:text-3xl font-bold font-cinzel tracking-wide"
                  style={{ color: textPrimary }}
                >
                  {t("send_us_message", "Send us a Message")}
                </h2>
                <LotusDivider className="mt-4 mb-2" />
                <p
                  className="text-sm mt-3 leading-relaxed"
                  style={{ color: textSecondary }}
                >
                  {t(
                    "contact_form_subtitle",
                    "Share your inquiry and we will respond within 24 hours",
                  )}
                </p>
              </div>

              {/* Status message */}
              {status.msg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl mb-6 flex items-center gap-3 text-sm ${
                    status.type === "success"
                      ? "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400"
                      : "bg-rose-500/10 text-rose-500 dark:text-rose-400"
                  }`}
                  style={{
                    border: `1px solid ${
                      status.type === "success"
                        ? "rgba(16,185,129,0.2)"
                        : "rgba(244,63,94,0.2)"
                    }`,
                  }}
                >
                  {status.type === "success" ? (
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 shrink-0" />
                  )}
                  <span>{status.msg}</span>
                </motion.div>
              )}

              {/* Form with staggered field entrance */}
              <motion.form
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-5"
                onSubmit={handleSubmit}
              >
                {/* Name */}
                <motion.div variants={fieldVariants} className="space-y-1.5">
                  <label
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: textSecondary }}
                  >
                    {t("full_name", "Full Name")}
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={t("full_name_placeholder", "Your name")}
                    className={inputCls}
                    style={{
                      background: inputBg,
                      border: `1px solid ${inputBorder}`,
                      color: textPrimary,
                      boxShadow: isDark
                        ? "inset 2px 2px 6px rgba(0,0,0,0.25), inset -1px -1px 4px rgba(255,255,255,0.02)"
                        : "inset 2px 2px 6px rgba(24,32,48,0.06), inset -1px -1px 4px rgba(255,255,255,0.6)",
                      // focus styles handled via Tailwind ring + custom override
                      ["--tw-ring-color" as any]: inputFocusBorder,
                    }}
                  />
                </motion.div>

                {/* Email */}
                <motion.div variants={fieldVariants} className="space-y-1.5">
                  <label
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: textSecondary }}
                  >
                    {t("email", "Email")}
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder={t(
                      "email_placeholder_example",
                      "example@email.com",
                    )}
                    className={inputCls}
                    style={{
                      background: inputBg,
                      border: `1px solid ${inputBorder}`,
                      color: textPrimary,
                      boxShadow: isDark
                        ? "inset 2px 2px 6px rgba(0,0,0,0.25), inset -1px -1px 4px rgba(255,255,255,0.02)"
                        : "inset 2px 2px 6px rgba(24,32,48,0.06), inset -1px -1px 4px rgba(255,255,255,0.6)",
                      ["--tw-ring-color" as any]: inputFocusBorder,
                    }}
                  />
                </motion.div>

                {/* Subject */}
                <motion.div variants={fieldVariants} className="space-y-1.5">
                  <label
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: textSecondary }}
                  >
                    {t("subject", "Subject")}
                  </label>
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={(e) =>
                      setForm({ ...form, subject: e.target.value })
                    }
                    placeholder={t(
                      "subject_placeholder",
                      "What is this about?",
                    )}
                    className={inputCls}
                    style={{
                      background: inputBg,
                      border: `1px solid ${inputBorder}`,
                      color: textPrimary,
                      boxShadow: isDark
                        ? "inset 2px 2px 6px rgba(0,0,0,0.25), inset -1px -1px 4px rgba(255,255,255,0.02)"
                        : "inset 2px 2px 6px rgba(24,32,48,0.06), inset -1px -1px 4px rgba(255,255,255,0.6)",
                      ["--tw-ring-color" as any]: inputFocusBorder,
                    }}
                  />
                </motion.div>

                {/* Message */}
                <motion.div variants={fieldVariants} className="space-y-1.5">
                  <label
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: textSecondary }}
                  >
                    {t("your_message", "Your Message")}
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    placeholder={t(
                      "message_placeholder",
                      "How can we help you?",
                    )}
                    className={`${inputCls} resize-none`}
                    style={{
                      background: inputBg,
                      border: `1px solid ${inputBorder}`,
                      color: textPrimary,
                      boxShadow: isDark
                        ? "inset 2px 2px 6px rgba(0,0,0,0.25), inset -1px -1px 4px rgba(255,255,255,0.02)"
                        : "inset 2px 2px 6px rgba(24,32,48,0.06), inset -1px -1px 4px rgba(255,255,255,0.6)",
                      ["--tw-ring-color" as any]: inputFocusBorder,
                    }}
                  />
                </motion.div>

                {/* Submit button */}
                <motion.div variants={fieldVariants} className="pt-2">
                  <MagneticButton
                    type="submit"
                    disabled={loading}
                    className="interactive-btn btn-neu btn-neu--primary w-full py-3.5 px-6 flex items-center justify-center gap-2.5 disabled:opacity-50 rounded-xl text-white font-cinzel tracking-wider"
                    strength={0.15}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{
                            repeat: Infinity,
                            duration: 1,
                            ease: "linear",
                          }}
                          className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        />
                        {t("sending", "Sending...")}
                      </span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        {t("send_message", "Send Message")}
                      </>
                    )}
                  </MagneticButton>
                </motion.div>
              </motion.form>

              {/* Bottom gold accent */}
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full"
                style={{
                  width: "40%",
                  background:
                    "linear-gradient(90deg, transparent, #d4a843 50%, transparent)",
                }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==============================================================
          SECTION 2 -- Contact info cards with FloatingCard animation
          ============================================================== */}
      <section className="roots-section py-10 sm:py-14">
        <ScrollReveal direction="up" distance={40}>
          <div className="text-center mb-10">
            <h2
              className="text-3xl sm:text-4xl font-bold font-cinzel tracking-wide"
              style={{ color: isDark ? "#e8c96a" : "#0c4a6e" }}
            >
              {t("get_in_touch", "Get in Touch")}
            </h2>
            <LotusDivider className="mt-5 mb-3" />
            <p
              className="mt-3 max-w-lg mx-auto text-base leading-relaxed"
              style={{ color: textSecondary }}
            >
              {t(
                "contact_reach_out",
                "Reach out through any of the channels below. We are here to help with your genealogical journey.",
              )}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 max-w-6xl mx-auto">
          {contactItems.map((item, idx) => (
            <ScrollReveal
              key={item.label}
              direction="up"
              delay={idx * 0.12}
              distance={36}
            >
              <FloatingCard intensity={6} className="h-full">
                <div
                  className="relative h-full rounded-2xl p-6 text-center transition-shadow duration-300 hover:shadow-xl"
                  style={{
                    background: cardInfoBg,
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    border: `1px solid ${glassBorder}`,
                    boxShadow: isDark
                      ? "0 8px 32px rgba(0,0,0,0.3)"
                      : "0 8px 32px rgba(12,74,110,0.06)",
                  }}
                >
                  {/* Icon circle */}
                  <div
                    className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{
                      background: item.gradient,
                      border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"}`,
                    }}
                  >
                    <item.icon
                      className="w-6 h-6"
                      style={{ color: item.iconColor }}
                    />
                  </div>
                  <h3
                    className="text-base font-bold font-cinzel tracking-wide mb-1.5"
                    style={{ color: textPrimary }}
                  >
                    {item.label}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: textSecondary }}
                  >
                    {item.value}
                  </p>

                  {/* Subtle gold top border accent */}
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 h-[1.5px] rounded-full"
                    style={{
                      width: "50%",
                      background:
                        "linear-gradient(90deg, transparent, #d4a843 50%, transparent)",
                      opacity: 0.5,
                    }}
                  />
                </div>
              </FloatingCard>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ==============================================================
          SECTION 3 -- Social media / additional links
          ============================================================== */}
      <ScrollReveal direction="up" distance={30}>
        <section
          className="roots-section roots-section-alt rounded-2xl mx-1 sm:mx-2 lg:mx-4 overflow-hidden"
          style={{ position: "relative" }}
        >
          {/* Background pattern overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: isDark ? 0.025 : 0.04,
              backgroundImage: `
                radial-gradient(circle 2px at 20px 20px, ${isDark ? "#d4a843" : "#0c4a6e"} 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative z-10 text-center py-10 sm:py-14">
            <h2
              className="text-2xl sm:text-3xl font-bold font-cinzel tracking-wide mb-3"
              style={{ color: isDark ? "#e8c96a" : "#0c4a6e" }}
            >
              {t("connect_with_us", "Connect With Us")}
            </h2>
            <LotusDivider className="mb-6" />
            <p
              className="max-w-md mx-auto mb-8 text-base leading-relaxed"
              style={{ color: textSecondary }}
            >
              {t(
                "social_description",
                "Follow us on social media to stay updated with the latest discoveries and community stories.",
              )}
            </p>

            {/* Social icons row */}
            <div className="flex items-center justify-center gap-4 sm:gap-5">
              {[
                {
                  label: "Facebook",
                  href: "#",
                  svg: (
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                  ),
                },
                {
                  label: "Twitter / X",
                  href: "#",
                  svg: (
                    <path d="M4 4l6.5 8L4 20h2l5.2-6.4L15 20h5l-6.8-8.4L20 4h-2l-5 6.2L9 4H4z" />
                  ),
                },
                {
                  label: "Instagram",
                  href: "#",
                  svg: (
                    <>
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </>
                  ),
                },
                {
                  label: "YouTube",
                  href: "#",
                  svg: (
                    <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33zM9.75 15.02V8.48l5.75 3.27-5.75 3.27z" />
                  ),
                },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="group relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  style={{
                    background: isDark
                      ? "rgba(15,23,41,0.6)"
                      : "rgba(247,243,235,0.8)",
                    border: `1px solid ${isDark ? "rgba(212,168,67,0.15)" : "rgba(12,74,110,0.1)"}`,
                    boxShadow: isDark
                      ? "0 4px 16px rgba(0,0,0,0.3)"
                      : "0 4px 16px rgba(12,74,110,0.06)",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-colors duration-300"
                    style={{
                      color: isDark
                        ? "rgba(212,168,67,0.7)"
                        : "rgba(12,74,110,0.6)",
                    }}
                  >
                    {social.svg}
                  </svg>
                  {/* Hover gold ring */}
                  <span
                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      boxShadow: "0 0 0 2px rgba(212,168,67,0.4)",
                    }}
                  />
                </a>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ==============================================================
          SECTION 4 -- Location placeholder
          ============================================================== */}
      <ScrollReveal direction="up" distance={30}>
        <section className="roots-section">
          <div className="text-center mb-8">
            <h2
              className="text-2xl sm:text-3xl font-bold font-cinzel tracking-wide"
              style={{ color: isDark ? "#e8c96a" : "#0c4a6e" }}
            >
              {t("our_location", "Our Location")}
            </h2>
            <LotusDivider className="mt-4" />
          </div>

          <div
            className="rounded-2xl min-h-[220px] flex flex-col items-center justify-center gap-4 p-8"
            style={{
              background: isDark
                ? "rgba(13,27,42,0.6)"
                : "rgba(247,243,235,0.7)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: `1px solid ${glassBorder}`,
              boxShadow: isDark
                ? "0 12px 40px rgba(0,0,0,0.3)"
                : "0 12px 40px rgba(12,74,110,0.06)",
            }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-2"
              style={{
                background: isDark
                  ? "rgba(13,148,136,0.12)"
                  : "rgba(13,148,136,0.08)",
                border: `1px solid ${isDark ? "rgba(13,148,136,0.2)" : "rgba(13,148,136,0.15)"}`,
              }}
            >
              <MapPin className="w-7 h-7" style={{ color: "#0d9488" }} />
            </div>
            <p
              className="text-lg font-bold font-cinzel"
              style={{ color: textPrimary, opacity: 0.8 }}
            >
              {t("location_opening_soon", "Location opening soon")}
            </p>
            <p className="text-sm" style={{ color: textSecondary }}>
              {t("stay_tuned", "Stay tuned for our grand opening!")}
            </p>
          </div>
        </section>
      </ScrollReveal>
    </RootsPageShell>
  );
}
