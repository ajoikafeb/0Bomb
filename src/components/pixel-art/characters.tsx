"use client";

type SpriteProps = { size?: number; className?: string };

// ── Helper ──

function Pixel({ x, y, color, w = 1, h = 1, opacity }: { x: number; y: number; color: string; w?: number; h?: number; opacity?: number }) {
  return <rect x={x} y={y} width={w} height={h} fill={color} opacity={opacity ?? 1} />;
}

function Pixels({ data, color }: { data: number[][]; color?: string }) {
  return <>{data.map(([x, y, c]) => <Pixel key={`${x}-${y}`} x={x} y={y} color={String(c ?? color ?? "#fff")} />)}</>;
}

// ── HERO SPRITES (16×16) ──

const HERO_BASE = [
  // Legs
  [4, 12, "#333"], [5, 12, "#333"], [10, 12, "#333"], [11, 12, "#333"],
  [4, 13, "#222"], [5, 13, "#222"], [10, 13, "#222"], [11, 13, "#222"],
  [4, 14, "#222"], [5, 14, "#222"], [10, 14, "#222"], [11, 14, "#222"],
  // Boots
  [3, 15, "#555"], [4, 15, "#555"], [5, 15, "#555"], [6, 15, "#555"],
  [9, 15, "#555"], [10, 15, "#555"], [11, 15, "#555"], [12, 15, "#555"],
];

function HeroBody({ color, extras = [] }: { color: string; extras?: (number | string)[][] }) {
  const body = [
    // Head
    [5, 0, "#ddd"], [6, 0, "#ddd"], [7, 0, "#ddd"], [8, 0, "#ddd"], [9, 0, "#ddd"], [10, 0, "#ddd"],
    [4, 1, "#ddd"], [5, 1, "#ddd"], [6, 1, color], [7, 1, color], [8, 1, color], [9, 1, color], [10, 1, "#ddd"], [11, 1, "#ddd"],
    [4, 2, "#ddd"], [5, 2, color], [6, 2, color], [7, 2, color], [8, 2, color], [9, 2, color], [10, 2, color], [11, 2, "#ddd"],
    // Eyes
    [5, 3, "#111"], [6, 3, "#fff"], [7, 3, "#fff"], [8, 3, "#111"],
    [9, 3, "#fff"], [10, 3, "#fff"], [11, 3, "#111"],
    // Torso
    [4, 4, color], [5, 4, color], [6, 4, color], [7, 4, color], [8, 4, color], [9, 4, color], [10, 4, color], [11, 4, color],
    [4, 5, color], [5, 5, color], [6, 5, color], [7, 5, color], [8, 5, color], [9, 5, color], [10, 5, color], [11, 5, color],
    [4, 6, color], [5, 6, color], [6, 6, color], [7, 6, color], [8, 6, color], [9, 6, color], [10, 6, color], [11, 6, color],
    [4, 7, color], [5, 7, color], [6, 7, color], [7, 7, color], [8, 7, color], [9, 7, color], [10, 7, color], [11, 7, color],
    // Belt
    [4, 8, "#444"], [5, 8, "#444"], [6, 8, "#555"], [7, 8, "#555"], [8, 8, "#555"], [9, 8, "#555"], [10, 8, "#444"], [11, 8, "#444"],
    // Arms
    [2, 4, "#ddd"], [2, 5, "#ddd"], [2, 6, "#ddd"], [2, 7, "#ddd"],
    [13, 4, "#ddd"], [13, 5, "#ddd"], [13, 6, "#ddd"], [13, 7, "#ddd"],
    // Hands
    [2, 8, color], [13, 8, color],
    // Legs
    ...HERO_BASE,
    ...extras,
  ];
  return <>{body.map(([x, y, c], i) => <Pixel key={i} x={x as number} y={y as number} color={c as string} />)}</>;
}

export function SpriteEngineer({ size = 48, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges" className={className}>
      <HeroBody color="#fbbf24" extras={[
        [7, 0, "#ff6b00"], [8, 0, "#ff6b00"], // Hard hat
        [6, 1, "#ff6b00"], [7, 1, "#ff6b00"], [8, 1, "#ff6b00"], [9, 1, "#ff6b00"],
        [14, 5, "#888"], [14, 6, "#888"], // Wrench
        [15, 5, "#aaa"], [15, 6, "#aaa"],
      ]} />
    </svg>
  );
}

export function SpriteScout({ size = 48, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges" className={className}>
      <HeroBody color="#22d3ee" extras={[
        [6, 0, "#0ea5e9"], [7, 0, "#0ea5e9"], [8, 0, "#0ea5e9"], [9, 0, "#0ea5e9"], // Antenna
        [7, 1, "#0ea5e9"], // Visor connector
        [14, 4, "#888"], [14, 5, "#888"], [15, 4, "#aaa"], [15, 5, "#aaa"], // Knife
      ]} />
    </svg>
  );
}

export function SpriteMarine({ size = 48, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges" className={className}>
      <HeroBody color="#ef4444" extras={[
        // Shoulder armor
        [1, 3, "#aaa"], [1, 4, "#aaa"],
        [14, 3, "#aaa"], [14, 4, "#aaa"],
        // Gun
        [13, 5, "#666"], [13, 6, "#666"], [14, 5, "#888"], [14, 6, "#888"],
        [15, 6, "#444"],
      ]} />
    </svg>
  );
}

export function SpriteScientist({ size = 48, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges" className={className}>
      <HeroBody color="#a78bfa" extras={[
        // Glasses
        [5, 3, "#555"], [6, 3, "#555"], [5, 4, "#555"],
        [10, 3, "#555"], [11, 3, "#555"], [11, 4, "#555"],
        [7, 3, "#555"], [8, 3, "#555"], [9, 3, "#555"], // bridge
        // Tablet
        [14, 5, "#444"], [14, 6, "#444"], [15, 5, "#0ff"], [15, 6, "#0ff"],
      ]} />
    </svg>
  );
}

export function SpriteMedic({ size = 48, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges" className={className}>
      <HeroBody color="#34d399" extras={[
        // Cross on helmet
        [7, 0, "#fff"], [8, 0, "#fff"],
        [6, 1, "#fff"], [7, 1, "#fff"], [8, 1, "#fff"], [9, 1, "#fff"],
        // Cross on chest
        [7, 5, "#fff"], [8, 5, "#fff"],
        [6, 6, "#fff"], [7, 6, "#fff"], [8, 6, "#fff"], [9, 6, "#fff"],
        [7, 7, "#fff"], [8, 7, "#fff"],
        // Medical bag
        [2, 6, "#555"], [2, 7, "#555"],
      ]} />
    </svg>
  );
}

