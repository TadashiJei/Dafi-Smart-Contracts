# DAFIToken Contract Documentation

## Overview
The DAFIToken contract is the core token of the DAFI ecosystem. It implements the ERC20 standard with additional functionality for farmer verification and reputation management.

## Contract Details
- **Contract Name:** DAFIToken
- **Token Symbol:** DAFI
- **Decimals:** 18
- **License:** MIT

## Key Features

### Farmer Verification System
The contract maintains a registry of verified farmers, enabling special privileges and access to platform features.

```solidity
mapping(address => bool) public verifiedFarmers;
```

### Reputation System
Each verified farmer has a reputation score that affects their access to platform services.

```solidity
mapping(address => uint256) public reputationScores;
```

## Functions

### Administrative Functions

#### verifyFarmer
```solidity
function verifyFarmer(address farmer) external onlyOwner
```
Allows the contract owner to verify a farmer's address.

#### updateReputationScore
```solidity
function updateReputationScore(address farmer, uint256 newScore) external onlyOwner
```
Updates a farmer's reputation score (0-100).

### Token Operations

#### mint
```solidity
function mint(address to, uint256 amount) external onlyOwner
```
Mints new tokens to a specified address.

#### burn
```solidity
function burn(uint256 amount) external
```
Allows token holders to burn their tokens.

### Pausable Functions

#### pause
```solidity
function pause() external onlyOwner
```
Pauses all token transfers.

#### unpause
```solidity
function unpause() external onlyOwner
```
Unpauses token transfers.

## Events

### FarmerVerified
```solidity
event FarmerVerified(address indexed farmer);
```
Emitted when a farmer is verified.

### ReputationUpdated
```solidity
event ReputationUpdated(address indexed farmer, uint256 newScore);
```
Emitted when a farmer's reputation score is updated.

## Modifiers

### onlyVerifiedFarmer
```solidity
modifier onlyVerifiedFarmer()
```
Ensures function caller is a verified farmer.

## Security Considerations
- Only the contract owner can verify farmers and update reputation scores
- Reputation scores are capped at 100
- Implements OpenZeppelin's Pausable for emergency stops
- Uses SafeMath for arithmetic operations

## Integration Examples

### Verifying a Farmer
```javascript
const dafi = await DAFIToken.deployed();
await dafi.verifyFarmer(farmerAddress);
```

### Updating Reputation
```javascript
const dafi = await DAFIToken.deployed();
await dafi.updateReputationScore(farmerAddress, 85);
```

## Testing
Comprehensive tests are available in `/test/DAFIToken.test.js`.
