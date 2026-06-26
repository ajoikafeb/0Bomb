"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useWalletContext } from "@/components/wallet/WalletProvider";
import { useBalance } from "@/components/balance/BalanceProvider";
import { generateHero } from "@/lib/game/heroGenerator";
import { generateEquipment } from "@/lib/game/equipmentSystem";
import { generateCosmetic } from "@/lib/game/cosmeticSystem";
import { addHero, getHeroes, addMemory, addXP, addIntelligence, updateHero, getHero, calculateScoreRewards, consumeEnergy, triggerEnergyRegen, addEnergyPotions, getEnergyPotions, useEnergyPotion, getActiveMap, clearActiveMap, createNewActiveMap, saveActiveMap, addToInventory, addCosmetic, isEmergencyShutdown, getEffectiveMultipliers, addTransaction, addFragments, getFragments, isAddressFrozen, isAddressBanned, getPlayerBalance, addPlayerBalance, evolveAIStats, autoBuildTeam, toggleAutoDeploy, getEnergyCostForDifficulty, generateRewardChest, claimRewardChest, getVoucherRemaining, useVoucher, getVoucherUsage, markSoulbound, getEffectiveStats } from "@/lib/game/GameStateManager";
import { createGameState, spawnHeroes, tickGame, getGameResult, TileType, calculateMapProgress, generateEnemies, type DropMultipliers } from "@/lib/game/AIDecisionEngine";
import { DIFFICULTIES, DIFFICULTY_CONFIG, MAX_HEROES_PER_MAP, HERO_HATCH_COST, ENERGY_COST_BY_DIFFICULTY, CLEAR_TIME_BONUS_CONFIG, VOUCHER_MAX_HERO } from "@/lib/game/constants";
import { payForHatch } from "@/lib/blockchain/provider";
import { mintHero } from "@/lib/blockchain/heroNFTService";
import type { Hero, MapProgression, RewardChest, RewardChestItem } from "@/lib/game/types";
import type { GameState, EnemySim } from "@/lib/game/AIDecisionEngine";
import { playExplosion, playBombPlace, playKill, playLootPickup, playVictory, playDefeat, startMusic, stopMusic, setMusicEnabled, setSfxEnabled, isMusicEnabled, isSfxEnabled } from "@/lib/audio/audioManager";
import BottomPanel from "@/components/game/BottomPanel";
import { GameMap } from "@/components/game/GameMap";
import { BattleHUD } from "@/components/game/BattleHUD";
import { BattleResultPanel } from "@/components/game/BattleResultPanel";
import { EmptyBattleState } from "@/components/game/EmptyBattleState";
import { LeftPanel } from "@/components/game/LeftPanel";
import { RightPanel } from "@/components/game/RightPanel";
import { BottomStatusBar } from "@/components/game/BottomStatusBar";
import type { Explosion } from "@/components/game/types";

