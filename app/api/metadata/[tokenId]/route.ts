import { NextRequest, NextResponse } from 'next/server';
import { getRoosterTraits } from '@/lib/blockchain';
import { generateRoosterMetadata } from '@/lib/utils';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ tokenId: string }> }
) {
    try {
        const { tokenId: tokenIdParam } = await params;
        const tokenId = parseInt(tokenIdParam.replace('.json', ''));

        if (isNaN(tokenId) || tokenId < 0) {
            return NextResponse.json(
                { error: 'Invalid token ID' },
                { status: 400 }
            );
        }

        // Fetch traits from blockchain
        const traits = await getRoosterTraits(tokenId);

        // Generate metadata
        const metadata = generateRoosterMetadata(tokenId, traits);

        // Cache for 60 seconds
        return NextResponse.json(metadata, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
            },
        });
    } catch (error) {
        const { tokenId: tokenIdParam } = await params;
        console.error(`Error fetching metadata for token ${tokenIdParam}:`, error);
        return NextResponse.json(
            { error: 'Failed to fetch metadata' },
            { status: 500 }
        );
    }
}
