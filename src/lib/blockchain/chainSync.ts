import { getHeroesByOwner as getChainHeroes, type OnchainHero } from "./heroNFTService";
import { getEquipmentByOwner as getChainEquipment, type OnchainEquipment } from "./equipmentNFTService";
import { getCosmeticsByOwner as getChainCosmetics, type OnchainCosmetic } from "./cosmeticNFTService";
import { getLegacyCoresByOwner as getChainLegacy, type OnchainLegacyCore } from "./legacyCoreNFTService";
import { getBadgesByOwner as getChainBadges, type OnchainBadge } from "./badgeNFTService";

export interface WalletInventory {
  heroes: OnchainHero[];
  equipment: OnchainEquipment[];
  cosmetics: OnchainCosmetic[];
  legacyCores: OnchainLegacyCore[];
  badges: OnchainBadge[];
  totalTokens: number;
}

export async function fetchWalletInventory(address: string): Promise<WalletInventory> {
  const [heroes, equipment, cosmetics, legacyCores, badges] = await Promise.all([
    getChainHeroes(address).catch(() => [] as OnchainHero[]),
    getChainEquipment(address).catch(() => [] as OnchainEquipment[]),
    getChainCosmetics(address).catch(() => [] as OnchainCosmetic[]),
    getChainLegacy(address).catch(() => [] as OnchainLegacyCore[]),
    getChainBadges(address).catch(() => [] as OnchainBadge[]),
  ]);

  return {
    heroes,
    equipment,
    cosmetics,
    legacyCores,
    badges,
    totalTokens: heroes.length + equipment.length + cosmetics.length + legacyCores.length + badges.length,
  };
}

export function verifyOwnership(ownerAddress: string, tokenOwner: string | undefined | null): boolean {
  if (!ownerAddress || !tokenOwner) return false;
  return tokenOwner.toLowerCase() === ownerAddress.toLowerCase();
}
