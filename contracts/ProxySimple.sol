// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract ProxySimple is Ownable{
using SafeMath for uint;

// Structure Client

    struct Client {
        bool lister;
        uint dayLock;
        uint amount;
        uint depositData;
        uint withdrawalPending;
    }

// Mapping

    mapping (address => Client) public User;

    // client
    mapping (uint => address) public backToUser;

// Variable

    // Taux d'interet
    uint apy = 5 ;

    // Somme Global disponible prêt à payer
    uint totalWithdrawalAmount;

    uint totalVotingPower;

// Tableaux Client

    Client[] public clients;

// Event

     event valideDepot(address client, uint amount);
     event authorizedWithdrawal(address client, uint amount);

// Function déposer des fonds - parametre nombre de jours bloqué =>(nb_dayLock) et le amount

    function deposite (uint nb_dayLock, uint amount)  public payable  {

    // Initialisation d'un variable à "now"
    uint depositData = uint(block.timestamp);

    // Enregistrement(blockChain) dans le Tableau Client
    Client memory _client ;

    // Variable _client = aux params(struct)
    _client = Client(true, nb_dayLock, amount, depositData,0);

    // Push les elements dans le Client[] public clients;
    clients.push(_client);
    uint Id = clients.length.sub(1);
    User[msg.sender]=clients[Id];
    backToUser[Id] = msg.sender;

    // Validation de l'event
    emit valideDepot(msg.sender, amount);

    // Maj des amount de dépôt
    totalVotingPower= totalVotingPower.add(amount);
  }

// Function demande de retrait - parametre amount souhaitant retirer

    function withdrawPending (uint withdrawalAmount) public payable {

    // Verification du DayLock
        uint minWithdrawalDate =User[msg.sender].depositData.add(User[msg.sender].dayLock);
        require(minWithdrawalDate <= uint(block.timestamp),"deadlines for blocking funds not elapsed");

    // Calcule du amount des interets disponible + le amount de depot initial = amount Total Disponible à l'instanté
        uint depositTime = uint(block.timestamp) - User[msg.sender].depositData;
        uint interestAmount = ((depositTime.mul(100).div(315360000)).mul(apy).mul(User[msg.sender].amount).mul(100)).div(100);
        uint amountTotal = User[msg.sender].amount.add(interestAmount);

        require(withdrawalAmount <=  amountTotal);

    // Maj du amount Global Payement
        totalWithdrawalAmount = totalWithdrawalAmount.add(withdrawalAmount);

    // Validation de l'event
        emit authorizedWithdrawal(msg.sender, withdrawalAmount);

    // Maj des amount de dépôt
       totalVotingPower= totalVotingPower.sub(User[msg.sender].amount);
  }

  function getClients() external view returns(Client[] memory) {
    return clients;
  }

// Function de Retrait

    function Withdraw (IERC20 _address) public payable onlyOwner {

    uint aPayer;
    address userRefund;
    uint length = clients.length;
    // recherche de tous les clients ayant fait une demande de retrait
    for(uint i; i == length ; i++) {
      aPayer = clients[i].withdrawalPending;
      userRefund = backToUser[i];

      IERC20(_address).transferFrom(msg.sender, userRefund, aPayer);

    //Maj du totalWithdrawalAmount
    totalWithdrawalAmount = totalWithdrawalAmount.sub(aPayer);
    clients[i].withdrawalPending = 0;
    }
  }
}
