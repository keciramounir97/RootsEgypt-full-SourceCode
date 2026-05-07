import { useCallback, useEffect, useState } from "react";
import { useThemeStore } from "../../store/theme";
import { useTranslation } from "../../context/TranslationContext";
import { useAuth } from "../components/AuthContext";
import { api } from "../../api/client";
import {
  getApiErrorMessage,
  requestWithFallback,
  shouldFallbackRoute,
} from "../../api/helpers";
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  X,
  Check,
  LayoutDashboard,
  Network,
  Image,
  BookOpen,
  Settings,
  Activity,
  Users,
  Music,
  FileText,
  Newspaper,
  MessageSquare,
  UserCheck,
  Save,
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import Toast from "../../components/Toast";

interface AdminUser {
  id: number | string;
  fullName: string;
  email: string;
  phone?: string;
  role: number;
  privileges: string[];
  createdAt: string;
  createdBy?: string;
}

const PRIVILEGE_OPTIONS = [
  { key: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { key: "trees", label: "Family Trees", Icon: Network },
  { key: "gallery", label: "Gallery (Images)", Icon: Image },
  { key: "audios", label: "Audio Archives", Icon: Music },
  { key: "documents", label: "Documents", Icon: FileText },
  { key: "books", label: "Books", Icon: BookOpen },
  { key: "articles", label: "Articles", Icon: Newspaper },
  { key: "users", label: "Users", Icon: Users },
  { key: "suggestions", label: "Suggestions", Icon: MessageSquare },
  { key: "approvals", label: "User Approvals", Icon: UserCheck },
  { key: "activity", label: "Activity Log", Icon: Activity },
  { key: "settings", label: "Settings", Icon: Settings },
];

export default function AdminManagement() {
  const { theme } = useThemeStore();
  const { t } = useTranslation();
  const { user } = useAuth();
  const isDark = theme === "dark";
  const isSuperAdmin = user?.role === 3;

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    privileges: [] as string[],
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: "", tone: "success" });

  const notify = useCallback((message: string, tone: "success" | "error" = "success") => {
    setToast({ message, tone });
  }, []);

  useEffect(() => {
    if (!toast.message) return;
    const timer = setTimeout(() => {
      setToast({ message: "", tone: "success" });
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast.message]);

  const loadAdmins = useCallback(async () => {
    try {
      setLoading(true);
      const shouldFallback = (err: any) =>
        shouldFallbackRoute(err) ||
        err?.response?.status === 401 ||
        err?.response?.status === 403 ||
        err?.response?.status === 500;

      const { data } = await requestWithFallback(
        [
          () => api.get("/admin/admins"),
        ],
        shouldFallback
      );

      const list =
        (data?.success && Array.isArray(data.data) ? data.data : null) ||
        (Array.isArray(data?.admins) && data.admins) ||
        (Array.isArray(data) && data) ||
        [];

      setAdmins(list);
    } catch (error) {
      console.error("Failed to load admins:", error);
      notify(getApiErrorMessage(error, "Failed to load admins"), "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    loadAdmins();
  }, [loadAdmins]);

  const resetForm = () => {
    setForm({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      privileges: [],
    });
    setEditingAdmin(null);
    setShowCreateModal(false);
  };

  const handleEdit = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setForm({
      fullName: admin.fullName,
      email: admin.email,
      phone: admin.phone || "",
      password: "",
      confirmPassword: "",
      privileges: admin.privileges || [],
    });
    setShowCreateModal(true);
  };

  const togglePrivilege = (key: string) => {
    setForm((prev) => ({
      ...prev,
      privileges: prev.privileges.includes(key)
        ? prev.privileges.filter((p) => p !== key)
        : [...prev.privileges, key],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fullName.trim() || !form.email.trim()) {
      notify(t("fill_required_fields", "Please fill all required fields"), "error");
      return;
    }

    if (!editingAdmin && !form.password.trim()) {
      notify(t("password_required", "Password is required for new admin"), "error");
      return;
    }

    if (!editingAdmin && form.password !== form.confirmPassword) {
      notify(t("passwords_dont_match", "Passwords do not match"), "error");
      return;
    }

    const payload = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      ...(form.password && { password: form.password }),
      privileges: form.privileges,
    };

    try {
      setSaving(true);
      const shouldFallback = (err: any) =>
        shouldFallbackRoute(err) ||
        err?.response?.status === 401 ||
        err?.response?.status === 403;

      if (editingAdmin) {
        await requestWithFallback(
          [
            () => api.patch(`/admin/admins/${editingAdmin.id}`, payload),
          ],
          shouldFallback
        );
        setAdmins((prev) =>
          prev.map((a) => (a.id === editingAdmin.id ? { ...a, ...payload } : a))
        );
        notify(t("admin_updated", "Admin updated successfully!"));
      } else {
        const { data } = await requestWithFallback(
          [
            () => api.post("/admin/admins", payload),
          ],
          shouldFallback
        );
        const newAdmin: AdminUser = {
          id: data?.id || Date.now(),
          ...payload,
          role: 1,
          createdAt: new Date().toISOString(),
          createdBy: user?.fullName || "Super Admin",
        };
        setAdmins((prev) => [...prev, newAdmin]);
        notify(t("admin_created", "Admin created successfully!"));
      }

      resetForm();
    } catch (error) {
      notify(getApiErrorMessage(error, "Failed to save admin"), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number | string) => {
    if (id === user?.id) {
      notify(t("cannot_delete_self", "You cannot delete your own account"), "error");
      return;
    }

    if (!window.confirm(t("confirm_delete_admin", "Are you sure you want to delete this admin?"))) {
      return;
    }

    try {
      const shouldFallback = (err: any) =>
        shouldFallbackRoute(err) ||
        err?.response?.status === 401 ||
        err?.response?.status === 403;

      await requestWithFallback(
        [
          () => api.delete(`/admin/admins/${id}`),
        ],
        shouldFallback
      );

      setAdmins((prev) => prev.filter((a) => a.id !== id));
      notify(t("admin_deleted", "Admin deleted successfully."));
    } catch (error) {
      notify(getApiErrorMessage(error, "Failed to delete admin"), "error");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const cardBg = isDark ? "bg-[#0f1f33]" : "bg-white";
  const border = isDark ? "border-[#d9a441]/20" : "border-[#24766f]/20";
  const inputBg = isDark ? "bg-[#071827]" : "bg-[#f7f2e8]";
  const textColor = isDark ? "text-[#f5f1e8]" : "text-[#162238]";

  if (!isSuperAdmin) {
    return (
      <div className={`min-h-screen p-6 ${isDark ? "bg-[#071827]" : "bg-[#f5f1e8]"}`}>
        <div className="max-w-7xl mx-auto">
          <div className={`${cardBg} border ${border} rounded-xl p-8 text-center`}>
            <Shield className={`w-16 h-16 mx-auto ${textColor} opacity-20 mb-4`} />
            <h2 className={`text-2xl font-bold ${textColor} mb-2`}>{t("access_denied", "Access Denied")}</h2>
            <p className={`${textColor} opacity-70`}>{t("super_admin_only", "Only Super Admin can access this page.")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${isDark ? "bg-[#071827]" : "bg-[#f5f1e8]"}`}>
      <Toast message={toast.message} tone={toast.tone} />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between" data-aos="fade-down">
          <div className="flex items-center gap-3">
            <Shield className={`w-8 h-8 ${isDark ? "text-[#d9a441]" : "text-[#24766f]"}`} />
            <div>
              <h1 className={`text-4xl font-bold font-serif ${isDark ? "text-[#d9a441]" : "text-[#24766f]"} mb-1`}>
                {t("admin_management", "Admin Management")}
              </h1>
              <p className={`${textColor} opacity-70`}>
                {t("admin_management_desc", "Create and manage admin accounts with custom privileges")}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#24766f] text-white hover:bg-[#24766f]/90 transition"
          >
            <Plus className="w-5 h-5" />
            {t("create_admin", "Create Admin")}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6" data-aos="fade-up">
          <div className={`${cardBg} border ${border} rounded-xl p-4 text-center`}>
            <p className="text-3xl font-bold text-[#d9a441]">{admins.filter((a) => a.role === 3).length}</p>
            <p className={`text-sm ${textColor} opacity-70`}>{t("super_admins", "Super Admins")}</p>
          </div>
          <div className={`${cardBg} border ${border} rounded-xl p-4 text-center`}>
            <p className="text-3xl font-bold text-[#24766f]">{admins.filter((a) => a.role === 1).length}</p>
            <p className={`text-sm ${textColor} opacity-70`}>{t("admins", "Admins")}</p>
          </div>
          <div className={`${cardBg} border ${border} rounded-xl p-4 text-center`}>
            <p className="text-3xl font-bold text-green-500">{admins.length}</p>
            <p className={`text-sm ${textColor} opacity-70`}>{t("total", "Total")}</p>
          </div>
        </div>

        {/* Table */}
        <div className={`${cardBg} border ${border} rounded-xl overflow-hidden shadow-lg`} data-aos="fade-up">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-[#d9a441] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className={textColor}>{t("loading", "Loading...")}</p>
            </div>
          ) : admins.length === 0 ? (
            <div className="text-center py-12">
              <Shield className={`w-16 h-16 mx-auto ${textColor} opacity-20 mb-4`} />
              <p className={`${textColor} opacity-70`}>{t("no_admins", "No admins found.")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${isDark ? "bg-white/5" : "bg-black/5"}`}>
                  <tr>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${textColor}`}>{t("admin", "Admin")}</th>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${textColor}`}>{t("role", "Role")}</th>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${textColor}`}>{t("privileges", "Privileges")}</th>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${textColor}`}>{t("created", "Created")}</th>
                    <th className={`px-4 py-3 text-center text-sm font-semibold ${textColor}`}>{t("actions", "Actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y ${border}">
                  {admins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-white/5 transition">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                            admin.role === 3 ? "bg-gradient-to-br from-[#d9a441] to-[#b38f2d]" : "bg-gradient-to-br from-[#24766f] to-[#1a5c57]"
                          }`}>
                            {admin.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className={`font-medium ${textColor}`}>{admin.fullName}</p>
                            <p className="text-xs opacity-60">{admin.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                          admin.role === 3
                            ? "bg-[#d9a441]/20 text-[#d9a441]"
                            : "bg-[#24766f]/20 text-[#24766f]"
                        }`}>
                          <Shield className="w-3 h-3" />
                          {admin.role === 3
                            ? t("super_admin", "Super Admin")
                            : t("admin", "Admin")}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {admin.privileges?.slice(0, 4).map((p) => (
                            <span key={p} className={`text-xs px-2 py-0.5 rounded ${isDark ? "bg-white/10" : "bg-black/10"}`}>
                              {p}
                            </span>
                          ))}
                          {admin.privileges?.length > 4 && (
                            <span className={`text-xs px-2 py-0.5 rounded ${isDark ? "bg-white/10" : "bg-black/10"}`}>
                              +{admin.privileges.length - 4} {t("more", "more")}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className={`text-sm ${textColor} opacity-70`}>{formatDate(admin.createdAt)}</p>
                        {admin.createdBy && (
                          <p className="text-xs opacity-50">
                            {t("by", "by")} {admin.createdBy}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {admin.role !== 3 && (
                            <>
                              <button
                                onClick={() => handleEdit(admin)}
                                className={`p-2 rounded-lg hover:bg-[#24766f]/20 transition ${textColor} opacity-70 hover:opacity-100`}
                                title={t("edit", "Edit")}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(admin.id)}
                                className="p-2 rounded-lg hover:bg-red-500/20 text-red-500 transition"
                                title={t("delete", "Delete")}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={resetForm}
        >
          <div
            className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${cardBg} border ${border}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b ${border} flex items-center justify-between">
              <h3 className={`text-xl font-bold ${textColor}`}>
                {editingAdmin ? t("edit_admin", "Edit Admin") : t("create_new_admin", "Create New Admin")}
              </h3>
              <button onClick={resetForm} className="p-2 rounded-lg hover:bg-white/10 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Full Name */}
              <div>
                <label className={`block text-sm font-semibold ${textColor} mb-2`}>
                  {t("full_name", "Full Name")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg ${inputBg} border ${border} ${textColor} outline-none focus:border-[#d9a441]`}
                  placeholder={t("full_name_placeholder", "Enter full name")}
                />
              </div>

              {/* Email & Phone */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-semibold ${textColor} mb-2`}>
                    {t("email", "Email")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg ${inputBg} border ${border} ${textColor} outline-none focus:border-[#d9a441]`}
                    placeholder={t("email_placeholder", "admin@example.com")}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-semibold ${textColor} mb-2`}>{t("phone", "Phone")}</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg ${inputBg} border ${border} ${textColor} outline-none focus:border-[#d9a441]`}
                    placeholder="+212600000000"
                  />
                </div>
              </div>

              {/* Password */}
              {!editingAdmin && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-semibold ${textColor} mb-2`}>
                      {t("password", "Password")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg ${inputBg} border ${border} ${textColor} outline-none focus:border-[#d9a441]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold ${textColor} mb-2`}>
                      {t("confirm_password", "Confirm Password")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg ${inputBg} border ${border} ${textColor} outline-none focus:border-[#d9a441]`}
                    />
                  </div>
                </div>
              )}

              {/* Privileges */}
              <div>
                <label className={`block text-sm font-semibold ${textColor} mb-3`}>
                  {t("privileges", "Admin Privileges")} <span className="text-red-500">*</span>
                </label>
                <p className={`text-xs ${textColor} opacity-60 mb-3`}>
                  {t("privileges_desc", "Select which pages this admin can access")}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {PRIVILEGE_OPTIONS.map(({ key, label, Icon }) => (
                    <label
                      key={key}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                        form.privileges.includes(key)
                          ? isDark
                            ? "bg-[#24766f]/20 border border-[#24766f]"
                            : "bg-[#24766f]/10 border border-[#24766f]"
                          : isDark
                          ? "bg-white/5 border border-transparent hover:border-white/20"
                          : "bg-black/5 border border-transparent hover:border-black/20"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form.privileges.includes(key)}
                        onChange={() => togglePrivilege(key)}
                        className="hidden"
                      />
                      <Icon className={`w-4 h-4 ${form.privileges.includes(key) ? "text-[#24766f]" : "opacity-50"}`} />
                      <span className={`text-sm ${textColor}`}>{label}</span>
                      {form.privileges.includes(key) && (
                        <Check className="w-4 h-4 text-[#24766f] ml-auto" />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className={`flex-1 py-3 rounded-lg border ${border} ${textColor} hover:bg-white/5 transition`}
                >
                  {t("cancel", "Cancel")}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`flex-1 py-3 rounded-lg bg-[#24766f] text-white hover:bg-[#24766f]/90 transition flex items-center justify-center gap-2 ${
                    saving ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  <Save className="w-4 h-4" />
                  {saving ? t("saving", "Saving...") : t("save", "Save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
