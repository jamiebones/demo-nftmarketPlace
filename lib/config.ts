import { bscTestnet } from 'viem/chains';
import { http } from 'viem';

export const BSC_TESTNET_CONFIG = {
    id: 97,
    name: 'BSC Testnet',
    network: 'bsc-testnet',
    nativeCurrency: {
        decimals: 18,
        name: 'tBNB',
        symbol: 'tBNB',
    },
    rpcUrls: {
        default: {
            http: [process.env.NEXT_PUBLIC_BSC_TESTNET_RPC || 'https://bsc-testnet-rpc.publicnode.com'],
        },
        public: {
            http: ['https://bsc-testnet-rpc.publicnode.com'],
        },
    },
    blockExplorers: {
        default: { name: 'BscScan', url: 'https://testnet.bscscan.com' },
    },
    testnet: true,
} as const;

export const SUPPORTED_CHAINS = [BSC_TESTNET_CONFIG];

export const CONTRACTS = {
    NFT_ADDRESS: process.env.NEXT_PUBLIC_NFT_ADDRESS as `0x${string}` || '0x',
    MARKETPLACE_ADDRESS: process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS as `0x${string}` || '0x',
};

export const PLATFORM_FEE_BPS = 250; // 2.5%
export const BPS_DENOMINATOR = 10000;
