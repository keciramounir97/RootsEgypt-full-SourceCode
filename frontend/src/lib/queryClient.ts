/**
 * TanStack Query v5 - Production-Grade Configuration
 * 
 * Features:
 * - Stale-While-Revalidate (SWR) strategy
 * - LocalStorage persistence (survives page refresh)
 * - Request deduplication (identical requests share cache)
 * - Automatic background refetching
 * - Garbage collection for old data
 */

import { QueryClient } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { AxiosError } from "axios";


/**
 * Cache Time Configuration (in milliseconds)
 * 
 * staleTime: How long data is considered "fresh" (no refetch)
 * gcTime: How long inactive data stays in cache before garbage collection
 */
export const CACHE_TIMES = {
  // Static data (rarely changes) - cache longer
  STATIC: {
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  },
  // Semi-static data (changes occasionally)
  SEMI_STATIC: {
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  },
  // Dynamic data (changes frequently)
  DYNAMIC: {
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  },
  // User-specific data (needs fresh)
  USER_DATA: {
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 15, // 15 minutes
  },
  // Real-time data (always fresh)
  REAL_TIME: {
    staleTime: 0, // Always stale
    gcTime: 1000 * 60 * 5, // 5 minutes
  },
};

/**
 * Query Keys Factory
 * Centralized key management for cache invalidation
 */
export const queryKeys = {
  // Books
  books: {
    all: ["books"],
    public: () => [...queryKeys.books.all, "public"],
    my: () => [...queryKeys.books.all, "my"],
    admin: () => [...queryKeys.books.all, "admin"],
    detail: (id: string | number) => [...queryKeys.books.all, "detail", id],
  },
  // Trees
  trees: {
    all: ["trees"],
    public: () => [...queryKeys.trees.all, "public"],
    my: () => [...queryKeys.trees.all, "my"],
    admin: () => [...queryKeys.trees.all, "admin"],
    detail: (id: string | number) => [...queryKeys.trees.all, "detail", id],
    persons: (treeId: string | number) => [...queryKeys.trees.all, treeId, "persons"],
  },
  // Gallery
  gallery: {
    all: ["gallery"],
    public: () => [...queryKeys.gallery.all, "public"],
    my: () => [...queryKeys.gallery.all, "my"],
    admin: () => [...queryKeys.gallery.all, "admin"],
    detail: (id: string | number) => [...queryKeys.gallery.all, "detail", id],
  },
  // Users (admin only)
  users: {
    all: ["users"],
    list: () => [...queryKeys.users.all, "list"],
    detail: (id: string | number) => [...queryKeys.users.all, "detail", id],
  },
  // Stats & Activity
  stats: {
    all: ["stats"],
    dashboard: () => [...queryKeys.stats.all, "dashboard"],
  },
  activity: {
    all: ["activity"],
    recent: () => [...queryKeys.activity.all, "recent"],
  },
  // Search
  search: {
    all: ["search"],
    query: (q: string) => [...queryKeys.search.all, q],
    suggest: (q: string) => [...queryKeys.search.all, "suggest", q],
  },
  // Settings
  settings: {
    all: ["settings"],
  },
  // Auth
  auth: {
    me: ["auth", "me"],
  },
};

/**
 * Create Query Client with production defaults
 */
export const createQueryClient = (): QueryClient => {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        // Default stale time (can be overridden per query)
        staleTime: CACHE_TIMES.DYNAMIC.staleTime,
        gcTime: CACHE_TIMES.DYNAMIC.gcTime,
        // Retry configuration
        retry: (failureCount, error) => {
          const axiosError = error as AxiosError;
          // Don't retry on 401/403/404
          if (axiosError?.response?.status === 401) return false;
          if (axiosError?.response?.status === 403) return false;
          if (axiosError?.response?.status === 404) return false;
          // Retry up to 2 times for other errors
          return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Refetch on window focus (good for fresh data)
        refetchOnWindowFocus: true,
        // Don't refetch on mount if data is fresh
        refetchOnMount: "always",
        // Refetch on reconnect
        refetchOnReconnect: true,
        // Network mode
        networkMode: "online",
      },
      mutations: {
        // Retry mutations once
        retry: 1,
        retryDelay: 1000,
        // Network mode
        networkMode: "online",
      },
    },
  });

  return client;
};

/**
 * Setup LocalStorage Persister
 * Survives page refresh, clears on logout
 */
export const setupPersistence = (queryClient: QueryClient) => {
  // Only persist in browser
  if (typeof window === "undefined") return;

  const persister = createSyncStoragePersister({
    storage: window.localStorage,
    key: "roots-egypt-query-cache",
    // Serialize/deserialize with error handling
    serialize: (data) => {
      try {
        return JSON.stringify(data);
      } catch {
        return "{}";
      }
    },
    deserialize: (data) => {
      try {
        return JSON.parse(data);
      } catch {
        return {};
      }
    },
  });

  persistQueryClient({
    queryClient,
    persister,
    // Max age for persisted cache (24 hours)
    maxAge: 1000 * 60 * 60 * 24,
    // Which queries to persist (exclude auth-sensitive data)
    dehydrateOptions: {
      shouldDehydrateQuery: (query) => {
        // Don't persist auth data
        const key = query.queryKey?.[0];
        if (key === "auth") return false;
        // Don't persist failed queries
        if (query.state.status === "error") return false;
        // Persist everything else
        return true;
      },
    },
  });
};

/**
 * Clear all cache (e.g., on logout)
 */
export const clearQueryCache = (queryClient: QueryClient) => {
  queryClient.clear();
  if (typeof window !== "undefined") {
    localStorage.removeItem("roots-egypt-query-cache");
  }
};

/**
 * Invalidate specific query keys
 * Use after mutations to refetch affected data
 */
export const invalidateQueries = async (queryClient: QueryClient, keys: any) => {
  const keyArray = Array.isArray(keys[0]) ? keys : [keys];
  await Promise.all(
    keyArray.map((key: any) => queryClient.invalidateQueries({ queryKey: key }))
  );
};

// Create default client instance
export const queryClient = createQueryClient();

// Setup persistence
setupPersistence(queryClient);

export default queryClient;
