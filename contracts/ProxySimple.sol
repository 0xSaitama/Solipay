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
    uint xDeposit;
    uint withdrawPending;
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
  uint public xLaunch;
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
    xLaunch = block.timestamp;
  }

  // Function déposer des fonds - parametre nombre de jours bloqué =>(nb_dayLock) et le amount


  function setTokenAd (IERC20 _tokenAd) external onlyOwner{
    tokenAd=_tokenAd;
  }

  function updateXprice() internal view returns(uint x){
    uint y = 1;
    x =  y.add(((block.timestamp.sub(xLaunch)).div(31536000)).mul(apy).div(100));
  }

  function getAdrClients() external view returns(address[] memory) {
    return adrClients;
  }

  function getUser(address _user) external view returns(Client memory) {
    return user[_user];
  }
  function deposit (uint amount) public payable  {
    uint x = updateXprice();
    IERC20(tokenAd).transferFrom(msg.sender, stacking, amount);
    uint DepositToX = amount.div(x);
    user[msg.sender].xDeposit = user[msg.sender].xDeposit.add(DepositToX);

    if (user[msg.sender].lister == false) {
      adrClients.push(msg.sender);
      user[msg.sender].lister = true;
      user[msg.sender].withdrawPending = 0;
    }
    // Validation de l'event
    emit valideDepot(msg.sender, amount);
    // Maj des amount de dépôt
    totalVotingPower= totalVotingPower.add(amount);
  }

  // Function demande de retrait - parametre amount souhaitant retirer

  function withdrawPending (uint withdrawAmount) public {
    require(withdrawAmount <= user[msg.sender].xDeposit);

    user[msg.sender].withdrawPending = user[msg.sender].withdrawPending.add(withdrawAmount);
    user[msg.sender].xDeposit = user[msg.sender].xDeposit.sub(withdrawAmount);
    // Maj du amount Global Payement
    totalWithdrawalAmount = totalWithdrawalAmount.add(withdrawAmount);

    // Validation de l'event
    emit authorizedWithdrawal(msg.sender, withdrawAmount);

    // Maj des amount de dépôt
    totalVotingPower = totalVotingPower.sub(withdrawAmount);
  }

  // Function de Retrait

  function Withdraw (IERC20 _address) public payable onlyOwner {
    uint toPay;
    uint length = adrClients.length;
    // recherche de tous les clients ayant fait une demande de retrait
    for(uint i; i < length ; i++) {
      toPay = user[adrClients[i]].withdrawPending;
      IERC20(_address).transferFrom(address(this), adrClients[i], toPay);
      //Maj du totalWithdrawalAmount
      totalWithdrawalAmount = totalWithdrawalAmount.sub(toPay);
      user[adrClients[i]].withdrawPending = 0;
    }
  }
}
