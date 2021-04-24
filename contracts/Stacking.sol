pragma solidity 0.6.11;


import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IERC20.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IWETH.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";


contract Stacking is Ownable{
  using SafeMath for uint;

 IUniswapV2Router02 public uniswapRouter;
 address public stacking;


 constructor(address _uniswap) public {
   uniswapRouter = IUniswapV2Router02(_uniswap);
 }

receive() external payable { }

function setStackingAddress(address contractAddr) external onlyOwner {
  stacking = contractAddr ;
}

 function getBalance(address token) external view returns (uint) {
   return IERC20(token).balanceOf(address(this));
 }

 function getDecimals(address token) external view returns(uint) {
   uint decimals = IERC20(token).decimals();
   return  decimals;
 }

 function transferERC20(IERC20 token, address proxySimple, uint amountIn) external onlyOwner{
   IERC20(token).transferFrom(address(this),proxySimple,amountIn);
 }

 function approveERC20Uni(IERC20 token, uint amountIn) onlyOwner external returns(uint){
   IERC20(token).approve(address(uniswapRouter), amountIn);
   return amountIn;
 }
  // La fonction qui va permettre le swap
 function swapTokens(
   address tokenA,
   address tokenB,
   uint amountIn,
   uint amountOutMin,
   uint deadline
   ) external onlyOwner {
   //transferFromER20
   address[] memory path = new address[](2); // Création du path
   path[0] = address(tokenA); // initialisation du path avec l'address du token à échanger
   path[1] = address(tokenB); // initialisation du path avec l'address du WETH d'Uniswap
   //approveERC20Uni
   uniswapRouter.swapExactTokensForTokens(
     amountIn,
     amountOutMin,
     path,
     stacking,
     deadline
   ); // effectuer le swap, ETH sera transférer directement au msg.sender
 }

 function addLiquidity(
   address tokenA,
   address tokenB,
   uint amountTokenADesired,
   uint amountTokenBDesired,
   uint amountTokenAMin,
   uint amountTokenBMin,
   uint deadline
  ) external payable onlyOwner returns (uint amountTokenA, uint amountTokenB, uint liquidity) {
   return uniswapRouter.addLiquidity(tokenA, tokenB, amountTokenADesired,amountTokenBDesired, amountTokenAMin, amountTokenBMin, stacking, deadline);
 }

  function removeLiquidity(
  address tokenA,
  address tokenB,
  uint liquidity,
  uint amountAMin,
  uint amountBMin,
  uint deadline
  ) external onlyOwner returns (uint amountA, uint amountB) {
  return uniswapRouter.removeLiquidity(tokenA,tokenB,liquidity,amountAMin,amountBMin,stacking,deadline);
  }
}
