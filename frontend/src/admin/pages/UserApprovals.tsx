import { useCallback, useEffect, useState } from "react";
import { useThemeStore } from "../../store/theme";
import { useTranslation } from "../../context/TranslationContext";
import { api } from "../../api/client";
import { getApiErrorMessage, requestWithFallback } from "../../api/helpers";
import { Check, X, UserCheck, Mail, Phone } from "lucide-react";
import Toast from "../../components/Toast";

interface PendingUser {
  id: number | string;
  fullName: string;
  email: string;
  phone: string;
  password?: string;
  status?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export default function UserApprovals() {
  const { theme } = useThemeStore();
  const { t } = useTranslation();
  const isDark = theme === "dark";

  const pageBg = isDark ? "bg-[#0d1b2a]" : "bg-[#f5f1e8]";
  const text = isDark ? "text-[#f8f5ef]" : "text-[#0d1b2a]";
  const card = isDark ? "bg-[#0d1b2a]" : "bg-white";
  const border = isDark ? "border-white/10" : "border-black/10";
  const muted = isDark ? "text-[#7a8fa3]" : "text-gray-500";

  const [pending, setPending] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", tone: "success" });

  const notify = useCallback((message: string, tone = "success") => {
    setToast({ message, tone });
  }, []);

  useEffect(() => {
    if (!toast.message) return;
    const timer = setTimeout(
      () => setToast({ message: "", tone: "success" }),
      3500,
    );
    return () => clearTimeout(timer);
  }, [toast.message]);

  const loadPending = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await requestWithFallback([
        () => api.get("/admin/users/pending"),
        () => api.get("/admin/users?status=pending"),
      ]);
      setPending(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      notify(getApiErrorMessage(err, "Failed to load pending users"), "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  const handleApprove = async (id: number | string) => {
    try {
      await api.patch(`/admin/users/${id}/approve`);
      notify(t("userApproved", "User approved"));
      loadPending();
    } catch (err: unknown) {
      notify(getApiErrorMessage(err, "Failed to approve user"), "error");
    }
  };

  const handleReject = async (id: number | string) => {
    try {
      await api.patch(`/admin/users/${id}/reject`);
      notify(t("userRejected", "User rejected"));
      loadPending();
    } catch (err: unknown) {
      notify(getApiErrorMessage(err, "Failed to reject user"), "error");
    }
  };

  return (
    <div className={`min-h-screen ${pageBg} ${text} p-6`}>
      <Toast message={toast.message} tone={toast.tone} />
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-cinzel font-bold mb-6 flex items-center gap-3">
          <UserCheck className="w-7 h-7 text-teal" />
          {t("userApprovals", "User Approvals")}
        </h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-3 border-teal border-t-transparent rounded-full animate-spin" />
          </div>
        ) : pending.length === 0 ? (
          <p className={`${muted} text-center py-12`}>
            {t("noPendingUsers", "No pending users")}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pending.map((user) => (
              <div
                key={user.id}
                className={`${card} border ${border} rounded-xl p-4`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{user.fullName}</h3>
                    <div className="flex items-center gap-1 text-sm mt-1">
                      <Mail className="w-3 h-3" />
                      <span className={muted}>{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-1 text-sm mt-1">
                        <Phone className="w-3 h-3" />
                        <span className={muted}>{user.phone}</span>
                      </div>
                    )}
                  </div>
                  {user.status && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${isDark ? "bg-teal/15 text-teal" : "bg-teal/10 text-teal"}`}
                    >
                      {user.status}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleApprove(user.id)}
                    className="flex-1 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-lg font-semibold hover:bg-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" /> {t("approve", "Approve")}
                  </button>
                  <button
                    onClick={() => handleReject(user.id)}
                    className="flex-1 px-4 py-2 bg-red-500/10 text-red-500 rounded-lg font-semibold hover:bg-red-500/20 flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" /> {t("reject", "Reject")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
