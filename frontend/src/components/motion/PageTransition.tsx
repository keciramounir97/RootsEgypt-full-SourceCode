import { motion } from "framer-motion";
import { ReactNode } from "react";

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];
const variants = {
  initial: { opacity: 0, y: 24 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.3 } },
};

export default function PageTransition({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={variants} initial="initial" animate="enter" exit="exit" className={className}>
      {children}
    </motion.div>
  );
}
