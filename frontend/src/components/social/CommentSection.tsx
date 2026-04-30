import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, ChevronDown, ChevronUp, CornerDownRight, Trash2 } from "lucide-react";
import { api } from "../../api/client";
import { useThemeStore } from "../../store/theme";

interface Comment {
  id: string;
  userId: string;
  userName: string;
  body: string;
  parentId: string | null;
  createdAt: string;
  replies?: Comment[];
}

interface CommentSectionProps {
  targetType: string;
  targetId: string;
  initialCount?: number;
  className?: string;
}

export default function CommentSection({
  targetType,
  targetId,
  initialCount = 0,
  className = "",
}: CommentSectionProps) {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";

  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/social/${targetType}/${targetId}/comments`);
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      // Nest replies under parents
      const topLevel: Comment[] = [];
      const replyMap = new Map<string, Comment[]>();
      for (const c of data) {
        const comment: Comment = {
          id: c.id,
          userId: c.user_id || c.userId,
          userName: c.user_name || c.userName || c.users?.full_name || "User",
          body: c.body,
          parentId: c.parent_id || c.parentId,
          createdAt: c.created_at || c.createdAt,
          replies: [],
        };
        if (comment.parentId) {
          const arr = replyMap.get(comment.parentId) || [];
          arr.push(comment);
          replyMap.set(comment.parentId, arr);
        } else {
          topLevel.push(comment);
        }
      }
      for (const c of topLevel) {
        c.replies = replyMap.get(c.id) || [];
      }
      setComments(topLevel);
      setCount(data.length);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [targetType, targetId]);

  useEffect(() => {
    if (isOpen && comments.length === 0) fetchComments();
  }, [isOpen, fetchComments]);

  const submitComment = useCallback(
    async (parentId: string | null = null) => {
      const body = parentId ? replyText.trim() : newComment.trim();
      if (!body) return;
      try {
        await api.post(`/social/${targetType}/${targetId}/comments`, {
          body,
          parentId,
        });
        if (parentId) setReplyText("");
        else setNewComment("");
        setReplyingTo(null);
        fetchComments();
      } catch {
        // handle error
      }
    },
    [newComment, replyText, targetType, targetId, fetchComments]
  );

  const deleteComment = useCallback(
    async (commentId: string) => {
      try {
        await api.delete(`/social/comments/${commentId}`);
        fetchComments();
      } catch {
        // handle error
      }
    },
    [fetchComments]
  );

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const borderColor = isDark ? "border-white/10" : "border-black/10";

  const renderComment = (comment: Comment, isReply = false) => (
    <motion.div
      key={comment.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isReply ? "ml-8 pl-4 border-l-2 border-teal/20" : ""}`}
    >
      <div className="flex items-start gap-3 py-3">
        <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
          isDark ? "bg-teal/20 text-teal" : "bg-[#0c4a6e]/10 text-[#0c4a6e]"
        }`}>
          {comment.userName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{comment.userName}</span>
            <span className="text-xs opacity-40">{timeAgo(comment.createdAt)}</span>
          </div>
          <p className="text-sm opacity-80 mt-0.5">{comment.body}</p>
          <div className="flex items-center gap-3 mt-1">
            {!isReply && (
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="text-xs opacity-50 hover:opacity-100 hover:text-teal transition flex items-center gap-1"
              >
                <CornerDownRight className="w-3 h-3" />
                Reply
              </button>
            )}
            <button
              onClick={() => deleteComment(comment.id)}
              className="text-xs opacity-30 hover:opacity-100 hover:text-red-500 transition"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
          {/* Reply input */}
          <AnimatePresence>
            {replyingTo === comment.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submitComment(comment.id)}
                    placeholder="Write a reply..."
                    className={`flex-1 px-3 py-2 rounded-lg text-sm bg-transparent border ${borderColor} outline-none focus:border-teal transition`}
                    autoFocus
                  />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => submitComment(comment.id)}
                    className="p-2 rounded-lg bg-teal text-white"
                    disabled={!replyText.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {/* Replies */}
      {comment.replies?.map((reply) => renderComment(reply, true))}
    </motion.div>
  );

  return (
    <div className={className}>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 p-2 rounded-full opacity-60 hover:opacity-100 transition"
      >
        <MessageCircle className="w-5 h-5" />
        {count > 0 && <span className="text-xs font-medium">{count}</span>}
        {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {/* Comment section */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="overflow-hidden"
          >
            <div className={`mt-3 pt-3 border-t ${borderColor} space-y-1`}>
              {loading ? (
                <div className="py-4 text-center opacity-50 text-sm">Loading comments...</div>
              ) : comments.length === 0 ? (
                <div className="py-4 text-center opacity-40 text-sm">No comments yet. Be the first!</div>
              ) : (
                <div className={`divide-y ${isDark ? "divide-white/5" : "divide-black/5"}`}>
                  {comments.map((c) => renderComment(c))}
                </div>
              )}

              {/* New comment input */}
              <div className="flex gap-2 pt-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitComment()}
                  placeholder="Write a comment..."
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm bg-transparent border ${borderColor} outline-none focus:border-teal transition`}
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => submitComment()}
                  disabled={!newComment.trim()}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal to-[#0c4a6e] text-white font-medium disabled:opacity-40 transition"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
