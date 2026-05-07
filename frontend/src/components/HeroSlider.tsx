import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "../context/TranslationContext";
import {
  resolveSiteImageUrl,
  type SiteImageRecord,
} from "../hooks/useSiteImages";
import slider1 from "../photos/slider1.jpeg";
import slider2 from "../photos/slider2.jpeg";
import slider3 from "../photos/slider3.jpeg";

const EGYPT_DEFAULT_SLIDES: SiteImageRecord[] = [
  {
    id: -1,
    imagePath: slider1,
    title: "Egyptian Heritage",
    caption: "Discover the roots of Egyptian civilisation",
  },
  {
    id: -2,
    imagePath: slider2,
    title: "Sacred Sites",
    caption: "Temples and monuments along the Nile",
  },
  {
    id: -3,
    imagePath: slider3,
    title: "Living Heritage",
    caption: "Traditions passed through generations",
  },
];

interface HeroSliderProps {
  slides?: SiteImageRecord[];
  useDefaultFallback?: boolean;
  autoInterval?: number;
  showArrows?: boolean;
  showDots?: boolean;
  showCaptions?: boolean;
  className?: string;
}

export default function HeroSlider({
  slides,
  useDefaultFallback = true,
  autoInterval = 6000,
  showArrows = true,
  showDots = true,
  showCaptions = true,
  className = "",
}: HeroSliderProps) {
  const { t } = useTranslation();

  const effective: SiteImageRecord[] =
    slides && slides.length > 0
      ? slides
      : useDefaultFallback
        ? EGYPT_DEFAULT_SLIDES
        : [];

  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedRef = useRef(false);

  const count = effective.length;

  const goTo = (index: number) => {
    if (count < 2) return;
    setFading(true);
    setTimeout(() => {
      setCurrent(((index % count) + count) % count);
      setFading(false);
    }, 350);
  };

  const prev = () => {
    goTo(current - 1);
    resetTimer();
  };

  const next = () => {
    goTo(current + 1);
    resetTimer();
  };

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (count > 1) {
      timerRef.current = setInterval(() => {
        if (!pausedRef.current) {
          setCurrent((c) => (c + 1) % count);
        }
      }, autoInterval);
    }
  };

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [count, autoInterval]);

  if (!count) return null;

  const slide = effective[current];

  return (
    <div
      className={`absolute inset-0 ${className}`}
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
    >
      {/* Images — cross-fade */}
      {effective.map((s, i) => (
        <div
          key={s.id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current && !fading ? 1 : 0 }}
        >
          <img
            src={resolveSiteImageUrl(s.imagePath) || s.imagePath}
            alt={s.title || ""}
            className="w-full h-full object-cover"
            loading={i === 0 ? "eager" : "lazy"}
          />
        </div>
      ))}

      {/* Caption overlay — shown over the gradient */}
      {showCaptions && (slide.title || slide.caption) && (
        <div className="absolute bottom-24 left-0 right-0 px-6 pointer-events-none z-10">
          <div className="max-w-3xl mx-auto text-center">
            {slide.title && (
              <p className="text-[#d4a843] text-sm font-semibold uppercase tracking-[0.35em] mb-1 drop-shadow-lg">
                {slide.title}
              </p>
            )}
            {slide.caption && (
              <p className="text-white/80 text-base drop-shadow-md">
                {slide.caption}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Arrows */}
      {showArrows && count > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label={t("slider_prev", "Previous slide")}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/55 border border-white/20 flex items-center justify-center text-white transition backdrop-blur-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label={t("slider_next", "Next slide")}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/55 border border-white/20 flex items-center justify-center text-white transition backdrop-blur-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots */}
      {showDots && count > 1 && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-20">
          {effective.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                goTo(i);
                resetTimer();
              }}
              aria-label={t("slider_goto", `Go to slide ${i + 1}`)}
              className={`transition-all duration-300 rounded-full ${
                i === current
                  ? "w-6 h-2 bg-[#d4a843]"
                  : "w-2 h-2 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
