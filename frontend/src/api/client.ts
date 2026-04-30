import axios, { InternalAxiosRequestConfig } from "axios";
import { isMockMode, mockAdapter } from "../lib/mockApi";

/**
 * ===============================
 * API ROOT RESOLUTION
 * ===============================
 */
const getApiRoot = (): string => {
  // Custom URL set by the user via BackendPanel
  const customUrl = localStorage.getItem("rootsegypt_api_url");
  if (customUrl && customUrl.trim()) {
    return customUrl.trim().replace(/\/+$/, "");
  }

  if (import.meta.env.DEV) {
    if (
      typeof window !== "undefined" &&
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1"
    ) {
      return `http://${window.location.hostname}:5000`;
    }
    return "http://localhost:5000";
  }

  return import.meta.env.VITE_API_URL || "https://api.rootsegypt.org";
};

const API_ROOT = getApiRoot();
const NORMALIZED_API_ROOT = API_ROOT.replace(/\/+$/, "");

/**
 * ===============================
 * AXIOS INSTANCE
 * ===============================
 */
export const api = axios.create({
  baseURL: `${NORMALIZED_API_ROOT}/api`,
  timeout: 15000,
  headers: {
    Accept: "application/json",
  },
  withCredentials: false,
});

// ── Install mock adapter when in mock mode ─────────────────────────
if (isMockMode()) {
  (api as any).defaults.adapter = mockAdapter;
}

const dispatchAuthEvent = (name: string, detail: any) => {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new CustomEvent(name, { detail }));
  } catch {
    // ignore
  }
};

const getRequestPath = (value: any): string => {
  const raw = String(value || "");
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    try {
      return new URL(raw).pathname || raw;
    } catch {
      return raw;
    }
  }
  return raw;
};

/**
 * ===============================
 * REQUEST INTERCEPTOR
 * ===============================
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Skip auth checks in mock mode — the mock adapter handles everything
    if (isMockMode()) return config;

    const token = localStorage.getItem("token");

    const url = String(config?.url || "");
    const path = getRequestPath(url);
    const isProtected =
      path.includes("/my/") ||
      path.includes("/admin/") ||
      path.includes("/auth/me") ||
      path.includes("/auth/logout");

    if (!token && isProtected) {
      dispatchAuthEvent("auth:missing", { url, path });
      const err: any = new Error("AUTH_MISSING");
      err.code = "AUTH_MISSING";
      err.isAuthError = true;
      throw err;
    }

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
    config.headers["Pragma"] = "no-cache";
    config.headers["Expires"] = "0";

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * ===============================
 * RESPONSE INTERCEPTOR
 * ===============================
 */
api.interceptors.response.use(
  (response) => {
    // Unwrap API Envelope { statusCode, data, meta } -> data
    if (
      response.data &&
      response.data.data &&
      response.data.statusCode &&
      Object.keys(response.data).length <= 5
    ) {
      const backendEnvelope = response.data;
      response.data = backendEnvelope.data;
      (response as any).meta = backendEnvelope.meta;
    }
    return response;
  },
  async (error: any) => {
    // In mock mode, errors from the mock adapter are intentional
    if (isMockMode()) return Promise.reject(error);

    const status = error?.response?.status;
    const code = error?.code;
    const message = error?.message || "";

    if (
      code === "ECONNREFUSED" ||
      code === "ERR_CONNECTION_REFUSED" ||
      message.includes("ERR_CONNECTION_REFUSED") ||
      code === "ERR_NETWORK"
    ) {
      error.isConnectionError = true;
      error.userMessage =
        "Cannot connect to server. Enable Mock Mode (bottom-right button) to use demo data, or start your backend.";
      dispatchAuthEvent("api:connection_error", {
        message: error.userMessage,
        code,
      });
    }

    if (!error.userMessage) {
      const apiMessage = error?.response?.data?.message;
      if (typeof apiMessage === "string" && apiMessage.trim()) {
        error.userMessage = apiMessage;
      } else if (status === 403) {
        error.userMessage =
          "You do not have permission to perform this action.";
      } else if (status === 404) {
        error.userMessage = "Requested resource was not found.";
      } else if (status === 422) {
        error.userMessage =
          "Submitted data is invalid. Please review and try again.";
      } else if (status && status >= 500) {
        error.userMessage = "Server error. Please try again shortly.";
      } else {
        error.userMessage = "Request failed. Please try again.";
      }
    }

    // Token invalid / expired — try refresh token
    if (status === 401) {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken && !error.config?._retry) {
        try {
          const { data } = await axios.post(
            `${NORMALIZED_API_ROOT}/api/auth/refresh`,
            { refreshToken },
            { headers: { "Content-Type": "application/json" } },
          );

          let newToken = data?.token;
          let newRefreshToken = data?.refreshToken;

          if (!newToken && data?.data?.token) {
            newToken = data.data.token;
            newRefreshToken = data.data.refreshToken;
          }

          if (newToken) {
            localStorage.setItem("token", newToken);
            if (newRefreshToken)
              localStorage.setItem("refreshToken", newRefreshToken);
            error.config.headers = error.config.headers || {};
            error.config.headers.Authorization = `Bearer ${newToken}`;
            error.config._retry = true;
            return api.request(error.config);
          }
        } catch {
          // Refresh failed
        }
      }
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      dispatchAuthEvent("auth:expired", { status });
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/login")
      ) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);
