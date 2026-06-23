"use client";

type SpriteProps = { size?: number; className?: string };

function Pixel({ x, y, color, w = 1, h = 1, opacity }: { x: number; y: number; color: string; w?: number; h?: number; opacity?: number }) {
  return <rect x={x} y={y} width={w} height={h} fill={color} opacity={opacity ?? 1} />;
}

// ── EQUIPMENT ICONS (8×8) ──

export function IconBomb({ size = 24, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" shapeRendering="crispEdges" className={className}>
      <Pixel x={3} y={0} color="#ef4444" /><Pixel x={4} y={0} color="#ef4444" />
      <Pixel x={2} y={1} color="#ef4444" /><Pixel x={3} y={1} color="#dc2626" /><Pixel x={4} y={1} color="#dc2626" /><Pixel x={5} y={1} color="#ef4444" />
      <Pixel x={1} y={2} color="#ef4444" /><Pixel x={2} y={2} color="#dc2626" /><Pixel x={3} y={2} color="#fca5a5" /><Pixel x={4} y={2} color="#fca5a5" /><Pixel x={5} y={2} color="#dc2626" /><Pixel x={6} y={2} color="#ef4444" />
      <Pixel x={1} y={3} color="#ef4444" /><Pixel x={2} y={3} color="#dc2626" /><Pixel x={3} y={3} color="#fca5a5" /><Pixel x={4} y={3} color="#fca5a5" /><Pixel x={5} y={3} color="#dc2626" /><Pixel x={6} y={3} color="#ef4444" />
      <Pixel x={2} y={4} color="#ef4444" /><Pixel x={3} y={4} color="#dc2626" /><Pixel x={4} y={4} color="#dc2626" /><Pixel x={5} y={4} color="#ef4444" />
      <Pixel x={3} y={5} color="#ef4444" /><Pixel x={4} y={5} color="#ef4444" />
      {/* Fuse */}
      <Pixel x={3} y={1} color="#fbbf24" /><Pixel x={4} y={0} color="#fbbf24" />
    </svg>
  );
}

export function IconShield({ size = 24, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" shapeRendering="crispEdges" className={className}>
      <Pixel x={2} y={0} color="#22d3ee" /><Pixel x={3} y={0} color="#22d3ee" /><Pixel x={4} y={0} color="#22d3ee" /><Pixel x={5} y={0} color="#22d3ee" />
      <Pixel x={1} y={1} color="#22d3ee" /><Pixel x={2} y={1} color="#06b6d4" /><Pixel x={3} y={1} color="#06b6d4" /><Pixel x={4} y={1} color="#06b6d4" /><Pixel x={5} y={1} color="#06b6d4" /><Pixel x={6} y={1} color="#22d3ee" />
      <Pixel x={1} y={2} color="#22d3ee" /><Pixel x={2} y={2} color="#67e8f9" /><Pixel x={3} y={2} color="#67e8f9" /><Pixel x={4} y={2} color="#67e8f9" /><Pixel x={5} y={2} color="#67e8f9" /><Pixel x={6} y={2} color="#22d3ee" />
      <Pixel x={2} y={3} color="#22d3ee" /><Pixel x={3} y={3} color="#67e8f9" /><Pixel x={4} y={3} color="#67e8f9" /><Pixel x={5} y={3} color="#22d3ee" />
      <Pixel x={3} y={4} color="#22d3ee" /><Pixel x={4} y={4} color="#22d3ee" />
    </svg>
  );
}

export function IconBoots({ size = 24, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" shapeRendering="crispEdges" className={className}>
      <Pixel x={1} y={3} color="#8b4513" /><Pixel x={2} y={3} color="#8b4513" /><Pixel x={3} y={3} color="#8b4513" /><Pixel x={4} y={3} color="#8b4513" /><Pixel x={5} y={3} color="#8b4513" /><Pixel x={6} y={3} color="#8b4513" />
      <Pixel x={0} y={4} color="#8b4513" /><Pixel x={1} y={4} color="#a0522d" /><Pixel x={2} y={4} color="#a0522d" /><Pixel x={3} y={4} color="#a0522d" /><Pixel x={4} y={4} color="#a0522d" /><Pixel x={5} y={4} color="#a0522d" /><Pixel x={6} y={4} color="#a0522d" /><Pixel x={7} y={4} color="#8b4513" />
      <Pixel x={0} y={5} color="#8b4513" /><Pixel x={2} y={5} color="#a0522d" /><Pixel x={3} y={5} color="#a0522d" /><Pixel x={4} y={5} color="#a0522d" /><Pixel x={5} y={5} color="#a0522d" /><Pixel x={7} y={5} color="#8b4513" />
      <Pixel x={0} y={6} color="#8b4513" /><Pixel x={7} y={6} color="#8b4513" />
      <Pixel x={0} y={7} color="#6b3410" /><Pixel x={7} y={7} color="#6b3410" />
      {/* Soles */}
      <Pixel x={1} y={7} color="#6b3410" /><Pixel x={2} y={7} color="#6b3410" /><Pixel x={3} y={7} color="#6b3410" /><Pixel x={4} y={7} color="#6b3410" /><Pixel x={5} y={7} color="#6b3410" /><Pixel x={6} y={7} color="#6b3410" />
    </svg>
  );
}

export function IconArmor({ size = 24, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" shapeRendering="crispEdges" className={className}>
      <Pixel x={1} y={0} color="#a78bfa" /><Pixel x={2} y={0} color="#a78bfa" /><Pixel x={3} y={0} color="#a78bfa" /><Pixel x={4} y={0} color="#a78bfa" /><Pixel x={5} y={0} color="#a78bfa" /><Pixel x={6} y={0} color="#a78bfa" />
      <Pixel x={0} y={1} color="#a78bfa" /><Pixel x={1} y={1} color="#8b5cf6" /><Pixel x={2} y={1} color="#8b5cf6" /><Pixel x={3} y={1} color="#8b5cf6" /><Pixel x={4} y={1} color="#8b5cf6" /><Pixel x={5} y={1} color="#8b5cf6" /><Pixel x={6} y={1} color="#8b5cf6" /><Pixel x={7} y={1} color="#a78bfa" />
      <Pixel x={0} y={2} color="#a78bfa" /><Pixel x={1} y={2} color="#c4b5fd" /><Pixel x={2} y={2} color="#c4b5fd" /><Pixel x={3} y={2} color="#c4b5fd" /><Pixel x={4} y={2} color="#c4b5fd" /><Pixel x={5} y={2} color="#c4b5fd" /><Pixel x={6} y={2} color="#c4b5fd" /><Pixel x={7} y={2} color="#a78bfa" />
      <Pixel x={1} y={3} color="#a78bfa" /><Pixel x={2} y={3} color="#8b5cf6" /><Pixel x={3} y={3} color="#c4b5fd" /><Pixel x={4} y={3} color="#c4b5fd" /><Pixel x={5} y={3} color="#8b5cf6" /><Pixel x={6} y={3} color="#a78bfa" />
      <Pixel x={2} y={4} color="#a78bfa" /><Pixel x={3} y={4} color="#8b5cf6" /><Pixel x={4} y={4} color="#8b5cf6" /><Pixel x={5} y={4} color="#a78bfa" />
      <Pixel x={3} y={5} color="#a78bfa" /><Pixel x={4} y={5} color="#a78bfa" />
    </svg>
  );
}

export function IconHelmet({ size = 24, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" shapeRendering="crispEdges" className={className}>
      <Pixel x={2} y={0} color="#fbbf24" /><Pixel x={3} y={0} color="#fbbf24" /><Pixel x={4} y={0} color="#fbbf24" /><Pixel x={5} y={0} color="#fbbf24" />
      <Pixel x={1} y={1} color="#fbbf24" /><Pixel x={2} y={1} color="#f59e0b" /><Pixel x={3} y={1} color="#f59e0b" /><Pixel x={4} y={1} color="#f59e0b" /><Pixel x={5} y={1} color="#f59e0b" /><Pixel x={6} y={1} color="#fbbf24" />
      <Pixel x={1} y={2} color="#fbbf24" /><Pixel x={2} y={2} color="#fde68a" /><Pixel x={3} y={2} color="#fde68a" /><Pixel x={4} y={2} color="#fde68a" /><Pixel x={5} y={2} color="#fde68a" /><Pixel x={6} y={2} color="#fbbf24" />
      <Pixel x={1} y={3} color="#fbbf24" /><Pixel x={2} y={3} color="#fde68a" /><Pixel x={3} y={3} color="#111" /><Pixel x={4} y={3} color="#111" /><Pixel x={5} y={3} color="#fde68a" /><Pixel x={6} y={3} color="#fbbf24" />
      <Pixel x={2} y={4} color="#fbbf24" /><Pixel x={3} y={4} color="#f59e0b" /><Pixel x={4} y={4} color="#f59e0b" /><Pixel x={5} y={4} color="#fbbf24" />
    </svg>
  );
}

