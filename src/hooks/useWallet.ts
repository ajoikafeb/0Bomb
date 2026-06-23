"use client";

import { useState, useEffect, useCallback } from "react";
import { connectWallet, disconnectWallet, getBalance, switchChain, isCorrectNetwork, getAddress } from "@/lib/blockchain/provider";

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [isConnected, setIsConnected] = useState(false);
  const [isCorrectNet, setIsCorrectNet] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const updateBalance = useCallback(async (addr: string) => {
    try {
      const bal = await getBalance(addr);
      setBalance(bal);
    } catch {
      setBalance("0");
    }
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      await switchChain();
      const addr = await connectWallet();
      setAddress(addr);
      setIsConnected(true);
      const net = await isCorrectNetwork();
      setIsCorrectNet(net);
      await updateBalance(addr);
    } catch (e: any) {
      console.error("Connect error:", e);
    } finally {
      setIsConnecting(false);
    }
  }, [updateBalance]);

  const disconnect = useCallback(async () => {
    await disconnectWallet();
    setAddress(null);
    setBalance("0");
    setIsConnected(false);
    setIsCorrectNet(false);
  }, []);

  useEffect(() => {
    const checkConnection = async () => {
      if (!window.ethereum) return;
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
          const net = await isCorrectNetwork();
          setIsCorrectNet(net);
          await updateBalance(accounts[0]);
        }
      } catch {}
    };
    checkConnection();
  }, [updateBalance]);

  useEffect(() => {
    if (!window.ethereum) return;
    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAddress(accounts[0]);
        setIsConnected(true);
        await updateBalance(accounts[0]);
      }
    };
    const handleChainChanged = () => {
      window.location.reload();
    };
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);
    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener("chainChanged", handleChainChanged);
    };
  }, [disconnect, updateBalance]);

  return { address, balance, isConnected, isCorrectNet, isConnecting, connect, disconnect, refreshBalance: () => address && updateBalance(address) };
}
