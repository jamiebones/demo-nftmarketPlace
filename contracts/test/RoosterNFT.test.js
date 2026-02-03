const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RoosterNFT", function () {
    let roosterNFT;
    let owner, admin, minter, user;

    beforeEach(async function () {
        [owner, admin, minter, user] = await ethers.getSigners();

        const RoosterNFT = await ethers.getContractFactory("RoosterNFT");
        roosterNFT = await RoosterNFT.deploy(
            "Rooster Fighters",
            "ROOSTER",
            "https://example.com/api/metadata/"
        );
        await roosterNFT.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the correct name and symbol", async function () {
            expect(await roosterNFT.name()).to.equal("Rooster Fighters");
            expect(await roosterNFT.symbol()).to.equal("ROOSTER");
        });

        it("Should grant deployer all roles", async function () {
            const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
            const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));

            expect(await roosterNFT.hasRole(ADMIN_ROLE, owner.address)).to.be.true;
            expect(await roosterNFT.hasRole(MINTER_ROLE, owner.address)).to.be.true;
        });
    });

    describe("Minting", function () {
        it("Should mint a rooster with correct traits", async function () {
            const hatchDate = Math.floor(Date.now() / 1000);

            await roosterNFT.mint(
                user.address,
                "Asil",
                "Red",
                hatchDate,
                85,
                72,
                5,
                1250
            );

            expect(await roosterNFT.ownerOf(0)).to.equal(user.address);
            expect(await roosterNFT.totalSupply()).to.equal(1);

            const [breed, color, hDate] = await roosterNFT.getImmutableTraits(0);
            expect(breed).to.equal("Asil");
            expect(color).to.equal("Red");
            expect(hDate).to.equal(hatchDate);

            const [strength, speed, level, exp] = await roosterNFT.getMutableTraits(0);
            expect(strength).to.equal(85);
            expect(speed).to.equal(72);
            expect(level).to.equal(5);
            expect(exp).to.equal(1250);
        });

        it("Should reject minting with invalid traits", async function () {
            const hatchDate = Math.floor(Date.now() / 1000);

            await expect(
                roosterNFT.mint(user.address, "Asil", "Red", hatchDate, 150, 72, 5, 1250)
            ).to.be.revertedWith("Strength must be <= 100");
        });

        it("Should only allow minters to mint", async function () {
            const hatchDate = Math.floor(Date.now() / 1000);

            await expect(
                roosterNFT.connect(user).mint(user.address, "Asil", "Red", hatchDate, 85, 72, 5, 1250)
            ).to.be.reverted;
        });
    });

    describe("Trait Updates", function () {
        beforeEach(async function () {
            const hatchDate = Math.floor(Date.now() / 1000);
            await roosterNFT.mint(user.address, "Asil", "Red", hatchDate, 85, 72, 5, 1250);
        });

        it("Should allow admin to update mutable traits", async function () {
            await roosterNFT.updateMutableTraits(0, 90, 80, 6, 2000);

            const [strength, speed, level, exp] = await roosterNFT.getMutableTraits(0);
            expect(strength).to.equal(90);
            expect(speed).to.equal(80);
            expect(level).to.equal(6);
            expect(exp).to.equal(2000);
        });

        it("Should not allow non-admin to update traits", async function () {
            await expect(
                roosterNFT.connect(user).updateMutableTraits(0, 90, 80, 6, 2000)
            ).to.be.reverted;
        });

        it("Should emit TraitsUpdated event", async function () {
            await expect(roosterNFT.updateMutableTraits(0, 90, 80, 6, 2000))
                .to.emit(roosterNFT, "TraitsUpdated")
                .withArgs(0, 90, 80, 6, 2000);
        });
    });

    describe("Token URI", function () {
        it("Should return correct token URI", async function () {
            const hatchDate = Math.floor(Date.now() / 1000);
            await roosterNFT.mint(user.address, "Asil", "Red", hatchDate, 85, 72, 5, 1250);

            const uri = await roosterNFT.tokenURI(0);
            expect(uri).to.equal("https://example.com/api/metadata/0.json");
        });
    });

    describe("Role Management", function () {
        it("Should allow admin to grant minter role", async function () {
            const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));

            await roosterNFT.addMinter(minter.address);
            expect(await roosterNFT.hasRole(MINTER_ROLE, minter.address)).to.be.true;
        });

        it("Should allow admin to revoke minter role", async function () {
            const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));

            await roosterNFT.addMinter(minter.address);
            await roosterNFT.removeMinter(minter.address);
            expect(await roosterNFT.hasRole(MINTER_ROLE, minter.address)).to.be.false;
        });
    });
});