export function IconRing({ size = 24, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" shapeRendering="crispEdges" className={className}>
      <Pixel x={2} y={1} color="#fbbf24" /><Pixel x={3} y={1} color="#fbbf24" /><Pixel x={4} y={1} color="#fbbf24" /><Pixel x={5} y={1} color="#fbbf24" />
      <Pixel x={1} y={2} color="#fbbf24" /><Pixel x={2} y={2} color="#f59e0b" /><Pixel x={3} y={2} color="#fde68a" /><Pixel x={4} y={2} color="#fde68a" /><Pixel x={5} y={2} color="#f59e0b" /><Pixel x={6} y={2} color="#fbbf24" />
      <Pixel x={0} y={3} color="#fbbf24" /><Pixel x={1} y={3} color="#f59e0b" /><Pixel x={2} y={3} color="#fde68a" /><Pixel x={3} y={3} color="#f59e0b" /><Pixel x={4} y={3} color="#f59e0b" /><Pixel x={5} y={3} color="#fde68a" /><Pixel x={6} y={3} color="#f59e0b" /><Pixel x={7} y={3} color="#fbbf24" />
      <Pixel x={0} y={4} color="#fbbf24" /><Pixel x={1} y={4} color="#f59e0b" /><Pixel x={2} y={4} color="#fde68a" /><Pixel x={3} y={4} color="#f59e0b" /><Pixel x={4} y={4} color="#f59e0b" /><Pixel x={5} y={4} color="#fde68a" /><Pixel x={6} y={4} color="#f59e0b" /><Pixel x={7} y={4} color="#fbbf24" />
      <Pixel x={1} y={5} color="#fbbf24" /><Pixel x={2} y={5} color="#f59e0b" /><Pixel x={3} y={5} color="#fde68a" /><Pixel x={4} y={5} color="#fde68a" /><Pixel x={5} y={5} color="#f59e0b" /><Pixel x={6} y={5} color="#fbbf24" />
      <Pixel x={2} y={6} color="#fbbf24" /><Pixel x={3} y={6} color="#fbbf24" /><Pixel x={4} y={6} color="#fbbf24" /><Pixel x={5} y={6} color="#fbbf24" />
    </svg>
  );
}

// ── COSMETIC ICONS (8×8) ──

export function IconCrown({ size = 24, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" shapeRendering="crispEdges" className={className}>
      <Pixel x={0} y={3} color="#fbbf24" /><Pixel x={1} y={3} color="#fbbf24" /><Pixel x={2} y={3} color="#fbbf24" /><Pixel x={3} y={3} color="#fbbf24" /><Pixel x={4} y={3} color="#fbbf24" /><Pixel x={5} y={3} color="#fbbf24" /><Pixel x={6} y={3} color="#fbbf24" /><Pixel x={7} y={3} color="#fbbf24" />
      <Pixel x={0} y={4} color="#f59e0b" /><Pixel x={1} y={4} color="#f59e0b" /><Pixel x={2} y={4} color="#f59e0b" /><Pixel x={3} y={4} color="#f59e0b" /><Pixel x={4} y={4} color="#f59e0b" /><Pixel x={5} y={4} color="#f59e0b" /><Pixel x={6} y={4} color="#f59e0b" /><Pixel x={7} y={4} color="#f59e0b" />
      {/* Gems */}
      <Pixel x={1} y={3} color="#ef4444" /><Pixel x={3} y={3} color="#22d3ee" /><Pixel x={5} y={3} color="#a78bfa" />
      {/* Points */}
      <Pixel x={1} y={2} color="#fbbf24" /><Pixel x={3} y={1} color="#fbbf24" /><Pixel x={5} y={2} color="#fbbf24" />
    </svg>
  );
}

export function IconWings({ size = 24, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 8" shapeRendering="crispEdges" className={className}>
      <Pixel x={0} y={3} color="#d8b4fe" /><Pixel x={1} y={3} color="#d8b4fe" /><Pixel x={2} y={4} color="#d8b4fe" /><Pixel x={3} y={5} color="#d8b4fe" />
      <Pixel x={1} y={2} color="#e9d5ff" /><Pixel x={2} y={3} color="#e9d5ff" /><Pixel x={3} y={4} color="#e9d5ff" />
      <Pixel x={2} y={2} color="#a78bfa" /><Pixel x={3} y={3} color="#a78bfa" /><Pixel x={4} y={4} color="#a78bfa" />
      <Pixel x={7} y={3} color="#d8b4fe" /><Pixel x={8} y={3} color="#d8b4fe" /><Pixel x={7} y={4} color="#d8b4fe" /><Pixel x={6} y={5} color="#d8b4fe" />
      <Pixel x={8} y={2} color="#e9d5ff" /><Pixel x={7} y={3} color="#e9d5ff" /><Pixel x={6} y={4} color="#e9d5ff" />
      <Pixel x={7} y={2} color="#a78bfa" /><Pixel x={6} y={3} color="#a78bfa" /><Pixel x={5} y={4} color="#a78bfa" />
      <Pixel x={4} y={2} color="#c4b5fd" /><Pixel x={5} y={2} color="#c4b5fd" /><Pixel x={4} y={3} color="#c4b5fd" /><Pixel x={5} y={3} color="#c4b5fd" />
    </svg>
  );
}

export function IconAura({ size = 24, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" shapeRendering="crispEdges" className={className}>
      <Pixel x={3} y={0} color="#22d3ee" opacity={0.8} /><Pixel x={4} y={0} color="#22d3ee" opacity={0.8} />
      <Pixel x={2} y={1} color="#22d3ee" opacity={0.6} /><Pixel x={3} y={1} color="#06b6d4" /><Pixel x={4} y={1} color="#06b6d4" /><Pixel x={5} y={1} color="#22d3ee" opacity={0.6} />
      <Pixel x={1} y={2} color="#22d3ee" opacity={0.4} /><Pixel x={2} y={2} color="#06b6d4" /><Pixel x={3} y={2} color="#67e8f9" /><Pixel x={4} y={2} color="#67e8f9" /><Pixel x={5} y={2} color="#06b6d4" /><Pixel x={6} y={2} color="#22d3ee" opacity={0.4} />
      <Pixel x={1} y={3} color="#22d3ee" opacity={0.4} /><Pixel x={2} y={3} color="#06b6d4" /><Pixel x={3} y={3} color="#67e8f9" /><Pixel x={4} y={3} color="#67e8f9" /><Pixel x={5} y={3} color="#06b6d4" /><Pixel x={6} y={3} color="#22d3ee" opacity={0.4} />
      <Pixel x={2} y={4} color="#22d3ee" opacity={0.6} /><Pixel x={3} y={4} color="#06b6d4" /><Pixel x={4} y={4} color="#06b6d4" /><Pixel x={5} y={4} color="#22d3ee" opacity={0.6} />
      <Pixel x={3} y={5} color="#22d3ee" opacity={0.8} /><Pixel x={4} y={5} color="#22d3ee" opacity={0.8} />
    </svg>
  );
}

export function IconTrail({ size = 24, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 6" shapeRendering="crispEdges" className={className}>
      <Pixel x={0} y={2} color="#a78bfa" opacity={0.3} />
      <Pixel x={1} y={2} color="#a78bfa" opacity={0.4} /><Pixel x={1} y={3} color="#a78bfa" opacity={0.3} />
      <Pixel x={2} y={2} color="#a78bfa" opacity={0.5} /><Pixel x={2} y={3} color="#a78bfa" opacity={0.4} />
      <Pixel x={3} y={1} color="#a78bfa" opacity={0.6} /><Pixel x={3} y={2} color="#a78bfa" opacity={0.6} /><Pixel x={3} y={3} color="#a78bfa" opacity={0.5} />
      <Pixel x={4} y={1} color="#c4b5fd" opacity={0.7} /><Pixel x={4} y={2} color="#c4b5fd" opacity={0.7} /><Pixel x={4} y={3} color="#c4b5fd" opacity={0.6} />
      <Pixel x={5} y={1} color="#c4b5fd" opacity={0.8} /><Pixel x={5} y={2} color="#c4b5fd" opacity={0.8} /><Pixel x={5} y={3} color="#c4b5fd" opacity={0.7} />
      <Pixel x={6} y={1} color="#e9d5ff" /><Pixel x={6} y={2} color="#e9d5ff" /><Pixel x={6} y={3} color="#e9d5ff" />
      <Pixel x={7} y={1} color="#e9d5ff" /><Pixel x={7} y={2} color="#e9d5ff" />
      <Pixel x={8} y={1} color="#e9d5ff" /><Pixel x={8} y={2} color="#e9d5ff" />
      <Pixel x={9} y={2} color="#e9d5ff" />
    </svg>
  );
}

