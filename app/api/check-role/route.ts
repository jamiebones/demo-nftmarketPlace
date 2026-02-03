import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { CONTRACTS } from '@/lib/config';
import { ROOSTER_NFT_ABI } from '@/lib/abis';

const PROVIDER_URL = process.env.NEXT_PUBLIC_BSC_TESTNET_RPC || 'https://bsc-testnet-rpc.publicnode.com';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const address = searchParams.get('address');
        const role = searchParams.get('role');

        if (!address || !role) {
            return NextResponse.json(
                { error: 'Address and role parameters are required' },
                { status: 400 }
            );
        }

        // Validate address format
        if (!ethers.isAddress(address)) {
            return NextResponse.json(
                { error: 'Invalid address format' },
                { status: 400 }
            );
        }

        const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
        const nftContract = new ethers.Contract(
            CONTRACTS.NFT_ADDRESS,
            ROOSTER_NFT_ABI,
            provider
        );

        const hasRole = await nftContract.hasRole(role, address);

        return NextResponse.json(
            { hasRole, address, role },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
                },
            }
        );
    } catch (error) {
        console.error('Error checking role:', error);
        return NextResponse.json(
            { error: 'Failed to check role' },
            { status: 500 }
        );
    }
}
