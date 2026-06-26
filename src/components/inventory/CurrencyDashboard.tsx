"use client";

import { useBalance } from "@/components/balance/BalanceProvider";
import { useWalletContext } from "@/components/wallet/WalletProvider";
import { getFragments, claimTokens, getEnergyPotions, getVoucherUsage } from "@/lib/game/GameStateManager";
import { useState } from "react";

export function CurrencyDashboard({ onRefresh }: { onRefresh: () => void }) {
  const { address } = useWalletContext();
  const { obombBalance, fragmentBalance, energyPotions, refreshBalances } = useBalance();
  const [claimMsg, setClaimMsg] = useState("");

  const handleClaim = () => {
    if (!address) return;
    const result = claimTokens(address);
    setClaimMsg(result.message);
    if (result.ok) {
      onRefresh();
      refreshBalances();
    }
    setTimeout(() => setClaimMsg(""), 5000);
  };

  const canClaim = fragmentBalance >= 5000;

  return (
    <div className="space-y-2">
      {/* 0BOMB */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 flex items-center justify-between">
        <div>
          <div className="text-[9px] text-gray-500 uppercase tracking-wider">0BOMB</div>
          <div className="text-lg font-bold text-yellow-400 font-mono">{parseFloat(obombBalance).toFixed(2)}</div>
          <div className="text-[9px] text-emerald-400">On-chain</div>
        </div>
        <div className="text-2xl">🪙</div>
      </div>

      {/* Fragments */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
        <div className="flex items-center justify-between mb-1">
          <div className="text-[9px] text-gray-500 uppercase tracking-wider">Fragments</div>
          <span className="text-lg font-bold text-purple-400">{fragmentBalance}</span>
        </div>
        <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all" style={{ width: `${Math.min(100, (fragmentBalance / 5000) * 100)}%` }} />
        </div>
        <div className="flex justify-between text-[9px] text-gray-500 mt-1">
          <span>Claim progress</span>
          <span>{fragmentBalance}/5000</span>
        </div>
        {canClaim && (
          <button onClick={handleClaim}
            className="mt-2 w-full px-3 py-1.5 text-[10px] font-bold bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg text-white hover:from-purple-500 hover:to-cyan-500 transition-all"
          >
            Claim 500 0BOMB
          </button>
        )}
        {claimMsg && <div className="text-[10px] text-cyan-300 mt-1">{claimMsg}</div>}
      </div>

      {/* Energy Potions */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
        <div className="text-[9px] text-gray-500 uppercase tracking-wider">Energy Potions</div>
        <div className="text-lg font-bold text-cyan-300">{energyPotions}</div>
        <div className="text-[9px] text-gray-500 mt-0.5">Restore hero energy in battle</div>
      </div>

      {/* Voucher Usage */}
      {address && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
          <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-1.5">Voucher Usage</div>
          <div className="space-y-1 text-[10px]">
            <div className="flex justify-between"><span className="text-gray-400">Hero</span><span className="text-gray-300">{getVoucherUsage(address, "hero")} / 3</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Equipment</span><span className="text-gray-300">{getVoucherUsage(address, "equipment")} / 3</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Cosmetic</span><span className="text-gray-300">{getVoucherUsage(address, "cosmetic")} / 3</span></div>
          </div>
        </div>
      )}
    </div>
  );
}
