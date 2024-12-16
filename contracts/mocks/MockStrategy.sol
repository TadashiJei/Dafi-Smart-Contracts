// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockStrategy is Ownable {
    IERC20 public immutable token;
    uint256 public totalInvestedAmount;
    uint256 public constant PROFIT_RATE = 100; // 1% profit per harvest

    constructor(address _token) {
        token = IERC20(_token);
    }

    function invest(uint256 amount) external {
        require(
            token.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        totalInvestedAmount += amount;
    }

    function withdraw(uint256 amount) external {
        require(amount <= totalInvestedAmount, "Insufficient balance");
        totalInvestedAmount -= amount;
        require(token.transfer(msg.sender, amount), "Transfer failed");
    }

    function harvest() external returns (uint256) {
        uint256 profit = totalInvestedAmount * PROFIT_RATE / 10000;
        // Simulate profit generation
        require(token.transfer(msg.sender, profit), "Profit transfer failed");
        return profit;
    }

    function totalInvested() external view returns (uint256) {
        return totalInvestedAmount;
    }

    function emergencyWithdraw() external {
        uint256 balance = token.balanceOf(address(this));
        if (balance > 0) {
            require(token.transfer(msg.sender, balance), "Transfer failed");
        }
        totalInvestedAmount = 0;
    }
}
