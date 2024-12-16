# DAFI Quick Start Guide

## Overview
This guide will help you quickly get started with the DAFI platform, covering basic setup and common operations.

## Quick Setup

### 1. Basic Installation
```bash
# Clone repository
git clone https://github.com/TadashiJei/dafi.git
cd dafi

# Install dependencies
npm install

# Compile contracts
npx hardhat compile
```

### 2. Run Tests
```bash
npx hardhat test
```

## Core Features

### 1. Token Operations

#### Get DAFI Tokens
```javascript
// Using ethers.js
const token = await ethers.getContractAt("DAFIToken", tokenAddress);

// Mint tokens (if you're the owner)
await token.mint(receiverAddress, amount);

// Check balance
const balance = await token.balanceOf(address);
```

### 2. Vault Operations

#### Deposit to Vault
```javascript
// Get vault contract
const vault = await ethers.getContractAt("DAFIVault", vaultAddress);

// Approve tokens
await token.approve(vaultAddress, amount);

// Deposit
await vault.deposit(amount);
```

### 3. Flash Loans

#### Execute Flash Loan
```javascript
const flashLoan = await ethers.getContractAt("DAFIFlashLoan", flashLoanAddress);

// Execute flash loan
await flashLoan.executeFlashLoan(
    receiverAddress,
    [tokenAddress],
    [amount],
    "0x"
);
```

### 4. Weather Derivatives

#### Create Weather Contract
```javascript
const derivatives = await ethers.getContractAt(
    "WeatherDerivatives",
    derivativesAddress
);

await derivatives.createContract(
    WeatherType.RAINFALL,
    strikeValue,
    premium,
    payout,
    duration,
    { value: premium }
);
```

## Common Tasks

### 1. Check Token Price
```javascript
const oracle = await ethers.getContractAt("DAFIPriceOracle", oracleAddress);
const price = await oracle.getPrice(tokenAddress);
```

### 2. View Farmer Status
```javascript
const isVerified = await token.verifiedFarmers(farmerAddress);
const reputation = await token.reputationScores(farmerAddress);
```

### 3. Check Vault Performance
```javascript
const totalAssets = await vault.totalAssets();
const sharePrice = await vault.getPricePerShare();
```

## Web3 Integration

### 1. Connect Wallet
```javascript
// Using ethers.js
const provider = new ethers.providers.Web3Provider(window.ethereum);
await provider.send("eth_requestAccounts", []);
const signer = provider.getSigner();
```

### 2. Contract Interaction
```javascript
// Get contract instance
const token = new ethers.Contract(tokenAddress, tokenABI, signer);

// Perform transaction
const tx = await token.transfer(recipient, amount);
await tx.wait();
```

## Monitoring

### 1. Listen for Events
```javascript
// Listen for transfers
token.on("Transfer", (from, to, amount, event) => {
    console.log(`Transfer: ${from} -> ${to}: ${amount}`);
});

// Listen for flash loans
flashLoan.on("FlashLoan", (receiver, token, amount, fee) => {
    console.log(`Flash Loan: ${amount} to ${receiver}`);
});
```

### 2. Track Transactions
```javascript
const tx = await token.transfer(recipient, amount);
const receipt = await tx.wait();
console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
```

## Error Handling

### Common Errors

1. **Insufficient Balance**
```javascript
try {
    await token.transfer(recipient, amount);
} catch (error) {
    if (error.message.includes("insufficient balance")) {
        console.log("Not enough tokens");
    }
}
```

2. **Unauthorized Access**
```javascript
try {
    await vault.addStrategy(strategyAddress, allocation);
} catch (error) {
    if (error.message.includes("Ownable: caller is not the owner")) {
        console.log("Not authorized");
    }
}
```

## Best Practices

### 1. Gas Management
- Always estimate gas before transactions
- Monitor gas prices
- Batch operations when possible

### 2. Security
- Never expose private keys
- Validate input data
- Use safe math operations
- Handle errors properly

### 3. Testing
- Test all functions
- Include edge cases
- Use proper test fixtures

## Next Steps
- Read the full [Developer Guide](./developer.md)
- Check [Contract Documentation](../contracts/)
- Join our community channels
- Explore advanced features
