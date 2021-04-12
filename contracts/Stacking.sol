pragma solidity 0.8.0;


import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IERC20.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IWETH.sol";


contract Stacking {
 IUniswapV2Router02 uniswapRouter;



 constructor(address _uniswap) public {
   uniswapRouter = IUniswapV2Router02(_uniswap);
 }

receive() external payable { }


 function getBalance(address token, address owner) external view returns (uint) {
   return IERC20(token).balanceOf(owner);
 }

 function getAllowance(IERC20 token,address owner, address spender) external view returns(uint) {
   return token.allowance(owner, spender);

 }

 function approveStack(IERC20 token, address spender, uint value) external returns(uint)  {
   //IERC20(token).approve(spender, value);
   (bool success, bytes memory data) = address(token).delegatecall(abi.encodeWithSignature("approve(address,uint256)",spender,value));
   require(success, "not approved");
   return abi.decode(data, (uint));
 }
 function transferERC20(IERC20 token, uint amountIn) external {
   IERC20(token).transferFrom(msg.sender,address(this),amountIn);
 }

 function approveERC20Uni(IERC20 token, uint amountIn) external {
   IERC20(token).approve(address(uniswapRouter), amountIn);
 }
  // La fonction qui va permettre le swap
 function swapTokensForEth(
   address token,
   uint amountIn,
   uint amountOutMin,
   uint deadline
   ) external {
   //transferFromER20
   address[] memory path = new address[](2); // Création du path
   path[0] = address(token); // initialisation du path avec l'address du token à échanger
   path[1] = uniswapRouter.WETH(); // initialisation du path avec l'address du WETH d'Uniswap
   //approveERC20Uni
   uniswapRouter.swapExactTokensForETH(
     amountIn,
     amountOutMin,
     path,
     msg.sender,
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
  ) external payable returns (uint amountTokenA, uint amountTokenB, uint liquidity) {
   return uniswapRouter.addLiquidity(tokenA, tokenB, amountTokenADesired,amountTokenBDesired, amountTokenAMin, amountTokenBMin, msg.sender, deadline);
 }

  function removeLiquidity(
  address tokenA,
  address tokenB,
  uint liquidity,
  uint amountAMin,
  uint amountBMin,
  address to,
  uint deadline
  ) external returns (uint amountA, uint amountB) {
  return uniswapRouter.removeLiquidity(tokenA,tokenB,liquidity,amountAMin,amountBMin,to,deadline);
  }
}