export function SpriteCommander({ size = 48, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges" className={className}>
      <HeroBody color="#f472b6" extras={[
        // Crown / headpiece
        [5, 0, "#fbbf24"], [6, 0, "#fbbf24"], [7, 0, "#fbbf24"], [8, 0, "#fbbf24"], [9, 0, "#fbbf24"], [10, 0, "#fbbf24"],
        [6, 1, "#fbbf24"], [9, 1, "#fbbf24"],
        // Cape
        [3, 4, "#be185d"], [3, 5, "#be185d"], [3, 6, "#be185d"], [3, 7, "#be185d"],
        [12, 4, "#be185d"], [12, 5, "#be185d"], [12, 6, "#be185d"], [12, 7, "#be185d"],
        [3, 8, "#be185d"], [12, 8, "#be185d"],
        [3, 9, "#be185d"], [12, 9, "#be185d"],
        // Stars on shoulders
        [1, 4, "#fbbf24"], [14, 4, "#fbbf24"],
      ]} />
    </svg>
  );
}

export function SpriteMiner({ size = 48, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges" className={className}>
      <HeroBody color="#fb923c" extras={[
        // Mining helmet light
        [6, 0, "#fbbf24"], [7, 0, "#fbbf24"], [8, 0, "#fbbf24"],
        [9, 0, "#fff"], // light beam top
        // Pickaxe
        [2, 3, "#8B4513"], [2, 4, "#8B4513"], [2, 5, "#8B4513"],
        [1, 5, "#8B4513"], [0, 5, "#8B4513"],
        [1, 4, "#8B4513"],
        // Backpack
        [13, 5, "#666"], [13, 6, "#666"], [13, 7, "#666"],
      ]} />
    </svg>
  );
}

// ── ENEMY SPRITES (16×16) ──

export function SpriteCrawler({ size = 40, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 12" shapeRendering="crispEdges" className={className}>
      <Pixel x={2} y={4} color="#4a0404" /><Pixel x={3} y={4} color="#4a0404" /><Pixel x={4} y={4} color="#4a0404" /><Pixel x={5} y={4} color="#4a0404" /><Pixel x={6} y={4} color="#4a0404" /><Pixel x={7} y={4} color="#4a0404" /><Pixel x={8} y={4} color="#4a0404" /><Pixel x={9} y={4} color="#4a0404" /><Pixel x={10} y={4} color="#4a0404" /><Pixel x={11} y={4} color="#4a0404" /><Pixel x={12} y={4} color="#4a0404" /><Pixel x={13} y={4} color="#4a0404" />
      <Pixel x={4} y={3} color="#6b0707" /><Pixel x={5} y={3} color="#6b0707" /><Pixel x={6} y={3} color="#6b0707" /><Pixel x={7} y={3} color="#6b0707" /><Pixel x={8} y={3} color="#6b0707" /><Pixel x={9} y={3} color="#6b0707" /><Pixel x={10} y={3} color="#6b0707" /><Pixel x={11} y={3} color="#6b0707" />
      <Pixel x={6} y={2} color="#8a0a0a" /><Pixel x={7} y={2} color="#8a0a0a" /><Pixel x={8} y={2} color="#8a0a0a" /><Pixel x={9} y={2} color="#8a0a0a" />
      <Pixel x={7} y={1} color="#ff4444" /><Pixel x={8} y={1} color="#ff4444" /> {/* Eyes */}
      {/* Legs */}
      <Pixel x={1} y={5} color="#4a0404" /><Pixel x={3} y={5} color="#4a0404" /><Pixel x={5} y={5} color="#4a0404" /><Pixel x={7} y={5} color="#4a0404" /><Pixel x={9} y={5} color="#4a0404" /><Pixel x={11} y={5} color="#4a0404" /><Pixel x={13} y={5} color="#4a0404" /><Pixel x={14} y={5} color="#4a0404" />
      <Pixel x={1} y={6} color="#4a0404" /><Pixel x={14} y={6} color="#4a0404" />
    </svg>
  );
}

export function SpriteSpitter({ size = 40, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 14" shapeRendering="crispEdges" className={className}>
      <Pixel x={5} y={1} color="#2d5a27" /><Pixel x={6} y={1} color="#2d5a27" /><Pixel x={7} y={1} color="#2d5a27" /><Pixel x={8} y={1} color="#2d5a27" /><Pixel x={9} y={1} color="#2d5a27" /><Pixel x={10} y={1} color="#2d5a27" />
      <Pixel x={4} y={2} color="#3d7a35" /><Pixel x={5} y={2} color="#3d7a35" /><Pixel x={6} y={2} color="#3d7a35" /><Pixel x={7} y={2} color="#3d7a35" /><Pixel x={8} y={2} color="#3d7a35" /><Pixel x={9} y={2} color="#3d7a35" /><Pixel x={10} y={2} color="#3d7a35" /><Pixel x={11} y={2} color="#3d7a35" />
      <Pixel x={3} y={3} color="#4d9a45" /><Pixel x={4} y={3} color="#4d9a45" /><Pixel x={5} y={3} color="#4d9a45" /><Pixel x={6} y={3} color="#4d9a45" /><Pixel x={7} y={3} color="#4d9a45" /><Pixel x={8} y={3} color="#4d9a45" /><Pixel x={9} y={3} color="#4d9a45" /><Pixel x={10} y={3} color="#4d9a45" /><Pixel x={11} y={3} color="#4d9a45" /><Pixel x={12} y={3} color="#4d9a45" />
      <Pixel x={5} y={4} color="#5dba55" /><Pixel x={6} y={4} color="#5dba55" /><Pixel x={7} y={4} color="#5dba55" /><Pixel x={8} y={4} color="#5dba55" /><Pixel x={9} y={4} color="#5dba55" /><Pixel x={10} y={4} color="#5dba55" />
      {/* Eyes */}
      <Pixel x={6} y={3} color="#ff0" /><Pixel x={9} y={3} color="#ff0" />
      {/* Spikes */}
      <Pixel x={2} y={3} color="#2d5a27" /><Pixel x={13} y={3} color="#2d5a27" />
      <Pixel x={1} y={4} color="#2d5a27" /><Pixel x={14} y={4} color="#2d5a27" />
      {/* Spitter mouth */}
      <Pixel x={7} y={5} color="#5dba55" /><Pixel x={8} y={5} color="#5dba55" />
      <Pixel x={7} y={6} color="#8f0" /><Pixel x={8} y={6} color="#8f0" /><Pixel x={9} y={6} color="#8f0" />
      <Pixel x={8} y={7} color="#8f0" />
    </svg>
  );
}

