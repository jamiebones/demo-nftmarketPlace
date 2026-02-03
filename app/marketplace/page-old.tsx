'use client';

import { useEffect, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import RoosterCard from '@/components/RoosterCard';
import { CONTRACTS } from '@/lib/config';
import { ROOSTER_NFT_ABI, MARKETPLACE_ABI } from '@/lib/abis';
import { formatBNB } from '@/lib/utils';

export default function MarketplacePage() {
  const { address } = useAccount();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    loadListings();
  }, []);

  async function loadListings() {
    try {
      const response = await fetch('/api/listings');
      const data = await response.json();
      
      // Check if the response is an error object
      if (data.error || !Array.isArray(data)) {
        console.error('Failed to load listings:', data.error || 'Invalid response');
        setListings([]);
      } else {
        setListings(data);
      }
    } catch (error) {
      console.error('Failed to load listings:', error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  }

  async function buyNFT(listingId: string, price: bigint) {
    if (!address) {
      alert('Please connect your wallet');
      return;
    }

    try {
      await writeContract({
        address: CONTRACTS.MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'buyNFT',
        args: [listingId as `0x${string}`],
        value: price,
      });

      alert('Purchase initiated! Waiting for confirmation...');
      setTimeout(loadListings, 3000);
    } catch (error: any) {
      console.error('Purchase failed:', error);
      alert(`Purchase failed: ${error.message}`);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            NFT Marketplace
          </h1>
          <p className="text-gray-600">
            Buy and sell roosters with a 2.5% platform fee
          </p>
        </div>
        <ConnectButton />
      </div>

      {/* Info Banner */}
      <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-blue-900 mb-1">Want to sell your roosters?</h3>
          <p className="text-sm text-blue-700">
            Go to "My NFTs" to approve and list your roosters for sale
          </p>
        </div>
        <button
          onClick={() => window.location.href = '/my-nfts'}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded whitespace-nowrap"
        >
          List NFTs
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="mt-4 text-gray-600">Loading marketplace...</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-600 text-lg">No listings available</p>
          <p className="text-gray-500 mt-2">Check back soon for roosters on sale!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <div key={listing.listingId} className="relative">
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-xl font-bold mb-2">Rooster #{listing.tokenId}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-bold text-green-600">
                      {formatBNB(BigInt(listing.price))} BNB
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Seller:</span>
                    <span className="font-mono text-xs">
                      {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => buyNFT(listing.listingId, BigInt(listing.price))}
                  disabled={isConfirming || listing.seller.toLowerCase() === address?.toLowerCase()}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  {isConfirming ? 'Buying...' : listing.seller.toLowerCase() === address?.toLowerCase() ? 'Your Listing' : 'Buy Now'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
