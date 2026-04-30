import { useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useAnimationControls,
} from "framer-motion";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Share2,
  Trash2,
  Link as LinkIcon,
} from "lucide-react";
import type { User } from "../../admin/components/AuthContext";
import {
  type ArticlePost,
  type ArticleComment,
  EGYPTIAN_CATEGORIES,
  categoryStyle,
} from "./articleStorage";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("") || "?";
}

interface ArticlePostCardProps {
  article: ArticlePost;
  theme: "light" | "dark";
  user: User | null;
  isTrending: boolean;
  likeCount: number;
  liked: boolean;
  onLike: () => void;
  commentCount: number;
  shareCount: number;
  comments: ArticleComment[];
  commentLikeCounts: Record<string, number>;
  commentLiked: Record<string, boolean>;
  onToggleCommentLike: (commentId: string) => void;
  commentDraft: string;
  onCommentDraft: (v: string) => void;
  onAddComment: (body: string, parentId: string | null) => void;
  onDeleteArticle: (id: string) => void;
  onOpenShare: () => void;
  commentsExpanded: boolean;
  onToggleCommentsExpanded: () => void;
  readMore: string;
  commentsTitle: string;
  replyLabel: string;
  guestName: string;
  /** Stagger entrance with siblings (initial load). */
  staggerIndex?: number;
}

