"use client";

export type HeroTab = "overview" | "stats" | "ai-stats" | "farming" | "genetics" | "personality" | "traits" | "memories" | "equipment" | "cosmetics" | "legacy";

export interface HeroSummaryData {
  total: number;
  autoFarming: number;
  resting: number;
  recovering: number;
  dead: number;
  legendary: number;
  mythic: number;
  genesis: number;
  avgPower: number;
  avgLevel: number;
  totalPower: number;
}

export interface FilterState {
  search: string;
  rarity: string;
  classFilter: string;
  status: string;
  sort: "newest" | "oldest" | "level" | "power" | "rarity" | "name";
}
