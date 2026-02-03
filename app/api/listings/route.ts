import { NextResponse } from 'next/server';
import { getActiveListings } from '@/lib/blockchain';

export async function GET() {
    try {
        const listings = await getActiveListings();

        // Convert BigInt values to strings for JSON serialization
        const serializedListings = listings.map(listing => ({
            ...listing,
            tokenId: listing.tokenId.toString(),
            price: listing.price.toString(),
        }));

        return NextResponse.json(serializedListings, {
            headers: {
                'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
            },
        });
    } catch (error) {
        console.error('Error fetching listings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch listings' },
            { status: 500 }
        );
    }
}
