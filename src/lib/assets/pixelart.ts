// Pixel art generation using canvas API
// All assets generated programmatically - no external images needed

const COLORS: Record<string, string> = {
  engineer: "#4A90D9",
  scout: "#7ED321",
  marine: "#D0021B",
  scientist: "#9B59B6",
  medic: "#2ECC71",
  commander: "#F5A623",
  miner: "#8B4513",
  bg: "#1a1a2e",
  accent: "#00d4ff",
  purple: "#7c3aed",
};

function createCanvas(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  return [canvas, ctx];
}

export function generateHeroSprite(heroClass: string): string {
  const [canvas, ctx] = createCanvas(32);
  const c = COLORS[heroClass.toLowerCase()] || COLORS.engineer;

  // Body
  ctx.fillStyle = c;
  ctx.fillRect(8, 12, 16, 12);

  // Head
  ctx.fillStyle = "#FFD5B8";
  ctx.fillRect(10, 4, 12, 10);

  // Eyes
  ctx.fillStyle = "#fff";
  ctx.fillRect(12, 7, 3, 3);
  ctx.fillRect(17, 7, 3, 3);
  ctx.fillStyle = "#000";
  ctx.fillRect(13, 8, 2, 2);
  ctx.fillRect(18, 8, 2, 2);

  // Helmet visor
  ctx.fillStyle = COLORS.accent;
  ctx.fillRect(11, 6, 10, 2);

  // Legs
  ctx.fillStyle = "#333";
  ctx.fillRect(10, 24, 5, 6);
  ctx.fillRect(17, 24, 5, 6);

  // Boots
  ctx.fillStyle = "#555";
  ctx.fillRect(9, 28, 6, 3);
  ctx.fillRect(17, 28, 6, 3);

  // Arms
  ctx.fillStyle = c;
  ctx.fillRect(4, 14, 4, 8);
  ctx.fillRect(24, 14, 4, 8);

  return canvas.toDataURL();
}

export function generateEnemySprite(enemyType: string): string {
  const [canvas, ctx] = createCanvas(32);

  const colors: Record<string, string> = {
    crawler: "#4a0404",
    spitter: "#2d5a27",
    burrower: "#5c4033",
    hunter: "#1a1a2e",
    "hive guard": "#8b0000",
    "void beast": "#2d1b69",
    titan: "#4a0e4e",
  };

  ctx.fillStyle = colors[enemyType.toLowerCase()] || "#f00";

  if (enemyType.toLowerCase() === "crawler") {
    ctx.fillRect(6, 14, 20, 8);
    ctx.fillRect(4, 10, 4, 4);
    ctx.fillRect(24, 10, 4, 4);
  } else if (enemyType.toLowerCase() === "titan") {
    ctx.fillRect(4, 4, 24, 20);
    ctx.fillStyle = "#ff0";
    ctx.fillRect(10, 8, 4, 4);
    ctx.fillRect(18, 8, 4, 4);
    ctx.fillStyle = COLORS.accent;
    ctx.fillRect(13, 14, 6, 3);
  } else {
    ctx.fillRect(8, 8, 16, 16);
    ctx.fillStyle = COLORS.accent;
    ctx.fillRect(10, 10, 4, 4);
    ctx.fillRect(18, 10, 4, 4);
    ctx.fillStyle = "#fff";
    ctx.fillRect(14, 16, 4, 4);
  }

  return canvas.toDataURL();
}

export function generateTile(type: string): string {
  const [canvas, ctx] = createCanvas(32);

  const tileColors: Record<string, string> = {
    ground: "#2a2a3a",
    wall: "#4a4a5a",
    lava: "#ff4500",
    crystal: "#00ffff",
    metal: "#708090",
    plant: "#228b22",
    hazard: "#ff0000",
    ice: "#b0e0e6",
  };

  ctx.fillStyle = tileColors[type] || "#333";
  ctx.fillRect(0, 0, 32, 32);

  if (type === "lava") {
    ctx.fillStyle = "#ffd700";
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(4 + i * 10, 14 + (i % 2) * 4, 8, 4);
    }
  } else if (type === "ground") {
    ctx.fillStyle = "#3a3a4a";
    ctx.fillRect(2, 2, 28, 28);
    ctx.fillStyle = "#4a4a5a";
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        ctx.fillRect(4 + i * 10, 4 + j * 10, 2, 2);
      }
    }
  } else if (type === "crystal") {
    ctx.fillStyle = "rgba(0, 255, 255, 0.3)";
    ctx.fillRect(8, 4, 16, 24);
    ctx.fillStyle = "#fff";
    ctx.fillRect(14, 8, 4, 4);
  }

  return canvas.toDataURL();
}

export function generateUIAsset(type: string, width: number = 64, height: number = 32): string {
  const [canvas, ctx] = createCanvas(Math.max(width, height));

  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = COLORS.accent;
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, width - 2, height - 2);

  if (type === "button") {
    ctx.fillStyle = COLORS.accent;
    ctx.fillRect(4, 4, width - 8, height - 8);
  } else if (type === "panel") {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(4, 4, width - 8, height - 8);
  } else if (type === "progress") {
    ctx.fillStyle = COLORS.accent;
    ctx.fillRect(4, 4, width / 2, height - 8);
  }

  return canvas.toDataURL();
}

export function generateLogo(): string {
  const [canvas, ctx] = createCanvas(128);

  ctx.fillStyle = "#0a0a1a";
  ctx.fillRect(0, 0, 128, 128);

  // Neon border
  ctx.strokeStyle = COLORS.accent;
  ctx.lineWidth = 3;
  ctx.strokeRect(4, 4, 120, 120);

  // Inner glow
  ctx.strokeStyle = COLORS.purple;
  ctx.lineWidth = 1;
  ctx.strokeRect(8, 8, 112, 112);

  // Bomb icon
  ctx.fillStyle = COLORS.accent;
  ctx.beginPath();
  ctx.arc(64, 56, 20, 0, Math.PI * 2);
  ctx.fill();

  // Fuse
  ctx.strokeStyle = "#ff0";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(64, 36);
  ctx.lineTo(60, 24);
  ctx.lineTo(66, 20);
  ctx.lineTo(62, 10);
  ctx.stroke();

  // Text placeholder
  ctx.fillStyle = "#fff";
  ctx.font = "bold 14px monospace";
  ctx.textAlign = "center";
  ctx.fillText("0GBomber", 64, 100);

  return canvas.toDataURL();
}

export function generateAllAssets(): Record<string, string> {
  const assets: Record<string, string> = {};

  for (const heroClass of ["Engineer", "Scout", "Marine", "Scientist", "Medic", "Commander", "Miner"]) {
    assets[`hero_${heroClass.toLowerCase()}`] = generateHeroSprite(heroClass);
  }

  return assets;
}
