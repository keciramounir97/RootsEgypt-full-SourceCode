import { useState, useEffect } from "react";
import { useLanguage as useTranslation } from "../i18n";
import { api } from "../api/client";
import { Plus, X, Bell, Trash2, Clock, Loader2 } from "lucide-react";

interface Reminder {
  id: number;
  title: string;
  reminder_date: string;
  reminder_time: string;
  type: "birthday" | "event" | "task" | "custom";
}

export default function Reminders() {
  const { t } = useTranslation();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newType, setNewType] = useState<Reminder["type"]>("custom");

  const fetchReminders = async () => {
    try {
      const { data } = await api.get("/my/reminders");
      setReminders(Array.isArray(data) ? data : data?.data || []);
    } catch { setReminders([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchReminders(); }, []);

  const addReminder = async () => {
    if (!newTitle.trim() || !newDate) return;
    try {
      const { data } = await api.post("/my/reminders", {
        title: newTitle,
        reminder_date: newDate,
        reminder_time: newTime || null,
        type: newType,
      });
      setReminders([...(Array.isArray(data) ? data : data?.data ? [data.data] : [data]), ...reminders]);
      setNewTitle("");
      setNewDate("");
      setNewTime("");
      setNewType("custom");
      setShowNew(false);
    } catch {}
  };

  const deleteReminder = async (id: number) => {
    setReminders(reminders.filter(r => r.id !== id));
    try { await api.delete(`/my/reminders/${id}`); } catch {}
  };

  return (
    <div className="page-container py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Bell className="w-8 h-8 text-[var(--brand-gold)]" />
          <h1 className="text-3xl font-bold font-cinzel text-[var(--brand-teal)] dark:text-[var(--gold-light)]">
            {t("reminders", "Reminders")}
          </h1>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--brand-gold)] text-white font-semibold text-sm hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          {t("reminder_new", "New Reminder")}
        </button>
      </div>

      {showNew && (
        <div className="mb-8 p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--paper-color)] max-w-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[var(--text-color)]">{t("reminder_new", "New Reminder")}</h3>
            <button onClick={() => setShowNew(false)}><X className="w-5 h-5 text-[var(--text-color)]" /></button>
          </div>
          <input
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder={t("reminder_title", "Reminder title")}
            className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-white dark:bg-[var(--bg-dark)] text-[var(--text-color)] mb-3 text-sm"
          />
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs font-semibold text-[var(--text-color)] opacity-60 mb-1 block">{t("reminder_date", "Date")}</label>
              <input
                type="date"
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-white dark:bg-[var(--bg-dark)] text-[var(--text-color)] text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text-color)] opacity-60 mb-1 block">{t("reminder_time", "Time")}</label>
              <input
                type="time"
                value={newTime}
                onChange={e => setNewTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-white dark:bg-[var(--bg-dark)] text-[var(--text-color)] text-sm"
              />
            </div>
          </div>
          <select
            value={newType}
            onChange={e => setNewType(e.target.value as Reminder["type"])}
            className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-white dark:bg-[var(--bg-dark)] text-[var(--text-color)] mb-4 text-sm"
          >
            <option value="custom">{t("reminder_type_custom", "Custom")}</option>
            <option value="birthday">{t("reminder_type_birthday", "Birthday")}</option>
            <option value="event">{t("reminder_type_event", "Event")}</option>
            <option value="task">{t("reminder_type_task", "Task")}</option>
          </select>
          <button
            onClick={addReminder}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[var(--teal-dark)] to-[var(--brand-teal)] text-white font-semibold text-sm"
          >
            {t("reminder_create", "Create Reminder")}
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[var(--brand-gold)]" /></div>
      ) : (
        <div className="max-w-2xl space-y-3">
          {reminders.map(reminder => (
            <div key={reminder.id} className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-color)] bg-[var(--paper-color)] group">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[var(--brand-gold)]" />
                <div>
                  <h3 className="font-semibold text-sm text-[var(--text-color)]">{reminder.title}</h3>
                  <p className="text-xs text-[var(--text-color)] opacity-60">{reminder.reminder_date} {reminder.reminder_time}</p>
                </div>
              </div>
              <button onClick={() => deleteReminder(reminder.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          ))}
          {reminders.length === 0 && (
            <div className="text-center py-16 text-sm text-[var(--text-color)] opacity-40">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
              {t("reminder_no_reminders", "No reminders yet")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
