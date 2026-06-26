export const CHAIN_ID = 16602;
export const RPC_URL = "https://evmrpc-testnet.0g.ai";
export const TOKEN_CONTRACT = "0xB9Ca501a3e59716F328552C7BA26d1fa68Dc76E6";
export const TOKEN_SYMBOL = "0BOMB";
export const TOKEN_DECIMALS = 18;
export const OWNER_WALLET = "0xa8DAb875Eb73173C8C96215445263AA6a6851Af6";
export const MAX_ACTIVE_MAPS = 4;
export const MAX_HEROES_PER_MAP = 5;
export const MARKETPLACE_FEE = 0.025;
export const FRAGMENT_TO_TOKEN = 10;
export const MIN_CLAIM_TOKENS = 500;

// ─── Hero Classes ─────────────────────────────────────────────
export const HERO_CLASSES = ["Marine", "Scout", "Scientist", "Miner", "Medic", "Commander", "Engineer"] as const;
export type HeroClass = typeof HERO_CLASSES[number];

export interface ClassConfig {
  label: string;
  bonus: Partial<Record<StatName, number>>;
  description: string;
}

export const CLASS_CONFIG: Record<HeroClass, ClassConfig> = {
  Marine: {
    label: "Marine",
    bonus: { power: 15, defense: 10 },
    description: "+Power +Defense -Personality Growth",
  },
  Scout: {
    label: "Scout",
    bonus: { speed: 15, exploration: 10 },
    description: "+Speed +Exploration",
  },
  Scientist: {
    label: "Scientist",
    bonus: { intelligence: 15, learning_rate: 10 },
    description: "+Intelligence +Learning Rate",
  },
  Miner: {
    label: "Miner",
    bonus: { mining: 15, efficiency: 10 },
    description: "+Mining +Efficiency",
  },
  Medic: {
    label: "Medic",
    bonus: { vitality: 15 },
    description: "+Vitality +Team Support",
  },
  Commander: {
    label: "Commander",
    bonus: { learning_rate: 10, adaptability: 10, risk_awareness: 10 },
    description: "+Leadership +AI Stats",
  },
  Engineer: {
    label: "Engineer",
    bonus: { scavenging: 10, efficiency: 10 },
    description: "+Equipment Synergy +Utility",
  },
};

// ─── Hero Rarity ──────────────────────────────────────────────
export const HERO_RARITIES = ["Common", "Rare", "Epic", "Legendary", "Mythic", "Genesis"] as const;
export type HeroRarity = typeof HERO_RARITIES[number];

export interface RarityConfig {
  totalStatPoints: number;
  energyRange: [number, number];
  color: string;
}

export const RARITY_CONFIG: Record<HeroRarity, RarityConfig> = {
  Common: { totalStatPoints: 60, energyRange: [80, 120], color: "#9ca3af" },
  Rare: { totalStatPoints: 90, energyRange: [100, 150], color: "#3b82f6" },
  Epic: { totalStatPoints: 130, energyRange: [130, 180], color: "#a855f7" },
  Legendary: { totalStatPoints: 180, energyRange: [160, 220], color: "#f59e0b" },
  Mythic: { totalStatPoints: 220, energyRange: [200, 260], color: "#ef4444" },
  Genesis: { totalStatPoints: 250, energyRange: [220, 300], color: "#22d3ee" },
};

export const ENERGY_RANGES: Record<HeroRarity, [number, number]> = Object.fromEntries(
  HERO_RARITIES.map(r => [r, RARITY_CONFIG[r].energyRange])
) as Record<HeroRarity, [number, number]>;

// ─── Stat Names ───────────────────────────────────────────────
export const CORE_STATS = ["power", "defense", "speed", "intelligence", "luck", "vitality"] as const;
export const AI_STATS = ["learning_rate", "adaptability", "risk_awareness", "exploration", "aggression"] as const;
export const FARMING_STATS = ["mining", "scavenging", "treasure_hunter", "efficiency"] as const;
export const GENETIC_STATS = ["dna_quality", "potential", "mutation_chance", "legacy_affinity"] as const;
export const PERSONALITY_TRAITS = ["brave", "greedy", "curious", "loyal", "lazy", "tactical"] as const;

export type StatName = typeof CORE_STATS[number] | typeof AI_STATS[number] | typeof FARMING_STATS[number] | typeof GENETIC_STATS[number];
export type CoreStat = typeof CORE_STATS[number];
export type AIStat = typeof AI_STATS[number];
export type FarmingStat = typeof FARMING_STATS[number];
export type GeneticStat = typeof GENETIC_STATS[number];
export type PersonalityTrait = typeof PERSONALITY_TRAITS[number];

// ─── Difficulty ───────────────────────────────────────────────
export const DIFFICULTIES = ["Easy", "Advanced", "Nightmare"] as const;
export type Difficulty = typeof DIFFICULTIES[number];

