import { EquipmentNFT_ABI as EQUIPMENT_NFT_ABI } from "./abi/EquipmentNFT";
import { getContractAddress } from "./addresses";
import { callRead, callWrite } from "./contractService";

const ADDRESS = () => getContractAddress("EquipmentNFT");
const ABI = EQUIPMENT_NFT_ABI;

export async function batchMintEquipment(
  names: string[],
  equipTypes: number[],
  rarities: number[],
  levels: number[],
  seeds: bigint[],
  metadataUris: string[],
  soulbound: boolean[],
  value: string
): Promise<any> {
  return callWrite(ADDRESS(), ABI, "batchMintEquipment", [names, equipTypes, rarities, levels, seeds, metadataUris, soulbound], { value });
}

export async function mintEquipment(
  name: string,
  equipType: number,
  rarity: number,
  level: number,
  seed: bigint,
  metadataUri: string,
  soulbound: boolean,
  value: string
): Promise<any> {
  return callWrite(ADDRESS(), ABI, "mintEquipment", [name, equipType, rarity, level, seed, metadataUri, soulbound], { value });
}

export interface OnchainEquipment {
  tokenId: string;
  name: string;
  equipType: number;
  rarity: number;
  level: number;
  seed: string;
  createdAt: number;
  metadataUri: string;
  owner: string;
}

export async function getEquipmentByOwner(address: string): Promise<OnchainEquipment[]> {
  const ids: bigint[] = await callRead(ADDRESS(), ABI, "getEquipmentByOwner", [address]);
  const items: OnchainEquipment[] = [];
  for (const id of ids) {
    const tokenId = id.toString();
    const item = await getEquipment(tokenId);
    if (item) items.push({ ...item, owner: address });
  }
  return items;
}

export async function getEquipment(tokenId: string): Promise<OnchainEquipment | null> {
  try {
    const data: any = await callRead(ADDRESS(), ABI, "getEquipment", [tokenId]);
    return {
      tokenId,
      name: data.name,
      equipType: Number(data.equipType),
      rarity: Number(data.rarity),
      level: Number(data.level),
      seed: data.seed.toString(),
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
