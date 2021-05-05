## tests_explication.md
This document explains the written tests and why they were written.

# Test Explanation

## Introduction

We have 3 test files:

- ProxySimple.test.js
- Borrow.test.js
- Stacking.test.js

We perform end-to-end testing to verify that our contracts are performing as expected from start to finish.



> Artifacts written to /tmp/test--556729-tPa9IvfoRp3H
> Compiled successfully using:
   - solc: 0.6.11+commit.5ef660b1.Emscripten.clang



  ProxySimple contract
    ProxySimple test
      Testing of the entire customer deposit - withdrawal request process
        A registered customer and an unknown user want to deposit money
          ✓ There should be no new line in the customers table when the registered user deposits (74ms)
          ✓ We should have a new line in the customers table when the unlisted customer deposits (81ms)
        A customer deposits 3000
          ✓ We should see the event validDeposit(address client, uint amount) (49ms)
          ✓ We should see the balance of the stacking contract increase (89ms)
          ✓ We should see the client's xTotalDeposit increment by xDeposit (86ms)
          ✓ We should see totalVotingPower increment (84ms)
        We should see an adequate commented error
          ✓ We should see an adequate commented error (460ms)
        A customer who has deposited makes a valid withdrawal request
          ✓ We should see the authorizedWithdrawal event returned (202ms)
        Withdrawal request before timelock
          ✓ We should see returned "can not withdraw from a locked deposit" (113ms)
      Withdraw test
        notOwner launches withdrawals
          ✓ We should see return the require "Ownable: caller is not the owner"
        withdraw by the owner
          ✓ We should see the userlisted balance increase (189ms)


  11 passing (2s)


  > Artifacts written to /tmp/test--605832-By2GleshABDa
> Compiled successfully using:
   - solc: 0.6.11+commit.5ef660b1.Emscripten.clang



  Borrow contract
    Testing the entire voting process
      Voting administrator records a whitelist of voters
        ✓ Revert if not the owner (463ms)
        ✓ We should be able to whitelist as owner (51ms)
      We go to step: Registration of proposals
        Calling the nextStep() function
          ✓ We should move on to step: registration of proposals (87ms)
          ✓ We must be able to add a proposal (57ms)
          ✓ We should go to step: end of the proposal recording session (76ms)
          ✓ We must not be able to add proposals after the closing of the recording (41ms)
      We go to step: Recording of votes
        Calling the nextStep() function
          ✓ We should move on to the step: recording votes (63ms)
          ✓ We should be able to vote for a proposal (77ms)
          ✓ We should not be able to vote several times with the same account
          ✓ We should not be able to access the winning proposition with Count the votes
          ✓ We should move on to step: end of the vote recording session (63ms)
          ✓ we should not be able to vote after registration closes
      We go to step: Counting votes
        ✓ We should be able to determine the winning proposal (72ms)
        Calling the nextStep() function
          ✓ We should go to step: Counting the votes (54ms)


  14 passing (2s)



> Artifacts written to /tmp/test--695503-l7Niz7IRQ3dt
> Compiled successfully using:
   - solc: 0.6.11+commit.5ef660b1.Emscripten.clang



  Stacking contract
    Stacking contract address definition
      someone who is not the owner try to set the contract address
        ✓ should revert the tx  (512ms)
      the owner try to set the contract address
        ✓ should set the contract address (73ms)
    Stacking contracts tranfers
      the contract receive tokens
        ✓ should increase the contract balance  (105ms)
      the contract approve uniRouter
        ✓ should increase the uniRouter allowance  (62ms)


  4 passing (885ms)



### ProxySimple.test.js
**Testing of the entire customer deposit - withdrawal request process, and distribution of withdrawal requests**

- **Describe :** Testing of the entire customer deposit - withdrawal request process
- **Because:** Check if the functions accessible to the client are working

```sh
describe('A registered customer and an unknown user want to deposit money')
```

```sh
it('There should be no new line in the customers table when the registered user deposits')
```
- A registered customer makes a deposit.
- We check if the `deposit ()` function does not create several accounts for the same address.
```sh
it('We should have a new line in the customers table when the unlisted customer deposits')
```
- An unregistered customer makes a deposit.
- We check if the `deposit ()` function adds a row to the address array.

```sh
describe('A customer deposits 3000')
```

```sh
it('We should see the event validDeposit(address client, uint amount)')
```
- A customer makes a deposit.
- We check if the `validDeposit` event is issued.
```sh
it('We should see the balance of the stacking contract increase')
```
- The funds are sent on the Stacking contract.
- We check that the Stacking contract receives the funds.
```sh
it('We should see the client s xTotalDeposit increment by xDeposit')
```
- At each successful deposit, the variable which stores the total customer balance must be incremented.
- We check that the `xTotalDeposit` is well incremented.
```sh
it('We should see totalVotingPower increment')
```
- At each successful deposit, the variable which stores the total customer voting power must be incremented.
- We check that the `totalVotingPower` is well incremented.
```sh
describe('A customer asks to withdraw more than he is supposed to be able to do')
```

