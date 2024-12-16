# Smart Contract Guide

This guide provides an overview of the smart contracts created for the DAFI platform.

## CropToken.sol

This contract implements a basic ERC20 token representing ownership of a specific crop yield.

### Features:

*   **Mintable:** The owner can mint new tokens.
*   **Burnable:** Users can burn their own tokens.
*   **Initial Supply:** The contract is initialized with a fixed initial supply.

### Usage:

This token can be used to represent ownership of a specific crop yield from a particular farm.

## DerivativeContract.sol

This contract implements a simple derivative contract based on the price of the `CropToken`.

### Features:

*   **Strike Price:** The price at which the derivative is settled.
*   **Expiration Time:** The time at which the derivative expires.
*   **Settlement:** The owner can settle the derivative after the expiration time.

### Usage:

This contract can be used to create options or futures contracts on crop yields, allowing investors to hedge against price fluctuations and farmers to manage risk.

## InsuranceToken.sol

This contract implements a simple insurance token that pays out if a certain condition is met.

### Features:

*   **Claimable:** The owner can set the insurance to be claimable.
*   **Payout:** Users can claim a fixed payout if the insurance is claimable.
*   **Mintable:** The owner can mint new tokens.

### Usage:

This contract can be used to create insurance tokens that cover crop losses due to unforeseen events.

## How to Use These Contracts

1.  **Deploy:** Deploy these contracts to a compatible blockchain network (e.g., Ethereum, Polygon).
2.  **Interact:** Interact with the contracts using a tool like Remix or Truffle.
3.  **Integrate:** Integrate these contracts into your application to enable tokenization, derivatives, and insurance features.

**Note:** These contracts are simplified examples and may need to be modified for production use.
