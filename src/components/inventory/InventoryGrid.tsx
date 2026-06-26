"use client";

import { useState, useMemo } from "react";
import type { InventoryTab, SortOption, EquipFilter } from "./types";
import type { Hero } from "@/lib/game/types";
import type { Equipment } from "@/lib/game/equipmentSystem";
import type { Cosmetic } from "@/lib/game/cosmeticSystem";
import { HeroCard, EquipmentCard, CosmeticCard, EmptyState } from "./InventoryCard";


const ITEMS_PER_PAGE = 12;

export function InventoryGrid({
  tab,
  heroes,
  equipment,
  cosmetics,
  inventory,
  heroIds,
  search,
  rarityFilter,
  classFilter,
  slotFilter,
  equipFilter,
  sortOption,
  onEquip,
  onUnequip,
  onAutoEquip,
  onUnequipAll,
  onSelectHero,
  onSelectEquip,
  onSelectCosmetic,
}: {
  tab: InventoryTab;
  heroes: Hero[];
  equipment: Equipment[];
  cosmetics: Cosmetic[];
  inventory: Equipment[];
  heroIds: Set<string>;
  search: string;
  rarityFilter: string;
  classFilter: string;
  slotFilter: string;
  equipFilter: EquipFilter;
  sortOption: SortOption;
  onEquip: (heroId: string, item: Equipment) => void;
  onUnequip: (heroId: string, slot: string) => void;
  onAutoEquip: (heroId: string) => void;
  onUnequipAll: (heroId: string) => void;
  onSelectHero: (hero: Hero) => void;
  onSelectEquip: (item: Equipment) => void;
  onSelectCosmetic: (item: Cosmetic) => void;
}) {
  const [page, setPage] = useState(1);

  const filteredHeroes = useMemo(() => {
    let h = heroes;
    if (search) h = h.filter(hero => hero.name.toLowerCase().includes(search.toLowerCase()) || hero.id.includes(search));
    if (rarityFilter) h = h.filter(hero => hero.rarity === rarityFilter);
    if (classFilter) h = h.filter(hero => hero.class === classFilter);
    h = sortItems(h, sortOption, "hero");
    return h;
  }, [heroes, search, rarityFilter, classFilter, sortOption]);

  const filteredEquipment = useMemo(() => {
    let e = equipment;
    if (equipFilter === "equipped") e = e.filter(item => item.owner && heroIds.has(item.owner));
    else if (equipFilter === "unequipped") e = e.filter(item => !item.owner || item.owner === "");
    if (search) e = e.filter(item => item.name.toLowerCase().includes(search.toLowerCase()) || item.id.includes(search));
    if (rarityFilter) e = e.filter(item => item.rarity === rarityFilter);
    if (slotFilter) e = e.filter(item => item.slot === slotFilter);
    e = sortItems(e, sortOption, "equipment");
    return e;
  }, [equipment, search, rarityFilter, slotFilter, equipFilter, heroIds, sortOption]);

  const filteredCosmetics = useMemo(() => {
    let c = cosmetics;
    if (search) c = c.filter(cos => cos.name.toLowerCase().includes(search.toLowerCase()) || cos.id.includes(search));
    if (rarityFilter) c = c.filter(cos => cos.rarity === rarityFilter);
    c = sortItems(c, sortOption, "cosmetic");
    return c;
  }, [cosmetics, search, rarityFilter, sortOption]);

  const { items: heroPage, totalPages: heroTotalPages } = paginate(filteredHeroes, page);
  const { items: equipPage, totalPages: equipTotalPages } = paginate(filteredEquipment, page);
  const { items: cosPage, totalPages: cosTotalPages } = paginate(filteredCosmetics, page);

  useMemo(() => {
    setPage(1);
  }, [search, rarityFilter, classFilter, slotFilter, equipFilter, sortOption, tab]);

  const totalPages = tab === "heroes" ? heroTotalPages : tab === "equipment" ? equipTotalPages : cosTotalPages;

  const renderContent = () => {
    switch (tab) {
      case "heroes":
        return heroPage.length === 0 ? (
          <EmptyState message="No heroes found. Hatch one in the Game page." />
        ) : (
          <div className="space-y-2">
            {heroPage.map(hero => {
              const eqSlots = Object.entries(hero.equipment).filter(([, v]) => v);
              return (
                <HeroCard
                  key={hero.id}
                  hero={hero}
                  equippedCount={eqSlots.length}
                  totalSlots={Object.keys(hero.equipment).length}
                  onAutoEquip={() => onAutoEquip(hero.id)}
                  onUnequipAll={() => onUnequipAll(hero.id)}
                  onSelect={() => onSelectHero(hero)}
                />
              );
            })}
          </div>
        );

      case "equipment":
        return equipPage.length === 0 ? (
          <EmptyState message="No equipment found" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {equipPage.map(item => {
              const equippedOn = item.owner && heroIds.has(item.owner) ? heroes.find(h => h.id === item.owner) : null;
              return (
                <EquipmentCard
                  key={item.id}
                  item={item}
                  equippedOn={equippedOn?.name || null}
                  heroes={heroes}
                  onEquip={heroId => onEquip(heroId, item)}
                  onUnequip={() => equippedOn && onUnequip(equippedOn.id, item.slot)}
                  onSelect={() => onSelectEquip(item)}
                />
              );
            })}
          </div>
        );

      case "cosmetics":
        return cosPage.length === 0 ? (
          <EmptyState message="No cosmetics found" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {cosPage.map(item => {
              const equippedOn = item.owner && heroIds.has(item.owner) ? heroes.find(h => h.id === item.owner) : null;
              return (
                <CosmeticCard
                  key={item.id}
                  item={item}
                  equippedOn={equippedOn?.name || null}
                  onSelect={() => onSelectCosmetic(item)}
                />
              );
            })}
          </div>
        );

      default:
        return <EmptyState message={`${tab} section coming soon`} />;
    }
  };

  return (
    <div>
      {renderContent()}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 pb-1 text-[11px]">
          <div className="text-gray-500">Page {page} / {totalPages}</div>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
              className={`px-2 py-1 rounded border text-[10px] ${page <= 1 ? "border-gray-700 text-gray-600" : "border-gray-600 text-gray-300 hover:border-gray-400"}`}
            >Prev</button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
              className={`px-2 py-1 rounded border text-[10px] ${page >= totalPages ? "border-gray-700 text-gray-600" : "border-gray-600 text-gray-300 hover:border-gray-400"}`}
            >Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

function paginate<T>(items: T[], page: number): { items: T[]; totalPages: number } {
  const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));
  const start = (page - 1) * ITEMS_PER_PAGE;
  return { items: items.slice(start, start + ITEMS_PER_PAGE), totalPages };
}

function sortItems<T extends { id: string; name?: string; rarity?: string; level?: number; created_at?: string }>(
  items: T[],
  sort: SortOption,
  type: "hero" | "equipment" | "cosmetic",
): T[] {
  const sorted = [...items];
  const rarityOrder = ["Common", "Rare", "Epic", "Legendary", "Mythic", "Genesis"];

  switch (sort) {
    case "newest":
      return sorted.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
    case "oldest":
      return sorted.sort((a, b) => (a.created_at || "").localeCompare(b.created_at || ""));
    case "rarity_desc":
      return sorted.sort((a, b) => rarityOrder.indexOf(b.rarity || "") - rarityOrder.indexOf(a.rarity || ""));
    case "rarity_asc":
      return sorted.sort((a, b) => rarityOrder.indexOf(a.rarity || "") - rarityOrder.indexOf(b.rarity || ""));
    case "name_asc":
      return sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    case "name_desc":
      return sorted.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
    case "level_desc":
      return sorted.sort((a, b) => (b as any).level - (a as any).level);
    case "level_asc":
      return sorted.sort((a, b) => (a as any).level - (b as any).level);
    default:
      return sorted;
  }
}
