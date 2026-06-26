"use client";

import Link from "next/link";
import type { Hero, MapProgression } from "@/lib/game/types";
import type { GameState } from "@/lib/game/AIDecisionEngine";
import { getEnergyCostForDifficulty } from "@/lib/game/GameStateManager";
import { SpriteEngineer, SpriteScout, SpriteMarine, SpriteScientist, SpriteMedic, SpriteCommander, SpriteMiner } from "@/components/pixel-art/characters";

const HERO_SPRITES: Record<string, React.FC<{ size?: number; className?: string }>> = {
  Engineer: SpriteEngineer, Scout: SpriteScout, Marine: SpriteMarine,
  Scientist: SpriteScientist, Medic: SpriteMedic, Commander: SpriteCommander, Miner: SpriteMiner,
};

export function LeftPanel({
  heroes, selectedIds, isBattling, gameState, difficulty, hasSavedBattle, hatching, hatchError,
  potions, activeMap, mapProgress, battleResult, autoDeploy,
  onToggleSelect, onStartBattle, onHatch, onFreeHatch, onUsePotion, onToggleAutoDeploy,
  onSetDifficulty, onAutoBuild, onClearActiveMap, onResumeBattle, onDiscardBattle,
  energyCost, voucherRemaining, voucherUsage, voucherMax,
}: {
  heroes: Hero[];
  selectedIds: string[];
  isBattling: boolean;
  gameState: GameState | null;
  difficulty: string;
  hasSavedBattle: boolean;
  hatching: boolean;
  hatchError: string;
  potions: number;
  activeMap: MapProgression | null;
  mapProgress: number;
  battleResult: any;
  autoDeploy: boolean;
  onToggleSelect: (id: string) => void;
  onStartBattle: (ids?: string[]) => void;
  onHatch: () => void;
  onFreeHatch: () => void;
  onUsePotion: (heroId: string) => void;
  onToggleAutoDeploy: (heroId: string) => void;
  onSetDifficulty: (d: string) => void;
  onAutoBuild: () => void;
  onClearActiveMap: () => void;
  onResumeBattle: () => void;
  onDiscardBattle: () => void;
  energyCost: number;
  voucherRemaining: number;
  voucherUsage: number;
  voucherMax: number;
}) {
  const canDeploy = selectedIds.every(id => {
    const h = heroes.find(x => x.id === id);
    return h && h.energy >= energyCost;
  });

  const canDeployAny = heroes.some(h => h.energy >= energyCost);

  return (
    <div className="w-[300px] shrink-0 border-r border-gray-800 overflow-y-auto p-2 bg-dark-2/50 flex flex-col gap-2">
      {/* Saved Battle Banner */}
      {hasSavedBattle && (
        <div className="p-2 bg-yellow-600/20 border border-yellow-500/30 rounded-lg">
          <p className="text-[10px] text-yellow-300 font-bold mb-1">⚔ Battle saved!</p>
          <div className="flex gap-1">
            <button onClick={onResumeBattle} className="flex-1 py-1 text-[11px] font-bold bg-green-600/30 text-green-300 rounded border border-green-500/30 hover:bg-green-600/50">Resume</button>
            <button onClick={onDiscardBattle} className="flex-1 py-1 text-[11px] font-bold bg-red-600/30 text-red-300 rounded border border-red-500/30 hover:bg-red-600/50">Discard</button>
          </div>
        </div>
      )}

      {/* Map Info Card */}
      {(activeMap || isBattling || battleResult) && (
        <div className="p-2 bg-black/30 border border-gray-700 rounded-lg space-y-1">
          <div className="text-[9px] font-bold text-cyan-400/80 uppercase tracking-wider">Map Info</div>
          <div className="text-[11px] font-semibold text-white">{activeMap?.difficulty || difficulty} Zone</div>
          <div className="flex justify-between text-[9px]"><span className="text-gray-500">Difficulty</span><span className="text-cyan-300">{difficulty}</span></div>
          <div className="flex justify-between text-[9px]"><span className="text-gray-500">Enemies</span><span className="text-red-400">{activeMap ? `${activeMap.totalKills}/${activeMap.enemies.length}` : (gameState ? gameState.enemies.length : "—")}</span></div>
          {isBattling && gameState && (
            <>
              <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all" style={{ width: `${mapProgress}%` }} />
              </div>
              <div className="flex justify-between text-[9px]"><span className="text-gray-500">Progress</span><span className="text-cyan-300">{mapProgress}%</span></div>
              <div className="flex justify-between text-[9px]"><span className="text-gray-500">Blocks</span><span className="text-gray-300">{gameState.grid.flat().filter(t => t === 2).length}</span></div>
              <div className="flex justify-between text-[9px]"><span className="text-gray-500">Loot</span><span className="text-amber-400">{gameState.loot?.length || 0}</span></div>
            </>
          )}
          <div className="text-[9px] text-gray-500 mt-1">Expected Rewards:</div>
          <div className="flex justify-between text-[9px]"><span className="text-yellow-500">0BOMB</span><span className="text-yellow-300">5-10</span></div>
          <div className="flex justify-between text-[9px]"><span className="text-purple-400">Fragments</span><span className="text-purple-300">5-20</span></div>
        </div>
      )}

      {/* Active Map Progress Row */}
      {activeMap && !activeMap.cleared && !isBattling && !battleResult && (
        <div className="flex items-center gap-1 p-1.5 bg-black/30 border border-gray-700 rounded-lg">
          <div className="flex-1 h-1.5 bg-gray-700 rounded overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded transition-all" style={{ width: `${mapProgress}%` }} />
          </div>
          <span className="text-[10px] text-gray-400">{mapProgress}%</span>
          <button onClick={onClearActiveMap} className="text-[10px] text-red-400 hover:text-red-300 underline ml-1">Clear</button>
        </div>
      )}

      {/* Action Card */}
      {!isBattling && !battleResult && selectedIds.length > 0 && (
        <div className="p-2 bg-black/30 border border-cyan-500/20 rounded-lg">
          <div className="text-[9px] font-bold text-cyan-400/80 uppercase tracking-wider mb-1">Squad Ready</div>
          <div className="flex items-center gap-1 mb-1">
            {selectedIds.slice(0, 5).map(id => {
              const h = heroes.find(x => x.id === id);
              if (!h) return null;
              const Sprite = HERO_SPRITES[h.class];
              return Sprite ? <Sprite key={id} size={20} /> : null;
            })}
          </div>
          <div className="flex gap-1">
            <button onClick={() => onStartBattle()} disabled={!canDeploy}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded ${canDeploy ? "bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white" : "bg-gray-700 text-gray-400 cursor-not-allowed"}`}
            >⚔ Deploy {energyCost}⚡</button>
            <button onClick={onAutoBuild}
              className="px-2 py-1.5 text-[10px] font-bold border border-gray-700 text-gray-300 rounded hover:border-gray-500"
            >Auto</button>
          </div>
        </div>
      )}

      {/* Hatch Section */}
      <div className="p-2 bg-black/30 border border-gray-700 rounded-lg space-y-1">
        <div className="text-[9px] font-bold text-cyan-400/80 uppercase tracking-wider">Hatch</div>
        <button onClick={onHatch} disabled={hatching}
          className={`w-full py-1 text-[11px] font-bold rounded text-white transition-all ${hatching ? "bg-gray-600" : "bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500"}`}
        >{hatching ? "Hatching..." : `Hatch Hero 🪙`}</button>
        {voucherRemaining > 0 && (
          <button onClick={onFreeHatch} disabled={hatching}
            className="w-full py-1 text-[11px] font-bold rounded bg-green-700/50 text-green-300 border border-green-500/40 hover:bg-green-700/70 transition-all"
          >{hatching ? "Hatching..." : `Free (${voucherUsage}/${voucherMax})`}</button>
        )}
        {hatchError && <div className="px-2 py-1 bg-red-900/20 border border-red-500/30 rounded text-[10px] text-red-400">{hatchError}</div>}
        <Link href="/faucet" className="block text-center text-[10px] text-cyan-400 hover:text-cyan-300 underline">💧 Get free 0BOMB</Link>
      </div>

      {/* Difficulty Selector */}
      {!hasSavedBattle && !isBattling && !gameState && (
        <div className="p-2 bg-black/30 border border-gray-700 rounded-lg">
          <div className="text-[9px] font-bold text-cyan-400/80 uppercase tracking-wider mb-1">Difficulty</div>
          <div className="flex gap-0.5">
            {["Easy", "Advanced", "Nightmare"].map(d => (
              <button key={d} onClick={() => onSetDifficulty(d)}
                className={`flex-1 py-0.5 text-[11px] rounded border ${difficulty === d ? "bg-cyan-600/20 border-cyan-500 text-cyan-300" : "border-gray-700 text-gray-500 hover:border-gray-500"}`}
              >{d}</button>
            ))}
          </div>
        </div>
      )}

      {/* Squad List */}
      <div className="flex-1 min-h-0">
        <div className="text-[9px] font-bold text-cyan-400/80 uppercase tracking-wider px-0.5 mb-1">
          Squad ({selectedIds.length}) <span className="text-gray-600 font-normal">— {heroes.length} heroes</span>
        </div>
        {heroes.length === 0 ? (
          <p className="text-gray-500 text-[9px] text-center py-4">No heroes. Hatch one above!</p>
        ) : (
          <div className="space-y-0.5 max-h-[calc(100vh-480px)] overflow-y-auto">
            {[...heroes].sort((a, b) => b.energy - a.energy).map(hero => {
              const isSelected = selectedIds.includes(hero.id);
              const Sprite = HERO_SPRITES[hero.class];
              const hpPct = hero.energy / hero.max_energy;
              const hasEnergy = hero.energy >= energyCost;
              const rarityColors: Record<string, string> = {
                Legendary: "bg-yellow-600/30 text-yellow-300",
                Epic: "bg-purple-600/30 text-purple-300",
                Rare: "bg-blue-600/30 text-blue-300",
                Mythic: "bg-red-600/30 text-red-300",
                Genesis: "bg-cyan-600/30 text-cyan-300",
              };
              return (
                <div key={hero.id} onClick={() => !hasSavedBattle && onToggleSelect(hero.id)}
                  className={`p-1.5 rounded-lg border text-[10px] transition-all cursor-pointer ${
                    hasSavedBattle ? "opacity-40 cursor-not-allowed" :
                    isSelected ? "border-cyan-500 bg-cyan-500/10" : "border-gray-700 bg-black/30 hover:border-gray-500"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {Sprite ? <Sprite size={24} /> : null}
                      <div>
                        <div className="font-bold text-white text-[11px] leading-tight">{hero.name}</div>
                        <div className="text-[8px] text-gray-500">{hero.class} • Lv.{hero.level}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {isSelected && <span className="text-[8px] text-cyan-400">✓</span>}
                      <span className={`px-1 rounded text-[9px] font-bold ${rarityColors[hero.rarity] || "bg-gray-600/30 text-gray-300"}`}>{hero.rarity}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="flex-1 h-1 bg-gray-700 rounded overflow-hidden">
                      <div className={`h-full rounded ${hasEnergy ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${hpPct * 100}%` }} />
                    </div>
                    <span className={`text-[9px] font-bold ${hasEnergy ? "text-yellow-400" : "text-red-400"}`}>{hero.energy}</span>
                    <span className="text-[8px] text-cyan-400">⚡{hero.stats?.power || 0}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <button onClick={(e) => { e.stopPropagation(); onToggleAutoDeploy(hero.id); }}
                      className={`text-[7px] px-1 py-0.5 rounded border ${hero.auto_deploy ? "bg-green-600/20 border-green-500 text-green-300" : "border-gray-700 text-gray-500"}`}
                    >{hero.auto_deploy ? "Auto ✓" : "Manual"}</button>
                    <div className="flex items-center gap-1">
                      {potions > 0 && !hasSavedBattle && (
                        <button onClick={(e) => { e.stopPropagation(); onUsePotion(hero.id); }}
                          className="text-[9px] px-0.5 bg-green-600/20 text-green-400 rounded"
                        >🧪</button>
                      )}
                      <span className="text-[8px] text-gray-600">{energyCost}⚡</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
