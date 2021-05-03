// SPDX-License-Identifier: MIT
pragma solidity 0.6.11;

import '@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol';
import '@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol';
import '@uniswap/lib/contracts/libraries/FixedPoint.sol';
import "@uniswap/v2-periphery/contracts/interfaces/IERC20.sol";


import '@uniswap/v2-periphery/contracts/libraries/UniswapV2OracleLibrary.sol';
import '@uniswap/v2-periphery/contracts/libraries/UniswapV2Library.sol';

// fixed window oracle that recomputes the average price for the entire period once every period
// note that the price average is only guaranteed to be over at least 1 period, but may be over a longer period
contract OracleSimplePair {
    using FixedPoint for *;

    uint public constant PERIOD = 60 seconds;

    IUniswapV2Pair immutable pair;
    address public immutable token0;
    address public immutable token1;

    uint    public price0CumulativeLast;
    uint    public price1CumulativeLast;
    uint32  public blockTimestampLast;
    FixedPoint.uq112x112 public price0Average;
    FixedPoint.uq112x112 public price1Average;

    constructor(address factory, address tokenA, address tokenB) public {
        IUniswapV2Pair _pair = IUniswapV2Pair(UniswapV2Library.pairFor(factory, tokenA, tokenB)); // fetch the tokens pair
        pair = _pair; //set the pair in pair contract variable
        token0 = _pair.token0(); //set the token address in token0 contract variable
        token1 = _pair.token1();//set the token address in token1 contract variable
        price0CumulativeLast = _pair.price0CumulativeLast(); // fetch the current accumulated price value (1 / 0)
        price1CumulativeLast = _pair.price1CumulativeLast(); // fetch the current accumulated price value (0 / 1)
        uint112 reserve0;
        uint112 reserve1;
        (reserve0, reserve1, blockTimestampLast) = _pair.getReserves(); // fetch the liquiditie's reserve
        require(reserve0 != 0 && reserve1 != 0, 'ExampleOracleSimple: NO_RESERVES'); // ensure that there's liquidity in the pair
    }

    function update() external {
        (uint price0Cumulative, uint price1Cumulative, uint32 blockTimestamp) =
            UniswapV2OracleLibrary.currentCumulativePrices(address(pair)); //fetch the actual price cumulative
        uint32 timeElapsed = blockTimestamp - blockTimestampLast; // overflow is desired

        // ensure that at least one full period has passed since the last update
        require(timeElapsed >= PERIOD, 'ExampleOracleSimple: PERIOD_NOT_ELAPSED');

        // overflow is desired, casting never truncates
        // cumulative price is in (uq112x112 price * seconds) units so we simply wrap it after division by time elapsed
        price0Average = FixedPoint.uq112x112(uint224((price0Cumulative - price0CumulativeLast) / timeElapsed));
        price1Average = FixedPoint.uq112x112(uint224((price1Cumulative - price1CumulativeLast) / timeElapsed));

        //set the new priceCumulativeLast
        price0CumulativeLast = price0Cumulative;
        price1CumulativeLast = price1Cumulative;
        blockTimestampLast = blockTimestamp;
    }

    // note this will always return 0 before update has been called successfully for the first time.
    function consult(address token, uint amountIn) external view returns (uint amountOut) {
        if (token == token0) {
            amountOut = price0Average.mul(amountIn).decode144(); // convert a token0 amount in token1 amount
        } else {
            require(token == token1, 'ExampleOracleSimple: INVALID_TOKEN');
            amountOut = price1Average.mul(amountIn).decode144(); // convert a token1 amount in token0 amount
        }
    }

    ///@notice fetch lp price expressed in one of the token pair unit
    ///@dev the lp price is computed by using priceAverages multiplied by reserve token amountTokenA
    ///@param lpToken, amount address of the lpToken and amount of LPs to price
    ///@return lpPriceT0 expressed in token0 uint for a given amount in params of LPs
    function getLpPrice(IERC20 lpToken, uint amount) external view returns(uint lpPriceT0) {
      uint112 reserve0;
      uint112 reserve1;
      uint32 bTtl;
      (reserve0, reserve1, bTtl) = pair.getReserves(); //fetch liquiditie's reserves
      uint reserve0Value = price0Average.mul(reserve0).decode144(); // convert reserve0 in a token1 amount
    //  uint reserve1Value = price1Average.mul(reserve1).decode144(); // convert reserve1 in a token0 amount
      uint totalSupply = IERC20(lpToken).totalSupply(); //fetch LP totalSupply
    //  lpPriceT1 = ((reserve1Value + reserve0)*amount)/totalSupply;
      lpPriceT0 = ((reserve0Value + reserve1)*amount)/totalSupply; //calculate the LP amount in a token0 amount


    }

}
