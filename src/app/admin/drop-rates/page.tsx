"use client";

import { useState } from "react";
import { getAdminConfig, updateAdminConfig } from "@/lib/game/GameStateManager";
import { GlassCard, Badge } from "@/components/admin/StatCard";

const DIFFICULTIES = ["Easy", "Advanced", "Nightmare"] as const;

const DEFAULT_DROP_RATES = {
  Easy: { Common: 60, Rare: 25, Epic: 10, Legendary: 4, Mythic: 1 },
  Advanced: { Common: 40, Rare: 30, Epic: 20, Legendary: 8, Mythic: 2 },
  Nightmare: { Common: 25, Rare: 30, Epic: 25, Legendary: 15, Mythic: 5 },
};

export default function AdminDropRates() {
  const [rates, setRates] = useState(DEFAULT_DROP_RATES);

  const updateRate = (diff: typeof DIFFICULTIES[number], rarity: string, val: number) => {
    setRates(prev => ({
      ...prev,
      [diff]: { ...prev[diff], [rarity]: Math.max(0, Math.min(100, val)) },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Drop Rate Manager</h1>
        <Badge color="green">Live</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {DIFFICULTIES.map(diff => (
          <GlassCard key={diff} title={`${diff} Drop Rates`}>
            <div className="space-y-3">
              {Object.entries(rates[diff]).map(([rarity, pct]) => (
                <div key={rarity}>
                  <div className="flex items-center justify-between mb-1">
                    <Badge color={
                      rarity === "Legendary" ? "yellow" : rarity === "Epic" ? "purple" :
                      rarity === "Rare" ? "blue" : rarity === "Mythic" ? "orange" : "cyan"
                    }>{rarity}</Badge>
                    <span className="text-xs font-mono text-cyan-400">{pct}%</span>
                  </div>
                  <input type="range" min={0} max={100} step={1} value={pct}
                    onChange={e => updateRate(diff, rarity, parseInt(e.target.value))}
                    className="w-full accent-cyan-500 h-1" />
                </div>
              ))}
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard title="💡 Notes">
        <ul className="text-[10px] text-gray-500 space-y-1 list-disc list-inside">
          <li>Drop rates are applied per-loot-roll in-game</li>
          <li>Rates do not need to total 100% — remaining % = no drop</li>
          <li>Global multipliers in Economy panel stack on top</li>
          <li>Live update — no restart required</li>
        </ul>
      </GlassCard>
    </div>
  );
}
