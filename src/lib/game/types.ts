import type { HeroClass, HeroRarity, Difficulty, LegacyTier } from "./constants";
import type { CoreStat, AIStat, FarmingStat, GeneticStat, PersonalityTrait } from "./constants";

export interface HeroCoreStats {
  power: number;       // bomb damage, alien damage, object destruction
  defense: number;     // damage reduction, survival rate
  speed: number;       // movement speed, loot collection, bomb placement, escape
  intelligence: number;// AI decision making, pathfinding, farming efficiency, hazard avoidance
  luck: number;        // equipment drops, cosmetic drops, rare loot, event rewards
  vitality: number;    // HP, energy pool, stamina recovery
}

export interface HeroAIStats {
  learning_rate: number;    // memory gain speed, AI improvement
  adaptability: number;     // handling map changes, dynamic situations
  risk_awareness: number;   // trap/lava avoidance, survival decisions
  exploration: number;      // map coverage, secret loot discovery
  aggression: number;       // enemy engagement frequency, combat priority
}

export interface HeroFarmingStats {
  mining: number;           // currency generation
  scavenging: number;       // equipment drops
  treasure_hunter: number;  // rare item discovery
  efficiency: number;       // reward per energy spent
}

export interface HeroGeneticStats {
  dna_quality: number;      // 1-100, inherited through bloodlines
  potential: number;        // 1-100, determines max stat growth
  mutation_chance: number;  // 1-100, chance for rare traits
  legacy_affinity: number;  // 1-100, effectiveness of inherited Legacy Cores
}

export interface HeroPersonality {
  brave: number;     // 0-100, willingness to fight
  greedy: number;    // 0-100, prioritizes loot over safety
  curious: number;   // 0-100, explores more map areas
  loyal: number;     // 0-100, works better in teams
  lazy: number;      // 0-100, consumes less energy but farms slower
  tactical: number;  // 0-100, makes smarter decisions
}

export interface Memory {
  id: string;
  hero_id: string;
  event: string;
  detail: string;
  created_at: string;
}

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

  // ─── Core Stats ────────────────────────────────────────────
  stats: HeroCoreStats;

  // ─── AI Stats ──────────────────────────────────────────────
  ai_stats: HeroAIStats;

  // ─── Farming Stats ─────────────────────────────────────────
  farming_stats: HeroFarmingStats;

  // ─── Genetic Stats (inherited) ─────────────────────────────
  genetics: HeroGeneticStats;

  // ─── Personality ───────────────────────────────────────────
  personality: HeroPersonality;

  // ─── Traits ────────────────────────────────────────────────
  traits: string[];

  // ─── Memories ──────────────────────────────────────────────
  memories: Memory[];

  // ─── Equipment & Cosmetics ─────────────────────────────────
  equipment: Record<string, string | null>;
  cosmetics: Record<string, string | null>;

  // ─── Progression ───────────────────────────────────────────
  badges: string[];
  lastEnergyRegen: number;
  auto_deploy: boolean;

  // ─── Legacy / Bloodline ────────────────────────────────────
  bloodline: BloodlineInfo | null;
  legacy_cores: LegacyCore[];
}

export interface BloodlineInfo {
  parent_id: string;
  parent_name: string;
  generation: number;
  inherited_stats: Partial<Record<keyof HeroCoreStats | keyof HeroAIStats | keyof HeroFarmingStats, number>>;
  inherited_traits: string[];
  dna_similarity: number;
}

export interface LegacyCore {
  id: string;
  source_hero_id: string;
  source_hero_name: string;
  level_on_retire: number;
  xp_contained: number;
  memories: Memory[];
  traits: string[];
  dna_fragments: number;
  tier: LegacyTier;
  transferred_to: string | null;
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
