"use client";

import { createContext, useContext, ReactNode } from "react";
import { useWallet } from "@/hooks/useWallet";

interface WalletContextType {
  address: string | null;
  balance: string;
  isConnected: boolean;
  isCorrectNet: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  refreshBalance: () => void;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  balance: "0",
  isConnected: false,
  isCorrectNet: false,
  isConnecting: false,
  connect: async () => {},
  disconnect: async () => {},
  refreshBalance: () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const wallet = useWallet();
  return <WalletContext.Provider value={wallet}>{children}</WalletContext.Provider>;
}

export const useWalletContext = () => useContext(WalletContext);
