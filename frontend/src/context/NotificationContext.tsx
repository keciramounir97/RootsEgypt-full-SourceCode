import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import toast from "react-hot-toast";
import { api } from "../api/client";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
export interface AppNotification {
  id: string;
  title: string;
  body?: string;
  targetType?: string;
  targetId?: string;
  type?: string;
  createdAt: number;
  read: boolean;
  /** 'local' = browser-only; 'server' = from backend */
  source: "local" | "server";
}

interface NotificationContextValue {
  items: AppNotification[];
  unreadCount: number;
  push: (title: string, body?: string) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
  refreshFromServer: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

/* ------------------------------------------------------------------ */
/*  Local event bus (cross-tab via localStorage)                       */
/* ------------------------------------------------------------------ */
const EVENT = "rootsegypt:notify";
const STORAGE_KEY = "rootsegypt_notify_broadcast";
const POLL_INTERVAL = 30_000; // poll server every 30s

function makeId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `n-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function dispatchAppNotification(title: string, body?: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(EVENT, { detail: { title, body } as { title: string; body?: string } })
  );
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ title, body, id: makeId(), t: Date.now() })
    );
  } catch {
    /* quota / private mode */
  }
}

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<AppNotification[]>([]);
  const lastCrossTabId = useRef<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const seenServerIds = useRef(new Set<string>());

  /* Ingest a notification into state */
  const ingest = useCallback(
    (title: string, body: string | undefined, id: string, source: "local" | "server" = "local", extra?: Partial<AppNotification>) => {
      const n: AppNotification = {
        id,
        title,
        body,
        createdAt: Date.now(),
        read: false,
        source,
        ...extra,
      };
      setItems((prev) => {
        // Prevent duplicates
        if (prev.some((p) => p.id === id)) return prev;
        return [n, ...prev].slice(0, 100);
      });
      toast(title, { duration: 4000 });
    },
    []
  );

  /* --- Local event listener --- */
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ title: string; body?: string }>;
      const { title, body } = ce.detail || { title: "" };
      if (!title) return;
      ingest(title, body, makeId(), "local");
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      try {
        const parsed = JSON.parse(e.newValue) as { title?: string; body?: string; id?: string; t?: number };
        if (!parsed.title) return;
        const bid = parsed.id || `ext-${parsed.t || Date.now()}`;
        if (lastCrossTabId.current === bid) return;
        lastCrossTabId.current = bid;
        ingest(parsed.title, parsed.body, bid, "local");
      } catch {
        /* ignore */
      }
    };

    window.addEventListener(EVENT, handler);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(EVENT, handler);
      window.removeEventListener("storage", onStorage);
    };
  }, [ingest]);

  /* --- Server polling --- */
  const fetchServerNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await api.get("/notifications", { params: { limit: 50 } });
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];

      for (const n of data) {
        const id = `srv-${n.id}`;
        if (seenServerIds.current.has(id)) continue;
        seenServerIds.current.add(id);

        const notification: AppNotification = {
          id,
          title: n.title,
          body: n.body,
          targetType: n.target_type || n.targetType,
          targetId: n.target_id || n.targetId,
          type: n.type,
          createdAt: new Date(n.created_at || n.createdAt).getTime(),
          read: n.is_read ?? n.isRead ?? false,
          source: "server",
        };

        setItems((prev) => {
          if (prev.some((p) => p.id === id)) return prev;
          // Insert sorted by createdAt desc
          const next = [...prev, notification].sort((a, b) => b.createdAt - a.createdAt).slice(0, 100);
          return next;
        });

        // Only toast unread ones that are recent (within last 2 minutes)
        if (!notification.read && Date.now() - notification.createdAt < 120_000) {
          toast(notification.title, { duration: 4000 });
        }
      }
    } catch {
      /* offline or not authenticated */
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchServerNotifications();

    // Poll
    pollRef.current = setInterval(fetchServerNotifications, POLL_INTERVAL);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchServerNotifications]);

  /* --- Actions --- */
  const push = useCallback((title: string, body?: string) => {
    dispatchAppNotification(title, body);
  }, []);

  const markRead = useCallback(async (id: string) => {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, read: true } : x)));

    // If server notification, also mark on backend
    if (id.startsWith("srv-")) {
      const serverId = id.replace("srv-", "");
      try {
        await api.patch(`/notifications/${serverId}/read`);
      } catch {
        /* silent */
      }
    }
  }, []);

  const markAllRead = useCallback(async () => {
    setItems((prev) => prev.map((x) => ({ ...x, read: true })));
    try {
      const token = localStorage.getItem("token");
      if (token) await api.patch("/notifications/read-all");
    } catch {
      /* silent */
    }
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
    seenServerIds.current.clear();
  }, []);

  const unreadCount = useMemo(() => items.filter((x) => !x.read).length, [items]);

  const value = useMemo(
    () => ({
      items,
      unreadCount,
      push,
      markRead,
      markAllRead,
      clearAll,
      refreshFromServer: fetchServerNotifications,
    }),
    [items, unreadCount, push, markRead, markAllRead, clearAll, fetchServerNotifications]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    return {
      items: [],
      unreadCount: 0,
      push: () => {},
      markRead: () => {},
      markAllRead: () => {},
      clearAll: () => {},
      refreshFromServer: async () => {},
    };
  }
  return ctx;
}
