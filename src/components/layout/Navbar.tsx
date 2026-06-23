"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import ConnectButton from "@/components/wallet/ConnectButton";
import { useWalletContext } from "@/components/wallet/WalletProvider";
import { getUnreadCount } from "@/lib/game/GameStateManager";

export default function Navbar() {
  const [unread, setUnread] = useState(0);
  const { address } = useWalletContext();

  const refreshUnread = () => {
    if (typeof window !== "undefined") setUnread(getUnreadCount(address || undefined));
  };

  useEffect(() => {
    refreshUnread();
    const interval = setInterval(refreshUnread, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a1a]/90 backdrop-blur-md border-b border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="0GBomber" width={32} height={32} className="rounded" />
          <span className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            0GBomber
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-5 text-sm">
          <Link href="/game" className="text-gray-300 hover:text-cyan-400 transition-colors">Game</Link>
          <Link href="/heroes" className="text-gray-300 hover:text-cyan-400 transition-colors">Heroes</Link>
          <Link href="/inventory" className="text-gray-300 hover:text-cyan-400 transition-colors">Inventory</Link>
          <Link href="/legacy" className="text-gray-300 hover:text-cyan-400 transition-colors">Legacy</Link>
          <Link href="/market" className="text-gray-300 hover:text-cyan-400 transition-colors">Market</Link>
          <Link href="/faucet" className="text-gray-300 hover:text-cyan-400 transition-colors">Faucet</Link>
          <Link href="/history" className="text-gray-300 hover:text-cyan-400 transition-colors">History</Link>
          <Link href="/leaderboard" className="text-gray-300 hover:text-cyan-400 transition-colors">Leaderboard</Link>
          <Link href="/inbox" className="relative text-gray-300 hover:text-cyan-400 transition-colors">
            Inbox
            {unread > 0 && (
              <span className="absolute -top-1.5 -right-3.5 w-4 h-4 flex items-center justify-center bg-red-500 text-white text-[8px] font-bold rounded-full">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>
          <Link href="/profile" className="text-gray-300 hover:text-cyan-400 transition-colors">Profile</Link>
        </div>

        <ConnectButton />
      </div>
    </nav>
  );
}
