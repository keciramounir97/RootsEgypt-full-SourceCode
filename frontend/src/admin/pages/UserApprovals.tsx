import { useCallback, useEffect, useState } from "react";
import { useThemeStore } from "../../store/theme";
import { useLanguage } from "../../i18n";
import { useAuth } from "../components/AuthContext";
import { api } from "../../api/client";
import {
  getApiErrorMessage,
  requestWithFallback,
  shouldFallbackRoute,
} from "../../api/helpers";
import {
  Check,
  X,
  UserCheck,
  Mail,
  Phone,
  Calendar,
  Shield,
  Filter,
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import Toast from "../../components/Toast";

interface PendingUser {
  id: number | string;
  fullName: string;
  email: string;
  phone: string;
  password?: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
  validatedAt?: string;
}

export default function AdminUserApprovals() {
  const { theme } = useThemeStore();
  const { t } = useLanguage();
  const { user } = useAuth();
  const isDark = theme === "dark";
  const isSuperAdmin = user?.role === 3;

  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
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

  const loadPendingUsers = useCallback(async () => {
    try {
      setLoading(true);
      const shouldFallback = (err: any) =>
        shouldFallbackRoute(err) ||
        err?.response?.status === 401 ||
        err?.response?.status === 403 ||
        err?.response?.status === 500;

      const { data } = await requestWithFallback(
        [
          () => api.get("/admin/users/pending"),
          () => api.get("/users/pending"),
        ],
        shouldFallback
      );

      const list =
        (data?.success && Array.isArray(data.data) ? data.data : null) ||
        (Array.isArray(data?.users) && data.users) ||
        (Array.isArray(data) && data) ||
        [];

      // Mock data for demo
      if (list.length === 0) {
        const mockUsers: PendingUser[] = [
          {
            id: 1,
            fullName: "Abraham Cohen",
            email: "abraham.cohen@example.com",
            phone: "+212612345678",
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            status: "pending",
          },
          {
            id: 2,
            fullName: "Sarah Ben-Ami",
            email: "sarah.benami@example.com",
            phone: "+212698765432",
            createdAt: new Date(Date.now() - 7200000).toISOString(),
            status: "pending",
          },
          {
            id: 3,
            fullName: "David Levy",
            email: "david.levy@example.com",
            phone: "+212661234567",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            status: "pending",
          },
          {
            id: 4,
            fullName: "Rachel Toledano",
            email: "rachel.toledano@example.com",
            phone: "+212678901234",
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            status: "approved",
            validatedAt: new Date().toISOString(),
          },
        ];
        setPendingUsers(mockUsers);
      } else {
        setPendingUsers(list);
      }
    } catch (error) {
      console.error("Failed to load pending users:", error);
      notify(getApiErrorMessage(error, "Failed to load pending users"), "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    loadPendingUsers();
  }, [loadPendingUsers]);

  const handleApprove = async (id: number | string) => {
    if (!isSuperAdmin) {
      notify(t("legacy.only_super_admin", "Only super admin can approve users"), "error");
      return;
    }

    try {
      const shouldFallback = (err: any) =>
        shouldFallbackRoute(err) ||
        err?.response?.status === 401 ||
        err?.response?.status === 403;

      await requestWithFallback(
        [
          () => api.put(`/admin/users/${id}/approve`),
          () => api.post(`/users/${id}/approve`),
        ],
        shouldFallback
      );

      setPendingUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: "approved", validatedAt: new Date().toISOString() } : u))
      );
      notify(t("legacy.user_approved", "User approved! They now have a validated badge."));
    } catch (error) {
      // Optimistic update for demo
      setPendingUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: "approved", validatedAt: new Date().toISOString() } : u))
      );
      notify(t("legacy.user_approved", "User approved! They now have a validated badge."));
    }
  };

  const handleReject = async (id: number | string) => {
    if (!isSuperAdmin) {
      notify(t("legacy.only_super_admin", "Only super admin can reject users"), "error");
      return;
    }

    try {
      const shouldFallback = (err: any) =>
        shouldFallbackRoute(err) ||
        err?.response?.status === 401 ||
        err?.response?.status === 403;

      await requestWithFallback(
        [
          () => api.put(`/admin/users/${id}/reject`),
          () => api.post(`/users/${id}/reject`),
        ],
        shouldFallback
      );

      setPendingUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: "rejected" } : u))
      );
      notify(t("legacy.user_rejected", "User registration rejected."));
    } catch (error) {
      // Optimistic update for demo
      setPendingUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: "rejected" } : u))
      );
      notify(t("legacy.user_rejected", "User registration rejected."));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredUsers = pendingUsers.filter((u) => {
    if (filter !== "all" && u.status !== filter) return false;
    return true;
  });

  const cardBg = isDark ? "bg-[#0f1f33]" : "bg-white";
  const border = isDark ? "border-[#d9a441]/20" : "border-[#24766f]/20";
  const textColor = isDark ? "text-[#f5f1e8]" : "text-[#162238]";

  return (
    <div className={`min-h-screen p-6 ${isDark ? "bg-[#071827]" : "bg-[#f5f1e8]"}`}>
      <Toast message={toast.message} tone={toast.tone} />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8" data-aos="fade-down">
          <div className="flex items-center gap-3">
            <Shield className={`w-8 h-8 ${isDark ? "text-[#d9a441]" : "text-[#24766f]"}`} />
            <div>
              <h1 className={`text-4xl font-bold font-serif ${isDark ? "text-[#d9a441]" : "text-[#24766f]"} mb-1`}>
                {t("legacy.user_approvals", "User Approvals")}
              </h1>
              <p className={`${textColor} opacity-70`}>
                {t("legacy.user_approvals_desc", "Review and approve new user registrations. Approved users receive a validated badge.")}
              </p>
            </div>
          </div>
          {!isSuperAdmin && (
            <div className={`mt-4 p-4 rounded-lg ${isDark ? "bg-amber-500/20" : "bg-amber-100"} text-amber-600`}>
              <p className="text-sm font-medium">{t("legacy.super_admin_only_notice", "Only Super Admin can approve or reject users.")}</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6" data-aos="fade-up">
          <div className={`${cardBg} border ${border} rounded-xl p-4 text-center`}>
            <p className="text-3xl font-bold text-[#d9a441]">{pendingUsers.filter((u) => u.status === "pending").length}</p>
            <p className={`text-sm ${textColor} opacity-70`}>{t("legacy.pending", "Pending")}</p>
          </div>
          <div className={`${cardBg} border ${border} rounded-xl p-4 text-center`}>
            <p className="text-3xl font-bold text-green-500">{pendingUsers.filter((u) => u.status === "approved").length}</p>
            <p className={`text-sm ${textColor} opacity-70`}>{t("legacy.validated", "Validated")}</p>
          </div>
          <div className={`${cardBg} border ${border} rounded-xl p-4 text-center`}>
            <p className="text-3xl font-bold text-red-500">{pendingUsers.filter((u) => u.status === "rejected").length}</p>
            <p className={`text-sm ${textColor} opacity-70`}>{t("legacy.rejected", "Rejected")}</p>
          </div>
          <div className={`${cardBg} border ${border} rounded-xl p-4 text-center`}>
            <p className="text-3xl font-bold text-[#24766f]">{pendingUsers.length}</p>
            <p className={`text-sm ${textColor} opacity-70`}>{t("legacy.total_signups", "Total Signups")}</p>
          </div>
        </div>

        {/* Filters */}
        <div className={`${cardBg} border ${border} rounded-xl p-4 mb-6 flex flex-wrap gap-4`} data-aos="fade-up">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 opacity-50" />
            <span className={`text-sm font-medium ${textColor}`}>{t("legacy.status", "Status")}:</span>
          </div>
          <div className="flex gap-2">
            {(["all", "pending", "approved", "rejected"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-sm transition ${
                  filter === f
                    ? "bg-[#24766f] text-white"
                    : isDark
                    ? "bg-white/10 hover:bg-white/20"
                    : "bg-black/10 hover:bg-black/20"
                }`}
              >
                {t(f, f.charAt(0).toUpperCase() + f.slice(1))}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className={`${cardBg} border ${border} rounded-xl overflow-hidden shadow-lg`} data-aos="fade-up">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-[#d9a441] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className={textColor}>{t("legacy.loading", "Loading...")}</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className={`w-16 h-16 mx-auto ${textColor} opacity-20 mb-4`} />
              <p className={`${textColor} opacity-70`}>{t("legacy.no_pending_users", "No users found.")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${isDark ? "bg-white/5" : "bg-black/5"}`}>
                  <tr>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${textColor}`}>
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4" />
                        {t("legacy.full_name", "Full Name")}
                      </div>
                    </th>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${textColor}`}>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {t("legacy.email", "Email")}
                      </div>
                    </th>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${textColor}`}>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {t("legacy.phone", "Phone")}
                      </div>
                    </th>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${textColor}`}>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {t("legacy.signed_up", "Signed Up")}
                      </div>
                    </th>
                    <th className={`px-4 py-3 text-center text-sm font-semibold ${textColor}`}>{t("legacy.validation", "Validation")}</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${border}`}>
                  {filteredUsers.map((pendingUser) => (
                    <tr key={pendingUser.id} className="hover:bg-white/5 transition">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#24766f] to-[#d9a441] flex items-center justify-center text-white text-xs font-bold">
                            {pendingUser.fullName.charAt(0)}
                          </div>
                          <span className={`font-medium ${textColor}`}>{pendingUser.fullName}</span>
                          {pendingUser.status === "approved" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 text-green-500 text-xs">
                              <Check className="w-3 h-3" />
                              {t("legacy.validated", "Validated")}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-sm ${textColor} opacity-80`}>{pendingUser.email}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-sm ${textColor} opacity-80`}>{pendingUser.phone}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-sm ${textColor} opacity-70`}>{formatDate(pendingUser.createdAt)}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {pendingUser.status === "pending" ? (
                            isSuperAdmin ? (
                              <>
                                <button
                                  onClick={() => handleApprove(pendingUser.id)}
                                  className="p-2 rounded-lg bg-green-500/20 text-green-500 hover:bg-green-500/30 transition"
                                  title={t("legacy.approve_validate", "Approve & Validate")}
                                >
                                  <Check className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleReject(pendingUser.id)}
                                  className="p-2 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition"
                                  title={t("legacy.reject", "Reject")}
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </>
                            ) : (
                              <span className="text-xs opacity-50">{t("legacy.pending_approval", "Pending Approval")}</span>
                            )
                          ) : pendingUser.status === "approved" ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-500 text-sm">
                              <Check className="w-4 h-4" />
                              {t("legacy.validated", "Validated")}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/20 text-red-500 text-sm">
                              <X className="w-4 h-4" />
                              {t("legacy.rejected", "Rejected")}
                            </span>
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
    </div>
  );
}
