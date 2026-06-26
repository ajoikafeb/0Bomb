"use client";

import { useWalletContext } from "./WalletProvider";
import { OWNER_WALLET } from "@/lib/game/constants";

function shortenAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function ConnectButton() {
  const { address, isConnected, isConnecting, connect, disconnect } = useWalletContext();
  const isOwner = address?.toLowerCase() === OWNER_WALLET.toLowerCase();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-cyan-400 font-mono">{shortenAddress(address)}</span>
        {isOwner && <span className="text-[9px] text-purple-400">Admin</span>}
        <button onClick={disconnect} className="text-[10px] text-red-400 underline hover:text-red-300">
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button onClick={connect} disabled={isConnecting}
      className="px-3 py-1 text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-purple-600 rounded hover:from-cyan-500 hover:to-purple-500 disabled:opacity-50 transition-all"
    >{isConnecting ? "Connecting..." : "Connect Wallet"}</button>
  );
}
