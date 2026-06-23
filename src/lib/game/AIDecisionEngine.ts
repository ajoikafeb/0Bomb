import type { Hero, Memory } from "@/lib/game/types";
import { BATTLE_DROPS } from "@/lib/game/dropRates";

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
}

export interface HeroSim {
  id: string;
  x: number;
  y: number;
  name: string;
  class: string;
  rarity: string;
  hp: number;
  alive: boolean;
  bombCooldown: number;
  personality: Record<string, number>;
  intelligence: Record<string, number>;
  memories: Memory[];
  kills: number;
  blocksBroken: number;
  lootCollected: number;
  potionsFound: number;
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
}

interface LootSim {
  x: number;
  y: number;
  type: "power" | "range" | "hp";
}

const ENEMY_TYPES = {
  Crawler: { hp: 1, speed: 500, color: 0x4a0404, xp: 20 },
  Spitter: { hp: 1, speed: 600, color: 0x2d5a27, xp: 25 },
  Burrower: { hp: 2, speed: 700, color: 0x5c4033, xp: 30 },
  Hunter: { hp: 3, speed: 350, color: 0x1a1a4a, xp: 50 },
  "Hive Guard": { hp: 4, speed: 400, color: 0x6a0dad, xp: 70 },
  "Void Beast": { hp: 5, speed: 450, color: 0x2d006e, xp: 90 },
  Titan: { hp: 6, speed: 500, color: 0x8b4513, xp: 110 },
  "Lava Titan": { hp: 12, speed: 600, color: 0xff2200, xp: 500 },
  "Hive Queen": { hp: 10, speed: 650, color: 0x9b30ff, xp: 450 },
  "Ancient Guardian": { hp: 15, speed: 700, color: 0x00ffaa, xp: 600 },
  "Void Dragon": { hp: 20, speed: 550, color: 0x4400ff, xp: 800 },
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

  // Pre-place random items on empty + destructible cells (3-8 per map, positions vary per run)
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
    tick: 0, logs: [], multipliers,
  };
}