function LikeBurst({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  if (reduce || !active) return null;
  return (
    <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {[...Array(6)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-[var(--accent-gold)]"
          initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
          animate={{
            x: Math.cos((i / 6) * Math.PI * 2) * 22,
            y: Math.sin((i / 6) * Math.PI * 2) * 22,
            opacity: 0,
            scale: 1,
          }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        />
      ))}
    </span>
  );
}

export default function ArticlePostCard({
  article,
  theme,
  user,
  isTrending,
  likeCount,
  liked,
  onLike,
  commentCount,
  shareCount,
  comments,
  commentLikeCounts,
  commentLiked,
  onToggleCommentLike,
  commentDraft,
  onCommentDraft,
  onAddComment,
  onDeleteArticle,
  onOpenShare,
  commentsExpanded,
  onToggleCommentsExpanded,
  readMore,
  commentsTitle,
  replyLabel,
  guestName,
  staggerIndex = 0,
}: ArticlePostCardProps) {
  const reduce = useReducedMotion();
  const [bodyOpen, setBodyOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [replyParentId, setReplyParentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [burst, setBurst] = useState(false);
  const heartCtrl = useAnimationControls();

  const cardBg = theme === "dark" ? "bg-[#151a21]" : "bg-white";
  const borderClass = theme === "dark" ? "border-[#24304A]" : "border-black/[0.06]";
  const shadow =
    theme === "dark"
      ? "shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
      : "shadow-[0_12px_40px_rgba(12,74,110,0.07)]";
  const trendingRing = isTrending
    ? "ring-2 ring-[var(--accent-gold)]/55 shadow-[0_0_0_1px_rgba(212,168,75,0.25)]"
    : "ring-1 ring-[#c9a227]/12";

  const topLevel = useMemo(
    () => comments.filter((c) => !c.parentId),
    [comments]
  );
  const byParent = useMemo(() => {
    const m: Record<string, ArticleComment[]> = {};
    for (const c of comments) {
      if (c.parentId) {
        if (!m[c.parentId]) m[c.parentId] = [];
        m[c.parentId].push(c);
      }
    }
    for (const k of Object.keys(m)) {
      m[k].sort((a, b) => a.createdAt - b.createdAt);
    }
    return m;
  }, [comments]);

  const needsReadMore = article.body.length > 220;

  const handleLike = () => {
    setBurst(true);
    window.setTimeout(() => setBurst(false), 500);
    void heartCtrl.start({
      scale: [1, 1.35, 1],
      transition: { type: "spring", stiffness: 500, damping: 15 },
    });
    onLike();
  };

  const submitMain = () => {
    const b = commentDraft.trim();
    if (!b) return;
    onAddComment(b, null);
    onCommentDraft("");
  };

  const submitReply = (parentId: string) => {
    const b = replyText.trim();
    if (!b) return;
    onAddComment(b, parentId);
    setReplyText("");
    setReplyParentId(null);
  };

  const canDelete = user && article.authorId === user.id;

  return (
    <motion.article
      layout
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={reduce ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        type: "spring",
        damping: 26,
        stiffness: 260,
        delay: reduce ? 0 : Math.min(staggerIndex * 0.06, 0.72),
      }}
      className={`relative rounded-2xl border ${borderClass} ${cardBg} ${shadow} ${trendingRing} overflow-hidden`}
    >
      {isTrending ? (
        <div className="absolute left-0 top-0 z-10 h-full w-1 bg-gradient-to-b from-[var(--accent-gold)] to-teal/60" />
      ) : null}

      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal/25 to-[var(--accent-gold)]/35 text-sm font-bold text-[var(--primary-brown)] dark:text-[var(--accent-gold)]"
            aria-hidden
          >
            {initials(article.authorName)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-[var(--text-color)] leading-tight">
                  {article.authorName}
                </p>
                <p className="text-xs opacity-60 mt-0.5">
                  {new Date(article.createdAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/10"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                >
                  <MoreHorizontal className="w-5 h-5 opacity-70" />
                </button>
                <AnimatePresence>
                  {menuOpen ? (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="absolute right-0 z-20 mt-1 min-w-[160px] rounded-xl border border-black/10 dark:border-white/10 bg-[var(--paper-color)] dark:bg-[#1a2230] py-1 shadow-xl"
                    >
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
                        onClick={() => {
                          void navigator.clipboard.writeText(
                            `${window.location.origin}/articles#${article.id}`
                          );
                          setMenuOpen(false);
                        }}
                      >
                        <LinkIcon className="w-4 h-4" /> Copy link
                      </button>
                      {canDelete ? (
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10"
                          onClick={() => {
                            onDeleteArticle(article.id);
                            setMenuOpen(false);
                          }}
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      ) : null}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>

            <h3 className="mt-3 text-xl sm:text-2xl font-bold text-[var(--text-color)] leading-snug">
              {article.title}
            </h3>

            {article.coverImage ? (
              <div className="mt-3 -mx-1 overflow-hidden rounded-xl">
                <img
                  src={article.coverImage}
                  alt=""
                  className="w-full max-h-[420px] object-cover"
                />
              </div>
            ) : null}

            <div
              className={`mt-3 text-[var(--text-color)]/90 text-[15px] leading-relaxed ${
                !bodyOpen && needsReadMore
                  ? "line-clamp-4 break-words"
                  : "whitespace-pre-wrap"
              }`}
            >
              {article.body}
            </div>
            {needsReadMore && !bodyOpen ? (
              <button
                type="button"
                onClick={() => setBodyOpen(true)}
                className="mt-1 text-sm font-semibold text-teal hover:underline"
              >
                {readMore}
              </button>
            ) : null}
            {needsReadMore && bodyOpen ? (
              <button
                type="button"
                onClick={() => setBodyOpen(false)}
                className="mt-1 text-sm font-semibold text-teal hover:underline"
              >
                Show less
              </button>
            ) : null}

            {article.categories?.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {article.categories.map((cid) => {
                  const meta = EGYPTIAN_CATEGORIES.find((c) => c.id === cid);
                  const st = categoryStyle(cid);
                  return (
                    <span
                      key={cid}
                      className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      style={{ backgroundColor: st.bg, color: st.text }}
                    >
                      {meta?.label ?? cid}
                    </span>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-1 border-t border-black/5 dark:border-white/10 pt-3">
          <div className="relative">
            <motion.button
              type="button"
              onClick={handleLike}
              className={`relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                liked ? "text-red-500" : "opacity-80 hover:bg-black/5 dark:hover:bg-white/10"
              }`}
              aria-pressed={liked}
            >
              <LikeBurst active={burst} />
              <motion.span animate={heartCtrl} className="relative inline-flex">
                <Heart
                  className={`h-5 w-5 ${liked ? "fill-current" : ""}`}
                  strokeWidth={liked ? 0 : 2}
                />
              </motion.span>
              <motion.span
                key={likeCount}
                initial={{ scale: 1.2, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
              >
                {likeCount}
              </motion.span>
            </motion.button>
          </div>

          <button
            type="button"
            onClick={onToggleCommentsExpanded}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm opacity-80 hover:bg-black/5 dark:hover:bg-white/10"
          >
            <MessageCircle className="h-5 w-5" />
            <motion.span
              key={commentCount}
              initial={{ y: -4, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              {commentCount}
            </motion.span>
          </button>

          <button
            type="button"
            onClick={onOpenShare}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm opacity-80 hover:bg-black/5 dark:hover:bg-white/10"
          >
            <Share2 className="h-5 w-5" />
            {shareCount}
          </button>
        </div>
      </div>

      <motion.div
        initial={false}
        animate={{ height: commentsExpanded ? "auto" : 0, opacity: commentsExpanded ? 1 : 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="overflow-hidden border-t border-black/5 dark:border-white/10"
      >
        <div className="p-4 sm:p-5 pt-2 space-y-4 bg-black/[0.02] dark:bg-white/[0.02]">
          <h4 className="text-xs font-bold uppercase tracking-widest text-teal flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            {commentsTitle}
          </h4>

          <ul className="space-y-3">
            <AnimatePresence initial={false}>
              {topLevel.map((c) => (
                <CommentThread
                  key={c.id}
                  root={c}
                  replies={byParent[c.id] ?? []}
                  guestName={guestName}
                  commentLikeCounts={commentLikeCounts}
                  commentLiked={commentLiked}
                  onToggleCommentLike={onToggleCommentLike}
                  replyLabel={replyLabel}
                  replyParentId={replyParentId}
                  setReplyParentId={setReplyParentId}
                  replyText={replyText}
                  setReplyText={setReplyText}
                  onSubmitReply={submitReply}
                />
              ))}
            </AnimatePresence>
          </ul>

          <div className="flex gap-2">
            <input
              type="text"
              value={commentDraft}
              onChange={(e) => onCommentDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submitMain();
                }
              }}
              placeholder="Write a comment…"
              className="flex-1 rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-4 py-2.5 text-sm"
            />
          </div>
        </div>
      </motion.div>

      {menuOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-10 cursor-default bg-transparent"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}
    </motion.article>
  );
}

function CommentThread({
  root,
  replies,
  guestName,
  commentLikeCounts,
  commentLiked,
  onToggleCommentLike,
  replyLabel,
  replyParentId,
  setReplyParentId,
  replyText,
  setReplyText,
  onSubmitReply,
}: {
  root: ArticleComment;
  replies: ArticleComment[];
  guestName: string;
  commentLikeCounts: Record<string, number>;
  commentLiked: Record<string, boolean>;
  onToggleCommentLike: (id: string) => void;
  replyLabel: string;
  replyParentId: string | null;
  setReplyParentId: (id: string | null) => void;
  replyText: string;
  setReplyText: (s: string) => void;
  onSubmitReply: (parentId: string) => void;
}) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-xl border border-black/5 dark:border-white/10 p-3 bg-black/[0.03] dark:bg-white/[0.04]"
    >
      <CommentBlock
        c={root}
        guestName={guestName}
        commentLikeCounts={commentLikeCounts}
        commentLiked={commentLiked}
        onToggleCommentLike={onToggleCommentLike}
        replyLabel={replyLabel}
        replyParentId={replyParentId}
        setReplyParentId={setReplyParentId}
        replyText={replyText}
        setReplyText={setReplyText}
        onSubmitReply={onSubmitReply}
      />
      {replies.length ? (
        <ul className="mt-2 ml-4 sm:ml-8 space-y-2 border-l-2 border-teal/20 pl-3">
          {replies.map((r) => (
            <li key={r.id}>
              <CommentBlock
                c={r}
                guestName={guestName}
                commentLikeCounts={commentLikeCounts}
                commentLiked={commentLiked}
                onToggleCommentLike={onToggleCommentLike}
                replyLabel={replyLabel}
                replyParentId={replyParentId}
                setReplyParentId={setReplyParentId}
                replyText={replyText}
                setReplyText={setReplyText}
                onSubmitReply={onSubmitReply}
                isReply
              />
            </li>
          ))}
        </ul>
      ) : null}
    </motion.li>
  );
}

function CommentBlock({
  c,
  guestName,
  commentLikeCounts,
  commentLiked,
  onToggleCommentLike,
  replyLabel,
  replyParentId,
  setReplyParentId,
  replyText,
  setReplyText,
  onSubmitReply,
  isReply,
}: {
  c: ArticleComment;
  guestName: string;
  commentLikeCounts: Record<string, number>;
  commentLiked: Record<string, boolean>;
  onToggleCommentLike: (id: string) => void;
  replyLabel: string;
  replyParentId: string | null;
  setReplyParentId: (id: string | null) => void;
  replyText: string;
  setReplyText: (s: string) => void;
  onSubmitReply: (parentId: string) => void;
  isReply?: boolean;
}) {
  const name = c.authorName || guestName;
  const showReplyBox = replyParentId === c.id;

  return (
    <div className={isReply ? "text-sm" : ""}>
      <div className="flex gap-2">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal/20 text-xs font-bold"
          aria-hidden
        >
          {initials(name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
            <span className="font-semibold text-[var(--text-color)]">{name}</span>
            <span className="text-[10px] opacity-50">
              {new Date(c.createdAt).toLocaleString()}
            </span>
          </div>
          <p className="mt-1 whitespace-pre-wrap text-[var(--text-color)]/90">{c.body}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onToggleCommentLike(c.id)}
              className={`text-xs font-medium inline-flex items-center gap-1 ${
                commentLiked[c.id] ? "text-red-500" : "opacity-70"
              }`}
            >
              <Heart className={`h-3.5 w-3.5 ${commentLiked[c.id] ? "fill-current" : ""}`} />
              {commentLikeCounts[c.id] ?? 0}
            </button>
            {!isReply ? (
              <button
                type="button"
                onClick={() =>
                  setReplyParentId(showReplyBox ? null : c.id)
                }
                className="text-xs font-medium text-teal"
              >
                {replyLabel}
              </button>
            ) : null}
          </div>
          {showReplyBox ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="mt-2 overflow-hidden"
            >
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onSubmitReply(c.id);
                  }
                }}
                placeholder="Write a reply…"
                className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-sm"
              />
            </motion.div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
