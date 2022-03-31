// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

//@dev Account with mint and transfer HKD coin function

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CoinAcc {

    address public CoinOwner;
    address private m_tokenAddress;
    mapping(address => uint) public customerBalance; // We create a mapping named CustomerBalance with the keys being the wallet address of our customers and value the amount of Ether they deposit in Wei.
    //if we enter user account address , it will show their bank balance

   
    constructor(address tokenAddress) {
        CoinOwner = msg.sender;
        m_tokenAddress = tokenAddress; //let contract remember coin contract
    }
    
    function approve(uint256 intAmt) public { // set how much
        IERC20(m_tokenAddress).approve(address(this), intAmt); //1. construct ERC20 token (HKD coin) 2. call ERC20 contract 'approve' function 3. approve function 'parameter' in this contract address
    }
    
    function 
    
    function withdrawMoney (address payable _to, uint256 _total) public { //customer have to enter the wallet address and withdraw amount
        require (_total <= customerBalance[msg.sender], "You have insuffient funds to withdraw");// chseck if the account has sufficient amount of money to withdraw
        customerBalance[msg.sender] -= _total; // deduct the withdraw amount from customer's account balance
        _to.transfer(_total); // transfer money to customer's address
        //the transfer function is built into Solidity and transfers money to an address
    }
    
    function withdrawMoney() public {
        uint256 contractBal = IERC20(m_tokenAddress).balanceOf(address(this));
        IERC20(m_tokenAddress).transfer(CoinOwner, contractBal);    
    }    
