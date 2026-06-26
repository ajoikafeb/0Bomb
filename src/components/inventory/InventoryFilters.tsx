"use client";

import { EQUIPMENT_SLOTS, HERO_CLASSES } from "@/lib/game/constants";
import type { InventoryTab, EquipFilter, SortOption, Rarity } from "./types";

const RARITY_OPTIONS: Rarity[] = ["Common", "Rare", "Epic", "Legendary", "Mythic", "Genesis"];

export function InventoryFilters({
  tab,
  search,
  onSearchChange,
  rarityFilter,
  onRarityChange,
  classFilter,
  onClassChange,
  slotFilter,
  onSlotChange,
  equipFilter,
  onEquipFilterChange,
  sortOption,
  onSortChange,
}: {
  tab: InventoryTab;
  search: string;
  onSearchChange: (v: string) => void;
  rarityFilter: string;
  onRarityChange: (v: string) => void;
  classFilter: string;
  onClassChange: (v: string) => void;
  slotFilter: string;
  onSlotChange: (v: string) => void;
  equipFilter: EquipFilter;
  onEquipFilterChange: (v: EquipFilter) => void;
  sortOption: SortOption;
  onSortChange: (v: SortOption) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <input
        type="text"
        value={search}
        onChange={e => onSearchChange(e.target.value)}
        placeholder={`Search ${tab}...`}
        className="flex-1 min-w-[140px] px-2.5 py-1.5 text-[11px] bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/40"
      />

      <select value={rarityFilter} onChange={e => onRarityChange(e.target.value)}
        className="px-2 py-1.5 text-[10px] bg-white/[0.05] border border-white/[0.1] rounded-lg text-gray-300 focus:outline-none focus:border-cyan-500/40"
      >
        <option value="">All Rarities</option>
        {RARITY_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
      </select>

      {(tab === "heroes") && (
        <select value={classFilter} onChange={e => onClassChange(e.target.value)}
          className="px-2 py-1.5 text-[10px] bg-white/[0.05] border border-white/[0.1] rounded-lg text-gray-300 focus:outline-none focus:border-cyan-500/40"
        >
          <option value="">All Classes</option>
          {HERO_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      )}

      {(tab === "equipment" || tab === "cosmetics") && (
        <>
          {(tab === "equipment") && (
            <>
              <select value={equipFilter} onChange={e => onEquipFilterChange(e.target.value as EquipFilter)}
                className="px-2 py-1.5 text-[10px] bg-white/[0.05] border border-white/[0.1] rounded-lg text-gray-300 focus:outline-none focus:border-cyan-500/40"
              >
                <option value="all">All</option>
                <option value="unequipped">Unequipped</option>
                <option value="equipped">Equipped</option>
              </select>

              <select value={slotFilter} onChange={e => onSlotChange(e.target.value)}
                className="px-2 py-1.5 text-[10px] bg-white/[0.05] border border-white/[0.1] rounded-lg text-gray-300 focus:outline-none focus:border-cyan-500/40"
              >
                <option value="">All Slots</option>
                {EQUIPMENT_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </>
          )}
        </>
      )}

      <select value={sortOption} onChange={e => onSortChange(e.target.value as SortOption)}
        className="px-2 py-1.5 text-[10px] bg-white/[0.05] border border-white/[0.1] rounded-lg text-gray-300 focus:outline-none focus:border-cyan-500/40"
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="rarity_desc">Rarity ↓</option>
        <option value="rarity_asc">Rarity ↑</option>
        <option value="name_asc">Name A-Z</option>
        <option value="name_desc">Name Z-A</option>
        {tab === "heroes" && <option value="level_desc">Level ↓</option>}
        {tab === "heroes" && <option value="level_asc">Level ↑</option>}
      </select>
    </div>
  );
}
