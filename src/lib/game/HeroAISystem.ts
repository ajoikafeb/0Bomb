import type { GameState, HeroSim } from "@/lib/game/AIDecisionEngine";

// ─── Behavior display labels ─────────────────────────────────
export type BehaviorStatus =
  | "Attacking"
  | "Escaping"
  | "Collecting Loot"
  | "Exploring"
  | "Helping Ally"
  | "Returning"
  | "Waiting"
  | "Searching"
  | "Idle";

const ACTION_TO_BEHAVIOR: Record<string, BehaviorStatus> = {
  seek: "Attacking",
  bomb: "Attacking",
  collect_loot: "Collecting Loot",
  explore: "Exploring",
  evade: "Escaping",
  avoid_lava: "Escaping",
  idle: "Idle",
  wander: "Searching",
  return_base: "Returning",
  help_ally: "Helping Ally",
};

export function getBehaviorLabel(hero: HeroSim): BehaviorStatus {
  const action = hero.currentAction || "idle";
  return ACTION_TO_BEHAVIOR[action] || "Searching";
}

export function getBehaviorColor(status: BehaviorStatus): string {
  switch (status) {
    case "Attacking": return "text-red-400";
    case "Escaping": return "text-yellow-300";
    case "Collecting Loot": return "text-green-400";
    case "Exploring": return "text-cyan-300";
    case "Helping Ally": return "text-purple-400";
    case "Returning": return "text-blue-300";
    case "Waiting": return "text-gray-400";
    case "Searching": return "text-orange-300";
    case "Idle": return "text-gray-500";
    default: return "text-gray-400";
  }
}

// ─── Anti-stuck system ───────────────────────────────────────
const STUCK_THRESHOLD_TICKS = 6;

function detectAntiStuck(hero: HeroSim): boolean {
  if (!hero.positionHistory || hero.positionHistory.length < STUCK_THRESHOLD_TICKS) return false;

  const recent = hero.positionHistory.slice(-STUCK_THRESHOLD_TICKS);
  const samePos = recent.every(
    (p) => p.x === hero.x && p.y === hero.y
  );

  if (samePos && hero.currentAction !== "idle") {
    hero.stuckTicks = (hero.stuckTicks || 0) + 1;
  } else {
    hero.stuckTicks = 0;
  }

  return (hero.stuckTicks || 0) >= STUCK_THRESHOLD_TICKS;
}

function recoverStuck(hero: HeroSim, state: GameState) {
  hero.searchTarget = findNearestWalkable(hero, state);
  hero.currentAction = "wander";
  hero.stuckTicks = 0;
  hero.moveCooldown = 0;
  state.logs.push(`${hero.name} was stuck — recovering!`);
}

function findNearestWalkable(hero: HeroSim, state: GameState): { x: number; y: number } | null {
  const range = 4;
  let best: { x: number; y: number } | null = null;
  let bestDist = Infinity;
  for (let dy = -range; dy <= range; dy++) {
    for (let dx = -range; dx <= range; dx++) {
      const nx = hero.x + dx;
      const ny = hero.y + dy;
      if (nx < 0 || nx >= 21 || ny < 0 || ny >= 17) continue;
      if (state.grid[ny][nx] !== 0) continue;
      if (state.bombs.some((b) => b.x === nx && b.y === ny)) continue;
      if (state.enemies.some((e) => e.hp > 0 && e.x === nx && e.y === ny)) continue;
      if (nx === hero.x && ny === hero.y) continue;
      const dist = Math.abs(nx - hero.x) + Math.abs(ny - hero.y);
      if (dist < bestDist) {
        bestDist = dist;
        best = { x: nx, y: ny };
      }
    }
  }
  return best;
}

// ─── Priority-based targeting ────────────────────────────────
export interface PriorityTarget {
  type: "enemy" | "rare_loot" | "epic_loot" | "chest" | "loot" | "destructible" | "explore" | "ally" | "base";
  x: number;
  y: number;
  priority: number;
  targetId?: string;
}

