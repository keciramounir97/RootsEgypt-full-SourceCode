import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ImagePlus, Send, X } from "lucide-react";
import MagneticButton from "../motion/MagneticButton";
import type { User } from "../../admin/components/AuthContext";
import { EGYPTIAN_CATEGORIES } from "./articleStorage";

interface CreatePostCardProps {
  theme: "light" | "dark";
  user: User;
  placeholder: string;
  titleLabel: string;
  bodyLabel: string;
  imageHint: string;
  postLabel: string;
  onPublish: (payload: {
    title: string;
    body: string;
    coverImage: string | null;
    categories: string[];
  }) => void;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("") || "?";
}

export default function CreatePostCard({
  theme,
  user,
  placeholder,
  titleLabel,
  bodyLabel,
  imageHint,
  postLabel,
  onPublish,
}: CreatePostCardProps) {
  const reduce = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const cardBg = theme === "dark" ? "bg-[#151a21]" : "bg-white";
  const borderClass =
    theme === "dark"
      ? "border-[#24304A] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
      : "border-[#e8dfd0] shadow-[0_12px_40px_rgba(12,74,110,0.08)]";

  const toggleCategory = (id: string) => {
    setCategories((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id].slice(0, 4)
    );
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !f.type.startsWith("image/")) return;
    if (f.size > 1_200_000) {
      alert("Image too large (max ~1.2MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setCoverImage(reader.result);
    };
    reader.readAsDataURL(f);
    e.target.value = "";
  };

  const publish = () => {
    const t = title.trim();
    const b = body.trim();
    if (!t || !b) return;
    onPublish({ title: t, body: b, coverImage, categories });
    setTitle("");
    setBody("");
    setCoverImage(null);
    setCategories([]);
    setExpanded(false);
  };

  const displayName = user.fullName || user.email;

  return (
    <motion.div
      layout
      className={`rounded-2xl border ${borderClass} ${cardBg} overflow-hidden ring-1 ring-[#c9a227]/15`}
      initial={false}
    >
      <div
        className="flex items-center gap-3 p-4 cursor-pointer"
        onClick={() => setExpanded(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded(true);
          }
        }}
      >
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal/30 to-[var(--accent-gold)]/40 text-sm font-bold text-[var(--primary-brown)] dark:text-[var(--accent-gold)] ring-2 ring-[var(--accent-gold)]/30"
          aria-hidden
        >
          {initials(displayName)}
        </div>
        <p className="flex-1 text-left text-sm opacity-70">
          {expanded ? titleLabel : placeholder}
        </p>
      </div>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            key="editor"
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? undefined : { height: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            className="overflow-hidden border-t border-black/5 dark:border-white/10"
          >
            <div className="p-4 space-y-3">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  className="rounded-full p-1.5 hover:bg-black/5 dark:hover:bg-white/10"
                  aria-label="Collapse"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={titleLabel}
                className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-transparent text-[var(--text-color)]"
              />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={8}
                placeholder={bodyLabel}
                className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-transparent resize-y min-h-[180px] text-[var(--text-color)]"
              />

              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
              <div
                onClick={() => fileRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-teal/35 py-8 cursor-pointer hover:bg-teal/5 transition-colors"
              >
                {coverImage ? (
                  <img src={coverImage} alt="" className="max-h-40 rounded-lg object-contain" />
                ) : (
                  <>
                    <ImagePlus className="w-8 h-8 text-teal opacity-80" />
                    <span className="text-sm opacity-70">{imageHint}</span>
                  </>
                )}
              </div>
              {coverImage ? (
                <button
                  type="button"
                  onClick={() => setCoverImage(null)}
                  className="text-xs text-terracotta underline"
                >
                  Remove image
                </button>
              ) : null}

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-2">
                  Categories
                </p>
                <div className="flex flex-wrap gap-2">
                  {EGYPTIAN_CATEGORIES.map((c) => {
                    const on = categories.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleCategory(c.id)}
                        className="rounded-full px-3 py-1 text-xs font-medium transition-transform active:scale-95"
                        style={{
                          backgroundColor: on ? `${c.color}33` : "transparent",
                          color: c.color,
                          boxShadow: on ? `0 0 0 1px ${c.color}55` : undefined,
                        }}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <MagneticButton
                  type="button"
                  onClick={publish}
                  className="interactive-btn btn-neu btn-neu--primary px-6 py-3 inline-flex items-center gap-2 rounded-xl"
                >
                  <Send className="w-4 h-4" />
                  {postLabel}
                </MagneticButton>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
