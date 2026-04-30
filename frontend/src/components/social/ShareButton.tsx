import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Copy, Check, X } from "lucide-react";
import { api } from "../../api/client";
import { useThemeStore } from "../../store/theme";

interface ShareButtonProps {
  targetType: string;
  targetId: string;
  title: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const PLATFORMS = [
  {
    id: "facebook",
    label: "Facebook",
    color: "bg-[#1877F2]",
    getUrl: (url: string, _title: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: "twitter",
    label: "X / Twitter",
    color: "bg-black dark:bg-white dark:text-black",
    getUrl: (url: string, title: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    color: "bg-[#25D366]",
    getUrl: (url: string, title: string) =>
      `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
  },
  {
    id: "telegram",
    label: "Telegram",
    color: "bg-[#0088cc]",
    getUrl: (url: string, title: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
];

export default function ShareButton({
  targetType,
  targetId,
  title,
  size = "md",
  className = "",
}: ShareButtonProps) {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const iconSize = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5";
  const btnPad = size === "sm" ? "p-1.5" : size === "lg" ? "p-3" : "p-2";

  const shareUrl = `${window.location.origin}/${targetType}`;

  const trackShare = useCallback(
    async (platform: string) => {
      try {
        await api.post(`/social/${targetType}/${targetId}/share`, { platform });
      } catch {
        // silent
      }
    },
    [targetType, targetId]
  );

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: `${title} — Roots Egypt`, url: shareUrl });
        trackShare("native");
      } catch {
        // user cancelled
      }
    } else {
      setShowModal(true);
    }
  }, [title, shareUrl, trackShare]);

  const copyLink = useCallback(async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    trackShare("copy");
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl, trackShare]);

  const openPlatform = useCallback(
    (platform: (typeof PLATFORMS)[0]) => {
      const url = platform.getUrl(shareUrl, title);
      window.open(url, "_blank", "noopener,noreferrer,width=600,height=400");
      trackShare(platform.id);
      setShowModal(false);
    },
    [shareUrl, title, trackShare]
  );

  const borderColor = isDark ? "border-white/10" : "border-black/10";

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={handleNativeShare}
        className={`${btnPad} rounded-full opacity-60 hover:opacity-100 hover:bg-teal/10 transition ${className}`}
        aria-label="Share"
      >
        <Share2 className={iconSize} />
      </motion.button>

      {/* Share Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className={`relative w-full max-w-sm rounded-2xl p-6 shadow-2xl ${
                isDark ? "bg-[#0f1923]" : "bg-white"
              } border ${borderColor}`}
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-lg font-bold mb-1">Share</h3>
              <p className="text-sm opacity-50 mb-5 truncate">{title}</p>

              {/* Copy link */}
              <button
                onClick={copyLink}
                className={`w-full flex items-center gap-3 p-3 rounded-xl mb-3 border ${borderColor} transition ${
                  copied ? "bg-teal/10 border-teal/30" : "hover:bg-white/5"
                }`}
              >
                {copied ? (
                  <Check className="w-5 h-5 text-teal" />
                ) : (
                  <Copy className="w-5 h-5 opacity-50" />
                )}
                <span className="text-sm font-medium">
                  {copied ? "Link copied!" : "Copy link"}
                </span>
              </button>

              {/* Social platforms */}
              <div className="grid grid-cols-2 gap-2">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => openPlatform(p)}
                    className={`${p.color} text-white px-4 py-3 rounded-xl text-sm font-medium hover:opacity-90 transition`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
