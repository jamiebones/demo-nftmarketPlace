const hre = require("hardhat");

async function main() {
    const marketplace = await hre.ethers.getContractAt(
        'RoosterMarketplace',
        '0x327940881517eEA1586fa7943C8F6956ad08FB69'
    );
    const nft = await hre.ethers.getContractAt(
        'RoosterNFT',
        '0xc279f7E8d7e9D233E2F05f898BA9f7883BA80dd8'
    );

    console.log('Marketplace:', marketplace.target);
    console.log('NFT:', nft.target);

    const currentBlock = await hre.ethers.provider.getBlockNumber();
    console.log('Current block:', currentBlock);

    // Check if any tokens are listed
    const totalSupply = await nft.totalSupply();
    console.log('Total NFTs:', totalSupply.toString());

    for (let i = 0; i < totalSupply; i++) {
        const isListed = await marketplace.isListed(nft.target, i);
        if (isListed) {
            console.log(`Token ${i} is LISTED`);
            const listingId = await marketplace.getListingId(nft.target, i);
            const listing = await marketplace.getListing(listingId);
            console.log('  Listing ID:', listingId);
            console.log('  Seller:', listing[0]);
            console.log('  Price:', hre.ethers.formatEther(listing[3]), 'BNB');
            console.log('  Active:', listing[4]);
        }
    }

    // Get Listed events from deployment block
    console.log('\n--- Querying Listed Events ---');
    const deploymentBlock = 88218987;
    const filter = marketplace.filters.Listed();
    const events = await marketplace.queryFilter(filter, deploymentBlock, currentBlock);
    console.log('Total Listed events:', events.length);

    events.forEach((e, i) => {
        console.log(`\nEvent ${i}:`);
        console.log('  Listing ID:', e.args[0]);
        console.log('  Seller:', e.args[1]);
        console.log('  NFT Contract:', e.args[2]);
        console.log('  Token ID:', e.args[3].toString());
        console.log('  Price:', hre.ethers.formatEther(e.args[4]), 'BNB');
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
