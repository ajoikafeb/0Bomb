"use client";

import Link from "next/link";

export function EmptyBattleState({
  energyCost, selectedCount, maxHeroes, canDeploy, hasSavedBattle, gameState,
  onStartBattle, onResumeBattle, onDiscardBattle,
}: {
  energyCost: number;
  selectedCount: number;
  maxHeroes: number;
  canDeploy: boolean;
  hasSavedBattle: boolean;
  gameState: any;
  onStartBattle: () => void;
  onResumeBattle: () => void;
  onDiscardBattle: () => void;
}) {
  if (hasSavedBattle) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-black/30 border border-gray-700 rounded-lg p-6 text-center">
          <div className="text-5xl mb-3">💾</div>
          <p className="text-sm text-cyan-400 font-bold mb-1">Battle Saved</p>
          <p className="text-[10px] text-gray-500 mb-4">Resume or discard from the squad panel</p>
          <div className="flex gap-2 justify-center">
            <button onClick={onResumeBattle} className="px-4 py-1.5 text-[11px] font-bold bg-green-600/30 text-green-300 rounded border border-green-500/30 hover:bg-green-600/50">▶ Resume</button>
            <button onClick={onDiscardBattle} className="px-4 py-1.5 text-[11px] font-bold bg-red-600/30 text-red-300 rounded border border-red-500/30 hover:bg-red-600/50">✕ Discard</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4 opacity-30">🗺️</div>
        <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">Deploy Your AI Squad</h2>
        <p className="text-[11px] text-gray-400 mb-4">Select heroes with enough energy and start autonomous farming. Each hero costs {energyCost}⚡ per run.</p>
        <div className="flex items-center justify-center gap-3 mb-3">
          <Link href="/heroes" className="px-3 py-1.5 text-[10px] font-bold border border-gray-700 text-gray-300 rounded hover:border-gray-500">Open Heroes</Link>
          {selectedCount > 0 && (
            <button onClick={onStartBattle} disabled={!canDeploy}
              className={`px-4 py-1.5 text-[11px] font-bold rounded bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white ${canDeploy ? "" : "opacity-40 cursor-not-allowed"}`}
            >⚔ Deploy {energyCost}⚡</button>
          )}
        </div>
        <p className="text-[9px] text-gray-600">{energyCost}⚡/hero • 30% 🧪 per kill</p>
      </div>
    </div>
  );
}
