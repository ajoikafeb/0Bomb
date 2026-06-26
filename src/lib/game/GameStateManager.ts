import type { Hero, Memory, MarketplaceListing, MapProgression, RewardChest, RewardChestItem, UpgradeSeed } from "@/lib/game/types";
import { TRAIT_DEFINITIONS, MEMORY_EVENTS, ENERGY_REGEN_INTERVAL, ENERGY_REGEN_AMOUNT, MARKETPLACE_FEE, TREASURY_ADDRESS, CORE_STATS, DIFFICULTIES, DIFFICULTY_CONFIG, ENERGY_COST_BY_DIFFICULTY, CLEAR_TIME_BONUS_CONFIG, DROP_RATES, UPGRADE_SEEDS, VOUCHER_MAX_HERO, VOUCHER_MAX_EQUIPMENT, VOUCHER_MAX_COSMETIC, HERO_HATCH_COST, LOOT_MINT_COST, COSMETIC_MINT_COST } from "@/lib/game/constants";
import type { Difficulty } from "@/lib/game/constants";
import type { Equipment } from "@/lib/game/equipmentSystem";
import { generateEquipment } from "@/lib/game/equipmentSystem";
import type { Cosmetic } from "@/lib/game/cosmeticSystem";
import { generateCosmetic } from "@/lib/game/cosmeticSystem";
import { generateHero } from "@/lib/game/heroGenerator";
import { countDestructibleTiles } from "@/lib/game/AIDecisionEngine";
import { fetchActiveListings as fetchRemoteListings, createListingRemote, updateListingStatus as updateListingRemote } from "@/lib/supabase/marketplace";

const STORAGE_KEY = "0gbomber_state";

let _remoteListings: MarketplaceListing[] = [];
let _syncStarted = false;

export function initMarketplaceSync() {
  if (_syncStarted) return;
  _syncStarted = true;
  syncRemoteListings();
}

async function syncRemoteListings() {
  try {
    const remote = await fetchRemoteListings();
    if (remote) _remoteListings = remote;
  } catch {}
}

export interface AdminConfig {
  globalMaintenance: boolean;
  marketplacePaused: boolean;
  tradingPaused: boolean;
  rewardsPaused: boolean;
  rewardMultiplier: number;
  currencyDropRate: number;
  equipmentDropRate: number;
  cosmeticDropRate: number;
  upgradeSeedDropRate: number;
  rareLootDropRate: number;
  eventRewardMultiplier: number;
  marketplaceFee: number;
}

const DEFAULT_ADMIN_CONFIG: AdminConfig = {
  globalMaintenance: false,
  marketplacePaused: false,
  tradingPaused: false,
  rewardsPaused: false,
  rewardMultiplier: 1,
  currencyDropRate: 1,
  equipmentDropRate: 1,
  cosmeticDropRate: 1,
  upgradeSeedDropRate: 1,
  rareLootDropRate: 1,
  eventRewardMultiplier: 1,
  marketplaceFee: 0.025,
};

export interface InboxMessage {
  id: string;
  type: "battle" | "market" | "legacy" | "system" | "reward";
  title: string;
  body: string;
  read: boolean;
  created_at: string;
  targetAddress?: string | null;
}

export interface Transaction {
  id: string;
  type: "income" | "expense";
  category: "hatch" | "mint_loot" | "mint_cosmetic" | "mint_hero" | "market_buy" | "market_sale" | "reward" | "listing_fee" | "admin_mint";
  amount: string;
  description: string;
  created_at: string;
  ownerAddress?: string | null;
}

export interface AuditEntry {
  id: string;
  action: string;
  target: string;
  detail: string;
  admin: string;
  created_at: string;
}

export interface WithdrawalRequest {
  id: string;
  playerAddress: string;
  amount: number;
  status: "pending" | "completed" | "rejected";
  createdAt: string;
  confirmedAt?: string;
  txHash?: string;
}

interface GameSave {
  heroes: Hero[];
  inventory: Equipment[];
  cosmetics: Cosmetic[];
  listings: MarketplaceListing[];
  energyPotions: number;
  activeMap: MapProgression | null;
  nextId: number;
  adminConfig: AdminConfig;
  inbox: InboxMessage[];
  transactions: Transaction[];
  username: string;
  tokenBalance: number;
  bannedAddresses: string[];
  frozenAddresses: string[];
  itemBlacklist: string[];
  auditLog: AuditEntry[];
  tokenBalances?: Record<string, number>;
  usernames?: Record<string, string>;
  potionCounts?: Record<string, number>;
  fragments?: Record<string, number>;
  withdrawalRequests?: WithdrawalRequest[];
  faucetClaims?: Record<string, number>;
  voucherUsage?: Record<string, { hero: number; equipment: number; cosmetic: number }>;
  soulboundItemIds?: string[];
}

function loadSave(): GameSave {
  if (typeof window === "undefined") return { heroes: [], inventory: [], cosmetics: [], listings: [], energyPotions: 0, activeMap: null, nextId: 1, adminConfig: { ...DEFAULT_ADMIN_CONFIG }, inbox: [], transactions: [], username: "", tokenBalance: 0, bannedAddresses: [], frozenAddresses: [], itemBlacklist: [], auditLog: [], tokenBalances: {}, usernames: {}, potionCounts: {}, fragments: {}, withdrawalRequests: [], faucetClaims: {}, voucherUsage: {}, soulboundItemIds: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const save = JSON.parse(raw) as GameSave;
      if (!save.cosmetics) save.cosmetics = [];
      if (!save.listings) save.listings = [];
      if (!save.inventory) save.inventory = [];
      if (!save.heroes) save.heroes = [];
      if (save.energyPotions === undefined) save.energyPotions = 0;
      if (!save.activeMap) save.activeMap = null;
      if (!save.adminConfig) save.adminConfig = { ...DEFAULT_ADMIN_CONFIG };
      if (!save.inbox) save.inbox = [];
      if (!save.transactions) save.transactions = [];
      if (!save.username) save.username = "";
      if (!save.tokenBalance) save.tokenBalance = 0;
      if (!save.bannedAddresses) save.bannedAddresses = [];
      if (!save.frozenAddresses) save.frozenAddresses = [];
      if (!save.itemBlacklist) save.itemBlacklist = [];
      if (!save.auditLog) save.auditLog = [];
      if (!save.tokenBalances) save.tokenBalances = {};
      if (!save.usernames) save.usernames = {};
      if (!save.potionCounts) save.potionCounts = {};
      if (!save.fragments) save.fragments = {};
      // Migrate old unclaimedTokens to fragments
      if ((save as any).unclaimedTokens) {
        save.fragments = { ...save.fragments, ...(save as any).unclaimedTokens };
        delete (save as any).unclaimedTokens;
      }
      if (!save.withdrawalRequests) save.withdrawalRequests = [];
      if (!save.faucetClaims) save.faucetClaims = {};
      if (!save.voucherUsage) save.voucherUsage = {};
      if (!save.soulboundItemIds) save.soulboundItemIds = [];
      // Migrate old single-tokenBalance to per-wallet if any legacy data exists
      if (save.tokenBalance && Object.keys(save.tokenBalances).length === 0) {
        save.tokenBalances["_legacy"] = save.tokenBalance;
      }
      // Migrate old username
      if (save.username && Object.keys(save.usernames).length === 0) {
        save.usernames["_legacy"] = save.username;
      }
      // Migrate old energyPotions
      if (save.energyPotions && Object.keys(save.potionCounts).length === 0) {
        save.potionCounts["_legacy"] = save.energyPotions;
      }
      // Migrate old heroes to new stat system
      for (const hero of save.heroes) {
        if (!hero.equipment) hero.equipment = {};
        if (!hero.cosmetics) hero.cosmetics = {};
        if (!hero.badges) hero.badges = [];
        if (!hero.lastEnergyRegen) hero.lastEnergyRegen = Date.now();
        if (!hero.traits) hero.traits = [];
        if (!hero.memories) hero.memories = [];
        if (hero.auto_deploy === undefined) hero.auto_deploy = false;
        if (!hero.legacy_cores) (hero as any).legacy_cores = [];
        // Convert old intelligence/personality records to new typed system
        if (!hero.stats) {
          const oldIntel = (hero as any).intelligence || {};
          const oldPers = (hero as any).personality || {};
          hero.stats = {
            power: oldIntel.combat || 30,
            defense: Math.floor((oldPers.careful || 50) / 2),
            speed: oldIntel.pathfinding || 30,
            intelligence: oldIntel.resource_optimization || 30,
            luck: oldIntel.loot || 30,
            vitality: 50,
          };
          hero.ai_stats = {
            learning_rate: oldIntel.resource_optimization || 30,
            adaptability: oldPers.chaotic || 50,
            risk_awareness: oldIntel.hazard_recognition || 30,
            exploration: oldPers.curious || 50,
            aggression: oldPers.aggressive || 50,
          };
          hero.farming_stats = {
            mining: 20,
            scavenging: oldIntel.loot || 20,
            treasure_hunter: 10,
            efficiency: 20,
          };
          hero.genetics = {
            dna_quality: 50,
            potential: 70,
            mutation_chance: 15,
            legacy_affinity: 30,
          };
          hero.personality = {
            brave: oldPers.aggressive || 50,
            greedy: oldPers.greedy || 50,
            curious: oldPers.curious || 50,
            loyal: oldPers.social || 50,
            lazy: Math.floor(Math.random() * 50),
            tactical: oldIntel.combat || 50,
          };
          if (!hero.bloodline) (hero as any).bloodline = null;
        }
      }
      applyEnergyRegen(save.heroes);
      return save;
    }
  } catch {}
  return { heroes: [], inventory: [], cosmetics: [], listings: [], energyPotions: 0, activeMap: null, nextId: 1, adminConfig: { ...DEFAULT_ADMIN_CONFIG }, inbox: [], transactions: [], username: "", tokenBalance: 0, bannedAddresses: [], frozenAddresses: [], itemBlacklist: [], auditLog: [], tokenBalances: {}, usernames: {}, potionCounts: {}, faucetClaims: {}, voucherUsage: {}, soulboundItemIds: [] };
}

