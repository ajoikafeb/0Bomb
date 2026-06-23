"use client";

import { useState, useEffect } from "react";
import { useWalletContext } from "@/components/wallet/WalletProvider";
import { getHeroes, getInventory, getCosmetics, getActiveListings, getEnergyPotions, getPlayerUsername, setPlayerUsername, getPlayerBalance } from "@/lib/game/GameStateManager";
import { TOKEN_SYMBOL } from "@/lib/game/constants";
import type { Hero } from "@/lib/game/types";

function maskAddress(addr: string): string {
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

export default function ProfilePage() {
  const { isConnected, address, balance } = useWalletContext();
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [username, setUsernameState] = useState("");
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState("");
  const [copied, setCopied] = useState(false);

  const refresh = () => {
    if (!address) return;
    setHeroes(getHeroes().filter(h => h.owner_address === address));
    setUsernameState(getPlayerUsername(address));
  };

  useEffect(() => {
    if (isConnected && address) refresh();
  }, [isConnected, address]);

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveUsername = () => {
    const val = editVal.trim().slice(0, 20);
    if (val) {
      setPlayerUsername(address, val);
      setUsernameState(val);
    }
    setEditing(false);
  };

  const owned = heroes;
  const totalLevel = owned.reduce((s, h) => s + h.level, 0);
  const totalTraits = owned.reduce((s, h) => s + (h.traits?.length || 0), 0);
  const totalMemories = owned.reduce((s, h) => s + (h.memories?.length || 0), 0);
  const legendaryCount = owned.filter(h => h.is_legendary).length;
  const topHero = owned.length > 0 ? [...owned].sort((a, b) => b.level - a.level)[0] : null;
  const avgLevel = owned.length > 0 ? (totalLevel / owned.length).toFixed(1) : "0";

  const inventory = getInventory();
  const equippedCount = inventory.filter(i => i.owner).length;
  const freeCount = inventory.filter(i => !i.owner).length;

  const cosmetics = getCosmetics();
  const cosEquipped = cosmetics.filter(c => c.owner).length;
  const cosFree = cosmetics.filter(c => !c.owner).length;

  const potions = getEnergyPotions();
  const listings = getActiveListings();

  const statCards = [
    { label: "Heroes", value: owned.length, icon: "👤" },
    { label: "Total Level", value: totalLevel, icon: "⬆" },
    { label: "Avg Level", value: avgLevel, icon: "📊" },
    { label: "Legendary", value: legendaryCount, icon: "⭐" },
    { label: "Traits", value: totalTraits, icon: "🧬" },
    { label: "Memories", value: totalMemories, icon: "🔮" },
    { label: "Equipped Items", value: equippedCount, icon: "⚙" },
    { label: "Free Items", value: freeCount, icon: "🎒" },
    { label: "Equipped Cos.", value: cosEquipped, icon: "🎨" },
    { label: "Free Cosmetics", value: cosFree, icon: "🎭" },
    { label: "Potions", value: potions, icon: "🧪" },
    { label: "Listings", value: listings.length, icon: "🏪" },
  ];

  if (!isConnected) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-cyan-400 mb-4">Connect Your Wallet</h1>
          <p className="text-gray-400">Connect to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] p-4 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white shrink-0">
          {address ? address.slice(2, 4).toUpperCase() : "?"}
        </div>
        <div className="flex-1">
          {editing ? (
            <div className="flex items-center gap-1">
              <input value={editVal} onChange={e => setEditVal(e.target.value)}
                className="w-36 px-1.5 py-0.5 text-sm bg-black border border-cyan-500/50 rounded text-white outline-none"
                onKeyDown={e => e.key === "Enter" && handleSaveUsername()}
                autoFocus
              />
              <button onClick={handleSaveUsername} className="text-[10px] text-cyan-400 hover:text-cyan-300">Save</button>
              <button onClick={() => setEditing(false)} className="text-[10px] text-gray-500 hover:text-gray-400">X</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">{username || "Player"}</h1>
              <button onClick={() => { setEditing(true); setEditVal(username); }} className="text-[10px] text-gray-500 hover:text-cyan-400">✏️</button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 font-mono">{address ? maskAddress(address) : ""}</span>
            <button onClick={handleCopy} className="text-[9px] text-gray-500 hover:text-cyan-400 px-1 py-0.5 border border-gray-700 rounded">
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="text-xs text-yellow-400">🪙 {parseFloat(balance).toFixed(4)} {TOKEN_SYMBOL}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-6">
        {statCards.map(card => (
          <div key={card.label} className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-3 text-center">
            <div className="text-lg mb-0.5">{card.icon}</div>
            <div className="text-lg font-bold text-white">{card.value}</div>
            <div className="text-[9px] text-gray-500">{card.label}</div>
          </div>
        ))}
      </div>

      {topHero && (
        <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4 mb-4">
          <h2 className="text-sm font-bold text-cyan-400 mb-2">Top Hero</h2>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-white">{topHero.name}</div>
              <div className="text-[10px] text-gray-400">{topHero.class} Lv.{topHero.level} {topHero.rarity}</div>
              <div className="text-[10px] text-gray-500">Gen {topHero.generation} {topHero.traits.length} traits {topHero.memories.length} memories</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-yellow-400">{topHero.energy}/{topHero.max_energy}</div>
              {topHero.is_legendary && <div className="text-[10px] text-yellow-500">Legendary</div>}
            </div>
          </div>
        </div>
      )}

      <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
        <h2 className="text-sm font-bold text-cyan-400 mb-3">Hero Roster ({owned.length})</h2>
        {owned.length === 0 ? (
          <p className="text-xs text-gray-600">No heroes. Hatch one from the Game page!</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {[...owned].sort((a, b) => b.level - a.level).map(hero => (
              <div key={hero.id} className="border border-gray-700 rounded p-2 bg-black/30">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-white truncate max-w-[80px]">{hero.name}</span>
                  <span className={`text-[9px] font-bold px-1 rounded ${
                    hero.rarity === "Legendary" ? "bg-yellow-600/30 text-yellow-300" :
                    hero.rarity === "Epic" ? "bg-purple-600/30 text-purple-300" : "bg-gray-600/30 text-gray-300"
                  }`}>{hero.rarity}</span>
                </div>
                <div className="text-[9px] text-gray-500">{hero.class} Lv.{hero.level} Gen {hero.generation}</div>
                <div className="flex gap-1 mt-1">
                  <div className="flex-1 h-1 bg-gray-700 rounded overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded" style={{ width: `${(hero.energy / hero.max_energy) * 100}%` }} />
                  </div>
                  <span className="text-[8px] text-yellow-400">{hero.energy}</span>
                </div>
                {hero.is_legendary && <div className="text-[9px] text-yellow-500 mt-0.5">Legendary</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
