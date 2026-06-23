import type { ReactNode } from "react";

type Palette = Record<number, string>;

interface SpriteDef {
  w: number;
  h: number;
  data: number[][];
  palette: Palette;
}

function renderSprite(sx: number, sy: number, sprite: SpriteDef, scale: number = 1): ReactNode[] {
  const { w, h, data, palette } = sprite;
  const els: ReactNode[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const c = data[y][x];
      if (c === 0) continue;
      const color = palette[c];
      if (!color) continue;
      els.push(
        <rect key={`${sx}-${sy}-${x}-${y}`} x={sx + x * scale} y={sy + y * scale} width={scale} height={scale} fill={color} />
      );
    }
  }
  return els;
}

// === Hero Sprites (7x7, 2px scale = 14x14) ===
function heroSprite(color: string): SpriteDef {
  return {
    w: 7, h: 7,
    data: [
      [0,0,0,1,0,0,0],
      [0,0,1,1,1,0,0],
      [0,1,1,1,1,1,0],
      [0,0,0,2,0,0,0],
      [0,0,1,1,1,0,0],
      [0,1,0,1,0,1,0],
      [0,0,0,1,0,0,0],
    ],
    palette: { 1: color, 2: "#fff" },
  };
}

const HERO_COLORS: Record<string, string> = {
  Engineer: "#4a90d9", Scout: "#7ed321", Marine: "#d0021b",
  Scientist: "#9b59b6", Medic: "#2ecc71", Commander: "#f5a623", Miner: "#8b4513",
};

export function renderHero(cx: number, cy: number, heroClass: string): ReactNode[] {
  const color = HERO_COLORS[heroClass] || "#22d3ee";
  return renderSprite(cx - 7, cy - 7, heroSprite(color), 2);
}

// === Enemy Sprites (5x5, 2px scale = 10x10) ===
const ENEMY_SPRITES: Record<string, SpriteDef> = {
  Crawler: {
    w: 5, h: 5,
    data: [
      [0,1,0,1,0],
      [1,0,1,0,1],
      [0,1,1,1,0],
      [1,0,0,0,1],
      [0,0,0,0,0],
    ],
    palette: { 1: "#8b0000" },
  },
  Spitter: {
    w: 5, h: 5,
    data: [
      [0,0,1,0,0],
      [0,2,1,2,0],
      [1,1,1,1,1],
      [0,0,1,0,0],
      [0,0,0,0,0],
    ],
    palette: { 1: "#2d5a27", 2: "#aaff00" },
  },
  Burrower: {
    w: 5, h: 5,
    data: [
      [0,0,1,0,0],
      [0,1,0,1,0],
      [1,1,1,1,1],
      [0,0,1,0,0],
      [0,0,0,0,0],
    ],
    palette: { 1: "#5c4033" },
  },
  Hunter: {
    w: 5, h: 5,
    data: [
      [1,0,1,0,1],
      [0,2,0,2,0],
      [0,1,1,1,0],
      [0,1,0,1,0],
      [0,0,0,0,0],
    ],
    palette: { 1: "#1a1a6e", 2: "#ff4444" },
  },
  "Hive Guard": {
    w: 5, h: 5,
    data: [
      [0,2,1,2,0],
      [1,0,1,0,1],
      [0,1,1,1,0],
      [0,1,0,1,0],
      [0,1,0,1,0],
    ],
    palette: { 1: "#6a0dad", 2: "#ffcc00" },
  },
  "Void Beast": {
    w: 5, h: 5,
    data: [
      [1,0,1,0,1],
      [0,2,0,2,0],
      [1,0,2,0,1],
      [0,1,0,1,0],
      [0,0,1,0,0],
    ],
    palette: { 1: "#2d006e", 2: "#00ffff" },
  },
  Titan: {
    w: 5, h: 5,
    data: [
      [0,1,0,1,0],
      [1,1,1,1,1],
      [0,0,2,0,0],
      [0,1,0,1,0],
      [0,1,0,1,0],
    ],
    palette: { 1: "#8b4513", 2: "#ff6600" },
  },
};

export function renderEnemy(cx: number, cy: number, type: string): ReactNode[] {
  const sprite = ENEMY_SPRITES[type];
  if (sprite) return renderSprite(cx - 5, cy - 5, sprite, 2);
  // Fallback: simple rect
  return [<rect key="efb" x={cx - 3} y={cy - 3} width={6} height={6} fill="#8b0000" rx={1} />];
}

