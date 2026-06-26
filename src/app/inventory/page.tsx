"use client";

import { useState, useEffect, useMemo } from "react";
import { useWalletContext } from "@/components/wallet/WalletProvider";
import { useBalance } from "@/components/balance/BalanceProvider";
import {
  getHeroes, getInventory, getCosmetics, addToInventory, addCosmetic, addTransaction,
  getVoucherUsage, useVoucher, markSoulbound, getFragments, claimTokens,
  refreshWalletInventory, getWalletEquipment, getWalletCosmetics,
  equipItem, unequipItem, unequipAll, autoEquipHero, forceRefreshInventory, validateInventory,
} from "@/lib/game/GameStateManager";
import { generateEquipment } from "@/lib/game/equipmentSystem";
import { generateCosmetic } from "@/lib/game/cosmeticSystem";
import {
  RARITY_CONFIG, CLASS_CONFIG, HERO_CLASSES, EQUIPMENT_SLOTS,
  LOOT_MINT_COST, COSMETIC_MINT_COST, TREASURY_ADDRESS,
  VOUCHER_MAX_EQUIPMENT, VOUCHER_MAX_COSMETIC,
} from "@/lib/game/constants";
import { mintEquipment as mintEquipNFT, batchMintEquipment } from "@/lib/blockchain/equipmentNFTService";
import { mintCosmetic as mintCosmeticNFT, batchMintCosmetic } from "@/lib/blockchain/cosmeticNFTService";
import { transferToken } from "@/lib/blockchain/provider";
import type { Hero } from "@/lib/game/types";
import type { Equipment } from "@/lib/game/equipmentSystem";
import type { Cosmetic } from "@/lib/game/cosmeticSystem";
import type { InventoryTab, EquipFilter, SortOption } from "@/components/inventory/types";
import { InventoryHeader } from "@/components/inventory/InventoryHeader";
import { InventorySidebar, createSidebarTabs } from "@/components/inventory/InventorySidebar";
import { InventoryFilters } from "@/components/inventory/InventoryFilters";
import { InventoryGrid } from "@/components/inventory/InventoryGrid";
import { DetailPanel } from "@/components/inventory/DetailPanel";
import { MintSection } from "@/components/inventory/MintSection";
import { CurrencyDashboard } from "@/components/inventory/CurrencyDashboard";

interface ValidationResult {
  valid: boolean;
  heroCount: number;
  equipCount: number;
  issues: string[];
}

