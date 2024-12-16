# DAFIPriceOracle Contract Documentation

## Overview
The DAFIPriceOracle contract provides reliable price feeds for agricultural commodities and tokens within the DAFI ecosystem. It aggregates data from multiple sources and implements security measures to ensure accurate pricing.

## Contract Details
- **Contract Name:** DAFIPriceOracle
- **License:** MIT
- **Dependencies:** Chainlink, OpenZeppelin's Ownable

## Key Features

### Price Feed Management
```solidity
struct PriceFeed {
    address feed;           // Chainlink feed address
    uint8 decimals;        // Price feed decimals
    bool active;           // Whether feed is active
    uint256 lastUpdate;    // Last update timestamp
}
```

### Data Sources
- Chainlink Price Feeds
- Authorized Price Providers
- Fallback Mechanisms

## Functions

### Administrative Functions

#### addPriceFeed
```solidity
function addPriceFeed(
    address asset,
    address feed,
    uint8 decimals
) external onlyOwner
```
Adds a new price feed for an asset.

#### updatePriceFeed
```solidity
function updatePriceFeed(
    address asset,
    address newFeed
) external onlyOwner
```
Updates an existing price feed.

#### addPriceProvider
```solidity
function addPriceProvider(address provider) external onlyOwner
```
Adds an authorized price provider.

### Price Functions

#### getPrice
```solidity
function getPrice(address asset) external view returns (uint256)
```
Gets the latest price for an asset.

#### getPriceWithUpdate
```solidity
function getPriceWithUpdate(address asset) external returns (uint256)
```
Forces a price update and returns the latest price.

#### updatePrice
```solidity
function updatePrice(
    address asset,
    uint256 price
) external onlyPriceProvider
```
Allows authorized providers to update prices.

## Events

### PriceFeedAdded
```solidity
event PriceFeedAdded(
    address indexed asset,
    address indexed feed,
    uint8 decimals
);
```

### PriceFeedUpdated
```solidity
event PriceFeedUpdated(
    address indexed asset,
    address indexed oldFeed,
    address indexed newFeed
);
```

### PriceUpdated
```solidity
event PriceUpdated(
    address indexed asset,
    uint256 price,
    address indexed provider
);
```

## Security Features
- Multiple data sources for redundancy
- Staleness checks for price feeds
- Authorized provider system
- Price deviation checks
- Heartbeat monitoring

## Price Provider Interface
```solidity
interface IPriceProvider {
    function getLatestPrice(address asset) external view returns (uint256);
    function updatePrice(address asset) external returns (uint256);
}
```

## Integration Examples

### Getting Asset Price
```javascript
const oracle = await DAFIPriceOracle.deployed();
const price = await oracle.getPrice(assetAddress);
```

### Adding Price Feed
```javascript
const oracle = await DAFIPriceOracle.deployed();
await oracle.addPriceFeed(
    assetAddress,
    chainlinkFeedAddress,
    decimals
);
```

### Updating Price as Provider
```javascript
const oracle = await DAFIPriceOracle.deployed();
await oracle.updatePrice(assetAddress, newPrice);
```

## Configuration
- Minimum update interval: 1 hour
- Maximum price deviation: 10%
- Staleness threshold: 24 hours

## Error Handling
- Reverts on stale prices
- Reverts on excessive price deviations
- Fallback to secondary sources on primary source failure

## Testing
The oracle contract includes extensive tests covering:
- Price feed management
- Price updates and queries
- Security features
- Error conditions
- Edge cases

Tests are available in the test suite.
