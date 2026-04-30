import { memo } from "react";

/** Eye of Horus — Egyptian heritage motif for RootsEgypt branding */
function EgyptianLogoMark({
  className = "",
  size = 40,
  title,
}: {
  className?: string;
  size?: number;
  title?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={`shrink-0 ${className}`}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : "presentation"}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d4a843" />
          <stop offset="50%" stopColor="#c45c3e" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
      </defs>
      {/* Eye of Horus — wedjat eye */}
      {/* Upper eyelid arc */}
      <path
        d="M6 22 Q14 10 24 12 Q34 10 42 22"
        fill="none"
        stroke="url(#logo-grad)"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      {/* Lower eyelid arc */}
      <path
        d="M10 24 Q17 32 24 30 Q31 32 38 24"
        fill="none"
        stroke="url(#logo-grad)"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      {/* Iris */}
      <circle cx="24" cy="21" r="5.5" fill="url(#logo-grad)" opacity={0.9} />
      {/* Pupil */}
      <circle cx="24" cy="21" r="2.5" fill="#0d1b2a" />
      {/* Pupil highlight */}
      <circle cx="25.2" cy="19.8" r="1" fill="#fff" opacity={0.7} />
      {/* Horus tear drop — the iconic descending line */}
      <path
        d="M20 28 Q18 34 16 40 Q18 38 22 34"
        fill="url(#logo-grad)"
        opacity={0.85}
      />
      {/* Horus spiral/curl */}
      <path
        d="M16 40 Q12 42 10 40 Q8 37 12 36"
        fill="none"
        stroke="url(#logo-grad)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default memo(EgyptianLogoMark);