export default function InventoryPage() {
  const { address } = useWalletContext();
  const { obombBalance, fragmentBalance, energyPotions, refreshBalances } = useBalance();

  // Data state
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [inventory, setInventory] = useState<Equipment[]>([]);
  const [cosmetics, setCosmetics] = useState<Cosmetic[]>([]);
  const [fragmentCount, setFragments] = useState(0);
  const [msg, setMsg] = useState("");
  const [mintMsg, setMintMsg] = useState("");
  const [minting, setMinting] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [claimMsg, setClaimMsg] = useState("");

  // UI state
  const [tab, setTab] = useState<InventoryTab>("heroes");
  const [search, setSearch] = useState("");
  const [rarityFilter, setRarityFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [slotFilter, setSlotFilter] = useState("");
  const [equipFilter, setEquipFilter] = useState<EquipFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [selectedAsset, setSelectedAsset] = useState<{ type: "hero" | "equipment" | "cosmetic"; data: any } | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);

  const heroIds = useMemo(() => new Set(heroes.map(h => h.id)), [heroes]);

  const loadData = () => {
    if (!address) return;
    try {
      const data = refreshWalletInventory(address);
      setHeroes(data.heroes);
      setInventory(data.inventory);
      setCosmetics(data.cosmetics);
    } catch {
      setHeroes(getHeroes().filter(h => h.owner_address === address));
      setInventory(getWalletEquipment(address));
      setCosmetics(getWalletCosmetics(address));
    }
    setFragments(getFragments(address));
  };

  useEffect(() => {
    if (!address) return;
    loadData();
    const handleVisible = () => { if (!document.hidden) loadData(); };
    document.addEventListener("visibilitychange", handleVisible);
    return () => document.removeEventListener("visibilitychange", handleVisible);
  }, [address]);

  const refresh = () => { loadData(); refreshBalances(); };

  // Reset selection on tab change
  useEffect(() => { setSelectedAsset(null); }, [tab]);

  // Equip/Unequip handlers
  const handleEquip = (heroId: string, item: Equipment) => {
    if (!address) return;
    const ok = equipItem(heroId, item);
    setMsg(ok ? `Equipped ${item.name}` : `Failed — slot conflict`);
    refresh();
    setTimeout(() => setMsg(""), 4000);
  };

  const handleUnequip = (heroId: string, slot: string) => {
    if (!address) return;
    const ok = unequipItem(heroId, slot);
    setMsg(ok ? "Unequipped" : "Failed");
    refresh();
    setTimeout(() => setMsg(""), 4000);
  };

  const handleAutoEquip = (heroId: string) => {
    if (!address) return;
    const count = autoEquipHero(heroId);
    setMsg(count > 0 ? `Auto-equipped ${count} items` : "No suitable equipment found");
    refresh();
    setTimeout(() => setMsg(""), 4000);
  };

  const handleUnequipAll = (heroId: string) => {
    if (!address) return;
    const count = unequipAll(heroId);
    setMsg(count > 0 ? `Unequipped ${count} items` : "No items to unequip");
    refresh();
    setTimeout(() => setMsg(""), 4000);
  };

  // Mint handlers
  const handleMintLoot = async (qty: number) => {
    if (!address) return;
    setMinting(true);
    setMintMsg("");
    const totalCost = (parseInt(LOOT_MINT_COST) * qty).toString();
    try {
      await transferToken(TREASURY_ADDRESS, totalCost);
      const items: Equipment[] = [];
      for (let i = 0; i < qty; i++) {
        const eq = generateEquipment(undefined, null);
        addToInventory(eq);
        addTransaction({ type: "expense", category: "mint_loot", amount: LOOT_MINT_COST, description: `Minted ${eq.name} (${eq.rarity})`, ownerAddress: address });
        items.push(eq);
      }
      setInventory(getInventory());
      if (qty > 1) {
        try {
          const names = items.map(eq => eq.name);
          const slotIndexes = items.map(eq => Math.max(0, ["Bomb Core", "Engine", "Armor", "Memory Chip", "Scanner", "Utility Device"].indexOf(eq.slot)));
          const rarityIndexes = items.map(eq => Math.max(0, ["Common", "Rare", "Epic", "Legendary"].indexOf(eq.rarity)));
          const levels = items.map(() => 1);
          const seeds = items.map(() => BigInt(Math.floor(Math.random() * 1000000)));
          const uris = items.map(eq => `https://api.0bomb.game/metadata/equipment/${eq.id}`);
          await batchMintEquipment(names, slotIndexes, rarityIndexes, levels, seeds, uris, items.map(() => false), "0");
        } catch {}
      } else {
        try {
          const eq = items[0];
          const slotIndex = ["Bomb Core", "Engine", "Armor", "Memory Chip", "Scanner", "Utility Device"].indexOf(eq.slot);
          const rarityIndex = ["Common", "Rare", "Epic", "Legendary"].indexOf(eq.rarity);
          await mintEquipNFT(eq.name, slotIndex >= 0 ? slotIndex : 0, rarityIndex >= 0 ? rarityIndex : 0, 1, BigInt(Math.floor(Math.random() * 1000000)), `https://api.0bomb.game/metadata/equipment/${eq.id}`, false, "0");
        } catch {}
      }
      setMintMsg(`Minted ${qty} equipment`);
      refreshBalances();
    } catch (e: any) {
      setMintMsg(`Mint failed: ${e?.message?.slice(0, 60) || "Unknown error"}`);
    } finally {
      setMinting(false);
      setTimeout(() => setMintMsg(""), 4000);
    }
  };

  const handleMintCosmetic = async (qty: number) => {
    if (!address) return;
    setMinting(true);
    setMintMsg("");
    const totalCost = (parseInt(COSMETIC_MINT_COST) * qty).toString();
    try {
      await transferToken(TREASURY_ADDRESS, totalCost);
      const items: Cosmetic[] = [];
      for (let i = 0; i < qty; i++) {
        const cos = generateCosmetic(undefined, null);
        addCosmetic(cos);
        addTransaction({ type: "expense", category: "mint_cosmetic", amount: COSMETIC_MINT_COST, description: `Minted ${cos.name} (${cos.rarity} ${cos.type})`, ownerAddress: address });
        items.push(cos);
      }
      setCosmetics(getCosmetics());
      if (qty > 1) {
        try {
          const names = items.map(cos => cos.name);
          const typeIndexes = items.map(cos => Math.max(0, ["Helmet", "Suit", "Trail", "Bomb Effect", "Aura", "Drone"].indexOf(cos.type)));
          const rarityIndexes = items.map(cos => Math.max(0, ["Common", "Rare", "Epic", "Legendary", "Mythic"].indexOf(cos.rarity)));
          const seeds = items.map(() => BigInt(Math.floor(Math.random() * 1000000)));
          const uris = items.map(cos => `https://api.0bomb.game/metadata/cosmetic/${cos.id}`);
          await batchMintCosmetic(names, typeIndexes, rarityIndexes, seeds, uris, items.map(() => false), "0");
        } catch {}
      } else {
        try {
          const cos = items[0];
          const typeIndex = ["Helmet", "Suit", "Trail", "Bomb Effect", "Aura", "Drone"].indexOf(cos.type);
          const rarityIndex = ["Common", "Rare", "Epic", "Legendary", "Mythic"].indexOf(cos.rarity);
          await mintCosmeticNFT(cos.name, typeIndex >= 0 ? typeIndex : 0, rarityIndex >= 0 ? rarityIndex : 0, BigInt(Math.floor(Math.random() * 1000000)), `https://api.0bomb.game/metadata/cosmetic/${cos.id}`, false, "0");
        } catch {}
      }
      setMintMsg(`Minted ${qty} cosmetics`);
      refreshBalances();
    } catch (e: any) {
      setMintMsg(`Mint failed: ${e?.message?.slice(0, 60) || "Unknown error"}`);
    } finally {
      setMinting(false);
      setTimeout(() => setMintMsg(""), 4000);
    }
  };

  const handleFreeMintLoot = async () => {
    if (!address || !useVoucher(address, "equipment")) return;
    setMinting(true);
    setMintMsg("");
    try {
      const eq = generateEquipment(undefined, null);
      addToInventory(eq);
      markSoulbound(eq.id);
      addTransaction({ type: "expense", category: "mint_loot", amount: "0", description: `Free equipment voucher (${getVoucherUsage(address, "equipment")}/${VOUCHER_MAX_EQUIPMENT}) — ${eq.name}`, ownerAddress: address });
      try {
        const slotIndex = Math.max(0, ["Bomb Core", "Engine", "Armor", "Memory Chip", "Scanner", "Utility Device"].indexOf(eq.slot));
        const rarityIndex = Math.max(0, ["Common", "Rare", "Epic", "Legendary"].indexOf(eq.rarity));
        await mintEquipNFT(eq.name, slotIndex, rarityIndex, 1, BigInt(Math.floor(Math.random() * 1000000)), `https://api.0bomb.game/metadata/equipment/${eq.id}`, true, "0");
      } catch {}
      setMintMsg(`Free mint: ${eq.name}`);
      refresh();
    } catch (e: any) {
      setMintMsg(`Free mint failed: ${e?.message?.slice(0, 60) || "Unknown error"}`);
    } finally {
      setMinting(false);
      setTimeout(() => setMintMsg(""), 4000);
    }
  };

  const handleFreeMintCosmetic = async () => {
    if (!address || !useVoucher(address, "cosmetic")) return;
    setMinting(true);
    setMintMsg("");
    try {
      const cos = generateCosmetic(undefined, null);
      addCosmetic(cos);
      markSoulbound(cos.id);
      addTransaction({ type: "expense", category: "mint_cosmetic", amount: "0", description: `Free cosmetic voucher (${getVoucherUsage(address, "cosmetic")}/${VOUCHER_MAX_COSMETIC}) — ${cos.name}`, ownerAddress: address });
      try {
        const typeIndex = Math.max(0, ["Helmet", "Suit", "Trail", "Bomb Effect", "Aura", "Drone"].indexOf(cos.type));
        const rarityIndex = Math.max(0, ["Common", "Rare", "Epic", "Legendary", "Mythic"].indexOf(cos.rarity));
        await mintCosmeticNFT(cos.name, typeIndex, rarityIndex, BigInt(Math.floor(Math.random() * 1000000)), `https://api.0bomb.game/metadata/cosmetic/${cos.id}`, true, "0");
      } catch {}
      setMintMsg(`Free mint: ${cos.name}`);
      refresh();
    } catch (e: any) {
      setMintMsg(`Free mint failed: ${e?.message?.slice(0, 60) || "Unknown error"}`);
    } finally {
      setMinting(false);
      setTimeout(() => setMintMsg(""), 4000);
    }
  };

  // Counts
  const equippedCount = inventory.filter(i => i.owner && heroIds.has(i.owner)).length;
  const unequippedCount = inventory.filter(i => !i.owner || i.owner === address).length;
  const totalNfts = heroes.length + inventory.length + cosmetics.length;

  const sidebarTabs = createSidebarTabs(heroes.length, inventory.length, equippedCount, cosmetics.length, 0, 0, 0, 0, 0);

  const handleForceRefresh = () => {
    if (!address) return;
    forceRefreshInventory(address);
    loadData();
    setMsg("Inventory refreshed");
    setTimeout(() => setMsg(""), 3000);
  };

  const runValidation = () => {
    if (!address) return;
    const result = validateInventory(address);
    setValidation({
      valid: result.valid,
      heroCount: result.heroCount,
      equipCount: result.equipCount,
      issues: result.issues,
    });
  };

  const handleMint = (qty: number) => {
    if (tab === "equipment") handleMintLoot(qty);
    else handleMintCosmetic(qty);
  };

  const handleFreeMint = () => {
    if (tab === "equipment") handleFreeMintLoot();
    else handleFreeMintCosmetic();
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      <div className="p-2 sm:p-3 space-y-2 max-w-[1600px] mx-auto">
        {/* Header */}
        <InventoryHeader
          nftCount={heroes.length}
          equipmentCount={inventory.length}
          cosmeticsCount={cosmetics.length}
          search={search}
          onSearchChange={setSearch}
          onRefresh={handleForceRefresh}
        />

        {msg && (
          <div className="text-[11px] text-cyan-300 bg-cyan-500/5 border border-cyan-500/10 rounded-lg px-3 py-1.5">
            {msg}
          </div>
        )}

        {/* Desktop: sidebar + content + detail */}
        <div className="flex gap-3">
          {/* Sidebar */}
          {showSidebar && (
            <div className="hidden lg:block w-48 flex-shrink-0">
              <InventorySidebar
                tabs={sidebarTabs}
                activeTab={tab}
                onTabChange={t => { setTab(t); setSearch(""); }}
                totalNfts={totalNfts}
              />
              <div className="mt-2">
                <button onClick={() => setShowDebug(!showDebug)}
                  className="w-full px-2 py-1 text-[9px] border border-red-500/20 rounded text-red-400 hover:bg-red-500/10"
                >
                  {showDebug ? "Hide Debug" : "Debug"}
                </button>
                <button onClick={handleForceRefresh}
                  className="w-full px-2 py-1 text-[9px] border border-cyan-500/20 rounded text-cyan-400 hover:bg-cyan-500/10 mt-1"
                >
                  Refresh
                </button>
              </div>
            </div>
          )}

          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Mobile tabs */}
            <div className="flex lg:hidden flex-wrap gap-1">
              {sidebarTabs.map(t => (
                <button key={t.key} onClick={() => { setTab(t.key); setSearch(""); }}
                  className={`px-2 py-1 text-[9px] font-medium rounded-lg border transition-all ${tab === t.key ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-300" : "bg-white/[0.03] border-white/[0.06] text-gray-400"}`}
                >{t.label} ({t.count})</button>
              ))}
            </div>

            {/* Filters */}
            {tab !== "currencies" && (
              <InventoryFilters
                tab={tab}
                search={search}
                onSearchChange={setSearch}
                rarityFilter={rarityFilter}
                onRarityChange={setRarityFilter}
                classFilter={classFilter}
                onClassChange={setClassFilter}
                slotFilter={slotFilter}
                onSlotChange={setSlotFilter}
                equipFilter={equipFilter}
                onEquipFilterChange={setEquipFilter}
                sortOption={sortOption}
                onSortChange={setSortOption}
              />
            )}

            {/* Content Grid */}
            <div className="flex gap-3">
              <div className={`flex-1 min-w-0 ${selectedAsset ? "hidden lg:block" : ""}`}>
                {tab === "currencies" ? (
                  <CurrencyDashboard onRefresh={loadData} />
                ) : (
                  <InventoryGrid
                    tab={tab}
                    heroes={heroes}
                    equipment={inventory}
                    cosmetics={cosmetics}
                    inventory={inventory}
                    heroIds={heroIds}
                    search={search}
                    rarityFilter={rarityFilter}
                    classFilter={classFilter}
                    slotFilter={slotFilter}
                    equipFilter={equipFilter}
                    sortOption={sortOption}
                    onEquip={handleEquip}
                    onUnequip={handleUnequip}
                    onAutoEquip={handleAutoEquip}
                    onUnequipAll={handleUnequipAll}
                    onSelectHero={hero => setSelectedAsset({ type: "hero", data: hero })}
                    onSelectEquip={item => setSelectedAsset({ type: "equipment", data: item })}
                    onSelectCosmetic={item => setSelectedAsset({ type: "cosmetic", data: item })}
                  />
                )}

                {/* Mint section */}
                {(tab === "equipment" || tab === "cosmetics") && (
                  <div className="mt-2">
                    <MintSection
                      tab={tab}
                      loading={minting}
                      msg={mintMsg}
                      onMint={handleMint}
                      onFreeMint={handleFreeMint}
                    />
                  </div>
                )}

                {/* Legacy / Badges / Materials / Seeds / Consumables placeholders */}
                {["legacy", "badges", "materials", "seeds", "consumables"].includes(tab) && (
                  <div className="text-gray-500 text-[11px] py-8 text-center">
                    {tab === "legacy" && "Legacy cores from retired heroes will appear here."}
                    {tab === "badges" && "Earned badges will appear here."}
                    {tab === "materials" && "Materials from drops will appear here."}
                    {tab === "seeds" && "Upgrade seeds will appear here."}
                    {tab === "consumables" && "Consumable items will appear here."}
                  </div>
                )}
              </div>

              {/* Detail Panel */}
              {selectedAsset && (
                <div className="w-full lg:w-80 flex-shrink-0">
                  <DetailPanel
                    asset={selectedAsset as any}
                    onClose={() => setSelectedAsset(null)}
                    onEquip={handleEquip}
                    onUnequip={handleUnequip}
                    onAutoEquip={handleAutoEquip}
                    onUnequipAll={handleUnequipAll}
                    heroes={heroes}
                    heroIds={heroIds}
                    heroEquipment={inventory}
                    address={address}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Debug Panel */}
        {showDebug && (
          <div className="bg-red-500/[0.03] border border-red-500/10 rounded-xl p-3 space-y-1.5">
            <div className="text-[10px] font-semibold text-red-400 uppercase">Inventory Debug</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
              <span className="text-gray-500">Wallet:</span><span className="text-gray-300 font-mono">{address || "—"}</span>
              <span className="text-gray-500">Heroes:</span><span className="text-gray-300">{heroes.length}</span>
              <span className="text-gray-500">Equipment:</span><span className="text-gray-300">{inventory.length}</span>
              <span className="text-gray-500">Equipped:</span><span className="text-gray-300">{equippedCount}</span>
              <span className="text-gray-500">Cosmetics:</span><span className="text-gray-300">{cosmetics.length}</span>
              <span className="text-gray-500">Fragments:</span><span className="text-gray-300">{fragmentCount}</span>
            </div>
            <div className="flex gap-2 mt-2">
              <button onClick={runValidation} className="px-2 py-1 text-[9px] font-medium bg-red-500/10 border border-red-500/20 rounded text-red-400 hover:bg-red-500/20">Validate</button>
            </div>
            {validation && (
              <div className={`mt-1 text-[9px] ${validation.valid ? "text-emerald-400" : "text-red-400"}`}>
                {validation.valid ? "✓ Valid" : `✗ ${validation.issues.length} issue(s): ${validation.issues.join("; ")}`}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
