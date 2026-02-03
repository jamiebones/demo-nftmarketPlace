'use client';

import { useEffect, useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import Link from 'next/link';
import { CONTRACTS } from '@/lib/config';
import { MARKETPLACE_ABI } from '@/lib/abis';
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold mb-4">
              NFT Marketplace
            </h1>
            <p className="text-xl text-orange-100 mb-8">
              Discover and collect unique Rooster Fighters with special traits and abilities
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
                <div className="font-semibold text-2xl">{listings.length}</div>
                <div className="text-orange-100">Active Listings</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
                <div className="font-semibold text-2xl">2.5%</div>
                <div className="text-orange-100">Platform Fee</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
                <div className="font-semibold text-2xl">BSC</div>
                <div className="text-orange-100">Testnet</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="container mx-auto px-4 -mt-6">
        <div className="bg-blue-600 text-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="font-bold text-lg mb-1">💡 Want to sell your roosters?</h3>
            <p className="text-blue-100">
              Go to "My NFTs" to approve and list your roosters for sale on the marketplace
            </p>
          </div>
          <Link
            href="/my-nfts"
            className="whitespace-nowrap bg-white text-blue-600 hover:bg-blue-50 font-bold py-3 px-6 rounded-lg transition-colors shadow-md"
          >
            List Your NFTs →
          </Link>
        </div>
      </div>

      {/* Listings Section */}
      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 text-lg">Loading marketplace...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🐔</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Listings Yet</h3>
            <p className="text-gray-600 text-lg mb-6">
              Be the first to list your rooster on the marketplace!
            </p>
            <Link
              href="/my-nfts"
              className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              List Your Roosters
            </Link>
          </div>
        ) : (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-8">
              Available Roosters ({listings.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listings.map((listing) => (
                <div
                  key={listing.listingId}
                  className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-orange-400"
                >
                  {/* NFT Image Placeholder */}
                  <div className="relative h-64 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                    <span className="text-8xl group-hover:scale-110 transition-transform">🐓</span>
                    <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-semibold">
                      #{listing.tokenId}
                    </div>
                  </div>

                  {/* NFT Details */}
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">
                      Rooster Fighter #{listing.tokenId}
                    </h3>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Price</span>
                        <span className="font-bold text-2xl text-green-600">
                          {formatBNB(BigInt(listing.price))} BNB
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Seller</span>
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/rooster/${listing.tokenId}`}
                        className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => buyNFT(listing.listingId, BigInt(listing.price))}
                        disabled={isConfirming || listing.seller.toLowerCase() === address?.toLowerCase()}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed"
                      >
                        {isConfirming
                          ? '⏳ Buying...'
                          : listing.seller.toLowerCase() === address?.toLowerCase()
                          ? '✓ Your Listing'
                          : '🛒 Buy Now'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
