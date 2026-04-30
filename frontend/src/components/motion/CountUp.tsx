import { useRef, useEffect, useState } from "react";
import { useInView } from "framer-motion";

export default function CountUp({ end, duration = 2, prefix = "", suffix = "", className = "" }: { end: number; duration?: number; prefix?: string; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = Math.min((now - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      const current = Math.floor(eased * end);
      setValue(current);
      if (elapsed < 1) requestAnimationFrame(step);
      else setValue(end);
    };
    requestAnimationFrame(step);
  }, [isInView, end, duration]);

  return <span ref={ref} className={className}>{prefix}{value.toLocaleString()}{suffix}</span>;
}
