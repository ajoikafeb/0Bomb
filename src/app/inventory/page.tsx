"use client";

import { useState, useEffect, useMemo } from "react";
import { useWalletContext } from "@/components/wallet/WalletProvider";
import { generateHero } from "@/lib/game/heroGenerator";
import { generateEquipment, formatStatLabel } from "@/lib/game/equipmentSystem";
import { generateCosmetic } from "@/lib/game/cosmeticSystem";
import { addHero, getHeroes, getInventory, addToInventory, getCosmetics, addCosmetic, getEnergyPotions, addTransaction, autoEquipHero, autoEquipCosmetics, getFragments, claimTokens } from "@/lib/game/GameStateManager";
import { HERO_HATCH_COST, LOOT_MINT_COST, COSMETIC_MINT_COST, TREASURY_ADDRESS, TOKEN_SYMBOL, EQUIPMENT_SLOTS, COSMETIC_SLOTS } from "@/lib/game/constants";
import { transferToken, getTokenBalance } from "@/lib/blockchain/provider";
import type { Hero } from "@/lib/game/types";
import type { Equipment } from "@/lib/game/equipmentSystem";
import type { Cosmetic } from "@/lib/game/cosmeticSystem";
import { IconBomb, IconShield, IconBoots, IconArmor, IconHelmet, IconRing, IconCrown, IconWings, IconAura, IconTrail, IconSkin, UIHeart, UICoin, UIStar, UILevel, UIXP } from "@/components/pixel-art/assets";

const EQUIP_ICONS: Record<string, React.FC<{ size?: number; className?: string }>> = {
  bomb: IconBomb,
  shield: IconShield,
  boots: IconBoots,
  armor: IconArmor,
  helmet: IconHelmet,
  ring: IconRing,
};

type Tab = "inventory" | "mint";
type MintType = "hero" | "loot" | "cosmetic";
type EqSort = "name" | "rarity" | "statTotal";
type CosSort = "name" | "rarity" | "statTotal";
type InvFilter = "all" | "equipment" | "cosmetics";

const RARITIES = ["Common", "Rare", "Epic", "Legendary", "Mythic"] as const;
const PER_PAGE = 12;

const rarityOrder: Record<string, number> = { Common: 0, Rare: 1, Epic: 2, Legendary: 3, Mythic: 4, Genesis: 5 };
const RARITY_RANK = rarityOrder;
const rarityColors: Record<string, string> = {
  Common: "text-gray-300", Rare: "text-blue-300", Epic: "text-purple-300",
  Legendary: "text-yellow-300", Mythic: "text-red-300",
};

interface MintResult {
  type: MintType;
  qty?: number;
  items: { name: string; rarity: string; detail: string }[];
}

