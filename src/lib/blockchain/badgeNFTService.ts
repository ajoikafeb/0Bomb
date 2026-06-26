import { BadgeNFT_ABI as BADGE_NFT_ABI } from "./abi/BadgeNFT";
import { getContractAddress } from "./addresses";
import { callRead } from "./contractService";

const ADDRESS = () => getContractAddress("BadgeNFT");
const ABI = BADGE_NFT_ABI;

export interface OnchainBadge {
  tokenId: string;
  name: string;
  badgeType: number;
  soulbound: boolean;
  awardedAt: number;
  metadataUri: string;
  owner: string;
}

export async function getBadgesByOwner(address: string): Promise<OnchainBadge[]> {
  const ids: bigint[] = await callRead(ADDRESS(), ABI, "getBadgesByOwner", [address]);
  const items: OnchainBadge[] = [];
  for (const id of ids) {
    const tokenId = id.toString();
    const item = await getBadge(tokenId);
    if (item) items.push({ ...item, owner: address });
  }
  return items;
}

export async function getBadge(tokenId: string): Promise<OnchainBadge | null> {
  try {
    const data: any = await callRead(ADDRESS(), ABI, "getBadge", [tokenId]);
    return {
      tokenId,
      name: data.name,
      badgeType: Number(data.badgeType),
      soulbound: data.soulbound,
      awardedAt: Number(data.awardedAt),
      metadataUri: data.metadataUri,
      owner: "",
    };
  } catch {
    return null;
  }
}
