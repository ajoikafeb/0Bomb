import { HERO_CLASSES, HERO_RARITIES, CLASS_CONFIG, RARITY_CONFIG, ENERGY_RANGES, PERSONALITY_TRAITS, CORE_STATS, AI_STATS, FARMING_STATS, GENETIC_STATS } from "./constants";
import type { HeroClass, HeroRarity, CoreStat, AIStat, FarmingStat, GeneticStat } from "./constants";
import type { Hero, HeroCoreStats, HeroAIStats, HeroFarmingStats, HeroGeneticStats, HeroPersonality } from "./types";
import { HERO_RARITY, rollRarity } from "./dropRates";

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const HERO_NAMES = [
  "Nova", "Orion", "Lyra", "Atlas", "Vega", "Rigel", "Phoenix", "Astra",
  "Zephyr", "Luna", "Sol", "Nexus", "Echo", "Pixel", "Byte", "Flux",
  "Argo", "Helix", "Nebula", "Quasar", "Titan", "Umbra", "Volt", "Warp",
  "Kai", "Raven", "Ashen", "Cinder", "Blitz", "Storm", "Frost", "Ember",
];

function generateCoreStats(heroClass: HeroClass, totalPoints: number): HeroCoreStats {
  const classBonus = CLASS_CONFIG[heroClass].bonus;
  const base = 10;
  const points = totalPoints - CORE_STATS.length * base;
  const values: Record<string, number> = {};
  const statOrder = shuffle([...CORE_STATS]);

  // Stat priorities: class bonus stats get more weight
  let remaining = points;
  const weights: Record<string, number> = {};
  for (const s of CORE_STATS) {
    weights[s] = classBonus[s] ? 2.0 : 1.0;
    if (classBonus[s]) weights[s] += classBonus[s]! / 15;
  }
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  for (let i = 0; i < statOrder.length; i++) {
    const s = statOrder[i];
    if (i === statOrder.length - 1) {
      values[s] = base + remaining;
    } else {
      const share = Math.floor((weights[s] / totalWeight) * points);
      const allotted = Math.min(share, remaining - (statOrder.length - i - 1) * 5);
      values[s] = base + Math.max(5, allotted);
      remaining -= values[s] - base;
    }
  }

  // Apply class bonus
  for (const [s, bonus] of Object.entries(classBonus)) {
    if (s in values) {
      values[s] = Math.min(100, values[s] + bonus);
    }
  }

  return {
    power: values.power ?? base,
    defense: values.defense ?? base,
    speed: values.speed ?? base,
    intelligence: values.intelligence ?? base,
    luck: values.luck ?? base,
    vitality: values.vitality ?? base,
  };
}

function generateAIStats(heroClass: HeroClass): HeroAIStats {
  const base = 20;
  const bonus = CLASS_CONFIG[heroClass].bonus;
  return {
    learning_rate: Math.min(100, base + rand(0, 30) + (bonus.learning_rate ?? 0)),
    adaptability: Math.min(100, base + rand(0, 30) + (bonus.adaptability ?? 0)),
    risk_awareness: Math.min(100, base + rand(0, 30) + (bonus.risk_awareness ?? 0)),
    exploration: Math.min(100, base + rand(0, 30) + (bonus.exploration ?? 0)),
    aggression: Math.min(100, base + rand(0, 30) + (bonus.aggression ?? 0)),
  };
}

function generateFarmingStats(heroClass: HeroClass): HeroFarmingStats {
  const base = 10;
  const bonus = CLASS_CONFIG[heroClass].bonus;
  return {
    mining: Math.min(100, base + rand(0, 20) + (bonus.mining ?? 0)),
    scavenging: Math.min(100, base + rand(0, 20) + (bonus.scavenging ?? 0)),
    treasure_hunter: Math.min(100, base + rand(0, 20) + (bonus.treasure_hunter ?? 0)),
    efficiency: Math.min(100, base + rand(0, 20) + (bonus.efficiency ?? 0)),
  };
}

function generateGenetics(): HeroGeneticStats {
  return {
    dna_quality: rand(30, 70),
    potential: rand(30, 70),
    mutation_chance: rand(5, 30),
    legacy_affinity: rand(10, 50),
  };
}

function generatePersonality(): HeroPersonality {
  return {
    brave: rand(0, 100),
    greedy: rand(0, 100),
    curious: rand(0, 100),
    loyal: rand(0, 100),
    lazy: rand(0, 100),
    tactical: rand(0, 100),
  };
}

