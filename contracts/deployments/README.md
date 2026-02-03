# Deployment Configurations

This directory stores deployment configuration files for each network deployment.

## File Structure

- `{network}-latest.json` - The most recent deployment for a network
- `{network}-{timestamp}.json` - Historical deployments with timestamp

## Usage

### View Latest Deployment

```bash
node scripts/loadDeployment.js bscTestnet
```

### List All Deployments

```bash
node scripts/loadDeployment.js bscTestnet list
```

## Deployment File Format

```json
{
  "network": "bscTestnet",
  "chainId": 97,
  "contracts": {
    "roosterNFT": {
      "address": "0x...",
      "constructorArgs": ["Rooster Fighters", "ROOSTER", "https://..."]
    },
    "marketplace": {
      "address": "0x...",
      "constructorArgs": ["0x..."]
    }
  },
  "deployer": "0x...",
  "feeRecipient": "0x...",
  "baseTokenURI": "https://...",
  "timestamp": "2026-02-03T...",
  "blockNumber": 12345678
}
```

## Notes

- These files are automatically generated during deployment
- Keep these files for reference and verification purposes
- Use `loadDeployment.js` to programmatically access deployment info