export function SpriteBurrower({ size = 40, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 10" shapeRendering="crispEdges" className={className}>
      <Pixel x={4} y={2} color="#5c4033" /><Pixel x={5} y={2} color="#5c4033" /><Pixel x={6} y={2} color="#5c4033" /><Pixel x={7} y={2} color="#5c4033" /><Pixel x={8} y={2} color="#5c4033" /><Pixel x={9} y={2} color="#5c4033" /><Pixel x={10} y={2} color="#5c4033" /><Pixel x={11} y={2} color="#5c4033" />
      <Pixel x={3} y={3} color="#7a5a4a" /><Pixel x={4} y={3} color="#7a5a4a" /><Pixel x={5} y={3} color="#7a5a4a" /><Pixel x={6} y={3} color="#7a5a4a" /><Pixel x={7} y={3} color="#7a5a4a" /><Pixel x={8} y={3} color="#7a5a4a" /><Pixel x={9} y={3} color="#7a5a4a" /><Pixel x={10} y={3} color="#7a5a4a" /><Pixel x={11} y={3} color="#7a5a4a" /><Pixel x={12} y={3} color="#7a5a4a" />
      <Pixel x={2} y={4} color="#5c4033" /><Pixel x={3} y={4} color="#5c4033" /><Pixel x={4} y={4} color="#5c4033" /><Pixel x={5} y={4} color="#5c4033" /><Pixel x={6} y={4} color="#5c4033" /><Pixel x={7} y={4} color="#5c4033" /><Pixel x={8} y={4} color="#5c4033" /><Pixel x={9} y={4} color="#5c4033" /><Pixel x={10} y={4} color="#5c4033" /><Pixel x={11} y={4} color="#5c4033" /><Pixel x={12} y={4} color="#5c4033" /><Pixel x={13} y={4} color="#5c4033" />
      {/* Eyes */}
      <Pixel x={6} y={3} color="#ff0" /><Pixel x={9} y={3} color="#ff0" />
      {/* Mandibles */}
      <Pixel x={5} y={5} color="#5c4033" /><Pixel x={6} y={5} color="#5c4033" />
      <Pixel x={9} y={5} color="#5c4033" /><Pixel x={10} y={5} color="#5c4033" />
      {/* Segments */}
      <Pixel x={3} y={4} color="#4a3025" /><Pixel x={6} y={4} color="#4a3025" /><Pixel x={9} y={4} color="#4a3025" /><Pixel x={12} y={4} color="#4a3025" />
    </svg>
  );
}

export function SpriteHunter({ size = 48, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges" className={className}>
      {/* Body */}
      <Pixel x={4} y={4} color="#1a1a4a" /><Pixel x={5} y={4} color="#1a1a4a" /><Pixel x={6} y={4} color="#1a1a4a" /><Pixel x={7} y={4} color="#1a1a4a" /><Pixel x={8} y={4} color="#1a1a4a" /><Pixel x={9} y={4} color="#1a1a4a" /><Pixel x={10} y={4} color="#1a1a4a" /><Pixel x={11} y={4} color="#1a1a4a" />
      <Pixel x={3} y={5} color="#2a2a6a" /><Pixel x={4} y={5} color="#2a2a6a" /><Pixel x={5} y={5} color="#2a2a6a" /><Pixel x={6} y={5} color="#2a2a6a" /><Pixel x={7} y={5} color="#2a2a6a" /><Pixel x={8} y={5} color="#2a2a6a" /><Pixel x={9} y={5} color="#2a2a6a" /><Pixel x={10} y={5} color="#2a2a6a" /><Pixel x={11} y={5} color="#2a2a6a" /><Pixel x={12} y={5} color="#2a2a6a" />
      <Pixel x={2} y={6} color="#1a1a4a" /><Pixel x={3} y={6} color="#1a1a4a" /><Pixel x={4} y={6} color="#1a1a4a" /><Pixel x={5} y={6} color="#1a1a4a" /><Pixel x={6} y={6} color="#1a1a4a" /><Pixel x={7} y={6} color="#1a1a4a" /><Pixel x={8} y={6} color="#1a1a4a" /><Pixel x={9} y={6} color="#1a1a4a" /><Pixel x={10} y={6} color="#1a1a4a" /><Pixel x={11} y={6} color="#1a1a4a" /><Pixel x={12} y={6} color="#1a1a4a" /><Pixel x={13} y={6} color="#1a1a4a" />
      {/* Head */}
      <Pixel x={5} y={2} color="#2a2a6a" /><Pixel x={6} y={2} color="#2a2a6a" /><Pixel x={7} y={2} color="#2a2a6a" /><Pixel x={8} y={2} color="#2a2a6a" /><Pixel x={9} y={2} color="#2a2a6a" /><Pixel x={10} y={2} color="#2a2a6a" />
      <Pixel x={5} y={3} color="#3a3a8a" /><Pixel x={6} y={3} color="#3a3a8a" /><Pixel x={7} y={3} color="#3a3a8a" /><Pixel x={8} y={3} color="#3a3a8a" /><Pixel x={9} y={3} color="#3a3a8a" /><Pixel x={10} y={3} color="#3a3a8a" />
      {/* Eyes */}
      <Pixel x={6} y={3} color="#0ff" /><Pixel x={9} y={3} color="#0ff" />
      {/* Ears / horns */}
      <Pixel x={4} y={2} color="#2a2a6a" /><Pixel x={11} y={2} color="#2a2a6a" />
      <Pixel x={3} y={3} color="#2a2a6a" /><Pixel x={12} y={3} color="#2a2a6a" />
      {/* Legs */}
      <Pixel x={4} y={7} color="#1a1a4a" /><Pixel x={5} y={7} color="#1a1a4a" /><Pixel x={10} y={7} color="#1a1a4a" /><Pixel x={11} y={7} color="#1a1a4a" />
      <Pixel x={3} y={8} color="#1a1a4a" /><Pixel x={4} y={8} color="#1a1a4a" /><Pixel x={11} y={8} color="#1a1a4a" /><Pixel x={12} y={8} color="#1a1a4a" />
      <Pixel x={3} y={9} color="#222" /><Pixel x={12} y={9} color="#222" />
      {/* Tail */}
      <Pixel x={13} y={7} color="#1a1a4a" /><Pixel x={14} y={8} color="#1a1a4a" /><Pixel x={14} y={9} color="#1a1a4a" />
    </svg>
  );
}

