import { HeroNFT_ABI as HERO_NFT_ABI } from "./abi/HeroNFT";
import { getContractAddress } from "./addresses";
import { callRead, callWrite } from "./contractService";

const ADDRESS = () => getContractAddress("HeroNFT");
const ABI = HERO_NFT_ABI;

export interface OnchainHero {
  tokenId: string;
  name: string;
  classId: number;
  generation: number;
  rarity: number;
  dnaHash: string;
  bloodlineId: string;
  createdAt: number;
  metadataUri: string;
  owner: string;
}

export async function getHeroesByOwner(address: string): Promise<OnchainHero[]> {
  const ids: bigint[] = await callRead(ADDRESS(), ABI, "getHeroesByOwner", [address]);
  const heroes: OnchainHero[] = [];
  for (const id of ids) {
    const tokenId = id.toString();
    const hero = await getHero(tokenId);
    if (hero) heroes.push({ ...hero, owner: address });
  }
  return heroes;
}

export async function getHero(tokenId: string): Promise<OnchainHero | null> {
  try {
    const data: any = await callRead(ADDRESS(), ABI, "getHero", [tokenId]);
    return {
      tokenId,
      name: data.name,
      classId: Number(data.classId),
      generation: Number(data.generation),
      rarity: Number(data.rarity),
      dnaHash: data.dnaHash.toString(),
      bloodlineId: data.bloodlineId.toString(),
      createdAt: Number(data.createdAt),
      metadataUri: data.metadataUri,
      owner: "",
    };
  } catch {
    return null;
  }
}

export async function getTotalSupply(): Promise<number> {
  const supply: bigint = await callRead(ADDRESS(), ABI, "totalSupply", []);
  return Number(supply);
}

export async function batchMintHero(
  names: string[],
  classIds: number[],
  generations: number[],
  rarities: number[],
  dnaHashes: number[],
  bloodlineIds: number[],
  metadataUris: string[],
  soulbound: boolean[],
  value: string
): Promise<any> {
  return callWrite(ADDRESS(), ABI, "batchMintHero", [names, classIds, generations, rarities, dnaHashes, bloodlineIds, metadataUris, soulbound], { value });
}

export async function mintHero(
  name: string,
  classId: number,
  generation: number,
  rarity: number,
  dnaHash: number,
  bloodlineId: number,
  metadataUri: string,
  soulbound: boolean,
  value: string
): Promise<any> {
  return callWrite(ADDRESS(), ABI, "mintHero", [name, classId, generation, rarity, dnaHash, bloodlineId, metadataUri, soulbound], { value });
}
