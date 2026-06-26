// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IGameNFT {
    struct HeroData {
        string name;
        uint8 classId;
        uint8 generation;
        uint8 rarity;
        uint256 dnaHash;
        uint256 bloodlineId;
        uint256 createdAt;
        string metadataUri;
    }

    struct EquipmentData {
        string name;
        uint8 equipType;
        uint8 rarity;
        uint8 level;
        uint256 seed;
        uint256 createdAt;
        string metadataUri;
    }

    struct CosmeticData {
        string name;
        uint8 cosType;
        uint8 rarity;
        uint256 seed;
        uint256 createdAt;
        string metadataUri;
    }

    struct LegacyCoreData {
        uint256 sourceHeroId;
        uint8 legacyTier;
        uint256 knowledge;
        uint256 experience;
        uint256 traitFragments;
        uint256 dnaFragments;
        uint256 createdAt;
        string metadataUri;
    }

    struct BadgeData {
        string name;
        uint8 badgeType;
        bool soulbound;
        uint256 awardedAt;
        string metadataUri;
    }

    event HeroMinted(uint256 indexed tokenId, address indexed owner, uint256 dnaHash);
    event EquipmentMinted(uint256 indexed tokenId, address indexed owner, uint8 equipType, uint8 rarity);
    event CosmeticMinted(uint256 indexed tokenId, address indexed owner, uint8 cosType, uint8 rarity);
    event LegacyCoreCreated(uint256 indexed tokenId, address indexed owner, uint256 sourceHeroId);
    event BadgeAwarded(uint256 indexed tokenId, address indexed owner, uint8 badgeType);
}
