import type { Hero, Memory } from "@/lib/game/types";
import { BATTLE_DROPS } from "@/lib/game/dropRates";
import { CORE_STATS, AI_STATS, FARMING_STATS, TRAIT_DEFINITIONS } from "@/lib/game/constants";

const TILE = 32;
const COLS = 21;
const ROWS = 17;

export enum TileType {
  Empty, SolidWall, Destructible, Lava, Crystal,
}

export interface DropMultipliers {
  equipmentDropRate: number;
  currencyDropRate: number;
}

export interface GameState {
  grid: TileType[][];
  heroes: HeroSim[];
  enemies: EnemySim[];
  bombs: BombSim[];
  loot: LootSim[];
  prePlacedItems: { x: number; y: number }[];
  tick: number;
  logs: string[];
  multipliers?: DropMultipliers;
  difficulty?: "Easy" | "Advanced" | "Nightmare";
}

export interface HeroSim {
  id: string;
  x: number;
  y: number;
  name: string;
  class: string;
  rarity: string;
  cosmetics?: Record<string, string | null>;
  hp: number;
  maxHp: number;
  alive: boolean;
  bombCooldown: number;
  moveCooldown: number;
  // ─── Energy ────────────────────────────────────────────
  energy: number;
  max_energy: number;
  // ─── Stats ──────────────────────────────────────────────
  power: number;              // bomb damage, alien damage, destruction speed
  defense: number;            // damage reduction, survival rate
  speed: number;              // movement, loot/bomb placement/escape speed
  intelligence: number;       // AI decision, pathfinding, farming efficiency, hazard avoidance
  luck: number;               // equipment drops, rare loot, event rewards
  vitality: number;           // HP, energy pool, stamina recovery
  // ─── AI Stats ──────────────────────────────────────────
  learning_rate: number;
  adaptability: number;
  risk_awareness: number;
  exploration: number;
  aggression: number;
  // ─── Runtime State ────────────────────────────────────
  currentAction?: string;
  // ─── Farming Stats ─────────────────────────────────────
  mining: number;
  scavenging: number;
  auto_deploy?: boolean;
  treasure_hunter: number;
  efficiency: number;
  // ─── Personality ───────────────────────────────────────
  brave: number;
  greedy: number;
  curious: number;
  loyal: number;
  lazy: number;
  tactical: number;
  // ─── Traits ────────────────────────────────────────────
  traits: string[];
  // ─── Tracked ───────────────────────────────────────────
  memories: Memory[];
  kills: number;
  blocksBroken: number;
  lootCollected: number;
  potionsFound: number;
  tilesExplored: number;
  damageDealt: number;
  damageTaken: number;
  // ─── Anti-Idle / Stuck Detection ───────────────────────
  positionHistory: { x: number; y: number; tick: number }[];
  lastAction: string;
  stuckTicks: number;
  searchTarget: { x: number; y: number } | null;
}

export interface EnemySim {
  id: string;
  x: number;
  y: number;
  type: string;
  hp: number;
  maxHp: number;
  moveTimer: number;
}

interface BombSim {
  x: number;
  y: number;
  timer: number;
  range: number;
  ownerId: string;
  damage: number;
}

interface LootSim {
  x: number;
  y: number;
  type: "power" | "range" | "hp";
}

const ENEMY_TYPES: Record<string, { hp: number; speed: number; color: number; xp: number; damage: number }> = {
  Crawler: { hp: 1, speed: 500, color: 0x4a0404, xp: 20, damage: 1 },
  Spitter: { hp: 1, speed: 600, color: 0x2d5a27, xp: 25, damage: 1 },
  Burrower: { hp: 2, speed: 700, color: 0x5c4033, xp: 30, damage: 1 },
  Hunter: { hp: 3, speed: 350, color: 0x1a1a4a, xp: 50, damage: 2 },
  "Hive Guard": { hp: 4, speed: 400, color: 0x6a0dad, xp: 70, damage: 2 },
  "Void Beast": { hp: 5, speed: 450, color: 0x2d006e, xp: 90, damage: 2 },
  Titan: { hp: 6, speed: 500, color: 0x8b4513, xp: 110, damage: 3 },
  "Lava Titan": { hp: 12, speed: 600, color: 0xff2200, xp: 500, damage: 4 },
  "Hive Queen": { hp: 10, speed: 650, color: 0x9b30ff, xp: 450, damage: 3 },
  "Ancient Guardian": { hp: 15, speed: 700, color: 0x00ffaa, xp: 600, damage: 4 },
  "Void Dragon": { hp: 20, speed: 550, color: 0x4400ff, xp: 800, damage: 5 },
};

