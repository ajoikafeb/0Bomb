import { getSupabase } from "./client";
import { supabaseLogger } from "./logger";

export interface LeaderboardEntry {
  address: string;
  totalLevel: number;
  totalKills: number;
  heroCount: number;
  legendaryCount: number;
  wealth: number;
  totalTraits: number;
}

function isConnected() {
  return typeof process !== "undefined" && !!process.env.NEXT_PUBLIC_SUPABASE_URL;
}

export async function fetchGlobalLeaderboard(): Promise<LeaderboardEntry[]> {
  if (!isConnected()) return [];
  try {
    const { data: heroes, error } = await getSupabase()
      .from("heroes")
      .select("owner_address, level, is_legendary, traits, id")
      .not("owner_address", "is", null);

    if (error || !heroes) {
      supabaseLogger("fetchGlobalLeaderboard error:", error?.message);
      return [];
    }

    const { data: inventory } = await getSupabase()
      .from("inventory")
      .select("owner");
    const invCounts: Record<string, number> = {};
    if (inventory) {
      for (const i of inventory) {
        const addr = i.owner?.toLowerCase() || "";
        invCounts[addr] = (invCounts[addr] || 0) + 1;
      }
    }

    const map = new Map<string, LeaderboardEntry>();

    for (const h of heroes) {
      const addr = (h.owner_address || "").toLowerCase();
      if (!addr) continue;
      const existing = map.get(addr) || {
        address: h.owner_address,
        totalLevel: 0,
        totalKills: 0,
        heroCount: 0,
        legendaryCount: 0,
        wealth: 0,
        totalTraits: 0,
      };
      existing.totalLevel += h.level || 1;
      existing.heroCount += 1;
      if (h.is_legendary) existing.legendaryCount += 1;
      existing.totalTraits += (h.traits as string[])?.length || 0;
      existing.totalKills += 0;
      existing.wealth = (invCounts[addr] || 0) + existing.heroCount;
      map.set(addr, existing);
    }

    return Array.from(map.values());
  } catch (e) {
    supabaseLogger("fetchGlobalLeaderboard exception:", e);
    return [];
  }
}

export async function fetchTopByCategory(category: string, limit = 50): Promise<LeaderboardEntry[]> {
  const all = await fetchGlobalLeaderboard();
  const sorted = [...all].sort((a, b) => {
    switch (category) {
      case "level": return b.totalLevel - a.totalLevel;
      case "kills": return b.totalKills - a.totalKills;
      case "heroes": return b.heroCount - a.heroCount;
      case "legendary": return b.legendaryCount - a.legendaryCount;
      case "wealth": return b.wealth - a.wealth;
      case "traits": return b.totalTraits - a.totalTraits;
      default: return b.totalLevel - a.totalLevel;
    }
  });
  return sorted.slice(0, limit);
}
