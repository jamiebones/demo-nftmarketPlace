// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RoosterMarketplace
 * @dev Marketplace for buying and selling Rooster NFTs with platform fees
 */
contract RoosterMarketplace is ReentrancyGuard, Ownable {
    // Platform fee in basis points (250 = 2.5%)
    uint256 public platformFeeBps = 250;
    uint256 public constant MAX_FEE_BPS = 1000; // 10% maximum
    uint256 public constant BPS_DENOMINATOR = 10000;

    address payable public feeRecipient;

    struct Listing {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price;
        bool active;
    }

    // Mapping from listing ID to Listing
    mapping(bytes32 => Listing) public listings;

    // Mapping to track active listings per NFT
    mapping(address => mapping(uint256 => bytes32)) public nftToListing;

    event Listed(
        bytes32 indexed listingId,
        address indexed seller,
        address indexed nftContract,
        uint256 tokenId,
        uint256 price
    );

    event Sold(
        bytes32 indexed listingId,
        address indexed buyer,
        address indexed seller,
        address nftContract,
        uint256 tokenId,
        uint256 price,
        uint256 platformFee
    );

    event ListingCancelled(
        bytes32 indexed listingId,
        address indexed seller,
        address nftContract,
        uint256 tokenId
    );

    event PriceUpdated(
        bytes32 indexed listingId,
        uint256 oldPrice,
        uint256 newPrice
    );

    event FeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeRecipientUpdated(address oldRecipient, address newRecipient);

    constructor(address payable _feeRecipient) Ownable(msg.sender) {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _feeRecipient;
    }

    /**
     * @dev Generate unique listing ID
     */
    function _generateListingId(
        address nftContract,
        uint256 tokenId,
        address seller
    ) private view returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(nftContract, tokenId, seller, block.timestamp)
            );
    }

    /**
     * @dev List an NFT for sale
     */
    function listNFT(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) external nonReentrant returns (bytes32) {
        require(price > 0, "Price must be greater than 0");

        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not the owner");
        require(
            nft.getApproved(tokenId) == address(this) ||
                nft.isApprovedForAll(msg.sender, address(this)),
            "Marketplace not approved"
        );

        // Check if already listed
        bytes32 existingListingId = nftToListing[nftContract][tokenId];
        require(!listings[existingListingId].active, "NFT already listed");

        bytes32 listingId = _generateListingId(
            nftContract,
            tokenId,
            msg.sender
        );

        listings[listingId] = Listing({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            price: price,
            active: true
        });

        nftToListing[nftContract][tokenId] = listingId;

        emit Listed(listingId, msg.sender, nftContract, tokenId, price);

        return listingId;
    }

    /**
     * @dev Buy an NFT from the marketplace
     */
    function buyNFT(bytes32 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(msg.value == listing.price, "Incorrect payment amount");
        require(msg.sender != listing.seller, "Cannot buy your own NFT");

        // Mark as inactive
        listing.active = false;
        delete nftToListing[listing.nftContract][listing.tokenId];

        // Calculate fees
        uint256 platformFee = (listing.price * platformFeeBps) /
            BPS_DENOMINATOR;
        uint256 sellerProceeds = listing.price - platformFee;

        // Transfer NFT to buyer
        IERC721(listing.nftContract).safeTransferFrom(
            listing.seller,
            msg.sender,
            listing.tokenId
        );

        // Transfer platform fee
        (bool feeSuccess, ) = feeRecipient.call{value: platformFee}("");
        require(feeSuccess, "Fee transfer failed");

        // Transfer proceeds to seller
        (bool sellerSuccess, ) = payable(listing.seller).call{
            value: sellerProceeds
        }("");
        require(sellerSuccess, "Seller payment failed");

        emit Sold(
            listingId,
            msg.sender,
            listing.seller,
            listing.nftContract,
            listing.tokenId,
            listing.price,
            platformFee
        );
    }

    /**
     * @dev Cancel a listing
     */
    function cancelListing(bytes32 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(listing.seller == msg.sender, "Not the seller");

        listing.active = false;
        delete nftToListing[listing.nftContract][listing.tokenId];

        emit ListingCancelled(
            listingId,
            msg.sender,
            listing.nftContract,
            listing.tokenId
        );
    }

    /**
     * @dev Update listing price
     */
    function updatePrice(
        bytes32 listingId,
        uint256 newPrice
    ) external nonReentrant {
        require(newPrice > 0, "Price must be greater than 0");

        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(listing.seller == msg.sender, "Not the seller");

        uint256 oldPrice = listing.price;
        listing.price = newPrice;

        emit PriceUpdated(listingId, oldPrice, newPrice);
    }

    /**
     * @dev Calculate fees for a given price
     */
    function calculateFees(
        uint256 price
    ) external view returns (uint256 platformFee, uint256 sellerProceeds) {
        platformFee = (price * platformFeeBps) / BPS_DENOMINATOR;
        sellerProceeds = price - platformFee;
    }

    /**
     * @dev Get listing details
     */
    function getListing(
        bytes32 listingId
    )
        external
        view
        returns (
            address seller,
            address nftContract,
            uint256 tokenId,
            uint256 price,
            bool active
        )
    {
        Listing memory listing = listings[listingId];
        return (
            listing.seller,
            listing.nftContract,
            listing.tokenId,
            listing.price,
            listing.active
        );
    }

    /**
     * @dev Check if an NFT is listed
     */
    function isListed(
        address nftContract,
        uint256 tokenId
    ) external view returns (bool) {
        bytes32 listingId = nftToListing[nftContract][tokenId];
        return listings[listingId].active;
    }

    /**
     * @dev Get listing ID for an NFT
     */
    function getListingId(
        address nftContract,
        uint256 tokenId
    ) external view returns (bytes32) {
        return nftToListing[nftContract][tokenId];
    }

    /**
     * @dev Update platform fee (owner only)
     */
    function setPlatformFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= MAX_FEE_BPS, "Fee exceeds maximum");
        uint256 oldFee = platformFeeBps;
        platformFeeBps = newFeeBps;
        emit FeeUpdated(oldFee, newFeeBps);
    }

    /**
     * @dev Update fee recipient (owner only)
     */
    function setFeeRecipient(address payable newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient");
        address oldRecipient = feeRecipient;
        feeRecipient = newRecipient;
        emit FeeRecipientUpdated(oldRecipient, newRecipient);
    }

    /**
     * @dev Handle receiving ERC721 tokens
     */
    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) external pure returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
