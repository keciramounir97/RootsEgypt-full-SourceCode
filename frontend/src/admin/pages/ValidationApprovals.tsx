import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, CheckCircle, Clock, Mail, RefreshCw, ShieldCheck, User, X } from "lucide-react";
import { api } from "../../api/client";
import { getApiErrorMessage } from "../../api/helpers";
import { useThemeStore } from "../../store/theme";
import { useTranslation } from "../../context/TranslationContext";
import { notifyAdmin } from "../utils/notifications";

type ValidationStatus = "pending" | "validated" | "rejected" | "all";

type ValidationUser = {
  id: number;
  fullName?: string;
  phoneNumber?: string;
  email: string;
  status?: string;
  roleName?: string;
  createdAt?: string;
};

const filters: ValidationStatus[] = ["pending", "validated", "rejected", "all"];

export default function ValidationApprovals() {
  const { theme } = useThemeStore();
  const { t } = useTranslation();
  const isDark = theme === "dark";
  const [status, setStatus] = useState<ValidationStatus>("pending");
  const [users, setUsers] = useState<ValidationUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const palette = useMemo(
    () => ({
      page: isDark ? "bg-[#071827] text-[#f5f1e8]" : "bg-[#f5f1e8] text-[#162238]",
      panel: isDark ? "bg-white/5 border-white/10" : "bg-white border-[#d8e2ea]",
      muted: isDark ? "text-[#f5f1e8]/65" : "text-[#162238]/65",
      accent: isDark ? "text-[#d9a441]" : "text-[#24766f]",
      button: isDark ? "border-white/10 hover:bg-white/10" : "border-[#d8e2ea] hover:bg-[#24766f]/8",
    }),
    [isDark],
  );

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/admin/users/validation?status=${status}`);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getApiErrorMessage(err, t("validation_users_failed", "Failed to load validation approvals")));
    } finally {
      setLoading(false);
    }
  }, [status, t]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const decide = async (id: number, action: "validate" | "reject-validation") => {
    setActionId(id);
    try {
      const { data } = await api.patch(`/admin/users/${id}/${action}`);
      notifyAdmin(
        data?.message ||
          (action === "validate"
            ? t("user_validated", "User validated. The account now has a validated badge.")
            : t("user_validation_rejected", "User validation rejected.")),
      );
      await loadUsers();
    } catch (err) {
      notifyAdmin(getApiErrorMessage(err, t("validation_decision_failed", "Failed to update validation request")), "error");
    } finally {
      setActionId(null);
    }
  };

  const isValidated = (value?: string) => ["validated", "approved"].includes(String(value || "").toLowerCase());
  const isRejected = (value?: string) => ["rejected", "banned"].includes(String(value || "").toLowerCase());
  const canDecide = (value?: string) => !isValidated(value) && !isRejected(value);
  const formatDate = (value?: string) => (value ? new Date(value).toLocaleString() : "-");

  return (
    <div className={`min-h-screen p-6 ${palette.page}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-6">
        <div>
          <p className={`text-sm uppercase tracking-[0.2em] ${palette.accent}`}>
            {t("validation", "Validation")}
          </p>
          <h1 className="text-3xl font-bold mt-1">
            {t("validation_approvals", "Validation Approvals")}
          </h1>
          <p className={`mt-2 max-w-2xl ${palette.muted}`}>
            {t(
              "validation_approvals_desc",
              "Approve user accounts so validated members receive the check badge in the navbar.",
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadUsers()}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${palette.button}`}
        >
          <RefreshCw className="w-4 h-4" />
          {t("refresh", "Refresh")}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setStatus(option)}
            className={`px-4 py-2 rounded-lg border text-sm transition ${
              status === option
                ? "bg-[#d9a441] border-[#d9a441] text-[#071827] font-semibold"
                : palette.button
            }`}
          >
            {t(`status_${option}`, option.charAt(0).toUpperCase() + option.slice(1))}
          </button>
        ))}
      </div>

      {error ? <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400 mb-4">{error}</div> : null}

      <div className={`rounded-xl border overflow-hidden ${palette.panel}`}>
        {loading ? (
          <div className="p-10 text-center">{t("loading", "Loading...")}</div>
        ) : users.length === 0 ? (
          <div className="p-10 text-center">
            <ShieldCheck className={`w-10 h-10 mx-auto mb-3 ${palette.accent}`} />
            <p className="font-semibold">{t("no_validation_requests", "No validation requests")}</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {users.map((candidate) => (
              <div key={candidate.id} className="p-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="grid gap-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 font-semibold">
                      <User className="w-4 h-4 text-[#24766f]" />
                      {candidate.fullName || t("unknown_user", "Unknown user")}
                    </span>
                    {isValidated(candidate.status) ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-600/15 text-green-500 text-xs font-semibold">
                        <CheckCircle className="w-3.5 h-3.5" />
                        {t("validated_account", "Validated Account")}
                      </span>
                    ) : null}
                    <span className={`inline-flex items-center gap-2 text-sm ${palette.muted}`}>
                      <Mail className="w-4 h-4" />
                      {candidate.email}
                    </span>
                  </div>
                  <div className={`flex flex-wrap gap-4 text-sm ${palette.muted}`}>
                    <span className="inline-flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {t("created", "Created")}: {formatDate(candidate.createdAt)}
                    </span>
                    <span>{t("status", "Status")}: {candidate.status || "active"}</span>
                    <span>{t("role", "Role")}: {candidate.roleName || "-"}</span>
                    {candidate.phoneNumber ? <span>{t("phone", "Phone")}: {candidate.phoneNumber}</span> : null}
                  </div>
                </div>

                {canDecide(candidate.status) ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={actionId === candidate.id}
                      onClick={() => void decide(candidate.id, "validate")}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600/15 text-green-500 hover:bg-green-600/25 disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      {t("approve_validate", "Approve & Validate")}
                    </button>
                    <button
                      type="button"
                      disabled={actionId === candidate.id}
                      onClick={() => void decide(candidate.id, "reject-validation")}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/15 text-red-500 hover:bg-red-600/25 disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      {t("reject", "Reject")}
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
