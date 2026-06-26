"use client";

import { useState, useEffect, Component } from "react";
import type { ReactNode } from "react";
import { useWalletContext } from "@/components/wallet/WalletProvider";
import { getHeroes, deleteHero, getInventory, equipItem, unequipItem, getCosmetics, equipCosmetic, unequipCosmetic, renameHero, updateHero, isEmergencyShutdown, addTransaction, isAddressFrozen, getVoucherUsage, getVoucherRemaining, useVoucher, addCosmetic, addToInventory, markSoulbound } from "@/lib/game/GameStateManager";
import { mintEquipment as mintEquipNFT, batchMintEquipment } from "@/lib/blockchain/equipmentNFTService";
import { mintCosmetic as mintCosmeticNFT, batchMintCosmetic } from "@/lib/blockchain/cosmeticNFTService";
import { generateEquipment } from "@/lib/game/equipmentSystem";
import { generateCosmetic } from "@/lib/game/cosmeticSystem";
import { LOOT_MINT_COST, COSMETIC_MINT_COST, TREASURY_ADDRESS, VOUCHER_MAX_EQUIPMENT, VOUCHER_MAX_COSMETIC, RARITY_CONFIG } from "@/lib/game/constants";
import type { Hero } from "@/lib/game/types";
import type { Equipment } from "@/lib/game/equipmentSystem";
import type { Cosmetic } from "@/lib/game/cosmeticSystem";
import { transferToken } from "@/lib/blockchain/provider";
import { SpriteEngineer, SpriteScout, SpriteMarine, SpriteScientist, SpriteMedic, SpriteCommander, SpriteMiner } from "@/components/pixel-art/characters";
import { HeroDetailView } from "@/components/heroes/HeroDetailView";

const HERO_SPRITES: Record<string, React.FC<{ size?: number; className?: string }>> = {
  Engineer: SpriteEngineer,
  Scout: SpriteScout,
  Marine: SpriteMarine,
  Scientist: SpriteScientist,
  Medic: SpriteMedic,
  Commander: SpriteCommander,
  Miner: SpriteMiner,
};

function RarityBadge({ rarity }: { rarity: string }) {
  const color = RARITY_CONFIG[rarity as keyof typeof RARITY_CONFIG]?.color || "#9ca3af";
  return (
    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded" style={{ backgroundColor: color + "20", borderColor: color + "50", borderWidth: 1, color }}>
      {rarity}
    </span>
  );
}

