"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getHeroes, getInventory, getCosmetics, getEnergyPotions,
  getActiveListings, getListings, getAdminConfig, getTokenBalance,
  getTransactions, getAuditLog, getBannedAddresses, getFrozenAddresses,
  getPlayerBalance, getFragments, getPendingWithdrawals,
  type AdminConfig,
} from "@/lib/game/GameStateManager";

export function useAdminData() {
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  const heroes = getHeroes();
  const inventory = getInventory();
  const cosmetics = getCosmetics();
  const listings = getListings();
  const activeListings = getActiveListings();
  const cfg = getAdminConfig();
  const potions = getEnergyPotions();
  const tokenBalance = getTokenBalance();
  const transactions = getTransactions();
  const auditLog = getAuditLog();
  const banned = getBannedAddresses();
  const frozen = getFrozenAddresses();
  const withdrawals = getPendingWithdrawals();

  const totalHeroes = heroes.length;
  const aliveHeroes = heroes.filter(h => h.is_alive).length;
  const allWallets = new Set(heroes.map(h => h.owner_address).filter(Boolean));
  const totalWallets = allWallets.size;
  const uniquePlayers = new Set([
    ...heroes.map(h => h.owner_address).filter(Boolean),
    ...inventory.map(i => i.owner).filter(Boolean),
    ...listings.map(l => l.seller).filter(Boolean),
  ]);
  const totalPlayers = uniquePlayers.size;
  const totalMinted = heroes.length + inventory.length + cosmetics.length;
  const avgLevel = heroes.length > 0 ? heroes.reduce((s, h) => s + (h.level || 1), 0) / heroes.length : 0;

  const marketplaceVolume = activeListings.reduce((s, l) => {
    const v = typeof l.price === "string" ? parseFloat(l.price) : (typeof l.price === "number" ? l.price : 0);
    return s + v;
  }, 0);

  return {
    heroes, inventory, cosmetics, listings, activeListings, cfg,
    potions, tokenBalance, transactions, auditLog, banned, frozen, withdrawals,
    totalHeroes, aliveHeroes, totalWallets, totalPlayers,
    totalMinted, avgLevel, marketplaceVolume,
    refreshKey, refresh,
  };
}

export function useRealtimeStats() {
  const [stats, setStats] = useState({
    online: 0, wallets: 0, heroes: 0, items: 0,
    battles: 0, rewards: 0, volume: 0, avgLevel: 0,
    supply: "0", fragments: "0", legacy: 0, pendingNotif: 0,
  });

  const update = useCallback(() => {
    const heroes = getHeroes();
    const inv = getInventory();
    const cos = getCosmetics();
    setStats({
      online: heroes.filter(h => h.is_alive).length,
      wallets: new Set([
        ...heroes.map(h => h.owner_address).filter(Boolean),
        ...inv.map(i => i.owner).filter(Boolean),
      ]).size,
      heroes: heroes.length,
      items: inv.length + cos.length,
      battles: 0,
      rewards: getTokenBalance(),
      volume: getActiveListings().reduce((s, l) => s + (Number(l.price) || 0), 0),
      avgLevel: heroes.length ? heroes.reduce((s, h) => s + (h.level || 1), 0) / heroes.length : 0,
      supply: getTokenBalance().toLocaleString(),
      fragments: getFragments(null).toLocaleString(),
      legacy: heroes.filter(h => (h as any).legacy_tier).length,
      pendingNotif: getPendingWithdrawals().length,
    });
  }, []);

  useEffect(() => { update(); const id = setInterval(update, 5000); return () => clearInterval(id); }, [update]);
  return stats;
}
