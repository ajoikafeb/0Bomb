"use client";

import { GlassCard, Badge } from "@/components/admin/StatCard";
import { CHAIN_ID, RPC_URL, TOKEN_CONTRACT, TOKEN_SYMBOL } from "@/lib/game/constants";
import { getTokenBalance } from "@/lib/game/GameStateManager";

export default function AdminBlockchain() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Blockchain Panel</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard title="Network">
          <div className="space-y-2 text-xs text-gray-400">
            <div className="flex justify-between">
              <span className="text-[10px] text-gray-500">Chain ID</span>
              <span className="font-mono text-cyan-400">{CHAIN_ID}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] text-gray-500">Network</span>
              <span className="font-mono text-cyan-400">0G Galileo Testnet</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] text-gray-500">RPC</span>
              <span className="font-mono text-[9px] text-gray-500 truncate max-w-[150px]">{RPC_URL}</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard title="Token">
          <div className="space-y-2 text-xs text-gray-400">
            <div className="flex justify-between">
              <span className="text-[10px] text-gray-500">Symbol</span>
              <span className="font-mono text-yellow-400">{TOKEN_SYMBOL}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] text-gray-500">Circulation</span>
              <span className="font-mono text-cyan-400">{getTokenBalance().toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] text-gray-500">Contract</span>
              <span className="font-mono text-[9px] text-gray-500 truncate max-w-[120px]">{TOKEN_CONTRACT}</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard title="Status">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-500">RPC Health</span>
              <Badge color="green">Connected</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-500">Block</span>
              <span className="font-mono text-cyan-400">Live</span>
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard title="Contract Addresses">
        <div className="space-y-2 text-[11px] font-mono">
          <div className="flex justify-between py-1 border-b border-white/[0.03]">
            <span className="text-gray-500">HeroNFT</span>
            <span className="text-gray-400">{process.env.NEXT_PUBLIC_HERO_NFT_ADDRESS || "0x0...0"}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-white/[0.03]">
            <span className="text-gray-500">EquipmentNFT</span>
            <span className="text-gray-400">{process.env.NEXT_PUBLIC_EQUIPMENT_NFT_ADDRESS || "0x0...0"}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-white/[0.03]">
            <span className="text-gray-500">CosmeticNFT</span>
            <span className="text-gray-400">{process.env.NEXT_PUBLIC_COSMETIC_NFT_ADDRESS || "0x0...0"}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-white/[0.03]">
            <span className="text-gray-500">LegacyCoreNFT</span>
            <span className="text-gray-400">{process.env.NEXT_PUBLIC_LEGACY_CORE_NFT_ADDRESS || "0x0...0"}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-500">BadgeNFT</span>
            <span className="text-gray-400">{process.env.NEXT_PUBLIC_BADGE_NFT_ADDRESS || "0x0...0"}</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
