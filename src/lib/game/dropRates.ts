export interface RarityTable<T extends string> {
  tiers: readonly T[];
  rates: Record<T, number>;
}

export function rollRarity<T extends string>(table: RarityTable<T>): T {
  let rareLootRate = 1;
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem("0gbomber_state") : null;
    if (raw) {
      const data = JSON.parse(raw);
      rareLootRate = data.adminConfig?.rareLootDropRate ?? 1;
    }
  } catch {}

  const adjusted: Record<string, number> = {};
  for (const tier of table.tiers) {
    let rate = table.rates[tier];
    if (tier === table.tiers[0]) rate = rate / Math.max(0.01, rareLootRate);
    adjusted[tier] = rate;
  }
  const total = Object.values(adjusted).reduce((a, b) => a + b, 0);
  const r = Math.random();
  let cumulative = 0;
  for (const tier of table.tiers) {
    cumulative += adjusted[tier] / total;
    if (r < cumulative) return tier;
  }
  return table.tiers[table.tiers.length - 1];
}

// ─── Equipment rarity ────────────────────────────────────────
export const EQUIPMENT_RARITY: RarityTable<"Common" | "Rare" | "Epic" | "Legendary"> = {
  tiers: ["Common", "Rare", "Epic", "Legendary"] as const,
  rates: {
    Common: 0.50,
    Rare: 0.30,
    Epic: 0.15,
    Legendary: 0.05,
  },
};

// ─── Cosmetic rarity ─────────────────────────────────────────
export const COSMETIC_RARITY: RarityTable<"Common" | "Rare" | "Epic" | "Legendary" | "Mythic"> = {
  tiers: ["Common", "Rare", "Epic", "Legendary", "Mythic"] as const,
  rates: {
    Common: 0.40,
    Rare: 0.30,
    Epic: 0.18,
    Legendary: 0.09,
    Mythic: 0.03,
  },
};

// ─── Hero rarity ─────────────────────────────────────────────
export const HERO_RARITY: RarityTable<"Common" | "Rare" | "Epic" | "Legendary" | "Mythic" | "Genesis"> = {
  tiers: ["Common", "Rare", "Epic", "Legendary", "Mythic", "Genesis"] as const,
  rates: {
    Common: 0.40,
    Rare: 0.30,
    Epic: 0.15,
    Legendary: 0.09,
    Mythic: 0.05,
    Genesis: 0.01,
  },
};

// ─── In-battle drop rates ────────────────────────────────────
export const BATTLE_DROPS = {
  /** Chance per destructible block destroyed to drop a power-up pickup */
  powerUpFromBlock: 0.50,
  /** Chance per enemy killed to drop an energy potion */
  potionFromKill: 0.30,
  /** Power-up types that can drop from blocks */
  powerUpTypes: ["power", "range", "hp"] as const,
};
