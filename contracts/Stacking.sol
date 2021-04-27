// SPDX-License-Identifier: MIT
pragma solidity 0.6.11;


import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IERC20.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IWETH.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";


contract Stacking is Ownable{
  using SafeMath for uint;

 IUniswapV2Router02 public uniswapRouter; //initialization of Uni Router
 address public stacking; //initialization of the contract address variable
 address public proxy; //initialization of the contract address variable


 constructor(address _uniswap) public {
   uniswapRouter = IUniswapV2Router02(_uniswap); //set the UNI Router instance with a specific address
 }

receive() external payable { }

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
/// @notice allow the user to send ERC20 to the stacking contract
/// @dev use of a delegate call to pass the stacking address as argument for approve function
/// @param amount the ERC20 token amount to approve for the stacking contract
function approveProxy(address token, uint amount) external returns(bool){
  (bool success, bytes memory result) = address(token).delegatecall(abi.encodeWithSignature("approve(address,uint256)",proxy,amount));
  return success;
  }
/// @notice fetch an ERC20 balance of the stacking contract
/// @param token address
/// @return contract's balance
 function getBalance(IERC20 token) external view returns (uint) {
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
  /// @notice transfer an ERC20 token to the stacking contract
  /// @dev
  /// @param token, proxySimple, amountIn
 function transferERC20(IERC20 token, address proxySimple, uint amountIn) external onlyOwner{
   IERC20(token).transferFrom(address(this),proxySimple,amountIn);
 }

 /// @notice approve an ERC20 token amount to uniswap Router
 /// @dev function restricted to the owner of the contract
 /// @param token, amountIn
 /// @return amountIn the approved amount for uniswap Router
 function approveERC20Uni(IERC20 token, uint amountIn) onlyOwner external returns(uint){
   IERC20(token).approve(address(uniswapRouter), amountIn);
   return amountIn;
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
