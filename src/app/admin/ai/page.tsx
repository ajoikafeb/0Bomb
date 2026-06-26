"use client";

import { getHeroes } from "@/lib/game/GameStateManager";
import { GlassCard, Badge } from "@/components/admin/StatCard";
import type { Hero } from "@/lib/game/types";

export default function AdminAI() {
  const heroes = getHeroes();
  const alive = heroes.filter(h => h.is_alive);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">AI Control</h1>
        <Badge color="green">{alive.length} alive</Badge>
        <Badge color="cyan">{heroes.length} total</Badge>
      </div>

      <GlassCard title="Hero Status Overview">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-black/30 rounded-lg p-4 border border-white/[0.04]">
            <div className="text-[10px] font-mono text-gray-400 uppercase">Alive</div>
            <div className="text-2xl font-bold text-green-400">{alive.length}</div>
          </div>
          <div className="bg-black/30 rounded-lg p-4 border border-white/[0.04]">
            <div className="text-[10px] font-mono text-gray-400 uppercase">Dead</div>
            <div className="text-2xl font-bold text-red-400">{heroes.length - alive.length}</div>
          </div>
          <div className="bg-black/30 rounded-lg p-4 border border-white/[0.04]">
            <div className="text-[10px] font-mono text-gray-400 uppercase">Avg Level</div>
            <div className="text-2xl font-bold text-cyan-400">
              {heroes.length > 0 ? (heroes.reduce((s, h) => s + h.level, 0) / heroes.length).toFixed(1) : "0"}
            </div>
          </div>
          <div className="bg-black/30 rounded-lg p-4 border border-white/[0.04]">
            <div className="text-[10px] font-mono text-gray-400 uppercase">Total XP</div>
            <div className="text-2xl font-bold text-yellow-400">
              {heroes.reduce((s, h) => s + h.xp, 0).toLocaleString()}
            </div>
          </div>
        </div>
      </GlassCard>

      {alive.length > 0 && (
        <GlassCard title="Active Heroes (DB)">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-[9px] font-mono text-gray-500 uppercase py-2 px-2">Name</th>
                  <th className="text-[9px] font-mono text-gray-500 uppercase py-2 px-2">Class</th>
                  <th className="text-[9px] font-mono text-gray-500 uppercase py-2 px-2">Rarity</th>
                  <th className="text-[9px] font-mono text-gray-500 uppercase py-2 px-2">Level</th>
                  <th className="text-[9px] font-mono text-gray-500 uppercase py-2 px-2">Auto Deploy</th>
                  <th className="text-[9px] font-mono text-gray-500 uppercase py-2 px-2">Energy</th>
                </tr>
              </thead>
              <tbody>
                {alive.slice(0, 50).map(h => (
                  <tr key={h.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="py-2 px-2 text-xs font-mono text-cyan-300">{h.name}</td>
                    <td className="py-2 px-2 text-xs font-mono text-gray-400">{h.class}</td>
                    <td className="py-2 px-2">
                      <Badge color={
                        h.rarity === "Legendary" ? "yellow" : h.rarity === "Epic" ? "purple" :
                        h.rarity === "Rare" ? "blue" : "cyan"
                      }>{h.rarity}</Badge>
                    </td>
                    <td className="py-2 px-2 text-xs font-mono text-gray-400">{h.level}</td>
                    <td className="py-2 px-2 text-xs font-mono">
                      <Badge color={h.auto_deploy ? "green" : "gray"}>{h.auto_deploy ? "Yes" : "No"}</Badge>
                    </td>
                    <td className="py-2 px-2 text-xs font-mono text-gray-400">{h.energy}/{h.max_energy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
