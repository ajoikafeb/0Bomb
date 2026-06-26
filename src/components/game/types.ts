import type { GameState, EnemySim } from "@/lib/game/AIDecisionEngine";
import type { Hero, MapProgression, RewardChest } from "@/lib/game/types";

export interface Explosion {
  id: string;
  x: number;
  y: number;
  timer: number;
}

export interface BombInfo {
  x: number;
  y: number;
  range: number;
}

export interface BattleResult {
  heroResults: Array<{
    id: string;
    kills: number;
    survived: boolean;
    potionsFound: number;
    blocksBroken: number;
    tilesExplored: number;
    lootCollected: number;
    score: number;
  }>;
  totalScore: number;
  ticks: number;
  bossKilled: boolean;
  allCleared: boolean;
}

export interface GameViewProps {
  isConnected: boolean;
  address: string | null;
  heroes: Hero[];
  selectedIds: string[];
  isBattling: boolean;
  gameState: GameState | null;
  logs: string[];
  difficulty: string;
  battleResult: BattleResult | null;
  elapsed: number;
  fragments: number;
  hatching: boolean;
  hatchError: string;
  potions: number;
  hasSavedBattle: boolean;
  activeMap: MapProgression | null;
  mapProgress: number;
  autoDeploy: boolean;
  paused: boolean;
  explosions: Explosion[];
  musicOn: boolean;
  sfxOn: boolean;
  showSquad: boolean;
  rewardChest: RewardChest | null;
  onToggleSelect: (id: string) => void;
  onStartBattle: (ids?: string[]) => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onResumeBattle: () => void;
  onDiscardBattle: () => void;
  onClaimRewards: () => void;
  onHatch: () => void;
  onFreeHatch: () => void;
  onUsePotion: (heroId: string) => void;
  onToggleAutoDeploy: (heroId: string) => void;
  onSetDifficulty: (d: string) => void;
  onSetShowSquad: (v: boolean) => void;
  onToggleAutoFarm: () => void;
  onAutoBuild: () => void;
  onClearActiveMap: () => void;
  onToggleMusic: () => void;
  onToggleSfx: () => void;
}