function Pagination({ page, total, perPage, onChange }: { page: number; total: number; perPage: number; onChange: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  if (pages <= 1) return null;
  const items: React.ReactNode[] = [];
  const addPage = (p: number, label?: string) => {
    items.push(
      <button key={label || p} onClick={() => onChange(p)}
        className={`px-2 py-0.5 text-[10px] rounded border ${p === page ? "border-cyan-500 bg-cyan-500/15 text-cyan-300" : "border-gray-700 text-gray-500 hover:border-gray-500"}`}
      >{label || p}</button>
    );
  };
  addPage(1, "«");
  for (let p = Math.max(1, page - 2); p <= Math.min(pages, page + 2); p++) addPage(p);
  addPage(pages, "»");
  return <div className="flex items-center justify-center gap-1 mt-3">{items}</div>;
}

function sortItems<T extends { rarity: string; name: string }>(items: T[], sortBy: string, statFn?: (item: T) => number): T[] {
  const sorted = [...items];
  if (sortBy === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
  else if (sortBy === "rarity") sorted.sort((a, b) => (rarityOrder[a.rarity] ?? 0) - (rarityOrder[b.rarity] ?? 0));
  else if (sortBy === "statTotal" && statFn) sorted.sort((a, b) => statFn(b) - statFn(a));
  return sorted;
}

export default function InventoryPage() {
  const { isConnected, address, refreshBalance } = useWalletContext();
  const [tab, setTab] = useState<Tab>("inventory");
  const [inventory, setInventory] = useState<Equipment[]>([]);
  const [cosmetics, setCosmetics] = useState<Cosmetic[]>([]);
  const [potions, setPotions] = useState(0);
  const [tokenBalance, setTokenBalance] = useState("0");
  const [minting, setMinting] = useState(false);
  const [mintError, setMintError] = useState("");
  const [mintResult, setMintResult] = useState<MintResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [mintQty, setMintQty] = useState(1);
  const [autoEquip, setAutoEquip] = useState(false);
  const [fragments, setFragments] = useState(0);
  const [claimMsg, setClaimMsg] = useState("");

  // Filters & pagination
  const [invFilter, setInvFilter] = useState<InvFilter>("all");
  const [eqRarity, setEqRarity] = useState<string>("all");
  const [eqSlot, setEqSlot] = useState<string>("all");
  const [eqSort, setEqSort] = useState<EqSort>("rarity");
  const [eqPage, setEqPage] = useState(1);
  const [cosRarity, setCosRarity] = useState<string>("all");
  const [cosType, setCosType] = useState<string>("all");
  const [cosSort, setCosSort] = useState<CosSort>("rarity");
  const [cosPage, setCosPage] = useState(1);

  const refresh = () => {
    if (!address) return;
    setInventory(getInventory());
    setCosmetics(getCosmetics());
    setPotions(getEnergyPotions());
    setFragments(getFragments(address));
    getTokenBalance(address).then(setTokenBalance).catch(() => setTokenBalance("0"));
  };

  useEffect(() => {
    if (isConnected && address) refresh();
  }, [isConnected, address]);

  const handleMint = async (type: MintType) => {
    if (!address) return;
    const qty = mintQty;
    const costMap = { hero: HERO_HATCH_COST, loot: LOOT_MINT_COST, cosmetic: COSMETIC_MINT_COST };
    const unitCost = costMap[type];
    const totalCost = String(parseInt(unitCost) * qty);
    setMinting(true);
    setMintError("");
    setMintResult(null);
    try {
      await transferToken(TREASURY_ADDRESS, totalCost);
      const items: { name: string; rarity: string; detail: string }[] = [];
      let mintedHeroId = "";
      const descs: string[] = [];
      for (let i = 0; i < qty; i++) {
        if (type === "hero") {
          const hero = generateHero(address);
          addHero(hero);
          items.push({ name: hero.name, rarity: hero.rarity, detail: `${hero.class}` });
          descs.push(`${hero.name} (${hero.rarity})`);
          mintedHeroId = hero.id;
        } else if (type === "loot") {
          const eq = generateEquipment(undefined, null);
          addToInventory(eq);
          items.push({ name: eq.name, rarity: eq.rarity, detail: eq.slot });
          descs.push(`${eq.name} (${eq.rarity})`);
        } else {
          const cos = generateCosmetic(undefined, null);
          addCosmetic(cos);
          items.push({ name: cos.name, rarity: cos.rarity, detail: `${cos.type}` });
          descs.push(`${cos.name} (${cos.rarity})`);
        }
      }
      addTransaction({ type: "expense", category: type === "hero" ? "mint_hero" : type === "loot" ? "mint_loot" : "mint_cosmetic", amount: totalCost, description: `Minted ${qty}x ${type}: ${descs.join(", ")}`, ownerAddress: address });
      setMintResult({ type, qty, items });
      setShowResult(true);

      // Auto equip jika dicentang
      if (autoEquip) {
        if (type === "hero" && mintedHeroId) {
          const eqCount = autoEquipHero(mintedHeroId);
          const cosCount = autoEquipCosmetics(mintedHeroId);
          if (eqCount > 0 || cosCount > 0) {
            const saved = getHeroes().find(h => h.id === mintedHeroId);
            if (saved) items[0].detail = `${saved.class} · auto-equipped ${eqCount} eq, ${cosCount} cos`;
          }
        } else if (type !== "hero") {
          const heroes = getHeroes().filter(h => h.owner_address === address);
          const best = heroes.sort((a, b) => {
            const rDiff = (RARITY_RANK[b.rarity] ?? 0) - (RARITY_RANK[a.rarity] ?? 0);
            if (rDiff !== 0) return rDiff;
            return b.level - a.level;
          })[0];
          if (best) {
            const totalEq = autoEquipHero(best.id);
            const totalCos = autoEquipCosmetics(best.id);
            if (totalEq > 0 || totalCos > 0) descs.push(`(auto-equipped ${totalEq} eq, ${totalCos} cos to ${best.name})`);
          }
        }
      }

      refreshBalance();
      getTokenBalance(address).then(setTokenBalance).catch(() => setTokenBalance("0"));
      if (type === "loot" || type === "cosmetic") { setInventory(getInventory()); setCosmetics(getCosmetics()); }
    } catch (e: any) {
      const m = e?.message?.toLowerCase() || "";
      if (m.includes("user rejected") || m.includes("user denied")) {
        setMintError("Transaction cancelled");
      } else {
        setMintError(`Mint failed: ${e?.message?.slice(0, 80) || "Unknown error"}`);
      }
    } finally {
      setMinting(false);
    }
  };

  // Derived data
  const ownedEquipment = inventory.filter(i => !i.owner);
  const ownedCosmetics = cosmetics.filter(c => !c.owner);

  const filteredEquipment = useMemo(() => {
    let items = ownedEquipment;
    if (eqRarity !== "all") items = items.filter(i => i.rarity === eqRarity);
    if (eqSlot !== "all") items = items.filter(i => i.slot === eqSlot);
    items = sortItems(items, eqSort, i => Object.values(i.stats).reduce((a, b) => a + b, 0));
    return items;
  }, [ownedEquipment, eqRarity, eqSlot, eqSort]);

  const filteredCosmetics = useMemo(() => {
    let items = ownedCosmetics;
    if (cosRarity !== "all") items = items.filter(c => c.rarity === cosRarity);
    if (cosType !== "all") items = items.filter(c => c.type === cosType);
    items = sortItems(items, cosSort, c => Object.values(c.statBonus).reduce((a, b) => a + b, 0));
    return items;
  }, [ownedCosmetics, cosRarity, cosType, cosSort]);

  const eqTotal = filteredEquipment.length;
  const cosTotal = filteredCosmetics.length;
  const eqPaged = filteredEquipment.slice((eqPage - 1) * PER_PAGE, eqPage * PER_PAGE);
  const cosPaged = filteredCosmetics.slice((cosPage - 1) * PER_PAGE, cosPage * PER_PAGE);

  function FilterRow({ label, options, value, onChange }: { label: string; options: readonly string[]; value: string; onChange: (v: string) => void }) {
    return (
      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-[9px] text-gray-500 mr-1">{label}</span>
        <button onClick={() => onChange("all")} className={`px-1.5 py-0.5 text-[9px] rounded border ${value === "all" ? "border-cyan-500 bg-cyan-500/15 text-cyan-300" : "border-gray-700 text-gray-500 hover:border-gray-500"}`}>All</button>
        {options.map(o => (
          <button key={o} onClick={() => onChange(o)} className={`px-1.5 py-0.5 text-[9px] rounded border ${value === o ? "border-cyan-500 bg-cyan-500/15 text-cyan-300" : "border-gray-700 text-gray-500 hover:border-gray-500"}`}>{o}</button>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Inventory & Mint</h1>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-gray-400">🧪 {potions}</span>
          <span className="text-yellow-400" title="0Bomb wallet balance">🪙 {parseFloat(tokenBalance).toFixed(2)}</span>
        </div>
      </div>

      {/* 0B Fragment progress */}
      {isConnected && (
        <div className="mb-4 p-3 rounded border border-purple-700/30 bg-purple-900/10">
          <div className="flex items-center justify-between text-xs">
            <span className="text-purple-400 font-bold">💎 0B Fragments</span>
            <span className="text-gray-400">{fragments} / 5000 <span className="text-[9px] text-gray-600">(500 0Bomb)</span></span>
          </div>
          <div className="mt-1.5 w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (fragments / 5000) * 100)}%`, background: fragments >= 5000 ? "linear-gradient(90deg,#a855f7,#ec4899)" : "linear-gradient(90deg,#a855f7,#6366f1)" }} />
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[10px] text-gray-500">10 fragments = 1 0Bomb · Min withdrawal: 500 0Bomb</span>
            <button onClick={() => {
              const res = claimTokens(address);
              setClaimMsg(res.ok ? `✅ ${res.message}` : res.message);
              if (res.ok) {
                setFragments(getFragments(address));
                refreshBalance();
              }
              setTimeout(() => setClaimMsg(""), 5000);
            }} disabled={fragments < 5000}
              className={`px-3 py-1 text-[10px] font-bold rounded border transition-all ${fragments >= 5000 ? "border-purple-500 bg-purple-500/15 text-purple-300 hover:bg-purple-500/25" : "border-gray-700 text-gray-600 cursor-not-allowed"}`}
            >Request Withdrawal</button>
          </div>
          {claimMsg && <div className="mt-1 text-[10px] text-cyan-400">{claimMsg}</div>}
        </div>
      )}

      <div className="flex gap-1 mb-4">
        <button onClick={() => setTab("inventory")}
          className={`px-4 py-1.5 text-xs font-bold rounded border transition-all ${tab === "inventory" ? "border-cyan-500 bg-cyan-500/15 text-cyan-300" : "border-gray-700 text-gray-500 hover:border-gray-500"}`}
        >📦 Inventory ({ownedEquipment.length + ownedCosmetics.length})</button>
        <button onClick={() => setTab("mint")}
          className={`px-4 py-1.5 text-xs font-bold rounded border transition-all ${tab === "mint" ? "border-cyan-500 bg-cyan-500/15 text-cyan-300" : "border-gray-700 text-gray-500 hover:border-gray-500"}`}
        >🔨 Mint</button>
      </div>

      {!isConnected ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🔌</div>
          <p className="text-gray-500 text-sm">Connect wallet to view inventory</p>
        </div>
      ) : tab === "inventory" ? (
        <div className="space-y-6">
          {/* Filter: All / Equipment / Cosmetics */}
          <div className="flex gap-1">
            {(["all", "equipment", "cosmetics"] as const).map(f => (
              <button key={f} onClick={() => { setInvFilter(f); setEqPage(1); setCosPage(1); }}
                className={`px-3 py-1 text-[10px] font-bold rounded border ${invFilter === f ? "border-cyan-500 bg-cyan-500/15 text-cyan-300" : "border-gray-700 text-gray-500 hover:border-gray-500"}`}
              >{f === "all" ? "All" : f === "equipment" ? `🎒 Equipment (${ownedEquipment.length})` : `🎨 Cosmetics (${ownedCosmetics.length})`}</button>
            ))}
          </div>

          {(invFilter === "all" || invFilter === "equipment") && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold text-cyan-400">Equipment {invFilter === "all" && `(${ownedEquipment.length})`}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-gray-500">Sort:</span>
                  <select value={eqSort} onChange={e => { setEqSort(e.target.value as EqSort); setEqPage(1); }}
                    className="bg-gray-800 border border-gray-700 text-[10px] text-gray-300 rounded px-1 py-0.5"
                  ><option value="rarity">Rarity</option><option value="name">Name</option><option value="statTotal">Stats</option></select>
                </div>
              </div>
              <div className="space-y-1 mb-2">
                <FilterRow label="Rarity:" options={RARITIES} value={eqRarity} onChange={v => { setEqRarity(v); setEqPage(1); }} />
                <FilterRow label="Slot:" options={EQUIPMENT_SLOTS} value={eqSlot} onChange={v => { setEqSlot(v); setEqPage(1); }} />
              </div>
              {eqPaged.length === 0 ? (
                <p className="text-[11px] text-gray-600">No matching equipment.</p>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {eqPaged.map(eq => (
                      <div key={eq.id} className="border border-gray-700 rounded p-2 bg-black/30">
                        <div className="flex items-center gap-1">
                          {(() => {
                            const Icon = EQUIP_ICONS[eq.slot];
                            return Icon ? <Icon size={18} /> : null;
                          })()}
                          <span className="text-[11px] font-bold text-white truncate">{eq.name}</span>
                        </div>
                        <div className={`text-[10px] font-bold ${rarityColors[eq.rarity] || "text-gray-400"}`}>{eq.rarity}</div>
                        <div className="text-[9px] text-gray-500">{eq.slot}</div>
                        {Object.entries(eq.stats).map(([k, v]) => (
                          <div key={k} className="text-[9px] text-gray-400">+{v} {formatStatLabel(k)}</div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <Pagination page={eqPage} total={eqTotal} perPage={PER_PAGE} onChange={setEqPage} />
                </>
              )}
            </div>
          )}

          {(invFilter === "all" || invFilter === "cosmetics") && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold text-purple-400">Cosmetics {invFilter === "all" && `(${ownedCosmetics.length})`}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-gray-500">Sort:</span>
                  <select value={cosSort} onChange={e => { setCosSort(e.target.value as CosSort); setCosPage(1); }}
                    className="bg-gray-800 border border-gray-700 text-[10px] text-gray-300 rounded px-1 py-0.5"
                  ><option value="rarity">Rarity</option><option value="name">Name</option><option value="statTotal">Stats</option></select>
                </div>
              </div>
              <div className="space-y-1 mb-2">
                <FilterRow label="Rarity:" options={RARITIES} value={cosRarity} onChange={v => { setCosRarity(v); setCosPage(1); }} />
                <FilterRow label="Type:" options={COSMETIC_SLOTS} value={cosType} onChange={v => { setCosType(v); setCosPage(1); }} />
              </div>
              {cosPaged.length === 0 ? (
                <p className="text-[11px] text-gray-600">No matching cosmetics.</p>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {cosPaged.map(cos => (
                      <div key={cos.id} className="border border-gray-700 rounded p-2 bg-black/30">
                        <div className="flex items-center gap-1">
                          {(() => {
                            const iconMap: Record<string, React.FC<{ size?: number; className?: string }>> = { crown: IconCrown, wings: IconWings, aura: IconAura, trail: IconTrail, skin: IconSkin };
                            const Icon = iconMap[cos.type];
                            return Icon ? <Icon size={16} /> : <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cos.color }} />;
                          })()}
                          <span className="text-[11px] font-bold text-white truncate">{cos.name}</span>
                        </div>
                        <div className={`text-[10px] font-bold ${rarityColors[cos.rarity] || "text-gray-400"}`}>{cos.rarity}</div>
                        <div className="text-[9px] text-gray-500">{cos.type}</div>
                        {Object.entries(cos.statBonus).map(([k, v]) => (
                          <div key={k} className="text-[9px] text-gray-400">+{v} {formatStatLabel(k)}</div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <Pagination page={cosPage} total={cosTotal} perPage={PER_PAGE} onChange={setCosPage} />
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-lg mx-auto">
          <div className="space-y-3">
            {/* Qty selector */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500">Qty:</span>
              {[1, 5, 10].map(q => (
                <button key={q} onClick={() => setMintQty(q)}
                  className={`px-3 py-1 text-[11px] font-bold rounded border ${mintQty === q ? "border-cyan-500 bg-cyan-500/15 text-cyan-300" : "border-gray-700 text-gray-500 hover:border-gray-500"}`}
                >{q}</button>
              ))}
            </div>

            {/* Auto equip toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={autoEquip} onChange={e => setAutoEquip(e.target.checked)}
                className="accent-cyan-500" />
              <span className="text-[10px] text-gray-400">Auto equip best items to minted hero</span>
            </label>

            <button onClick={() => handleMint("hero")} disabled={minting}
              className="w-full p-3 rounded border border-gray-700 bg-black/30 hover:border-gray-500 transition-all text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-white">🐣 Hatch Hero</div>
                  <div className="text-[10px] text-gray-500">{HERO_HATCH_COST} {TOKEN_SYMBOL} each · Total: {parseInt(HERO_HATCH_COST) * mintQty} {TOKEN_SYMBOL}</div>
                </div>
                <span className="text-lg">→</span>
              </div>
            </button>
            <button onClick={() => handleMint("loot")} disabled={minting}
              className="w-full p-3 rounded border border-gray-700 bg-black/30 hover:border-gray-500 transition-all text-left"
            >
              <div className="flex items-center justify-between">
                <div><div className="text-sm font-bold text-white">🎒 Mint Equipment</div><div className="text-[10px] text-gray-500">{LOOT_MINT_COST} {TOKEN_SYMBOL} each · Total: {parseInt(LOOT_MINT_COST) * mintQty} {TOKEN_SYMBOL}</div></div>
                <span className="text-lg">→</span>
              </div>
            </button>
            <button onClick={() => handleMint("cosmetic")} disabled={minting}
              className="w-full p-3 rounded border border-gray-700 bg-black/30 hover:border-gray-500 transition-all text-left"
            >
              <div className="flex items-center justify-between">
                <div><div className="text-sm font-bold text-white">🎨 Mint Cosmetic</div><div className="text-[10px] text-gray-500">{COSMETIC_MINT_COST} {TOKEN_SYMBOL} each · Total: {parseInt(COSMETIC_MINT_COST) * mintQty} {TOKEN_SYMBOL}</div></div>
                <span className="text-lg">→</span>
              </div>
            </button>
          </div>
          {minting && <div className="mt-4 text-center text-cyan-400 text-xs animate-pulse">⏳ Processing transaction...</div>}
          {mintError && <div className="mt-3 p-2 bg-red-900/20 border border-red-500/30 rounded text-[11px] text-red-400">{mintError}</div>}

          {showResult && mintResult && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowResult(false)}>
              <div className="bg-gray-900 border border-cyan-500/30 rounded-lg p-4 max-w-sm w-full mx-3 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="text-center mb-2">
                  <div className="text-3xl mb-1">{mintResult.type === "hero" ? "🐣" : mintResult.type === "loot" ? "🎒" : "🎨"}</div>
                  <h2 className="text-sm font-bold text-cyan-400">Minted{mintResult.qty && mintResult.qty > 1 ? ` ${mintResult.qty}x` : ""}!</h2>
                </div>
                <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0 mb-2">
                  {mintResult.items.map((item, i) => (
                    <div key={i} className="border border-gray-700/50 rounded p-2 bg-black/20">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-white truncate">{item.name}</span>
                        <span className={`text-[10px] font-bold ml-1 shrink-0 ${rarityColors[item.rarity] || "text-gray-400"}`}>{item.rarity}</span>
                      </div>
                      <div className="text-[9px] text-gray-500">{item.detail}</div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setShowResult(false)}
                  className="w-full py-1.5 text-[11px] font-bold bg-gradient-to-r from-cyan-600 to-purple-600 rounded text-white hover:from-cyan-500 hover:to-purple-500">OK</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
