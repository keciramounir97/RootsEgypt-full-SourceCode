import { useState, useEffect } from "react";
import { useLanguage as useTranslation } from "../i18n";
import { api } from "../api/client";
import { Plus, X, Calendar, Trash2, Loader2 } from "lucide-react";

interface Task {
  id: number;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  due_date: string;
}

const columns = [
  { key: "todo", labelKey: "task_status_todo", label: "To Do" },
  { key: "in_progress", labelKey: "task_status_in_progress", label: "In Progress" },
  { key: "done", labelKey: "task_status_done", label: "Done" },
];

export default function Tasks() {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const fetchTasks = async () => {
    try {
      const { data } = await api.get("/my/tasks");
      setTasks(Array.isArray(data) ? data : data?.data || []);
    } catch { setTasks([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchTasks(); }, []);

  const addTask = async () => {
    if (!newTitle.trim()) return;
    try {
      const { data } = await api.post("/my/tasks", { title: newTitle, description: newDesc });
      setTasks([...tasks, data?.data || data]);
      setNewTitle("");
      setNewDesc("");
      setShowNew(false);
    } catch {}
  };

  const moveTask = async (id: number, newStatus: Task["status"]) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
    try { await api.patch(`/my/tasks/${id}`, { status: newStatus }); } catch {}
  };

  const deleteTask = async (id: number) => {
    setTasks(tasks.filter(t => t.id !== id));
    try { await api.delete(`/my/tasks/${id}`); } catch {}
  };

  const getColumnTasks = (status: Task["status"]) => tasks.filter(t => t.status === status);

  return (
    <div className="page-container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold font-cinzel text-[var(--brand-teal)] dark:text-[var(--gold-light)]">
          {t("task_board", "Task Board")}
        </h1>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--brand-gold)] text-white font-semibold text-sm hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          {t("task_create", "Create Task")}
        </button>
      </div>

      {showNew && (
        <div className="mb-8 p-6 rounded-2xl border border-[var(--border-color)] bg-white dark:bg-gray-900 shadow-md animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{t("task_create", "Create Task")}</h3>
            <button onClick={() => setShowNew(false)} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          <input
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder={t("task_title", "Task title")}
            className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-gray-50 dark:bg-[#071412] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 mb-3 text-sm focus:ring-2 focus:ring-[var(--brand-gold)] outline-none"
          />
          <textarea
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            placeholder={t("task_description", "Description")}
            className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-gray-50 dark:bg-[#071412] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 mb-4 text-sm min-h-[80px] focus:ring-2 focus:ring-[var(--brand-gold)] outline-none"
          />
          <button
            onClick={addTask}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[var(--teal-dark)] to-[var(--brand-teal)] text-white font-semibold text-sm hover:shadow-lg transition-all"
          >
            {t("task_create", "Create Task")}
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[var(--brand-gold)]" /></div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {columns.map(col => (
            <div key={col.key} className="rounded-2xl border border-[var(--border-color)] bg-white dark:bg-gray-900 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold font-cinzel text-sm uppercase tracking-wider text-gray-900 dark:text-white">
                  {t(col.labelKey, col.label)}
                </h3>
                <span className="text-xs bg-[var(--brand-gold)]/10 text-[var(--brand-gold)] px-2 py-0.5 rounded-full font-semibold">
                  {getColumnTasks(col.key as Task["status"]).length}
                </span>
              </div>
              <div className="space-y-3 min-h-[200px]">
                {getColumnTasks(col.key as Task["status"]).map(task => (
                  <div key={task.id} className="p-4 rounded-xl bg-gray-50 dark:bg-[#071412] border border-[var(--border-color)] shadow-sm group hover:shadow transition-all duration-200">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white leading-snug">{task.title}</h4>
                      <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/10 text-red-400 hover:text-red-500 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {task.description && <p className="text-xs text-gray-600 dark:text-gray-300 opacity-90 mb-3 whitespace-pre-wrap">{task.description}</p>}
                    {task.due_date && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <Calendar className="w-3.5 h-3.5" />
                        {task.due_date}
                      </div>
                    )}
                    <div className="flex gap-1.5 mt-2">
                      {col.key !== "todo" && (
                        <button onClick={() => moveTask(task.id, "todo")} className="text-[10px] px-2 py-1 rounded bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition-colors">← Todo</button>
                      )}
                      {col.key !== "in_progress" && (
                        <button onClick={() => moveTask(task.id, "in_progress")} className="text-[10px] px-2 py-1 rounded bg-[var(--brand-gold)]/15 text-[var(--brand-gold)] hover:bg-[var(--brand-gold)]/25 transition-colors">In Progress</button>
                      )}
                      {col.key !== "done" && (
                        <button onClick={() => moveTask(task.id, "done")} className="text-[10px] px-2 py-1 rounded bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400 hover:bg-green-200 transition-colors">Done →</button>
                      )}
                    </div>
                  </div>
                ))}
                {getColumnTasks(col.key as Task["status"]).length === 0 && (
                  <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">{t("task_no_tasks", "No tasks yet")}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