function saveState(save: GameSave) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
}

export function getHeroes(): Hero[] {
  return loadSave().heroes;
}

export function addHero(hero: Hero): Hero | null {
  const save = loadSave();
  if (hero.owner_address && save.bannedAddresses.some(a => a.toLowerCase() === hero.owner_address!.toLowerCase())) {
    return null;
  }
  hero.id = `hero_${save.nextId++}`;
  hero.created_at = new Date().toISOString();
  save.heroes.push(hero);
  saveState(save);
  return hero;
}

export function updateHero(id: string, updates: Partial<Hero>) {
  const save = loadSave();
  const idx = save.heroes.findIndex(h => h.id === id);
  if (idx === -1) return null;
  save.heroes[idx] = { ...save.heroes[idx], ...updates };
  saveState(save);
  return save.heroes[idx];
}

export function getHero(id: string): Hero | undefined {
  return loadSave().heroes.find(h => h.id === id);
}

export function addMemory(heroId: string, event: string, detail: string = ""): Memory | null {
  const hero = getHero(heroId);
  if (!hero) return null;

  const memory: Memory = {
    id: `mem_${Date.now()}`,
    hero_id: heroId,
    event,
    detail,
    created_at: new Date().toISOString(),
  };

  const memories = [...(hero.memories || []), memory];
  updateHero(heroId, { memories });
  return memory;
}

export function addXP(heroId: string, amount: number): number {
  const hero = getHero(heroId);
  if (!hero) return 0;

  // Apply Learning Rate modifier: +0.5% per point over 50, -0.5% per point under
  const lrMod = 1 + (hero.ai_stats.learning_rate - 50) / 100;
  const modifiedAmount = Math.max(1, Math.round(amount * lrMod));

  const newXP = (hero.xp || 0) + modifiedAmount;
  const xpForNextLevel = hero.level * 100;
  let newLevel = hero.level;
  let remainingXP = newXP;

  if (remainingXP >= xpForNextLevel) {
    remainingXP -= xpForNextLevel;
    newLevel = hero.level + 1;
  }

  updateHero(heroId, { xp: remainingXP, level: newLevel });

  // Check for new traits
  checkTraits(heroId);

  return newLevel > hero.level ? newLevel : 0;
}

export function evolveAIStats(heroId: string, tickCount: number, survived: boolean, efficiency: number) {
  const hero = getHero(heroId);
  if (!hero) return;

  // AI stats slowly evolve based on experience
  // Each stat has a chance to increase based on learning_rate and tick count
  const learnChance = hero.ai_stats.learning_rate / 100; // 0-1
  const xpScale = Math.min(1, tickCount / 500); // more ticks = more evolution

  const newAI = { ...hero.ai_stats };

  if (Math.random() < learnChance * xpScale * 0.3) {
    newAI.learning_rate = Math.min(100, newAI.learning_rate + 1);
  }
  if (Math.random() < learnChance * xpScale * 0.2) {
    newAI.adaptability = Math.min(100, newAI.adaptability + 1);
  }
  if (survived && Math.random() < learnChance * xpScale * 0.15) {
    newAI.risk_awareness = Math.min(100, newAI.risk_awareness + 1);
  }
  if (efficiency > 0.7 && Math.random() < learnChance * xpScale * 0.15) {
    newAI.exploration = Math.min(100, newAI.exploration + 1);
  }

  updateHero(heroId, { ai_stats: newAI });
}

export function addIntelligence(heroId: string, _type: string, amount: number = 1) {
  const hero = getHero(heroId);
  if (!hero) return;
  // Legacy compat — boost stats instead
  const newStats = { ...hero.stats };
  const boosted = ["power", "defense", "speed", "intelligence", "luck"];
  const key = boosted[Math.floor(Math.random() * boosted.length)] as keyof typeof newStats;
  newStats[key] = Math.min(100, newStats[key] + Math.floor(amount / 2));
  updateHero(heroId, { stats: newStats });
}

export function addStat(heroId: string, stat: string, amount: number = 1) {
  const hero = getHero(heroId);
  if (!hero) return;
  const newStats: Record<string, number> = { ...hero.stats };
  if (stat in newStats) {
    newStats[stat] = Math.min(100, newStats[stat] + amount);
  }
  updateHero(heroId, { stats: newStats as unknown as Hero["stats"] });
}

export function addAIStat(heroId: string, stat: string, amount: number = 1) {
  const hero = getHero(heroId);
  if (!hero) return;
  const newAI = { ...hero.ai_stats };
  if (stat in newAI) {
    (newAI as Record<string, number>)[stat] = Math.min(100, (newAI as Record<string, number>)[stat] + amount);
    updateHero(heroId, { ai_stats: newAI });
  }
}

export function addFarmingStat(heroId: string, stat: string, amount: number = 1) {
  const hero = getHero(heroId);
  if (!hero) return;
  const newFarm = { ...hero.farming_stats };
  if (stat in newFarm) {
    (newFarm as Record<string, number>)[stat] = Math.min(100, (newFarm as Record<string, number>)[stat] + amount);
    updateHero(heroId, { farming_stats: newFarm });
  }
}

export function getEffectiveStats(hero: Hero): Record<string, number> {
  const combined: Record<string, number> = {};
  for (const [k, v] of Object.entries(hero.stats)) combined[k] = v;
  for (const [k, v] of Object.entries(hero.ai_stats)) combined[k] = v;
  for (const [k, v] of Object.entries(hero.farming_stats)) combined[k] = v;
  // Apply trait bonuses
  for (const traitName of hero.traits) {
    const def = TRAIT_DEFINITIONS[traitName];
    if (def) {
      for (const [k, bonus] of Object.entries(def.bonus)) {
        combined[k] = (combined[k] || 0) + bonus;
      }
    }
  }
  // Apply equipment bonuses
  const save = loadSave();
  for (const [slot, itemId] of Object.entries(hero.equipment)) {
    if (!itemId) continue;
    const item = save.inventory.find(i => i.id === itemId);
    if (item) {
      for (const [k, v] of Object.entries(item.stats)) {
        combined[k] = (combined[k] || 0) + v;
      }
    }
  }
  // Apply cosmetic stat bonuses
  for (const [slot, cosmeticId] of Object.entries(hero.cosmetics)) {
    if (!cosmeticId) continue;
    const cosmetic = save.cosmetics.find(c => c.id === cosmeticId);
    if (cosmetic) {
      for (const [k, v] of Object.entries(cosmetic.statBonus)) {
        combined[k] = (combined[k] || 0) + v;
      }
    }
  }
  return combined;
}

function checkTraits(heroId: string) {
  const hero = getHero(heroId);
  if (!hero) return;

  const memories = hero.memories || [];
  const currentTraits = hero.traits || [];
  const newTraits: string[] = [];

  const killedCount = memories.filter(m => m.event === "Killed Alien").length;
  const lootCount = memories.filter(m => m.event === "Found Rare Loot").length;
  const lavaCount = memories.filter(m => m.event === "Touched Lava").length;
  const clearCount = memories.filter(m => m.event === "Perfect Clear").length;
  const bossKillCount = memories.filter(m => m.event === "Boss Kill").length;

  if (hero.level >= 5 && lavaCount >= 1 && !currentTraits.includes("Lava Survivor")) {
    newTraits.push("Lava Survivor");
  }
  if (lootCount >= 3 && !currentTraits.includes("Treasure Hunter")) {
    newTraits.push("Treasure Hunter");
  }
  if (hero.level >= 3 && !currentTraits.includes("Bomb Master")) {
    newTraits.push("Bomb Master");
  }
  if (hero.level >= 10 && !currentTraits.includes("Fast Learner")) {
    newTraits.push("Fast Learner");
  }
  if (killedCount >= 5 && !currentTraits.includes("Alien Slayer")) {
    newTraits.push("Alien Slayer");
  }
  if (clearCount >= 1 && !currentTraits.includes("Explorer")) {
    newTraits.push("Explorer");
  }
  if (lootCount >= 5 && hero.stats.luck >= 40 && !currentTraits.includes("Loot Goblin")) {
    newTraits.push("Loot Goblin");
  }
  if (hero.level >= 8 && hero.stats.speed >= 50 && !currentTraits.includes("Speed Demon")) {
    newTraits.push("Speed Demon");
  }
  if (hero.level >= 12 && hero.stats.vitality >= 60 && !currentTraits.includes("Iron Will")) {
    newTraits.push("Iron Will");
  }
  if (bossKillCount >= 3 && !currentTraits.includes("Tactical Genius")) {
    newTraits.push("Tactical Genius");
  }

  if (newTraits.length > 0) {
    updateHero(heroId, { traits: [...currentTraits, ...newTraits] });
  }
}

export function canBecomeLegendary(heroId: string): boolean {
  const hero = getHero(heroId);
  if (!hero) return false;
  if (hero.level < 10) return false;

  const stats = hero.stats;
  const allHigh = Object.values(stats).every(v => v >= 70);
  if (!allHigh) return false;

  return !hero.is_legendary;
}

