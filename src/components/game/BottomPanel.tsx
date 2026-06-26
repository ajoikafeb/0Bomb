"use client";

import type { GameState } from "@/lib/game/AIDecisionEngine";
import { SpriteEngineer, SpriteScout, SpriteMarine, SpriteScientist, SpriteMedic, SpriteCommander, SpriteMiner } from "@/components/pixel-art/characters";

const HERO_SPRITES: Record<string, React.FC<{ size?: number; className?: string }>> = {
  Engineer: SpriteEngineer,
  Scout: SpriteScout,
  Marine: SpriteMarine,
  Scientist: SpriteScientist,
  Medic: SpriteMedic,
  Commander: SpriteCommander,
  Miner: SpriteMiner,
};

interface BottomPanelProps {
  gameState: GameState | null;
  isBattling: boolean;
  paused: boolean;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onToggleAutoDeploy: (id: string) => void;
  heroes: any[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
}

function CurrentActionLabel({ action }: { action?: string }) {
  const labels: Record<string, { text: string; color: string }> = {
    seek: { text: "Chasing Enemy", color: "text-red-400" },
    bomb: { text: "Placing Bomb", color: "text-orange-400" },
    explore: { text: "Exploring", color: "text-cyan-400" },
    evade: { text: "Evading", color: "text-yellow-400" },
    avoid_lava: { text: "Avoiding Hazard", color: "text-orange-300" },
    collect_loot: { text: "Collecting Loot", color: "text-green-400" },
    idle: { text: "Scanning Area", color: "text-gray-400" },
    wander: { text: "Patrolling", color: "text-blue-400" },
  };
  const info = labels[action || ""] || { text: "Idle", color: "text-gray-500" };
  return (
    <span className={`text-[7px] ${info.color} truncate max-w-[60px]`}>
      {info.text}
    </span>
  );
}

export default function BottomPanel({
  gameState, isBattling, paused, onPause, onResume, onStop,
  onToggleAutoDeploy, heroes, selectedIds, onToggleSelect
}: BottomPanelProps) {
  const activeHeroes = gameState?.heroes?.filter(h => h.alive) || [];

  return (
    <div className="panel-dark border-t border-cyan-500/10">
      {/* Squad Cards */}
      <div className="px-3 py-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {activeHeroes.length === 0 && !isBattling && heroes.length === 0 && (
            <div className="flex items-center gap-2 text-[10px] text-gray-600 py-2">
              <span>🐣</span>
              <span>Hatch heroes to deploy</span>
            </div>
          )}
          {activeHeroes.length === 0 && isBattling && (
            <div className="text-[10px] text-red-400 py-2 flex items-center gap-2">
              <span>💀</span>
              <span>All heroes defeated</span>
            </div>
          )}
          {isBattling ? (
            activeHeroes.map(h => {
              const Sprite = HERO_SPRITES[h.class];
              const hpPct = h.hp / h.maxHp;
              const energyPct = h.energy / h.max_energy;
              return (
                <div key={h.id} className="card-squad flex items-center gap-2 px-2 py-1.5 min-w-[140px]">
                  <div className="relative">
                    {Sprite ? <Sprite size={24} /> : <div className="w-6 h-6 rounded bg-cyan-500/20" />}
                    <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${h.alive ? 'bg-green-400' : 'bg-red-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-white font-bold truncate max-w-[40px]">{h.name}</span>
                      <span className="text-[7px] text-gray-500">{h.class}</span>
                      <CurrentActionLabel action={h.currentAction as string} />
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${hpPct > 0.5 ? 'bg-green-500' : hpPct > 0.25 ? 'bg-yellow-500' : 'bg-red-500'} ${hpPct < 0.25 ? 'hp-low' : ''}`}
                          style={{ width: `${hpPct * 100}%` }} />
                      </div>
                      <span className="text-[8px] text-gray-500 font-mono">{h.hp}/{h.maxHp}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="flex-1 h-0.5 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${energyPct * 100}%` }} />
                      </div>
                      <span className="text-[7px] text-yellow-400">⚡{h.energy}</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            heroes.filter(h => selectedIds.includes(h.id)).length > 0 ? (
              heroes.filter(h => selectedIds.includes(h.id)).map(h => {
                const Sprite = HERO_SPRITES[h.class];
                return (
                  <div key={h.id} className="card-squad flex items-center gap-2 px-2 py-1.5 min-w-[130px]">
                    <div className="relative">
                      {Sprite ? <Sprite size={24} /> : <div className="w-6 h-6 rounded bg-cyan-500/20" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] text-white font-bold truncate max-w-[40px]">{h.name}</span>
                        <span className="text-[7px] text-gray-500">{h.class}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[8px] text-green-400">Lv.{h.level}</span>
                        <span className="text-[7px] text-gray-600">⚡{h.energy}</span>
                        <button onClick={(e) => { e.stopPropagation(); onToggleAutoDeploy(h.id); }}
                          className={`text-[7px] px-1 py-0.5 rounded ${h.auto_deploy ? "bg-green-600/20 text-green-400" : "bg-gray-800 text-gray-600"}`}
                        >{h.auto_deploy ? "Auto" : "Manual"}</button>
                      </div>
                    </div>
                    <button onClick={() => onToggleSelect(h.id)}
                      className="text-[8px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                    >✕</button>
                  </div>
                );
              })
            ) : (
              <div className="text-[10px] text-gray-600 py-2 flex items-center gap-2">
                <span>👆</span>
                <span>Select heroes from sidebar</span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
