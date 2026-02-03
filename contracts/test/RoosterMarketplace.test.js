const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RoosterMarketplace", function () {
    let roosterNFT, marketplace;
    let owner, seller, buyer, feeRecipient;

    beforeEach(async function () {
        [owner, seller, buyer, feeRecipient] = await ethers.getSigners();

        // Deploy NFT contract
        const RoosterNFT = await ethers.getContractFactory("RoosterNFT");
        roosterNFT = await RoosterNFT.deploy(
            "Rooster Fighters",
            "ROOSTER",
            "https://example.com/api/metadata/"
        );
        await roosterNFT.waitForDeployment();

        // Deploy Marketplace
        const Marketplace = await ethers.getContractFactory("RoosterMarketplace");
        marketplace = await Marketplace.deploy(feeRecipient.address);
        await marketplace.waitForDeployment();

        // Mint an NFT to seller
        const hatchDate = Math.floor(Date.now() / 1000);
        await roosterNFT.mint(seller.address, "Asil", "Red", hatchDate, 85, 72, 5, 1250);
    });

    describe("Listing", function () {
        it("Should list an NFT for sale", async function () {
            await roosterNFT.connect(seller).approve(await marketplace.getAddress(), 0);

            const price = ethers.parseEther("1");
            await expect(
                marketplace.connect(seller).listNFT(await roosterNFT.getAddress(), 0, price)
            ).to.emit(marketplace, "Listed");

            expect(await marketplace.isListed(await roosterNFT.getAddress(), 0)).to.be.true;
        });

        it("Should fail if not approved", async function () {
            const price = ethers.parseEther("1");
            await expect(
                marketplace.connect(seller).listNFT(await roosterNFT.getAddress(), 0, price)
            ).to.be.revertedWith("Marketplace not approved");
        });

        it("Should fail if not owner", async function () {
            const price = ethers.parseEther("1");
            await expect(
                marketplace.connect(buyer).listNFT(await roosterNFT.getAddress(), 0, price)
            ).to.be.revertedWith("Not the owner");
        });

        it("Should fail if price is zero", async function () {
            await roosterNFT.connect(seller).approve(await marketplace.getAddress(), 0);
            await expect(
                marketplace.connect(seller).listNFT(await roosterNFT.getAddress(), 0, 0)
            ).to.be.revertedWith("Price must be greater than 0");
        });
    });

    describe("Buying", function () {
        let listingId;

        beforeEach(async function () {
            await roosterNFT.connect(seller).approve(await marketplace.getAddress(), 0);
            const price = ethers.parseEther("1");
            const tx = await marketplace.connect(seller).listNFT(
                await roosterNFT.getAddress(),
                0,
                price
            );
            const receipt = await tx.wait();
            listingId = receipt.logs[0].args[0];
        });

        it("Should allow buying an NFT", async function () {
            const price = ethers.parseEther("1");

            await expect(
                marketplace.connect(buyer).buyNFT(listingId, { value: price })
            ).to.emit(marketplace, "Sold");

            expect(await roosterNFT.ownerOf(0)).to.equal(buyer.address);
            expect(await marketplace.isListed(await roosterNFT.getAddress(), 0)).to.be.false;
        });

        it("Should transfer correct fees", async function () {
            const price = ethers.parseEther("1");
            const platformFee = (price * 250n) / 10000n; // 2.5%
            const sellerProceeds = price - platformFee;

            const feeRecipientBalanceBefore = await ethers.provider.getBalance(feeRecipient.address);
            const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);

            await marketplace.connect(buyer).buyNFT(listingId, { value: price });

            const feeRecipientBalanceAfter = await ethers.provider.getBalance(feeRecipient.address);
            const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);

            expect(feeRecipientBalanceAfter - feeRecipientBalanceBefore).to.equal(platformFee);
            expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(sellerProceeds);
        });

        it("Should fail with incorrect payment", async function () {
            const wrongPrice = ethers.parseEther("0.5");
            await expect(
                marketplace.connect(buyer).buyNFT(listingId, { value: wrongPrice })
            ).to.be.revertedWith("Incorrect payment amount");
        });

        it("Should prevent seller from buying own NFT", async function () {
            const price = ethers.parseEther("1");
            await expect(
                marketplace.connect(seller).buyNFT(listingId, { value: price })
            ).to.be.revertedWith("Cannot buy your own NFT");
        });
    });

    describe("Cancelling", function () {
        let listingId;

        beforeEach(async function () {
            await roosterNFT.connect(seller).approve(await marketplace.getAddress(), 0);
            const price = ethers.parseEther("1");
            const tx = await marketplace.connect(seller).listNFT(
                await roosterNFT.getAddress(),
                0,
                price
            );
            const receipt = await tx.wait();
            listingId = receipt.logs[0].args[0];
        });

        it("Should allow seller to cancel listing", async function () {
            await expect(
                marketplace.connect(seller).cancelListing(listingId)
            ).to.emit(marketplace, "ListingCancelled");

            expect(await marketplace.isListed(await roosterNFT.getAddress(), 0)).to.be.false;
        });

        it("Should not allow non-seller to cancel", async function () {
            await expect(
                marketplace.connect(buyer).cancelListing(listingId)
            ).to.be.revertedWith("Not the seller");
        });
    });

    describe("Fee Management", function () {
        it("Should allow owner to update platform fee", async function () {
            await expect(marketplace.setPlatformFee(500))
                .to.emit(marketplace, "FeeUpdated")
                .withArgs(250, 500);

            expect(await marketplace.platformFeeBps()).to.equal(500);
        });

        it("Should not allow fee above maximum", async function () {
            await expect(marketplace.setPlatformFee(1500))
                .to.be.revertedWith("Fee exceeds maximum");
        });

        it("Should allow owner to update fee recipient", async function () {
            const newRecipient = buyer.address;
            await expect(marketplace.setFeeRecipient(newRecipient))
                .to.emit(marketplace, "FeeRecipientUpdated");

            expect(await marketplace.feeRecipient()).to.equal(newRecipient);
        });

        it("Should calculate fees correctly", async function () {
            const price = ethers.parseEther("1");
            const [platformFee, sellerProceeds] = await marketplace.calculateFees(price);

            expect(platformFee).to.equal(ethers.parseEther("0.025")); // 2.5%
            expect(sellerProceeds).to.equal(ethers.parseEther("0.975"));
        });
    });
});
