// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IGameNFT.sol";

contract BadgeNFT is ERC721URIStorage, Ownable, ReentrancyGuard, IGameNFT {
    uint256 private _nextTokenId;

    mapping(uint256 => BadgeData) public badges;
    mapping(address => uint256[]) private _ownerTokens;
    mapping(uint256 => uint256) private _ownerIndex;
    mapping(uint256 => bool) public isSoulbound;

    bool public mintingEnabled;

    modifier onlyMintingOpen() {
        require(mintingEnabled, "BadgeNFT: minting is closed");
        _;
    }

    constructor(
        string memory baseURI
    ) ERC721("0Bomb Badges", "0BBADGE") Ownable(msg.sender) {
        _baseTokenURI = baseURI;
        mintingEnabled = true;
    }

    string private _baseTokenURI;

    function awardBadge(
        address recipient,
        string calldata name,
        uint8 badgeType,
        bool soulbound,
        string calldata metadataUri
    ) external onlyOwner nonReentrant returns (uint256) {
        require(recipient != address(0), "BadgeNFT: invalid recipient");
        require(bytes(name).length > 0, "BadgeNFT: name required");

        uint256 tokenId = ++_nextTokenId;

        badges[tokenId] = BadgeData({
            name: name,
            badgeType: badgeType,
            soulbound: soulbound,
            awardedAt: block.timestamp,
            metadataUri: metadataUri
        });

        isSoulbound[tokenId] = soulbound;

        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, metadataUri);
        _addTokenToOwner(recipient, tokenId);

        emit BadgeAwarded(tokenId, recipient, badgeType);
        return tokenId;
    }

    function getBadge(uint256 tokenId) external view returns (BadgeData memory) {
        _requireOwned(tokenId);
        return badges[tokenId];
    }

    function getBadgesByOwner(address owner) external view returns (uint256[] memory) {
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
        if (isSoulbound[tokenId]) {
            require(to == address(0), "BadgeNFT: soulbound badge cannot be transferred");
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
