const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');
const { expect } = require('chai');
const ProxySimple = artifacts.require('ProxySimple');
const Stacking = artifacts.require('Stacking');
const Erc20usdc = artifacts.require('ERC20Token');
const timeMachine = require('ganache-time-traveler');

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

  contract = await ProxySimple.new(); // (juste pour le test, dai sur ethereum "0x6b175474e89094c44da98b954eedeac495271d0f"
  stackingcontract = await Stacking.new("0x6b175474e89094c44da98b954eedeac495271d0f");
  erc20 = await Erc20usdc.new(5000);
  accounts = await web3.eth.getAccounts();
  owner = accounts[0];
  userlisted = accounts[1];
  notOwner = accounts[2];
  notuserlisted = accounts[3];  //userunlisted
  stackingSol = stackingcontract.address;
  proxySol = contract.address;
  erc20address = erc20.address;



  await contract.setStackingAddress(stackingSol,{from: owner});
  await contract.setTokenAd(erc20.address,{from: owner});

  await erc20.approve(contract.address, 5000, {from: userlisted});
  await erc20.approve(contract.address, 5000, {from: owner});
  await contract.transferProxy(erc20.address, owner, userlisted, 3000, {from: owner});
  await contract.deposit(0,{from: userlisted});
  });

  beforeEach(async() => {
    let snapshot = await timeMachine.takeSnapshot();
    snapshotId = snapshot['result'];
  });

  afterEach(async() => {
    await timeMachine.revertToSnapshot(snapshotId);
  });

