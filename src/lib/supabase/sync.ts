import type { Hero } from "@/lib/game/types";
import type { Equipment } from "@/lib/game/equipmentSystem";
import type { Cosmetic } from "@/lib/game/cosmeticSystem";
import type { MarketplaceListing } from "@/lib/game/types";
import type { AdminConfig } from "@/lib/game/GameStateManager";
import { getSupabase } from "./client";
import { supabaseLogger } from "./logger";

let _enabled = false;

export function enableSync() {
  _enabled = typeof process !== "undefined" && !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (_enabled) supabaseLogger("Sync enabled");
}

export function isSyncEnabled() {
  return _enabled;
}

function db() {
  return getSupabase();
}

// ── Profiles ──

export async function syncProfile(address: string, balance: number) {
  if (!_enabled) return;
  try {
    const { error } = await db().from("profiles").upsert(
      { address, spout_balance: balance },
      { onConflict: "address" }
    );
    if (error) supabaseLogger("syncProfile error:", error.message);
  } catch (e) {
    supabaseLogger("syncProfile exception:", e);
  }
}

// ── Heroes ──

export async function syncHeroes(heroes: Hero[]) {
  if (!_enabled || !heroes.length) return;
  try {
    const rows = heroes.map(h => ({
      id: h.id,
      owner_address: h.owner_address || "",
      name: h.name || "Unknown",
      class: h.class || "Unknown",
      rarity: h.rarity || "Common",
      level: h.level || 1,
      xp: h.xp || 0,
      energy: h.energy || 100,
      max_energy: h.max_energy || 100,
      generation: h.generation || 1,
      legacy_tier: (h as any).legacy_tier || null,
      is_alive: h.is_alive ?? true,
      is_legendary: (h as any).is_legendary || false,
      personality: h.personality || {},
      intelligence: (h as any).intelligence || {},
      traits: h.traits || [],
      equipment: h.equipment || {},
      badges: h.badges || [],
    }));
    const { error } = await db().from("heroes").upsert(rows, { onConflict: "id" });
    if (error) supabaseLogger("syncHeroes error:", error.message);
  } catch (e) {
    supabaseLogger("syncHeroes exception:", e);
  }
}

export async function syncHero(hero: Hero) {
  await syncHeroes([hero]);
}

export async function deleteHeroRemote(heroId: string) {
  if (!_enabled) return;
  try {
    const { error } = await db().from("heroes").delete().eq("id", heroId);
    if (error) supabaseLogger("deleteHeroRemote error:", error.message);
  } catch (e) {
    supabaseLogger("deleteHeroRemote exception:", e);
  }
}

// ── Inventory ──

export async function syncInventory(items: Equipment[]) {
  if (!_enabled || !items.length) return;
  try {
    const rows = items.map(i => ({
      id: i.id,
      owner: i.owner || "",
      name: i.name,
      type: "Equipment",
      rarity: i.rarity,
      slot: i.slot || "",
      stats: i.stats || {},
      equipped: false,
      soulbound: false,
    }));
    const { error } = await db().from("inventory").upsert(rows, { onConflict: "id" });
    if (error) supabaseLogger("syncInventory error:", error.message);
  } catch (e) {
    supabaseLogger("syncInventory exception:", e);
  }
}

export async function addInventoryRemote(item: Equipment) {
  if (!_enabled) return;
  try {
    const { error } = await db().from("inventory").insert({
      id: item.id,
      owner: item.owner || "",
      name: item.name,
      type: item.slot || "Equipment",
      rarity: item.rarity,
      slot: item.slot || "",
      stats: item.stats || {},
      equipped: false,
      soulbound: false,
    });
    if (error) supabaseLogger("addInventoryRemote error:", error.message);
  } catch (e) {
    supabaseLogger("addInventoryRemote exception:", e);
  }
}

export async function deleteInventoryRemote(itemId: string) {
  if (!_enabled) return;
  try {
    const { error } = await db().from("inventory").delete().eq("id", itemId);
    if (error) supabaseLogger("deleteInventoryRemote error:", error.message);
  } catch (e) {
    supabaseLogger("deleteInventoryRemote exception:", e);
  }
}

// ── Cosmetics ──

