"use client";

import { useState, useEffect } from "react";
import { useWalletContext } from "./WalletProvider";
import { OWNER_WALLET } from "@/lib/game/constants";
import { TOKEN_SYMBOL } from "@/lib/game/constants";
import { getFragments } from "@/lib/game/GameStateManager";

function shortenAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function ConnectButton() {
  const { address, balance, isConnected, isConnecting, connect, disconnect, refreshBalance } = useWalletContext();
  const isOwner = address?.toLowerCase() === OWNER_WALLET.toLowerCase();
  const [fragments, setFragments] = useState(0);

  useEffect(() => {
    if (address) { setFragments(getFragments(address)); }
  }, [address, balance]);

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 px-3 py-1 bg-black/30 rounded border border-cyan-500/30 text-xs">
          <span className="text-cyan-400 font-mono">{shortenAddress(address)}</span>
          <button onClick={() => { refreshBalance(); if (address) setFragments(getFragments(address)); }} className="text-gray-400 hover:text-white ml-1" title="Refresh">↻</button>
        </div>
        <div className="px-3 py-1 bg-black/30 rounded border border-yellow-500/30 text-xs" title="0Bomb wallet balance">
          <span className="text-yellow-400 font-mono">{parseFloat(balance).toFixed(4)}</span>
          <span className="text-gray-400 ml-1">{TOKEN_SYMBOL}</span>
        </div>
        {fragments > 0 && (
          <div className="px-2 py-1 bg-purple-600/20 border border-purple-500/30 rounded text-xs" title="0B Fragments (earn from battles)">
            <span className="text-purple-300">💎 {fragments} <span className="text-[9px] text-purple-400">Fragment</span></span>
          </div>
        )}
        {isOwner && (
          <div className="px-2 py-1 bg-purple-600/30 border border-purple-500/50 rounded text-xs text-purple-300">
            Admin
          </div>
        )}
        <button onClick={disconnect} className="px-3 py-1 text-xs text-red-400 border border-red-500/30 rounded hover:bg-red-500/10">
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={isConnecting}
      className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-cyan-600 to-purple-600 rounded hover:from-cyan-500 hover:to-purple-500 disabled:opacity-50 transition-all"
    >
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
