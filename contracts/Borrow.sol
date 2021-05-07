// SPDX-License-Identifier: MIT
pragma solidity 0.6.11;
pragma experimental ABIEncoderV2;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./interfaces/IProxy.sol";

/// @title A contract for the management of votes
/// @dev The contract can still be improved
contract Borrow is Ownable{
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
        uint16 proposalId;
    }


    struct LoanRequest {
        string description;
        uint voteCount;
        address receiver;
  //      uint amountRequest;
  //      bool state;
    }

//Variable

//    bool borrowOpen;
    WorkflowStatus public status;
    IProxy proxy;
    address public stacking;
    address public proxySimple;
    uint16 winningProposalId;
    address receiverAddress;


//Mapping
    mapping(address => Voter) public voters;
    /* mapping(address => uint) public debts;
    mapping(uint => address) public borrowers; // LoanRequest est un struct */

//Tableau
    LoanRequest[] public loans;

//Event
    event EntityRegistered(address[] soliAddress);
    event ProposalsRegistrationStarted();
    event ProposalsRegistrationEnded();
    event VotingSessionStarted();
    event VotingSessionEnded();
    event Voted(address entity, uint16 loanRequestId);
    event VotesTallied();
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event receiverAddressUpdated(address receiver);


//Constructor
    constructor(address _stacking, address _proxySimple) public onlyOwner{
        stacking=_stacking;
        proxy = IProxy(_proxySimple);

    }


    modifier isRegistred {
      require(voters[msg.sender].isRegistered == true, "unregistred");
      _;
    }



    /// @param _description receiver description of the project to fund and it address
    function registerLoanRequest(string memory _description, address receiver) public onlyOwner {
        require(status == WorkflowStatus.LoanRequestStarted, "Not allowed");
        LoanRequest memory loanR = LoanRequest(_description, 0, receiver);
        loans.push(loanR);
    }

    /// @notice Records the addresses of participants
    /// @dev Copy the array of users to the proxy, Error with Client call in ProxySimple.sol
    function setEntity() public onlyOwner {
      address[] memory copyTab = proxy.getAdrClients();

        for(uint16 i; i < copyTab.length; i++) {
          address _address = copyTab[i];
           voters[_address] = Voter(true,false,proxy.getUserDeposits(copyTab[i]),0);
          }
          emit EntityRegistered(copyTab);
        }



    /// @notice Function to vote, Id 0 for blank vote
    /// @dev For the moment we only vote once
    /// @param _proposalId Proxy address
    function addVote(uint16 _proposalId) external isRegistred {
        require(status == WorkflowStatus.VotingSessionStarted,"Not allowed");
        require(!voters[msg.sender].hasVoted, "Already voted");

        voters[msg.sender].hasVoted = true;
        voters[msg.sender].proposalId = _proposalId;

        emit Voted(msg.sender, _proposalId);

        loans[_proposalId].voteCount = loans[_proposalId].voteCount.add(voters[msg.sender].votingPower);
    }

  //function borrowMode



    /* function okLoans(uint _loanRequestId) external onlyOwner {
        //require (borrowOpen == true);
        require(status == WorkflowStatus.VotingSessionEnded, "Not allowed");
        //require(voteCount>((votingPowerTotal/2),"pas assez de vote pour vous");

        uint count;
<<<<<<< HEAD
        uint quorum = proxy.totalVotingPower().div(2);
=======
      //  uint quorum = ProxySimple(proxySimple).totalVotingPower.div(2);
>>>>>>> refs/remotes/origin/master
        for(uint i; i == loans.length; i++) {
            count = loans[i].voteCount;
            if( count <= quorum){
                loans[i].state = true;
            }
        }

        emit VotesTallied();
    } */

    function getVotersPower(address voter) external view returns(uint votingPower) {
       votingPower = voters[voter].votingPower;
    }

    function getVotersProp(address voter) external view returns(uint proposalId) {
       proposalId = voters[voter].proposalId;
    }

    function getWinningProposal() external onlyOwner returns (uint16 _proposalId) {
        require(status == WorkflowStatus.VotingSessionEnded, "Not allowed");
            uint winnerVoteCount = 0;
            uint challenger = 0;
            for (uint16 i; i < loans.length; i++) {
                if (loans[i].voteCount > winnerVoteCount) {
                    winnerVoteCount = loans[i].voteCount;
                    _proposalId = i;
                } else if (loans[i].voteCount == winnerVoteCount) {
                    challenger = i;
                }
            }
            winningProposalId = _proposalId;
            if(winnerVoteCount == loans[challenger].voteCount) {
                 winningProposalId = 0;
                 receiverAddress = stacking;
            }
            emit VotesTallied();
            receiverAddress = loans[winningProposalId].receiver;
            return winningProposalId;
          }

    /// @notice Change the current status
    /// @dev

    function nextStep() external onlyOwner {
        WorkflowStatus previousStatus = status;

        if (status == WorkflowStatus.RegisteringEntities) {
            status = WorkflowStatus.LoanRequestStarted;
            registerLoanRequest("none of following proposals",stacking);
            emit ProposalsRegistrationStarted();
        }
        else if (status == WorkflowStatus.LoanRequestStarted) {
            status = WorkflowStatus.LoanRequestEnded;
            emit ProposalsRegistrationEnded();
        }
        else if (status == WorkflowStatus.LoanRequestEnded) {
            status = WorkflowStatus.VotingSessionStarted;
            emit VotingSessionStarted();
        }
        else if (status == WorkflowStatus.VotingSessionStarted) {
            status = WorkflowStatus.VotingSessionEnded;
            emit VotingSessionEnded();
        }
        else {
            status = WorkflowStatus.VotesTallied;

        }

        emit WorkflowStatusChange(previousStatus, status);
    }

    function getWinningProposalId() external view returns(uint16){
      return winningProposalId;
    }

    function getReceiverAddress() external view returns(address){
      return receiverAddress;
    }

}
