import { loadSave, saveState } from "@/lib/game/GameStateManager";
import { getSupabase } from "./client";
import { supabaseLogger } from "./logger";
import type { Hero } from "@/lib/game/types";
import type { Equipment } from "@/lib/game/equipmentSystem";
import type { Cosmetic } from "@/lib/game/cosmeticSystem";

function isConnected() {
  return typeof process !== "undefined" && !!process.env.NEXT_PUBLIC_SUPABASE_URL;
}

function db() {
  return getSupabase();
}

let _lastSyncAddress: string | null = null;
let _syncing = false;

export function getLastSyncAddress() {
  return _lastSyncAddress;
}

export function isDataSyncing() {
  return _syncing;
}

export async function pullFromSupabase(address: string): Promise<boolean> {
  if (!isConnected() || !address || _syncing) return false;
  _syncing = true;

  try {
    supabaseLogger(`Pulling data from Supabase for ${address.slice(0, 6)}...`);

    const [heroesRes, invRes, cosRes, profileRes, configRes] = await Promise.allSettled([
      db().from("heroes").select("*").eq("owner_address", address),
      db().from("inventory").select("*").eq("owner", address),
      db().from("cosmetics").select("*").eq("owner", address),
      db().from("profiles").select("*").eq("address", address).maybeSingle(),
      db().from("admin_config").select("*").eq("id", 1).maybeSingle(),
    ]);

    const remoteHeroes = heroesRes.status === "fulfilled" ? (heroesRes.value.data as unknown as Hero[]) : null;
    const remoteInv = invRes.status === "fulfilled" ? (invRes.value.data as unknown as Equipment[]) : null;
    const remoteCos = cosRes.status === "fulfilled" ? (cosRes.value.data as unknown as Cosmetic[]) : null;
    const remoteProfile = profileRes.status === "fulfilled" ? profileRes.value.data : null;
    const remoteConfig = configRes.status === "fulfilled" ? configRes.value.data : null;

    const hasData = remoteHeroes?.length || remoteInv?.length || remoteCos?.length || remoteProfile;
    if (!hasData) {
      supabaseLogger("No remote data found, keeping localStorage");
      _lastSyncAddress = address;
      _syncing = false;
      return false;
    }

    supabaseLogger(`Found: ${remoteHeroes?.length || 0} heroes, ${remoteInv?.length || 0} items, ${remoteCos?.length || 0} cosmetics`);

    const save = loadSave();

    // Merge remote heroes (only for this address)
    if (remoteHeroes && remoteHeroes.length > 0) {
      const remoteIds = new Set(remoteHeroes.map(h => h.id));
      save.heroes = [
        ...save.heroes.filter(h => h.owner_address !== address || !remoteIds.has(h.id)),
        ...remoteHeroes,
      ];
    }

    if (remoteInv && remoteInv.length > 0) {
      const remoteIds = new Set(remoteInv.map(i => i.id));
      save.inventory = [
        ...save.inventory.filter(i => i.owner !== address || !remoteIds.has(i.id)),
        ...remoteInv,
      ];
    }

    if (remoteCos && remoteCos.length > 0) {
      const remoteIds = new Set(remoteCos.map(c => c.id));
      save.cosmetics = [
        ...save.cosmetics.filter(c => c.owner !== address || !remoteIds.has(c.id)),
        ...remoteCos,
      ];
    }

    // Merge profile balance
    if (remoteProfile) {
      const addr = remoteProfile.address.toLowerCase();
      if (!save.tokenBalances) save.tokenBalances = {};
      save.tokenBalances[addr] = (save.tokenBalances[addr] || 0) + Number(remoteProfile.spout_balance || 0);
    }

    // Merge admin config from remote (if we're admin)
    if (remoteConfig && save.adminConfig) {
      save.adminConfig.globalMaintenance = remoteConfig.maintenance_mode ?? save.adminConfig.globalMaintenance;
      save.adminConfig.rewardMultiplier = remoteConfig.reward_multiplier ?? save.adminConfig.rewardMultiplier;
    }

    saveState(save);
    _lastSyncAddress = address;
    supabaseLogger("Supabase data merged into localStorage");

    _syncing = false;
    return true;
  } catch (e) {
    supabaseLogger("pullFromSupabase error:", e);
    _syncing = false;
    return false;
  }
}

export function clearSyncCache() {
  _lastSyncAddress = null;
}
