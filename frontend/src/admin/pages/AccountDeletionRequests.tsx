import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Clock, Mail, RefreshCw, Trash2, User, X } from "lucide-react";
import { api } from "../../api/client";
import { getApiErrorMessage } from "../../api/helpers";
import { useThemeStore } from "../../store/theme";
import { useLanguage } from "../../i18n";
import { notifyAdmin } from "../utils/notifications";

type RequestStatus = "pending" | "approved" | "rejected" | "all";

type AccountDeletionRequest = {
  id: number;
  email: string;
  reason?: string | null;
  status: string;
  requested_at?: string;
  processed_at?: string | null;
  userFullName?: string;
  processorFullName?: string;
};

const statusOptions: RequestStatus[] = ["pending", "approved", "rejected", "all"];

export default function AccountDeletionRequests() {
  const { theme } = useThemeStore();
  const { t } = useLanguage();
  const isDark = theme === "dark";
  const [status, setStatus] = useState<RequestStatus>("pending");
  const [requests, setRequests] = useState<AccountDeletionRequest[]>([]);
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
      const { data } = await api.get(`/admin/approvals/account-deletion?status=${status}`);
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getApiErrorMessage(err, t("legacy.account_deletion_requests_failed", "Failed to load account deletion requests")));
    } finally {
      setLoading(false);
    }
  }, [status, t]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const decide = async (id: number, action: "approve" | "reject") => {
    const confirmation =
      action === "approve"
        ? t("legacy.confirm_account_deletion_approval", "Approve this account deletion request? This will delete the user account.")
        : t("legacy.confirm_account_deletion_rejection", "Reject this account deletion request?");
    if (!window.confirm(confirmation)) return;

    setActionId(id);
    try {
      const { data } = await api.put(`/admin/approvals/account-deletion/${id}/${action}`);
      notifyAdmin(
        data?.message ||
          (action === "approve"
            ? t("legacy.account_deletion_approved", "Account deletion request approved.")
            : t("legacy.account_deletion_rejected", "Account deletion request rejected.")),
      );
      await loadRequests();
    } catch (err) {
      notifyAdmin(getApiErrorMessage(err, t("legacy.account_deletion_decision_failed", "Failed to update account deletion request")), "error");
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
            {t("legacy.account_deletion_requests", "Account Deletion Requests")}
          </h1>
          <p className={`mt-2 max-w-2xl ${palette.muted}`}>
            {t("legacy.account_deletion_requests_desc",
              "Review account deletion requests and approve or reject them from one place.",
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
            <Trash2 className={`w-10 h-10 mx-auto mb-3 ${palette.accent}`} />
            <p className="font-semibold">{t("legacy.no_account_deletion_requests", "No account deletion requests")}</p>
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
                  </div>
                  <p className={`text-sm ${palette.muted}`}>
                    {t("legacy.reason", "Reason")}: {request.reason || t("legacy.no_reason_provided", "No reason provided")}
                  </p>
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
