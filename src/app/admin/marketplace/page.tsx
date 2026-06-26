"use client";

import { useState } from "react";
import { getListings, getActiveListings, adminCancelListing } from "@/lib/game/GameStateManager";
import { GlassCard, AdminSearchBar, Badge } from "@/components/admin/StatCard";

export default function AdminMarketplace() {
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const listings = getListings();
  const active = getActiveListings();

  const showToast = (s: string) => { setToast(s); setTimeout(() => setToast(null), 2500); };

  let filtered = active;
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(l =>
      l.seller?.toLowerCase().includes(q) ||
      l.item_type?.toLowerCase().includes(q) ||
      l.item_id?.toString().includes(q)
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 bg-gray-900 border border-cyan-500/50 rounded shadow-lg text-xs text-cyan-300 font-mono animate-pulse">
          {toast}
        </div>
      )}

      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Marketplace</h1>
        <Badge color="cyan">{active.length} active</Badge>
        <Badge color="gray">{listings.length} total</Badge>
      </div>

      <GlassCard>
        <AdminSearchBar value={search} onChange={setSearch} placeholder="Search by seller, item type, ID..." />
      </GlassCard>

      <GlassCard>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-[9px] font-mono text-gray-500 uppercase py-2 px-2">Item Type</th>
                <th className="text-[9px] font-mono text-gray-500 uppercase py-2 px-2">Item ID</th>
                <th className="text-[9px] font-mono text-gray-500 uppercase py-2 px-2">Seller</th>
                <th className="text-[9px] font-mono text-gray-500 uppercase py-2 px-2">Price</th>
                <th className="text-[9px] font-mono text-gray-500 uppercase py-2 px-2">Status</th>
                <th className="text-[9px] font-mono text-gray-500 uppercase py-2 px-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l, i) => (
                <tr key={`${l.item_id}-${i}`} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="py-2 px-2 text-xs font-mono text-gray-300">{l.item_type}</td>
                  <td className="py-2 px-2 text-xs font-mono text-gray-500">{l.item_id}</td>
                  <td className="py-2 px-2 text-xs font-mono text-gray-500">{l.seller?.slice(0, 10)}...</td>
                  <td className="py-2 px-2 text-xs font-mono text-cyan-400">{l.price}</td>
                  <td className="py-2 px-2">
                    <Badge color={l.status === "active" ? "green" : l.status === "sold" ? "purple" : "red"}>{l.status}</Badge>
                  </td>
                  <td className="py-2 px-2">
                    {l.status === "active" && (
                      <button onClick={() => { if (confirm("Cancel this listing?")) { adminCancelListing(l.item_id); showToast("Listing cancelled"); } }}
                        className="px-2 py-0.5 text-[9px] bg-red-700 rounded text-white hover:bg-red-600">
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-8 text-center text-xs text-gray-600">No active listings</div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
