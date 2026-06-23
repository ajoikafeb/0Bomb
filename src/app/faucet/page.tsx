"use client";
import { useState, useEffect } from "react";
import { useWalletContext } from "@/components/wallet/WalletProvider";
import { claimFaucet, getFaucetCooldown, getPlayerBalance } from "@/lib/game/GameStateManager";

export default function FaucetPage() {
  const { isConnected, address } = useWalletContext();
  const [cooldown, setCooldown] = useState(0);
  const [balance, setBalance] = useState(0);
  const [msg, setMsg] = useState("");
  const [claiming, setClaiming] = useState(false);

  const refresh = () => {
    if (address) {
      setCooldown(getFaucetCooldown(address));
      setBalance(getPlayerBalance(address));
    }
  };

  useEffect(() => { refresh(); }, [address]);
  useEffect(() => { if (cooldown > 0) { const t = setInterval(() => { const c = getFaucetCooldown(address); setCooldown(c); if (c <= 0) clearInterval(t); }, 10000); return () => clearInterval(t); } }, [cooldown, address]);

  const handleClaim = async () => {
    if (!address) return;
    setClaiming(true);
    const result = claimFaucet(address);
    setMsg(result.message);
    refresh();
    setClaiming(false);
  };

  const hours = Math.ceil(cooldown / 3600000);

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            💧 Faucet
          </h1>
          <p className="text-gray-400 text-sm mt-2">Claim free 0BOMB tokens to start playing</p>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6 space-y-4">
          {!isConnected ? (
            <p className="text-gray-400 text-center text-sm">Connect your wallet to claim.</p>
          ) : (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Balance</span>
                <span className="text-cyan-400 font-mono font-bold">{balance.toLocaleString()} 0BOMB</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Claim amount</span>
                <span className="text-green-400 font-mono">200 0BOMB</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Cooldown</span>
                <span className="text-gray-300 font-mono">{cooldown > 0 ? `${hours}h` : "Ready"}</span>
              </div>

              <button onClick={handleClaim} disabled={cooldown > 0 || claiming} className="w-full py-3 rounded-lg font-bold text-sm bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-all">
                {claiming ? "Claiming..." : cooldown > 0 ? `Wait ${hours}h` : "Claim Free 0BOMB"}
              </button>

              {msg && (
                <p className={`text-center text-xs font-mono ${msg.includes("Claimed") ? "text-green-400" : "text-yellow-400"}`}>
                  {msg}
                </p>
              )}
            </>
          )}

          <div className="pt-4 border-t border-white/[0.04] text-[10px] text-gray-500 space-y-1">
            <p>• {FAUCET_AMOUNT} free 0BOMB every 24 hours</p>
            <p>• Tokens added to in-game balance</p>
            <p>• Use tokens to hatch heroes, mint items, and trade</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const FAUCET_AMOUNT = 200;
