import { useCallback, useEffect, useMemo, useState } from "react";
import { useThemeStore } from "../../store/theme";
import { useTranslation } from "../../context/TranslationContext";
import { api } from "../../api/client";
import {
  getApiErrorMessage,
  getApiRoot,
  requestWithFallback,
  shouldFallbackRoute,
} from "../../api/helpers";
import {
  Upload,
  Trash2,
  Edit,
  X,
  FileText,
  Download,
  Archive,
  File,
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import Toast from "../../components/Toast";

interface Document {
  id: number | string;
  title: string;
  description?: string;
  filePath?: string;
  fileType?: string;
  category?: string;
  archiveSource?: string;
  documentCode?: string;
  isPublic?: boolean;
  createdAt?: string;
}

export default function AdminDocuments() {
  const { theme } = useThemeStore();
  const { t } = useTranslation();
  const isDark = theme === "dark";
  const apiRoot = useMemo(() => getApiRoot(), []);

  const maxFileBytes = 25 * 1024 * 1024;
  const allowedDocExts = new Set(["pdf", "doc", "docx", "txt", "xls", "xlsx"]);

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    archiveSource: "",
    documentCode: "",
    isPublic: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [toast, setToast] = useState({ message: "", tone: "success" });
  const docStats = useMemo(() => {
    const total = documents.length;
    const publicCount = documents.filter((d) => !!d.isPublic).length;
    const withCodes = documents.filter((d) => !!d.documentCode).length;
    return { total, publicCount, withCodes };
  }, [documents]);

  const getExtension = (name: string) => {
    const parts = String(name || "").toLowerCase().split(".");
    return parts.length > 1 ? parts.pop() || "" : "";
  };

  const validateDocFile = (file: File) => {
    if (file.size > maxFileBytes) {
      return t("file_too_large", "File is too large (max 25MB).");
    }
    const ext = getExtension(file.name);
    if (!allowedDocExts.has(ext)) {
      return t("invalid_doc_type", "Only PDF, DOC, DOCX, TXT, XLS, XLSX files are allowed.");
    }
    return "";
  };

  const notify = useCallback((message: string, tone: "success" | "error" = "success") => {
    setToast({ message, tone });
  }, []);

  useEffect(() => {
    if (!toast.message) return;
    const timer = setTimeout(() => {
      setToast({ message: "", tone: "success" });
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast.message]);

  const resolveFileUrl = (value: string | undefined) => {
    const raw = String(value || "").trim();
    if (!raw) return "";
    if (raw.startsWith("http")) return raw;
    let path = raw.startsWith("/") ? raw : `/${raw}`;
    if (!path.startsWith("/uploads/")) {
      path = `/uploads/documents/${raw.replace(/^\/+/, "")}`;
    }
    return `${apiRoot.replace(/\/+$/, "")}${path}`;
  };

  const loadDocuments = useCallback(async ({ notify: notifyToast = false } = {}) => {
    try {
      setLoading(true);
      const shouldFallbackAdminRead = (err: any) =>
        shouldFallbackRoute(err) ||
        err?.response?.status === 401 ||
        err?.response?.status === 403 ||
        err?.response?.status === 500;
      const { data } = await requestWithFallback(
        [
          () => api.get("/admin/documents"),
          () => api.get("/my/documents"),
          () => api.get("/documents"),
        ],
        shouldFallbackAdminRead
      );
      const list =
        (data?.success && Array.isArray(data.data) ? data.data : null) ||
        (Array.isArray(data?.documents) && data.documents) ||
        (Array.isArray(data) && data) ||
        [];
      setDocuments(list);
      if (notifyToast) {
        notify(t("documents_loaded", "Documents loaded."));
      }
    } catch (error) {
      console.error("Failed to load documents:", error);
      setDocuments([]);
      notify(
        getApiErrorMessage(
          error,
          t("documents_load_failed", "Failed to load documents"),
        ),
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [notify, t]);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    loadDocuments({ notify: true });
  }, [loadDocuments]);

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      category: "",
      archiveSource: "",
      documentCode: "",
      isPublic: true,
    });
    setSelectedFile(null);
    setEditingId(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const docError = validateDocFile(file);
    if (docError) {
      notify(docError, "error");
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const handleEdit = (item: Document) => {
    setEditingId(item.id);
    setForm({
      title: item.title || "",
      description: item.description || "",
      category: item.category || "",
      archiveSource: item.archiveSource || "",
      documentCode: item.documentCode || "",
      isPublic: item.isPublic ?? true,
    });
    setSelectedFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) {
      notify(t("fill_required_fields", "Please fill all required fields"), "error");
      return;
    }

    const formData = new FormData();
    if (selectedFile) {
      const docError = validateDocFile(selectedFile);
      if (docError) {
        notify(docError, "error");
        return;
      }
      formData.append("document", selectedFile);
    }
    if (!editingId && !selectedFile) {
      notify(t("file_required", "Please select a file"), "error");
      return;
    }
    formData.append("title", form.title.trim());
    if (form.description.trim()) formData.append("description", form.description.trim());
    formData.append("category", form.category || "");
    formData.append("archiveSource", form.archiveSource || "");
    formData.append("documentCode", form.documentCode || "");
    formData.append("isPublic", String(form.isPublic));

    const shouldFallbackWrite = (err: any) =>
      shouldFallbackRoute(err) ||
      err?.response?.status === 401 ||
      err?.response?.status === 403 ||
      err?.response?.status === 500;

    try {
      setUploading(true);

      if (editingId) {
        await requestWithFallback(
          [
            () => api.put(`/admin/documents/${editingId}`, formData),
            () => api.post(`/admin/documents/${editingId}/save`, formData),
            () => api.put(`/my/documents/${editingId}`, formData),
          ],
          shouldFallbackWrite
        );
        notify(t("document_updated", "Document updated."));
      } else {
        await requestWithFallback(
          [() => api.post("/admin/documents", formData), () => api.post("/my/documents", formData)],
          shouldFallbackWrite
        );
        notify(t("document_created", "Document uploaded."));
      }

      resetForm();
      loadDocuments();
    } catch (error) {
      console.error("Operation failed:", error);
      notify(getApiErrorMessage(error, t("operation_failed", "Operation failed")), "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!window.confirm(t("confirm_delete", "Are you sure you want to delete this item?"))) {
      return;
    }

    try {
      const shouldFallbackWrite = (err: any) =>
        shouldFallbackRoute(err) ||
        err?.response?.status === 401 ||
        err?.response?.status === 403 ||
        err?.response?.status === 500;
      await requestWithFallback(
        [
          () => api.delete(`/admin/documents/${id}`),
          () => api.delete(`/my/documents/${id}`),
        ],
        shouldFallbackWrite
      );
      loadDocuments();
      notify(t("document_deleted", "Document deleted."));
    } catch (error) {
      console.error("Delete failed:", error);
      notify(getApiErrorMessage(error, t("delete_failed", "Failed to delete")), "error");
    }
  };

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
      default:
        return "📁";
    }
  };

  const cardBg = isDark ? "bg-[#0f1f33]" : "bg-white";
  const border = isDark ? "border-[#d9a441]/20" : "border-[#24766f]/20";
  const inputBg = isDark ? "bg-[#071827]" : "bg-[#f7f2e8]";
  const textColor = isDark ? "text-[#f5f1e8]" : "text-[#162238]";

  return (
    <div className={`min-h-screen p-6 ${isDark ? "bg-[#071827]" : "bg-[#f5f1e8]"}`}>
      <Toast message={toast.message} tone={toast.tone} />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8" data-aos="fade-down">
          <h1 className={`text-4xl font-bold font-serif ${isDark ? "text-[#d9a441]" : "text-[#24766f]"} mb-2`}>
            {t("document_management", "Documents Management")}
          </h1>
          <p className={`${textColor} opacity-70`}>
            {t("document_desc", "Upload and manage vital records, certificates, and historical documents")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-3 mb-6">
          <div className={`${cardBg} border ${border} rounded-xl p-3`}><p className="text-xs opacity-70">{t("total", "Total")}</p><p className="text-xl font-bold">{docStats.total}</p></div>
          <div className={`${cardBg} border ${border} rounded-xl p-3`}><p className="text-xs opacity-70">{t("public", "Public")}</p><p className="text-xl font-bold">{docStats.publicCount}</p></div>
          <div className={`${cardBg} border ${border} rounded-xl p-3`}><p className="text-xs opacity-70">{t("coded", "Coded")}</p><p className="text-xl font-bold">{docStats.withCodes}</p></div>
        </div>

        {/* Upload/Edit Form */}
        <div className={`${cardBg} border ${border} rounded-xl p-6 mb-8 shadow-lg`} data-aos="fade-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-bold font-serif ${isDark ? "text-[#d9a441]" : "text-[#24766f]"} flex items-center gap-2`}>
              {editingId ? (
                <>
                  <Edit className="w-6 h-6" />
                  {t("edit_document", "Edit Document")}
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6" />
                  {t("upload_new_document", "Upload New Document")}
                </>
              )}
            </h2>
            {editingId && (
              <button
                onClick={resetForm}
                className={`${textColor} opacity-70 hover:opacity-100 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-500/10 transition`}
              >
                <X className="w-5 h-5" />
                {t("cancel", "Cancel")}
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Input */}
            <div>
              <label className={`block text-sm font-semibold ${textColor} mb-2`}>
                {t("select_file", "Select File")} {!editingId && <span className="text-red-500">*</span>}
              </label>
              <div
                className={`border-2 border-dashed ${border} rounded-lg p-6 text-center cursor-pointer transition hover:border-[#d9a441] hover:bg-[#d9a441]/5`}
                onClick={() => document.getElementById("docInput")?.click()}
              >
                {selectedFile ? (
                  <div className="py-4">
                    <FileText className={`w-12 h-12 mx-auto ${isDark ? "text-[#24766f]" : "text-[#d9a441]"} mb-2`} />
                    <p className={`${textColor} font-medium`}>{selectedFile.name}</p>
                    <p className={`${textColor} opacity-50 text-sm`}>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div className="py-8">
                    <FileText className={`w-16 h-16 mx-auto ${textColor} opacity-20 mb-4`} />
                    <p className={`${textColor} opacity-50 text-lg`}>{t("click_to_upload_document", "Click to upload document")}</p>
                    <p className={`${textColor} opacity-30 text-sm mt-2`}>
                      {t("document_file_formats", "PDF, DOC, DOCX, TXT, XLS, XLSX (max 25MB)")}
                    </p>
                  </div>
                )}
              </div>
              <input
                id="docInput"
                type="file"
                accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Title */}
            <div>
              <label className={`block text-sm font-semibold ${textColor} mb-2`}>
                {t("title", "Title")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg ${inputBg} border ${border} ${textColor} outline-none focus:border-[#d9a441]`}
              />
            </div>

            {/* Category & Archive Source */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-semibold ${textColor} mb-2`}>{t("category", "Category")}</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg ${inputBg} border ${border} ${textColor} outline-none`}
                  placeholder={t("custom_category_placeholder", "Name this category...")}
                />
              </div>
              <div>
                <label className={`block text-sm font-semibold ${textColor} mb-2`}>{t("archive_source", "Archive Source")}</label>
                <input
                  type="text"
                  value={form.archiveSource}
                  onChange={(e) => setForm({ ...form, archiveSource: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg ${inputBg} border ${border} ${textColor} outline-none`}
                />
              </div>
            </div>

            {/* Document Code */}
            <div>
              <label className={`block text-sm font-semibold ${textColor} mb-2`}>{t("document_code", "Document Code")}</label>
              <input
                type="text"
                value={form.documentCode}
                onChange={(e) => setForm({ ...form, documentCode: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg ${inputBg} border ${border} ${textColor} outline-none font-mono`}
              />
            </div>

            {/* Description */}
            <div>
              <label className={`block text-sm font-semibold ${textColor} mb-2`}>{t("description", "Description")}</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className={`w-full px-4 py-3 rounded-lg ${inputBg} border ${border} ${textColor} outline-none resize-none`}
              />
            </div>

            {/* Public Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isPublicDoc"
                checked={form.isPublic}
                onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
                className="w-5 h-5 rounded"
              />
              <label htmlFor="isPublicDoc" className={`${textColor} font-medium`}>
                {t("make_public", "Make Public")}
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading}
              className={`w-full py-3 rounded-lg font-semibold transition ${
                uploading ? "bg-gray-400 cursor-not-allowed" : "bg-[#24766f] text-white hover:bg-[#24766f]/90"
              }`}
            >
              {uploading ? t("uploading", "Uploading...") : editingId ? t("update", "Update") : t("upload", "Upload")}
            </button>
          </form>
        </div>

        {/* Documents List */}
        <div className={`${cardBg} border ${border} rounded-xl p-6 shadow-lg`} data-aos="fade-up">
          <h2 className={`text-2xl font-bold font-serif ${isDark ? "text-[#d9a441]" : "text-[#24766f]"} mb-6`}>
            {t("document_list", "Documents")} ({documents.length})
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-[#d9a441] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className={`w-16 h-16 mx-auto ${textColor} opacity-20 mb-4`} />
              <p className={`${textColor} opacity-70`}>{t("no_documents", "No documents yet.")}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className={`p-4 rounded-lg ${isDark ? "bg-white/5" : "bg-black/5"} hover:shadow-md transition`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{getFileIcon(doc.fileType)}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-bold truncate ${textColor}`}>{doc.title}</h3>
                      <p className="text-xs opacity-60">{doc.category || t("document", "Document")}</p>
                      {doc.documentCode && (
                        <p className="text-xs font-mono opacity-50">{doc.documentCode}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t ${border}">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(doc)}
                        className={`p-2 rounded-lg hover:bg-[#24766f]/20 transition ${textColor} opacity-70 hover:opacity-100`}
                        title={t("edit", "Edit")}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-red-500 transition"
                        title={t("delete", "Delete")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {doc.filePath && (
                      <a
                        href={resolveFileUrl(doc.filePath)}
                        download
                        className="p-2 rounded-lg hover:bg-[#d9a441]/20 text-[#d9a441] transition"
                        title={t("download", "Download")}
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
