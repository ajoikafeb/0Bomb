"use client";

import { getHeroes, getInventory, getCosmetics, getActiveListings, getTransactions } from "@/lib/game/GameStateManager";
import { GlassCard, StatCard, Badge } from "@/components/admin/StatCard";

export default function AdminAnalytics() {
  const heroes = getHeroes();
  const inv = getInventory();
  const cos = getCosmetics();
  const listings = getActiveListings();
  const tx = getTransactions();

  const classCounts: Record<string, number> = {};
  const rarityCounts: Record<string, number> = {};

  for (const h of heroes) {
    classCounts[h.class] = (classCounts[h.class] || 0) + 1;
    rarityCounts[h.rarity] = (rarityCounts[h.rarity] || 0) + 1;
  }

  const topClass = Object.entries(classCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Analytics</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Heroes" value={heroes.length} color="cyan" />
        <StatCard label="Equipment" value={inv.length} color="purple" />
        <StatCard label="Cosmetics" value={cos.length} color="pink" />
        <StatCard label="Avg Level" value={heroes.length > 0 ? (heroes.reduce((s, h) => s + h.level, 0) / heroes.length).toFixed(1) : "0"} color="yellow" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard title="Hero Class Distribution">
          <div className="space-y-2">
            {topClass.map(([cls, count]) => (
              <div key={cls} className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-gray-400 w-20">{cls}</span>
                <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-cyan-500 h-full rounded-full transition-all" style={{ width: `${(count / heroes.length) * 100}%` }} />
                </div>
                <span className="text-[10px] font-mono text-cyan-400 w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard title="Hero Rarity Distribution">
          <div className="space-y-2">
            {Object.entries(rarityCounts).sort(([, a], [, b]) => b - a).map(([rarity, count]) => (
              <div key={rarity} className="flex items-center gap-2">
                <Badge color={
                  rarity === "Legendary" ? "yellow" : rarity === "Epic" ? "purple" :
                  rarity === "Rare" ? "blue" : "cyan"
                }>{rarity}</Badge>
                <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-cyan-500 h-full rounded-full transition-all" style={{ width: `${(count / heroes.length) * 100}%` }} />
                </div>
                <span className="text-[10px] font-mono text-cyan-400 w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard title="Economy">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-black/30 rounded p-3">
            <div className="text-[9px] text-gray-500">Equipment Items</div>
            <div className="text-sm font-bold text-cyan-400">{inv.length}</div>
          </div>
          <div className="bg-black/30 rounded p-3">
            <div className="text-[9px] text-gray-500">Cosmetics</div>
            <div className="text-sm font-bold text-purple-400">{cos.length}</div>
          </div>
          <div className="bg-black/30 rounded p-3">
            <div className="text-[9px] text-gray-500">Active Listings</div>
            <div className="text-sm font-bold text-yellow-400">{listings.length}</div>
          </div>
          <div className="bg-black/30 rounded p-3">
            <div className="text-[9px] text-gray-500">Transactions</div>
            <div className="text-sm font-bold text-gray-400">{tx.length}</div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
