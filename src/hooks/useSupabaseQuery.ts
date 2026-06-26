"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface QueryState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export function useSupabaseQuery<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
  options?: { fallback?: T; retryCount?: number; retryDelay?: number },
): QueryState<T> {
  const [data, setData] = useState<T | null>(options?.fallback ?? null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const attemptRef = useRef(0);
  const mountedRef = useRef(true);

  const retry = useCallback(() => {
    attemptRef.current = 0;
    setLoading(true);
    setError(null);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;
    const maxRetries = options?.retryCount ?? 2;
    const delay = options?.retryDelay ?? 1500;

    async function run() {
      while (attemptRef.current <= maxRetries && !cancelled) {
        try {
          const result = await fetcher();
          if (!cancelled && mountedRef.current) {
            setData(result);
            setLoading(false);
            setError(null);
            return;
          }
        } catch (e: any) {
          attemptRef.current++;
          if (attemptRef.current > maxRetries) {
            if (!cancelled && mountedRef.current) {
              setError(e?.message || "Failed to load data");
              setLoading(false);
            }
            return;
          }
          await new Promise(r => setTimeout(r, delay * attemptRef.current));
        }
      }
    }

    setLoading(true);
    setError(null);
    run();

    return () => {
      cancelled = true;
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, retry };
}
