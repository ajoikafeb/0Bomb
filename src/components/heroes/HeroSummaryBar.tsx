"use client";

export function HeroSummaryBar({
  total, legendary, mythic, genesis, avgPower, avgLevel, autoFarming, dead,
}: {
  total: number; legendary: number; mythic: number; genesis: number;
  avgPower: number; avgLevel: number; autoFarming: number; dead: number;
}) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 gap-1.5">
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-2 text-center">
        <div className="text-sm font-bold text-cyan-400">{total}</div>
        <div className="text-[9px] text-gray-500">Heroes</div>
      </div>
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-2 text-center">
        <div className="text-sm font-bold text-emerald-400">{autoFarming}</div>
        <div className="text-[9px] text-gray-500">Farming</div>
      </div>
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-2 text-center">
        <div className="text-sm font-bold text-yellow-400">{legendary}</div>
        <div className="text-[9px] text-gray-500">Legendary</div>
      </div>
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-2 text-center">
        <div className="text-sm font-bold text-red-400">{dead}</div>
        <div className="text-[9px] text-gray-500">Dead</div>
      </div>
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-2 text-center">
        <div className="text-sm font-bold text-orange-400">{mythic}</div>
        <div className="text-[9px] text-gray-500">Mythic</div>
      </div>
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-2 text-center">
        <div className="text-sm font-bold text-cyan-300">{genesis}</div>
        <div className="text-[9px] text-gray-500">Genesis</div>
      </div>
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-2 text-center">
        <div className="text-sm font-bold text-red-400">{avgPower}</div>
        <div className="text-[9px] text-gray-500">Avg Power</div>
      </div>
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-2 text-center">
        <div className="text-sm font-bold text-green-400">{avgLevel}</div>
        <div className="text-[9px] text-gray-500">Avg Level</div>
      </div>
    </div>
  );
}
