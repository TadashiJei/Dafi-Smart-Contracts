// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../DAFIFlashLoan.sol";

contract MockFlashLoanReceiver {
    using SafeERC20 for IERC20;
    
    DAFIFlashLoan public immutable FLASH_LOAN;
    bool public shouldRepay;

    constructor(address flashLoan) {
        FLASH_LOAN = DAFIFlashLoan(flashLoan);
        shouldRepay = true;
    }

    function executeOperation(
        address[] calldata assets,
        uint256[] calldata amounts,
        uint256[] calldata premiums,
        address initiator,
        bytes calldata params
    ) external returns (bool) {
        require(msg.sender == address(FLASH_LOAN), "Unauthorized");
        
        if (shouldRepay) {
            // Approve and repay
            for (uint256 i = 0; i < assets.length; i++) {
                uint256 amountToRepay = amounts[i] + premiums[i];
                IERC20(assets[i]).safeIncreaseAllowance(address(FLASH_LOAN), amountToRepay);
            }
            return true;
        }
        return false;
    }

    function setShouldRepay(bool _shouldRepay) external {
        shouldRepay = _shouldRepay;
    }

    // Function to handle direct token transfers
    function onTokenTransfer(address token, uint256 amount) external {
        IERC20(token).safeIncreaseAllowance(address(FLASH_LOAN), amount);
    }
}
