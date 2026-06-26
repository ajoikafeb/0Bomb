"use client";

import { useWalletContext } from "@/components/wallet/WalletProvider";
import { useBalance } from "@/components/balance/BalanceProvider";
import { useState, useCallback, useRef } from "react";

export function InventoryHeader({
  nftCount,
  equipmentCount,
  cosmeticsCount,
  search,
  onSearchChange,
  onRefresh,
}: {
  nftCount: number;
  equipmentCount: number;
  cosmeticsCount: number;
  search: string;
  onSearchChange: (v: string) => void;
  onRefresh: () => void;
}) {
  const { address } = useWalletContext();
  const { obombBalance, fragmentBalance, refreshBalances } = useBalance();
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCopy = useCallback(() => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [address]);

  const totalNfts = nftCount + equipmentCount + cosmeticsCount;

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        {/* Left: Wallet + Stats */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {address && (
            <button onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/[0.03] border border-white/[0.08] rounded-lg hover:bg-white/[0.06] transition-colors group"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-mono text-gray-400 group-hover:text-gray-300">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
              <span className="text-[9px] text-gray-600 group-hover:text-cyan-400">
                {copied ? "✓" : "⧉"}
              </span>
            </button>
          )}

          <div className="flex items-center gap-3 text-[10px]">
            <div className="flex items-center gap-1.5">
              <span className="text-yellow-400 font-bold">{parseFloat(obombBalance).toFixed(1)}</span>
              <span className="text-gray-500">0BOMB</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-purple-400 font-bold">{fragmentBalance}</span>
              <span className="text-gray-500">Frag</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500">
              <span className="text-cyan-400 font-bold">{totalNfts}</span>
              <span>NFTs</span>
            </div>
          </div>
        </div>

        {/* Right: Search + Actions */}
        <div className="flex items-center gap-2 flex-1 lg:justify-end">
          <div className="relative flex-1 max-w-xs">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Search by name, ID, trait..."
              className="w-full pl-7 pr-2.5 py-1.5 text-[11px] bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/40 transition-colors"
            />
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-600 text-[10px]">🔍</span>
          </div>
          <button onClick={() => { onRefresh(); refreshBalances(); }}
            className="px-2.5 py-1.5 text-[10px] font-medium bg-white/[0.03] border border-white/[0.08] rounded-lg text-gray-400 hover:text-cyan-300 hover:border-cyan-500/30 transition-colors"
          >
            ⟳
          </button>
        </div>
      </div>
    </div>
  );
}
