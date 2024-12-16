const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DAFIToken", function () {
    let DAFIToken;
    let token;
    let owner;
    let farmer;
    let addr2;

    beforeEach(async function () {
        [owner, farmer, addr2] = await ethers.getSigners();
        DAFIToken = await ethers.getContractFactory("DAFIToken");
        token = await DAFIToken.deploy();
        await token.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await token.owner()).to.equal(owner.address);
        });

        it("Should assign the total supply of tokens to the owner", async function () {
            const ownerBalance = await token.balanceOf(owner.address);
            expect(await token.totalSupply()).to.equal(ownerBalance);
        });
    });

    describe("Farmer Verification", function () {
        it("Should verify a farmer", async function () {
            await token.verifyFarmer(
                farmer.address,
                "did:dafi:123",
                true,
                "Location1",
                1000
            );
            expect(await token.verifiedFarmers(farmer.address)).to.equal(true);
        });

        it("Should not allow non-owner to verify farmer", async function () {
            await expect(
                token.connect(addr2).verifyFarmer(
                    farmer.address,
                    "did:dafi:123",
                    true,
                    "Location1",
                    1000
                )
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should emit FarmerVerified event", async function () {
            await expect(
                token.verifyFarmer(
                    farmer.address,
                    "did:dafi:123",
                    true,
                    "Location1",
                    1000
                )
            )
                .to.emit(token, "FarmerVerified")
                .withArgs(farmer.address, "did:dafi:123");
        });
    });

    describe("Reputation System", function () {
        beforeEach(async function () {
            await token.verifyFarmer(
                farmer.address,
                "did:dafi:123",
                true,
                "Location1",
                1000
            );
        });

        it("Should update reputation score", async function () {
            await token.updateReputationScore(farmer.address, 90);
            const farmerProfile = await token.farmerProfiles(farmer.address);
            expect(farmerProfile.reputationScore).to.equal(90);
        });

        it("Should not allow score above 100", async function () {
            await expect(
                token.updateReputationScore(farmer.address, 101)
            ).to.be.revertedWith("Score must be <= 100");
        });

        it("Should emit ReputationUpdated event", async function () {
            await expect(token.updateReputationScore(farmer.address, 90))
                .to.emit(token, "ReputationUpdated")
                .withArgs(farmer.address, 90);
        });
    });

    describe("Token Operations", function () {
        const mintAmount = BigInt("100000000000000000000"); // 100 tokens

        it("Should allow owner to mint tokens", async function () {
            await token.mint(addr2.address, mintAmount);
            expect(await token.balanceOf(addr2.address)).to.equal(mintAmount);
        });

        it("Should allow users to burn their tokens", async function () {
            await token.mint(addr2.address, mintAmount);
            await token.connect(addr2).burn(mintAmount);
            expect(await token.balanceOf(addr2.address)).to.equal(0);
        });

        it("Should handle transfers correctly", async function () {
            const amount = BigInt("50000000000000000000"); // 50 tokens
            await token.transfer(addr2.address, amount);
            expect(await token.balanceOf(addr2.address)).to.equal(amount);
        });
    });

    describe("Pausable Functionality", function () {
        it("Should allow owner to pause", async function () {
            await token.pause();
            expect(await token.paused()).to.equal(true);
        });

        it("Should prevent transfers when paused", async function () {
            await token.pause();
            await expect(
                token.transfer(addr2.address, 100)
            ).to.be.revertedWith("Pausable: paused");
        });

        it("Should allow owner to unpause", async function () {
            await token.pause();
            await token.unpause();
            expect(await token.paused()).to.equal(false);
        });
    });
});