export function createLegacy(heroId: string): { success: boolean; newHero?: Hero } {
  const hero = getHero(heroId);
  if (!hero || !canBecomeLegendary(heroId)) return { success: false };

  updateHero(heroId, { is_legendary: true, legacy_tier: "Tier I" });

  const newHero: Hero = {
    ...hero,
    id: `hero_${Date.now()}`,
    name: `${hero.name} II`,
    level: 1,
    xp: 0,
    generation: hero.generation + 1,
    legacy_tier: null,
    is_legendary: false,
    stats: Object.fromEntries(
      Object.entries(hero.stats).map(([k, v]) => [k, Math.max(10, Math.floor(v * 0.3))])
    ) as unknown as Hero["stats"],
    ai_stats: Object.fromEntries(
      Object.entries(hero.ai_stats).map(([k, v]) => [k, Math.max(10, Math.floor(v * 0.3))])
    ) as unknown as Hero["ai_stats"],
    farming_stats: Object.fromEntries(
      Object.entries(hero.farming_stats).map(([k, v]) => [k, Math.max(10, Math.floor(v * 0.3))])
    ) as unknown as Hero["farming_stats"],
    genetics: { ...hero.genetics },
    personality: Object.fromEntries(
      Object.entries(hero.personality).map(([k, v]) => [k, v + Math.floor(Math.random() * 10 - 5)])
    ) as unknown as Hero["personality"],
    traits: hero.traits.slice(0, 2),
    memories: [],
    cosmetics: {
      Helmet: null,
      Suit: null,
      Trail: null,
      "Bomb Effect": null,
      Aura: null,
      Drone: null,
    },
    bloodline: {
      parent_id: hero.id,
      parent_name: hero.name,
      generation: hero.generation,
      inherited_stats: {},
      inherited_traits: hero.traits.slice(0, 2),
      dna_similarity: Math.floor(Math.random() * 40 + 40),
    },
    legacy_cores: [],
    lastEnergyRegen: Date.now(),
    created_at: new Date().toISOString(),
  };

  const save = loadSave();
  const newId = `hero_${save.nextId++}`;
  newHero.id = newId;
  save.heroes.push(newHero);
  saveState(save);

  return { success: true, newHero };
}

export function calculateScoreRewards(score: number, heroLevel: number, hero?: Hero): { xp: number; spout: number } {
  const cfg = getAdminConfig();
  const baseXP = score * cfg.rewardMultiplier * cfg.eventRewardMultiplier;
  const spout = Math.floor(score / 2 * cfg.rewardMultiplier * cfg.eventRewardMultiplier);
  const levelBonus = 1 + heroLevel * 0.1;
  const statBonus = hero ? 1 + (hero.farming_stats.efficiency / 200) : 1;
  return { xp: Math.floor(baseXP * levelBonus * statBonus), spout: Math.floor(spout * statBonus) };
}

export function renameHero(id: string, newName: string) {
  const hero = getHero(id);
  if (!hero) return false;
  updateHero(id, { name: newName.slice(0, 20) });
  return true;
}

export function deleteHero(id: string) {
  const save = loadSave();
  save.heroes = save.heroes.filter(h => h.id !== id);
  saveState(save);
}

// === Inventory & Equipment ===

export function getInventory(): Equipment[] {
  return loadSave().inventory;
}

export function addToInventory(item: Equipment) {
  const save = loadSave();
  save.inventory.push(item);
  saveState(save);
}

export function removeFromInventory(itemId: string) {
  const save = loadSave();
  save.inventory = save.inventory.filter(i => i.id !== itemId);
  saveState(save);
}

export function equipItem(heroId: string, equipment: Equipment): boolean {
  const hero = getHero(heroId);
  if (!hero) return false;
  if (equipment.owner && equipment.owner !== heroId) return false;
  if (isItemBlacklisted(equipment.id)) return false;

  const slot = equipment.slot;
  const currentEquipped = hero.equipment[slot];

  const save = loadSave();

  // Unequip current item in that slot
  if (currentEquipped) {
    const oldItem = save.inventory.find(i => i.id === currentEquipped);
    if (oldItem) oldItem.owner = null;
  }

  // Equip new item
  const invItem = save.inventory.find(i => i.id === equipment.id);
  if (invItem) {
    if (invItem.owner && invItem.owner !== heroId) return false;
    invItem.owner = heroId;
  } else {
    save.inventory.push({ ...equipment, owner: heroId });
  }

  // Update hero in same save
  const heroIdx = save.heroes.findIndex(h => h.id === heroId);
  if (heroIdx === -1) return false;
  save.heroes[heroIdx] = { ...save.heroes[heroIdx], equipment: { ...save.heroes[heroIdx].equipment, [slot]: equipment.id } };

  saveState(save);
  return true;
}

export function unequipItem(heroId: string, slot: string): boolean {
  const hero = getHero(heroId);
  if (!hero) return false;

  const currentId = hero.equipment[slot];
  if (!currentId) return false;

  const save = loadSave();
  const item = save.inventory.find(i => i.id === currentId);
  if (item) item.owner = null;

  // Update hero in same save
  const heroIdx = save.heroes.findIndex(h => h.id === heroId);
  if (heroIdx === -1) return false;
  save.heroes[heroIdx] = { ...save.heroes[heroIdx], equipment: { ...save.heroes[heroIdx].equipment, [slot]: null } };

  saveState(save);
  return true;
}

const RARITY_RANK: Record<string, number> = { Common: 0, Rare: 1, Epic: 2, Legendary: 3, Mythic: 4, Genesis: 5 };

// Class-specific stat weight preferences for equipment scoring
const CLASS_STAT_WEIGHTS: Record<string, Record<string, number>> = {
  Engineer:  { power: 0.3, defense: 0.4, speed: 0.8, intelligence: 1.0, luck: 0.6, vitality: 0.5 },
  Marine:    { power: 1.0, defense: 0.9, speed: 0.5, intelligence: 0.2, luck: 0.3, vitality: 0.8 },
  Scientist: { power: 0.2, defense: 0.3, speed: 0.4, intelligence: 1.0, luck: 0.9, vitality: 0.3 },
  Medic:     { power: 0.2, defense: 0.6, speed: 0.5, intelligence: 0.9, luck: 0.5, vitality: 1.0 },
  Scout:     { power: 0.4, defense: 0.3, speed: 1.0, intelligence: 0.5, luck: 0.8, vitality: 0.4 },
  Commander: { power: 0.8, defense: 0.6, speed: 0.6, intelligence: 0.7, luck: 0.4, vitality: 0.6 },
  Miner:     { power: 0.9, defense: 0.7, speed: 0.3, intelligence: 0.3, luck: 0.5, vitality: 0.7 },
};

// Slot stat mappings for equipment evaluation
const SLOT_STAT_MAP: Record<string, string[]> = {
  "Bomb Core":     ["bomb_damage", "bomb_range"],
  "Engine":        ["speed", "max_energy"],
  "Armor":         ["hp", "defense"],
  "Memory Chip":   ["intel_gain", "memory_cap"],
  "Scanner":       ["loot_range", "hazard_detect"],
  "Utility Device":["energy_regen", "luck"],
};

export function getEquipmentScore(item: Equipment, heroClass: string): number {
  const rarityMult = (RARITY_RANK[item.rarity] ?? 0) + 1;
  const weights = CLASS_STAT_WEIGHTS[heroClass] || CLASS_STAT_WEIGHTS.Marine;
  const slotStats = SLOT_STAT_MAP[item.slot] || [];
  let statScore = 0;
  let slotMatchBonus = 0;
  for (const [stat, value] of Object.entries(item.stats)) {
    const w = weights[stat] || 0.5;
    statScore += value * w;
    if (slotStats.includes(stat)) slotMatchBonus += value * 0.2;
  }
  return statScore * rarityMult + slotMatchBonus;
}

export function getWalletEquipment(walletAddress: string): Equipment[] {
  const save = loadSave();
  const heroIds = new Set(save.heroes.filter(h => h.owner_address === walletAddress).map(h => h.id));
  return save.inventory.filter(i => !i.owner || i.owner === walletAddress || heroIds.has(i.owner));
}

export function getWalletCosmetics(walletAddress: string): Cosmetic[] {
  const save = loadSave();
  const heroIds = new Set(save.heroes.filter(h => h.owner_address === walletAddress).map(h => h.id));
  return save.cosmetics.filter(c => !c.owner || c.owner === walletAddress || heroIds.has(c.owner));
}

export function refreshWalletInventory(walletAddress: string): { heroes: Hero[]; inventory: Equipment[]; cosmetics: Cosmetic[] } {
  return {
    heroes: getHeroes().filter(h => h.owner_address === walletAddress),
    inventory: getWalletEquipment(walletAddress),
    cosmetics: getWalletCosmetics(walletAddress),
  };
}

export function autoEquipHero(heroId: string): number {
  const hero = getHero(heroId);
  if (!hero) return 0;
  let equipped = 0;
  for (const slot of Object.keys(hero.equipment)) {
    const candidates = (() => {
      const save = loadSave();
      return save.inventory.filter(i => !i.owner || i.owner === heroId).filter(i => i.slot === slot);
    })();
    if (candidates.length === 0) continue;
    const best = candidates.reduce((a, b) => {
      const aScore = getEquipmentScore(a, hero.class);
      const bScore = getEquipmentScore(b, hero.class);
      return aScore >= bScore ? a : b;
    });
    equipItem(heroId, { ...best, owner: heroId });
    equipped++;
  }
  return equipped;
}

