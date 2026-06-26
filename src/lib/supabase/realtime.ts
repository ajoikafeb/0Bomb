import { getSupabase } from "./client";
import { supabaseLogger } from "./logger";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type ChangeHandler = (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;

interface Subscription {
  channel: string;
  unsubscribe: () => void;
}

const activeSubscriptions: Subscription[] = [];

export function clearAllSubscriptions() {
  for (const sub of activeSubscriptions) {
    sub.unsubscribe();
  }
  activeSubscriptions.length = 0;
  supabaseLogger("All Realtime subscriptions cleared");
}

export function subscribeToTable(
  table: string,
  filter?: { column: string; value: string },
  onInsert?: ChangeHandler,
  onUpdate?: ChangeHandler,
  onDelete?: ChangeHandler,
): Subscription {
  const db = getSupabase();
  const channelName = `realtime-${table}-${filter ? `${filter.column}-${filter.value}` : "all"}-${Date.now()}`;

  const channel = db.channel(channelName);

  const config: any = {
    event: "*",
    schema: "public",
    table,
  };
  if (filter) {
    config.filter = `${filter.column}=eq.${filter.value}`;
  }

  channel.on(
    "postgres_changes" as any,
    config,
    (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
      const event = payload.eventType;
      if (event === "INSERT" && onInsert) onInsert(payload);
      else if (event === "UPDATE" && onUpdate) onUpdate(payload);
      else if (event === "DELETE" && onDelete) onDelete(payload);
    },
  );

  channel.subscribe((status: string) => {
    supabaseLogger(`Realtime ${table}: ${status}`);
  });

  const subscription: Subscription = {
    channel: channelName,
    unsubscribe: () => {
      db.removeChannel(channel);
    },
  };
  activeSubscriptions.push(subscription);
  return subscription;
}

export function subscribeToPlayerData(
  address: string,
  callbacks: {
    onHeroChange?: ChangeHandler;
    onInventoryChange?: ChangeHandler;
    onCosmeticChange?: ChangeHandler;
    onProfileChange?: ChangeHandler;
    onNotification?: ChangeHandler;
  },
) {
  const subs: Subscription[] = [];

  if (callbacks.onHeroChange) {
    subs.push(subscribeToTable("heroes", { column: "owner_address", value: address },
      callbacks.onHeroChange, callbacks.onHeroChange, callbacks.onHeroChange));
  }
  if (callbacks.onInventoryChange) {
    subs.push(subscribeToTable("inventory", { column: "owner", value: address },
      callbacks.onInventoryChange, callbacks.onInventoryChange, callbacks.onInventoryChange));
  }
  if (callbacks.onCosmeticChange) {
    subs.push(subscribeToTable("cosmetics", { column: "owner", value: address },
      callbacks.onCosmeticChange, callbacks.onCosmeticChange, callbacks.onCosmeticChange));
  }
  if (callbacks.onProfileChange) {
    subs.push(subscribeToTable("profiles", { column: "address", value: address },
      callbacks.onProfileChange, callbacks.onProfileChange));
  }
  if (callbacks.onNotification) {
    subs.push(subscribeToTable("notifications", { column: "owner_wallet", value: address },
      callbacks.onNotification));
  }

  return () => {
    for (const s of subs) s.unsubscribe();
  };
}

export function subscribeToMarketplace(
  onInsert?: ChangeHandler,
  onUpdate?: ChangeHandler,
) {
  return subscribeToTable("marketplace_listings", undefined, onInsert, onUpdate);
}

export function subscribeToAdminConfig(
  onUpdate?: ChangeHandler,
) {
  return subscribeToTable("admin_config", undefined, undefined, onUpdate);
}
