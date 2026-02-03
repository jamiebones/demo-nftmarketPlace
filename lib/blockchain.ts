import { ethers } from 'ethers';
import { CONTRACTS } from './config';
import { ROOSTER_NFT_ABI, MARKETPLACE_ABI } from './abis';

const PROVIDER_URL = process.env.NEXT_PUBLIC_BSC_TESTNET_RPC || 'https://bsc-testnet-rpc.publicnode.com';

let provider: ethers.JsonRpcProvider | null = null;

export function getProvider() {
    if (!provider) {
        provider = new ethers.JsonRpcProvider(PROVIDER_URL);
    }
    return provider;
}

export function getNFTContract() {
    return new ethers.Contract(CONTRACTS.NFT_ADDRESS, ROOSTER_NFT_ABI, getProvider());
}

export function getMarketplaceContract() {
    return new ethers.Contract(CONTRACTS.MARKETPLACE_ADDRESS, MARKETPLACE_ABI, getProvider());
}

export interface RoosterTraits {
    breed: string;
    color: string;
    hatchDate: bigint;
    strength: number;
    speed: number;
    level: number;
    experience: bigint;
}

export interface Listing {
    listingId: string;
    seller: string;
    nftContract: string;
    tokenId: bigint;
    price: bigint;
    active: boolean;
}

// Cache for blockchain data
interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();
const CACHE_TTL = 10000; // 10 seconds

function getCached<T>(key: string): T | null {
    const entry = cache.get(key);
    if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
        return entry.data;
    }
    cache.delete(key);
    return null;
}

function setCache<T>(key: string, data: T): void {
    cache.set(key, { data, timestamp: Date.now() });
}

export async function getRoosterTraits(tokenId: number): Promise<RoosterTraits> {
    const cacheKey = `traits-${tokenId}`;
    const cached = getCached<RoosterTraits>(cacheKey);
    if (cached) return cached;

    const nftContract = getNFTContract();
    const traits = await nftContract.getAllTraits(tokenId);

    const result: RoosterTraits = {
        breed: traits[0],
        color: traits[1],
        hatchDate: traits[2],
        strength: Number(traits[3]),
        speed: Number(traits[4]),
        level: Number(traits[5]),
        experience: traits[6],
    };

    setCache(cacheKey, result);
    return result;
}

export async function getTokenOwner(tokenId: number): Promise<string> {
    const cacheKey = `owner-${tokenId}`;
    const cached = getCached<string>(cacheKey);
    if (cached) return cached;

    const nftContract = getNFTContract();
    const owner = await nftContract.ownerOf(tokenId);

    setCache(cacheKey, owner);
    return owner;
}

export async function getTotalSupply(): Promise<number> {
    const cacheKey = 'totalSupply';
    const cached = getCached<number>(cacheKey);
    if (cached !== null) return cached;

    const nftContract = getNFTContract();
    const supply = await nftContract.totalSupply();
    const result = Number(supply);

    setCache(cacheKey, result);
    return result;
}

export async function getActiveListings(): Promise<Listing[]> {
    const cacheKey = 'activeListings';
    const cached = getCached<Listing[]>(cacheKey);
    if (cached) return cached;

    try {
        const marketplace = getMarketplaceContract();
        const provider = getProvider();

        // Get current block
        const currentBlock = await provider.getBlockNumber();

        // Start from marketplace deployment block (BSC Testnet)
        // If you redeploy, update this block number from deployments/bscTestnet-latest.json
        const deploymentBlock = 88218987;
        const fromBlock = deploymentBlock;

        console.log(`Querying Listed events from block ${fromBlock} to ${currentBlock}`);
        console.log(`Block range: ${currentBlock - fromBlock} blocks`);

        // Query all Listed events
        const listedFilter = marketplace.filters.Listed();
        const listedEvents = await marketplace.queryFilter(listedFilter, fromBlock, currentBlock);

        console.log(`Found ${listedEvents.length} Listed events`);

        // Query all Sold events
        const soldFilter = marketplace.filters.Sold();
        const soldEvents = await marketplace.queryFilter(soldFilter, fromBlock, currentBlock);
        console.log(`Found ${soldEvents.length} Sold events`);

        // Query all ListingCancelled events
        const cancelledFilter = marketplace.filters.ListingCancelled();
        const cancelledEvents = await marketplace.queryFilter(cancelledFilter, fromBlock, currentBlock);
        console.log(`Found ${cancelledEvents.length} ListingCancelled events`);

        // Create a set of inactive listing IDs (sold or cancelled)
        const inactiveListingIds = new Set<string>();

        for (const event of soldEvents) {
            if ('args' in event) {
                inactiveListingIds.add(event.args[0]);
            }
        }

        for (const event of cancelledEvents) {
            if ('args' in event) {
                inactiveListingIds.add(event.args[0]);
            }
        }

        // Process Listed events and filter out inactive ones
        const listings: Listing[] = [];

        for (const event of listedEvents) {
            if (!('args' in event)) continue;

            const listingId = event.args[0];

            // Skip if this listing was sold or cancelled
            if (inactiveListingIds.has(listingId)) {
                console.log(`Skipping inactive listing: ${listingId}`);
                continue;
            }

            try {
                // Double-check with contract state
                const listing = await marketplace.getListing(listingId);

                console.log(`Listing ${listingId}:`, {
                    seller: listing[0],
                    tokenId: listing[2].toString(),
                    price: listing[3].toString(),
                    active: listing[4]
                });

                if (listing[4]) { // active flag from contract
                    listings.push({
                        listingId: listingId as string,
                        seller: listing[0] as string,
                        nftContract: listing[1] as string,
                        tokenId: listing[2] as bigint,
                        price: listing[3] as bigint,
                        active: listing[4] as boolean,
                    });
                }
            } catch (error) {
                console.error(`Failed to fetch listing ${listingId}:`, error);
            }
        }

        console.log(`Total active listings: ${listings.length}`);

        setCache(cacheKey, listings);
        return listings;
    } catch (error) {
        console.error('Error in getActiveListings:', error);
        throw error;
    }
}

export async function getListing(listingId: string): Promise<Listing | null> {
    const cacheKey = `listing-${listingId}`;
    const cached = getCached<Listing | null>(cacheKey);
    if (cached !== undefined) return cached;

    const marketplace = getMarketplaceContract();

    try {
        const listing = await marketplace.getListing(listingId);

        if (!listing[4]) { // not active
            setCache(cacheKey, null);
            return null;
        }

        const result: Listing = {
            listingId,
            seller: listing[0] as string,
            nftContract: listing[1] as string,
            tokenId: listing[2] as bigint,
            price: listing[3] as bigint,
            active: listing[4] as boolean,
        };

        setCache(cacheKey, result);
        return result;
    } catch (error) {
        console.error(`Failed to fetch listing ${listingId}:`, error);
        return null;
    }
}

export async function isNFTListed(tokenId: number): Promise<boolean> {
    const cacheKey = `isListed-${tokenId}`;
    const cached = getCached<boolean>(cacheKey);
    if (cached !== null) return cached;

    const marketplace = getMarketplaceContract();
    const result = await marketplace.isListed(CONTRACTS.NFT_ADDRESS, tokenId);

    setCache(cacheKey, result);
    return result;
}

export async function getListingIdForNFT(tokenId: number): Promise<string> {
    const marketplace = getMarketplaceContract();
    return await marketplace.getListingId(CONTRACTS.NFT_ADDRESS, tokenId);
}

export function clearCache(): void {
    cache.clear();
}
