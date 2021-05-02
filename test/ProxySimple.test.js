const { BN, expectRevert, expectEvent, time } = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');
const { expect } = require('chai');
const ProxySimple = artifacts.require('ProxySimple');
const Stacking = artifacts.require('Stacking');
const Erc20usdc = artifacts.require('ERC20Token');


describe("ProxySimple contract", function() {
  let contract;
  let stackingcontract;
  let erc20;
  let accounts;
  let owner;
  let userlisted;
  let notOwner;
  let notuserlisted;
  let stackingSol;
  let proxySol;
  let erc20address;

  before(async function() {

  contract = await ProxySimple.new();
  stackingcontract = await Stacking.new("0x6b175474e89094c44da98b954eedeac495271d0f"); //this is the address of the DAI contract, just to test
  erc20 = await Erc20usdc.new(5000);
  accounts = await web3.eth.getAccounts();
  owner = accounts[0];
  userlisted = accounts[1];
  notOwner = accounts[2];
  unlisted = accounts[3];
  stackingSol = stackingcontract.address;
  proxySol = contract.address;
  erc20address = erc20.address;



  await contract.setStackingAddress(stackingSol,{from: owner});
  await contract.setTokenAd(erc20.address,{from: owner});

  await erc20.approve(contract.address, 500000000, {from: userlisted});
  await erc20.approve(contract.address, 500000000, {from: owner});
  await erc20.approve(contract.address, 500000000, {from: unlisted});

  await contract.transferProxy(erc20.address, owner, userlisted, 300000000, {from: owner});
  await contract.transferProxy(erc20.address, owner, unlisted, 1000, {from: owner});
  await contract.deposit(1000,{from: userlisted});
  });

  describe('ProxySimple test', () => {

    describe('Testing of the entire customer deposit - withdrawal request process', () => {

      describe('A registered customer and an unknown user want to deposit money', () => {

        it('There should be no new line in the customers table when the registered user deposits', async () => {
          let adrClients = await contract.getAdrClients({from: userlisted});
          let lengthTabBefore = new BN(adrClients.length);

          await contract.deposit(2000,{from: userlisted});

          adrClients = await contract.getAdrClients({from: userlisted});
          let lengthTabAfter = new BN(adrClients.length);

          expect(lengthTabAfter).to.be.bignumber.equal(lengthTabBefore);
        });

        it('We should have a new line in the customers table when the unlisted customer deposits', async () => {
          let adrClients = await contract.getAdrClients({from: notuserlisted});
          let lengthTabBefore = new BN(adrClients.length);

          await contract.deposit(1000,{from: unlisted});

          adrClients = await contract.getAdrClients({from: notuserlisted});
          let lengthTabAfter = new BN(adrClients.length);

          expect(lengthTabAfter).to.be.bignumber.equal(lengthTabBefore.add(new BN(1)));
        });
      });

      describe('A customer deposits 3000', () => {

        it('We should see the event validDeposit(address client, uint amount)', async () => {

          let validDepositReceipt = await contract.deposit(3000, {from: userlisted});

          await expectEvent(validDepositReceipt, "validDeposit",{client: userlisted , amount: new BN(3000)});
        });

        it('We should see the balance of the stacking contract increase', async () => {

          let stackingSolBalanceBefore = await erc20.balanceOf(stackingSol, {from: owner});

          await contract.deposit(4000, {from: userlisted});

          let stackingSolBalanceAfter = await erc20.balanceOf(stackingSol, {from: owner});

          expect(stackingSolBalanceAfter).to.be.bignumber.equal(stackingSolBalanceBefore.add(new BN(4000)));
          });

        it('We should see the client\'s xTotalDeposit increment by xDeposit', async () => {

          let xTotalDepositBefore = await contract.getUserDeposits(userlisted);

          await contract.deposit(5000, {from: userlisted});

          let xTotalDepositAfter = await contract.getUserDeposits(userlisted);

          let xDepot = (await contract.getUser(userlisted)).xDeposit[4];

          expect(xTotalDepositAfter).to.be.bignumber.equal(xTotalDepositBefore.add(new BN(xDepot)));
        });

        it('We should see totalVotingPower increment', async () => {

          let totalVotingPower = await contract.totalVotingPower.call();
          let totalVotingPowerBefore = new BN(totalVotingPower);

          await contract.deposit(6000, {from: userlisted});

          let toAdd = (await contract.getUser(userlisted)).DepositLocked[5];

          totalVotingPower = await contract.totalVotingPower.call();
          let totalVotingPowerAfter= new BN(totalVotingPower);

          expect(totalVotingPowerAfter).to.be.bignumber.equal(totalVotingPowerBefore.add(new BN(toAdd)));

        });
      });


      describe('We should see an adequate commented error', () => {

        it('We should see an adequate commented error', async () => {
          await contract.deposit(7000, {from: userlisted});
          await expectRevert(contract.wantWithdraw(20000000, { from: userlisted }), "can not withdraw more than you deposited");
        });
      });

      describe('A customer who has deposited makes a valid withdrawal request', () => {

        it('We should see the authorizedWithdrawal event returned', async () => {
          await contract.deposit(8000, {from: userlisted});
          time.increase(time.duration.years(1));

          let authorizedWithdrawalReceipt = (await contract.wantWithdraw(36000, { from: userlisted }));

          await expectEvent(authorizedWithdrawalReceipt, "authorizedWithdrawal",{client: userlisted , amount: new BN(36000)});
        });

      });



      describe('Withdrawal request before timelock', () => {

        it('We should see returned "can not withdraw from a locked deposit"', async () => {
          await contract.deposit(9000, {from: userlisted});
          await expectRevert(contract.wantWithdraw(9000, { from: userlisted }), "can not withdraw from a locked deposit");
        });
      });
    });

    describe('Withdraw test', () => {

      describe('notOwner launches withdrawals', () => {

        it('We should see return the require "Ownable: caller is not the owner"', async () => {
          await expectRevert(contract.withdraw(proxySol, { from: notOwner }), "Ownable: caller is not the owner");
        });
      });

      describe('withdraw operated by the contract\'s owner', () => {

        it('We should see the userlisted balance increase', async () => {
          time.increase(time.duration.years(100));
          await contract.transferProxy(erc20.address, owner, contract.address, 1000000, {from: owner});
          await contract.wantWithdraw(500, { from: userlisted });

          let withdrawPendingNumber = (await contract.getUser(userlisted)).withdrawPending;

          let allow = await erc20.allowance(contract.address, userlisted);
          console.log(allow.toString());

          let balanceBefore = await erc20.balanceOf(userlisted);

          await contract.withdraw(erc20.address, { from: owner });

          let balanceAfter = await erc20.balanceOf(userlisted);

          expect(balanceAfter).to.be.bignumber.equal(balanceBefore.add(new BN(withdrawPendingNumber)));
        });
      });
    });
  });
});