export function SpriteHiveGuard({ size = 48, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges" className={className}>
      {/* Shield */}
      <Pixel x={1} y={3} color="#6a0dad" /><Pixel x={2} y={2} color="#6a0dad" /><Pixel x={3} y={2} color="#6a0dad" /><Pixel x={4} y={2} color="#6a0dad" />
      <Pixel x={1} y={4} color="#6a0dad" /><Pixel x={1} y={5} color="#6a0dad" /><Pixel x={1} y={6} color="#6a0dad" /><Pixel x={1} y={7} color="#6a0dad" />
      <Pixel x={2} y={8} color="#6a0dad" /><Pixel x={3} y={8} color="#6a0dad" /><Pixel x={4} y={8} color="#6a0dad" />
      {/* Body */}
      <Pixel x={5} y={3} color="#8a2be2" /><Pixel x={6} y={3} color="#8a2be2" /><Pixel x={7} y={3} color="#8a2be2" /><Pixel x={8} y={3} color="#8a2be2" /><Pixel x={9} y={3} color="#8a2be2" /><Pixel x={10} y={3} color="#8a2be2" />
      <Pixel x={5} y={4} color="#9b30ff" /><Pixel x={6} y={4} color="#9b30ff" /><Pixel x={7} y={4} color="#9b30ff" /><Pixel x={8} y={4} color="#9b30ff" /><Pixel x={9} y={4} color="#9b30ff" /><Pixel x={10} y={4} color="#9b30ff" />
      <Pixel x={5} y={5} color="#8a2be2" /><Pixel x={6} y={5} color="#8a2be2" /><Pixel x={7} y={5} color="#8a2be2" /><Pixel x={8} y={5} color="#8a2be2" /><Pixel x={9} y={5} color="#8a2be2" /><Pixel x={10} y={5} color="#8a2be2" />
      <Pixel x={5} y={6} color="#8a2be2" /><Pixel x={6} y={6} color="#8a2be2" /><Pixel x={7} y={6} color="#8a2be2" /><Pixel x={8} y={6} color="#8a2be2" /><Pixel x={9} y={6} color="#8a2be2" /><Pixel x={10} y={6} color="#8a2be2" />
      <Pixel x={5} y={7} color="#6a0dad" /><Pixel x={6} y={7} color="#6a0dad" /><Pixel x={7} y={7} color="#6a0dad" /><Pixel x={8} y={7} color="#6a0dad" /><Pixel x={9} y={7} color="#6a0dad" /><Pixel x={10} y={7} color="#6a0dad" />
      {/* Head */}
      <Pixel x={6} y={1} color="#9b30ff" /><Pixel x={7} y={1} color="#9b30ff" /><Pixel x={8} y={1} color="#9b30ff" /><Pixel x={9} y={1} color="#9b30ff" />
      <Pixel x={5} y={2} color="#9b30ff" /><Pixel x={6} y={2} color="#9b30ff" /><Pixel x={7} y={2} color="#9b30ff" /><Pixel x={8} y={2} color="#9b30ff" /><Pixel x={9} y={2} color="#9b30ff" /><Pixel x={10} y={2} color="#9b30ff" />
      {/* Eyes */}
      <Pixel x={6} y={2} color="#ff0" /><Pixel x={9} y={2} color="#ff0" />
      {/* Legs */}
      <Pixel x={5} y={8} color="#6a0dad" /><Pixel x={6} y={8} color="#6a0dad" /><Pixel x={9} y={8} color="#6a0dad" /><Pixel x={10} y={8} color="#6a0dad" />
      <Pixel x={5} y={9} color="#5a0b9d" /><Pixel x={6} y={9} color="#5a0b9d" /><Pixel x={9} y={9} color="#5a0b9d" /><Pixel x={10} y={9} color="#5a0b9d" />
    </svg>
  );
}

export function SpriteVoidBeast({ size = 56, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 16" shapeRendering="crispEdges" className={className}>
      {/* Core */}
      <Pixel x={8} y={5} color="#2d006e" /><Pixel x={9} y={5} color="#2d006e" /><Pixel x={10} y={5} color="#2d006e" /><Pixel x={11} y={5} color="#2d006e" />
      <Pixel x={7} y={6} color="#3d008e" /><Pixel x={8} y={6} color="#3d008e" /><Pixel x={9} y={6} color="#3d008e" /><Pixel x={10} y={6} color="#3d008e" /><Pixel x={11} y={6} color="#3d008e" /><Pixel x={12} y={6} color="#3d008e" />
      <Pixel x={7} y={7} color="#3d008e" /><Pixel x={8} y={7} color="#3d008e" /><Pixel x={9} y={7} color="#3d008e" /><Pixel x={10} y={7} color="#3d008e" /><Pixel x={11} y={7} color="#3d008e" /><Pixel x={12} y={7} color="#3d008e" />
      <Pixel x={8} y={8} color="#2d006e" /><Pixel x={9} y={8} color="#2d006e" /><Pixel x={10} y={8} color="#2d006e" /><Pixel x={11} y={8} color="#2d006e" />
      {/* Tentacles */}
      <Pixel x={3} y={4} color="#2d006e" /><Pixel x={4} y={5} color="#2d006e" /><Pixel x={5} y={6} color="#2d006e" />
      <Pixel x={14} y={4} color="#2d006e" /><Pixel x={15} y={5} color="#2d006e" /><Pixel x={14} y={6} color="#2d006e" />
      <Pixel x={4} y={9} color="#2d006e" /><Pixel x={5} y={10} color="#2d006e" /><Pixel x={6} y={11} color="#2d006e" />
      <Pixel x={13} y={9} color="#2d006e" /><Pixel x={14} y={10} color="#2d006e" /><Pixel x={13} y={11} color="#2d006e" />
      {/* Eyes */}
      <Pixel x={8} y={6} color="#f0f" /><Pixel x={11} y={6} color="#f0f" />
      {/* Aura */}
      <Pixel x={6} y={4} color="#4d00ae" opacity={0.5} /><Pixel x={13} y={4} color="#4d00ae" opacity={0.5} />
      <Pixel x={6} y={9} color="#4d00ae" opacity={0.5} /><Pixel x={13} y={9} color="#4d00ae" opacity={0.5} />
    </svg>
  );
}

