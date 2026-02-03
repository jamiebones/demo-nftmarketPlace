'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACTS } from '@/lib/config';
import { ROOSTER_NFT_ABI, MARKETPLACE_ABI } from '@/lib/abis';
import { getRoosterTraits, getTokenOwner, isNFTListed, getListingIdForNFT } from '@/lib/blockchain';
import { formatBNB, formatDate, calculateRarity } from '@/lib/utils';

interface RoosterDetails {
  tokenId: number;
  breed: string;
  color: string;
  hatchDate: bigint;
  strength: number;
  speed: number;
  level: number;
  experience: bigint;
  owner: string;
  isListed: boolean;
  listingId?: string;
  price?: bigint;
}

export default function RoosterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { address } = useAccount();
  const [rooster, setRooster] = useState<RoosterDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [listPrice, setListPrice] = useState('');
  const [showListForm, setShowListForm] = useState(false);
  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const tokenId = parseInt(params.tokenId as string);

  useEffect(() => {
    loadRooster();
  }, [tokenId]);

  async function loadRooster() {
    try {
      const traits = await getRoosterTraits(tokenId);
      const owner = await getTokenOwner(tokenId);
      const listed = await isNFTListed(tokenId);

      let listingData: { listingId?: string; price?: bigint } = {};

      if (listed) {
        // Fetch listing details
        const response = await fetch('/api/listings');
        const listings = await response.json();
        const listing = listings.find(
          (l: any) => l.tokenId.toString() === tokenId.toString()
        );
        if (listing) {
          listingData = {
            listingId: listing.listingId,
            price: listing.price,
          };
        }
      }

      setRooster({
        tokenId,
        breed: traits.breed,
        color: traits.color,
        hatchDate: traits.hatchDate,
        strength: traits.strength,
        speed: traits.speed,
        level: traits.level,
        experience: traits.experience,
        owner,
        isListed: listed,
        ...listingData,
      });
    } catch (error) {
      console.error('Failed to load rooster:', error);
    } finally {
      setLoading(false);
    }
  }

  async function approveNFT() {
    if (!address) {
      alert('Please connect your wallet');
      return;
    }

    try {
      await writeContract({
        address: CONTRACTS.NFT_ADDRESS,
        abi: ROOSTER_NFT_ABI,
        functionName: 'approve',
        args: [CONTRACTS.MARKETPLACE_ADDRESS, BigInt(tokenId)],
      });

      alert('Approval initiated! Please wait for confirmation...');
      setTimeout(() => loadRooster(), 3000);
    } catch (error: any) {
      console.error('Approval failed:', error);
      alert(`Approval failed: ${error.message}`);
    }
  }

  async function listNFT() {
    if (!address) {
      alert('Please connect your wallet');
      return;
    }

    if (!listPrice || parseFloat(listPrice) <= 0) {
      alert('Please enter a valid price');
      return;
    }

    try {
      const priceInWei = parseEther(listPrice);

      await writeContract({
        address: CONTRACTS.MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'listNFT',
        args: [CONTRACTS.NFT_ADDRESS, BigInt(tokenId), priceInWei],
      });

      alert('Listing initiated! Please wait for confirmation...');
      setShowListForm(false);
      setListPrice('');
      setTimeout(() => loadRooster(), 3000);
    } catch (error: any) {
      console.error('Listing failed:', error);
      alert(`Listing failed: ${error.message}`);
    }
  }

  async function cancelListing() {
    if (!address || !rooster?.listingId) return;

    try {
      await writeContract({
        address: CONTRACTS.MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'cancelListing',
        args: [rooster.listingId as `0x${string}`],
      });

      alert('Cancellation initiated! Please wait for confirmation...');
      setTimeout(() => loadRooster(), 3000);
    } catch (error: any) {
      console.error('Cancel failed:', error);
      alert(`Cancel failed: ${error.message}`);
    }
  }

  async function buyNFT() {
    if (!address) {
      alert('Please connect your wallet');
      return;
    }

    if (!rooster?.listingId || !rooster.price) {
      alert('Listing information not available');
      return;
    }

    try {
      await writeContract({
        address: CONTRACTS.MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'buyNFT',
        args: [rooster.listingId as `0x${string}`],
        value: rooster.price,
      });

      alert('Purchase initiated! Waiting for confirmation...');
      setTimeout(() => {
        router.push('/my-nfts');
      }, 3000);
    } catch (error: any) {
      console.error('Purchase failed:', error);
      alert(`Purchase failed: ${error.message}`);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="mt-4 text-gray-600">Loading rooster details...</p>
        </div>
      </div>
    );
  }

  if (!rooster) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <p className="text-gray-600 text-lg">Rooster not found</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded"
          >
            Back to Gallery
          </button>
        </div>
      </div>
    );
  }

  const isOwner = address && rooster.owner.toLowerCase() === address.toLowerCase();
  const rarity = calculateRarity({ strength: rooster.strength, speed: rooster.speed, level: rooster.level });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <button
          onClick={() => router.push('/')}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          ← Back to Gallery
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Section */}
        <div className="relative">
          <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-yellow-100 to-orange-100 shadow-xl">
            <img
              src={`/images/rooster-${tokenId % 10}.png`}
              alt={`Rooster #${tokenId}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/images/placeholder-rooster.png';
              }}
            />
          </div>
          {rooster.isListed && (
            <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg">
              FOR SALE
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-4xl font-bold text-gray-900">
                Rooster #{tokenId}
              </h1>
              <span className={`text-lg font-bold ${
                rarity === 'Legendary' ? 'text-purple-500' :
                rarity === 'Epic' ? 'text-pink-500' :
                rarity === 'Rare' ? 'text-blue-500' :
                rarity === 'Uncommon' ? 'text-green-500' : 'text-gray-500'
              }`}>
                {rarity}
              </span>
            </div>
            <p className="text-gray-600">
              A {rooster.color} {rooster.breed} fighting rooster
            </p>
          </div>

          {/* Immutable Traits */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Immutable Traits</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Breed:</span>
                <span className="font-semibold">{rooster.breed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Color:</span>
                <span className="font-semibold">{rooster.color}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hatch Date:</span>
                <span className="font-semibold">{formatDate(rooster.hatchDate)}</span>
              </div>
            </div>
          </div>

          {/* Mutable Stats */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Battle Statistics</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Strength:</span>
                  <span className="font-semibold">{rooster.strength}/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-red-500 h-3 rounded-full transition-all"
                    style={{ width: `${rooster.strength}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Speed:</span>
                  <span className="font-semibold">{rooster.speed}/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full transition-all"
                    style={{ width: `${rooster.speed}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-gray-600">Level:</span>
                <span className="font-semibold">Level {rooster.level}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Experience:</span>
                <span className="font-semibold">{rooster.experience.toString()} XP</span>
              </div>
            </div>
          </div>

          {/* Ownership & Listing */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Ownership</h2>
            <div className="flex justify-between mb-4">
              <span className="text-gray-600">Owner:</span>
              <span className="font-mono text-sm">
                {rooster.owner.slice(0, 6)}...{rooster.owner.slice(-4)}
              </span>
            </div>

            {rooster.isListed && rooster.price && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Listed Price:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatBNB(rooster.price)} BNB
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {isOwner ? (
              rooster.isListed ? (
                <button
                  onClick={cancelListing}
                  disabled={isConfirming}
                  className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                  {isConfirming ? 'Processing...' : 'Cancel Listing'}
                </button>
              ) : showListForm ? (
                <div className="space-y-3">
                  <input
                    type="number"
                    step="0.001"
                    placeholder="Price in BNB"
                    value={listPrice}
                    onChange={(e) => setListPrice(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={listNFT}
                      disabled={isConfirming}
                      className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                    >
                      {isConfirming ? 'Listing...' : 'Confirm Listing'}
                    </button>
                    <button
                      onClick={() => {
                        setShowListForm(false);
                        setListPrice('');
                      }}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 px-4 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={approveNFT}
                    disabled={isConfirming}
                    className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                  >
                    {isConfirming ? 'Approving...' : '1. Approve Marketplace'}
                  </button>
                  <button
                    onClick={() => setShowListForm(true)}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                  >
                    2. List for Sale
                  </button>
                </div>
              )
            ) : rooster.isListed ? (
              <button
                onClick={buyNFT}
                disabled={isConfirming || !address}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                {isConfirming ? 'Buying...' : !address ? 'Connect Wallet to Buy' : `Buy for ${formatBNB(rooster.price!)} BNB`}
              </button>
            ) : (
              <div className="text-center py-4 text-gray-500">
                Not currently for sale
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