// === Boss Sprites (7x7, 2px scale = 14x14) ===
const BOSS_SPRITES: Record<string, SpriteDef> = {
  "Lava Titan": {
    w: 7, h: 7,
    data: [
      [0,0,1,1,1,0,0],
      [0,1,2,2,2,1,0],
      [1,2,0,2,0,2,1],
      [1,2,3,2,3,2,1],
      [0,1,2,3,2,1,0],
      [0,0,1,2,1,0,0],
      [0,0,0,1,0,0,0],
    ],
    palette: { 1: "#8b4513", 2: "#ff4500", 3: "#ffff00" },
  },
  "Hive Queen": {
    w: 7, h: 7,
    data: [
      [0,0,0,1,0,0,0],
      [0,1,0,1,0,1,0],
      [1,0,1,2,1,0,1],
      [0,1,2,3,2,1,0],
      [0,0,1,2,1,0,0],
      [0,0,0,1,0,0,0],
      [0,0,1,0,1,0,0],
    ],
    palette: { 1: "#6a0dad", 2: "#ffcc00", 3: "#ff0066" },
  },
  "Ancient Guardian": {
    w: 7, h: 7,
    data: [
      [1,0,0,1,0,0,1],
      [0,1,0,1,0,1,0],
      [0,0,2,2,2,0,0],
      [1,1,2,3,2,1,1],
      [0,0,2,2,2,0,0],
      [0,1,0,0,0,1,0],
      [0,1,0,0,0,1,0],
    ],
    palette: { 1: "#2d5a27", 2: "#556b2f", 3: "#00ff00" },
  },
  "Void Dragon": {
    w: 7, h: 7,
    data: [
      [0,0,1,0,0,0,1],
      [0,1,0,1,0,1,0],
      [1,0,2,0,2,0,0],
      [0,1,2,3,2,1,0],
      [0,0,2,0,2,0,0],
      [0,1,0,1,0,1,0],
      [1,0,0,1,0,0,0],
    ],
    palette: { 1: "#2d006e", 2: "#00ffff", 3: "#ff0066" },
  },
};

export function renderBoss(cx: number, cy: number, type: string): ReactNode[] {
  const sprite = BOSS_SPRITES[type];
  if (sprite) return renderSprite(cx - 7, cy - 7, sprite, 2);
  return [<rect key="bfb" x={cx - 5} y={cy - 5} width={10} height={10} fill="#ff0066" rx={1} />];
}

// === Bomb Sprite with animated fuse and sparks (7x7, 2px scale = 14x14) ===
const BOMB_SPRITE: SpriteDef = {
  w: 7, h: 7,
  data: [
    [0,0,0,1,0,0,0],
    [0,0,1,1,1,0,0],
    [0,1,1,2,1,1,0],
    [1,1,2,3,2,1,1],
    [0,1,1,2,1,1,0],
    [0,0,1,1,1,0,0],
    [0,0,0,1,0,0,0],
  ],
  palette: { 1: "#444", 2: "#666", 3: "#ff4400" },
};

export function renderBomb(cx: number, cy: number): ReactNode[] {
  const els = renderSprite(cx - 7, cy - 7, BOMB_SPRITE, 2);
  els.push(
    <line key="fuse" x1={cx + 2} y1={cy - 7} x2={cx + 4} y2={cy - 12} stroke="#a0522d" strokeWidth={1.5} strokeLinecap="round" />,
    <circle key="spark" cx={cx + 4} cy={cy - 13} r={2} fill="#ff4400">
      <animate attributeName="opacity" values="1;0.3;1" dur="0.4s" repeatCount="indefinite" />
    </circle>,
    <circle key="spark2" cx={cx + 5} cy={cy - 14} r={1} fill="#ffaa00">
      <animate attributeName="opacity" values="0.8;0;0.8" dur="0.25s" repeatCount="indefinite" />
    </circle>,
    <circle key="glow" cx={cx} cy={cy} r={8} fill="none" stroke="#ff4400" strokeWidth={0.5} opacity={0.4}>
      <animate attributeName="r" values="8;10;8" dur="0.6s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.4;0.15;0.4" dur="0.6s" repeatCount="indefinite" />
    </circle>,
  );
  return els;
}

// === Explosion Effects (static burst, rendered 1 tick) ===
export function renderExplosion(cx: number, cy: number): ReactNode[] {
  // Each particle at angle/distance/color/size. Static render — the flash comes
  // from the element appearing then disappearing on the next tick.
  const parts: { a: number; d: number; c: string; s: number }[] = [
    { a: 0, d: 14, c: '#ff6600', s: 2.5 },
    { a: Math.PI * 0.25, d: 12, c: '#ffaa00', s: 2 },
    { a: Math.PI * 0.5, d: 16, c: '#ff4400', s: 3 },
    { a: Math.PI * 0.75, d: 12, c: '#ffcc00', s: 1.5 },
    { a: Math.PI, d: 15, c: '#ff2200', s: 2.5 },
    { a: Math.PI * 1.25, d: 11, c: '#ff8800', s: 2 },
    { a: Math.PI * 1.5, d: 17, c: '#ff6600', s: 3 },
    { a: Math.PI * 1.75, d: 11, c: '#ffaa00', s: 1.5 },
  ];
  const els: ReactNode[] = [
    // Shockwave ring
    <circle key="shock" cx={cx} cy={cy} r={16} fill="none" stroke="#ff880088" strokeWidth={2} />,
    // Inner flash
    <circle key="flash" cx={cx} cy={cy} r={10} fill="#ffffff88" />,
    // Core fire
    <circle key="core" cx={cx} cy={cy} r={7} fill="#ff4400cc" />,
    // Directional fire particles
    ...parts.map((p, i) => (
      <circle key={`p${i}`} cx={cx + Math.cos(p.a) * p.d} cy={cy + Math.sin(p.a) * p.d}
        r={p.s} fill={p.c} opacity={0.8} />
    )),
    // Smoke puffs
    <circle key="s1" cx={cx - 5} cy={cy - 6} r={3} fill="#66666666" />,
    <circle key="s2" cx={cx + 6} cy={cy - 5} r={3} fill="#55555566" />,
  ];
  return els;
}

