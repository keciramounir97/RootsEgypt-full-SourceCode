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

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
export interface AppNotification {
  id: string;
  title: string;
  body?: string;
  createdAt: number;
  read: boolean;
}

interface NotificationContextValue {
  items: AppNotification[];
  unreadCount: number;
  push: (title: string, body?: string) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

/* ------------------------------------------------------------------ */
/*  Local event bus (cross-tab via localStorage)                       */
/* ------------------------------------------------------------------ */
const EVENT = "rootsegypt:notify";
const STORAGE_KEY = "rootsegypt_notify_broadcast";

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

  /* Ingest a notification into state */
  const ingest = useCallback(
    (title: string, body: string | undefined, id: string) => {
      const n: AppNotification = {
        id,
        title,
        body,
        createdAt: Date.now(),
        read: false,
      };
      setItems((prev) => {
        if (prev.some((p) => p.id === id)) return prev;
        return [n, ...prev].slice(0, 100);
      });
      toast(title, { duration: 4000 });
    },
    [],
  );

  /* --- Local event listener --- */
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ title: string; body?: string }>;
      const { title, body } = ce.detail || { title: "" };
      if (!title) return;
      ingest(title, body, makeId());
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      try {
        const parsed = JSON.parse(e.newValue) as { title?: string; body?: string; id?: string; t?: number };
        if (!parsed.title) return;
        const bid = parsed.id || `ext-${parsed.t || Date.now()}`;
        if (lastCrossTabId.current === bid) return;
        lastCrossTabId.current = bid;
        ingest(parsed.title, parsed.body, bid);
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

  const push = useCallback((title: string, body?: string) => {
    dispatchAppNotification(title, body);
  }, []);

  const markRead = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((x) => (x.id === id ? { ...x, read: true } : x)),
    );
  }, []);

  const markAllRead = useCallback(() => {
    setItems((prev) => prev.map((x) => ({ ...x, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
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
    }),
    [items, unreadCount, push, markRead, markAllRead, clearAll],
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
    };
  }
  return ctx;
}