export function SpriteTitan({ size = 64, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 20" shapeRendering="crispEdges" className={className}>
      {/* Legs */}
      <Pixel x={6} y={14} color="#6b3a1f" /><Pixel x={7} y={14} color="#6b3a1f" /><Pixel x={8} y={14} color="#6b3a1f" /><Pixel x={15} y={14} color="#6b3a1f" /><Pixel x={16} y={14} color="#6b3a1f" /><Pixel x={17} y={14} color="#6b3a1f" />
      <Pixel x={5} y={15} color="#5a3018" /><Pixel x={6} y={15} color="#5a3018" /><Pixel x={7} y={15} color="#5a3018" /><Pixel x={8} y={15} color="#5a3018" /><Pixel x={15} y={15} color="#5a3018" /><Pixel x={16} y={15} color="#5a3018" /><Pixel x={17} y={15} color="#5a3018" /><Pixel x={18} y={15} color="#5a3018" />
      <Pixel x={4} y={16} color="#4a2510" /><Pixel x={5} y={16} color="#4a2510" /><Pixel x={6} y={16} color="#4a2510" /><Pixel x={17} y={16} color="#4a2510" /><Pixel x={18} y={16} color="#4a2510" /><Pixel x={19} y={16} color="#4a2510" />
      <Pixel x={4} y={17} color="#3a1d0c" /><Pixel x={19} y={17} color="#3a1d0c" />
      {/* Body */}
      <Pixel x={6} y={8} color="#8b4513" /><Pixel x={7} y={8} color="#8b4513" /><Pixel x={8} y={8} color="#8b4513" /><Pixel x={9} y={8} color="#8b4513" /><Pixel x={10} y={8} color="#8b4513" /><Pixel x={11} y={8} color="#8b4513" /><Pixel x={12} y={8} color="#8b4513" /><Pixel x={13} y={8} color="#8b4513" /><Pixel x={14} y={8} color="#8b4513" /><Pixel x={15} y={8} color="#8b4513" /><Pixel x={16} y={8} color="#8b4513" /><Pixel x={17} y={8} color="#8b4513" />
      <Pixel x={5} y={9} color="#a0522d" /><Pixel x={6} y={9} color="#a0522d" /><Pixel x={7} y={9} color="#a0522d" /><Pixel x={8} y={9} color="#a0522d" /><Pixel x={9} y={9} color="#a0522d" /><Pixel x={10} y={9} color="#a0522d" /><Pixel x={11} y={9} color="#a0522d" /><Pixel x={12} y={9} color="#a0522d" /><Pixel x={13} y={9} color="#a0522d" /><Pixel x={14} y={9} color="#a0522d" /><Pixel x={15} y={9} color="#a0522d" /><Pixel x={16} y={9} color="#a0522d" /><Pixel x={17} y={9} color="#a0522d" /><Pixel x={18} y={9} color="#a0522d" />
      <Pixel x={5} y={10} color="#8b4513" /><Pixel x={6} y={10} color="#8b4513" /><Pixel x={7} y={10} color="#8b4513" /><Pixel x={8} y={10} color="#8b4513" /><Pixel x={9} y={10} color="#8b4513" /><Pixel x={10} y={10} color="#8b4513" /><Pixel x={11} y={10} color="#8b4513" /><Pixel x={12} y={10} color="#8b4513" /><Pixel x={13} y={10} color="#8b4513" /><Pixel x={14} y={10} color="#8b4513" /><Pixel x={15} y={10} color="#8b4513" /><Pixel x={16} y={10} color="#8b4513" /><Pixel x={17} y={10} color="#8b4513" /><Pixel x={18} y={10} color="#8b4513" />
      <Pixel x={6} y={11} color="#8b4513" /><Pixel x={7} y={11} color="#8b4513" /><Pixel x={8} y={11} color="#8b4513" /><Pixel x={9} y={11} color="#8b4513" /><Pixel x={10} y={11} color="#8b4513" /><Pixel x={11} y={11} color="#8b4513" /><Pixel x={12} y={11} color="#8b4513" /><Pixel x={13} y={11} color="#8b4513" /><Pixel x={14} y={11} color="#8b4513" /><Pixel x={15} y={11} color="#8b4513" /><Pixel x={16} y={11} color="#8b4513" /><Pixel x={17} y={11} color="#8b4513" />
      <Pixel x={7} y={12} color="#7a3d10" /><Pixel x={8} y={12} color="#7a3d10" /><Pixel x={9} y={12} color="#7a3d10" /><Pixel x={10} y={12} color="#7a3d10" /><Pixel x={11} y={12} color="#7a3d10" /><Pixel x={12} y={12} color="#7a3d10" /><Pixel x={13} y={12} color="#7a3d10" /><Pixel x={14} y={12} color="#7a3d10" /><Pixel x={15} y={12} color="#7a3d10" /><Pixel x={16} y={12} color="#7a3d10" />
      {/* Head */}
      <Pixel x={7} y={4} color="#a0522d" /><Pixel x={8} y={4} color="#a0522d" /><Pixel x={9} y={4} color="#a0522d" /><Pixel x={10} y={4} color="#a0522d" /><Pixel x={11} y={4} color="#a0522d" /><Pixel x={12} y={4} color="#a0522d" /><Pixel x={13} y={4} color="#a0522d" /><Pixel x={14} y={4} color="#a0522d" /><Pixel x={15} y={4} color="#a0522d" /><Pixel x={16} y={4} color="#a0522d" />
      <Pixel x={6} y={5} color="#8b4513" /><Pixel x={7} y={5} color="#8b4513" /><Pixel x={8} y={5} color="#8b4513" /><Pixel x={9} y={5} color="#8b4513" /><Pixel x={10} y={5} color="#8b4513" /><Pixel x={11} y={5} color="#8b4513" /><Pixel x={12} y={5} color="#8b4513" /><Pixel x={13} y={5} color="#8b4513" /><Pixel x={14} y={5} color="#8b4513" /><Pixel x={15} y={5} color="#8b4513" /><Pixel x={16} y={5} color="#8b4513" /><Pixel x={17} y={5} color="#8b4513" />
      {/* Horns */}
      <Pixel x={6} y={3} color="#a0522d" /><Pixel x={7} y={3} color="#a0522d" /><Pixel x={16} y={3} color="#a0522d" /><Pixel x={17} y={3} color="#a0522d" />
      <Pixel x={7} y={2} color="#a0522d" /><Pixel x={16} y={2} color="#a0522d" />
      {/* Eyes */}
      <Pixel x={9} y={5} color="#f44" /><Pixel x={10} y={5} color="#f44" /><Pixel x={13} y={5} color="#f44" /><Pixel x={14} y={5} color="#f44" />
      {/* Arms */}
      <Pixel x={3} y={9} color="#8b4513" /><Pixel x={4} y={9} color="#8b4513" /><Pixel x={3} y={10} color="#8b4513" /><Pixel x={4} y={10} color="#8b4513" />
      <Pixel x={19} y={9} color="#8b4513" /><Pixel x={20} y={9} color="#8b4513" /><Pixel x={19} y={10} color="#8b4513" /><Pixel x={20} y={10} color="#8b4513" />
      {/* Fists */}
      <Pixel x={2} y={10} color="#a0522d" /><Pixel x={2} y={11} color="#a0522d" /><Pixel x={21} y={10} color="#a0522d" /><Pixel x={21} y={11} color="#a0522d" />
    </svg>
  );
}

