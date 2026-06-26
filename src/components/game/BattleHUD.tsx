"use client";

export function BattleHUD({
  elapsed, heroCount, enemyCount, bombCount, paused, musicOn, sfxOn,
  onPause, onResume, onStop, onToggleMusic, onToggleSfx,
}: {
  elapsed: number;
  heroCount: number;
  enemyCount: number;
  bombCount: number;
  paused: boolean;
  musicOn: boolean;
  sfxOn: boolean;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onToggleMusic: () => void;
  onToggleSfx: () => void;
}) {
  return (
    <div className="flex items-center justify-center gap-3 text-[10px] font-mono text-gray-400 z-10 bg-black/50 px-3 py-1 border-b border-gray-800/50 w-full shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-cyan-400">⏱ {(elapsed / 1000).toFixed(1)}s</span>
        <span>H: <span className="text-green-400">{heroCount}</span></span>
        <span>E: <span className="text-red-400">{enemyCount}</span></span>
        <span>💣: <span className="text-orange-400">{bombCount}</span></span>
      </div>
      <div className="w-px h-3 bg-gray-700/50" />
      <div className="flex items-center gap-1">
        {!paused ? (
          <button onClick={onPause} className="px-1.5 py-0.5 bg-yellow-600/30 text-yellow-300 rounded border border-yellow-500/30 hover:bg-yellow-600/50">⏸</button>
        ) : (
          <button onClick={onResume} className="px-1.5 py-0.5 bg-green-600/30 text-green-300 rounded border border-green-500/30 hover:bg-green-600/50">▶</button>
        )}
        <button onClick={onStop} className="px-1.5 py-0.5 bg-red-600/30 text-red-300 rounded border border-red-500/30 hover:bg-red-600/50">⏹</button>
      </div>
      <div className="w-px h-3 bg-gray-700/50" />
      <div className="flex items-center gap-2 text-[9px]">
        <span className="text-gray-500 font-bold">Legend:</span>
        <span className="flex items-center gap-0.5">
          <svg width="10" height="10" viewBox="0 0 18 18"><rect x="2" y="2" width="14" height="14" rx="2" fill="#22d3ee" opacity={0.6}/></svg>
          <span className="text-cyan-400">Hero</span>
        </span>
        <span className="flex items-center gap-0.5">
          <svg width="10" height="10" viewBox="0 0 18 18"><rect x="2" y="2" width="14" height="14" rx="2" fill="#ef4444" opacity={0.6}/></svg>
          <span className="text-red-400">Enemy</span>
        </span>
        <span className="flex items-center gap-0.5">
          <svg width="10" height="10" viewBox="0 0 18 18"><circle cx="9" cy="9" r="5" fill="#f97316" opacity={0.6}/></svg>
          <span className="text-orange-400">Bomb</span>
        </span>
        <span className="flex items-center gap-0.5">
          <svg width="10" height="10" viewBox="0 0 18 18"><polygon points="9,3 15,15 3,15" fill="#fbbf24" opacity={0.6}/></svg>
          <span className="text-yellow-400">Loot</span>
        </span>
      </div>
      <div className="w-px h-3 bg-gray-700/50" />
      <div className="flex items-center gap-1">
        <button onClick={onToggleMusic}
          className={`px-1 py-0.5 rounded border ${musicOn ? "border-cyan-500/50 text-cyan-400" : "border-gray-700 text-gray-500"}`}
        >🎵{musicOn ? "On" : "Off"}</button>
        <button onClick={onToggleSfx}
          className={`px-1 py-0.5 rounded border ${sfxOn ? "border-cyan-500/50 text-cyan-400" : "border-gray-700 text-gray-500"}`}
        >🔊{sfxOn ? "On" : "Off"}</button>
      </div>
    </div>
  );
}
