"use client";

import { useState, useEffect, Component } from "react";
import type { ReactNode } from "react";
import { useWalletContext } from "@/components/wallet/WalletProvider";
import { getHeroes, deleteHero, getInventory, addToInventory, removeFromInventory, equipItem, unequipItem, getCosmetics, addCosmetic, removeCosmetic, equipCosmetic, unequipCosmetic, renameHero, updateHero, isEmergencyShutdown, addTransaction, isAddressFrozen, autoEquipHero, autoEquipCosmetics, unequipAll, getEffectiveStats } from "@/lib/game/GameStateManager";
import { generateEquipment, getRarityColor, formatStatLabel } from "@/lib/game/equipmentSystem";
import { generateCosmetic, getCosmeticColor } from "@/lib/game/cosmeticSystem";
import { EQUIPMENT_SLOTS, COSMETIC_SLOTS, LOOT_MINT_COST, COSMETIC_MINT_COST, TREASURY_ADDRESS, TOKEN_SYMBOL, RARITY_CONFIG, CLASS_CONFIG, CORE_STATS, AI_STATS, FARMING_STATS, GENETIC_STATS, PERSONALITY_TRAITS, TRAIT_DEFINITIONS } from "@/lib/game/constants";
import type { Hero } from "@/lib/game/types";
import type { Equipment } from "@/lib/game/equipmentSystem";
import type { Cosmetic } from "@/lib/game/cosmeticSystem";
import { transferToken } from "@/lib/blockchain/provider";
import { SpriteEngineer, SpriteScout, SpriteMarine, SpriteScientist, SpriteMedic, SpriteCommander, SpriteMiner } from "@/components/pixel-art/characters";
import { IconBomb, IconShield, IconBoots, IconArmor, IconHelmet, IconRing } from "@/components/pixel-art/assets";

const HERO_SPRITES: Record<string, React.FC<{ size?: number; className?: string }>> = {
  Engineer: SpriteEngineer,
  Scout: SpriteScout,
  Marine: SpriteMarine,
  Scientist: SpriteScientist,
  Medic: SpriteMedic,
  Commander: SpriteCommander,
  Miner: SpriteMiner,
};

const EQUIP_ICONS: Record<string, React.FC<{ size?: number; className?: string }>> = {
  bomb: IconBomb,
  shield: IconShield,
  boots: IconBoots,
  armor: IconArmor,
  helmet: IconHelmet,
  ring: IconRing,
};

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

function SectionBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-black/30 border border-gray-700 rounded-lg p-3">
      <h3 className="text-[11px] font-bold text-cyan-400 mb-2 uppercase tracking-wider">{title}</h3>
      {children}
    </div>
  );
}

type DetailTab = "overview" | "stats" | "ai-stats" | "farming" | "genetics" | "personality" | "traits" | "memories" | "equipment" | "cosmetics" | "legacy";

