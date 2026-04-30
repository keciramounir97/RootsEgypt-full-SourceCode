import { useCallback, useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Copy, Facebook, MessageCircle, Send, Share2, X } from "lucide-react";
import { dispatchAppNotification } from "../../context/NotificationContext";
import type { ArticlePost } from "./articleStorage";

interface ShareArticleModalProps {
  open: boolean;
  onClose: () => void;
  article: ArticlePost | null;
  onShareCount?: (articleId: string) => void;
  titleShare: string;
  labelCopy: string;
  labelInternal: string;
  labelClose: string;
}

function buildUrl(articleId: string) {
  return `${window.location.origin}/articles#${articleId}`;
}

export default function ShareArticleModal({
  open,
  onClose,
  article,
  onShareCount,
  titleShare,
  labelCopy,
  labelInternal,
  labelClose,
}: ShareArticleModalProps) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const bumpShare = useCallback(() => {
    if (!article) return;
    onShareCount?.(article.id);
  }, [article, onShareCount]);

  const copyLink = useCallback(() => {
    if (!article) return;
    const url = buildUrl(article.id);
    void navigator.clipboard.writeText(url);
    bumpShare();
  }, [article, bumpShare]);

  const shareInternal = useCallback(() => {
    if (!article) return;
    dispatchAppNotification(titleShare, article.title);
    bumpShare();
    onClose();
  }, [article, titleShare, bumpShare, onClose]);

  const openExternal = useCallback(
    (href: string) => {
      window.open(href, "_blank", "noopener,noreferrer");
      bumpShare();
    },
    [bumpShare]
  );

  if (!article) return null;

  const url = buildUrl(article.id);
  const text = article.title;

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label={labelClose}
            className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-article-title"
            className="fixed inset-x-0 bottom-0 z-[90] mx-auto max-w-lg rounded-t-3xl border border-[var(--border-color)] bg-[var(--paper-color)] shadow-2xl dark:bg-[#121a28] dark:border-[#24304A] px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
            initial={reduce ? false : { y: "100%" }}
            animate={reduce ? {} : { y: 0 }}
            exit={reduce ? {} : { y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-black/10 dark:bg-white/15" />
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 text-teal">
                <Share2 className="w-5 h-5 shrink-0" />
                <h2 id="share-article-title" className="text-lg font-bold text-[var(--text-color)]">
                  {titleShare}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm opacity-80 line-clamp-2 mb-4">{article.title}</p>

            <div className="flex flex-col gap-3 pb-2">
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={copyLink}
                className="flex items-center justify-center gap-2 w-full rounded-xl py-3 font-semibold bg-[var(--accent-gold)]/20 text-[var(--primary-brown)] dark:text-[var(--accent-gold)] border border-[var(--accent-gold)]/40"
              >
                <Copy className="w-4 h-4" />
                {labelCopy}
              </motion.button>

              <div className="grid grid-cols-4 gap-2">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    openExternal(
                      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
                    )
                  }
                  className="flex flex-col items-center gap-1 rounded-xl py-3 bg-[#1877f2]/15 text-[#1877f2]"
                >
                  <Facebook className="w-6 h-6" />
                  <span className="text-[10px] font-medium">Facebook</span>
                </motion.button>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    openExternal(
                      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
                    )
                  }
                  className="flex flex-col items-center gap-1 rounded-xl py-3 bg-black/10 dark:bg-white/10"
                >
                  <span className="text-lg font-black leading-none">𝕏</span>
                  <span className="text-[10px] font-medium">X</span>
                </motion.button>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    openExternal(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`)
                  }
                  className="flex flex-col items-center gap-1 rounded-xl py-3 bg-[#25d366]/15 text-[#25d366]"
                >
                  <MessageCircle className="w-6 h-6" />
                  <span className="text-[10px] font-medium">WhatsApp</span>
                </motion.button>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    openExternal(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`)
                  }
                  className="flex flex-col items-center gap-1 rounded-xl py-3 bg-[#0088cc]/15 text-[#0088cc]"
                >
                  <Send className="w-6 h-6" />
                  <span className="text-[10px] font-medium">Telegram</span>
                </motion.button>
              </div>

              <button
                type="button"
                onClick={shareInternal}
                className="w-full rounded-xl py-3 text-sm font-medium border border-teal/40 text-teal hover:bg-teal/10 transition-colors"
              >
                {labelInternal}
              </button>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