export function autoEquipCosmetics(heroId: string): number {
  const hero = getHero(heroId);
  if (!hero) return 0;
  let equipped = 0;
  for (const slot of Object.keys(hero.cosmetics)) {
    const candidates = (() => {
      const save = loadSave();
      return save.cosmetics.filter(c => !c.owner || c.owner === heroId).filter(c => c.type === slot);
    })();
    if (candidates.length === 0) continue;
    const best = candidates.reduce((a, b) => {
      const aRank = RARITY_RANK[a.rarity] ?? 0;
      const bRank = RARITY_RANK[b.rarity] ?? 0;
      if (aRank !== bRank) return aRank > bRank ? a : b;
      const aStat = Object.values(a.statBonus).reduce((s, v) => s + v, 0);
      const bStat = Object.values(b.statBonus).reduce((s, v) => s + v, 0);
      return aStat >= bStat ? a : b;
    });
    equipCosmetic(heroId, { ...best, owner: heroId });
    equipped++;
  }
  return equipped;
}

// === Energy Regeneration ===

export function applyEnergyRegen(heroes: Hero[]) {
  const now = Date.now();
  for (const hero of heroes) {
    const lastRegen = hero.lastEnergyRegen || now;
    const elapsed = now - lastRegen;
    if (elapsed >= ENERGY_REGEN_INTERVAL) {
      const regenTicks = Math.floor(elapsed / ENERGY_REGEN_INTERVAL);
      const newEnergy = Math.min(hero.max_energy, hero.energy + regenTicks * ENERGY_REGEN_AMOUNT);
      hero.energy = newEnergy;
      hero.lastEnergyRegen = now;
    }
  }
}

export function triggerEnergyRegen() {
  const save = loadSave();
  applyEnergyRegen(save.heroes);
  saveState(save);
}

export function consumeEnergy(heroId: string, amount: number): boolean {
  const hero = getHero(heroId);
  if (!hero) return false;
  if (hero.energy < amount) return false;
  updateHero(heroId, { energy: hero.energy - amount });
  return true;
}

// === Cosmetics ===

export function getCosmetics(): Cosmetic[] {
  return loadSave().cosmetics;
}

export function addCosmetic(item: Cosmetic) {
  const save = loadSave();
  save.cosmetics.push(item);
  saveState(save);
}

export function removeCosmetic(itemId: string) {
  const save = loadSave();
  save.cosmetics = save.cosmetics.filter(c => c.id !== itemId);
  saveState(save);
}

export function equipCosmetic(heroId: string, cosmetic: Cosmetic): boolean {
  const hero = getHero(heroId);
  if (!hero) return false;
  if (cosmetic.owner && cosmetic.owner !== heroId) return false;
  if (isItemBlacklisted(cosmetic.id)) return false;

  const slot = cosmetic.type;
  const currentEquipped = hero.cosmetics[slot];

  const save = loadSave();

  if (currentEquipped) {
    const oldCos = save.cosmetics.find(c => c.id === currentEquipped);
    if (oldCos) oldCos.owner = null;
  }

  const invCos = save.cosmetics.find(c => c.id === cosmetic.id);
  if (invCos) {
    if (invCos.owner && invCos.owner !== heroId) return false;
    invCos.owner = heroId;
  } else {
    save.cosmetics.push({ ...cosmetic, owner: heroId });
  }

  // Update hero in same save
  const heroIdx = save.heroes.findIndex(h => h.id === heroId);
  if (heroIdx === -1) return false;
  save.heroes[heroIdx] = { ...save.heroes[heroIdx], cosmetics: { ...save.heroes[heroIdx].cosmetics, [slot]: cosmetic.id } };

  saveState(save);
  return true;
}

export function unequipCosmetic(heroId: string, slot: string): boolean {
  const hero = getHero(heroId);
  if (!hero) return false;

  const currentId = hero.cosmetics[slot];
  if (!currentId) return false;

  const save = loadSave();
  const cos = save.cosmetics.find(c => c.id === currentId);
  if (cos) cos.owner = null;

  // Update hero in same save
  const heroIdx = save.heroes.findIndex(h => h.id === heroId);
  if (heroIdx === -1) return false;
  save.heroes[heroIdx] = { ...save.heroes[heroIdx], cosmetics: { ...save.heroes[heroIdx].cosmetics, [slot]: null } };

  saveState(save);
  return true;
}

export function unequipAll(heroId: string): number {
  const save = loadSave();
  const heroIdx = save.heroes.findIndex(h => h.id === heroId);
  if (heroIdx === -1) return 0;
  const hero = save.heroes[heroIdx];
  let count = 0;

  for (const slot of Object.keys(hero.equipment)) {
    const currentId = hero.equipment[slot];
    if (currentId) {
      const item = save.inventory.find(i => i.id === currentId);
      if (item) { item.owner = null; count++; }
      hero.equipment[slot] = null;
    }
  }

  for (const slot of Object.keys(hero.cosmetics)) {
    const currentId = hero.cosmetics[slot];
    if (currentId) {
      const cos = save.cosmetics.find(c => c.id === currentId);
      if (cos) { cos.owner = null; count++; }
      hero.cosmetics[slot] = null;
    }
  }

  if (count > 0) saveState(save);
  return count;
}

// === Inventory Validation ===

export function validateInventory(walletAddress: string): { valid: boolean; heroCount: number; equipCount: number; expectedHeroCount: number; expectedEquipCount: number; missingEquip: string[]; issues: string[] } {
  const save = loadSave();
  const heroes = save.heroes.filter(h => h.owner_address === walletAddress);
  const heroIds = new Set(heroes.map(h => h.id));
  const inventoryItems = save.inventory.filter(i => !i.owner || i.owner === walletAddress || heroIds.has(i.owner));
  const issues: string[] = [];
  const missingEquip: string[] = [];

  // Check each hero's equipment references exist in inventory
  for (const hero of heroes) {
    for (const [slot, equipId] of Object.entries(hero.equipment)) {
      if (!equipId) continue;
      const item = save.inventory.find(i => i.id === equipId);
      if (!item) {
        missingEquip.push(`${hero.name}[${slot}]: ${equipId}`);
        issues.push(`Hero ${hero.name} references equipment ${equipId} in slot ${slot} but item not found in inventory`);
      } else if (item.owner !== hero.id) {
        issues.push(`Hero ${hero.name} has ${equipId} in slot ${slot} but item.owner is "${item.owner}" instead of "${hero.id}"`);
      }
    }
  }

  // Check no item has owner = null AND is referenced by a hero
  const equippedIds = new Set<string>();
  for (const hero of heroes) {
    for (const equipId of Object.values(hero.equipment)) {
      if (equipId) equippedIds.add(equipId);
    }
  }
  for (const item of save.inventory) {
    if (equippedIds.has(item.id) && !item.owner) {
      issues.push(`Item ${item.name} (${item.id}) is in hero equipment slot but has no owner`);
    }
    if (item.owner && equippedIds.has(item.id) && item.owner !== walletAddress && !heroIds.has(item.owner)) {
      // This is OK if item owner is the wallet or a specific hero
    }
  }

  return {
    valid: issues.length === 0,
    heroCount: heroes.length,
    equipCount: inventoryItems.length,
    expectedHeroCount: heroes.length,
    expectedEquipCount: inventoryItems.length,
    missingEquip,
    issues,
  };
}

export function forceRefreshInventory(walletAddress: string): void {
  const fresh = refreshWalletInventory(walletAddress);
  // Force cleanup: ensure no orphaned equipment references
  const save = loadSave();
  for (const hero of save.heroes.filter(h => h.owner_address === walletAddress)) {
    for (const [slot, equipId] of Object.entries(hero.equipment)) {
      if (!equipId) continue;
      const exists = save.inventory.find(i => i.id === equipId);
      if (!exists) {
        hero.equipment[slot] = null;
      }
    }
  }
  saveState(save);
}

// === Marketplace ===

export function getListings(): MarketplaceListing[] {
  return loadSave().listings;
}

export function getActiveListings(): MarketplaceListing[] {
  const local = loadSave().listings.filter(l => l.status === "active");
  const localIds = new Set(local.map(l => l.id));
  const remote = _remoteListings.filter(r => !localIds.has(r.id));
  return [...remote, ...local];
}

