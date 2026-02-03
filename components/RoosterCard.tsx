interface RoosterCardProps {
  tokenId: number;
  breed: string;
  color: string;
  strength: number;
  speed: number;
  level: number;
  imageUrl: string;
  owner?: string;
  price?: string;
  isListed?: boolean;
  onView?: () => void;
}

export default function RoosterCard({
  tokenId,
  breed,
  color,
  strength,
  speed,
  level,
  imageUrl,
  price,
  isListed = false,
  onView,
}: RoosterCardProps) {
  const getRarityColor = (str: number, spd: number, lvl: number) => {
    const total = str + spd + lvl * 10;
    if (total >= 250) return 'text-purple-500';
    if (total >= 200) return 'text-pink-500';
    if (total >= 150) return 'text-blue-500';
    if (total >= 100) return 'text-green-500';
    return 'text-gray-500';
  };

  const getRarityLabel = (str: number, spd: number, lvl: number) => {
    const total = str + spd + lvl * 10;
    if (total >= 250) return 'Legendary';
    if (total >= 200) return 'Epic';
    if (total >= 150) return 'Rare';
    if (total >= 100) return 'Uncommon';
    return 'Common';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative aspect-square bg-gradient-to-br from-yellow-100 to-orange-100">
        <img
          src={imageUrl}
          alt={`Rooster #${tokenId}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/images/placeholder-rooster.png';
          }}
        />
        {isListed && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
            FOR SALE
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-900">Rooster #{tokenId}</h3>
          <span className={`text-sm font-semibold ${getRarityColor(strength, speed, level)}`}>
            {getRarityLabel(strength, speed, level)}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Breed:</span>
            <span className="font-semibold">{breed}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Color:</span>
            <span className="font-semibold">{color}</span>
          </div>

          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Strength:</span>
              <span className="font-semibold">{strength}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full"
                style={{ width: `${strength}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Speed:</span>
              <span className="font-semibold">{speed}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${speed}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Level:</span>
            <span className="font-semibold">Level {level}</span>
          </div>
        </div>

        {price && (
          <div className="mb-4 p-2 bg-green-50 rounded">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Price:</span>
              <span className="text-lg font-bold text-green-600">{price} BNB</span>
            </div>
          </div>
        )}

        {onView && (
          <button
            onClick={onView}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            View Details
          </button>
        )}
      </div>
    </div>
  );
}