export function IconSkin({ size = 24, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" shapeRendering="crispEdges" className={className}>
      <Pixel x={2} y={0} color="#fbbf24" /><Pixel x={3} y={0} color="#fbbf24" /><Pixel x={4} y={0} color="#fbbf24" /><Pixel x={5} y={0} color="#fbbf24" />
      <Pixel x={1} y={1} color="#fca5a5" /><Pixel x={2} y={1} color="#fca5a5" /><Pixel x={3} y={1} color="#fca5a5" /><Pixel x={4} y={1} color="#fca5a5" /><Pixel x={5} y={1} color="#fca5a5" /><Pixel x={6} y={1} color="#fca5a5" />
      <Pixel x={1} y={2} color="#fca5a5" /><Pixel x={2} y={2} color="#fca5a5" /><Pixel x={3} y={2} color="#fca5a5" /><Pixel x={4} y={2} color="#fca5a5" /><Pixel x={5} y={2} color="#fca5a5" /><Pixel x={6} y={2} color="#fca5a5" />
      <Pixel x={2} y={3} color="#fca5a5" /><Pixel x={3} y={3} color="#fca5a5" /><Pixel x={4} y={3} color="#fca5a5" /><Pixel x={5} y={3} color="#fca5a5" />
      <Pixel x={3} y={4} color="#fca5a5" /><Pixel x={4} y={4} color="#fca5a5" />
    </svg>
  );
}

// ── TRAIT BADGES (12×12) ──

export function BadgeIntelligence({ size = 36, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" shapeRendering="crispEdges" className={className}>
      <Pixel x={5} y={0} color="#a78bfa" /><Pixel x={6} y={0} color="#a78bfa" />
      <Pixel x={4} y={1} color="#a78bfa" /><Pixel x={5} y={1} color="#8b5cf6" /><Pixel x={6} y={1} color="#8b5cf6" /><Pixel x={7} y={1} color="#a78bfa" />
      <Pixel x={3} y={2} color="#a78bfa" /><Pixel x={4} y={2} color="#c4b5fd" /><Pixel x={5} y={2} color="#c4b5fd" /><Pixel x={6} y={2} color="#c4b5fd" /><Pixel x={7} y={2} color="#c4b5fd" /><Pixel x={8} y={2} color="#a78bfa" />
      <Pixel x={3} y={3} color="#a78bfa" /><Pixel x={4} y={3} color="#c4b5fd" /><Pixel x={5} y={3} color="#c4b5fd" /><Pixel x={6} y={3} color="#c4b5fd" /><Pixel x={7} y={3} color="#c4b5fd" /><Pixel x={8} y={3} color="#a78bfa" />
      <Pixel x={4} y={4} color="#a78bfa" /><Pixel x={5} y={4} color="#8b5cf6" /><Pixel x={6} y={4} color="#8b5cf6" /><Pixel x={7} y={4} color="#a78bfa" />
      {/* Brain icon */}
      <Pixel x={5} y={5} color="#a78bfa" /><Pixel x={6} y={5} color="#a78bfa" />
      <Pixel x={4} y={6} color="#a78bfa" /><Pixel x={5} y={6} color="#8b5cf6" /><Pixel x={6} y={6} color="#8b5cf6" /><Pixel x={7} y={6} color="#a78bfa" />
      <Pixel x={3} y={7} color="#a78bfa" /><Pixel x={4} y={7} color="#c4b5fd" /><Pixel x={5} y={7} color="#c4b5fd" /><Pixel x={6} y={7} color="#c4b5fd" /><Pixel x={7} y={7} color="#c4b5fd" /><Pixel x={8} y={7} color="#a78bfa" />
      <Pixel x={3} y={8} color="#a78bfa" /><Pixel x={4} y={8} color="#c4b5fd" /><Pixel x={5} y={8} color="#c4b5fd" /><Pixel x={6} y={8} color="#c4b5fd" /><Pixel x={7} y={8} color="#c4b5fd" /><Pixel x={8} y={8} color="#a78bfa" />
      <Pixel x={4} y={9} color="#a78bfa" /><Pixel x={5} y={9} color="#8b5cf6" /><Pixel x={6} y={9} color="#8b5cf6" /><Pixel x={7} y={9} color="#a78bfa" />
      <Pixel x={5} y={10} color="#a78bfa" /><Pixel x={6} y={10} color="#a78bfa" />
    </svg>
  );
}

export function BadgeStrength({ size = 36, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" shapeRendering="crispEdges" className={className}>
      <Pixel x={5} y={0} color="#ef4444" /><Pixel x={6} y={0} color="#ef4444" />
      <Pixel x={4} y={1} color="#ef4444" /><Pixel x={5} y={1} color="#dc2626" /><Pixel x={6} y={1} color="#dc2626" /><Pixel x={7} y={1} color="#ef4444" />
      <Pixel x={3} y={2} color="#ef4444" /><Pixel x={4} y={2} color="#fca5a5" /><Pixel x={5} y={2} color="#fca5a5" /><Pixel x={6} y={2} color="#fca5a5" /><Pixel x={7} y={2} color="#fca5a5" /><Pixel x={8} y={2} color="#ef4444" />
      <Pixel x={3} y={3} color="#ef4444" /><Pixel x={4} y={3} color="#fca5a5" /><Pixel x={5} y={3} color="#dc2626" /><Pixel x={6} y={3} color="#dc2626" /><Pixel x={7} y={3} color="#fca5a5" /><Pixel x={8} y={3} color="#ef4444" />
      <Pixel x={4} y={4} color="#ef4444" /><Pixel x={5} y={4} color="#dc2626" /><Pixel x={6} y={4} color="#dc2626" /><Pixel x={7} y={4} color="#ef4444" />
      {/* Arm */}
      <Pixel x={5} y={5} color="#ef4444" /><Pixel x={6} y={5} color="#ef4444" />
      <Pixel x={5} y={6} color="#ef4444" /><Pixel x={6} y={6} color="#ef4444" />
      <Pixel x={5} y={7} color="#ef4444" /><Pixel x={6} y={7} color="#ef4444" />
    </svg>
  );
}

export function BadgeSpeed({ size = 36, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" shapeRendering="crispEdges" className={className}>
      <Pixel x={6} y={0} color="#22d3ee" />
      <Pixel x={5} y={1} color="#22d3ee" /><Pixel x={6} y={1} color="#06b6d4" /><Pixel x={7} y={1} color="#22d3ee" />
      <Pixel x={4} y={2} color="#22d3ee" /><Pixel x={5} y={2} color="#67e8f9" /><Pixel x={6} y={2} color="#67e8f9" /><Pixel x={7} y={2} color="#67e8f9" /><Pixel x={8} y={2} color="#22d3ee" />
      <Pixel x={3} y={3} color="#22d3ee" /><Pixel x={4} y={3} color="#67e8f9" /><Pixel x={5} y={3} color="#06b6d4" /><Pixel x={6} y={3} color="#06b6d4" /><Pixel x={7} y={3} color="#67e8f9" /><Pixel x={8} y={3} color="#22d3ee" />
      <Pixel x={2} y={4} color="#22d3ee" /><Pixel x={3} y={4} color="#67e8f9" /><Pixel x={4} y={4} color="#06b6d4" /><Pixel x={5} y={4} color="#22d3ee" /><Pixel x={6} y={4} color="#22d3ee" /><Pixel x={7} y={4} color="#67e8f9" /><Pixel x={8} y={4} color="#22d3ee" />
      <Pixel x={2} y={5} color="#22d3ee" /><Pixel x={3} y={5} color="#06b6d4" /><Pixel x={4} y={5} color="#06b6d4" /><Pixel x={5} y={5} color="#22d3ee" /><Pixel x={6} y={5} color="#22d3ee" /><Pixel x={7} y={5} color="#06b6d4" /><Pixel x={8} y={5} color="#22d3ee" />
    </svg>
  );
}

export function BadgeDefense({ size = 36, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" shapeRendering="crispEdges" className={className}>
      <Pixel x={4} y={0} color="#34d399" /><Pixel x={5} y={0} color="#34d399" /><Pixel x={6} y={0} color="#34d399" /><Pixel x={7} y={0} color="#34d399" />
      <Pixel x={3} y={1} color="#34d399" /><Pixel x={4} y={1} color="#10b981" /><Pixel x={5} y={1} color="#10b981" /><Pixel x={6} y={1} color="#10b981" /><Pixel x={7} y={1} color="#10b981" /><Pixel x={8} y={1} color="#34d399" />
      <Pixel x={2} y={2} color="#34d399" /><Pixel x={3} y={2} color="#6ee7b7" /><Pixel x={4} y={2} color="#6ee7b7" /><Pixel x={5} y={2} color="#6ee7b7" /><Pixel x={6} y={2} color="#6ee7b7" /><Pixel x={7} y={2} color="#6ee7b7" /><Pixel x={8} y={2} color="#6ee7b7" /><Pixel x={9} y={2} color="#34d399" />
      <Pixel x={2} y={3} color="#34d399" /><Pixel x={3} y={3} color="#6ee7b7" /><Pixel x={4} y={3} color="#6ee7b7" /><Pixel x={5} y={3} color="#6ee7b7" /><Pixel x={6} y={3} color="#6ee7b7" /><Pixel x={7} y={3} color="#6ee7b7" /><Pixel x={8} y={3} color="#6ee7b7" /><Pixel x={9} y={3} color="#34d399" />
      <Pixel x={3} y={4} color="#34d399" /><Pixel x={4} y={4} color="#10b981" /><Pixel x={5} y={4} color="#6ee7b7" /><Pixel x={6} y={4} color="#6ee7b7" /><Pixel x={7} y={4} color="#10b981" /><Pixel x={8} y={4} color="#34d399" />
      <Pixel x={4} y={5} color="#34d399" /><Pixel x={5} y={5} color="#10b981" /><Pixel x={6} y={5} color="#10b981" /><Pixel x={7} y={5} color="#34d399" />
      <Pixel x={5} y={6} color="#34d399" /><Pixel x={6} y={6} color="#34d399" />
    </svg>
  );
}

