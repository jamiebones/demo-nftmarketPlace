const fs = require("fs");
const path = require("path");

/**
 * Load the latest deployment configuration for a given network
 * @param {string} networkName - The name of the network (e.g., 'bscTestnet', 'hardhat')
 * @returns {Object|null} - The deployment configuration or null if not found
 */
function loadLatestDeployment(networkName) {
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    const latestFilePath = path.join(deploymentsDir, `${networkName}-latest.json`);

    if (!fs.existsSync(latestFilePath)) {
        console.error(`❌ No deployment found for network: ${networkName}`);
        return null;
    }

    try {
        const deploymentData = fs.readFileSync(latestFilePath, "utf8");
        return JSON.parse(deploymentData);
    } catch (error) {
        console.error(`❌ Error reading deployment file:`, error.message);
        return null;
    }
}

/**
 * List all deployments for a given network
 * @param {string} networkName - The name of the network
 * @returns {Array} - Array of deployment file names
 */
function listDeployments(networkName) {
    const deploymentsDir = path.join(__dirname, "..", "deployments");

    if (!fs.existsSync(deploymentsDir)) {
        return [];
    }

    const files = fs.readdirSync(deploymentsDir);
    return files.filter(
        (file) => file.startsWith(networkName) && file.endsWith(".json") && !file.includes("latest")
    );
}

/**
 * Load a specific deployment by timestamp
 * @param {string} networkName - The name of the network
 * @param {number} timestamp - The timestamp of the deployment
 * @returns {Object|null} - The deployment configuration or null if not found
 */
function loadDeployment(networkName, timestamp) {
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    const deploymentFilePath = path.join(deploymentsDir, `${networkName}-${timestamp}.json`);

    if (!fs.existsSync(deploymentFilePath)) {
        console.error(`❌ Deployment not found: ${deploymentFilePath}`);
        return null;
    }

    try {
        const deploymentData = fs.readFileSync(deploymentFilePath, "utf8");
        return JSON.parse(deploymentData);
    } catch (error) {
        console.error(`❌ Error reading deployment file:`, error.message);
        return null;
    }
}

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);
    const networkName = args[0] || "bscTestnet";
    const command = args[1] || "latest";

    if (command === "list") {
        const deployments = listDeployments(networkName);
        console.log(`\n📋 Deployments for ${networkName}:`);
        if (deployments.length === 0) {
            console.log("   No deployments found");
        } else {
            deployments.forEach((file) => console.log(`   - ${file}`));
        }
    } else {
        const deployment = loadLatestDeployment(networkName);
        if (deployment) {
            console.log(`\n📦 Latest deployment for ${networkName}:`);
            console.log(JSON.stringify(deployment, null, 2));
            console.log("\n📋 Contract Addresses:");
            console.log(`   RoosterNFT: ${deployment.contracts.roosterNFT.address}`);
            console.log(`   Marketplace: ${deployment.contracts.marketplace.address}`);
        }
    }
}

module.exports = {
    loadLatestDeployment,
    loadDeployment,
    listDeployments,
};