export function createGameState(
  heroes: Hero[],
  multipliers?: DropMultipliers,
  difficulty?: "Easy" | "Advanced" | "Nightmare"
): GameState {
  const dc = difficulty ? {
    blockPercent: difficulty === "Nightmare" ? 1.2 : difficulty === "Advanced" ? 1.1 : 1,
    enemyMin: difficulty === "Nightmare" ? 7 : difficulty === "Advanced" ? 5 : 3,
    enemyMax: difficulty === "Nightmare" ? 10 : difficulty === "Advanced" ? 8 : 5,
    enemyHpBonus: difficulty === "Nightmare" ? 2 : difficulty === "Advanced" ? 1 : 0,
  } : { blockPercent: 1, enemyMin: 4, enemyMax: 7, enemyHpBonus: 0 };
  const grid = generateGrid(dc.blockPercent);
  const enemies = generateEnemies(grid, dc.enemyMin, dc.enemyMax, dc.enemyHpBonus);
  const heroSims = spawnHeroes(heroes, grid);

  const prePlacedItems: { x: number; y: number }[] = [];
  const itemCandidateCells: { x: number; y: number }[] = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if ((grid[y][x] === TileType.Empty || grid[y][x] === TileType.Destructible) && !(x < 4 && y < 4)) {
        itemCandidateCells.push({ x, y });
      }
    }
  }
  const itemCount = 3 + Math.floor(Math.random() * 6);
  for (let i = 0; i < itemCount && itemCandidateCells.length > 0; i++) {
    const idx = Math.floor(Math.random() * itemCandidateCells.length);
    prePlacedItems.push(itemCandidateCells[idx]);
    itemCandidateCells.splice(idx, 1);
  }

  return {
    grid, heroes: heroSims, enemies, bombs: [], loot: [],
    prePlacedItems,
    tick: 0, logs: [], multipliers, difficulty,
  };
}

export function generateEnemies(grid: TileType[][], enemyMin = 4, enemyMax = 7, hpBonus = 0): EnemySim[] {
  const enemyCount = enemyMin + Math.floor(Math.random() * (enemyMax - enemyMin + 1));
  const enemies: EnemySim[] = [];
  const bossTypes = ["Lava Titan", "Hive Queen", "Ancient Guardian", "Void Dragon"];
  const regularTypes = Object.keys(ENEMY_TYPES).filter(t => !bossTypes.includes(t));
  const hasBoss = Math.random() < 0.3;
  let bossType = "";
  if (hasBoss) {
    bossType = bossTypes[Math.floor(Math.random() * bossTypes.length)];
  }

  for (let i = 0; i < enemyCount; i++) {
    let x: number, y: number;
    do {
      x = Math.floor(Math.random() * (COLS - 2)) + 1;
      y = Math.floor(Math.random() * (ROWS - 2)) + 1;
    } while (grid[y][x] !== TileType.Empty || (x < 3 && y < 3));

    const isBoss = hasBoss && i === enemyCount - 1;
    const type = (isBoss ? bossType : regularTypes[i % regularTypes.length]) as keyof typeof ENEMY_TYPES;
    const def = ENEMY_TYPES[type];
    enemies.push({
      id: `enemy_${i}`,
      x, y, type,
      hp: def.hp + hpBonus, maxHp: def.hp + hpBonus,
      moveTimer: 0,
    });
  }
  return enemies;
}

export function spawnHeroes(heroes: Hero[], grid: TileType[][]): HeroSim[] {
  const spawnCells: { x: number; y: number }[] = [];
  for (let y = 1; y <= 3; y++) {
    for (let x = 1; x <= 3; x++) {
      if (grid[y]?.[x] === TileType.Empty) {
        spawnCells.push({ x, y });
      }
    }
  }
  for (let i = spawnCells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [spawnCells[i], spawnCells[j]] = [spawnCells[j], spawnCells[i]];
  }

  return heroes.map((h, i) => {
    const cell = i < spawnCells.length ? spawnCells[i] : { x: 1 + Math.floor(Math.random() * 3), y: 1 + Math.floor(Math.random() * 3) };
    const baseHp = 3 + Math.floor(h.stats.vitality / 20);
    // Apply trait bonuses to effective stats
    const effectiveStats: Record<string, number> = { ...h.stats };
    for (const traitName of h.traits || []) {
      const def = TRAIT_DEFINITIONS[traitName];
      if (def) {
        for (const [k, bonus] of Object.entries(def.bonus)) {
          if (k in effectiveStats) effectiveStats[k] = Math.min(100, (effectiveStats[k] || 0) + bonus);
        }
      }
    }
    return {
      id: h.id,
      x: cell.x, y: cell.y,
      name: h.name,
      class: h.class,
      rarity: h.rarity,
      hp: baseHp,
      maxHp: baseHp,
      energy: h.energy,
      max_energy: h.max_energy,
      alive: true,
      bombCooldown: 0,
      moveCooldown: 0,
      positionHistory: [],
      lastAction: "spawn",
      stuckTicks: 0,
      searchTarget: null,
      power: effectiveStats.power,
      defense: effectiveStats.defense,
      speed: effectiveStats.speed,
      intelligence: effectiveStats.intelligence,
      luck: effectiveStats.luck,
      vitality: effectiveStats.vitality,
      learning_rate: h.ai_stats.learning_rate,
      adaptability: h.ai_stats.adaptability,
      risk_awareness: h.ai_stats.risk_awareness,
      exploration: h.ai_stats.exploration,
      aggression: h.ai_stats.aggression,
      mining: h.farming_stats.mining,
      scavenging: h.farming_stats.scavenging,
      treasure_hunter: h.farming_stats.treasure_hunter,
      efficiency: h.farming_stats.efficiency,
      brave: h.personality.brave,
      greedy: h.personality.greedy,
      curious: h.personality.curious,
      loyal: h.personality.loyal,
      lazy: h.personality.lazy,
      tactical: h.personality.tactical,
      traits: h.traits || [],
      memories: h.memories || [],
      kills: 0,
      blocksBroken: 0,
      lootCollected: 0,
      potionsFound: 0,
      tilesExplored: 0,
      damageDealt: 0,
      damageTaken: 0,
      cosmetics: h.cosmetics || undefined,
      auto_deploy: h.auto_deploy,
    };
  });
}

