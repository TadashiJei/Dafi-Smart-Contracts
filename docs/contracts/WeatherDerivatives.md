# WeatherDerivatives Contract Documentation

## Overview
The WeatherDerivatives contract enables farmers to hedge against weather-related risks through blockchain-based weather derivatives. It uses oracle data to settle contracts based on weather conditions.

## Contract Details
- **Contract Name:** WeatherDerivatives
- **License:** MIT
- **Dependencies:** Chainlink, OpenZeppelin's SafeERC20, ReentrancyGuard, Ownable

## Key Features

### Weather Contract Types
```solidity
enum WeatherType {
    RAINFALL,
    TEMPERATURE,
    HUMIDITY,
    WIND_SPEED
}

struct WeatherContract {
    WeatherType weatherType;
    uint256 strikeValue;
    uint256 premium;
    uint256 payout;
    uint256 startTime;
    uint256 endTime;
    bool settled;
    address buyer;
}
```

### Oracle Integration
Uses Chainlink oracle network for reliable weather data:
```solidity
struct WeatherOracle {
    address oracle;
    bytes32 jobId;
    uint256 fee;
}
```

## Functions

### Contract Creation

#### createContract
```solidity
function createContract(
    WeatherType weatherType,
    uint256 strikeValue,
    uint256 premium,
    uint256 payout,
    uint256 duration
) external payable nonReentrant
```
Creates a new weather derivative contract.

### Contract Management

#### settleContract
```solidity
function settleContract(uint256 contractId) external nonReentrant
```
Settles a weather contract based on oracle data.

#### cancelContract
```solidity
function cancelContract(uint256 contractId) external nonReentrant
```
Cancels a contract before its start time.

### Oracle Management

#### updateOracle
```solidity
function updateOracle(
    WeatherType weatherType,
    address oracle,
    bytes32 jobId,
    uint256 fee
) external onlyOwner
```
Updates oracle settings for a weather type.

### View Functions

#### getContract
```solidity
function getContract(uint256 contractId)
    external
    view
    returns (WeatherContract memory)
```
Returns details of a specific contract.

#### getWeatherData
```solidity
function getWeatherData(
    WeatherType weatherType,
    uint256 timestamp
) external view returns (int256)
```
Gets historical weather data.

## Events

### ContractCreated
```solidity
event ContractCreated(
    uint256 indexed contractId,
    address indexed buyer,
    WeatherType weatherType,
    uint256 strikeValue,
    uint256 premium,
    uint256 payout
);
```

### ContractSettled
```solidity
event ContractSettled(
    uint256 indexed contractId,
    uint256 payout,
    int256 weatherValue
);
```

### ContractCancelled
```solidity
event ContractCancelled(
    uint256 indexed contractId,
    address indexed buyer
);
```

## Security Features
- ReentrancyGuard for all state-modifying functions
- Multiple oracle sources for data verification
- Premium and payout limits
- Time-based settlement restrictions
- Emergency pause mechanism

## Integration with Chainlink

### Oracle Request
```solidity
function requestWeatherData(
    WeatherType weatherType,
    uint256 timestamp
) internal returns (bytes32 requestId)
```

### Oracle Callback
```solidity
function fulfill(
    bytes32 _requestId,
    int256 _weatherValue
) external recordChainlinkFulfillment(_requestId)
```

## Integration Examples

### Creating a Weather Contract
```javascript
const derivatives = await WeatherDerivatives.deployed();
await derivatives.createContract(
    WeatherType.RAINFALL,
    strikeValue,
    premium,
    payout,
    duration,
    { value: premium }
);
```

### Settling a Contract
```javascript
const derivatives = await WeatherDerivatives.deployed();
await derivatives.settleContract(contractId);
```

## Risk Management
- Maximum contract size limits
- Minimum and maximum duration limits
- Premium to payout ratio requirements
- Oracle data validation
- Settlement delay period

## Testing
Comprehensive tests cover:
- Contract creation and settlement
- Oracle integration
- Edge cases and error conditions
- Security features

Tests are available in the test suite.
