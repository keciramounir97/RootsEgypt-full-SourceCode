import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckSquare, RefreshCw, Save, Shield, UserCog } from "lucide-react";
import { api } from "../../api/client";
import { getApiErrorMessage } from "../../api/helpers";
import { useThemeStore } from "../../store/theme";
import { useLanguage } from "../../i18n";
import { notifyAdmin } from "../utils/notifications";

type AdminUser = {
  id: number;
  fullName?: string;
  email: string;
  roleId?: number;
  roleName?: string;
  permissions?: string[];
};

type Role = {
  id: number;
  name: string;
};

type PagePermission = {
  key: string;
  label: string;
};

export default function RoleDistribution() {
  const { theme } = useThemeStore();
  const { t } = useLanguage();
  const isDark = theme === "dark";
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [pages, setPages] = useState<PagePermission[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | "">("");
  const [selectedRoleId, setSelectedRoleId] = useState<number | "">("");
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const palette = useMemo(
    () => ({
      page: isDark ? "bg-[#071827] text-[#f5f1e8]" : "bg-[#f5f1e8] text-[#162238]",
      panel: isDark ? "bg-white/5 border-white/10" : "bg-white border-[#d8e2ea]",
      input: isDark ? "bg-[#071827] border-white/10" : "bg-white border-[#d8e2ea]",
      muted: isDark ? "text-[#f5f1e8]/65" : "text-[#162238]/65",
      accent: isDark ? "text-[#d9a441]" : "text-[#24766f]",
      button: isDark ? "border-white/10 hover:bg-white/10" : "border-[#d8e2ea] hover:bg-[#24766f]/8",
    }),
    [isDark],
  );

  const selectedUser = users.find((user) => Number(user.id) === Number(selectedUserId));

  const loadDistribution = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/admin/role-distribution");
      const nextUsers = Array.isArray(data?.users) ? data.users : [];
      const nextRoles = Array.isArray(data?.roles) ? data.roles : [];
      const nextPages = Array.isArray(data?.pages) ? data.pages : [];
      setUsers(nextUsers);
      setRoles(nextRoles);
      setPages(nextPages);

      if (!selectedUserId && nextUsers.length) {
        const first = nextUsers[0];
        setSelectedUserId(first.id);
        setSelectedRoleId(Number(first.roleId) || "");
        setSelectedPages(Array.isArray(first.permissions) ? first.permissions : []);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, t("legacy.role_distribution_failed", "Failed to load role distribution")));
    } finally {
      setLoading(false);
    }
  }, [selectedUserId, t]);

  useEffect(() => {
    void loadDistribution();
  }, [loadDistribution]);

  const handleUserChange = (id: string) => {
    const numericId = Number(id);
    const nextUser = users.find((user) => Number(user.id) === numericId);
    setSelectedUserId(numericId || "");
    setSelectedRoleId(Number(nextUser?.roleId) || "");
    setSelectedPages(Array.isArray(nextUser?.permissions) ? nextUser.permissions : []);
  };

  const togglePage = (key: string) => {
    setSelectedPages((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );
  };

  const saveDistribution = async () => {
    if (!selectedUserId || !selectedRoleId) {
      notifyAdmin(t("legacy.select_user_and_role", "Select a user and role first."), "error");
      return;
    }

    setSaving(true);
    try {
      const { data } = await api.patch(`/admin/role-distribution/${selectedUserId}`, {
        roleId: selectedRoleId,
        privileges: selectedPages,
      });
      notifyAdmin(data?.message || t("legacy.role_distribution_saved", "Role distribution updated."));
      await loadDistribution();
    } catch (err) {
      notifyAdmin(getApiErrorMessage(err, t("legacy.role_distribution_save_failed", "Failed to save role distribution")), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`min-h-screen p-6 ${palette.page}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-6">
        <div>
          <p className={`text-sm uppercase tracking-[0.2em] ${palette.accent}`}>
            {t("legacy.roles", "Roles")}
          </p>
          <h1 className="text-3xl font-bold mt-1">
            {t("legacy.role_distribution", "Role Distribution")}
          </h1>
          <p className={`mt-2 max-w-2xl ${palette.muted}`}>
            {t("legacy.role_distribution_desc",
              "Select a user, assign a role, and choose which admin pages they can see and manage.",
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadDistribution()}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${palette.button}`}
        >
          <RefreshCw className="w-4 h-4" />
          {t("legacy.refresh", "Refresh")}
        </button>
      </div>

      {error ? <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400 mb-4">{error}</div> : null}

      <div className={`rounded-xl border p-5 ${palette.panel}`}>
        {loading ? (
          <div className="p-10 text-center">{t("legacy.loading", "Loading...")}</div>
        ) : (
          <div className="grid gap-6">
            <div className="grid md:grid-cols-2 gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-semibold inline-flex items-center gap-2">
                  <UserCog className="w-4 h-4 text-[#24766f]" />
                  {t("legacy.select_user", "Select User")}
                </span>
                <select
                  value={selectedUserId}
                  onChange={(event) => handleUserChange(event.target.value)}
                  className={`px-4 py-3 rounded-lg border ${palette.input}`}
                >
                  <option value="">{t("legacy.select_user", "Select User")}</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.fullName || user.email} - {user.email}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold inline-flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#24766f]" />
                  {t("legacy.select_role", "Select Role")}
                </span>
                <select
                  value={selectedRoleId}
                  onChange={(event) => setSelectedRoleId(Number(event.target.value) || "")}
                  className={`px-4 py-3 rounded-lg border ${palette.input}`}
                >
                  <option value="">{t("legacy.select_role", "Select Role")}</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {selectedUser ? (
              <div className={`rounded-lg border p-4 ${isDark ? "border-white/10 bg-black/15" : "border-[#d8e2ea] bg-[#f8fafc]"}`}>
                <p className="font-semibold">{selectedUser.fullName || selectedUser.email}</p>
                <p className={`text-sm ${palette.muted}`}>
                  {selectedUser.email} · {t("legacy.current_role", "Current role")}: {selectedUser.roleName || selectedUser.roleId || "-"}
                </p>
              </div>
            ) : null}

            <div>
              <h2 className="text-lg font-semibold inline-flex items-center gap-2 mb-3">
                <CheckSquare className="w-5 h-5 text-[#24766f]" />
                {t("legacy.page_permissions", "Page Permissions")}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {pages.map((page) => (
                  <label
                    key={page.key}
                    className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer ${palette.button}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPages.includes(page.key)}
                      onChange={() => togglePage(page.key)}
                      className="w-4 h-4"
                    />
                    <span>{t(page.key, page.label)}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={() => void saveDistribution()}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#24766f] text-white font-semibold hover:bg-[#1d625d] disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {saving ? t("legacy.saving", "Saving...") : t("legacy.save_changes", "Save Changes")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
