"use client";

import { useState, useMemo } from "react";
import type { Hero } from "@/lib/game/types";
import { RARITY_CONFIG, HERO_CLASSES } from "@/lib/game/constants";
import { SpriteEngineer, SpriteScout, SpriteMarine, SpriteScientist, SpriteMedic, SpriteCommander, SpriteMiner } from "@/components/pixel-art/characters";

const HERO_SPRITES: Record<string, React.FC<{ size?: number; className?: string }>> = {
  Engineer: SpriteEngineer, Scout: SpriteScout, Marine: SpriteMarine,
  Scientist: SpriteScientist, Medic: SpriteMedic, Commander: SpriteCommander, Miner: SpriteMiner,
};

const RARITIES = ["", "Common", "Rare", "Epic", "Legendary", "Mythic", "Genesis"];

export function HeroListView({
  heroes,
  selectedId,
  onSelect,
  onToggleAuto,
}: {
  heroes: Hero[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggleAuto: (hero: Hero) => void;
}) {
  const [search, setSearch] = useState("");
  const [rarity, setRarity] = useState("");
  const [classFilter, setClassFilter] = useState("");

  const filtered = useMemo(() => {
    let h = heroes;
    if (search) h = h.filter(hero => hero.name.toLowerCase().includes(search.toLowerCase()) || hero.id.includes(search));
    if (rarity) h = h.filter(hero => hero.rarity === rarity);
    if (classFilter) h = h.filter(hero => hero.class === classFilter);
    return h;
  }, [heroes, search, rarity, classFilter]);

  return (
    <div className="space-y-1.5">
      {/* Search + Filters */}
      <input type="text" value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Search heroes..."
        className="w-full px-2 py-1.5 text-[11px] bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/40"
      />
      <div className="flex gap-1">
        <select value={rarity} onChange={e => setRarity(e.target.value)}
          className="flex-1 px-1.5 py-1 text-[9px] bg-white/[0.05] border border-white/[0.1] rounded text-gray-300"
        >
          {RARITIES.map(r => <option key={r} value={r}>{r || "All Rarity"}</option>)}
        </select>
        <select value={classFilter} onChange={e => setClassFilter(e.target.value)}
          className="flex-1 px-1.5 py-1 text-[9px] bg-white/[0.05] border border-white/[0.1] rounded text-gray-300"
        >
          <option value="">All Classes</option>
          {HERO_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Hero count */}
      <div className="text-[9px] text-gray-600 px-1">{filtered.length} heroes</div>

      {/* Scrollable list */}
      <div className="space-y-1 max-h-[55vh] overflow-y-auto pr-1">
        {filtered.map(hero => {
          const color = RARITY_CONFIG[hero.rarity as keyof typeof RARITY_CONFIG]?.color || "#9ca3af";
          const Sprite = HERO_SPRITES[hero.class];
          return (
            <button key={hero.id} onClick={() => onSelect(hero.id)}
              className={`w-full text-left p-2 rounded-lg border text-[11px] transition-all ${
                selectedId === hero.id
                  ? "border-cyan-500/50 bg-cyan-500/10"
                  : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.15]"
              }`}
            >
              <div className="flex items-center gap-2">
                {Sprite && <Sprite size={28} />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white truncate" style={{ color }}>{hero.name}</span>
                    <span className="text-[8px] px-1 py-0.5 rounded bg-white/[0.06] text-gray-400 flex-shrink-0">{hero.class}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] text-gray-500 mt-0.5">
                    <span>Lv{hero.level}</span>
                    <span>Gen{hero.generation}</span>
                    <span>⚡{hero.energy}/{hero.max_energy}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] text-gray-500">
                    <span>P:{hero.stats.power}</span>
                    <span>S:{hero.stats.speed}</span>
                    <span>I:{hero.stats.intelligence}</span>
                    <span>♥{hero.genetics.potential}</span>
                  </div>
                </div>
                {hero.is_legendary && <span className="text-[9px] text-yellow-400 flex-shrink-0">★</span>}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 rounded" style={{ width: `${(hero.energy / hero.max_energy) * 100}%` }} />
                </div>
                <span className="text-[8px] text-yellow-400">{Math.round((hero.energy / hero.max_energy) * 100)}%</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <button onClick={e => { e.stopPropagation(); onToggleAuto(hero); }}
                  className={`text-[8px] px-1.5 py-0.5 rounded border ${
                    hero.auto_deploy
                      ? "bg-emerald-600/20 border-emerald-500/30 text-emerald-400"
                      : "border-white/[0.08] text-gray-500"
                  }`}
                >{hero.auto_deploy ? "Auto" : "Manual"}</button>
                {hero.legacy_tier && <span className="text-[8px] text-cyan-400">Legacy</span>}
                {!hero.is_alive && <span className="text-[8px] text-red-400">Dead</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
