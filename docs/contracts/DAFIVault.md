# DAFIVault Contract Documentation

## Overview
The DAFIVault contract is a yield-generating vault that manages user deposits and implements various investment strategies to maximize returns while maintaining security.

## Contract Details
- **Contract Name:** DAFIVault
- **License:** MIT
- **Dependencies:** OpenZeppelin's SafeERC20, ReentrancyGuard, Ownable

## Key Features

### Strategy Management
The vault can allocate funds across multiple yield-generating strategies:
```solidity
struct Strategy {
    uint256 allocation;  // Percentage allocation (base 10000)
    uint256 lastReport;  // Timestamp of last report
    bool active;         // Whether strategy is active
}
```

### Fee System
```solidity
uint256 public withdrawalFee;     // Fee taken on withdrawals
uint256 public performanceFee;    // Fee on harvested yields
uint256 public constant MAX_FEE = 1000;  // 10% maximum fee
```

## Functions

### Administrative Functions

#### addStrategy
```solidity
function addStrategy(address strategy, uint256 allocation) external onlyOwner
```
Adds a new yield-generating strategy.

#### updateStrategyAllocation
```solidity
function updateStrategyAllocation(
    address strategy,
    uint256 newAllocation
) external onlyOwner
```
Updates a strategy's allocation percentage.

#### setWithdrawalFee
```solidity
function setWithdrawalFee(uint256 newFee) external onlyOwner
```
Updates the withdrawal fee.

#### setPerformanceFee
```solidity
function setPerformanceFee(uint256 newFee) external onlyOwner
```
Updates the performance fee.

### User Functions

#### deposit
```solidity
function deposit(uint256 amount) external nonReentrant
```
Deposits tokens into the vault.

#### withdraw
```solidity
function withdraw(uint256 shares) external nonReentrant
```
Withdraws tokens from the vault.

### Strategy Functions

#### harvest
```solidity
function harvest() external nonReentrant
```
Harvests yields from all active strategies.

### Emergency Functions

#### emergencyWithdraw
```solidity
function emergencyWithdraw() external nonReentrant
```
Emergency withdrawal in case of critical issues.

## Events

### StrategyAdded
```solidity
event StrategyAdded(address indexed strategy, uint256 allocation);
```

### StrategyUpdated
```solidity
event StrategyUpdated(address indexed strategy, uint256 newAllocation);
```

### Deposit
```solidity
event Deposit(address indexed user, uint256 amount, uint256 shares);
```

### Withdraw
```solidity
event Withdraw(address indexed user, uint256 amount, uint256 shares);
```

### Harvest
```solidity
event Harvest(uint256 profit, uint256 loss, uint256 performanceFee);
```

## Security Features
- ReentrancyGuard for all state-modifying functions
- SafeERC20 for token operations
- Maximum fee caps
- Emergency withdrawal mechanism
- Strategy allocation limits

## Strategy Interface
Strategies must implement:
```solidity
interface IStrategy {
    function invest(uint256 amount) external;
    function withdraw(uint256 amount) external;
    function harvest() external returns (uint256 profit, uint256 loss);
    function totalAssets() external view returns (uint256);
}
```

## Integration Examples

### Depositing Tokens
```javascript
const vault = await DAFIVault.deployed();
await vault.deposit(amount);
```

### Withdrawing Tokens
```javascript
const vault = await DAFIVault.deployed();
await vault.withdraw(shares);
```

### Adding a Strategy
```javascript
const vault = await DAFIVault.deployed();
await vault.addStrategy(strategyAddress, allocation);
```

## Testing
Comprehensive tests are available in `/test/DAFIVault.test.js`.
