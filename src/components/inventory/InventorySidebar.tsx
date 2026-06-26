"use client";

import type { InventoryTab } from "./types";

interface SidebarEntry {
  key: InventoryTab;
  label: string;
  count: number;
  icon: string;
}

export function InventorySidebar({
  tabs,
  activeTab,
  onTabChange,
  totalNfts,
}: {
  tabs: SidebarEntry[];
  activeTab: InventoryTab;
  onTabChange: (tab: InventoryTab) => void;
  totalNfts: number;
}) {
  return (
    <div className="space-y-1">
      <div className="text-[9px] uppercase tracking-widest text-gray-600 mb-2 px-2">Categories</div>
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => onTabChange(t.key)}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] rounded-lg transition-all ${
            activeTab === t.key
              ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
              : "text-gray-400 hover:text-gray-300 hover:bg-white/[0.03] border border-transparent"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-[12px]">{t.icon}</span>
            <span>{t.label}</span>
          </div>
          <span className={`text-[10px] ${activeTab === t.key ? "text-cyan-400" : "text-gray-600"}`}>
            {t.count}
          </span>
        </button>
      ))}

      <div className="mt-4 pt-3 border-t border-white/[0.06] space-y-1.5 px-2">
        <div className="text-[9px] uppercase tracking-widest text-gray-600 mb-1">Storage</div>
        <div className="text-[10px] text-gray-400">
          <span className="text-cyan-300 font-bold">{totalNfts}</span>
          <span className="text-gray-600"> NFTs</span>
        </div>
        <div className="text-[9px] text-gray-600">Wallet Storage</div>
      </div>
    </div>
  );
}

export function createSidebarTabs(
  heroes: number,
  equipment: number,
  equipped: number,
  cosmetics: number,
  legacy: number,
  badges: number,
  materials: number,
  seeds: number,
  consumables: number,
): SidebarEntry[] {
  return [
    { key: "heroes", label: "Heroes", count: heroes, icon: "⚔" },
    { key: "equipment", label: "Equipment", count: equipment, icon: "⚙" },
    { key: "cosmetics", label: "Cosmetics", count: cosmetics, icon: "✦" },
    { key: "legacy", label: "Legacy Cores", count: legacy, icon: "◆" },
    { key: "badges", label: "Badges", count: badges, icon: "🏅" },
    { key: "materials", label: "Materials", count: materials, icon: "■" },
    { key: "seeds", label: "Seeds", count: seeds, icon: "◆" },
    { key: "consumables", label: "Consumables", count: consumables, icon: "●" },
    { key: "currencies", label: "Currencies", count: 0, icon: "💰" },
  ];
}