export function calculateMapProgress(grid: TileType[][], enemies: EnemySim[], originalDestructibleCount: number): number {
  const blocksRemaining = grid.flat().filter(t => t === TileType.Destructible).length;
  const destroyed = Math.max(0, originalDestructibleCount - blocksRemaining);
  const totalEnemies = enemies.length;
  const deadEnemies = enemies.filter(e => e.hp <= 0).length;
  if (originalDestructibleCount === 0 && totalEnemies === 0) return 100;
  const blockProgress = originalDestructibleCount > 0 ? destroyed / originalDestructibleCount : 0;
  const enemyProgress = totalEnemies > 0 ? deadEnemies / totalEnemies : 0;
  return Math.round((blockProgress * 0.3 + enemyProgress * 0.7) * 100);
}

export function countDestructibleTiles(grid: TileType[][]): number {
  return grid.flat().filter(t => t === TileType.Destructible).length;
}

function generateGrid(blockPercent = 1): TileType[][] {
  const grid: TileType[][] = [];
  for (let y = 0; y < ROWS; y++) {
    grid[y] = [];
    for (let x = 0; x < COLS; x++) {
      if (x === 0 || y === 0 || x === COLS - 1 || y === ROWS - 1) {
        grid[y][x] = TileType.SolidWall;
      } else if (x % 2 === 0 && y % 2 === 0) {
        grid[y][x] = TileType.SolidWall;
      } else if (x < 4 && y < 4) {
        grid[y][x] = TileType.Empty;
      } else {
        const r = Math.random();
        if (r < 0.3 * blockPercent) grid[y][x] = TileType.Destructible;
        else if (r < 0.33) grid[y][x] = TileType.Lava;
        else grid[y][x] = TileType.Empty;
      }
    }
  }
  return grid;
}

// ─── AI Decision Engine ───────────────────────────────────────

export function tickGame(state: GameState, tickMs: number): GameState {
  if (state.heroes.every(h => !h.alive)) return state;

  state.tick++;

  // Energy drain — every 10 ticks, drain 1 energy per hero
  if (state.tick % 10 === 0) {
    for (const hero of state.heroes) {
      if (!hero.alive) continue;
      hero.energy = Math.max(0, hero.energy - 1);
    }
  }

  // Heroes act
  for (const hero of state.heroes) {
    if (!hero.alive) continue;

    hero.bombCooldown = Math.max(0, hero.bombCooldown - tickMs);

    const speedFactor = Math.max(0.3, hero.speed / 100);
    const effectiveTick = Math.floor(tickMs * (0.5 + speedFactor));
    hero.moveCooldown = Math.max(0, hero.moveCooldown - effectiveTick);

    if (hero.moveCooldown > 0) continue;

    // ─── Stuck Recovery ──────────────────────────────────
    if (hero.searchTarget && hero.x === hero.searchTarget.x && hero.y === hero.searchTarget.y) {
      hero.searchTarget = null;
    }

    const threats = scanThreats(state, hero);
    const opportunities = scanOpportunities(state, hero);
    const action = decideAction(hero, threats, opportunities, state);
    hero.currentAction = action;
    executeAction(state, hero, action, tickMs);

    // Reset move cooldown based on speed
    hero.moveCooldown = Math.floor(300 * (1 - hero.speed / 150));
  }

  // Enemies move
  for (const enemy of state.enemies) {
    if (enemy.hp <= 0) continue;
    enemy.moveTimer -= tickMs;
    if (enemy.moveTimer <= 0) {
      const def = ENEMY_TYPES[enemy.type as keyof typeof ENEMY_TYPES];
      enemy.moveTimer = def.speed + Math.random() * 300;
      const dir = Math.floor(Math.random() * 4);
      const dx = [0, 0, -1, 1][dir];
      const dy = [-1, 1, 0, 0][dir];
      const nx = enemy.x + dx;
      const ny = enemy.y + dy;
      if (
        nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS &&
        state.grid[ny][nx] === TileType.Empty &&
        !state.bombs.some(b => b.x === nx && b.y === ny) &&
        !state.enemies.some(e => e.id !== enemy.id && e.x === nx && e.y === ny)
      ) {
        enemy.x = nx;
        enemy.y = ny;
      }
      for (const hero of state.heroes) {
        if (hero.alive && hero.x === enemy.x && hero.y === enemy.y) {
          const rawDamage = def.damage || 1;
          const reduced = Math.max(1, rawDamage - Math.floor(hero.defense / 20));
          hero.hp -= reduced;
          hero.damageTaken += reduced;
          state.logs.push(`${hero.name} took ${reduced} damage from ${enemy.type}! (def: ${hero.defense})`);
          if (hero.hp <= 0) {
            hero.alive = false;
            state.logs.push(`${hero.name} has fallen!`);
          }
        }
      }
    }
  }

  // Update bombs
  for (let i = state.bombs.length - 1; i >= 0; i--) {
    const bomb = state.bombs[i];
    bomb.timer -= tickMs;
    if (bomb.timer <= 0) {
      explodeBomb(state, bomb, state.multipliers);
      state.bombs.splice(i, 1);
    }
  }

  return state;
}

