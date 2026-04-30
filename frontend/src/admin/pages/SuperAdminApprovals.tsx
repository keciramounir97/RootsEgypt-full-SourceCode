import { useEffect, useState, useCallback } from "react";
import { Check, X, Shield } from "lucide-react";
import { api } from "../../api/client";
import { useThemeStore } from "../../store/theme";
import { useTranslation } from "../../context/TranslationContext";
import Toast from "../../components/Toast";

type Req = {
  id: number;
  email: string;
  status: string;
  requested_at: string;
  userFullName?: string;
  reason?: string;
};

export default function SuperAdminApprovals() {
  const { theme } = useThemeStore();
  const { t } = useTranslation();
  const isDark = theme === "dark";

  const pageBg = isDark ? "bg-[#0d1b2a]" : "bg-[#f5f1e8]";
  const text = isDark ? "text-[#f8f5ef]" : "text-[#0d1b2a]";
  const card = isDark ? "bg-[#0d1b2a]" : "bg-white";
  const border = isDark ? "border-white/10" : "border-black/10";
  const muted = isDark ? "text-[#7a8fa3]" : "text-gray-500";

  const [users, setUsers] = useState<any[]>([]);
  const [passwordRequests, setPasswordRequests] = useState<Req[]>([]);
  const [deletionRequests, setDeletionRequests] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", tone: "success" });

  const notify = useCallback((message: string, tone = "success") => {
    setToast({ message, tone });
  }, []);

  useEffect(() => {
    if (!toast.message) return;
    const timer = setTimeout(() => setToast({ message: "", tone: "success" }), 3500);
    return () => clearTimeout(timer);
  }, [toast.message]);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [usersRes, passRes, delRes] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/approvals/password-reset?status=pending"),
        api.get("/admin/approvals/account-deletion?status=pending"),
      ]);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setPasswordRequests(Array.isArray(passRes.data) ? passRes.data : []);
      setDeletionRequests(Array.isArray(delRes.data) ? delRes.data : []);
    } catch (err: unknown) {
      notify("Failed to load approvals data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const handlePasswordAction = async (id: number, action: "approve" | "reject") => {
    try {
      await api.post(`/admin/approvals/password-reset/${id}/${action}`);
      notify(action === "approve" ? t("requestApproved", "Request approved") : t("requestRejected", "Request rejected"));
      loadAll();
    } catch (err: unknown) {
      notify("Action failed", "error");
    }
  };

  const handleDeletionAction = async (id: number, action: "approve" | "reject") => {
    try {
      await api.post(`/admin/approvals/account-deletion/${id}/${action}`);
      notify(action === "approve" ? t("requestApproved", "Request approved") : t("requestRejected", "Request rejected"));
      loadAll();
    } catch (err: unknown) {
      notify("Action failed", "error");
    }
  };

  const RequestCard = ({ req, type }: { req: Req; type: "password" | "deletion" }) => (
    <div className={`${card} border ${border} rounded-xl p-4`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold">{req.userFullName || req.email}</p>
          <p className={`text-sm ${muted}`}>{req.email}</p>
          {req.reason && <p className={`text-sm ${muted} mt-1`}>{req.reason}</p>}
          <p className={`text-xs ${muted} mt-1`}>{req.requested_at ? new Date(req.requested_at).toLocaleDateString() : ""}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => type === "password" ? handlePasswordAction(req.id, "approve") : handleDeletionAction(req.id, "approve")}
            className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={() => type === "password" ? handlePasswordAction(req.id, "reject") : handleDeletionAction(req.id, "reject")}
            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${pageBg} ${text} p-6`}>
      <Toast message={toast.message} tone={toast.tone} />
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-cinzel font-bold mb-6 flex items-center gap-3">
          <Shield className="w-7 h-7 text-teal" />
          {t("superAdminApprovals", "Super Admin Approvals")}
        </h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-3 border-teal border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4">{t("passwordResetRequests", "Password Reset Requests")} ({passwordRequests.length})</h2>
              {passwordRequests.length === 0 ? (
                <p className={`${muted} text-center py-6`}>{t("noPendingRequests", "No pending requests")}</p>
              ) : (
                <div className="space-y-3">
                  {passwordRequests.map((req) => <RequestCard key={req.id} req={req} type="password" />)}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">{t("accountDeletionRequests", "Account Deletion Requests")} ({deletionRequests.length})</h2>
              {deletionRequests.length === 0 ? (
                <p className={`${muted} text-center py-6`}>{t("noPendingRequests", "No pending requests")}</p>
              ) : (
                <div className="space-y-3">
                  {deletionRequests.map((req) => <RequestCard key={req.id} req={req} type="deletion" />)}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">{t("allUsers", "All Users")} ({users.length})</h2>
              {users.length === 0 ? (
                <p className={`${muted} text-center py-6`}>{t("noUsers", "No users")}</p>
              ) : (
                <div className={`${card} border ${border} rounded-xl overflow-hidden`}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className={isDark ? "bg-white/5" : "bg-black/5"}>
                        <th className="text-left px-4 py-3">{t("name", "Name")}</th>
                        <th className="text-left px-4 py-3">{t("email", "Email")}</th>
                        <th className="text-left px-4 py-3">{t("role", "Role")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u: any) => (
                        <tr key={u.id} className={`border-t ${border}`}>
                          <td className="px-4 py-3">{u.fullName || u.full_name || "—"}</td>
                          <td className="px-4 py-3">{u.email}</td>
                          <td className={`px-4 py-3 ${muted}`}>{u.roleId || u.role || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
