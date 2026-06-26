"use client";

import { useState, useEffect, useMemo } from "react";
import { useWalletContext } from "@/components/wallet/WalletProvider";
import { useBalance } from "@/components/balance/BalanceProvider";
import { getActiveListings, getHeroes, getInventory, getCosmetics, createListing, cancelListing, buyListing, getEnergyPotions, isEmergencyShutdown, addTransaction, isAddressFrozen, getAdminConfig, initMarketplaceSync } from "@/lib/game/GameStateManager";
import { transferToken } from "@/lib/blockchain/provider";
import { TOKEN_SYMBOL } from "@/lib/game/constants";
import { getRarityColor, formatStatLabel } from "@/lib/game/equipmentSystem";
import { getCosmeticColor } from "@/lib/game/cosmeticSystem";
import type { MarketplaceListing } from "@/lib/game/types";
import type { Equipment } from "@/lib/game/equipmentSystem";
import type { Cosmetic } from "@/lib/game/cosmeticSystem";
import type { Hero } from "@/lib/game/types";
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

type Category = "hero" | "equipment" | "cosmetic" | "potion";
type SortMode = "price_asc" | "price_desc" | "rarity" | "name";

const RARITIES = ["Common", "Rare", "Epic", "Legendary", "Mythic"] as const;
const rarityOrder: Record<string, number> = { Common: 0, Rare: 1, Epic: 2, Legendary: 3, Mythic: 4 };
const PER_PAGE = 15;

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

