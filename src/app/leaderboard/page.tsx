"use client";

import { useState, useEffect } from "react";
import { useWalletContext } from "@/components/wallet/WalletProvider";
import { getHeroes, getInventory, getActiveListings, getEnergyPotions, getUsername } from "@/lib/game/GameStateManager";
import { fetchGlobalLeaderboard, type LeaderboardEntry } from "@/lib/supabase/leaderboard";

function maskAddress(addr: string): string {
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

type RankCategory = "level" | "kills" | "heroes" | "legendary" | "wealth" | "traits";

interface UserRank {
  rank: number;
  username: string;
  address: string;
  value: string;
  sub: string;
}

const CATEGORIES: { id: RankCategory; label: string; icon: string; desc: string }[] = [
  { id: "level", label: "Total Level", icon: "⬆", desc: "Sum of all hero levels" },
  { id: "kills", label: "Total Kills", icon: "💀", desc: "Total alien kills across all heroes" },
  { id: "heroes", label: "Hero Count", icon: "👤", desc: "Number of heroes owned" },
  { id: "legendary", label: "Legendary", icon: "⭐", desc: "Number of legendary heroes" },
  { id: "wealth", label: "Wealth", icon: "🪙", desc: "Assets + potions + listings" },
  { id: "traits", label: "Total Traits", icon: "🧬", desc: "Total traits unlocked" },
];

export default function LeaderboardPage() {
  const { isConnected, address } = useWalletContext();
  const [category, setCategory] = useState<RankCategory>("level");
  const [globalData, setGlobalData] = useState<LeaderboardEntry[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchGlobalLeaderboard().then(data => {
      setGlobalData(data.length > 0 ? data : null);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const localHeroes = isConnected && address
    ? getHeroes().filter(h => h.owner_address === address)
    : [];
  const username = isConnected ? getUsername() : "";

  const computeLocalRanking = (cat: RankCategory): UserRank[] => {
    if (!address) return [];
    const totalKills = localHeroes.reduce((s, h) => s + (h.memories || []).filter((m: any) => m.event === "Killed Alien").length, 0);
    const totalLevel = localHeroes.reduce((s, h) => s + h.level, 0);
    const legendaryCount = localHeroes.filter(h => h.is_legendary).length;
    const totalTraits = localHeroes.reduce((s, h) => s + (h.traits?.length || 0), 0);
    const listings = getActiveListings().length;
    const potions = getEnergyPotions();
    const invCount = getInventory().length;
    const wealth = invCount + potions + listings;

    let value = "", sub = "";
    if (cat === "level") { value = totalLevel.toString(); sub = `${localHeroes.length} heroes`; }
    else if (cat === "kills") { value = totalKills.toString(); sub = `across ${localHeroes.length} heroes`; }
    else if (cat === "heroes") { value = localHeroes.length.toString(); sub = `${legendaryCount} legendary`; }
    else if (cat === "legendary") { value = legendaryCount.toString(); sub = `${localHeroes.length} total heroes`; }
    else if (cat === "wealth") { value = wealth.toString(); sub = `${invCount} items / ${potions} potions / ${listings} listings`; }
    else if (cat === "traits") { value = totalTraits.toString(); sub = `across ${localHeroes.length} heroes`; }

    const displayName = username || maskAddress(address);
    return [{ rank: 1, username: displayName, address, value, sub }];
  };

  const computeGlobalRankings = (cat: RankCategory): UserRank[] => {
    if (!globalData) return [];
    const sorted = [...globalData].sort((a, b) => {
      switch (cat) {
        case "level": return b.totalLevel - a.totalLevel;
        case "kills": return b.totalKills - a.totalKills;
        case "heroes": return b.heroCount - a.heroCount;
        case "legendary": return b.legendaryCount - a.legendaryCount;
        case "wealth": return b.wealth - a.wealth;
        case "traits": return b.totalTraits - a.totalTraits;
      }
    });
    return sorted.slice(0, 100).map((entry, i) => ({
      rank: i + 1,
      username: maskAddress(entry.address),
      address: entry.address,
      value: cat === "level" ? entry.totalLevel.toString()
        : cat === "kills" ? entry.totalKills.toString()
        : cat === "heroes" ? entry.heroCount.toString()
        : cat === "legendary" ? entry.legendaryCount.toString()
        : cat === "wealth" ? entry.wealth.toString()
        : entry.totalTraits.toString(),
      sub: `${entry.heroCount} heroes`,
    }));
  };

  const globalRankings = computeGlobalRankings(category);
  const localMe = computeLocalRanking(category)[0];

  if (!isConnected) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-cyan-400 mb-4">Connect Your Wallet</h1>
          <p className="text-gray-400">Connect to view leaderboards.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] p-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Leaderboard
        </h1>
        <p className="text-[10px] text-gray-500">
          {globalData ? `Global rankings across ${globalData.length} players` : "Your personal rankings"}
        </p>
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setCategory(cat.id)}
            className={`px-3 py-1.5 text-[10px] font-bold rounded border transition-all ${
              category === cat.id ? "bg-cyan-500/15 border-cyan-500 text-cyan-300" : "border-gray-700 text-gray-500 hover:border-gray-500"
            }`}
          >{cat.icon} {cat.label}</button>
        ))}
      </div>

      {/* My stats card */}
      {globalData && localMe && (
        <div className="mb-4 p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-600/30 text-yellow-300 text-sm font-bold">
              {globalRankings.find(r => r.address === address)?.rank || "-"}
            </div>
            <div>
              <div className="text-sm font-bold text-white">You</div>
              <div className="text-[10px] text-gray-500">{maskAddress(address || "")}</div>
            </div>
          </div>
          <div className="text-lg font-bold text-cyan-400">{localMe.value}</div>
        </div>
      )}

      {/* Global rankings */}
      <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-cyan-400">{CATEGORIES.find(c => c.id === category)?.label}</h2>
          <span className="text-[9px] text-gray-600">{CATEGORIES.find(c => c.id === category)?.desc}</span>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-pulse text-cyan-400">Loading...</div>
          </div>
        ) : globalData && globalRankings.length > 0 ? (
          <div className="space-y-1 max-h-[60vh] overflow-y-auto">
            {globalRankings.map(entry => (
              <div key={entry.address} className={`flex items-center justify-between p-2.5 rounded-lg ${
                entry.address === address ? "border border-yellow-500/30 bg-yellow-500/5" : "hover:bg-white/[0.02]"
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold ${
                    entry.rank === 1 ? "bg-yellow-600/30 text-yellow-300" :
                    entry.rank === 2 ? "bg-gray-400/20 text-gray-300" :
                    entry.rank === 3 ? "bg-orange-600/20 text-orange-300" :
                    "bg-gray-700/30 text-gray-500"
                  }`}>
                    {entry.rank}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{entry.username}</span>
                      {entry.address === address && (
                        <span className="text-[8px] text-yellow-500">(you)</span>
                      )}
                    </div>
                    <div className="text-[9px] text-gray-500">{entry.sub}</div>
                  </div>
                </div>
                <div className="text-sm font-bold text-cyan-400">{entry.value}</div>
              </div>
            ))}
          </div>
        ) : (
          /* Local-only fallback */
          <div className="space-y-1">
            {computeLocalRanking(category).map((entry: UserRank) => (
              <div key={entry.address} className="flex items-center justify-between p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-600/30 text-yellow-300 text-sm font-bold">
                    {entry.rank}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{entry.username}</span>
                      <span className="text-[9px] text-gray-500 font-mono">({maskAddress(entry.address)})</span>
                    </div>
                    <div className="text-[10px] text-gray-500">{entry.sub}</div>
                  </div>
                </div>
                <div className="text-lg font-bold text-cyan-400">{entry.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mini stat cards */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-6 gap-2">
        {CATEGORIES.map(cat => {
          const d = globalData
            ? globalRankings.find(r => r.address === address) || computeLocalRanking(cat.id)[0]
            : computeLocalRanking(cat.id)[0];
          return (
            <div key={cat.id} className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-2 text-center">
              <div className="text-lg">{cat.icon}</div>
              <div className="text-sm font-bold text-white">{d?.value || "0"}</div>
              <div className="text-[8px] text-gray-500">{cat.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
