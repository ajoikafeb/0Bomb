"use client";

import { useState, useEffect } from "react";
import { getAdminConfig, updateAdminConfig, getTokenBalance } from "@/lib/game/GameStateManager";
import { isSyncEnabled } from "@/lib/supabase/sync";
import { GlassCard, StatCard } from "@/components/admin/StatCard";

export default function AdminEconomy() {
  const cfg = getAdminConfig();
  const [localCfg, setLocalCfg] = useState(cfg);
  const [remoteSupply, setRemoteSupply] = useState<number | null>(null);

  useEffect(() => {
    if (isSyncEnabled()) {
      import("@/lib/supabase/client").then(({ getSupabase }) => {
        getSupabase().from("profiles").select("spout_balance").then(({ data }) => {
          if (data) {
            const total = data.reduce((s, p) => s + Number(p.spout_balance || 0), 0);
            setRemoteSupply(total);
          }
        });
      });
    }
  }, []);

  const saveCfg = (partial: Partial<typeof cfg>) => {
    const updated = { ...localCfg, ...partial };
    setLocalCfg(updated);
    updateAdminConfig(partial);
  };

  const [roiPlayers, setRoiPlayers] = useState("100");
  const [roiHeroes, setRoiHeroes] = useState("250");
  const [roiRewardRate, setRoiRewardRate] = useState("1");
  const [roiConversion, setRoiConversion] = useState("0.5");

  const dailyEmission = (parseInt(roiPlayers) || 0) * (parseInt(roiHeroes) || 0) * (parseFloat(roiRewardRate) || 0) * 10;
  const weeklyEmission = dailyEmission * 7;
  const monthlyEmission = dailyEmission * 30;
  const roiEstimation = (parseFloat(roiConversion) || 0) > 0 ? ((dailyEmission * 0.3) / ((parseInt(roiPlayers) || 1) * (parseFloat(roiConversion) || 1))).toFixed(2) : "0";
  const inflationRisk = monthlyEmission > 1000000 ? "High" : monthlyEmission > 500000 ? "Medium" : "Low";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Economy Panel</h1>
        {remoteSupply !== null && <span className="text-[9px] text-cyan-500">● live</span>}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="$0BOMB Supply" value={(remoteSupply ?? getTokenBalance()).toLocaleString()} color="cyan" icon="🪙" />
        <StatCard label="Reward Multiplier" value={`${localCfg.rewardMultiplier}x`} color="green" icon="📈" />
        <StatCard label="Marketplace Fee" value={`${(localCfg.marketplaceFee * 100).toFixed(1)}%`} color="pink" icon="🏪" />
        <StatCard label="Event Multiplier" value={`${localCfg.eventRewardMultiplier}x`} color="purple" icon="🎉" />
      </div>

      <GlassCard title="Drop Rates & Multipliers">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { key: "rewardMultiplier" as const, label: "Reward Multiplier", min: 0, max: 10, step: 0.1, suffix: "x" },
            { key: "currencyDropRate" as const, label: "Currency Drop Rate", min: 0, max: 5, step: 0.1, suffix: "x" },
            { key: "equipmentDropRate" as const, label: "Equipment Drop Rate", min: 0, max: 5, step: 0.1, suffix: "x" },
            { key: "cosmeticDropRate" as const, label: "Cosmetic Drop Rate", min: 0, max: 5, step: 0.1, suffix: "x" },
            { key: "rareLootDropRate" as const, label: "Rare Loot Drop Rate", min: 0, max: 5, step: 0.1, suffix: "x" },
            { key: "eventRewardMultiplier" as const, label: "Event Reward Multiplier", min: 0, max: 10, step: 0.1, suffix: "x" },
            { key: "marketplaceFee" as const, label: "Marketplace Fee", min: 0, max: 0.5, step: 0.005, suffix: "%", display: (v: number) => `${(v * 100).toFixed(1)}%` },
          ].map(item => {
            const val = localCfg[item.key] as number;
            const display = item.display ? item.display(val) : `${val}${item.suffix}`;
            return (
              <div key={item.key} className="bg-black/30 rounded-lg p-4 border border-white/[0.04]">
                <label className="text-[10px] font-mono text-gray-400 mb-2 block">{item.label}</label>
                <div className="flex items-center gap-2">
                  <input type="range" min={item.min} max={item.max} step={item.step}
                    value={val} onChange={e => saveCfg({ [item.key]: parseFloat(e.target.value) })}
                    className="flex-1 accent-cyan-500 h-1" />
                  <span className="text-xs font-mono text-cyan-400 w-14 text-right">{display}</span>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      <GlassCard title="📈 ROI Simulator">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            { label: "Active Players", val: roiPlayers, set: setRoiPlayers },
            { label: "Hero Count", val: roiHeroes, set: setRoiHeroes },
            { label: "Reward Rate (x)", val: roiRewardRate, set: setRoiRewardRate },
            { label: "Conversion Rate", val: roiConversion, set: setRoiConversion },
          ].map(item => (
            <div key={item.label}>
              <label className="text-[9px] text-gray-400 block mb-1">{item.label}</label>
              <input type="number" value={item.val} onChange={e => item.set(e.target.value)}
                className="w-full p-1.5 bg-black/50 border border-gray-700 rounded text-[10px] text-gray-300" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            { label: "Daily Emission", val: dailyEmission.toLocaleString() },
            { label: "Weekly Emission", val: weeklyEmission.toLocaleString() },
            { label: "Monthly Emission", val: monthlyEmission.toLocaleString() },
            { label: "ROI Est. (days)", val: roiEstimation },
            { label: "Inflation Risk", val: inflationRisk },
            { label: "Daily Burn", val: (dailyEmission * 0.15).toFixed(0) },
          ].map(item => (
            <div key={item.label} className="bg-black/30 rounded p-2">
              <div className="text-[9px] text-gray-500">{item.label}</div>
              <div className="text-sm font-bold text-cyan-400">{item.val}</div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
