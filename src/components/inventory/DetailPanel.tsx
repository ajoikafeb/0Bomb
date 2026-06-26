"use client";

import { useState } from "react";
import type { Hero } from "@/lib/game/types";
import type { Equipment } from "@/lib/game/equipmentSystem";
import type { Cosmetic } from "@/lib/game/cosmeticSystem";
import { RARITY_COLORS } from "./types";
import { RARITY_CONFIG } from "@/lib/game/constants";
import { formatStatLabel } from "./InventoryCard";
import type { AssetItem } from "./types";

export function DetailPanel({
  asset,
  onClose,
  onEquip,
  onUnequip,
  onAutoEquip,
  onUnequipAll,
  heroes,
  heroIds,
  heroEquipment,
  address,
}: {
  asset: AssetItem;
  onClose: () => void;
  onEquip: (heroId: string, item: Equipment) => void;
  onUnequip: (heroId: string, slot: string) => void;
  onAutoEquip: (heroId: string) => void;
  onUnequipAll: (heroId: string) => void;
  heroes: Hero[];
  heroIds: Set<string>;
  heroEquipment: Equipment[];
  address: string | null;
}) {
  const [equipTarget, setEquipTarget] = useState("");

  const renderHeroDetail = (hero: Hero) => {
    const color = RARITY_CONFIG[hero.rarity as keyof typeof RARITY_CONFIG]?.color || "#9ca3af";
    const eqSlots = Object.entries(hero.equipment).filter(([, v]) => v);

    return (
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              <span className="font-bold text-sm" style={{ color }}>{hero.name}</span>
            </div>
            <div className="flex gap-2 mt-1 text-[10px] text-gray-500">
              <span className="px-1.5 py-0.5 rounded bg-white/[0.06]">{hero.class}</span>
              <span>Lv{hero.level}</span>
              <span>{hero.rarity}</span>
              <span>Gen {hero.generation}</span>
            </div>
          </div>
          <div className="flex gap-1">
            <button onClick={() => onAutoEquip(hero.id)} className="px-2 py-1 text-[9px] font-medium bg-cyan-500/10 border border-cyan-500/20 rounded text-cyan-400 hover:bg-cyan-500/20">Auto</button>
            <button onClick={() => onUnequipAll(hero.id)} className="px-2 py-1 text-[9px] font-medium bg-red-500/10 border border-red-500/20 rounded text-red-400 hover:bg-red-500/20">Unequip</button>
          </div>
        </div>

        {/* Stats */}
        <div>
          <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-1.5">Core Stats</div>
          <div className="grid grid-cols-2 gap-1 text-[10px]">
            <div className="flex justify-between px-2 py-1 bg-white/[0.03] rounded"><span className="text-gray-400">Power</span><span className="text-white">{hero.stats.power}</span></div>
            <div className="flex justify-between px-2 py-1 bg-white/[0.03] rounded"><span className="text-gray-400">Defense</span><span className="text-white">{hero.stats.defense}</span></div>
            <div className="flex justify-between px-2 py-1 bg-white/[0.03] rounded"><span className="text-gray-400">Speed</span><span className="text-white">{hero.stats.speed}</span></div>
            <div className="flex justify-between px-2 py-1 bg-white/[0.03] rounded"><span className="text-gray-400">Intelligence</span><span className="text-white">{hero.stats.intelligence}</span></div>
            <div className="flex justify-between px-2 py-1 bg-white/[0.03] rounded"><span className="text-gray-400">Luck</span><span className="text-white">{hero.stats.luck}</span></div>
            <div className="flex justify-between px-2 py-1 bg-white/[0.03] rounded"><span className="text-gray-400">Vitality</span><span className="text-white">{hero.stats.vitality}</span></div>
          </div>
        </div>

        {/* Energy */}
        <div>
          <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">Energy</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all" style={{ width: `${(hero.energy / hero.max_energy) * 100}%` }} />
            </div>
            <span className="text-[10px] text-cyan-300 font-mono">{hero.energy}/{hero.max_energy}</span>
          </div>
        </div>

        {/* Equipment */}
        <div>
          <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-1.5">Equipment ({eqSlots.length}/{Object.keys(hero.equipment).length})</div>
          <div className="grid grid-cols-2 gap-1.5">
            {Object.entries(hero.equipment).map(([slot, equipId]) => {
              const item = equipId ? heroEquipment.find(i => i.id === equipId) : null;
              return (
                <div key={slot} className="flex items-center justify-between px-2 py-1 rounded bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[9px] text-gray-500 flex-shrink-0">{slot.split(" ")[0]}</span>
                    {item ? (
                      <span className="text-[9px] truncate" style={{ color: RARITY_COLORS[item.rarity] || "#fff" }}>{item.name}</span>
                    ) : (
                      <span className="text-[9px] text-gray-600">—</span>
                    )}
                  </div>
                  {item && <button onClick={() => onUnequip(hero.id, slot)} className="text-[9px] text-red-400 hover:text-red-300 flex-shrink-0 ml-1">✕</button>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Traits */}
        {hero.traits.length > 0 && (
          <div>
            <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">Traits</div>
            <div className="flex flex-wrap gap-1">
              {hero.traits.map(t => (
                <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-gray-300">{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* Status */}
        <div className="flex gap-2 text-[10px]">
          <span className={`${hero.is_alive ? "text-emerald-400" : "text-red-400"}`}>
            {hero.is_alive ? "● Alive" : "● Dead"}
          </span>
          {hero.auto_deploy && <span className="text-cyan-400">⟳ Auto</span>}
          {hero.is_legendary && <span className="text-yellow-400">★ Legendary</span>}
        </div>
      </div>
    );
  };

  const renderEquipDetail = (item: Equipment) => {
    const color = RARITY_COLORS[item.rarity] || "#9ca3af";
    const equippedOn = item.owner && heroIds.has(item.owner) ? heroes.find(h => h.id === item.owner) : null;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
          <span className="font-bold text-sm" style={{ color }}>{item.name}</span>
        </div>
        <div className="flex gap-2 text-[10px] text-gray-500">
          <span className="px-1.5 py-0.5 rounded bg-white/[0.06]">{item.slot}</span>
          <span>{item.rarity}</span>
        </div>

        <div>
          <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-1.5">Stats</div>
          {Object.entries(item.stats).map(([stat, val]) => (
            <div key={stat} className="flex justify-between text-[10px] px-2 py-1 bg-white/[0.03] rounded mb-0.5">
              <span className="text-gray-400">{formatStatLabel(stat)}</span>
              <span className="text-emerald-400">+{val}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-white/[0.06] pt-2">
          {equippedOn ? (
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-gray-400">Equipped on <span className="text-gray-200">{equippedOn.name}</span></span>
              <button onClick={() => onUnequip(equippedOn.id, item.slot)} className="text-red-400 hover:text-red-300">Unequip</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500">Equip to:</span>
              <select value={equipTarget} onChange={e => { setEquipTarget(e.target.value); if (e.target.value) { onEquip(e.target.value, item); setEquipTarget(""); } }}
                className="flex-1 text-[10px] px-1.5 py-1 bg-white/[0.05] border border-white/[0.1] rounded text-gray-300"
              >
                <option value="">Select hero...</option>
                {heroes.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Blockchain Info */}
        <div className="border-t border-white/[0.06] pt-2">
          <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">Blockchain</div>
          <div className="text-[9px] text-gray-600 space-y-0.5 font-mono break-all">
            <div>ID: {item.id}</div>
            <div>Slot: {item.slot}</div>
            {address && <div>Owner: {address.slice(0, 6)}...{address.slice(-4)}</div>}
          </div>
        </div>
      </div>
    );
  };

  const renderCosmeticDetail = (item: Cosmetic) => {
    const color = RARITY_COLORS[item.rarity] || "#9ca3af";
    const equippedOn = item.owner && heroIds.has(item.owner) ? heroes.find(h => h.id === item.owner) : null;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
          <span className="font-bold text-sm" style={{ color }}>{item.name}</span>
        </div>
        <div className="flex gap-2 text-[10px] text-gray-500">
          <span className="px-1.5 py-0.5 rounded bg-white/[0.06]">{item.type}</span>
          <span>{item.rarity}</span>
        </div>

        <div>
          <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-1.5">Stat Bonus</div>
          {Object.entries(item.statBonus || {}).map(([stat, val]) => (
            <div key={stat} className="flex justify-between text-[10px] px-2 py-1 bg-white/[0.03] rounded mb-0.5">
              <span className="text-gray-400">{formatStatLabel(stat)}</span>
              <span className="text-purple-400">+{val}</span>
            </div>
          ))}
        </div>

        <div className="text-[10px] text-gray-500">
          {equippedOn ? `Equipped on ${equippedOn.name}` : "Unequipped"}
        </div>

        <div className="border-t border-white/[0.06] pt-2">
          <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">Blockchain</div>
          <div className="text-[9px] text-gray-600 space-y-0.5 font-mono break-all">
            <div>ID: {item.id}</div>
            <div>Type: {item.type}</div>
            <div>Color: {item.color}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-gray-500 uppercase tracking-wider">
          {asset.type === "hero" ? "Hero Detail" : asset.type === "equipment" ? "Equipment Detail" : "Cosmetic Detail"}
        </span>
        <button onClick={onClose} className="text-[10px] text-gray-500 hover:text-gray-300">✕</button>
      </div>
      {asset.type === "hero" && renderHeroDetail(asset.data as Hero)}
      {asset.type === "equipment" && renderEquipDetail(asset.data as Equipment)}
      {asset.type === "cosmetic" && renderCosmeticDetail(asset.data as Cosmetic)}
    </div>
  );
}
