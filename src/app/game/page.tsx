"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useWalletContext } from "@/components/wallet/WalletProvider";
import { generateHero } from "@/lib/game/heroGenerator";
import { generateEquipment } from "@/lib/game/equipmentSystem";
import { generateCosmetic } from "@/lib/game/cosmeticSystem";
import { addHero, getHeroes, addMemory, addXP, addIntelligence, updateHero, getHero, calculateScoreRewards, consumeEnergy, triggerEnergyRegen, addEnergyPotions, getEnergyPotions, useEnergyPotion, getActiveMap, clearActiveMap, createNewActiveMap, saveActiveMap, addToInventory, addCosmetic, isEmergencyShutdown, getEffectiveMultipliers, addTransaction, addFragments, getFragments, isAddressFrozen, isAddressBanned, getPlayerBalance, addPlayerBalance } from "@/lib/game/GameStateManager";
import { createGameState, tickGame, getGameResult, TileType, calculateMapProgress, type DropMultipliers } from "@/lib/game/AIDecisionEngine";
import { DIFFICULTIES, DIFFICULTY_CONFIG, MAX_HEROES_PER_MAP, HERO_HATCH_COST } from "@/lib/game/constants";
import { getTokenBalance, payForHatch } from "@/lib/blockchain/provider";
import { renderHero, renderEnemy, renderBoss, renderBomb, renderExplosion, renderLoot, renderSolidWall, renderDestructible, renderLava, renderCrystal } from "@/lib/game/sprites";
import type { Hero, MapProgression } from "@/lib/game/types";
import type { GameState, EnemySim } from "@/lib/game/AIDecisionEngine";
import { playExplosion, playBombPlace, playKill, playLootPickup, playVictory, playDefeat, startMusic, stopMusic, setMusicEnabled, setSfxEnabled, isMusicEnabled, isSfxEnabled } from "@/lib/audio/audioManager";
import { SpriteEngineer, SpriteScout, SpriteMarine, SpriteScientist, SpriteMedic, SpriteCommander, SpriteMiner } from "@/components/pixel-art/characters";

const HERO_SPRITES: Record<string, React.FC<{ size?: number; className?: string }>> = {
  Engineer: SpriteEngineer,
  Scout: SpriteScout,
  Marine: SpriteMarine,
  Scientist: SpriteScientist,
  Medic: SpriteMedic,
  Commander: SpriteCommander,
  Miner: SpriteMiner,
};

const TICK_INTERVAL = 350;
const ENERGY_COST = 10;
const CELL = 36;
const PAD = 2;
const BATTLE_SAVE_KEY = "0gbomber_active_battle";

interface SavedBattle {
  gameState: GameState;
  logs: string[];
  selectedIds: string[];
  elapsed: number;
  tickCount: number;
}

interface Explosion {
  id: string;
  x: number;
  y: number;
  timer: number;
}

interface BombInfo {
  x: number;
  y: number;
  range: number;
}

function calculateBlastCells(bomb: BombInfo, grid: number[][]): { x: number; y: number }[] {
  const cells: { x: number; y: number }[] = [{ x: bomb.x, y: bomb.y }];
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const COLS = grid[0]?.length || 21;
  const ROWS = grid.length || 17;
  for (const [dx, dy] of dirs) {
    for (let r = 1; r <= bomb.range; r++) {
      const ex = bomb.x + dx * r;
      const ey = bomb.y + dy * r;
      if (ex < 0 || ex >= COLS || ey < 0 || ey >= ROWS) break;
      if (grid[ey][ex] === 1) break; // solid wall stops blast
      cells.push({ x: ex, y: ey });
      if (grid[ey][ex] === 2) break; // destructible stops blast (but cell is shown)
    }
  }
  return cells;
}

function saveBattle(data: SavedBattle) {
  try { localStorage.setItem(BATTLE_SAVE_KEY, JSON.stringify(data)); } catch {}
}

