"use client";

import { useState, useEffect, Component } from "react";
import type { ReactNode } from "react";
import { useWalletContext } from "@/components/wallet/WalletProvider";
import { getHeroes, deleteHero, getInventory, addToInventory, removeFromInventory, equipItem, unequipItem, getCosmetics, addCosmetic, removeCosmetic, equipCosmetic, unequipCosmetic, renameHero, updateHero, isEmergencyShutdown, addTransaction, isAddressFrozen, autoEquipHero, autoEquipCosmetics, unequipAll } from "@/lib/game/GameStateManager";
import { generateEquipment, getRarityColor, formatStatLabel } from "@/lib/game/equipmentSystem";
import { generateCosmetic, getCosmeticColor } from "@/lib/game/cosmeticSystem";
import { EQUIPMENT_SLOTS, COSMETIC_SLOTS, LOOT_MINT_COST, COSMETIC_MINT_COST, TREASURY_ADDRESS, TOKEN_SYMBOL } from "@/lib/game/constants";
import type { Hero } from "@/lib/game/types";
import type { Equipment } from "@/lib/game/equipmentSystem";
import type { Cosmetic } from "@/lib/game/cosmeticSystem";
import { transferToken } from "@/lib/blockchain/provider";
import { SpriteEngineer, SpriteScout, SpriteMarine, SpriteScientist, SpriteMedic, SpriteCommander, SpriteMiner } from "@/components/pixel-art/characters";
import { IconBomb, IconShield, IconBoots, IconArmor, IconHelmet, IconRing } from "@/components/pixel-art/assets";

const HERO_SPRITES: Record<string, React.FC<{ size?: number; className?: string }>> = {
  Engineer: SpriteEngineer,
  Scout: SpriteScout,
  Marine: SpriteMarine,
  Scientist: SpriteScientist,
  Medic: SpriteMedic,
  Commander: SpriteCommander,
  Miner: SpriteMiner,
};

const EQUIP_ICONS: Record<string, React.FC<{ size?: number; className?: string }>> = {
  bomb: IconBomb,
  shield: IconShield,
  boots: IconBoots,
  armor: IconArmor,
  helmet: IconHelmet,
  ring: IconRing,
};

