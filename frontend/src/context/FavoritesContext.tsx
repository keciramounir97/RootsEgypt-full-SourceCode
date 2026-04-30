import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type FavoriteKind = "image" | "tree" | "book" | "audio" | "document";

type Store = Record<FavoriteKind, Record<string, boolean>>;

const STORAGE_KEY = "rootsegypt_favorites_v1";

const emptyStore = (): Store => ({
  image: {},
  tree: {},
  book: {},
  audio: {},
  document: {},
});

function loadStore(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as Partial<Store>;
    const base = emptyStore();
    (Object.keys(base) as FavoriteKind[]).forEach((k) => {
      if (parsed[k] && typeof parsed[k] === "object") {
        base[k] = { ...parsed[k] };
      }
    });
    return base;
  } catch {
    return emptyStore();
  }
}

function saveStore(s: Store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore quota */
  }
}

interface FavoritesContextValue {
  store: Store;
  isFavorite: (kind: FavoriteKind, id: string | number) => boolean;
  toggleFavorite: (kind: FavoriteKind, id: string | number) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store>(() =>
    typeof window !== "undefined" ? loadStore() : emptyStore()
  );

  useEffect(() => {
    setStore(loadStore());
  }, []);

  const isFavorite = useCallback(
    (kind: FavoriteKind, id: string | number) => {
      const key = String(id);
      return Boolean(store[kind]?.[key]);
    },
    [store]
  );

  const toggleFavorite = useCallback(
    (kind: FavoriteKind, id: string | number) => {
      const key = String(id);
      setStore((prev) => {
        const next = { ...prev, [kind]: { ...prev[kind] } };
        if (next[kind][key]) {
          delete next[kind][key];
        } else {
          next[kind][key] = true;
        }
        saveStore(next);
        return next;
      });
    },
    []
  );

  const value = useMemo(
    () => ({ store, isFavorite, toggleFavorite }),
    [store, isFavorite, toggleFavorite]
  );

  return (
    <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    return {
      store: emptyStore(),
      isFavorite: () => false,
      toggleFavorite: () => {},
    };
  }
  return ctx;
}
