// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IGameNFT.sol";

contract HeroNFT is ERC721URIStorage, Ownable, ReentrancyGuard, IGameNFT {
    uint256 private _nextTokenId;
    string private _baseTokenURI;

    mapping(uint256 => HeroData) public heroes;
    mapping(address => uint256[]) private _ownerTokens;
    mapping(uint256 => uint256) private _ownerIndex;
    mapping(uint256 => bool) public isSoulbound;

    uint256 public mintPrice;
    bool public mintingEnabled;

    modifier onlyMintingOpen() {
        require(mintingEnabled, "HeroNFT: minting is closed");
        _;
    }

    constructor(
        string memory baseURI,
        uint256 initialMintPrice
    ) ERC721("0Bomb Heroes", "0BHERO") Ownable(msg.sender) {
        _baseTokenURI = baseURI;
        mintPrice = initialMintPrice;
        mintingEnabled = true;
    }

    function mintHero(
        string calldata name,
        uint8 classId,
        uint8 generation,
        uint8 rarity,
        uint256 dnaHash,
        uint256 bloodlineId,
        string calldata metadataUri,
        bool soulbound
    ) external payable onlyMintingOpen nonReentrant returns (uint256) {
        require(msg.value >= mintPrice, "HeroNFT: insufficient payment");
        require(bytes(name).length > 0, "HeroNFT: name required");
        require(classId <= 6, "HeroNFT: invalid class");

        uint256 tokenId = ++_nextTokenId;
        uint256 createdAt = block.timestamp;

        heroes[tokenId] = HeroData({
            name: name,
            classId: classId,
            generation: generation,
            rarity: rarity,
            dnaHash: dnaHash,
            bloodlineId: bloodlineId,
            createdAt: createdAt,
            metadataUri: metadataUri
        });

        isSoulbound[tokenId] = soulbound;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataUri);
        _addTokenToOwner(msg.sender, tokenId);

        emit HeroMinted(tokenId, msg.sender, dnaHash);
        return tokenId;
    }

    function getHero(uint256 tokenId) external view returns (HeroData memory) {
        _requireOwned(tokenId);
        return heroes[tokenId];
    }

    function getHeroesByOwner(address owner) external view returns (uint256[] memory) {
        return _ownerTokens[owner];
    }

    function totalSupply() external view returns (uint256) {
        return _nextTokenId;
    }

    function batchMintHero(
        string[] calldata names,
        uint8[] calldata classIds,
        uint8[] calldata generations,
        uint8[] calldata rarities,
        uint256[] calldata dnaHashes,
        uint256[] calldata bloodlineIds,
        string[] calldata metadataUris,
        bool[] calldata soulbound
    ) external payable onlyMintingOpen nonReentrant returns (uint256[] memory) {
        uint256 len = names.length;
        require(len > 0, "HeroNFT: empty batch");
        require(len == classIds.length && len == generations.length && len == rarities.length && len == dnaHashes.length && len == bloodlineIds.length && len == metadataUris.length && len == soulbound.length, "HeroNFT: array length mismatch");
        require(msg.value >= mintPrice * len, "HeroNFT: insufficient payment");

        uint256[] memory tokenIds = new uint256[](len);
        for (uint256 i = 0; i < len; i++) {
            require(bytes(names[i]).length > 0, "HeroNFT: name required");
            uint256 tokenId = ++_nextTokenId;
            heroes[tokenId] = HeroData({
                name: names[i],
                classId: classIds[i],
                generation: generations[i],
                rarity: rarities[i],
                dnaHash: dnaHashes[i],
                bloodlineId: bloodlineIds[i],
                createdAt: block.timestamp,
                metadataUri: metadataUris[i]
            });
            isSoulbound[tokenId] = soulbound[i];
            _safeMint(msg.sender, tokenId);
            _setTokenURI(tokenId, metadataUris[i]);
            _addTokenToOwner(msg.sender, tokenId);
            tokenIds[i] = tokenId;
            emit HeroMinted(tokenId, msg.sender, dnaHashes[i]);
        }
        return tokenIds;
    }

    function setBaseURI(string calldata baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    function setMintPrice(uint256 newPrice) external onlyOwner {
        mintPrice = newPrice;
    }

    function setMintingEnabled(bool enabled) external onlyOwner {
        mintingEnabled = enabled;
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "HeroNFT: no balance");
        payable(owner()).transfer(balance);
    }

    function _addTokenToOwner(address owner, uint256 tokenId) internal {
        uint256 length = _ownerTokens[owner].length;
        _ownerTokens[owner].push(tokenId);
        _ownerIndex[tokenId] = length;
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
            revert("HeroNFT: soulbound hero cannot be transferred");
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
