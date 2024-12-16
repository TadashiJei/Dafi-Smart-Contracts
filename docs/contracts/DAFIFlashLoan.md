# DAFIFlashLoan Contract Documentation

## Overview
The DAFIFlashLoan contract provides flash loan functionality within the DAFI ecosystem, allowing users to borrow assets without collateral for a single transaction, as long as the borrowed amount is returned with a fee.

## Contract Details
- **Contract Name:** DAFIFlashLoan
- **License:** MIT
- **Dependencies:** OpenZeppelin's SafeERC20, ReentrancyGuard, Ownable

## Key Features

### Reserve Management
Each supported token has a reserve with the following properties:
```solidity
struct ReserveData {
    bool isActive;
    uint256 totalLiquidity;
    uint256 availableLiquidity;
    uint256 flashLoanFee;
}
```

### Flash Loan Providers
Authorized addresses that can provide liquidity to the flash loan pools:
```solidity
mapping(address => bool) public flashLoanProviders;
```

## Constants

```solidity
uint256 public constant FLASH_LOAN_FEE_PRECISION = 10000;
uint256 public constant MAX_FLASH_LOAN_FEE = 1000; // 10%
```

## Functions

### Administrative Functions

#### initializeReserve
```solidity
function initializeReserve(address token, uint256 fee) external onlyOwner
```
Initializes a new token reserve with specified fee.

#### addFlashLoanProvider
```solidity
function addFlashLoanProvider(address provider) external onlyOwner
```
Adds a new flash loan liquidity provider.

#### removeFlashLoanProvider
```solidity
function removeFlashLoanProvider(address provider) external onlyOwner
```
Removes a flash loan liquidity provider.

### Core Functions

#### executeFlashLoan
```solidity
function executeFlashLoan(
    address receiver,
    address[] calldata tokens,
    uint256[] calldata amounts,
    bytes calldata params
) external nonReentrant
```
Executes a flash loan operation.

#### provideFlashLoanLiquidity
```solidity
function provideFlashLoanLiquidity(
    address token,
    uint256 amount
) external nonReentrant
```
Allows providers to add liquidity to reserves.

#### withdrawFlashLoanLiquidity
```solidity
function withdrawFlashLoanLiquidity(
    address token,
    uint256 amount
) external nonReentrant
```
Allows providers to withdraw their liquidity.

## Events

### ReserveInitialized
```solidity
event ReserveInitialized(address indexed token, uint256 fee);
```

### FlashLoan
```solidity
event FlashLoan(
    address indexed receiver,
    address indexed token,
    uint256 amount,
    uint256 fee
);
```

### LiquidityProvided
```solidity
event LiquidityProvided(address indexed token, uint256 amount);
```

### LiquidityWithdrawn
```solidity
event LiquidityWithdrawn(address indexed token, uint256 amount);
```

## Security Features
- ReentrancyGuard for all external functions
- SafeERC20 for token operations
- Access control via Ownable
- Fee caps to prevent excessive charges
- Liquidity provider whitelist

## Flash Loan Receiver Interface
Contracts receiving flash loans must implement:
```solidity
interface IFlashLoanReceiver {
    function executeOperation(
        address[] calldata assets,
        uint256[] calldata amounts,
        uint256[] calldata premiums,
        address initiator,
        bytes calldata params
    ) external returns (bool);
}
```

## Integration Examples

### Executing a Flash Loan
```javascript
const flashLoan = await DAFIFlashLoan.deployed();
await flashLoan.executeFlashLoan(
    receiverAddress,
    [tokenAddress],
    [amount],
    "0x"
);
```

### Providing Liquidity
```javascript
const flashLoan = await DAFIFlashLoan.deployed();
await flashLoan.provideFlashLoanLiquidity(tokenAddress, amount);
```

## Testing
Comprehensive tests are available in `/test/DAFIFlashLoan.test.js`.
