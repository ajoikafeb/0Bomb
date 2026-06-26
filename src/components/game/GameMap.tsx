"use client";

import type { GameState } from "@/lib/game/AIDecisionEngine";
import type { Explosion } from "./types";
import { renderHero, renderEnemy, renderBoss, renderBomb, renderExplosion, renderLoot, renderSolidWall, renderDestructible, renderLava, renderCrystal } from "@/lib/game/sprites";

const CELL = 36;
const PAD = 2;

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

  for (const loot of gameState.loot) {
    const px = loot.x * (cw + PAD) + PAD + cw / 2;
    const py = loot.y * (ch + PAD) + PAD + ch / 2;
    elements.push(<g key={`loot-${loot.x}-${loot.y}`}>{renderLoot(px, py, loot.type)}</g>);
  }

  for (const item of gameState.prePlacedItems || []) {
    const px = item.x * (cw + PAD) + PAD + cw / 2;
    const py = item.y * (ch + PAD) + PAD + ch / 2;
    elements.push(
      <g key={`pre-${item.x}-${item.y}`}>
        <circle cx={px} cy={py} r={3} fill="#ffd700" opacity={0.8} />
        <circle cx={px} cy={py} r={1.5} fill="#fff" opacity={0.6} />
      </g>
    );
  }

  for (const bomb of gameState.bombs) {
    const px = bomb.x * (cw + PAD) + PAD + cw / 2;
    const py = bomb.y * (ch + PAD) + PAD + ch / 2;
    elements.push(<g key={`bomb-${bomb.x}-${bomb.y}`} opacity={0.5}>{renderBomb(px, py)}</g>);
  }

  for (const exp of explosions) {
    const px = exp.x * (cw + PAD) + PAD + cw / 2;
    const py = exp.y * (ch + PAD) + PAD + ch / 2;
    elements.push(<g key={exp.id}>{renderExplosion(px, py)}</g>);
  }

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

  for (const hero of gameState.heroes) {
    if (!hero.alive) continue;
    const px = hero.x * (cw + PAD) + PAD + cw / 2;
    const py = hero.y * (ch + PAD) + PAD + ch / 2;
    const hpPct = hero.hp / 5;
    const hSim = hero as any;

    elements.push(
      <g key={`hero-${hero.id}`} style={{ transition: 'transform 0.12s linear', transform: `translate(${px}px, ${py}px)` }}>
        {renderHero(0, 0, hero.class)}
        <circle cx={0} cy={0} r={8} fill="#22d3ee" opacity={0.12}>
          <animate attributeName="opacity" values="0.12;0.22;0.12" dur="2s" repeatCount="indefinite" />
        </circle>
        {hSim.cosmetics?.Aura && (
          <circle cx={0} cy={0} r={12} fill="none" stroke="#a855f7" strokeWidth={1} opacity={0.5}>
            <animate attributeName="r" values="12;14;12" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0.2;0.5" dur="1.5s" repeatCount="indefinite" />
          </circle>
        )}
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
        {hSim.cosmetics?.Helmet && (
          <rect x={-4} y={-11} width={8} height={4} fill="#f59e0b" rx={1} opacity={0.6} />
        )}
        <rect x={-6} y={-11} width={12} height={2} fill="#333" rx={1} />
        <rect x={-6} y={-11} width={12 * hpPct} height={2} fill="#44ff44" rx={1} />
        <text x={0} y={-13} fill="#22d3ee" fontSize="5" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
          {hero.name.length > 6 ? hero.name.slice(0, 6) : hero.name}
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
