"use client";

import { useState, useCallback } from "react";
import { getAdminConfig } from "@/lib/game/GameStateManager";
import { getGameResult } from "@/lib/game/AIDecisionEngine";
import { GlassCard, Badge } from "@/components/admin/StatCard";

export default function AdminMaps() {
  const [toast, setToast] = useState<string | null>(null);
  const t = useCallback((s: string) => { setToast(s); setTimeout(() => setToast(null), 2500); }, []);

  // Read current difficulty config
  const cfg = getAdminConfig();

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 bg-gray-900 border border-cyan-500/50 rounded shadow-lg text-xs text-cyan-300 font-mono animate-pulse">
          {toast}
        </div>
      )}

      <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Map Manager</h1>

      <GlassCard title="🗺️ Map Configuration">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-black/30 rounded-lg p-4 border border-white/[0.04]">
            <div className="text-xs font-bold text-cyan-400 mb-2">Easy</div>
            <div className="text-[10px] text-gray-500">Standard map layout, fewer enemies, basic loot</div>
          </div>
          <div className="bg-black/30 rounded-lg p-4 border border-white/[0.04]">
            <div className="text-xs font-bold text-yellow-400 mb-2">Advanced</div>
            <div className="text-[10px] text-gray-500">Tougher enemies, better loot, larger maps</div>
          </div>
          <div className="bg-black/30 rounded-lg p-4 border border-white/[0.04]">
            <div className="text-xs font-bold text-red-400 mb-2">Nightmare</div>
            <div className="text-[10px] text-gray-500">Maximum difficulty, elite enemies, best rewards</div>
          </div>
        </div>
      </GlassCard>

      <GlassCard title="Current Modifiers">
        <div className="space-y-2 text-xs text-gray-400">
          <div>Reward Multiplier: <span className="text-cyan-400">{cfg.rewardMultiplier}x</span></div>
          <div>Event Multiplier: <span className="text-cyan-400">{cfg.eventRewardMultiplier}x</span></div>
          <div>Maintenance: <span className={cfg.globalMaintenance ? "text-red-400" : "text-green-400"}>{cfg.globalMaintenance ? "ON" : "OFF"}</span></div>
        </div>
      </GlassCard>
    </div>
  );
}