export async function syncCosmetics(items: Cosmetic[]) {
  if (!_enabled || !items.length) return;
  try {
    const rows = items.map(c => ({
      id: c.id,
      owner: c.owner || "",
      name: c.name,
      type: c.type || "skin",
      rarity: c.rarity,
      preview: "",
      equipped: false,
      soulbound: false,
    }));
    const { error } = await db().from("cosmetics").upsert(rows, { onConflict: "id" });
    if (error) supabaseLogger("syncCosmetics error:", error.message);
  } catch (e) {
    supabaseLogger("syncCosmetics exception:", e);
  }
}

export async function addCosmeticRemote(item: Cosmetic) {
  if (!_enabled) return;
  try {
    const { error } = await db().from("cosmetics").insert({
      id: item.id,
      owner: item.owner || "",
      name: item.name,
      type: item.type || "skin",
      rarity: item.rarity,
      preview: "",
      equipped: false,
      soulbound: false,
    });
    if (error) supabaseLogger("addCosmeticRemote error:", error.message);
  } catch (e) {
    supabaseLogger("addCosmeticRemote exception:", e);
  }
}

export async function deleteCosmeticRemote(itemId: string) {
  if (!_enabled) return;
  try {
    const { error } = await db().from("cosmetics").delete().eq("id", itemId);
    if (error) supabaseLogger("deleteCosmeticRemote error:", error.message);
  } catch (e) {
    supabaseLogger("deleteCosmeticRemote exception:", e);
  }
}

// ── Admin Config ──

export async function syncAdminConfig(cfg: AdminConfig) {
  if (!_enabled) return;
  try {
    const { error } = await db().from("admin_config").upsert({
      id: 1,
      reward_multiplier: cfg.rewardMultiplier ?? 1.0,
      currency_drop_rate: cfg.currencyDropRate ?? 1.0,
      equipment_drop_rate: cfg.equipmentDropRate ?? 1.0,
      cosmetic_drop_rate: cfg.cosmeticDropRate ?? 1.0,
      upgrade_seed_drop_rate: cfg.upgradeSeedDropRate ?? 1.0,
      rare_loot_drop_rate: cfg.rareLootDropRate ?? 1.0,
      event_reward_multiplier: cfg.eventRewardMultiplier ?? 1.0,
      maintenance_mode: cfg.globalMaintenance,
      marketplace_enabled: !cfg.marketplacePaused,
      trading_enabled: !cfg.tradingPaused,
      reward_claims_enabled: !cfg.rewardsPaused,
      currency_conversion_enabled: true,
    });
    if (error) supabaseLogger("syncAdminConfig error:", error.message);
  } catch (e) {
    supabaseLogger("syncAdminConfig exception:", e);
  }
}

// ── Marketplace ──

export async function syncMarketplaceListings(listings: MarketplaceListing[]) {
  if (!_enabled || !listings.length) return;
  try {
    const rows = listings.map(l => ({
      id: l.id,
      seller: l.seller,
      item_type: l.item_type as "hero" | "equipment" | "cosmetic" | "cryopod" | "potion",
      item_id: l.item_id,
      price: typeof l.price === "string" ? l.price : String(l.price),
      status: (l.status || "active") as "active" | "sold" | "cancelled",
    }));
    const { error } = await db().from("marketplace_listings").upsert(rows, { onConflict: "id" });
    if (error) supabaseLogger("syncMarketplaceListings error:", error.message);
  } catch (e) {
    supabaseLogger("syncMarketplaceListings exception:", e);
  }
}

// ── Sync All (for full state push) ──

export async function syncAll(
  heroes: Hero[],
  inventory: Equipment[],
  cosmetics: Cosmetic[],
  listings: MarketplaceListing[],
  config: AdminConfig,
  balances: Record<string, number>
) {
  if (!_enabled) return;
  await Promise.allSettled([
    syncHeroes(heroes),
    syncInventory(inventory),
    syncCosmetics(cosmetics),
    syncMarketplaceListings(listings),
    syncAdminConfig(config),
    ...Object.entries(balances).map(([addr, bal]) => syncProfile(addr, bal)),
  ]);
  supabaseLogger("Full sync complete");
}