function loadBattle(): SavedBattle | null {
  try {
    const raw = localStorage.getItem(BATTLE_SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function clearSavedBattle() {
  try { localStorage.removeItem(BATTLE_SAVE_KEY); } catch {}
}

export default function GamePage() {
  const { isConnected, address, refreshBalance } = useWalletContext();
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBattling, setIsBattling] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState("Easy");
  const [battleResult, setBattleResult] = useState<any>(null);
  const [elapsed, setElapsed] = useState(0);
  const [showSquad, setShowSquad] = useState(true);
  const [tokenBalance, setTokenBalance] = useState<string>("0");
  const [fragments, setFragments] = useState(0);
  const [hatching, setHatching] = useState(false);
  const [hatchError, setHatchError] = useState("");
  const [potions, setPotions] = useState(0);
  const [hasSavedBattle, setHasSavedBattle] = useState(false);
  const [activeMap, setActiveMap] = useState<MapProgression | null>(null);
  const [mapProgress, setMapProgress] = useState(0);
  const [autoDeploy, setAutoDeploy] = useState(false);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const gameRef = useRef<GameState | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const tickCountRef = useRef(0);
  const isBattlingRef = useRef(false);
  const logsRef = useRef<string[]>([]);
  const selectedIdsRef = useRef<string[]>([]);
  const autoDeployRef = useRef(false);
  const pausedRef = useRef(false);
  const elapsedRef = useRef(0);
  const prevLootRef = useRef<Record<string, number>>({});
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const explosionsRef = useRef<Explosion[]>([]);
  const [musicOn, setMusicOn] = useState(true);
  const [sfxOn, setSfxOn] = useState(true);
  const prevEnemyHpRef = useRef<Map<string, number>>(new Map());

  // Check for saved battle on mount
  useEffect(() => {
    const saved = loadBattle();
    if (saved) setHasSavedBattle(true);
  }, []);

  // Save active battle to localStorage (ref-based to avoid effect re-run on every tick)
  const persistBattleRef = useRef(() => {});
  persistBattleRef.current = () => {
    const g = gameRef.current;
    if (!g || !isBattlingRef.current) return;
    saveBattle({
      gameState: g,
      logs: logsRef.current,
      selectedIds: selectedIdsRef.current,
      elapsed: elapsedRef.current,
      tickCount: tickCountRef.current,
    });
  };

  // Save on visibility change (tab switch)
  useEffect(() => {
    const handle = () => { if (document.hidden) persistBattleRef.current(); };
    document.addEventListener("visibilitychange", handle);
    return () => document.removeEventListener("visibilitychange", handle);
  }, []);

  // Save on page unload + cleanup interval on unmount
  useEffect(() => {
    const handleUnload = () => persistBattleRef.current();
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      persistBattleRef.current();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Load heroes on wallet connect
  useEffect(() => {
    if (isConnected && address) {
      triggerEnergyRegen();
      setHeroes(getHeroes().filter(h => h.owner_address === address));
      setPotions(getEnergyPotions());
      setFragments(getFragments(address));
      getTokenBalance(address).then(setTokenBalance).catch(() => setTokenBalance("0"));
    }
  }, [isConnected, address]);

  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = 0;
  }, [logs]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= MAX_HEROES_PER_MAP) return prev;
      return [...prev, id];
    });
  };

  const autoDeployNow = () => {
    if (!address || isBattlingRef.current) return;
    const fresh = getHeroes().filter(h => h.owner_address === address);
    const available = fresh.filter(h => h.energy >= ENERGY_COST).slice(0, MAX_HEROES_PER_MAP);
    if (available.length === 0) return;
    startBattle(available.map(h => h.id));
  };

  const endBattle = (g: GameState) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsBattling(false);
    isBattlingRef.current = false;
    setPaused(false);
    setExplosions([]);
    explosionsRef.current = [];
    pausedRef.current = false;
    stopMusic();

    const hasAliveHeroes = g.heroes.some(h => h.alive);
    const hasAliveEnemies = g.enemies.some(e => e.hp > 0);
    if (hasAliveHeroes && !hasAliveEnemies) playVictory();
    else playDefeat();
    const result = getGameResult(g);
    clearSavedBattle();

    const origCount = activeMap?.originalDestructibleCount ?? 0;
    const progress = calculateMapProgress(g.grid, g.enemies, origCount);
    setMapProgress(progress);
    const allCleared = progress >= 100;
    if (allCleared) {
      clearActiveMap();
      setActiveMap(null);
    } else if (activeMap) {
      const updatedMap = {
        ...activeMap,
        grid: g.grid.map(r => [...r]),
        enemies: g.enemies.map(e => ({ id: e.id, x: e.x, y: e.y, type: e.type, hp: e.hp, maxHp: e.maxHp, moveTimer: e.moveTimer })),
        progress,
        totalKills: activeMap.totalKills + result.heroResults.reduce((s: number, r: any) => s + r.kills, 0),
        cleared: allCleared,
        prePlacedItems: g.prePlacedItems?.map(p => ({ ...p })) || [],
      };
      saveActiveMap(updatedMap);
      setActiveMap(updatedMap);
    }

    setBattleResult({ ...result, allCleared });
    setGameState(g);
    const nl = g.logs.slice(-5);
    setLogs(prev => [...nl, ...prev].slice(0, 200));
    triggerEnergyRegen();
    if (address) {
      setHeroes(getHeroes().filter(h => h.owner_address === address));
      setPotions(getEnergyPotions());
      setFragments(getFragments(address));
    }
  };

  const handlePause = () => {
    if (!isBattlingRef.current) return;
    if (pausedRef.current) return;
    pausedRef.current = true;
    setPaused(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
    persistBattleRef.current();
  };

  const handleResume = () => {
    if (!pausedRef.current) return;
    pausedRef.current = false;
    setPaused(false);

    const saved = loadBattle();
    if (!saved) { setIsBattling(false); isBattlingRef.current = false; return; }
    const eff = getEffectiveMultipliers();
    saved.gameState.multipliers = { equipmentDropRate: eff.equipmentDropRate, currencyDropRate: eff.currencyDropRate };

    let tc = saved.tickCount;
    intervalRef.current = setInterval(() => {
      if (pausedRef.current) return;
      tc++;
      tickCountRef.current = tc;
      const g = gameRef.current;
      if (!g) return;
      const aliveHeroes = g.heroes.filter(h => h.alive);
      const aliveEnemies = g.enemies.filter(e => e.hp > 0);

      if (aliveHeroes.length === 0 || aliveEnemies.length === 0 || tc >= 400) {
        endBattle(g);
        return;
      }

      const updated = tickAndDetectExplosions();
      if (!updated) return;
      setGameState({ ...updated });
      elapsedRef.current = tc * TICK_INTERVAL;
      setElapsed(tc * TICK_INTERVAL);
      const nl = g.logs.slice(-3);
      logsRef.current = [...nl, ...logsRef.current].slice(0, 200);
      setLogs(logsRef.current);
    }, TICK_INTERVAL);
  };

  const handleStop = () => {
    if (!isBattlingRef.current) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    const g = gameRef.current;
    if (g) endBattle(g);
  };



  const handleHatch = async () => {
    if (!address) return;
    if (isAddressBanned(address)) { setHatchError("Your wallet is banned from creating new heroes."); return; }
    setHatching(true);
    setHatchError("");
    try {
      // Try on-chain payment first, fall back to in-game balance
      try {
        await payForHatch(HERO_HATCH_COST);
      } catch (e: any) {
        const msg = e?.message?.toLowerCase() || "";
        if (msg.includes("user rejected")) { setHatchError("Transaction cancelled"); setHatching(false); return; }
        const bal = getPlayerBalance(address);
        if (bal >= parseInt(HERO_HATCH_COST)) {
          addPlayerBalance(address, -parseInt(HERO_HATCH_COST));
        } else {
          setHatchError("Insufficient 0BOMB — claim free tokens at /faucet");
          setHatching(false);
          return;
        }
      }
      const hero = generateHero(address);
      addHero(hero);
      addTransaction({ type: "expense", category: "hatch", amount: HERO_HATCH_COST, description: `Hatched ${hero.name} (${hero.rarity})`, ownerAddress: address });
      setHeroes(prev => [...prev, hero]);
      const bal = await getTokenBalance(address);
      setTokenBalance(bal);
      refreshBalance();
    } catch (e: any) {
      setHatchError(`Hatch failed: ${e?.message?.slice(0, 80) || "Unknown error"}`);
    } finally {
      setHatching(false);
    }
  };

  // Resume a saved battle
  const resumeBattle = () => {
    const saved = loadBattle();
    if (!saved) return;
    setHasSavedBattle(false);
    clearSavedBattle();
    const eff = getEffectiveMultipliers();
    saved.gameState.multipliers = { equipmentDropRate: eff.equipmentDropRate, currencyDropRate: eff.currencyDropRate };
    gameRef.current = saved.gameState;
    setGameState(saved.gameState);
    setLogs(saved.logs);
    setSelectedIds(saved.selectedIds);
    elapsedRef.current = saved.elapsed;
    setElapsed(saved.elapsed);
    setIsBattling(true);
    isBattlingRef.current = true;
    setPaused(false);
    pausedRef.current = false;
    logsRef.current = saved.logs;
    selectedIdsRef.current = saved.selectedIds;
    prevEnemyHpRef.current = new Map(saved.gameState.enemies.filter(e => e.hp > 0).map(e => [e.id, e.hp]));
    if (isMusicEnabled()) startMusic();

    let tc = saved.tickCount;
    const maxTicks = 400;

    intervalRef.current = setInterval(() => {
      tc++;
      tickCountRef.current = tc;
      const g = gameRef.current;
      if (!g) return;
      const aliveHeroes = g.heroes.filter(h => h.alive);
      const aliveEnemies = g.enemies.filter(e => e.hp > 0);

      if (aliveHeroes.length === 0 || aliveEnemies.length === 0 || tc >= maxTicks) {
        endBattle(g);
        return;
      }

      const updated = tickAndDetectExplosions();
      if (!updated) return;
      setGameState({ ...updated });
      setElapsed(tc * TICK_INTERVAL);
      const nl = g.logs.slice(-3);
      logsRef.current = [...nl, ...logsRef.current].slice(0, 200);
      setLogs(logsRef.current);
    }, TICK_INTERVAL);
  };

  // Discard saved battle
  const discardBattle = () => {
    clearSavedBattle();
    setHasSavedBattle(false);
    setGameState(null);
    setLogs([]);
    setSelectedIds([]);
    logsRef.current = [];
    selectedIdsRef.current = [];
  };

  const handleUsePotion = (heroId: string) => {
    if (useEnergyPotion(heroId)) {
      setPotions(getEnergyPotions());
      setHeroes(getHeroes().filter(h => h.owner_address === address));
    }
  };

  // Build grid + enemies for a new battle (from active map or fresh)
  const buildBattleState = (heroes: Hero[], multipliers?: DropMultipliers) => {
    if (activeMap && !activeMap.cleared) {
      // Continue from active map
      const gs = createGameState(heroes, multipliers, difficulty as "Easy" | "Advanced" | "Nightmare");
      // Restore saved grid
      for (let y = 0; y < activeMap.grid.length && y < gs.grid.length; y++) {
        for (let x = 0; x < activeMap.grid[y].length && x < gs.grid[y].length; x++) {
          gs.grid[y][x] = activeMap.grid[y][x] as TileType;
        }
      }
      // Restore saved enemies
      gs.enemies = activeMap.enemies.map(e => ({ ...e, moveTimer: e.moveTimer || 0 })) as EnemySim[];
      // Restore saved pre-placed items
      if (activeMap.prePlacedItems) {
        gs.prePlacedItems = activeMap.prePlacedItems.map(p => ({ ...p }));
      }
      return gs;
    }
    // Fresh map
    return createGameState(heroes, multipliers, difficulty as "Easy" | "Advanced" | "Nightmare");
  };

  const processCollectedLoot = (g: GameState) => {
    for (const hero of g.heroes) {
      const prev = prevLootRef.current[hero.id] || 0;
      if (hero.lootCollected > prev) {
        playLootPickup();
        for (let i = 0; i < hero.lootCollected - prev; i++) {
          const eq = generateEquipment(undefined, hero.id);
          addToInventory(eq);
          addMemory(hero.id, "Found Equipment", `Found ${eq.name} (${eq.rarity})`);
        }
      }
      prevLootRef.current[hero.id] = hero.lootCollected;
    }
  };

  const tickAndDetectExplosions = () => {
    const g = gameRef.current;
    if (!g) return null;

    const bombCountBefore = g.bombs.length;
    // Snapshot pre-tick bomb info and grid for blast calculation
    const prevBombs: BombInfo[] = g.bombs.map(b => ({ x: b.x, y: b.y, range: b.range }));
    const gridBefore = g.grid.map(r => [...r]);

    const updated = tickGame(g, TICK_INTERVAL);
    processCollectedLoot(updated);
    gameRef.current = updated;

    const curBombKeys = new Set(updated.bombs.map(b => `${b.x},${b.y}`));
    const newExplosions: Explosion[] = [];
    let expSeq = 0;
    let hasExplosion = false;
    for (const pb of prevBombs) {
      if (!curBombKeys.has(`${pb.x},${pb.y}`)) {
        hasExplosion = true;
        const blastCells = calculateBlastCells(pb, gridBefore);
        for (const bc of blastCells) {
          newExplosions.push({
            id: `exp-${Date.now()}-${expSeq++}`,
            x: bc.x,
            y: bc.y,
            timer: 3,
          });
        }
      }
    }
    if (hasExplosion) playExplosion();

    if (updated.bombs.length > bombCountBefore) playBombPlace();

    const curHp = new Map(updated.enemies.filter(e => e.hp > 0).map(e => [e.id, e.hp]));
    const prevHp = prevEnemyHpRef.current;
    for (const [id, hp] of prevHp) {
      if (!curHp.has(id) && hp > 0) playKill();
    }
    prevEnemyHpRef.current = curHp;

    const existing = explosionsRef.current
      .map(e => ({ ...e, timer: e.timer - 1 }))
      .filter(e => e.timer > 0);
    const all = [...newExplosions, ...existing];
    explosionsRef.current = all;
    setExplosions(all);

    return updated;
  };

  const startBattle = (ids?: string[]) => {
    const heroIds = ids || selectedIds;
    if (heroIds.length === 0 || !address) return;
    if (address && isAddressFrozen(address)) { setLogs(prev => ["❄️ Account frozen — cannot battle", ...prev].slice(0, 200)); return; }
    const canDeploy = heroIds.every(id => {
      const h = getHeroes().find(x => x.id === id);
      return h && h.energy >= ENERGY_COST;
    });
    if (!canDeploy) return;

    setSelectedIds(heroIds);
    selectedIdsRef.current = heroIds;
    for (const id of heroIds) consumeEnergy(id, ENERGY_COST);
    clearSavedBattle();

    const selectedHeroes = getHeroes().filter(h => heroIds.includes(h.id));
    const eff = getEffectiveMultipliers();
    const multi: DropMultipliers = { equipmentDropRate: eff.equipmentDropRate, currencyDropRate: eff.currencyDropRate };
    const gs = buildBattleState(selectedHeroes, multi);

    // Save map if new
    if (!activeMap || activeMap.cleared) {
      const newMap = createNewActiveMap(address, difficulty, gs.grid.map(r => [...r]), gs.enemies.map(e => ({ ...e })), gs.prePlacedItems?.map(p => ({ ...p })));
      setActiveMap(newMap);
      setMapProgress(0);
    }

    gameRef.current = gs;
    setGameState(gs);
    setLogs([]);
    elapsedRef.current = 0;
    setElapsed(0);
    setBattleResult(null);
    setIsBattling(true);
    isBattlingRef.current = true;
    setPaused(false);
    pausedRef.current = false;
    logsRef.current = [];
    selectedIdsRef.current = selectedIds;
    prevEnemyHpRef.current = new Map(gs.enemies.filter(e => e.hp > 0).map(e => [e.id, e.hp]));
    if (isMusicEnabled()) startMusic();

    let tickCount = 0;
    const maxTicks = DIFFICULTY_CONFIG[difficulty as "Easy" | "Advanced" | "Nightmare"].maxTicks;

    intervalRef.current = setInterval(() => {
      tickCount++;
      tickCountRef.current = tickCount;
      const g = gameRef.current;
      if (!g) return;
      const aliveHeroes = g.heroes.filter(h => h.alive);
      const aliveEnemies = g.enemies.filter(e => e.hp > 0);

      if (aliveHeroes.length === 0 || aliveEnemies.length === 0 || tickCount >= maxTicks) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsBattling(false);
        isBattlingRef.current = false;
        const result = getGameResult(g);
        clearSavedBattle();

        // Save map progression
        const origCount = activeMap?.originalDestructibleCount ?? 0;
        const progress = calculateMapProgress(g.grid, g.enemies, origCount);
        setMapProgress(progress);
        const allCleared = progress >= 100;
        if (allCleared) {
          clearActiveMap();
          setActiveMap(null);
        } else if (activeMap) {
          const updatedMap = {
            ...activeMap,
            grid: g.grid.map(r => [...r]),
            enemies: g.enemies.map(e => ({ id: e.id, x: e.x, y: e.y, type: e.type, hp: e.hp, maxHp: e.maxHp, moveTimer: e.moveTimer })),
            progress,
            totalKills: activeMap.totalKills + result.heroResults.reduce((s: number, r: any) => s + r.kills, 0),
            cleared: allCleared,
            prePlacedItems: g.prePlacedItems?.map(p => ({ ...p })) || [],
          };
          saveActiveMap(updatedMap);
          setActiveMap(updatedMap);
        }

        setBattleResult({ ...result, allCleared });
        setGameState(g);
        const nl = g.logs.slice(-5);
        setLogs(prev => [...nl, ...prev].slice(0, 200));
        triggerEnergyRegen();
        if (address) {
          setHeroes(getHeroes().filter(h => h.owner_address === address));
          setPotions(getEnergyPotions());
        }
        return;
      }

      const updated = tickAndDetectExplosions();
      if (!updated) return;
      setGameState({ ...updated });
      elapsedRef.current = tickCount * TICK_INTERVAL;
      setElapsed(tickCount * TICK_INTERVAL);
      const nl = g.logs.slice(-3);
      logsRef.current = [...nl, ...logsRef.current].slice(0, 200);
      setLogs(logsRef.current);
    }, TICK_INTERVAL);
  };

  const handleClaimRewards = () => {
    if (!battleResult) return;
    if (address && isAddressFrozen(address)) { setLogs(prev => ["❄️ Account frozen — cannot claim rewards", ...prev].slice(0, 200)); return; }
    const shutdown = isEmergencyShutdown();
    if (shutdown.rewards) { setLogs(prev => ["❌ Rewards are paused by admin", ...prev].slice(0, 200)); return; }
    for (const result of battleResult.heroResults) {
      const hero = getHero(result.id);
      if (!hero) continue;
      const rewards = calculateScoreRewards(result.kills * 50 + result.blocksBroken * 10, hero.level);
      addXP(result.id, rewards.xp);
      addEnergyPotions(result.potionsFound);

      // Per-hero token reward from kills and blocks (even without map clear)
      const eff = getEffectiveMultipliers();
      const heroTokenReward = Math.floor((result.kills * 2 + result.blocksBroken * 0.5) * eff.eventRewardMultiplier);
      if (heroTokenReward > 0 && address) {
        addFragments(address, heroTokenReward);
        addTransaction({ type: "income", category: "reward", amount: String(heroTokenReward), description: `${result.kills} kills, ${result.blocksBroken} blocks`, ownerAddress: address });
      }

      if (result.kills > 0) {
        addMemory(result.id, "Killed Alien", `Killed ${result.kills} aliens`);
        addIntelligence(result.id, "Combat", 1);
      }
      if (result.lootCollected > 0) {
        addMemory(result.id, "Found Rare Loot", `Found ${result.lootCollected} items`);
        addIntelligence(result.id, "Loot", 1);
        for (let i = 0; i < result.lootCollected; i++) {
          const eq = generateEquipment(undefined, result.id);
          addToInventory(eq);
        }
        // Token bonus per loot collected
        if (address) {
          const lootTokenReward = Math.floor(result.lootCollected * 3 * eff.eventRewardMultiplier);
          addFragments(address, lootTokenReward);
          addTransaction({ type: "income", category: "reward", amount: String(lootTokenReward), description: `${result.lootCollected} items looted`, ownerAddress: address });
        }
      }
      if (battleResult.allCleared) {
        addMemory(result.id, "Perfect Clear", "All enemies eliminated");
        addIntelligence(result.id, "Survival", 2);
        addIntelligence(result.id, "Pathfinding", 1);
      }
      if (battleResult.bossKilled) {
        addMemory(result.id, "Boss Kill", "A fearsome boss was slain!");
        addIntelligence(result.id, "Combat", 3);
        addIntelligence(result.id, "Survival", 2);
      }
    }

    // Map completion bonus rewards
    if (address && battleResult.allCleared) {
      const mapDiff = (activeMap?.difficulty || difficulty) as "Easy" | "Advanced" | "Nightmare";
      const dc = DIFFICULTY_CONFIG[mapDiff];
      const eff = getEffectiveMultipliers();

      const bonusItems = dc.bonusEqMin + Math.floor(Math.random() * (dc.bonusEqMax - dc.bonusEqMin + 1));
      for (let i = 0; i < bonusItems; i++) {
        const eq = generateEquipment(undefined, null);
        addToInventory(eq);
      }
      setLogs(prev => [`🎒 Map clear bonus: ${bonusItems} equipment`, ...prev].slice(0, 200));

      if (Math.random() < dc.cosmeticChance * eff.cosmeticDropRate) {
        const cos = generateCosmetic(undefined, null);
        addCosmetic(cos);
        setLogs(prev => [`✨ Bonus cosmetic: ${cos.name} (${cos.rarity})`, ...prev].slice(0, 200));
      }

      const tokenReward = Math.floor((dc.tokenMin + Math.floor(Math.random() * (dc.tokenMax - dc.tokenMin + 1))) * eff.eventRewardMultiplier);
      addFragments(address, tokenReward);
      addTransaction({ type: "income", category: "reward", amount: String(tokenReward), description: `Map clear reward (${mapDiff})`, ownerAddress: address });
      setLogs(prev => [`💎 Earned ${tokenReward} 0B Fragments from ${mapDiff} map clear`, ...prev].slice(0, 200));

      // Boss kill extra rewards
      if (battleResult.bossKilled) {
        const bossEq = generateEquipment(undefined, null);
        addToInventory(bossEq);
        setLogs(prev => [`👑 Boss reward: ${bossEq.name} (${bossEq.rarity})`, ...prev].slice(0, 200));
        const bossCos = generateCosmetic(undefined, null);
        addCosmetic(bossCos);
        setLogs(prev => [`👑 Boss cosmetic: ${bossCos.name} (${bossCos.rarity})`, ...prev].slice(0, 200));
        const bossTokens = Math.floor((dc.bossTokenMin + Math.floor(Math.random() * (dc.bossTokenMax - dc.bossTokenMin + 1))) * eff.eventRewardMultiplier);
        addFragments(address, bossTokens);
        addTransaction({ type: "income", category: "reward", amount: String(bossTokens), description: `Boss kill reward (${mapDiff})`, ownerAddress: address });
        setLogs(prev => [`👑 Earned ${bossTokens} 0B Fragments from boss kill`, ...prev].slice(0, 200));
      }
    }

    clearSavedBattle();
    setBattleResult(null);
    setSelectedIds([]);
    if (address) {
      triggerEnergyRegen();
      setHeroes(getHeroes().filter(h => h.owner_address === address));
      setPotions(getEnergyPotions());
      setFragments(getFragments(address));
    }
    // Auto-deploy next round if toggle still on
    if (autoDeployRef.current) {
      setTimeout(() => autoDeployNow(), 500);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🎮</div>
          <h1 className="text-2xl font-bold text-cyan-400 mb-4">Connect Your Wallet</h1>
          <p className="text-gray-400">Connect to deploy heroes into battle.</p>
        </div>
      </div>
    );
  }

  const gridRows = gameState?.grid?.length || 17;
  const gridCols = gameState?.grid[0]?.length || 21;
  const mapW = gridCols * (CELL + PAD) + PAD;
  const mapH = gridRows * (CELL + PAD) + PAD;

  const canDeploy = selectedIds.every(id => {
    const h = heroes.find(x => x.id === id);
    return h && h.energy >= ENERGY_COST;
  });

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-black">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-800 shrink-0">
        <h1 className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          0GBomber • Auto Battle
        </h1>
        <div className="flex items-center gap-2">
          {activeMap && !activeMap.cleared && !isBattling && !battleResult && (
            <div className="flex items-center gap-1">
              <div className="w-20 h-1.5 bg-gray-700 rounded overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded transition-all" style={{ width: `${mapProgress}%` }} />
              </div>
              <span className="text-[10px] text-gray-400">{mapProgress}%</span>
              <button onClick={() => { clearActiveMap(); setActiveMap(null); setMapProgress(0); }}
                className="text-[10px] text-red-400 hover:text-red-300 underline"
              >Discard Map</button>
            </div>
          )}
          <span className="text-[10px] text-gray-400">🧪 {potions}</span>
          <span className="text-[10px] text-purple-400" title="0B Fragments">💎 {fragments}</span>
          <button onClick={() => setShowSquad(!showSquad)} className="lg:hidden text-[10px] text-cyan-400 underline">Squad</button>
          {!isBattling && !battleResult && !hasSavedBattle && selectedIds.length > 0 && (
            <button onClick={() => startBattle()} disabled={!canDeploy}
              className={`px-3 py-1 text-[10px] font-bold rounded ${
                canDeploy ? "bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white" : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >{activeMap && !activeMap.cleared ? "⚔ Continue " : "⚔ Deploy "}{ENERGY_COST}⚡</button>
          )}
          <button onClick={() => {
              const next = !autoDeploy;
              setAutoDeploy(next);
              autoDeployRef.current = next;
              if (next && !isBattling && !battleResult) {
                setHeroes(getHeroes().filter(h => h.owner_address === address));
                setTimeout(() => autoDeployNow(), 300);
              }
            }}
            className={`px-2 py-1 text-[10px] font-bold rounded border transition-all ${
              autoDeploy ? "bg-green-600/30 border-green-500 text-green-300" : "border-gray-700 text-gray-500"
            }`}
          >{autoDeploy ? "⏹ Auto" : "▶ Auto"}</button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className={`${showSquad ? "block" : "hidden"} lg:block w-[200px] shrink-0 border-r border-gray-800 overflow-y-auto p-2`}>
          {/* Has saved battle banner */}
          {hasSavedBattle && (
            <div className="mb-2 p-1.5 bg-yellow-600/20 border border-yellow-500/30 rounded">
              <p className="text-[10px] text-yellow-300 font-bold mb-1">⚔ Battle saved!</p>
              <div className="flex gap-1">
                <button onClick={resumeBattle} className="flex-1 py-1 text-[11px] font-bold bg-green-600/30 text-green-300 rounded border border-green-500/30 hover:bg-green-600/50">Resume</button>
                <button onClick={discardBattle} className="flex-1 py-1 text-[11px] font-bold bg-red-600/30 text-red-300 rounded border border-red-500/30 hover:bg-red-600/50">Discard</button>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <button onClick={handleHatch} disabled={hatching}
              className={`w-full py-1 text-[11px] font-bold rounded text-white transition-all ${
                hatching ? "bg-gray-600" : "bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500"
              }`}
            >{hatching ? "Hatching..." : `Hatch ${HERO_HATCH_COST}🪙`}</button>

            {hatchError && <div className="px-2 py-1 bg-red-900/20 border border-red-500/30 rounded text-[10px] text-red-400">{hatchError}</div>}

            <Link href="/faucet" className="block text-center text-[10px] text-cyan-400 hover:text-cyan-300 underline">💧 Get free 0BOMB</Link>

            {!hasSavedBattle && selectedIds.length > 0 && (
              <div className="p-1.5 bg-black/60 rounded border border-cyan-500/20">
                <div className="text-[10px] text-cyan-400 font-bold mb-0.5">Squad ({selectedIds.length}/{MAX_HEROES_PER_MAP})</div>
                {selectedIds.map(id => {
                  const h = heroes.find(x => x.id === id);
                  return h ? (
                    <div key={id} className="flex items-center gap-1 text-[10px] py-0.5">
                      {(() => {
                        const Sprite = HERO_SPRITES[h.class];
                        return Sprite ? <Sprite size={20} /> : null;
                      })()}
                      <span className="text-white truncate max-w-[70px]">{h.name}</span>
                      <span className="text-gray-500 ml-auto">Lv.{h.level}</span>
                    </div>
                  ) : null;
                })}
              </div>
            )}

            <div className="space-y-0.5 max-h-[calc(100vh-280px)] overflow-y-auto">
              {heroes.length === 0 ? (
                <p className="text-gray-500 text-[9px] text-center py-4">No heroes. Hatch one!</p>
              ) : (
                [...heroes].sort((a, b) => b.energy - a.energy).map(hero => (
                  <div key={hero.id} onClick={() => !hasSavedBattle && toggleSelect(hero.id)}
                    className={`p-1 rounded border text-[10px] transition-all ${
                      hasSavedBattle ? "opacity-40 cursor-not-allowed" :
                      selectedIds.includes(hero.id) ? "border-cyan-500 bg-cyan-500/15 cursor-pointer" : "border-gray-700 bg-black/30 hover:border-gray-500 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {(() => {
                          const Sprite = HERO_SPRITES[hero.class];
                          return Sprite ? <Sprite size={22} /> : null;
                        })()}
                        <span className="font-bold text-white text-[11px] truncate max-w-[70px]">{hero.name}</span>
                      </div>
                      <span className={`px-0.5 rounded text-[10px] font-bold ${
                        hero.rarity === "Legendary" ? "bg-yellow-600/30 text-yellow-300" :
                        hero.rarity === "Epic" ? "bg-purple-600/30 text-purple-300" : "bg-gray-600/30 text-gray-300"
                      }`}>{hero.rarity}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="flex-1 h-0.5 bg-gray-700 rounded overflow-hidden">
                        <div className="h-full bg-yellow-500 rounded" style={{ width: `${(hero.energy / hero.max_energy) * 100}%` }} />
                      </div>
                      <span className="text-[10px] text-yellow-400">{hero.energy}</span>
                      {potions > 0 && !hasSavedBattle && (
                        <button onClick={(e) => { e.stopPropagation(); handleUsePotion(hero.id); }}
                          className="text-[10px] px-0.5 bg-green-600/20 text-green-400 rounded"
                        >🧪</button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {!hasSavedBattle && (
              <div className="mt-1">
                <label className="text-[11px] text-gray-500 block mb-0.5">Difficulty</label>
                <div className="flex gap-0.5">
                  {DIFFICULTIES.map(d => (
                    <button key={d} onClick={() => setDifficulty(d)} disabled={isBattling}
                      className={`flex-1 py-0.5 text-[11px] rounded border ${
                        difficulty === d ? "bg-cyan-600/20 border-cyan-500 text-cyan-300" : "border-gray-700 text-gray-500"
                      }`}
                    >{d}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center bg-black overflow-hidden relative">
          {isBattling && gameState ? (
            <>
              <div className="flex items-center justify-center gap-3 text-[10px] font-mono text-gray-400 z-10 bg-black/80 px-3 py-1 rounded-t border-b border-gray-800 w-full max-w-[780px] shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400">⏱ {(elapsed / 1000).toFixed(1)}s</span>
                  <span>H: <span className="text-green-400">{gameState.heroes.filter(h => h.alive).length}</span></span>
                  <span>E: <span className="text-red-400">{gameState.enemies.filter(e => e.hp > 0).length}</span></span>
                  <span>💣: <span className="text-orange-400">{gameState.bombs.length}</span></span>
                </div>
                <div className="w-px h-3 bg-gray-700" />
                <div className="flex items-center gap-1">
                  {!paused ? (
                    <button onClick={handlePause} className="px-1.5 py-0.5 bg-yellow-600/30 text-yellow-300 rounded border border-yellow-500/30 hover:bg-yellow-600/50">⏸</button>
                  ) : (
                    <button onClick={handleResume} className="px-1.5 py-0.5 bg-green-600/30 text-green-300 rounded border border-green-500/30 hover:bg-green-600/50">▶</button>
                  )}
                  <button onClick={handleStop} className="px-1.5 py-0.5 bg-red-600/30 text-red-300 rounded border border-red-500/30 hover:bg-red-600/50">⏹</button>
                </div>
                <div className="w-px h-3 bg-gray-700" />
                <div className="flex items-center gap-2 text-[9px]">
                  <span className="text-gray-500 font-bold">Legend:</span>
                  <span className="flex items-center gap-0.5">
                    <svg width="10" height="10" viewBox="0 0 18 18">{renderHero(9, 9, "Marine")}</svg><span className="text-cyan-400">Hero</span>
                  </span>
                  <span className="flex items-center gap-0.5">
                    <svg width="10" height="10" viewBox="0 0 18 18">{renderEnemy(9, 9, "Crawler")}</svg><span className="text-red-400">Enemy</span>
                  </span>
                  <span className="flex items-center gap-0.5">
                    <svg width="10" height="10" viewBox="0 0 18 18">{renderBomb(9, 9)}</svg><span className="text-orange-400">Bomb</span>
                  </span>
                  <span className="flex items-center gap-0.5">
                    <svg width="10" height="10" viewBox="0 0 18 18">{renderLoot(9, 9, "power")}</svg><span className="text-yellow-400">Loot</span>
                  </span>
                </div>
                <div className="w-px h-3 bg-gray-700" />
                <div className="flex items-center gap-1">
                  <button onClick={() => { const v = !isMusicEnabled(); setMusicEnabled(v); setMusicOn(v); if (v && isBattlingRef.current && !pausedRef.current) startMusic(); }}
                    className={`px-1 py-0.5 rounded border ${musicOn ? "border-cyan-500/50 text-cyan-400" : "border-gray-700 text-gray-500"}`}
                  >🎵{musicOn ? "On" : "Off"}</button>
                  <button onClick={() => { const v = !isSfxEnabled(); setSfxEnabled(v); setSfxOn(v); }}
                    className={`px-1 py-0.5 rounded border ${sfxOn ? "border-cyan-500/50 text-cyan-400" : "border-gray-700 text-gray-500"}`}
                  >🔊{sfxOn ? "On" : "Off"}</button>
                </div>
              </div>
              {paused && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
                  <div className="text-center">
                    <div className="text-4xl mb-2">⏸</div>
                    <p className="text-sm text-yellow-300 font-bold mb-3">Battle Paused</p>
                    <button onClick={handleResume} className="px-3 py-1.5 text-xs font-bold bg-green-600/30 text-green-300 rounded border border-green-500/30 hover:bg-green-600/50">▶ Resume</button>
                  </div>
                </div>
              )}
              <div className="flex-1 flex items-center justify-center w-full overflow-hidden p-2">
                <svg width={mapW} height={mapH} viewBox={`0 0 ${mapW} ${mapH}`} style={{ maxWidth: "100%", maxHeight: "100%" }}>
                  {renderMap(gameState, explosions)}
                </svg>
              </div>
            </>
          ) : battleResult ? (
            <div className="bg-gray-900/80 rounded-lg p-4 max-w-md mx-auto">
              <div className="text-center mb-2">
                <div className="text-3xl mb-1">{battleResult.bossKilled ? "🔥" : battleResult.allCleared ? "✨" : "💀"}</div>
                <h2 className="text-base font-bold text-cyan-400">{battleResult.bossKilled ? "Boss Slain!" : battleResult.allCleared ? "Victory!" : "Mission Complete"}</h2>
                <p className="text-[10px] text-gray-500">{battleResult.ticks} ticks</p>
              </div>
              <div className="grid grid-cols-4 gap-1 mb-2">
                <div className="bg-black/30 rounded p-1.5 text-center">
                  <div className="text-sm font-bold text-cyan-400">{battleResult.heroResults.reduce((s: number, r: any) => s + r.kills, 0)}</div>
                  <div className="text-[11px] text-gray-500">Kills</div>
                </div>
                <div className="bg-black/30 rounded p-1.5 text-center">
                  <div className="text-sm font-bold text-yellow-400">{battleResult.totalScore}</div>
                  <div className="text-[11px] text-gray-500">Score</div>
                </div>
                <div className="bg-black/30 rounded p-1.5 text-center">
                  <div className="text-sm font-bold text-green-400">{battleResult.heroResults.filter((r: any) => r.survived).length}/{battleResult.heroResults.length}</div>
                  <div className="text-[11px] text-gray-500">Alive</div>
                </div>
                <div className="bg-black/30 rounded p-1.5 text-center">
                  <div className="text-sm font-bold text-purple-400">{battleResult.heroResults.reduce((s: number, r: any) => s + r.potionsFound, 0)}</div>
                  <div className="text-[11px] text-gray-500">🧪</div>
                </div>
              </div>
              <div className="space-y-0.5 mb-2">
                {battleResult.heroResults.map((r: any) => (
                  <div key={r.id} className={`flex items-center justify-between p-1 rounded text-[10px] border ${r.survived ? "bg-black/30 border-gray-800" : "bg-red-900/20 border-red-800/30"}`}>
                    <span className={r.survived ? "text-white" : "text-red-400"}>{heroes.find(h => h.id === r.id)?.name || r.id}</span>
                    <span className="text-gray-400">K:{r.kills} 🧪:{r.potionsFound}</span>
                  </div>
                ))}
              </div>
              <button onClick={handleClaimRewards}
                className="w-full py-1.5 text-[10px] font-bold bg-gradient-to-r from-yellow-600 to-orange-600 rounded hover:from-yellow-500 hover:to-orange-500 text-white"
              >Claim {battleResult.heroResults.reduce((s: number, r: any) => s + r.potionsFound, 0)}🧪 + XP</button>
            </div>
          ) : hasSavedBattle ? (
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">💾</div>
              <p className="text-sm mb-1">Battle saved from earlier</p>
              <p className="text-[10px] text-gray-600">Resume or discard from the squad panel</p>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <div className="text-3xl mb-2">⚔️</div>
              <p className="text-xs mb-1">Select heroes and deploy</p>
              <p className="text-[10px] text-gray-600">{ENERGY_COST}⚡/hero • 30% 🧪 per kill</p>
              {selectedIds.length > 0 && (
            <button onClick={() => startBattle()} disabled={!canDeploy}
                  className={`mt-2 px-4 py-1 text-xs font-bold rounded ${
                    canDeploy ? "bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white" : "bg-gray-700 text-gray-400 cursor-not-allowed"
                  }`}
                >⚔ Deploy {ENERGY_COST}⚡</button>
              )}
            </div>
          )}
        </div>

        <div className="w-[260px] shrink-0 border-l border-gray-800 flex flex-col">
          <div className="h-[160px] shrink-0 overflow-y-auto border-b border-gray-800">
            <div className="text-[10px] font-bold text-yellow-400 px-2 py-1 border-b border-gray-800">🎒 Loot</div>
            <div className="px-2 py-1 space-y-0.5">
              {!gameState ? (
                <p className="text-[11px] text-gray-600 text-center pt-2">Deploy to get loot</p>
              ) : (
                <>
                  {gameState.heroes.filter(h => h.potionsFound > 0).length === 0 && gameState.loot.length === 0 ? (
                    <p className="text-[11px] text-gray-600 text-center pt-2">No items yet</p>
                  ) : (
                    <>
                      {gameState.heroes.filter(h => h.potionsFound > 0).map(h => (
                        <div key={h.id} className="flex items-center justify-between text-[10px] text-gray-300">
                          <span className="truncate max-w-[100px]">{h.name}</span>
                          <span className="text-green-400">🧪×{h.potionsFound}</span>
                        </div>
                      ))}
                      {gameState.loot.length > 0 && (
                        <div className="text-[11px] text-gray-500 border-t border-gray-800 pt-0.5 mt-0.5">
                          {gameState.loot.length} item{gameState.loot.length > 1 ? "s" : ""} on map
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {gameState && isBattling && (
            <div className="h-[260px] shrink-0 border-b border-gray-800">
              <div className="text-[10px] font-bold text-cyan-400 px-2 py-1 border-b border-gray-800">⚔ Hero Status</div>
              <div className="px-2 py-1 space-y-0.5 h-[calc(100%-24px)] overflow-y-auto">
                {gameState.heroes.filter(h => h.alive).length === 0 ? (
                  <p className="text-[11px] text-red-400 text-center pt-1">All heroes defeated</p>
                ) : (
                  gameState.heroes.map(h => {
                    const hpPct = h.hp / 5;
                    return (
                      <div key={h.id} className={`rounded border text-[9px] ${h.alive ? "border-gray-700 bg-black/30" : "border-red-900/30 bg-red-900/10"}`}>
                        <div className="flex items-center justify-between px-1.5 py-0.5">
                          <div className="flex items-center gap-1">
                            {(() => {
                              const Sprite = HERO_SPRITES[h.class];
                              return Sprite ? <Sprite size={18} /> : null;
                            })()}
                            <span className="text-white font-bold text-[10px] truncate max-w-[50px]">{h.name}</span>
                            <span className="text-gray-500 text-[8px]">{h.class}</span>
                          </div>
                          <span className={h.alive ? "text-green-400" : "text-red-400"}>{h.alive ? `♥${h.hp}` : "💀"}</span>
                        </div>
                        <div className="px-1.5 pb-0.5">
                          <div className="h-1 bg-gray-700 rounded overflow-hidden">
                            <div className={`h-full rounded ${hpPct > 0.5 ? "bg-green-500" : hpPct > 0.25 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${hpPct * 100}%` }} />
                          </div>
                          <div className="flex items-center justify-between text-[8px] text-gray-500">
                            <span>💀{h.kills}</span>
                            <span>🧱{h.blocksBroken}</span>
                            <span>🎒{h.lootCollected}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="text-[10px] font-bold text-gray-400 px-2 py-1 border-b border-gray-800 shrink-0">⚡ Feed <span className="text-gray-600 font-normal">({logs.length})</span></div>
            <div ref={feedRef} className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
              {logs.length === 0 ? (
                <p className="text-[11px] text-gray-600 text-center pt-4">Waiting for battle...</p>
              ) : (
                logs.slice(0, 40).map((msg, i) => (
                  <div key={i} className="text-[10px] text-gray-500 font-mono leading-snug">
                    {msg.length > 60 ? msg.slice(0, 60) + "..." : msg}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function renderMap(gs: GameState, explosions: Explosion[]) {
  const elements: React.ReactNode[] = [];
  const cw = CELL;
  const ch = CELL;

  for (let y = 0; y < gs.grid.length; y++) {
    for (let x = 0; x < gs.grid[y].length; x++) {
      const tile = gs.grid[y][x];
      const px = x * (cw + PAD) + PAD;
      const py = y * (ch + PAD) + PAD;

      if (tile === 1) {
        elements.push(<g key={`wall-${x}-${y}`}>{renderSolidWall(px, py, cw, ch)}</g>);
      } else if (tile === 2) {
        elements.push(<g key={`dest-${x}-${y}`}>{renderDestructible(px, py, cw, ch)}</g>);
      } else if (tile === 3) {
        elements.push(<g key={`lava-${x}-${y}`}>{renderLava(px, py, cw, ch)}</g>);
      } else if (tile === 4) {
        elements.push(<g key={`cry-${x}-${y}`}>{renderCrystal(px, py, cw, ch)}</g>);
      } else {
        elements.push(
          <rect key={`floor-${x}-${y}`} x={px} y={py} width={cw} height={ch} fill="#0f0f23" stroke="#1a1a30" strokeWidth={0.5} rx={1} />
        );
      }
    }
  }

  for (const loot of gs.loot) {
    const px = loot.x * (cw + PAD) + PAD + cw / 2;
    const py = loot.y * (ch + PAD) + PAD + ch / 2;
    elements.push(<g key={`loot-${loot.x}-${loot.y}`}>{renderLoot(px, py, loot.type)}</g>);
  }

  for (const item of gs.prePlacedItems || []) {
    const px = item.x * (cw + PAD) + PAD + cw / 2;
    const py = item.y * (ch + PAD) + PAD + ch / 2;
    elements.push(
      <g key={`pre-${item.x}-${item.y}`}>
        <circle cx={px} cy={py} r={3} fill="#ffd700" opacity={0.8} />
        <circle cx={px} cy={py} r={1.5} fill="#fff" opacity={0.6} />
      </g>
    );
  }

  for (const bomb of gs.bombs) {
    const px = bomb.x * (cw + PAD) + PAD + cw / 2;
    const py = bomb.y * (ch + PAD) + PAD + ch / 2;
    elements.push(<g key={`bomb-${bomb.x}-${bomb.y}`}>{renderBomb(px, py)}</g>);
  }

  for (const exp of explosions) {
    const px = exp.x * (cw + PAD) + PAD + cw / 2;
    const py = exp.y * (ch + PAD) + PAD + ch / 2;
    elements.push(<g key={exp.id}>{renderExplosion(px, py)}</g>);
  }

  for (const enemy of gs.enemies) {
    if (enemy.hp <= 0) continue;
    const px = enemy.x * (cw + PAD) + PAD + cw / 2;
    const py = enemy.y * (ch + PAD) + PAD + ch / 2;
    const isBoss = ["Lava Titan", "Hive Queen", "Ancient Guardian", "Void Dragon"].includes(enemy.type);

    elements.push(
      <g key={`enemy-sprite-${enemy.id}`}>
        {isBoss ? renderBoss(px, py, enemy.type) : renderEnemy(px, py, enemy.type)}
      </g>
    );

    const hpPct = enemy.hp / enemy.maxHp;
    const bossSize = 10;
    const hpBarY = isBoss ? py - bossSize - 4 : py - 8;
    elements.push(
      <rect key={`ehpbg-${enemy.id}`} x={px - 6} y={hpBarY} width={12} height={2} fill="#333" rx={1} />,
      <rect key={`ehp-${enemy.id}`} x={px - 6} y={hpBarY} width={12 * hpPct} height={2} fill={hpPct > 0.5 ? "#44ff44" : "#ff4444"} rx={1} />
    );
  }

  for (const hero of gs.heroes) {
    if (!hero.alive) continue;
    const px = hero.x * (cw + PAD) + PAD + cw / 2;
    const py = hero.y * (ch + PAD) + PAD + ch / 2;
    const hSim = hero as any;

    if (hSim.cosmetics?.Aura) {
      elements.push(
        <circle key={`aura-${hero.id}`} cx={px} cy={py} r={12} fill="none" stroke="#a855f7" strokeWidth={1} opacity={0.5}>
          <animate attributeName="r" values="12;14;12" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0.2;0.5" dur="1.5s" repeatCount="indefinite" />
        </circle>
      );
    }
    elements.push(<g key={`hero-sprite-${hero.id}`}>{renderHero(px, py, hero.class)}</g>);
    if (hSim.cosmetics?.Trail) {
      elements.push(
        <circle key={`trail-${hero.id}`} cx={px - 6} cy={py + 4} r={3} fill="#22d3ee" opacity={0.4}>
          <animate attributeName="opacity" values="0.4;0;0.4" dur="0.6s" repeatCount="indefinite" />
        </circle>,
        <circle key={`trail2-${hero.id}`} cx={px - 4} cy={py - 5} r={2} fill="#22d3ee" opacity={0.3}>
          <animate attributeName="opacity" values="0.3;0;0.3" dur="0.8s" repeatCount="indefinite" />
        </circle>
      );
    }
    if (hSim.cosmetics?.Helmet) {
      elements.push(
        <rect key={`helm-${hero.id}`} x={px - 4} y={py - 11} width={8} height={4} fill="#f59e0b" rx={1} opacity={0.6} />
      );
    }
    const hpPct = hero.hp / 5;
    elements.push(
      <rect key={`hphpbg-${hero.id}`} x={px - 6} y={py - 11} width={12} height={2} fill="#333" rx={1} />,
      <rect key={`hphp-${hero.id}`} x={px - 6} y={py - 11} width={12 * hpPct} height={2} fill="#44ff44" rx={1} />
    );
    elements.push(
      <text key={`name-${hero.id}`} x={px} y={py - 13} fill="#22d3ee" fontSize="5" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
        {hero.name.length > 6 ? hero.name.slice(0, 6) : hero.name}
      </text>
    );
  }

  return elements;
}


