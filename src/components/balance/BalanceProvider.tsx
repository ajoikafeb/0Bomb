"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useWalletContext } from "@/components/wallet/WalletProvider";
import { getTokenBalance } from "@/lib/blockchain/provider";
import { getFragments, getEnergyPotions, getPlayerBalance } from "@/lib/game/GameStateManager";

export interface BalanceState {
  obombBalance: string;
  obombSource: "on-chain" | "game" | "unknown";
  fragmentBalance: number;
  energyPotions: number;
  playerBalance: number;
  lastUpdated: number | null;
  isLoading: boolean;
  error: string | null;
}

interface BalanceContextType extends BalanceState {
  refreshBalances: () => Promise<void>;
  refreshOBomb: () => Promise<void>;
}

const defaultState: BalanceState = {
  obombBalance: "0",
  obombSource: "unknown",
  fragmentBalance: 0,
  energyPotions: 0,
  playerBalance: 0,
  lastUpdated: null,
  isLoading: true,
  error: null,
};

const BalanceContext = createContext<BalanceContextType>({
  ...defaultState,
  refreshBalances: async () => {},
  refreshOBomb: async () => {},
});

export function BalanceProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useWalletContext();
  const [state, setState] = useState<BalanceState>(defaultState);

  const fetchOnChain = useCallback(async (addr: string) => {
    try {
      const bal = await getTokenBalance(addr);
      return bal;
    } catch {
      return null;
    }
  }, []);

  const refreshBalances = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      let obombBal = "0";
      let obombSrc: "on-chain" | "game" = "game";
      const addr = address;
      if (addr) {
        const onChain = await fetchOnChain(addr);
        if (onChain !== null) {
          obombBal = onChain;
          obombSrc = "on-chain";
        }
      }
      const frags = addr ? getFragments(addr) : 0;
      const pots = getEnergyPotions();
      const pBal = addr ? getPlayerBalance(addr) : 0;
      setState({
        obombBalance: obombBal,
        obombSource: obombSrc,
        fragmentBalance: frags,
        energyPotions: pots,
        playerBalance: pBal,
        lastUpdated: Date.now(),
        isLoading: false,
        error: null,
      });
    } catch (e: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: e?.message || "Failed to sync balance",
      }));
    }
  }, [address, fetchOnChain]);

  const refreshOBomb = useCallback(async () => {
    if (!address) return;
    try {
      const onChain = await fetchOnChain(address);
      if (onChain !== null) {
        setState(prev => ({ ...prev, obombBalance: onChain, obombSource: "on-chain", lastUpdated: Date.now() }));
      }
    } catch (e: any) {
      setState(prev => ({ ...prev, error: e?.message || "Failed to sync on-chain balance" }));
    }
  }, [address, fetchOnChain]);

  useEffect(() => {
    if (isConnected && address) {
      refreshBalances();
    } else if (!isConnected) {
      setState({ ...defaultState, isLoading: false });
    }
  }, [isConnected, address, refreshBalances]);

  return (
    <BalanceContext.Provider value={{ ...state, refreshBalances, refreshOBomb }}>
      {children}
    </BalanceContext.Provider>
  );
}

export const useBalance = () => useContext(BalanceContext);