export default function MarketPage() {
  const { isConnected, address, refreshBalance } = useWalletContext();
  const { obombBalance, refreshBalances } = useBalance();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [category, setCategory] = useState<Category>("hero");
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  // Filter / Sort / Page
  const [rarityFilter, setRarityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortMode>("price_asc");
  const [page, setPage] = useState(1);
  const [myListingsOnly, setMyListingsOnly] = useState(false);

  // Create listing modal
  const [showCreate, setShowCreate] = useState(false);
  const [createType, setCreateType] = useState<"hero" | "equipment" | "cosmetic" | "potion">("hero");
  const [createItemId, setCreateItemId] = useState("");
  const [createPrice, setCreatePrice] = useState("");
  const [potionQty, setPotionQty] = useState(1);
  const [creating, setCreating] = useState(false);

  const refresh = async () => {
    setListings(getActiveListings());
    if (address) await refreshBalances();
  };

  useEffect(() => {
    initMarketplaceSync();
    if (isConnected && address) refresh();
  }, [isConnected, address]);

  const handleCreateListing = async () => {
    if (!address || !createPrice) return;
    if (createType !== "potion" && !createItemId) return;
    if (createType === "potion" && (!potionQty || potionQty < 1)) return;
    if (isAddressFrozen(address)) { setMsg("❄️ Account frozen — cannot list items"); setTimeout(() => setMsg(""), 4000); return; }
    const shutdown = isEmergencyShutdown();
    if (shutdown.marketplace) { setMsg("❌ Marketplace is paused by admin"); setTimeout(() => setMsg(""), 4000); return; }
    setCreating(true);
    setMsg("");
    try {
      const result = createListing(address, createType, createType === "potion" ? "potion" : createItemId, createPrice, createType === "potion" ? potionQty : undefined);
      if (result) {
        setMsg(`✅ Listed for ${createPrice} ${TOKEN_SYMBOL}`);
        setShowCreate(false); setCreateItemId(""); setCreatePrice(""); setPotionQty(1);
        refresh();
      } else setMsg("❌ Failed to create listing (check ownership)");
    } catch (e: any) { setMsg(`❌ Error: ${e.message}`); }
    finally { setCreating(false); setTimeout(() => setMsg(""), 4000); }
  };

  const handleCancel = async (listingId: string) => {
    if (!address) return;
    if (isAddressFrozen(address)) { setMsg("❄️ Account frozen — cannot cancel"); setTimeout(() => setMsg(""), 3000); return; }
    const shutdown = isEmergencyShutdown();
    if (shutdown.marketplace) { setMsg("❌ Marketplace is paused by admin"); setTimeout(() => setMsg(""), 3000); return; }
    cancelListing(listingId, address);
    refresh();
    setMsg("🔄 Listing cancelled");
    setTimeout(() => setMsg(""), 3000);
  };

  const handleBuy = async (listing: MarketplaceListing) => {
    if (!address) return;
    if (isAddressFrozen(address)) { setMsg("❄️ Account frozen — cannot buy"); setTimeout(() => setMsg(""), 4000); return; }
    const shutdown = isEmergencyShutdown();
    if (shutdown.marketplace) { setMsg("❌ Marketplace is paused by admin"); setTimeout(() => setMsg(""), 4000); return; }
    setBuyingId(listing.id);
    setMsg("");
    try {
      await transferToken(listing.seller, listing.price);
      const result = buyListing(listing.id, address);
      if (result) {
        addTransaction({ type: "expense", category: "market_buy", amount: listing.price, description: `Bought ${listing.item_type} for ${listing.price} ${TOKEN_SYMBOL}`, ownerAddress: address });
        setMsg(`✅ Bought! ${listing.price} ${TOKEN_SYMBOL} transferred`);
        refreshBalance(); refresh(); await refreshBalances();
      } else setMsg("❌ Purchase failed");
    } catch (e: any) { setMsg(e?.message?.includes("user rejected") ? "Transaction cancelled" : `❌ Buy failed: ${e.message}`); }
    finally { setBuyingId(null); setTimeout(() => setMsg(""), 4000); }
  };

  // Derived filter + sort
  const userHeroes = address ? getHeroes().filter(h => h.owner_address === address) : [];
  const userEq = address ? getInventory().filter(i => i.owner === address) : [];
  const userCos = address ? getCosmetics().filter(c => c.owner === address) : [];

  const listingData: { listing: MarketplaceListing; item: Hero | Equipment | Cosmetic | null }[] = useMemo(() => {
    const heroes = getHeroes();
    const inv = getInventory();
    const cos = getCosmetics();
    return getActiveListings().map(l => ({ listing: l, item: resolveItem(l, heroes, inv, cos) ?? null }));
  }, [listings]);

  const filteredData = useMemo(() => {
    let data = listingData.filter(d => d.listing.item_type === category);
    if (myListingsOnly && address) data = data.filter(d => d.listing.seller.toLowerCase() === address.toLowerCase());
    if (rarityFilter !== "all") data = data.filter(d => d.item && (d.item as any).rarity === rarityFilter);
    const sorted = [...data];
    if (sortBy === "price_asc") sorted.sort((a, b) => parseFloat(a.listing.price) - parseFloat(b.listing.price));
    else if (sortBy === "price_desc") sorted.sort((a, b) => parseFloat(b.listing.price) - parseFloat(a.listing.price));
    else if (sortBy === "rarity") sorted.sort((a, b) => (rarityOrder[(a.item as any)?.rarity] ?? 0) - (rarityOrder[(b.item as any)?.rarity] ?? 0));
    else if (sortBy === "name") sorted.sort((a, b) => ((a.item as any)?.name || "").localeCompare((b.item as any)?.name || ""));
    return sorted;
  }, [listingData, category, myListingsOnly, rarityFilter, sortBy, address]);

  const total = filteredData.length;
  const paged = filteredData.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  if (!isConnected) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-cyan-400 mb-4">Connect Your Wallet</h1>
          <p className="text-gray-400">Connect to access the marketplace.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] p-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Marketplace</h1>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-gray-400">🪙 {parseFloat(obombBalance).toFixed(2)} {TOKEN_SYMBOL}</span>
          <button onClick={() => setShowCreate(true)} className="px-3 py-1.5 text-[10px] font-bold bg-gradient-to-r from-cyan-600 to-purple-600 rounded text-white">+ Create Listing</button>
        </div>
      </div>

      {msg && <div className="mb-3 px-3 py-2 bg-cyan-600/10 border border-cyan-500/20 rounded text-xs text-cyan-300">{msg}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar */}
        <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-3">
          <h2 className="text-xs font-bold text-cyan-400 mb-3">Categories</h2>
          <div className="space-y-1">
            {(["hero", "equipment", "cosmetic", "potion"] as Category[]).map(cat => (
              <button key={cat} onClick={() => { setCategory(cat); setPage(1); }}
                className={`w-full text-left px-2.5 py-2 text-[10px] rounded border transition-all ${
                  category === cat ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-300" : "bg-black/30 border-gray-700 text-gray-300 hover:border-cyan-500/30"
                }`}
              >{cat === "hero" ? "👤 Heroes" : cat === "equipment" ? "⚙ Equipment" : cat === "cosmetic" ? "🎨 Cosmetics" : "🧪 Potions"}</button>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-800">
            <h3 className="text-[9px] font-bold text-gray-500 mb-1">Rarity</h3>
            <div className="flex flex-wrap gap-1">
              <button onClick={() => { setRarityFilter("all"); setPage(1); }}
                className={`px-1.5 py-0.5 text-[8px] rounded border ${rarityFilter === "all" ? "border-cyan-500 bg-cyan-500/15 text-cyan-300" : "border-gray-700 text-gray-500"}`}>All</button>
              {RARITIES.map(r => (
                <button key={r} onClick={() => { setRarityFilter(r); setPage(1); }}
                  className={`px-1.5 py-0.5 text-[8px] rounded border ${rarityFilter === r ? "border-cyan-500 bg-cyan-500/15 text-cyan-300" : "border-gray-700 text-gray-500"}`}>{r}</button>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-800">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={myListingsOnly} onChange={e => { setMyListingsOnly(e.target.checked); setPage(1); }}
                className="accent-cyan-500" />
              <span className="text-[9px] text-gray-400">My listings only</span>
            </label>
          </div>

          <p className="mt-3 text-[8px] text-gray-600">{listings.length} active • {(getAdminConfig().marketplaceFee * 100).toFixed(1)}% fee</p>
        </div>

        {/* Listings */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] text-gray-400">{total} listing{total !== 1 ? "s" : ""}</p>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-gray-500">Sort:</span>
              <select value={sortBy} onChange={e => { setSortBy(e.target.value as SortMode); setPage(1); }}
                className="bg-gray-800 border border-gray-700 text-[10px] text-gray-300 rounded px-1 py-0.5"
              >
                <option value="price_asc">Price ↑</option>
                <option value="price_desc">Price ↓</option>
                <option value="rarity">Rarity</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>

          {paged.length === 0 ? (
            <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-6 flex items-center justify-center min-h-[200px]">
              <div className="text-center text-gray-500">
                <div className="text-3xl mb-2">{category === "hero" ? "👤" : category === "equipment" ? "⚙" : category === "cosmetic" ? "🎨" : "🧪"}</div>
                <p className="text-xs">No {category} listings{myListingsOnly ? " by you" : ""}</p>
                {!myListingsOnly && <button onClick={() => setShowCreate(true)} className="mt-3 text-[10px] text-cyan-500 underline">Create one</button>}
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                {paged.map(({ listing, item }) => (
                  <div key={listing.id} className="flex items-center justify-between p-3 bg-dark-2/50 border border-cyan-500/10 rounded-lg">
                    <div className="flex-1">
                      {listing.item_type === "hero" && item ? (
                        <div className="flex items-center gap-2">
                          {(() => {
                            const Sprite = HERO_SPRITES[(item as Hero).class];
                            return Sprite ? <Sprite size={32} /> : null;
                          })()}
                          <div>
                            <span className="text-xs font-bold text-white">{(item as Hero).name}</span>
                            <span className={`ml-2 px-1.5 py-0.5 text-[8px] font-bold rounded ${
                              (item as Hero).rarity === "Legendary" ? "bg-yellow-600/30 text-yellow-300" :
                              (item as Hero).rarity === "Epic" ? "bg-purple-600/30 text-purple-300" : "bg-gray-600/30 text-gray-300"
                            }`}>{(item as Hero).rarity}</span>
                            <span className="ml-1 text-[8px] text-gray-500">Lv.{(item as Hero).level}</span>
                          </div>
                        </div>
                      ) : listing.item_type === "equipment" && item ? (
                        <div className="flex items-center gap-2">
                          {(() => {
                            const Icon = EQUIP_ICONS[(item as Equipment).slot];
                            return Icon ? <Icon size={24} /> : null;
                          })()}
                          <div>
                            <span className="text-xs font-bold text-white">{(item as Equipment).name}</span>
                            <span className="ml-2 text-[8px]" style={{ color: getRarityColor((item as Equipment).rarity) }}>{(item as Equipment).rarity}</span>
                            <span className="ml-1 text-[8px] text-gray-500">{(item as Equipment).slot}</span>
                          </div>
                        </div>
                      ) : listing.item_type === "cosmetic" && item ? (
                        <div>
                          <span className="text-xs font-bold text-white">{(item as Cosmetic).name}</span>
                          <span className="ml-2 text-[8px]" style={{ color: getCosmeticColor((item as Cosmetic).rarity) }}>{(item as Cosmetic).rarity}</span>
                          <span className="ml-1 text-[8px] text-gray-500">{(item as Cosmetic).type}</span>
                        </div>
                      ) : listing.item_type === "potion" ? (
                        <div>
                          <span className="text-xs font-bold text-green-400">🧪 Energy Potion x{listing.item_id.replace("potion_", "")}</span>
                          <span className="text-[8px] text-gray-400 ml-2">Restores 30⚡</span>
                        </div>
                      ) : <span className="text-xs text-gray-500">Unknown item</span>}
                      <div className="text-[9px] text-gray-500 mt-0.5">by {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-yellow-400">{listing.price} 🪙</span>
                      {listing.seller.toLowerCase() === address?.toLowerCase() ? (
                        <button onClick={() => handleCancel(listing.id)} className="px-2 py-1 text-[8px] border border-red-500/30 text-red-400 rounded hover:bg-red-500/10">Cancel</button>
                      ) : (
                        <button onClick={() => handleBuy(listing)} disabled={buyingId === listing.id}
                          className={`px-3 py-1 text-[9px] font-bold rounded text-white transition-all ${buyingId === listing.id ? "bg-gray-600" : "bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500"}`}>
                          {buyingId === listing.id ? "Buying..." : "Buy"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Pagination page={page} total={total} perPage={PER_PAGE} onChange={setPage} />
            </>
          )}
        </div>
      </div>

      {/* Create Listing Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowCreate(false)}>
          <div className="bg-gray-900 border border-cyan-500/30 rounded-lg p-5 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-sm font-bold text-cyan-400 mb-4">Create Listing</h2>
            <label className="text-[10px] text-gray-400 block mb-1">Item Type</label>
            <div className="flex gap-1 mb-3">
              {(["hero", "equipment", "cosmetic", "potion"] as const).map(t => (
                <button key={t} onClick={() => { setCreateType(t); setCreateItemId(""); }}
                  className={`flex-1 py-1.5 text-[10px] rounded border transition-all ${createType === t ? "bg-cyan-600/20 border-cyan-500 text-cyan-300" : "border-gray-700 text-gray-500"}`}
                >{t === "hero" ? "Hero" : t === "equipment" ? "Equipment" : t === "cosmetic" ? "Cosmetic" : "Potion"}</button>
              ))}
            </div>
            {createType === "potion" ? (
              <div className="mb-3">
                <label className="text-[10px] text-gray-400 block mb-1">Quantity (you have {getEnergyPotions()} 🧪)</label>
                <input type="number" value={potionQty} onChange={e => setPotionQty(Math.max(1, parseInt(e.target.value) || 1))} min="1"
                  className="w-full p-2 bg-black/50 border border-gray-700 rounded text-[10px] text-gray-300" placeholder="e.g. 5" />
              </div>
            ) : (
              <>
                <label className="text-[10px] text-gray-400 block mb-1">Select Item</label>
                <select value={createItemId} onChange={e => setCreateItemId(e.target.value)}
                  className="w-full p-2 mb-3 bg-black/50 border border-gray-700 rounded text-[10px] text-gray-300"
                >
                  <option value="">-- Choose --</option>
                  {createType === "hero" && userHeroes.filter(h => !h.is_legendary).map(h => (
                    <option key={h.id} value={h.id}>{h.name} (Lv.{h.level} {h.rarity})</option>
                  ))}
                  {createType === "equipment" && userEq.filter(i => !i.owner || i.owner === address).map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.rarity})</option>
                  ))}
                  {createType === "cosmetic" && userCos.filter(c => !c.owner || c.owner === address).map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.rarity})</option>
                  ))}
                </select>
              </>
            )}
            <label className="text-[10px] text-gray-400 block mb-1">Price ({TOKEN_SYMBOL})</label>
            <input type="number" value={createPrice} onChange={e => setCreatePrice(e.target.value)} min="1" step="1"
              className="w-full p-2 mb-4 bg-black/50 border border-gray-700 rounded text-[10px] text-gray-300" placeholder="e.g. 100" />
            <div className="flex gap-2">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-2 text-[10px] border border-gray-700 text-gray-400 rounded hover:bg-gray-800">Cancel</button>
              <button onClick={handleCreateListing} disabled={!createPrice || creating || (createType === "potion" ? !potionQty || potionQty < 1 : !createItemId)}
                className="flex-1 py-2 text-[10px] font-bold bg-gradient-to-r from-cyan-600 to-purple-600 rounded text-white disabled:opacity-40">
                {creating ? "Creating..." : `List for ${createPrice} 🪙`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function resolveItem(listing: MarketplaceListing, heroes: Hero[], inventory: Equipment[], cosmetics: Cosmetic[]) {
  if (listing.item_type === "hero") return heroes.find(h => h.id === listing.item_id);
  if (listing.item_type === "equipment") return inventory.find(i => i.id === listing.item_id);
  if (listing.item_type === "cosmetic") return cosmetics.find(c => c.id === listing.item_id);
  return null;
}
