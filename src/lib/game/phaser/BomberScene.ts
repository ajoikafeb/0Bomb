import * as Phaser from "phaser";
import type { Hero } from "@/lib/game/types";

const TILE = 32;
const COLS = 17;
const ROWS = 13;
const W = COLS * TILE;
const H = ROWS * TILE;

enum TileType {
  Empty,
  SolidWall,
  Destructible,
  Lava,
  Crystal,
}

interface Bomb {
  sprite: Phaser.GameObjects.Arc;
  x: number;
  y: number;
  timer: number;
  range: number;
}

interface EnemyData {
  sprite: Phaser.GameObjects.Rectangle;
  x: number;
  y: number;
  type: string;
  hp: number;
  moveTimer: number;
  dir: number;
}

export class BomberScene extends Phaser.Scene {
  private grid: TileType[][] = [];
  private player!: Phaser.GameObjects.Rectangle;
  private playerName!: Phaser.GameObjects.Text;
  private bombs: Bomb[] = [];
  private enemies: EnemyData[] = [];
  private explosions: Phaser.GameObjects.Rectangle[] = [];
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private bombRange = 2;
  private maxBombs = 1;
  private activeBombs = 0;
  private moveSpeed = 150;
  private score = 0;
  private isGameOver = false;
  private diedByLava = false;
  private enemiesKilled = 0;
  private blocksDestroyed = 0;
  private bombsPlaced = 0;
  private powerUpsCollected = 0;
  private hero: Hero;
  private onUpdate: (data: any) => void;
  private tileSprites: Phaser.GameObjects.Rectangle[][] = [];
  private lavaSprites: Phaser.GameObjects.Rectangle[] = [];
  private crystalSprites: Phaser.GameObjects.Rectangle[] = [];
  private destructibleSprites: Phaser.GameObjects.Rectangle[] = [];

  constructor(hero: Hero, onUpdate: (data: any) => void) {
    super({ key: "BomberScene" });
    this.hero = hero;
    this.onUpdate = onUpdate;
  }

  create() {
    const bg = this.add.rectangle(W / 2, H / 2, W, H, 0x1a1a2e);
    bg.setDepth(-1);

    this.generateMap();
    this.drawMap();

    // Player
    this.player = this.add.rectangle(TILE * 1.5, TILE * 1.5, TILE - 4, TILE - 4, this.getHeroColor());
    this.playerName = this.add.text(TILE * 1.5, TILE * 1.5 - 14, this.hero.name, {
      fontSize: "8px",
      color: "#22d3ee",
      fontFamily: "monospace",
    }).setOrigin(0.5);

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Enemies
    this.spawnEnemies();

    // HUD
    this.add.text(4, H + 4, `Score: 0  |  Bombs: ${this.maxBombs}  |  Range: ${this.bombRange}`, {
      fontSize: "10px",
      color: "#666",
      fontFamily: "monospace",
    });
  }

  private getHeroColor(): number {
    const colors: Record<string, number> = {
      engineer: 0x4a90d9,
      scout: 0x7ed321,
      marine: 0xd0021b,
      scientist: 0x9b59b6,
      medic: 0x2ecc71,
      commander: 0xf5a623,
      miner: 0x8b4513,
    };
    return colors[this.hero.class.toLowerCase()] || 0x22d3ee;
  }

  private generateMap() {
    this.grid = [];
    for (let y = 0; y < ROWS; y++) {
      this.grid[y] = [];
      for (let x = 0; x < COLS; x++) {
        if (x === 0 || y === 0 || x === COLS - 1 || y === ROWS - 1) {
          this.grid[y][x] = TileType.SolidWall;
        } else if (x % 2 === 0 && y % 2 === 0) {
          this.grid[y][x] = TileType.SolidWall;
        } else if (x < 3 && y < 3) {
          this.grid[y][x] = TileType.Empty;
        } else {
          const r = Math.random();
          if (r < 0.3) {
            this.grid[y][x] = TileType.Destructible;
          } else if (r < 0.35) {
            this.grid[y][x] = TileType.Lava;
          } else if (r < 0.38) {
            this.grid[y][x] = TileType.Crystal;
          } else {
            this.grid[y][x] = TileType.Empty;
          }
        }
      }
    }
  }

