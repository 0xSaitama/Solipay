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


  // Client Structure

  struct Client {
    bool lister; // registred in adrClients
    uint withdrawPending; // total withdraw request
    uint xTotalDeposit; // total deposit expressed in x value
    uint[] xDeposit; // array of the differents deposits in x value
    uint[] DepositLocked; // array of the differents deposits when the deposit could be withdraw
  }

  // Mapping

  mapping (address => Client) public user;

  // Variable

  // Token address accepted as
  IERC20 tokenAd;

  // Staking contract address
  address public stacking;

  // Interest
  uint apy = 5 ;
  // Lock times
  uint timeLock = 10512000;
  // Contract deployment date
  uint public xLaunch;

  // Global sum available ready to pay
  uint public totalWithdrawalAmount;

  uint public totalVotingPower;

  address fundingProject;

  // Customer Tables

  address[] public adrClients;

  // Event

  event validDeposit(address indexed client, uint amount);
  event authorizedWithdrawal(address indexed client, uint amount);
  event withdrawn(uint amount);

  // Constructor

  constructor() public{
    xLaunch = block.timestamp;
  }

  // This function is just for testing
  function transferProxy(IERC20 token, address sender, address recipient, uint amount) external onlyOwner{
    IERC20(token).transferFrom(sender, recipient, amount);
  }

  /// @notice Define IERC20 token address accepted as deposit
  /// @dev restricted to the contract's owner
  /// @param _tokenAd IERC20 the token address
  function setTokenAd(IERC20 _tokenAd) external onlyOwner{
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
  function updateXprice(uint date) public view returns(uint x){
    uint z = 1000000;
    x = z.add((((block.timestamp.add(date)).sub(xLaunch)).mul(z).div(31536000)).mul(apy).div(100));
  }

  function totalWithdraw() external view returns(uint) {
    return totalWithdrawalAmount;
  }

  /// @notice return the client's address aray
  /// @dev usefull as relay for sending the client addresses to a borrow.sol contract
  /// @dev could be useless if it is possible access directly to the contract variable
  /// @return array of client address
  function getAdrClients() external view returns(address[] memory) {
    return adrClients;
  }

  /// @notice return the total voting power
  /// @dev it represents total summed xDeposit of every client
  /// @return big number totalVotingPower
  function getTotalVotingPower() external view returns(uint) {
    return totalVotingPower;
  }
  /// @notice return client object
  /// @dev usefull as relay for sending the client properties to a borrow.sol contract
  /// @param _user the client address
  /// @return client object
  function getUser(address _user) external view returns(Client memory) {
    return user[_user];
  }


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
    (bool success, bytes memory result) = address(tokenAd).delegatecall(abi.encodeWithSignature("approve(address,uint256)", address(this), amount));
    return success;
    }

  /* function transferToStacking(address account, uint amount) internal returns(bool) {
    (bool success, bytes memory result) = address(tokenAd).delegatecall(abi.encodeWithSignature("transferFrom(address,address,uint256)",, stacking, amount));
    return success;
  } */
  /// @notice make a deposit by the user in the staking contract
  /// @dev set a deposit lock by computation of the deposit value with interests at the unlock date
  /// and verification when calling withdrawPending
  /// @param amount the desired amount to deposit by the user
  function deposit (uint amount) public payable  {
    require(amount > 0, "can not deposit 0");
    uint x = updateXprice(0);
    uint z = 1000000;
    address account = address(msg.sender);
    IERC20(tokenAd).transferFrom(account, stacking, amount);
    uint depositToX = (amount.mul(z)).div(x);
    user[msg.sender].xDeposit.push(depositToX);
    user[msg.sender].xTotalDeposit = user[msg.sender].xTotalDeposit.add(depositToX);
    uint y = updateXprice(timeLock);
    uint lockedAmount =(depositToX.mul(y)).div(z);
    user[msg.sender].DepositLocked.push(lockedAmount);

    if (user[msg.sender].lister == false) {
      adrClients.push(msg.sender);
      user[msg.sender].lister = true;
      user[msg.sender].withdrawPending = 0;
    }

    // Event validation
    emit validDeposit(msg.sender, amount);
    // Update of the deposit amount
    totalVotingPower= totalVotingPower.add(depositToX);
  }


  function deleteUserDeposits(address usr, uint to, uint long) internal {
        uint lastIndex = long.sub(1);
        uint diff = lastIndex.sub(to);
        for (uint i; i < diff ; i++) {
          uint j = i.add(to).add(1);
          user[usr].xDeposit[i] = user[usr].xDeposit[j];
          user[usr].DepositLocked[i] = user[usr].DepositLocked[j];
          }
          for (uint i; i <= to ; i++) {
          user[usr].xDeposit.pop();
          user[usr].DepositLocked.pop();
        }
      }

  /// @notice make a withdraw request by the user
  /// @dev fetch the differents deposits eligible for withdraw
  /// and delete them from the client array if withdrawn
  /// @param withdrawAmount the desired amount to withdraw by the user
  function wantWithdraw (uint withdrawAmount) public returns(uint){
    uint x = updateXprice(0);
    uint z = 1000000;
    uint xWithdraw = withdrawAmount.mul(z).div(x);
    require(xWithdraw <= user[msg.sender].xTotalDeposit, "can not withdraw more than you deposited");
    uint deposit0 = (user[msg.sender].xDeposit[0]).mul(x).div(z);
    require(deposit0  >= user[msg.sender].DepositLocked[0], "the first deposit can not be unlocked now");
    uint length = (user[msg.sender].DepositLocked).length;
    uint withdraw;
    uint leftovers;
    uint sumDeposit;
    for (uint i; i < length; i++) {
      sumDeposit = sumDeposit.add(user[msg.sender].DepositLocked[i]);
      uint depositI = (user[msg.sender].xDeposit[i]).mul(x).div(z);
      if (withdrawAmount >= sumDeposit) {
        require(depositI >= user[msg.sender].DepositLocked[i],"can not withdraw a locked deposit");
        withdraw = i;
      } else if (withdrawAmount < sumDeposit && depositI >= user[msg.sender].DepositLocked[i]) {
        withdraw = i;
        leftovers = sumDeposit.sub(withdrawAmount);
      } else {
        uint overDeposit = sumDeposit.sub(user[msg.sender].DepositLocked[i]);
        require (withdrawAmount <= overDeposit, "can not withdraw from a locked deposit");
        }
    }

    user[msg.sender].withdrawPending = user[msg.sender].withdrawPending.add(withdrawAmount);
    address usr = msg.sender;

    deleteUserDeposits(usr,withdraw,length);

     if (leftovers > 0) {
      uint xleftovers = leftovers.mul(z).div(x);
      user[msg.sender].xDeposit.push(xleftovers);
      user[msg.sender].DepositLocked.push(xleftovers);
      uint newLenght = user[msg.sender].xDeposit.length;
      for (uint i = newLenght.sub(1); i > 0; i--) {
        uint j = i.sub(1);
        user[msg.sender].xDeposit[i] = user[msg.sender].xDeposit[j];
        user[msg.sender].DepositLocked[i] = user[msg.sender].DepositLocked[j];
      }
    }

    user[msg.sender].xTotalDeposit = user[msg.sender].xTotalDeposit.sub(xWithdraw);
    // Global payment update
    totalWithdrawalAmount = totalWithdrawalAmount.add(withdrawAmount);

    IERC20(tokenAd).approve(msg.sender, withdrawAmount);

    totalVotingPower= totalVotingPower.sub(xWithdraw);
    // Event validation
    emit authorizedWithdrawal(msg.sender, withdrawAmount);
  }


  /// @notice make an effective withdraw for the user by the contract owner
  /// @dev fetch the differents pending withdraws from the differents user and pay them
  /// @param _address the IERC20 token address in use to payback the users
  function withdraw (IERC20 _address) public payable onlyOwner {
    uint toPay;
    uint length = adrClients.length;
    uint sumWithdraw;
    // Search for all customers who have requested a withdrawal
    for(uint i; i < length ; i++) {
      address usr =  adrClients[i];
      toPay = user[usr].withdrawPending;
      sumWithdraw = sumWithdraw.add(toPay);

      require(sumWithdraw <= totalWithdrawalAmount, "too much Withdraw");

      IERC20(_address).transfer(usr, toPay);
      user[usr].withdrawPending = 0;
    }
    emit withdrawn(totalWithdrawalAmount);
    // totalWithdrawalAmount update
    totalWithdrawalAmount = 0;
  }
}
