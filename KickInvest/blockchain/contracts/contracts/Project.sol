// SPDX-License-Identifier: AFL-1.1
pragma solidity ^0.5.16;

import "./Transfer.sol";

contract Project {
    address private governor;

    address public owner;
    string public name;
    string public email;
    string public img;
    string public description;
    uint256 public account;
    uint256 private numberOfInvestors;

    mapping(address => uint256) public investors;
    Transfer[] public transfers;

    event NewInvestor(address investor);
    event NewTransfer(address investor, Transfer transferAddress);

    constructor(
        address _owner,
        string memory _name,
        string memory _email,
        string memory _description,
        string memory _img
    ) public {
        governor = msg.sender;
        owner = _owner;
        name = _name;
        email = _email;
        description = _description;
        img = _img;
        account = 0;
        numberOfInvestors = 0;
    }

    modifier onlyGovernor {
        require(
            msg.sender == governor,
            "Only the governor can call this function"
        );
        _;
    }

    modifier onlyOwner {
        require(
            msg.sender == owner,
            "Only the project owner can call this function"
        );
        _;
    }

    modifier onlyInvestor {
        require(
            investors[msg.sender] > 0,
            "Only an investor can call this function"
        );
        _;
    }

    function internalInvest(address investor) private {
        if (investors[investor] == 0) {
            numberOfInvestors++;
        }
        investors[investor] += msg.value;
        account += msg.value;
        emit NewInvestor(investor);
    }

    function investFromAccount(address investor) external payable {
        internalInvest(investor);
    }

    function invest() public payable {
        internalInvest(msg.sender);
    }

    function initTransfer(
        address payable _recipient,
        string memory _reason,
        uint256 value
    ) public onlyOwner returns (Transfer) {
        require(account >= value, "Not enough money");
        Transfer t = new Transfer(this, _recipient, _reason);
        t.deposit.value(value)();
        transfers.push(t);
        account -= value;

        // Emit NewTransfer log
        emit NewTransfer(msg.sender, t);
        return t;
    }

    /*
        Check if address is investor able to vote
        @param _wallet      address of account to check
    */
    function isInvestor(address _wallet) public view returns (bool) {
        return investors[_wallet] > 0 ? true : false;
    }

    function isOwner(address _address) public view returns (bool) {
        return (_address == owner);
    }

    function getNumberOfInvestors() public view returns (uint256) {
        return numberOfInvestors;
    }

    function getTransfers() public view returns (Transfer[] memory) {
        return transfers;
    }

    function receive() external payable {
        account += msg.value;
    }

    function refund() external payable {
        account += msg.value;
    }
}
