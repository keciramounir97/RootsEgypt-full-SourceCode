import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import toast from "react-hot-toast";

// Custom Event Dispatcher
const dispatchAuthEvent = (name: string, detail?: any) => {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new CustomEvent(name, { detail }));
  } catch {
    // ignore
  }
};

const API_ROOT = (() => {
  const configured = String(import.meta.env.VITE_API_URL || "").trim();
  if (configured) {
    return configured.replace(/\/+$/, "");
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

  return "https://api.rootsegypt.org";
})();

const baseURL = `${API_ROOT.replace(/\/+$/, "")}/api`;

export const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    Accept: "application/json",
  },
  withCredentials: true,
});

// Request Interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");

    // Auto-attach token if available
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Check for protected routes if no token (legacy check from client.js)
    const url = String(config?.url || "");
    const isProtected =
      url.includes("/my/") ||
      url.includes("/admin/") ||
      url.includes("/auth/me") ||
      url.includes("/auth/logout");

    if (!token && isProtected) {
      dispatchAuthEvent("auth:missing", { url });
      // We can throw here or let the backend reject it
      // Throwing might be cleaner to stop the request
      return Promise.reject(new Error("AUTH_MISSING"));
    }

    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  },
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";

    // Handle Network Errors
    if (!error.response) {
      toast.error(
        "Cannot connect to the Roots Egypt server. Please verify that the backend is deployed and reachable.",
      );
      return Promise.reject(error);
    }

    // Handle 401 - Token Expired / Refresh
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${baseURL}/auth/refresh`,
            { refreshToken },
            { headers: { "Content-Type": "application/json" } },
          );

          if (data?.token) {
            localStorage.setItem("token", data.token);
            if (data.refreshToken)
              localStorage.setItem("refreshToken", data.refreshToken);

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${data.token}`;
            }
            return api(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          dispatchAuthEvent("auth:expired");
          toast.error("Session expired. Please login again.");
          // Redirect if needed, or rely on AuthContext to listen to event
          if (
            typeof window !== "undefined" &&
            !window.location.pathname.startsWith("/login")
          ) {
            window.location.href = "/login";
          }
        }
      } else {
        // No refresh token
        localStorage.removeItem("token");
        dispatchAuthEvent("auth:expired");
        // Only toast if it was a protected route failure and not just a failed login attempt
        // But 401 on login is handled by local catch usually.
        // We generally don't want to redirect on login page 401.
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.startsWith("/login")
        ) {
          toast.error("Session expired. Please login again.");
          window.location.href = "/login";
        }
      }
    } else if (status === 403) {
      toast.error("You do not have permission to perform this action.");
    } else if (status === 500) {
      toast.error("Server error. Please try again later.");
    } else if (status && status !== 401) {
      // 401 is handled above, 400s usually handled by component or specific logic
      // We can toast here mostly for 4xx/5xx that are not caught elsewhere
      // But components might want to handle specific 400s (like validation) themselves without double toasting.
      // For now, consistent toast is good.
      if (status !== 404 && !originalRequest.url?.includes("/auth/login")) {
        toast.error(message);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