function scanThreats(state: GameState, hero: HeroSim) {
  const threats: string[] = [];
  const riskAwareness = hero.risk_awareness;
  const detectRange = 2 + Math.floor(riskAwareness / 25);

  for (const enemy of state.enemies) {
    if (enemy.hp <= 0) continue;
    const dist = Math.abs(enemy.x - hero.x) + Math.abs(enemy.y - hero.y);
    if (dist <= detectRange) threats.push("enemy_nearby");
    if (dist <= 1) threats.push("enemy_adjacent");
  }

  for (const bomb of state.bombs) {
    const dist = Math.abs(bomb.x - hero.x) + Math.abs(bomb.y - hero.y);
    const escapeTime = Math.max(500, 2000 - hero.speed * 10);
    if (dist <= bomb.range && bomb.timer < escapeTime) {
      threats.push("bomb_imminent");
    }
  }

  for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
    const nx = hero.x + dx;
    const ny = hero.y + dy;
    if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS && state.grid[ny][nx] === TileType.Lava) {
      if (riskAwareness > 20) threats.push("lava_adjacent");
    }
  }

  return threats;
}

function scanOpportunities(state: GameState, hero: HeroSim) {
  const ops: string[] = [];
  const int = hero.intelligence;
  const bombRange = getEffectiveBombRange(hero);

  for (const enemy of state.enemies) {
    if (enemy.hp <= 0) continue;
    const dist = Math.abs(enemy.x - hero.x) + Math.abs(enemy.y - hero.y);
    if (dist <= bombRange) ops.push("enemy_bombable");
  }

  for (const loot of state.loot) {
    const dist = Math.abs(loot.x - hero.x) + Math.abs(loot.y - hero.y);
    if (dist <= 2 + Math.floor(hero.speed / 30)) ops.push("loot_nearby");
  }

  for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
    const nx = hero.x + dx;
    const ny = hero.y + dy;
    if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS && state.grid[ny][nx] === TileType.Destructible) {
      ops.push("wall_nearby");
      break;
    }
  }

  // Unexplored tiles nearby
  const exploreRange = 2 + Math.floor(hero.exploration / 20);
  for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
    const nx = hero.x + dx * exploreRange;
    const ny = hero.y + dy * exploreRange;
    if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS && state.grid[ny][nx] === TileType.Destructible) {
      ops.push("unexplored_nearby");
      break;
    }
  }

  return ops;
}

function getEffectiveBombRange(hero: HeroSim): number {
  return 2 + Math.floor(hero.intelligence / 25);
}

function getBombDamage(hero: HeroSim): number {
  return 1 + Math.floor(hero.power / 20);
}

function canEscapeBlast(state: GameState, hero: HeroSim, bombRange: number): boolean {
  const speedBonus = Math.floor(hero.speed / 20);
  const escapeDist = 1 + speedBonus;
  const blastCells = new Set<string>();
  const dirs = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]];
  for (const [ddx, ddy] of dirs) {
    for (let r = 0; r <= bombRange; r++) {
      const ex = hero.x + ddx * r;
      const ey = hero.y + ddy * r;
      if (ex < 0 || ex >= COLS || ey < 0 || ey >= ROWS) break;
      if (state.grid[ey][ex] === TileType.SolidWall) break;
      blastCells.add(`${ex},${ey}`);
      if (state.grid[ey][ex] === TileType.Destructible) break;
    }
  }
  const visited = new Set<string>();
  const queue: [number, number, number][] = [[hero.x, hero.y, 0]];
  visited.add(`${hero.x},${hero.y}`);
  while (queue.length > 0) {
    const [cx, cy, dist] = queue.shift()!;
    if (dist > 0 && !blastCells.has(`${cx},${cy}`)) return true;
    if (dist >= escapeDist) continue;
    for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
      const nx = cx + dx, ny = cy + dy, nk = `${nx},${ny}`;
      if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS || visited.has(nk)) continue;
      if (state.grid[ny][nx] === TileType.SolidWall || state.grid[ny][nx] === TileType.Destructible) continue;
      if (state.enemies.some(e => e.hp > 0 && e.x === nx && e.y === ny)) continue;
      if (state.bombs.some(b => b.x === nx && b.y === ny)) continue;
      if (state.grid[ny][nx] === TileType.Lava) continue;
      visited.add(nk);
      queue.push([nx, ny, dist + 1]);
    }
  }
  return false;
}

function wouldBombHitTarget(state: GameState, hero: HeroSim, bombRange: number): boolean {
  const dirs = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]];
  for (const [ddx, ddy] of dirs) {
    for (let r = 0; r <= bombRange; r++) {
      const ex = hero.x + ddx * r, ey = hero.y + ddy * r;
      if (ex < 0 || ex >= COLS || ey < 0 || ey >= ROWS) break;
      if (state.grid[ey][ex] === TileType.SolidWall) break;
      if (state.enemies.some(e => e.hp > 0 && e.x === ex && e.y === ey)) return true;
      if (state.grid[ey][ex] === TileType.Destructible) return true;
    }
  }
  return false;
}

