import { useState, useEffect, useRef } from "react";
import { useLanguage as useTranslation } from "../../i18n";
import { api } from "../../api/client";
import { Search, ListChecks, Trash2, Check, User, Loader2, Plus, Edit3, X, ImagePlus, Eye } from "lucide-react";
import { useThemeStore } from "../../store/theme";

interface AdminTask {
  id: number;
  title: string;
  description?: string;
  user_id: number;
  user_email?: string;
  status: "todo" | "in_progress" | "done";
  image_url?: string;
  created_at: string;
}

export default function AdminTasks() {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<AdminTask | null>(null);
  const [viewTask, setViewTask] = useState<AdminTask | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formImage, setFormImage] = useState<File | null>(null);
  const [formPreview, setFormPreview] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const rowText = "text-gray-900 dark:text-white";
  const thBg = "bg-[var(--brand-teal)]";
  const thText = "text-white";
  const rowBg = "bg-white dark:bg-gray-800";
  const rowHover = "hover:bg-[#f5f1e8] dark:hover:bg-gray-700";

  const fetchTasks = async () => {
    try {
      const { data } = await api.get("/admin/tasks");
      setTasks(Array.isArray(data) ? data : data?.data || []);
    } catch { setTasks([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchTasks(); }, []);

  const filtered = tasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));

  const toggleStatus = async (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const next = task.status === "todo" ? "in_progress" : task.status === "in_progress" ? "done" : "todo";
    setTasks(tasks.map(t => t.id === id ? { ...t, status: next as AdminTask["status"] } : t));
    try { await api.patch(`/admin/tasks/${id}`, { status: next }); } catch {}
  };

  const deleteTask = async (id: number) => {
    setTasks(tasks.filter(t => t.id !== id));
    if (viewTask?.id === id) setViewTask(null);
    try { await api.delete(`/admin/tasks/${id}`); } catch {}
  };

  const openAddForm = () => {
    setEditingTask(null);
    setFormTitle("");
    setFormDesc("");
    setFormImage(null);
    setFormPreview("");
    setShowForm(true);
  };

  const openEditForm = (task: AdminTask) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDesc(task.description || "");
    setFormImage(null);
    setFormPreview(task.image_url || "");
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
      formData.append("description", formDesc);
      if (formImage) formData.append("image", formImage);

      if (editingTask) {
        await api.patch(`/admin/tasks/${editingTask.id}`, formData);
        setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, title: formTitle, description: formDesc, image_url: formPreview || t.image_url } : t));
      } else {
        const { data } = await api.post("/admin/tasks", formData);
        if (data?.id) setTasks([data, ...tasks]);
        else fetchTasks();
      }
    } catch {}
    setShowForm(false);
  };

  const statusColor = (s: AdminTask["status"]) => {
    switch (s) {
      case "todo": return "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300";
      case "in_progress": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
      case "done": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    }
  };

  if (loading) return <div className="p-6 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--brand-gold)]" /></div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ListChecks className="w-8 h-8 text-[var(--brand-gold)]" />
          <h1 className="text-2xl font-bold font-cinzel text-[var(--text-color)]">
            {t("all_tasks", "All Tasks")}
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
            {t("add_task", "Add Task")}
          </button>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="mb-6 p-6 rounded-2xl border border-[var(--border-color)] bg-white dark:bg-gray-900 shadow-lg">
          <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
            {editingTask ? t("edit_task", "Edit Task") : t("add_task", "Add Task")}
          </h3>
          <div className="space-y-4">
            <input
              value={formTitle}
              onChange={e => setFormTitle(e.target.value)}
              placeholder={t("task_title", "Task title...")}
              className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-gray-50 dark:bg-[#071412] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[var(--brand-gold)] outline-none"
            />
            <textarea
              value={formDesc}
              onChange={e => setFormDesc(e.target.value)}
              placeholder={t("task_description", "Task description...")}
              rows={3}
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
                {editingTask ? t("update_task", "Update Task") : t("add_task", "Add Task")}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className={`${thBg} border-b border-white/20`}>
              <th className={`text-left px-4 py-3.5 font-semibold ${thText}`}>{t("task_title", "Title")}</th>
              <th className={`text-left px-4 py-3.5 font-semibold ${thText}`}>{t("user", "User")}</th>
              <th className={`text-left px-4 py-3.5 font-semibold ${thText}`}>{t("status", "Status")}</th>
              <th className={`text-left px-4 py-3.5 font-semibold ${thText}`}>{t("created", "Created")}</th>
              <th className={`text-left px-4 py-3.5 font-semibold ${thText}`}>{t("actions", "Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(task => (
              <tr key={task.id} className={`border-b border-[var(--border-color)] ${rowBg} ${rowHover} transition-colors`}>
                <td className={`px-4 py-3 font-semibold ${rowText}`}>{task.title}</td>
                <td className={`px-4 py-3 ${rowText}`}>
                  <div className="flex items-center gap-2 opacity-80">
                    <User className="w-4 h-4 opacity-40" />
                    {task.user_email || `User #${task.user_id}`}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleStatus(task.id)} className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(task.status)}`}>
                    {t(`task_status_${task.status}`, task.status)}
                  </button>
                </td>
                <td className={`px-4 py-3 opacity-60 ${rowText}`}>{new Date(task.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => setViewTask(task)} className="p-1.5 rounded-lg bg-[var(--brand-gold)]/10 text-[var(--brand-gold)] hover:bg-[var(--brand-gold)]/20 transition-colors" title={t("view", "View")}>
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => openEditForm(task)} className="p-1.5 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 transition-colors" title={t("edit", "Edit")}>
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => toggleStatus(task.id)} className="p-1.5 rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" title={t("toggle_status", "Toggle Status")}>
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteTask(task.id)} className="p-1.5 rounded-lg bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 transition-colors" title={t("delete", "Delete")}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className={`px-4 py-8 text-center ${rowText} opacity-50`}>
                  {t("no_tasks", "No tasks found.")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {viewTask && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setViewTask(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl border border-[var(--border-color)] p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-3 border-b border-[var(--border-color)] pb-3">
              <h3 className={`font-bold text-xl ${rowText}`}>{viewTask.title}</h3>
              <button onClick={() => setViewTask(null)} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <p className={`text-xs ${rowText} opacity-60 mb-4`}>
              {viewTask.user_email || `User #${viewTask.user_id}`} &middot; {new Date(viewTask.created_at).toLocaleDateString()}
            </p>
            <div className="mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(viewTask.status)}`}>
                {t(`task_status_${viewTask.status}`, viewTask.status)}
              </span>
            </div>
            {viewTask.image_url && (
              <img src={viewTask.image_url} alt={viewTask.title} className="w-full rounded-xl mb-4 border border-[var(--border-color)] object-cover max-h-[350px]" />
            )}
            {viewTask.description && (
              <p className={`text-sm leading-relaxed ${rowText} opacity-80 whitespace-pre-wrap`}>{viewTask.description}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