export function BadgeLuck({ size = 36, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" shapeRendering="crispEdges" className={className}>
      <Pixel x={6} y={0} color="#fbbf24" />
      <Pixel x={5} y={1} color="#fbbf24" /><Pixel x={6} y={1} color="#f59e0b" /><Pixel x={7} y={1} color="#fbbf24" />
      <Pixel x={4} y={2} color="#fbbf24" /><Pixel x={5} y={2} color="#fde68a" /><Pixel x={6} y={2} color="#fde68a" /><Pixel x={7} y={2} color="#fde68a" /><Pixel x={8} y={2} color="#fbbf24" />
      <Pixel x={3} y={3} color="#fbbf24" /><Pixel x={4} y={3} color="#fde68a" /><Pixel x={5} y={3} color="#f59e0b" /><Pixel x={6} y={3} color="#f59e0b" /><Pixel x={7} y={3} color="#fde68a" /><Pixel x={8} y={3} color="#fbbf24" />
      <Pixel x={4} y={4} color="#fbbf24" /><Pixel x={5} y={4} color="#f59e0b" /><Pixel x={6} y={4} color="#f59e0b" /><Pixel x={7} y={4} color="#fbbf24" />
      <Pixel x={5} y={5} color="#fbbf24" /><Pixel x={6} y={5} color="#fbbf24" />
      {/* Clover leaves */}
      <Pixel x={4} y={6} color="#34d399" /><Pixel x={5} y={6} color="#34d399" /><Pixel x={6} y={6} color="#34d399" /><Pixel x={7} y={6} color="#34d399" />
      <Pixel x={5} y={7} color="#34d399" /><Pixel x={6} y={7} color="#34d399" />
    </svg>
  );
}

export function BadgeCharisma({ size = 36, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" shapeRendering="crispEdges" className={className}>
      <Pixel x={5} y={0} color="#f472b6" /><Pixel x={6} y={0} color="#f472b6" />
      <Pixel x={4} y={1} color="#f472b6" /><Pixel x={5} y={1} color="#ec4899" /><Pixel x={6} y={1} color="#ec4899" /><Pixel x={7} y={1} color="#f472b6" />
      <Pixel x={3} y={2} color="#f472b6" /><Pixel x={4} y={2} color="#f9a8d4" /><Pixel x={5} y={2} color="#f9a8d4" /><Pixel x={6} y={2} color="#f9a8d4" /><Pixel x={7} y={2} color="#f9a8d4" /><Pixel x={8} y={2} color="#f472b6" />
      <Pixel x={3} y={3} color="#f472b6" /><Pixel x={4} y={3} color="#f9a8d4" /><Pixel x={5} y={3} color="#f9a8d4" /><Pixel x={6} y={3} color="#f9a8d4" /><Pixel x={7} y={3} color="#f9a8d4" /><Pixel x={8} y={3} color="#f472b6" />
      <Pixel x={4} y={4} color="#f472b6" /><Pixel x={5} y={4} color="#ec4899" /><Pixel x={6} y={4} color="#ec4899" /><Pixel x={7} y={4} color="#f472b6" />
      {/* Heart */}
      <Pixel x={5} y={5} color="#f472b6" /><Pixel x={6} y={5} color="#f472b6" />
      <Pixel x={4} y={6} color="#f472b6" /><Pixel x={5} y={6} color="#ec4899" /><Pixel x={6} y={6} color="#ec4899" /><Pixel x={7} y={6} color="#f472b6" />
      <Pixel x={5} y={7} color="#f472b6" /><Pixel x={6} y={7} color="#f472b6" />
    </svg>
  );
}

// ── LEGACY BADGES (12×12) ──

export function BadgeLegacyCore({ size = 36, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" shapeRendering="crispEdges" className={className}>
      <Pixel x={3} y={2} color="#fbbf24" /><Pixel x={4} y={2} color="#fbbf24" /><Pixel x={5} y={2} color="#fbbf24" /><Pixel x={6} y={2} color="#fbbf24" /><Pixel x={7} y={2} color="#fbbf24" /><Pixel x={8} y={2} color="#fbbf24" />
      <Pixel x={2} y={3} color="#fbbf24" /><Pixel x={3} y={3} color="#f59e0b" /><Pixel x={4} y={3} color="#f59e0b" /><Pixel x={5} y={3} color="#f59e0b" /><Pixel x={6} y={3} color="#f59e0b" /><Pixel x={7} y={3} color="#f59e0b" /><Pixel x={8} y={3} color="#f59e0b" /><Pixel x={9} y={3} color="#fbbf24" />
      <Pixel x={1} y={4} color="#fbbf24" /><Pixel x={2} y={4} color="#fde68a" /><Pixel x={3} y={4} color="#fde68a" /><Pixel x={4} y={4} color="#fde68a" /><Pixel x={5} y={4} color="#fde68a" /><Pixel x={6} y={4} color="#fde68a" /><Pixel x={7} y={4} color="#fde68a" /><Pixel x={8} y={4} color="#fde68a" /><Pixel x={9} y={4} color="#fde68a" /><Pixel x={10} y={4} color="#fbbf24" />
      <Pixel x={1} y={5} color="#fbbf24" /><Pixel x={2} y={5} color="#fde68a" /><Pixel x={3} y={5} color="#f59e0b" /><Pixel x={4} y={5} color="#f59e0b" /><Pixel x={5} y={5} color="#fbbf24" /><Pixel x={6} y={5} color="#fbbf24" /><Pixel x={7} y={5} color="#f59e0b" /><Pixel x={8} y={5} color="#f59e0b" /><Pixel x={9} y={5} color="#fde68a" /><Pixel x={10} y={5} color="#fbbf24" />
      <Pixel x={2} y={6} color="#fbbf24" /><Pixel x={3} y={6} color="#fde68a" /><Pixel x={4} y={6} color="#fde68a" /><Pixel x={5} y={6} color="#fde68a" /><Pixel x={6} y={6} color="#fde68a" /><Pixel x={7} y={6} color="#fde68a" /><Pixel x={8} y={6} color="#fde68a" /><Pixel x={9} y={6} color="#fbbf24" />
      <Pixel x={3} y={7} color="#fbbf24" /><Pixel x={4} y={7} color="#f59e0b" /><Pixel x={5} y={7} color="#f59e0b" /><Pixel x={6} y={7} color="#f59e0b" /><Pixel x={7} y={7} color="#f59e0b" /><Pixel x={8} y={7} color="#fbbf24" />
      <Pixel x={4} y={8} color="#fbbf24" /><Pixel x={5} y={8} color="#fbbf24" /><Pixel x={6} y={8} color="#fbbf24" /><Pixel x={7} y={8} color="#fbbf24" />
    </svg>
  );
}

export function BadgeKnowledge({ size = 36, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" shapeRendering="crispEdges" className={className}>
      <Pixel x={2} y={1} color="#22d3ee" /><Pixel x={3} y={1} color="#22d3ee" /><Pixel x={4} y={1} color="#22d3ee" /><Pixel x={5} y={1} color="#22d3ee" /><Pixel x={6} y={1} color="#22d3ee" /><Pixel x={7} y={1} color="#22d3ee" /><Pixel x={8} y={1} color="#22d3ee" /><Pixel x={9} y={1} color="#22d3ee" />
      <Pixel x={2} y={2} color="#22d3ee" /><Pixel x={3} y={2} color="#06b6d4" /><Pixel x={4} y={2} color="#06b6d4" /><Pixel x={5} y={2} color="#06b6d4" /><Pixel x={6} y={2} color="#06b6d4" /><Pixel x={7} y={2} color="#06b6d4" /><Pixel x={8} y={2} color="#06b6d4" /><Pixel x={9} y={2} color="#22d3ee" />
      <Pixel x={3} y={3} color="#22d3ee" /><Pixel x={4} y={3} color="#67e8f9" /><Pixel x={5} y={3} color="#67e8f9" /><Pixel x={6} y={3} color="#67e8f9" /><Pixel x={7} y={3} color="#67e8f9" /><Pixel x={8} y={3} color="#22d3ee" />
      <Pixel x={4} y={4} color="#22d3ee" /><Pixel x={5} y={4} color="#67e8f9" /><Pixel x={6} y={4} color="#67e8f9" /><Pixel x={7} y={4} color="#22d3ee" />
      <Pixel x={5} y={5} color="#22d3ee" /><Pixel x={6} y={5} color="#22d3ee" />
    </svg>
  );
}

