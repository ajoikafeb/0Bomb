"use client";

import { useState, useCallback } from "react";
import { getHeroes, getInventory, getCosmetics, getPlayerBalance, getFragments, getUsername, addToInventory, addCosmetic, adminGiveXP, adminSetLevel, adminBanPlayer, adminUnbanPlayer, adminFreezePlayer, adminUnfreezePlayer, adminSendToken, adminAddPotions, isAddressBanned, isAddressFrozen } from "@/lib/game/GameStateManager";
import { generateEquipment } from "@/lib/game/equipmentSystem";
import { GlassCard, AdminSearchBar, Badge } from "@/components/admin/StatCard";
import type { Hero } from "@/lib/game/types";

export default function AdminPlayers() {
  const [search, setSearch] = useState("");
  const [target, setTarget] = useState("");
  const [found, setFound] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [amount, setAmount] = useState("100");
  const [potionCount, setPotionCount] = useState("5");

  const t = useCallback((s: string) => { setMsg(s); setTimeout(() => setMsg(null), 2500); }, []);

  const doLookup = (addr?: string) => {
    const a = (addr || search).toLowerCase();
    if (!a) return;
    setTarget(a);
    setFound(true);
    t(`Loaded data for ${a.slice(0, 6)}...${a.slice(-4)}`);
  };

  const heroes = found ? getHeroes().filter((h: Hero) => h.owner_address?.toLowerCase() === target) : [];
  const inv = found ? getInventory().filter(i => i.owner?.toLowerCase() === target) : [];
  const cos = found ? getCosmetics().filter(c => c.owner?.toLowerCase() === target) : [];
  const bal = found ? getPlayerBalance(target) : 0;
  const frags = found ? getFragments(target) : 0;
  const banned = found ? isAddressBanned(target) : false;
  const frozen = found ? isAddressFrozen(target) : false;

  return (
    <div className="space-y-6">
      {msg && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 bg-gray-900 border border-cyan-500/50 rounded shadow-lg text-xs text-cyan-300 font-mono animate-pulse">
          {msg}
        </div>
      )}

      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Player Manager</h1>
        <Badge color="cyan">{found ? "1 selected" : "Search to begin"}</Badge>
      </div>

      <GlassCard title="Search Player">
        <div className="flex gap-2">
          <AdminSearchBar value={search} onChange={setSearch} placeholder="Wallet address (0x...)" />
          <button onClick={() => doLookup()}
            className="px-4 py-2 text-xs font-bold bg-cyan-600 rounded-lg text-white hover:bg-cyan-500 transition-colors shrink-0">
            Lookup
          </button>
        </div>
      </GlassCard>

      {found && (
        <>
          <GlassCard title={`Player: ${target.slice(0, 6)}...${target.slice(-4)}`} action={
            <div className="flex gap-2">
              <Badge color={banned ? "red" : "green"}>{banned ? "Banned" : "Active"}</Badge>
              <Badge color={frozen ? "blue" : "green"}>{frozen ? "Frozen" : "Normal"}</Badge>
            </div>
          }>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div>
                <span className="text-[9px] text-gray-500 block">Wallet</span>
                <span className="text-xs font-mono text-cyan-400">{target.slice(0, 8)}...{target.slice(-4)}</span>
              </div>
              <div>
                <span className="text-[9px] text-gray-500 block">Balance</span>
                <span className="text-xs font-mono text-green-400">{bal} $0BOMB</span>
              </div>
              <div>
                <span className="text-[9px] text-gray-500 block">Fragments</span>
                <span className="text-xs font-mono text-purple-400">{frags}</span>
              </div>
              <div>
                <span className="text-[9px] text-gray-500 block">Heroes / Items</span>
                <span className="text-xs font-mono text-cyan-400">{heroes.length}h / {inv.length}i</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 border-t border-white/[0.06] pt-4">
              <div>
                <label className="text-[9px] text-gray-500 block mb-1">Send $0BOMB</label>
                <div className="flex gap-1">
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-1.5 bg-black/50 border border-gray-700 rounded text-[10px] text-gray-300" />
                  <button onClick={() => { adminSendToken(parseFloat(amount), target); t(`Sent ${amount} OBOMB`); }}
                    className="px-2 py-1 text-[10px] font-bold bg-green-700 rounded text-white hover:bg-green-600 shrink-0">Send</button>
                </div>
              </div>
              <div>
                <label className="text-[9px] text-gray-500 block mb-1">Give Energy Potions</label>
                <div className="flex gap-1">
                  <input type="number" value={potionCount} onChange={e => setPotionCount(e.target.value)} className="w-full p-1.5 bg-black/50 border border-gray-700 rounded text-[10px] text-gray-300" />
                  <button onClick={() => { adminAddPotions(parseInt(potionCount), target); t(`Gave ${potionCount} potions`); }}
                    className="px-2 py-1 text-[10px] font-bold bg-blue-700 rounded text-white hover:bg-blue-600 shrink-0">Give</button>
                </div>
              </div>
              <div>
                <label className="text-[9px] text-gray-500 block mb-1">Action</label>
                <div className="flex gap-1">
                  {!banned ? (
                    <button onClick={() => { adminBanPlayer(target); t("Player banned"); }}
                      className="px-2 py-1 text-[10px] font-bold bg-red-700 rounded text-white hover:bg-red-600">Ban</button>
                  ) : (
                    <button onClick={() => { adminUnbanPlayer(target); t("Player unbanned"); }}
                      className="px-2 py-1 text-[10px] font-bold bg-green-700 rounded text-white hover:bg-green-600">Unban</button>
                  )}
                  {!frozen ? (
                    <button onClick={() => { adminFreezePlayer(target); t("Player frozen"); }}
                      className="px-2 py-1 text-[10px] font-bold bg-orange-700 rounded text-white hover:bg-orange-600">Freeze</button>
                  ) : (
                    <button onClick={() => { adminUnfreezePlayer(target); t("Player unfrozen"); }}
                      className="px-2 py-1 text-[10px] font-bold bg-green-700 rounded text-white hover:bg-green-600">Unfreeze</button>
                  )}
                </div>
              </div>
              <div>
                <label className="text-[9px] text-gray-500 block mb-1">Give Equipment</label>
                <button onClick={() => { const eq = generateEquipment(undefined, target); addToInventory(eq); t(`Gave ${eq.name}`); }}
                  className="w-full px-2 py-1 text-[10px] font-bold bg-purple-700 rounded text-white hover:bg-purple-600">Random Equipment</button>
              </div>
            </div>
          </GlassCard>

          {heroes.length > 0 && (
            <GlassCard title={`Heroes (${heroes.length})`}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {heroes.map(h => (
                  <div key={h.id} className="bg-black/30 rounded-lg p-3 border border-white/[0.04]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-cyan-400">{h.name}</span>
                      <Badge color={h.rarity === "Legendary" ? "yellow" : h.rarity === "Epic" ? "purple" : h.rarity === "Rare" ? "blue" : "cyan"}>
                        {h.rarity}
                      </Badge>
                    </div>
                    <div className="text-[10px] text-gray-500">Lv.{h.level} {h.class}</div>
                    <div className="flex gap-2 mt-1">
                      <input type="number" placeholder="XP" className="w-16 p-1 bg-black/50 border border-gray-700 rounded text-[9px] text-gray-300"
                        onChange={e => { const v = parseInt(e.target.value); if (v) { adminGiveXP(h.id, v); t(`Gave ${v} XP`); } }} />
                      <button onClick={() => { adminSetLevel(h.id, h.level + 1); t(`Level up ${h.name}`); }}
                        className="px-2 py-1 text-[9px] bg-cyan-700 rounded text-white hover:bg-cyan-600">+1 Lv</button>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </>
      )}
    </div>
  );
}
