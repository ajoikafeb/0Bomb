import { BrowserProvider, Contract, JsonRpcSigner } from "ethers";

const providerCache = new Map<string, BrowserProvider>();
const signerCache = new Map<string, JsonRpcSigner>();

async function getProvider(): Promise<BrowserProvider> {
  if (!providerCache.has("default")) {
    providerCache.set("default", new BrowserProvider(window.ethereum));
  }
  return providerCache.get("default")!;
}

async function getSigner(): Promise<JsonRpcSigner> {
  if (!signerCache.has("default")) {
    const provider = await getProvider();
    await provider.send("eth_requestAccounts", []);
    signerCache.set("default", await provider.getSigner());
  }
  return signerCache.get("default")!;
}

export function createContract(address: string, abi: any): Contract {
  return new Contract(address, abi);
}

export async function createReadContract(address: string, abi: any): Promise<Contract> {
  const provider = await getProvider();
  return new Contract(address, abi, provider);
}

export async function createWriteContract(address: string, abi: any): Promise<Contract> {
  const signer = await getSigner();
  return new Contract(address, abi, signer);
}

export async function callRead<T>(address: string, abi: any, method: string, args: any[] = []): Promise<T> {
  const contract = await createReadContract(address, abi);
  return contract[method](...args);
}

export async function callWrite(address: string, abi: any, method: string, args: any[] = [], overrides: any = {}): Promise<any> {
  const contract = await createWriteContract(address, abi);
  const tx = await contract[method](...args, overrides);
  await tx.wait();
  return tx;
}

export async function getConnectedAddress(): Promise<string> {
  const signer = await getSigner();
  return signer.getAddress();
}
