'use client';

import { useEffect, useState } from 'react';
import RoosterCard from '@/components/RoosterCard';
import { getTotalSupply, getRoosterTraits, isNFTListed } from '@/lib/blockchain';
import { formatBNB } from '@/lib/utils';

interface Rooster {
  tokenId: number;
  breed: string;
  color: string;
  strength: number;
  speed: number;
  level: number;
  experience: bigint;
  isListed: boolean;
  price?: bigint;
}

export default function Home() {
  const [roosters, setRoosters] = useState<Rooster[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadRoosters();
  }, []);

  async function loadRoosters() {
    try {
      const total = await getTotalSupply();
      const roosterData: Rooster[] = [];

      for (let i = 0; i < total; i++) {
        try {
          const traits = await getRoosterTraits(i);
          const listed = await isNFTListed(i);

          roosterData.push({
            tokenId: i,
            breed: traits.breed,
            color: traits.color,
            strength: traits.strength,
            speed: traits.speed,
            level: traits.level,
            experience: traits.experience,
            isListed: listed,
          });
        } catch (error) {
          console.error(`Failed to load rooster #${i}:`, error);
        }
      }

      setRoosters(roosterData);
    } catch (error) {
      console.error('Failed to load roosters:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredRoosters = roosters.filter((rooster) => {
    if (filter === 'listed') return rooster.isListed;
    if (filter === 'all') return true;
    return rooster.breed.toLowerCase() === filter.toLowerCase();
  });

  const breeds = Array.from(new Set(roosters.map((r) => r.breed)));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Rooster Collection
        </h1>
        <p className="text-gray-600">
          Unique fighting roosters with dynamic traits and characteristics
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded ${
            filter === 'all'
              ? 'bg-orange-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          All ({roosters.length})
        </button>
        <button
          onClick={() => setFilter('listed')}
          className={`px-4 py-2 rounded ${
            filter === 'listed'
              ? 'bg-orange-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          For Sale ({roosters.filter((r) => r.isListed).length})
        </button>
        {breeds.map((breed) => (
          <button
            key={breed}
            onClick={() => setFilter(breed)}
            className={`px-4 py-2 rounded ${
              filter === breed
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {breed} ({roosters.filter((r) => r.breed === breed).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="mt-4 text-gray-600">Loading roosters...</p>
        </div>
      ) : filteredRoosters.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-600 text-lg">No roosters found.</p>
          <p className="text-gray-500 mt-2">Deploy contracts and mint some roosters to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRoosters.map((rooster) => (
            <RoosterCard
              key={rooster.tokenId}
              tokenId={rooster.tokenId}
              breed={rooster.breed}
              color={rooster.color}
              strength={rooster.strength}
              speed={rooster.speed}
              level={rooster.level}
              imageUrl={`/images/rooster-${rooster.tokenId % 10}.png`}
              isListed={rooster.isListed}
              price={rooster.price ? formatBNB(rooster.price) : undefined}
              onView={() => window.location.href = `/rooster/${rooster.tokenId}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
