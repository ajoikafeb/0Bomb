"use client";

import { useState } from "react";
import { LOOT_MINT_COST, COSMETIC_MINT_COST } from "@/lib/game/constants";

export function MintSection({
  tab,
  loading,
  msg,
  onMint,
  onFreeMint,
}: {
  tab: string;
  loading: boolean;
  msg: string;
  onMint: (qty: number) => void;
  onFreeMint: () => void;
}) {
  const [qty, setQty] = useState(1);

  if (tab !== "equipment" && tab !== "cosmetics") return null;

  const cost = tab === "equipment" ? LOOT_MINT_COST : COSMETIC_MINT_COST;

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 space-y-2">
      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Mint</div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-gray-500">Qty:</span>
        {[1, 5, 10].map(q => (
          <button key={q} onClick={() => setQty(q)}
            className={`px-2 py-1 text-[10px] font-bold rounded border transition-all ${qty === q ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300" : "bg-white/[0.03] border-white/[0.06] text-gray-400 hover:border-gray-500"}`}
          >{q}</button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => onMint(qty)} disabled={loading}
          className={`px-3 py-1.5 text-[10px] font-bold border rounded transition-all ${loading ? "bg-gray-600/30 border-gray-500/30 text-gray-400" : tab === "equipment" ? "bg-yellow-600/30 border-yellow-500/30 text-yellow-300 hover:bg-yellow-600/50" : "bg-cyan-600/30 border-cyan-500/30 text-cyan-300 hover:bg-cyan-600/50"}`}
        >{loading ? "Minting..." : `Mint ${cost}🪙`}</button>
        <button onClick={onFreeMint} disabled={loading}
          className={`px-3 py-1.5 text-[10px] font-bold border rounded transition-all ${loading ? "bg-gray-600/30 border-gray-500/30 text-gray-400" : "bg-purple-600/30 border-purple-500/30 text-purple-300 hover:bg-purple-600/50"}`}
        >{loading ? "..." : "Free Mint 0🪙"}</button>
      </div>
      {msg && <div className="text-[10px] text-cyan-300">{msg}</div>}
    </div>
  );
}
