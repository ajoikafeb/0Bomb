import { CosmeticNFT_ABI as COSMETIC_NFT_ABI } from "./abi/CosmeticNFT";
import { getContractAddress } from "./addresses";
import { callRead, callWrite } from "./contractService";

const ADDRESS = () => getContractAddress("CosmeticNFT");
const ABI = COSMETIC_NFT_ABI;

export interface OnchainCosmetic {
  tokenId: string;
  name: string;
  cosType: number;
  rarity: number;
  seed: string;
  createdAt: number;
  metadataUri: string;
  owner: string;
}

export async function getCosmeticsByOwner(address: string): Promise<OnchainCosmetic[]> {
  const ids: bigint[] = await callRead(ADDRESS(), ABI, "getCosmeticsByOwner", [address]);
  const items: OnchainCosmetic[] = [];
  for (const id of ids) {
    const tokenId = id.toString();
    const item = await getCosmetic(tokenId);
    if (item) items.push({ ...item, owner: address });
  }
  return items;
}

export async function batchMintCosmetic(
  names: string[],
  cosTypes: number[],
  rarities: number[],
  seeds: bigint[],
  metadataUris: string[],
  soulbound: boolean[],
  value: string
): Promise<any> {
  return callWrite(ADDRESS(), ABI, "batchMintCosmetic", [names, cosTypes, rarities, seeds, metadataUris, soulbound], { value });
}

export async function mintCosmetic(
  name: string,
  cosType: number,
  rarity: number,
  seed: bigint,
  metadataUri: string,
  soulbound: boolean,
  value: string
): Promise<any> {
  return callWrite(ADDRESS(), ABI, "mintCosmetic", [name, cosType, rarity, seed, metadataUri, soulbound], { value });
}

export async function getCosmetic(tokenId: string): Promise<OnchainCosmetic | null> {
  try {
    const data: any = await callRead(ADDRESS(), ABI, "getCosmetic", [tokenId]);
    return {
      tokenId,
      name: data.name,
      cosType: Number(data.cosType),
      rarity: Number(data.rarity),
      seed: data.seed.toString(),
      createdAt: Number(data.createdAt),
      metadataUri: data.metadataUri,
      owner: "",
    };
  } catch {
    return null;
  }
}
