pragma solidity ^0.6.12;
pragma experimental ABIEncoderV2;

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

  // La fonction qui va permettre le swap
 function swapTokensForEth(address token, uint amountIn, uint amountOutMin, uint deadline) external {
   IERC20(token).transferFrom(msg.sender, address(this), amountIn);// Transfert des tokens en question au smart contract ! Il faut penser à approve ce transfert avant l’utilisation de cette fonction
   address[] memory path = new address[](2); // Création du path
   path[0] = address(token); // initialisation du path avec l'address du token à échanger
   path[1] = uniswapRouter.WETH(); // initialisation du path avec l'address du WETH d'Uniswap
   IERC20(token).approve(address(uniswapRouter), amountIn); // autoriser uniswap à utiliser nos tokens
   uniswapRouter.swapExactTokensForETH(
     amountIn,
     amountOutMin,
     path,
     msg.sender,
     deadline
   ); // effectuer le swap, ETH sera transférer directement au msg.sender
 }

 function addLiquidityeth(address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, uint deadline) external payable returns (uint amountToken, uint amountETH, uint liquidity) {
   IERC20(token).approve(address(uniswapRouter), amountTokenDesired);
   uniswapRouter.addLiquidityETH(token, amountTokenDesired, amountTokenMin, amountETHMin, msg.sender, deadline);
 }
}
