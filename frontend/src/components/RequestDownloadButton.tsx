import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Clock, Download, X } from "lucide-react";
import { api } from "../api/client";
import { getApiErrorMessage } from "../api/helpers";
import { useAuth } from "../admin/components/AuthContext";
import { useLanguage } from "../i18n";
import { useThemeStore } from "../store/theme";

export type DownloadContentType = "tree" | "book" | "gallery" | "audio" | "document";

interface RequestDownloadButtonProps {
  contentType: DownloadContentType;
  contentId: number | string | null | undefined;
  downloadHref: string;
  fileName?: string;
  /** Set true when the viewer already owns this content or is an admin — skips the request flow entirely. */
  canDownloadDirectly?: boolean;
  className?: string;
}

export default function RequestDownloadButton({
  contentType,
  contentId,
  downloadHref,
  fileName,
  canDownloadDirectly = false,
  className = "",
}: RequestDownloadButtonProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { theme } = useThemeStore();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  const [status, setStatus] = useState<"pending" | "approved" | "rejected" | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setStatus(null);
    setError("");
    if (!user || canDownloadDirectly || contentId == null) return;

    api
      .get("/download-requests/mine/status", { params: { contentType, contentId } })
      .then(({ data }) => {
        if (!cancelled) setStatus(data?.status || null);
      })
      .catch(() => {
        if (!cancelled) setStatus(null);
      });

    return () => {
      cancelled = true;
    };
  }, [user, canDownloadDirectly, contentType, contentId]);

  const baseBtn = `inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
    isDark ? "border-white/15 hover:border-[#d9a441]" : "border-[#e8e4dc] hover:border-[#d9a441]"
  } hover:bg-[#d9a441]/10 disabled:cursor-not-allowed disabled:opacity-60`;

  const triggerDownload = async () => {
    setBusy(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(downloadHref, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error("download failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || "download";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError(t("download_failed", "Download failed"));
    } finally {
      setBusy(false);
    }
  };

  const requestDownload = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api.post("/download-requests", { contentType, contentId });
      setStatus("pending");
    } catch (err) {
      setError(getApiErrorMessage(err, t("request_download_failed", "Failed to submit request")));
    } finally {
      setBusy(false);
    }
  };

  if (canDownloadDirectly) {
    return (
      <div className={className}>
        <button type="button" onClick={triggerDownload} disabled={busy} className={baseBtn}>
          <Download className="h-4 w-4" />
          {t("legacy.download", "Download")}
        </button>
        {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
      </div>
    );
  }

  if (status === "approved") {
    return (
      <div className={className}>
        <button type="button" onClick={triggerDownload} disabled={busy} className={baseBtn}>
          <Download className="h-4 w-4" />
          {t("legacy.download", "Download")}
        </button>
        {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className={className}>
        <span
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium opacity-70 ${
            isDark ? "border-white/15" : "border-[#e8e4dc]"
          }`}
        >
          <Clock className="h-4 w-4" />
          {t("request_pending", "Request Pending")}
        </span>
      </div>
    );
  }

  return (
    <div className={className}>
      <button type="button" onClick={requestDownload} disabled={busy} className={baseBtn}>
        {status === "rejected" ? <X className="h-4 w-4 text-red-500" /> : <Check className="h-4 w-4" />}
        {status === "rejected"
          ? t("request_denied_retry", "Request Denied — Try Again")
          : t("request_download", "Request to Download")}
      </button>
      {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
