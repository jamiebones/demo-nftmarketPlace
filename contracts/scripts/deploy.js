const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

    // Get fee recipient from env or use deployer
    const feeRecipient = process.env.FEE_RECIPIENT_ADDRESS || deployer.address;
    console.log("Fee recipient:", feeRecipient);

    // Deploy RoosterNFT
    console.log("\n📦 Deploying RoosterNFT...");
    const RoosterNFT = await hre.ethers.getContractFactory("RoosterNFT");

    // Base token URI will point to your Vercel deployment
    const baseTokenURI = process.env.BASE_TOKEN_URI || "https://your-app.vercel.app/api/metadata/";

    const roosterNFT = await RoosterNFT.deploy(
        "Rooster Fighters",
        "ROOSTER",
        baseTokenURI
    );
    await roosterNFT.waitForDeployment();
    const nftAddress = await roosterNFT.getAddress();
    console.log("✅ RoosterNFT deployed to:", nftAddress);

    // Deploy RoosterMarketplace
    console.log("\n📦 Deploying RoosterMarketplace...");
    const RoosterMarketplace = await hre.ethers.getContractFactory("RoosterMarketplace");
    const marketplace = await RoosterMarketplace.deploy(feeRecipient);
    await marketplace.waitForDeployment();
    const marketplaceAddress = await marketplace.getAddress();
    console.log("✅ RoosterMarketplace deployed to:", marketplaceAddress);

    // Wait for block confirmations
    console.log("\n⏳ Waiting for block confirmations...");
    await roosterNFT.deploymentTransaction().wait(5);
    await marketplace.deploymentTransaction().wait(5);

    // Save deployment info
    const deploymentInfo = {
        network: hre.network.name,
        chainId: hre.network.config.chainId,
        contracts: {
            roosterNFT: {
                address: nftAddress,
                constructorArgs: ["Rooster Fighters", "ROOSTER", baseTokenURI],
            },
            marketplace: {
                address: marketplaceAddress,
                constructorArgs: [feeRecipient],
            },
        },
        deployer: deployer.address,
        feeRecipient: feeRecipient,
        baseTokenURI: baseTokenURI,
        timestamp: new Date().toISOString(),
        blockNumber: await hre.ethers.provider.getBlockNumber(),
    };

    // Create deployments directory if it doesn't exist
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    // Save deployment info to JSON file
    const deploymentFileName = `${hre.network.name}-${Date.now()}.json`;
    const deploymentFilePath = path.join(deploymentsDir, deploymentFileName);
    fs.writeFileSync(deploymentFilePath, JSON.stringify(deploymentInfo, null, 2));

    // Also save as latest deployment for this network
    const latestFilePath = path.join(deploymentsDir, `${hre.network.name}-latest.json`);
    fs.writeFileSync(latestFilePath, JSON.stringify(deploymentInfo, null, 2));

    console.log("\n📝 Deployment Summary:");
    console.log(JSON.stringify(deploymentInfo, null, 2));
    console.log(`\n💾 Deployment info saved to:`);
    console.log(`   - ${deploymentFilePath}`);
    console.log(`   - ${latestFilePath}`);

    // Verify contracts on BSCScan
    if (hre.network.name === "bscTestnet") {
        console.log("\n🔍 Verifying contracts on BSCScan...");

        try {
            await hre.run("verify:verify", {
                address: nftAddress,
                constructorArguments: ["Rooster Fighters", "ROOSTER", baseTokenURI],
            });
            console.log("✅ RoosterNFT verified");
        } catch (error) {
            console.log("❌ RoosterNFT verification failed:", error.message);
        }

        try {
            await hre.run("verify:verify", {
                address: marketplaceAddress,
                constructorArguments: [feeRecipient],
            });
            console.log("✅ RoosterMarketplace verified");
        } catch (error) {
            console.log("❌ RoosterMarketplace verification failed:", error.message);
        }
    }

    console.log("\n🎉 Deployment complete!");
    console.log("\n📋 Next steps:");
    console.log("1. Update frontend .env with contract addresses");
    console.log("2. Grant MINTER_ROLE to admin address if needed");
    console.log("3. Mint some sample roosters for demo");
    console.log("\nContract Addresses:");
    console.log(`NEXT_PUBLIC_NFT_ADDRESS=${nftAddress}`);
    console.log(`NEXT_PUBLIC_MARKETPLACE_ADDRESS=${marketplaceAddress}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
