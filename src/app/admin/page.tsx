"use client";

import { useState, useEffect, useCallback } from "react";
import { useWalletContext } from "@/components/wallet/WalletProvider";
import { OWNER_WALLET, HERO_HATCH_COST, LOOT_MINT_COST, COSMETIC_MINT_COST, MARKETPLACE_FEE } from "@/lib/game/constants";
import { generateHero } from "@/lib/game/heroGenerator";
import { generateEquipment } from "@/lib/game/equipmentSystem";
import { generateCosmetic } from "@/lib/game/cosmeticSystem";
import { transferToken } from "@/lib/blockchain/provider";
import { getHeroes, getInventory, getCosmetics, getEnergyPotions, getActiveListings, getListings, addHero, addToInventory, addCosmetic, getAdminConfig, updateAdminConfig, adminCancelListing, adminDeleteHero, adminGiveXP, adminSetLevel, adminAddPotions, adminAddItem, adminAddCosmetic as adminAddCosmeticFn, adminAddHero as adminAddHeroFn, getTokenBalance, adminSendToken, adminTransferItem, getUsername, getTransactions, addInboxMessage, isAddressBanned, isAddressFrozen, adminBanPlayer, adminUnbanPlayer, adminFreezePlayer, adminUnfreezePlayer, getAuditLog, adminBroadcast, adminGlobalReset, getExportData, getItemBlacklist, adminBlacklistItem, adminUnblacklistItem, getBannedAddresses, getFrozenAddresses, getPlayerBalance, getPlayerUsername, getPlayerPotions, getPendingWithdrawals, confirmWithdrawal, rejectWithdrawal } from "@/lib/game/GameStateManager";
import type { AdminConfig } from "@/lib/game/GameStateManager";
import type { Hero } from "@/lib/game/types";

type Module =
  | "dashboard" | "economy" | "players" | "heroes" | "cryopod" | "gacha"
  | "ai" | "memory" | "marketplace" | "nft" | "events"
  | "maps" | "bosses" | "leaderboard" | "users" | "blockchain"
  | "treasury" | "maintenance" | "emergency" | "analytics" | "devtools"
  | "broadcast" | "blacklist" | "audit" | "online" | "withdrawals";

const MODULES: { id: Module; label: string; icon: string; group: string }[] = [
  { id: "dashboard", label: "Dashboard Overview", icon: "📊", group: "Core" },
  { id: "economy", label: "Economy Center", icon: "💰", group: "Core" },
  { id: "players", label: "Player Lookup", icon: "🔍", group: "Core" },
  { id: "broadcast", label: "Broadcast", icon: "📢", group: "Core" },
  { id: "heroes", label: "Hero Management", icon: "👤", group: "Management" },
  { id: "cryopod", label: "Cryo Pod", icon: "❄️", group: "Management" },
  { id: "gacha", label: "Gacha", icon: "🎰", group: "Management" },
  { id: "ai", label: "AI Intelligence", icon: "🧠", group: "Intelligence" },
  { id: "memory", label: "Memory Analytics", icon: "🔮", group: "Intelligence" },
  { id: "marketplace", label: "Marketplace", icon: "🏪", group: "Economy" },
  { id: "nft", label: "NFT Center", icon: "🖼️", group: "Economy" },
  { id: "withdrawals", label: "Withdrawals", icon: "💸", group: "Economy" },
  { id: "events", label: "Event Manager", icon: "🎉", group: "Content" },
  { id: "maps", label: "Map Manager", icon: "🗺️", group: "Content" },
  { id: "bosses", label: "Boss Manager", icon: "👾", group: "Content" },
  { id: "leaderboard", label: "Leaderboard", icon: "🏆", group: "Community" },
  { id: "users", label: "User Management", icon: "👥", group: "Community" },
  { id: "online", label: "Online Players", icon: "🟢", group: "Community" },
  { id: "blockchain", label: "Blockchain Center", icon: "⛓️", group: "Infrastructure" },
  { id: "treasury", label: "Treasury Center", icon: "🏦", group: "Infrastructure" },
  { id: "maintenance", label: "Maintenance", icon: "🔧", group: "Infrastructure" },
  { id: "emergency", label: "Emergency Controls", icon: "🚨", group: "Security" },
  { id: "blacklist", label: "Item Blacklist", icon: "🚫", group: "Security" },
  { id: "analytics", label: "Analytics Center", icon: "📈", group: "Data" },
  { id: "audit", label: "Audit Log", icon: "📋", group: "Data" },
  { id: "devtools", label: "Developer Tools", icon: "⚒️", group: "Data" },
];

const GROUPS = [...new Set(MODULES.map(m => m.group))];

function Toast({ msg, onClose }: { msg: string | null; onClose: () => void }) {
  useEffect(() => { if (msg) { const t = setTimeout(onClose, 2500); return () => clearTimeout(t); } }, [msg, onClose]);
  if (!msg) return null;
  return (
    <div className="fixed top-4 right-4 z-50 px-4 py-2 bg-gray-900 border border-cyan-500/50 rounded shadow-lg text-xs text-cyan-300 font-mono animate-pulse">
      {msg}
    </div>
  );
}

function ROIInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-[10px] text-gray-400 block mb-0.5">{label}</label>
      <input type="number" value={value} onChange={e => onChange(e.target.value)} min="0" step="1"
        className="w-full p-1.5 bg-black/50 border border-gray-700 rounded text-[10px] text-gray-300" />
    </div>
  );
}

function ROICalc({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-black/30 rounded p-2">
      <div className="text-[9px] text-gray-500">{label}</div>
      <div className="text-sm font-bold text-cyan-400">{value}</div>
    </div>
  );
}

