# avoiding_common_attacks.md

- [x] Re-Entrancy
- [x] Arithmetic Overflow and Underflow
- [ ] Self Destruct
- [ ] Accessing Private Data
- [ ] Delegatecall
- [ ] Source of Randomness
- [ ] Denial of Service
- [ ] Phishing with tx.origin
- [ ] Hiding Malicious Code with External Contract
- [ ] Honeypot
- [ ] Front Running
- [x] Block Timestamp Manipulation
- [ ] Signature Replay

📌 Security checks currently in place :

## Re-Entrancy

- No possible re-entrancy because any of the functions use fallback.

- Sets of **require** and **modifier** are in place to limit the access to certain functionalities.


## Arithmetic Overflow and Underflow

Every operations are safely computed with the **safeMath library**

## Block Timestamp Manipulation

Block Timestamp could be manipulated. It is used in our contract to update X price which is evolving regarding the APY and actual timestamp.

For instance in ProxySimple we do not use directly the blockTimestamp as reference for **Guard check**. In the following examples the require method use the expected amount and added interests when the timelock is over :

```
/// @notice fetch the value of x, give actual value if argument equal to zero
/// @dev view function usefull for interest computation
/// @param date a epoch time to add at the current time to fetch x value in the future
///@return x the value for a given date
function updateXprice(uint date) public view returns(uint x){
  uint z = 1000000;
  x = z.add((((block.timestamp.add(date)).sub(xLaunch)).mul(z).div(31536000)).mul(apy).div(100));
}
```
In the deposit function we determine the amount and added interest when the lock time will be past.

```
uint y = updateXprice(timeLock);
uint lockedAmount =(depositToX.mul(y)).div(z);
user[msg.sender].DepositLocked.push(lockedAmount);
```
