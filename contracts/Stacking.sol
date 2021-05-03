// SPDX-License-Identifier: MIT
pragma solidity 0.6.11;


import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IERC20.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IWETH.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./interfaces/IBorrow.sol";


contract Stacking is Ownable{
  using SafeMath for uint;


 uint8 projectRevenue;
 IUniswapV2Router02 public uniswapRouter; //initialization of Uni Router
 address public stacking; //initialization of the contract address variable
 address public proxy; //initialization of the contract address variable

event LPsended(address owner, uint amount);


 constructor(address _uniswap) public {
   uniswapRouter = IUniswapV2Router02(_uniswap); //set the UNI Router instance with a specific address
 }

/// @notice Define stacking contract address
/// @param contractAddr the contract address referring to stacking.sol
function setStackingAddress(address contractAddr) external onlyOwner {
  stacking = contractAddr ;
}

/// @notice Define proxy contract address
/// @param contractAddr the contract address referring to ProxySimple.sol
function setProxyAddress(address contractAddr) external onlyOwner {
  proxy = contractAddr ;
}

/// @notice Define the pourcentage of teh total balance allocated to project funding
/// @param pourcentage the amount to divide by 100 when sending funds to projects
function setProjectRevenue(uint8 pourcentage) external onlyOwner {
  projectRevenue = pourcentage ;
}

/// @notice fetch an ERC20 balance of the stacking contract
/// @param token address
/// @return contract's balance
 function getBalance(IERC20 token) public view returns (uint) {
   return IERC20(token).balanceOf(address(this));
 }


 /// @notice fetch an ERC20 token decimals
 /// @param token address
 /// return decimals uint8
 function getDecimals(address token) external view returns(uint8 decimals) {
   decimals = IERC20(token).decimals();

 }
 /// @notice fetch an ERC20 token symbol
 /// @dev
 /// @param token address
 /// return symbol string
  function getSymbol(address token) external view returns(string memory symbol) {
    symbol = IERC20(token).symbol();
  }

  /// @notice transfer an ERC20 token to the addr of your choice
  /// @dev usefull to send funds to our contracts
  /// @param token, proxySimple, amountIn
 function receiveERC20(IERC20 token, address usr, uint amountIn) external onlyOwner{
   IERC20(token).transferFrom(msg.sender,usr,amountIn);
 }

 /// @notice send ERC20 tokens to voted projects for fundings
 /// @dev multiplied by a state variable then divided by 100 as a pourcentage
 /// @param token, vote, usr the erc20 token address and project to fund address
 function fooProjects(IERC20 token, address voteContract) external onlyOwner {
   address toFund = IBorrow(voteContract).receiverAddress();
   uint rewards = getBalance(token).mul(projectRevenue).div(100);
  IERC20(token).transfer(toFund,rewards);
 }
 /// @notice approve an ERC20 token amount to uniswap Router
 /// @dev function restricted to the owner of the contract
 /// @param token, amountIn token address and amount to approve
 /// @return amountIn the approved amount for uniswap Router
 function approveERC20Uni(IERC20 token, uint amountIn) onlyOwner external returns(uint){
   IERC20(token).approve(address(uniswapRouter), amountIn);
   return amountIn;
 }
 ///@notice send Lp to an address reponsible for placing LP in liquidity pool to gains rewards
 ///@dev the address shoulb be trusted and defined by the contract owner
 ///@param lpToken, owner, amount token address, the account address to receive LPs and the LPs amount
 function sendLP(address lpToken, address owner, uint amount) external onlyOwner {
   IERC20(lpToken).transfer(owner, amount);
   emit LPsended(owner, amount);
 }
 /// @notice swap ERC20 tokens with an exact input to a desired ouput
 /// @dev an output minimum amount is required as parameter,
 /// it reverts if the swap give an output below amountOutMin
 /// @param tokenA, tokenB, amountIn, amountOutMin, deadline
 function swapTokens(
   address tokenA,
   address tokenB,
   uint amountIn,
   uint amountOutMin,
   uint deadline
   ) external onlyOwner {
   address[] memory path = new address[](2); // Création du path
   path[0] = address(tokenA); // initialisation du path avec l'address du token à échanger
   path[1] = address(tokenB); // initialisation du path avec l'address du WETH d'Uniswap
   //approveERC20Uni() before calling this function
   //fetch uniswap Router function swapExactTokensForTokens() with same params
   uniswapRouter.swapExactTokensForTokens(
     amountIn,
     amountOutMin,
     path,
     stacking,
     deadline
   ); // effectuer le swap, ETH sera transférer directement au contrat stacking
 }

 /// @notice add ERC20 tokens in liquidity pools
 /// @dev outputs minimum amounts are required as parameter,
 /// it reverts if the swap give an output below amountTokenAMin or amountTokenBMin
 /// @param tokenA, tokenB, amountTokenADesired, amountTokenBDesired, amountTokenAMin, amountTokenBMin, deadline
 /// return amountA, amountB added in liquidity & liquidity tokens received by stacking contract
 function addLiquidity(
   address tokenA,
   address tokenB,
   uint amountTokenADesired,
   uint amountTokenBDesired,
   uint amountTokenAMin,
   uint amountTokenBMin,
   uint deadline
  ) external payable onlyOwner returns (uint amountTokenA, uint amountTokenB, uint liquidity) {
    //fetch uniswap Router function addLiquidity() with same params
   return uniswapRouter.addLiquidity(tokenA, tokenB, amountTokenADesired,amountTokenBDesired, amountTokenAMin, amountTokenBMin, stacking, deadline);
 }

 /// @notice remove ERC20 tokens from liquidity pools
 /// @dev liquidity tokens amount & outputs minimum amounts are required as parameter,
 /// it reverts if the swap give an output below amountAMin or amountBMin
 /// @param tokenA, tokenB, amountTokenADesired, amountTokenBDesired, amountTokenAMin, amountTokenBMin, deadline
 /// @return amountA amountB received by stacking contract
  function removeLiquidity(
  address tokenA,
  address tokenB,
  uint liquidity,
  uint amountAMin,
  uint amountBMin,
  uint deadline
  ) external onlyOwner returns (uint amountA, uint amountB) {
    //fetch uniswap Router function addLiquidity() with same params
  return uniswapRouter.removeLiquidity(tokenA,tokenB,liquidity,amountAMin,amountBMin,stacking,deadline);
  }
}
