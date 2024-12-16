# DAFI Installation Guide

## Prerequisites
- Node.js (v14 or later)
- npm or yarn
- Git

## Installation Steps

### 1. Clone the Repository
```bash
git clone https://github.com/TadashiJei/dafi.git
cd dafi
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Set Up Environment Variables
Create a `.env` file in the root directory:
```env
INFURA_PROJECT_ID=your_infura_project_id
PRIVATE_KEY=your_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 4. Compile Contracts
```bash
npx hardhat compile
```

### 5. Run Tests
```bash
npx hardhat test
```

### 6. Deploy Contracts
```bash
npx hardhat run scripts/deploy.js --network <network_name>
```

## Network Configuration
The project supports multiple networks. Configure them in `hardhat.config.js`:

```javascript
module.exports = {
  networks: {
    hardhat: {
      // ...
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: [process.env.PRIVATE_KEY]
    },
    // Add other networks as needed
  }
};
```

## Development Environment

### Local Node
Run a local node for development:
```bash
npx hardhat node
```

### Console
Access the Hardhat console:
```bash
npx hardhat console --network localhost
```

## Verification
Verify contracts on Etherscan:
```bash
npx hardhat verify --network mainnet DEPLOYED_CONTRACT_ADDRESS "Constructor Arg 1" "Constructor Arg 2"
```

## Troubleshooting

### Common Issues

1. **Compilation Errors**
   ```bash
   npm install --save-dev @openzeppelin/contracts
   ```

2. **Network Issues**
   - Check your network configuration
   - Ensure you have sufficient funds
   - Verify RPC endpoint is accessible

3. **Gas Issues**
   - Adjust gas settings in `hardhat.config.js`
   - Check network gas prices
   - Use gas estimation tools

## Security

### Key Management
- Never commit private keys
- Use environment variables
- Consider using hardware wallets for production

### Best Practices
- Run extensive tests
- Use proven libraries
- Follow security patterns
- Conduct audits before mainnet deployment

## Support
For additional support:
- Create an issue in the GitHub repository
- Join our Discord community
- Check the documentation
