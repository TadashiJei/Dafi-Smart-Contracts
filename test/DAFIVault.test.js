const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DAFIVault", function () {
    let DAFIVault;
    let vault;
    let MockToken;
    let token;
    let MockStrategy;
    let strategy;
    let owner;
    let addr1;
    let addr2;
    const INITIAL_AMOUNT = BigInt("1000000000000000000000"); // 1000 tokens
    const DEPOSIT_AMOUNT = BigInt("100000000000000000000"); // 100 tokens

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        // Deploy mock token
        MockToken = await ethers.getContractFactory("MockERC20");
        token = await MockToken.deploy("Mock Token", "MTK");
        await token.waitForDeployment();

        // Deploy vault
        DAFIVault = await ethers.getContractFactory("DAFIVault");
        vault = await DAFIVault.deploy(
            await token.getAddress(),
            "DAFI Vault",
            "DAFI"
        );
        await vault.waitForDeployment();

        // Deploy mock strategy
        MockStrategy = await ethers.getContractFactory("MockStrategy");
        strategy = await MockStrategy.deploy(await token.getAddress());
        await strategy.waitForDeployment();

        // Mint tokens to users
        await token.mint(addr1.address, INITIAL_AMOUNT);
        await token.connect(addr1).approve(await vault.getAddress(), INITIAL_AMOUNT);
    });

    describe("Deployment", function () {
        it("Should set the right token", async function () {
            expect(await vault.token()).to.equal(await token.getAddress());
        });

        it("Should set the right owner", async function () {
            expect(await vault.owner()).to.equal(owner.address);
        });
    });

    describe("Strategy Management", function () {
        it("Should add strategy correctly", async function () {
            await vault.addStrategy(await strategy.getAddress(), 5000); // 50%
            const strategyInfo = await vault.strategies(0);
            expect(strategyInfo.allocation).to.equal(5000);
            expect(strategyInfo.active).to.equal(true);
        });

        it("Should not exceed maximum allocation", async function () {
            await vault.addStrategy(await strategy.getAddress(), 5000);
            await expect(
                vault.addStrategy(await strategy.getAddress(), 6000)
            ).to.be.revertedWith("Allocation too high");
        });

        it("Should update strategy allocation", async function () {
            await vault.addStrategy(await strategy.getAddress(), 5000);
            await vault.updateStrategy(0, 3000);
            const strategyInfo = await vault.strategies(0);
            expect(strategyInfo.allocation).to.equal(3000);
        });
    });

    describe("Deposits and Withdrawals", function () {
        beforeEach(async function () {
            await vault.addStrategy(await strategy.getAddress(), 5000);
        });

        it("Should deposit tokens correctly", async function () {
            await vault.connect(addr1).deposit(DEPOSIT_AMOUNT);
            expect(await vault.balanceOf(addr1.address)).to.equal(DEPOSIT_AMOUNT);
        });

        it("Should not allow withdrawal before lock period", async function () {
            await vault.connect(addr1).deposit(DEPOSIT_AMOUNT);
            await expect(
                vault.connect(addr1).withdraw(DEPOSIT_AMOUNT)
            ).to.be.revertedWith("Still locked");
        });

        it("Should allow withdrawal after lock period", async function () {
            await vault.connect(addr1).deposit(DEPOSIT_AMOUNT);
            
            // Fast forward time
            await ethers.provider.send("evm_increaseTime", [86400]); // 1 day
            await ethers.provider.send("evm_mine");

            const initialBalance = await token.balanceOf(addr1.address);
            await vault.connect(addr1).withdraw(DEPOSIT_AMOUNT);
            const finalBalance = await token.balanceOf(addr1.address);

            // Calculate expected amount after 0.1% fee
            const fee = DEPOSIT_AMOUNT * BigInt(10) / BigInt(10000); // 0.1% fee
            const expectedAmount = DEPOSIT_AMOUNT - fee;

            expect(finalBalance - initialBalance).to.equal(expectedAmount);
        });

        it("Should calculate correct withdrawal amount with fees", async function () {
            await vault.connect(addr1).deposit(DEPOSIT_AMOUNT);
            
            // Fast forward time
            await ethers.provider.send("evm_increaseTime", [86400]); // 1 day
            await ethers.provider.send("evm_mine");

            const initialOwnerBalance = await token.balanceOf(owner.address);
            await vault.connect(addr1).withdraw(DEPOSIT_AMOUNT);
            const finalOwnerBalance = await token.balanceOf(owner.address);

            // Check that owner received the fee
            const expectedFee = DEPOSIT_AMOUNT * BigInt(10) / BigInt(10000); // 0.1% fee
            expect(finalOwnerBalance - initialOwnerBalance).to.equal(expectedFee);
        });
    });

    describe("Harvesting", function () {
        beforeEach(async function () {
            await vault.addStrategy(await strategy.getAddress(), 5000);
            await vault.connect(addr1).deposit(DEPOSIT_AMOUNT);
        });

        it("Should harvest profits correctly", async function () {
            // Fast forward time
            await ethers.provider.send("evm_increaseTime", [86400]); // 1 day
            await ethers.provider.send("evm_mine");

            await vault.harvest();
            expect(await vault.lastHarvest()).to.be.gt(0);
        });
    });

    describe("Emergency Functions", function () {
        beforeEach(async function () {
            await vault.addStrategy(await strategy.getAddress(), 5000);
            await vault.connect(addr1).deposit(DEPOSIT_AMOUNT);
        });

        it("Should execute emergency withdraw", async function () {
            const initialBalance = await token.balanceOf(owner.address);
            await vault.emergencyWithdraw();
            const finalBalance = await token.balanceOf(owner.address);
            expect(finalBalance).to.be.gt(initialBalance);
        });
    });

    describe("Fee Management", function () {
        it("Should update withdrawal fee correctly", async function () {
            await vault.setWithdrawalFee(20); // 0.2%
            expect(await vault.withdrawalFee()).to.equal(20);
        });

        it("Should update performance fee correctly", async function () {
            await vault.setPerformanceFee(2000); // 20%
            expect(await vault.performanceFee()).to.equal(2000);
        });

        it("Should not allow fees above maximum", async function () {
            await expect(vault.setWithdrawalFee(1100)).to.be.revertedWith(
                "Fee too high"
            );
            await expect(vault.setPerformanceFee(3100)).to.be.revertedWith(
                "Fee too high"
            );
        });
    });
});