function HeroDetailView({ hero, inventory, cosmetics, onEquip, onUnequip, onEquipCosmetic, onUnequipCosmetic }:
  { hero: Hero; inventory: Equipment[]; cosmetics: Cosmetic[];
    onEquip: (eq: Equipment) => void; onUnequip: (slot: string) => void;
    onEquipCosmetic: (cos: Cosmetic) => void; onUnequipCosmetic: (slot: string) => void;
  }) {
  const [tab, setTab] = useState<DetailTab>("overview");
  const [showInv, setShowInv] = useState(false);
  const [showCosInv, setShowCosInv] = useState(false);

  const tabs: { key: DetailTab; label: string }[] = [
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

  const Sprite = HERO_SPRITES[hero.class];

  const effectiveStats = getEffectiveStats(hero);
  const rarityCfg = RARITY_CONFIG[hero.rarity as keyof typeof RARITY_CONFIG];

  return (
    <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-3">
      {/* ─── Hero Header ─────────────────────────────── */}
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

      {/* ─── Tabs ────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1 mb-3">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-2 py-0.5 text-[9px] font-bold rounded border transition-all ${tab === t.key ? "bg-cyan-600/20 border-cyan-500 text-cyan-300" : "border-gray-700 text-gray-500 hover:border-gray-500"}`}
          >{t.label}</button>
        ))}
      </div>

      {/* ─── Overview Tab ────────────────────────────── */}
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

      {/* ─── Core Stats Tab ──────────────────────────── */}
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

      {/* ─── AI Stats Tab ────────────────────────────── */}
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

      {/* ─── Farming Stats Tab ───────────────────────── */}
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

      {/* ─── Genetics Tab ────────────────────────────── */}
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

      {/* ─── Personality Tab ─────────────────────────── */}
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

      {/* ─── Traits Tab ──────────────────────────────── */}
      {tab === "traits" && (
        <SectionBox title={`Traits (${hero.traits.length})`}>
          {hero.traits.length === 0 ? (
            <p className="text-[10px] text-gray-600">Deploy to earn traits. Traits evolve from memories.</p>
          ) : (
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
          )}
          {hero.traits.length > 0 && <div className="mt-3 text-[9px] text-gray-500">Equipped trait bonuses are already factored into effective stats.</div>}
        </SectionBox>
      )}

      {/* ─── Memories Tab ────────────────────────────── */}
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

      {/* ─── Equipment Tab ───────────────────────────── */}
      {tab === "equipment" && (
        <>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">Equipment Slots</h3>
            <div className="flex items-center gap-2">
              <button onClick={() => { if (hero) { unequipAll(hero.id); } }} className="text-[9px] text-red-400 underline hover:text-red-300">Unequip All</button>
              <button onClick={() => { if (hero) { autoEquipHero(hero.id); } }} className="text-[9px] text-cyan-500 underline hover:text-cyan-400">Auto Equip</button>
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

      {/* ─── Cosmetics Tab ───────────────────────────── */}
      {tab === "cosmetics" && (
        <>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">Cosmetic Slots</h3>
            <div className="flex items-center gap-2">
              <button onClick={() => { if (hero) { unequipAll(hero.id); } }} className="text-[9px] text-red-400 underline hover:text-red-300">Unequip All</button>
              <button onClick={() => { if (hero) { autoEquipCosmetics(hero.id); } }} className="text-[9px] text-purple-500 underline hover:text-purple-400">Auto Equip</button>
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

      {/* ─── Legacy Tab ──────────────────────────────── */}
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

export default function HeroesPage() {
  const { isConnected, address } = useWalletContext();
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inventory, setInventory] = useState<Equipment[]>([]);
  const [cosmetics, setCosmetics] = useState<Cosmetic[]>([]);
  const [msg, setMsg] = useState("");
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");
  const [minting, setMinting] = useState(false);
  const [mintError, setMintError] = useState("");

  const handleRename = () => {
    if (!renameId || !renameVal.trim()) return;
    renameHero(renameId, renameVal.trim());
    setRenameId(null);
    refresh();
    setMsg(`Hero renamed`);
    setTimeout(() => setMsg(""), 3000);
  };

  const refresh = () => {
    if (address) {
      setHeroes(getHeroes().filter(h => h.owner_address === address));
      setInventory(getInventory());
      setCosmetics(getCosmetics());
    }
  };

  useEffect(() => {
    if (isConnected && address) refresh();
  }, [isConnected, address]);

  const selectedHero = heroes.find(h => h.id === selectedId);

  const handleDelete = (id: string) => {
    deleteHero(id);
    refresh();
    if (selectedId === id) setSelectedId(null);
  };

  const handleGenerateLoot = async () => {
    if (address && isAddressFrozen(address)) { setMintError("Account frozen"); setTimeout(() => setMintError(""), 4000); return; }
    const shutdown = isEmergencyShutdown();
    if (shutdown.trading) { setMintError("Trading is paused"); setTimeout(() => setMintError(""), 4000); return; }
    setMinting(true);
    setMintError("");
    try {
      await transferToken(TREASURY_ADDRESS, LOOT_MINT_COST);
      const eq = generateEquipment(undefined, null);
      addToInventory(eq);
      addTransaction({ type: "expense", category: "mint_loot", amount: LOOT_MINT_COST, description: `Minted ${eq.name} (${eq.rarity})`, ownerAddress: address });
      setInventory(getInventory());
      setMsg(`Minted: ${eq.name} (${eq.rarity})`);
    } catch (e: any) {
      const m = e?.message?.toLowerCase() || "";
      if (m.includes("user rejected") || m.includes("user denied")) {
        setMintError("Transaction cancelled");
      } else {
        setMintError(`Mint failed: ${e?.message?.slice(0, 80) || "Unknown error"}`);
      }
    } finally {
      setMinting(false);
      setTimeout(() => { setMsg(""); setMintError(""); }, 4000);
    }
  };

  const handleGenerateCosmetic = async () => {
    if (address && isAddressFrozen(address)) { setMintError("Account frozen"); setTimeout(() => setMintError(""), 4000); return; }
    const shutdown = isEmergencyShutdown();
    if (shutdown.trading) { setMintError("Trading is paused"); setTimeout(() => setMintError(""), 4000); return; }
    setMinting(true);
    setMintError("");
    try {
      await transferToken(TREASURY_ADDRESS, COSMETIC_MINT_COST);
      const cos = generateCosmetic(undefined, null);
      addCosmetic(cos);
      addTransaction({ type: "expense", category: "mint_cosmetic", amount: COSMETIC_MINT_COST, description: `Minted ${cos.name} (${cos.rarity} ${cos.type})`, ownerAddress: address });
      setCosmetics(getCosmetics());
      setMsg(`Minted: ${cos.name} (${cos.rarity} ${cos.type})`);
    } catch (e: any) {
      const m = e?.message?.toLowerCase() || "";
      if (m.includes("user rejected") || m.includes("user denied")) {
        setMintError("Transaction cancelled");
      } else {
        setMintError(`Mint failed: ${e?.message?.slice(0, 80) || "Unknown error"}`);
      }
    } finally {
      setMinting(false);
      setTimeout(() => { setMsg(""); setMintError(""); }, 4000);
    }
  };

  const handleEquip = (eq: Equipment) => {
    if (!selectedHero) return;
    equipItem(selectedHero.id, eq);
    refresh();
    setMsg(`Equipped ${eq.name}`);
    setTimeout(() => setMsg(""), 3000);
  };

  const handleUnequip = (slot: string) => {
    if (!selectedHero) return;
    unequipItem(selectedHero.id, slot);
    refresh();
    setMsg(`Unequipped item`);
    setTimeout(() => setMsg(""), 3000);
  };

  const handleEquipCosmetic = (cos: Cosmetic) => {
    if (!selectedHero) return;
    equipCosmetic(selectedHero.id, cos);
    refresh();
    setMsg(`Equipped ${cos.name}`);
    setTimeout(() => setMsg(""), 3000);
  };

  const handleUnequipCosmetic = (slot: string) => {
    if (!selectedHero) return;
    unequipCosmetic(selectedHero.id, slot);
    refresh();
    setMsg(`Unequipped cosmetic`);
    setTimeout(() => setMsg(""), 3000);
  };

  if (!isConnected) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-cyan-400 mb-4">Connect Your Wallet</h1>
          <p className="text-gray-400">Connect to manage heroes and equipment.</p>
        </div>
      </div>
    );
  }

  const totalPower = heroes.reduce((s, h) => s + h.stats.power, 0);
  const avgSpeed = heroes.length > 0 ? Math.round(heroes.reduce((s, h) => s + h.stats.speed, 0) / heroes.length) : 0;

  return (
    <div className="min-h-[80vh] p-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Heroes ({heroes.length})
        </h1>
        <div className="flex gap-1">
          <button onClick={handleGenerateCosmetic} disabled={minting}
            className={`px-3 py-1.5 text-[10px] font-bold border rounded transition-all ${minting ? "bg-gray-600/30 border-gray-500/30 text-gray-400" : "bg-purple-600/30 border-purple-500/30 text-purple-300 hover:bg-purple-600/50"}`}
          >{minting ? "Minting..." : `Mint Cosmetic ${COSMETIC_MINT_COST}🪙`}</button>
          <button onClick={handleGenerateLoot} disabled={minting}
            className={`px-3 py-1.5 text-[10px] font-bold border rounded transition-all ${minting ? "bg-gray-600/30 border-gray-500/30 text-gray-400" : "bg-yellow-600/30 border-yellow-500/30 text-yellow-300 hover:bg-yellow-600/50"}`}
          >{minting ? "Minting..." : `Mint Loot ${LOOT_MINT_COST}🪙`}</button>
        </div>
      </div>

      {msg && <div className="mb-3 px-3 py-2 bg-cyan-600/10 border border-cyan-500/20 rounded text-xs text-cyan-300">{msg}</div>}
      {mintError && <div className="mb-3 px-3 py-2 bg-red-900/20 border border-red-500/30 rounded text-xs text-red-400">{mintError}</div>}

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-black/30 border border-gray-700 rounded p-2 text-center">
          <div className="text-lg font-bold text-cyan-400">{heroes.length}</div>
          <div className="text-[9px] text-gray-500">Heroes</div>
        </div>
        <div className="bg-black/30 border border-gray-700 rounded p-2 text-center">
          <div className="text-lg font-bold text-red-400">{totalPower}</div>
          <div className="text-[9px] text-gray-500">Total Power</div>
        </div>
        <div className="bg-black/30 border border-gray-700 rounded p-2 text-center">
          <div className="text-lg font-bold text-green-400">{avgSpeed}</div>
          <div className="text-[9px] text-gray-500">Avg Speed</div>
        </div>
        <div className="bg-black/30 border border-gray-700 rounded p-2 text-center">
          <div className="text-lg font-bold text-purple-400">{heroes.filter(h => h.traits.length > 0).length}</div>
          <div className="text-[9px] text-gray-500">With Traits</div>
        </div>
      </div>

      {heroes.length === 0 ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-4">No heroes yet. Go to the Game page to hatch one!</div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Hero List */}
          <div className="lg:col-span-1 space-y-1 max-h-[600px] overflow-y-auto">
            {heroes.map(hero => (
              <button key={hero.id} onClick={() => setSelectedId(hero.id)}
                className={`w-full text-left p-2 rounded border text-[11px] transition-all ${selectedId === hero.id ? "border-cyan-500 bg-cyan-500/10" : "border-gray-700 bg-black/30 hover:border-gray-500"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {(() => { const Sprite = HERO_SPRITES[hero.class]; return Sprite ? <Sprite size={24} /> : null; })()}
                    <span className="font-bold text-white">{hero.name}</span>
                  </div>
                  <RarityBadge rarity={hero.rarity} />
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">{hero.class} • Lv.{hero.level} • Gen {hero.generation}</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="flex-1 h-1 bg-gray-700 rounded overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded transition-all" style={{ width: `${(hero.energy / hero.max_energy) * 100}%` }} />
                  </div>
                  <span className="text-[9px] text-yellow-400">{hero.energy}/{hero.max_energy}</span>
                </div>
                <div className="flex items-center gap-2 text-[9px] text-gray-500 mt-0.5">
                  <span>P:{hero.stats.power}</span>
                  <span>S:{hero.stats.speed}</span>
                  <span>I:{hero.stats.intelligence}</span>
                  <span>♥{hero.genetics.potential}</span>
                </div>
                {hero.traits.length > 0 && <div className="text-[8px] text-cyan-400 mt-0.5">{hero.traits.join(", ")}</div>}
                {hero.is_legendary && <div className="text-[9px] text-yellow-400 mt-0.5">Legendary</div>}
                <div className="flex items-center gap-1 mt-1">
                  <div onClick={(e) => { e.stopPropagation(); updateHero(hero.id, { auto_deploy: !hero.auto_deploy }); refresh(); }}
                    className={`cursor-pointer text-[8px] px-1 py-0.5 rounded border inline-block ${hero.auto_deploy ? "bg-green-600/30 border-green-500 text-green-300" : "border-gray-700 text-gray-500"}`}
                  >{hero.auto_deploy ? "Auto" : "Manual"}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Hero Detail */}
          <div className="lg:col-span-2">
            {selectedHero ? (
              <ErrorBoundary>
                <HeroDetailView
                  hero={selectedHero}
                  inventory={inventory}
                  cosmetics={cosmetics}
                  onEquip={handleEquip}
                  onUnequip={handleUnequip}
                  onEquipCosmetic={handleEquipCosmetic}
                  onUnequipCosmetic={handleUnequipCosmetic}
                />
                <div className="flex gap-2 mt-2">
                  {renameId === selectedHero.id ? (
                    <div className="flex items-center gap-1">
                      <input value={renameVal} onChange={e => setRenameVal(e.target.value)}
                        className="w-32 px-1.5 py-0.5 text-xs bg-black border border-cyan-500/50 rounded text-white outline-none"
                        onKeyDown={e => e.key === "Enter" && handleRename()} autoFocus
                      />
                      <button onClick={handleRename} className="text-[10px] text-cyan-400 hover:text-cyan-300">Save</button>
                      <button onClick={() => setRenameId(null)} className="text-[10px] text-gray-500 hover:text-gray-400">X</button>
                    </div>
                  ) : (
                    <button onClick={() => { setRenameId(selectedHero.id); setRenameVal(selectedHero.name); }}
                      className="px-2 py-1 text-[10px] border border-gray-700 text-gray-300 rounded hover:border-gray-500"
                    >Rename</button>
                  )}
                  <button onClick={() => handleDelete(selectedHero.id)}
                    className="px-2 py-1 text-[10px] border border-red-500/30 text-red-400 rounded hover:bg-red-500/10"
                  >Retire Hero</button>
                </div>
              </ErrorBoundary>
            ) : (
              <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-6 flex items-center justify-center min-h-[300px]">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2">Select a hero to view details</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return <div className="text-red-400 text-xs p-4">Something went wrong rendering hero details.</div>;
    }
    return this.props.children;
  }
}
