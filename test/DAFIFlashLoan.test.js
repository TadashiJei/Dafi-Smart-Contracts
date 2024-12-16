const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DAFIFlashLoan", function () {
    let DAFIFlashLoan;
    let flashLoan;
    let MockToken;
    let token;
    let MockFlashLoanReceiver;
    let receiver;
    let owner;
    let addr1;
    let addr2;
    const INITIAL_AMOUNT = BigInt("1000000000000000000000"); // 1000 tokens
    const FLASH_LOAN_AMOUNT = BigInt("100000000000000000000"); // 100 tokens
    const MAX_UINT = BigInt("115792089237316195423570985008687907853269984665640564039457584007913129639935");

    async function approveAndValidate(token, signer, spender, amount) {
        const signerAddress = await signer.getAddress();
        
        // First approve zero
        await token.connect(signer).approve(spender, 0);
        const allowanceAfterZero = await token.allowance(signerAddress, spender);
        expect(allowanceAfterZero).to.equal(0);

        // Then approve the desired amount
        await token.connect(signer).approve(spender, amount);
        const allowanceAfterSet = await token.allowance(signerAddress, spender);
        expect(allowanceAfterSet).to.equal(amount);

        // Double approve to ensure it works
        await token.connect(signer).approve(spender, 0);
        await token.connect(signer).approve(spender, amount);
        const finalAllowance = await token.allowance(signerAddress, spender);
        expect(finalAllowance).to.equal(amount);
    }

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        // Deploy mock token
        MockToken = await ethers.getContractFactory("MockERC20");
        token = await MockToken.deploy("Mock Token", "MTK");
        await token.waitForDeployment();

        // Deploy flash loan contract
        DAFIFlashLoan = await ethers.getContractFactory("DAFIFlashLoan");
        flashLoan = await DAFIFlashLoan.deploy();
        await flashLoan.waitForDeployment();

        // Deploy mock receiver
        MockFlashLoanReceiver = await ethers.getContractFactory("MockFlashLoanReceiver");
        receiver = await MockFlashLoanReceiver.deploy(await flashLoan.getAddress());
        await receiver.waitForDeployment();

        // Initialize reserve
        await flashLoan.initializeReserve(await token.getAddress(), 9); // 0.09% fee

        // Add provider
        await flashLoan.addFlashLoanProvider(await owner.getAddress());

        // Get contract addresses
        const flashLoanAddress = await flashLoan.getAddress();
        const receiverAddress = await receiver.getAddress();

        // Mint initial tokens to owner
        await token.mint(await owner.getAddress(), INITIAL_AMOUNT * BigInt(2)); // Double the amount to have enough for everything

        // Approve flash loan contract to take tokens from owner
        await approveAndValidate(token, owner, flashLoanAddress, INITIAL_AMOUNT * BigInt(2));

        // Provide liquidity to flash loan contract
        await flashLoan.provideFlashLoanLiquidity(await token.getAddress(), INITIAL_AMOUNT);

        // Transfer tokens to receiver for flash loan
        const fee = FLASH_LOAN_AMOUNT * BigInt(9) / BigInt(10000); // 0.09% fee
        await token.transfer(receiverAddress, FLASH_LOAN_AMOUNT + fee);

        // Call onTokenTransfer on receiver to set up approvals
        await receiver.onTokenTransfer(await token.getAddress(), FLASH_LOAN_AMOUNT + fee);
    });

    describe("Reserve Initialization", function () {
        it("Should initialize reserve correctly", async function () {
            const tokenAddress = await token.getAddress();
            const reserve = await flashLoan.reserves(tokenAddress);
            expect(reserve.isActive).to.equal(true);
            expect(reserve.flashLoanFee).to.equal(9);
            expect(reserve.totalLiquidity).to.equal(INITIAL_AMOUNT);
            expect(reserve.availableLiquidity).to.equal(INITIAL_AMOUNT);
        });

        it("Should not initialize reserve twice", async function () {
            await expect(
                flashLoan.initializeReserve(await token.getAddress(), 9)
            ).to.be.revertedWith("Reserve already initialized");
        });

        it("Should not allow fee above maximum", async function () {
            const newToken = await MockToken.deploy("New Token", "NTK");
            await newToken.waitForDeployment();
            
            await expect(
                flashLoan.initializeReserve(await newToken.getAddress(), 1001)
            ).to.be.revertedWith("Fee too high");
        });
    });

    describe("Flash Loan Provider Management", function () {
        it("Should add flash loan provider", async function () {
            await flashLoan.addFlashLoanProvider(addr1.address);
            expect(await flashLoan.flashLoanProviders(addr1.address)).to.equal(true);
        });

        it("Should not add provider twice", async function () {
            await flashLoan.addFlashLoanProvider(addr1.address);
            await expect(
                flashLoan.addFlashLoanProvider(addr1.address)
            ).to.be.revertedWith("Already a provider");
        });

        it("Should remove flash loan provider", async function () {
            await flashLoan.addFlashLoanProvider(addr1.address);
            await flashLoan.removeFlashLoanProvider(addr1.address);
            expect(await flashLoan.flashLoanProviders(addr1.address)).to.equal(false);
        });
    });

    describe("Flash Loan Execution", function () {
        it("Should execute flash loan successfully", async function () {
            const tokens = [await token.getAddress()];
            const amounts = [FLASH_LOAN_AMOUNT];
            
            const initialBalance = await token.balanceOf(await flashLoan.getAddress());
            
            await flashLoan.executeFlashLoan(
                await receiver.getAddress(),
                tokens,
                amounts,
                "0x"
            );
            
            const finalBalance = await token.balanceOf(await flashLoan.getAddress());
            const fee = FLASH_LOAN_AMOUNT * BigInt(9) / BigInt(10000); // 0.09% fee
            expect(finalBalance - initialBalance).to.equal(fee);
        });

        it("Should fail if insufficient liquidity", async function () {
            const tokens = [await token.getAddress()];
            const amounts = [INITIAL_AMOUNT + BigInt(1)];
            await expect(
                flashLoan.executeFlashLoan(
                    await receiver.getAddress(),
                    tokens,
                    amounts,
                    "0x"
                )
            ).to.be.revertedWith("Insufficient liquidity");
        });

        it("Should fail if receiver does not repay", async function () {
            await receiver.setShouldRepay(false);
            const tokens = [await token.getAddress()];
            const amounts = [FLASH_LOAN_AMOUNT];
            await expect(
                flashLoan.executeFlashLoan(
                    await receiver.getAddress(),
                    tokens,
                    amounts,
                    "0x"
                )
            ).to.be.revertedWith("Flash loan failed");
        });
    });
});
