import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Check, Clock, Download, X } from "lucide-react";
import { useAuth } from "../admin/components/AuthContext";
import { api } from "../api/client";
import { getApiErrorMessage } from "../api/helpers";
import { useLanguage } from "../i18n";
import { useThemeStore } from "../store/theme";
import RootsPageShell from "../components/RootsPageShell";

type DownloadRequestItem = {
  id: number;
  content_type: string;
  content_id: number;
  content_title?: string | null;
  content_created_at?: string | null;
  status: string;
  requested_at?: string;
  processed_at?: string | null;
  requesterName?: string;
};

export default function MyDownloadRequests() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { theme } = useThemeStore();
  const isDark = theme === "dark";

  const [mine, setMine] = useState<DownloadRequestItem[]>([]);
  const [forMyContent, setForMyContent] = useState<DownloadRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const palette = useMemo(
    () => ({
      panel: isDark ? "bg-white/5 border-white/10" : "bg-white border-[#d8e2ea]",
      muted: isDark ? "text-[#f5f1e8]/65" : "text-[#162238]/65",
      accent: isDark ? "text-[#d9a441]" : "text-[#24766f]",
    }),
    [isDark],
  );

  const contentTypeLabel = (type: string) =>
    ({
      tree: t("legacy.family_tree", "Family Tree"),
      book: t("legacy.books", "Books"),
      gallery: t("legacy.gallery", "Gallery"),
      audio: t("legacy.audios", "Audios"),
      document: t("legacy.documents", "Documents"),
    })[type] || type;

  const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleString() : "-");

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const [mineRes, forMyContentRes] = await Promise.all([
        api.get("/download-requests/mine"),
        api.get("/my/download-requests"),
      ]);
      setMine(Array.isArray(mineRes.data) ? mineRes.data : []);
      setForMyContent(Array.isArray(forMyContentRes.data) ? forMyContentRes.data : []);
    } catch (err) {
      setError(getApiErrorMessage(err, t("download_requests_failed", "Failed to load download requests")));
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const decide = async (id: number, action: "approve" | "reject") => {
    setActionId(id);
    try {
      await api.put(`/my/download-requests/${id}/${action}`);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, t("download_request_decision_failed", "Failed to update download request")));
    } finally {
      setActionId(null);
    }
  };

  if (!user) return null;

  return (
    <RootsPageShell
      hero={
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Download className="w-12 h-12 text-[#d9a441]" />
          </div>
          <h1 className="text-5xl font-bold">{t("my_download_requests", "My Download Requests")}</h1>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto space-y-10">
        {error ? <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">{error}</div> : null}

        <section className="space-y-4">
          <h2 className="text-xl font-bold font-cinzel text-[var(--brand-teal)] dark:text-[var(--gold-light)]">
            {t("requests_i_made", "Requests I've Made")}
          </h2>
          <div className={`rounded-xl border overflow-hidden ${palette.panel}`}>
            {loading ? (
              <div className="p-8 text-center">{t("legacy.loading", "Loading...")}</div>
            ) : mine.length === 0 ? (
              <div className={`p-8 text-center text-sm ${palette.muted}`}>
                {t("no_download_requests", "No download requests")}
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {mine.map((request) => (
                  <div key={request.id} className="p-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">
                        {request.content_title || contentTypeLabel(request.content_type)}{" "}
                        <span className={`text-sm font-normal ${palette.muted}`}>
                          ({contentTypeLabel(request.content_type)})
                        </span>
                      </p>
                      <p className={`text-sm ${palette.muted}`}>
                        {t("legacy.requested", "Requested")}: {formatDate(request.requested_at)}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${
                        request.status === "approved"
                          ? "bg-green-600/15 text-green-500"
                          : request.status === "rejected"
                            ? "bg-red-600/15 text-red-500"
                            : "bg-[#d9a441]/15 text-[#d9a441]"
                      }`}
                    >
                      {request.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold font-cinzel text-[var(--brand-teal)] dark:text-[var(--gold-light)]">
            {t("requests_for_my_content", "Requests for My Content")}
          </h2>
          <div className={`rounded-xl border overflow-hidden ${palette.panel}`}>
            {loading ? (
              <div className="p-8 text-center">{t("legacy.loading", "Loading...")}</div>
            ) : forMyContent.length === 0 ? (
              <div className={`p-8 text-center text-sm ${palette.muted}`}>
                {t("no_download_requests", "No download requests")}
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {forMyContent.map((request) => (
                  <div key={request.id} className="p-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="grid gap-1.5">
                      <p className="font-semibold">
                        {request.requesterName || t("legacy.unknown_user", "Unknown user")}{" "}
                        <span className={`text-sm font-normal ${palette.muted}`}>
                          {t("requested_to_download", "requested to download")} {request.content_title || contentTypeLabel(request.content_type)}
                        </span>
                      </p>
                      <div className={`flex flex-wrap gap-4 text-sm ${palette.muted}`}>
                        <span className="inline-flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {formatDate(request.requested_at)}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {t("content_uploaded_on", "Uploaded")}: {formatDate(request.content_created_at)}
                        </span>
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
                    ) : (
                      <span
                        className={`text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full self-start ${
                          request.status === "approved"
                            ? "bg-green-600/15 text-green-500"
                            : "bg-red-600/15 text-red-500"
                        }`}
                      >
                        {request.status}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </RootsPageShell>
  );
}