```sh
it('We should see an adequate commented error')
```
- We don't want a user to be able to request more than their available balance.
- We check if the "can not withdraw more than you deposited" revert is issued.
```sh
describe('A customer who has deposited makes a valid withdrawal request')
```

```sh
it('We should see the authorizedWithdrawal event returned')
```
- We want the withdrawal request function to work when everything is legitimate
We check if the `authorizedWithdrawal` event is issued.
```sh
describe('Withdrawal request before timelock')
```

```sh
it('We should see returned "can not withdraw from a locked deposit"')
```
- We don't want us to be able to request a withdrawal before the lock date.
- We check if the "can not withdraw from a locked deposit" revert is issued.


- **Describe :** Withdraw test
- **Because:** Check if the sending of funds works

```sh
describe('notOwner launches withdrawals')

it('We should see return the require "Ownable: caller is not the owner"')
```
- We don't want a notOwner to be able to initiate withdrawals.
- we expect the revert "Ownable: caller is not the owner".
```sh
describe('withdraw by the owner')

it('We should see the userlisted balance increase')        
```
- We want the withdrawal request to be sent correctly.
- We check if the customer's account has been correctly incremented



### Borrow.test.js
**Testing the entire voting process**

- **Describe :** Voting administrator records a whitelist of voters
- **Because:** Only the owner can normally start this


```sh
describe('Voting administrator records a whitelist of voters')

it('Revert if not the owner')
```
- notOwner try setEntity.
- We check if the revert works.

```sh
it('We should be able to whitelist as owner')        
```
- owner register an entity.
- We see if the appropriate event works.


- **Describe :** We go to step: Registration of proposals
- **Because:** You have to know if this step goes smoothly

```sh
describe('Calling the nextStep() function')

it('We should move on to step: registration of proposals')
```
- We ask to go to the next step.
- we compare the state before and after to check if it works, and that proposition 0 exists.

```sh
it('We must be able to add a proposal')        
```
- We add a proposal.
- we check that the event confirms.

```sh
it('We should go to step: end of the proposal recording session')
```
- We end the recording session of the proposals.
- we check that the event confirms.

```sh
it('We must not be able to add proposals after the closing of the recording')        
```
- We try add a proposal.
- We check that this is impossible after the end of the session.


- **Describe :** We go to step: Registration of votes
- **Because:** You have to know if this step goes smoothly


```sh
describe('Calling the nextStep() function')

it('We should move on to the step: recording votes')
```
- We ask to go to the next step.
- we compare the state before and after to check if it works.

```sh
it('We should be able to vote for a proposal')        
```
- We add a vote.
- we check that the event confirms.

```sh
it('We should not be able to vote several times with the same account')
```
- We try to vote several times, and we don't want that.
- We see that the require returns the error message.

```sh
it('We should not be able to access the winning proposition with Count the votes')        
```
- We will try to look at the results, but we don't want that to be possible.
- We see that the require returns the error message..

```sh
it('We should move on to step: end of the vote recording session')
```
- We end the voting session.
- we check that the event confirms.

```sh
it('we should not be able to vote after registration closes')        
```
- We try add a vote.
- We check that this is impossible after the end of the session.


- **Describe :** We go to step: Counting votes
- **Because:** You have to know if this step goes smoothly

```sh
it('We should be able to determine the winning proposal')        
```
- We launch the results of the votes.
- We check that the winning proposition is first set to 0 and then that the event confirms that the good result has been recorded.


```sh
describe('Calling the nextStep() function')

it('We should go to step: Counting the votes')
```
- We ask to go to the next step.
- we compare the state before and after to check if it works



### Stacking.test.js
**Testing our functions**

- **Describe :** Stacking contract address definition
- **Because:** We have to have the right address


```sh
describe('Someone who is not the owner try to set the contract address')

it('Should revert the tx')
```
- notOwner try setStackingAddress.
- We check if the revert works.


```sh
describe('The owner try to set the contract address')

it('Should set the contract address')
```
- We set the stacking address.
- We check if the function make a great jobs.


- **Describe :** Stacking contracts tranfers
- **Because:** We must check that things are going well with the router


```sh
describe('The contract receive tokens')

it('Should increase the contract balance')
```
- Contract receives 100 dai from owner.
- we expect if the balance of the contract is well incremented.


```sh
describe('The contract approve uniRouter')

it('Should increase the uniRouter allowance')
```
- We approve 100 dai.
- We see if the allowance is well incremented.
