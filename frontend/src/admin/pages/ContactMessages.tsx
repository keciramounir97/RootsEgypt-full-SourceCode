import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { api } from "../../api/client";
import { useThemeStore } from "../../store/theme";
import { useTranslation } from "../../context/TranslationContext";
import Toast from "../../components/Toast";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at?: string;
  createdAt?: string;
}

export default function ContactMessages() {
  const { theme } = useThemeStore();
  const { t } = useTranslation();
  const isDark = theme === "dark";

  const pageBg = isDark ? "bg-[#0d1b2a]" : "bg-[#f5f1e8]";
  const text = isDark ? "text-[#f8f5ef]" : "text-[#0d1b2a]";
  const card = isDark ? "bg-[#0d1b2a]" : "bg-white";
  const border = isDark ? "border-white/10" : "border-black/10";
  const muted = isDark ? "text-[#7a8fa3]" : "text-gray-500";

  const [rows, setRows] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ message: "", tone: "success" });

  useEffect(() => {
    if (!toast.message) return;
    const timer = setTimeout(() => setToast({ message: "", tone: "success" }), 3500);
    return () => clearTimeout(timer);
  }, [toast.message]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await api.get("/admin/contact/messages");
        if (!mounted) return;
        setRows(Array.isArray(data) ? data : []);
      } catch (err: unknown) {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : "Failed to load messages";
        setError(msg);
        setToast({ message: msg, tone: "error" });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className={`min-h-screen ${pageBg} ${text} p-6`}>
      <Toast message={toast.message} tone={toast.tone} />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-cinzel font-bold mb-6 flex items-center gap-3">
          <MessageSquare className="w-7 h-7 text-teal" />
          {t("contactMessages", "Contact Messages")}
        </h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-3 border-teal border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <p className="text-red-400 text-center py-12">{error}</p>
        ) : rows.length === 0 ? (
          <p className={`${muted} text-center py-12`}>{t("noMessages", "No messages yet")}</p>
        ) : (
          <div className="space-y-4">
            {rows.map((row) => (
              <div key={row.id} className={`${card} border ${border} rounded-xl p-4`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">{row.name}</h3>
                    <p className={`text-sm ${muted}`}>{row.email}</p>
                  </div>
                  {(row.created_at || row.createdAt) && (
                    <span className={`text-sm ${muted}`}>
                      {new Date(row.created_at || row.createdAt || "").toLocaleDateString()}
                    </span>
                  )}
                </div>
                <p className="whitespace-pre-wrap">{row.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
