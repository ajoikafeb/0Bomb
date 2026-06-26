"use client";

import type { Hero } from "@/lib/game/types";
import type { Equipment } from "@/lib/game/equipmentSystem";
import type { Cosmetic } from "@/lib/game/cosmeticSystem";
import type { LegacyCore } from "@/lib/game/types";

export type InventoryTab =
  | "heroes"
  | "equipment"
  | "cosmetics"
  | "legacy"
  | "badges"
  | "materials"
  | "seeds"
  | "consumables"
  | "currencies";

export type EquipFilter = "all" | "equipped" | "unequipped";

export type SortOption = "newest" | "oldest" | "rarity_asc" | "rarity_desc" | "name_asc" | "name_desc" | "level_desc" | "level_asc";

export type AssetItem =
  | { type: "hero"; data: Hero }
  | { type: "equipment"; data: Equipment }
  | { type: "cosmetic"; data: Cosmetic }
  | { type: "legacy"; data: LegacyCore };

export interface InventorySummary {
  heroes: number;
  equipment: number;
  equipped: number;
  unequipped: number;
  cosmetics: number;
  legacy: number;
  badges: number;
  materials: number;
  seeds: number;
  consumables: number;
  nftCount: number;
}

export const RARITIES = ["Common", "Rare", "Epic", "Legendary", "Mythic", "Genesis"] as const;
export type Rarity = typeof RARITIES[number];

export const HERO_CLASSES_LIST = ["Marine", "Scout", "Scientist", "Miner", "Medic", "Commander", "Engineer"] as const;

export const RARITY_COLORS: Record<string, string> = {
  Common: "#9ca3af",
  Rare: "#3b82f6",
  Epic: "#a855f7",
  Legendary: "#f59e0b",
  Mythic: "#ef4444",
  Genesis: "#22d3ee",
};

export interface InventoryStore {
  heroes: Hero[];
  equipment: Equipment[];
  cosmetics: Cosmetic[];
  legacyCores: LegacyCore[];
  selectedAsset: AssetItem | null;
  compareAssets: AssetItem[];
  selectedHeroIds: string[];
  selectedEquipIds: string[];
  tab: InventoryTab;
  search: string;
  rarityFilter: string;
  classFilter: string;
  slotFilter: string;
  equipFilter: EquipFilter;
  sortOption: SortOption;
  showDetail: boolean;
  showCompare: boolean;
}
