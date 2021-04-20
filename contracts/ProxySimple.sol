// SPDX-License-Identifier: MIT
pragma solidity 0.6.11;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract ProxySimple is Ownable{
using SafeMath for uint;

// Structure Client

    struct Client {
        bool lister;
        uint[] amounts;
        uint[] depositData;
        uint totalDeposit;
        uint withdrawalPending;
    }

// Mapping

    mapping (address => Client) public User;

    // client
    mapping (uint => address) public backToUser;

// Variable

    // Taux d'interet
    uint apy = 5 ;
    uint dayLock = 100 days;
    // Somme Global disponible prêt à payer
    uint totalWithdrawalAmount;

    uint totalVotingPower;

// Tableaux Client

    address[] public adrClients;

// Event

     event valideDepot(address client, uint amount);
     event authorizedWithdrawal(address client, uint amount);

// Function déposer des fonds - parametre nombre de jours bloqué =>(nb_dayLock) et le amount

    function deposite (uint amount)  public payable  {
        uint depositDate = uint(block.timestamp);

        User[msg.sender].amounts.push(amount);
        User[msg.sender].depositData.push(depositDate);
        User[msg.sender].totalDeposit = getVotingPower(msg.sender);

        if (User[msg.sender].lister == false) {
            adrClients.push(msg.sender);
            User[msg.sender].lister = true;
        }

        // Validation de l'event
        emit valideDepot(msg.sender, amount);
        // Maj des amount de dépôt
        totalVotingPower= totalVotingPower.add(amount);
  }


    function getVotingPower(address owner) internal view returns(uint) {
      uint length = User[owner].amounts.length;
      uint amountTotal;
      for (uint i; i == length; i++) {
        amountTotal = amountTotal.add(User[owner].amounts[i]);
      }
      return amountTotal;
    }
// Function demande de retrait - parametre amount souhaitant retirer

    function withdrawPending (uint withdrawalAmount) public payable {
        uint minWithdrawalDate;
        uint withdrawable;
        uint length = User[msg.sender].depositData.length;
        for(uint i; i == length ; i++) {
          minWithdrawalDate = User[msg.sender].depositData[i].add(dayLock);
          if (minWithdrawalDate < uint(block.timestamp)) {
           withdrawable = i;
          } else {
            require(User[msg.sender].depositData[0].add(dayLock) <= uint(block.timestamp), "withdraw deadline is not reached");
          }
        }

        uint withdrawableTotal;
    // Calcule du amount des interets disponible + le amount de depot initial = amount Total Disponible à l'instanté
    for (uint i ; i == withdrawable ; i++) {
        uint depositTime = uint(block.timestamp) - User[msg.sender].depositData[i];
        uint interestAmount = ((depositTime.mul(100).div(315360000)).mul(apy).mul(User[msg.sender].amounts[i]).mul(100)).div(100);
        uint amountTotal = User[msg.sender].amounts[i].add(interestAmount);
        withdrawableTotal = withdrawableTotal.add(amountTotal);
      }
        require(withdrawalAmount <=  withdrawableTotal);

    // Maj du amount Global Payement
        totalWithdrawalAmount = totalWithdrawalAmount.add(withdrawalAmount);

    // Validation de l'event
        emit authorizedWithdrawal(msg.sender, withdrawalAmount);

    // Maj des amount de dépôt
       totalVotingPower= totalVotingPower.sub(withdrawalAmount);
  }

  function getAdrClients() external view returns(address[] memory) {
    return adrClients;
  }

  function getUser(address adr) external view returns(Client memory) {
    return User[adr];
  }
// Function de Retrait

    function Withdraw (IERC20 _address) public payable onlyOwner {

    uint aPayer;
    address userRefund;
    uint length = adrClients.length;
    // recherche de tous les clients ayant fait une demande de retrait
    for(uint i; i == length ; i++) {
      aPayer = User[adrClients[i]].withdrawalPending;
      userRefund = backToUser[i];

      IERC20(_address).transferFrom(msg.sender, userRefund, aPayer);

    //Maj du totalWithdrawalAmount
    totalWithdrawalAmount = totalWithdrawalAmount.sub(aPayer);
    User[adrClients[i]].withdrawalPending = 0;
    }
  }
}
