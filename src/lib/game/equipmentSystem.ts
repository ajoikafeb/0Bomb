import { EQUIPMENT_SLOTS } from "./constants";
import { EQUIPMENT_RARITY, rollRarity } from "./dropRates";

export type EquipmentSlot = typeof EQUIPMENT_SLOTS[number];
export type EquipmentRarity = "Common" | "Rare" | "Epic" | "Legendary";

export interface Equipment {
  id: string;
  name: string;
  slot: EquipmentSlot;
  rarity: EquipmentRarity;
  stats: Record<string, number>;
  owner: string | null;
}

const EQUIPMENT_NAMES: Record<EquipmentSlot, string[]> = {
  "Bomb Core": ["Fusion Core", "Plasma Cell", "Quantum Bomb", "Void Capacitor", "Nova Engine"],
  "Engine": ["Ion Thruster", "Warp Drive", "Photon Booster", "Graviton Engine", "Surge Motor"],
  "Armor": ["Titan Shell", "Phase Shield", "Cryo Armor", "Nanite Mesh", "Void Carapace"],
  "Memory Chip": ["Neural Link", "Synapse Booster", "Quantum Memory", "Cortex Chip", "Mind Core"],
  "Scanner": ["Radar Array", "Optic Lens", "Sonic Imager", "Thermal Sight", "Quantum Eye"],
  "Utility Device": ["Repair Bot", "Energy Cell", "Shield Gen", "Medi-Node", "Cloak Field"],
};

const RARITY_MULTIPLIER: Record<EquipmentRarity, number> = {
  Common: 1,
  Rare: 1.5,
  Epic: 2.5,
  Legendary: 4,
};

const RARITY_COLORS: Record<EquipmentRarity, string> = {
  Common: "#9ca3af",
  Rare: "#3b82f6",
  Epic: "#a855f7",
  Legendary: "#f59e0b",
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRarity(): EquipmentRarity {
  return rollRarity(EQUIPMENT_RARITY);
}

const SLOT_STATS: Record<EquipmentSlot, string[]> = {
  "Bomb Core": ["bomb_damage", "bomb_range"],
  "Engine": ["speed", "max_energy"],
  "Armor": ["hp", "defense"],
  "Memory Chip": ["intel_gain", "memory_cap"],
  "Scanner": ["loot_range", "hazard_detect"],
  "Utility Device": ["energy_regen", "luck"],
};

export function generateEquipment(slot?: EquipmentSlot, owner: string | null = null, rarity?: EquipmentRarity): Equipment {
  const equipSlot = slot || pick([...EQUIPMENT_SLOTS]);
  const r = rarity || pickRarity();
  const mult = RARITY_MULTIPLIER[r];
  const name = pick(EQUIPMENT_NAMES[equipSlot]);

  const stats: Record<string, number> = {};
  const statNames = SLOT_STATS[equipSlot];
  for (const stat of statNames) {
    stats[stat] = Math.round(rand(5, 20) * mult);
  }

  return {
    id: `equip_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: `${r === "Legendary" ? "☆ " : ""}${name}`,
    slot: equipSlot,
    rarity: r,
    stats,
    owner,
  };
}

export function generateRandomEquipment(owner: string | null = null): Equipment {
  return generateEquipment(undefined, owner);
}

export function getRarityColor(rarity: EquipmentRarity): string {
  return RARITY_COLORS[rarity];
}

export function getRarityMultiplier(rarity: EquipmentRarity): number {
  return RARITY_MULTIPLIER[rarity];
}

export function formatStatLabel(stat: string): string {
  const labels: Record<string, string> = {
    bomb_damage: "Bomb DMG",
    bomb_range: "Bomb Range",
    speed: "Speed",
    max_energy: "Max Energy",
    hp: "HP",
    defense: "Defense",
    intel_gain: "Intel Gain",
    memory_cap: "Memory Cap",
    loot_range: "Loot Range",
    hazard_detect: "Hazard Detect",
    energy_regen: "Energy Regen",
    luck: "Luck",
  };
  return labels[stat] || stat;
}