export function BadgeHeritage({ size = 36, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" shapeRendering="crispEdges" className={className}>
      <Pixel x={5} y={0} color="#a78bfa" /><Pixel x={6} y={0} color="#a78bfa" />
      <Pixel x={4} y={1} color="#a78bfa" /><Pixel x={5} y={1} color="#8b5cf6" /><Pixel x={6} y={1} color="#8b5cf6" /><Pixel x={7} y={1} color="#a78bfa" />
      {/* Tree trunk */}
      <Pixel x={5} y={2} color="#a78bfa" /><Pixel x={6} y={2} color="#a78bfa" />
      <Pixel x={5} y={3} color="#a78bfa" /><Pixel x={6} y={3} color="#a78bfa" />
      <Pixel x={5} y={4} color="#a78bfa" /><Pixel x={6} y={4} color="#a78bfa" />
      <Pixel x={5} y={5} color="#a78bfa" /><Pixel x={6} y={5} color="#a78bfa" />
      <Pixel x={5} y={6} color="#a78bfa" /><Pixel x={6} y={6} color="#a78bfa" />
      <Pixel x={5} y={7} color="#a78bfa" /><Pixel x={6} y={7} color="#a78bfa" />
      {/* Branches */}
      <Pixel x={3} y={3} color="#a78bfa" /><Pixel x={4} y={3} color="#a78bfa" />
      <Pixel x={7} y={3} color="#a78bfa" /><Pixel x={8} y={3} color="#a78bfa" />
      <Pixel x={3} y={4} color="#a78bfa" />
      <Pixel x={8} y={4} color="#a78bfa" />
      {/* Roots */}
      <Pixel x={4} y={8} color="#a78bfa" /><Pixel x={5} y={8} color="#a78bfa" /><Pixel x={6} y={8} color="#a78bfa" /><Pixel x={7} y={8} color="#a78bfa" />
      <Pixel x={3} y={9} color="#a78bfa" /><Pixel x={8} y={9} color="#a78bfa" />
    </svg>
  );
}

export function BadgeTradition({ size = 36, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" shapeRendering="crispEdges" className={className}>
      <Pixel x={4} y={1} color="#f472b6" /><Pixel x={5} y={1} color="#f472b6" /><Pixel x={6} y={1} color="#f472b6" /><Pixel x={7} y={1} color="#f472b6" />
      <Pixel x={3} y={2} color="#f472b6" /><Pixel x={4} y={2} color="#ec4899" /><Pixel x={5} y={2} color="#ec4899" /><Pixel x={6} y={2} color="#ec4899" /><Pixel x={7} y={2} color="#ec4899" /><Pixel x={8} y={2} color="#f472b6" />
      <Pixel x={3} y={3} color="#f472b6" /><Pixel x={4} y={3} color="#f9a8d4" /><Pixel x={5} y={3} color="#f9a8d4" /><Pixel x={6} y={3} color="#f9a8d4" /><Pixel x={7} y={3} color="#f9a8d4" /><Pixel x={8} y={3} color="#f472b6" />
      <Pixel x={4} y={4} color="#f472b6" /><Pixel x={5} y={4} color="#ec4899" /><Pixel x={6} y={4} color="#ec4899" /><Pixel x={7} y={4} color="#f472b6" />
      <Pixel x={5} y={5} color="#f472b6" /><Pixel x={6} y={5} color="#f472b6" />
      {/* Torch */}
      <Pixel x={5} y={6} color="#fbbf24" /><Pixel x={6} y={6} color="#fbbf24" />
      <Pixel x={5} y={7} color="#f59e0b" /><Pixel x={6} y={7} color="#f59e0b" />
      <Pixel x={5} y={8} color="#8b4513" /><Pixel x={6} y={8} color="#8b4513" />
    </svg>
  );
}

// ── BLOODLINE BADGES (12×12) ──

export function BadgeFamilyTree({ size = 36, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" shapeRendering="crispEdges" className={className}>
      {/* Root */}
      <Pixel x={5} y={0} color="#34d399" /><Pixel x={6} y={0} color="#34d399" />
      <Pixel x={5} y={1} color="#34d399" /><Pixel x={6} y={1} color="#34d399" />
      {/* Trunk */}
      <Pixel x={5} y={2} color="#34d399" /><Pixel x={6} y={2} color="#34d399" />
      {/* Branches */}
      <Pixel x={4} y={3} color="#34d399" /><Pixel x={5} y={3} color="#10b981" /><Pixel x={6} y={3} color="#10b981" /><Pixel x={7} y={3} color="#34d399" />
      <Pixel x={3} y={4} color="#34d399" /><Pixel x={4} y={4} color="#34d399" /><Pixel x={7} y={4} color="#34d399" /><Pixel x={8} y={4} color="#34d399" />
      {/* Leaves */}
      <Pixel x={2} y={3} color="#6ee7b7" /><Pixel x={1} y={4} color="#6ee7b7" />
      <Pixel x={9} y={3} color="#6ee7b7" /><Pixel x={10} y={4} color="#6ee7b7" />
      {/* People */}
      <Pixel x={1} y={5} color="#6ee7b7" /><Pixel x={2} y={5} color="#6ee7b7" /><Pixel x={4} y={5} color="#6ee7b7" /><Pixel x={5} y={5} color="#6ee7b7" /><Pixel x={7} y={5} color="#6ee7b7" /><Pixel x={8} y={5} color="#6ee7b7" /><Pixel x={10} y={5} color="#6ee7b7" /><Pixel x={10} y={6} color="#6ee7b7" />
    </svg>
  );
}

export function BadgeLineage({ size = 36, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" shapeRendering="crispEdges" className={className}>
      <Pixel x={5} y={0} color="#fbbf24" /><Pixel x={6} y={0} color="#fbbf24" />
      <Pixel x={5} y={1} color="#fbbf24" /><Pixel x={6} y={1} color="#fbbf24" />
      <Pixel x={4} y={2} color="#fbbf24" /><Pixel x={5} y={2} color="#f59e0b" /><Pixel x={6} y={2} color="#f59e0b" /><Pixel x={7} y={2} color="#fbbf24" />
      {/* Connecting line */}
      <Pixel x={3} y={3} color="#fbbf24" /><Pixel x={4} y={3} color="#fde68a" /><Pixel x={5} y={3} color="#fde68a" /><Pixel x={6} y={3} color="#fde68a" /><Pixel x={7} y={3} color="#fde68a" /><Pixel x={8} y={3} color="#fbbf24" />
      <Pixel x={2} y={4} color="#fbbf24" /><Pixel x={3} y={4} color="#f59e0b" /><Pixel x={4} y={4} color="#fbbf24" /><Pixel x={5} y={4} color="#fbbf24" /><Pixel x={6} y={4} color="#fbbf24" /><Pixel x={7} y={4} color="#fbbf24" /><Pixel x={8} y={4} color="#f59e0b" /><Pixel x={9} y={4} color="#fbbf24" />
      <Pixel x={2} y={5} color="#fbbf24" /><Pixel x={3} y={5} color="#f59e0b" /><Pixel x={8} y={5} color="#f59e0b" /><Pixel x={9} y={5} color="#fbbf24" />
      <Pixel x={1} y={6} color="#fbbf24" /><Pixel x={2} y={6} color="#fbbf24" /><Pixel x={9} y={6} color="#fbbf24" /><Pixel x={10} y={6} color="#fbbf24" />
    </svg>
  );
}

export function BadgeDynasty({ size = 36, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" shapeRendering="crispEdges" className={className}>
      <Pixel x={5} y={0} color="#a78bfa" /><Pixel x={6} y={0} color="#a78bfa" />
      <Pixel x={4} y={1} color="#a78bfa" /><Pixel x={5} y={1} color="#8b5cf6" /><Pixel x={6} y={1} color="#8b5cf6" /><Pixel x={7} y={1} color="#a78bfa" />
      <Pixel x={3} y={2} color="#a78bfa" /><Pixel x={4} y={2} color="#c4b5fd" /><Pixel x={5} y={2} color="#8b5cf6" /><Pixel x={6} y={2} color="#8b5cf6" /><Pixel x={7} y={2} color="#c4b5fd" /><Pixel x={8} y={2} color="#a78bfa" />
      <Pixel x={3} y={3} color="#a78bfa" /><Pixel x={4} y={3} color="#c4b5fd" /><Pixel x={5} y={3} color="#c4b5fd" /><Pixel x={6} y={3} color="#c4b5fd" /><Pixel x={7} y={3} color="#c4b5fd" /><Pixel x={8} y={3} color="#a78bfa" />
      <Pixel x={4} y={4} color="#a78bfa" /><Pixel x={5} y={4} color="#8b5cf6" /><Pixel x={6} y={4} color="#8b5cf6" /><Pixel x={7} y={4} color="#a78bfa" />
      {/* Crown */}
      <Pixel x={5} y={5} color="#fbbf24" /><Pixel x={6} y={5} color="#fbbf24" />
      <Pixel x={4} y={6} color="#fbbf24" /><Pixel x={5} y={6} color="#f59e0b" /><Pixel x={6} y={6} color="#f59e0b" /><Pixel x={7} y={6} color="#fbbf24" />
    </svg>
  );
}

// ── UI ELEMENTS (8×8) ──