export function SpriteLavaTitan({ size = 64, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 20" shapeRendering="crispEdges" className={className}>
      {/* Same shape as Titan but with lava colors */}
      <Pixel x={6} y={14} color="#8b2500" /><Pixel x={7} y={14} color="#8b2500" /><Pixel x={8} y={14} color="#8b2500" /><Pixel x={15} y={14} color="#8b2500" /><Pixel x={16} y={14} color="#8b2500" /><Pixel x={17} y={14} color="#8b2500" />
      <Pixel x={5} y={15} color="#6a1c00" /><Pixel x={6} y={15} color="#6a1c00" /><Pixel x={7} y={15} color="#6a1c00" /><Pixel x={8} y={15} color="#6a1c00" /><Pixel x={15} y={15} color="#6a1c00" /><Pixel x={16} y={15} color="#6a1c00" /><Pixel x={17} y={15} color="#6a1c00" /><Pixel x={18} y={15} color="#6a1c00" />
      <Pixel x={6} y={8} color="#ff4500" /><Pixel x={7} y={8} color="#ff4500" /><Pixel x={8} y={8} color="#ff4500" /><Pixel x={9} y={8} color="#ff4500" /><Pixel x={10} y={8} color="#ff4500" /><Pixel x={11} y={8} color="#ff4500" /><Pixel x={12} y={8} color="#ff4500" /><Pixel x={13} y={8} color="#ff4500" /><Pixel x={14} y={8} color="#ff4500" /><Pixel x={15} y={8} color="#ff4500" /><Pixel x={16} y={8} color="#ff4500" /><Pixel x={17} y={8} color="#ff4500" />
      <Pixel x={5} y={9} color="#ff6600" /><Pixel x={6} y={9} color="#ff6600" /><Pixel x={7} y={9} color="#ff6600" /><Pixel x={8} y={9} color="#ff6600" /><Pixel x={9} y={9} color="#ff6600" /><Pixel x={10} y={9} color="#ff6600" /><Pixel x={11} y={9} color="#ff6600" /><Pixel x={12} y={9} color="#ff6600" /><Pixel x={13} y={9} color="#ff6600" /><Pixel x={14} y={9} color="#ff6600" /><Pixel x={15} y={9} color="#ff6600" /><Pixel x={16} y={9} color="#ff6600" /><Pixel x={17} y={9} color="#ff6600" /><Pixel x={18} y={9} color="#ff6600" />
      <Pixel x={5} y={10} color="#ff4500" /><Pixel x={6} y={10} color="#ff4500" /><Pixel x={7} y={10} color="#ff4500" /><Pixel x={8} y={10} color="#ff4500" /><Pixel x={9} y={10} color="#ff4500" /><Pixel x={10} y={10} color="#ff4500" /><Pixel x={11} y={10} color="#ff4500" /><Pixel x={12} y={10} color="#ff4500" /><Pixel x={13} y={10} color="#ff4500" /><Pixel x={14} y={10} color="#ff4500" /><Pixel x={15} y={10} color="#ff4500" /><Pixel x={16} y={10} color="#ff4500" /><Pixel x={17} y={10} color="#ff4500" /><Pixel x={18} y={10} color="#ff4500" />
      <Pixel x={7} y={11} color="#ff2200" /><Pixel x={8} y={11} color="#ff2200" /><Pixel x={9} y={11} color="#ff2200" /><Pixel x={10} y={11} color="#ff2200" /><Pixel x={11} y={11} color="#ff2200" /><Pixel x={12} y={11} color="#ff2200" /><Pixel x={13} y={11} color="#ff2200" /><Pixel x={14} y={11} color="#ff2200" /><Pixel x={15} y={11} color="#ff2200" /><Pixel x={16} y={11} color="#ff2200" />
      {/* Lava cracks */}
      <Pixel x={8} y={10} color="#ffcc00" /><Pixel x={11} y={10} color="#ffcc00" /><Pixel x={14} y={10} color="#ffcc00" />
      {/* Head */}
      <Pixel x={7} y={4} color="#ff6600" /><Pixel x={8} y={4} color="#ff6600" /><Pixel x={9} y={4} color="#ff6600" /><Pixel x={10} y={4} color="#ff6600" /><Pixel x={11} y={4} color="#ff6600" /><Pixel x={12} y={4} color="#ff6600" /><Pixel x={13} y={4} color="#ff6600" /><Pixel x={14} y={4} color="#ff6600" /><Pixel x={15} y={4} color="#ff6600" /><Pixel x={16} y={4} color="#ff6600" />
      <Pixel x={6} y={5} color="#ff4500" /><Pixel x={7} y={5} color="#ff4500" /><Pixel x={8} y={5} color="#ff4500" /><Pixel x={9} y={5} color="#ff4500" /><Pixel x={10} y={5} color="#ff4500" /><Pixel x={11} y={5} color="#ff4500" /><Pixel x={12} y={5} color="#ff4500" /><Pixel x={13} y={5} color="#ff4500" /><Pixel x={14} y={5} color="#ff4500" /><Pixel x={15} y={5} color="#ff4500" /><Pixel x={16} y={5} color="#ff4500" /><Pixel x={17} y={5} color="#ff4500" />
      <Pixel x={7} y={2} color="#ff6600" /><Pixel x={16} y={2} color="#ff6600" />
      <Pixel x={9} y={5} color="#fff" /><Pixel x={10} y={5} color="#fff" /><Pixel x={13} y={5} color="#fff" /><Pixel x={14} y={5} color="#fff" />
      {/* Arms */}
      <Pixel x={3} y={9} color="#ff4500" /><Pixel x={4} y={9} color="#ff4500" /><Pixel x={3} y={10} color="#ff4500" /><Pixel x={4} y={10} color="#ff4500" />
      <Pixel x={19} y={9} color="#ff4500" /><Pixel x={20} y={9} color="#ff4500" /><Pixel x={19} y={10} color="#ff4500" /><Pixel x={20} y={10} color="#ff4500" />
    </svg>
  );
}

export function SpriteHiveQueen({ size = 56, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 16" shapeRendering="crispEdges" className={className}>
      {/* Crown */}
      <Pixel x={8} y={1} color="#fbbf24" /><Pixel x={9} y={1} color="#fbbf24" /><Pixel x={10} y={1} color="#fbbf24" /><Pixel x={11} y={1} color="#fbbf24" />
      <Pixel x={7} y={2} color="#fbbf24" /><Pixel x={8} y={2} color="#fbbf24" /><Pixel x={9} y={2} color="#fbbf24" /><Pixel x={10} y={2} color="#fbbf24" /><Pixel x={11} y={2} color="#fbbf24" /><Pixel x={12} y={2} color="#fbbf24" />
      {/* Head */}
      <Pixel x={7} y={3} color="#9b30ff" /><Pixel x={8} y={3} color="#9b30ff" /><Pixel x={9} y={3} color="#9b30ff" /><Pixel x={10} y={3} color="#9b30ff" /><Pixel x={11} y={3} color="#9b30ff" /><Pixel x={12} y={3} color="#9b30ff" />
      <Pixel x={6} y={4} color="#9b30ff" /><Pixel x={7} y={4} color="#9b30ff" /><Pixel x={8} y={4} color="#9b30ff" /><Pixel x={9} y={4} color="#9b30ff" /><Pixel x={10} y={4} color="#9b30ff" /><Pixel x={11} y={4} color="#9b30ff" /><Pixel x={12} y={4} color="#9b30ff" /><Pixel x={13} y={4} color="#9b30ff" />
      {/* Body */}
      <Pixel x={5} y={5} color="#8a2be2" /><Pixel x={6} y={5} color="#8a2be2" /><Pixel x={7} y={5} color="#8a2be2" /><Pixel x={8} y={5} color="#8a2be2" /><Pixel x={9} y={5} color="#8a2be2" /><Pixel x={10} y={5} color="#8a2be2" /><Pixel x={11} y={5} color="#8a2be2" /><Pixel x={12} y={5} color="#8a2be2" /><Pixel x={13} y={5} color="#8a2be2" /><Pixel x={14} y={5} color="#8a2be2" />
      <Pixel x={5} y={6} color="#7b1fa2" /><Pixel x={6} y={6} color="#7b1fa2" /><Pixel x={7} y={6} color="#7b1fa2" /><Pixel x={8} y={6} color="#7b1fa2" /><Pixel x={9} y={6} color="#7b1fa2" /><Pixel x={10} y={6} color="#7b1fa2" /><Pixel x={11} y={6} color="#7b1fa2" /><Pixel x={12} y={6} color="#7b1fa2" /><Pixel x={13} y={6} color="#7b1fa2" /><Pixel x={14} y={6} color="#7b1fa2" />
      <Pixel x={6} y={7} color="#6a0dad" /><Pixel x={7} y={7} color="#6a0dad" /><Pixel x={8} y={7} color="#6a0dad" /><Pixel x={9} y={7} color="#6a0dad" /><Pixel x={10} y={7} color="#6a0dad" /><Pixel x={11} y={7} color="#6a0dad" /><Pixel x={12} y={7} color="#6a0dad" /><Pixel x={13} y={7} color="#6a0dad" />
      <Pixel x={7} y={8} color="#5a0b9d" /><Pixel x={8} y={8} color="#5a0b9d" /><Pixel x={9} y={8} color="#5a0b9d" /><Pixel x={10} y={8} color="#5a0b9d" /><Pixel x={11} y={8} color="#5a0b9d" /><Pixel x={12} y={8} color="#5a0b9d" />
      {/* Eyes */}
      <Pixel x={7} y={4} color="#ff0" /><Pixel x={12} y={4} color="#ff0" />
      {/* Wings */}
      <Pixel x={2} y={5} color="#d8b4fe" opacity={0.6} /><Pixel x={3} y={5} color="#d8b4fe" opacity={0.6} /><Pixel x={4} y={5} color="#d8b4fe" opacity={0.6} />
      <Pixel x={2} y={6} color="#d8b4fe" opacity={0.6} /><Pixel x={3} y={6} color="#d8b4fe" opacity={0.6} />
      <Pixel x={15} y={5} color="#d8b4fe" opacity={0.6} /><Pixel x={16} y={5} color="#d8b4fe" opacity={0.6} /><Pixel x={17} y={5} color="#d8b4fe" opacity={0.6} />
      <Pixel x={16} y={6} color="#d8b4fe" opacity={0.6} /><Pixel x={17} y={6} color="#d8b4fe" opacity={0.6} />
      {/* Legs */}
      <Pixel x={6} y={9} color="#5a0b9d" /><Pixel x={7} y={9} color="#5a0b9d" /><Pixel x={12} y={9} color="#5a0b9d" /><Pixel x={13} y={9} color="#5a0b9d" />
      <Pixel x={7} y={10} color="#4a0a8d" /><Pixel x={8} y={10} color="#4a0a8d" /><Pixel x={11} y={10} color="#4a0a8d" /><Pixel x={12} y={10} color="#4a0a8d" />
    </svg>
  );
}

