export interface RoosterMetadata {
    name: string;
    description: string;
    image: string;
    attributes: Array<{
        trait_type: string;
        value: string | number;
        display_type?: string;
        max_value?: number;
    }>;
}

export function generateRoosterMetadata(
    tokenId: number,
    traits: {
        breed: string;
        color: string;
        hatchDate: bigint;
        strength: number;
        speed: number;
        level: number;
        experience: bigint;
    }
): RoosterMetadata {
    return {
        name: `Rooster #${tokenId}`,
        description: `A ${traits.color} ${traits.breed} fighting rooster with unique characteristics and battle statistics.`,
        image: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/images/rooster-${tokenId % 10}.png`,
        attributes: [
            {
                trait_type: 'Breed',
                value: traits.breed,
            },
            {
                trait_type: 'Color',
                value: traits.color,
            },
            {
                trait_type: 'Hatch Date',
                value: Number(traits.hatchDate),
                display_type: 'date',
            },
            {
                trait_type: 'Strength',
                value: traits.strength,
                max_value: 100,
            },
            {
                trait_type: 'Speed',
                value: traits.speed,
                max_value: 100,
            },
            {
                trait_type: 'Level',
                value: traits.level,
                display_type: 'number',
            },
            {
                trait_type: 'Experience',
                value: Number(traits.experience),
                display_type: 'number',
            },
        ],
    };
}

export function calculateRarity(traits: {
    strength: number;
    speed: number;
    level: number;
}): string {
    const total = traits.strength + traits.speed + traits.level * 10;

    if (total >= 250) return 'Legendary';
    if (total >= 200) return 'Epic';
    if (total >= 150) return 'Rare';
    if (total >= 100) return 'Uncommon';
    return 'Common';
}

export function formatBNB(value: bigint): string {
    const bnb = Number(value) / 1e18;
    return bnb.toFixed(4);
}

export function parseBNB(value: string): bigint {
    try {
        const num = parseFloat(value);
        return BigInt(Math.floor(num * 1e18));
    } catch {
        return BigInt(0);
    }
}

export function formatDate(timestamp: bigint): string {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export function shortenAddress(address: string): string {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
