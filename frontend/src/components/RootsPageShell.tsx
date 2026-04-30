import { memo, ReactNode } from "react";

interface RootsPageShellProps {
  hero?: ReactNode;
  heroClassName?: string;
  children: ReactNode;
  className?: string;
  /** Extra classes on the main content stack (vertical rhythm uses --section-gap). */
  sectionsClassName?: string;
  /** When true, stack uses CSS grid with equal-height rows (safe only for uniform section blocks). */
  equalHeightSections?: boolean;
}

function RootsPageShell({
  hero,
  heroClassName = "",
  children,
  className = "",
  sectionsClassName = "",
  equalHeightSections = false,
}: RootsPageShellProps) {
  const stackClass = [
    "heritage-sections-stack",
    "w-full",
    "max-w-full",
    equalHeightSections ? "heritage-sections-stack--equal-rows" : "",
    sectionsClassName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`roots-shell roots-shell--decorated page-container w-full mx-auto ${className}`}>
      {hero ? (
        <section className={`heritage-hero text-center ${heroClassName}`}>
          {hero}
        </section>
      ) : null}
      <div className={stackClass}>{children}</div>
    </div>
  );
}

export default memo(RootsPageShell);
