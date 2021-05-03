## design_pattern_desicions.md
 https://fravoll.github.io/solidity-patterns/.

 # Design Pattern Decisions

This section explains why we chose the design patterns we are using in the code.


- Behavioral Patterns
    - [x] **Guard Check**: Ensure that the behavior of a smart contract and its input parameters are as expected.
    - [x] State Machine: Enable a contract to go through different stages with different corresponding functionality exposed.
    - [x] **Oracle**: Gain access to data stored outside of the blockchain.
    - [ ] Randomness: Generate a random number of a predefined interval in the deterministic environment of a blockchain.
- Security Patterns
    - [x] **Access Restriction**: Restrict the access to contract functionality according to suitable criteria.
    - [ ] Checks Effects Interactions: Reduce the attack surface for malicious contracts trying to hijack control flow after an external call.
    - [ ] Secure Ether Transfer: Secure transfer of ether from a contract to another address.
    - [ ] **Pull over Push**: Shift the risk associated with transferring ether to the user.
    - [x] Emergency Stop: Add an option to disable critical contract functionality in case of an emergency.
- Upgradeability Patterns
    - [x] Proxy Delegate: Introduce the possibility to upgrade smart contracts without breaking any dependencies.
    - [ ] Eternal Storage: Keep contract storage after a smart contract upgrade.
- Economic Patterns
    - [ ] String Equality Comparison: Check for the equality of two provided strings in a way that minimizes average gas consumption for a large number of different inputs.
    - [x] Tight Variable Packing: Optimize gas consumption when storing or loading statically-sized variables.
    - [x] Memory Array Building: Aggregate and retrieve data from contract storage in a gas efficient way.

[Reference](https://fravoll.github.io/solidity-patterns/)

## Guard Check

Through the use of several **modifiers** and **requires**, we verify that functions are properly called by checking data validation. For example in borrow.sol :

```
modifier isRegistred {
  require(voters[msg.sender].isRegistered == true, "unregistred");
  _;
}
```

## State Machine

**Borrow** contract use state mutability for some function's accessibility. Those states are represented by a WorkflowStatus variable status.
status variable is consulted by the Guard Check and modified only by the contract's owner with a function nextStep() designed to this purpose :

```
function nextStep() external onlyOwner {
    WorkflowStatus previousStatus = status;

    if (status == WorkflowStatus.RegisteringEntities) {
        status = WorkflowStatus.LoanRequestStarted;
        registerLoanRequest("none of following proposals",stacking);
        emit ProposalsRegistrationStarted();
    }
    else if (status == WorkflowStatus.LoanRequestStarted) {
        status = WorkflowStatus.LoanRequestEnded;
        emit ProposalsRegistrationEnded();
    }
    else if (status == WorkflowStatus.LoanRequestEnded) {
        status = WorkflowStatus.VotingSessionStarted;
        emit VotingSessionStarted();
    }
    else if (status == WorkflowStatus.VotingSessionStarted) {
        status = WorkflowStatus.VotingSessionEnded;
        emit VotingSessionEnded();
    }
    else {
        status = WorkflowStatus.VotesTallied;

    }

    emit WorkflowStatusChange(previousStatus, status);
}
```

## Oracle

**OracleSimplePair** contract aim to fetch price of a given token pair. This contract is available for one specific pair only and for an other token pair a new deployment of this oracle is requested.

This decentralized oracle rely on uniswap oracle design. It fetch price from pooled token reserves from IUniswapV2Factory. we assume data freshness is not important since only the owner manage investments and it don't have to make serveral operations in short term. So recent prices are weighted equally with historical prices, we assume it is enough to store the cumulative price once per period which will be set at one per day.

Computing the average price over these data points gives‘fixed windows’, which can be updated after the lapse of each period.

```
contract OracleSimplePair {
    using FixedPoint for *;

    uint public constant PERIOD = 24 hours;
```

## Randomness

Our Dapp doesn't need any random data.

## Access Restriction

As define in the **Guard Check** section, all of our contracts grant contract's owner address access to certain functions (e.g in Stacking.sol) :

```
/// @notice Define the pourcentage of teh total balance allocated to project funding
/// @param pourcentage the amount to divide by 100 when sending funds to projects
function setProjectRevenue(uint8 pourcentage) external onlyOwner {
  projectRevenue = pourcentage ;
}
```

## Checks Effects Interactions

Actions are already restricted by user and by address.

## Secure Ether Transfer

*Not treated by our Dapp*

## Pull over Push

*Not treated by our Dapp*

## Emergency Stop

*Our dapp do not provide any ETH deposit/transfer.* only ERC20 transfer are allowed in our contracts. we rely on ERC20 safety checks in this part.

## Proxy Delegate

our **proxySimple Contract** purpose is to link our customer to decentralized finance as simple as possible. However it is the contract which is the most likely to evolve, in the short-term considering some functions updgrading and new functions coming.

we tried to let our contracts deployment independant as possible. This is why, when needed, *the owner can define the contract addresses* from some functions like (e.g stacking.sol):

```
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
```

## Eternal Storage

We anticipated that **proxySimple Contract** and **borrow Contract** would be versioned. For ProxySimple contract, totalVotingPower, client's data like addresses and their total deposit are stored and could be transferred to an other contract by using IProxy :

```
interface IProxy {
  function totalVotingPower() external view returns(uint);
  function getAdrClients() external view returns(address[] memory);
  function getUserDeposits(address addr) external view returns(uint);
}
```

For Borrow contract, the winning project addresses are transferred by using IBorrow :

```
interface IBorrow {
  function receiverAddress() external view returns(address);
}
```

## Tight Variable Packing


Variables order in our structs is build to pack various variables sizes :

```
IUniswapV2Pair immutable pair;
address public immutable token0;
address public immutable token1;

uint    public price0CumulativeLast;
uint    public price1CumulativeLast;
uint32  public blockTimestampLast;
FixedPoint.uq112x112 public price0Average;
FixedPoint.uq112x112 public price1Average;
```

## Memory Array Building

In order to save gaz, we use systematically the **view** attribute for all our getters :

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

On the other hand, to keep saving gaz, we prefer using **mapping** in order to avoid using loops. However we did'nt achieve to avoiding loops since user deposits are stored in arrays. We make use of *for* loop only. Those loops are designed to *update differents variables* in each loop or act like *Guard Check* (e.g ProxySimple) :

For instance we check, by looping, the legitimacy of a withdraw request and the number of deposits we have to delete if the withdraw request is accepted :

```
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
```
