// SPDX-License-Identifier: MIT
pragma solidity 0.6.11;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Context.sol";
//import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Stacking.sol";




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

  mapping (address => Client) public user;

  // client
  mapping (uint => address) public backToUser;

  // Variable
  
  // Address USDC pour le moment
  
  IERC20 tokenAd;

  // Address contrat Staking
  address public stacking;

  // Taux d'interet
  uint apy = 5 ;
  uint dayLock = 60 seconds;
  // Somme Global disponible prêt à payer
  uint totalWithdrawalAmount;

  uint public totalVotingPower;

  // Tableaux Client

  address[] public adrClients;

  // Event
  
  event valideDepot(address client, uint amount);
  event authorizedWithdrawal(address client, uint amount);



  // Constructeur
  
  constructor(address _stacking) public{
    stacking=_stacking;
  }

  // Function déposer des fonds - parametre nombre de jours bloqué =>(nb_dayLock) et le amount

  
  function setTokenAd (IERC20 _tokenAd) external onlyOwner{
    tokenAd=_tokenAd;
  } 


  function deposit (uint amount) public payable  {
    uint depositDate = uint(block.timestamp);

    IERC20(tokenAd).transferFrom(msg.sender, stacking, amount);

    user[msg.sender].amounts.push(amount);
    user[msg.sender].depositData.push(depositDate);
    user[msg.sender].totalDeposit = _getVotingPower(msg.sender);

    if (user[msg.sender].lister == false) {
      adrClients.push(msg.sender);
      user[msg.sender].lister = true;
    }

    // Validation de l'event
    emit valideDepot(msg.sender, amount);
    
    // Maj des amount de dépôt
    totalVotingPower= totalVotingPower.add(amount);
  }


  function _getVotingPower(address _member) internal view returns(uint) {
    uint length = user[_member].amounts.length;
    uint amountTotal;
    for (uint i; i < length; i++) {
      amountTotal += user[_member].amounts[i];
    }
    return amountTotal;
    }
    
  // Function demande de retrait - parametre amount souhaitant retirer

  function withdrawPending (uint withdrawalAmount) public payable {
    uint minWithdrawalDate;
    uint withdrawable;
    uint length = user[msg.sender].depositData.length;
    if (length == 1) {
        withdrawable = 0;
        
    } else {
        
    for(uint i; i < length ; i++) {
      minWithdrawalDate = user[msg.sender].depositData[i].add(dayLock);
      if (minWithdrawalDate < uint(block.timestamp)) {
        withdrawable = i;
      } else {
          require(user[msg.sender].depositData[0].add(dayLock) <= uint(block.timestamp), "withdraw deadline is not reached");
        }
    }
    }
    uint withdrawableTotal; 
    
    if (withdrawable > 0){
        // Calcule du amount des interets disponible + le amount de depot initial = amount Total Disponible à l'instanté
        for (uint i ; i <= withdrawable ; i++) {
            uint depositTime = uint(block.timestamp) - user[msg.sender].depositData[i];
            uint interestAmount = ((depositTime.mul(100).div(315360000)).mul(apy).mul(user[msg.sender].amounts[i]).mul(100)).div(100);
            uint amountTotal = user[msg.sender].amounts[i].add(interestAmount);
            withdrawableTotal = withdrawableTotal.add(amountTotal);
        }
    
    user[msg.sender].withdrawalPending = user[msg.sender].withdrawalPending.add(withdrawalAmount) ;
    
    require(user[msg.sender].withdrawalPending <= withdrawableTotal, "to much withdraw"); 
    
    } else {
        withdrawableTotal = user[msg.sender].amounts[0]; 
    require( withdrawalAmount <= withdrawableTotal, "to much withdraw"); 
    
    user[msg.sender].withdrawalPending = user[msg.sender].withdrawalPending.add(withdrawalAmount) ;
   
      }
    require(withdrawalAmount <=  withdrawableTotal && withdrawalAmount <= user[msg.sender].totalDeposit , "not enought a gain to withdraw");


  
    
    
    // Maj du amount Global Payement
    totalWithdrawalAmount = totalWithdrawalAmount.add(withdrawalAmount);
    
    uint leftDeposits = user[msg.sender].totalDeposit.sub(withdrawalAmount);
    
    uint[] memory zero;
    
    user[msg.sender].amounts = zero;
    user[msg.sender].amounts.push(leftDeposits);
    user[msg.sender].depositData = zero;
    user[msg.sender].depositData.push(uint(block.timestamp)); // !! refresh le day dayLock
    user[msg.sender].totalDeposit = leftDeposits;

    // Validation de l'event
    emit authorizedWithdrawal(msg.sender, withdrawalAmount);

    // Maj des amount de dépôt
    totalVotingPower = totalVotingPower.sub(withdrawalAmount);
  }

  function getAdrClients() external view returns(address[] memory) {
  return adrClients;
  }

 
  function getUser(address adr) external view returns(Client memory) {
  return user[adr];
  }

  // Function de Retrait

  function Withdraw (IERC20 _address) public payable onlyOwner {
    uint aPayer;
    address userRefund;
    uint length = adrClients.length;
    
    // recherche de tous les clients ayant fait une demande de retrait
    for(uint i; i < length ; i++) {
      aPayer = user[adrClients[i]].withdrawalPending;
      userRefund = backToUser[i];

      IERC20(_address).transferFrom(address(this), userRefund, aPayer);

      //Maj du totalWithdrawalAmount
      totalWithdrawalAmount = totalWithdrawalAmount.sub(aPayer);
      user[adrClients[i]].withdrawalPending = 0;
    }
  }
}