export const CONTRACT_ADDRESSES: Record<string, string> = {
  HeroNFT: process.env.NEXT_PUBLIC_HERO_NFT_ADDRESS || "",
  EquipmentNFT: process.env.NEXT_PUBLIC_EQUIPMENT_NFT_ADDRESS || "",
  CosmeticNFT: process.env.NEXT_PUBLIC_COSMETIC_NFT_ADDRESS || "",
  LegacyCoreNFT: process.env.NEXT_PUBLIC_LEGACY_CORE_NFT_ADDRESS || "",
  BadgeNFT: process.env.NEXT_PUBLIC_BADGE_NFT_ADDRESS || "",
};

export const getContractAddress = (name: string): string => {
  const addr = CONTRACT_ADDRESSES[name];
  if (!addr) {
    if (typeof window !== "undefined" && window.location.hostname === "localhost") {
      return "0x0000000000000000000000000000000000000000";
    }
    return "";
  }
  return addr;
};
