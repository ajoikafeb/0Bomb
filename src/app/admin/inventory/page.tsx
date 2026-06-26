"use client";

import { useState } from "react";
import { getInventory, getCosmetics, adminTransferItem } from "@/lib/game/GameStateManager";
import { GlassCard, AdminSearchBar, Badge } from "@/components/admin/StatCard";

export default function AdminInventory() {
  const [filter, setFilter] = useState<"all" | "equipment" | "cosmetic">("all");
  const [search, setSearch] = useState("");

  const equipment = getInventory();
  const cosmetics = getCosmetics();

  let items: any[] = [];
  if (filter === "all" || filter === "equipment") {
    items = [...equipment.map(e => ({ ...e, _type: "equipment" as const }))];
  }
  if (filter === "all" || filter === "cosmetic") {
    items = [...items, ...cosmetics.map(c => ({ ...c, _type: "cosmetic" as const }))];
  }

  if (search) {
    const q = search.toLowerCase();
    items = items.filter(i =>
      i.name?.toLowerCase().includes(q) ||
      i.owner?.toLowerCase().includes(q) ||
      i.rarity?.toLowerCase().includes(q) ||
      i._type?.includes(q)
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Inventory Database</h1>
        <Badge color="cyan">{equipment.length} equipment</Badge>
        <Badge color="purple">{cosmetics.length} cosmetics</Badge>
      </div>

      <GlassCard>
        <div className="flex gap-3">
          <AdminSearchBar value={search} onChange={setSearch} placeholder="Search by name, owner, rarity..." />
          <div className="flex gap-1">
            {(["all", "equipment", "cosmetic"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-[10px] font-mono rounded-lg transition-colors ${
                  filter === f ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/20" : "text-gray-500 hover:text-gray-300"
                }`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-[9px] font-mono text-gray-500 uppercase py-2 px-2">Type</th>
                <th className="text-[9px] font-mono text-gray-500 uppercase py-2 px-2">Name</th>
                <th className="text-[9px] font-mono text-gray-500 uppercase py-2 px-2">Rarity</th>
                <th className="text-[9px] font-mono text-gray-500 uppercase py-2 px-2">Owner</th>
                <th className="text-[9px] font-mono text-gray-500 uppercase py-2 px-2">Slot / Type</th>
              </tr>
            </thead>
            <tbody>
              {items.slice(0, 200).map((item, i) => (
                <tr key={`${item._type}-${item.id || i}`} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="py-2 px-2">
                    <Badge color={item._type === "equipment" ? "cyan" : "purple"}>{item._type}</Badge>
                  </td>
                  <td className="py-2 px-2 text-xs font-mono text-gray-300">{item.name}</td>
                  <td className="py-2 px-2">
                    <Badge color={
                      item.rarity === "Legendary" ? "yellow" : item.rarity === "Epic" ? "purple" :
                      item.rarity === "Rare" ? "blue" : item.rarity === "Mythic" ? "orange" : "cyan"
                    }>{item.rarity}</Badge>
                  </td>
                  <td className="py-2 px-2 text-xs font-mono text-gray-500">{item.owner?.slice(0, 8) || "-"}...</td>
                  <td className="py-2 px-2 text-[10px] text-gray-500">{item.slot || item.type || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && (
            <div className="py-8 text-center text-xs text-gray-600">No items found</div>
          )}
          {items.length > 200 && (
            <div className="py-2 text-center text-[9px] text-gray-600">Showing 200 of {items.length} items</div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
