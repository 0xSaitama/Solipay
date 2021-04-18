pragma solidity 0.6.11;
pragma experimental ABIEncoderV2;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./ProxySimple.sol";

/// @title A contract for the management of votes
/// @dev The contract can still be improved
contract Loan is ProxySimple {
    using SafeMath for uint;

//Enum
    enum WorkflowStatus {
        RegisteringEntities,
        LoanRequestStarted,
        LoanRequestEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

//Struct
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votingPower;
        uint loanRequestID;
    }


    struct LoanRequest {
        string description;
        uint voteCount;
        uint amountRequest;
        bool state;
    }

//Variable
    uint numberOfLoanRequest;
    uint numberOfEntity;
    bool borrowOpen;
    WorkflowStatus public status;
    //uint coffre;

//Mapping
    mapping(address => Voter) public voters;
    mapping(address => uint) public debts;
    mapping(uint => address) public borrowers; // LoanRequest est un struct

//Tableau
    Voter[] public votes;
    LoanRequest[] public loans;

//Event
    event EntityRegistered(address entitiesAddress);
    event LoanRequestRegistrationStarted();
    event LoanRequestRegistrationEnded();
    event LoanRequestRegistered(uint loanRequestId);
    event VotingSessionStarted();
    event VotingSessionEnded();
    event Voted (address entity, uint loanRequestId);
    event VotesTallied();
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);

//Function


    /// @notice Records loan requests
    /// @dev
    /// @param _description Borrower motivation
    /// @param _amount Amount requested
    function registerLoanRequest(string memory _description, uint _amount) external {

        require(status == WorkflowStatus.LoanRequestStarted, "Not allowed");
        require(voters[msg.sender].isRegistered,"You are not registred");

        LoanRequest memory loanR = LoanRequest(_description, 0, _amount, false);
        loans.push(loanR);

        uint loanRequestId = loans.length.sub(1);
        borrowers[loanRequestId] = msg.sender;
    }

    /// @notice Records the addresses of participants
    /// @dev Copy the array of users to the proxy, Error with Client call in ProxySimple.sol
    /// @param _addr proxy address
    function setEntity(address _addr) public onlyOwner {
      Client[] memory copyTab = ProxySimple(_addr).getClients();

        for(uint i; i == copyTab.length; i++) {
            votes[i] = Voter(true,false,copyTab[i].amount,0);
            address voterAddr = ProxySimple(_addr).backToUser(i); //backToUser est un getter dans ce contrat(borrow)
            voters[voterAddr] = votes[i];
        }
    }

    /// @notice Function to vote, Id 0 for blank vote
    /// @dev For the moment we only vote once
    /// @param _loanRequestId Proxy address
    function vote(uint _loanRequestId) external {
        require(status == WorkflowStatus.VotingSessionStarted, "Not allowed");
        require(voters[msg.sender].isRegistered,"You are not registred");
        require(!voters[msg.sender].hasVoted, "Already voted");

        voters[msg.sender].hasVoted = true;
        voters[msg.sender].loanRequestID = _loanRequestId;

        emit Voted(msg.sender, _loanRequestId);

        loans[_loanRequestId].voteCount = loans[_loanRequestId].voteCount.add(voters[msg.sender].votingPower);
    }

  //function borrowMode
  //( change le bool)

    /// @notice See if the loan is possible
    /// @dev For the moment we only vote once
    /// @param _loanRequestId of the loan request

    function okLoans(uint _loanRequestId) external onlyOwner {
        //require (borrowOpen == true);
        require(status == WorkflowStatus.VotingSessionEnded, "Not allowed");
        //require(voteCount>((votingPowerTotal/2),"pas assez de vote pour vous");

        uint count;
        uint quorum = ProxySimple.totalVotingPower.div(2);
        for(uint i; i == loans.length; i++) {
            count = loans[i].voteCount;
            if( count <= quorum){
                loans[i].state = true;
            }
        }

        emit VotesTallied();
    }

    /// @notice Change the current status
    /// @dev

    function changeToNextStatus() external onlyOwner {
        WorkflowStatus previousStatus = status;

        if (status == WorkflowStatus.RegisteringEntities) {
            status = WorkflowStatus.LoanRequestStarted;
        }
        else if (status == WorkflowStatus.LoanRequestStarted) {
            status = WorkflowStatus.LoanRequestEnded;
        }
        else if (status == WorkflowStatus.LoanRequestEnded) {
            status = WorkflowStatus.VotingSessionStarted;
        }
        else if (status == WorkflowStatus.VotingSessionStarted) {
            status = WorkflowStatus.VotingSessionEnded;
        }
        else {
            status = WorkflowStatus.VotesTallied;
        }

        emit WorkflowStatusChange(previousStatus, status);
    }
}