export function UIHeart({ size = 24, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" shapeRendering="crispEdges" className={className}>
      <Pixel x={1} y={1} color="#f472b6" /><Pixel x={2} y={1} color="#f472b6" /><Pixel x={5} y={1} color="#f472b6" /><Pixel x={6} y={1} color="#f472b6" />
      <Pixel x={0} y={2} color="#f472b6" /><Pixel x={1} y={2} color="#ec4899" /><Pixel x={2} y={2} color="#ec4899" /><Pixel x={3} y={2} color="#f472b6" /><Pixel x={4} y={2} color="#f472b6" /><Pixel x={5} y={2} color="#ec4899" /><Pixel x={6} y={2} color="#ec4899" /><Pixel x={7} y={2} color="#f472b6" />
      <Pixel x={0} y={3} color="#f472b6" /><Pixel x={1} y={3} color="#ec4899" /><Pixel x={2} y={3} color="#ec4899" /><Pixel x={3} y={3} color="#ec4899" /><Pixel x={4} y={3} color="#ec4899" /><Pixel x={5} y={3} color="#ec4899" /><Pixel x={6} y={3} color="#ec4899" /><Pixel x={7} y={3} color="#f472b6" />
      <Pixel x={1} y={4} color="#f472b6" /><Pixel x={2} y={4} color="#ec4899" /><Pixel x={3} y={4} color="#ec4899" /><Pixel x={4} y={4} color="#ec4899" /><Pixel x={5} y={4} color="#ec4899" /><Pixel x={6} y={4} color="#f472b6" />
      <Pixel x={2} y={5} color="#f472b6" /><Pixel x={3} y={5} color="#ec4899" /><Pixel x={4} y={5} color="#ec4899" /><Pixel x={5} y={5} color="#f472b6" />
      <Pixel x={3} y={6} color="#f472b6" /><Pixel x={4} y={6} color="#f472b6" />
    </svg>
  );
}

export function UICoin({ size = 24, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" shapeRendering="crispEdges" className={className}>
      <Pixel x={2} y={0} color="#fbbf24" /><Pixel x={3} y={0} color="#fbbf24" /><Pixel x={4} y={0} color="#fbbf24" /><Pixel x={5} y={0} color="#fbbf24" />
      <Pixel x={1} y={1} color="#fbbf24" /><Pixel x={2} y={1} color="#f59e0b" /><Pixel x={3} y={1} color="#f59e0b" /><Pixel x={4} y={1} color="#f59e0b" /><Pixel x={5} y={1} color="#f59e0b" /><Pixel x={6} y={1} color="#fbbf24" />
      <Pixel x={1} y={2} color="#fbbf24" /><Pixel x={2} y={2} color="#fde68a" /><Pixel x={3} y={2} color="#fde68a" /><Pixel x={4} y={2} color="#fde68a" /><Pixel x={5} y={2} color="#fde68a" /><Pixel x={6} y={2} color="#fbbf24" />
      <Pixel x={1} y={3} color="#fbbf24" /><Pixel x={2} y={3} color="#fde68a" /><Pixel x={3} y={3} color="#f59e0b" /><Pixel x={4} y={3} color="#f59e0b" /><Pixel x={5} y={3} color="#fde68a" /><Pixel x={6} y={3} color="#fbbf24" />
      <Pixel x={1} y={4} color="#fbbf24" /><Pixel x={2} y={4} color="#fde68a" /><Pixel x={3} y={4} color="#fde68a" /><Pixel x={4} y={4} color="#fde68a" /><Pixel x={5} y={4} color="#fde68a" /><Pixel x={6} y={4} color="#fbbf24" />
      <Pixel x={1} y={5} color="#fbbf24" /><Pixel x={2} y={5} color="#f59e0b" /><Pixel x={3} y={5} color="#f59e0b" /><Pixel x={4} y={5} color="#f59e0b" /><Pixel x={5} y={5} color="#f59e0b" /><Pixel x={6} y={5} color="#fbbf24" />
      <Pixel x={2} y={6} color="#fbbf24" /><Pixel x={3} y={6} color="#fbbf24" /><Pixel x={4} y={6} color="#fbbf24" /><Pixel x={5} y={6} color="#fbbf24" />
    </svg>
  );
}

export function UIStar({ size = 24, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" shapeRendering="crispEdges" className={className}>
      <Pixel x={3} y={0} color="#fbbf24" /><Pixel x={4} y={0} color="#fbbf24" />
      <Pixel x={2} y={1} color="#fbbf24" /><Pixel x={5} y={1} color="#fbbf24" />
      <Pixel x={1} y={2} color="#fbbf24" /><Pixel x={2} y={2} color="#f59e0b" /><Pixel x={3} y={2} color="#f59e0b" /><Pixel x={4} y={2} color="#f59e0b" /><Pixel x={5} y={2} color="#f59e0b" /><Pixel x={6} y={2} color="#fbbf24" />
      <Pixel x={2} y={3} color="#fbbf24" /><Pixel x={3} y={3} color="#fde68a" /><Pixel x={4} y={3} color="#fde68a" /><Pixel x={5} y={3} color="#fbbf24" />
      <Pixel x={3} y={4} color="#fbbf24" /><Pixel x={4} y={4} color="#fbbf24" />
    </svg>
  );
}

export function UILevel({ size = 24, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" shapeRendering="crispEdges" className={className}>
      <Pixel x={3} y={0} color="#22d3ee" /><Pixel x={4} y={0} color="#22d3ee" />
      <Pixel x={2} y={1} color="#22d3ee" /><Pixel x={3} y={1} color="#06b6d4" /><Pixel x={4} y={1} color="#06b6d4" /><Pixel x={5} y={1} color="#22d3ee" />
      <Pixel x={1} y={2} color="#22d3ee" /><Pixel x={2} y={2} color="#67e8f9" /><Pixel x={3} y={2} color="#67e8f9" /><Pixel x={4} y={2} color="#67e8f9" /><Pixel x={5} y={2} color="#67e8f9" /><Pixel x={6} y={2} color="#22d3ee" />
      <Pixel x={0} y={3} color="#22d3ee" /><Pixel x={1} y={3} color="#67e8f9" /><Pixel x={2} y={3} color="#67e8f9" /><Pixel x={3} y={3} color="#06b6d4" /><Pixel x={4} y={3} color="#06b6d4" /><Pixel x={5} y={3} color="#67e8f9" /><Pixel x={6} y={3} color="#67e8f9" /><Pixel x={7} y={3} color="#22d3ee" />
      <Pixel x={1} y={4} color="#22d3ee" /><Pixel x={2} y={4} color="#67e8f9" /><Pixel x={3} y={4} color="#67e8f9" /><Pixel x={4} y={4} color="#67e8f9" /><Pixel x={5} y={4} color="#67e8f9" /><Pixel x={6} y={4} color="#22d3ee" />
      <Pixel x={2} y={5} color="#22d3ee" /><Pixel x={3} y={5} color="#06b6d4" /><Pixel x={4} y={5} color="#06b6d4" /><Pixel x={5} y={5} color="#22d3ee" />
      <Pixel x={3} y={6} color="#22d3ee" /><Pixel x={4} y={6} color="#22d3ee" />
    </svg>
  );
}

export function UIXP({ size = 24, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" shapeRendering="crispEdges" className={className}>
      <Pixel x={1} y={0} color="#a78bfa" /><Pixel x={2} y={0} color="#a78bfa" />
      <Pixel x={1} y={1} color="#a78bfa" /><Pixel x={2} y={1} color="#a78bfa" />
      <Pixel x={1} y={2} color="#a78bfa" /><Pixel x={2} y={2} color="#a78bfa" /><Pixel x={3} y={2} color="#a78bfa" />
      <Pixel x={1} y={3} color="#a78bfa" /><Pixel x={2} y={3} color="#a78bfa" />
      <Pixel x={1} y={4} color="#a78bfa" /><Pixel x={2} y={4} color="#a78bfa" />
      <Pixel x={3} y={5} color="#a78bfa" /><Pixel x={4} y={5} color="#a78bfa" />
      <Pixel x={5} y={6} color="#a78bfa" /><Pixel x={6} y={6} color="#a78bfa" />
    </svg>
  );
}

export function UITimer({ size = 24, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" shapeRendering="crispEdges" className={className}>
      <Pixel x={3} y={0} color="#f59e0b" /><Pixel x={4} y={0} color="#f59e0b" />
      <Pixel x={3} y={1} color="#fbbf24" /><Pixel x={4} y={1} color="#fbbf24" />
      <Pixel x={1} y={2} color="#fbbf24" /><Pixel x={2} y={2} color="#f59e0b" /><Pixel x={3} y={2} color="#fde68a" /><Pixel x={4} y={2} color="#fde68a" /><Pixel x={5} y={2} color="#f59e0b" /><Pixel x={6} y={2} color="#fbbf24" />
      <Pixel x={1} y={3} color="#fbbf24" /><Pixel x={2} y={3} color="#f59e0b" /><Pixel x={3} y={3} color="#fde68a" /><Pixel x={4} y={3} color="#fde68a" /><Pixel x={5} y={3} color="#f59e0b" /><Pixel x={6} y={3} color="#fbbf24" />
      <Pixel x={2} y={4} color="#fbbf24" /><Pixel x={3} y={4} color="#f59e0b" /><Pixel x={4} y={4} color="#f59e0b" /><Pixel x={5} y={4} color="#fbbf24" />
      <Pixel x={3} y={5} color="#fbbf24" /><Pixel x={4} y={5} color="#fbbf24" />
    </svg>
  );
}

