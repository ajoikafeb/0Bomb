"use client";

import { useState, useCallback } from "react";
import { addCosmetic, adminAddItem, adminAddHero, addHero } from "@/lib/game/GameStateManager";
import { generateHero } from "@/lib/game/heroGenerator";
import { generateCosmetic } from "@/lib/game/cosmeticSystem";
import { GlassCard, AdminSearchBar, Badge } from "@/components/admin/StatCard";

export default function AdminGiveaway() {
  const [target, setTarget] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [itemRarity, setItemRarity] = useState<"Common" | "Rare" | "Epic" | "Legendary">("Legendary");
  const [cosRarity, setCosRarity] = useState<"Common" | "Rare" | "Epic" | "Legendary" | "Mythic">("Legendary");

  const t = useCallback((s: string) => { setToast(s); setTimeout(() => setToast(null), 2500); }, []);

  const send = (action: () => void) => {
    if (!target) { t("Enter a wallet address"); return; }
    action();
    t("Sent!");
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 bg-gray-900 border border-cyan-500/50 rounded shadow-lg text-xs text-cyan-300 font-mono animate-pulse">
          {toast}
        </div>
      )}

      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Giveaway Panel</h1>
        <Badge color="yellow">Admin Only</Badge>
      </div>

      <GlassCard title="Send Items">
        <div className="space-y-4">
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Target Wallet</label>
            <AdminSearchBar value={target} onChange={setTarget} placeholder="0x..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-black/30 rounded-lg p-4 border border-white/[0.04]">
              <h4 className="text-xs font-bold text-cyan-400 mb-2">Equipment</h4>
              <div className="flex gap-2 mb-2">
                {(["Common", "Rare", "Epic", "Legendary"] as const).map(r => (
                  <button key={r} onClick={() => setItemRarity(r)}
                    className={`px-2 py-0.5 text-[9px] rounded-full transition-colors ${
                      itemRarity === r ? "bg-cyan-500/20 text-cyan-300" : "bg-gray-800 text-gray-500"
                    }`}>{r}</button>
                ))}
              </div>
              <button onClick={() => send(() => adminAddItem(target, itemRarity))}
                className="w-full px-3 py-1.5 text-[10px] font-bold bg-cyan-700 rounded text-white hover:bg-cyan-600">
                Send Equipment
              </button>
            </div>

            <div className="bg-black/30 rounded-lg p-4 border border-white/[0.04]">
              <h4 className="text-xs font-bold text-purple-400 mb-2">Cosmetic</h4>
              <div className="flex gap-1 mb-2 flex-wrap">
                {(["Common", "Rare", "Epic", "Legendary", "Mythic"] as const).map(r => (
                  <button key={r} onClick={() => setCosRarity(r)}
                    className={`px-2 py-0.5 text-[9px] rounded-full transition-colors ${
                      cosRarity === r ? "bg-purple-500/20 text-purple-300" : "bg-gray-800 text-gray-500"
                    }`}>{r.slice(0, 4)}</button>
                ))}
              </div>
              <button onClick={() => send(() => { const c = generateCosmetic(undefined, target, cosRarity); addCosmetic(c); })}
                className="w-full px-3 py-1.5 text-[10px] font-bold bg-purple-700 rounded text-white hover:bg-purple-600">
                Send Cosmetic
              </button>
            </div>

            <div className="bg-black/30 rounded-lg p-4 border border-white/[0.04]">
              <h4 className="text-xs font-bold text-yellow-400 mb-2">Hero</h4>
              <button onClick={() => send(() => adminAddHero(target))}
                className="w-full px-3 py-1.5 text-[10px] font-bold bg-yellow-700 rounded text-white hover:bg-yellow-600 mb-1">
                Send Random Hero
              </button>
              <button onClick={() => send(() => { const h = generateHero(target); h.owner_address = target; addHero(h); })}
                className="w-full px-3 py-1.5 text-[10px] font-bold bg-orange-700 rounded text-white hover:bg-orange-600">
                Send Generated Hero
              </button>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
