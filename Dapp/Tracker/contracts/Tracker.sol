// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

// Track User Transactions
// Track a user's transaction history using a mapping to an array of transaction details.

contract Tracker {
    struct Transaction {
        address receiver;
        uint amount;
        uint timestamp;
    }

    mapping(address => Transaction[]) transactions;

    function sendTransaction(address _receiver, uint _amount) public payable {
        //get useraddress
        //check user balance
        //send amount
        transactions[msg.sender].push(
            Transaction({
                receiver: _receiver,
                amount: _amount,
                timestamp: block.timestamp
            })
        );

        // Transfer the amount to the recipient
        payable(_receiver).transfer(_amount);
    }

    function getAllTransactions(
    ) public view returns (Transaction[] memory) {
        //Get Transaction List
        return transactions[msg.sender];
    }
}
