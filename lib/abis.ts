export const ROOSTER_NFT_ABI = [
    {
        "inputs": [
            { "internalType": "string", "name": "name", "type": "string" },
            { "internalType": "string", "name": "symbol", "type": "string" },
            { "internalType": "string", "name": "baseTokenURI", "type": "string" }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
            { "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
            { "indexed": false, "internalType": "string", "name": "breed", "type": "string" },
            { "indexed": false, "internalType": "string", "name": "color", "type": "string" },
            { "indexed": false, "internalType": "uint256", "name": "hatchDate", "type": "uint256" }
        ],
        "name": "RoosterMinted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
            { "indexed": false, "internalType": "uint8", "name": "strength", "type": "uint8" },
            { "indexed": false, "internalType": "uint8", "name": "speed", "type": "uint8" },
            { "indexed": false, "internalType": "uint8", "name": "level", "type": "uint8" },
            { "indexed": false, "internalType": "uint256", "name": "experience", "type": "uint256" }
        ],
        "name": "TraitsUpdated",
        "type": "event"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "to", "type": "address" },
            { "internalType": "string", "name": "breed", "type": "string" },
            { "internalType": "string", "name": "color", "type": "string" },
            { "internalType": "uint256", "name": "hatchDate", "type": "uint256" },
            { "internalType": "uint8", "name": "strength", "type": "uint8" },
            { "internalType": "uint8", "name": "speed", "type": "uint8" },
            { "internalType": "uint8", "name": "level", "type": "uint8" },
            { "internalType": "uint256", "name": "experience", "type": "uint256" }
        ],
        "name": "mint",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
            { "internalType": "uint8", "name": "strength", "type": "uint8" },
            { "internalType": "uint8", "name": "speed", "type": "uint8" },
            { "internalType": "uint8", "name": "level", "type": "uint8" },
            { "internalType": "uint256", "name": "experience", "type": "uint256" }
        ],
        "name": "updateMutableTraits",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
        "name": "getAllTraits",
        "outputs": [
            { "internalType": "string", "name": "breed", "type": "string" },
            { "internalType": "string", "name": "color", "type": "string" },
            { "internalType": "uint256", "name": "hatchDate", "type": "uint256" },
            { "internalType": "uint8", "name": "strength", "type": "uint8" },
            { "internalType": "uint8", "name": "speed", "type": "uint8" },
            { "internalType": "uint8", "name": "level", "type": "uint8" },
            { "internalType": "uint256", "name": "experience", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
        "name": "ownerOf",
        "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
        "name": "tokenURI",
        "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "to", "type": "address" },
            { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
        ],
        "name": "approve",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "operator", "type": "address" },
            { "internalType": "bool", "name": "approved", "type": "bool" }
        ],
        "name": "setApprovalForAll",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
        "name": "getApproved",
        "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "bytes32", "name": "role", "type": "bytes32" },
            { "internalType": "address", "name": "account", "type": "address" }
        ],
        "name": "grantRole",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "bytes32", "name": "role", "type": "bytes32" },
            { "internalType": "address", "name": "account", "type": "address" }
        ],
        "name": "revokeRole",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "bytes32", "name": "role", "type": "bytes32" },
            { "internalType": "address", "name": "account", "type": "address" }
        ],
        "name": "hasRole",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "DEFAULT_ADMIN_ROLE",
        "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
        "stateMutability": "view",
        "type": "function"
    }
] as const;

export const MARKETPLACE_ABI = [
    {
        "inputs": [{ "internalType": "address payable", "name": "_feeRecipient", "type": "address" }],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "bytes32", "name": "listingId", "type": "bytes32" },
            { "indexed": true, "internalType": "address", "name": "seller", "type": "address" },
            { "indexed": true, "internalType": "address", "name": "nftContract", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "price", "type": "uint256" }
        ],
        "name": "Listed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "bytes32", "name": "listingId", "type": "bytes32" },
            { "indexed": true, "internalType": "address", "name": "buyer", "type": "address" },
            { "indexed": true, "internalType": "address", "name": "seller", "type": "address" },
            { "indexed": false, "internalType": "address", "name": "nftContract", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "price", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "platformFee", "type": "uint256" }
        ],
        "name": "Sold",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "bytes32", "name": "listingId", "type": "bytes32" },
            { "indexed": true, "internalType": "address", "name": "seller", "type": "address" },
            { "indexed": false, "internalType": "address", "name": "nftContract", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256" }
        ],
        "name": "ListingCancelled",
        "type": "event"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "nftContract", "type": "address" },
            { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
            { "internalType": "uint256", "name": "price", "type": "uint256" }
        ],
        "name": "listNFT",
        "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "bytes32", "name": "listingId", "type": "bytes32" }],
        "name": "buyNFT",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "bytes32", "name": "listingId", "type": "bytes32" }],
        "name": "cancelListing",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "price", "type": "uint256" }],
        "name": "calculateFees",
        "outputs": [
            { "internalType": "uint256", "name": "platformFee", "type": "uint256" },
            { "internalType": "uint256", "name": "sellerProceeds", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "bytes32", "name": "listingId", "type": "bytes32" }],
        "name": "getListing",
        "outputs": [
            { "internalType": "address", "name": "seller", "type": "address" },
            { "internalType": "address", "name": "nftContract", "type": "address" },
            { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
            { "internalType": "uint256", "name": "price", "type": "uint256" },
            { "internalType": "bool", "name": "active", "type": "bool" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "nftContract", "type": "address" },
            { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
        ],
        "name": "isListed",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "nftContract", "type": "address" },
            { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
        ],
        "name": "getListingId",
        "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "platformFeeBps",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    }
] as const;
