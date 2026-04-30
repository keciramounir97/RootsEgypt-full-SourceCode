import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { api } from "../../api/client";
import { useThemeStore } from "../../store/theme";
import { useTranslation } from "../../context/TranslationContext";
import Toast from "../../components/Toast";

interface Subscriber {
  id: number;
  email: string;
  created_at?: string;
  createdAt?: string;
}

export default function NewsletterSubscribers() {
  const { theme } = useThemeStore();
  const { t } = useTranslation();
  const isDark = theme === "dark";

  const pageBg = isDark ? "bg-[#0d1b2a]" : "bg-[#f5f1e8]";
  const text = isDark ? "text-[#f8f5ef]" : "text-[#0d1b2a]";
  const card = isDark ? "bg-[#0d1b2a]" : "bg-white";
  const border = isDark ? "border-white/10" : "border-black/10";
  const muted = isDark ? "text-[#7a8fa3]" : "text-gray-500";

  const [rows, setRows] = useState<Subscriber[]>([]);
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
        const { data } = await api.get("/admin/newsletter/subscribers");
        if (!mounted) return;
        setRows(Array.isArray(data) ? data : []);
      } catch (err: unknown) {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : "Failed to load subscribers";
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
          <Mail className="w-7 h-7 text-teal" />
          {t("newsletterSubscribers", "Newsletter Subscribers")}
        </h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-3 border-teal border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <p className="text-red-400 text-center py-12">{error}</p>
        ) : rows.length === 0 ? (
          <p className={`${muted} text-center py-12`}>{t("noSubscribers", "No subscribers yet")}</p>
        ) : (
          <div className={`${card} border ${border} rounded-xl overflow-hidden`}>
            <table className="w-full text-sm">
              <thead>
                <tr className={isDark ? "bg-white/5" : "bg-black/5"}>
                  <th className="text-left px-4 py-3">#</th>
                  <th className="text-left px-4 py-3">{t("email", "Email")}</th>
                  <th className="text-left px-4 py-3">{t("subscribedAt", "Subscribed At")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.id} className={`border-t ${border}`}>
                    <td className={`px-4 py-3 ${muted}`}>{i + 1}</td>
                    <td className="px-4 py-3">{row.email}</td>
                    <td className={`px-4 py-3 ${muted}`}>
                      {row.created_at || row.createdAt
                        ? new Date(row.created_at || row.createdAt || "").toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