export default function HeroesPage() {
  const { isConnected, address } = useWalletContext();
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inventory, setInventory] = useState<Equipment[]>([]);
  const [cosmetics, setCosmetics] = useState<Cosmetic[]>([]);
  const [showInv, setShowInv] = useState(false);
  const [showCosInv, setShowCosInv] = useState(false);
  const [msg, setMsg] = useState("");
  const [tab, setTab] = useState<"equip" | "cosmetic">("equip");
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");
  const [minting, setMinting] = useState(false);
  const [mintError, setMintError] = useState("");

  const handleRename = () => {
    if (!renameId || !renameVal.trim()) return;
    renameHero(renameId, renameVal.trim());
    setRenameId(null);
    refresh();
    setMsg(`✏️ Hero renamed`);
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
    if (address && isAddressFrozen(address)) { setMintError("❄️ Account frozen — cannot mint"); setTimeout(() => setMintError(""), 4000); return; }
    const shutdown = isEmergencyShutdown();
    if (shutdown.trading) { setMintError("Trading is paused by admin"); setTimeout(() => setMintError(""), 4000); return; }
    setMinting(true);
    setMintError("");
    try {
      await transferToken(TREASURY_ADDRESS, LOOT_MINT_COST);
      const eq = generateEquipment(undefined, null);
      addToInventory(eq);
      addTransaction({ type: "expense", category: "mint_loot", amount: LOOT_MINT_COST, description: `Minted ${eq.name} (${eq.rarity})`, ownerAddress: address });
      setInventory(getInventory());
      setMsg(`🎒 Minted: ${eq.name} (${eq.rarity}) — ${LOOT_MINT_COST} ${TOKEN_SYMBOL}`);
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
    if (address && isAddressFrozen(address)) { setMintError("❄️ Account frozen — cannot mint"); setTimeout(() => setMintError(""), 4000); return; }
    const shutdown = isEmergencyShutdown();
    if (shutdown.trading) { setMintError("Trading is paused by admin"); setTimeout(() => setMintError(""), 4000); return; }
    setMinting(true);
    setMintError("");
    try {
      await transferToken(TREASURY_ADDRESS, COSMETIC_MINT_COST);
      const cos = generateCosmetic(undefined, null);
      addCosmetic(cos);
      addTransaction({ type: "expense", category: "mint_cosmetic", amount: COSMETIC_MINT_COST, description: `Minted ${cos.name} (${cos.rarity} ${cos.type})`, ownerAddress: address });
      setCosmetics(getCosmetics());
      setMsg(`🎨 Minted: ${cos.name} (${cos.rarity} ${cos.type}) — ${COSMETIC_MINT_COST} ${TOKEN_SYMBOL}`);
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

  const handleEquip = (eq: Equipment) => {
    if (!selectedHero) return;
    equipItem(selectedHero.id, eq);
    refresh();
    setMsg(`✅ Equipped ${eq.name}`);
    setTimeout(() => setMsg(""), 3000);
  };

  const handleUnequip = (slot: string) => {
    if (!selectedHero) return;
    unequipItem(selectedHero.id, slot);
    refresh();
    setMsg(`🔄 Unequipped item`);
    setTimeout(() => setMsg(""), 3000);
  };

  const handleEquipCosmetic = (cos: Cosmetic) => {
    if (!selectedHero) return;
    equipCosmetic(selectedHero.id, cos);
    refresh();
    setMsg(`✅ Equipped ${cos.name}`);
    setTimeout(() => setMsg(""), 3000);
  };

  const handleUnequipCosmetic = (slot: string) => {
    if (!selectedHero) return;
    unequipCosmetic(selectedHero.id, slot);
    refresh();
    setMsg(`🔄 Unequipped cosmetic`);
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

  return (
    <div className="min-h-[80vh] p-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Heroes & Equipment ({heroes.length}) <span className="text-[11px] text-green-400">🤖{heroes.filter(h => h.auto_deploy).length}</span>
        </h1>
        <div className="flex gap-1">
          <button onClick={handleGenerateCosmetic} disabled={minting}
            className={`px-3 py-1.5 text-[10px] font-bold border rounded transition-all ${
              minting ? "bg-gray-600/30 border-gray-500/30 text-gray-400" : "bg-purple-600/30 border-purple-500/30 text-purple-300 hover:bg-purple-600/50"
            }`}
          >{minting ? "Minting..." : `🎨 Mint Cosmetic ${COSMETIC_MINT_COST}🪙`}</button>
          <button onClick={handleGenerateLoot} disabled={minting}
            className={`px-3 py-1.5 text-[10px] font-bold border rounded transition-all ${
              minting ? "bg-gray-600/30 border-gray-500/30 text-gray-400" : "bg-yellow-600/30 border-yellow-500/30 text-yellow-300 hover:bg-yellow-600/50"
            }`}
          >{minting ? "Minting..." : `🎒 Mint Loot ${LOOT_MINT_COST}🪙`}</button>
        </div>
      </div>

      {msg && <div className="mb-3 px-3 py-2 bg-cyan-600/10 border border-cyan-500/20 rounded text-xs text-cyan-300">{msg}</div>}
      {mintError && <div className="mb-3 px-3 py-2 bg-red-900/20 border border-red-500/30 rounded text-xs text-red-400">{mintError}</div>}

      {heroes.length === 0 ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-4">👤</div>
            <p className="text-sm">No heroes yet. Go to the Game page to hatch one!</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Hero List */}
          <div className="lg:col-span-1 space-y-1 max-h-[600px] overflow-y-auto">
            {heroes.map(hero => (
              <button key={hero.id} onClick={() => setSelectedId(hero.id)}
                className={`w-full text-left p-2.5 rounded border text-xs transition-all ${
                  selectedId === hero.id ? "border-cyan-500 bg-cyan-500/10" : "border-gray-700 bg-black/30 hover:border-gray-500"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {(() => {
                      const Sprite = HERO_SPRITES[hero.class];
                      return Sprite ? <Sprite size={28} /> : null;
                    })()}
                    <span className="font-bold text-white">{hero.name}</span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    hero.rarity === "Legendary" ? "bg-yellow-600/30 text-yellow-300" :
                    hero.rarity === "Epic" ? "bg-purple-600/30 text-purple-300" :
                    "bg-gray-600/30 text-gray-300"}`}>{hero.rarity}</span>
                </div>
                <div className="text-gray-400 mt-0.5">{hero.class} • Lv.{hero.level} • Gen {hero.generation}</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="flex-1 h-1 bg-gray-700 rounded overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded transition-all" style={{ width: `${(hero.energy / hero.max_energy) * 100}%` }} />
                  </div>
                  <span className="text-[8px] text-yellow-400">{hero.energy}/{hero.max_energy}⚡</span>
                </div>
                {hero.is_legendary && <div className="text-yellow-400 text-[10px] mt-0.5">⭐ Legendary</div>}
                <div className="flex items-center gap-1 mt-1">
                  <div onClick={(e) => { e.stopPropagation(); updateHero(hero.id, { auto_deploy: !hero.auto_deploy }); refresh(); }}
                    className={`cursor-pointer text-[8px] px-1 py-0.5 rounded border inline-block ${hero.auto_deploy ? "bg-green-600/30 border-green-500 text-green-300" : "border-gray-700 text-gray-500"}`}
                  >{hero.auto_deploy ? "✅ Auto" : "⬜ Auto"}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Hero Detail */}
          <div className="lg:col-span-2">
            {selectedHero ? (
              <ErrorBoundary>
              <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    {(() => {
                      const Sprite = HERO_SPRITES[selectedHero.class];
                      return Sprite ? <Sprite size={64} className="mt-1" /> : null;
                    })()}
                    <div>
                    <div className="flex items-center gap-2">
                      {renameId === selectedHero.id ? (
                        <div className="flex items-center gap-1">
                          <input value={renameVal} onChange={e => setRenameVal(e.target.value)}
                            className="w-32 px-1.5 py-0.5 text-sm bg-black border border-cyan-500/50 rounded text-white outline-none"
                            onKeyDown={e => e.key === "Enter" && handleRename()}
                            autoFocus
                          />
                          <button onClick={handleRename} className="text-[9px] text-cyan-400 hover:text-cyan-300">Save</button>
                          <button onClick={() => setRenameId(null)} className="text-[9px] text-gray-500 hover:text-gray-400">X</button>
                        </div>
                      ) : (
                        <>
                          <h2 className="text-lg font-bold text-white">{selectedHero.name}</h2>
                          <button onClick={() => { setRenameId(selectedHero.id); setRenameVal(selectedHero.name); }} className="text-[9px] text-gray-500 hover:text-cyan-400">✏️</button>
                        </>
                      )}
                      {selectedHero.is_legendary && <span className="px-2 py-0.5 text-[9px] font-bold bg-yellow-600/20 border border-yellow-500/30 rounded text-yellow-300">LEGENDARY</span>}
                    </div>
                    <p className="text-xs text-gray-400">{selectedHero.class} • {selectedHero.rarity} • Gen {selectedHero.generation}</p>
                  </div>
                </div>
                <div className="text-right text-xs text-gray-400">
                    <div>Lv.{selectedHero.level}</div>
                    <div className="text-gray-500">XP: {selectedHero.xp}/{selectedHero.level * 100}</div>
                    <div className="text-yellow-400">{selectedHero.energy}/{selectedHero.max_energy}⚡</div>
                  </div>
                </div>

                {/* Tabs: Equipment / Cosmetics */}
                <div className="flex gap-2 mb-3">
                  <button onClick={() => setTab("equip")} className={`px-3 py-1 text-[10px] font-bold rounded border transition-all ${tab === "equip" ? "bg-cyan-600/20 border-cyan-500 text-cyan-300" : "border-gray-700 text-gray-500"}`}>
                    Equipment
                  </button>
                  <button onClick={() => setTab("cosmetic")} className={`px-3 py-1 text-[10px] font-bold rounded border transition-all ${tab === "cosmetic" ? "bg-purple-600/20 border-purple-500 text-purple-300" : "border-gray-700 text-gray-500"}`}>
                    Cosmetics
                  </button>
                </div>

                {/* Equipment Tab */}
                {tab === "equip" && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-bold text-cyan-400">Equipment Slots</h3>
                      <div className="flex items-center gap-2">
                        <button onClick={() => { if (selectedHero) { unequipAll(selectedHero.id); refresh(); setMsg("🗑️ Unequipped all"); setTimeout(() => setMsg(""), 3000); } }}
                          className="text-[9px] text-red-400 underline hover:text-red-300">Unequip All</button>
                        <button onClick={() => { if (selectedHero) { autoEquipHero(selectedHero.id); refresh(); setMsg("⚡ Auto-equipped best equipment"); setTimeout(() => setMsg(""), 3000); } }}
                          className="text-[9px] text-cyan-500 underline hover:text-cyan-400">Auto Equip Best</button>
                        <button onClick={() => setShowInv(!showInv)} className="text-[9px] text-cyan-500 underline">
                          {showInv ? "Close" : `Inventory (${inventory.length})`}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 mb-4">
                      {EQUIPMENT_SLOTS.map(slot => {
                        const eqId = selectedHero.equipment?.[slot];
                        const eq = eqId ? inventory.find(i => i.id === eqId) : undefined;
                        return (
                          <div key={slot} className="p-2 bg-black/40 border border-gray-700 rounded">
                            <div className="flex items-center gap-1 mb-0.5">
                              {(() => {
                                const Icon = EQUIP_ICONS[slot];
                                return Icon ? <Icon size={16} /> : null;
                              })()}
                              <span className="text-[8px] text-gray-500">{slot}</span>
                            </div>
                            {eq ? (
                              <div>
                                <div className="text-[10px] text-white font-bold truncate">{eq.name}</div>
                                <div className="text-[8px]" style={{ color: getRarityColor(eq.rarity) }}>{eq.rarity}</div>
                                <div className="mt-1 text-[8px] text-gray-400">
                                  {Object.entries(eq.stats).map(([k, v]) => <div key={k}>+{v} {formatStatLabel(k)}</div>)}
                                </div>
                                <button onClick={() => handleUnequip(slot)} className="mt-1 text-[8px] text-red-400 hover:text-red-300">Unequip</button>
                              </div>
                            ) : (
                              <div className="text-[9px] text-gray-600 italic">Empty</div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {showInv && (
                      <div className="mb-4">
                        <h3 className="text-xs font-bold text-purple-400 mb-2">Inventory ({inventory.length})</h3>
                        {inventory.filter(i => !i.owner).length === 0 ? (
                          <p className="text-[10px] text-gray-600">No items. Generate loot!</p>
                        ) : (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto">
                            {inventory.filter(i => !i.owner).map(eq => (
                              <div key={eq.id} className="p-2 bg-black/40 border border-gray-700 rounded">
                                <div className="flex items-center gap-1">
                                  {(() => {
                                    const Icon = EQUIP_ICONS[eq.slot];
                                    return Icon ? <Icon size={14} /> : null;
                                  })()}
                                  <span className="text-[10px] text-white font-bold truncate">{eq.name}</span>
                                </div>
                                <div className="text-[8px]" style={{ color: getRarityColor(eq.rarity) }}>{eq.rarity} • {eq.slot}</div>
                                <div className="mt-0.5 text-[8px] text-gray-400">
                                  {Object.entries(eq.stats).map(([k, v]) => <div key={k}>+{v}</div>)}
                                </div>
                                <button onClick={() => handleEquip(eq)} className="mt-1 text-[8px] text-cyan-400 hover:text-cyan-300">Equip</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* Cosmetics Tab */}
                {tab === "cosmetic" && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-bold text-purple-400">Cosmetic Slots</h3>
                      <div className="flex items-center gap-2">
                        <button onClick={() => { if (selectedHero) { unequipAll(selectedHero.id); refresh(); setMsg("🗑️ Unequipped all"); setTimeout(() => setMsg(""), 3000); } }}
                          className="text-[9px] text-red-400 underline hover:text-red-300">Unequip All</button>
                        <button onClick={() => { if (selectedHero) { autoEquipCosmetics(selectedHero.id); refresh(); setMsg("✨ Auto-equipped best cosmetics"); setTimeout(() => setMsg(""), 3000); } }}
                          className="text-[9px] text-purple-500 underline hover:text-purple-400">Auto Equip Best</button>
                        <button onClick={() => setShowCosInv(!showCosInv)} className="text-[9px] text-purple-500 underline">
                          {showCosInv ? "Close" : `Collection (${cosmetics.length})`}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 mb-4">
                      {COSMETIC_SLOTS.map(slot => {
                        const cosId = selectedHero.cosmetics?.[slot];
                        const cos = cosId ? cosmetics.find(c => c.id === cosId) : undefined;
                        return (
                          <div key={slot} className="p-2 bg-black/40 border border-gray-700 rounded">
                            <div className="text-[8px] text-gray-500 mb-0.5">{slot}</div>
                            {cos ? (
                              <div>
                                <div className="text-[10px] text-white font-bold truncate">{cos.name}</div>
                                <div className="text-[8px]" style={{ color: getCosmeticColor(cos.rarity) }}>{cos.rarity}</div>
                                <div className="mt-0.5 text-[8px] text-gray-400">
                                  {Object.entries(cos.statBonus).map(([k, v]) => <div key={k}>+{v} {k}</div>)}
                                </div>
                                <button onClick={() => handleUnequipCosmetic(slot)} className="mt-1 text-[8px] text-red-400 hover:text-red-300">Remove</button>
                              </div>
                            ) : (
                              <div className="text-[9px] text-gray-600 italic">Empty</div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {showCosInv && (
                      <div className="mb-4">
                        <h3 className="text-xs font-bold text-purple-400 mb-2">Cosmetics ({cosmetics.length})</h3>
                        {cosmetics.filter(c => !c.owner).length === 0 ? (
                          <p className="text-[10px] text-gray-600">No cosmetics. Generate some!</p>
                        ) : (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto">
                            {cosmetics.filter(c => !c.owner).map(cos => (
                              <div key={cos.id} className="p-2 bg-black/40 border border-gray-700 rounded">
                                <div className="text-[10px] text-white font-bold truncate">{cos.name}</div>
                                <div className="text-[8px]" style={{ color: getCosmeticColor(cos.rarity) }}>{cos.rarity} • {cos.type}</div>
                                <div className="mt-0.5 text-[8px] text-gray-400">
                                  {Object.entries(cos.statBonus).map(([k, v]) => <div key={k}>+{v}</div>)}
                                </div>
                                <button onClick={() => handleEquipCosmetic(cos)} className="mt-1 text-[8px] text-purple-400 hover:text-purple-300">Equip</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* Traits & Badges */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 mb-2">Traits ({selectedHero.traits.length})</h3>
                    <div className="flex flex-wrap gap-1">
                      {selectedHero.traits.length === 0 ? <p className="text-[10px] text-gray-600">Deploy to earn traits.</p> :
                        selectedHero.traits.map(t => <span key={t} className="px-2 py-0.5 text-[9px] bg-cyan-500/10 border border-cyan-500/30 rounded text-cyan-300">{t}</span>)
                      }
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 mb-2">Badges ({selectedHero.badges.length})</h3>
                    <div className="flex flex-wrap gap-1">
                      {selectedHero.badges.length === 0 ? <p className="text-[10px] text-gray-600">Achievements unlock badges.</p> :
                        selectedHero.badges.map(b => <span key={b} className="px-2 py-0.5 text-[9px] bg-purple-500/10 border border-purple-500/30 rounded text-purple-300">{b}</span>)
                      }
                    </div>
                  </div>
                </div>

                {/* Memories */}
                <div className="mb-4">
                  <h3 className="text-xs font-bold text-gray-400 mb-2">Memories ({selectedHero.memories.length})</h3>
                  <div className="max-h-28 overflow-y-auto space-y-0.5">
                    {selectedHero.memories.length === 0 ? <p className="text-[10px] text-gray-600">No memories yet.</p> :
                      [...selectedHero.memories].reverse().map(m => (
                        <div key={m.id} className="text-[9px] text-gray-400 font-mono border-l-2 border-cyan-500/30 pl-2">
                          <span className="text-cyan-400">[{m.event}]</span> {m.detail}
                        </div>
                      ))
                    }
                  </div>
                </div>

                <button onClick={() => handleDelete(selectedHero.id)} className="px-3 py-1.5 text-[10px] font-bold border border-red-500/30 text-red-400 rounded hover:bg-red-500/10">
                  Retire Hero
                </button>
              </div>
              </ErrorBoundary>
            ) : (
              <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-6 flex items-center justify-center min-h-[300px]">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2">👤</div>
                  <p className="text-sm">Select a hero to view details</p>
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