export const DIFFICULTY_CONFIG: Record<Difficulty, {
  enemyMin: number; enemyMax: number; enemyHpBonus: number;
  blockPercent: number; maxTicks: number;
  bonusEqMin: number; bonusEqMax: number;
  cosmeticChance: number;
  tokenMin: number; tokenMax: number;
  bossTokenMin: number; bossTokenMax: number;
  xpMultiplier: number;
}> = {
  Easy: {
    enemyMin: 3, enemyMax: 5, enemyHpBonus: 0,
    blockPercent: 1, maxTicks: 400,
    bonusEqMin: 1, bonusEqMax: 3,
    cosmeticChance: 0.5,
    tokenMin: 5, tokenMax: 15,
    bossTokenMin: 10, bossTokenMax: 25,
    xpMultiplier: 1,
  },
  Advanced: {
    enemyMin: 5, enemyMax: 8, enemyHpBonus: 1,
    blockPercent: 1.1, maxTicks: 500,
    bonusEqMin: 2, bonusEqMax: 4,
    cosmeticChance: 0.75,
    tokenMin: 10, tokenMax: 25,
    bossTokenMin: 20, bossTokenMax: 40,
    xpMultiplier: 1.5,
  },
  Nightmare: {
    enemyMin: 7, enemyMax: 10, enemyHpBonus: 2,
    blockPercent: 1.2, maxTicks: 600,
    bonusEqMin: 3, bonusEqMax: 6,
    cosmeticChance: 1,
    tokenMin: 20, tokenMax: 40,
    bossTokenMin: 35, bossTokenMax: 60,
    xpMultiplier: 2,
  },
};

// ─── Legacy ───────────────────────────────────────────────────
export const LEGACY_TIERS = ["Tier I", "Tier II", "Tier III", "Tier IV", "Tier V"] as const;
export type LegacyTier = typeof LEGACY_TIERS[number];

export const BADGES = ["Combat", "Loot", "Survival", "AI Intelligence", "Legendary", "Founder", "Seasonal"] as const;

export const EQUIPMENT_SLOTS = ["Bomb Core", "Engine", "Armor", "Memory Chip", "Scanner", "Utility Device"] as const;

export const COSMETIC_SLOTS = ["Helmet", "Suit", "Trail", "Bomb Effect", "Aura", "Drone"] as const;

export const ENERGY_REGEN_INTERVAL = 300000;
export const ENERGY_REGEN_AMOUNT = 1;

export const ENERGY_COST_BY_DIFFICULTY: Record<Difficulty, number> = {
  Easy: 5,
  Advanced: 10,
  Nightmare: 15,
};

export const CLEAR_TIME_BONUS_CONFIG = {
  optimalSeconds: 180,
  maxBonus: 1.0,
  falloffPerSecond: 0.002,
};

export const HERO_HATCH_COST = "25";
export const LOOT_MINT_COST = "5";
export const COSMETIC_MINT_COST = "10";
export const TREASURY_ADDRESS = "0xa8DAb875Eb73173C8C96215445263AA6a6851Af6";

export const VOUCHER_MAX_HERO = 3;
export const VOUCHER_MAX_EQUIPMENT = 3;
export const VOUCHER_MAX_COSMETIC = 3;

export const MEMORY_EVENTS = [
  "Killed Alien", "Found Rare Loot", "Touched Lava",
  "Near Death Escape", "Perfect Clear", "Boss Kill",
  "Survived Lava", "Found Legendary Item", "Perfect Farming Run", "Died To Trap",
] as const;

export const TRAIT_DEFINITIONS: Record<string, { label: string; bonus: Partial<Record<StatName, number>>; description: string }> = {
  "Loot Goblin": { label: "Loot Goblin", bonus: { luck: 15 }, description: "+15 Luck" },
  "Bomb Expert": { label: "Bomb Expert", bonus: { power: 20 }, description: "+20 Power" },
  Survivor: { label: "Survivor", bonus: { defense: 20 }, description: "+20 Defense" },
  Explorer: { label: "Explorer", bonus: { exploration: 20 }, description: "+20 Exploration" },
  "Tactical Genius": { label: "Tactical Genius", bonus: { intelligence: 20 }, description: "+20 Intelligence" },
  "Lava Survivor": { label: "Lava Survivor", bonus: { defense: 10, risk_awareness: 10 }, description: "+10 Defense +10 Risk Awareness" },
  "Treasure Hunter": { label: "Treasure Hunter", bonus: { treasure_hunter: 15, luck: 5 }, description: "+15 Treasure Hunter +5 Luck" },
  "Bomb Master": { label: "Bomb Master", bonus: { power: 10, intelligence: 5 }, description: "+10 Power +5 Intelligence" },
  "Fast Learner": { label: "Fast Learner", bonus: { learning_rate: 15 }, description: "+15 Learning Rate" },
  "Alien Slayer": { label: "Alien Slayer", bonus: { power: 10, aggression: 10 }, description: "+10 Power +10 Aggression" },
  "Speed Demon": { label: "Speed Demon", bonus: { speed: 15 }, description: "+15 Speed" },
  "Iron Will": { label: "Iron Will", bonus: { vitality: 15 }, description: "+15 Vitality" },
};

export const ENEMIES = [
  "Crawler", "Spitter", "Burrower", "Hunter",
  "Hive Guard", "Void Beast", "Titan",
] as const;

export const BOSSES = ["Lava Titan", "Hive Queen", "Ancient Guardian", "Void Dragon"] as const;

export const BIOMES = [
  "Crash Site", "Crystal Desert", "Toxic Swamp", "Volcanic Core",
  "Frozen Wasteland", "Alien Hive", "Ancient Ruins", "Void Sector",
] as const;

export const UPGRADE_SEEDS = ["Power", "Speed", "Range", "Vital", "Luck", "Intelligence"] as const;
export type UpgradeSeedType = typeof UPGRADE_SEEDS[number];

export const DROP_RATES = {
  common: 0.2,
  rare: 0.03,
  legendary: 0.0025,
  upgradeSeed: 0.05,
  fragment: 0.4,
};
