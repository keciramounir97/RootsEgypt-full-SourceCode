import { useRef, ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
  duration?: number;
  stagger?: number;
  once?: boolean;
}

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  distance = 60,
  duration = 0.9,
  stagger = 0,
  once = true,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const getFrom = () => {
    switch (direction) {
      case "down": return { y: -distance, opacity: 0 };
      case "left": return { x: distance, opacity: 0 };
      case "right": return { x: -distance, opacity: 0 };
      default: return { y: distance, opacity: 0 };
    }
  };

  const getTo = () => {
    switch (direction) {
      case "down":
      case "up": return { y: 0, opacity: 1, duration, delay, stagger, ease: "power3.out" };
      default: return { x: 0, opacity: 1, duration, delay, stagger, ease: "power3.out" };
    }
  };

  useGSAP(() => {
    if (!ref.current) return;
    const targets = stagger ? ref.current.children : ref.current;
    gsap.fromTo(targets, getFrom(), {
      ...getTo(),
      scrollTrigger: {
        trigger: ref.current,
        start: "top 88%",
        toggleActions: once ? "play none none none" : "play none none reverse",
      },
    });
  }, { scope: ref });

  return <div ref={ref} className={className}>{children}</div>;
}