export function generateHero(ownerAddress: string, generation: number = 1, dna_source?: { stats: HeroCoreStats; ai_stats: HeroAIStats; farming_stats: HeroFarmingStats; genetics: HeroGeneticStats; traits: string[]; personality: HeroPersonality }): Hero {
  const heroClass = pick(HERO_CLASSES);
  const rarity: HeroRarity = pickRarity();
  const rarityCfg = RARITY_CONFIG[rarity];
  const [minE, maxE] = rarityCfg.energyRange;
  const maxEnergy = rand(minE, maxE);

  // Generate stats
  const stats = dna_source ? inheritStats(dna_source.stats, rarityCfg.totalStatPoints) : generateCoreStats(heroClass, rarityCfg.totalStatPoints);
  const ai_stats = dna_source ? inheritAIStats(dna_source.ai_stats) : generateAIStats(heroClass);
  const farming_stats = dna_source ? inheritFarmingStats(dna_source.farming_stats) : generateFarmingStats(heroClass);
  const genetics = dna_source ? inheritGenetics(dna_source.genetics) : generateGenetics();
  const personality = dna_source ? inheritPersonality(dna_source.personality) : generatePersonality();

  // Apply potential cap
  const potential = genetics.potential;
  for (const key of CORE_STATS) {
    stats[key] = Math.min(stats[key], potential);
  }

  const inheritedTraits = dna_source ? dna_source.traits.filter(() => Math.random() < 0.4) : [];

  return {
    id: crypto.randomUUID(),
    owner_address: ownerAddress,
    name: pick(HERO_NAMES),
    class: heroClass,
    rarity,
    level: 1,
    xp: 0,
    energy: maxEnergy,
    max_energy: maxEnergy,
    generation,
    legacy_tier: null,
    is_alive: true,
    is_legendary: false,
    created_at: new Date().toISOString(),
    stats,
    ai_stats,
    farming_stats,
    genetics,
    personality,
    traits: inheritedTraits,
    memories: [],
    equipment: {
      "Bomb Core": null,
      Engine: null,
      Armor: null,
      "Memory Chip": null,
      Scanner: null,
      "Utility Device": null,
    },
    cosmetics: {
      Helmet: null,
      Suit: null,
      Trail: null,
      "Bomb Effect": null,
      Aura: null,
      Drone: null,
    },
    badges: [],
    auto_deploy: false,
    lastEnergyRegen: Date.now(),
    bloodline: dna_source ? {
      parent_id: "",
      parent_name: "Unknown",
      generation: generation - 1,
      inherited_stats: {},
      inherited_traits: inheritedTraits,
      dna_similarity: rand(40, 80),
    } : null,
    legacy_cores: [],
  };
}

function inheritStats(parent: HeroCoreStats, totalPoints: number): HeroCoreStats {
  const result: HeroCoreStats = {} as HeroCoreStats;
  for (const key of CORE_STATS) {
    const inheritPct = 0.3 + Math.random() * 0.4;
    const mutated = Math.random() < 0.1 ? rand(-10, 15) : 0;
    result[key] = Math.max(5, Math.min(100, Math.round(parent[key] * inheritPct + mutated)));
  }
  return result;
}

function inheritAIStats(parent: HeroAIStats): HeroAIStats {
  const result: HeroAIStats = {} as HeroAIStats;
  for (const key of AI_STATS) {
    const inheritPct = 0.3 + Math.random() * 0.4;
    const mutated = Math.random() < 0.1 ? rand(-10, 15) : 0;
    result[key] = Math.max(5, Math.min(100, Math.round(parent[key] * inheritPct + mutated)));
  }
  return result;
}

function inheritFarmingStats(parent: HeroFarmingStats): HeroFarmingStats {
  const result: HeroFarmingStats = {} as HeroFarmingStats;
  for (const key of FARMING_STATS) {
    const inheritPct = 0.3 + Math.random() * 0.4;
    const mutated = Math.random() < 0.1 ? rand(-10, 15) : 0;
    result[key] = Math.max(5, Math.min(100, Math.round(parent[key] * inheritPct + mutated)));
  }
  return result;
}

function inheritGenetics(parent: HeroGeneticStats): HeroGeneticStats {
  const result: HeroGeneticStats = {} as HeroGeneticStats;
  for (const key of GENETIC_STATS) {
    const inheritPct = 0.4 + Math.random() * 0.3;
    const mutated = Math.random() < 0.15 ? rand(-15, 20) : 0;
    result[key] = Math.max(5, Math.min(100, Math.round(parent[key] * inheritPct + mutated)));
  }
  return result;
}

function inheritPersonality(parent: HeroPersonality): HeroPersonality {
  const result: HeroPersonality = {} as HeroPersonality;
  for (const key of PERSONALITY_TRAITS) {
    const inheritPct = 0.3 + Math.random() * 0.4;
    const mutated = Math.random() < 0.15 ? rand(-20, 20) : 0;
    result[key] = Math.max(0, Math.min(100, Math.round(parent[key] * inheritPct + mutated)));
  }
  return result;
}

function pickRarity(): HeroRarity {
  return rollRarity(HERO_RARITY);
}