// ── MARKETPLACE ASSETS (12×12) ──

export function MarketCart({ size = 36, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" shapeRendering="crispEdges" className={className}>
      <Pixel x={1} y={1} color="#22d3ee" /><Pixel x={2} y={1} color="#22d3ee" /><Pixel x={3} y={1} color="#22d3ee" /><Pixel x={4} y={1} color="#22d3ee" /><Pixel x={5} y={1} color="#22d3ee" /><Pixel x={6} y={1} color="#22d3ee" />
      <Pixel x={0} y={2} color="#22d3ee" /><Pixel x={1} y={2} color="#06b6d4" /><Pixel x={2} y={2} color="#06b6d4" /><Pixel x={3} y={2} color="#06b6d4" /><Pixel x={4} y={2} color="#06b6d4" /><Pixel x={5} y={2} color="#06b6d4" /><Pixel x={6} y={2} color="#06b6d4" /><Pixel x={7} y={2} color="#22d3ee" />
      <Pixel x={0} y={3} color="#22d3ee" /><Pixel x={1} y={3} color="#67e8f9" /><Pixel x={2} y={3} color="#67e8f9" /><Pixel x={5} y={3} color="#67e8f9" /><Pixel x={6} y={3} color="#67e8f9" /><Pixel x={7} y={3} color="#22d3ee" />
      <Pixel x={0} y={4} color="#22d3ee" /><Pixel x={1} y={4} color="#67e8f9" /><Pixel x={2} y={4} color="#67e8f9" /><Pixel x={5} y={4} color="#67e8f9" /><Pixel x={6} y={4} color="#67e8f9" /><Pixel x={7} y={4} color="#22d3ee" />
      <Pixel x={0} y={5} color="#22d3ee" /><Pixel x={1} y={5} color="#06b6d4" /><Pixel x={2} y={5} color="#06b6d4" /><Pixel x={3} y={5} color="#06b6d4" /><Pixel x={4} y={5} color="#06b6d4" /><Pixel x={5} y={5} color="#06b6d4" /><Pixel x={6} y={5} color="#06b6d4" /><Pixel x={7} y={5} color="#22d3ee" />
      {/* Wheels */}
      <Pixel x={2} y={6} color="#06b6d4" /><Pixel x={3} y={6} color="#06b6d4" /><Pixel x={5} y={6} color="#06b6d4" /><Pixel x={6} y={6} color="#06b6d4" />
    </svg>
  );
}

export function MarketAuction({ size = 36, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" shapeRendering="crispEdges" className={className}>
      <Pixel x={5} y={0} color="#fbbf24" /><Pixel x={6} y={0} color="#fbbf24" />
      <Pixel x={4} y={1} color="#fbbf24" /><Pixel x={5} y={1} color="#f59e0b" /><Pixel x={6} y={1} color="#f59e0b" /><Pixel x={7} y={1} color="#fbbf24" />
      <Pixel x={3} y={2} color="#fbbf24" /><Pixel x={4} y={2} color="#fde68a" /><Pixel x={5} y={2} color="#f59e0b" /><Pixel x={6} y={2} color="#f59e0b" /><Pixel x={7} y={2} color="#fde68a" /><Pixel x={8} y={2} color="#fbbf24" />
      <Pixel x={3} y={3} color="#fbbf24" /><Pixel x={4} y={3} color="#fde68a" /><Pixel x={5} y={3} color="#fde68a" /><Pixel x={6} y={3} color="#fde68a" /><Pixel x={7} y={3} color="#fde68a" /><Pixel x={8} y={3} color="#fbbf24" />
      <Pixel x={4} y={4} color="#fbbf24" /><Pixel x={5} y={4} color="#f59e0b" /><Pixel x={6} y={4} color="#f59e0b" /><Pixel x={7} y={4} color="#fbbf24" />
      {/* Hammer */}
      <Pixel x={2} y={5} color="#8b4513" /><Pixel x={3} y={5} color="#8b4513" />
      <Pixel x={2} y={6} color="#8b4513" /><Pixel x={3} y={6} color="#8b4513" />
      <Pixel x={1} y={7} color="#8b4513" /><Pixel x={2} y={7} color="#8b4513" /><Pixel x={3} y={7} color="#8b4513" /><Pixel x={4} y={7} color="#8b4513" />
    </svg>
  );
}

// ── ENVIRONMENTS ──

export function BgSpaceGrid({ size = 200, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
      {/* Stars */}
      {Array.from({ length: 30 }).map((_, i) => (
        <rect key={i} x={Math.floor(Math.random() * 40)} y={Math.floor(Math.random() * 40)} width={1} height={1} fill="#fff" opacity={Math.random() * 0.5 + 0.1} />
      ))}
      {/* Grid lines */}
      {[0, 10, 20, 30, 40].map(y => <line key={`h${y}`} x1={0} y1={y} x2={40} y2={y} stroke="#22d3ee" strokeWidth={0.1} opacity={0.15} />)}
      {[0, 10, 20, 30, 40].map(x => <line key={`v${x}`} x1={x} y1={0} x2={x} y2={40} stroke="#22d3ee" strokeWidth={0.1} opacity={0.15} />)}
    </svg>
  );
}

