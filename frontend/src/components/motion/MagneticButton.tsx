import React, { useRef, useState, ReactNode } from "react";
import { motion } from "framer-motion";

export default function MagneticButton({ children, className = "", strength = 0.3, ...props }: { children: ReactNode; className?: string; strength?: number; } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "ref">) {
  const ref = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * strength;
    const y = (e.clientY - rect.top - rect.height / 2) * strength;
    setPos({ x, y });
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 250, damping: 15, mass: 0.5 }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
}
