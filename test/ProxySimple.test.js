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

  contract = await ProxySimple.new(); // (juste pour le test, dai sur ethereum "0x6b175474e89094c44da98b954eedeac495271d0f"
  stackingcontract = await Stacking.new("0x6b175474e89094c44da98b954eedeac495271d0f");
  erc20 = await Erc20usdc.new(5000);
  accounts = await web3.eth.getAccounts();
  owner = accounts[0];
  userlisted = accounts[1];
  notOwner = accounts[2];
  unlisted = accounts[3];  //userunlisted
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

  describe('test depositLock', () => {

  describe('Test de l\'ensemble du processus de dépôt- demande de retrait', () => {

    describe('Un client listé dépose 1000', () => {

      it('on ne devrait pas avoir de nouvelle ligne dans le tableau clients', async () => {
        let adrClients = await contract.getAdrClients({from: userlisted});
        let lengthTabBefore = new BN(adrClients.length);

        await contract.deposit(2000,{from: userlisted});

        adrClients = await contract.getAdrClients({from: userlisted});
        let lengthTabAfter = new BN(adrClients.length);

        expect(lengthTabAfter).to.be.bignumber.equal(lengthTabBefore);
      });

      it('on devrait avoir une nouvelle ligne dans le tableau clients', async () => {
        let adrClients = await contract.getAdrClients({from: notuserlisted});
        let lengthTabBefore = new BN(adrClients.length);

        await contract.deposit(1000,{from: unlisted});

        adrClients = await contract.getAdrClients({from: notuserlisted});
        let lengthTabAfter = new BN(adrClients.length);

        expect(lengthTabAfter).to.be.bignumber.equal(lengthTabBefore.add(new BN(1)));
      });
    });

    describe('Un client dépose 100', () => {

      it('on devrait voir l\' event valideDepot(address client, uint amount)', async () => {

        let valideDepotReceipt = await contract.deposit(3000, {from: userlisted});

        await expectEvent(valideDepotReceipt, "valideDepot",{client: userlisted , amount: new BN(3000)});
      });

      it('on devrait voir la balance du contrat stacking s\'incrémenter', async () => {

        let stackingSolBalanceBefore = await erc20.balanceOf(stackingSol, {from: owner});

        await contract.deposit(4000, {from: userlisted});

        let stackingSolBalanceAfter = await erc20.balanceOf(stackingSol, {from: owner});

        expect(stackingSolBalanceAfter).to.be.bignumber.equal(stackingSolBalanceBefore.add(new BN(4000)));
        });

      it('on devrait voir xTotalDeposit du client s\'incrémenter de xDeposit', async () => {

        let xTotalDepositBefore = await contract.getUserDeposits(userlisted);

        await contract.deposit(5000, {from: userlisted});

        let xTotalDepositAfter = await contract.getUserDeposits(userlisted);

        let xDepot = (await contract.getUser(userlisted)).xDeposit[4];

        expect(xTotalDepositAfter).to.be.bignumber.equal(xTotalDepositBefore.add(new BN(xDepot)));
      });

      it('on devrait voir totalVotingPower s\'incrémenter', async () => {

        let totalVotingPower = await contract.totalVotingPower.call();
        let totalVotingPowerBefore = new BN(totalVotingPower);

        await contract.deposit(6000, {from: userlisted});

        let toAdd = (await contract.getUser(userlisted)).DepositLocked[5];

        totalVotingPower = await contract.totalVotingPower.call();
        let totalVotingPowerAfter= new BN(totalVotingPower);

        expect(totalVotingPowerAfter).to.be.bignumber.equal(totalVotingPowerBefore.add(new BN(toAdd)));

      });
    });


    describe('Un client aillant déposé fait un demande de retrait supérieur à son solde', () => {
      it('on devrait voir une erreur', async () => {
        await contract.deposit(7000, {from: userlisted});
        await expectRevert(contract.wantWithdraw(20000000, { from: userlisted }), "can not withdraw more than you deposited");
      });
    });

    describe('Un client aillant déposé fait un demande de retrait valide', () => {
      it('on devrait voir retourné l\'event authorizedWithdrawal', async () => {
        await contract.deposit(8000, {from: userlisted});
        time.increase(time.duration.years(1));
        let blibli = (await contract.getUser(userlisted)).xDeposit[1];
        console.log(blibli);      // chek combien de xDeposit pour 100$
        let blabla = await contract.getUserDeposits(userlisted);
        console.log(blabla.toString());
        ble = await contract.updateXprice(0,{from: owner});
        blo = ble*blabla;
        console.log(blo.toString());
        let bloblo = (await contract.getUser(userlisted)).DepositLocked[2];
        console.log(bloblo);
        let blpblo = (await contract.getUser(userlisted)).DepositLocked.length;
        console.log(blpblo);
        let authorizedWithdrawalReceipt = (await contract.wantWithdraw(36000, { from: userlisted }));
        console.log(authorizedWithdrawalReceipt);
        blibli = (await contract.getUser(userlisted)).xDeposit[0];
        console.log(blibli);      // chek combien de xDeposit pour 100$
        blabla = await contract.updateXprice(0,{from: owner});
        console.log(blabla.toString());
         blpblo = (await contract.getUser(userlisted)).DepositLocked.length;
        console.log(blpblo);
        bloblo = (await contract.getUser(userlisted)).DepositLocked[0];
        console.log(bloblo);
        await expectEvent(authorizedWithdrawalReceipt, "authorizedWithdrawal",{client: userlisted , amount: new BN(36000)});
      });

    });



    describe('demande de retrait avant timelock ', () => {
      it('on devrait voir retourné can not withdraw from a locked deposit', async () => {

        await contract.deposit(1000, {from: userlisted});
        let blibli = (await contract.getUser(userlisted)).xDeposit[0];
        console.log(blibli);      // chek combien de xDeposit pour 100$
        let blabla = await contract.updateXprice(0,{from: owner});
        console.log(blabla.toString());
        let bloblo = (await contract.getUser(userlisted)).DepositLocked[0];
        console.log(bloblo);

        await expectRevert(contract.wantWithdraw(1000, { from: userlisted }), "can not withdraw from a locked deposit");
      });
    });
  });

  describe('Test de Withdraw', () => {
    describe('notOwner lance les retraits', () => {
      it('on devrait voir retrouné le require "Ownable: caller is not the owner" ', async () => {
        await expectRevert(contract.withdraw(proxySol, { from: notOwner }), "Ownable: caller is not the owner");
      });
    });

    describe('withdraw par le owner', () => {
      it('on devrait voir le solde de userlisted augmenter', async () => {
        time.increase(time.duration.years(1));
        await contract.transferProxy(erc20.address, owner, contract.address, 1000000, {from: owner});
        await contract.wantWithdraw(500, { from: userlisted });
        let withdrawPendingNumber = (await contract.getUser(userlisted)).withdrawPending;
        console.log(withdrawPendingNumber);


        let balanceBefore = erc20.balanceOf(userlisted);
        await contract.withdraw(erc20address, { from: owner });
        let stackingSolBalanceAfter = erc20.balanceOf(userlisted);
        expect(apres).to.be.bignumber.equal(avant.add((withdrawPendingNumber)));
      });
    });

  });
});
});
