// SPDX-License-Identifier: MIT
pragma solidity 0.6.11;
pragma experimental ABIEncoderV2;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./interfaces/IProxy.sol";

/// @title A contract for the management of votes
/// @dev The contract can still be improved
contract Loan is Ownable{
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
        uint proposalId;
    }


    struct LoanRequest {
        string description;
        uint voteCount;
        address receiver;
  //      uint amountRequest;
  //      bool state;
    }

//Variable
    /* uint numberOfLoanRequest;
    uint numberOfEntity; */
//    bool borrowOpen;
    WorkflowStatus public status;
    IProxy proxy;
    address public stacking;
    address public proxySimple;
    uint winningProposalId;
    address receiverAddress;


//Mapping
    mapping(address => Voter) public voters;
    /* mapping(address => uint) public debts;
    mapping(uint => address) public borrowers; // LoanRequest est un struct */

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


//Constructor
    constructor(address _stacking, address _proxySimple) public onlyOwner{
        stacking=_stacking;
        proxy = IProxy(_proxySimple);

    }


//Function



    /// @param _description receiver description of the project to fund and it address
    function registerLoanRequest(string memory _description, address receiver) public onlyOwner {


        require(status == WorkflowStatus.LoanRequestStarted, "Not allowed");
        require(voters[msg.sender].isRegistered,"You are not registred");

        LoanRequest memory loanR = LoanRequest(_description, 0, receiver);
        loans.push(loanR);

    //    uint proposalId = loans.length.sub(1);
    //    borrowers[loanRequestId] = msg.sender;
    }

    /// @notice Records the addresses of participants
    /// @dev Copy the array of users to the proxy, Error with Client call in ProxySimple.sol
    /// @param _addr proxy address
    function setEntity(address _addr) public onlyOwner {
      address[] memory copyTab = proxy.getAdrClients();

        for(uint i; i == copyTab.length; i++) {
           votes[i] = Voter(true,false,proxy.getUserDeposits(copyTab[i]),0);
            address voterAddr = copyTab[i];

          }
        }



    /// @notice Function to vote, Id 0 for blank vote
    /// @dev For the moment we only vote once
    /// @param _proposalId Proxy address
    function vote(uint _proposalId) external {
        require(status == WorkflowStatus.VotingSessionStarted, "Not allowed");
        require(voters[msg.sender].isRegistered,"You are not registred");
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

    function getWinningProposal() private onlyOwner returns (uint _proposalId) {
        require(status == WorkflowStatus.VotingSessionEnded);
            uint winnerVoteCount = 0;
            uint challenger = 0;
            for (uint i = 0; i < loans.length; i++) {
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
            }
            emit VotesTallied();
            return winningProposalId;
          }

    /// @notice Change the current status
    /// @dev

    function changeToNextStatus() external onlyOwner {
        WorkflowStatus previousStatus = status;

        if (status == WorkflowStatus.RegisteringEntities) {
            status = WorkflowStatus.LoanRequestStarted;
            registerLoanRequest("none of following proposals",stacking);
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


    function setWiningAddress() external onlyOwner {
      require(status == WorkflowStatus.VotesTallied);
      receiverAddress = loans[winningProposalId].receiver;
    }

}