// === Loot Sprites (3x3, 2px scale = 6x6) ===
const LOOT_SPRITES: Record<string, SpriteDef> = {
  power: {
    w: 3, h: 3,
    data: [
      [0,1,0],
      [1,1,1],
      [0,1,0],
    ],
    palette: { 1: "#ff6600" },
  },
  range: {
    w: 3, h: 3,
    data: [
      [1,0,1],
      [0,1,0],
      [1,0,1],
    ],
    palette: { 1: "#00ff00" },
  },
  hp: {
    w: 3, h: 3,
    data: [
      [1,0,1],
      [0,1,0],
      [0,0,1],
    ],
    palette: { 1: "#ff4444" },
  },
};

export function renderLoot(cx: number, cy: number, type: string): ReactNode[] {
  const sprite = LOOT_SPRITES[type];
  if (sprite) return renderSprite(cx - 3, cy - 3, sprite, 2);
  return [<circle key="lfb" cx={cx} cy={cy} r={3} fill="#ff6600" />];
}

// === Tile Sprites ===
export function renderSolidWall(px: number, py: number, cw: number, ch: number): ReactNode[] {
  return [
    <rect key="wbg" x={px} y={py} width={cw} height={ch} fill="#1a1a3e" stroke="#2a2a5e" strokeWidth={0.5} rx={1} />,
    <line key="w1" x1={px} y1={py + ch * 0.33} x2={px + cw} y2={py + ch * 0.33} stroke="#2a2a5e" strokeWidth={0.5} />,
    <line key="w2" x1={px} y1={py + ch * 0.66} x2={px + cw} y2={py + ch * 0.66} stroke="#2a2a5e" strokeWidth={0.5} />,
    <line key="w3" x1={px + cw * 0.33} y1={py} x2={px + cw * 0.33} y2={py + ch} stroke="#2a2a5e" strokeWidth={0.5} />,
    <line key="w4" x1={px + cw * 0.66} y1={py} x2={px + cw * 0.66} y2={py + ch} stroke="#2a2a5e" strokeWidth={0.5} />,
  ];
}

export function renderDestructible(px: number, py: number, cw: number, ch: number): ReactNode[] {
  return [
    <rect key="dbg" x={px} y={py} width={cw} height={ch} fill="#3a2a1a" stroke="#5a4a2a" strokeWidth={0.5} rx={1} />,
    <rect key="dc1" x={px + 3} y={py + 3} width={cw - 6} height={ch - 6} fill="#4a3a2a" rx={1} />,
    <line key="dc2" x1={px + 2} y1={py + ch / 2} x2={px + cw - 2} y2={py + ch / 2} stroke="#5a4a2a" strokeWidth={0.5} />,
    <line key="dc3" x1={px + cw / 2} y1={py + 2} x2={px + cw / 2} y2={py + ch - 2} stroke="#5a4a2a" strokeWidth={0.5} />,
  ];
}

export function renderLava(px: number, py: number, cw: number, ch: number): ReactNode[] {
  return [
    <rect key="lbg" x={px} y={py} width={cw} height={ch} fill="#4a0a00" rx={2} />,
    <rect key="lg" x={px + 4} y={py + 4} width={cw - 8} height={ch - 8} fill="#ff4500" opacity={0.6} rx={2}>
      <animate attributeName="opacity" values="0.6;0.3;0.6" dur="1s" repeatCount="indefinite" />
    </rect>,
  ];
}

export function renderCrystal(px: number, py: number, cw: number, ch: number): ReactNode[] {
  return [
    <rect key="cbg" x={px} y={py} width={cw} height={ch} fill="#0a1a2e" stroke="#00ffff" strokeWidth={0.5} rx={1} />,
    <polygon key="cry" points={`${px + cw/2},${py + 3} ${px + cw - 3},${py + ch - 3} ${px + 3},${py + ch - 3}`} fill="#00ffff" opacity={0.4} />,
    <polygon key="cry2" points={`${px + cw/2},${py + 5} ${px + cw - 5},${py + ch - 4} ${px + 5},${py + ch - 4}`} fill="#00ffff" opacity={0.2} />,
  ];
}
