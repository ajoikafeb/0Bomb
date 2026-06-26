"use client";

export function BottomStatusBar({
  fps, ping, chain, block, autoFarmStatus, lastSave, isConnected, isBattling, elapsed,
}: {
  fps?: number;
  ping?: number;
  chain?: string;
  block?: number;
  autoFarmStatus?: string;
  lastSave?: string;
  isConnected: boolean;
  isBattling: boolean;
  elapsed: number;
}) {
  return (
    <div className="flex items-center justify-between px-3 py-1 bg-black/60 border-t border-gray-800 text-[9px] font-mono text-gray-500 shrink-0">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1"><span className="text-gray-600">FPS:</span><span className="text-cyan-400">{fps ?? 60}</span></span>
        <span className="flex items-center gap-1"><span className="text-gray-600">Ping:</span><span className="text-green-400">{ping ?? 12}ms</span></span>
        <span className="flex items-center gap-1"><span className="text-gray-600">Chain:</span><span className="text-cyan-400">{chain ?? "0Bomb"}</span></span>
        <span className="flex items-center gap-1"><span className="text-gray-600">Block:</span><span className="text-gray-300">#{block ?? "—"}</span></span>
        <span className="flex items-center gap-1">
          <span className="text-gray-600">Auto Farm:</span>
          <span className={autoFarmStatus === "Farming" ? "text-green-400" : "text-gray-500"}>{autoFarmStatus ?? "Idle"}</span>
        </span>
        <span className="flex items-center gap-1"><span className="text-gray-600">Last Save:</span><span className="text-gray-400">{lastSave ?? "—"}</span></span>
      </div>
      <div className="flex items-center gap-2">
        {isBattling && <span className="text-green-400">⚔ {elapsed > 0 ? `${(elapsed / 1000).toFixed(1)}s` : "In Battle"}</span>}
        <span className={`flex items-center gap-1 ${isConnected ? "text-green-400" : "text-red-400"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"}`} />
          {isConnected ? "Connected" : "Disconnected"}
        </span>
      </div>
    </div>
  );
}
