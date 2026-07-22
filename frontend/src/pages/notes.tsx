import { useState, useEffect } from "react";
import { useLanguage as useTranslation } from "../i18n";
import { api } from "../api/client";
import { Plus, Edit3, Trash2, Save, Loader2 } from "lucide-react";

interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export default function Notes() {
  const { t } = useTranslation();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  const fetchNotes = async () => {
    try {
      const { data } = await api.get("/my/notes");
      setNotes(Array.isArray(data) ? data : data?.data || []);
    } catch { setNotes([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchNotes(); }, []);

  const addNote = async () => {
    if (!newTitle.trim()) return;
    try {
      const { data } = await api.post("/my/notes", { title: newTitle, content: newContent });
      const note = data?.data || data;
      setNotes([note, ...notes]);
      setNewTitle("");
      setNewContent("");
      setShowNew(false);
      setActiveNote(note);
    } catch {}
  };

  const updateNote = async (id: number, title: string, content: string) => {
    setNotes(notes.map(n => n.id === id ? { ...n, title, content } : n));
    try { await api.patch(`/my/notes/${id}`, { title, content }); } catch {}
  };

  const deleteNote = async (id: number) => {
    setNotes(notes.filter(n => n.id !== id));
    if (activeNote?.id === id) setActiveNote(null);
    try { await api.delete(`/my/notes/${id}`); } catch {}
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="page-container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold font-cinzel text-[var(--brand-teal)] dark:text-[var(--gold-light)]">
          {t("notes", "Notes")}
        </h1>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--brand-gold)] text-white font-semibold text-sm hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          {t("note_new", "New Note")}
        </button>
      </div>

      {showNew && (
        <div className="mb-8 p-6 rounded-2xl border border-[var(--border-color)] bg-white dark:bg-gray-900 shadow-md">
          <input
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder={t("note_title", "Note title")}
            className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-gray-50 dark:bg-[#071412] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 mb-3 text-lg font-bold focus:ring-2 focus:ring-[var(--brand-gold)] outline-none"
          />
          <textarea
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            placeholder={t("note_content", "Start writing your note...")}
            className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-gray-50 dark:bg-[#071412] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 mb-4 text-sm min-h-[200px] focus:ring-2 focus:ring-[var(--brand-gold)] outline-none"
          />
          <div className="flex gap-3">
            <button
              onClick={addNote}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[var(--teal-dark)] to-[var(--brand-teal)] text-white font-semibold text-sm hover:shadow-md transition-all"
            >
              <Save className="w-4 h-4 inline mr-1" />
              {t("note_save", "Save")}
            </button>
            <button
              onClick={() => setShowNew(false)}
              className="px-6 py-2.5 rounded-full border border-[var(--border-color)] text-gray-700 dark:text-gray-300 text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-all"
            >
              {t("cancel", "Cancel")}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[var(--brand-gold)]" /></div>
      ) : (
        <div className="grid md:grid-cols-[300px_1fr] gap-6">
          <div className="space-y-2">
            {notes.map(note => (
              <button
                key={note.id}
                onClick={() => setActiveNote(note)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  activeNote?.id === note.id
                    ? "border-[var(--brand-gold)] bg-[var(--brand-gold)]/5 shadow"
                    : "border-[var(--border-color)] bg-[#fcfbf9] dark:bg-[#122523] hover:shadow"
                }`}
              >
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">{note.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatDate(note.created_at)}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300 truncate mt-1">{note.content}</p>
              </button>
            ))}
            {notes.length === 0 && (
              <div className="text-center py-12 text-sm text-gray-500 dark:text-gray-400">{t("note_no_notes", "No notes yet. Create one!")}</div>
            )}
          </div>

          <div>
            {activeNote ? (
              <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-white dark:bg-gray-900 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <input
                    value={activeNote.title}
                    onChange={e => {
                      const updated = { ...activeNote, title: e.target.value };
                      setActiveNote(updated);
                      updateNote(updated.id, updated.title, updated.content);
                    }}
                    className="text-xl font-bold bg-gray-50 dark:bg-[#071412] border border-[var(--border-color)] rounded-xl px-4 py-2 w-full text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--brand-gold)] outline-none"
                  />
                  <button onClick={() => deleteNote(activeNote.id)} className="text-red-400 hover:text-red-500 ml-4 p-2 rounded-xl hover:bg-red-500/10 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4 px-1">
                  <span>{t("note_created", "Created")}: {formatDate(activeNote.created_at)}</span>
                  <span>{t("note_updated", "Updated")}: {formatDate(activeNote.updated_at)}</span>
                </div>
                <textarea
                  value={activeNote.content}
                  onChange={e => {
                    const updated = { ...activeNote, content: e.target.value };
                    setActiveNote(updated);
                    updateNote(updated.id, updated.title, updated.content);
                  }}
                  className="w-full min-h-[400px] bg-gray-50 dark:bg-[#071412] border border-[var(--border-color)] rounded-xl px-4 py-3 resize-none text-sm leading-relaxed text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--brand-gold)] outline-none"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] rounded-2xl border border-dashed border-[var(--border-color)] text-sm text-gray-500 dark:text-gray-400">
                <Edit3 className="w-12 h-12 mb-3 opacity-30" />
                {t("note_select", "Select a note or create a new one")}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