//////
  describe('test depositLock', () => {

    it('on doit avoir depositlock = 100', async () => {

      await contract.deposit(100,{from: userlisted});
      let blibli = (await contract.getUser(userlisted)).xDeposit[1];
      console.log(blibli);

    });
/////////////////////////////////////////////////////////

  describe('Test de l\'ensemble du processus de dépôt- demande de retrait', () => {

    describe('Un client listé dépose 0', () => {

      it('on ne devrait pas avoir de nouvelle ligne dans le tableau clients', async () => {
        let adrClients = await contract.getAdrClients({from: userlisted});
        let lengthTabBefore = new BN(adrClients.length);

        await contract.deposit(0,{from: userlisted});

        adrClients = await contract.getAdrClients({from: userlisted});
        let lengthTabAfter = new BN(adrClients.length);

        expect(lengthTabAfter).to.be.bignumber.equal(lengthTabBefore);
      });

      it('on devrait avoir une nouvelle ligne dans le tableau clients', async () => {
        let adrClients = await contract.getAdrClients({from: notuserlisted});
        let lengthTabBefore = new BN(adrClients.length);

        await contract.deposit(0,{from: notuserlisted});

        adrClients = await contract.getAdrClients({from: notuserlisted});
        let lengthTabAfter = new BN(adrClients.length);

        expect(lengthTabAfter).to.be.bignumber.equal(lengthTabBefore.add(new BN(1)));
      });
    });

    describe('Un client dépose 100', () => {

      it('on devrait voir l\' event valideDepot(address client, uint amount)', async () => {

        let valideDepotReceipt = await contract.deposit(100, {from: userlisted});

        await expectEvent(valideDepotReceipt, "valideDepot",{client: userlisted , amount: new BN(100)});
      });

      it('on devrait voir la balance de proxySol s\'incrémenter de 100', async () => {

        let stackingSolBalanceBefore = await erc20.balanceOf(stackingSol, {from: owner});

        await contract.deposit(100, {from: userlisted});

        let stackingSolBalanceAfter = await erc20.balanceOf(stackingSol, {from: owner});

        expect(stackingSolBalanceAfter).to.be.bignumber.equal(stackingSolBalanceBefore.add(new BN(100)));
        });

      it('on devrait voir xTotalDeposit du client s\'incrémenter de 100', async () => {

        let xTotalDepositBefore = await contract.getUserDeposits(userlisted);
        await contract.deposit(100, {from: userlisted});

        let xTotalDepositAfter = await contract.getUserDeposits(userlisted);

        let x = await contract.updateXprice(0);
        x = new BN(x);
        let xDepot = new BN(100).div(x);

        expect(xTotalDepositAfter).to.be.bignumber.equal(xTotalDepositBefore.add(new BN(xDepot)));
      });

      it('on devrait voir totalVotingPower s\'incrémenter de 100', async () => {

        let totalVotingPower = await contract.totalVotingPower.call();
        let totalVotingPowerBefore = new BN(totalVotingPower);

        await contract.deposit(100, {from: userlisted});

        totalVotingPower = await contract.totalVotingPower.call();
        let totalVotingPowerAfter= new BN(totalVotingPower);

        expect(totalVotingPowerAfter).to.be.bignumber.equal(totalVotingPowerBefore.add(new BN(100)));
      });
    });


    describe('Un client aillant déposé fait un demande de retrait supérieur à son solde', () => {
      it('on devrait voir une erreur', async () => {
        await contract.deposit(100, {from: userlisted});
        await expectRevert(contract.withdrawPending(2000, { from: userlisted }), "can not withdraw more than you deposited");
      });
    });

    describe('Un client aillant déposé fait un demande de retrait valide', () => {
      it('on devrait voir retourné l\'event authorizedWithdrawal', async () => {
        await contract.deposit(100, {from: userlisted});
        await timeMachine.advanceTimeAndBlock(20000000);

        let authorizedWithdrawalReceipt = (await contract.withdrawPending(100, { from: userlisted }));

        (await expectEvent(authorizedWithdrawalReceipt, "authorizedWithdrawal",{client: userlisted , amount: new BN(100)}));
      });
      });
    });


    /*
    describe('demande de retrait avant timelock ', () => {
      it('on devrait voir retourné can not withdraw from a locked deposit', async () => {
        await contract.deposit(100, {from: userlisted});

       // let blibli = (await contract.getUser(userlisted)).xDeposit[1];
       // console.log(blibli);
        //await contract.withdrawPending(50, { from: userlisted });
       // let bloblo = (await contract.getUser(userlisted)).DepositLocked[1];
       // console.log(bloblo);

        (await expectRevert(contract.withdrawPending(50, { from: userlisted }), "can not withdraw from a locked deposit"));
       // await expectRevert(contract.withdrawPending(50, { from: userlisted }), "can not withdraw from a locked deposit");
       let blabla = (await contract.getUser(userlisted)).xDeposit[1];
       console.log(blabla);

      });
    });
    */



  });

  describe('Test de Withdraw', () => {
    describe('notOwner lance les retraits', () => {
      it('on devrait voir retrouné le require "Ownable: caller is not the owner" ', async () => {
        await expectRevert(contract.Withdraw(proxySol, { from: notOwner }), "Ownable: caller is not the owner");
      });
    });

    describe('withdraw par le owner', () => {
      it('on devrait voir le solde de userlisted augmenter', async () => {
       // await timeMachine.advanceTimeAndBlock(2000000000);
        await contract.deposit(200, {from: userlisted});
        await contract.deposit(300, {from: userlisted});
        //await contract.deposit(400, {from: userlisted});
       // let blibli = (await contract.getUser(userlisted)).xDeposit[1];
        //console.log(blibli);
        await timeMachine.advanceTimeAndBlock(20000000);
        //let bloblo = (await contract.getUser(userlisted)).DepositLocked[1];
       // console.log(bloblo);
       // let balance = await stackingcontract.getBalance(erc20address);
       // console.log(balance);
       // await timeMachine.advanceTimeAndBlock(20000000);
        await contract.withdrawPending(100, { from: userlisted });
        let withdrawPendingNumber = (await contract.getUser(userlisted)).withdrawPending;

        let avant = erc20.balanceOf(userlisted);
        await contract.withdraw(erc20address, { from: owner });
        let apres = erc20.balanceOf(userlisted);
        expect(apres).to.be.bignumber.equal(avant.add((withdrawPendingNumber)));
      });
    });

  });
});
