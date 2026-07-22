import { useEffect, useMemo, useState } from "react";
import { useThemeStore } from "../store/theme";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  Heart,
  MessageCircle,
  Share2,
  Send,
  Image,
  Video,
  MoreHorizontal,
  Bookmark,
  ThumbsUp,
  Angry,
  Laugh,
  Frown,
  Plus,
  X,
  Globe,
  Users,
  Lock,
} from "lucide-react";
import { api } from "../api/client";
import { getApiErrorMessage, getApiRoot } from "../api/helpers";
import { useLanguage } from "../i18n";
import RootsPageShell from "../components/RootsPageShell";
const articleFallbackImage = "/assets/gallery/roots-egypt-gallery-01.jpeg";

interface Post {
  id: number | string;
  title?: string;
  category?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  images?: string[];
  videos?: string[];
  createdAt: string;
  likes?: number;
  comments?: Comment[];
  reactions?: Reaction[];
  isLiked?: boolean;
  isBookmarked?: boolean;
  visibility?: "public" | "community" | "private";
}

interface Comment {
  id: number | string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  likes?: number;
  createdAt: string;
  replies?: Comment[];
}

interface Reaction {
  type: "like" | "love" | "laugh" | "sad" | "angry";
  count: number;
  isActive?: boolean;
}

