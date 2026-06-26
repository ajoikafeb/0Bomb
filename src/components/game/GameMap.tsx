"use client";

import type { GameState } from "@/lib/game/AIDecisionEngine";
import type { Explosion } from "./types";
import { renderHero, renderEnemy, renderBoss, renderBomb, renderExplosion, renderLoot, renderSolidWall, renderDestructible, renderLava, renderCrystal } from "@/lib/game/sprites";
import { getBehaviorLabel, getBehaviorColor } from "@/lib/game/HeroAISystem";

const CELL = 36;
const PAD = 2;

function HeroBreathing({ duration = 2.5 }: { duration?: number }) {
  return (
    <animateTransform
      attributeName="transform"
      type="scale"
      values="1,1;1.03,1.03;1,1"
      dur={`${duration}s`}
      repeatCount="indefinite"
      additive="sum"
    />
  );
}

function LootGlow({ type }: { type: string }) {
  const color = type === "power" ? "#ff8c00" : type === "range" ? "#22c55e" : "#ef4444";
  return (
    <>
      <animate attributeName="opacity" values="0.6;1;0.6" dur="1.2s" repeatCount="indefinite" />
      <circle cx={0} cy={0} r={5} fill={color} opacity={0.15}>
        <animate attributeName="r" values="5;7;5" dur="1.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.15;0.05;0.15" dur="1.2s" repeatCount="indefinite" />
      </circle>
    </>
  );
}

function BombPulse() {
  return (
    <>
      <animate attributeName="opacity" values="0.3;1;0.3" dur="0.8s" repeatCount="indefinite" />
      <circle cx={0} cy={0} r={6} fill="none" stroke="#ff4444" strokeWidth={0.5} opacity={0.4}>
        <animate attributeName="r" values="6;9;6" dur="0.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.4;0;0.4" dur="0.8s" repeatCount="indefinite" />
      </circle>
    </>
  );
}

function ExplosionShockwave({ px, py }: { px: number; py: number }) {
  return (
    <circle cx={px} cy={py} r={4} fill="none" stroke="#ff8800" strokeWidth={1.5} opacity={0.6}>
      <animate attributeName="r" values="4;24" dur="0.35s" fill="freeze" />
      <animate attributeName="opacity" values="0.6;0" dur="0.35s" fill="freeze" />
      <animate attributeName="strokeWidth" values="2;0.5" dur="0.35s" fill="freeze" />
    </circle>
  );
}

function SparkParticles({ cx, cy }: { cx: number; cy: number }) {
  const spikes = 6;
  const parts: React.ReactNode[] = [];
  for (let i = 0; i < spikes; i++) {
    const angle = (i / spikes) * Math.PI * 2;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    parts.push(
      <line key={i} x1={cx} y1={cy} x2={cx} y2={cy} stroke="#ffcc00" strokeWidth={1} opacity={0.8}>
        <animate attributeName="x2" values={`${cx};${cx + dx * 16}`} dur="0.3s" fill="freeze" />
        <animate attributeName="y2" values={`${cy};${cy + dy * 16}`} dur="0.3s" fill="freeze" />
        <animate attributeName="opacity" values="0.8;0" dur="0.3s" fill="freeze" />
      </line>
    );
  }
  return <g>{parts}</g>;
}

function PrePlacedItemGlow() {
  return (
    <>
      <circle cx={0} cy={0} r={4} fill="#ffd700" opacity={0.6}>
        <animate attributeName="r" values="4;6;4" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx={0} cy={0} r={8} fill="none" stroke="#ffd700" strokeWidth={0.5} opacity={0.3}>
        <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0.05;0.3" dur="2s" repeatCount="indefinite" />
      </circle>
    </>
  );
}

function BehaviorTag({ label, color }: { label: string; color: string }) {
  return (
    <rect x={-12} y={10} width={24} height={5} rx={1.5} fill="#000" fillOpacity={0.5} />
  );
}

