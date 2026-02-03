// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title RoosterNFT
 * @dev NFT Collection for Roosters with immutable and mutable traits
 */
contract RoosterNFT is ERC721, ERC721URIStorage, AccessControl {
    using Strings for uint256;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint256 private _tokenIdCounter;
    string private _baseTokenURI;

    // Immutable traits - set once at mint
    struct ImmutableTraits {
        string breed;
        string color;
        uint256 hatchDate;
    }

    // Mutable traits - can be updated by admin
    struct MutableTraits {
        uint8 strength;
        uint8 speed;
        uint8 level;
        uint256 experience;
    }

    mapping(uint256 => ImmutableTraits) private _immutableTraits;
    mapping(uint256 => MutableTraits) private _mutableTraits;

    event RoosterMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string breed,
        string color,
        uint256 hatchDate
    );

    event TraitsUpdated(
        uint256 indexed tokenId,
        uint8 strength,
        uint8 speed,
        uint8 level,
        uint256 experience
    );

    constructor(
        string memory name,
        string memory symbol,
        string memory baseTokenURI
    ) ERC721(name, symbol) {
        _baseTokenURI = baseTokenURI;

        // Grant roles to deployer
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    /**
     * @dev Mint a new Rooster NFT with immutable and mutable traits
     */
    function mint(
        address to,
        string memory breed,
        string memory color,
        uint256 hatchDate,
        uint8 strength,
        uint8 speed,
        uint8 level,
        uint256 experience
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        require(strength <= 100, "Strength must be <= 100");
        require(speed <= 100, "Speed must be <= 100");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(to, tokenId);

        // Set immutable traits
        _immutableTraits[tokenId] = ImmutableTraits({
            breed: breed,
            color: color,
            hatchDate: hatchDate
        });

        // Set initial mutable traits
        _mutableTraits[tokenId] = MutableTraits({
            strength: strength,
            speed: speed,
            level: level,
            experience: experience
        });

        emit RoosterMinted(tokenId, to, breed, color, hatchDate);
        emit TraitsUpdated(tokenId, strength, speed, level, experience);

        return tokenId;
    }

    /**
     * @dev Update mutable traits of a rooster (admin only)
     */
    function updateMutableTraits(
        uint256 tokenId,
        uint8 strength,
        uint8 speed,
        uint8 level,
        uint256 experience
    ) external onlyRole(ADMIN_ROLE) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(strength <= 100, "Strength must be <= 100");
        require(speed <= 100, "Speed must be <= 100");

        _mutableTraits[tokenId] = MutableTraits({
            strength: strength,
            speed: speed,
            level: level,
            experience: experience
        });

        emit TraitsUpdated(tokenId, strength, speed, level, experience);
    }

    /**
     * @dev Get immutable traits of a rooster
     */
    function getImmutableTraits(
        uint256 tokenId
    )
        external
        view
        returns (string memory breed, string memory color, uint256 hatchDate)
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        ImmutableTraits memory traits = _immutableTraits[tokenId];
        return (traits.breed, traits.color, traits.hatchDate);
    }

    /**
     * @dev Get mutable traits of a rooster
     */
    function getMutableTraits(
        uint256 tokenId
    )
        external
        view
        returns (uint8 strength, uint8 speed, uint8 level, uint256 experience)
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        MutableTraits memory traits = _mutableTraits[tokenId];
        return (traits.strength, traits.speed, traits.level, traits.experience);
    }

    /**
     * @dev Get all traits of a rooster
     */
    function getAllTraits(
        uint256 tokenId
    )
        external
        view
        returns (
            string memory breed,
            string memory color,
            uint256 hatchDate,
            uint8 strength,
            uint8 speed,
            uint8 level,
            uint256 experience
        )
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        ImmutableTraits memory immutable_ = _immutableTraits[tokenId];
        MutableTraits memory mutable_ = _mutableTraits[tokenId];

        return (
            immutable_.breed,
            immutable_.color,
            immutable_.hatchDate,
            mutable_.strength,
            mutable_.speed,
            mutable_.level,
            mutable_.experience
        );
    }

    /**
     * @dev Grant minter role to an address (admin only)
     */
    function addMinter(address account) external onlyRole(ADMIN_ROLE) {
        grantRole(MINTER_ROLE, account);
    }

    /**
     * @dev Revoke minter role from an address (admin only)
     */
    function removeMinter(address account) external onlyRole(ADMIN_ROLE) {
        revokeRole(MINTER_ROLE, account);
    }

    /**
     * @dev Update base token URI (admin only)
     */
    function setBaseTokenURI(
        string memory newBaseTokenURI
    ) external onlyRole(ADMIN_ROLE) {
        _baseTokenURI = newBaseTokenURI;
    }

    /**
     * @dev Get total supply of minted roosters
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @dev Override tokenURI to use base URI + tokenId
     */
    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return
            string(
                abi.encodePacked(_baseTokenURI, tokenId.toString(), ".json")
            );
    }

    /**
     * @dev See {IERC165-supportsInterface}
     */
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC721, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
