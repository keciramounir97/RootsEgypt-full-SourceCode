import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { api } from "../../api/client";

interface LikeButtonProps {
  targetType: string;
  targetId: string;
  initialLiked?: boolean;
  initialCount?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  className?: string;
}

export default function LikeButton({
  targetType,
  targetId,
  initialLiked = false,
  initialCount = 0,
  size = "md",
  showCount = true,
  className = "",
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [animKey, setAnimKey] = useState(0);

  const iconSize = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5";
  const btnPad = size === "sm" ? "p-1.5" : size === "lg" ? "p-3" : "p-2";

  const toggle = useCallback(async () => {
    // Optimistic update
    const wasLiked = liked;
    setLiked(!wasLiked);
    setCount((c) => (wasLiked ? Math.max(0, c - 1) : c + 1));
    setAnimKey((k) => k + 1);

    try {
      await api.post(`/social/${targetType}/${targetId}/like`);
    } catch {
      // Revert on failure
      setLiked(wasLiked);
      setCount((c) => (wasLiked ? c + 1 : Math.max(0, c - 1)));
    }
  }, [liked, targetType, targetId]);

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={toggle}
        className={`${btnPad} rounded-full transition-colors ${
          liked
            ? "text-pink-500 hover:bg-pink-500/10"
            : "opacity-60 hover:opacity-100 hover:bg-pink-500/10"
        }`}
        aria-label={liked ? "Unlike" : "Like"}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={animKey}
            initial={liked ? { scale: 0.5 } : { scale: 1 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            <Heart
              className={`${iconSize} transition-all ${
                liked ? "fill-current text-pink-500" : ""
              }`}
            />
          </motion.div>
        </AnimatePresence>
      </motion.button>
      {showCount && count > 0 && (
        <motion.span
          key={count}
          initial={{ y: liked ? 10 : -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-xs font-medium tabular-nums"
        >
          {count}
        </motion.span>
      )}
    </div>
  );
}
