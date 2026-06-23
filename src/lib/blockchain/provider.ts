import { BrowserProvider, JsonRpcSigner, Contract, formatEther, parseEther } from "ethers";
import { TOKEN_CONTRACT, RPC_URL, CHAIN_ID, TREASURY_ADDRESS } from "@/lib/game/constants";

let provider: BrowserProvider | null = null;
let signer: JsonRpcSigner | null = null;

const TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

async function ensureSigner(): Promise<JsonRpcSigner> {
  if (signer) return signer;
  if (!window.ethereum) throw new Error("No wallet found. Install MetaMask or Rabby.");
  if (!provider) provider = new BrowserProvider(window.ethereum);
  const accounts = await provider.send("eth_requestAccounts", []);
  if (accounts.length === 0) throw new Error("No accounts found. Connect your wallet.");
  signer = await provider.getSigner();
  return signer;
}

export async function connectWallet(): Promise<string> {
  if (!window.ethereum) throw new Error("No wallet found. Install MetaMask or Rabby.");
  provider = new BrowserProvider(window.ethereum);
  const accounts = await provider.send("eth_requestAccounts", []);
  signer = await provider.getSigner();
  return accounts[0];
}

export async function disconnectWallet(): Promise<void> {
  provider = null;
  signer = null;
}

export async function getAddress(): Promise<string | null> {
  if (!signer) return null;
  return signer.getAddress();
}

export async function getBalance(address: string): Promise<string> {
  if (!provider) {
    provider = new BrowserProvider(window.ethereum);
  }
  const contract = new Contract(TOKEN_CONTRACT, TOKEN_ABI, provider);
  const balance = await contract.balanceOf(address);
  return formatEther(balance);
}

export async function switchChain(): Promise<void> {
  if (!window.ethereum) return;
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x" + CHAIN_ID.toString(16) }],
    });
  } catch (e: any) {
    if (e.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: "0x" + CHAIN_ID.toString(16),
          chainName: "0G Galileo Testnet",
          nativeCurrency: { name: "0G", symbol: "0G", decimals: 18 },
          rpcUrls: [RPC_URL],
          blockExplorerUrls: ["https://chainscan-testnet.0g.ai"],
        }],
      });
    }
  }
}

export async function isCorrectNetwork(): Promise<boolean> {
  if (!window.ethereum) return false;
  const chainId = await window.ethereum.request({ method: "eth_chainId" });
  return parseInt(chainId, 16) === CHAIN_ID;
}

export async function transferToken(to: string, amount: string): Promise<string> {
  const s = await ensureSigner();
  const contract = new Contract(TOKEN_CONTRACT, TOKEN_ABI, s);
  const tx = await contract.transfer(to, parseEther(amount));
  await tx.wait();
  return tx.hash;
}

export async function getTokenBalance(address: string): Promise<string> {
  if (!provider) {
    provider = new BrowserProvider(window.ethereum);
  }
  const contract = new Contract(TOKEN_CONTRACT, TOKEN_ABI, provider);
  const balance = await contract.balanceOf(address);
  return formatEther(balance);
}

export async function payForHatch(amount: string): Promise<string> {
  return transferToken(TREASURY_ADDRESS, amount);
}

declare global {
  interface Window {
    ethereum?: any;
  }
}
