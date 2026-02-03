'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { CONTRACTS } from '@/lib/config';
import { ROOSTER_NFT_ABI } from '@/lib/abis';

// Admin role hash (keccak256("ADMIN_ROLE"))
const ADMIN_ROLE = '0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775';

export default function AdminPage() {
  const { address } = useAccount();
  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const [formData, setFormData] = useState({
    recipient: '',
    breed: 'Asil',
    color: 'Red',
    strength: 85,
    speed: 75,
    level: 1,
    experience: 0,
  });

  const [updateData, setUpdateData] = useState({
    tokenId: '',
    strength: 85,
    speed: 75,
    level: 1,
    experience: 0,
  });

  const [roleData, setRoleData] = useState({
    address: '',
    checkAddress: '',
  });

  const [hasAdminRole, setHasAdminRole] = useState<boolean | null>(null);

  const breeds = ['Asil', 'Shamo', 'Malay', 'Kelso', 'Hatch', 'Sweater', 'Roundhead', 'Radio', 'Claret', 'Butcher'];
  const colors = ['Red', 'Black', 'White', 'Brown', 'Grey', 'Red-White', 'Black-Red', 'Yellow', 'Dark Red', 'White-Black'];

  async function mintRooster(e: React.FormEvent) {
    e.preventDefault();

    if (!address) {
      alert('Please connect your wallet');
      return;
    }

    try {
      const hatchDate = Math.floor(Date.now() / 1000);
      
      await writeContract({
        address: CONTRACTS.NFT_ADDRESS,
        abi: ROOSTER_NFT_ABI,
        functionName: 'mint',
        args: [
          (formData.recipient || address) as `0x${string}`,
          formData.breed,
          formData.color,
          BigInt(hatchDate),
          formData.strength,
          formData.speed,
          formData.level,
          BigInt(formData.experience),
        ],
      });

      alert('Minting initiated! Check your wallet for confirmation.');
    } catch (error: any) {
      console.error('Minting failed:', error);
      alert(`Minting failed: ${error.message}`);
    }
  }

  async function updateTraits(e: React.FormEvent) {
    e.preventDefault();

    if (!address) {
      alert('Please connect your wallet');
      return;
    }

    try {
      await writeContract({
        address: CONTRACTS.NFT_ADDRESS,
        abi: ROOSTER_NFT_ABI,
        functionName: 'updateMutableTraits',
        args: [
          BigInt(updateData.tokenId),
          updateData.strength,
          updateData.speed,
          updateData.level,
          BigInt(updateData.experience),
        ],
      });

      alert('Update initiated! Check your wallet for confirmation.');
    } catch (error: any) {
      console.error('Update failed:', error);
      alert(`Update failed: ${error.message}`);
    }
  }

  async function grantAdminRole(e: React.FormEvent) {
    e.preventDefault();

    if (!address) {
      alert('Please connect your wallet');
      return;
    }

    if (!roleData.address) {
      alert('Please enter a wallet address');
      return;
    }

    try {
      await writeContract({
        address: CONTRACTS.NFT_ADDRESS,
        abi: ROOSTER_NFT_ABI,
        functionName: 'grantRole',
        args: [ADMIN_ROLE as `0x${string}`, roleData.address as `0x${string}`],
      });

      alert('Grant role initiated! Check your wallet for confirmation.');
    } catch (error: any) {
      console.error('Grant role failed:', error);
      alert(`Grant role failed: ${error.message}`);
    }
  }

  async function revokeAdminRole(e: React.FormEvent) {
    e.preventDefault();

    if (!address) {
      alert('Please connect your wallet');
      return;
    }

    if (!roleData.address) {
      alert('Please enter a wallet address');
      return;
    }

    try {
      await writeContract({
        address: CONTRACTS.NFT_ADDRESS,
        abi: ROOSTER_NFT_ABI,
        functionName: 'revokeRole',
        args: [ADMIN_ROLE as `0x${string}`, roleData.address as `0x${string}`],
      });

      alert('Revoke role initiated! Check your wallet for confirmation.');
    } catch (error: any) {
      console.error('Revoke role failed:', error);
      alert(`Revoke role failed: ${error.message}`);
    }
  }

  async function checkAdminRole(e: React.FormEvent) {
    e.preventDefault();

    if (!roleData.checkAddress) {
      alert('Please enter a wallet address to check');
      return;
    }

    try {
      const response = await fetch(
        `/api/check-role?address=${roleData.checkAddress}&role=${ADMIN_ROLE}`
      );
      const data = await response.json();
      
      if (data.error) {
        alert(`Error: ${data.error}`);
        return;
      }

      setHasAdminRole(data.hasRole);
    } catch (error: any) {
      console.error('Check role failed:', error);
      alert(`Check role failed: ${error.message}`);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Mint and manage rooster NFTs</p>
      </div>

      {!address ? (
        <div className="text-center py-20">
          <p className="text-gray-600 text-lg">Please connect your wallet to access admin functions</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Role Management Section */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow-md p-6 border-2 border-purple-200">
            <h2 className="text-2xl font-bold mb-4 text-purple-900">👑 Admin Role Management</h2>
            <p className="text-sm text-gray-600 mb-6">
              Manage admin privileges. Only accounts with DEFAULT_ADMIN_ROLE can grant or revoke admin access.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Grant/Revoke Admin Role */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Grant/Revoke Admin Role</h3>
                <form onSubmit={grantAdminRole} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Wallet Address
                    </label>
                    <input
                      type="text"
                      value={roleData.address}
                      onChange={(e) => setRoleData({ ...roleData, address: e.target.value })}
                      placeholder="0x..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isConfirming}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-3 px-4 rounded-md transition-colors"
                    >
                      {isConfirming ? 'Processing...' : '✓ Grant Admin'}
                    </button>
                    <button
                      type="button"
                      onClick={revokeAdminRole}
                      disabled={isConfirming}
                      className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-3 px-4 rounded-md transition-colors"
                    >
                      {isConfirming ? 'Processing...' : '✗ Revoke Admin'}
                    </button>
                  </div>
                </form>

                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-xs text-yellow-800">
                    <strong>⚠️ Warning:</strong> Only the contract owner (DEFAULT_ADMIN_ROLE) can manage admin roles.
                  </p>
                </div>
              </div>

              {/* Check Admin Role */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Check Admin Role</h3>
                <form onSubmit={checkAdminRole} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Wallet Address to Check
                    </label>
                    <input
                      type="text"
                      value={roleData.checkAddress}
                      onChange={(e) => setRoleData({ ...roleData, checkAddress: e.target.value })}
                      placeholder="0x..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-md transition-colors"
                  >
                    🔍 Check Role
                  </button>
                </form>

                {hasAdminRole !== null && (
                  <div className={`mt-4 p-4 rounded-md ${hasAdminRole ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                    <p className="text-sm font-medium">
                      {hasAdminRole ? (
                        <span className="text-green-800">✓ This address HAS admin role</span>
                      ) : (
                        <span className="text-gray-800">✗ This address does NOT have admin role</span>
                      )}
                    </p>
                  </div>
                )}

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-xs text-blue-800">
                    <strong>ℹ️ Info:</strong> Admins can mint NFTs and update mutable traits.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Existing Forms */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mint Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Mint New Rooster</h2>
            <form onSubmit={mintRooster} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient Address (leave empty for self)
                </label>
                <input
                  type="text"
                  value={formData.recipient}
                  onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                  placeholder="0x..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
                  <select
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {breeds.map((breed) => (
                      <option key={breed} value={breed}>{breed}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <select
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {colors.map((color) => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Strength (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.strength}
                    onChange={(e) => setFormData({ ...formData, strength: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Speed (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.speed}
                    onChange={(e) => setFormData({ ...formData, speed: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isConfirming}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold py-3 px-4 rounded-md transition-colors"
              >
                {isConfirming ? 'Minting...' : 'Mint Rooster'}
              </button>
            </form>
          </div>

          {/* Update Traits Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Update Mutable Traits</h2>
            <form onSubmit={updateTraits} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Token ID</label>
                <input
                  type="number"
                  min="0"
                  value={updateData.tokenId}
                  onChange={(e) => setUpdateData({ ...updateData, tokenId: e.target.value })}
                  placeholder="Enter token ID"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Strength (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={updateData.strength}
                    onChange={(e) => setUpdateData({ ...updateData, strength: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Speed (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={updateData.speed}
                    onChange={(e) => setUpdateData({ ...updateData, speed: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                  <input
                    type="number"
                    min="1"
                    value={updateData.level}
                    onChange={(e) => setUpdateData({ ...updateData, level: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                  <input
                    type="number"
                    min="0"
                    value={updateData.experience}
                    onChange={(e) => setUpdateData({ ...updateData, experience: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isConfirming}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-bold py-3 px-4 rounded-md transition-colors"
              >
                {isConfirming ? 'Updating...' : 'Update Traits'}
              </button>
            </form>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Only accounts with ADMIN_ROLE can update traits. Immutable traits (breed, color, hatch date) cannot be changed.
              </p>
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
