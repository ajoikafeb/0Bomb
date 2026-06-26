"use client";

import { useEffect, useRef, useCallback } from "react";
import { pullFromSupabase } from "@/lib/supabase/dataLoader";
import { subscribeToPlayerData, clearAllSubscriptions } from "@/lib/supabase/realtime";
import { loadSave, saveState } from "@/lib/game/GameStateManager";
import { supabaseLogger } from "@/lib/supabase/logger";

export function useDataLoader(address: string | null, isConnected: boolean) {
  const prevRef = useRef<string | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const setupRealtime = useCallback((addr: string) => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    supabaseLogger(`Setting up Realtime subscriptions for ${addr.slice(0, 6)}...`);

    cleanupRef.current = subscribeToPlayerData(addr, {
      onHeroChange: (payload) => {
        const save = loadSave();
        if (payload.eventType === "INSERT") {
          save.heroes.push(payload.new as any);
        } else if (payload.eventType === "UPDATE") {
          const idx = save.heroes.findIndex(h => h.id === (payload.new as any).id);
          if (idx >= 0) save.heroes[idx] = payload.new as any;
        } else if (payload.eventType === "DELETE") {
          save.heroes = save.heroes.filter(h => h.id !== (payload.old as any)?.id);
        }
        saveState(save);
      },
      onInventoryChange: (payload) => {
        const save = loadSave();
        if (payload.eventType === "INSERT") {
          save.inventory.push(payload.new as any);
        } else if (payload.eventType === "UPDATE") {
          const idx = save.inventory.findIndex(i => i.id === (payload.new as any).id);
          if (idx >= 0) save.inventory[idx] = payload.new as any;
        } else if (payload.eventType === "DELETE") {
          save.inventory = save.inventory.filter(i => i.id !== (payload.old as any)?.id);
        }
        saveState(save);
      },
      onCosmeticChange: (payload) => {
        const save = loadSave();
        if (payload.eventType === "INSERT") {
          save.cosmetics.push(payload.new as any);
        } else if (payload.eventType === "UPDATE") {
          const idx = save.cosmetics.findIndex(c => c.id === (payload.new as any).id);
          if (idx >= 0) save.cosmetics[idx] = payload.new as any;
        } else if (payload.eventType === "DELETE") {
          save.cosmetics = save.cosmetics.filter(c => c.id !== (payload.old as any)?.id);
        }
        saveState(save);
      },
      onProfileChange: (payload) => {
        const save = loadSave();
        if (payload.eventType === "UPDATE") {
          const addr = (payload.new as any).address?.toLowerCase();
          if (addr && save.tokenBalances) {
            save.tokenBalances[addr] = Number((payload.new as any).spout_balance || 0);
          }
        }
        saveState(save);
      },
    });
  }, []);

  useEffect(() => {
    if (isConnected && address && address !== prevRef.current) {
      prevRef.current = address;
      pullFromSupabase(address).then((loaded) => {
        if (loaded) setupRealtime(address);
        else {
          clearAllSubscriptions();
          setupRealtime(address);
        }
      });
    }
    if (!isConnected) {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      clearAllSubscriptions();
      prevRef.current = null;
    }
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [address, isConnected, setupRealtime]);
}
