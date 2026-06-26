"use client";

import { useState, type ReactNode } from "react";
import type { Hero } from "@/lib/game/types";
import type { Equipment } from "@/lib/game/equipmentSystem";
import type { Cosmetic } from "@/lib/game/cosmeticSystem";
import type { HeroTab } from "./types";
import {
  EQUIPMENT_SLOTS, COSMETIC_SLOTS, RARITY_CONFIG, CLASS_CONFIG,
  CORE_STATS, AI_STATS, FARMING_STATS, GENETIC_STATS, TRAIT_DEFINITIONS,
} from "@/lib/game/constants";
import { getEffectiveStats, unequipAll, autoEquipHero, autoEquipCosmetics } from "@/lib/game/GameStateManager";
import { getRarityColor, formatStatLabel } from "@/lib/game/equipmentSystem";
import { getCosmeticColor } from "@/lib/game/cosmeticSystem";
import { SpriteEngineer, SpriteScout, SpriteMarine, SpriteScientist, SpriteMedic, SpriteCommander, SpriteMiner } from "@/components/pixel-art/characters";
import { IconBomb, IconShield, IconBoots, IconArmor, IconHelmet, IconRing } from "@/components/pixel-art/assets";

const HERO_SPRITES: Record<string, React.FC<{ size?: number; className?: string }>> = {
  Engineer: SpriteEngineer, Scout: SpriteScout, Marine: SpriteMarine,
  Scientist: SpriteScientist, Medic: SpriteMedic, Commander: SpriteCommander, Miner: SpriteMiner,
};

const EQUIP_ICONS: Record<string, React.FC<{ size?: number; className?: string }>> = {
  bomb: IconBomb, shield: IconShield, boots: IconBoots,
  armor: IconArmor, helmet: IconHelmet, ring: IconRing,
};

const tabs: { key: HeroTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "stats", label: "Stats" },
  { key: "ai-stats", label: "AI Stats" },
  { key: "farming", label: "Farming" },
  { key: "genetics", label: "Genetics" },
  { key: "personality", label: "Personality" },
  { key: "traits", label: "Traits" },
  { key: "memories", label: "Memories" },
  { key: "equipment", label: "Equipment" },
  { key: "cosmetics", label: "Cosmetics" },
  { key: "legacy", label: "Legacy" },
];

function SectionBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-black/30 border border-gray-700 rounded-lg p-3">
      <h3 className="text-[11px] font-bold text-cyan-400 mb-2 uppercase tracking-wider">{title}</h3>
      {children}
    </div>
  );
}

function StatBar({ value, max = 100, color = "bg-cyan-500", label }: { value: number; max?: number; color?: string; label?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="flex items-center gap-1.5 text-[10px]">
      {label && <span className="text-gray-400 w-24 shrink-0">{label}</span>}
      <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-white font-bold w-6 text-right">{value}</span>
    </div>
  );
}

function PersonalityBar({ value, label, color = "bg-purple-500" }: { value: number; label: string; color?: string }) {
  const pct = Math.min(100, (value / 100) * 100);
  const desc: Record<string, string> = {
    brave: "Willingness to fight",
    greedy: "Prioritizes loot over safety",
    curious: "Explores more map areas",
    loyal: "Works better in teams",
    lazy: "Consumes less energy but farms slower",
    tactical: "Makes smarter decisions",
  };
  return (
    <div className="flex items-center gap-1.5 text-[10px]" title={desc[label] || ""}>
      <span className="text-gray-300 w-16 shrink-0 capitalize">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-white font-bold w-6 text-right">{value}</span>
    </div>
  );
}

function RarityBadge({ rarity }: { rarity: string }) {
  const color = RARITY_CONFIG[rarity as keyof typeof RARITY_CONFIG]?.color || "#9ca3af";
  return (
    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded" style={{ backgroundColor: color + "20", borderColor: color + "50", borderWidth: 1, color }}>
      {rarity}
    </span>
  );
}

