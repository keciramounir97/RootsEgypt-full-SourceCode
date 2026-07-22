import { useState, useEffect, useRef } from "react";
import { useLanguage as useTranslation } from "../../i18n";
import { api } from "../../api/client";
import { Search, StickyNote, Trash2, Eye, Loader2, Plus, Edit3, X, ImagePlus } from "lucide-react";
import { useThemeStore } from "../../store/theme";

interface AdminNote {
  id: number;
  title: string;
  user_id: number;
  user_email?: string;
  created_at: string;
  content: string;
  image_url?: string;
}

export default function AdminNotes() {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
  const { t } = useTranslation();
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewNote, setViewNote] = useState<AdminNote | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<AdminNote | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formImage, setFormImage] = useState<File | null>(null);
  const [formPreview, setFormPreview] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const rowText = "text-gray-900 dark:text-white";
  const thBg = "bg-[var(--brand-teal)]";
  const thText = "text-white";
  const rowBg = "bg-white dark:bg-gray-800";
  const rowHover = "hover:bg-[#f5f1e8] dark:hover:bg-gray-700";

  const fetchNotes = async () => {
    try {
      const { data } = await api.get("/admin/notes");
      setNotes(Array.isArray(data) ? data : data?.data || []);
    } catch { setNotes([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchNotes(); }, []);

  const filtered = notes.filter(n => n.title.toLowerCase().includes(search.toLowerCase()));

  const deleteNote = async (id: number) => {
    setNotes(notes.filter(n => n.id !== id));
    if (viewNote?.id === id) setViewNote(null);
    try { await api.delete(`/admin/notes/${id}`); } catch {}
  };

  const openAddForm = () => {
    setEditingNote(null);
    setFormTitle("");
    setFormContent("");
    setFormImage(null);
    setFormPreview("");
    setShowForm(true);
  };

  const openEditForm = (note: AdminNote) => {
    setEditingNote(note);
    setFormTitle(note.title);
    setFormContent(note.content);
    setFormImage(null);
    setFormPreview(note.image_url || "");
    setShowForm(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormImage(file);
      setFormPreview(URL.createObjectURL(file));
    }
  };

  const submitForm = async () => {
    if (!formTitle.trim()) return;
    try {
      const formData = new FormData();
      formData.append("title", formTitle);
      formData.append("content", formContent);
      if (formImage) formData.append("image", formImage);

      if (editingNote) {
        await api.patch(`/admin/notes/${editingNote.id}`, formData);
        setNotes(notes.map(n => n.id === editingNote.id ? { ...n, title: formTitle, content: formContent, image_url: formPreview || n.image_url } : n));
      } else {
        const { data } = await api.post("/admin/notes", formData);
        if (data?.id) setNotes([data, ...notes]);
        else fetchNotes();
      }
    } catch {}
    setShowForm(false);
  };

  if (loading) return <div className="p-6 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--brand-gold)]" /></div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <StickyNote className="w-8 h-8 text-[var(--brand-gold)]" />
          <h1 className="text-2xl font-bold font-cinzel text-[var(--text-color)]">
            {t("all_notes", "All Notes")}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isDark ? "text-[#134E4A]/60" : "text-white/60"}`} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t("search", "Search...")}
              className={`pl-9 pr-4 py-2 rounded-xl text-sm w-48 font-medium transition-all outline-none border border-transparent
                ${isDark 
                  ? "bg-white text-[#134E4A] placeholder:text-[#134E4A]/60 focus:ring-2 focus:ring-[#C39637]/30" 
                  : "bg-[#134E4A] text-white placeholder:text-white/60 focus:ring-2 focus:ring-[#C39637]/30"}`}
            />
          </div>
          <button onClick={openAddForm} className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--brand-gold)] text-white font-semibold text-sm hover:shadow-lg transition-all">
            <Plus className="w-4 h-4" />
            {t("add_note", "Add Note")}
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="mb-6 p-6 rounded-2xl border border-[var(--border-color)] bg-white dark:bg-gray-900 shadow-lg">
          <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
            {editingNote ? t("edit_note", "Edit Note") : t("add_note", "Add Note")}
          </h3>
          <div className="space-y-4">
            <input
              value={formTitle}
              onChange={e => setFormTitle(e.target.value)}
              placeholder={t("note_title", "Note title...")}
              className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-gray-50 dark:bg-[#071412] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[var(--brand-gold)] outline-none"
            />
            <textarea
              value={formContent}
              onChange={e => setFormContent(e.target.value)}
              placeholder={t("note_content", "Note content...")}
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-gray-50 dark:bg-[#071412] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:ring-2 focus:ring-[var(--brand-gold)] outline-none"
            />
            <div className="flex items-center gap-4">
              <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-[var(--brand-gold)] text-[var(--brand-gold)] hover:bg-[var(--brand-gold)]/10 transition-colors text-sm">
                <ImagePlus className="w-4 h-4" />
                {t("upload_image", "Upload Image")}
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              {formPreview && (
                <img src={formPreview} alt="Preview" className="w-16 h-16 rounded-lg object-cover border border-[var(--border-color)]" />
              )}
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowForm(false)} className="px-5 py-2 rounded-xl border border-[var(--border-color)] text-gray-700 dark:text-gray-300 text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                {t("cancel", "Cancel")}
              </button>
              <button onClick={submitForm} className="px-5 py-2 rounded-xl bg-[var(--brand-gold)] text-white font-semibold text-sm hover:shadow-lg transition-all">
                {editingNote ? t("update_note", "Update Note") : t("add_note", "Add Note")}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className={`${thBg} border-b border-white/20`}>
              <th className={`text-left px-4 py-3.5 font-semibold ${thText}`}>{t("note_title", "Title")}</th>
              <th className={`text-left px-4 py-3.5 font-semibold ${thText}`}>{t("user", "User")}</th>
              <th className={`text-left px-4 py-3.5 font-semibold ${thText}`}>{t("created", "Created")}</th>
              <th className={`text-left px-4 py-3.5 font-semibold ${thText}`}>{t("actions", "Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(note => (
              <tr key={note.id} className={`border-b border-[var(--border-color)] ${rowBg} ${rowHover} transition-colors`}>
                <td className={`px-4 py-3 font-semibold ${rowText}`}>{note.title}</td>
                <td className={`px-4 py-3 ${rowText} opacity-70`}>{note.user_email || `User #${note.user_id}`}</td>
                <td className={`px-4 py-3 ${rowText} opacity-60`}>{new Date(note.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => setViewNote(note)} className="p-1.5 rounded-lg bg-[var(--brand-gold)]/10 text-[var(--brand-gold)] hover:bg-[var(--brand-gold)]/20 transition-colors" title={t("view", "View")}>
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => openEditForm(note)} className="p-1.5 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 transition-colors" title={t("edit", "Edit")}>
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteNote(note.id)} className="p-1.5 rounded-lg bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 transition-colors" title={t("delete", "Delete")}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className={`px-4 py-8 text-center ${rowText} opacity-50`}>
                  {t("no_notes", "No notes found.")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {viewNote && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setViewNote(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl border border-[var(--border-color)] p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-3 border-b border-[var(--border-color)] pb-3">
              <h3 className={`font-bold text-xl ${rowText}`}>{viewNote.title}</h3>
              <button onClick={() => setViewNote(null)} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <p className={`text-xs ${rowText} opacity-60 mb-4`}>
              {viewNote.user_email || `User #${viewNote.user_id}`} &middot; {new Date(viewNote.created_at).toLocaleDateString()}
            </p>
            {viewNote.image_url && (
              <img src={viewNote.image_url} alt={viewNote.title} className="w-full rounded-xl mb-4 border border-[var(--border-color)] object-cover max-h-[350px]" />
            )}
            <p className={`text-sm leading-relaxed ${rowText} opacity-80 whitespace-pre-wrap`}>{viewNote.content}</p>
          </div>
        </div>
      )}
    </div>
  );
}
