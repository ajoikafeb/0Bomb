import { loadSave, saveState } from "@/lib/game/GameStateManager";
import { getSupabase } from "./client";
import { supabaseLogger } from "./logger";
import { clearAllSubscriptions } from "./realtime";
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

const GAME_STORAGE_KEY = "0gbomber_state";

function clearGameData() {
  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem(GAME_STORAGE_KEY);
      supabaseLogger("Game data cleared from localStorage for session isolation");
    }
  } catch {}
}

export function getLastSyncAddress() {
  return _lastSyncAddress;
}

export function isDataSyncing() {
  return _syncing;
}

export async function pullFromSupabase(address: string, force = false): Promise<boolean> {
  if (!isConnected() || !address || _syncing) return false;

  // Session isolation: if switching wallets, clear old data first
  if (_lastSyncAddress && _lastSyncAddress !== address) {
    supabaseLogger(`Wallet switch detected: ${_lastSyncAddress.slice(0,6)} → ${address.slice(0,6)}. Clearing localStorage`);
    clearGameData();
    clearAllSubscriptions();
  }

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

    const hasRemoteData = remoteHeroes?.length || remoteInv?.length || remoteCos?.length || remoteProfile;
    if (!hasRemoteData) {
      supabaseLogger("No remote data found for this wallet");
      _lastSyncAddress = address;
      _syncing = false;
      return false;
    }

    supabaseLogger(`Found: ${remoteHeroes?.length || 0} heroes, ${remoteInv?.length || 0} items, ${remoteCos?.length || 0} cosmetics`);

    const save = loadSave();

    if (remoteHeroes && remoteHeroes.length > 0) {
      save.heroes = remoteHeroes;
    } else {
      save.heroes = [];
    }

    if (remoteInv && remoteInv.length > 0) {
      save.inventory = remoteInv;
    } else {
      save.inventory = [];
    }

    if (remoteCos && remoteCos.length > 0) {
      save.cosmetics = remoteCos;
    } else {
      save.cosmetics = [];
    }

    if (remoteProfile) {
      const addr = remoteProfile.address.toLowerCase();
      if (!save.tokenBalances) save.tokenBalances = {};
      save.tokenBalances[addr] = Number(remoteProfile.spout_balance || 0);
    }

    if (remoteConfig && save.adminConfig) {
      save.adminConfig.globalMaintenance = remoteConfig.maintenance_mode || false;
      save.adminConfig.marketplacePaused = !remoteConfig.marketplace_enabled || false;
      save.adminConfig.tradingPaused = !remoteConfig.trading_enabled || false;
      save.adminConfig.rewardsPaused = !remoteConfig.reward_claims_enabled || false;
      save.adminConfig.rewardMultiplier = remoteConfig.reward_multiplier || 1.0;
    }

    saveState(save);
    _lastSyncAddress = address;
    supabaseLogger("Supabase data loaded into localStorage");

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
