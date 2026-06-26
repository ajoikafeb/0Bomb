import { LegacyCoreNFT_ABI as LEGACY_CORE_NFT_ABI } from "./abi/LegacyCoreNFT";
import { getContractAddress } from "./addresses";
import { callRead } from "./contractService";

const ADDRESS = () => getContractAddress("LegacyCoreNFT");
const ABI = LEGACY_CORE_NFT_ABI;

export interface OnchainLegacyCore {
  tokenId: string;
  sourceHeroId: string;
  legacyTier: number;
  knowledge: string;
  experience: string;
  traitFragments: string;
  dnaFragments: string;
  createdAt: number;
  metadataUri: string;
  owner: string;
}

export async function getLegacyCoresByOwner(address: string): Promise<OnchainLegacyCore[]> {
  const ids: bigint[] = await callRead(ADDRESS(), ABI, "getLegacyCoresByOwner", [address]);
  const items: OnchainLegacyCore[] = [];
  for (const id of ids) {
    const tokenId = id.toString();
    const item = await getLegacyCore(tokenId);
    if (item) items.push({ ...item, owner: address });
  }
  return items;
}

export async function getLegacyCore(tokenId: string): Promise<OnchainLegacyCore | null> {
  try {
    const data: any = await callRead(ADDRESS(), ABI, "getLegacyCore", [tokenId]);
    return {
      tokenId,
      sourceHeroId: data.sourceHeroId.toString(),
      legacyTier: Number(data.legacyTier),
      knowledge: data.knowledge.toString(),
      experience: data.experience.toString(),
      traitFragments: data.traitFragments.toString(),
      dnaFragments: data.dnaFragments.toString(),
      createdAt: Number(data.createdAt),
      metadataUri: data.metadataUri,
      owner: "",
    };
  } catch {
    return null;
  }
}
