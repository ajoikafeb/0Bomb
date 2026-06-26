"use client";

import type { BattleResult } from "./types";
import type { RewardChest } from "@/lib/game/types";
import type { Hero } from "@/lib/game/types";

export function BattleResultPanel({
  battleResult, elapsed, heroes, rewardChest, onClaimRewards,
}: {
  battleResult: BattleResult;
  elapsed: number;
  heroes: Hero[];
  rewardChest: RewardChest | null;
  onClaimRewards: () => void;
}) {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="bg-black/30 border border-gray-700 rounded-lg p-4 max-w-sm w-full animate-slide-up">
        <div className="text-center mb-3">
          <div className="text-4xl mb-2">{battleResult.bossKilled ? "🔥" : battleResult.allCleared ? "✨" : "💀"}</div>
          <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            {battleResult.bossKilled ? "Boss Slain!" : battleResult.allCleared ? "Victory!" : "Mission Complete"}
          </h2>
          <p className="text-[10px] text-gray-500 mt-1">{(elapsed / 1000).toFixed(1)}s • {battleResult.ticks} ticks</p>
        </div>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            { label: "Kills", value: battleResult.heroResults.reduce((s: number, r: any) => s + r.kills, 0), color: "text-cyan-400" },
            { label: "Score", value: battleResult.totalScore, color: "text-yellow-400" },
            { label: "Alive", value: `${battleResult.heroResults.filter((r: any) => r.survived).length}/${battleResult.heroResults.length}`, color: "text-green-400" },
            { label: "🧪", value: battleResult.heroResults.reduce((s: number, r: any) => s + r.potionsFound, 0), color: "text-purple-400" },
          ].map(stat => (
            <div key={stat.label} className="bg-black/40 border border-gray-700 rounded-lg p-2 text-center">
              <div className={`text-base font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-[9px] text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
        <div className="space-y-1 mb-3">
          {battleResult.heroResults.map((r: any) => (
            <div key={r.id} className={`flex items-center justify-between px-2 py-1 rounded-lg text-[10px] ${r.survived ? "bg-black/30" : "bg-red-900/20"}`}>
              <span className={r.survived ? "text-white font-medium" : "text-red-400"}>{heroes.find(h => h.id === r.id)?.name || r.id}</span>
              <span className="text-gray-400">K:{r.kills} 🧪:{r.potionsFound}</span>
            </div>
          ))}
        </div>
        {rewardChest && !rewardChest.claimed && (
          <div className="mb-3 p-2 bg-yellow-600/10 rounded-lg border border-yellow-500/20">
            <div className="text-[10px] font-bold text-yellow-400 mb-1">🎁 Reward Chest</div>
            <div className="text-[9px] text-gray-400 space-y-0.5">
              {rewardChest.items.map((item, i) => (
                <div key={i}>• {item.quantity}x {item.type}{item.name ? ` (${item.name})` : ""}</div>
              ))}
              <div className="text-yellow-400/70">Clear time bonus: +{Math.round(rewardChest.clearTimeBonus * 100)}%</div>
            </div>
          </div>
        )}
        <button onClick={onClaimRewards}
          className="w-full py-2 text-[11px] font-bold rounded bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white text-center"
        >{rewardChest && !rewardChest.claimed ? `🎁 Claim ${rewardChest.fragments}💎 + ${battleResult.heroResults.reduce((s: number, r: any) => s + r.potionsFound, 0)}🧪` : `Claim ${battleResult.heroResults.reduce((s: number, r: any) => s + r.potionsFound, 0)}🧪 + XP`}</button>
      </div>
    </div>
  );
}
