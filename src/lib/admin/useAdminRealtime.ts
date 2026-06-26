"use client";

import { useState, useEffect, useCallback } from "react";
import { getAdminConfig } from "@/lib/game/GameStateManager";
import { getSupabase } from "@/lib/supabase/client";

interface AdminRealtimeStats {
  totalHeroes: number;
  aliveHeroes: number;
  totalPlayers: number;
  totalItems: number;
  activeListings: number;
  marketplaceVolume: number;
  avgLevel: number;
  totalMinted: number;
  loading: boolean;
  error: string | null;
}

function isConnected() {
  return typeof process !== "undefined" && !!process.env.NEXT_PUBLIC_SUPABASE_URL;
}

export function useAdminRealtimeStats() {
  const [stats, setStats] = useState<AdminRealtimeStats>({
    totalHeroes: 0, aliveHeroes: 0, totalPlayers: 0, totalItems: 0,
    activeListings: 0, marketplaceVolume: 0, avgLevel: 0, totalMinted: 0,
    loading: true, error: null,
  });

  const fetch = useCallback(async () => {
    if (!isConnected()) {
      // Fallback to localStorage
      const { getHeroes, getInventory, getCosmetics, getActiveListings } = await import("@/lib/game/GameStateManager");
      const heroes = getHeroes();
      const inv = getInventory();
      const cos = getCosmetics();
      const listings = getActiveListings();
      const allWallets = new Set([
        ...heroes.map((h: any) => h.owner_address).filter(Boolean),
        ...inv.map((i: any) => i.owner).filter(Boolean),
        ...listings.map((l: any) => l.seller).filter(Boolean),
      ]);
      setStats({
        totalHeroes: heroes.length,
        aliveHeroes: heroes.filter((h: any) => h.is_alive).length,
        totalPlayers: allWallets.size,
        totalItems: inv.length + cos.length,
        activeListings: listings.length,
        marketplaceVolume: listings.reduce((s: number, l: any) => s + (Number(l.price) || 0), 0),
        avgLevel: heroes.length ? heroes.reduce((s: number, h: any) => s + (h.level || 1), 0) / heroes.length : 0,
        totalMinted: heroes.length + inv.length + cos.length,
        loading: false, error: null,
      });
      return;
    }

    try {
      const db = getSupabase();
      const [heroRes, invRes, cosRes, listingRes] = await Promise.allSettled([
        db.from("heroes").select("id, level, is_alive, owner_address"),
        db.from("inventory").select("id, owner"),
        db.from("cosmetics").select("id, owner"),
        db.from("marketplace_listings").select("id, price").eq("status", "active"),
      ]);

      let heroes: any[] = [];
      let inventory: any[] = [];
      let cosmetics: any[] = [];
      let activeListings: any[] = [];

      if (heroRes.status === "fulfilled") heroes = heroRes.value.data || [];
      if (invRes.status === "fulfilled") inventory = invRes.value.data || [];
      if (cosRes.status === "fulfilled") cosmetics = cosRes.value.data || [];
      if (listingRes.status === "fulfilled") activeListings = listingRes.value.data || [];

      const allWallets = new Set([
        ...heroes.map(h => h.owner_address).filter(Boolean),
        ...inventory.map(i => i.owner).filter(Boolean),
      ]);

      setStats({
        totalHeroes: heroes.length,
        aliveHeroes: heroes.filter(h => h.is_alive).length,
        totalPlayers: allWallets.size,
        totalItems: inventory.length + cosmetics.length,
        activeListings: activeListings.length,
        marketplaceVolume: activeListings.reduce((s, l) => s + (Number(l.price) || 0), 0),
        avgLevel: heroes.length ? heroes.reduce((s, h) => s + (h.level || 1), 0) / heroes.length : 0,
        totalMinted: heroes.length + inventory.length + cosmetics.length,
        loading: false, error: null,
      });
    } catch {
      setStats(prev => ({ ...prev, loading: false, error: "Failed to fetch stats" }));
    }
  }, []);

  useEffect(() => {
    fetch();
    const id = setInterval(fetch, 10000);
    return () => clearInterval(id);
  }, [fetch]);

  const cfg = getAdminConfig();
  return { ...stats, cfg };
}
