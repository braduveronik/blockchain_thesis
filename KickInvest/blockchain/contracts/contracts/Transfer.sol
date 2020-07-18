// SPDX-License-Identifier: AFL-1.1
pragma solidity ^0.5.16;

import "./Project.sol";

contract Transfer {
    enum VoteType {NONE, AYE, NAY}
    enum TransferResult {PENDING, SUCCESS, REJECTED}

    // origin project
    Project public project;
    // recipient for this money
    address payable public recipient;
    // value of transfer
    uint256 public value;
    // Reason of transfer
    string public reason;

    TransferResult public result;

    // Mapping of votes
    mapping(address => VoteType) public votes;
    uint256 public voteNumber;
    // mapping(VoteType => uint) public voteByCategory;
    mapping(uint256 => uint256) public voteByCategory;

    event TransferStatus(TransferResult result);
    event NewVote(address caster);

    function getValueFor(VoteType voteCategory) public pure returns (uint256) {
        return uint256(voteCategory);
    }

    /*
        Transfer Constructor
        @param _project     the project that initiates the transfer
        @param _recipient   account to receive the transfer
        @param _reason      string stating the transfer reason
        @param _investors   list of all investors able to vote
     */
    constructor(
        Project _project,
        address payable _recipient,
        string memory _reason
    ) public {
        project = _project;
        recipient = _recipient;
        reason = _reason;
        value = 0;
        voteNumber = 0;
        result = TransferResult.PENDING;
    }

    modifier onlyProject {
        require(
            msg.sender == address(project),
            "Function can be called only by the project"
        );
        _;
    }

    modifier onlyInvestor {
        require(
            project.isInvestor(msg.sender),
            "Function can be called only by investors"
        );
        _;
    }

    modifier onlyOwner {
        require(
            project.isOwner(msg.sender),
            "Function can be called only by owner"
        );
        _;
    }

    function deposit() public payable onlyProject {
        require(value == 0, "Function can be called only at initialization");
        value = msg.value;
    }

    /*
        Cast vote
        @param _vote        vote type to cast
    */
    function vote(VoteType _vote) private {
        if (votes[msg.sender] == VoteType.NONE) {
            voteNumber++;
            voteByCategory[getValueFor(_vote)]++;
        } else {
            voteByCategory[getValueFor(votes[msg.sender])]--;
            voteByCategory[getValueFor(_vote)]++;
        }
        votes[msg.sender] = _vote;
        emit NewVote(msg.sender);
    }

    function checkVotes() public onlyOwner {
        // Verifica daca au votat mai mult de 50% din investitori.
        uint investorNumber = project.getNumberOfInvestors();
        if (
            voteByCategory[getValueFor(VoteType.AYE)] >=
            ( investorNumber / 2 + 1)
        ) {
            doTransfer();
        }
        else if (
            voteByCategory[getValueFor(VoteType.NAY)] >=
            ( investorNumber / 2 + 1)
        ) {
            doRefund();
        }

        emit TransferStatus(result);
    }

    function doTransfer() private {
        // Transfera banii din Transfer la recipient
        recipient.transfer(value);
        result = TransferResult.SUCCESS;
    }

    function doRefund() private {
        result = TransferResult.REJECTED;
        // address(uint160(address(project))).transfer(value);
        project.refund.value(value)();
        // selfdestruct(address(uint160(address(project))));
    }

    /*
        Cast aye vote (pro vote)
    */
    function aye() external onlyInvestor {
        vote(VoteType.AYE);
    }

    /*
        Cast aye vote (pro vote)
    */
    function nay() external onlyInvestor {
        vote(VoteType.NAY);
    }

    function destroy() external onlyOwner {
        doRefund();
        emit TransferStatus(result);
    }

    /*
        Remove vote
    */
    function removeVote() external onlyInvestor {
        vote(VoteType.NONE);
    }

    function getAyeVotes() public view returns(uint) {
        return voteByCategory[getValueFor(VoteType.AYE)];
    }

    function getNayVotes() public view returns(uint) {
        return voteByCategory[getValueFor(VoteType.NAY)];
    }

    function getNumberOfVotes() public view returns(uint) {
        return voteNumber;
    }

    function getTransferResult() public view returns(TransferResult) {
        return result;
    }

    function getVote(address _account) public view returns(VoteType) {
        return votes[_account];
    }
}
