"use client";

import { useEffect, useRef, useCallback } from "react";
import * as Phaser from "phaser";
import { BomberScene } from "@/lib/game/phaser/BomberScene";
import type { Hero } from "@/lib/game/types";

interface GameCanvasProps {
  hero: Hero;
  onUpdate?: (data: { score?: number; isGameOver?: boolean }) => void;
}

export default function GameCanvas({ hero, onUpdate }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  const handleUpdate = useCallback((data: { score?: number; isGameOver?: boolean }) => {
    onUpdate?.(data);
  }, [onUpdate]);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 17 * 32,
      height: 13 * 32 + 20,
      parent: containerRef.current,
      backgroundColor: "#0a0a1a",
      scene: new BomberScene(hero, handleUpdate),
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [hero, handleUpdate]);

  return (
    <div
      ref={containerRef}
      className="rounded-lg overflow-hidden border border-cyan-500/20 glow-cyan"
    />
  );
}