function calculateTeamCenter(state: GameState): { x: number; y: number } {
  const alive = state.heroes.filter(h => h.alive);
  if (alive.length === 0) return { x: 0, y: 0 };
  return {
    x: alive.reduce((s, h) => s + h.x, 0) / alive.length,
    y: alive.reduce((s, h) => s + h.y, 0) / alive.length,
  };
}

type ActionKey = "bomb" | "collect_loot" | "explore" | "evade" | "avoid_lava" | "idle" | "wander" | "seek";

function scoreAction(hero: HeroSim, action: ActionKey, threats: string[], opportunities: string[], state: GameState): number {
  const int = hero.intelligence;
  const intMod = (int - 50) / 50; // -1 to +1
  const diff = state.difficulty || "Easy";

  // Difficulty adjustments
  const diffAggMod = diff === "Easy" ? 10 : diff === "Nightmare" ? -5 : 0;
  const diffRiskMod = diff === "Easy" ? -10 : diff === "Nightmare" ? 15 : 0;
  const diffIntMod = diff === "Nightmare" ? 0.3 : diff === "Advanced" ? 0.1 : 0;

  // Memory counts for modifiers
  const lavaMemCount = hero.memories.filter(m => m.event === "Touched Lava" || m.event === "Survived Lava").length;
  const nearDeathCount = hero.memories.filter(m => m.event === "Near Death Escape").length;
  const killedCount = hero.memories.filter(m => m.event === "Killed Alien").length;
  const bossKillCount = hero.memories.filter(m => m.event === "Boss Kill").length;
  const trapDeathCount = hero.memories.filter(m => m.event === "Died To Trap").length;

  // Team center for loyalty-based scoring
  const teamCenter = calculateTeamCenter(state);
  const distToTeam = Math.abs(hero.x - teamCenter.x) + Math.abs(hero.y - teamCenter.y);

  const bombRange = getEffectiveBombRange(hero);
  const canBomb = hero.bombCooldown <= 0 && wouldBombHitTarget(state, hero, bombRange);
  const canEscape = canEscapeBlast(state, hero, bombRange);

  let score = 0;

  switch (action) {
    case "bomb": {
      score = 50;
      // Intelligence: smarter heroes bomb more effectively
      score += intMod * 15 + (int > 60 ? 10 : int < 30 ? -10 : 0);
      // Personality
      score += hero.brave * 0.3 + diffAggMod;
      score += hero.aggression * 0.2 + diffAggMod * 0.5;
      score -= hero.lazy * 0.25;
      score -= hero.risk_awareness * 0.15 + diffRiskMod * 0.1;
      // Tactical bonus
      score += hero.tactical * 0.1;
      // Traits
      if (hero.traits.includes("Bomb Expert")) score += 25;
      if (hero.traits.includes("Bomb Master")) score += 15;
      if (hero.traits.includes("Alien Slayer")) score += 10;
      // Memory — killed by trap makes cautious about close-range bombs
      score -= trapDeathCount * 8;
      // Near-death experience reduces bombing recklessness
      score -= nearDeathCount * 5;
      // Opportunities / threats
      if (opportunities.includes("enemy_bombable")) score += 25;
      if (opportunities.includes("wall_nearby")) score += 15;
      if (threats.includes("enemy_adjacent")) score += 30;
      if (killedCount > 3) score += 10; // confident from past kills
      if (bossKillCount > 0) score += 15; // boss killers are bold
      // Cannot bomb checks
      if (hero.bombCooldown > 0) score -= 999;
      if (!canBomb) score -= 80;
      if (!canEscape && hero.risk_awareness > 40) score -= 50;
      if (!canEscape && nearDeathCount > 2) score -= 40;
      break;
    }

    case "collect_loot": {
      score = 40;
      score += intMod * 5;
      score += hero.greedy * 0.4;
      score += hero.curious * 0.1;
      score -= hero.lazy * 0.1;
      // Traits
      if (hero.traits.includes("Loot Goblin")) score += 25;
      if (hero.traits.includes("Treasure Hunter")) score += 15;
      if (hero.traits.includes("Speed Demon")) score += 5;
      // Memory — past rare loot makes hero prioritize loot
      const rareLootMemories = hero.memories.filter(m => m.event === "Found Rare Loot" || m.event === "Found Legendary Item").length;
      score += rareLootMemories * 8;
      // Only if loot is nearby
      if (!opportunities.includes("loot_nearby")) score -= 40;
      // Danger reduces loot priority
      if (threats.includes("enemy_adjacent")) score -= hero.risk_awareness * 0.3;
      if (threats.includes("lava_adjacent")) score -= hero.risk_awareness * 0.2;
      break;
    }

    case "explore": {
      score = 30 + (100 - hero.intelligence) * 0.1; // low int explores more randomly
      score += intMod * 5;
      score += hero.curious * 0.35;
      score += hero.exploration * 0.2;
      score -= hero.lazy * 0.2;
      score += hero.brave * 0.05;
      // Traits
      if (hero.traits.includes("Explorer")) score += 25;
      if (hero.traits.includes("Speed Demon")) score += 10;
      // Unexplored nearby
      if (opportunities.includes("unexplored_nearby")) score += 20;
      // Danger reduces exploration
      if (threats.includes("enemy_adjacent") && hero.brave < 40) score -= 25;
      if (threats.includes("lava_adjacent") && lavaMemCount > 0) score -= 20;
      break;
    }

    case "evade": {
      score = 20;
      score += intMod * 15; // smarter = better at evading
      score += hero.risk_awareness * 0.3 + diffRiskMod * 0.3;
      score += hero.lazy * 0.1;
      score -= hero.brave * 0.3;
      score -= hero.aggression * 0.25;
      // Traits
      if (hero.traits.includes("Survivor")) score += 25;
      // Memory — near death makes more cautious
      score += nearDeathCount * 12;
      score += trapDeathCount * 10;
      // Only relevant when threats exist
      if (threats.includes("enemy_adjacent") || threats.includes("bomb_imminent")) {
        score += 40;
      } else {
        score -= 30; // no point evading with no threat
      }
      break;
    }

    case "avoid_lava": {
      score = 10;
      score += hero.risk_awareness * 0.35 + diffRiskMod * 0.3;
      score += intMod * 10;
      score += hero.tactical * 0.1;
      // Memory — lava trauma
      score += lavaMemCount * 18;
      score += trapDeathCount * 5;
      // Traits
      if (hero.traits.includes("Lava Survivor")) score += 10;
      if (hero.traits.includes("Survivor")) score += 10;
      // Only when lava adjacent
      if (threats.includes("lava_adjacent")) {
        score += 35;
      } else {
        score -= 40;
      }
      break;
    }

    case "seek": {
      score = 45;
      score += intMod * 10;
      score += hero.brave * 0.3 + hero.aggression * 0.2;
      score += hero.tactical * 0.2;
      score -= hero.lazy * 0.2;
      score -= hero.risk_awareness * 0.1;
      if (hero.traits.includes("Alien Slayer")) score += 15;
      if (hero.traits.includes("Speed Demon")) score += 10;
      if (threats.includes("enemy_nearby") || opportunities.includes("enemy_bombable")) score += 30;
      else score -= 15;
      break;
    }

    case "idle": {
      score = 5;
      score += (100 - hero.aggression) * 0.05;
      score += (100 - hero.brave) * 0.05;
      // Energy: low energy → prefer idle (especially for smart heroes)
      const energyPct = hero.energy / hero.max_energy;
      if (energyPct < 0.2) {
        score += 10 + intMod * 5; // smart heroes conserve when low on energy
      } else if (energyPct < 0.4) {
        score += 5 + intMod * 3;
      }
      // Nothing to do
      if (opportunities.length === 0 && threats.length === 0 && Math.random() < 0.3) score += 15;
      break;
    }

    case "wander": {
      score = 20;
      score += (100 - hero.intelligence) * 0.15; // low int wanders more
      score += hero.curious * 0.1;
      score -= hero.lazy * 0.25;
      score += hero.exploration * 0.05;
      if (opportunities.includes("unexplored_nearby")) score += 5;
      // Danger — brave heroes wander into danger, careful ones don't
      if (threats.includes("enemy_adjacent")) score += hero.brave * 0.1;
      if (threats.includes("enemy_adjacent")) score -= hero.risk_awareness * 0.15;
      break;
    }
  }

  // ─── Team loyalty modifier ────────────────────────────────
  if (hero.loyal > 60) {
    if (distToTeam > 4) score -= hero.loyal * 0.15;
    if (distToTeam > 7) score -= hero.loyal * 0.2;
    // Bonus for sticking with team when exploring
    if (action === "explore" && distToTeam < 3) score += hero.loyal * 0.1;
  } else if (hero.loyal < 30) {
    // Lone wolves explore more
    if (action === "explore") score += (30 - hero.loyal) * 0.3;
  }

  // ─── Intelligence boost for all actions on harder difficulties ─
  score += int * diffIntMod * (action === "bomb" || action === "evade" ? 1.5 : 1);

  // ─── Random noise for variety (5%) ─────────────────────────
  score += (Math.random() - 0.5) * score * 0.1;

  return Math.max(-999, Math.round(score));
}