const TICK_INTERVAL = 350;
const getEnergyCost = (d: string) => ENERGY_COST_BY_DIFFICULTY[d as "Easy" | "Advanced" | "Nightmare"] || 10;
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
      if (grid[ey][ex] === 1) break;
      cells.push({ x: ex, y: ey });
      if (grid[ey][ex] === 2) break;
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
  const { isConnected, address } = useWalletContext();
  const { refreshBalances } = useBalance();
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBattling, setIsBattling] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState("Easy");
  const [battleResult, setBattleResult] = useState<any>(null);
  const [elapsed, setElapsed] = useState(0);
  const [showSquad, setShowSquad] = useState(true);
  const [fragments, setFragments] = useState(0);
  const [hatching, setHatching] = useState(false);
  const [hatchError, setHatchError] = useState("");
  const [potions, setPotions] = useState(0);
  const [hasSavedBattle, setHasSavedBattle] = useState(false);
  const [activeMap, setActiveMap] = useState<MapProgression | null>(null);
  const [mapProgress, setMapProgress] = useState(0);
  const [autoDeploy, setAutoDeploy] = useState(false);
  const [rewardChest, setRewardChest] = useState<RewardChest | null>(null);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const gameRef = useRef<GameState | null>(null);
  const tickCountRef = useRef(0);
  const isBattlingRef = useRef(false);
  const logsRef = useRef<string[]>([]);
  const selectedIdsRef = useRef<string[]>([]);
  const autoDeployRef = useRef(false);
  const pausedRef = useRef(false);
  const elapsedRef = useRef(0);
  const activeMapRef = useRef<MapProgression | null>(null);
  activeMapRef.current = activeMap;
  const prevLootRef = useRef<Record<string, number>>({});
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const explosionsRef = useRef<Explosion[]>([]);
  const [musicOn, setMusicOn] = useState(true);
  const [sfxOn, setSfxOn] = useState(true);
  const prevEnemyHpRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const saved = loadBattle();
    if (saved) setHasSavedBattle(true);
  }, []);

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

  useEffect(() => {
    const handle = () => { if (document.hidden) persistBattleRef.current(); };
    document.addEventListener("visibilitychange", handle);
    return () => document.removeEventListener("visibilitychange", handle);
  }, []);

  useEffect(() => {
    const handleUnload = () => persistBattleRef.current();
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      persistBattleRef.current();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (isConnected && address) {
      triggerEnergyRegen();
      setHeroes(getHeroes().filter(h => h.owner_address === address));
      setPotions(getEnergyPotions());
      setFragments(getFragments(address));
      refreshBalances();
    }
  }, [isConnected, address, refreshBalances]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= MAX_HEROES_PER_MAP) return prev;
      return [...prev, id];
    });
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
      refreshBalances();
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

  const autoDeployNow = () => {
    if (!address || isBattlingRef.current) return;
    const fresh = getHeroes().filter(h => h.owner_address === address);
    const energyCost = getEnergyCost(difficulty);
    const available = fresh.filter(h => h.energy >= energyCost).slice(0, MAX_HEROES_PER_MAP);
    if (available.length === 0) return;
    startBattle(available.map(h => h.id));
  };

  const handleAutoBuild = () => {
    if (!address) return;
    const team = autoBuildTeam(address, difficulty);
    setSelectedIds(team);
  };

  const handleHatch = async () => {
    if (!address) return;
    if (isAddressBanned(address)) { setHatchError("Your wallet is banned from creating new heroes."); return; }
    setHatching(true);
    setHatchError("");
    try {
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
      try {
        const HERO_CLASSES = ["Marine", "Scout", "Scientist", "Miner", "Medic", "Commander", "Engineer"];
        const classIndex = HERO_CLASSES.indexOf(hero.class);
        const rarityIndex = ["Common", "Rare", "Epic", "Legendary", "Mythic", "Genesis"].indexOf(hero.rarity);
        const dnaHash = hero.genetics?.dna_quality || Math.floor(Math.random() * 1000000);
        const bloodlineId = Math.floor(Math.random() * 1000000) + 1;
        await mintHero(
          hero.name, classIndex >= 0 ? classIndex : 0,
          hero.generation || 1, rarityIndex >= 0 ? rarityIndex : 0,
          dnaHash, bloodlineId, `https://api.0bomb.game/metadata/hero/${hero.id}`, false, "0"
        );
      } catch {}
      await refreshBalances();
    } catch (e: any) {
      setHatchError(`Hatch failed: ${e?.message?.slice(0, 80) || "Unknown error"}`);
    } finally {
      setHatching(false);
    }
  };

  const handleFreeHatch = async () => {
    if (!address) return;
    if (!useVoucher(address, "hero")) return;
    setHatching(true);
    setHatchError("");
    try {
      const hero = generateHero(address);
      addHero(hero);
      markSoulbound(hero.id);
      addTransaction({ type: "expense", category: "hatch", amount: "0", description: `Free hatch voucher (${getVoucherUsage(address, "hero")}/${VOUCHER_MAX_HERO}) — ${hero.name}`, ownerAddress: address });
      setHeroes(prev => [...prev, hero]);
      try {
        const HERO_CLASSES = ["Marine", "Scout", "Scientist", "Miner", "Medic", "Commander", "Engineer"];
        const classIndex = HERO_CLASSES.indexOf(hero.class);
        const rarityIndex = ["Common", "Rare", "Epic", "Legendary", "Mythic", "Genesis"].indexOf(hero.rarity);
        const dnaHash = hero.genetics?.dna_quality || Math.floor(Math.random() * 1000000);
        const bloodlineId = Math.floor(Math.random() * 1000000) + 1;
        await mintHero(
          hero.name, classIndex >= 0 ? classIndex : 0,
          hero.generation || 1, rarityIndex >= 0 ? rarityIndex : 0,
          dnaHash, bloodlineId, `https://api.0bomb.game/metadata/hero/${hero.id}`, true, "0"
        );
      } catch {}
    } catch (e: any) {
      setHatchError(`Free hatch failed: ${e?.message?.slice(0, 80) || "Unknown error"}`);
    } finally {
      setHatching(false);
    }
  };

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
      refreshBalances();
    }
  };

  const handleToggleAutoDeploy = (heroId: string) => {
    toggleAutoDeploy(heroId);
    setHeroes(getHeroes().filter(h => h.owner_address === address));
  };

  const buildBattleState = (heroes: Hero[], multipliers?: DropMultipliers) => {
    const enhanced = heroes.map(h => {
      const eff = getEffectiveStats(h);
      return { ...h, stats: { ...h.stats, ...eff } };
    });
    if (activeMap && !activeMap.cleared) {
      const dc = difficulty === "Nightmare" ? { enemyMin: 7, enemyMax: 10, enemyHpBonus: 2 } : difficulty === "Advanced" ? { enemyMin: 5, enemyMax: 8, enemyHpBonus: 1 } : { enemyMin: 3, enemyMax: 5, enemyHpBonus: 0 };
      const heroSims = spawnHeroes(enhanced, activeMap.grid);
      const alive = activeMap.enemies.filter(e => e.hp > 0);
      const enemies: EnemySim[] = alive.length > 0
        ? alive.map(e => ({ ...e, moveTimer: e.moveTimer || 0 })) as EnemySim[]
        : generateEnemies(activeMap.grid, dc.enemyMin, dc.enemyMax, dc.enemyHpBonus);
      return {
        grid: activeMap.grid.map(r => [...r]),
        heroes: heroSims,
        enemies,
        bombs: [],
        loot: [],
        prePlacedItems: activeMap.prePlacedItems?.map(p => ({ ...p })) || [],
        tick: 0,
        logs: [],
        multipliers,
        difficulty: difficulty as "Easy" | "Advanced" | "Nightmare",
      };
    }
    return createGameState(enhanced, multipliers, difficulty as "Easy" | "Advanced" | "Nightmare");
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
      const energyCost = getEnergyCost(difficulty);
      return h && h.energy >= energyCost;
    });
    if (!canDeploy) return;

    setSelectedIds(heroIds);
    selectedIdsRef.current = heroIds;
    for (const id of heroIds) consumeEnergy(id, getEnergyCost(difficulty));
    clearSavedBattle();

    const selectedHeroes = getHeroes().filter(h => heroIds.includes(h.id));
    const eff = getEffectiveMultipliers();
    const multi: DropMultipliers = { equipmentDropRate: eff.equipmentDropRate, currencyDropRate: eff.currencyDropRate };
    const gs = buildBattleState(selectedHeroes, multi);

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

      if (tickCount === 1) {
        g.logs.push(`[T1] Heroes:${aliveHeroes.length} Enemies:${aliveEnemies.length} H:${g.heroes.map(h => '('+h.x+','+h.y+')').join('')} A:${g.heroes.map(h => h.currentAction||'none').join(',')} E:${g.enemies.map(e => '('+e.x+','+e.y+')').join('')}`);
      }

      if (aliveHeroes.length === 0 || aliveEnemies.length === 0 || tickCount >= maxTicks) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsBattling(false);
        isBattlingRef.current = false;
        const result = getGameResult(g);
        clearSavedBattle();

        const amap = activeMapRef.current;
        const origCount = amap?.originalDestructibleCount ?? 0;
        const progress = calculateMapProgress(g.grid, g.enemies, origCount);
        setMapProgress(progress);
        const allCleared = progress >= 100;
        if (allCleared) {
          clearActiveMap();
          setActiveMap(null);
        } else if (amap) {
          const updatedMap = {
            ...amap,
            grid: g.grid.map(r => [...r]),
            enemies: g.enemies.map(e => ({ id: e.id, x: e.x, y: e.y, type: e.type, hp: e.hp, maxHp: e.maxHp, moveTimer: e.moveTimer })),
            progress,
            totalKills: amap.totalKills + result.heroResults.reduce((s: number, r: any) => s + r.kills, 0),
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

      const eff = getEffectiveMultipliers();
      const heroTokenReward = Math.floor((result.kills * 2 + result.blocksBroken * 0.5) * eff.eventRewardMultiplier);
      if (heroTokenReward > 0 && address) {
        addFragments(address, heroTokenReward);
        addTransaction({ type: "income", category: "reward", amount: String(heroTokenReward), description: `${result.kills} kills, ${result.blocksBroken} blocks`, ownerAddress: address });
      }

      const battleScore = result.kills * 50 + result.blocksBroken * 10 + result.tilesExplored * 5;
      const killRatio = result.kills / Math.max(1, (battleResult.heroResults.reduce((s: number, r: any) => s + r.kills, 0)));
      evolveAIStats(result.id, battleResult.ticks, result.survived, killRatio);

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

    if (address && battleResult.allCleared && rewardChest && !rewardChest.claimed) {
      const mapDiff = (activeMap?.difficulty || difficulty) as "Easy" | "Advanced" | "Nightmare";
      claimRewardChest(rewardChest, address);
      setRewardChest({ ...rewardChest, claimed: true });
      setLogs(prev => [`🎁 Claimed reward chest: ${rewardChest.fragments}💎`, ...prev].slice(0, 200));
    }

    clearSavedBattle();
    setBattleResult(null);
    setSelectedIds([]);
    if (address) {
      triggerEnergyRegen();
      setHeroes(getHeroes().filter(h => h.owner_address === address));
      setPotions(getEnergyPotions());
      setFragments(getFragments(address));
      refreshBalances();
    }
    if (autoDeployRef.current && address) {
      const energyCost = getEnergyCost(difficulty);
      const team = autoBuildTeam(address, difficulty).filter(id => {
        const h = getHero(id);
        return h && h.energy >= energyCost;
      });
      if (team.length > 0) {
        setLogs(prev => [`🔄 Auto-redeploying ${team.length} heroes...`, ...prev].slice(0, 200));
        setTimeout(() => startBattle(team), 300);
      }
    }
  };

  useEffect(() => {
    if (battleResult && (battleResult.allCleared || battleResult.bossKilled) && address) {
      const mapDiff = (activeMap?.difficulty || difficulty) as "Easy" | "Advanced" | "Nightmare";
      const clearTimeSec = elapsed / 1000;
      const battleHeroes = heroes.filter(h => battleResult.heroResults.some((r: any) => r.id === h.id));
      const totalKills = battleResult.heroResults.reduce((s: number, r: any) => s + r.kills, 0);
      const totalBlocks = battleResult.heroResults.reduce((s: number, r: any) => s + (r.blocksBroken || 0), 0);
      const origCount = activeMap?.originalDestructibleCount || totalBlocks;
      const chest = generateRewardChest(activeMap?.id || "default", mapDiff, battleHeroes, clearTimeSec, origCount, totalBlocks, totalKills);
      setRewardChest(chest);
    } else if (!battleResult) {
      setRewardChest(null);
    }
  }, [battleResult]);

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

  const canDeploy = selectedIds.every(id => {
    const h = heroes.find(x => x.id === id);
    return h && h.energy >= getEnergyCost(difficulty);
  });

  const handleToggleAutoFarm = () => {
    const next = !autoDeploy;
    setAutoDeploy(next);
    autoDeployRef.current = next;
    if (next) {
      if (!isBattling && !battleResult && !hasSavedBattle) {
        handleAutoBuild();
        setHeroes(getHeroes().filter(h => h.owner_address === address));
        setTimeout(() => autoDeployNow(), 300);
      }
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-dark">
      {/* ─── TOP HEADER STRIP ─── */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-800 shrink-0 bg-black/40">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-[11px] font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mr-2">0BOMB</Link>
          {activeMap && !activeMap.cleared && !isBattling && !battleResult && (
            <div className="flex items-center gap-1">
              <div className="w-20 h-1.5 bg-gray-700 rounded overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded transition-all" style={{ width: `${mapProgress}%` }} />
              </div>
              <span className="text-[10px] text-gray-400">{mapProgress}%</span>
              <button onClick={() => { clearActiveMap(); setActiveMap(null); setMapProgress(0); }}
                className="text-[10px] text-red-400 hover:text-red-300 underline"
              >Clear</button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400">🧪 {potions}</span>
          <span className="text-[10px] text-purple-400">💎 {fragments}</span>
          <button onClick={() => setShowSquad(!showSquad)} className="lg:hidden text-[10px] text-cyan-400 underline">Squad</button>
          {!isBattling && !battleResult && !hasSavedBattle && selectedIds.length > 0 && (
            <button onClick={() => startBattle()} disabled={!canDeploy}
              className={`px-3 py-1 text-[10px] font-bold rounded ${
                canDeploy ? "bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white" : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >{activeMap && !activeMap.cleared ? "⚔ Continue " : "⚔ Deploy "}{getEnergyCost(difficulty)}⚡</button>
          )}
          <button onClick={handleToggleAutoFarm}
            className={`px-2 py-1 text-[10px] font-bold rounded border transition-all ${
              autoDeploy ? "bg-green-600/30 border-green-500 text-green-300" : "border-gray-700 text-gray-500"
            }`}
          >{autoDeploy ? "⏹ Auto Farm" : "▶ Auto Farm"}</button>
        </div>
      </div>

      {/* ─── 3-COLUMN LAYOUT ─── */}
      <div className="flex-1 flex min-h-0">
        {/* LEFT PANEL — Map, Squad, Difficulty, Hatch */}
        <div className={`${showSquad ? "block" : "hidden"} lg:block`}>
          <LeftPanel
            heroes={heroes}
            selectedIds={selectedIds}
            isBattling={isBattling}
            gameState={gameState}
            difficulty={difficulty}
            hasSavedBattle={hasSavedBattle}
            hatching={hatching}
            hatchError={hatchError}
            potions={potions}
            activeMap={activeMap}
            mapProgress={mapProgress}
            battleResult={battleResult}
            autoDeploy={autoDeploy}
            onToggleSelect={toggleSelect}
            onStartBattle={startBattle}
            onHatch={handleHatch}
            onFreeHatch={handleFreeHatch}
            onUsePotion={handleUsePotion}
            onToggleAutoDeploy={handleToggleAutoDeploy}
            onSetDifficulty={setDifficulty}
            onAutoBuild={handleAutoBuild}
            onClearActiveMap={() => { clearActiveMap(); setActiveMap(null); setMapProgress(0); }}
            onResumeBattle={resumeBattle}
            onDiscardBattle={discardBattle}
            energyCost={getEnergyCost(difficulty)}
            voucherRemaining={address ? getVoucherRemaining(address, "hero") : 0}
            voucherUsage={address ? getVoucherUsage(address, "hero") : 0}
            voucherMax={VOUCHER_MAX_HERO}
          />
        </div>

        {/* CENTER — Battlefield */}
        <div className="flex-1 flex flex-col bg-dark overflow-hidden relative panel-glow min-w-0">
          {/* Battle HUD */}
          {isBattling && gameState && (
            <BattleHUD
              elapsed={elapsed}
              heroCount={gameState.heroes.filter(h => h.alive).length}
              enemyCount={gameState.enemies.filter(e => e.hp > 0).length}
              bombCount={gameState.bombs.length}
              paused={paused}
              musicOn={musicOn}
              sfxOn={sfxOn}
              onPause={handlePause}
              onResume={handleResume}
              onStop={handleStop}
              onToggleMusic={() => { const v = !isMusicEnabled(); setMusicEnabled(v); setMusicOn(v); if (v && isBattlingRef.current && !pausedRef.current) startMusic(); }}
              onToggleSfx={() => { const v = !isSfxEnabled(); setSfxEnabled(v); setSfxOn(v); }}
            />
          )}

          {/* Battlefield / Results / Empty */}
          {isBattling && gameState ? (
            <>
              <div className="flex-1 flex items-center justify-center w-full overflow-hidden p-2">
                <GameMap gameState={gameState} explosions={explosions} />
              </div>
              {paused && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                  <div className="text-center">
                    <div className="text-5xl mb-3">⏸</div>
                    <p className="text-sm text-yellow-300 font-bold mb-4">Battle Paused</p>
                    <button onClick={handleResume}
                      className="px-4 py-2 text-[11px] font-bold rounded bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white"
                    >▶ Resume</button>
                  </div>
                </div>
              )}
            </>
          ) : battleResult ? (
            <BattleResultPanel
              battleResult={battleResult}
              elapsed={elapsed}
              heroes={heroes}
              rewardChest={rewardChest}
              onClaimRewards={handleClaimRewards}
            />
          ) : hasSavedBattle ? (
            <EmptyBattleState
              energyCost={getEnergyCost(difficulty)}
              selectedCount={selectedIds.length}
              maxHeroes={MAX_HEROES_PER_MAP}
              canDeploy={canDeploy}
              hasSavedBattle={true}
              gameState={gameState}
              onStartBattle={() => startBattle()}
              onResumeBattle={resumeBattle}
              onDiscardBattle={discardBattle}
            />
          ) : (
            <EmptyBattleState
              energyCost={getEnergyCost(difficulty)}
              selectedCount={selectedIds.length}
              maxHeroes={MAX_HEROES_PER_MAP}
              canDeploy={canDeploy}
              hasSavedBattle={false}
              gameState={gameState}
              onStartBattle={() => startBattle()}
              onResumeBattle={resumeBattle}
              onDiscardBattle={discardBattle}
            />
          )}
        </div>

        {/* RIGHT PANEL — Loot, Hero Status, Feed */}
        <div className={`${showSquad ? "block" : "hidden"} lg:block`}>
          <RightPanel
            isBattling={isBattling}
            gameState={gameState}
            logs={logs}
            heroes={heroes}
            battleResult={battleResult}
            hasSavedBattle={hasSavedBattle}
            selectedIds={selectedIds}
            energyCost={getEnergyCost(difficulty)}
            canDeploy={canDeploy}
            onStartBattle={startBattle}
            onResumeBattle={resumeBattle}
            onDiscardBattle={discardBattle}
          />
        </div>
      </div>

      {/* ─── BOTTOM PANEL (during battle) ─── */}
      <BottomPanel
        gameState={gameState}
        isBattling={isBattling}
        paused={paused}
        onPause={handlePause}
        onResume={handleResume}
        onStop={handleStop}
        onToggleAutoDeploy={handleToggleAutoDeploy}
        heroes={heroes}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
      />

      {/* ─── BOTTOM STATUS BAR ─── */}
      <BottomStatusBar
        isConnected={isConnected}
        isBattling={isBattling}
        elapsed={elapsed}
        autoFarmStatus={autoDeploy ? "Farming" : "Idle"}
        chain="0Bomb"
      />
    </div>
  );
}
