export type CosmeticType = "Helmet" | "Suit" | "Trail" | "Bomb Effect" | "Aura" | "Drone";
export type CosmeticRarity = "Common" | "Rare" | "Epic" | "Legendary" | "Mythic";

import { COSMETIC_RARITY, rollRarity } from "./dropRates";

export interface Cosmetic {
  id: string;
  name: string;
  type: CosmeticType;
  rarity: CosmeticRarity;
  statBonus: Record<string, number>;
  color: string;
  owner: string | null;
}

const COSMETIC_NAMES: Record<CosmeticType, string[]> = {
  "Helmet": ["Void Visor", "Cryo Helm", "Titan Crown", "Ghost Mask", "Nebula Cap"],
  "Suit": ["Phase Armor", "Nano Suit", "Crystal Shell", "Shadow Garb", "Solar Vest"],
  "Trail": ["Neon Wake", "Star Dust", "Plasma Trail", "Void Echo", "Ice Path"],
  "Bomb Effect": ["Nova Burst", "Void Explosion", "Ice Shatter", "Plasma Arc", "Crystal Flash"],
  "Aura": ["Solar Flare", "Lunar Halo", "Void Glow", "Frost Ring", "Ember Shield"],
  "Drone": ["Scout Bot", "Shield Drone", "Loot Finder", "Repair Node", "Combat Eye"],
};

const COSMETIC_COLORS: Record<CosmeticRarity, string> = {
  Common: "#9ca3af",
  Rare: "#3b82f6",
  Epic: "#a855f7",
  Legendary: "#f59e0b",
  Mythic: "#ef4444",
};

const COSMETIC_RARITY_STATS: Record<CosmeticRarity, number> = {
  Common: 1,
  Rare: 2,
  Epic: 4,
  Legendary: 7,
  Mythic: 12,
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickRarity(): CosmeticRarity {
  return rollRarity(COSMETIC_RARITY);
}

const COSMETIC_STAT_TYPES: Record<CosmeticType, string[]> = {
  "Helmet": ["hazard_detect", "intel_gain"],
  "Suit": ["defense", "max_energy"],
  "Trail": ["speed", "energy_regen"],
  "Bomb Effect": ["bomb_damage", "bomb_range"],
  "Aura": ["luck", "hp"],
  "Drone": ["loot_range", "memory_cap"],
};

export function generateCosmetic(type?: CosmeticType, owner: string | null = null, rarity?: CosmeticRarity): Cosmetic {
  const ctype = type || pick(["Helmet", "Suit", "Trail", "Bomb Effect", "Aura", "Drone"] as CosmeticType[]);
  const r = rarity || pickRarity();
  const name = pick(COSMETIC_NAMES[ctype]);
  const baseStat = COSMETIC_RARITY_STATS[r];

  const statBonus: Record<string, number> = {};
  const stats = COSMETIC_STAT_TYPES[ctype];
  for (const stat of stats) {
    statBonus[stat] = baseStat;
  }

  return {
    id: `cos_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name,
    type: ctype,
    rarity: r,
    statBonus,
    color: COSMETIC_COLORS[r],
    owner,
  };
}

export function getCosmeticColor(rarity: CosmeticRarity): string {
  return COSMETIC_COLORS[rarity];
}
