# Rooster NFT Marketplace

A decentralized NFT marketplace for trading unique rooster NFTs with dynamic traits on Binance Smart Chain Testnet.

## Features

- **Dynamic NFT Traits**: Each rooster has immutable traits (breed, color, hatch date) and mutable traits (strength, speed, level, experience)
- **Role-Based Access Control**: Admin can mint and update traits using OpenZeppelin AccessControl
- **Fixed-Price Marketplace**: List and buy roosters with 2.5% platform fee
- **Real-Time Blockchain Data**: Frontend queries BSC testnet directly for NFT data
- **Metadata API**: Centralized JSON metadata served from Next.js API routes

## Project Structure

```
nft-marketplace/
├── contracts/              # Hardhat smart contracts
│   ├── contracts/
│   │   ├── RoosterNFT.sol
│   │   └── RoosterMarketplace.sol
│   ├── scripts/
│   │   ├── deploy.js
│   │   └── mintSamples.js
│   └── test/
└── frontend/              # Next.js frontend
    ├── app/
    │   ├── api/metadata/
    │   ├── marketplace/
    │   └── admin/
    ├── components/
    └── lib/
```

## Setup Instructions

### Prerequisites

- Node.js 18+
- MetaMask or compatible Web3 wallet
- BSC Testnet BNB (get from [faucet](https://testnet.bnbchain.org/faucet-smart))

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install contract dependencies
cd contracts
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

**contracts/.env:**
```
BSC_TESTNET_RPC=https://bsc-testnet-rpc.publicnode.com
PRIVATE_KEY=your_private_key_here
BSCSCAN_API_KEY=your_bscscan_api_key
FEE_RECIPIENT_ADDRESS=your_fee_recipient_address
BASE_TOKEN_URI=https://your-vercel-app.vercel.app/api/metadata/
```

**frontend/.env.local:**
```
NEXT_PUBLIC_BSC_TESTNET_RPC=https://bsc-testnet-rpc.publicnode.com
NEXT_PUBLIC_CHAIN_ID=97
NEXT_PUBLIC_NFT_ADDRESS=deployed_nft_address
NEXT_PUBLIC_MARKETPLACE_ADDRESS=deployed_marketplace_address
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

### 3. Deploy Smart Contracts

```bash
cd contracts

# Compile contracts
npm run compile

# Run tests
npm test

# Deploy to BSC Testnet
npm run deploy:testnet

# Mint sample roosters (use deployed NFT address)
npx hardhat run scripts/mintSamples.js --network bscTestnet <NFT_ADDRESS>
```

### 4. Update Frontend Configuration

After deployment, update `frontend/.env.local` with:
- `NEXT_PUBLIC_NFT_ADDRESS`
- `NEXT_PUBLIC_MARKETPLACE_ADDRESS`

### 5. Run Frontend

```bash
cd frontend
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Smart Contracts

### RoosterNFT.sol
- ERC721 NFT with AccessControl
- Immutable traits: breed, color, hatchDate
- Mutable traits: strength, speed, level, experience
- Admin can update mutable traits
- Token URI points to metadata API

### RoosterMarketplace.sol
- Fixed-price listings with 2.5% platform fee
- Seller retains custody until sale
- ReentrancyGuard for security
- Fee calculation in basis points

## Frontend Pages

- **/** - Gallery view of all roosters with filtering
- **/marketplace** - Active listings for buying
- **/admin** - Mint new roosters and update traits (admin only)

## Testing

```bash
cd contracts
npm test
```

## Deployment to Production

### Deploy Contracts
```bash
cd contracts
npm run deploy:testnet
```

### Deploy Frontend to Vercel
```bash
cd frontend
vercel deploy --prod
```

Update `BASE_TOKEN_URI` in contract deployment to point to your Vercel URL.

## Contract Addresses

After deployment, your addresses will be:
- **RoosterNFT**: `<address from deployment>`
- **RoosterMarketplace**: `<address from deployment>`

View on [BSCScan Testnet](https://testnet.bscscan.com)

## Demo Workflow

1. **Connect Wallet**: Use MetaMask with BSC Testnet
2. **View Gallery**: See all minted roosters with their traits
3. **Admin Mint**: Go to /admin and mint new roosters
4. **List for Sale**: Approve marketplace and list your roosters
5. **Buy NFTs**: Browse marketplace and purchase roosters
6. **Update Traits**: Admin can update mutable traits

## Platform Fee

- **Fee**: 2.5% (250 basis points)
- **Recipient**: Configurable address set during deployment
- **Maximum**: 10% cap enforced by contract

## Technologies

- **Smart Contracts**: Solidity 0.8.20, OpenZeppelin, Hardhat
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Web3**: wagmi, viem, RainbowKit, ethers.js
- **Blockchain**: Binance Smart Chain Testnet

## Security Considerations

- ReentrancyGuard on marketplace functions
- Role-based access control for admin functions
- Input validation on trait values
- Safe transfer patterns for ETH and NFTs

## License

MIT