  private drawMap() {
    this.tileSprites = [];
    this.lavaSprites = [];
    this.crystalSprites = [];
    this.destructibleSprites = [];

    for (let y = 0; y < ROWS; y++) {
      this.tileSprites[y] = [];
      for (let x = 0; x < COLS; x++) {
        const px = x * TILE + TILE / 2;
        const py = y * TILE + TILE / 2;
        const tile = this.grid[y][x];

        let rect: Phaser.GameObjects.Rectangle;

        switch (tile) {
          case TileType.SolidWall:
            rect = this.add.rectangle(px, py, TILE, TILE, 0x2a2a4a).setDepth(0);
            rect.setStrokeStyle(1, 0x3a3a5a);
            break;
          case TileType.Destructible:
            rect = this.add.rectangle(px, py, TILE - 2, TILE - 2, 0x5a4a3a).setDepth(0);
            rect.setStrokeStyle(1, 0x6a5a4a);
            this.destructibleSprites.push(rect);
            break;
          case TileType.Lava:
            rect = this.add.rectangle(px, py, TILE, TILE, 0x1a0a0a).setDepth(0);
            const lava = this.add.rectangle(px, py, TILE - 4, TILE - 4, 0xff4500, 0.8).setDepth(1);
            this.lavaSprites.push(lava);
            this.tweens.add({
              targets: lava,
              alpha: { from: 0.8, to: 0.4 },
              duration: 500 + Math.random() * 500,
              yoyo: true,
              repeat: -1,
            });
            break;
          case TileType.Crystal:
            rect = this.add.rectangle(px, py, TILE, TILE, 0x0a1a2e).setDepth(0);
            const crystal = this.add.rectangle(px, py, TILE - 8, TILE - 8, 0x00ffff, 0.6).setDepth(1);
            this.crystalSprites.push(crystal);
            this.tweens.add({
              targets: crystal,
              scaleX: { from: 1, to: 1.2 },
              scaleY: { from: 1, to: 1.2 },
              duration: 1000 + Math.random() * 1000,
              yoyo: true,
              repeat: -1,
            });
            break;
          default:
            rect = this.add.rectangle(px, py, TILE, TILE, 0x1a1a2e).setDepth(0);
            rect.setStrokeStyle(1, 0x222244);
        }
        this.tileSprites[y][x] = rect;
      }
    }
  }

  private spawnEnemies() {
    this.enemies = [];
    const count = 3 + Math.floor(Math.random() * 4);
    const types = ["Crawler", "Spitter", "Burrower", "Hunter"];

    for (let i = 0; i < count; i++) {
      let ex: number, ey: number;
      do {
        ex = Math.floor(Math.random() * (COLS - 2)) + 1;
        ey = Math.floor(Math.random() * (ROWS - 2)) + 1;
      } while (
        this.grid[ey][ex] !== TileType.Empty ||
        (ex < 3 && ey < 3)
      );

      const type = types[i % types.length];
      const colors: Record<string, number> = {
        Crawler: 0x4a0404,
        Spitter: 0x2d5a27,
        Burrower: 0x5c4033,
        Hunter: 0x1a1a4a,
      };

      const sprite = this.add.rectangle(
        ex * TILE + TILE / 2,
        ey * TILE + TILE / 2,
        TILE - 6,
        TILE - 6,
        colors[type] || 0xff0000
      ).setDepth(5);

      this.enemies.push({
        sprite,
        x: ex,
        y: ey,
        type,
        hp: type === "Hunter" ? 3 : 1,
        moveTimer: 0,
        dir: Math.floor(Math.random() * 4),
      });
    }
  }

  update(_time: number, delta: number) {
    if (this.isGameOver) return;

    // Player movement
    let dx = 0, dy = 0;
    if (this.cursors.left.isDown || this.wasd.A.isDown) dx = -1;
    else if (this.cursors.right.isDown || this.wasd.D.isDown) dx = 1;
    else if (this.cursors.up.isDown || this.wasd.W.isDown) dy = -1;
    else if (this.cursors.down.isDown || this.wasd.S.isDown) dy = 1;

    if (dx !== 0 || dy !== 0) {
      this.tryMove(dx, dy, delta);
    }

    // Place bomb
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.placeBomb();
    }