export function SpriteAncientGuardian({ size = 56, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 18" shapeRendering="crispEdges" className={className}>
      {/* Ancient stone armor body */}
      <Pixel x={6} y={5} color="#2d5a3a" /><Pixel x={7} y={5} color="#2d5a3a" /><Pixel x={8} y={5} color="#2d5a3a" /><Pixel x={9} y={5} color="#2d5a3a" /><Pixel x={10} y={5} color="#2d5a3a" /><Pixel x={11} y={5} color="#2d5a3a" /><Pixel x={12} y={5} color="#2d5a3a" /><Pixel x={13} y={5} color="#2d5a3a" />
      <Pixel x={5} y={6} color="#3a7a4a" /><Pixel x={6} y={6} color="#3a7a4a" /><Pixel x={7} y={6} color="#3a7a4a" /><Pixel x={8} y={6} color="#3a7a4a" /><Pixel x={9} y={6} color="#3a7a4a" /><Pixel x={10} y={6} color="#3a7a4a" /><Pixel x={11} y={6} color="#3a7a4a" /><Pixel x={12} y={6} color="#3a7a4a" /><Pixel x={13} y={6} color="#3a7a4a" /><Pixel x={14} y={6} color="#3a7a4a" />
      <Pixel x={5} y={7} color="#3a7a4a" /><Pixel x={6} y={7} color="#3a7a4a" /><Pixel x={7} y={7} color="#3a7a4a" /><Pixel x={8} y={7} color="#3a7a4a" /><Pixel x={9} y={7} color="#3a7a4a" /><Pixel x={10} y={7} color="#3a7a4a" /><Pixel x={11} y={7} color="#3a7a4a" /><Pixel x={12} y={7} color="#3a7a4a" /><Pixel x={13} y={7} color="#3a7a4a" /><Pixel x={14} y={7} color="#3a7a4a" />
      {/* Rune glow */}
      <Pixel x={8} y={6} color="#00ffaa" /><Pixel x={11} y={6} color="#00ffaa" />
      <Pixel x={7} y={7} color="#00ffaa" /><Pixel x={12} y={7} color="#00ffaa" />
      {/* Head */}
      <Pixel x={7} y={2} color="#3a7a4a" /><Pixel x={8} y={2} color="#3a7a4a" /><Pixel x={9} y={2} color="#3a7a4a" /><Pixel x={10} y={2} color="#3a7a4a" /><Pixel x={11} y={2} color="#3a7a4a" /><Pixel x={12} y={2} color="#3a7a4a" />
      <Pixel x={6} y={3} color="#2d5a3a" /><Pixel x={7} y={3} color="#2d5a3a" /><Pixel x={8} y={3} color="#2d5a3a" /><Pixel x={9} y={3} color="#2d5a3a" /><Pixel x={10} y={3} color="#2d5a3a" /><Pixel x={11} y={3} color="#2d5a3a" /><Pixel x={12} y={3} color="#2d5a3a" /><Pixel x={13} y={3} color="#2d5a3a" />
      <Pixel x={6} y={4} color="#2d5a3a" /><Pixel x={7} y={4} color="#2d5a3a" /><Pixel x={8} y={4} color="#2d5a3a" /><Pixel x={9} y={4} color="#00ffaa" /><Pixel x={10} y={4} color="#00ffaa" /><Pixel x={11} y={4} color="#2d5a3a" /><Pixel x={12} y={4} color="#2d5a3a" /><Pixel x={13} y={4} color="#2d5a3a" />
      {/* Horns */}
      <Pixel x={6} y={1} color="#2d5a3a" /><Pixel x={7} y={1} color="#2d5a3a" /><Pixel x={12} y={1} color="#2d5a3a" /><Pixel x={13} y={1} color="#2d5a3a" />
      <Pixel x={7} y={0} color="#2d5a3a" /><Pixel x={12} y={0} color="#2d5a3a" />
      {/* Stone legs */}
      <Pixel x={6} y={8} color="#2d5a3a" /><Pixel x={7} y={8} color="#2d5a3a" /><Pixel x={12} y={8} color="#2d5a3a" /><Pixel x={13} y={8} color="#2d5a3a" />
      <Pixel x={6} y={9} color="#1d4a2a" /><Pixel x={7} y={9} color="#1d4a2a" /><Pixel x={12} y={9} color="#1d4a2a" /><Pixel x={13} y={9} color="#1d4a2a" />
      <Pixel x={5} y={10} color="#1d4a2a" /><Pixel x={6} y={10} color="#1d4a2a" /><Pixel x={13} y={10} color="#1d4a2a" /><Pixel x={14} y={10} color="#1d4a2a" />
      {/* Roots */}
      <Pixel x={3} y={8} color="#2d5a3a" /><Pixel x={4} y={9} color="#2d5a3a" /><Pixel x={3} y={10} color="#2d5a3a" />
      <Pixel x={16} y={8} color="#2d5a3a" /><Pixel x={15} y={9} color="#2d5a3a" /><Pixel x={16} y={10} color="#2d5a3a" />
    </svg>
  );
}