export function createListing(seller: string, itemType: "hero" | "equipment" | "cosmetic" | "potion", itemId: string, price: string, potionQty?: number): MarketplaceListing | null {
  const save = loadSave();

  // Reject soulbound items
  if (itemType !== "potion" && isItemSoulbound(itemId)) return null;

  // Verify ownership
  if (itemType === "hero") {
    const hero = save.heroes.find(h => h.id === itemId);
    if (!hero || hero.owner_address !== seller) return null;
  } else if (itemType === "equipment") {
    const item = save.inventory.find(i => i.id === itemId);
    if (!item || item.owner !== seller) return null;
  } else if (itemType === "cosmetic") {
    const item = save.cosmetics.find(c => c.id === itemId);
    if (!item || item.owner !== seller) return null;
  } else if (itemType === "potion") {
    const qty = potionQty ?? 1;
    if (qty <= 0 || save.energyPotions < qty) return null;
    save.energyPotions -= qty;
    itemId = `potion_${qty}`;
  }

  const listing: MarketplaceListing = {
    id: `list_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    seller,
    item_type: itemType,
    item_id: itemId,
    price,
    status: "active",
    created_at: new Date().toISOString(),
  };

  save.listings.push(listing);
  saveState(save);
  createListingRemote(listing);
  return listing;
}

export function cancelListing(listingId: string, caller: string): boolean {
  const save = loadSave();
  const idx = save.listings.findIndex(l => l.id === listingId);
  if (idx === -1) return false;
  if (save.listings[idx].seller.toLowerCase() !== caller.toLowerCase()) return false;
  if (save.listings[idx].status !== "active") return false;

  // Return potions to seller on cancel
  if (save.listings[idx].item_type === "potion") {
    const qty = parseInt(save.listings[idx].item_id.replace("potion_", "")) || 0;
    save.energyPotions += qty;
  }

  save.listings[idx].status = "cancelled";
  saveState(save);
  updateListingRemote(listingId, "cancelled");
  return true;
}

export function adminCancelListing(listingId: string): boolean {
  const save = loadSave();
  const idx = save.listings.findIndex(l => l.id === listingId);
  if (idx === -1) return false;
  if (save.listings[idx].status !== "active") return false;
  if (save.listings[idx].item_type === "potion") {
    const qty = parseInt(save.listings[idx].item_id.replace("potion_", "")) || 0;
    save.energyPotions += qty;
  }
  save.listings[idx].status = "cancelled";
  addAuditLog("cancel_listing", listingId, `Cancelled listing ${save.listings[idx].item_type} by admin`);
  saveState(save);
  return true;
}

// === Map Progression ===

export function getActiveMap(): MapProgression | null {
  return loadSave().activeMap;
}

export function saveActiveMap(map: MapProgression) {
  const save = loadSave();
  save.activeMap = map;
  saveState(save);
}

export function clearActiveMap() {
  const save = loadSave();
  save.activeMap = null;
  saveState(save);
}

export function createNewActiveMap(address: string, difficulty: string, grid: number[][], enemies: { id: string; x: number; y: number; type: string; hp: number; maxHp: number; moveTimer: number }[], prePlacedItems?: { x: number; y: number }[]) {
  const map: MapProgression = {
    id: `map_${Date.now()}`,
    owner_address: address,
    difficulty,
    grid,
    enemies,
    progress: 0,
    totalKills: 0,
    cleared: false,
    originalDestructibleCount: countDestructibleTiles(grid as any),
    prePlacedItems: prePlacedItems || [],
    created_at: new Date().toISOString(),
    startedAt: Date.now(),
    completedAt: null,
    autoDeployed: false,
  };
  saveActiveMap(map);
  return map;
}

// === Energy Potions ===

export function getEnergyPotions(): number {
  return loadSave().energyPotions;
}

export function addEnergyPotions(amount: number) {
  const save = loadSave();
  save.energyPotions += amount;
  saveState(save);
}

export function useEnergyPotion(heroId: string): boolean {
  const save = loadSave();
  if (save.energyPotions <= 0) return false;
  const hero = save.heroes.find(h => h.id === heroId);
  if (!hero) return false;
  const restored = Math.min(hero.max_energy, hero.energy + 30);
  hero.energy = restored;
  save.energyPotions--;
  saveState(save);
  return true;
}

export function buyListing(listingId: string, buyerAddress: string): MarketplaceListing | null {
  const save = loadSave();
  const idx = save.listings.findIndex(l => l.id === listingId);
  if (idx === -1) return null;
  const listing = save.listings[idx];
  if (listing.status !== "active") return null;
  if (listing.seller.toLowerCase() === buyerAddress.toLowerCase()) return null;

  const priceNum = parseFloat(listing.price);
  if (isNaN(priceNum) || priceNum <= 0) return null;

  // Apply marketplace fee from admin config
  const feeRate = save.adminConfig.marketplaceFee ?? MARKETPLACE_FEE;
  const feeAmount = Math.floor(priceNum * feeRate * 100) / 100;
  const sellerProceeds = priceNum - feeAmount;

  // Credit seller's in-game balance minus fee
  if (!save.tokenBalances) save.tokenBalances = {};
  const sellerKey = listing.seller.toLowerCase();
  const sellerBal = save.tokenBalances[sellerKey] || 0;
  save.tokenBalances[sellerKey] = sellerBal + sellerProceeds;

  // Credit fee to treasury in-game balance
  const treasuryKey = TREASURY_ADDRESS.toLowerCase();
  const treasuryBal = save.tokenBalances[treasuryKey] || 0;
  save.tokenBalances[treasuryKey] = treasuryBal + feeAmount;

  // Record fee transaction
  save.transactions.unshift({
    id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: "income",
    category: "listing_fee",
    amount: String(feeAmount),
    description: `Marketplace fee (${(feeRate * 100).toFixed(1)}%) for ${listing.item_type}`,
    created_at: new Date().toISOString(),
    ownerAddress: listing.seller,
  });

  // Transfer item ownership
  if (listing.item_type === "hero") {
    const hero = save.heroes.find(h => h.id === listing.item_id);
    if (!hero) return null;
    hero.owner_address = buyerAddress;
    // Unequip all items that belonged to old owner
    for (const eq of save.inventory) {
      if (eq.owner === listing.item_id) eq.owner = null;
    }
  } else if (listing.item_type === "equipment") {
    const item = save.inventory.find(i => i.id === listing.item_id);
    if (!item) return null;
    item.owner = buyerAddress;
    // Remove from hero equip if equipped
    for (const hero of save.heroes) {
      for (const [slot, eqId] of Object.entries(hero.equipment)) {
        if (eqId === listing.item_id) {
          hero.equipment[slot] = null;
        }
      }
    }
  } else if (listing.item_type === "cosmetic") {
    const item = save.cosmetics.find(c => c.id === listing.item_id);
    if (!item) return null;
    item.owner = buyerAddress;
    // Remove from hero cosmetics if equipped
    for (const hero of save.heroes) {
      for (const [slot, cosId] of Object.entries(hero.cosmetics)) {
        if (cosId === listing.item_id) {
          hero.cosmetics[slot] = null;
        }
      }
    }
  } else if (listing.item_type === "potion") {
    const qty = parseInt(listing.item_id.replace("potion_", "")) || 0;
    save.energyPotions += qty;
  }

  listing.status = "sold";
  updateListingRemote(listingId, "sold");

  // Record buyer transaction
  save.transactions.unshift({
    id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: "expense",
    category: "market_buy",
    amount: listing.price,
    description: `Bought ${listing.item_type} for ${listing.price}`,
    created_at: new Date().toISOString(),
    ownerAddress: buyerAddress,
  });

  saveState(save);
  return listing;
}

export function getAdminConfig(): AdminConfig {
  const save = loadSave();
  return save.adminConfig;
}

export function updateAdminConfig(partial: Partial<AdminConfig>) {
  const save = loadSave();
  save.adminConfig = { ...save.adminConfig, ...partial };
  saveState(save);
}

export function isEmergencyShutdown(): { marketplace: boolean; trading: boolean; rewards: boolean } {
  const cfg = getAdminConfig();
  return {
    marketplace: cfg.marketplacePaused || cfg.globalMaintenance,
    trading: cfg.tradingPaused || cfg.globalMaintenance,
    rewards: cfg.rewardsPaused || cfg.globalMaintenance,
  };
}

export function getEffectiveMultipliers() {
  const cfg = getAdminConfig();
  return {
    rewardMultiplier: cfg.rewardMultiplier,
    currencyDropRate: cfg.currencyDropRate,
    equipmentDropRate: cfg.equipmentDropRate,
    cosmeticDropRate: cfg.cosmeticDropRate,
    rareLootDropRate: cfg.rareLootDropRate,
    eventRewardMultiplier: cfg.eventRewardMultiplier,
    marketplaceFee: cfg.marketplaceFee,
  };
}

// === Inbox Messages ===

export function getInbox(): InboxMessage[] {
  return loadSave().inbox;
}

export function getMyInbox(address: string | null): InboxMessage[] {
  if (!address) return [];
  const addr = address.toLowerCase();
  return loadSave().inbox.filter(m => !m.targetAddress || m.targetAddress.toLowerCase() === addr);
}

export function getUnreadCount(address?: string): number {
  if (address) {
    const addr = address.toLowerCase();
    return loadSave().inbox.filter(m => (!m.targetAddress || m.targetAddress.toLowerCase() === addr) && !m.read).length;
  }
  return loadSave().inbox.filter(m => !m.read).length;
}

export function addInboxMessage(msg: Omit<InboxMessage, "id" | "read" | "created_at"> & { targetAddress?: string | null }) {
  const save = loadSave();
  const message: InboxMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    ...msg,
    targetAddress: msg.targetAddress,
    read: false,
    created_at: new Date().toISOString(),
  };
  save.inbox.unshift(message);
  if (save.inbox.length > 100) save.inbox = save.inbox.slice(0, 100);
  saveState(save);
  return message;
}

export function markMessageRead(id: string) {
  const save = loadSave();
  const msg = save.inbox.find(m => m.id === id);
  if (msg) { msg.read = true; saveState(save); }
}

export function markAllRead() {
  const save = loadSave();
  for (const m of save.inbox) m.read = true;
  saveState(save);
}

export function deleteMessage(id: string) {
  const save = loadSave();
  save.inbox = save.inbox.filter(m => m.id !== id);
  saveState(save);
}

export function clearAllMessages() {
  const save = loadSave();
  save.inbox = [];
  saveState(save);
}

// === Transactions ===

export function getTransactions(): Transaction[] {
  return loadSave().transactions;
}

export function addTransaction(tx: Omit<Transaction, "id" | "created_at"> & { ownerAddress?: string | null }) {
  const save = loadSave();
  const transaction: Transaction = {
    id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    ...tx,
    ownerAddress: tx.ownerAddress,
    created_at: new Date().toISOString(),
  };
  save.transactions.unshift(transaction);
  if (save.transactions.length > 500) save.transactions = save.transactions.slice(0, 500);
  saveState(save);
  return transaction;
}

export function getMyTransactions(address: string | null): Transaction[] {
  if (!address) return [];
  const addr = address.toLowerCase();
  return loadSave().transactions.filter(tx => !tx.ownerAddress || tx.ownerAddress.toLowerCase() === addr);
}

// === Per-Wallet Data ===

export function getPlayerBalance(address: string | null): number {
  if (!address) return 0;
  const save = loadSave();
  const addr = address.toLowerCase();
  const balances = save.tokenBalances || {};
  if (balances[addr]) return balances[addr];
  return save.tokenBalance || 0;
}

export function setPlayerBalance(address: string | null, amount: number) {
  if (!address) return;
  const save = loadSave();
  const addr = address.toLowerCase();
  if (!save.tokenBalances) save.tokenBalances = {};
  save.tokenBalances[addr] = amount;
  saveState(save);
}

export function addPlayerBalance(address: string | null, amount: number) {
  if (!address) return;
  const save = loadSave();
  const addr = address.toLowerCase();
  if (!save.tokenBalances) save.tokenBalances = {};
  save.tokenBalances[addr] = (save.tokenBalances[addr] || 0) + amount;
  saveState(save);
}

export function getFragments(address: string | null): number {
  if (!address) return 0;
  const save = loadSave();
  const addr = address.toLowerCase();
  return save.fragments?.[addr] || 0;
}

export function addFragments(address: string | null, amount: number) {
  if (!address || amount <= 0) return;
  const save = loadSave();
  const addr = address.toLowerCase();
  if (!save.fragments) save.fragments = {};
  save.fragments[addr] = (save.fragments[addr] || 0) + amount;
  saveState(save);
}

const FRAGMENT_TO_TOKEN = 10;
const MIN_CLAIM_TOKENS = 500;

export function claimTokens(address: string | null): { ok: boolean; message: string } {
  if (!address) return { ok: false, message: "Wallet not connected" };
  const save = loadSave();
  const addr = address.toLowerCase();
  const frags = save.fragments?.[addr] || 0;
  const needed = MIN_CLAIM_TOKENS * FRAGMENT_TO_TOKEN;
  if (frags < needed) return { ok: false, message: `Need ${needed} 0B Fragments to claim ${MIN_CLAIM_TOKENS} 0Bomb (have ${frags})` };
  // Create withdrawal request for admin approval
  if (!save.withdrawalRequests) save.withdrawalRequests = [];
  save.withdrawalRequests.push({
    id: `wd_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    playerAddress: addr,
    amount: MIN_CLAIM_TOKENS,
    status: "pending",
    createdAt: new Date().toISOString(),
  });
  save.fragments![addr] = frags - needed;
  saveState(save);
  addTransaction({ type: "income", category: "reward", amount: String(MIN_CLAIM_TOKENS), description: `Withdrawal requested for ${MIN_CLAIM_TOKENS} 0Bomb (${needed} fragments) — pending admin approval`, ownerAddress: addr });
  return { ok: true, message: `Withdrawal requested! ${MIN_CLAIM_TOKENS} 0Bomb pending admin approval.` };
}

