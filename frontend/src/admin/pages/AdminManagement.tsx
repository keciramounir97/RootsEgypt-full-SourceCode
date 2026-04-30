import { useCallback, useEffect, useState } from "react";
import { useThemeStore } from "../../store/theme";
import { useTranslation } from "../../context/TranslationContext";
import { useAuth } from "../components/AuthContext";
import { api } from "../../api/client";
import { getApiErrorMessage, requestWithFallback } from "../../api/helpers";
import { Shield, Edit, Trash2 } from "lucide-react";
import Toast from "../../components/Toast";

interface AdminUser {
  id: number | string;
  email: string;
  fullName?: string;
  roleId?: number;
  [key: string]: unknown;
}

export default function AdminManagement() {
  const { theme } = useThemeStore();
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const isDark = theme === "dark";

  const pageBg = isDark ? "bg-[#0d1b2a]" : "bg-[#f5f1e8]";
  const text = isDark ? "text-[#f8f5ef]" : "text-[#0d1b2a]";
  const card = isDark ? "bg-[#0d1b2a]" : "bg-white";
  const border = isDark ? "border-white/10" : "border-black/10";
  const muted = isDark ? "text-[#7a8fa3]" : "text-gray-500";

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [toast, setToast] = useState({ message: "", tone: "success" });
  const [form, setForm] = useState({
    email: "",
    fullName: "",
    password: "",
    roleId: 2,
  });

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

  const loadAdmins = useCallback(
    async ({ notify: notifyToast = false } = {}) => {
      try {
        setLoading(true);
        const { data } = await requestWithFallback([
          () => api.get("/admin/users"),
          () => api.get("/users"),
        ]);
        const list = Array.isArray(data) ? data : [];
        setAdmins(
          list.filter(
            (u: AdminUser) =>
              u.roleId === 1 || u.roleId === 2 || u.roleId === 3,
          ),
        );
        if (notifyToast) notify(t("adminsLoaded", "Admins loaded."));
      } catch (err: unknown) {
        notify(getApiErrorMessage(err, "Failed to load admins"), "error");
      } finally {
        setLoading(false);
      }
    },
    [notify, t],
  );

  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  const resetForm = () => {
    setForm({ email: "", fullName: "", password: "", roleId: 2 });
    setEditingId(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (editingId) {
        await api.patch(`/admin/users/${editingId}`, form);
        notify(t("adminUpdated", "Admin updated"));
      } else {
        await api.post("/admin/users", form);
        notify(t("adminCreated", "Admin created"));
      }
      resetForm();
      loadAdmins({ notify: true });
    } catch (err: unknown) {
      notify(getApiErrorMessage(err, "Failed to save admin"), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number | string) => {
    if (id === currentUser?.id) {
      notify("Cannot delete yourself", "error");
      return;
    }
    if (!confirm(t("confirmDelete", "Are you sure?"))) return;
    try {
      await api.delete(`/admin/users/${id}`);
      notify(t("adminDeleted", "Admin deleted"));
      loadAdmins({ notify: true });
    } catch (err: unknown) {
      notify(getApiErrorMessage(err, "Failed to delete admin"), "error");
    }
  };

  const startEdit = (admin: AdminUser) => {
    setEditingId(admin.id);
    setForm({
      email: admin.email || "",
      fullName: admin.fullName || "",
      password: "",
      roleId: admin.roleId || 2,
    });
  };

  const roleName = (roleId: number) => {
    if (roleId === 1) return t("superAdmin", "Super Admin");
    if (roleId === 3) return t("moderator", "Moderator");
    return t("admin", "Admin");
  };

  return (
    <div className={`min-h-screen ${pageBg} ${text} p-6`}>
      <Toast message={toast.message} tone={toast.tone} />
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-cinzel font-bold mb-6 flex items-center gap-3">
          <Shield className="w-7 h-7 text-teal" />
          {t("adminManagement", "Admin Management")}
        </h1>

        {/* Form */}
        <div className={`${card} border ${border} rounded-xl p-6 mb-8`}>
          <h2 className="text-lg font-semibold mb-4">
            {editingId
              ? t("editAdmin", "Edit Admin")
              : t("addAdmin", "Add Admin")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              placeholder={t("email", "Email")}
              value={form.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              className={`px-4 py-2 rounded-lg border ${border} ${isDark ? "bg-white/5" : "bg-black/5"} outline-none`}
            />
            <input
              placeholder={t("fullName", "Full Name")}
              value={form.fullName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setForm((f) => ({ ...f, fullName: e.target.value }))
              }
              className={`px-4 py-2 rounded-lg border ${border} ${isDark ? "bg-white/5" : "bg-black/5"} outline-none`}
            />
            {!editingId && (
              <input
                placeholder={t("password", "Password")}
                type="password"
                value={form.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                className={`px-4 py-2 rounded-lg border ${border} ${isDark ? "bg-white/5" : "bg-black/5"} outline-none`}
              />
            )}
            <select
              value={form.roleId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setForm((f) => ({ ...f, roleId: Number(e.target.value) }))
              }
              className={`px-4 py-2 rounded-lg border ${border} ${isDark ? "bg-white/5" : "bg-black/5"} outline-none`}
            >
              <option value={2}>{t("admin", "Admin")}</option>
              <option value={3}>{t("moderator", "Moderator")}</option>
              <option value={1}>{t("superAdmin", "Super Admin")}</option>
            </select>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSave}
              disabled={saving || !form.email}
              className="px-6 py-2 bg-teal text-white rounded-lg font-semibold hover:bg-teal/80 disabled:opacity-50"
            >
              {saving
                ? t("saving", "Saving...")
                : editingId
                  ? t("update", "Update")
                  : t("create", "Create")}
            </button>
            {editingId && (
              <button
                onClick={resetForm}
                className="px-6 py-2 border border-current rounded-lg hover:bg-black/5"
              >
                {t("cancel", "Cancel")}
              </button>
            )}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-3 border-teal border-t-transparent rounded-full animate-spin" />
          </div>
        ) : admins.length === 0 ? (
          <p className={`${muted} text-center py-12`}>
            {t("noAdmins", "No admins")}
          </p>
        ) : (
          <div
            className={`${card} border ${border} rounded-xl overflow-hidden`}
          >
            <table className="w-full text-sm">
              <thead>
                <tr className={isDark ? "bg-white/5" : "bg-black/5"}>
                  <th className="text-left px-4 py-3">{t("name", "Name")}</th>
                  <th className="text-left px-4 py-3">{t("email", "Email")}</th>
                  <th className="text-left px-4 py-3">{t("role", "Role")}</th>
                  <th className="text-right px-4 py-3">
                    {t("actions", "Actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id} className={`border-t ${border}`}>
                    <td className="px-4 py-3">{admin.fullName || "—"}</td>
                    <td className="px-4 py-3">{admin.email}</td>
                    <td className={`px-4 py-3`}>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${isDark ? "bg-teal/15 text-teal" : "bg-teal/10 text-teal"}`}
                      >
                        {roleName(admin.roleId || 2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => startEdit(admin)}
                        className="p-1 hover:text-teal"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(admin.id)}
                        className="p-1 hover:text-red-500 ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