export function SpriteVoidDragon({ size = 72, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 16" shapeRendering="crispEdges" className={className}>
      {/* Body */}
      <Pixel x={8} y={5} color="#4400ff" /><Pixel x={9} y={5} color="#4400ff" /><Pixel x={10} y={5} color="#4400ff" /><Pixel x={11} y={5} color="#4400ff" /><Pixel x={12} y={5} color="#4400ff" /><Pixel x={13} y={5} color="#4400ff" /><Pixel x={14} y={5} color="#4400ff" /><Pixel x={15} y={5} color="#4400ff" /><Pixel x={16} y={5} color="#4400ff" /><Pixel x={17} y={5} color="#4400ff" /><Pixel x={18} y={5} color="#4400ff" />
      <Pixel x={7} y={6} color="#5500ff" /><Pixel x={8} y={6} color="#5500ff" /><Pixel x={9} y={6} color="#5500ff" /><Pixel x={10} y={6} color="#5500ff" /><Pixel x={11} y={6} color="#5500ff" /><Pixel x={12} y={6} color="#5500ff" /><Pixel x={13} y={6} color="#5500ff" /><Pixel x={14} y={6} color="#5500ff" /><Pixel x={15} y={6} color="#5500ff" /><Pixel x={16} y={6} color="#5500ff" /><Pixel x={17} y={6} color="#5500ff" /><Pixel x={18} y={6} color="#5500ff" /><Pixel x={19} y={6} color="#5500ff" />
      <Pixel x={8} y={7} color="#4400ff" /><Pixel x={9} y={7} color="#4400ff" /><Pixel x={10} y={7} color="#4400ff" /><Pixel x={11} y={7} color="#4400ff" /><Pixel x={12} y={7} color="#4400ff" /><Pixel x={13} y={7} color="#4400ff" /><Pixel x={14} y={7} color="#4400ff" /><Pixel x={15} y={7} color="#4400ff" /><Pixel x={16} y={7} color="#4400ff" /><Pixel x={17} y={7} color="#4400ff" /><Pixel x={18} y={7} color="#4400ff" />
      {/* Head */}
      <Pixel x={3} y={4} color="#5500ff" /><Pixel x={4} y={4} color="#5500ff" /><Pixel x={5} y={4} color="#5500ff" /><Pixel x={6} y={4} color="#5500ff" />
      <Pixel x={3} y={5} color="#6600ff" /><Pixel x={4} y={5} color="#6600ff" /><Pixel x={5} y={5} color="#6600ff" /><Pixel x={6} y={5} color="#6600ff" /><Pixel x={7} y={5} color="#6600ff" />
      <Pixel x={2} y={6} color="#5500ff" /><Pixel x={3} y={6} color="#5500ff" /><Pixel x={4} y={6} color="#5500ff" /><Pixel x={5} y={6} color="#5500ff" /><Pixel x={6} y={6} color="#5500ff" /><Pixel x={7} y={6} color="#5500ff" />
      {/* Dragon frills */}
      <Pixel x={4} y={2} color="#4400ff" /><Pixel x={5} y={2} color="#4400ff" /><Pixel x={4} y={3} color="#5500ff" /><Pixel x={5} y={3} color="#5500ff" />
      {/* Eyes */}
      <Pixel x={3} y={5} color="#fff" /><Pixel x={6} y={5} color="#fff" />
      {/* Wings */}
      <Pixel x={11} y={2} color="#4400ff" opacity={0.7} /><Pixel x={12} y={2} color="#4400ff" opacity={0.7} /><Pixel x={13} y={2} color="#4400ff" opacity={0.7} />
      <Pixel x={10} y={3} color="#4400ff" opacity={0.7} /><Pixel x={11} y={3} color="#4400ff" opacity={0.7} /><Pixel x={12} y={3} color="#4400ff" opacity={0.7} /><Pixel x={13} y={3} color="#4400ff" opacity={0.7} /><Pixel x={14} y={3} color="#4400ff" opacity={0.7} />
      <Pixel x={14} y={2} color="#5500ff" opacity={0.7} /><Pixel x={15} y={2} color="#5500ff" opacity={0.7} /><Pixel x={16} y={2} color="#5500ff" opacity={0.7} />
      <Pixel x={15} y={3} color="#5500ff" opacity={0.7} /><Pixel x={16} y={3} color="#5500ff" opacity={0.7} /><Pixel x={17} y={3} color="#5500ff" opacity={0.7} />
      {/* Tail */}
      <Pixel x={19} y={6} color="#4400ff" /><Pixel x={20} y={7} color="#4400ff" /><Pixel x={21} y={8} color="#4400ff" /><Pixel x={22} y={8} color="#4400ff" /><Pixel x={23} y={9} color="#4400ff" /><Pixel x={24} y={9} color="#4400ff" />
      <Pixel x={25} y={10} color="#4400ff" /><Pixel x={26} y={10} color="#4400ff" /><Pixel x={26} y={11} color="#4400ff" /><Pixel x={25} y={11} color="#4400ff" />
      {/* Legs */}
      <Pixel x={8} y={8} color="#4400ff" /><Pixel x={9} y={8} color="#4400ff" /><Pixel x={10} y={8} color="#4400ff" />
      <Pixel x={8} y={9} color="#3300cc" /><Pixel x={9} y={9} color="#3300cc" />
      <Pixel x={15} y={8} color="#4400ff" /><Pixel x={16} y={8} color="#4400ff" /><Pixel x={17} y={8} color="#4400ff" />
      <Pixel x={16} y={9} color="#3300cc" /><Pixel x={17} y={9} color="#3300cc" />
    </svg>
  );
}

// ── CRYO PODS (8×20) ──

function CryoPodBase({ color, glow, name }: { color: string; glow: string; name: string }) {
  return (
    <svg width={48} height={120} viewBox="0 0 16 40" shapeRendering="crispEdges" className="inline-block">
      {/* Pod outer shell */}
      <rect x={2} y={2} width={12} height={36} rx={2} fill="none" stroke={color} strokeWidth={1.5} />
      <rect x={2} y={2} width={12} height={36} rx={2} fill={glow} opacity={0.05} />
      {/* Inner tube */}
      <rect x={4} y={6} width={8} height={26} fill={glow} opacity={0.1} />
      {/* Hero silhouette */}
      <rect x={6} y={10} width={4} height={6} fill={color} opacity={0.4} />
      <rect x={5} y={16} width={6} height={8} fill={color} opacity={0.3} />
      <rect x={6} y={24} width={4} height={4} fill={color} opacity={0.3} />
      {/* Status lights */}
      <rect x={5} y={4} width={2} height={1} fill={color} />
      <rect x={9} y={4} width={2} height={1} fill={color} />
      {/* Base */}
      <rect x={3} y={34} width={10} height={2} fill={color} opacity={0.5} />
      {/* Rarity label area */}
      <text x={8} y={39} textAnchor="middle" fill={color} fontSize={2} fontWeight="bold">{name}</text>
    </svg>
  );
}

export function PodCommon({ size }: SpriteProps) { return <CryoPodBase color="#9ca3af" glow="#6b7280" name="COMMON" />; }
export function PodRare({ size }: SpriteProps) { return <CryoPodBase color="#22d3ee" glow="#06b6d4" name="RARE" />; }
export function PodEpic({ size }: SpriteProps) { return <CryoPodBase color="#a78bfa" glow="#8b5cf6" name="EPIC" />; }
export function PodLegendary({ size }: SpriteProps) { return <CryoPodBase color="#fbbf24" glow="#f59e0b" name="LEGENDARY" />; }
export function PodGenesis({ size }: SpriteProps) { return <CryoPodBase color="#ef4444" glow="#dc2626" name="GENESIS" />; }
