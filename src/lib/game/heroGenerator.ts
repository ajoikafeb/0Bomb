import { HERO_CLASSES, HERO_RARITIES, ENERGY_RANGES, PERSONALITY_TRAITS, INTELLIGENCE_TYPES } from "./constants";
import type { HeroClass, HeroRarity } from "./constants";
import type { Hero } from "./types";
import { HERO_RARITY, rollRarity } from "./dropRates";

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const HERO_NAMES = [
  "Nova", "Orion", "Lyra", "Atlas", "Vega", "Rigel", "Phoenix", "Astra",
  "Zephyr", "Luna", "Sol", "Nexus", "Echo", "Pixel", "Byte", "Flux",
  "Argo", "Helix", "Nebula", "Quasar", "Titan", "Umbra", "Volt", "Warp",
];

export function generateHero(ownerAddress: string, generation: number = 1): Hero {
  const heroClass = pick(HERO_CLASSES);
  const rarity: HeroRarity = pickRarity();
  const [minE, maxE] = ENERGY_RANGES[rarity];
  const maxEnergy = rand(minE, maxE);

  const personality: Record<string, number> = {};
  for (const trait of PERSONALITY_TRAITS) {
    personality[trait.toLowerCase()] = rand(0, 100);
  }

  const intelligence: Record<string, number> = {};
  for (const intel of INTELLIGENCE_TYPES) {
    const key = intel.toLowerCase().replace(/\s+/g, "_");
    intelligence[key] = rand(1, 30);
  }

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
    personality,
    intelligence,
    traits: [],
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
  };
}

function pickRarity(): HeroRarity {
  return rollRarity(HERO_RARITY);
}
