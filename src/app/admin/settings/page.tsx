"use client";

import { useState, useCallback } from "react";
import { getAdminConfig, updateAdminConfig, adminBroadcast, adminGlobalReset, getExportData, isEmergencyShutdown } from "@/lib/game/GameStateManager";
import { GlassCard, Badge } from "@/components/admin/StatCard";

export default function AdminSettings() {
  const cfg = getAdminConfig();
  const emergency = isEmergencyShutdown();
  const [toast, setToast] = useState<string | null>(null);
  const t = useCallback((s: string) => { setToast(s); setTimeout(() => setToast(null), 2500); }, []);

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 bg-gray-900 border border-cyan-500/50 rounded shadow-lg text-xs text-cyan-300 font-mono animate-pulse">
          {toast}
        </div>
      )}

      <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Settings</h1>

      <GlassCard title="🔧 System Toggles">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { key: "globalMaintenance", label: "Maintenance Mode", desc: "Blocks all gameplay" },
            { key: "rewardsPaused", label: "Pause Rewards", desc: "No claimable rewards" },
            { key: "marketplacePaused", label: "Pause Marketplace", desc: "No new listings" },
            { key: "tradingPaused", label: "Pause Trading", desc: "No trades" },
          ].map(item => {
            const k = item.key as keyof typeof cfg;
            const val = cfg[k] as boolean;
            return (
              <button key={item.key} onClick={() => updateAdminConfig({ [k]: !val })}
                className={`p-4 rounded-lg border transition-all text-left ${
                  val ? "bg-red-600/10 border-red-500/20" : "bg-gray-800/30 border-gray-700 hover:border-gray-600"
                }`}>
                <div className={`text-xs font-bold mb-1 ${val ? "text-red-400" : "text-gray-400"}`}>
                  {val ? "● ON" : "○ OFF"}
                </div>
                <div className={`text-[10px] font-mono ${val ? "text-red-300" : "text-gray-300"}`}>{item.label}</div>
                <div className="text-[9px] text-gray-600 mt-0.5">{item.desc}</div>
              </button>
            );
          })}
        </div>
      </GlassCard>

      <GlassCard title="🚨 Emergency Controls">
        <div className="space-y-2">
          {emergency.marketplace && <Badge color="red">Marketplace Emergency</Badge>}
          {emergency.rewards && <Badge color="red">Rewards Emergency</Badge>}
          {emergency.trading && <Badge color="red">Trading Emergency</Badge>}
          {!emergency.marketplace && !emergency.rewards && !emergency.trading && (
            <div className="text-xs text-green-400">All systems normal</div>
          )}
        </div>
      </GlassCard>

      <GlassCard title="📢 Broadcast">
        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Title</label>
            <input id="bcast-title" type="text" placeholder="Announcement title..."
              className="w-full p-2 bg-black/50 border border-gray-700 rounded text-xs text-gray-300" />
          </div>
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Message</label>
            <textarea id="bcast-body" rows={3} placeholder="Write announcement..."
              className="w-full p-2 bg-black/50 border border-gray-700 rounded text-xs text-gray-300 resize-none" />
          </div>
          <button onClick={() => {
            const title = (document.getElementById("bcast-title") as HTMLInputElement)?.value || "📢 Announcement";
            const body = (document.getElementById("bcast-body") as HTMLTextAreaElement)?.value || "";
            if (body.trim()) { adminBroadcast(title, body); t("Broadcast sent"); }
          }}
            className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-orange-600 to-red-600 rounded text-white hover:from-orange-500 hover:to-red-500">
            📢 Send to All Players</button>
        </div>
      </GlassCard>

      <GlassCard title="⚠️ Danger Zone">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-red-600/5 border border-red-500/10 rounded-lg">
            <div>
              <div className="text-xs font-bold text-red-400">Global Data Reset</div>
              <div className="text-[9px] text-gray-500">Wipes all player data. Keeps admin config, audit log, bans, blacklist.</div>
            </div>
            <button onClick={() => { if (confirm("Are you sure? This cannot be undone!")) { adminGlobalReset(); t("Global reset complete"); } }}
              className="px-3 py-1.5 text-[10px] font-bold bg-red-700 text-white rounded hover:bg-red-600 shrink-0">
              Reset All
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-cyan-600/5 border border-cyan-500/10 rounded-lg">
            <div>
              <div className="text-xs font-bold text-cyan-400">Export Data</div>
              <div className="text-[9px] text-gray-500">Download full game save as JSON backup.</div>
            </div>
            <button onClick={() => {
              const data = getExportData();
              const blob = new Blob([data], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url; a.download = `0gbomber_backup_${new Date().toISOString().slice(0, 10)}.json`; a.click();
              URL.revokeObjectURL(url);
              t("Data exported");
            }}
              className="px-3 py-1.5 text-[10px] font-bold bg-cyan-700 text-white rounded hover:bg-cyan-600 shrink-0">
              Export JSON
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
