import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  UserPlus,
  ShieldCheck,
  Mail,
  User,
  Phone,
  X,
  Pencil,
  Trash2,
} from "lucide-react";
import { useThemeStore } from "../../store/theme";
import { api } from "../../api/client";
import {
  getApiErrorMessage,
  requestWithFallback,
  shouldFallbackRoute,
} from "../../api/helpers";
import { useAuth } from "../components/AuthContext";
import { useTranslation } from "../../context/TranslationContext";
import Toast from "../../components/Toast";

interface UserItem {
  id: string | number;
  fullName?: string;
  email?: string;
  phone?: string;
  roleId?: number;
  role?: number;
  roleName?: string;
  status?: string;
  [key: string]: unknown;
}

interface RoleItem {
  id: string | number;
  name?: string;
  [key: string]: unknown;
}

export default function UsersPage() {
  const { theme } = useThemeStore();
  const { user: currentUser } = useAuth();
  const { t } = useTranslation();
  const isDark = theme === "dark";

  const pageBg = isDark ? "bg-[#0d1b2a]" : "bg-[#f5f1e8]";
  const text = isDark ? "text-[#f8f5ef]" : "text-[#0d1b2a]";
  const card = isDark ? "bg-[#0d1b2a]" : "bg-white";
  const border = isDark ? "border-white/10" : "border-[#e8dfca]";
  const subtle = isDark ? "bg-white/5" : "bg-black/[0.03]";
  const inputBg = isDark ? "bg-[#0d1b2a]" : "bg-white";
  const inputText = isDark ? "text-[#f8f5ef]" : "text-[#0d1b2a]";

  const [q, setQ] = useState("");
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editTarget, setEditTarget] = useState<UserItem | null>(null);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    roleId: 2,
  });
  const [editForm, setEditForm] = useState({
    fullName: "",
    phone: "",
    roleId: 2,
    status: "active",
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: "", tone: "success" });

  const notify = useCallback((message: string, tone = "success") => {
    setToast({ message, tone });
  }, []);

  useEffect(() => {
    if (!toast.message) return;
    const timer = setTimeout(() => {
      setToast({ message: "", tone: "success" });
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast.message]);

  const loadUsers = useCallback(
    async ({ notify: notifyToast = false } = {}) => {
      setLoading(true);
      setError("");
      try {
        const { data } = await requestWithFallback(
          [() => api.get("/admin/users")],
          (err) => shouldFallbackRoute(err) || err?.response?.status === 500
        );
        setUsers(Array.isArray(data) ? data : []);
        if (notifyToast) {
          notify(t("users_loaded", "Users loaded."));
        }
      } catch (err) {
        setUsers([]);
        const message = getApiErrorMessage(err, "Failed to load users");
        setError(message);
        notify(message, "error");
      } finally {
        setLoading(false);
      }
    },
    [notify, t]
  );

  useEffect(() => {
    void loadUsers({ notify: true });
  }, [loadUsers]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return users;
    return users.filter(
      (u) =>
        String(u.fullName || "").toLowerCase().includes(query) ||
        String(u.email || "").toLowerCase().includes(query) ||
        String(u.phone || "").toLowerCase().includes(query)
    );
  }, [users, q]);

  const loadRoles = useCallback(async () => {
    const { data } = await api.get("/admin/roles");
    return Array.isArray(data) ? data : [];
  }, []);

  const openAdd = async () => {
    setError("");
    setSaving(false);
    setForm({ fullName: "", email: "", phone: "", roleId: Number(roles[0]?.id) || 2 });
    setShowAdd(true);
    try {
      const data = roles.length ? roles : await loadRoles();
      setRoles(data);
      if (!form.roleId && data.length) {
        setForm((prev) => ({ ...prev, roleId: Number(data[0].id) }));
      }
    } catch (err) {
      setShowAdd(false);
      const message = getApiErrorMessage(err, "Failed to load roles");
      setError(message);
      notify(message, "error");
    }
  };

  const openEdit = async (u: UserItem) => {
    if (!u) return;
    setError("");
    setSaving(false);
    setEditTarget(u);
    setEditForm({
      fullName: String(u.fullName || ""),
      phone: String(u.phone || ""),
      roleId: Number(u.roleId) || 2,
      status: String(u.status || "active"),
    });
    setShowEdit(true);

    if (roles.length) return;
    try {
      const data = await loadRoles();
      setRoles(data);
    } catch (err) {
      setShowEdit(false);
      setEditTarget(null);
      const message = getApiErrorMessage(err, "Failed to load roles");
      setError(message);
      notify(message, "error");
    }
  };

  const submitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        roleId: Number(form.roleId) || 2,
      };
      const { data } = await api.post("/admin/users", payload);
      setUsers((prev) => [data, ...prev]);
      setShowAdd(false);
      notify(t("user_created", "User created."));
    } catch (err) {
      const message = getApiErrorMessage(err, "Create user failed");
      setError(message);
      notify(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setSaving(true);
    setError("");
    try {
      const payload = {
        fullName: editForm.fullName.trim(),
        phone: editForm.phone.trim(),
        roleId: Number(editForm.roleId) || 2,
        status: editForm.status,
      };
      await api.patch(`/admin/users/${editTarget.id}`, payload);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === editTarget.id
            ? {
                ...u,
                fullName: payload.fullName,
                phone: payload.phone || undefined,
                roleId: payload.roleId,
                roleName:
                  String(roles.find((r) => Number(r.id) === Number(payload.roleId))
                    ?.name || u.roleName || ""),
                status: payload.status,
              }
            : u
        )
      );
      setShowEdit(false);
      setEditTarget(null);
      notify(t("user_updated", "User updated."));
    } catch (err) {
      const message = getApiErrorMessage(err, "Update user failed");
      setError(message);
      notify(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (userToDelete: UserItem) => {
    if (!userToDelete?.id) return;
    if (Number(userToDelete.id) === Number(currentUser?.id)) {
      notify(t("cannot_delete_self", "You cannot delete your own account."), "error");
      return;
    }

    const ok = window.confirm(
      t(
        "confirm_delete_user",
        `Delete ${userToDelete.fullName || userToDelete.email || "this user"}?`
      )
    );
    if (!ok) return;

    setSaving(true);
    setError("");
    try {
      await api.delete(`/admin/users/${userToDelete.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      notify(t("user_deleted", "User deleted."));
    } catch (err) {
      const message = getApiErrorMessage(err, "Delete user failed");
      setError(message);
      notify(message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`p-6 min-h-screen ${pageBg} ${text} heritage-page-root`}>
      <Toast message={toast.message} tone={toast.tone} />
      <div
        className={`rounded-xl p-6 mb-6 border ${border} shadow-lg
        bg-gradient-to-br from-[#0c4a6e]/10 via-teal/8 to-date-palm/10 
        heritage-panel heritage-panel--accent backdrop-blur-sm`}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold">{t("users", "Users")}</h3>
            <p className="opacity-70">
              {t(
                "users_desc",
                t("users_page_desc", "Registered users (name, email, phone) - passwords are never shown.")
              )}
            </p>
          </div>

          <button
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-60
            ${isDark 
              ? 'bg-[#0c4a6e] hover:bg-[#0c4a6e]/90 text-white' 
              : 'bg-[#0c4a6e] hover:bg-[#0c4a6e]/90 text-white'
            }`}
            type="button"
            onClick={openAdd}
            disabled={currentUser?.role !== 1}
            title={
              currentUser?.role !== 1 ? t("admin_only", "Admin only") : t("add_user_hint", "Add a new user")
            }
          >
            <UserPlus className="w-5 h-5" />
            {t("add_user", "Add User")}
          </button>
        </div>

        <div className="mt-4 relative">
          <Search className={`w-4 h-4 absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-teal/60' : 'text-[#0c4a6e]/60'}`} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className={`heritage-input w-full ltr:pl-9 ltr:pr-3 rtl:pr-9 rtl:pl-3 py-2.5 rounded-lg border
            focus:outline-none focus:ring-2 focus:ring-[#0c4a6e]/25 focus:border-[#0c4a6e]/50 transition-all
            ${inputBg} ${inputText} ${border}`}
            placeholder={t("search_users", "Search users...")}
          />
        </div>
      </div>

      <div className={`rounded-xl border ${border} ${card} overflow-hidden shadow-md heritage-panel`}>
        {loading ? (
          <div className="p-12 text-center opacity-60">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0c4a6e]"></div>
            <p className="mt-4">{t("loading", "Loading...")}</p>
          </div>
        ) : error ? (
          <div className="p-10 text-center">
            <div className={`text-lg font-semibold ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center opacity-60">
            <User className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p>{t("no_results", "No results.")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="heritage-table w-full text-sm">
              <thead className={`${subtle} ${isDark ? 'bg-[#0d1b2a]/50' : 'bg-[#f8f5ef]'}`}>
                <tr className={`text-start border-b ${border}`}>
                  <th className={`py-4 px-5 text-start font-semibold ${isDark ? 'text-teal' : 'text-[#0c4a6e]'}`}>
                    {t("full_name", "Full Name")}
                  </th>
                  <th className={`py-4 px-5 text-start font-semibold ${isDark ? 'text-teal' : 'text-[#0c4a6e]'}`}>
                    {t("email", "Email")}
                  </th>
                  <th className={`py-4 px-5 text-start font-semibold ${isDark ? 'text-teal' : 'text-[#0c4a6e]'}`}>
                    {t("phone", "Phone")}
                  </th>
                  <th className={`py-4 px-5 text-start font-semibold ${isDark ? 'text-teal' : 'text-[#0c4a6e]'}`}>
                    {t("role", "Role")}
                  </th>
                  <th className={`py-4 px-5 text-start font-semibold ${isDark ? 'text-teal' : 'text-[#0c4a6e]'}`}>
                    {t("status", "Status")}
                  </th>
                  {currentUser?.role === 1 ? (
                    <th className={`py-4 px-5 text-end font-semibold ${isDark ? 'text-teal' : 'text-[#0c4a6e]'}`}>
                      {t("actions", "Actions")}
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr
                    key={u.id}
                    className={`admin-table-row border-b ${border} transition-colors ${
                      u.id === currentUser?.id 
                        ? `${isDark ? 'bg-[#0c4a6e]/20' : 'bg-[#0c4a6e]/10'}` 
                        : `${isDark ? 'hover:bg-white/5' : 'hover:bg-[#f8f5ef]/50'}`
                    }`}
                  >
                    <td className="py-4 px-5 text-start">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                        ${isDark ? 'bg-[#0c4a6e]/30 text-teal' : 'bg-[#0c4a6e]/10 text-[#0c4a6e]'}`}>
                          <User className="w-5 h-5" />
                        </div>
                        <span className="font-semibold">{u.fullName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-start">
                      <div className="flex items-center gap-2">
                        <Mail className={`w-4 h-4 ${isDark ? 'text-teal/60' : 'text-[#0c4a6e]/60'}`} />
                        <span>{u.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-start">
                      {u.phone ? (
                        <div className="flex items-center gap-2">
                          <Phone className={`w-4 h-4 ${isDark ? 'text-teal/60' : 'text-[#0c4a6e]/60'}`} />
                          <span>{u.phone}</span>
                        </div>
                      ) : (
                        <span className="opacity-40">-</span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-start">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                      ${isDark 
                        ? 'bg-[#0c4a6e]/30 text-teal border border-[#0c4a6e]/50' 
                        : 'bg-[#0c4a6e]/10 text-[#0c4a6e] border border-[#0c4a6e]/20'
                      }`}>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {u.roleName || u.roleId}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-start">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                      ${u.status === 'active' 
                        ? (isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700')
                        : (isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700')
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    {currentUser?.role === 1 ? (
                      <td className="py-4 px-5 text-end">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className={`interactive-btn btn-neu rounded-xl inline-flex items-center gap-2 px-4 py-2 border ${border} 
                            transition-all hover:shadow-md disabled:opacity-60
                            ${isDark 
                              ? 'bg-white/10 hover:bg-white/15 text-white' 
                              : 'bg-white hover:bg-[#f8f5ef] text-[#0c4a6e]'
                            }`}
                            onClick={() => openEdit(u)}
                            disabled={saving}
                          >
                            <Pencil className="w-4 h-4" />
                            {t("edit", "Edit")}
                          </button>
                          <button
                            type="button"
                            className={`interactive-btn btn-neu rounded-xl inline-flex items-center gap-2 px-4 py-2 
                            transition-all hover:shadow-md disabled:opacity-60
                            ${isDark 
                              ? 'bg-red-600/80 hover:bg-red-600 text-white' 
                              : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                            onClick={() => deleteUser(u)}
                            disabled={saving}
                          >
                            <Trash2 className="w-4 h-4" />
                            {t("delete", "Delete")}
                          </button>
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAdd ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => (saving ? null : setShowAdd(false))}
          />
          <div
            className={`relative w-full max-w-lg rounded-xl border ${border} ${card} p-6 shadow-2xl heritage-panel
            ${isDark ? 'bg-[#0d1b2a]' : 'bg-white'}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-xl font-bold">{t("add_user", "Add User")}</h4>
                <p className="text-sm opacity-70">
                  {t("add_user_email_hint", "We will email them a password-reset code to set their password.")}
                </p>
              </div>
              <button
                type="button"
                className={`interactive-btn btn-neu p-2 rounded-full border ${border} hover:opacity-90 disabled:opacity-60 shrink-0`}
                onClick={() => setShowAdd(false)}
                disabled={saving}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form className="mt-5 space-y-4" onSubmit={submitAdd}>
              <label className="block">
                <span className={`block text-sm font-semibold mb-2 ${isDark ? 'text-[#e8dfca]' : 'text-[#0c4a6e]'}`}>
                  {t("full_name", "Full Name")} <span className="text-red-500">*</span>
                </span>
                <input
                  value={form.fullName}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, fullName: e.target.value }))
                  }
                  required
                  className={`heritage-input w-full px-4 py-2.5 rounded-lg border ${inputBg} ${inputText} ${border}
                  focus:outline-none focus:ring-2 focus:ring-[#0c4a6e]/25 focus:border-[#0c4a6e]/50 transition-all`}
                  placeholder={t("full_name_placeholder", "Full name")}
                  disabled={saving}
                />
              </label>

              <label className="block">
                <span className={`block text-sm font-semibold mb-2 ${isDark ? 'text-[#e8dfca]' : 'text-[#0c4a6e]'}`}>
                  {t("email", "Email")} <span className="text-red-500">*</span>
                </span>
                <input
                  value={form.email}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, email: e.target.value }))
                  }
                  required
                  type="email"
                  className={`heritage-input w-full px-4 py-2.5 rounded-lg border ${inputBg} ${inputText} ${border}
                  focus:outline-none focus:ring-2 focus:ring-[#0c4a6e]/25 focus:border-[#0c4a6e]/50 transition-all`}
                  placeholder={t("email_placeholder_example", "email@example.com")}
                  disabled={saving}
                />
              </label>

              <label className="block">
                <span className={`block text-sm font-semibold mb-2 ${isDark ? 'text-[#e8dfca]' : 'text-[#0c4a6e]'}`}>
                  {t("phone", "Phone")} <span className="text-xs opacity-60">({t("optional", "Optional")})</span>
                </span>
                <input
                  value={form.phone}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, phone: e.target.value }))
                  }
                  className={`heritage-input w-full px-4 py-2.5 rounded-lg border ${inputBg} ${inputText} ${border}
                  focus:outline-none focus:ring-2 focus:ring-[#0c4a6e]/25 focus:border-[#0c4a6e]/50 transition-all`}
                  placeholder="+1 555 123 4567"
                  disabled={saving}
                />
              </label>

              <label className="block">
                <span className={`block text-sm font-semibold mb-2 ${isDark ? 'text-[#e8dfca]' : 'text-[#0c4a6e]'}`}>
                  {t("role", "Role")}
                </span>
                <select
                  value={form.roleId}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, roleId: Number(e.target.value) }))
                  }
                  className={`heritage-input w-full px-4 py-2.5 rounded-lg border ${inputBg} ${inputText} ${border}
                  focus:outline-none focus:ring-2 focus:ring-[#0c4a6e]/25 focus:border-[#0c4a6e]/50 transition-all`}
                  disabled={saving}
                >
                  {(roles.length ? roles : [{ id: 2, name: "user" }]).map(
                    (r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    )
                  )}
                </select>
              </label>

              {error ? (
                <div className="text-sm text-[#556b2f] font-semibold">
                  {error}
                </div>
              ) : null}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  className={`px-5 py-2.5 rounded-lg border ${border} font-semibold transition-all hover:shadow-md disabled:opacity-60
                  ${isDark 
                    ? 'bg-white/10 hover:bg-white/15 text-white' 
                    : 'bg-white hover:bg-[#f8f5ef] text-[#0c4a6e]'
                  }`}
                  onClick={() => setShowAdd(false)}
                  disabled={saving}
                >
                  {t("cancel", "Cancel")}
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-60
                  ${isDark 
                    ? 'bg-[#0c4a6e] hover:bg-[#0c4a6e]/90 text-white' 
                    : 'bg-[#0c4a6e] hover:bg-[#0c4a6e]/90 text-white'
                  }`}
                  disabled={saving}
                >
                  {saving ? t("creating", "Creating...") : t("create_user", "Create User")}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {showEdit ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => (saving ? null : setShowEdit(false))}
          />
          <div
            className={`relative w-full max-w-lg rounded-xl border ${border} ${card} p-6 shadow-2xl heritage-panel
            ${isDark ? 'bg-[#0d1b2a]' : 'bg-white'}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-xl font-bold">{t("edit_user", "Edit User")}</h4>
                <p className="text-sm opacity-70">
                  {editTarget?.email || ""}
                </p>
              </div>
              <button
                type="button"
                className={`interactive-btn btn-neu p-2 rounded-full border ${border} hover:opacity-90 disabled:opacity-60 shrink-0`}
                onClick={() => setShowEdit(false)}
                disabled={saving}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form className="mt-5 space-y-4" onSubmit={submitEdit}>
              <label className="block">
                <span className={`block text-sm font-semibold mb-2 ${isDark ? 'text-[#e8dfca]' : 'text-[#0c4a6e]'}`}>
                  {t("full_name", "Full Name")} <span className="text-red-500">*</span>
                </span>
                <input
                  value={editForm.fullName}
                  onChange={(e) =>
                    setEditForm((s) => ({ ...s, fullName: e.target.value }))
                  }
                  required
                  className={`heritage-input w-full px-4 py-2.5 rounded-lg border ${inputBg} ${inputText} ${border}
                  focus:outline-none focus:ring-2 focus:ring-[#0c4a6e]/25 focus:border-[#0c4a6e]/50 transition-all`}
                  disabled={saving}
                />
              </label>

              <label className="block">
                <span className={`block text-sm font-semibold mb-2 ${isDark ? 'text-[#e8dfca]' : 'text-[#0c4a6e]'}`}>
                  {t("phone", "Phone")} <span className="text-xs opacity-60">({t("optional", "Optional")})</span>
                </span>
                <input
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm((s) => ({ ...s, phone: e.target.value }))
                  }
                  className={`heritage-input w-full px-4 py-2.5 rounded-lg border ${inputBg} ${inputText} ${border}
                  focus:outline-none focus:ring-2 focus:ring-[#0c4a6e]/25 focus:border-[#0c4a6e]/50 transition-all`}
                  disabled={saving}
                />
              </label>

              <div className="grid md:grid-cols-2 gap-4">
                <label className="block">
                  <span className={`block text-sm font-semibold mb-2 ${isDark ? 'text-[#e8dfca]' : 'text-[#0c4a6e]'}`}>
                    {t("role", "Role")}
                  </span>
                   <select
                     value={editForm.roleId}
                     onChange={(e) =>
                       setEditForm((s) => ({ ...s, roleId: Number(e.target.value) }))
                     }
                     className={`heritage-input w-full px-4 py-2.5 rounded-lg border ${inputBg} ${inputText} ${border}
                     focus:outline-none focus:ring-2 focus:ring-[#0c4a6e]/25 focus:border-[#0c4a6e]/50 transition-all`}
                     disabled={saving}
                   >
                    {(roles.length ? roles : [{ id: 2, name: "user" }]).map(
                      (r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label className="block">
                  <span className={`block text-sm font-semibold mb-2 ${isDark ? 'text-[#e8dfca]' : 'text-[#0c4a6e]'}`}>
                    {t("status", "Status")}
                  </span>
                   <select
                     value={editForm.status}
                     onChange={(e) =>
                       setEditForm((s) => ({ ...s, status: e.target.value }))
                     }
                     className={`heritage-input w-full px-4 py-2.5 rounded-lg border ${inputBg} ${inputText} ${border}
                     focus:outline-none focus:ring-2 focus:ring-[#0c4a6e]/25 focus:border-[#0c4a6e]/50 transition-all`}
                     disabled={saving}
                   >
                    <option value="active">{t("active", "Active")}</option>
                    <option value="disabled">{t("disabled", "Disabled")}</option>
                  </select>
                </label>
              </div>

              {error ? (
                <div className="text-sm text-[#556b2f] font-semibold">
                  {error}
                </div>
              ) : null}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  className={`px-5 py-2.5 rounded-lg border ${border} font-semibold transition-all hover:shadow-md disabled:opacity-60
                  ${isDark 
                    ? 'bg-white/10 hover:bg-white/15 text-white' 
                    : 'bg-white hover:bg-[#f8f5ef] text-[#0c4a6e]'
                  }`}
                  onClick={() => setShowEdit(false)}
                  disabled={saving}
                >
                  {t("cancel", "Cancel")}
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-60
                  ${isDark 
                    ? 'bg-[#0c4a6e] hover:bg-[#0c4a6e]/90 text-white' 
                    : 'bg-[#0c4a6e] hover:bg-[#0c4a6e]/90 text-white'
                  }`}
                  disabled={saving}
                >
                  {saving ? t("saving", "Saving...") : t("save", "Save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}