export function HeroDetailView({
  hero, inventory, cosmetics,
  onEquip, onUnequip, onEquipCosmetic, onUnequipCosmetic, onRefresh,
}: {
  hero: Hero;
  inventory: Equipment[];
  cosmetics: Cosmetic[];
  onEquip: (eq: Equipment) => void;
  onUnequip: (slot: string) => void;
  onEquipCosmetic: (cos: Cosmetic) => void;
  onUnequipCosmetic: (slot: string) => void;
  onRefresh?: () => void;
}) {
  const [tab, setTab] = useState<HeroTab>("overview");
  const [showInv, setShowInv] = useState(false);
  const [showCosInv, setShowCosInv] = useState(false);

  const Sprite = HERO_SPRITES[hero.class];
  const rarityCfg = RARITY_CONFIG[hero.rarity as keyof typeof RARITY_CONFIG];

  return (
    <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-3">
      {/* Hero Header */}
      <div className="flex items-start gap-3 mb-4 pb-3 border-b border-gray-800">
        {Sprite && <Sprite size={72} className="mt-1" />}
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold text-white">{hero.name}</h2>
            <RarityBadge rarity={hero.rarity} />
            {hero.is_legendary && <span className="text-[9px] px-1.5 py-0.5 bg-yellow-600/20 border border-yellow-500/30 rounded text-yellow-300 font-bold">LEGENDARY</span>}
            {hero.bloodline && <span className="text-[9px] text-purple-400">Bloodline</span>}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">
            {hero.class} • Lv.{hero.level} • Gen {hero.generation} • {rarityCfg?.totalStatPoints || "?"} Total Stats
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 max-w-[200px] h-1.5 bg-gray-700 rounded overflow-hidden">
              <div className="h-full bg-yellow-500 rounded" style={{ width: `${(hero.energy / hero.max_energy) * 100}%` }} />
            </div>
            <span className="text-[10px] text-yellow-400">{hero.energy}/{hero.max_energy}⚡</span>
            <span className="text-[10px] text-gray-500">XP: {hero.xp}/{hero.level * 100}</span>
          </div>
          {hero.legacy_tier && <div className="text-[9px] text-cyan-400 mt-0.5">Legacy: {hero.legacy_tier}</div>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-3">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-2 py-0.5 text-[9px] font-bold rounded border transition-all ${tab === t.key ? "bg-cyan-600/20 border-cyan-500 text-cyan-300" : "border-gray-700 text-gray-500 hover:border-gray-500"}`}
          >{t.label}</button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <SectionBox title="Core Stats">
            {CORE_STATS.map(s => {
              const val = hero.stats[s as keyof typeof hero.stats];
              const colors: Record<string, string> = { power: "bg-red-500", defense: "bg-blue-500", speed: "bg-green-500", intelligence: "bg-purple-500", luck: "bg-yellow-500", vitality: "bg-emerald-500" };
              return <StatBar key={s} label={s.charAt(0).toUpperCase() + s.slice(1)} value={val} color={colors[s] || "bg-cyan-500"} />;
            })}
          </SectionBox>
          <SectionBox title="Hero Info">
            <div className="text-[10px] space-y-1 text-gray-400">
              <div><span className="text-gray-500">Class:</span> <span className="text-white">{hero.class}</span> <span className="text-gray-600">— {CLASS_CONFIG[hero.class]?.description}</span></div>
              <div><span className="text-gray-500">Rarity:</span> <span className="text-white">{hero.rarity}</span> <span className="text-gray-600">({rarityCfg?.totalStatPoints} stat points)</span></div>
              <div><span className="text-gray-500">Generation:</span> <span className="text-white">{hero.generation}</span></div>
              <div><span className="text-gray-500">Level:</span> <span className="text-white">{hero.level}</span></div>
              <div><span className="text-gray-500">Energy:</span> <span className="text-yellow-400">{hero.energy}/{hero.max_energy}</span></div>
              {hero.bloodline && <div><span className="text-gray-500">Bloodline:</span> <span className="text-purple-400">Gen {hero.bloodline.generation} — {hero.bloodline.dna_similarity}% DNA similarity</span></div>}
              {hero.legacy_tier && <div><span className="text-gray-500">Legacy:</span> <span className="text-cyan-400">{hero.legacy_tier}</span></div>}
              <div><span className="text-gray-500">Traits:</span> <span className="text-cyan-300">{hero.traits.length}</span></div>
              <div><span className="text-gray-500">Memories:</span> <span className="text-green-400">{hero.memories.length}</span></div>
              <div><span className="text-gray-500">Badges:</span> <span className="text-purple-300">{hero.badges.length}</span></div>
              <div><span className="text-gray-500">Status:</span> <span className={hero.is_alive ? "text-green-400" : "text-red-400"}>{hero.is_alive ? "Alive" : "Deceased"}</span></div>
              {hero.bloodline && <div><span className="text-gray-500">Parent:</span> <span className="text-gray-300">{hero.bloodline.parent_name}</span></div>}
            </div>
          </SectionBox>
          <SectionBox title="AI Stats">
            {AI_STATS.map(s => {
              const val = hero.ai_stats[s as keyof typeof hero.ai_stats];
              const colors: Record<string, string> = { learning_rate: "bg-indigo-500", adaptability: "bg-orange-500", risk_awareness: "bg-teal-500", exploration: "bg-pink-500", aggression: "bg-red-500" };
              return <StatBar key={s} label={s.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")} value={val} color={colors[s] || "bg-cyan-500"} />;
            })}
          </SectionBox>
          <SectionBox title="Farming Stats">
            {FARMING_STATS.map(s => {
              const val = hero.farming_stats[s as keyof typeof hero.farming_stats];
              const colors: Record<string, string> = { mining: "bg-amber-500", scavenging: "bg-lime-500", treasure_hunter: "bg-yellow-400", efficiency: "bg-emerald-400" };
              return <StatBar key={s} label={s.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")} value={val} color={colors[s] || "bg-cyan-500"} />;
            })}
          </SectionBox>
        </div>
      )}

      {/* Core Stats Tab */}
      {tab === "stats" && (
        <SectionBox title="Core Stats (1-100)">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <StatBar label="Power" value={hero.stats.power} color="bg-red-500" />
              <p className="text-[8px] text-gray-600 pl-[104px] -mt-1">Bomb dmg, alien dmg, destruction speed</p>
              <StatBar label="Defense" value={hero.stats.defense} color="bg-blue-500" />
              <p className="text-[8px] text-gray-600 pl-[104px] -mt-1">Damage reduction, survival rate</p>
              <StatBar label="Speed" value={hero.stats.speed} color="bg-green-500" />
              <p className="text-[8px] text-gray-600 pl-[104px] -mt-1">Movement, loot/bomb/escape speed</p>
            </div>
            <div className="space-y-1.5">
              <StatBar label="Intelligence" value={hero.stats.intelligence} color="bg-purple-500" />
              <p className="text-[8px] text-gray-600 pl-[104px] -mt-1">AI decision, pathfinding, hazard avoidance</p>
              <StatBar label="Luck" value={hero.stats.luck} color="bg-yellow-500" />
              <p className="text-[8px] text-gray-600 pl-[104px] -mt-1">Equipment/rare drops, event rewards</p>
              <StatBar label="Vitality" value={hero.stats.vitality} color="bg-emerald-500" />
              <p className="text-[8px] text-gray-600 pl-[104px] -mt-1">HP, energy pool, stamina recovery</p>
            </div>
          </div>
        </SectionBox>
      )}

      {/* AI Stats Tab */}
      {tab === "ai-stats" && (
        <SectionBox title="AI Stats (1-100)">
          <div className="space-y-1.5">
            <StatBar label="Learning Rate" value={hero.ai_stats.learning_rate} color="bg-indigo-500" />
            <p className="text-[8px] text-gray-600 pl-[104px] -mt-1">Memory gain speed, AI improvement</p>
            <StatBar label="Adaptability" value={hero.ai_stats.adaptability} color="bg-orange-500" />
            <p className="text-[8px] text-gray-600 pl-[104px] -mt-1">Handling map changes, dynamic situations</p>
            <StatBar label="Risk Awareness" value={hero.ai_stats.risk_awareness} color="bg-teal-500" />
            <p className="text-[8px] text-gray-600 pl-[104px] -mt-1">Trap/lava avoidance, survival decisions</p>
            <StatBar label="Exploration" value={hero.ai_stats.exploration} color="bg-pink-500" />
            <p className="text-[8px] text-gray-600 pl-[104px] -mt-1">Map coverage, secret loot discovery</p>
            <StatBar label="Aggression" value={hero.ai_stats.aggression} color="bg-red-500" />
            <p className="text-[8px] text-gray-600 pl-[104px] -mt-1">Enemy engagement frequency, combat priority</p>
          </div>
        </SectionBox>
      )}

      {/* Farming Stats Tab */}
      {tab === "farming" && (
        <SectionBox title="Farming Stats (1-100)">
          <div className="space-y-1.5">
            <StatBar label="Mining" value={hero.farming_stats.mining} color="bg-amber-500" />
            <p className="text-[8px] text-gray-600 pl-[104px] -mt-1">Currency generation</p>
            <StatBar label="Scavenging" value={hero.farming_stats.scavenging} color="bg-lime-500" />
            <p className="text-[8px] text-gray-600 pl-[104px] -mt-1">Equipment drops</p>
            <StatBar label="Treasure Hunter" value={hero.farming_stats.treasure_hunter} color="bg-yellow-400" />
            <p className="text-[8px] text-gray-600 pl-[104px] -mt-1">Rare item discovery</p>
            <StatBar label="Efficiency" value={hero.farming_stats.efficiency} color="bg-emerald-400" />
            <p className="text-[8px] text-gray-600 pl-[104px] -mt-1">Reward per energy spent</p>
          </div>
        </SectionBox>
      )}

      {/* Genetics Tab */}
      {tab === "genetics" && (
        <SectionBox title="Genetic Stats (Cannot be upgraded normally)">
          <div className="space-y-1.5">
            <StatBar label="DNA Quality" value={hero.genetics.dna_quality} color="bg-purple-400" />
            <p className="text-[8px] text-gray-600 pl-[104px] -mt-1">Inherited through bloodlines</p>
            <StatBar label="Potential" value={hero.genetics.potential} color="bg-cyan-400" />
            <p className="text-[8px] text-gray-600 pl-[104px] -mt-1">Determines maximum stat growth</p>
            <StatBar label="Mutation Chance" value={hero.genetics.mutation_chance} color="bg-pink-400" />
            <p className="text-[8px] text-gray-600 pl-[104px] -mt-1">Chance for rare traits on inheritance</p>
            <StatBar label="Legacy Affinity" value={hero.genetics.legacy_affinity} color="bg-amber-400" />
            <p className="text-[8px] text-gray-600 pl-[104px] -mt-1">Effectiveness of inherited Legacy Cores</p>
          </div>
          <div className="mt-3 text-[9px] text-gray-500 italic">Genetic stats are inherited through bloodlines and cannot be upgraded through normal gameplay.</div>
        </SectionBox>
      )}

      {/* Personality Tab */}
      {tab === "personality" && (
        <SectionBox title="Personality (0-100)">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <PersonalityBar label="brave" value={hero.personality.brave} color="bg-red-500" />
            <PersonalityBar label="greedy" value={hero.personality.greedy} color="bg-yellow-500" />
            <PersonalityBar label="curious" value={hero.personality.curious} color="bg-purple-500" />
            <PersonalityBar label="loyal" value={hero.personality.loyal} color="bg-blue-500" />
            <PersonalityBar label="lazy" value={hero.personality.lazy} color="bg-gray-500" />
            <PersonalityBar label="tactical" value={hero.personality.tactical} color="bg-emerald-500" />
          </div>
        </SectionBox>
      )}

      {/* Traits Tab */}
      {tab === "traits" && (
        <SectionBox title={`Traits (${hero.traits.length})`}>
          {hero.traits.length === 0 ? (
            <p className="text-[10px] text-gray-600">Deploy to earn traits. Traits evolve from memories.</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-1.5">
                {hero.traits.map(t => {
                  const def = TRAIT_DEFINITIONS[t];
                  return (
                    <div key={t} className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded text-[10px]">
                      <span className="text-cyan-300 font-bold">{t}</span>
                      {def && <span className="text-gray-400 ml-1">{def.description}</span>}
                    </div>
                  );
                })}
              </div>
              {hero.traits.length > 0 && <div className="mt-3 text-[9px] text-gray-500">Equipped trait bonuses are already factored into effective stats.</div>}
            </>
          )}
        </SectionBox>
      )}

      {/* Memories Tab */}
      {tab === "memories" && (
        <SectionBox title={`Memories (${hero.memories.length})`}>
          {hero.memories.length === 0 ? (
            <p className="text-[10px] text-gray-600">No memories yet. Deploy to earn memories.</p>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-1">
              {[...hero.memories].reverse().map(m => (
                <div key={m.id} className="text-[9px] text-gray-400 font-mono border-l-2 border-cyan-500/30 pl-2 py-0.5">
                  <span className="text-cyan-400">[{m.event}]</span> {m.detail}
                  <span className="text-gray-600 ml-1">{new Date(m.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-2 text-[9px] text-gray-500">Memories influence future AI decisions and can unlock traits.</div>
        </SectionBox>
      )}

      {/* Equipment Tab */}
      {tab === "equipment" && (
        <>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">Equipment Slots</h3>
            <div className="flex items-center gap-2">
              <button onClick={() => { unequipAll(hero.id); onRefresh?.(); }} className="text-[9px] text-red-400 underline hover:text-red-300">Unequip All</button>
              <button onClick={() => { autoEquipHero(hero.id); onRefresh?.(); }} className="text-[9px] text-cyan-500 underline hover:text-cyan-400">Auto Equip</button>
              <button onClick={() => setShowInv(!showInv)} className="text-[9px] text-cyan-500 underline">{showInv ? "Close" : `Inventory (${inventory.length})`}</button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1.5 mb-4">
            {EQUIPMENT_SLOTS.map(slot => {
              const eqId = hero.equipment?.[slot];
              const eq = eqId ? inventory.find(i => i.id === eqId) : undefined;
              return (
                <div key={slot} className="p-2 bg-black/40 border border-gray-700 rounded">
                  <div className="flex items-center gap-1 mb-0.5">
                    {(() => { const Icon = EQUIP_ICONS[slot]; return Icon ? <Icon size={16} /> : null; })()}
                    <span className="text-[8px] text-gray-500">{slot}</span>
                  </div>
                  {eq ? (
                    <div>
                      <div className="text-[10px] text-white font-bold truncate">{eq.name}</div>
                      <div className="text-[8px]" style={{ color: getRarityColor(eq.rarity) }}>{eq.rarity}</div>
                      <div className="mt-0.5 text-[8px] text-gray-400">
                        {Object.entries(eq.stats).map(([k, v]) => <div key={k}>+{v} {formatStatLabel(k)}</div>)}
                      </div>
                      <button onClick={() => onUnequip(slot)} className="mt-1 text-[8px] text-red-400 hover:text-red-300">Unequip</button>
                    </div>
                  ) : (
                    <div className="text-[9px] text-gray-600 italic">Empty</div>
                  )}
                </div>
              );
            })}
          </div>
          {showInv && (
            <div>
              <h3 className="text-[10px] font-bold text-purple-400 mb-2">Inventory ({inventory.length})</h3>
              {inventory.filter(i => !i.owner).length === 0 ? (
                <p className="text-[9px] text-gray-600">No items.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto">
                  {inventory.filter(i => !i.owner).map(eq => (
                    <div key={eq.id} className="p-2 bg-black/40 border border-gray-700 rounded">
                      <div className="flex items-center gap-1">
                        {(() => { const Icon = EQUIP_ICONS[eq.slot]; return Icon ? <Icon size={14} /> : null; })()}
                        <span className="text-[10px] text-white font-bold truncate">{eq.name}</span>
                      </div>
                      <div className="text-[8px]" style={{ color: getRarityColor(eq.rarity) }}>{eq.rarity} • {eq.slot}</div>
                      <div className="mt-0.5 text-[8px] text-gray-400">
                        {Object.entries(eq.stats).map(([k, v]) => <div key={k}>+{v}</div>)}
                      </div>
                      <button onClick={() => onEquip(eq)} className="mt-1 text-[8px] text-cyan-400 hover:text-cyan-300">Equip</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Cosmetics Tab */}
      {tab === "cosmetics" && (
        <>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">Cosmetic Slots</h3>
            <div className="flex items-center gap-2">
              <button onClick={() => { unequipAll(hero.id); onRefresh?.(); }} className="text-[9px] text-red-400 underline hover:text-red-300">Unequip All</button>
              <button onClick={() => { autoEquipCosmetics(hero.id); onRefresh?.(); }} className="text-[9px] text-purple-500 underline hover:text-purple-400">Auto Equip</button>
              <button onClick={() => setShowCosInv(!showCosInv)} className="text-[9px] text-purple-500 underline">{showCosInv ? "Close" : `Collection (${cosmetics.length})`}</button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1.5 mb-4">
            {COSMETIC_SLOTS.map(slot => {
              const cosId = hero.cosmetics?.[slot];
              const cos = cosId ? cosmetics.find(c => c.id === cosId) : undefined;
              return (
                <div key={slot} className="p-2 bg-black/40 border border-gray-700 rounded">
                  <span className="text-[8px] text-gray-500">{slot}</span>
                  {cos ? (
                    <div>
                      <div className="text-[10px] text-white font-bold truncate">{cos.name}</div>
                      <div className="text-[8px]" style={{ color: getCosmeticColor(cos.rarity) }}>{cos.rarity}</div>
                      <div className="mt-0.5 text-[8px] text-gray-400">
                        {Object.entries(cos.statBonus).map(([k, v]) => <div key={k}>+{v} {k}</div>)}
                      </div>
                      <button onClick={() => onUnequipCosmetic(slot)} className="mt-1 text-[8px] text-red-400 hover:text-red-300">Remove</button>
                    </div>
                  ) : (
                    <div className="text-[9px] text-gray-600 italic">Empty</div>
                  )}
                </div>
              );
            })}
          </div>
          {showCosInv && (
            <div>
              <h3 className="text-[10px] font-bold text-purple-400 mb-2">Cosmetics ({cosmetics.length})</h3>
              {cosmetics.filter(c => !c.owner).length === 0 ? (
                <p className="text-[9px] text-gray-600">No cosmetics.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto">
                  {cosmetics.filter(c => !c.owner).map(cos => (
                    <div key={cos.id} className="p-2 bg-black/40 border border-gray-700 rounded">
                      <div className="text-[10px] text-white font-bold truncate">{cos.name}</div>
                      <div className="text-[8px]" style={{ color: getCosmeticColor(cos.rarity) }}>{cos.rarity} • {cos.type}</div>
                      <div className="mt-0.5 text-[8px] text-gray-400">
                        {Object.entries(cos.statBonus).map(([k, v]) => <div key={k}>+{v}</div>)}
                      </div>
                      <button onClick={() => onEquipCosmetic(cos)} className="mt-1 text-[8px] text-purple-400 hover:text-purple-300">Equip</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Legacy Tab */}
      {tab === "legacy" && (
        <SectionBox title="Legacy & Bloodline">
          {hero.bloodline ? (
            <div className="mb-4">
              <h4 className="text-[10px] font-bold text-purple-400 mb-2">Bloodline</h4>
              <div className="text-[10px] text-gray-400 space-y-0.5">
                <div>Parent: <span className="text-white">{hero.bloodline.parent_name}</span></div>
                <div>Generation: <span className="text-white">{hero.bloodline.generation}</span></div>
                <div>DNA Similarity: <span className="text-cyan-400">{hero.bloodline.dna_similarity}%</span></div>
                {hero.bloodline.inherited_traits.length > 0 && (
                  <div>Inherited Traits: <span className="text-cyan-300">{hero.bloodline.inherited_traits.join(", ")}</span></div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-[10px] text-gray-600 mb-3">No bloodline data. First-generation hero.</p>
          )}
          {hero.legacy_cores && hero.legacy_cores.length > 0 ? (
            <div>
              <h4 className="text-[10px] font-bold text-cyan-400 mb-2">Legacy Cores</h4>
              {hero.legacy_cores.map(lc => (
                <div key={lc.id} className="text-[9px] text-gray-400 border-l-2 border-cyan-500/30 pl-2 mb-1">
                  <div><span className="text-cyan-300">{lc.source_hero_name}</span> — Lv.{lc.level_on_retire} {lc.tier}</div>
                  <div>XP: {lc.xp_contained} | DNA: {lc.dna_fragments} | Traits: {lc.traits.join(", ")}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-gray-600">No Legacy Cores. Heroes can retire at level 100 to create a Legacy Core.</p>
          )}
          {hero.is_legendary && (
            <div className="mt-3 px-2 py-1 bg-yellow-600/10 border border-yellow-500/30 rounded text-[10px] text-yellow-300">
              This hero has achieved Legendary status! A new generation has been created.
            </div>
          )}
        </SectionBox>
      )}
    </div>
  );
}