export function getPendingWithdrawals(): WithdrawalRequest[] {
  const save = loadSave();
  return (save.withdrawalRequests || []).filter(w => w.status === "pending");
}

export function getMyWithdrawals(address: string | null): WithdrawalRequest[] {
  if (!address) return [];
  const save = loadSave();
  const addr = address.toLowerCase();
  return (save.withdrawalRequests || []).filter(w => w.playerAddress.toLowerCase() === addr);
}

export function confirmWithdrawal(requestId: string, txHash: string) {
  const save = loadSave();
  const req = (save.withdrawalRequests || []).find(w => w.id === requestId);
  if (!req) return;
  req.status = "completed";
  req.confirmedAt = new Date().toISOString();
  req.txHash = txHash;
  addTransaction({ type: "income", category: "reward", amount: String(req.amount), description: `Withdrawal confirmed — ${req.amount} 0Bomb sent`, ownerAddress: req.playerAddress });
  addInboxMessage({ type: "system", title: "✅ Withdrawal Confirmed", body: `Your withdrawal of ${req.amount} 0Bomb has been confirmed and sent to your wallet.`, targetAddress: req.playerAddress });
  saveState(save);
}

export function rejectWithdrawal(requestId: string) {
  const save = loadSave();
  const req = (save.withdrawalRequests || []).find(w => w.id === requestId);
  if (!req) return;
  req.status = "rejected";
  // Refund fragments
  if (!save.fragments) save.fragments = {};
  save.fragments[req.playerAddress] = (save.fragments[req.playerAddress] || 0) + req.amount * FRAGMENT_TO_TOKEN;
  addTransaction({ type: "income", category: "reward", amount: String(req.amount), description: `Withdrawal rejected — ${req.amount} 0Bomb fragments returned`, ownerAddress: req.playerAddress });
  addInboxMessage({ type: "system", title: "❌ Withdrawal Rejected", body: `Your withdrawal of ${req.amount} 0Bomb was rejected. Fragments returned.`, targetAddress: req.playerAddress });
  saveState(save);
}

export function getPlayerUsername(address: string | null): string {
  if (!address) return "";
  const save = loadSave();
  const addr = address.toLowerCase();
  const names = save.usernames || {};
  if (names[addr]) return names[addr];
  return save.username || "";
}

export function setPlayerUsername(address: string | null, name: string) {
  if (!address) return;
  const save = loadSave();
  const addr = address.toLowerCase();
  if (!save.usernames) save.usernames = {};
  save.usernames[addr] = name.slice(0, 20);
  saveState(save);
}

export function getPlayerPotions(address: string | null): number {
  if (!address) return 0;
  const save = loadSave();
  const addr = address.toLowerCase();
  const pots = save.potionCounts || {};
  return pots[addr] || 0;
}

export function addPlayerPotions(address: string | null, amount: number) {
  if (!address) return;
  const save = loadSave();
  const addr = address.toLowerCase();
  if (!save.potionCounts) save.potionCounts = {};
  save.potionCounts[addr] = (save.potionCounts[addr] || 0) + amount;
  saveState(save);
}

// === Username (legacy global) ===

export function getUsername(): string {
  return loadSave().username;
}

export function setUsername(name: string) {
  const save = loadSave();
  save.username = name.slice(0, 20);
  saveState(save);
}

// === Admin Actions ===

export function adminDeleteHero(id: string) {
  const save = loadSave();
  const hero = save.heroes.find(h => h.id === id);
  save.heroes = save.heroes.filter(h => h.id !== id);
  addAuditLog("delete_hero", id, hero ? `Deleted ${hero.name} Lv.${hero.level}` : "Hero deleted");
  saveState(save);
}

export function adminGiveXP(heroId: string, amount: number) {
  const hero = getHero(heroId);
  if (!hero) return;
  let newXP = (hero.xp || 0) + amount;
  let newLevel = hero.level;
  while (newXP >= newLevel * 100) {
    newXP -= newLevel * 100;
    newLevel++;
  }
  updateHero(heroId, { xp: newXP, level: newLevel });
  addAuditLog("give_xp", heroId, `Gave ${amount} XP to ${hero.name}`);
}

export function adminSetLevel(heroId: string, level: number) {
  const hero = getHero(heroId);
  updateHero(heroId, { level: Math.max(1, level), xp: 0 });
  if (hero) addAuditLog("set_level", heroId, `Set ${hero.name} to Lv.${level}`);
}

export function adminAddPotions(amount: number, targetAddress?: string) {
  if (targetAddress) {
    addPlayerPotions(targetAddress, amount);
  } else {
    const save = loadSave();
    save.energyPotions = (save.energyPotions || 0) + amount;
    saveState(save);
  }
  addInboxMessage({ type: "system", title: "🧪 Potions Received", body: `Admin granted you ${amount} Energy Potions.`, targetAddress });
  addAuditLog("add_potions", targetAddress || "player", `Added ${amount} potions`);
}

export function adminAddItem(address: string, rarity?: "Common" | "Rare" | "Epic" | "Legendary") {
  if (isAddressBanned(address)) return null;
  const eq = generateEquipment(undefined, null, rarity);
  eq.owner = null;
  addToInventory(eq);
  addInboxMessage({ type: "system", title: "🎒 Equipment Received", body: `Admin granted "${eq.name}" (${eq.rarity} ${eq.slot}).`, targetAddress: address });
  addAuditLog("add_item", address, `Granted ${eq.name} (${eq.rarity}) to ${address.slice(0, 6)}`);
  return eq;
}

export function adminAddCosmetic(address: string, rarity?: "Common" | "Rare" | "Epic" | "Legendary" | "Mythic") {
  if (isAddressBanned(address)) return null;
  const cos = generateCosmetic(undefined, null, rarity);
  cos.owner = null;
  addCosmetic(cos);
  addInboxMessage({ type: "system", title: "✨ Cosmetic Received", body: `Admin granted "${cos.name}" (${cos.rarity} ${cos.type}).`, targetAddress: address });
  addAuditLog("add_cosmetic", address, `Granted ${cos.name} (${cos.rarity}) to ${address.slice(0, 6)}`);
  return cos;
}

export function adminAddHero(address: string) {
  if (isAddressBanned(address)) return null;
  const hero = generateHero(address);
  const added = addHero(hero);
  if (!added) return null;
  addInboxMessage({ type: "system", title: "🦸 Hero Received", body: `Admin granted hero "${hero.name}" (${hero.rarity} ${hero.class}, Lv.${hero.level}).`, targetAddress: address });
  addAuditLog("add_hero", address, `Granted ${hero.name} (${hero.rarity} ${hero.class}) to ${address.slice(0, 6)}`);
  return hero;
}

