// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IGameNFT.sol";

contract EquipmentNFT is ERC721URIStorage, Ownable, ReentrancyGuard, IGameNFT {
    uint256 private _nextTokenId;

    mapping(uint256 => EquipmentData) public equipment;
    mapping(address => uint256[]) private _ownerTokens;
    mapping(uint256 => uint256) private _ownerIndex;
    mapping(uint256 => bool) public isSoulbound;

    uint256 public mintPrice;
    bool public mintingEnabled;

    modifier onlyMintingOpen() {
        require(mintingEnabled, "EquipmentNFT: minting is closed");
        _;
    }

    constructor(
        string memory baseURI,
        uint256 initialMintPrice
    ) ERC721("0Bomb Equipment", "0BEQUIP") Ownable(msg.sender) {
        _baseTokenURI = baseURI;
        mintPrice = initialMintPrice;
        mintingEnabled = true;
    }

    string private _baseTokenURI;

    function mintEquipment(
        string calldata name,
        uint8 equipType,
        uint8 rarity,
        uint8 level,
        uint256 seed,
        string calldata metadataUri,
        bool soulbound
    ) external payable onlyMintingOpen nonReentrant returns (uint256) {
        require(msg.value >= mintPrice, "EquipmentNFT: insufficient payment");
        require(bytes(name).length > 0, "EquipmentNFT: name required");

        uint256 tokenId = ++_nextTokenId;

        equipment[tokenId] = EquipmentData({
            name: name,
            equipType: equipType,
            rarity: rarity,
            level: level,
            seed: seed,
            createdAt: block.timestamp,
            metadataUri: metadataUri
        });

        isSoulbound[tokenId] = soulbound;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataUri);
        _addTokenToOwner(msg.sender, tokenId);

        emit EquipmentMinted(tokenId, msg.sender, equipType, rarity);
        return tokenId;
    }

    function getEquipment(uint256 tokenId) external view returns (EquipmentData memory) {
        _requireOwned(tokenId);
        return equipment[tokenId];
    }

    function getEquipmentByOwner(address owner) external view returns (uint256[] memory) {
        return _ownerTokens[owner];
    }

    function totalSupply() external view returns (uint256) {
        return _nextTokenId;
    }

    function batchMintEquipment(
        string[] calldata names,
        uint8[] calldata equipTypes,
        uint8[] calldata rarities,
        uint8[] calldata levels,
        uint256[] calldata seeds,
        string[] calldata metadataUris,
        bool[] calldata soulbound
    ) external payable onlyMintingOpen nonReentrant returns (uint256[] memory) {
        uint256 len = names.length;
        require(len > 0, "EquipmentNFT: empty batch");
        require(len == equipTypes.length && len == rarities.length && len == levels.length && len == seeds.length && len == metadataUris.length && len == soulbound.length, "EquipmentNFT: array length mismatch");
        require(msg.value >= mintPrice * len, "EquipmentNFT: insufficient payment");

        uint256[] memory tokenIds = new uint256[](len);
        for (uint256 i = 0; i < len; i++) {
            require(bytes(names[i]).length > 0, "EquipmentNFT: name required");
            uint256 tokenId = ++_nextTokenId;
            equipment[tokenId] = EquipmentData({
                name: names[i],
                equipType: equipTypes[i],
                rarity: rarities[i],
                level: levels[i],
                seed: seeds[i],
                createdAt: block.timestamp,
                metadataUri: metadataUris[i]
            });
            isSoulbound[tokenId] = soulbound[i];
            _safeMint(msg.sender, tokenId);
            _setTokenURI(tokenId, metadataUris[i]);
            _addTokenToOwner(msg.sender, tokenId);
            tokenIds[i] = tokenId;
            emit EquipmentMinted(tokenId, msg.sender, equipTypes[i], rarities[i]);
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
        require(balance > 0, "EquipmentNFT: no balance");
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
            revert("EquipmentNFT: soulbound item cannot be transferred");
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
