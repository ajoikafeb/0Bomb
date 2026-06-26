// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IGameNFT.sol";

contract LegacyCoreNFT is ERC721URIStorage, Ownable, ReentrancyGuard, IGameNFT {
    uint256 private _nextTokenId;

    mapping(uint256 => LegacyCoreData) public legacyCores;
    mapping(address => uint256[]) private _ownerTokens;
    mapping(uint256 => uint256) private _ownerIndex;

    bool public mintingEnabled;

    modifier onlyMintingOpen() {
        require(mintingEnabled, "LegacyCoreNFT: minting is closed");
        _;
    }

    constructor(
        string memory baseURI
    ) ERC721("0Bomb Legacy Cores", "0BLEGACY") Ownable(msg.sender) {
        _baseTokenURI = baseURI;
        mintingEnabled = true;
    }

    string private _baseTokenURI;

    function createLegacyCore(
        uint256 sourceHeroId,
        uint8 legacyTier,
        uint256 knowledge,
        uint256 experience,
        uint256 traitFragments,
        uint256 dnaFragments,
        string calldata metadataUri
    ) external onlyMintingOpen nonReentrant returns (uint256) {
        uint256 tokenId = ++_nextTokenId;

        legacyCores[tokenId] = LegacyCoreData({
            sourceHeroId: sourceHeroId,
            legacyTier: legacyTier,
            knowledge: knowledge,
            experience: experience,
            traitFragments: traitFragments,
            dnaFragments: dnaFragments,
            createdAt: block.timestamp,
            metadataUri: metadataUri
        });

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataUri);
        _addTokenToOwner(msg.sender, tokenId);

        emit LegacyCoreCreated(tokenId, msg.sender, sourceHeroId);
        return tokenId;
    }

    function getLegacyCore(uint256 tokenId) external view returns (LegacyCoreData memory) {
        _requireOwned(tokenId);
        return legacyCores[tokenId];
    }

    function getLegacyCoresByOwner(address owner) external view returns (uint256[] memory) {
        return _ownerTokens[owner];
    }

    function totalSupply() external view returns (uint256) {
        return _nextTokenId;
    }

    function setMintingEnabled(bool enabled) external onlyOwner {
        mintingEnabled = enabled;
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
