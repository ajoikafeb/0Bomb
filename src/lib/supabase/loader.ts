import { getSupabase } from "./client";
import { supabaseLogger } from "./logger";
import type { Hero } from "@/lib/game/types";
import type { Equipment } from "@/lib/game/equipmentSystem";
import type { Cosmetic } from "@/lib/game/cosmeticSystem";
import type { MarketplaceListing } from "@/lib/game/types";

function db() {
  return getSupabase();
}

function isConnected() {
  return typeof process !== "undefined" && !!process.env.NEXT_PUBLIC_SUPABASE_URL;
}

interface LoadedData {
  heroes: Hero[];
  inventory: Equipment[];
  cosmetics: Cosmetic[];
  listings: MarketplaceListing[];
  balance: number;
}

export async function loadPlayerData(address: string): Promise<LoadedData | null> {
  if (!isConnected() || !address) return null;

  try {
    const [heroesRes, invRes, cosRes, listingsRes, profileRes] = await Promise.allSettled([
      db().from("heroes").select("*").eq("owner_address", address),
      db().from("inventory").select("*").eq("owner", address),
      db().from("cosmetics").select("*").eq("owner", address),
      db().from("marketplace_listings").select("*").or(`seller.eq.${address}`),
      db().from("profiles").select("spout_balance").eq("address", address).single(),
    ]);

    const heroes = heroesRes.status === "fulfilled" ? (heroesRes.value.data as unknown as Hero[] || []) : [];
    const inventory = invRes.status === "fulfilled" ? (invRes.value.data as unknown as Equipment[] || []) : [];
    const cosmetics = cosRes.status === "fulfilled" ? (cosRes.value.data as unknown as Cosmetic[] || []) : [];
    const listings = listingsRes.status === "fulfilled" ? (listingsRes.value.data as unknown as MarketplaceListing[] || []) : [];
    const balance = profileRes.status === "fulfilled" ? (profileRes.value.data?.spout_balance || 0) : 0;

    supabaseLogger(`Loaded: ${heroes.length} heroes, ${inventory.length} items, ${cosmetics.length} cosmetics, ${listings.length} listings, balance ${balance}`);

    return { heroes, inventory, cosmetics, listings, balance };
  } catch (e) {
    supabaseLogger("loadPlayerData error:", e);
    return null;
  }
}

export async function loadAdminConfig() {
  if (!isConnected()) return null;
  try {
    const { data } = await db().from("admin_config").select("*").eq("id", 1).single();
    return data;
  } catch {
    return null;
  }
}