function decideAction(hero: HeroSim, threats: string[], opportunities: string[], state: GameState): string {
  const actions: ActionKey[] = ["seek", "bomb", "collect_loot", "explore", "evade", "avoid_lava", "idle", "wander"];
  let bestAction: ActionKey = "explore";
  let bestScore = -Infinity;

  for (const action of actions) {
    const s = scoreAction(hero, action, threats, opportunities, state);
    if (s > bestScore) {
      bestScore = s;
      bestAction = action;
    }
  }

  return bestAction;
}

function executeAction(state: GameState, hero: HeroSim, action: string, _tickMs: number) {
  switch (action) {
    case "bomb":
      placeBomb(state, hero);
      break;
    case "evade": {
      const liveEnemies = state.enemies.filter(e => e.hp > 0);
      const avgX = liveEnemies.length > 0 ? liveEnemies.reduce((s, e) => s + e.x, 0) / liveEnemies.length : hero.x;
      const avgY = liveEnemies.length > 0 ? liveEnemies.reduce((s, e) => s + e.y, 0) / liveEnemies.length : hero.y;
      const allDirs = [[0, -1], [0, 1], [-1, 0], [1, 0]].sort((a, b) => {
        const da = Math.abs(hero.x + a[0] - avgX) + Math.abs(hero.y + a[1] - avgY);
        const db = Math.abs(hero.x + b[0] - avgX) + Math.abs(hero.y + b[1] - avgY);
        return db - da;
      });
      for (const [dx, dy] of allDirs) {
        if (tryMoveHero(state, hero, dx, dy)) return;
      }
      break;
    }
    case "avoid_lava": {
      for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
        const nx = hero.x + dx;
        const ny = hero.y + dy;
        if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS && state.grid[ny][nx] === TileType.Empty) {
          if (tryMoveHero(state, hero, dx, dy)) return;
        }
      }
      break;
    }
    case "collect_loot": {
      const loot = state.loot.find(l => Math.abs(l.x - hero.x) + Math.abs(l.y - hero.y) <= 2 + Math.floor(hero.speed / 30));
      if (loot) {
        const dx = Math.sign(loot.x - hero.x);
        const dy = Math.sign(loot.y - hero.y);
        if (dx !== 0 && dy !== 0) {
          if (!tryMoveHero(state, hero, dx, 0)) tryMoveHero(state, hero, 0, dy);
        } else if (dx !== 0) tryMoveHero(state, hero, dx, 0);
        else if (dy !== 0) tryMoveHero(state, hero, 0, dy);
        else {
          state.loot = state.loot.filter(l => l !== loot);
          hero.lootCollected++;
          if (loot.type === "power") hero.power = Math.min(100, hero.power + 2);
          else if (loot.type === "range") hero.intelligence = Math.min(100, hero.intelligence + 2);
          state.logs.push(`${hero.name} collected ${loot.type} upgrade!`);
        }
      }
      break;
    }
    case "explore": {
      const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
      const shuffled = dirs.sort(() => Math.random() - 0.5);
      // Higher curiosity = more directional changes
      if (hero.curious > 50) {
        shuffled.sort(() => Math.random() - 0.5);
      }
      for (const [dx, dy] of shuffled) {
        if (tryMoveHero(state, hero, dx, dy)) {
          hero.tilesExplored++;
          return;
        }
      }
      if (hero.bombCooldown <= 0) placeBomb(state, hero);
      break;
    }
    case "wander": {
      const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
      const shuffled = dirs.sort(() => Math.random() - 0.5);
      for (const [dx, dy] of shuffled) {
        if (tryMoveHero(state, hero, dx, dy)) return;
      }
      if (hero.bombCooldown <= 0) placeBomb(state, hero);
      break;
    }
    case "seek": {
      const liveEnemies = state.enemies.filter(e => e.hp > 0);
      if (liveEnemies.length > 0) {
        let nearest = liveEnemies[0];
        let minDist = Math.abs(nearest.x - hero.x) + Math.abs(nearest.y - hero.y);
        for (const e of liveEnemies) {
          const d = Math.abs(e.x - hero.x) + Math.abs(e.y - hero.y);
          if (d < minDist) { minDist = d; nearest = e; }
        }
        const allDirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        allDirs.sort((a, b) => {
          const da = Math.abs(hero.x + a[0] - nearest.x) + Math.abs(hero.y + a[1] - nearest.y);
          const db = Math.abs(hero.x + b[0] - nearest.x) + Math.abs(hero.y + b[1] - nearest.y);
          return da - db;
        });
        for (const [ddx, ddy] of allDirs) {
          if (tryMoveHero(state, hero, ddx, ddy)) return;
        }
      }
      // Fallback: explore if seek can't move
      const edirs = [[0, -1], [0, 1], [-1, 0], [1, 0]].sort(() => Math.random() - 0.5);
      for (const [dx, dy] of edirs) {
        if (tryMoveHero(state, hero, dx, dy)) { hero.tilesExplored++; return; }
      }
      if (hero.bombCooldown <= 0) placeBomb(state, hero);
      break;
    }
    case "idle": {
      // Slow wander — hero moves occasionally even when conserving energy
      if (Math.random() < 0.4) {
        const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]].sort(() => Math.random() - 0.5);
        for (const [dx, dy] of dirs) {
          if (tryMoveHero(state, hero, dx, dy)) { hero.tilesExplored++; break; }
        }
      }
      if (hero.bombCooldown <= 0 && Math.random() < 0.3) placeBomb(state, hero);
      break;
    }
  }
}

