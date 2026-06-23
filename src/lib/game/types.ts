import type { HeroClass, HeroRarity, Difficulty, LegacyTier } from "./constants";

export interface Hero {
  id: string;
  owner_address: string;
  name: string;
  class: HeroClass;
  rarity: HeroRarity;
  level: number;
  xp: number;
  energy: number;
  max_energy: number;
  generation: number;
  legacy_tier: LegacyTier | null;
  is_alive: boolean;
  is_legendary: boolean;
  created_at: string;
  personality: Record<string, number>;
  intelligence: Record<string, number>;
  traits: string[];
  memories: Memory[];
  equipment: Record<string, string | null>;
  cosmetics: Record<string, string | null>;
  badges: string[];
  lastEnergyRegen: number;
  auto_deploy: boolean;
}

export interface Memory {
  id: string;
  hero_id: string;
  event: string;
  detail: string;
  created_at: string;
}

export interface PlayerProfile {
  address: string;
  spout_balance: number;
  bomb_balance: string;
  created_at: string;
}

export interface MapState {
  id: string;
  owner_address: string;
  biome: string;
  difficulty: Difficulty;
  hero_ids: string[];
  cleared: boolean;
  created_at: string;
}

export interface AdminConfig {
  reward_multiplier: number;
  currency_drop_rate: number;
  equipment_drop_rate: number;
  cosmetic_drop_rate: number;
  upgrade_seed_drop_rate: number;
  rare_loot_drop_rate: number;
  event_reward_multiplier: number;
  maintenance_mode: boolean;
  marketplace_enabled: boolean;
  trading_enabled: boolean;
  reward_claims_enabled: boolean;
  currency_conversion_enabled: boolean;
}

export interface Legacy {
  id: string;
  hero_id: string;
  tier: LegacyTier;
  transferred_to: string | null;
  created_at: string;
}

export interface MapProgression {
  id: string;
  owner_address: string;
  difficulty: string;
  grid: number[][];
  enemies: { id: string; x: number; y: number; type: string; hp: number; maxHp: number; moveTimer: number }[];
  progress: number;
  totalKills: number;
  cleared: boolean;
  originalDestructibleCount: number;
  prePlacedItems: { x: number; y: number }[];
  created_at: string;
}

export interface MarketplaceListing {
  id: string;
  seller: string;
  item_type: "hero" | "equipment" | "cosmetic" | "cryopod" | "potion";
  item_id: string;
  price: string;
  status: "active" | "sold" | "cancelled";
  created_at: string;
}
