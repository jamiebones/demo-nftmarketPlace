const hre = require("hardhat");
const { loadLatestDeployment } = require("./loadDeployment");

// Sample rooster data
const roosters = [
    {
        breed: "Asil",
        color: "Red",
        strength: 85,
        speed: 72,
        level: 5,
        experience: 1250,
    },
    {
        breed: "Shamo",
        color: "Black",
        strength: 90,
        speed: 65,
        level: 7,
        experience: 2100,
    },
    {
        breed: "Malay",
        color: "White",
        strength: 78,
        speed: 88,
        level: 4,
        experience: 900,
    },
    {
        breed: "Kelso",
        color: "Brown",
        strength: 82,
        speed: 80,
        level: 6,
        experience: 1800,
    },
    {
        breed: "Hatch",
        color: "Grey",
        strength: 88,
        speed: 75,
        level: 8,
        experience: 3200,
    },
    {
        breed: "Sweater",
        color: "Red-White",
        strength: 75,
        speed: 92,
        level: 3,
        experience: 650,
    },
    {
        breed: "Roundhead",
        color: "Black-Red",
        strength: 80,
        speed: 85,
        level: 5,
        experience: 1400,
    },
    {
        breed: "Radio",
        color: "Yellow",
        strength: 83,
        speed: 78,
        level: 6,
        experience: 1900,
    },
    {
        breed: "Claret",
        color: "Dark Red",
        strength: 86,
        speed: 70,
        level: 7,
        experience: 2500,
    },
    {
        breed: "Butcher",
        color: "White-Black",
        strength: 91,
        speed: 68,
        level: 9,
        experience: 4000,
    },
];

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    // Get contract address from environment variable or load from latest deployment
    let nftAddress = process.env.NFT_ADDRESS;

    if (!nftAddress) {
        console.log("📦 Loading deployment configuration...");
        const deployment = loadLatestDeployment(hre.network.name);
        if (deployment && deployment.contracts && deployment.contracts.roosterNFT) {
            nftAddress = deployment.contracts.roosterNFT.address;
            console.log(`✅ Loaded NFT address from deployment: ${nftAddress}`);
        }
    }

    if (!nftAddress) {
        console.error("❌ Please provide NFT contract address");
        console.log("Usage: NFT_ADDRESS=0x... npx hardhat run scripts/mintSamples.js --network bscTestnet");
        console.log("Or deploy contracts first and the script will auto-detect the address");
        process.exit(1);
    }

    console.log("🎨 Minting sample roosters...");
    console.log("Minter address:", deployer.address);
    console.log("NFT Contract:", nftAddress);

    const RoosterNFT = await hre.ethers.getContractFactory("RoosterNFT");
    const roosterNFT = RoosterNFT.attach(nftAddress);

    // Check if deployer has MINTER_ROLE
    const MINTER_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("MINTER_ROLE"));
    const hasMinterRole = await roosterNFT.hasRole(MINTER_ROLE, deployer.address);

    if (!hasMinterRole) {
        console.log("❌ Deployer does not have MINTER_ROLE");
        process.exit(1);
    }

    console.log("✅ Minter role confirmed\n");

    const mintedTokens = [];
    const currentTimestamp = Math.floor(Date.now() / 1000);

    for (let i = 0; i < roosters.length; i++) {
        const rooster = roosters[i];
        const hatchDate = currentTimestamp - (i * 86400 * 30); // Stagger hatch dates by month

        console.log(`Minting Rooster #${i}: ${rooster.breed} (${rooster.color})...`);

        try {
            const tx = await roosterNFT.mint(
                deployer.address,
                rooster.breed,
                rooster.color,
                hatchDate,
                rooster.strength,
                rooster.speed,
                rooster.level,
                rooster.experience
            );

            const receipt = await tx.wait();
            console.log(`✅ Minted token #${i} - tx: ${receipt.hash}`);

            mintedTokens.push({
                tokenId: i,
                ...rooster,
                hatchDate,
                owner: deployer.address,
            });
        } catch (error) {
            console.error(`❌ Failed to mint token #${i}:`, error.message);
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`\n🎉 Successfully minted ${mintedTokens.length} roosters!`);
    console.log("\n📋 Minted Tokens:");
    console.log(JSON.stringify(mintedTokens, null, 2));

    console.log("\n💡 Next steps:");
    console.log("1. Approve marketplace to transfer these NFTs");
    console.log("2. List some roosters on the marketplace");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
