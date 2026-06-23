"use client";

import { useState, useEffect } from "react";
import { useWalletContext } from "@/components/wallet/WalletProvider";
import { getHeroes, canBecomeLegendary, createLegacy, addHero } from "@/lib/game/GameStateManager";
import type { Hero } from "@/lib/game/types";
import { LEGACY_TIERS } from "@/lib/game/constants";

export default function LegacyPage() {
  const { isConnected, address } = useWalletContext();
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (isConnected && address) {
      setHeroes(getHeroes().filter(h => h.owner_address === address));
    }
  }, [isConnected, address]);

  const legendaryHeroes = heroes.filter(h => h.is_legendary);
  const eligibleHeroes = heroes.filter(h => canBecomeLegendary(h.id));
  const activeHeroes = heroes.filter(h => !h.is_legendary);

  const handleCreateLegacy = (heroId: string) => {
    const result = createLegacy(heroId);
    if (result.success && result.newHero) {
      setMessage(`✨ Legacy Created! ${result.newHero.name} (Gen ${result.newHero.generation}) has been born!`);
      setHeroes(getHeroes().filter(h => h.owner_address === address));
    } else {
      setMessage("❌ Cannot create legacy. Hero doesn't meet requirements.");
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-cyan-400 mb-4">Connect Your Wallet</h1>
          <p className="text-gray-400">Connect to view legacy system.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] p-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-6">
        Legacy System
      </h1>

      {message && (
        <div className="mb-4 px-4 py-3 bg-cyan-600/10 border border-cyan-500/30 rounded-lg text-sm text-cyan-300">
          {message}
          <button onClick={() => setMessage("")} className="ml-3 text-gray-500 hover:text-white">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Eligible Heroes */}
        <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
          <h2 className="text-sm font-bold text-cyan-400 mb-4">Create Legacy</h2>
          {eligibleHeroes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-xs mb-2">No heroes eligible for legacy transfer.</p>
              <p className="text-gray-600 text-[10px]">Requirements: Level 10+ and all intelligence stats at 90+</p>
            </div>
          ) : (
            <div className="space-y-2">
              {eligibleHeroes.map(hero => (
                <div key={hero.id} className="flex items-center justify-between p-3 bg-black/30 border border-gray-700 rounded">
                  <div>
                    <div className="text-xs font-bold text-white">{hero.name}</div>
                    <div className="text-[10px] text-gray-400">Lv.{hero.level} • Gen {hero.generation}</div>
                  </div>
                  <button
                    onClick={() => handleCreateLegacy(hero.id)}
                    className="px-3 py-1 text-[10px] font-bold bg-gradient-to-r from-yellow-600 to-orange-600 rounded text-white hover:from-yellow-500 hover:to-orange-500"
                  >
                    Create Legacy
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Legendary Heroes / Hall of Fame */}
        <div className="bg-dark-2/50 border border-purple-500/10 rounded-lg p-4">
          <h2 className="text-sm font-bold text-purple-400 mb-4">Hall of Fame ({legendaryHeroes.length})</h2>
          {legendaryHeroes.length === 0 ? (
            <p className="text-gray-500 text-xs text-center py-8">
              No legendary heroes yet.<br />
              Reach Level 10+ with max Intelligence to create a Legacy Core.
            </p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {legendaryHeroes.map(hero => (
                <div key={hero.id} className="p-3 bg-black/30 border border-yellow-500/20 rounded">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-yellow-300">⭐ {hero.name}</div>
                      <div className="text-[10px] text-gray-400">{hero.class} • Gen {hero.generation} • {hero.legacy_tier || "Legendary"}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-yellow-500">Lv.{hero.level}</div>
                      <div className="text-[10px] text-gray-500">{hero.traits.length} traits</div>
                    </div>
                  </div>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {hero.traits.map(t => (
                      <span key={t} className="px-1.5 py-0.5 text-[9px] bg-yellow-500/10 border border-yellow-500/20 rounded text-yellow-300">{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Legacy Tiers */}
      <div className="mt-6 bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
        <h2 className="text-sm font-bold text-cyan-400 mb-4">Legacy Tiers</h2>
        <div className="grid grid-cols-5 gap-2">
          {LEGACY_TIERS.map((tier, i) => (
            <div key={tier} className={`text-center p-3 rounded border ${
              legendaryHeroes.some(h => h.legacy_tier === tier)
                ? "border-yellow-500/50 bg-yellow-500/10"
                : "border-gray-700 bg-black/30"
            }`}>
              <div className="text-lg mb-1">{["⚪", "🟢", "🔵", "🟣", "🟡"][i]}</div>
              <div className="text-xs text-gray-400">{tier}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bloodline Overview */}
      <div className="mt-6 bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
        <h2 className="text-sm font-bold text-cyan-400 mb-4">Bloodline Overview</h2>
        <div className="space-y-2">
          {Array.from(new Set(heroes.map(h => h.generation))).sort().map(gen => {
            const genHeroes = heroes.filter(h => h.generation === gen);
            return (
              <div key={gen} className="flex items-center gap-3 p-2 bg-black/30 rounded border border-gray-800">
                <div className="w-8 h-8 flex items-center justify-center bg-cyan-600/20 rounded-full text-xs font-bold text-cyan-400">
                  G{gen}
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-300">{genHeroes.length} hero{genHeroes.length > 1 ? "es" : ""}</div>
                  <div className="text-[10px] text-gray-500">
                    {genHeroes.filter(h => h.is_legendary).length} legendary • {genHeroes.reduce((s, h) => s + h.level, 0)} total levels
                  </div>
                </div>
              </div>
            );
          })}
          {heroes.length === 0 && (
            <p className="text-xs text-gray-600 text-center py-4">No bloodline data yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
