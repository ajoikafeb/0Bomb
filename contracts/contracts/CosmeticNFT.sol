// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IGameNFT.sol";

contract CosmeticNFT is ERC721URIStorage, Ownable, ReentrancyGuard, IGameNFT {
    uint256 private _nextTokenId;

    mapping(uint256 => CosmeticData) public cosmetics;
    mapping(address => uint256[]) private _ownerTokens;
    mapping(uint256 => uint256) private _ownerIndex;
    mapping(uint256 => bool) public isSoulbound;

    uint256 public mintPrice;
    bool public mintingEnabled;

    modifier onlyMintingOpen() {
        require(mintingEnabled, "CosmeticNFT: minting is closed");
        _;
    }

    constructor(
        string memory baseURI,
        uint256 initialMintPrice
    ) ERC721("0Bomb Cosmetics", "0BCOSM") Ownable(msg.sender) {
        _baseTokenURI = baseURI;
        mintPrice = initialMintPrice;
        mintingEnabled = true;
    }

    string private _baseTokenURI;

    function mintCosmetic(
        string calldata name,
        uint8 cosType,
        uint8 rarity,
        uint256 seed,
        string calldata metadataUri,
        bool soulbound
    ) external payable onlyMintingOpen nonReentrant returns (uint256) {
        require(msg.value >= mintPrice, "CosmeticNFT: insufficient payment");
        require(bytes(name).length > 0, "CosmeticNFT: name required");

        uint256 tokenId = ++_nextTokenId;

        cosmetics[tokenId] = CosmeticData({
            name: name,
            cosType: cosType,
            rarity: rarity,
            seed: seed,
            createdAt: block.timestamp,
            metadataUri: metadataUri
        });

        isSoulbound[tokenId] = soulbound;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataUri);
        _addTokenToOwner(msg.sender, tokenId);

        emit CosmeticMinted(tokenId, msg.sender, cosType, rarity);
        return tokenId;
    }

    function getCosmetic(uint256 tokenId) external view returns (CosmeticData memory) {
        _requireOwned(tokenId);
        return cosmetics[tokenId];
    }

    function getCosmeticsByOwner(address owner) external view returns (uint256[] memory) {
        return _ownerTokens[owner];
    }

    function totalSupply() external view returns (uint256) {
        return _nextTokenId;
    }

    function batchMintCosmetic(
        string[] calldata names,
        uint8[] calldata cosTypes,
        uint8[] calldata rarities,
        uint256[] calldata seeds,
        string[] calldata metadataUris,
        bool[] calldata soulbound
    ) external payable onlyMintingOpen nonReentrant returns (uint256[] memory) {
        uint256 len = names.length;
        require(len > 0, "CosmeticNFT: empty batch");
        require(len == cosTypes.length && len == rarities.length && len == seeds.length && len == metadataUris.length && len == soulbound.length, "CosmeticNFT: array length mismatch");
        require(msg.value >= mintPrice * len, "CosmeticNFT: insufficient payment");

        uint256[] memory tokenIds = new uint256[](len);
        for (uint256 i = 0; i < len; i++) {
            require(bytes(names[i]).length > 0, "CosmeticNFT: name required");
            uint256 tokenId = ++_nextTokenId;
            cosmetics[tokenId] = CosmeticData({
                name: names[i],
                cosType: cosTypes[i],
                rarity: rarities[i],
                seed: seeds[i],
                createdAt: block.timestamp,
                metadataUri: metadataUris[i]
            });
            isSoulbound[tokenId] = soulbound[i];
            _safeMint(msg.sender, tokenId);
            _setTokenURI(tokenId, metadataUris[i]);
            _addTokenToOwner(msg.sender, tokenId);
            tokenIds[i] = tokenId;
            emit CosmeticMinted(tokenId, msg.sender, cosTypes[i], rarities[i]);
        }
        return tokenIds;
    }

    function setMintPrice(uint256 newPrice) external onlyOwner {
        mintPrice = newPrice;
    }

    function setMintingEnabled(bool enabled) external onlyOwner {
        mintingEnabled = enabled;
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "CosmeticNFT: no balance");
        payable(owner()).transfer(balance);
    }

    function _addTokenToOwner(address owner, uint256 tokenId) internal {
        _ownerTokens[owner].push(tokenId);
        _ownerIndex[tokenId] = _ownerTokens[owner].length - 1;
    }

    function _removeTokenFromOwner(address owner, uint256 tokenId) internal {
        uint256 length = _ownerTokens[owner].length;
        uint256 index = _ownerIndex[tokenId];
        uint256 lastTokenId = _ownerTokens[owner][length - 1];
        _ownerTokens[owner][index] = lastTokenId;
        _ownerIndex[lastTokenId] = index;
        _ownerTokens[owner].pop();
        delete _ownerIndex[tokenId];
    }

    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (isSoulbound[tokenId] && from != address(0) && to != address(0)) {
            revert("CosmeticNFT: soulbound item cannot be transferred");
        }
        if (from != address(0) && to != address(0)) {
            _removeTokenFromOwner(from, tokenId);
            _addTokenToOwner(to, tokenId);
        }
        return super._update(to, tokenId, auth);
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function supportsInterface(bytes4 interfaceId) public view override returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
