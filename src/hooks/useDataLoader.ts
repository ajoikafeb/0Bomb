"use client";

import { useEffect, useRef } from "react";
import { pullFromSupabase } from "@/lib/supabase/dataLoader";

export function useDataLoader(address: string | null, isConnected: boolean) {
  const prevRef = useRef<string | null>(null);

  useEffect(() => {
    if (isConnected && address && address !== prevRef.current) {
      prevRef.current = address;
      pullFromSupabase(address);
    }
    if (!isConnected) {
      prevRef.current = null;
    }
  }, [address, isConnected]);
}