export function GameMap({ gameState, explosions }: { gameState: GameState; explosions: Explosion[] }) {
  const cw = CELL;
  const ch = CELL;
  const gridRows = gameState.grid?.length || 17;
  const gridCols = gameState.grid[0]?.length || 21;
  const mapW = gridCols * (CELL + PAD) + PAD;
  const mapH = gridRows * (CELL + PAD) + PAD;

  const elements: React.ReactNode[] = [];

  for (let y = 0; y < gameState.grid.length; y++) {
    for (let x = 0; x < gameState.grid[y].length; x++) {
      const tile = gameState.grid[y][x];
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

  // Loot with glow
  for (const loot of gameState.loot) {
    const px = loot.x * (cw + PAD) + PAD + cw / 2;
    const py = loot.y * (ch + PAD) + PAD + ch / 2;
    elements.push(
      <g key={`loot-${loot.x}-${loot.y}`}>
        <LootGlow type={loot.type} />
        {renderLoot(px, py, loot.type)}
      </g>
    );
  }

  // Pre-placed items with floating animation
  for (const item of gameState.prePlacedItems || []) {
    const px = item.x * (cw + PAD) + PAD + cw / 2;
    const py = item.y * (ch + PAD) + PAD + ch / 2;
    elements.push(
      <g key={`pre-${item.x}-${item.y}`}>
        <PrePlacedItemGlow />
        <circle cx={px} cy={py} r={3} fill="#ffd700" opacity={0.8}>
          <animate attributeName="cy" values={`${py};${py - 1};${py}`} dur="1.8s" repeatCount="indefinite" />
        </circle>
        <circle cx={px} cy={py} r={1.5} fill="#fff" opacity={0.6} />
      </g>
    );
  }

  // Bombs with pulse
  for (const bomb of gameState.bombs) {
    const px = bomb.x * (cw + PAD) + PAD + cw / 2;
    const py = bomb.y * (ch + PAD) + PAD + ch / 2;
    elements.push(
      <g key={`bomb-${bomb.x}-${bomb.y}`}>
        <g style={{ transform: `translate(${px}px, ${py}px)` }}>
          <BombPulse />
          {renderBomb(0, 0)}
        </g>
      </g>
    );
  }

  // Explosions with shockwave + particles
  for (const exp of explosions) {
    const px = exp.x * (cw + PAD) + PAD + cw / 2;
    const py = exp.y * (ch + PAD) + PAD + ch / 2;
    elements.push(
      <g key={exp.id}>
        <ExplosionShockwave px={px} py={py} />
        <SparkParticles cx={px} cy={py} />
        {renderExplosion(px, py)}
      </g>
    );
  }

  // Enemies
  for (const enemy of gameState.enemies) {
    if (enemy.hp <= 0) continue;
    const px = enemy.x * (cw + PAD) + PAD + cw / 2;
    const py = enemy.y * (ch + PAD) + PAD + ch / 2;
    const isBoss = ["Lava Titan", "Hive Queen", "Ancient Guardian", "Void Dragon"].includes(enemy.type);
    const hpPct = enemy.hp / enemy.maxHp;
    elements.push(
      <g key={`enemy-${enemy.id}`} style={{ transition: 'transform 0.08s linear', transform: `translate(${px}px, ${py}px)` }}>
        {isBoss ? renderBoss(0, 0, enemy.type) : renderEnemy(0, 0, enemy.type)}
        <circle cx={0} cy={0} r={isBoss ? 10 : 6} fill="none" stroke="#ff4444" strokeWidth={1} opacity={0.35} />
        <rect x={-6} y={isBoss ? -14 : -8} width={12} height={2} fill="#333" rx={1} />
        <rect x={-6} y={isBoss ? -14 : -8} width={12 * hpPct} height={2} fill={hpPct > 0.5 ? "#44ff44" : "#ff4444"} rx={1} />
      </g>
    );
  }

  // Heroes with all effects
  for (const hero of gameState.heroes) {
    if (!hero.alive) continue;
    const px = hero.x * (cw + PAD) + PAD + cw / 2;
    const py = hero.y * (ch + PAD) + PAD + ch / 2;
    const hpPct = hero.hp / Math.max(1, hero.maxHp);
    const hSim = hero as any;
    const behavior = getBehaviorLabel(hero);
    const behaviorColor = getBehaviorColor(behavior);
    const isMoving = hero.currentAction && hero.currentAction !== "idle" && hero.currentAction !== "spawn";

    elements.push(
      <g key={`hero-${hero.id}`} style={{ transition: 'transform 0.12s linear', transform: `translate(${px}px, ${py}px)` }}>
        {/* Idle breathing */}
        <HeroBreathing duration={isMoving ? 1.5 : 2.5} />

        {/* Hero glow pulse */}
        <circle cx={0} cy={0} r={9} fill="#22d3ee" opacity={0.1}>
          <animate attributeName="opacity" values="0.1;0.2;0.1" dur={isMoving ? "1s" : "2s"} repeatCount="indefinite" />
        </circle>

        {renderHero(0, 0, hero.class)}

        {/* Cosmetic aura */}
        {hSim.cosmetics?.Aura && (
          <circle cx={0} cy={0} r={14} fill="none" stroke="#a855f7" strokeWidth={1.5} opacity={0.5}>
            <animate attributeName="r" values="14;16;14" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0.2;0.5" dur="1.5s" repeatCount="indefinite" />
          </circle>
        )}

        {/* Cosmetic trail */}
        {hSim.cosmetics?.Trail && (
          <>
            <circle cx={-6} cy={4} r={3} fill="#22d3ee" opacity={0.4}>
              <animate attributeName="opacity" values="0.4;0;0.4" dur="0.6s" repeatCount="indefinite" />
            </circle>
            <circle cx={-4} cy={-5} r={2} fill="#22d3ee" opacity={0.3}>
              <animate attributeName="opacity" values="0.3;0;0.3" dur="0.8s" repeatCount="indefinite" />
            </circle>
          </>
        )}

        {/* Cosmetic helmet */}
        {hSim.cosmetics?.Helmet && (
          <rect x={-4} y={-11} width={8} height={4} fill="#f59e0b" rx={1} opacity={0.6} />
        )}

        {/* HP bar */}
        <rect x={-6} y={-11} width={12} height={2} fill="#333" rx={1} />
        <rect x={-6} y={-11} width={12 * hpPct} height={2} fill={hpPct > 0.5 ? "#44ff44" : hpPct > 0.25 ? "#ffaa00" : "#ff4444"} rx={1} />

        {/* Name */}
        <text x={0} y={-13} fill="#22d3ee" fontSize="5" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
          {hero.name.length > 6 ? hero.name.slice(0, 6) : hero.name}
        </text>

        {/* Behavior label */}
        <text x={0} y={14} fill={behaviorColor.split("text-")[1]?.replace("text-", "") || "#888"} fontSize="4.5" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
          {behavior}
        </text>
      </g>
    );
  }

  return (
    <svg width={mapW} height={mapH} viewBox={`0 0 ${mapW} ${mapH}`} style={{ maxWidth: "100%", maxHeight: "100%" }}>
      {elements}
    </svg>
  );
}