export default function HeroesPage() {
  const { isConnected, address } = useWalletContext();
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inventory, setInventory] = useState<Equipment[]>([]);
  const [cosmetics, setCosmetics] = useState<Cosmetic[]>([]);
  const [msg, setMsg] = useState("");
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");
  const [minting, setMinting] = useState(false);
  const [mintError, setMintError] = useState("");
  const [mintQty, setMintQty] = useState(1);

  const handleRename = () => {
    if (!renameId || !renameVal.trim()) return;
    renameHero(renameId, renameVal.trim());
    setRenameId(null);
    refresh();
    setMsg(`Hero renamed`);
    setTimeout(() => setMsg(""), 3000);
  };

  const refresh = () => {
    if (address) {
      setHeroes(getHeroes().filter(h => h.owner_address === address));
      setInventory(getInventory());
      setCosmetics(getCosmetics());
    }
  };

  useEffect(() => {
    if (isConnected && address) refresh();
  }, [isConnected, address]);

  const selectedHero = heroes.find(h => h.id === selectedId);

  const handleDelete = (id: string) => {
    deleteHero(id);
    refresh();
    if (selectedId === id) setSelectedId(null);
  };

  const handleGenerateLoot = async () => {
    if (address && isAddressFrozen(address)) { setMintError("Account frozen"); setTimeout(() => setMintError(""), 4000); return; }
    const shutdown = isEmergencyShutdown();
    if (shutdown.trading) { setMintError("Trading is paused"); setTimeout(() => setMintError(""), 4000); return; }
    setMinting(true);
    setMintError("");
    const qty = mintQty;
    const totalCost = (parseInt(LOOT_MINT_COST) * qty).toString();
    try {
      await transferToken(TREASURY_ADDRESS, totalCost);
      const items = [];
      for (let i = 0; i < qty; i++) {
        const eq = generateEquipment(undefined, null);
        addToInventory(eq);
        addTransaction({ type: "expense", category: "mint_loot", amount: LOOT_MINT_COST, description: `Minted ${eq.name} (${eq.rarity})`, ownerAddress: address });
        setMsg(`Generating ${i + 1}/${qty}...`);
        items.push(eq);
      }
      setInventory(getInventory());
      if (qty > 1) {
        try {
          const names = items.map(eq => eq.name);
          const slotIndexes = items.map(eq => Math.max(0, ["Bomb Core", "Engine", "Armor", "Memory Chip", "Scanner", "Utility Device"].indexOf(eq.slot)));
          const rarityIndexes = items.map(eq => Math.max(0, ["Common", "Rare", "Epic", "Legendary"].indexOf(eq.rarity)));
          await batchMintEquipment(names, slotIndexes, rarityIndexes, items.map(() => 1), items.map(() => BigInt(Math.floor(Math.random() * 1000000))), items.map(eq => `https://api.0bomb.game/metadata/equipment/${eq.id}`), items.map(() => false), "0");
        } catch {}
      } else {
        try {
          const eq = items[0];
          const slotIndex = Math.max(0, ["Bomb Core", "Engine", "Armor", "Memory Chip", "Scanner", "Utility Device"].indexOf(eq.slot));
          const rarityIndex = Math.max(0, ["Common", "Rare", "Epic", "Legendary"].indexOf(eq.rarity));
          await mintEquipNFT(eq.name, slotIndex, rarityIndex, 1, BigInt(Math.floor(Math.random() * 1000000)), `https://api.0bomb.game/metadata/equipment/${eq.id}`, false, "0");
        } catch {}
      }
      setMsg(`Minted ${qty} equipment`);
      setMintError("");
    } catch (e: any) {
      const m = e?.message?.toLowerCase() || "";
      if (m.includes("user rejected") || m.includes("user denied")) {
        setMintError("Transaction cancelled");
      } else {
        setMintError(`Mint failed: ${e?.message?.slice(0, 80) || "Unknown error"}`);
      }
    } finally {
      setMinting(false);
      setTimeout(() => { setMsg(""); setMintError(""); }, 4000);
    }
  };

  const handleGenerateCosmetic = async () => {
    if (address && isAddressFrozen(address)) { setMintError("Account frozen"); setTimeout(() => setMintError(""), 4000); return; }
    const shutdown = isEmergencyShutdown();
    if (shutdown.trading) { setMintError("Trading is paused"); setTimeout(() => setMintError(""), 4000); return; }
    setMinting(true);
    setMintError("");
    const qty = mintQty;
    const totalCost = (parseInt(COSMETIC_MINT_COST) * qty).toString();
    try {
      await transferToken(TREASURY_ADDRESS, totalCost);
      const items = [];
      for (let i = 0; i < qty; i++) {
        const cos = generateCosmetic(undefined, null);
        addCosmetic(cos);
        addTransaction({ type: "expense", category: "mint_cosmetic", amount: COSMETIC_MINT_COST, description: `Minted ${cos.name} (${cos.rarity} ${cos.type})`, ownerAddress: address });
        setMsg(`Generating ${i + 1}/${qty}...`);
        items.push(cos);
      }
      setCosmetics(getCosmetics());
      if (qty > 1) {
        try {
          const names = items.map(cos => cos.name);
          const typeIndexes = items.map(cos => Math.max(0, ["Helmet", "Suit", "Trail", "Bomb Effect", "Aura", "Drone"].indexOf(cos.type)));
          const rarityIndexes = items.map(cos => Math.max(0, ["Common", "Rare", "Epic", "Legendary", "Mythic"].indexOf(cos.rarity)));
          await batchMintCosmetic(names, typeIndexes, rarityIndexes, items.map(() => BigInt(Math.floor(Math.random() * 1000000))), items.map(cos => `https://api.0bomb.game/metadata/cosmetic/${cos.id}`), items.map(() => false), "0");
        } catch {}
      } else {
        try {
          const cos = items[0];
          const typeIndex = Math.max(0, ["Helmet", "Suit", "Trail", "Bomb Effect", "Aura", "Drone"].indexOf(cos.type));
          const rarityIndex = Math.max(0, ["Common", "Rare", "Epic", "Legendary", "Mythic"].indexOf(cos.rarity));
          await mintCosmeticNFT(cos.name, typeIndex, rarityIndex, BigInt(Math.floor(Math.random() * 1000000)), `https://api.0bomb.game/metadata/cosmetic/${cos.id}`, false, "0");
        } catch {}
      }
      setMsg(`Minted ${qty} cosmetics`);
      setMintError("");
    } catch (e: any) {
      const m = e?.message?.toLowerCase() || "";
      if (m.includes("user rejected") || m.includes("user denied")) {
        setMintError("Transaction cancelled");
      } else {
        setMintError(`Mint failed: ${e?.message?.slice(0, 80) || "Unknown error"}`);
      }
    } finally {
      setMinting(false);
      setTimeout(() => { setMsg(""); setMintError(""); }, 4000);
    }
  };

  const handleFreeGenerateLoot = async () => {
    if (!address || !useVoucher(address, "equipment")) return;
    setMinting(true);
    setMintError("");
    const qty = 1;
    try {
      const eq = generateEquipment(undefined, null);
      addToInventory(eq);
      markSoulbound(eq.id);
      addTransaction({ type: "expense", category: "mint_loot", amount: "0", description: `Free equipment voucher (${getVoucherUsage(address, "equipment")}/${VOUCHER_MAX_EQUIPMENT}) — ${eq.name}`, ownerAddress: address });
      setInventory(getInventory());
      try {
        const slotIndex = Math.max(0, ["Bomb Core", "Engine", "Armor", "Memory Chip", "Scanner", "Utility Device"].indexOf(eq.slot));
        const rarityIndex = Math.max(0, ["Common", "Rare", "Epic", "Legendary"].indexOf(eq.rarity));
        await mintEquipNFT(eq.name, slotIndex, rarityIndex, 1, BigInt(Math.floor(Math.random() * 1000000)), `https://api.0bomb.game/metadata/equipment/${eq.id}`, true, "0");
      } catch {}
      setMsg(`Free mint: ${eq.name}`);
    } catch (e: any) {
      setMintError(`Free mint failed: ${e?.message?.slice(0, 80) || "Unknown error"}`);
    } finally {
      setMinting(false);
      setTimeout(() => { setMsg(""); setMintError(""); }, 4000);
    }
  };

  const handleFreeGenerateCosmetic = async () => {
    if (!address || !useVoucher(address, "cosmetic")) return;
    setMinting(true);
    setMintError("");
    const qty = 1;
    try {
      const cos = generateCosmetic(undefined, null);
      addCosmetic(cos);
      markSoulbound(cos.id);
      addTransaction({ type: "expense", category: "mint_cosmetic", amount: "0", description: `Free cosmetic voucher (${getVoucherUsage(address, "cosmetic")}/${VOUCHER_MAX_COSMETIC}) — ${cos.name}`, ownerAddress: address });
      setCosmetics(getCosmetics());
      try {
        const typeIndex = Math.max(0, ["Helmet", "Suit", "Trail", "Bomb Effect", "Aura", "Drone"].indexOf(cos.type));
        const rarityIndex = Math.max(0, ["Common", "Rare", "Epic", "Legendary", "Mythic"].indexOf(cos.rarity));
        await mintCosmeticNFT(cos.name, typeIndex, rarityIndex, BigInt(Math.floor(Math.random() * 1000000)), `https://api.0bomb.game/metadata/cosmetic/${cos.id}`, true, "0");
      } catch {}
      setMsg(`Free mint: ${cos.name}`);
    } catch (e: any) {
      setMintError(`Free mint failed: ${e?.message?.slice(0, 80) || "Unknown error"}`);
    } finally {
      setMinting(false);
      setTimeout(() => { setMsg(""); setMintError(""); }, 4000);
    }
  };

  const handleEquip = (eq: Equipment) => {
    if (!selectedHero) return;
    equipItem(selectedHero.id, eq);
    refresh();
    setMsg(`Equipped ${eq.name}`);
    setTimeout(() => setMsg(""), 3000);
  };

  const handleUnequip = (slot: string) => {
    if (!selectedHero) return;
    unequipItem(selectedHero.id, slot);
    refresh();
    setMsg(`Unequipped item`);
    setTimeout(() => setMsg(""), 3000);
  };

  const handleEquipCosmetic = (cos: Cosmetic) => {
    if (!selectedHero) return;
    equipCosmetic(selectedHero.id, cos);
    refresh();
    setMsg(`Equipped ${cos.name}`);
    setTimeout(() => setMsg(""), 3000);
  };

  const handleUnequipCosmetic = (slot: string) => {
    if (!selectedHero) return;
    unequipCosmetic(selectedHero.id, slot);
    refresh();
    setMsg(`Unequipped cosmetic`);
    setTimeout(() => setMsg(""), 3000);
  };

  if (!isConnected) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-cyan-400 mb-4">Connect Your Wallet</h1>
          <p className="text-gray-400">Connect to manage heroes and equipment.</p>
        </div>
      </div>
    );
  }

  const totalPower = heroes.reduce((s, h) => s + h.stats.power, 0);
  const avgSpeed = heroes.length > 0 ? Math.round(heroes.reduce((s, h) => s + h.stats.speed, 0) / heroes.length) : 0;

  return (
    <div className="min-h-[80vh] p-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Heroes ({heroes.length})
        </h1>
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1 bg-black/40 border border-gray-700 rounded px-1 py-1 mr-1">
            {[1, 5, 10].map(q => (
              <button key={q} onClick={() => setMintQty(q)}
                className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${mintQty === q ? "bg-cyan-600/40 text-cyan-300" : "text-gray-500 hover:text-gray-300"}`}
              >{q}</button>
            ))}
          </div>
          <button onClick={handleGenerateCosmetic} disabled={minting}
            className={`px-3 py-1.5 text-[10px] font-bold border rounded transition-all ${minting ? "bg-gray-600/30 border-gray-500/30 text-gray-400" : "bg-purple-600/30 border-purple-500/30 text-purple-300 hover:bg-purple-600/50"}`}
          >{minting ? "Minting..." : `Mint Cosmetic ${COSMETIC_MINT_COST}🪙`}</button>
          {address && getVoucherRemaining(address, "cosmetic") > 0 && (
            <button onClick={handleFreeGenerateCosmetic} disabled={minting}
              className="px-3 py-1.5 text-[10px] font-bold border border-green-500/40 rounded bg-green-700/30 text-green-300 hover:bg-green-700/50 transition-all"
            >{minting ? "Minting..." : `Free (${getVoucherUsage(address, "cosmetic")}/${VOUCHER_MAX_COSMETIC})`}</button>
          )}
          <button onClick={handleGenerateLoot} disabled={minting}
            className={`px-3 py-1.5 text-[10px] font-bold border rounded transition-all ${minting ? "bg-gray-600/30 border-gray-500/30 text-gray-400" : "bg-yellow-600/30 border-yellow-500/30 text-yellow-300 hover:bg-yellow-600/50"}`}
          >{minting ? "Minting..." : `Mint Loot ${LOOT_MINT_COST}🪙`}</button>
          {address && getVoucherRemaining(address, "equipment") > 0 && (
            <button onClick={handleFreeGenerateLoot} disabled={minting}
              className="px-3 py-1.5 text-[10px] font-bold border border-green-500/40 rounded bg-green-700/30 text-green-300 hover:bg-green-700/50 transition-all"
            >{minting ? "Minting..." : `Free (${getVoucherUsage(address, "equipment")}/${VOUCHER_MAX_EQUIPMENT})`}</button>
          )}
        </div>
      </div>

      {msg && <div className="mb-3 px-3 py-2 bg-cyan-600/10 border border-cyan-500/20 rounded text-xs text-cyan-300">{msg}</div>}
      {mintError && <div className="mb-3 px-3 py-2 bg-red-900/20 border border-red-500/30 rounded text-xs text-red-400">{mintError}</div>}

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-black/30 border border-gray-700 rounded p-2 text-center">
          <div className="text-lg font-bold text-cyan-400">{heroes.length}</div>
          <div className="text-[9px] text-gray-500">Heroes</div>
        </div>
        <div className="bg-black/30 border border-gray-700 rounded p-2 text-center">
          <div className="text-lg font-bold text-red-400">{totalPower}</div>
          <div className="text-[9px] text-gray-500">Total Power</div>
        </div>
        <div className="bg-black/30 border border-gray-700 rounded p-2 text-center">
          <div className="text-lg font-bold text-green-400">{avgSpeed}</div>
          <div className="text-[9px] text-gray-500">Avg Speed</div>
        </div>
        <div className="bg-black/30 border border-gray-700 rounded p-2 text-center">
          <div className="text-lg font-bold text-purple-400">{heroes.filter(h => h.traits.length > 0).length}</div>
          <div className="text-[9px] text-gray-500">With Traits</div>
        </div>
      </div>

      {heroes.length === 0 ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-4">No heroes yet. Go to the Game page to hatch one!</div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Hero List */}
          <div className="lg:col-span-1 space-y-1 max-h-[600px] overflow-y-auto">
            {heroes.map(hero => (
              <button key={hero.id} onClick={() => setSelectedId(hero.id)}
                className={`w-full text-left p-2 rounded border text-[11px] transition-all ${selectedId === hero.id ? "border-cyan-500 bg-cyan-500/10" : "border-gray-700 bg-black/30 hover:border-gray-500"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {(() => { const Sprite = HERO_SPRITES[hero.class]; return Sprite ? <Sprite size={24} /> : null; })()}
                    <span className="font-bold text-white">{hero.name}</span>
                  </div>
                  <RarityBadge rarity={hero.rarity} />
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">{hero.class} • Lv.{hero.level} • Gen {hero.generation}</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="flex-1 h-1 bg-gray-700 rounded overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded transition-all" style={{ width: `${(hero.energy / hero.max_energy) * 100}%` }} />
                  </div>
                  <span className="text-[9px] text-yellow-400">{hero.energy}/{hero.max_energy}</span>
                </div>
                <div className="flex items-center gap-2 text-[9px] text-gray-500 mt-0.5">
                  <span>P:{hero.stats.power}</span>
                  <span>S:{hero.stats.speed}</span>
                  <span>I:{hero.stats.intelligence}</span>
                  <span>♥{hero.genetics.potential}</span>
                </div>
                {hero.traits.length > 0 && <div className="text-[8px] text-cyan-400 mt-0.5">{hero.traits.join(", ")}</div>}
                {hero.is_legendary && <div className="text-[9px] text-yellow-400 mt-0.5">Legendary</div>}
                <div className="flex items-center gap-1 mt-1">
                  <div onClick={(e) => { e.stopPropagation(); updateHero(hero.id, { auto_deploy: !hero.auto_deploy }); refresh(); }}
                    className={`cursor-pointer text-[8px] px-1 py-0.5 rounded border inline-block ${hero.auto_deploy ? "bg-green-600/30 border-green-500 text-green-300" : "border-gray-700 text-gray-500"}`}
                  >{hero.auto_deploy ? "Auto" : "Manual"}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Hero Detail */}
          <div className="lg:col-span-2">
            {selectedHero ? (
              <ErrorBoundary>
                <HeroDetailView
                  hero={selectedHero}
                  inventory={inventory}
                  cosmetics={cosmetics}
                  onEquip={handleEquip}
                  onUnequip={handleUnequip}
                  onEquipCosmetic={handleEquipCosmetic}
                  onUnequipCosmetic={handleUnequipCosmetic}
                  onRefresh={() => { setHeroes(getHeroes().filter(h => h.owner_address === address)); setInventory(getInventory()); setCosmetics(getCosmetics()); }}
                />
                <div className="flex gap-2 mt-2">
                  {renameId === selectedHero.id ? (
                    <div className="flex items-center gap-1">
                      <input value={renameVal} onChange={e => setRenameVal(e.target.value)}
                        className="w-32 px-1.5 py-0.5 text-xs bg-black border border-cyan-500/50 rounded text-white outline-none"
                        onKeyDown={e => e.key === "Enter" && handleRename()} autoFocus
                      />
                      <button onClick={handleRename} className="text-[10px] text-cyan-400 hover:text-cyan-300">Save</button>
                      <button onClick={() => setRenameId(null)} className="text-[10px] text-gray-500 hover:text-gray-400">X</button>
                    </div>
                  ) : (
                    <button onClick={() => { setRenameId(selectedHero.id); setRenameVal(selectedHero.name); }}
                      className="px-2 py-1 text-[10px] border border-gray-700 text-gray-300 rounded hover:border-gray-500"
                    >Rename</button>
                  )}
                  <button onClick={() => handleDelete(selectedHero.id)}
                    className="px-2 py-1 text-[10px] border border-red-500/30 text-red-400 rounded hover:bg-red-500/10"
                  >Retire Hero</button>
                </div>
              </ErrorBoundary>
            ) : (
              <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-6 flex items-center justify-center min-h-[300px]">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2">Select a hero to view details</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return <div className="text-red-400 text-xs p-4">Something went wrong rendering hero details.</div>;
    }
    return this.props.children;
  }
}
