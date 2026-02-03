'use client';

import { useEffect, useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACTS } from '@/lib/config';
import { ROOSTER_NFT_ABI, MARKETPLACE_ABI } from '@/lib/abis';
import { getTotalSupply, getRoosterTraits, getTokenOwner, isNFTListed } from '@/lib/blockchain';
import { formatBNB } from '@/lib/utils';

interface MyRooster {
  tokenId: number;
  breed: string;
  color: string;
  strength: number;
  speed: number;
  level: number;
  isListed: boolean;
  isApproved: boolean;
}

export default function MyNFTsPage() {
  const { address } = useAccount();
  const [myRoosters, setMyRoosters] = useState<MyRooster[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRooster, setSelectedRooster] = useState<number | null>(null);
  const [listPrice, setListPrice] = useState('');
  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (address) {
      loadMyRoosters();
    }
  }, [address]);

  async function loadMyRoosters() {
    if (!address) return;

    try {
      const total = await getTotalSupply();
      const roostersOwned: MyRooster[] = [];

      for (let i = 0; i < total; i++) {
        try {
          const owner = await getTokenOwner(i);
          
          if (owner.toLowerCase() === address.toLowerCase()) {
            const traits = await getRoosterTraits(i);
            const listed = await isNFTListed(i);
            
            // Check if approved for marketplace
            const isApproved = await checkApproval(i);
            
            roostersOwned.push({
              tokenId: i,
              breed: traits.breed,
              color: traits.color,
              strength: traits.strength,
              speed: traits.speed,
              level: traits.level,
              isListed: listed,
              isApproved: isApproved,
            });
          }
        } catch (error) {
          console.error(`Failed to load rooster #${i}:`, error);
        }
      }

      setMyRoosters(roostersOwned);
    } catch (error) {
      console.error('Failed to load roosters:', error);
    } finally {
      setLoading(false);
    }
  }

  async function checkApproval(tokenId: number): Promise<boolean> {
    try {
      const { ethers } = await import('ethers');
      const provider = new ethers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_BSC_TESTNET_RPC
      );
      const nftContract = new ethers.Contract(
        CONTRACTS.NFT_ADDRESS,
        ROOSTER_NFT_ABI,
        provider
      );
      
      const approvedAddress = await nftContract.getApproved(tokenId);
      return approvedAddress.toLowerCase() === CONTRACTS.MARKETPLACE_ADDRESS.toLowerCase();
    } catch (error) {
      console.error(`Failed to check approval for token ${tokenId}:`, error);
      return false;
    }
  }

  async function approveNFT(tokenId: number) {
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
      setTimeout(() => loadMyRoosters(), 3000);
    } catch (error: any) {
      console.error('Approval failed:', error);
      alert(`Approval failed: ${error.message}`);
    }
  }

  async function listNFT(tokenId: number, price: string) {
    if (!address) {
      alert('Please connect your wallet');
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      alert('Please enter a valid price');
      return;
    }

    try {
      const priceInWei = parseEther(price);

      await writeContract({
        address: CONTRACTS.MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'listNFT',
        args: [CONTRACTS.NFT_ADDRESS, BigInt(tokenId), priceInWei],
      });

      alert('Listing initiated! Please wait for confirmation...');
      setSelectedRooster(null);
      setListPrice('');
      setTimeout(() => loadMyRoosters(), 3000);
    } catch (error: any) {
      console.error('Listing failed:', error);
      alert(`Listing failed: ${error.message}`);
    }
  }

  async function cancelListing(tokenId: number) {
    if (!address) return;

    try {
      // Get listing ID first
      const response = await fetch('/api/listings');
      const listings = await response.json();
      const listing = listings.find(
        (l: any) => l.tokenId.toString() === tokenId.toString()
      );

      if (!listing) {
        alert('Listing not found');
        return;
      }

      await writeContract({
        address: CONTRACTS.MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'cancelListing',
        args: [listing.listingId as `0x${string}`],
      });

      alert('Cancellation initiated! Please wait for confirmation...');
      setTimeout(() => loadMyRoosters(), 3000);
    } catch (error: any) {
      console.error('Cancel failed:', error);
      alert(`Cancel failed: ${error.message}`);
    }
  }

  if (!address) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">My Roosters</h1>
        </div>
        <div className="text-center py-20">
          <p className="text-gray-600 text-lg">Please connect your wallet to view your NFTs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">My Roosters</h1>
        <p className="text-gray-600">Manage and list your roosters for sale</p>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="mt-4 text-gray-600">Loading your roosters...</p>
        </div>
      ) : myRoosters.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-600 text-lg">You don't own any roosters yet</p>
          <p className="text-gray-500 mt-2">Mint or buy roosters from the marketplace!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myRoosters.map((rooster) => (
            <div key={rooster.tokenId} className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    Rooster #{rooster.tokenId}
                  </h3>
                  {rooster.isListed && (
                    <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                      LISTED
                    </span>
                  )}
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Breed:</span>
                    <span className="font-semibold">{rooster.breed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Color:</span>
                    <span className="font-semibold">{rooster.color}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Strength:</span>
                    <span className="font-semibold">{rooster.strength}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Speed:</span>
                    <span className="font-semibold">{rooster.speed}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Level:</span>
                    <span className="font-semibold">{rooster.level}</span>
                  </div>
                </div>
              </div>

              {rooster.isListed ? (
                <button
                  onClick={() => cancelListing(rooster.tokenId)}
                  disabled={isConfirming}
                  className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded"
                >
                  {isConfirming ? 'Processing...' : 'Cancel Listing'}
                </button>
              ) : selectedRooster === rooster.tokenId ? (
                <div className="space-y-2">
                  <input
                    type="number"
                    step="0.001"
                    placeholder="Price in BNB"
                    value={listPrice}
                    onChange={(e) => setListPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => listNFT(rooster.tokenId, listPrice)}
                      disabled={isConfirming}
                      className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded"
                    >
                      {isConfirming ? 'Listing...' : 'Confirm'}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRooster(null);
                        setListPrice('');
                      }}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {!rooster.isApproved ? (
                    <>
                      <button
                        onClick={() => approveNFT(rooster.tokenId)}
                        disabled={isConfirming}
                        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded"
                      >
                        {isConfirming ? 'Approving...' : '1. Approve Marketplace'}
                      </button>
                      <button
                        disabled
                        className="w-full bg-gray-300 text-gray-500 font-bold py-2 px-4 rounded cursor-not-allowed"
                      >
                        2. List for Sale (Approve First)
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-full bg-green-50 border border-green-200 text-green-700 font-semibold py-2 px-4 rounded text-center">
                        ✓ Approved
                      </div>
                      <button
                        onClick={() => setSelectedRooster(rooster.tokenId)}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
                      >
                        List for Sale
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
