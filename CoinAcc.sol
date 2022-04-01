// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

//@dev Account with mint and transfer HKD coin function

import "@openzeppelin/contracts/access/Ownable.sol";
import "./HKD.sol";
contract CoinAcc is Context, IERC20, HKD {
    event tokensMinted(address indexed owner, uint256 amount, string message);
    event additionalTokensMinted(address indexed owner,uint256 amount,string message);

    mapping (address=>user)users;
    mapping (address => uint) public balances;

    struct user{        
        address userId;
        string  mnemonic_phrase;
        bool isExist;
    }
    function userRegister(address userId,string memory mnemonic_phrase) public {
            require(users[userId].isExist==false,"User details already registered and cannot be altered");
            users[userId]=user(userId,mnemonic_phrase,true);
    }
    constructor(string memory _name, string memory _symbol) ERC20(_name, _symbol) {
        _issue(msg.sender, 1000 * 10**decimals());
        emit tokensMinted(msg.sender, 1000 * 10**decimals(), "Initial supply of tokens minted.");
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
        emit additionalTokensMinted(msg.sender, amount, "Additional tokens minted.");
    }

}
