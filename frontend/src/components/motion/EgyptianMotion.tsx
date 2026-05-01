/**
 * EgyptianMotion — Reusable Egyptian-themed animation components
 * Uses Framer Motion + GSAP for immersive pharaonic effects
 */
import { useRef, ReactNode } from "react";
import { motion, useInView } from "framer-motion";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ── Egyptian color palette ── */
export const EGYPT_COLORS = {
  gold: "#d4a843",
  goldLight: "#f0d78c",
  terracotta: "#c45c3e",
  nile: "#0d9488",
  nileDeep: "#0c4a6e",
  papyrus: "#f5f1e8",
  sand: "#e8d5b7",
  obsidian: "#060e1c",
  lapis: "#1e3a5f",
  lotus: "#e8a0bf",
  scarab: "#2d6a4f",
} as const;

/* ── Shared easing curves ── */
export const EGYPT_EASE = {
  pharaoh: [0.22, 1, 0.36, 1] as [number, number, number, number],
  sand: [0.4, 0, 0.2, 1] as [number, number, number, number],
  nile: [0.65, 0, 0.35, 1] as [number, number, number, number],
};

/* ═══════════════════════════════════════════════════════════════════
   HieroglyphicBorder — Animated SVG border with Egyptian motifs
   ═══════════════════════════════════════════════════════════════════ */
