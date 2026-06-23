"use client";

import { useState, useEffect } from "react";
import { useWalletContext } from "@/components/wallet/WalletProvider";
import { getMyTransactions, getMyWithdrawals, clearAllMessages } from "@/lib/game/GameStateManager";
import type { Transaction, WithdrawalRequest } from "@/lib/game/GameStateManager";

type Tab = "tx" | "wd";
type TxFilter = "all" | "income" | "expense";
type CatFilter = "all" | "hatch" | "mint_loot" | "mint_cosmetic" | "mint_hero" | "market_buy" | "market_sale" | "reward";

const CATEGORIES: { id: CatFilter; label: string; icon: string }[] = [
  { id: "all", label: "All", icon: "📋" },
  { id: "hatch", label: "Hatch", icon: "🐣" },
  { id: "mint_loot", label: "Mint Loot", icon: "🎒" },
  { id: "mint_cosmetic", label: "Mint Cosmetic", icon: "🎨" },
  { id: "mint_hero", label: "Mint Hero", icon: "👤" },
  { id: "market_buy", label: "Market Buy", icon: "🛒" },
  { id: "market_sale", label: "Market Sale", icon: "💰" },
  { id: "reward", label: "Rewards", icon: "🎁" },
];

const CATEGORY_LABELS: Record<string, string> = {
  hatch: "Hatch Hero",
  mint_loot: "Mint Equipment",
  mint_cosmetic: "Mint Cosmetic",
  mint_hero: "Mint Hero",
  market_buy: "Market Purchase",
  market_sale: "Market Sale",
  reward: "Reward Claim",
};

const WD_STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-600/20 border-yellow-500/30 text-yellow-300",
  completed: "bg-green-600/20 border-green-500/30 text-green-300",
  rejected: "bg-red-600/20 border-red-500/30 text-red-300",
};

export default function HistoryPage() {
  const { isConnected, address } = useWalletContext();
  const [tab, setTab] = useState<Tab>("tx");
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [filter, setFilter] = useState<TxFilter>("all");
  const [catFilter, setCatFilter] = useState<CatFilter>("all");

  const refresh = () => {
    if (!address) return;
    setTxs(getMyTransactions(address));
    setWithdrawals(getMyWithdrawals(address));
  };

  useEffect(() => {
    if (isConnected && address) refresh();
  }, [isConnected, address]);

  const filtered = txs.filter(tx => {
    if (filter !== "all" && tx.type !== filter) return false;
    if (catFilter !== "all" && tx.category !== catFilter) return false;
    return true;
  });

  const incomeTotal = filtered.filter(t => t.type === "income").reduce((s, t) => s + parseFloat(t.amount || "0"), 0);
  const expenseTotal = filtered.filter(t => t.type === "expense").reduce((s, t) => s + parseFloat(t.amount || "0"), 0);
  const netTotal = incomeTotal - expenseTotal;

  if (!isConnected) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-cyan-400 mb-4">Connect Your Wallet</h1>
          <p className="text-gray-400">Connect to view your transaction history.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] p-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          History
        </h1>
        <div className="flex gap-1">
          <button onClick={() => setTab("tx")}
            className={`px-3 py-1 text-[10px] font-bold rounded border transition-all ${tab === "tx" ? "border-cyan-500 bg-cyan-500/15 text-cyan-300" : "border-gray-700 text-gray-500"}`}
          >📋 Transactions</button>
          <button onClick={() => setTab("wd")}
            className={`px-3 py-1 text-[10px] font-bold rounded border transition-all ${tab === "wd" ? "border-purple-500 bg-purple-500/15 text-purple-300" : "border-gray-700 text-gray-500"}`}
          >💸 Withdrawals ({withdrawals.length})</button>
        </div>
      </div>

      {tab === "tx" ? (
        <>
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-wrap gap-1">
              <button onClick={() => setFilter("all")}
                className={`px-2.5 py-1 text-[10px] font-bold rounded border ${filter === "all" ? "border-cyan-500 bg-cyan-500/15 text-cyan-300" : "border-gray-700 text-gray-500"}`}>All</button>
              <button onClick={() => setFilter("income")}
                className={`px-2.5 py-1 text-[10px] font-bold rounded border ${filter === "income" ? "border-green-500 bg-green-500/15 text-green-300" : "border-gray-700 text-gray-500"}`}>Income</button>
              <button onClick={() => setFilter("expense")}
                className={`px-2.5 py-1 text-[10px] font-bold rounded border ${filter === "expense" ? "border-red-500 bg-red-500/15 text-red-300" : "border-gray-700 text-gray-500"}`}>Expense</button>
            </div>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="text-green-400">+{incomeTotal.toFixed(2)}</span>
              <span className="text-red-400">-{expenseTotal.toFixed(2)}</span>
              <span className={netTotal >= 0 ? "text-cyan-400" : "text-red-400"}>
                = {netTotal.toFixed(2)} 🪙
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1 mb-4">
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setCatFilter(c.id)}
                className={`px-2 py-0.5 text-[9px] rounded border ${catFilter === c.id ? "border-purple-500 bg-purple-500/15 text-purple-300" : "border-gray-700 text-gray-500"}`}>{c.icon} {c.label}</button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-8 flex items-center justify-center min-h-[200px]">
              <div className="text-center text-gray-500">
                <div className="text-3xl mb-2">📭</div>
                <p className="text-xs">No transactions yet.</p>
                <p className="text-[10px] text-gray-600 mt-1">Hatch heroes, mint items, and trade on the marketplace to build your history.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-2.5 bg-dark-2/50 border border-cyan-500/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${tx.type === "income" ? "bg-green-400" : "bg-red-400"}`} />
                    <div>
                      <div className="text-xs font-bold text-white">{CATEGORY_LABELS[tx.category] || tx.category}</div>
                      <div className="text-[9px] text-gray-500">{tx.description}</div>
                      <div className="text-[8px] text-gray-600">{new Date(tx.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className={`text-xs font-bold shrink-0 ${tx.type === "income" ? "text-green-400" : "text-red-400"}`}>
                    {tx.type === "income" ? "+" : "-"}{parseFloat(tx.amount || "0").toFixed(2)} 🪙
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <p className="text-[10px] text-gray-500 mb-3">Withdrawal requests and their current status.</p>
          {withdrawals.length === 0 ? (
            <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-8 flex items-center justify-center min-h-[200px]">
              <div className="text-center text-gray-500">
                <div className="text-3xl mb-2">💸</div>
                <p className="text-xs">No withdrawals yet.</p>
                <p className="text-[10px] text-gray-600 mt-1">Request a withdrawal from the Inventory page.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {[...withdrawals].reverse().map(wd => (
                <div key={wd.id} className="flex items-center justify-between p-2.5 bg-dark-2/50 border border-cyan-500/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      wd.status === "completed" ? "bg-green-400" : wd.status === "rejected" ? "bg-red-400" : "bg-yellow-400"
                    }`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">Withdrawal</span>
                        <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded border ${WD_STATUS_STYLES[wd.status] || "border-gray-700 text-gray-500"}`}>
                          {wd.status === "pending" ? "⏳ Pending" : wd.status === "completed" ? "✅ Completed" : "❌ Rejected"}
                        </span>
                      </div>
                      <div className="text-[9px] text-gray-500">
                        {wd.status === "pending" ? "Awaiting admin approval" : wd.status === "completed" ? `Confirmed — TX: ${wd.txHash?.slice(0, 10)}...` : "Fragments returned"}
                      </div>
                      <div className="text-[8px] text-gray-600">{new Date(wd.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-amber-400 shrink-0">
                    {wd.amount} 🪙
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}