function tryMoveHero(state: GameState, hero: HeroSim, dx: number, dy: number): boolean {
  const nx = hero.x + dx;
  const ny = hero.y + dy;
  if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) return false;
  if (state.grid[ny][nx] === TileType.SolidWall || state.grid[ny][nx] === TileType.Destructible) return false;
  if (state.bombs.some(b => b.x === nx && b.y === ny)) return false;
  if (state.enemies.some(e => e.hp > 0 && e.x === nx && e.y === ny)) return false;

  if (state.grid[ny][nx] === TileType.Lava) {
    const lavaDmg = Math.max(1, 2 - Math.floor(hero.defense / 25));
    hero.hp -= lavaDmg;
    hero.damageTaken += lavaDmg;
    state.logs.push(`${hero.name} stepped on lava! (${lavaDmg} dmg)`);
    if (hero.hp <= 0) {
      hero.alive = false;
      state.logs.push(`${hero.name} died to lava!`);
    }
    return false;
  }

  hero.x = nx;
  hero.y = ny;

  const loot = state.loot.find(l => l.x === nx && l.y === ny);
  if (loot) {
    state.loot = state.loot.filter(l => l !== loot);
    hero.lootCollected++;
    state.logs.push(`${hero.name} picked up ${loot.type}!`);
  }

  const itemIdx = (state.prePlacedItems || []).findIndex(p => p.x === nx && p.y === ny);
  if (itemIdx !== -1) {
    state.prePlacedItems!.splice(itemIdx, 1);
    hero.lootCollected++;
    state.logs.push(`${hero.name} found hidden treasure!`);
  }

  return true;
}

