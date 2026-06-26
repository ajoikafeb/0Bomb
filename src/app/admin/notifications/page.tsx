"use client";

import { useState, useCallback } from "react";
import { adminBroadcast } from "@/lib/game/GameStateManager";
import { GlassCard } from "@/components/admin/StatCard";

export default function AdminNotifications() {
  const [toast, setToast] = useState<string | null>(null);
  const t = useCallback((s: string) => { setToast(s); setTimeout(() => setToast(null), 2500); }, []);

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 bg-gray-900 border border-cyan-500/50 rounded shadow-lg text-xs text-cyan-300 font-mono animate-pulse">
          {toast}
        </div>
      )}

      <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Notification Center</h1>

      <GlassCard title="Global Announcement">
        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Title</label>
            <input id="notif-title" type="text" placeholder="e.g. New Event!"
              className="w-full p-2 bg-black/50 border border-gray-700 rounded text-xs text-gray-300" />
          </div>
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Message Body</label>
            <textarea id="notif-body" rows={3} placeholder="Write your announcement..."
              className="w-full p-2 bg-black/50 border border-gray-700 rounded text-xs text-gray-300 resize-none" />
          </div>
          <button onClick={() => {
            const title = (document.getElementById("notif-title") as HTMLInputElement)?.value || "Announcement";
            const body = (document.getElementById("notif-body") as HTMLTextAreaElement)?.value || "";
            if (body.trim()) { adminBroadcast(title, body); t("Global announcement sent"); }
          }}
            className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-cyan-600 to-blue-600 rounded text-white hover:from-cyan-500 hover:to-blue-500">
            Send to All Players</button>
        </div>
      </GlassCard>
    </div>
  );
}
