"use client";

import { useState } from "react";
import { getAuditLog, getTransactions } from "@/lib/game/GameStateManager";
import { GlassCard, AdminSearchBar, Badge } from "@/components/admin/StatCard";

export default function AdminLogs() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"audit" | "transactions">("audit");

  const auditLog = getAuditLog();
  const transactions = getTransactions();

  const data = tab === "audit" ? auditLog : transactions;

  const filtered = search
    ? data.filter((entry: any) =>
        JSON.stringify(entry).toLowerCase().includes(search.toLowerCase())
      )
    : data;

  const exportCSV = () => {
    const headers = tab === "audit"
      ? "timestamp,action,wallet,detail"
      : "timestamp,type,from,to,amount";
    const rows = filtered.map((entry: any) => {
      if (tab === "audit") return `${entry.timestamp},${entry.action},${entry.wallet},${entry.detail}`;
      return `${entry.timestamp},${entry.type},${entry.from},${entry.to},${entry.amount}`;
    });
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${tab}_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Logs</h1>
        <Badge color="cyan">{filtered.length} entries</Badge>
        <button onClick={exportCSV}
          className="px-3 py-1 text-[10px] font-bold bg-cyan-700 rounded text-white hover:bg-cyan-600">
          Export CSV
        </button>
      </div>

      <GlassCard>
        <div className="flex gap-3 items-center">
          <div className="flex gap-1">
            {(["audit", "transactions"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-1.5 text-[10px] font-mono rounded-lg transition-colors ${
                  tab === t ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/20" : "text-gray-500 hover:text-gray-300"
                }`}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex-1">
            <AdminSearchBar value={search} onChange={setSearch} placeholder="Search logs..." />
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-dark-1">
              <tr className="border-b border-white/[0.06]">
                {tab === "audit" ? (
                  <>
                    <th className="text-[9px] font-mono text-gray-500 uppercase py-2 px-2">Timestamp</th>
                    <th className="text-[9px] font-mono text-gray-500 uppercase py-2 px-2">Action</th>
                    <th className="text-[9px] font-mono text-gray-500 uppercase py-2 px-2">Wallet</th>
                    <th className="text-[9px] font-mono text-gray-500 uppercase py-2 px-2">Detail</th>
                  </>
                ) : (
                  <>
                    <th className="text-[9px] font-mono text-gray-500 uppercase py-2 px-2">Time</th>
                    <th className="text-[9px] font-mono text-gray-500 uppercase py-2 px-2">Type</th>
                    <th className="text-[9px] font-mono text-gray-500 uppercase py-2 px-2">From</th>
                    <th className="text-[9px] font-mono text-gray-500 uppercase py-2 px-2">To</th>
                    <th className="text-[9px] font-mono text-gray-500 uppercase py-2 px-2">Amount</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 500).map((entry: any, i: number) => (
                <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  {tab === "audit" ? (
                    <>
                      <td className="py-2 px-2 text-[10px] font-mono text-gray-500">{entry.timestamp || "-"}</td>
                      <td className="py-2 px-2 text-[10px] font-mono text-gray-300">{entry.action || "-"}</td>
                      <td className="py-2 px-2 text-[10px] font-mono text-gray-500">{entry.wallet?.slice(0, 10) || "-"}...</td>
                      <td className="py-2 px-2 text-[10px] font-mono text-gray-500 max-w-[300px] truncate">{entry.detail || "-"}</td>
                    </>
                  ) : (
                    <>
                      <td className="py-2 px-2 text-[10px] font-mono text-gray-500">{entry.timestamp || "-"}</td>
                      <td className="py-2 px-2 text-[10px]">
                        <Badge color={entry.type === "send" ? "red" : entry.type === "receive" ? "green" : "cyan"}>{entry.type || "-"}</Badge>
                      </td>
                      <td className="py-2 px-2 text-[10px] font-mono text-gray-500">{entry.from?.slice(0, 10) || "-"}</td>
                      <td className="py-2 px-2 text-[10px] font-mono text-gray-500">{entry.to?.slice(0, 10) || "-"}</td>
                      <td className="py-2 px-2 text-[10px] font-mono text-gray-400">{entry.amount || "-"}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-8 text-center text-xs text-gray-600">No logs found</div>
          )}
          {filtered.length > 500 && (
            <div className="py-2 text-center text-[9px] text-gray-600">Showing 500 of {filtered.length} entries</div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
