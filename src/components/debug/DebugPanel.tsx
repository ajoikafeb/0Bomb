"use client";

import { useEffect, useRef, useState } from "react";
import { useWalletContext } from "@/components/wallet/WalletProvider";
import { useBalance } from "@/components/balance/BalanceProvider";

interface DebugPanelProps {
  onClose: () => void;
}

export function DebugPanel({ onClose }: DebugPanelProps) {
  const { address, balance, isConnected, isCorrectNet } = useWalletContext();
  const { obombBalance, obombSource, fragmentBalance, energyPotions, playerBalance, lastUpdated, isLoading, error, refreshBalances } = useBalance();
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    if (!mounted) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    setTimeout(() => window.addEventListener("click", handleClick), 0);
    return () => window.removeEventListener("click", handleClick);
  }, [mounted, onClose]);

  const entries = [
    { label: "Wallet", value: address || "Not connected" },
    { label: "Chain ID", value: isCorrectNet ? "16602 (0G Galileo)" : "Wrong network" },
    { label: "Wallet Balance", value: `${parseFloat(balance).toFixed(4)} 0BOMB` },
    { label: "Source", value: obombSource === "on-chain" ? "On-Chain (contract)" : "Game State (local)" },
    { label: "0BOMB Balance", value: `${parseFloat(obombBalance).toFixed(4)}` },
    { label: "Fragments", value: String(fragmentBalance) },
    { label: "Potions", value: String(energyPotions) },
    { label: "Player Balance", value: String(playerBalance) },
    { label: "Last Updated", value: lastUpdated ? new Date(lastUpdated).toLocaleString() : "Never" },
    { label: "Error", value: error || "None" },
    { label: "Connected", value: isConnected ? "Yes" : "No" },
    { label: "Loading", value: isLoading ? "Yes" : "No" },
  ];

  return (
    <div ref={ref} className="absolute top-full right-0 mt-1 mr-3 w-80 rounded-xl panel-dark border border-cyan-500/20 shadow-2xl z-50">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[11px] font-semibold text-cyan-300 uppercase tracking-wider">Debug Panel</span>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white text-xs">&times;</button>
      </div>
      <div className="p-3 max-h-80 overflow-y-auto">
        <table className="w-full text-[10px]">
          <tbody>
            {entries.map(({ label, value }) => (
              <tr key={label} className="border-b border-white/[0.03]">
                <td className="py-1.5 pr-3 text-gray-500 whitespace-nowrap">{label}</td>
                <td className={`py-1.5 text-right font-mono truncate max-w-[180px] ${
                  label === "Error" && value !== "None" ? "text-red-400" :
                  label === "Source" && value.includes("On-Chain") ? "text-emerald-400" :
                  label === "Source" ? "text-amber-400" :
                  "text-gray-300"
                }`}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2.5 border-t border-white/[0.06]">
        <div className="flex gap-2">
          <button onClick={refreshBalances} className="flex-1 px-3 py-1.5 text-[10px] font-medium text-cyan-400 bg-cyan-500/10 rounded hover:bg-cyan-500/20 transition-colors">
            Refresh Balances
          </button>
          <button onClick={onClose} className="px-3 py-1.5 text-[10px] font-medium text-gray-400 bg-white/5 rounded hover:bg-white/10 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
