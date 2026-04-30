import { useCallback, useEffect, useState } from "react";
import { useThemeStore } from "../../store/theme";
import { useTranslation } from "../../context/TranslationContext";
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
import Toast from "../../components/Toast";

interface Suggestion {
  id: number | string;
  type: "audio_category" | "image_category" | "book_category" | "document_category" | "article_category" | "tree_category" | "content";
  category?: string;
  contentTitle?: string;
  content?: string;
  status?: string;
  createdAt?: string;
  [key: string]: unknown;
}

const typeIcons: Record<string, typeof Music> = {
  audio_category: Music,
  image_category: Image,
  book_category: BookOpen,
  document_category: FileText,
  article_category: Newspaper,
  tree_category: Network,
  content: MessageSquare,
};

export default function AdminSuggestions() {
  const { theme } = useThemeStore();
  const { t } = useTranslation();
  const isDark = theme === "dark";

  const pageBg = isDark ? "bg-[#0d1b2a]" : "bg-[#f5f1e8]";
  const text = isDark ? "text-[#f8f5ef]" : "text-[#0d1b2a]";
  const card = isDark ? "bg-[#0d1b2a]" : "bg-white";
  const border = isDark ? "border-white/10" : "border-black/10";
  const muted = isDark ? "text-[#7a8fa3]" : "text-gray-500";

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", tone: "success" });
  const [filterType, setFilterType] = useState<string>("all");

  const notify = useCallback((message: string, tone = "success") => {
    setToast({ message, tone });
  }, []);

  useEffect(() => {
    if (!toast.message) return;
    const timer = setTimeout(() => setToast({ message: "", tone: "success" }), 3500);
    return () => clearTimeout(timer);
  }, [toast.message]);

  const loadSuggestions = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await requestWithFallback([
        () => api.get("/admin/suggestions"),
        () => api.get("/suggestions"),
      ]);
      setSuggestions(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      notify(getApiErrorMessage(err, "Failed to load suggestions"), "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  const handleApprove = async (id: number | string) => {
    try {
      await api.patch(`/admin/suggestions/${id}`, { status: "approved" });
      notify(t("suggestionApproved", "Suggestion approved"));
      loadSuggestions();
    } catch (err: unknown) {
      notify(getApiErrorMessage(err, "Failed to approve suggestion"), "error");
    }
  };

  const handleReject = async (id: number | string) => {
    try {
      await api.patch(`/admin/suggestions/${id}`, { status: "rejected" });
      notify(t("suggestionRejected", "Suggestion rejected"));
      loadSuggestions();
    } catch (err: unknown) {
      notify(getApiErrorMessage(err, "Failed to reject suggestion"), "error");
    }
  };

  const filtered = filterType === "all" ? suggestions : suggestions.filter((s) => s.type === filterType);
  const types = [...new Set(suggestions.map((s) => s.type))];

  return (
    <div className={`min-h-screen ${pageBg} ${text} p-6`}>
      <Toast message={toast.message} tone={toast.tone} />
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-cinzel font-bold mb-6 flex items-center gap-3">
          <MessageSquare className="w-7 h-7 text-teal" />
          {t("adminSuggestions", "Suggestions")}
        </h1>

        {/* Filter */}
        <div className="flex items-center gap-3 mb-6">
          <Filter className="w-5 h-5 text-teal" />
          <select
            value={filterType}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterType(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${border} ${isDark ? "bg-white/5" : "bg-black/5"} outline-none`}
          >
            <option value="all">{t("allTypes", "All Types")}</option>
            {types.map((type) => (
              <option key={type} value={type}>{type.replace("_category", "").replace("_", " ")}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-3 border-teal border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className={`${muted} text-center py-12`}>{t("noSuggestions", "No suggestions")}</p>
        ) : (
          <div className="space-y-4">
            {filtered.map((s) => {
              const Icon = typeIcons[s.type] || MessageSquare;
              return (
                <div key={s.id} className={`${card} border ${border} rounded-xl p-4`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Icon className="w-5 h-5 text-teal mt-0.5" />
                      <div>
                        <p className="font-semibold">{s.category || s.contentTitle || s.type}</p>
                        {s.content && <p className={`text-sm ${muted} mt-1`}>{s.content}</p>}
                        <div className="flex items-center gap-3 mt-2 text-sm">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${isDark ? "bg-teal/15 text-teal" : "bg-teal/10 text-teal"}`}>{s.type.replace("_category", "")}</span>
                          {s.status && <span className={muted}>{s.status}</span>}
                          {s.createdAt && <span className={muted}>{new Date(s.createdAt).toLocaleDateString()}</span>}
                        </div>
                      </div>
                    </div>
                    {s.status !== "approved" && s.status !== "rejected" && (
                      <div className="flex gap-2">
                        <button onClick={() => handleApprove(s.id)} className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg"><Check className="w-4 h-4" /></button>
                        <button onClick={() => handleReject(s.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><X className="w-4 h-4" /></button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