    // Update bombs
    this.updateBombs(delta);

    // Update enemies
    this.updateEnemies(delta);

    // Check lava
    this.checkLava();

    // Update UI
    this.onUpdate({ score: this.score, isGameOver: this.isGameOver });
  }

  private tryMove(dx: number, dy: number, delta: number) {
    const cx = Math.floor(this.player.x / TILE);
    const cy = Math.floor(this.player.y / TILE);
    const nx = cx + dx;
    const ny = cy + dy;

    if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) return;
    if (this.grid[ny][nx] === TileType.SolidWall || this.grid[ny][nx] === TileType.Destructible) return;
    if (this.isBombAt(nx, ny)) return;

    // Check enemy collision
    for (const enemy of this.enemies) {
      if (enemy.x === nx && enemy.y === ny) {
        this.gameOver();
        return;
      }
    }

    this.player.x = nx * TILE + TILE / 2;
    this.player.y = ny * TILE + TILE / 2;
    this.playerName.x = this.player.x;
    this.playerName.y = this.player.y - 14;
  }

  private placeBomb() {
    if (this.activeBombs >= this.maxBombs) return;
    const cx = Math.floor(this.player.x / TILE);
    const cy = Math.floor(this.player.y / TILE);
    if (this.isBombAt(cx, cy)) return;

    const bomb = this.add.circle(cx * TILE + TILE / 2, cy * TILE + TILE / 2, 10, 0x222222).setDepth(10);
    const fuse = this.add.circle(cx * TILE + TILE / 2, cy * TILE + TILE / 2, 4, 0xff4400).setDepth(11);

    this.tweens.add({
      targets: fuse,
      scaleX: { from: 1, to: 0.3 },
      scaleY: { from: 1, to: 0.3 },
      duration: 2500,
      repeat: 2,
      yoyo: true,
    });

    this.bombs.push({
      sprite: bomb,
      x: cx,
      y: cy,
      timer: 3000,
      range: this.bombRange,
    });

    this.activeBombs++;
    this.bombsPlaced++;
  }

  private isBombAt(x: number, y: number): boolean {
    return this.bombs.some(b => b.x === x && b.y === y);
  }

  private updateBombs(delta: number) {
    for (let i = this.bombs.length - 1; i >= 0; i--) {
      const bomb = this.bombs[i];
      bomb.timer -= delta;

      if (bomb.timer <= 0) {
        this.explodeBomb(bomb);
        bomb.sprite.destroy();
        this.bombs.splice(i, 1);
        this.activeBombs--;
      }
    }
  }

  private explodeBomb(bomb: Bomb) {
    const directions = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]];

    for (const [ddx, ddy] of directions) {
      for (let r = 0; r <= bomb.range; r++) {
        const ex = bomb.x + ddx * r;
        const ey = bomb.y + ddy * r;

        if (ex < 0 || ex >= COLS || ey < 0 || ey >= ROWS) break;
        if (this.grid[ey][ex] === TileType.SolidWall) break;

        if (this.grid[ey][ex] === TileType.Destructible) {
          this.grid[ey][ex] = TileType.Empty;
          this.destroyDestructible(ex, ey);
          this.score += 10;
          this.blocksDestroyed++;
          this.onUpdate({ score: this.score });
          break;
        }

        // Show explosion
        const exp = this.add.rectangle(
          ex * TILE + TILE / 2,
          ey * TILE + TILE / 2,
          TILE - 4,
          TILE - 4,
          0xff6600,
          0.8
        ).setDepth(15);

        this.explosions.push(exp);

        this.time.delayedCall(300, () => {
          exp.destroy();
        });

        // Kill enemies in explosion
        for (let ei = this.enemies.length - 1; ei >= 0; ei--) {
          const enemy = this.enemies[ei];
          if (enemy.x === ex && enemy.y === ey) {
            enemy.hp--;
            if (enemy.hp <= 0) {
              enemy.sprite.destroy();
              this.enemies.splice(ei, 1);
              this.score += 50;
              this.enemiesKilled++;
              this.onUpdate({ score: this.score });
            }
          }
        }

        // Kill player if in explosion
        const px = Math.floor(this.player.x / TILE);
        const py = Math.floor(this.player.y / TILE);
        if (px === ex && py === ey) {
          this.gameOver();
        }
      }
    }
  }

  private destroyDestructible(x: number, y: number) {
    const idx = this.destructibleSprites.findIndex(s => {
      return Math.floor(s.x / TILE) === x && Math.floor(s.y / TILE) === y;
    });
    if (idx >= 0) {
      this.destructibleSprites[idx].destroy();
      this.destructibleSprites.splice(idx, 1);

      // Chance to drop power-up
      const r = Math.random();
      if (r < 0.15) {
        this.add.text(x * TILE + TILE / 2, y * TILE + TILE / 2, "B", {
          fontSize: "12px", color: "#ff6600", fontFamily: "monospace",
        }).setOrigin(0.5).setDepth(20);
        this.maxBombs++;
        this.powerUpsCollected++;
      } else if (r < 0.25) {
        this.add.text(x * TILE + TILE / 2, y * TILE + TILE / 2, "R", {
          fontSize: "12px", color: "#00ff00", fontFamily: "monospace",
        }).setOrigin(0.5).setDepth(20);
        this.bombRange++;
        this.powerUpsCollected++;
      }
    }
  }

  private updateEnemies(delta: number) {
    for (const enemy of this.enemies) {
      enemy.moveTimer -= delta;
      if (enemy.moveTimer <= 0) {
        enemy.moveTimer = 400 + Math.random() * 400;
        enemy.dir = Math.floor(Math.random() * 4);

        const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
        const [ddx, ddy] = dirs[enemy.dir];
        const nx = enemy.x + ddx;
        const ny = enemy.y + ddy;

        if (
          nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS &&
          this.grid[ny][nx] === TileType.Empty &&
          !this.isBombAt(nx, ny)
        ) {
          enemy.x = nx;
          enemy.y = ny;
          enemy.sprite.x = nx * TILE + TILE / 2;
          enemy.sprite.y = ny * TILE + TILE / 2;
        }

        // Check collision with player
        const px = Math.floor(this.player.x / TILE);
        const py = Math.floor(this.player.y / TILE);
        if (enemy.x === px && enemy.y === py) {
          this.gameOver();
        }
      }
    }
  }

  private checkLava() {
    const px = Math.floor(this.player.x / TILE);
    const py = Math.floor(this.player.y / TILE);
    if (this.grid[py] && this.grid[py][px] === TileType.Lava) {
      this.diedByLava = true;
      this.gameOver();
    }
  }

  private gameOver() {
    if (this.isGameOver) return;
    this.isGameOver = true;

    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.7).setDepth(50);
    this.add.text(W / 2, H / 2 - 20, "GAME OVER", {
      fontSize: "24px",
      color: "#ff4444",
      fontFamily: "monospace",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(51);
    this.add.text(W / 2, H / 2 + 20, `Score: ${this.score}`, {
      fontSize: "14px",
      color: "#ffffff",
      fontFamily: "monospace",
    }).setOrigin(0.5).setDepth(51);

    const allDead = this.enemies.length === 0;
    if (allDead) {
      this.add.text(W / 2, H / 2 + 50, "All enemies eliminated!", {
        fontSize: "10px", color: "#22d3ee", fontFamily: "monospace",
      }).setOrigin(0.5).setDepth(51);
    } else {
      this.add.text(W / 2, H / 2 + 50, "Refresh to play again", {
        fontSize: "10px", color: "#666666", fontFamily: "monospace",
      }).setOrigin(0.5).setDepth(51);
    }

    this.onUpdate({
      score: this.score,
      isGameOver: true,
      enemiesKilled: this.enemiesKilled,
      blocksDestroyed: this.blocksDestroyed,
      bombsPlaced: this.bombsPlaced,
      powerUpsCollected: this.powerUpsCollected,
      diedByLava: this.diedByLava,
      allEnemiesDead: allDead,
    });
  }

  getScore() {
    return this.score;
  }
}