function placeBomb(state: GameState, hero: HeroSim) {
  if (hero.bombCooldown > 0) return;
  if (state.bombs.some(b => b.x === hero.x && b.y === hero.y)) return;

  const range = getEffectiveBombRange(hero);
  const damage = getBombDamage(hero);
  const placeSpeed = Math.max(200, 1500 - hero.speed * 10);

  state.bombs.push({
    x: hero.x,
    y: hero.y,
    timer: Math.max(1000, 2000 - hero.speed * 5),
    range,
    ownerId: hero.id,
    damage,
  });

  hero.bombCooldown = placeSpeed;
  state.logs.push(`${hero.name} placed a bomb (range:${range} dmg:${damage})`);
}

function explodeBomb(state: GameState, bomb: BombSim, multipliers?: DropMultipliers) {
  const dirs = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]];
  const equipRate = multipliers?.equipmentDropRate ?? 1;
  const currencyRate = multipliers?.currencyDropRate ?? 1;
  const owner = state.heroes.find(h => h.id === bomb.ownerId);

  for (const [ddx, ddy] of dirs) {
    for (let r = 0; r <= bomb.range; r++) {
      const ex = bomb.x + ddx * r;
      const ey = bomb.y + ddy * r;
      if (ex < 0 || ex >= COLS || ey < 0 || ey >= ROWS) break;
      if (state.grid[ey][ex] === TileType.SolidWall) break;

      if (state.grid[ey][ex] === TileType.Destructible) {
        state.grid[ey][ex] = TileType.Empty;
        if (owner) {
          owner.blocksBroken++;
          const hiddenItemIdx = (state.prePlacedItems || []).findIndex(p => p.x === ex && p.y === ey);
          if (hiddenItemIdx !== -1) {
            state.prePlacedItems!.splice(hiddenItemIdx, 1);
            owner.lootCollected++;
            state.logs.push(`${owner.name} found hidden treasure!`);
          }
        }
        state.logs.push(`Block destroyed!`);
        if (Math.random() < BATTLE_DROPS.powerUpFromBlock * equipRate) {
          state.loot.push({
            x: ex, y: ey,
            type: BATTLE_DROPS.powerUpTypes[Math.floor(Math.random() * BATTLE_DROPS.powerUpTypes.length)],
          });
        }
        break;
      }

      // Damage enemies - influenced by hero power stat
      for (const enemy of state.enemies) {
        if (enemy.hp > 0 && enemy.x === ex && enemy.y === ey) {
          const dmg = bomb.damage;
          enemy.hp -= dmg;
          if (owner) owner.damageDealt += dmg;
          if (enemy.hp <= 0) {
            if (owner) {
              owner.kills++;
              state.logs.push(`${owner.name} killed ${enemy.type}! (dmg:${dmg})`);
              if (Math.random() < BATTLE_DROPS.potionFromKill * currencyRate) {
                owner.potionsFound++;
                state.logs.push(`${owner.name} found energy potion!`);
              }
            }
          }
        }
      }

      // Damage heroes - reduced by defense
      for (const hero of state.heroes) {
        if (hero.alive && hero.x === ex && hero.y === ey && hero.id !== bomb.ownerId) {
          const rawDmg = Math.max(1, bomb.damage - Math.floor(hero.defense / 15));
          hero.hp -= rawDmg;
          hero.damageTaken += rawDmg;
          if (hero.hp <= 0) {
            hero.alive = false;
            state.logs.push(`${hero.name} was caught in explosion! (dmg:${rawDmg})`);
          }
        }
      }
    }
  }
}

export function getGameResult(state: GameState) {
  const totalEnemies = state.enemies.length;
  const deadEnemies = state.enemies.filter(e => e.hp <= 0).length;
  const allCleared = deadEnemies === totalEnemies;
  const totalScore = state.heroes.reduce((s, h) => s + h.kills * 50 + h.blocksBroken * 10 + h.tilesExplored * 5, 0);

  const bossTypes = ["Lava Titan", "Hive Queen", "Ancient Guardian", "Void Dragon"];
  const bossKilled = state.enemies.some(e => bossTypes.includes(e.type) && e.hp <= 0);

  return {
    totalScore,
    allCleared,
    bossKilled,
    heroResults: state.heroes.map(h => ({
      id: h.id,
      kills: h.kills,
      blocksBroken: h.blocksBroken,
      lootCollected: h.lootCollected,
      potionsFound: h.potionsFound,
      survived: h.alive,
      damageDealt: h.damageDealt,
      damageTaken: h.damageTaken,
      tilesExplored: h.tilesExplored,
    })),
    logs: state.logs,
    ticks: state.tick,
  };
}
