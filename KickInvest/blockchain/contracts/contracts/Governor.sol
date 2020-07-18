// SPDX-License-Identifier: AFL-1.1
pragma solidity ^0.5.16;

import "./Project.sol";
import "./Account.sol";

contract Governor {

    // Governor owner
    address public owner;

    event NewProject(address creator, Project projectAddress);
    event NewAccount(address creator, Account accountAddress);

    // list of all active contracts
    Project[] public projectList;

    // list of all active accounts
    mapping(address => Account) private accountList;

    constructor () public {
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Only the owner is allowed to call this function");
        _;
    }

    modifier onlyAccount {
        require(accountList[msg.sender] != Account(0), "Only a registered account is allowed to call this function");
        _;
    }

    function createProject(
        string memory _name,
        string memory _email,
        string memory _description, 
        string memory _img
        ) public returns(Project) {
        Project p = new Project(msg.sender, _name, _email, _description, _img);
        projectList.push(p);
        emit NewProject(msg.sender, p);
        return p;
    }

    function createAccount(string memory _name) public returns(Account) {
        Account a = new Account(msg.sender, _name);
        accountList[msg.sender] = a;
        emit NewAccount(msg.sender, a);
        return a;
    }

    function getProjects() public view returns(Project[] memory) {
        return projectList;
    }

    function getAccount(address _address) public view returns(Account) {
        return accountList[_address];
    }
}