function generateEnemies(grid: TileType[][], enemyMin = 4, enemyMax = 7, hpBonus = 0): EnemySim[] {
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

function spawnHeroes(heroes: Hero[], grid: TileType[][]): HeroSim[] {
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
    return {
      id: h.id,
      x: cell.x, y: cell.y,
      name: h.name,
      class: h.class,
      rarity: h.rarity,
      hp: 5,
      alive: true,
      bombCooldown: 0,
      personality: h.personality || {},
      intelligence: h.intelligence || {},
      memories: h.memories || [],
      kills: 0,
      blocksBroken: 0,
      lootCollected: 0,
      potionsFound: 0,
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

// AI Decision Engine
export function tickGame(state: GameState, tickMs: number): GameState {
  if (state.heroes.every(h => !h.alive)) return state;

  state.tick++;

  // Heroes act
  for (const hero of state.heroes) {
    if (!hero.alive) continue;

    hero.bombCooldown = Math.max(0, hero.bombCooldown - tickMs);

    // Sense phase: scan surroundings
    const threats = scanThreats(state, hero);
    const opportunities = scanOpportunities(state, hero);

    // Decide action
    const action = decideAction(hero, threats, opportunities, state);

    // Execute
    executeAction(state, hero, action, tickMs);
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
      // Check collision with hero
      for (const hero of state.heroes) {
        if (hero.alive && hero.x === enemy.x && hero.y === enemy.y) {
          hero.hp--;
          state.logs.push(`${hero.name} took damage from ${enemy.type}!`);
          if (hero.hp <= 0) {
            hero.alive = false;
            state.logs.push(`💀 ${hero.name} has fallen!`);
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

  // Nearby enemies
  for (const enemy of state.enemies) {
    if (enemy.hp <= 0) continue;
    const dist = Math.abs(enemy.x - hero.x) + Math.abs(enemy.y - hero.y);
    if (dist <= 3) threats.push("enemy_nearby");
    if (dist <= 1) threats.push("enemy_adjacent");
  }

  // Bombs about to explode
  for (const bomb of state.bombs) {
    const dist = Math.abs(bomb.x - hero.x) + Math.abs(bomb.y - hero.y);
    if (dist <= bomb.range && bomb.timer < 1500) {
      threats.push("bomb_imminent");
    }
  }

  // Adjacent lava
  for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
    const nx = hero.x + dx;
    const ny = hero.y + dy;
    if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS && state.grid[ny][nx] === TileType.Lava) {
      threats.push("lava_adjacent");
    }
  }

  return threats;
}

function scanOpportunities(state: GameState, hero: HeroSim) {
  const ops: string[] = [];
  const baseRange = 2;
  const intBonus = Math.floor((hero.intelligence?.combat || 20) / 20);
  const bombRange = Math.min(baseRange + intBonus, 5);

  // Enemies in bomb range (use actual bomb range)
  for (const enemy of state.enemies) {
    if (enemy.hp <= 0) continue;
    const dist = Math.abs(enemy.x - hero.x) + Math.abs(enemy.y - hero.y);
    if (dist <= bombRange) ops.push("enemy_bombable");
  }

  // Loot nearby
  for (const loot of state.loot) {
    const dist = Math.abs(loot.x - hero.x) + Math.abs(loot.y - hero.y);
    if (dist <= 2) ops.push("loot_nearby");
  }

  // Destructible in cardinal directions only (bomb blast is 4-dir)
  for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
    const nx = hero.x + dx;
    const ny = hero.y + dy;
    if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS && state.grid[ny][nx] === TileType.Destructible) {
      ops.push("wall_nearby");
      break;
    }
  }

  return ops;
}

// BFS: can hero reach a cell outside the bomb's blast radius within 3 steps?
function canEscapeBlast(state: GameState, hero: HeroSim, bombRange: number): boolean {
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
    if (dist >= 3) continue;
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

// Would a bomb at hero position hit any enemy or destructible block?
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

function decideAction(hero: HeroSim, threats: string[], opportunities: string[], state: GameState): string {
  const agg = hero.personality?.aggressive || 50;
  const careful = hero.personality?.careful || 50;
  const greedy = hero.personality?.greedy || 50;
  const curious = hero.personality?.curious || 50;
  const chaotic = hero.personality?.chaotic || 50;

  // Check memories for modified behavior
  const killedCount = hero.memories.filter(m => m.event === "Killed Alien").length;
  const lavaCount = hero.memories.filter(m => m.event === "Touched Lava").length;

  const baseRange = 2;
  const intBonus = Math.floor((hero.intelligence?.combat || 20) / 20);
  const bombRange = Math.min(baseRange + intBonus, 5);

  // Helper: only bomb if hero can escape AND it would hit something
  const shouldBomb = () => {
    if (hero.bombCooldown > 0) return false;
    if (!canEscapeBlast(state, hero, bombRange)) return false;
    if (!wouldBombHitTarget(state, hero, bombRange)) return false;
    return true;
  };

  // Threat response (highest priority)
  if (threats.includes("bomb_imminent")) return "evade";
  if (threats.includes("enemy_adjacent")) {
    if (shouldBomb()) return "bomb";
    if (agg > 50 && hero.bombCooldown <= 0) return "bomb";
    if (careful > 60) return "evade";
    if (hero.bombCooldown <= 0) return "bomb";
    return "evade";
  }
  if (threats.includes("lava_adjacent")) {
    if (lavaCount > 0 && careful > 30) return "avoid_lava";
    if (careful > 50) return "avoid_lava";
  }

  // Opportunity response — bomb nearby enemies
  if (opportunities.includes("enemy_bombable")) {
    if (shouldBomb()) {
      if ((agg + chaotic) > 60 || Math.random() < 0.7) return "bomb";
    } else if (hero.bombCooldown <= 0 && agg > 65) {
      return "bomb"; // Aggressive heroes bomb even without safe escape
    }
  }

  if (opportunities.includes("loot_nearby") && greedy > 40) return "collect_loot";

  if (opportunities.includes("wall_nearby") && shouldBomb()) {
    if (curious > 40 || Math.random() < 0.4) return "bomb";
  }

  // Default: explore
  if (chaotic > 70) return "wander";
  return "explore";
}

function executeAction(state: GameState, hero: HeroSim, action: string, _tickMs: number) {
  switch (action) {
    case "bomb":
      placeBomb(state, hero);
      break;
    case "evade": {
      // Move away from nearest threat — try all 4 dirs
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
      // Move away from lava
      for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
        const nx = hero.x + dx;
        const ny = hero.y + dy;
        if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS && state.grid[ny][nx] === TileType.Empty) {
          tryMoveHero(state, hero, dx, dy);
          return;
        }
      }
      break;
    }
    case "collect_loot": {
      const loot = state.loot.find(l => Math.abs(l.x - hero.x) + Math.abs(l.y - hero.y) <= 2);
      if (loot) {
        const dx = Math.sign(loot.x - hero.x);
        const dy = Math.sign(loot.y - hero.y);
        if (dx !== 0 && dy !== 0) {
          if (!tryMoveHero(state, hero, dx, 0)) tryMoveHero(state, hero, 0, dy);
        } else if (dx !== 0) tryMoveHero(state, hero, dx, 0);
        else if (dy !== 0) tryMoveHero(state, hero, 0, dy);
        else {
          // Pick up loot
          state.loot = state.loot.filter(l => l !== loot);
          hero.lootCollected++;
          if (loot.type === "power") hero.bombCooldown = -500;
          else if (loot.type === "range") hero.bombCooldown = -500;
          state.logs.push(`📦 ${hero.name} collected ${loot.type} upgrade!`);
        }
      }
      break;
    }
    case "explore": {
      const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
      const shuffled = dirs.sort(() => Math.random() - 0.5);
      for (const [dx, dy] of shuffled) {
        if (tryMoveHero(state, hero, dx, dy)) return;
      }
      // Stuck — try bombing adjacent wall to open path
      if (hero.bombCooldown <= 0) placeBomb(state, hero);
      break;
    }
    case "wander": {
      const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
      const shuffled = dirs.sort(() => Math.random() - 0.5);
      for (const [dx, dy] of shuffled) {
        if (tryMoveHero(state, hero, dx, dy)) return;
      }
      // Stuck — try bombing
      if (hero.bombCooldown <= 0) placeBomb(state, hero);
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

  // Check lava
  if (state.grid[ny][nx] === TileType.Lava) {
    hero.hp -= 2;
    state.logs.push(`🌋 ${hero.name} stepped on lava!`);
    if (hero.hp <= 0) {
      hero.alive = false;
      state.logs.push(`💀 ${hero.name} died to lava!`);
    }
    return false;
  }

  hero.x = nx;
  hero.y = ny;

  // Check if standing on loot
  const loot = state.loot.find(l => l.x === nx && l.y === ny);
  if (loot) {
    state.loot = state.loot.filter(l => l !== loot);
    hero.lootCollected++;
    state.logs.push(`📦 ${hero.name} picked up ${loot.type}!`);
  }

  // Check if standing on pre-placed item
  const itemIdx = (state.prePlacedItems || []).findIndex(p => p.x === nx && p.y === ny);
  if (itemIdx !== -1) {
    state.prePlacedItems!.splice(itemIdx, 1);
    hero.lootCollected++;
    state.logs.push(`🎁 ${hero.name} found hidden treasure!`);
  }

  return true;
}

function placeBomb(state: GameState, hero: HeroSim) {
  if (hero.bombCooldown > 0) return;
  if (state.bombs.some(b => b.x === hero.x && b.y === hero.y)) return;

  const baseRange = 2;
  const intBonus = Math.floor((hero.intelligence?.combat || 20) / 20);
  const range = baseRange + intBonus;

  state.bombs.push({
    x: hero.x,
    y: hero.y,
    timer: 2000,
    range: Math.min(range, 5),
    ownerId: hero.id,
  });

  hero.bombCooldown = 1500;
  state.logs.push(`💣 ${hero.name} placed a bomb (range: ${range})`);
}

function explodeBomb(state: GameState, bomb: BombSim, multipliers?: DropMultipliers) {
  const dirs = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]];
  const equipRate = multipliers?.equipmentDropRate ?? 1;
  const currencyRate = multipliers?.currencyDropRate ?? 1;

  for (const [ddx, ddy] of dirs) {
    for (let r = 0; r <= bomb.range; r++) {
      const ex = bomb.x + ddx * r;
      const ey = bomb.y + ddy * r;
      if (ex < 0 || ex >= COLS || ey < 0 || ey >= ROWS) break;
      if (state.grid[ey][ex] === TileType.SolidWall) break;

      if (state.grid[ey][ex] === TileType.Destructible) {
        state.grid[ey][ex] = TileType.Empty;
        const owner = state.heroes.find(h => h.id === bomb.ownerId);
        if (owner) {
          owner.blocksBroken++;
          // Check if this block had a pre-placed item
          const hiddenItemIdx = (state.prePlacedItems || []).findIndex(p => p.x === ex && p.y === ey);
          if (hiddenItemIdx !== -1) {
            state.prePlacedItems!.splice(hiddenItemIdx, 1);
            owner.lootCollected++;
            state.logs.push(`🎁 ${owner.name} found hidden treasure!`);
          }
        }
        state.logs.push(`🧱 Block destroyed!`);
        // Drop loot chance
        if (Math.random() < BATTLE_DROPS.powerUpFromBlock * equipRate) {
          state.loot.push({
            x: ex, y: ey,
            type: BATTLE_DROPS.powerUpTypes[Math.floor(Math.random() * BATTLE_DROPS.powerUpTypes.length)],
          });
        }
        break;
      }

      // Damage enemies
      for (const enemy of state.enemies) {
        if (enemy.hp > 0 && enemy.x === ex && enemy.y === ey) {
          enemy.hp--;
          if (enemy.hp <= 0) {
            const owner = state.heroes.find(h => h.id === bomb.ownerId);
            if (owner) {
              owner.kills++;
              state.logs.push(`💥 ${owner.name} killed ${enemy.type}!`);
              // Drop energy potion
              if (Math.random() < BATTLE_DROPS.potionFromKill * currencyRate) {
                owner.potionsFound++;
                state.logs.push(`🧪 ${owner.name} found energy potion!`);
              }
            }
          }
        }
      }

      // Damage heroes (friendly fire)
      for (const hero of state.heroes) {
        if (hero.alive && hero.x === ex && hero.y === ey) {
          hero.hp--;
          if (hero.hp <= 0) {
            hero.alive = false;
            state.logs.push(`💀 ${hero.name} was caught in explosion!`);
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
  const totalScore = state.heroes.reduce((s, h) => s + h.kills * 50 + h.blocksBroken * 10, 0);

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
    })),
    logs: state.logs,
    ticks: state.tick,
  };
}
