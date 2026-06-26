import { getSupabase } from "./client";
import { supabaseLogger } from "./logger";

export interface GameNotification {
  id: string;
  owner_wallet: string;
  type: "info" | "success" | "warning" | "error" | "reward" | "market" | "admin" | "achievement" | "legacy" | "maintenance";
  title: string;
  body: string;
  data: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

function db() {
  return getSupabase();
}

export async function fetchNotifications(address: string, limit = 50): Promise<GameNotification[]> {
  if (!address) return [];
  try {
    const { data, error } = await db()
      .from("notifications")
      .select("*")
      .eq("owner_wallet", address)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) {
      supabaseLogger("fetchNotifications error:", error.message);
      return [];
    }
    return (data || []) as unknown as GameNotification[];
  } catch (e) {
    supabaseLogger("fetchNotifications exception:", e);
    return [];
  }
}

export async function fetchUnreadCount(address: string): Promise<number> {
  if (!address) return 0;
  try {
    const { count, error } = await db()
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("owner_wallet", address)
      .eq("read", false);
    if (error) return 0;
    return count || 0;
  } catch {
    return 0;
  }
}

export async function markNotificationRead(id: string): Promise<boolean> {
  try {
    const { error } = await db().from("notifications").update({ read: true }).eq("id", id);
    if (error) {
      supabaseLogger("markNotificationRead error:", error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function markAllNotificationsRead(address: string): Promise<boolean> {
  try {
    const { error } = await db()
      .from("notifications")
      .update({ read: true })
      .eq("owner_wallet", address)
      .eq("read", false);
    if (error) {
      supabaseLogger("markAllNotificationsRead error:", error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function sendNotification(
  ownerWallet: string,
  type: GameNotification["type"],
  title: string,
  body = "",
  data: Record<string, unknown> = {},
): Promise<boolean> {
  try {
    const { error } = await db().from("notifications").insert({
      owner_wallet: ownerWallet,
      type,
      title,
      body,
      data,
      read: false,
    });
    if (error) {
      supabaseLogger("sendNotification error:", error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function broadcastToAll(
  type: GameNotification["type"],
  title: string,
  body: string,
  allWallets: string[],
): Promise<number> {
  let sent = 0;
  for (const wallet of allWallets) {
    const ok = await sendNotification(wallet, type, title, body);
    if (ok) sent++;
  }
  supabaseLogger(`Broadcast sent to ${sent}/${allWallets.length} wallets`);
  return sent;
}

export async function deleteNotification(id: string): Promise<boolean> {
  try {
    const { error } = await db().from("notifications").delete().eq("id", id);
    if (error) {
      supabaseLogger("deleteNotification error:", error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