export default function AdminPage() {
  const { address, isConnected } = useWalletContext();
  const [activeModule, setActiveModule] = useState<Module>("dashboard");
  const [cfg, setCfg] = useState<AdminConfig>(getAdminConfig());
  const [generatedHero, setGeneratedHero] = useState<any>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [lookupAddress, setLookupAddress] = useState("");
  const [lookupTriggered, setLookupTriggered] = useState(false);
  const [equipRarity, setEquipRarity] = useState<"Common" | "Rare" | "Epic" | "Legendary">("Legendary");
  const [cosmeticRarity, setCosmeticRarity] = useState<"Common" | "Rare" | "Epic" | "Legendary" | "Mythic">("Legendary");
  const [tokenAmount, setTokenAmount] = useState("100");
  const [warningText, setWarningText] = useState("");
  const [showTransactions, setShowTransactions] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [wdProcessing, setWdProcessing] = useState<string | null>(null);

  const t = useCallback((msg: string) => setToast(msg), []);

  // ROI simulator state
  const [roiPlayers, setRoiPlayers] = useState("100");
  const [roiHeroes, setRoiHeroes] = useState("250");
  const [roiRewardRate, setRoiRewardRate] = useState("1");
  const [roiConversion, setRoiConversion] = useState("0.5");

  const isOwner = address?.toLowerCase() === OWNER_WALLET.toLowerCase();

  const saveCfg = (partial: Partial<AdminConfig>) => {
    updateAdminConfig(partial);
    setCfg(prev => ({ ...prev, ...partial }));
  };

  const rerender = () => setRefreshKey(k => k + 1);

  useEffect(() => {
    if (isOwner) setCfg(getAdminConfig());
  }, [isOwner]);

  // ROI calculations
  const dailyEmission = (parseInt(roiPlayers) || 0) * (parseInt(roiHeroes) || 0) * (parseFloat(roiRewardRate) || 0) * 10;
  const weeklyEmission = dailyEmission * 7;
  const monthlyEmission = dailyEmission * 30;
  const roiEstimation = (parseFloat(roiConversion) || 0) > 0 ? ((dailyEmission * 0.3) / ((parseInt(roiPlayers) || 1) * (parseFloat(roiConversion) || 1))).toFixed(2) : "0";
  const inflationRisk = monthlyEmission > 1000000 ? "High" : monthlyEmission > 500000 ? "Medium" : "Low";
  const burnImpact = (dailyEmission * 0.15).toFixed(0);

  if (!isConnected) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-cyan-400 mb-4">Connect Your Wallet</h1>
          <p className="text-gray-400">Connect your wallet to access admin.</p>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-gray-400">Only the owner wallet can access this page.</p>
        </div>
      </div>
    );
  }

  const lookupHeroes = lookupAddress ? getHeroes().filter(h => h.owner_address?.toLowerCase() === lookupAddress.toLowerCase()) : [];
  const lookupInventory = lookupAddress ? getInventory().filter(i => i.owner?.toLowerCase() === lookupAddress.toLowerCase()) : [];
  const lookupCosmetics = lookupAddress ? getCosmetics().filter(c => c.owner?.toLowerCase() === lookupAddress.toLowerCase()) : [];

  return (
    <div className="min-h-[80vh] p-4 max-w-7xl mx-auto">
      <Toast msg={toast} onClose={() => setToast(null)} />
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Admin Dashboard</h1>
        <div className="px-3 py-1 text-xs font-bold text-yellow-300 bg-yellow-600/20 border border-yellow-500/30 rounded">Developer Mode Active</div>
        {(cfg.rewardsPaused || cfg.marketplacePaused || cfg.tradingPaused) && (
          <div className="px-3 py-1 text-xs font-bold text-red-300 bg-red-600/20 border border-red-500/30 rounded animate-pulse">⚠ Emergency Active</div>
        )}
      </div>

      <div className="flex gap-4">
        {/* Sidebar nav */}
        <div className="w-48 shrink-0 space-y-4">
          {GROUPS.map(group => (
            <div key={group}>
              <div className="text-[9px] font-bold text-gray-600 uppercase tracking-wider mb-1">{group}</div>
              {MODULES.filter(m => m.group === group).map(m => (
                <button key={m.id} onClick={() => setActiveModule(m.id)}
                  className={`w-full text-left px-2.5 py-1.5 text-[10px] rounded transition-all ${
                    activeModule === m.id ? "bg-cyan-500/15 text-cyan-300 border-l-2 border-cyan-400" : "text-gray-400 hover:text-gray-300 hover:bg-gray-800/50"
                  }`}
                >{m.icon} {m.label}</button>
              ))}
            </div>
          ))}
        </div>

        {/* Main panel */}
        <div className="flex-1 min-w-0">

          {/* DASHBOARD */}
          {activeModule === "dashboard" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Active Heroes", value: getHeroes().filter(h => h.is_alive).length, color: "cyan" },
                { label: "Total Heroes", value: getHeroes().length, color: "cyan" },
                { label: "Active Listings", value: getActiveListings().length, color: "yellow" },
                { label: "Potions in Economy", value: getEnergyPotions(), color: "green" },
                { label: "Equip Items", value: getInventory().length, color: "purple" },
                { label: "Cosmetics", value: getCosmetics().length, color: "pink" },
                { label: "Reward Multiplier", value: `${cfg.rewardMultiplier}x`, color: "orange" },
                { label: "Maintenance", value: cfg.globalMaintenance ? "ON" : "OFF", color: cfg.globalMaintenance ? "red" : "green" },
              ].map(s => {
                const c: Record<string, string> = { cyan: "#22d3ee", yellow: "#facc15", green: "#4ade80", purple: "#c084fc", pink: "#f472b6", orange: "#fb923c", red: "#f87171" };
                return (<div key={s.label} className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-3">
                  <div className="text-[9px] text-gray-500">{s.label}</div>
                  <div className="text-lg font-bold" style={{ color: c[s.color] || "#22d3ee" }}>{s.value}</div>
                </div>);
              })}
            </div>
          )}

          {/* BROADCAST */}
          {activeModule === "broadcast" && (
            <div className="space-y-4">
              <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
                <h3 className="text-sm font-bold text-cyan-400 mb-3">📢 Mass Announcement</h3>
                <p className="text-[10px] text-gray-500 mb-3">Send a message to all players' inboxes.</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Title</label>
                    <input type="text" id="broadcast-title" placeholder="Announcement title..."
                      className="w-full p-2 bg-black/50 border border-gray-700 rounded text-xs text-gray-300" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Message Body</label>
                    <textarea id="broadcast-body" rows={4} placeholder="Write your announcement..."
                      className="w-full p-2 bg-black/50 border border-gray-700 rounded text-xs text-gray-300 resize-none" />
                  </div>
                  <button onClick={() => {
                    const title = (document.getElementById("broadcast-title") as HTMLInputElement)?.value || "📢 Announcement";
                    const body = (document.getElementById("broadcast-body") as HTMLTextAreaElement)?.value || "";
                    if (body.trim()) { adminBroadcast(title, body); t("Announcement sent to all"); (document.getElementById("broadcast-title") as HTMLInputElement).value = ""; (document.getElementById("broadcast-body") as HTMLTextAreaElement).value = ""; }
                  }}
                    className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-orange-600 to-red-600 rounded text-white hover:from-orange-500 hover:to-red-500">
                    📢 Send to All Players</button>
                </div>
              </div>
              <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
                <h3 className="text-sm font-bold text-cyan-400 mb-3">🗑️ Global Data Reset</h3>
                <p className="text-[10px] text-gray-500 mb-3">Wipes all player data (heroes, items, listings, balances). Keeps admin config, audit log, bans, and blacklist.</p>
                <button onClick={() => { if (confirm("Are you sure you want to reset ALL player data? This cannot be undone!")) { adminGlobalReset(); rerender(); t("Global reset complete"); } }}
                  className="px-4 py-2 text-xs font-bold bg-red-700 text-white rounded hover:bg-red-600">
                  ⚠ Reset All Player Data</button>
              </div>
              <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
                <h3 className="text-sm font-bold text-cyan-400 mb-3">📥 Export Data</h3>
                <p className="text-[10px] text-gray-500 mb-3">Download the full game save as JSON.</p>
                <button onClick={() => {
                  const data = getExportData();
                  const blob = new Blob([data], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a"); a.href = url; a.download = `0gbomber_backup_${new Date().toISOString().slice(0, 10)}.json`; a.click();
                  URL.revokeObjectURL(url);
                  t("Data exported");
                }}
                  className="px-4 py-2 text-xs font-bold bg-cyan-700 text-white rounded hover:bg-cyan-600">
                  📥 Download JSON Backup</button>
              </div>
            </div>
          )}

          {/* ECONOMY */}
          {activeModule === "economy" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: "Reward Multiplier", key: "rewardMultiplier" as const, min: 0, max: 10, step: 0.1 },
                  { label: "Currency Drop Rate", key: "currencyDropRate" as const, min: 0, max: 5, step: 0.1 },
                  { label: "Equipment Drop Rate", key: "equipmentDropRate" as const, min: 0, max: 5, step: 0.1 },
                  { label: "Cosmetic Drop Rate", key: "cosmeticDropRate" as const, min: 0, max: 5, step: 0.1 },
                  { label: "Rare Loot Drop Rate", key: "rareLootDropRate" as const, min: 0, max: 5, step: 0.1 },
                  { label: "Event Reward Multiplier", key: "eventRewardMultiplier" as const, min: 0, max: 10, step: 0.1 },
                  { label: "Marketplace Fee (%)", key: "marketplaceFee" as const, min: 0, max: 0.5, step: 0.005 },
                ].map(item => (
                  <div key={item.key} className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
                    <label className="text-xs text-gray-400 mb-2 block">{item.label}</label>
                    <div className="flex items-center gap-2">
                      <input type="range" min={item.min} max={item.max} step={item.step}
                        value={cfg[item.key]} onChange={e => saveCfg({ [item.key]: parseFloat(e.target.value) })}
                        className="flex-1 accent-cyan-500" />
                      <span className="text-sm font-mono text-cyan-400 w-12 text-right">
                        {item.key === "marketplaceFee" ? `${(cfg[item.key] * 100).toFixed(1)}%` : `${cfg[item.key]}x`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* ROI Simulator */}
              <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
                <h3 className="text-sm font-bold text-cyan-400 mb-4">📈 ROI Simulator</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <ROIInput label="Active Players" value={roiPlayers} onChange={setRoiPlayers} />
                  <ROIInput label="Hero Count" value={roiHeroes} onChange={setRoiHeroes} />
                  <ROIInput label="Reward Rate (x)" value={roiRewardRate} onChange={setRoiRewardRate} />
                  <ROIInput label="Conversion Rate" value={roiConversion} onChange={setRoiConversion} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                  <ROICalc label="Daily Emission" value={`${dailyEmission.toLocaleString()}`} />
                  <ROICalc label="Weekly Emission" value={`${weeklyEmission.toLocaleString()}`} />
                  <ROICalc label="Monthly Emission" value={`${monthlyEmission.toLocaleString()}`} />
                  <ROICalc label="ROI Est. (days)" value={roiEstimation} />
                  <ROICalc label="Inflation Risk" value={inflationRisk} />
                  <ROICalc label="Burn Impact (daily)" value={burnImpact} />
                </div>
              </div>
            </div>
          )}

          {/* PLAYER LOOKUP */}
          {activeModule === "players" && (
            <div className="space-y-4">
              <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
                <h3 className="text-sm font-bold text-cyan-400 mb-3">🔍 Player Lookup</h3>
                <div className="flex gap-2 mb-4">
                  <input type="text" value={lookupAddress} onChange={e => { setLookupAddress(e.target.value); setLookupTriggered(false); }}
                    placeholder="Enter wallet address (0x...)"
                    className="flex-1 p-2 bg-black/50 border border-gray-700 rounded text-xs text-gray-300 font-mono" />
                  <button onClick={() => { if (lookupAddress) { setLookupTriggered(true); t(`Loaded data for ${lookupAddress.slice(0, 6)}...${lookupAddress.slice(-4)}`); } }}
                    className="px-4 py-2 text-xs font-bold bg-cyan-600 rounded text-white hover:bg-cyan-500">Lookup</button>
                </div>
              </div>

              {lookupTriggered && lookupAddress && (
                <div className="space-y-4">
                  {/* Player Info + Token Give */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
                      <h4 className="text-xs font-bold text-cyan-400 mb-2">Player Info</h4>
                      <div className="text-[10px] mb-1">
                        <span className="text-gray-500">Username:</span>
                        <span className="text-white ml-1">{getPlayerUsername(lookupAddress) || "—"}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 break-all font-mono">{lookupAddress}</p>
                      <p className="text-[10px] text-gray-500 mt-1">0BOMB Balance: {getPlayerBalance(lookupAddress).toLocaleString()}</p>
                      <p className="text-[10px] text-gray-500">Potions: {getPlayerPotions(lookupAddress)}</p>
                    </div>
                    <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
                      <h4 className="text-xs font-bold text-cyan-400 mb-2">Give 0BOMB</h4>
                      <div className="flex gap-2">
                        <input type="number" value={tokenAmount} onChange={e => setTokenAmount(e.target.value)} min="1"
                          className="w-20 p-1.5 bg-black/50 border border-gray-700 rounded text-[10px] text-gray-300" />
                        <button onClick={() => { const amt = parseInt(tokenAmount); if (amt > 0) { adminSendToken(amt, lookupAddress); rerender(); t(`Sent ${amt} 0BOMB`); } }}
                          className="px-3 py-1 text-[10px] font-bold bg-yellow-600/40 text-yellow-200 rounded border border-yellow-500/30 hover:bg-yellow-600/60">
                          Mint & Send</button>
                      </div>
                    </div>
                    <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
                      <h4 className="text-xs font-bold text-cyan-400 mb-2">Quick Stats</h4>
                      <p className="text-[10px] text-gray-400">Heroes: {lookupHeroes.length}</p>
                      <p className="text-[10px] text-gray-400">Items: {lookupInventory.length}</p>
                      <p className="text-[10px] text-gray-400">Cosmetics: {lookupCosmetics.length}</p>
                    </div>
                  </div>

                  {/* Grant Items with Rarity Pick */}
                  <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
                    <h4 className="text-xs font-bold text-cyan-400 mb-3">Grant Items (Chosen Rarity)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[9px] text-gray-500 block mb-1">Equipment Rarity</label>
                        <select value={equipRarity} onChange={e => setEquipRarity(e.target.value as any)}
                          className="w-full p-1.5 bg-black/50 border border-gray-700 rounded text-[10px] text-gray-300">
                          <option value="Common">Common</option>
                          <option value="Rare">Rare</option>
                          <option value="Epic">Epic</option>
                          <option value="Legendary">Legendary</option>
                        </select>
                        <button onClick={() => { adminAddItem(lookupAddress, equipRarity); rerender(); t(`Granted ${equipRarity} equipment`); }}
                          className="mt-2 w-full px-2 py-1.5 text-[10px] font-bold bg-blue-600/40 text-blue-200 rounded border border-blue-500/30 hover:bg-blue-600/60">
                          🎒 Grant Equipment</button>
                      </div>
                      <div>
                        <label className="text-[9px] text-gray-500 block mb-1">Cosmetic Rarity</label>
                        <select value={cosmeticRarity} onChange={e => setCosmeticRarity(e.target.value as any)}
                          className="w-full p-1.5 bg-black/50 border border-gray-700 rounded text-[10px] text-gray-300">
                          <option value="Common">Common</option>
                          <option value="Rare">Rare</option>
                          <option value="Epic">Epic</option>
                          <option value="Legendary">Legendary</option>
                          <option value="Mythic">Mythic</option>
                        </select>
                        <button onClick={() => { adminAddCosmeticFn(lookupAddress, cosmeticRarity); rerender(); t(`Granted ${cosmeticRarity} cosmetic`); }}
                          className="mt-2 w-full px-2 py-1.5 text-[10px] font-bold bg-pink-600/40 text-pink-200 rounded border border-pink-500/30 hover:bg-pink-600/60">
                          ✨ Grant Cosmetic</button>
                      </div>
                      <div>
                        <label className="text-[9px] text-gray-500 block mb-1">Instant Actions</label>
                        <button onClick={() => { adminAddHeroFn(lookupAddress); rerender(); t("Hero created"); }}
                          className="mt-2 w-full px-2 py-1.5 text-[10px] font-bold bg-purple-600/40 text-purple-200 rounded border border-purple-500/30 hover:bg-purple-600/60">
                          🦸 Grant Hero</button>
                        <button onClick={() => { adminAddPotions(10, lookupAddress); rerender(); t("10 potions granted"); }}
                          className="mt-2 w-full px-2 py-1.5 text-[10px] font-bold bg-green-600/40 text-green-200 rounded border border-green-500/30 hover:bg-green-600/60">
                          🧪 Grant 10 Potions</button>
                      </div>
                    </div>
                  </div>

                  {/* Ban / Freeze / Warning */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-dark-2/50 border border-red-500/20 rounded-lg p-4">
                      <h4 className="text-xs font-bold text-red-400 mb-3">🚨 Player Controls</h4>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {isAddressBanned(lookupAddress) ? (
                          <button onClick={() => { if (confirm("Unban this player? They will be able to create new data.")) { adminUnbanPlayer(lookupAddress); rerender(); t("Player unbanned"); } }}
                            className="px-3 py-1.5 text-[10px] font-bold bg-green-600/40 text-green-200 rounded border border-green-500/30 hover:bg-green-600/60">
                            🔓 Unban Player</button>
                        ) : (
                          <button onClick={() => { if (confirm("🚨 BAN & WIPE: This will delete ALL heroes, items, cosmetics, and listings owned by this address. The address will be permanently banned. Continue?")) { adminBanPlayer(lookupAddress); rerender(); t("Player banned — data wiped"); } }}
                            className="px-3 py-1.5 text-[10px] font-bold bg-red-600/40 text-red-200 rounded border border-red-500/30 hover:bg-red-600/60">
                            🔨 Ban & Wipe</button>
                        )}
                        {isAddressFrozen(lookupAddress) ? (
                          <button onClick={() => { if (confirm("Unfreeze this player? They will be able to play, trade, and claim rewards again.")) { adminUnfreezePlayer(lookupAddress); rerender(); t("Player unfrozen"); } }}
                            className="px-3 py-1.5 text-[10px] font-bold bg-green-600/40 text-green-200 rounded border border-green-500/30 hover:bg-green-600/60">
                            🔓 Unfreeze Player</button>
                        ) : (
                          <button onClick={() => { if (confirm("❄️ FREEZE: This will prevent the player from deploying heroes, claiming rewards, trading, and minting. The player's data will be preserved. Continue?")) { adminFreezePlayer(lookupAddress); rerender(); t("Player frozen"); } }}
                            className="px-3 py-1.5 text-[10px] font-bold bg-blue-600/40 text-blue-200 rounded border border-blue-500/30 hover:bg-blue-600/60">
                            ❄️ Freeze Player</button>
                        )}
                      </div>
                      <div className="border-t border-gray-700/50 pt-3">
                        <h5 className="text-[10px] font-bold text-gray-400 mb-2">📨 Send Warning to Player Inbox</h5>
                        <div className="flex gap-2">
                          <input type="text" value={warningText} onChange={e => setWarningText(e.target.value)}
                            placeholder="Type warning message..."
                            className="flex-1 p-1.5 bg-black/50 border border-gray-700 rounded text-[10px] text-gray-300" />
                          <button onClick={() => { if (warningText.trim()) { addInboxMessage({ type: "system", title: "⚠️ Admin Warning", body: warningText.trim(), targetAddress: lookupAddress }); setWarningText(""); rerender(); t("Warning sent"); } }}
                            className="px-3 py-1 text-[10px] font-bold bg-orange-600/40 text-orange-200 rounded border border-orange-500/30 hover:bg-orange-600/60">
                            Send</button>
                        </div>
                      </div>
                    </div>
                    <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
                      <h4 className="text-xs font-bold text-cyan-400 mb-3">📋 Player Activity</h4>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <button onClick={() => setShowTransactions(!showTransactions)}
                          className="px-3 py-1.5 text-[10px] font-bold bg-gray-700 text-gray-300 rounded hover:bg-gray-600">
                          {showTransactions ? "Hide" : "View"} Transactions</button>
                      </div>
                      <div className="text-[10px] text-gray-500">
                        <p>Status: {isAddressBanned(lookupAddress) ? "🚫 Banned" : isAddressFrozen(lookupAddress) ? "❄️ Frozen" : "✅ Active"}</p>
                      </div>
                      {showTransactions && (
                        <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                          {getTransactions().slice(0, 30).map(tx => (
                            <div key={tx.id} className="flex items-center justify-between p-1 bg-black/30 rounded text-[9px]">
                              <span className={`font-mono ${tx.type === "income" ? "text-green-500" : "text-red-500"}`}>
                                {tx.type === "income" ? "+" : "-"}{tx.amount}
                              </span>
                              <span className="text-gray-500 flex-1 ml-1">{tx.description?.slice(0, 40)}</span>
                              <span className="text-gray-600">{tx.created_at?.slice(0, 10)}</span>
                            </div>
                          ))}
                          {getTransactions().length === 0 && <p className="text-[10px] text-gray-600">No transactions.</p>}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Admin Inventory → Transfer to Player */}
                  <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
                    <h4 className="text-xs font-bold text-cyan-400 mb-2">Admin Inventory — Click to Gift to Player</h4>
                    <p className="text-[9px] text-gray-500 mb-2">Transfer items from admin inventory to {lookupAddress.slice(0, 6)}...</p>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {getInventory().filter(i => !i.owner || i.owner === null).map(i => (
                        <div key={i.id} className="flex items-center justify-between p-1.5 bg-black/30 rounded text-[10px] hover:bg-black/50 cursor-pointer"
                          onClick={() => { adminTransferItem(i.id, lookupAddress); rerender(); t(`Transferred ${i.name}`); }}>
                          <span className="text-gray-300">{i.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">{i.rarity} {i.slot}</span>
                            <span className="text-[9px] text-cyan-500/70">→ Gift</span>
                          </div>
                        </div>
                      ))}
                      {getInventory().filter(i => !i.owner || i.owner === null).length === 0 && (
                        <p className="text-[10px] text-gray-600">No unowned items in inventory.</p>
                      )}
                    </div>
                  </div>

                  {/* Heroes */}
                  <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
                    <h4 className="text-xs font-bold text-cyan-400 mb-2">Heroes ({lookupHeroes.length})</h4>
                    {lookupHeroes.length === 0 ? <p className="text-[10px] text-gray-500">No heroes found.</p> : (
                      <div className="space-y-1 max-h-64 overflow-y-auto">
                        {lookupHeroes.map(h => (
                          <div key={h.id} className="flex items-center justify-between p-1.5 bg-black/30 rounded text-[10px]">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-bold">{h.name}</span>
                              <span className="text-gray-500">Lv.{h.level} {h.class} {h.rarity}</span>
                              <span className="text-gray-600">⚡{h.energy}/{h.max_energy}</span>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => { adminGiveXP(h.id, 100); rerender(); t("Gave 100 XP"); }}
                                className="px-1.5 py-0.5 bg-purple-600/30 text-purple-300 rounded text-[9px] hover:bg-purple-600/50">+100 XP</button>
                              <button onClick={() => { adminSetLevel(h.id, h.level + 1); rerender(); t(`Level up to ${h.level + 1}`); }}
                                className="px-1.5 py-0.5 bg-yellow-600/30 text-yellow-300 rounded text-[9px] hover:bg-yellow-600/50">+1 Lv</button>
                              <button onClick={() => { adminDeleteHero(h.id); rerender(); t(`Deleted ${h.name}`); }}
                                className="px-1.5 py-0.5 bg-red-600/30 text-red-300 rounded text-[9px] hover:bg-red-600/50">Delete</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Inventory & Cosmetics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
                      <h4 className="text-xs font-bold text-cyan-400 mb-2">Inventory ({lookupInventory.length})</h4>
                      {lookupInventory.length === 0 ? <p className="text-[10px] text-gray-500">No items.</p> : (
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {lookupInventory.map(i => (
                            <div key={i.id} className="flex items-center justify-between p-1 bg-black/30 rounded text-[10px]">
                              <span className="text-gray-300">{i.name}</span>
                              <span className="text-gray-500">{i.rarity} {i.slot}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
                      <h4 className="text-xs font-bold text-cyan-400 mb-2">Cosmetics ({lookupCosmetics.length})</h4>
                      {lookupCosmetics.length === 0 ? <p className="text-[10px] text-gray-500">No cosmetics.</p> : (
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {lookupCosmetics.map(c => (
                            <div key={c.id} className="flex items-center justify-between p-1 bg-black/30 rounded text-[10px]">
                              <span className="text-gray-300">{c.name}</span>
                              <span className="text-gray-500">{c.rarity} {c.type}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* HERO MANAGEMENT */}
          {activeModule === "heroes" && (
            <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
              <h3 className="text-sm font-bold text-cyan-400 mb-4">Hero Management</h3>
              <p className="text-[10px] text-gray-500 mb-3">Total heroes: {getHeroes().length} | Legendary: {getHeroes().filter(h => h.is_legendary).length}</p>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {getHeroes().map(h => (
                  <div key={h.id} className="flex items-center justify-between p-1.5 bg-black/30 rounded text-[10px]">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">{h.name}</span>
                      <span className="text-gray-500">Lv.{h.level} {h.class} {h.rarity}</span>
                      <span className="text-gray-600">⚡{h.energy}/{h.max_energy}</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { adminGiveXP(h.id, 100); rerender(); t(`+100 XP to ${h.name}`); }}
                        className="px-2 py-0.5 bg-purple-600/30 text-purple-300 rounded hover:bg-purple-600/50">+100 XP</button>
                      <button onClick={() => { adminSetLevel(h.id, h.level + 1); rerender(); t(`${h.name} → Lv.${h.level + 1}`); }}
                        className="px-2 py-0.5 bg-yellow-600/30 text-yellow-300 rounded hover:bg-yellow-600/50">+1 Lv</button>
                      <button onClick={() => { adminDeleteHero(h.id); rerender(); t(`Deleted ${h.name}`); }}
                        className="px-2 py-0.5 bg-red-600/30 text-red-300 rounded hover:bg-red-600/50">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CRYO POD */}
          {activeModule === "cryopod" && (
            <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
              <h3 className="text-sm font-bold text-cyan-400 mb-4">❄️ Cryo Pod Management</h3>
              <p className="text-[10px] text-gray-500 mb-3">Current hatch cost: {HERO_HATCH_COST} 0BOMB</p>
              <button onClick={() => { if (address) { const hero = generateHero(address, 1); addHero(hero); setGeneratedHero(hero); t(`Hatched ${hero.name}`); } }}
                className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-cyan-600 to-purple-600 rounded text-white"
              >Free Hatch (Admin)</button>
              {generatedHero && (
                <div className="mt-3 p-2 bg-black/30 rounded text-[10px] font-mono text-gray-300">
                  <div>Name: {generatedHero.name}</div>
                  <div>Class: {generatedHero.class} | Rarity: {generatedHero.rarity}</div>
                  <div>Energy: {generatedHero.energy}/{generatedHero.max_energy}</div>
                </div>
              )}
            </div>
          )}

          {/* GACHA */}
          {activeModule === "gacha" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
                <h3 className="text-sm font-bold text-cyan-400 mb-4">🎰 Gacha Controls</h3>
                <div className="space-y-2">
                  <button onClick={() => { const eq = generateEquipment(undefined, null); addToInventory(eq); t(`Generated ${eq.name}`); }}
                    className="w-full text-left px-3 py-2 text-xs text-gray-300 bg-black/30 border border-gray-700 rounded hover:border-cyan-500/50">🎒 Mint Free Equipment</button>
                  <button onClick={() => { const cos = generateCosmetic(undefined, null); addCosmetic(cos); t(`Generated ${cos.name}`); }}
                    className="w-full text-left px-3 py-2 text-xs text-gray-300 bg-black/30 border border-gray-700 rounded hover:border-cyan-500/50">🎨 Mint Free Cosmetic</button>
                </div>
              </div>
              <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
                <h3 className="text-sm font-bold text-cyan-400 mb-4">Drop Rates</h3>
                <div className="text-[10px] text-gray-400 space-y-1">
                  <div>Equipment: {cfg.equipmentDropRate}x</div>
                  <div>Cosmetic: {cfg.cosmeticDropRate}x</div>
                  <div>Rare Loot: {cfg.rareLootDropRate}x</div>
                </div>
              </div>
            </div>
          )}

          {/* AI INTELLIGENCE */}
          {activeModule === "ai" && (
            <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
              <h3 className="text-sm font-bold text-cyan-400 mb-4">🧠 AI Intelligence Center</h3>
              <div className="text-[10px] text-gray-400 space-y-1">
                <p>Heroes learn from combat, loot collection, and survival.</p>
                <p>Intelligence types: Combat, Survival, Loot, Hazard Recognition, Pathfinding, Resource Optimization.</p>
                <p>6 traits can be unlocked through gameplay.</p>
              </div>
              <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
                {["Combat", "Survival", "Loot", "Pathfinding", "Hazard", "Resource"].map(t => {
                  const total = getHeroes().reduce((s, h) => s + (h.intelligence?.[t] || 0), 0);
                  return (
                    <div key={t} className="bg-black/30 rounded p-2">
                      <div className="text-[9px] text-gray-500">{t}</div>
                      <div className="text-xs font-bold text-cyan-400">{total}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MEMORY ANALYTICS */}
          {activeModule === "memory" && (
            <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
              <h3 className="text-sm font-bold text-cyan-400 mb-4">🔮 Memory Analytics</h3>
              <div className="text-[10px] text-gray-400 mb-3">
                Total memories: {getHeroes().reduce((s, h) => s + (h.memories?.length || 0), 0)}
              </div>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {getHeroes().filter(h => h.memories?.length).slice(0, 20).map(h => (
                  <div key={h.id} className="p-1.5 bg-black/30 rounded text-[10px]">
                    <span className="text-white font-bold">{h.name}</span>
                    <span className="text-gray-500 ml-2">({h.memories?.length || 0} memories)</span>
                    <div className="text-gray-600 ml-2">Last: {h.memories?.slice(-1)[0]?.event || "none"}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MARKETPLACE */}
          {activeModule === "marketplace" && (
            <div className="space-y-4">
              <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-cyan-400">🏪 Marketplace Controls</h3>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${cfg.marketplacePaused ? "bg-red-600/30 text-red-300" : "bg-green-600/30 text-green-300"}`}>
                    {cfg.marketplacePaused ? "PAUSED" : "Active"}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-400">Fee: {(cfg.marketplaceFee * 100).toFixed(1)}%</span>
                  <span className="text-xs text-gray-500">Active listings: {getActiveListings().length}</span>
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {getActiveListings().map(l => (
                    <div key={l.id} className="flex items-center justify-between p-1.5 bg-black/30 rounded text-[10px]">
                      <span className="text-gray-300">{l.item_type} {l.item_id.slice(0, 12)}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">{l.price} 0BOMB</span>
                        <button onClick={() => { adminCancelListing(l.id); rerender(); t(`Listing ${l.id.slice(0, 8)} cancelled`); }}
                          className="px-1.5 py-0.5 bg-red-600/30 text-red-300 rounded hover:bg-red-600/50">Cancel</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
                <h3 className="text-sm font-bold text-cyan-400 mb-3">📋 All Market Items</h3>
                <p className="text-[10px] text-gray-500 mb-3">All listings (active, sold, cancelled).</p>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {getListings().slice(0, 50).map(l => (
                    <div key={l.id} className="flex items-center justify-between p-1.5 bg-black/30 rounded text-[10px]">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold ${l.status === "active" ? "text-green-400" : l.status === "sold" ? "text-yellow-400" : "text-gray-500"}`}>
                          {l.status === "active" ? "🟢" : l.status === "sold" ? "💰" : "❌"}
                        </span>
                        <span className="text-gray-300 text-[10px]">{l.item_type}</span>
                        <span className="text-gray-500 text-[9px]">{l.price} 0BOMB</span>
                      </div>
                      <span className="text-gray-600 text-[9px]">{l.seller.slice(0, 8)}... | {l.created_at?.slice(0, 10)}</span>
                    </div>
                  ))}
                  {getListings().length === 0 && <p className="text-[10px] text-gray-600">No listings yet.</p>}
                </div>
              </div>
            </div>
          )}

          {/* NFT CENTER */}
          {activeModule === "nft" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
                <h3 className="text-sm font-bold text-cyan-400 mb-4">🖼️ NFT Center</h3>
                <p className="text-[10px] text-gray-500">Total equipment: {getInventory().length} | Cosmetics: {getCosmetics().length}</p>
                <p className="text-[10px] text-gray-500 mt-1">Legendary items: {getInventory().filter(i => i.rarity === "Legendary").length}</p>
                <p className="text-[10px] text-gray-500 mt-1">Mythic cosmetics: {getCosmetics().filter(c => c.rarity === "Mythic").length}</p>
              </div>
              <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
                <h3 className="text-sm font-bold text-cyan-400 mb-4">Rarity Distribution</h3>
                {["Common", "Rare", "Epic", "Legendary", "Mythic"].map(r => {
                  const eqCount = getInventory().filter(i => i.rarity === r).length;
                  const cosCount = getCosmetics().filter(c => c.rarity === r).length;
                  if (r === "Mythic" && eqCount === 0 && cosCount === 0) return null;
                  return (
                    <div key={r} className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-gray-400 w-16">{r}</span>
                      <span className="text-gray-500">Equip: {eqCount} | Cosm: {cosCount}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* EVENTS */}
          {activeModule === "events" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
                <h3 className="text-sm font-bold text-cyan-400 mb-4">🎉 Event Manager</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-gray-400">Event Multiplier:</span>
                  <span className="text-sm font-mono text-cyan-400">{cfg.eventRewardMultiplier}x</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { saveCfg({ eventRewardMultiplier: 2.0 }); t("Event activated! 2x rewards"); }}
                    className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-green-600 to-teal-600 rounded text-white hover:from-green-500 hover:to-teal-500">
                    🎉 Activate 2x Event</button>
                  <button onClick={() => { saveCfg({ eventRewardMultiplier: 1.0 }); t("Event deactivated"); }}
                    className="px-4 py-2 text-xs font-bold bg-gray-700 rounded text-gray-300 hover:bg-gray-600">
                    End Event</button>
                </div>
              </div>
              <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
                <h3 className="text-sm font-bold text-cyan-400 mb-4">Active Events</h3>
                {cfg.eventRewardMultiplier > 1 ? (
                  <div className="p-2 bg-green-600/20 border border-green-500/30 rounded">
                    <p className="text-[10px] text-green-300 font-bold">🎊 {cfg.eventRewardMultiplier}x Reward Event Active!</p>
                  </div>
                ) : (
                  <p className="text-[10px] text-gray-500">No active events.</p>
                )}
              </div>
            </div>
          )}

          {/* MAP MANAGER */}
          {activeModule === "maps" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
                <h3 className="text-sm font-bold text-cyan-400 mb-4">🗺️ Map Manager</h3>
                <p className="text-[10px] text-gray-500">Max maps: 4 | Max heroes/map: 5 | Max active heroes: 20</p>
                <div className="mt-3 bg-black/30 rounded p-2">
                  <p className="text-[10px] text-gray-400">Map grid: 21×17 cells (40px each)</p>
                  <p className="text-[10px] text-gray-400">Destructible tiles: 70% of inner area</p>
                </div>
              </div>
              <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
                <h3 className="text-sm font-bold text-cyan-400 mb-4">Active Map Sessions</h3>
                {(() => {
                  try {
                    const battle = JSON.parse(localStorage.getItem("0gbomber_active_battle") || "null");
                    if (battle) return (
                      <div className="text-[10px] text-gray-400 space-y-1">
                        <div className="text-green-400 font-bold">⚔ Battle in progress</div>
                        <div>Heroes: {battle.heroes?.length || 0}</div>
                        <div>Elapsed: {Math.floor((battle.elapsed || 0) / 60)}m {(battle.elapsed || 0) % 60}s</div>
                        <div>Ticks: {battle.tick || 0}</div>
                      </div>
                    );
                  } catch {}
                  return <p className="text-[10px] text-gray-500">No active battle sessions.</p>;
                })()}
              </div>
            </div>
          )}

          {/* BOSS MANAGER */}
          {activeModule === "bosses" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
                <h3 className="text-sm font-bold text-cyan-400 mb-4">👾 Boss Manager</h3>
                <p className="text-[10px] text-gray-500">Spawn chance: 30% per battle</p>
                <div className="mt-3 space-y-1">
                  {[
                    { name: "Lava Titan", hp: 12, color: "red" },
                    { name: "Hive Queen", hp: 10, color: "purple" },
                    { name: "Ancient Guardian", hp: 15, color: "green" },
                    { name: "Void Dragon", hp: 20, color: "blue" },
                  ].map(b => (
                    <div key={b.name} className="flex items-center justify-between p-1.5 bg-black/30 rounded text-[10px]">
                      <span className="text-white">{b.name}</span>
                      <span className="text-gray-500">{b.hp} HP</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
                <h3 className="text-sm font-bold text-cyan-400 mb-4">Boss Spawn Controls</h3>
                <button onClick={() => t("Boss spawn rate control coming soon")}
                  className="px-3 py-1.5 text-[10px] font-bold bg-gray-700 rounded text-gray-300 hover:bg-gray-600">
                  Force Spawn Boss (Next Battle)</button>
                <p className="text-[10px] text-gray-500 mt-2">Boss kill rewards: 50% extra loot & potions</p>
              </div>
            </div>
          )}

          {/* LEADERBOARD */}
          {activeModule === "leaderboard" && (
            <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
              <h3 className="text-sm font-bold text-cyan-400 mb-4">🏆 Leaderboard</h3>
              <div className="text-[10px] text-gray-500 mb-3">Top heroes by level (local)</div>
              <div className="space-y-1">
                {getHeroes().sort((a, b) => b.level - a.level).slice(0, 10).map((h, i) => (
                  <div key={h.id} className={`flex items-center justify-between p-1.5 bg-black/30 rounded text-[10px] ${i === 0 ? "border border-yellow-500/30" : ""}`}>
                    <span className="text-gray-400 w-4">#{i + 1}</span>
                    <span className="text-white font-bold flex-1">{h.name}</span>
                    <span className="text-gray-500">Lv.{h.level} | {h.rarity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* USER MANAGEMENT */}
          {activeModule === "users" && (
            <div className="space-y-4">
              <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
                <h3 className="text-sm font-bold text-cyan-400 mb-4">👥 User Management</h3>
                <p className="text-[10px] text-gray-500">Unique addresses: {[...new Set(getHeroes().map(h => h.owner_address))].length}</p>
                <p className="text-[10px] text-gray-500 mt-1">Owner wallet: {OWNER_WALLET.slice(0, 10)}...{OWNER_WALLET.slice(-6)}</p>
              </div>
              <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
                <h3 className="text-xs font-bold text-cyan-400 mb-3">🔍 Quick Player Lookup</h3>
                <div className="flex gap-2 mb-3">
                  <input type="text" value={lookupAddress} onChange={e => setLookupAddress(e.target.value)}
                    placeholder="Enter wallet address... "
                    className="flex-1 p-2 bg-black/50 border border-gray-700 rounded text-xs text-gray-300 font-mono" />
                  <button onClick={() => { if (lookupAddress) t(`Loaded player data`); else setActiveModule("players"); }}
                    className="px-3 py-2 text-xs font-bold bg-cyan-600 rounded text-white hover:bg-cyan-500">Search</button>
                </div>
                {lookupAddress && (
                  <div className="space-y-3">
                    <p className="text-[10px] text-gray-500">
                      Heroes: {lookupHeroes.length} | Items: {lookupInventory.length} | Cosmetics: {lookupCosmetics.length}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => { adminAddHeroFn(lookupAddress); rerender(); t("Hero granted"); }}
                        className="px-2 py-1 text-[9px] font-bold bg-purple-600/40 text-purple-200 rounded border border-purple-500/30">Grant Hero</button>
                      <button onClick={() => { adminAddItem(lookupAddress); rerender(); t("Item granted"); }}
                        className="px-2 py-1 text-[9px] font-bold bg-blue-600/40 text-blue-200 rounded border border-blue-500/30">Grant Equip</button>
                      <button onClick={() => { adminAddCosmeticFn(lookupAddress); rerender(); t("Cosmetic granted"); }}
                        className="px-2 py-1 text-[9px] font-bold bg-pink-600/40 text-pink-200 rounded border border-pink-500/30">Grant Cosmetic</button>
                      <button onClick={() => { adminAddPotions(10, lookupAddress); rerender(); t("+10 potions"); }}
                        className="px-2 py-1 text-[9px] font-bold bg-green-600/40 text-green-200 rounded border border-green-500/30">+10 Potions</button>
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {lookupHeroes.map(h => (
                        <div key={h.id} className="flex items-center justify-between p-1 bg-black/30 rounded text-[10px]">
                          <span className="text-gray-300">{h.name} Lv.{h.level}</span>
                          <div className="flex gap-1">
                            <button onClick={() => { adminGiveXP(h.id, 100); rerender(); }}
                              className="px-1 py-0.5 bg-purple-600/30 text-purple-300 rounded text-[9px]">+100XP</button>
                            <button onClick={() => { adminDeleteHero(h.id); rerender(); }}
                              className="px-1 py-0.5 bg-red-600/30 text-red-300 rounded text-[9px]">Del</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* BLOCKCHAIN */}
          {activeModule === "blockchain" && (
            <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
              <h3 className="text-sm font-bold text-cyan-400 mb-4">⛓️ Blockchain Center</h3>
              <div className="text-[10px] text-gray-400 space-y-1">
                <div>Chain: 0G Galileo Testnet (ID: 16602)</div>
                <div>Token: 0BOMB</div>
                <div>RPC: evmrpc-testnet.0g.ai</div>
                <div>Treasury: {OWNER_WALLET}</div>
                <div>Connected: {address?.slice(0, 10)}...{address?.slice(-6)}</div>
              </div>
            </div>
          )}

          {/* TREASURY */}
          {activeModule === "treasury" && (
            <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
              <h3 className="text-sm font-bold text-cyan-400 mb-4">🏦 Treasury Center</h3>
              <div className="text-[10px] text-gray-400 space-y-1">
                <div>Treasury Address: {OWNER_WALLET}</div>
                <div>Total hatch fees: {getHeroes().length} heroes × {HERO_HATCH_COST} 0BOMB = {getHeroes().length * parseInt(HERO_HATCH_COST)} 0BOMB</div>
                <div>Mint costs: {LOOT_MINT_COST} / {COSMETIC_MINT_COST} 0BOMB (equip/cosmetic)</div>
              </div>
            </div>
          )}

          {/* MAINTENANCE */}
          {activeModule === "maintenance" && (
            <div className="space-y-4">
              <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-cyan-400">🔧 Global Maintenance</h3>
                    <p className="text-[10px] text-gray-500">Normal players redirected to /maintenance</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={cfg.globalMaintenance} onChange={e => saveCfg({ globalMaintenance: e.target.checked })} className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-700 rounded-full peer-checked:bg-cyan-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "Marketplace", key: "marketplacePaused" as const },
                  { label: "Trading", key: "tradingPaused" as const },
                  { label: "Reward Claims", key: "rewardsPaused" as const },
                ].map(item => (
                  <div key={item.key} className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-300">{item.label}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={cfg[item.key]} onChange={e => saveCfg({ [item.key]: e.target.checked })} className="sr-only peer" />
                        <div className="w-9 h-5 bg-gray-700 rounded-full peer-checked:bg-cyan-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EMERGENCY CONTROLS */}
          {activeModule === "emergency" && (
            <div className="space-y-4">
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <h3 className="text-sm font-bold text-red-400 mb-2">🚨 Emergency Controls</h3>
                <p className="text-[10px] text-red-300/70 mb-4">Instantly pause critical systems without shutting down the game.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { label: "Pause Marketplace", key: "marketplacePaused" as const },
                    { label: "Pause Trading", key: "tradingPaused" as const },
                    { label: "Pause Reward Claims", key: "rewardsPaused" as const },
                  ].map(item => (
                    <button key={item.key} onClick={() => { saveCfg({ [item.key]: !cfg[item.key] }); t(`${item.label}: ${!cfg[item.key] ? "ON" : "OFF"}`); }}
                      className={`p-3 rounded border text-xs font-bold transition-all ${
                        cfg[item.key] ? "bg-red-600/30 border-red-500 text-red-300" : "bg-gray-800/30 border-gray-700 text-gray-400 hover:border-red-500/50"
                      }`}
                    >{cfg[item.key] ? "🛑 " + item.label : "▶ " + item.label}</button>
                  ))}
                </div>
              </div>
              <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
                <h3 className="text-sm font-bold text-cyan-400 mb-2">System Status</h3>
                <div className="space-y-2 text-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Marketplace</span>
                    <span className={`font-bold ${cfg.marketplacePaused ? "text-red-400" : "text-green-400"}`}>{cfg.marketplacePaused ? "PAUSED" : "Active"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Trading</span>
                    <span className={`font-bold ${cfg.tradingPaused ? "text-red-400" : "text-green-400"}`}>{cfg.tradingPaused ? "PAUSED" : "Active"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Reward Claims</span>
                    <span className={`font-bold ${cfg.rewardsPaused ? "text-red-400" : "text-green-400"}`}>{cfg.rewardsPaused ? "PAUSED" : "Active"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ITEM BLACKLIST */}
          {activeModule === "blacklist" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-dark-2/50 border border-red-500/20 rounded-lg p-4">
                <h3 className="text-sm font-bold text-red-400 mb-4">🚫 Item Blacklist</h3>
                <p className="text-[10px] text-gray-500 mb-3">Blacklisted items cannot be equipped by any hero.</p>
                <div className="space-y-1 max-h-80 overflow-y-auto">
                  {getItemBlacklist().map(id => (
                    <div key={id} className="flex items-center justify-between p-1.5 bg-black/30 rounded text-[10px]">
                      <span className="text-gray-300 font-mono">{id.slice(0, 24)}</span>
                      <button onClick={() => { adminUnblacklistItem(id); rerender(); t("Item unblacklisted"); }}
                        className="px-1.5 py-0.5 bg-green-600/30 text-green-300 rounded hover:bg-green-600/50">Unblock</button>
                    </div>
                  ))}
                  {getItemBlacklist().length === 0 && <p className="text-[10px] text-gray-600">No blacklisted items.</p>}
                </div>
              </div>
              <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
                <h3 className="text-sm font-bold text-cyan-400 mb-4">All Inventory Items</h3>
                <p className="text-[10px] text-gray-500 mb-3">Click an item to blacklist it.</p>
                <div className="space-y-1 max-h-80 overflow-y-auto">
                  {getInventory().filter(i => !getItemBlacklist().includes(i.id)).map(i => (
                    <div key={i.id} className="flex items-center justify-between p-1.5 bg-black/30 rounded text-[10px]">
                      <span className="text-gray-300">{i.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">{i.rarity}</span>
                        <button onClick={() => { adminBlacklistItem(i.id); rerender(); t(`${i.name} blacklisted`); }}
                          className="px-1.5 py-0.5 bg-red-600/30 text-red-300 rounded text-[9px] hover:bg-red-600/50">Block</button>
                      </div>
                    </div>
                  ))}
                  {getInventory().filter(i => !getItemBlacklist().includes(i.id)).length === 0 && (
                    <p className="text-[10px] text-gray-600">No unblacklisted items.</p>
                  )}
                </div>
              </div>
            </div>
          )}
          {activeModule === "analytics" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
                <h3 className="text-sm font-bold text-cyan-400 mb-4">📈 Analytics Center</h3>
                <div className="text-[10px] text-gray-400 space-y-1">
                  <div>Heroes created: {getHeroes().length}</div>
                  <div>Total level sum: {getHeroes().reduce((s, h) => s + h.level, 0)}</div>
                  <div>Legendary heroes: {getHeroes().filter(h => h.is_legendary).length}</div>
                  <div>Items in inv: {getInventory().length}</div>
                  <div>Cosmetics: {getCosmetics().length}</div>
                  <div>Listings: {getActiveListings().length}</div>
                </div>
              </div>
              <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
                <h3 className="text-sm font-bold text-cyan-400 mb-4">Class Distribution</h3>
                {["Engineer", "Scout", "Marine", "Scientist", "Medic", "Commander", "Miner"].map(cls => {
                  const count = getHeroes().filter(h => h.class === cls).length;
                  const pct = getHeroes().length ? (count / getHeroes().length * 100).toFixed(1) : "0";
                  return (
                    <div key={cls} className="flex items-center gap-2 text-[10px] mb-1">
                      <span className="text-gray-400 w-16">{cls}</span>
                      <div className="flex-1 h-2 bg-gray-700 rounded overflow-hidden">
                        <div className="h-full bg-cyan-500 rounded" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-gray-500 w-10 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* DEV TOOLS */}
          {activeModule === "devtools" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
                <h3 className="text-sm font-bold text-cyan-400 mb-4">⚒️ Developer Tools</h3>
                <div className="space-y-2">
                  <button onClick={() => { if (address) { const h = generateHero(address, 1); addHero(h); t(`Generated ${h.name}`); } }}
                    className="w-full text-left px-3 py-2 text-xs text-gray-300 bg-black/30 border border-gray-700 rounded hover:border-cyan-500/50">Generate Hero</button>
                  <button onClick={() => { const eq = generateEquipment(undefined, null); addToInventory(eq); t(`Generated ${eq.name}`); }}
                    className="w-full text-left px-3 py-2 text-xs text-gray-300 bg-black/30 border border-gray-700 rounded hover:border-cyan-500/50">Generate Equipment</button>
                  <button onClick={() => { const cos = generateCosmetic(undefined, null); addCosmetic(cos); t(`Generated ${cos.name}`); }}
                    className="w-full text-left px-3 py-2 text-xs text-gray-300 bg-black/30 border border-gray-700 rounded hover:border-cyan-500/50">Generate Cosmetic</button>
                  <button onClick={() => { adminAddPotions(50); rerender(); t("50 potions added"); }}
                    className="w-full text-left px-3 py-2 text-xs text-gray-300 bg-black/30 border border-gray-700 rounded hover:border-cyan-500/50">Add 50 Energy Potions</button>
                </div>
              </div>
              <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
                <h3 className="text-sm font-bold text-cyan-400 mb-4">Debug Console</h3>
                <div className="bg-black/50 rounded p-3 font-mono text-[10px] text-gray-500 max-h-48 overflow-y-auto">
                  <div>Admin Config: {JSON.stringify(cfg, null, 1)}</div>
                </div>
              </div>
            </div>
          )}

          {/* ANALYTICS */}
          {activeModule === "analytics" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
                <h3 className="text-sm font-bold text-cyan-400 mb-4">📈 Analytics Center</h3>
                <div className="text-[10px] text-gray-400 space-y-1">
                  <div>Heroes created: {getHeroes().length}</div>
                  <div>Total level sum: {getHeroes().reduce((s, h) => s + h.level, 0)}</div>
                  <div>Legendary heroes: {getHeroes().filter(h => h.is_legendary).length}</div>
                  <div>Items in inv: {getInventory().length}</div>
                  <div>Cosmetics: {getCosmetics().length}</div>
                  <div>Listings: {getActiveListings().length}</div>
                </div>
              </div>
              <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
                <h3 className="text-sm font-bold text-cyan-400 mb-4">Class Distribution</h3>
                {["Engineer", "Scout", "Marine", "Scientist", "Medic", "Commander", "Miner"].map(cls => {
                  const count = getHeroes().filter(h => h.class === cls).length;
                  const pct = getHeroes().length ? (count / getHeroes().length * 100).toFixed(1) : "0";
                  return (
                    <div key={cls} className="flex items-center gap-2 text-[10px] mb-1">
                      <span className="text-gray-400 w-16">{cls}</span>
                      <div className="flex-1 h-2 bg-gray-700 rounded overflow-hidden">
                        <div className="h-full bg-cyan-500 rounded" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-gray-500 w-10 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AUDIT LOG */}
          {activeModule === "audit" && (
            <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
              <h3 className="text-sm font-bold text-cyan-400 mb-4">📋 Admin Audit Log</h3>
              <p className="text-[10px] text-gray-500 mb-3">All admin actions are recorded here.</p>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {getAuditLog().map(entry => (
                  <div key={entry.id} className="flex items-start justify-between p-1.5 bg-black/30 rounded text-[10px]">
                    <div className="flex-1">
                      <span className="text-cyan-400 font-bold">{entry.action}</span>
                      <span className="text-gray-500 ml-2">→ {entry.target?.slice(0, 30)}</span>
                      <div className="text-gray-600">{entry.detail}</div>
                    </div>
                    <span className="text-gray-600 shrink-0 ml-2">{entry.created_at?.slice(0, 16).replace("T", " ")}</span>
                  </div>
                ))}
                {getAuditLog().length === 0 && <p className="text-[10px] text-gray-600">No audit entries yet.</p>}
              </div>
            </div>
          )}

          {/* WITHDRAWALS */}
          {activeModule === "withdrawals" && (
            <div className="space-y-4">
              <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
                <h3 className="text-sm font-bold text-cyan-400 mb-4">💸 Pending Withdrawals</h3>
                <p className="text-[10px] text-gray-500 mb-3">
                  Players redeem 5,000 0B Fragments → 500 0Bomb withdrawal request. Confirm to send 500 0Bomb from your wallet on-chain, or reject to refund fragments.
                </p>
                {(() => {
                  const reqs = getPendingWithdrawals();
                  if (reqs.length === 0) return <p className="text-[10px] text-gray-600">No pending withdrawals.</p>;
                  return (
                    <div className="space-y-2">
                      {reqs.map(req => (
                        <div key={req.id} className="flex items-center justify-between p-3 bg-black/30 rounded border border-amber-500/20">
                          <div className="flex-1">
                            <div className="text-[10px] font-mono text-gray-300">{req.playerAddress}</div>
                            <div className="text-[10px] text-gray-500 mt-0.5">
                              Amount: <span className="text-amber-400 font-bold">{req.amount} 0BOMB</span>
                              {" · "}
                              {new Date(req.createdAt).toLocaleString()}
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button onClick={async () => {
                              setWdProcessing(req.id);
                              try {
                                const txHash = await transferToken(req.playerAddress, String(req.amount));
                                confirmWithdrawal(req.id, typeof txHash === "string" ? txHash : String(Date.now()));
                                t(`✅ Sent ${req.amount} 0BOMB to ${req.playerAddress.slice(0, 6)}...`);
                              } catch (e: any) {
                                t(`❌ On-chain transfer failed: ${e.message || e}`);
                              }
                              setWdProcessing(null);
                              setRefreshKey(k => k + 1);
                            }} disabled={wdProcessing === req.id}
                              className="px-3 py-1 text-[10px] font-bold bg-green-600/40 text-green-200 rounded border border-green-500/30 hover:bg-green-600/60 disabled:opacity-40"
                            >{wdProcessing === req.id ? "⏳" : "✅ Confirm & Send"}</button>
                            <button onClick={() => {
                              if (confirm("Reject this withdrawal? 5,000 fragments will be returned.")) {
                                rejectWithdrawal(req.id);
                                t(`❌ Withdrawal rejected — fragments returned`);
                                setRefreshKey(k => k + 1);
                              }
                            }} disabled={wdProcessing === req.id}
                              className="px-3 py-1 text-[10px] font-bold bg-red-600/40 text-red-200 rounded border border-red-500/30 hover:bg-red-600/60 disabled:opacity-40"
                            >❌ Reject</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* ONLINE PLAYERS */}
          {activeModule === "online" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
                <h3 className="text-sm font-bold text-cyan-400 mb-4">🟢 Online Players</h3>
                <p className="text-[10px] text-gray-500 mb-3">Players currently connected (local mode).</p>
                <div className="space-y-1">
                  {isConnected ? (
                    <div className="flex items-center justify-between p-2 bg-black/30 rounded text-[10px]">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full inline-block" />
                        <span className="text-green-400 font-bold">Online</span>
                      </div>
                      <span className="text-gray-300 font-mono">{address?.slice(0, 10)}...{address?.slice(-6)}</span>
                    </div>
                  ) : (
                    <p className="text-[10px] text-gray-500">Wallet not connected.</p>
                  )}
                </div>
              </div>
              <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
                <h3 className="text-sm font-bold text-cyan-400 mb-4">Status Overview</h3>
                <div className="text-[10px] text-gray-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Connected Wallet</span>
                    <span className={isConnected ? "text-green-400" : "text-red-400"}>{isConnected ? "Online" : "Offline"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Admin Access</span>
                    <span className="text-green-400">Granted</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Banned Addresses</span>
                    <span className="text-red-400">{getBannedAddresses().length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frozen Addresses</span>
                    <span className="text-blue-400">{getFrozenAddresses().length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}