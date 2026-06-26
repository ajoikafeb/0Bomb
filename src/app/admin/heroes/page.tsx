"use client";

import { useState, useCallback } from "react";
import { getHeroes, adminGiveXP, adminSetLevel, adminDeleteHero } from "@/lib/game/GameStateManager";
import { GlassCard, AdminSearchBar, Badge } from "@/components/admin/StatCard";
import type { Hero } from "@/lib/game/types";

function HeroCard({ hero, onAction }: { hero: Hero; onAction: (msg: string) => void }) {
  const [xpInput, setXpInput] = useState("");

  const rarityColor: Record<string, string> = {
    Legendary: "yellow", Epic: "purple", Rare: "blue", Common: "cyan",
  };

  return (
    <div className="bg-black/30 rounded-lg p-3 border border-white/[0.04] hover:border-cyan-500/20 transition-all">
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="text-sm font-bold text-cyan-300">{hero.name}</span>
          <Badge color={rarityColor[hero.rarity] || "cyan"}>{hero.rarity}</Badge>
        </div>
        <span className="text-[10px] font-mono text-gray-500">#{hero.id}</span>
      </div>
      <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-gray-400 mb-2">
        <span>Lv.{hero.level} {hero.class}</span>
        <span>Owner: {hero.owner_address?.slice(0, 6) || "-"}...</span>
        <span>Generation: {hero.generation}</span>
        <span>Alive: {hero.is_alive ? "✅" : "💀"}</span>
        <span>Energy: {hero.energy}/{hero.max_energy}</span>
        <span>XP: {hero.xp.toLocaleString()}</span>
      </div>
      <div className="flex gap-1 items-center mt-2 pt-2 border-t border-white/[0.04]">
        <input type="number" value={xpInput} onChange={e => setXpInput(e.target.value)} placeholder="XP"
          className="w-14 p-1 bg-black/50 border border-gray-700 rounded text-[9px] text-gray-300" />
        <button onClick={() => { const v = parseInt(xpInput); if (v) { adminGiveXP(hero.id, v); setXpInput(""); onAction(`Gave ${v} XP`); } }}
          className="px-2 py-1 text-[9px] bg-cyan-700 rounded text-white hover:bg-cyan-600">Add XP</button>
        <button onClick={() => { adminSetLevel(hero.id, hero.level + 1); onAction(`Level up to ${hero.level + 1}`); }}
          className="px-2 py-1 text-[9px] bg-purple-700 rounded text-white hover:bg-purple-600">+1 Lv</button>
        <button onClick={() => { if (confirm(`Delete ${hero.name}?`)) { adminDeleteHero(hero.id); onAction("Deleted"); } }}
          className="px-2 py-1 text-[9px] bg-red-700 rounded text-white hover:bg-red-600 ml-auto">Delete</button>
      </div>
    </div>
  );
}

export default function AdminHeroes() {
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const t = useCallback((s: string) => { setToast(s); setTimeout(() => setToast(null), 2500); }, []);

  let heroes = getHeroes();
  if (search) {
    const q = search.toLowerCase();
    heroes = heroes.filter(h =>
      h.owner_address?.toLowerCase().includes(q) ||
      h.name?.toLowerCase().includes(q) ||
      h.id.toString().includes(q) ||
      h.class?.toLowerCase().includes(q) ||
      h.rarity?.toLowerCase().includes(q)
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 bg-gray-900 border border-cyan-500/50 rounded shadow-lg text-xs text-cyan-300 font-mono animate-pulse">
          {toast}
        </div>
      )}

      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Hero Database</h1>
        <Badge color="cyan">{heroes.length} heroes</Badge>
        <Badge color="green">{heroes.filter(h => h.is_alive).length} alive</Badge>
      </div>

      <GlassCard>
        <AdminSearchBar value={search} onChange={setSearch} placeholder="Search by wallet, name, ID, class, rarity..." />
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {heroes.map(h => <HeroCard key={h.id} hero={h} onAction={t} />)}
        {heroes.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-600 text-sm">No heroes found</div>
        )}
      </div>
    </div>
  );
}
