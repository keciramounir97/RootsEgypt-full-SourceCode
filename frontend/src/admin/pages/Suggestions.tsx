import { useCallback, useEffect, useState } from "react";
import { useThemeStore } from "../../store/theme";
import { useLanguage } from "../../i18n";
import { api } from "../../api/client";
import {
  getApiErrorMessage,
  requestWithFallback,
  shouldFallbackRoute,
} from "../../api/helpers";
import {
  Check,
  X,
  Music,
  Image,
  BookOpen,
  FileText,
  Newspaper,
  Network,
  MessageSquare,
  Filter,
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import Toast from "../../components/Toast";

interface Suggestion {
  id: number | string;
  type: "audio_category" | "image_category" | "book_category" | "document_category" | "article_category" | "tree_category" | "content";
  category?: string;
  contentTitle?: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  message: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export default function AdminSuggestions() {
  const { theme } = useThemeStore();
  const { t } = useLanguage();
  const isDark = theme === "dark";

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [toast, setToast] = useState({ message: "", tone: "success" });

  const notify = useCallback((message: string, tone: "success" | "error" = "success") => {
    setToast({ message, tone });
  }, []);

  const normalizeSuggestion = useCallback((item: any): Suggestion => ({
    ...item,
    id: item.id,
    type: item.type || "content",
    category: item.category || "",
    contentTitle: item.contentTitle ?? item.content_title ?? "",
    userId: String(item.userId ?? item.user_id ?? "visitor"),
    userName: item.userName ?? item.user_name ?? item.fullName ?? item.full_name ?? "Visitor",
    userEmail: item.userEmail ?? item.user_email ?? item.email ?? "Not provided",
    userPhone: item.userPhone ?? item.user_phone ?? "",
    message: item.message || "",
    status: item.status || "pending",
    createdAt: item.createdAt ?? item.created_at ?? new Date().toISOString(),
  }), []);

  useEffect(() => {
    if (!toast.message) return;
    const timer = setTimeout(() => {
      setToast({ message: "", tone: "success" });
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast.message]);

  const loadSuggestions = useCallback(async () => {
    try {
      setLoading(true);
      const shouldFallback = (err: any) => shouldFallbackRoute(err);

      const { data } = await requestWithFallback(
        [
          () => api.get("/admin/suggestions"),
          () => api.get("/suggestions"),
        ],
        shouldFallback
      );

      const list =
        (data?.success && Array.isArray(data.data) ? data.data : null) ||
        (Array.isArray(data?.suggestions) && data.suggestions) ||
        (Array.isArray(data) && data) ||
        [];

      setSuggestions(list.map(normalizeSuggestion));
    } catch (error) {
      console.error("Failed to load suggestions:", error);
      notify(getApiErrorMessage(error, "Failed to load suggestions"), "error");
    } finally {
      setLoading(false);
    }
  }, [normalizeSuggestion, notify]);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    loadSuggestions();
  }, [loadSuggestions]);

  const handleApprove = async (id: number | string) => {
    try {
      const shouldFallback = (err: any) => shouldFallbackRoute(err);

      await requestWithFallback(
        [
          () => api.put(`/admin/suggestions/${id}/approve`),
          () => api.post(`/admin/suggestions/${id}/approve`),
          () => api.post(`/suggestions/${id}/approve`),
        ],
        shouldFallback
      );

      setSuggestions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: "approved" } : s))
      );
      notify(t("legacy.suggestion_approved", "Suggestion approved successfully!"));
    } catch (error) {
      console.error("Failed to approve suggestion:", error);
      notify(getApiErrorMessage(error, "Failed to approve suggestion"), "error");
    }
  };

  const handleReject = async (id: number | string) => {
    try {
      const shouldFallback = (err: any) => shouldFallbackRoute(err);

      await requestWithFallback(
        [
          () => api.put(`/admin/suggestions/${id}/reject`),
          () => api.post(`/admin/suggestions/${id}/reject`),
          () => api.post(`/suggestions/${id}/reject`),
        ],
        shouldFallback
      );

      setSuggestions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: "rejected" } : s))
      );
      notify(t("legacy.suggestion_rejected", "Suggestion rejected."));
    } catch (error) {
      console.error("Failed to reject suggestion:", error);
      notify(getApiErrorMessage(error, "Failed to reject suggestion"), "error");
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "audio_category":
        return <Music className="w-4 h-4" />;
      case "image_category":
        return <Image className="w-4 h-4" />;
      case "book_category":
        return <BookOpen className="w-4 h-4" />;
      case "document_category":
        return <FileText className="w-4 h-4" />;
      case "article_category":
        return <Newspaper className="w-4 h-4" />;
      case "tree_category":
        return <Network className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "audio_category":
        return "Audio Category";
      case "image_category":
        return "Image Category";
      case "book_category":
        return "Book Category";
      case "document_category":
        return "Document Category";
      case "article_category":
        return "Article Category";
      case "tree_category":
        return "Tree Category";
      default:
        return "Content";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredSuggestions = suggestions.filter((s) => {
    if (filter !== "all" && s.status !== filter) return false;
    if (typeFilter !== "all" && s.type !== typeFilter) return false;
    return true;
  });

  const cardBg = isDark ? "bg-[#0f1f33]" : "bg-white";
  const border = isDark ? "border-[#d9a441]/20" : "border-[#24766f]/20";
  const textColor = isDark ? "text-[#f5f1e8]" : "text-[#162238]";

  return (
    <div className={`min-h-screen p-6 ${isDark ? "bg-[#071827]" : "bg-[#f5f1e8]"}`}>
      <Toast message={toast.message} tone={toast.tone} />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8" data-aos="fade-down">
          <h1 className={`text-4xl font-bold font-serif ${isDark ? "text-[#d9a441]" : "text-[#24766f]"} mb-2`}>
            {t("legacy.suggestions_management", "Suggestions & Requests")}
          </h1>
          <p className={`${textColor} opacity-70`}>
            {t("legacy.suggestions_desc", "Review and approve user-submitted category suggestions and content requests")}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6" data-aos="fade-up">
          <div className={`${cardBg} border ${border} rounded-xl p-4 text-center`}>
            <p className="text-3xl font-bold text-[#d9a441]">{suggestions.filter((s) => s.status === "pending").length}</p>
            <p className={`text-sm ${textColor} opacity-70`}>{t("legacy.pending", "Pending")}</p>
          </div>
          <div className={`${cardBg} border ${border} rounded-xl p-4 text-center`}>
            <p className="text-3xl font-bold text-green-500">{suggestions.filter((s) => s.status === "approved").length}</p>
            <p className={`text-sm ${textColor} opacity-70`}>{t("legacy.approved", "Approved")}</p>
          </div>
          <div className={`${cardBg} border ${border} rounded-xl p-4 text-center`}>
            <p className="text-3xl font-bold text-red-500">{suggestions.filter((s) => s.status === "rejected").length}</p>
            <p className={`text-sm ${textColor} opacity-70`}>{t("legacy.rejected", "Rejected")}</p>
          </div>
          <div className={`${cardBg} border ${border} rounded-xl p-4 text-center`}>
            <p className="text-3xl font-bold text-[#24766f]">{suggestions.length}</p>
            <p className={`text-sm ${textColor} opacity-70`}>{t("legacy.total", "Total")}</p>
          </div>
        </div>

        {/* Filters */}
        <div className={`${cardBg} border ${border} rounded-xl p-4 mb-6 flex flex-wrap gap-4`} data-aos="fade-up">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 opacity-50" />
            <span className={`text-sm font-medium ${textColor}`}>{t("legacy.status", "Status")}:</span>
          </div>
          <div className="flex gap-2">
            {(["all", "pending", "approved", "rejected"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-sm transition ${
                  filter === f
                    ? "bg-[#24766f] text-white"
                    : isDark
                    ? "bg-white/10 hover:bg-white/20"
                    : "bg-black/10 hover:bg-black/20"
                }`}
              >
                {t(f, f.charAt(0).toUpperCase() + f.slice(1))}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-4">
            <span className={`text-sm font-medium ${textColor}`}>{t("legacy.type", "Type")}:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={`px-3 py-1 rounded-lg ${isDark ? "bg-white/10" : "bg-black/10"} ${textColor} text-sm outline-none`}
            >
              <option value="all">{t("legacy.all_types", "All Types")}</option>
              <option value="audio_category">{t("legacy.audio", "Audio")}</option>
              <option value="image_category">{t("legacy.images", "Images")}</option>
              <option value="book_category">{t("legacy.books", "Books")}</option>
              <option value="document_category">{t("legacy.documents", "Documents")}</option>
              <option value="article_category">{t("legacy.articles", "Articles")}</option>
              <option value="tree_category">{t("legacy.trees", "Trees")}</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className={`${cardBg} border ${border} rounded-xl overflow-hidden shadow-lg`} data-aos="fade-up">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-[#d9a441] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className={textColor}>{t("legacy.loading", "Loading...")}</p>
            </div>
          ) : filteredSuggestions.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className={`w-16 h-16 mx-auto ${textColor} opacity-20 mb-4`} />
              <p className={`${textColor} opacity-70`}>{t("legacy.no_suggestions", "No suggestions found.")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${isDark ? "bg-white/5" : "bg-black/5"}`}>
                  <tr>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${textColor}`}>{t("legacy.user", "User")}</th>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${textColor}`}>{t("legacy.type", "Type")}</th>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${textColor}`}>{t("legacy.category", "Category")}</th>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${textColor}`}>{t("legacy.message", "Message")}</th>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${textColor}`}>{t("legacy.date", "Date")}</th>
                    <th className={`px-4 py-3 text-center text-sm font-semibold ${textColor}`}>{t("legacy.actions", "Actions")}</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${border}`}>
                  {filteredSuggestions.map((suggestion) => (
                    <tr key={suggestion.id} className="hover:bg-white/5 transition">
                      <td className="px-4 py-4">
                        <div>
                          <p className={`font-medium ${textColor}`}>{suggestion.userName}</p>
                          <p className="text-xs opacity-60">{suggestion.userEmail}</p>
                          {suggestion.userPhone && (
                            <p className="text-xs opacity-50">{suggestion.userPhone}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                          isDark ? "bg-white/10" : "bg-black/10"
                        }`}>
                          {getTypeIcon(suggestion.type)}
                          {getTypeLabel(suggestion.type)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`font-medium ${textColor}`}>{suggestion.category || "-"}</span>
                      </td>
                      <td className="px-4 py-4 max-w-xs">
                        <p className={`text-sm ${textColor} opacity-80 line-clamp-2`}>{suggestion.message}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className={`text-sm ${textColor} opacity-70`}>{formatDate(suggestion.createdAt)}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {suggestion.status === "pending" ? (
                            <>
                              <button
                                onClick={() => handleApprove(suggestion.id)}
                                className="p-2 rounded-lg bg-green-500/20 text-green-500 hover:bg-green-500/30 transition"
                                title={t("legacy.approve", "Approve")}
                              >
                                <Check className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleReject(suggestion.id)}
                                className="p-2 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition"
                                title={t("legacy.reject", "Reject")}
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </>
                          ) : suggestion.status === "approved" ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-500 text-sm">
                              <Check className="w-4 h-4" />
                              {t("legacy.approved", "Approved")}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/20 text-red-500 text-sm">
                              <X className="w-4 h-4" />
                              {t("legacy.rejected", "Rejected")}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
