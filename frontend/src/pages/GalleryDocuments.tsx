import { useEffect, useMemo, useState } from "react";
import { useThemeStore } from "../store/theme";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  Heart,
  MessageCircle,
  Share2,
  Upload,
  Search,
  FileText,
  X,
  Send,
  Archive,
} from "lucide-react";
import { api } from "../api/client";
import { getApiErrorMessage, getApiRoot } from "../api/helpers";
import { useLanguage } from "../i18n";
import RootsPageShell from "../components/RootsPageShell";
import RequestDownloadButton from "../components/RequestDownloadButton";

interface Document {
  id: number | string;
  title: string;
  description?: string;
  category?: string;
  filePath?: string;
  file_path?: string;
  fileType?: string;
  file_type?: string;
  archiveSource?: string;
  documentCode?: string;
  date?: string;
  createdAt?: string;
  created_at?: string;
  likes?: number;
  comments?: Comment[];
  isLiked?: boolean;
}

interface Comment {
  id: number | string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

const sortByDateDesc = (items: Document[]) =>
  [...items].sort((a, b) => {
    const aDate = a?.createdAt ?? a?.created_at;
    const bDate = b?.createdAt ?? b?.created_at;
    const da = aDate ? new Date(aDate).getTime() : 0;
    const db = bDate ? new Date(bDate).getTime() : 0;
    return db - da;
  });

const getFileIcon = (fileType?: string) => {
  switch (fileType?.toLowerCase()) {
    case "pdf":
      return "📄";
    case "doc":
    case "docx":
      return "📝";
    case "xls":
    case "xlsx":
      return "📊";
    case "txt":
      return "📃";
    default:
      return "📁";
  }
};

export default function GalleryDocuments() {
  const { theme } = useThemeStore();
  const { t } = useLanguage();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [newComment, setNewComment] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    category: "",
    archiveSource: "",
    documentCode: "",
  });

  const apiRoot = useMemo(() => getApiRoot(), []);

  const fileUrl = (path: string | undefined) => {
    if (!path) return "";
    const raw = String(path).trim();
    if (raw.startsWith("http")) return raw;
    const p = raw.startsWith("/") ? raw : `/${raw}`;
    return `${apiRoot.replace(/\/+$/, "")}${p}`;
  };

  useEffect(() => {
    AOS.init({ duration: 900, once: true });
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await api.get("/documents");
        if (!mounted) return;
        const items = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.documents)
            ? data.documents
            : Array.isArray(data)
              ? data
              : [];
        setDocuments(
          items.map((item: any) => ({
            ...item,
            likes: item.likes || 0,
            comments: item.comments || [],
            isLiked: false,
          })),
        );
      } catch (err) {
        if (!mounted) return;
        setError(
          getApiErrorMessage(
            err,
            t("legacy.documents_load_failed", "Failed to load documents"),
          ),
        );
        setDocuments([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [t]);

  const filteredDocuments = useMemo(() => {
    let result = documents;

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (doc) =>
          doc.title?.toLowerCase().includes(q) ||
          doc.description?.toLowerCase().includes(q) ||
          doc.archiveSource?.toLowerCase().includes(q) ||
          doc.documentCode?.toLowerCase().includes(q),
      );
    }

    if (categoryFilter !== "all") {
      result = result.filter((doc) => doc.category === categoryFilter);
    }

    return sortByDateDesc(result);
  }, [documents, query, categoryFilter]);

  const categories = useMemo(() => {
    const cats = new Set(documents.map((d) => d.category).filter(Boolean));
    return ["all", ...Array.from(cats)] as string[];
  }, [documents]);

  const handleLike = (docId: number | string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === docId
          ? {
              ...doc,
              isLiked: !doc.isLiked,
              likes: doc.isLiked ? (doc.likes || 0) - 1 : (doc.likes || 0) + 1,
            }
          : doc
      )
    );
    if (selectedDocument?.id === docId) {
      setSelectedDocument((prev) =>
        prev
          ? {
              ...prev,
              isLiked: !prev.isLiked,
              likes: prev.isLiked ? (prev.likes || 0) - 1 : (prev.likes || 0) + 1,
            }
          : null
      );
    }
  };

  const handleComment = (docId: number | string) => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now(),
      userId: "user",
      userName: t("legacy.you", "You"),
      text: newComment,
      createdAt: new Date().toISOString(),
    };

    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === docId
          ? { ...doc, comments: [...(doc.comments || []), comment] }
          : doc
      )
    );

    if (selectedDocument?.id === docId) {
      setSelectedDocument((prev) =>
        prev ? { ...prev, comments: [...(prev.comments || []), comment] } : null
      );
    }

    setNewComment("");
  };

  const handleUpload = () => {
    const newDoc: Document = {
      id: Date.now(),
      title: uploadForm.title,
      description: uploadForm.description,
      category: uploadForm.category,
      archiveSource: uploadForm.archiveSource,
      documentCode: uploadForm.documentCode,
      fileType: "PDF",
      likes: 0,
      comments: [],
      isLiked: false,
      createdAt: new Date().toISOString(),
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setShowUploadModal(false);
    setUploadForm({ title: "", description: "", category: "", archiveSource: "", documentCode: "" });
  };

  const isDark = theme === "dark";
  const borderColor = isDark ? "border-[#1a3048]" : "border-[#e8e4dc]";
  const cardBg = isDark ? "bg-[#0f1f33]" : "bg-white";

  return (
    <RootsPageShell
      hero={
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <FileText className="w-12 h-12 text-[#d9a441]" />
          </div>
          <p className="text-sm uppercase tracking-[0.3em] text-[#d9a441]">
            {t("legacy.family_collections", "Family Collections")}
          </p>
          <h1 className="text-5xl font-bold">
            {t("legacy.documents", "Documents Archive")}
          </h1>
          <p className="max-w-4xl mx-auto text-lg opacity-90">
            {t("legacy.documents_intro",
              "Access vital records, certificates, immigration papers, and historical documents. Upload and share your family documents.",
            )}
          </p>
        </div>
      }
    >
      {/* Search and Filter */}
      <section className="roots-section roots-section-alt" data-aos="fade-up">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-3 text-[#24766f] opacity-80 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("legacy.search_documents_placeholder", "Search documents...")}
              className={`w-full pl-10 py-3 rounded-xl bg-transparent border ${borderColor} outline-none focus:border-[#d9a441] transition-colors ${
                isDark ? "text-white placeholder-white/50" : "text-[#162238] placeholder-[#162238]/50"
              }`}
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={`px-4 py-3 rounded-xl bg-transparent border ${borderColor} outline-none ${
                isDark ? "text-white" : "text-[#162238]"
              }`}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all" ? t("legacy.all_categories", "All Categories") : cat}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#24766f] text-white font-semibold hover:bg-[#24766f]/90 transition-colors shadow-lg"
            >
              <Upload className="w-5 h-5" />
              {t("legacy.upload_document", "Upload Document")}
            </button>
          </div>
        </div>
      </section>

      {loading ? (
        <section className="roots-section">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-[#d9a441] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-lg opacity-70">{t("legacy.loading", "Loading...")}</p>
          </div>
        </section>
      ) : error ? (
        <section className="roots-section">
          <div className="text-center text-red-500 font-semibold py-10">{error}</div>
        </section>
      ) : (
        <section className="roots-section" data-aos="fade-up">
          <h2 className="text-3xl font-bold border-l-8 border-[#d9a441] pl-4 mb-8">
            {t("legacy.documents", "Documents")} <span className="text-[#24766f]">({filteredDocuments.length})</span>
          </h2>

          {filteredDocuments.length === 0 ? (
            <div className={`${cardBg} p-12 rounded-2xl shadow-xl border ${borderColor} text-center`}>
              <FileText className="w-16 h-16 mx-auto text-[#24766f]/50 mb-4" />
              <p className="text-xl opacity-70">{t("legacy.no_documents_found", "No documents found.")}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.map((doc, index) => (
                <div
                  key={doc.id}
                  className={`group ${cardBg} border ${borderColor} rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer`}
                  data-aos="fade-up"
                  data-aos-delay={index * 50}
                  onClick={() => setSelectedDocument(doc)}
                >
                  {/* File Type Header */}
                  <div className="h-24 bg-gradient-to-br from-[#0f2742]/10 via-[#24766f]/10 to-[#d9a441]/10 flex items-center justify-center relative">
                    <div className="text-4xl">{getFileIcon(doc.fileType ?? doc.file_type)}</div>
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-1 rounded-full text-xs bg-[#24766f]/20 text-[#24766f]">
                        {doc.fileType || doc.file_type || t("legacy.file", "File").toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-bold text-lg truncate group-hover:text-[#d9a441] transition-colors">
                      {doc.title}
                    </h3>
                    {doc.archiveSource && (
                      <p className="text-sm opacity-70 flex items-center gap-1 mt-1">
                        <Archive className="w-3 h-3" />
                        {doc.archiveSource}
                      </p>
                    )}
                    {doc.documentCode && (
                      <p className="text-xs opacity-50 font-mono mt-1">{doc.documentCode}</p>
                    )}

                    <div className={`flex items-center justify-between mt-4 pt-3 border-t ${borderColor}`}>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(doc.id);
                          }}
                          className={`flex items-center gap-1 transition-colors ${
                            doc.isLiked ? "text-red-500" : "opacity-70 hover:text-red-500"
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${doc.isLiked ? "fill-current" : ""}`} />
                          <span className="text-xs">{doc.likes || 0}</span>
                        </button>
                        <div className="flex items-center gap-1 opacity-70">
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-xs">{doc.comments?.length || 0}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="opacity-70 hover:opacity-100 transition-opacity"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Document Detail Modal */}
      {selectedDocument && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedDocument(null)}
        >
          <div
            className={`w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col ${cardBg} border ${borderColor}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`p-6 border-b ${borderColor} flex items-start justify-between`}>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#24766f]/20 to-[#d9a441]/10 flex items-center justify-center shrink-0 text-3xl">
                  {getFileIcon(selectedDocument.fileType ?? selectedDocument.file_type)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{selectedDocument.title}</h3>
                  {selectedDocument.category && (
                    <span className="inline-block mt-2 px-2 py-1 rounded-full text-xs bg-[#24766f]/20 text-[#24766f]">
                      {selectedDocument.category}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedDocument(null)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6 space-y-4">
              {selectedDocument.description && (
                <p className="opacity-80">{selectedDocument.description}</p>
              )}

              <div className="grid grid-cols-2 gap-3">
                {selectedDocument.archiveSource && (
                  <div className={`p-3 rounded-xl ${isDark ? "bg-white/5" : "bg-black/5"}`}>
                    <p className="text-xs uppercase opacity-60 mb-1">{t("legacy.archive_source", "Archive Source")}</p>
                    <p className="font-medium flex items-center gap-1">
                      <Archive className="w-4 h-4 text-[#24766f]" />
                      {selectedDocument.archiveSource}
                    </p>
                  </div>
                )}
                {selectedDocument.documentCode && (
                  <div className={`p-3 rounded-xl ${isDark ? "bg-white/5" : "bg-black/5"}`}>
                    <p className="text-xs uppercase opacity-60 mb-1">{t("legacy.document_code", "Document Code")}</p>
                    <p className="font-medium font-mono text-sm">{selectedDocument.documentCode}</p>
                  </div>
                )}
                {selectedDocument.date && (
                  <div className={`p-3 rounded-xl ${isDark ? "bg-white/5" : "bg-black/5"}`}>
                    <p className="text-xs uppercase opacity-60 mb-1">{t("legacy.date", "Date")}</p>
                    <p className="font-medium flex items-center gap-1">
                      <Archive className="w-4 h-4 text-[#24766f]" />
                      {selectedDocument.date}
                    </p>
                  </div>
                )}
                <div className={`p-3 rounded-xl ${isDark ? "bg-white/5" : "bg-black/5"}`}>
                  <p className="text-xs uppercase opacity-60 mb-1">{t("legacy.file_type", "File Type")}</p>
                  <p className="font-medium">{selectedDocument.fileType || selectedDocument.file_type || t("legacy.unknown", "Unknown")}</p>
                </div>
              </div>

              {/* Actions */}
              <div className={`flex items-center gap-3 py-4 border-y ${borderColor}`}>
                <button
                  onClick={() => handleLike(selectedDocument.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                    selectedDocument.isLiked
                      ? "bg-red-500/20 text-red-500"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${selectedDocument.isLiked ? "fill-current" : ""}`} />
                  <span>{selectedDocument.likes || 0}</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <Share2 className="w-5 h-5" />
                  {t("legacy.share", "Share")}
                </button>
                {(selectedDocument.filePath || selectedDocument.file_path) && (
                  <RequestDownloadButton
                    contentType="document"
                    contentId={selectedDocument.id}
                    downloadHref={`${apiRoot}/api/documents/${selectedDocument.id}/download`}
                    fileName={`${String(selectedDocument.title || "document").trim().replace(/[^\w.-]+/g, "_") || "document"}`}
                  />
                )}
              </div>

              {/* Comments */}
              <div className="space-y-3">
                <h4 className="font-semibold">{t("legacy.comments", "Comments")}</h4>
                <div className="space-y-2 max-h-40 overflow-auto">
                  {(selectedDocument.comments || []).map((comment) => (
                    <div key={comment.id} className={`p-3 rounded-xl ${isDark ? "bg-white/5" : "bg-black/5"}`}>
                      <p className="text-sm font-medium">{comment.userName}</p>
                      <p className="text-sm opacity-80">{comment.text}</p>
                    </div>
                  ))}
                  {(!selectedDocument.comments || selectedDocument.comments.length === 0) && (
                    <p className="text-sm opacity-50">{t("legacy.no_comments", "No comments yet.")}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Comment Input */}
            <div className={`p-4 border-t ${borderColor}`}>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={t("legacy.write_comment", "Write a comment...")}
                  className={`flex-1 px-4 py-2 rounded-xl bg-transparent border ${borderColor} outline-none focus:border-[#d9a441] transition-colors`}
                  onKeyDown={(e) => e.key === "Enter" && handleComment(selectedDocument.id)}
                />
                <button
                  onClick={() => handleComment(selectedDocument.id)}
                  className="p-2 rounded-xl bg-[#24766f] text-white hover:bg-[#24766f]/90 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowUploadModal(false)}
        >
          <div
            className={`w-full max-w-lg rounded-2xl shadow-2xl p-6 ${cardBg} border ${borderColor}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">{t("legacy.upload_document", "Upload Document")}</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder={t("legacy.title", "Title")}
                value={uploadForm.title}
                onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl bg-transparent border ${borderColor} outline-none focus:border-[#d9a441]`}
              />
              <input
                type="text"
                value={uploadForm.category}
                onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                placeholder={t("legacy.custom_category_placeholder", "Name this category...")}
                className={`w-full px-4 py-3 rounded-xl bg-transparent border ${borderColor} outline-none focus:border-[#d9a441]`}
              />
              <input
                type="text"
                placeholder={t("legacy.archive_source", "Archive Source")}
                value={uploadForm.archiveSource}
                onChange={(e) => setUploadForm({ ...uploadForm, archiveSource: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl bg-transparent border ${borderColor} outline-none focus:border-[#d9a441]`}
              />
              <input
                type="text"
                placeholder={t("legacy.document_code", "Document Code")}
                value={uploadForm.documentCode}
                onChange={(e) => setUploadForm({ ...uploadForm, documentCode: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl bg-transparent border ${borderColor} outline-none focus:border-[#d9a441]`}
              />
              <textarea
                placeholder={t("legacy.description", "Description")}
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                rows={3}
                className={`w-full px-4 py-3 rounded-xl bg-transparent border ${borderColor} outline-none focus:border-[#d9a441] resize-none`}
              />
              <div className={`border-2 border-dashed ${borderColor} rounded-xl p-6 text-center`}>
                <Upload className="w-8 h-8 mx-auto text-[#24766f] mb-2" />
                <p className="text-sm opacity-70">
                  {t("legacy.upload_document_file", "Upload document file")}
                </p>
                <input type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" />
              </div>
              <button
                onClick={handleUpload}
                className="w-full py-3 rounded-xl bg-[#24766f] text-white font-semibold hover:bg-[#24766f]/90 transition-colors"
              >
                {t("legacy.upload", "Upload")}
              </button>
            </div>
          </div>
        </div>
      )}
    </RootsPageShell>
  );
}
