"use client";

import { RARITY_COLORS } from "./types";
import { RARITY_CONFIG } from "@/lib/game/constants";
import type { Hero } from "@/lib/game/types";
import type { Equipment } from "@/lib/game/equipmentSystem";
import type { Cosmetic } from "@/lib/game/cosmeticSystem";

function RarityDot({ rarity }: { rarity: string }) {
  const color = RARITY_COLORS[rarity] || RARITY_CONFIG[rarity as keyof typeof RARITY_CONFIG]?.color || "#9ca3af";
  return <span className="inline-block w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />;
}

function RarityBorder({ rarity, children }: { rarity: string; children: React.ReactNode }) {
  const color = RARITY_COLORS[rarity] || RARITY_CONFIG[rarity as keyof typeof RARITY_CONFIG]?.color || "#9ca3af";
  return (
    <div className="rounded-xl p-3 space-y-1.5 transition-all duration-200 hover:scale-[1.02] border relative overflow-hidden group"
      style={{ borderColor: `${color}20`, backgroundColor: `${color}05` }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at top, ${color}10, transparent 70%)` }}
      />
      {children}
    </div>
  );
}

export function HeroCard({
  hero,
  equippedCount,
  totalSlots,
  onAutoEquip,
  onUnequipAll,
  onSelect,
}: {
  hero: Hero;
  equippedCount: number;
  totalSlots: number;
  onAutoEquip: () => void;
  onUnequipAll: () => void;
  onSelect: () => void;
}) {
  const color = RARITY_CONFIG[hero.rarity as keyof typeof RARITY_CONFIG]?.color || "#9ca3af";
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 hover:border-white/[0.12] transition-all cursor-pointer"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <RarityDot rarity={hero.rarity} />
          <span className="font-bold text-sm truncate" style={{ color }}>{hero.name}</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.06] text-gray-400 flex-shrink-0">{hero.class}</span>
          <span className="text-[9px] text-gray-500 flex-shrink-0">Lv{hero.level}</span>
        </div>
        <div className="flex gap-1 flex-shrink-0 ml-2" onClick={e => e.stopPropagation()}>
          <button onClick={onAutoEquip} className="px-2 py-1 text-[9px] font-medium bg-cyan-500/10 border border-cyan-500/20 rounded text-cyan-400 hover:bg-cyan-500/20">Auto</button>
          <button onClick={onUnequipAll} className="px-2 py-1 text-[9px] font-medium bg-red-500/10 border border-red-500/20 rounded text-red-400 hover:bg-red-500/20">Unequip</button>
        </div>
      </div>
      <div className="flex gap-3 mt-1 text-[10px] text-gray-500">
        <span>{hero.rarity}</span>
        <span>Gen {hero.generation}</span>
        <span>⚡ {hero.energy}/{hero.max_energy}</span>
        <span>{equippedCount}/{totalSlots} eq</span>
      </div>
      {hero.is_legendary && (
        <span className="inline-block mt-1 text-[8px] px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
          ★ LEGENDARY
        </span>
      )}
    </div>
  );
}

export function EquipmentCard({
  item,
  equippedOn,
  heroes,
  onEquip,
  onUnequip,
  onSelect,
}: {
  item: Equipment;
  equippedOn: string | null;
  heroes: { id: string; name: string }[];
  onEquip: (heroId: string) => void;
  onUnequip: () => void;
  onSelect: () => void;
}) {
  const color = RARITY_COLORS[item.rarity] || "#9ca3af";
  return (
    <RarityBorder rarity={item.rarity}>
      <div className="relative z-[1] cursor-pointer" onClick={onSelect}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <RarityDot rarity={item.rarity} />
            <span className="font-semibold text-[11px] truncate" style={{ color }}>{item.name}</span>
          </div>
          <span className="text-[9px] text-gray-500 flex-shrink-0">{item.slot}</span>
        </div>
        <div className="text-[9px] text-gray-500">{item.rarity}</div>
        {Object.entries(item.stats).map(([stat, val]) => (
          <div key={stat} className="flex justify-between text-[10px]">
            <span className="text-gray-400">{formatStatLabel(stat)}</span>
            <span className="text-white">+{val}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between pt-1 border-t border-white/[0.06] relative z-[1]" onClick={e => e.stopPropagation()}>
        <span className="text-[9px] text-gray-500">
          {equippedOn ? `On ${equippedOn}` : "Unequipped"}
        </span>
        {equippedOn ? (
          <button onClick={onUnequip} className="text-[9px] text-red-400 hover:text-red-300">✕</button>
        ) : (
          <select defaultValue="" onChange={e => { if (e.target.value) onEquip(e.target.value); }}
            className="text-[9px] px-1.5 py-0.5 bg-white/[0.05] border border-white/[0.1] rounded text-gray-300"
          >
            <option value="">Equip...</option>
            {heroes.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
        )}
      </div>
    </RarityBorder>
  );
}

export function CosmeticCard({
  item,
  equippedOn,
  onSelect,
}: {
  item: Cosmetic;
  equippedOn: string | null;
  onSelect: () => void;
}) {
  const color = RARITY_COLORS[item.rarity] || "#9ca3af";
  return (
    <RarityBorder rarity={item.rarity}>
      <div className="relative z-[1] cursor-pointer" onClick={onSelect}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <RarityDot rarity={item.rarity} />
            <span className="font-semibold text-[11px] truncate" style={{ color }}>{item.name}</span>
          </div>
          <span className="text-[9px] text-gray-500 flex-shrink-0">{item.type}</span>
        </div>
        <div className="text-[9px] text-gray-500">{item.rarity}</div>
        {Object.entries(item.statBonus || {}).map(([stat, val]) => (
          <div key={stat} className="flex justify-between text-[10px]">
            <span className="text-gray-400">{formatStatLabel(stat)}</span>
            <span className="text-white">+{val}</span>
          </div>
        ))}
      </div>
      <div className="text-[9px] text-gray-500 pt-1 border-t border-white/[0.06] relative z-[1]">
        {equippedOn ? `On ${equippedOn}` : "Unequipped"}
      </div>
    </RarityBorder>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="col-span-full flex items-center justify-center py-16">
      <div className="text-center">
        <div className="text-3xl mb-2 text-gray-700">◈</div>
        <p className="text-gray-500 text-[11px]">{message}</p>
      </div>
    </div>
  );
}

export function formatStatLabel(stat: string): string {
  const labels: Record<string, string> = {
    bomb_damage: "Bomb DMG",
    bomb_range: "Bomb Range",
    speed: "Speed",
    max_energy: "Max Energy",
    hp: "HP",
    defense: "Defense",
    intel_gain: "Intel",
    memory_cap: "Memory",
    loot_range: "Loot Rng",
    hazard_detect: "Detect",
    energy_regen: "E Regen",
    luck: "Luck",
  };
  return labels[stat] || stat.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}
