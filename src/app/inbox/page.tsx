"use client";

import { useState, useEffect, useCallback } from "react";
import { useWalletContext } from "@/components/wallet/WalletProvider";
import { getMyInbox, markMessageRead, markAllRead, deleteMessage, clearAllMessages } from "@/lib/game/GameStateManager";
import { fetchNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from "@/lib/supabase/notifications";
import { isSyncEnabled } from "@/lib/supabase/sync";
import type { InboxMessage } from "@/lib/game/GameStateManager";
import type { GameNotification } from "@/lib/supabase/notifications";

const TYPE_ICONS: Record<string, string> = {
  battle: "⚔", market: "🏪", legacy: "⭐", system: "🔧", reward: "🎁",
  info: "ℹ️", success: "✅", warning: "⚠️", error: "❌",
  admin: "📢", achievement: "🏆", maintenance: "🔧",
};

export default function InboxPage() {
  const { isConnected, address } = useWalletContext();
  const [localMessages, setLocalMessages] = useState<InboxMessage[]>([]);
  const [remoteNotifs, setRemoteNotifs] = useState<GameNotification[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [useRemote, setUseRemote] = useState(false);

  const refresh = useCallback(() => {
    if (!address) return;
    const local = getMyInbox(address);
    setLocalMessages(local);
    if (isSyncEnabled()) {
      fetchNotifications(address).then(notifs => {
        if (notifs.length > 0) {
          setRemoteNotifs(notifs);
          setUseRemote(true);
        }
      });
    }
  }, [address]);

  useEffect(() => {
    if (isConnected && address) refresh();
  }, [isConnected, address, refresh]);

  const messages = useRemote
    ? remoteNotifs.map(n => ({
        id: n.id,
        title: n.title,
        body: n.body,
        type: n.type === "market" ? "market" : n.type === "legacy" ? "legacy" : n.type === "maintenance" ? "system" : n.type === "admin" ? "system" : n.type === "reward" ? "reward" : "system",
        targetAddress: n.owner_wallet,
        read: n.read,
        created_at: n.created_at,
      } as InboxMessage))
    : localMessages;

  const unread = messages.filter(m => !m.read).length;

  const handleRead = async (id: string) => {
    if (useRemote) {
      await markNotificationRead(id);
    } else {
      markMessageRead(id);
    }
    setSelected(id);
    refresh();
  };

  const handleMarkAllRead = async () => {
    if (useRemote && address) {
      await markAllNotificationsRead(address);
    } else {
      markAllRead();
    }
    refresh();
  };

  const handleDelete = async (id: string) => {
    if (useRemote) {
      await deleteNotification(id);
    } else {
      deleteMessage(id);
    }
    if (selected === id) setSelected(null);
    refresh();
  };

  const handleClearAll = () => {
    if (useRemote && address) {
      remoteNotifs.forEach(n => deleteNotification(n.id));
    } else {
      clearAllMessages();
    }
    setSelected(null);
    refresh();
  };

  if (!isConnected) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-cyan-400 mb-4">Connect Your Wallet</h1>
          <p className="text-gray-400">Connect to view your inbox.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] p-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Inbox {unread > 0 && <span className="text-xs text-yellow-400">({unread} unread)</span>}
          {useRemote && <span className="text-[9px] text-cyan-500 ml-2">● live</span>}
        </h1>
        <div className="flex gap-1">
          {unread > 0 && (
            <button onClick={handleMarkAllRead} className="px-2 py-1 text-[10px] font-bold border border-cyan-500/30 text-cyan-400 rounded hover:bg-cyan-500/10">
              Mark All Read
            </button>
          )}
          {messages.length > 0 && (
            <button onClick={handleClearAll} className="px-2 py-1 text-[10px] font-bold border border-red-500/30 text-red-400 rounded hover:bg-red-500/10">
              Clear All
            </button>
          )}
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-8 flex items-center justify-center min-h-[300px]">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-sm">No messages yet.</p>
            <p className="text-[10px] text-gray-600 mt-1">Battle results, market sales, and system updates appear here.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 space-y-1 max-h-[600px] overflow-y-auto">
            {messages.map(msg => (
              <button key={msg.id} onClick={() => handleRead(msg.id)}
                className={`w-full text-left p-2.5 rounded border transition-all ${
                  selected === msg.id ? "border-cyan-500 bg-cyan-500/10" : msg.read ? "border-gray-700 bg-black/20" : "border-cyan-500/30 bg-cyan-500/5"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{TYPE_ICONS[msg.type] || "📄"}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs truncate ${msg.read ? "text-gray-400" : "text-white font-bold"}`}>{msg.title}</div>
                    <div className="text-[9px] text-gray-500">{new Date(msg.created_at).toLocaleDateString()}</div>
                  </div>
                  {!msg.read && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />}
                </div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2">
            {selected ? (() => {
              const msg = messages.find(m => m.id === selected);
              if (!msg) return <div className="text-gray-500 text-xs">Select a message</div>;
              return (
                <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{TYPE_ICONS[msg.type] || "📄"}</span>
                      <div>
                        <h2 className="text-sm font-bold text-white">{msg.title}</h2>
                        <p className="text-[10px] text-gray-500">{new Date(msg.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(msg.id)} className="text-[10px] text-red-400 hover:text-red-300 px-2 py-1 border border-red-500/30 rounded">Delete</button>
                  </div>
                  <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">{msg.body}</div>
                  <div className="mt-3 text-[9px] text-gray-600">{msg.type.toUpperCase()}</div>
                </div>
              );
            })() : (
              <div className="bg-dark-2/50 border border-cyan-500/10 rounded-lg p-8 flex items-center justify-center min-h-[200px]">
                <div className="text-center text-gray-500">
                  <p className="text-xs">Select a message to read</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