export function getTokenBalance(): number {
  return loadSave().tokenBalance;
}

export function adminSendToken(amount: number, targetAddress?: string) {
  if (targetAddress) {
    addPlayerBalance(targetAddress, amount);
  } else {
    const save = loadSave();
    save.tokenBalance = (save.tokenBalance || 0) + amount;
    saveState(save);
  }
  addTransaction({ type: "income", category: "admin_mint", amount: String(amount), description: `Admin mint ${amount} 0BOMB`, ownerAddress: targetAddress });
  addInboxMessage({ type: "system", title: "💰 Token Received", body: `Admin minted ${amount} 0BOMB to your wallet.`, targetAddress });
}

export function adminTransferItem(itemId: string, targetAddress: string) {
  const save = loadSave();
  const item = save.inventory.find(i => i.id === itemId);
  if (!item) return false;
  item.owner = targetAddress;
  addInboxMessage({ type: "system", title: "🎒 Item Received", body: `Admin sent you "${item.name}" (${item.rarity} ${item.slot}).`, targetAddress });
  saveState(save);
  return true;
}

// === Faucet System ===

const FAUCET_DELAY = 24 * 60 * 60 * 1000; // 24h cooldown
const FAUCET_AMOUNT = 200;

export function getFaucetCooldown(address: string | null): number {
  if (!address) return 0;
  const save = loadSave();
  const last = save.faucetClaims?.[address.toLowerCase()] || 0;
  const elapsed = Date.now() - last;
  return Math.max(0, FAUCET_DELAY - elapsed);
}

export function claimFaucet(address: string | null): { ok: boolean; message: string } {
  if (!address) return { ok: false, message: "Connect your wallet first." };
  const cooldown = getFaucetCooldown(address);
  if (cooldown > 0) {
    const hours = Math.ceil(cooldown / 3600000);
    return { ok: false, message: `Cooldown active. Come back in ${hours}h.` };
  }
  const save = loadSave();
  const addr = address.toLowerCase();
  if (!save.faucetClaims) save.faucetClaims = {};
  save.faucetClaims[addr] = Date.now();
  saveState(save);
  addPlayerBalance(address, FAUCET_AMOUNT);
  addTransaction({ type: "income", category: "reward", amount: String(FAUCET_AMOUNT), description: `Faucet claim — ${FAUCET_AMOUNT} free 0BOMB`, ownerAddress: addr });
  return { ok: true, message: `Claimed ${FAUCET_AMOUNT} free 0BOMB!` };
}

// === Voucher System ===

const VOUCHER_MAX: Record<"hero" | "equipment" | "cosmetic", number> = {
  hero: VOUCHER_MAX_HERO,
  equipment: VOUCHER_MAX_EQUIPMENT,
  cosmetic: VOUCHER_MAX_COSMETIC,
};

const VOUCHER_COST: Record<"hero" | "equipment" | "cosmetic", string> = {
  hero: HERO_HATCH_COST,
  equipment: LOOT_MINT_COST,
  cosmetic: COSMETIC_MINT_COST,
};

export function getVoucherUsage(address: string | null, type: "hero" | "equipment" | "cosmetic"): number {
  if (!address) return 0;
  const save = loadSave();
  const usage = save.voucherUsage?.[address.toLowerCase()];
  if (!usage) return 0;
  return usage[type] || 0;
}

export function getVoucherRemaining(address: string | null, type: "hero" | "equipment" | "cosmetic"): number {
  const max = VOUCHER_MAX[type];
  const used = getVoucherUsage(address, type);
  return Math.max(0, max - used);
}

export function useVoucher(address: string | null, type: "hero" | "equipment" | "cosmetic"): boolean {
  if (!address) return false;
  const remaining = getVoucherRemaining(address, type);
  if (remaining <= 0) return false;
  const save = loadSave();
  const addr = address.toLowerCase();
  if (!save.voucherUsage) save.voucherUsage = {};
  if (!save.voucherUsage[addr]) save.voucherUsage[addr] = { hero: 0, equipment: 0, cosmetic: 0 };
  save.voucherUsage[addr][type]++;
  saveState(save);
  addTransaction({
    type: "expense",
    category: type === "hero" ? "hatch" : type === "equipment" ? "mint_loot" : "mint_cosmetic",
    amount: "0",
    description: `Free mint (${type}) — voucher ${getVoucherUsage(address, type) + 1}/${VOUCHER_MAX[type]}`,
    ownerAddress: addr,
  });
  return true;
}

export const VOUCHER_SAVED_COST = VOUCHER_COST;

export function markSoulbound(itemId: string) {
  if (!itemId) return;
  const save = loadSave();
  if (!save.soulboundItemIds) save.soulboundItemIds = [];
  if (!save.soulboundItemIds.includes(itemId)) {
    save.soulboundItemIds.push(itemId);
    saveState(save);
  }
}

export function isItemSoulbound(itemId: string): boolean {
  if (!itemId) return false;
  const save = loadSave();
  return save.soulboundItemIds?.includes(itemId) ?? false;
}

export function adminResetVouchers(address: string | null) {
  if (!address) return;
  const save = loadSave();
  const addr = address.toLowerCase();
  if (save.voucherUsage) delete save.voucherUsage[addr];
  saveState(save);
}

// === Admin Functions ===

export function adminTransferCosmetic(itemId: string, targetAddress: string) {
  const save = loadSave();
  const item = save.cosmetics.find(c => c.id === itemId);
  if (!item) return false;
  item.owner = targetAddress;
  addInboxMessage({ type: "system", title: "✨ Cosmetic Received", body: `Admin sent you "${item.name}" (${item.rarity} ${item.type}).`, targetAddress });
  saveState(save);
  return true;
}

// === Ban / Freeze ===

export function getBannedAddresses(): string[] {
  return loadSave().bannedAddresses;
}

export function getFrozenAddresses(): string[] {
  return loadSave().frozenAddresses;
}

export function isAddressBanned(address: string): boolean {
  return loadSave().bannedAddresses.some(a => a.toLowerCase() === address.toLowerCase());
}

export function isAddressFrozen(address: string): boolean {
  return loadSave().frozenAddresses.some(a => a.toLowerCase() === address.toLowerCase());
}

export function adminBanPlayer(address: string) {
  const save = loadSave();
  const addr = address.toLowerCase();
  if (!save.bannedAddresses.some(a => a.toLowerCase() === addr)) {
    save.bannedAddresses.push(address);
  }
  // Remove all player data
  save.heroes = save.heroes.filter(h => h.owner_address?.toLowerCase() !== addr);
  save.inventory = save.inventory.filter(i => i.owner?.toLowerCase() !== addr);
  save.cosmetics = save.cosmetics.filter(c => c.owner?.toLowerCase() !== addr);
  save.listings = save.listings.filter(l => l.seller.toLowerCase() !== addr);
  // Remove from frozen if present
  save.frozenAddresses = save.frozenAddresses.filter(a => a.toLowerCase() !== addr);
  addAuditLog("ban", address, `Player banned and data wiped`);
  saveState(save);
}

export function adminUnbanPlayer(address: string) {
  const save = loadSave();
  save.bannedAddresses = save.bannedAddresses.filter(a => a.toLowerCase() !== address.toLowerCase());
  addAuditLog("unban", address, `Player unbanned`);
  saveState(save);
}

export function adminFreezePlayer(address: string) {
  const save = loadSave();
  const addr = address.toLowerCase();
  if (!save.frozenAddresses.some(a => a.toLowerCase() === addr)) {
    save.frozenAddresses.push(address);
  }
  addInboxMessage({ type: "system", title: "❄️ Account Frozen", body: "Your account has been frozen by admin. You cannot play, trade, or claim rewards until unfrozen.", targetAddress: address });
  addAuditLog("freeze", address, "Player frozen");
  saveState(save);
}

export function adminUnfreezePlayer(address: string) {
  const save = loadSave();
  save.frozenAddresses = save.frozenAddresses.filter(a => a.toLowerCase() !== address.toLowerCase());
  addInboxMessage({ type: "system", title: "✅ Account Unfrozen", body: "Your account has been unfrozen. You may resume all activities.", targetAddress: address });
  addAuditLog("unfreeze", address, "Player unfrozen");
  saveState(save);
}

// === Audit Log ===

export function addAuditLog(action: string, target: string, detail: string) {
  const save = loadSave();
  const entry: AuditEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    action,
    target,
    detail,
    admin: "admin",
    created_at: new Date().toISOString(),
  };
  save.auditLog.unshift(entry);
  if (save.auditLog.length > 500) save.auditLog = save.auditLog.slice(0, 500);
  saveState(save);
  return entry;
}

export function getAuditLog(): AuditEntry[] {
  return loadSave().auditLog;
}

// === Item Blacklist ===

export function getItemBlacklist(): string[] {
  return loadSave().itemBlacklist;
}

export function isItemBlacklisted(itemId: string): boolean {
  return loadSave().itemBlacklist.some(id => id === itemId);
}

export function adminBlacklistItem(itemId: string) {
  const save = loadSave();
  if (!save.itemBlacklist.some(id => id === itemId)) {
    save.itemBlacklist.push(itemId);
    addAuditLog("blacklist_item", itemId, "Item added to blacklist");
  }
  saveState(save);
}