export function HieroglyphicBorder({
  position = "top",
  color = EGYPT_COLORS.gold,
  className = "",
}: {
  position?: "top" | "bottom" | "left" | "right";
  color?: string;
  className?: string;
}) {
  const isHorizontal = position === "top" || position === "bottom";
  const symbols = ["𓂀", "𓁹", "𓃭", "𓆣", "𓇋", "𓈖", "𓉐", "𓊝", "𓋴", "𓌙"];
  const repeat = isHorizontal ? 14 : 6;

  return (
    <motion.div
      className={`flex ${isHorizontal ? "flex-row justify-center" : "flex-col items-center"} gap-3 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.25 }}
      transition={{ duration: 1.5, delay: 0.3 }}
    >
      {Array.from({ length: repeat }).map((_, i) => (
        <motion.span
          key={i}
          className="text-sm select-none"
          style={{ color }}
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{
            duration: 3 + (i % 2),
            repeat: Infinity,
            delay: i * 0.2,
          }}
        >
          {symbols[i % symbols.length]}
        </motion.span>
      ))}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ScarabLoader — Animated scarab beetle loading spinner
   ═══════════════════════════════════════════════════════════════════ */
export function ScarabLoader({
  size = 48,
  color = EGYPT_COLORS.gold,
}: {
  size?: number;
  color?: string;
}) {
  return (
    <motion.div
      className="flex items-center justify-center"
      animate={{ rotate: 360 }}
      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
    >
      <svg width={size} height={size} viewBox="0 0 64 64">
        {/* Scarab body */}
        <ellipse cx="32" cy="32" rx="12" ry="16" fill={color} opacity="0.8" />
        <ellipse cx="32" cy="32" rx="8" ry="12" fill={color} opacity="0.5" />
        {/* Wings */}
        <path d="M20 28 Q8 20 4 28 Q8 36 20 32" fill={color} opacity="0.4" />
        <path d="M44 28 Q56 20 60 28 Q56 36 44 32" fill={color} opacity="0.4" />
        {/* Head */}
        <circle cx="32" cy="18" r="5" fill={color} opacity="0.7" />
      </svg>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   EyeOfHorus — Animated Eye of Horus SVG
   ═══════════════════════════════════════════════════════════════════ */
export function EyeOfHorus({
  className = "",
  size = 120,
  color = EGYPT_COLORS.gold,
}: {
  className?: string;
  size?: number;
  color?: string;
}) {
  return (
    <motion.svg
      viewBox="0 0 200 120"
      width={size}
      className={className}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: EGYPT_EASE.pharaoh }}
    >
      {/* Eye outline */}
      <path
        d="M20 60 Q60 20 100 60 Q140 100 180 60"
        fill="none"
        stroke={color}
        strokeWidth="3"
      />
      {/* Iris */}
      <motion.circle
        cx="100"
        cy="60"
        r="15"
        fill={color}
        opacity="0.3"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      />
      {/* Pupil */}
      <motion.circle
        cx="100"
        cy="60"
        r="6"
        fill={color}
        opacity="0.7"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.2, duration: 0.3 }}
      />
      {/* Lower curve (Horus tear) */}
      <path
        d="M100 75 Q100 100 85 110"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
      />
    </motion.svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PyramidReveal — GSAP-powered pyramid section reveal
   ═══════════════════════════════════════════════════════════════════ */
export function PyramidReveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      const el = ref.current;
      gsap.fromTo(
        el,
        { clipPath: "polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)", opacity: 0 },
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          opacity: 1,
          duration: 1.2,
          ease: "power3.inOut",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      );
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PapyrusCard — Egyptian-styled card with hover effects
   ═══════════════════════════════════════════════════════════════════ */
export function PapyrusCard({
  children,
  className = "",
  hover = true,
  isDark = false,
  accent = EGYPT_COLORS.gold,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  isDark?: boolean;
  accent?: string;
}) {
  const bg = isDark ? "bg-[#0f1b30]/80" : "bg-white/90";
  const border = isDark ? "border-white/10" : "border-[#d8c7b0]/60";

  return (
    <motion.div
      className={`relative rounded-xl ${bg} backdrop-blur-md border ${border} overflow-hidden ${className}`}
      whileHover={
        hover
          ? {
              y: -4,
              boxShadow: `0 12px 40px -8px ${accent}33, 0 0 0 1px ${accent}22`,
              borderColor: `${accent}44`,
            }
          : undefined
      }
      transition={{ duration: 0.3, ease: EGYPT_EASE.sand }}
    >
      {/* Top accent line */}
      <div
        className="h-[2px] w-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
        }}
      />
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   NileWave — Animated Nile river wave SVG
   ═══════════════════════════════════════════════════════════════════ */
export function NileWave({
  className = "",
  color = EGYPT_COLORS.nile,
}: {
  className?: string;
  color?: string;
}) {
  return (
    <div
      className={`absolute bottom-0 left-0 w-full overflow-hidden ${className}`}
      style={{ height: 80 }}
    >
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <motion.path
          d="M0 40 C240 10, 480 70, 720 40 C960 10, 1200 70, 1440 40 L1440 80 L0 80 Z"
          fill={color}
          opacity="0.08"
          initial={{
            d: "M0 40 C240 10, 480 70, 720 40 C960 10, 1200 70, 1440 40 L1440 80 L0 80 Z",
          }}
          animate={{
            d: [
              "M0 40 C240 10, 480 70, 720 40 C960 10, 1200 70, 1440 40 L1440 80 L0 80 Z",
              "M0 50 C240 20, 480 60, 720 50 C960 20, 1200 60, 1440 50 L1440 80 L0 80 Z",
              "M0 40 C240 10, 480 70, 720 40 C960 10, 1200 70, 1440 40 L1440 80 L0 80 Z",
            ],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M0 50 C240 25, 480 65, 720 50 C960 25, 1200 65, 1440 50 L1440 80 L0 80 Z"
          fill={color}
          opacity="0.05"
          animate={{
            d: [
              "M0 50 C240 25, 480 65, 720 50 C960 25, 1200 65, 1440 50 L1440 80 L0 80 Z",
              "M0 45 C240 15, 480 75, 720 45 C960 15, 1200 75, 1440 45 L1440 80 L0 80 Z",
              "M0 50 C240 25, 480 65, 720 50 C960 25, 1200 65, 1440 50 L1440 80 L0 80 Z",
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SandParticleField — GSAP-driven floating sand particles
   ═══════════════════════════════════════════════════════════════════ */
export function SandParticleField({
  count = 25,
  color = EGYPT_COLORS.gold,
  className = "",
}: {
  count?: number;
  color?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      const particles = ref.current.children;
      gsap.to(particles, {
        y: "random(-40, 40)",
        x: "random(-20, 20)",
        opacity: "random(0.1, 0.4)",
        duration: "random(3, 6)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: { each: 0.15, from: "random" },
      });
    },
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${2 + (i % 3)}px`,
            height: `${2 + (i % 3)}px`,
            backgroundColor: color,
            left: `${(i * 4.1) % 96}%`,
            top: `${(i * 7.3) % 90}%`,
            opacity: 0.15,
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   EgyptianButton — Styled button with Egyptian hover effect
   ═══════════════════════════════════════════════════════════════════ */
export function EgyptianButton({
  children,
  className = "",
  variant = "gold",
  isDark = false,
  onClick,
  disabled = false,
  type = "button",
}: {
  children: ReactNode;
  className?: string;
  variant?: "gold" | "terracotta" | "nile";
  isDark?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}) {
  const colors = {
    gold: {
      bg: `linear-gradient(135deg, ${EGYPT_COLORS.gold}, ${EGYPT_COLORS.goldLight})`,
      text: "#1a1a1a",
    },
    terracotta: {
      bg: `linear-gradient(135deg, ${EGYPT_COLORS.terracotta}, #d4785e)`,
      text: "#fff",
    },
    nile: {
      bg: `linear-gradient(135deg, ${EGYPT_COLORS.nile}, ${EGYPT_COLORS.nileDeep})`,
      text: "#fff",
    },
  };
  const c = colors[variant];

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`relative px-6 py-3 rounded-lg font-semibold overflow-hidden ${className}`}
      style={{ background: c.bg, color: c.text }}
      whileHover={
        !disabled
          ? { scale: 1.03, boxShadow: `0 8px 30px -6px ${EGYPT_COLORS.gold}55` }
          : undefined
      }
      whileTap={!disabled ? { scale: 0.97 } : undefined}
      transition={{ duration: 0.2, ease: EGYPT_EASE.sand }}
    >
      {/* Shimmer overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)`,
        }}
        animate={{ x: ["-100%", "200%"] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatDelay: 4,
          ease: "linear",
        }}
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SectionHeader — Egyptian-themed section heading with ornaments
   ═══════════════════════════════════════════════════════════════════ */
export function SectionHeader({
  title,
  subtitle,
  isDark = false,
  className = "",
  icon,
}: {
  title: string;
  subtitle?: string;
  isDark?: boolean;
  className?: string;
  icon?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref} className={`text-center mb-10 ${className}`}>
      <motion.div
        className="flex items-center justify-center gap-3 mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.6, ease: EGYPT_EASE.pharaoh }}
      >
        {/* Left ornament */}
        <motion.div
          className={`h-[1px] w-12 ${isDark ? "bg-[#d4a843]/40" : "bg-[#c45c3e]/30"}`}
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : undefined}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
        {icon && (
          <span className={isDark ? "text-[#d4a843]" : "text-[#c45c3e]"}>
            {icon}
          </span>
        )}
        <motion.div
          className={`h-[1px] w-12 ${isDark ? "bg-[#d4a843]/40" : "bg-[#c45c3e]/30"}`}
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : undefined}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
      </motion.div>
      <motion.h2
        className={`text-3xl md:text-4xl font-bold ${isDark ? "text-[#d4a843]" : "text-[#0c4a6e]"}`}
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.6, delay: 0.15, ease: EGYPT_EASE.pharaoh }}
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          className={`mt-2 text-lg ${isDark ? "text-white/50" : "text-[#5a4a3a]/70"}`}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : undefined}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
