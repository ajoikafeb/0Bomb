"use client";

import { useRef, useEffect } from "react";
import type { Hero } from "@/lib/game/types";
import type { GameState } from "@/lib/game/AIDecisionEngine";
import { SpriteEngineer, SpriteScout, SpriteMarine, SpriteScientist, SpriteMedic, SpriteCommander, SpriteMiner } from "@/components/pixel-art/characters";

const HERO_SPRITES: Record<string, React.FC<{ size?: number; className?: string }>> = {
  Engineer: SpriteEngineer, Scout: SpriteScout, Marine: SpriteMarine,
  Scientist: SpriteScientist, Medic: SpriteMedic, Commander: SpriteCommander, Miner: SpriteMiner,
};

export function RightPanel({
  isBattling, gameState, logs, heroes, battleResult, hasSavedBattle,
  selectedIds, energyCost, canDeploy,
  onStartBattle, onResumeBattle, onDiscardBattle,
}: {
  isBattling: boolean;
  gameState: GameState | null;
  logs: string[];
  heroes: Hero[];
  battleResult: any;
  hasSavedBattle: boolean;
  selectedIds: string[];
  energyCost: number;
  canDeploy: boolean;
  onStartBattle: (ids?: string[]) => void;
  onResumeBattle: () => void;
  onDiscardBattle: () => void;
}) {
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = 0;
  }, [logs]);

  return (
    <div className="w-[320px] shrink-0 border-l border-gray-800/50 bg-dark-2/30 flex flex-col">
      {/* Panel Header */}
      <div className="text-[9px] font-bold text-cyan-400/80 uppercase tracking-wider px-3 py-1.5 border-b border-gray-800/50 shrink-0">
        Battle Feed
      </div>

      {/* Live Battle Content */}
      {isBattling && gameState ? (
        <>
          {/* Loot Section */}
          <div className="shrink-0 border-b border-gray-800/50">
            <div className="text-[10px] font-bold text-yellow-400 px-3 py-1 border-b border-gray-800/50 flex items-center gap-1">
              🎒 Loot
              {gameState.loot.length > 0 && <span className="text-[9px] text-yellow-400 font-normal">({gameState.loot.length} on map)</span>}
            </div>
            <div className="px-3 py-1.5 space-y-0.5 max-h-[100px] overflow-y-auto">
              {gameState.heroes.filter(h => h.potionsFound > 0).length === 0 && gameState.loot.length === 0 ? (
                <p className="text-[10px] text-gray-600 text-center py-1">No items yet</p>
              ) : (
                <>
                  {gameState.heroes.filter(h => h.potionsFound > 0).map(h => (
                    <div key={h.id} className="flex items-center justify-between text-[10px] text-gray-300">
                      <span className="truncate max-w-[140px]">{h.name}</span>
                      <span className="text-green-400">🧪×{h.potionsFound}</span>
                    </div>
                  ))}
                  {gameState.loot.length > 0 && (
                    <div className="text-[10px] text-gray-500 border-t border-gray-800/30 pt-0.5 mt-0.5">
                      {gameState.loot.length} item{gameState.loot.length > 1 ? "s" : ""} on map
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Hero Status Section */}
          <div className="flex-1 overflow-y-auto border-b border-gray-800/50">
            <div className="text-[10px] font-bold text-cyan-400 px-3 py-1 border-b border-gray-800/50 sticky top-0 bg-dark-2/90">
              ⚔ Hero Status
              <span className="text-gray-500 font-normal ml-1">({gameState.heroes.filter(h => h.alive).length}/{gameState.heroes.length})</span>
            </div>
            <div className="px-3 py-1.5 space-y-1.5">
              {gameState.heroes.length === 0 ? (
                <p className="text-[10px] text-gray-600 text-center py-2">No heroes deployed</p>
              ) : (
                gameState.heroes.map(h => {
                  const alive = h.alive;
                  const hpPct = Math.max(0, h.hp / Math.max(1, h.maxHp));
                  const Sprite = HERO_SPRITES[h.class];
                  return (
                    <div key={h.id} className={`rounded-lg border ${alive ? "border-gray-800/50 bg-black/30" : "border-red-900/30 bg-red-900/10"} text-[10px]`}>
                      <div className="flex items-center justify-between px-2 py-1">
                        <div className="flex items-center gap-1.5">
                          {Sprite ? <Sprite size={20} /> : null}
                          <div>
                            <span className="text-white font-bold text-[10px]">{h.name}</span>
                            <span className="text-gray-500 text-[8px] ml-1">{h.class}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={alive ? "text-green-400" : "text-red-400"}>{alive ? `♥${h.hp}/${h.maxHp}` : "💀 KO"}</span>
                        </div>
                      </div>
                      {alive && (
                        <div className="px-2 pb-1.5 space-y-1">
                          <div className="h-1 bg-gray-700 rounded overflow-hidden">
                            <div className={`h-full rounded ${hpPct > 0.5 ? "bg-green-500" : hpPct > 0.25 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${hpPct * 100}%` }} />
                          </div>
                          <div className="flex items-center justify-between text-[8px]">
                            <span className="text-red-400">⚔ {h.power}</span>
                            <span className="text-yellow-400">⚡{h.energy}/{h.max_energy}</span>
                            <span className={`text-[7px] ${h.energy > 10 ? "text-green-400" : "text-red-400"}`}>
                              {h.energy > 10 ? "Active" : "Exhausted"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      ) : null}

      {/* Battle Feed / Log Section (always visible) */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="text-[10px] font-bold text-gray-400 px-3 py-1 border-b border-gray-800/50 shrink-0 flex items-center gap-1">
          ⚡ Feed <span className="text-gray-600 font-normal">({logs.length})</span>
        </div>
        <div ref={feedRef} className="flex-1 overflow-y-auto px-3 py-1.5 space-y-0.5">
          {(() => {
            const importantLogs = logs.filter(m => {
              const lower = m.toLowerCase();
              if (lower.includes("block") && !lower.includes("kill") && !lower.includes("rare") && !lower.includes("found")) return false;
              if (lower.includes("moved") || lower.includes("walked")) return false;
              if (lower.includes("placed") || lower.includes("tick")) return false;
              if (lower.includes("path") && lower.includes("find")) return false;
              return true;
            });
            if (importantLogs.length === 0) {
              return <p className="text-[10px] text-gray-600 text-center py-4">Waiting for battle...</p>;
            }
            return importantLogs.slice(0, 40).map((msg, i) => {
              const lower = msg.toLowerCase();
              let color = "text-gray-500";
              if (lower.includes("level") || lower.includes("up")) color = "text-blue-400";
              else if (lower.includes("killed") || lower.includes("slain")) color = "text-red-400";
              else if (lower.includes("equipment") || lower.includes("found") || lower.includes("loot")) color = "text-green-400";
              else if (lower.includes("legendary") || lower.includes("mythic") || lower.includes("genesis") || lower.includes("rare")) color = "text-yellow-400";
              else if (lower.includes("epic")) color = "text-purple-400";
              else if (lower.includes("death") || lower.includes("died") || lower.includes("defeated")) color = "text-red-500";
              else if (lower.includes("cleared") || lower.includes("victory")) color = "text-cyan-400";
              return (
                <div key={i} className={`text-[10px] font-mono leading-snug ${color}`}>
                  {msg.length > 80 ? msg.slice(0, 80) + "..." : msg}
                </div>
              );
            });
          })()}
        </div>
      </div>

      {/* Bottom Action */}
      {!isBattling && !battleResult && !hasSavedBattle && selectedIds.length > 0 && (
        <div className="px-3 py-1.5 border-t border-gray-800/50">
          <button onClick={() => onStartBattle()} disabled={!canDeploy}
            className="w-full py-1.5 text-[10px] font-bold rounded bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white"
          >⚔ Deploy {energyCost}⚡</button>
        </div>
      )}

      {!isBattling && hasSavedBattle && (
        <div className="px-3 py-1.5 border-t border-gray-800/50 flex gap-1">
          <button onClick={onResumeBattle} className="flex-1 py-1 text-[10px] font-bold bg-green-600/30 text-green-300 rounded border border-green-500/30 hover:bg-green-600/50">▶ Resume</button>
          <button onClick={onDiscardBattle} className="flex-1 py-1 text-[10px] font-bold bg-red-600/30 text-red-300 rounded border border-red-500/30 hover:bg-red-600/50">✕ Discard</button>
        </div>
      )}
    </div>
  );
}
