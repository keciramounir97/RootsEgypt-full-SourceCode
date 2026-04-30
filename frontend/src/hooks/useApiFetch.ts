import { useState, useEffect, useCallback } from "react";
import { api } from "../api/client";
import { getApiErrorMessage } from "../api/helpers";

interface UseApiFetchOptions<T> {
  transform?: (d: unknown) => T;
  deps?: unknown[];
  enabled?: boolean;
}

/**
 * Reusable hook for API fetches with Loading and Error states.
 * @param urlOrFetcher - URL string, fetcher function, or null to skip
 * @param options - { transform, deps, enabled }
 * @returns {{ data, loading, error, refetch }}
 */
export function useApiFetch<T = unknown>(
  urlOrFetcher: string | (() => Promise<unknown>) | null,
  options: UseApiFetchOptions<T> = {}
) {
  const { transform = (d: unknown) => d as T, deps = [], enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState("");

  const fetcher = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError("");
    try {
      let result: unknown;
      if (typeof urlOrFetcher === "function") {
        result = await urlOrFetcher();
      } else if (typeof urlOrFetcher === "string") {
        const { data: res } = await api.get(urlOrFetcher);
        result = (res as { data?: unknown })?.data ?? res;
      } else {
        setLoading(false);
        return;
      }
      setData(transform(result));
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load data"));
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, urlOrFetcher, transform, ...deps]);

  useEffect(() => {
    fetcher();
  }, [fetcher]);

  return { data, loading, error, refetch: fetcher };
}