export function adminUnblacklistItem(itemId: string) {
  const save = loadSave();
  save.itemBlacklist = save.itemBlacklist.filter(id => id !== itemId);
  addAuditLog("unblacklist_item", itemId, "Item removed from blacklist");
  saveState(save);
}

// === Broadcast (Mass Announcement) ===

export function adminBroadcast(title: string, body: string) {
  addInboxMessage({ type: "system", title: title || "📢 Announcement", body });
  addAuditLog("broadcast", "all", `Broadcast: ${title} - ${body.slice(0, 60)}`);
}

// === Global Reset ===

export function adminGlobalReset() {
  const save = loadSave();
  // Preserve admin config + audit log
  const adminConfig = { ...save.adminConfig };
  const auditLog = [...save.auditLog];
  const banned = [...save.bannedAddresses];
  const frozen = [...save.frozenAddresses];
  const blacklist = [...save.itemBlacklist];
  save.heroes = [];
  save.inventory = [];
  save.cosmetics = [];
  save.listings = [];
  save.energyPotions = 0;
  save.tokenBalance = 0;
  save.tokenBalances = {};
  save.usernames = {};
  save.potionCounts = {};
  save.inbox = [];
  save.transactions = [];
  save.username = "";
  save.activeMap = null;
  save.adminConfig = adminConfig;
  save.auditLog = auditLog;
  save.bannedAddresses = banned;
  save.frozenAddresses = frozen;
  save.itemBlacklist = blacklist;
  addAuditLog("global_reset", "all", "All player data reset");
  saveState(save);
}

// === Export Player Data ===

export function getExportData(): string {
  return JSON.stringify(loadSave(), null, 2);
}

// === Global Leaderboard ===

export interface LeaderboardEntry {
  rank: number;
  address: string;
  username: string;
  kills: number;
  score: number;
  heroes: number;
  legendaryCount: number;
  topHeroName: string;
}

export function getGlobalLeaderboard(): LeaderboardEntry[] {
  const save = loadSave();
  const heroes = save.heroes;

  const byOwner: Record<string, { heroes: Hero[]; kills: number; score: number; legendaryCount: number }> = {};
  for (const h of heroes) {
    const addr = h.owner_address?.toLowerCase() || "unknown";
    if (!byOwner[addr]) byOwner[addr] = { heroes: [], kills: 0, score: 0, legendaryCount: 0 };
    byOwner[addr].heroes.push(h);
    byOwner[addr].kills += (h.memories || []).filter((m: Memory) => m.event === "Killed Alien").length;
    byOwner[addr].score += h.level * 100 + (h.memories || []).length * 50;
    if (h.is_legendary) byOwner[addr].legendaryCount++;
  }

  const entries = Object.entries(byOwner)
    .filter(([addr]) => addr !== "unknown")
    .map(([addr, data]) => {
      const best = [...data.heroes].sort((a, b) => b.level - a.level)[0];
      const names = save.usernames || {};
      return {
        address: addr,
        username: names[addr] || addr.slice(0, 6) + "..." + addr.slice(-4),
        kills: data.kills,
        score: data.score,
        heroes: data.heroes.length,
        legendaryCount: data.legendaryCount,
        topHeroName: best?.name || "Unknown",
      };
    })
    .sort((a, b) => b.kills - a.kills || b.score - a.score);

  return entries.map((e, i) => ({ ...e, rank: i + 1 }));
}

// ─── Map Logic / Auto Farm / Reward Systems ─────────────────

export function getEnergyCostForDifficulty(difficulty: string): number {
  const d = difficulty as Difficulty;
  return ENERGY_COST_BY_DIFFICULTY[d] ?? 10;
}

export function getAutoFarmEligibleHeroes(address: string): Hero[] {
  const save = loadSave();
  const addr = address.toLowerCase();
  return save.heroes.filter(h =>
    h.owner_address?.toLowerCase() === addr &&
    h.auto_deploy &&
    h.energy >= getEnergyCostForDifficulty("Easy") &&
    h.is_alive
  );
}

export function autoBuildTeam(address: string, difficulty: string, count: number = 5): string[] {
  const save = loadSave();
  const addr = address.toLowerCase();
  const energyCost = getEnergyCostForDifficulty(difficulty);

  const candidates = save.heroes
    .filter(h =>
      h.owner_address?.toLowerCase() === addr &&
      h.auto_deploy &&
      h.energy >= energyCost &&
      h.is_alive
    )
    .sort((a, b) => {
      const aScore = a.farming_stats.efficiency * 2 + a.energy + a.stats.intelligence;
      const bScore = b.farming_stats.efficiency * 2 + b.energy + b.stats.intelligence;
      return bScore - aScore;
    });

  return candidates.slice(0, count).map(h => h.id);
}

export function consumeDeployEnergy(heroId: string, difficulty: string): boolean {
  const hero = getHero(heroId);
  if (!hero) return false;
  const cost = getEnergyCostForDifficulty(difficulty);
  if (hero.energy < cost) return false;
  updateHero(heroId, { energy: hero.energy - cost });
  return true;
}

export function calculateClearTimeBonus(elapsedSeconds: number): number {
  const { optimalSeconds, maxBonus, falloffPerSecond } = CLEAR_TIME_BONUS_CONFIG;
  if (elapsedSeconds <= optimalSeconds) return maxBonus;
  const penalty = (elapsedSeconds - optimalSeconds) * falloffPerSecond;
  return Math.max(0, maxBonus - penalty);
}

export function generateRewardChest(
  mapId: string,
  difficulty: string,
  heroes: Hero[],
  elapsedSeconds: number,
  originalDestructibleCount: number,
  destroyedCount: number,
  kills: number
): RewardChest {
  const diff = difficulty as Difficulty;
  const dc = DIFFICULTY_CONFIG[diff];
  const clearTimeBonus = calculateClearTimeBonus(elapsedSeconds);
  const avgLuck = heroes.length > 0
    ? heroes.reduce((s, h) => s + h.stats.luck, 0) / heroes.length
    : 50;
  const avgTreasureHunter = heroes.length > 0
    ? heroes.reduce((s, h) => s + h.farming_stats.treasure_hunter, 0) / heroes.length
    : 10;
  const luckMod = 1 + avgLuck / 200;
  const thMod = 1 + avgTreasureHunter / 200;
  const overallMod = luckMod * thMod * clearTimeBonus * (dc.xpMultiplier || 1);

  const items: RewardChestItem[] = [];

  // Equipment drops
  const eqChance = DROP_RATES.common * overallMod;
  if (Math.random() < eqChance) {
    const eq = generateEquipment(undefined, null);
    addToInventory(eq);
    items.push({ type: "equipment", name: eq.name, rarity: eq.rarity, quantity: 1 });
  }

  // Rare equipment
  const rareChance = DROP_RATES.rare * overallMod;
  if (Math.random() < rareChance) {
    const eq = generateEquipment(undefined, null, "Rare");
    addToInventory(eq);
    items.push({ type: "equipment", name: eq.name, rarity: eq.rarity, quantity: 1 });
  }

  // Legendary equipment
  const legChance = DROP_RATES.legendary * overallMod;
  if (Math.random() < legChance) {
    const eq = generateEquipment(undefined, null, "Legendary");
    addToInventory(eq);
    items.push({ type: "equipment", name: eq.name, rarity: eq.rarity, quantity: 1 });
  }

  // Cosmetic drops
  const cosChance = dc.cosmeticChance * overallMod;
  if (Math.random() < cosChance) {
    const cos = generateCosmetic(undefined, null);
    addCosmetic(cos);
    items.push({ type: "cosmetic", name: cos.name, rarity: cos.rarity, quantity: 1 });
  }

  // Upgrade seeds
  const seedChance = DROP_RATES.upgradeSeed * overallMod;
  if (Math.random() < seedChance) {
    const seedType = UPGRADE_SEEDS[Math.floor(Math.random() * UPGRADE_SEEDS.length)];
    items.push({ type: "upgrade_seed", name: seedType, quantity: 1 });
  }

  // Fragment rewards
  const baseFrags = dc.tokenMin + Math.floor(Math.random() * (dc.tokenMax - dc.tokenMin + 1));
  const fragBonus = Math.floor(kills * 0.5 * clearTimeBonus);
  const totalFrags = Math.floor((baseFrags + fragBonus) * overallMod);
  items.push({ type: "fragment", quantity: totalFrags });

  // XP
  const baseXP = destroyedCount * 10 + kills * 50;
  const xp = Math.floor(baseXP * overallMod);

  return {
    mapId,
    difficulty: diff,
    clearTimeSeconds: elapsedSeconds,
    clearTimeBonus,
    items,
    fragments: totalFrags,
    xp,
    claimed: false,
  };
}

export function claimRewardChest(chest: RewardChest, address: string): boolean {
  if (chest.claimed) return false;
  chest.claimed = true;
  addFragments(address, chest.fragments);
  return true;
}

export function autoRedeploy(address: string, difficulty: string, gameStateCreator: (heroes: Hero[], diff?: string) => any): any | null {
  const team = autoBuildTeam(address, difficulty);
  if (team.length === 0) return null;

  // Consume energy for each selected hero
  for (const id of team) {
    consumeDeployEnergy(id, difficulty);
  }

  const heroes = team.map(id => getHero(id)).filter(Boolean) as Hero[];
  if (heroes.length === 0) return null;

  return gameStateCreator(heroes, difficulty);
}

export function toggleAutoDeploy(heroId: string): boolean {
  const hero = getHero(heroId);
  if (!hero) return false;
  updateHero(heroId, { auto_deploy: !hero.auto_deploy });
  return true;
}