function scanPriorityTargets(hero: HeroSim, state: GameState): PriorityTarget[] {
  const targets: PriorityTarget[] = [];
  const scanRange = 8;
  const bombRange = 2 + Math.floor(hero.intelligence / 25);

  // 1. Enemy threatening hero (adjacent = highest priority)
  for (const enemy of state.enemies) {
    if (enemy.hp <= 0) continue;
    const dist = Math.abs(enemy.x - hero.x) + Math.abs(enemy.y - hero.y);
    if (dist <= 1) {
      targets.push({ type: "enemy", x: enemy.x, y: enemy.y, priority: 1000 - dist, targetId: enemy.id });
    }
  }

  // 2. Bombable enemy nearby
  for (const enemy of state.enemies) {
    if (enemy.hp <= 0) continue;
    const dist = Math.abs(enemy.x - hero.x) + Math.abs(enemy.y - hero.y);
    if (dist <= bombRange + 2 && dist > 1) {
      targets.push({ type: "enemy", x: enemy.x, y: enemy.y, priority: 500 - dist, targetId: enemy.id });
    }
  }

  // 3. Rare loot (prioritize by type — scanning for items on the map is implicit via loot tiles)
  for (const loot of state.loot) {
    const dist = Math.abs(loot.x - hero.x) + Math.abs(loot.y - hero.y);
    if (dist <= scanRange) {
      targets.push({ type: "loot", x: loot.x, y: loot.y, priority: 300 - dist });
    }
  }

  // 4. Pre-placed items (hidden treasure = "chests")
  for (const item of state.prePlacedItems || []) {
    const dist = Math.abs(item.x - hero.x) + Math.abs(item.y - hero.y);
    if (dist <= scanRange) {
      targets.push({ type: "chest", x: item.x, y: item.y, priority: 250 - dist });
    }
  }

  // 5. Breakable wall nearby
  for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
    const nx = hero.x + dx, ny = hero.y + dy;
    if (nx >= 0 && nx < 21 && ny >= 0 && ny < 17 && state.grid[ny][nx] === 2) {
      targets.push({ type: "destructible", x: nx, y: ny, priority: 200 });
      break;
    }
  }

  // 6. Unexplored area
  const exploreDir = findUnexploredDirection(hero, state);
  if (exploreDir) {
    targets.push({ type: "explore", x: exploreDir.x, y: exploreDir.y, priority: 150 });
  }

  // 7. Help ally (nearby hero with enemy adjacent)
  for (const ally of state.heroes) {
    if (ally.id === hero.id || !ally.alive) continue;
    const dist = Math.abs(ally.x - hero.x) + Math.abs(ally.y - hero.y);
    if (dist <= 4) {
      const allyThreatened = state.enemies.some(
        (e) => e.hp > 0 && Math.abs(e.x - ally.x) + Math.abs(e.y - ally.y) <= 1
      );
      if (allyThreatened && hero.loyal > 40) {
        targets.push({ type: "ally", x: ally.x, y: ally.y, priority: 130 - dist });
      }
    }
  }

  // 8. Explore unknown
  if (targets.length === 0) {
    const randomDir = Math.floor(Math.random() * 4);
    const ddx = [0, 0, -1, 1][randomDir];
    const ddy = [-1, 1, 0, 0][randomDir];
    const nx = hero.x + ddx * 3, ny = hero.y + ddy * 3;
    if (nx >= 0 && nx < 21 && ny >= 0 && ny < 17) {
      targets.push({ type: "explore", x: nx, y: ny, priority: 100 });
    }
  }

  return targets.sort((a, b) => b.priority - a.priority);
}

function findUnexploredDirection(hero: HeroSim, state: GameState): { x: number; y: number } | null {
  for (let r = 2; r <= 5; r++) {
    for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
      const nx = hero.x + dx * r, ny = hero.y + dy * r;
      if (nx < 0 || nx >= 21 || ny < 0 || ny >= 17) continue;
      if (state.grid[ny][nx] === 2 || state.grid[ny][nx] === 0) return { x: nx, y: ny };
    }
  }
  return null;
}

// ─── Main AI heartbeat enhancer ─────────────────────────────
export function processAIHeartbeat(state: GameState): GameState {
  for (const hero of state.heroes) {
    if (!hero.alive) continue;

    // Update position history
    if (!hero.positionHistory) hero.positionHistory = [];
    hero.positionHistory.push({ x: hero.x, y: hero.y, tick: state.tick });
    if (hero.positionHistory.length > 10) hero.positionHistory.shift();

    // Anti-stuck detection
    if (detectAntiStuck(hero)) {
      recoverStuck(hero, state);
      continue;
    }

    // If hero is idling with no threat/opportunity, give them a priority target
    const currentAction = hero.currentAction || "";
    if (currentAction === "idle" || currentAction === "wander") {
      const targets = scanPriorityTargets(hero, state);
      if (targets.length > 0 && targets[0].priority > 150) {
        const t = targets[0];
        if (t.type === "enemy") {
          hero.currentAction = "seek";
        } else if (t.type === "loot" || t.type === "chest") {
          hero.currentAction = "collect_loot";
        } else if (t.type === "destructible") {
          hero.currentAction = "bomb";
        }
        hero.moveCooldown = 0;
      }
    }
  }

  return state;
}

// ─── Dynamic retargeting ─────────────────────────────────────
export function handleTargetDisappeared(hero: HeroSim, state: GameState): boolean {
  const action = hero.currentAction;
  if (action === "seek") {
    const hasEnemies = state.enemies.some((e) => e.hp > 0);
    if (!hasEnemies) {
      hero.currentAction = "explore";
      hero.moveCooldown = 0;
      return true;
    }
  }
  if (action === "collect_loot") {
    const hasLoot = state.loot.length > 0;
    if (!hasLoot) {
      hero.currentAction = "explore";
      hero.moveCooldown = 0;
      return true;
    }
  }
  return false;
}

// ─── Utility ─────────────────────────────────────────────────
export function isMovementBlocked(hero: HeroSim, state: GameState): boolean {
  const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
  for (const [dx, dy] of dirs) {
    const nx = hero.x + dx, ny = hero.y + dy;
    if (nx < 0 || nx >= 21 || ny < 0 || ny >= 17) continue;
    if (state.grid[ny][nx] === 0 &&
        !state.bombs.some((b) => b.x === nx && b.y === ny) &&
        !state.enemies.some((e) => e.hp > 0 && e.x === nx && e.y === ny)) {
      return false;
    }
  }
  return true;
}
