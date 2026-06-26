"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useWalletContext } from "@/components/wallet/WalletProvider";
import { useBalance } from "@/components/balance/BalanceProvider";
import { getUnreadCount } from "@/lib/game/GameStateManager";
import { Skeleton } from "@/components/ui/Skeleton";

function shortenAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function TopBar() {
  const { address, isConnected, connect, disconnect, isConnecting } = useWalletContext();
  const { obombBalance, fragmentBalance, isLoading, error, refreshBalances } = useBalance();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const refresh = () => {
      if (typeof window !== "undefined") setUnread(getUnreadCount(address || undefined));
    };
    refresh();
    const interval = setInterval(refresh, 10000);
    return () => clearInterval(interval);
  }, [address]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 panel-dark border-b border-cyan-500/10 h-12">
      <div className="h-full px-3 flex items-center justify-between gap-2">
        {/* Logo + Nav */}
        <div className="flex items-center gap-4 shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-black">0G</div>
            <span className="font-bold text-sm bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent hidden sm:inline">0GBomber</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-3 text-[11px] font-medium">
            <Link href="/game" className="text-cyan-400 border-b border-cyan-400 pb-0.5">Game</Link>
            <Link href="/heroes" className="text-gray-400 hover:text-cyan-300">Heroes</Link>
            <Link href="/inventory" className="text-gray-400 hover:text-cyan-300">Inventory</Link>
            <Link href="/market" className="text-gray-400 hover:text-cyan-300">Market</Link>
            <Link href="/legacy" className="text-gray-400 hover:text-cyan-300">Legacy</Link>
            <Link href="/faucet" className="text-gray-400 hover:text-cyan-300">Faucet</Link>
            <Link href="/leaderboard" className="text-gray-400 hover:text-cyan-300">Leaderboard</Link>
          </nav>
        </div>

        {/* Right: Wallet → OBOMB → Fragments → Inbox → Profile → Disconnect */}
        {isConnected && address ? (
          <div className="flex items-center gap-1.5">
            {/* Wallet Address */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-cyan-500/5 border border-cyan-500/10">
              <span className="text-[10px] text-cyan-400 font-mono">{shortenAddress(address)}</span>
              <button onClick={refreshBalances} className="text-gray-500 hover:text-cyan-400 transition-colors" title="Refresh">↻</button>
            </div>

            {/* OBOMB Balance */}
            {isLoading ? (
              <Skeleton className="w-16 h-6 rounded-md" />
            ) : error ? (
              <button onClick={refreshBalances} className="text-[10px] text-red-400 underline px-1">Retry</button>
            ) : (
              <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-yellow-500/5 border border-yellow-500/10">
                <span className="text-[9px]">🪙</span>
                <span className="text-[10px] text-yellow-400 font-bold">{parseFloat(obombBalance).toFixed(2)}</span>
                <span className="text-[8px] text-yellow-500/60">0BOMB</span>
              </div>
            )}

            {/* Fragments */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-purple-500/5 border border-purple-500/10">
              <span className="text-[9px]">💎</span>
              <span className="text-[10px] text-purple-400 font-bold">{fragmentBalance}</span>
            </div>

            {/* Inbox */}
            <Link href="/inbox" className="relative p-1.5 rounded-md hover:bg-white/5 transition-colors">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M2 4a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V4z" stroke="#94a3b8" strokeWidth="1.2"/>
                <path d="M2 8l4 2 4-2" stroke="#94a3b8" strokeWidth="1.2"/>
              </svg>
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 flex items-center justify-center bg-red-500 text-white text-[7px] font-bold rounded-full">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>

            {/* Profile */}
            <Link href="/profile" className="p-1.5 rounded-md hover:bg-white/5 transition-colors">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="5" r="3" stroke="#94a3b8" strokeWidth="1.2"/>
                <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="#94a3b8" strokeWidth="1.2"/>
              </svg>
            </Link>

            {/* Disconnect */}
            <button onClick={disconnect} className="px-2 py-1 text-[10px] text-red-400 border border-red-500/20 rounded-md hover:bg-red-500/10 transition-colors">
              Disconnect
            </button>
          </div>
        ) : (
          <button onClick={connect} disabled={isConnecting}
            className="px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-purple-600 rounded-lg hover:from-cyan-500 hover:to-purple-500 disabled:opacity-50 transition-all shadow-lg shadow-cyan-500/10"
          >{isConnecting ? "Connecting..." : "Connect Wallet"}</button>
        )}
      </div>
    </header>
  );
}
