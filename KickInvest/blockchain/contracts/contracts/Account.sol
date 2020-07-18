// SPDX-License-Identifier: AFL-1.1
pragma solidity ^0.5.16;

import "./Project.sol";
import "./Governor.sol";
import "./Transfer.sol";

contract Account {

    // Governor owner
    Governor private governor;
    address private owner;
    string private name;

    // list of all active contracts
    mapping(address => uint) investments;
    Project[] private investedProjects;
    Project[] private personalProjects;

    event NewProject(address creator, Project projectAddress);

    constructor (address _owner, string memory _name) public {
        governor = Governor(msg.sender);
        name = _name;
        owner = _owner;
    }

    modifier onlyGovernor {
        require(msg.sender == address(governor), "Only the governor is allowed to call this function");
        _;
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Only the account owner can call this function");
        _;
    }

    function invest(Project _project) external payable onlyOwner returns(bool) {
        _project.invest.value(msg.value)();
        if(investments[address(_project)] == 0) {
            investedProjects.push(_project);
        }

        investments[address(_project)] += msg.value;
        return true;
    }

    function initTransfer(Project _project, address payable _recipient, string memory _reason, uint _value) public onlyOwner returns(Transfer) {
        Transfer t = _project.initTransfer(_recipient, _reason, _value);
        return t;
    }

    function createProject(
        string memory _name,
        string memory _email,
        string memory _description, 
        string memory _img
        ) public onlyOwner returns(Project) {
        Project p = governor.createProject(_name, _email, _description, _img);
        personalProjects.push(p);

        emit NewProject(address(this), p);
        return p;
    }

    function voteAye(Transfer _transfer) public onlyOwner {
        _transfer.aye();
    }

    function voteNay(Transfer _transfer) public onlyOwner {
        _transfer.nay();
    }

    function removeVote(Transfer _transfer) public onlyOwner {
        _transfer.removeVote();
    }

    function checkVotes(Transfer _transfer) public onlyOwner {
        _transfer.checkVotes();
    }

    function removeTransfer(Transfer _transfer) public onlyOwner {
        _transfer.destroy();
    }

    function getInvestedProjects() public view returns(Project[] memory) {
        return investedProjects;
    }

    function getInvestedSum(address _project) public view returns(uint) {
        return investments[_project];
    }

    function getPersonalProjects() public view returns(Project[] memory) {
        return personalProjects;
    }

    function getName() public view returns(string memory) {
        return name;
    }

    function changeName(string memory _name) public onlyOwner returns(string memory) {
        name = _name;
        return _name;
    }
}