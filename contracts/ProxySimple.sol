// SPDX-License-Identifier: MIT
pragma solidity 0.6.11;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Context.sol";
//import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Stacking.sol";
import "./interfaces/IBorrow.sol";




contract ProxySimple is Ownable{
  using SafeMath for uint;


  // Structure Client

  struct Client {
    bool lister; //registred in adrClients
    uint withdrawPending; //total withdraw request
    uint xTotalDeposit; //total deposit expressed in x value
    uint[] xDeposit; // array of the differents deposits in x value
    uint[] DepositLocked; // array of the differents deposits when the deposit could be withdraw

  }

  // Mapping

  mapping (address => Client) public user;

  // Variable


  IERC20 tokenAd; //token address accepted as

  address public stacking; //Staking contract address

  uint apy = 5 ; // interest
  uint dayLock = 60 seconds;
  uint public xLaunch; // contract deployment date

  uint totalWithdrawalAmount;  // Somme Global disponible prêt à payer

  uint public totalVotingPower;

  address fundingProject;

  // Tableaux Client

  address[] public adrClients;

  // Event

  event valideDepot(address client, uint amount);
  event authorizedWithdrawal(address client, uint amount);

  // Constructeur

  constructor() public{
    xLaunch = block.timestamp;
  }

  /// @notice Define IERC20 token address accepted as deposit
  /// @dev restricted to the contract's owner
  /// @param _tokenAd IERC20 the token address
  function setTokenAd (IERC20 _tokenAd) external onlyOwner{
    tokenAd=_tokenAd;
  }

  /// @notice Define stacking contract address to send the deposit
  /// @dev could be upgraded by using an stacking interface ?
  /// @param contractAddr the address of the stacking contract
  function setStackingAddress(address contractAddr) external onlyOwner {
    stacking = contractAddr ;
  }
  /// @notice fetch the value of x, give actual value if argument equal to zero
  /// @dev view function usefull for interest computation
  /// @param date a epoch time to add at the current time to fetch x value in the future
  ///@return x the value for a given date
  function updateXprice(uint date) internal view returns(uint x){
    uint y = 1;
    x =  y.add((((block.timestamp.add(date)).sub(xLaunch)).div(31536000)).mul(apy).div(100));
  }

  /// @notice return the client's address aray
  /// @dev usefull as relay for sending the client addresses to a borrow.sol contract
  /// @dev could be useless if it is possible access directly to the contract variable
  /// @return array of client address
  function getAdrClients() external view returns(address[] memory) {
    return adrClients;
  }

  /// @notice return client object
  /// @dev usefull as relay for sending the client total deposit in x value to a borrow.sol contract
  /// @param _user the client address
  /// @return client object
  function getUserDeposits(address _user) external view returns(uint) {
    return user[_user].xTotalDeposit;
  }

  /// @notice Define the project address to receive donations and funds
  /// @dev the address is set by borrow contract before setting it here
  /// @param borrowAddress the address of the wining project funding in borrow contract
  function setFundingProject(address borrowAddress) external onlyOwner returns(address) {
    fundingProject = IBorrow(borrowAddress).receiverAddress();
  }

  /// @notice allow the user to send ERC20 to the stacking contract
  /// @dev use of a delegate call to pass the stacking address as argument for approve function
  /// @param amount the ERC20 token amount to approve for the stacking contract
  function approveStacking(uint amount) external returns(bool){
    (bool success, bytes memory result) = address(tokenAd).delegatecall(abi.encodeWithSignature("approve(address,uint256)", stacking, amount));
    return success;
    }

  /// @notice make a deposit by the user in the staking contract
  /// @dev set a deposit lock by computation of the deposit value with interests at the unlock date
  /// and verification when calling withdrawPending
  /// @param amount the desired amount to deposit by the user
  function deposit (uint amount) public payable  {
    uint x = updateXprice(0);
    IERC20(tokenAd).transferFrom(msg.sender, stacking, amount);
    uint depositToX = amount.div(x);
    user[msg.sender].xDeposit.push(depositToX);
    user[msg.sender].xTotalDeposit = user[msg.sender].xTotalDeposit.add(depositToX);
    uint y = updateXprice(dayLock);
    user[msg.sender].DepositLocked.push(depositToX.mul(y));

    if (user[msg.sender].lister == false) {
      adrClients.push(msg.sender);
      user[msg.sender].lister = true;
      user[msg.sender].withdrawPending = 0;
    }

    // Validation de l'event
    emit valideDepot(msg.sender, amount); //MAPPING DATE D4UNLOCK ???
    // Maj des amount de dépôt
    totalVotingPower= totalVotingPower.add(amount);
  }


  /// @notice make a withdraw request by the user
  /// @dev fetch the differents deposits eligible for withdraw
  /// and delete them from the client array if withdrawn
  /// @param withdrawAmount the desired amount to withdraw by the user
  function withdrawPending (uint withdrawAmount) public {
    uint x = updateXprice(0);
    uint xWithdraw = withdrawAmount.div(x);
    require(xWithdraw <= user[msg.sender].xTotalDeposit, "can not withdraw more than you deposited");
    require(user[msg.sender].xDeposit[0].mul(x) >= user[msg.sender].DepositLocked[0], "the first deposit can not be unlocked now");
    uint length = user[msg.sender].DepositLocked.length;
    uint withdraw;
    uint leftovers;
    uint sumDeposit;
    for (uint i; i < length; i++) {
      sumDeposit = sumDeposit.add(user[msg.sender].DepositLocked[i]);
      if (withdrawAmount >= sumDeposit) {
        require(user[msg.sender].xDeposit[i].mul(x) >= user[msg.sender].DepositLocked[i],"can not withdraw a locked deposit");
        withdraw = withdraw.add(i);
      } else if (user[msg.sender].xDeposit[i].mul(x) >= user[msg.sender].DepositLocked[i]) {
        withdraw = withdraw.add(i);
        leftovers = sumDeposit.sub(withdrawAmount);
      } else require(withdrawAmount <= sumDeposit.sub(user[msg.sender].DepositLocked[i]), "can not withdraw from a locked deposit");
    }

    user[msg.sender].withdrawPending = user[msg.sender].withdrawPending.add(withdrawAmount);

    for (uint i; i <= withdraw; i++) {
      delete user[msg.sender].xDeposit[i];
      delete user[msg.sender].DepositLocked[i];
    }

    if (leftovers > 0) {
    uint xleftovers = leftovers.mul(x);
    user[msg.sender].xDeposit.push(xleftovers);
    user[msg.sender].DepositLocked.push(leftovers.mul(x));
    }

    user[msg.sender].xTotalDeposit = user[msg.sender].xTotalDeposit.sub(xWithdraw);
    // Maj du amount Global Payement
    totalWithdrawalAmount = totalWithdrawalAmount.add(withdrawAmount);
    totalVotingPower= totalVotingPower.sub(withdrawAmount);
    // Validation de l'event
    emit authorizedWithdrawal(msg.sender, withdrawAmount);

  }


  /// @notice make an effective withdraw for the user by the contract owner
  /// @dev fetch the differents pending withdraws from the differents user and pay them
  /// @param _address the IERC20 token address in use to payback the users
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