const formatTimeAgo = (dateString: string, t: (key: string, fallback?: string) => string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}${t("legacy.minutes_ago_suffix", "m ago")}`;
  if (hours < 24) return `${hours}${t("legacy.hours_ago_suffix", "h ago")}`;
  if (days < 7) return `${days}${t("legacy.days_ago_suffix", "d ago")}`;
  return date.toLocaleDateString();
};

// Deterministic placeholder so the "shares" count doesn't jump around on every
// re-render (e.g. when liking/commenting) while there is no real share tracking.
const stablePlaceholderCount = (id: number | string, max = 10) => {
  const str = String(id);
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash % max;
};

const sortByDateDesc = (items: Post[]) =>
  [...items].sort((a, b) => {
    const da = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
    const db = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
    return db - da;
  });

const parseMediaList = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }
  if (typeof value === "object") {
    const item = value as Record<string, unknown>;
    const url = item.url || item.src || item.path || item.image_path;
    return url ? [String(url).trim()] : [];
  }
  const raw = String(value || "").trim();
  if (!raw) return [];
  try {
    return parseMediaList(JSON.parse(raw));
  } catch {
    return raw
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
};

const parseComments = (value: unknown): Comment[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value as Comment[];
  try {
    const parsed = JSON.parse(String(value));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const resolveMediaUrl = (url: string, apiRoot: string) => {
  const clean = String(url || "").trim();
  if (!clean) return articleFallbackImage;
  if (/^(https?:)?\/\//i.test(clean) || clean.startsWith("data:") || clean.startsWith("blob:")) {
    return clean;
  }
  if (clean.startsWith("/uploads/")) return `${apiRoot}${clean}`;
  return clean;
};

const normalizePost = (item: any, apiRoot: string, fallbackName = "Member"): Post => {
  const author = item?.author && typeof item.author === "object" ? item.author : null;
  const userName =
    item?.userName ||
    item?.user_name ||
    item?.author_name ||
    author?.full_name ||
    author?.fullName ||
    (typeof item?.author === "string" ? item.author : "") ||
    fallbackName;
  const images = parseMediaList(item?.images).map((url) => resolveMediaUrl(url, apiRoot));
  const videos = parseMediaList(item?.videos).map((url) => resolveMediaUrl(url, apiRoot));

  return {
    id: item?.id || Date.now(),
    title: item?.title || "",
    category: item?.category || "",
    userId: item?.userId || item?.user_id || item?.author_id || "user",
    userName,
    content: item?.content || item?.body || "",
    images,
    videos,
    createdAt: item?.createdAt || item?.created_at || new Date().toISOString(),
    likes: Number(item?.likes || 0),
    comments: parseComments(item?.comments),
    reactions: Array.isArray(item?.reactions) ? item.reactions : [],
    isLiked: false,
    visibility: item?.visibility || (item?.is_public === false ? "private" : "public"),
  };
};

export default function GalleryArticles() {
  const { theme } = useThemeStore();
  const { t } = useLanguage();
  const apiRoot = useMemo(() => getApiRoot(), []);

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("");
  const [newPostImages, setNewPostImages] = useState<string[]>([]);
  const [newPostImageInput, setNewPostImageInput] = useState("");
  const [newPostVisibility, setNewPostVisibility] = useState<"public" | "community" | "private">("public");
  const [postError, setPostError] = useState("");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [activePostId, setActivePostId] = useState<number | string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [showReactions, setShowReactions] = useState<number | string | null>(null);

  useEffect(() => {
    AOS.init({ duration: 900, once: true });
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/articles");
        const items = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.articles)
            ? data.articles
            : Array.isArray(data)
              ? data
              : [];
        setPosts(
          sortByDateDesc(
            items.map((item: any) => normalizePost(item, apiRoot, t("legacy.member", "Member"))),
          ),
        );
      } catch {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [apiRoot, t]);

  const addNewPostImage = () => {
    const clean = newPostImageInput.trim();
    if (!clean) return;
    setNewPostImages((prev) => (prev.includes(clean) ? prev : [...prev, clean]));
    setNewPostImageInput("");
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    setPostError("");

    try {
      setPosting(true);
      const payload = {
        title: newPostContent.trim().slice(0, 90),
        category: newPostCategory.trim(),
        content: newPostContent.trim(),
        images: newPostImages,
        visibility: newPostVisibility,
        is_public: newPostVisibility !== "private",
      };
      const { data } = await api.post("/my/articles", payload);
      const post = normalizePost(data?.data || data, apiRoot, t("legacy.you", "You"));
      setPosts((prev) => sortByDateDesc([post, ...prev.filter((item) => item.id !== post.id)]));
      setNewPostContent("");
      setNewPostCategory("");
      setNewPostImages([]);
      setNewPostVisibility("public");
      setShowCreatePost(false);
    } catch (err) {
      setPostError(
        getApiErrorMessage(err, t("legacy.post_publish_failed", "Could not publish the post."), {
          unauthorized: t("legacy.login_to_publish_post", "Please log in to publish a post."),
        }),
      );
    } finally {
      setPosting(false);
    }
  };

  const handleLike = (postId: number | string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? (post.likes || 0) - 1 : (post.likes || 0) + 1,
            }
          : post
      )
    );
  };

  const handleReaction = (postId: number | string, reactionType: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;

        const reactions = post.reactions || [];
        const updatedReactions = reactions.map((r) => ({
          ...r,
          isActive: r.type === reactionType ? !r.isActive : r.isActive,
          count: r.type === reactionType ? (r.isActive ? r.count - 1 : r.count + 1) : r.count,
        }));

        if (!updatedReactions.find((r) => r.type === reactionType)) {
          updatedReactions.push({ type: reactionType as any, count: 1, isActive: true });
        }

        return { ...post, reactions: updatedReactions };
      })
    );
    setShowReactions(null);
  };

  const handleComment = (postId: number | string) => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now(),
      userId: "currentUser",
      userName: t("legacy.you", "You"),
      text: newComment,
      likes: 0,
      createdAt: new Date().toISOString(),
    };

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, comments: [...(post.comments || []), comment] }
          : post
      )
    );

    setNewComment("");
  };

  const handleBookmark = (postId: number | string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, isBookmarked: !post.isBookmarked } : post
      )
    );
  };

  const isDark = theme === "dark";
  const borderColor = isDark ? "border-[#1a3048]" : "border-[#e8e4dc]";
  const cardBg = isDark ? "bg-[#0f1f33]" : "bg-white";

  const getReactionEmoji = (type: string) => {
    switch (type) {
      case "like":
        return <ThumbsUp className="w-4 h-4 text-blue-500" />;
      case "love":
        return <Heart className="w-4 h-4 text-red-500 fill-current" />;
      case "laugh":
        return <Laugh className="w-4 h-4 text-yellow-500" />;
      case "sad":
        return <Frown className="w-4 h-4 text-yellow-600" />;
      case "angry":
        return <Angry className="w-4 h-4 text-orange-500" />;
      default:
        return null;
    }
  };

  const getVisibilityIcon = (visibility?: string) => {
    switch (visibility) {
      case "public":
        return <Globe className="w-3 h-3" />;
      case "community":
        return <Users className="w-3 h-3" />;
      case "private":
        return <Lock className="w-3 h-3" />;
      default:
        return <Globe className="w-3 h-3" />;
    }
  };

  return (
    <RootsPageShell
      hero={
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-[#d9a441]">
            {t("legacy.community", "Community")}
          </p>
          <h1 className="text-5xl font-bold">
            {t("legacy.articles_feed", "Heritage Stories")}
          </h1>
          <p className="max-w-4xl mx-auto text-lg opacity-90">
            {t("legacy.articles_intro",
              "Share your family stories, discoveries, and connect with others on their genealogical journey.",
            )}
          </p>
        </div>
      }
    >
      {/* Create Post */}
      <section className="roots-section roots-section-alt" data-aos="fade-up">
        <div className={`p-5 rounded-2xl ${cardBg} border ${borderColor} shadow-lg`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#24766f] to-[#d9a441] flex items-center justify-center text-white font-bold">
              {t("legacy.user", "User").charAt(0)}
            </div>
            <button
              onClick={() => setShowCreatePost(true)}
              className={`flex-1 px-4 py-3 rounded-xl text-left opacity-80 hover:opacity-100 transition-opacity ${
                isDark ? "bg-white/5" : "bg-black/5"
              }`}
            >
              {t("legacy.share_story", "Share your family story...")}
            </button>
          </div>
          <div className={`flex items-center gap-2 mt-4 pt-4 border-t ${borderColor}`}>
            <button
              onClick={() => setShowCreatePost(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm"
            >
              <Image className="w-5 h-5 text-green-500" />
              {t("legacy.photo", "Photo")}
            </button>
            <button
              onClick={() => setShowCreatePost(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm"
            >
              <Video className="w-5 h-5 text-blue-500" />
              {t("legacy.video", "Video")}
            </button>
          </div>
          {postError ? (
            <p className="mt-3 text-sm text-red-500">{postError}</p>
          ) : null}
        </div>
      </section>

      {loading ? (
        <section className="roots-section">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-[#d9a441] border-t-transparent rounded-full animate-spin mb-4" />
          </div>
        </section>
      ) : (
        <section className="roots-section space-y-4" data-aos="fade-up">
          {posts.map((post, index) => (
            <article
              key={post.id}
              className={`${cardBg} border ${borderColor} rounded-2xl shadow-lg overflow-hidden`}
              data-aos="fade-up"
              data-aos-delay={index * 50}
            >
              {/* Post Header */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#24766f] to-[#d9a441] flex items-center justify-center text-white font-bold text-sm">
                    {post.userName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold">{post.userName}</h4>
                      <span className="opacity-50 flex items-center gap-1">
                        {getVisibilityIcon(post.visibility)}
                      </span>
                    </div>
                    <p className="text-xs opacity-60 inline-flex items-center gap-1">
                      <Bookmark className="w-3 h-3" />
                      {formatTimeAgo(post.createdAt, t)}
                    </p>
                  </div>
                </div>
                <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <MoreHorizontal className="w-5 h-5 opacity-60" />
                </button>
              </div>

              {/* Post Content */}
              <div className="px-4 pb-3">
                {post.title ? (
                  <h3 className="mb-2 text-xl font-bold leading-snug">{post.title}</h3>
                ) : null}
                {post.category ? (
                  <span className="mb-2 inline-flex px-2.5 py-1 rounded-full bg-[#24766f]/10 text-[#24766f] text-xs font-semibold">
                    {post.category}
                  </span>
                ) : null}
                <p className="whitespace-pre-wrap">{post.content}</p>
              </div>

              {/* Post Images */}
              {post.images && post.images.length > 0 && (
                <div className="px-4 pb-4">
                  {post.images.length === 1 ? (
                    <img
                      src={post.images[0]}
                      alt={t("legacy.post_image", "Post image")}
                      onError={(event) => {
                        event.currentTarget.src = articleFallbackImage;
                      }}
                      className="w-full max-h-[28rem] object-cover rounded-xl border border-black/5"
                    />
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {post.images.slice(0, 4).map((img, i) => (
                        <div key={img} className="relative overflow-hidden rounded-xl border border-black/5">
                          <img
                            src={img}
                            alt={`${t("legacy.post_image", "Post image")} ${i + 1}`}
                            onError={(event) => {
                              event.currentTarget.src = articleFallbackImage;
                            }}
                            className="w-full h-48 object-cover"
                          />
                          {i === 3 && post.images && post.images.length > 4 ? (
                            <div className="absolute inset-0 bg-black/55 text-white grid place-items-center text-lg font-bold">
                              +{post.images.length - 4}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Reactions Summary */}
              <div className={`px-4 py-2 flex items-center justify-between border-y ${borderColor}`}>
                <div className="flex items-center gap-1">
                  {post.reactions?.slice(0, 3).map((reaction, i) => (
                    <span key={i} className="flex items-center">
                      {getReactionEmoji(reaction.type)}
                    </span>
                  ))}
                  <span className="text-sm opacity-70 ml-1">
                    {post.reactions?.reduce((sum, r) => sum + r.count, 0) || post.likes || 0}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm opacity-70">
                  <span>{post.comments?.length || 0} {t("legacy.comments", "comments")}</span>
                  <span>{stablePlaceholderCount(post.id)} {t("legacy.shares", "shares")}</span>
                </div>
              </div>

              {/* Post Actions */}
              <div className={`px-4 py-2 flex items-center justify-around border-b ${borderColor}`}>
                <div className="relative">
                  <button
                    onClick={() => handleLike(post.id)}
                    onMouseEnter={() => setShowReactions(post.id)}
                    onMouseLeave={() => setShowReactions(null)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      post.isLiked
                        ? "text-[#24766f] font-semibold"
                        : "opacity-70 hover:opacity-100 hover:bg-white/10"
                    }`}
                  >
                    <ThumbsUp className={`w-5 h-5 ${post.isLiked ? "fill-current" : ""}`} />
                    {t("legacy.like", "Like")}
                  </button>

                  {/* Reaction Picker */}
                  {showReactions === post.id && (
                    <div
                      className={`absolute bottom-full left-0 mb-2 p-2 rounded-xl ${cardBg} border ${borderColor} shadow-xl flex gap-1`}
                      onMouseEnter={() => setShowReactions(post.id)}
                      onMouseLeave={() => setShowReactions(null)}
                    >
                      {["like", "love", "laugh", "sad", "angry"].map((type) => (
                        <button
                          key={type}
                          onClick={() => handleReaction(post.id, type)}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          {getReactionEmoji(type)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setActivePostId(activePostId === post.id ? null : post.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg opacity-70 hover:opacity-100 hover:bg-white/10 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  {t("legacy.comment", "Comment")}
                </button>

                <button className="flex items-center gap-2 px-4 py-2 rounded-lg opacity-70 hover:opacity-100 hover:bg-white/10 transition-colors">
                  <Share2 className="w-5 h-5" />
                  {t("legacy.share", "Share")}
                </button>

                <button
                  onClick={() => handleBookmark(post.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    post.isBookmarked
                      ? "text-[#d9a441]"
                      : "opacity-70 hover:opacity-100 hover:bg-white/10"
                  }`}
                >
                  <Bookmark className={`w-5 h-5 ${post.isBookmarked ? "fill-current" : ""}`} />
                </button>
              </div>

              {/* Comments Section */}
              {activePostId === post.id && (
                <div className="p-4 space-y-3">
                  {/* Existing Comments */}
                  {(post.comments || []).map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#24766f]/50 to-[#d9a441]/50 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {comment.userName.charAt(0)}
                      </div>
                      <div className={`flex-1 p-3 rounded-xl ${isDark ? "bg-white/5" : "bg-black/5"}`}>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm">{comment.userName}</span>
                          <span className="text-xs opacity-50">
                            {formatTimeAgo(comment.createdAt, t)}
                          </span>
                        </div>
                        <p className="text-sm mt-1">{comment.text}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs opacity-60">
                          <button className="hover:opacity-100">{t("legacy.like", "Like")}</button>
                          <button className="hover:opacity-100">{t("legacy.reply", "Reply")}</button>
                          {comment.likes && <span>{comment.likes} {t("legacy.likes", "likes")}</span>}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Comment Input */}
                  <div className="flex gap-3 items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#24766f] to-[#d9a441] flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {t("legacy.user", "User").charAt(0)}
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={t("legacy.write_comment", "Write a comment...")}
                        className={`flex-1 px-4 py-2 rounded-xl bg-transparent border ${borderColor} outline-none focus:border-[#d9a441] text-sm`}
                        onKeyDown={(e) => e.key === "Enter" && handleComment(post.id)}
                      />
                      <button
                        onClick={() => handleComment(post.id)}
                        className="p-2 rounded-xl bg-[#24766f] text-white"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </article>
          ))}
        </section>
      )}

      {/* Create Post Modal */}
      {showCreatePost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowCreatePost(false)}
        >
          <div
            className={`w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col ${cardBg} border ${borderColor}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`p-4 border-b ${borderColor} flex items-center justify-between shrink-0`}>
              <h3 className="text-xl font-bold">{t("legacy.create_post", "Create Post")}</h3>
              <button
                onClick={() => setShowCreatePost(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#24766f] to-[#d9a441] flex items-center justify-center text-white font-bold shrink-0">
                  {t("legacy.user", "User").charAt(0)}
                </div>
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder={t("legacy.share_story_placeholder", "Share your family story, discovery, or question...")}
                  rows={5}
                  className={`flex-1 resize-none outline-none bg-transparent ${
                    isDark ? "placeholder-white/50" : "placeholder-black/50"
                  }`}
                  autoFocus
                />
              </div>

              <input
                type="text"
                value={newPostCategory}
                onChange={(event) => setNewPostCategory(event.target.value)}
                placeholder={t("legacy.custom_category_placeholder", "Name this category...")}
                className={`mt-4 w-full px-4 py-3 rounded-xl bg-transparent border ${borderColor} outline-none focus:border-[#d9a441]`}
              />

              {/* Image Preview */}
              {newPostImages.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {newPostImages.map((img, i) => (
                    <div key={img} className="relative">
                      <img
                        src={resolveMediaUrl(img, apiRoot)}
                        alt=""
                        onError={(event) => {
                          event.currentTarget.src = articleFallbackImage;
                        }}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => setNewPostImages(newPostImages.filter((_, idx) => idx !== i))}
                        className="absolute top-2 right-2 p-1 bg-black/50 rounded-full"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add to post */}
              <div className={`mt-4 p-3 rounded-xl border ${borderColor} space-y-3`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-70">{t("legacy.add_to_post", "Add to your post")}</span>
                  <div className="flex items-center gap-2">
                    <Image className="w-5 h-5 text-green-500" />
                    <Video className="w-5 h-5 text-blue-500" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    value={newPostImageInput}
                    onChange={(event) => setNewPostImageInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addNewPostImage();
                      }
                    }}
                    placeholder={t("legacy.image_url", "Image URL")}
                    className={`min-w-0 flex-1 px-3 py-2 rounded-lg bg-transparent border ${borderColor} outline-none text-sm`}
                  />
                  <button
                    type="button"
                    onClick={addNewPostImage}
                    className="px-3 py-2 rounded-lg bg-[#24766f] text-white inline-flex items-center gap-1 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    {t("legacy.add", "Add")}
                  </button>
                </div>
              </div>

              {postError ? (
                <p className="mt-3 text-sm text-red-500">{postError}</p>
              ) : null}

              {/* Visibility */}
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm opacity-70">{t("legacy.visibility", "Visibility")}:</span>
                <select
                  value={newPostVisibility}
                  onChange={(event) => setNewPostVisibility(event.target.value as "public" | "community" | "private")}
                  className={`px-3 py-1 rounded-lg bg-transparent border ${borderColor} text-sm outline-none`}
                >
                  <option value="public">{t("legacy.public", "Public")}</option>
                  <option value="community">{t("legacy.community", "Community")}</option>
                  <option value="private">{t("legacy.private", "Private")}</option>
                </select>
              </div>
            </div>

            <div className={`p-4 border-t ${borderColor} shrink-0`}>
              <button
                onClick={handleCreatePost}
                disabled={!newPostContent.trim() || posting}
                className={`w-full py-3 rounded-xl font-semibold transition-colors ${
                  newPostContent.trim() && !posting
                    ? "bg-[#24766f] text-white hover:bg-[#24766f]/90"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {posting ? t("legacy.posting", "Posting...") : t("legacy.post", "Post")}
              </button>
            </div>
          </div>
        </div>
      )}
    </RootsPageShell>
  );
}
