'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { BSC_TESTNET_CONFIG } from '@/lib/config';
import { ReactNode } from 'react';

const config = getDefaultConfig({
  appName: 'Rooster NFT Marketplace',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo',
  chains: [BSC_TESTNET_CONFIG as any],
  transports: {
    [BSC_TESTNET_CONFIG.id]: http(BSC_TESTNET_CONFIG.rpcUrls.default.http[0]),
  },
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
