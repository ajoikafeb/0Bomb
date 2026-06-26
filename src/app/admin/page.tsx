"use client";

import { useAdminData, useRealtimeStats } from "@/lib/admin/useAdminData";
import { getAdminConfig, updateAdminConfig } from "@/lib/game/GameStateManager";
import { StatCard, GlassCard, Badge } from "@/components/admin/StatCard";

function EmergencyBanner() {
  const cfg = getAdminConfig();
  const emergencies: string[] = [];
  if (cfg.rewardsPaused) emergencies.push("Rewards Paused");
  if (cfg.marketplacePaused) emergencies.push("Marketplace Paused");
  if (cfg.tradingPaused) emergencies.push("Trading Paused");
  if (cfg.globalMaintenance) emergencies.push("Global Maintenance");
  if (emergencies.length === 0) return null;
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-red-600/10 border border-red-500/20 rounded-lg mb-4 animate-pulse">
      <span className="text-red-400 text-xs font-bold">⚠ Emergency:</span>
      {emergencies.map(e => <Badge key={e} color="red">{e}</Badge>)}
    </div>
  );
}

function QuickActions() {
  return (
    <GlassCard title="Quick Actions">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <a href="/admin/players" className="px-3 py-2 text-[10px] font-mono bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400 hover:bg-cyan-500/20 transition-colors text-center">
          👥 Find Player
        </a>
        <a href="/admin/economy" className="px-3 py-2 text-[10px] font-mono bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400 hover:bg-purple-500/20 transition-colors text-center">
          💰 Economy
        </a>
        <a href="/admin/giveaway" className="px-3 py-2 text-[10px] font-mono bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-400 hover:bg-orange-500/20 transition-colors text-center">
          🎁 Giveaway
        </a>
        <a href="/admin/settings" className="px-3 py-2 text-[10px] font-mono bg-gray-500/10 border border-gray-500/20 rounded-lg text-gray-400 hover:bg-gray-500/20 transition-colors text-center">
          ⚙️ Settings
        </a>
      </div>
    </GlassCard>
  );
}

export default function AdminOverview() {
  const { aliveHeroes, totalHeroes, totalPlayers, totalMinted, avgLevel, marketplaceVolume, activeListings, cfg } = useAdminData();
  const stats = useRealtimeStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Admin Overview</h1>
        <Badge color="cyan">Developer Mode</Badge>
        <Badge color={cfg.globalMaintenance ? "red" : "green"}>{cfg.globalMaintenance ? "Maintenance ON" : "Live"}</Badge>
      </div>

      <EmergencyBanner />
      <QuickActions />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard label="Heroes Alive" value={aliveHeroes} color="cyan" icon="👤" />
        <StatCard label="Total Heroes" value={totalHeroes} color="blue" icon="👥" />
        <StatCard label="Players" value={totalPlayers} color="green" icon="🎮" />
        <StatCard label="Items Minted" value={totalMinted} color="purple" icon="🖼️" />
        <StatCard label="Avg Hero Level" value={avgLevel.toFixed(1)} color="yellow" icon="📊" />
        <StatCard label="Total Items" value={stats.items} color="red" icon="⚔️" />
        <StatCard label="Total Supply" value={stats.supply} color="orange" icon="💎" suffix="$0BOMB" />
        <StatCard label="Marketplace Vol" value={marketplaceVolume.toFixed(2)} color="pink" icon="🏪" suffix="$0BOMB" />
        <StatCard label="Active Listings" value={activeListings.length} color="cyan" icon="📋" />
        <StatCard label="Reward Multiplier" value={`${cfg.rewardMultiplier}x`} color="green" icon="💰" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Online" value={stats.online} color="green" icon="🟢" />
        <StatCard label="Wallets" value={stats.wallets} color="cyan" icon="👛" />
        <StatCard label="Battles" value={stats.battles} color="orange" icon="⚔️" />
        <StatCard label="Fragments Supply" value={stats.fragments} color="purple" icon="💠" />
      </div>

      <GlassCard title="Quick Config Toggles">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { key: "globalMaintenance" as const, label: "Maintenance Mode", color: "red" },
            { key: "rewardsPaused" as const, label: "Pause Rewards", color: "orange" },
            { key: "marketplacePaused" as const, label: "Pause Marketplace", color: "yellow" },
            { key: "tradingPaused" as const, label: "Pause Trading", color: "purple" },
          ].map(item => (
            <button key={item.key} onClick={() => updateAdminConfig({ [item.key]: !cfg[item.key] })}
              className={`px-3 py-3 text-[10px] font-mono rounded-lg border transition-all text-center ${
                cfg[item.key]
                  ? `bg-red-600/10 border-red-500/20 text-red-400`
                  : `bg-gray-800/30 border-gray-700 text-gray-500 hover:border-gray-600`
              }`}>
              <div className={cfg[item.key] ? "text-red-400" : ""}>{cfg[item.key] ? "●" : "○"}</div>
              <div className="mt-0.5">{item.label}</div>
            </button>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
