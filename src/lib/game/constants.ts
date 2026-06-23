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

export const HERO_CLASSES = ["Engineer", "Scout", "Marine", "Scientist", "Medic", "Commander", "Miner"] as const;
export type HeroClass = typeof HERO_CLASSES[number];

export const HERO_RARITIES = ["Common", "Rare", "Epic", "Legendary", "Mythic", "Genesis"] as const;
export type HeroRarity = typeof HERO_RARITIES[number];

export const ENERGY_RANGES: Record<HeroRarity, [number, number]> = {
  Common: [80, 120],
  Rare: [100, 150],
  Epic: [130, 180],
  Legendary: [160, 220],
  Mythic: [200, 260],
  Genesis: [220, 300],
};

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

export const LEGACY_TIERS = ["Tier I", "Tier II", "Tier III", "Tier IV", "Tier V"] as const;
export type LegacyTier = typeof LEGACY_TIERS[number];

export const BADGES = ["Combat", "Loot", "Survival", "AI Intelligence", "Legendary", "Founder", "Seasonal"] as const;

export const EQUIPMENT_SLOTS = ["Bomb Core", "Engine", "Armor", "Memory Chip", "Scanner", "Utility Device"] as const;

export const COSMETIC_SLOTS = ["Helmet", "Suit", "Trail", "Bomb Effect", "Aura", "Drone"] as const;

export const ENERGY_REGEN_INTERVAL = 300000; // 5 minutes
export const ENERGY_REGEN_AMOUNT = 1;

export const HERO_HATCH_COST = "25"; // 25 0BOMB per hatch
export const LOOT_MINT_COST = "5";   // 5 0BOMB per loot mint
export const COSMETIC_MINT_COST = "10"; // 10 0BOMB per cosmetic mint
export const TREASURY_ADDRESS = "0xa8DAb875Eb73173C8C96215445263AA6a6851Af6";

export const MEMORY_EVENTS = [
  "Killed Alien", "Found Rare Loot", "Touched Lava",
  "Near Death Escape", "Perfect Clear", "Boss Kill",
] as const;

export const TRAITS = [
  "Lava Survivor", "Treasure Hunter", "Bomb Master",
  "Fast Learner", "Explorer", "Alien Slayer",
] as const;

export const ENEMIES = [
  "Crawler", "Spitter", "Burrower", "Hunter",
  "Hive Guard", "Void Beast", "Titan",
] as const;

export const BOSSES = ["Lava Titan", "Hive Queen", "Ancient Guardian", "Void Dragon"] as const;

export const BIOMES = [
  "Crash Site", "Crystal Desert", "Toxic Swamp", "Volcanic Core",
  "Frozen Wasteland", "Alien Hive", "Ancient Ruins", "Void Sector",
] as const;

export const PERSONALITY_TRAITS = ["Aggressive", "Careful", "Curious", "Greedy", "Social", "Chaotic"] as const;

export const INTELLIGENCE_TYPES = [
  "Combat", "Survival", "Loot", "Hazard Recognition", "Pathfinding", "Resource Optimization",
] as const;

export const UPGRADE_SEEDS = ["Power", "Speed", "Range", "Vital", "Luck", "Intelligence"] as const;