export function BgAlienPlanet({ size = 300, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" className={className}>
      {/* Planet */}
      <circle cx={30} cy={35} r={18} fill="#1a1a4a" />
      <circle cx={30} cy={35} r={18} fill="url(#planetGrad)" opacity={0.5} />
      {/* Craters */}
      <circle cx={22} cy={32} r={3} fill="#0a0a3a" />
      <circle cx={35} cy={28} r={4} fill="#0a0a3a" />
      <circle cx={30} cy={40} r={2} fill="#0a0a3a" />
      <circle cx={20} cy={40} r={2} fill="#0a0a3a" />
      <circle cx={38} cy={38} r={2.5} fill="#0a0a3a" />
      {/* Atmosphere glow */}
      <circle cx={30} cy={35} r={20} fill="none" stroke="#22d3ee" strokeWidth={0.3} opacity={0.3} />
      <circle cx={30} cy={35} r={22} fill="none" stroke="#a78bfa" strokeWidth={0.2} opacity={0.2} />
      {/* Rings */}
      <ellipse cx={30} cy={38} rx={26} ry={4} fill="none" stroke="#22d3ee" strokeWidth={0.5} opacity={0.15} transform="rotate(-15, 30, 38)" />
      <defs>
        <radialGradient id="planetGrad" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#2a2a6a" />
          <stop offset="100%" stopColor="#0a0a2a" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function BgColonyBase({ size = 300, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 40" shapeRendering="crispEdges" className={className}>
      {/* Ground */}
      <rect x={0} y={30} width={60} height={10} fill="#0a0a2a" />
      {/* Main building */}
      <rect x={20} y={15} width={20} height={15} fill="#1a1a4a" stroke="#22d3ee" strokeWidth={0.5} />
      {/* Dome */}
      <rect x={24} y={10} width={12} height={5} rx={2} fill="#2a2a6a" stroke="#22d3ee" strokeWidth={0.5} />
      {/* Windows */}
      <rect x={23} y={18} width={3} height={3} fill="#22d3ee" opacity={0.3} />
      <rect x={28} y={18} width={3} height={3} fill="#22d3ee" opacity={0.3} />
      <rect x={33} y={18} width={3} height={3} fill="#22d3ee" opacity={0.3} />
      {/* Doors */}
      <rect x={28} y={25} width={4} height={5} fill="#0a0a1a" />
      {/* Side buildings */}
      <rect x={10} y={22} width={8} height={8} fill="#15153a" stroke="#22d3ee" strokeWidth={0.3} />
      <rect x={42} y={22} width={8} height={8} fill="#15153a" stroke="#22d3ee" strokeWidth={0.3} />
      {/* Walls */}
      <rect x={8} y={28} width={44} height={2} fill="#1a1a4a" />
      {/* Antenna */}
      <rect x={29} y={5} width={2} height={5} fill="#22d3ee" />
      <rect x={28} y={5} width={4} height={1} fill="#22d3ee" />
      {/* Energy particles */}
      {[12, 25, 38, 45].map((x, i) => (
        <rect key={i} x={x} y={10 + i * 3} width={1} height={1} fill="#22d3ee" opacity={0.5} />
      ))}
    </svg>
  );
}

export function BgVolcanicSector({ size = 300, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 40" shapeRendering="crispEdges" className={className}>
      {/* Sky */}
      <rect x={0} y={0} width={60} height={20} fill="#1a0505" />
      {/* Ground */}
      <rect x={0} y={20} width={60} height={20} fill="#2a0a00" />
      {/* Lava pools */}
      <rect x={10} y={25} width={15} height={4} fill="#ff4500" opacity={0.8} />
      <rect x={35} y={28} width={12} height={3} fill="#ff4500" opacity={0.8} />
      <rect x={20} y={33} width={8} height={3} fill="#ff4500" opacity={0.6} />
      {/* Lava glow */}
      <rect x={10} y={25} width={15} height={4} fill="#ffcc00" opacity={0.2} />
      {/* Rocks */}
      <rect x={5} y={22} width={4} height={6} fill="#3a1a0a" />
      <rect x={28} y={24} width={3} height={5} fill="#3a1a0a" />
      <rect x={45} y={21} width={5} height={8} fill="#3a1a0a" />
      {/* Fire particles */}
      {[8, 15, 22, 30, 38, 42, 50].map((x, i) => (
        <rect key={i} x={x} y={18 - i} width={1} height={1} fill="#ff6600" opacity={0.6} />
      ))}
    </svg>
  );
}

export function BgFrozenSector({ size = 300, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 40" shapeRendering="crispEdges" className={className}>
      {/* Sky */}
      <rect x={0} y={0} width={60} height={15} fill="#0a1a2a" />
      {/* Ice ground */}
      <rect x={0} y={15} width={60} height={25} fill="#1a2a3a" />
      <rect x={0} y={15} width={60} height={2} fill="#22d3ee" opacity={0.3} />
      {/* Ice crystals */}
      {[8, 20, 32, 45, 52].map((x, i) => (
        <>
          <rect key={`c${i}1`} x={x} y={10} width={2} height={2} fill="#22d3ee" opacity={0.6} />
          <rect key={`c${i}2`} x={x + 1} y={8} width={1} height={2} fill="#67e8f9" opacity={0.4} />
        </>
      ))}
      {/* Snow drifts */}
      <rect x={5} y={22} width={10} height={3} fill="#2a3a4a" />
      <rect x={35} y={25} width={15} height={2} fill="#2a3a4a" />
      {/* Frost */}
      {[3, 12, 18, 25, 30, 40, 48, 55].map((x, i) => (
        <rect key={`f${i}`} x={x} y={16 + (i % 4) * 4} width={1} height={1} fill="#67e8f9" opacity={0.3} />
      ))}
    </svg>
  );
}

export function BgCrystalDesert({ size = 300, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 40" shapeRendering="crispEdges" className={className}>
      {/* Sky */}
      <rect x={0} y={0} width={60} height={12} fill="#1a0a2a" />
      {/* Dunes */}
      <rect x={0} y={12} width={60} height={28} fill="#2a1a3a" />
      <rect x={0} y={14} width={60} height={2} fill="#a78bfa" opacity={0.2} />
      {/* Dune waves */}
      <rect x={0} y={20} width={20} height={3} fill="#3a2a4a" />
      <rect x={30} y={22} width={18} height={2} fill="#3a2a4a" />
      <rect x={10} y={28} width={15} height={3} fill="#3a2a4a" />
      {/* Crystals */}
      {[5, 18, 30, 42, 52].map((x, i) => (
        <>
          <rect key={`s${i}1`} x={x} y={16} width={3} height={8} fill="#a78bfa" opacity={0.6} />
          <rect key={`s${i}2`} x={x + 1} y={14} width={1} height={2} fill="#c4b5fd" opacity={0.4} />
        </>
      ))}
      {/* Large crystal */}
      <rect x={38} y={12} width={4} height={14} fill="#8b5cf6" opacity={0.5} />
      <rect x={39} y={10} width={2} height={2} fill="#c4b5fd" opacity={0.3} />
      {/* Glow */}
      <rect x={38} y={12} width={4} height={14} fill="#a78bfa" opacity={0.15} />
    </svg>
  );
}

// ── ITEM CARD ART (24×24) ──

export function CardHeroNFT({ size = 120, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" shapeRendering="crispEdges" className={className}>
      {/* Background */}
      <rect x={0} y={0} width={24} height={24} fill="#0a0a1a" rx={2} />
      <rect x={0} y={0} width={24} height={24} fill="#22d3ee" opacity={0.05} rx={2} />
      {/* Border */}
      <rect x={0} y={0} width={24} height={24} fill="none" stroke="#22d3ee" strokeWidth={0.5} opacity={0.3} rx={2} />
      {/* Hero silhouette */}
      <rect x={9} y={5} width={6} height={2} fill="#22d3ee" opacity={0.6} />
      <rect x={7} y={7} width={10} height={2} fill="#22d3ee" opacity={0.6} />
      <rect x={8} y={9} width={8} height={4} fill="#22d3ee" opacity={0.5} />
      <rect x={9} y={13} width={6} height={4} fill="#22d3ee" opacity={0.4} />
      {/* Rarity stars */}
      <rect x={8} y={18} width={1} height={1} fill="#fbbf24" />
      <rect x={10} y={18} width={1} height={1} fill="#fbbf24" />
      <rect x={12} y={18} width={1} height={1} fill="#fbbf24" />
      <rect x={14} y={18} width={1} height={1} fill="#fbbf24" />
      {/* Background grid */}
      {[0, 4, 8, 12, 16, 20].map(y => <line key={y} x1={0} y1={y} x2={24} y2={y} stroke="#22d3ee" strokeWidth={0.05} opacity={0.1} />)}
      {[0, 4, 8, 12, 16, 20].map(x => <line key={x} x1={x} y1={0} x2={x} y2={24} stroke="#22d3ee" strokeWidth={0.05} opacity={0.1} />)}
    </svg>
  );
}

export function CardEquipment({ size = 120, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" shapeRendering="crispEdges" className={className}>
      <rect x={0} y={0} width={24} height={24} fill="#0a0a1a" rx={2} />
      <rect x={0} y={0} width={24} height={24} fill="#a78bfa" opacity={0.05} rx={2} />
      <rect x={0} y={0} width={24} height={24} fill="none" stroke="#a78bfa" strokeWidth={0.5} opacity={0.3} rx={2} />
      {/* Shield */}
      <rect x={9} y={4} width={6} height={3} fill="#a78bfa" opacity={0.6} />
      <rect x={7} y={7} width={10} height={5} fill="#a78bfa" opacity={0.5} />
      <rect x={8} y={12} width={8} height={3} fill="#a78bfa" opacity={0.4} />
      <rect x={10} y={15} width={4} height={3} fill="#a78bfa" opacity={0.3} />
      {/* Glow */}
      <rect x={9} y={8} width={6} height={3} fill="#c4b5fd" opacity={0.2} />
    </svg>
  );
}

export function CardCosmetic({ size = 120, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" shapeRendering="crispEdges" className={className}>
      <rect x={0} y={0} width={24} height={24} fill="#0a0a1a" rx={2} />
      <rect x={0} y={0} width={24} height={24} fill="#f472b6" opacity={0.05} rx={2} />
      <rect x={0} y={0} width={24} height={24} fill="none" stroke="#f472b6" strokeWidth={0.5} opacity={0.3} rx={2} />
      {/* Crown */}
      <rect x={9} y={6} width={6} height={2} fill="#fbbf24" opacity={0.7} />
      <rect x={8} y={8} width={8} height={2} fill="#fbbf24" opacity={0.6} />
      <rect x={7} y={10} width={10} height={2} fill="#fbbf24" opacity={0.5} />
      {/* Gems */}
      <rect x={10} y={8} width={1} height={1} fill="#ef4444" />
      <rect x={12} y={8} width={1} height={1} fill="#22d3ee" />
      {/* Sparkles */}
      <rect x={5} y={5} width={1} height={1} fill="#f472b6" opacity={0.5} />
      <rect x={18} y={4} width={1} height={1} fill="#f472b6" opacity={0.5} />
      <rect x={4} y={12} width={1} height={1} fill="#f472b6" opacity={0.5} />
      <rect x={19} y={12} width={1} height={1} fill="#f472b6" opacity={0.5} />
    </svg>
  );
}

export function CardCryoPod({ size = 120, className }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" shapeRendering="crispEdges" className={className}>
      <rect x={0} y={0} width={24} height={24} fill="#0a0a1a" rx={2} />
      <rect x={0} y={0} width={24} height={24} fill="#fbbf24" opacity={0.05} rx={2} />
      <rect x={0} y={0} width={24} height={24} fill="none" stroke="#fbbf24" strokeWidth={0.5} opacity={0.3} rx={2} />
      {/* Pod */}
      <rect x={9} y={3} width={6} height={18} rx={1} fill="none" stroke="#fbbf24" strokeWidth={0.5} opacity={0.6} />
      <rect x={10} y={5} width={4} height={14} fill="#fbbf24" opacity={0.1} />
      {/* Inner glow */}
      <rect x={11} y={8} width={2} height={6} fill="#fbbf24" opacity={0.3} />
      {/* Top light */}
      <rect x={10} y={4} width={4} height={1} fill="#fbbf24" opacity={0.5} />
      {/* Bottom base */}
      <rect x={9} y={20} width={6} height={1} fill="#fbbf24" opacity={0.4} />
    </svg>
  );
}
