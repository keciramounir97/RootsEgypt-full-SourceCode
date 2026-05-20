import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Clock, KeyRound, Mail, RefreshCw, User, X } from "lucide-react";
import { api } from "../../api/client";
import { getApiErrorMessage } from "../../api/helpers";
import { useThemeStore } from "../../store/theme";
import { useLanguage } from "../../i18n";
import { notifyAdmin } from "../utils/notifications";

type RequestStatus = "pending" | "approved" | "completed" | "rejected" | "all";

type PasswordResetRequest = {
  id: number;
  email: string;
  status: string;
  requested_at?: string;
  processed_at?: string | null;
  token_expires_at?: string | null;
  userFullName?: string;
  processorFullName?: string;
};

const statusOptions: RequestStatus[] = [
  "pending",
  "approved",
  "completed",
  "rejected",
  "all",
];

export default function PasswordResetRequests() {
  const { theme } = useThemeStore();
  const { t } = useLanguage();
  const isDark = theme === "dark";
  const [status, setStatus] = useState<RequestStatus>("pending");
  const [requests, setRequests] = useState<PasswordResetRequest[]>([]);
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

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/admin/approvals/password-reset?status=${status}`);
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getApiErrorMessage(err, t("legacy.password_reset_requests_failed", "Failed to load password reset requests")));
    } finally {
      setLoading(false);
    }
  }, [status, t]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const decide = async (id: number, action: "approve" | "reject") => {
    setActionId(id);
    try {
      const { data } = await api.put(`/admin/approvals/password-reset/${id}/${action}`);
      notifyAdmin(
        data?.message ||
          (action === "approve"
            ? t("legacy.password_reset_approved", "Password reset approved. A 24-hour OTP email was sent.")
            : t("legacy.password_reset_rejected", "Password reset request rejected.")),
      );
      await loadRequests();
    } catch (err) {
      notifyAdmin(getApiErrorMessage(err, t("legacy.password_reset_decision_failed", "Failed to update password reset request")), "error");
    } finally {
      setActionId(null);
    }
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "-";
    return new Date(value).toLocaleString();
  };

  return (
    <div className={`min-h-screen p-6 ${palette.page}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-6">
        <div>
          <p className={`text-sm uppercase tracking-[0.2em] ${palette.accent}`}>
            {t("legacy.approvals", "Approvals")}
          </p>
          <h1 className="text-3xl font-bold mt-1">
            {t("legacy.password_reset_requests", "Password Reset Requests")}
          </h1>
          <p className={`mt-2 max-w-2xl ${palette.muted}`}>
            {t("legacy.password_reset_requests_desc",
              "Review password reset requests. Approving sends the user a 24-hour one-time code by email.",
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadRequests()}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${palette.button}`}
        >
          <RefreshCw className="w-4 h-4" />
          {t("legacy.refresh", "Refresh")}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {statusOptions.map((option) => (
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
            {t(`legacy.status_${option}`, option.charAt(0).toUpperCase() + option.slice(1))}
          </button>
        ))}
      </div>

      {error ? <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400 mb-4">{error}</div> : null}

      <div className={`rounded-xl border overflow-hidden ${palette.panel}`}>
        {loading ? (
          <div className="p-10 text-center">{t("legacy.loading", "Loading...")}</div>
        ) : requests.length === 0 ? (
          <div className="p-10 text-center">
            <KeyRound className={`w-10 h-10 mx-auto mb-3 ${palette.accent}`} />
            <p className="font-semibold">{t("legacy.no_password_reset_requests", "No password reset requests")}</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {requests.map((request) => (
              <div key={request.id} className="p-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="grid gap-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 font-semibold">
                      <User className="w-4 h-4 text-[#24766f]" />
                      {request.userFullName || t("legacy.unknown_user", "Unknown user")}
                    </span>
                    <span className={`inline-flex items-center gap-2 text-sm ${palette.muted}`}>
                      <Mail className="w-4 h-4" />
                      {request.email}
                    </span>
                  </div>
                  <div className={`flex flex-wrap gap-4 text-sm ${palette.muted}`}>
                    <span className="inline-flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {t("legacy.requested", "Requested")}: {formatDate(request.requested_at)}
                    </span>
                    <span>{t("legacy.status", "Status")}: {request.status}</span>
                    {request.processed_at ? <span>{t("legacy.processed", "Processed")}: {formatDate(request.processed_at)}</span> : null}
                    {request.processorFullName ? <span>{t("legacy.by", "By")}: {request.processorFullName}</span> : null}
                    {request.token_expires_at && request.status === "approved" ? (
                      <span>{t("legacy.expires", "Expires")}: {formatDate(request.token_expires_at)}</span>
                    ) : null}
                  </div>
                </div>

                {request.status === "pending" ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={actionId === request.id}
                      onClick={() => void decide(request.id, "approve")}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600/15 text-green-500 hover:bg-green-600/25 disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      {t("legacy.approve", "Approve")}
                    </button>
                    <button
                      type="button"
                      disabled={actionId === request.id}
                      onClick={() => void decide(request.id, "reject")}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/15 text-red-500 hover:bg-red-600/25 disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      {t("legacy.reject", "Reject")}
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
