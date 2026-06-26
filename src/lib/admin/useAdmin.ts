"use client";

import { useWalletContext } from "@/components/wallet/WalletProvider";
import { OWNER_WALLET } from "@/lib/game/constants";

export function useAdmin() {
  const { address, isConnected } = useWalletContext();
  const isOwner = !!address && address.toLowerCase() === OWNER_WALLET.toLowerCase();
  return { isOwner, isConnected, address, isAdmin: isOwner && isConnected };
}
