const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');
const { expect } = require('chai');
const ProxySimple = artifacts.require('ProxySimple');

describe("ProxySimple contract", function() {
  let accounts;
  let contract;
  let owner;
  let userlisted;

  before(async function() {
  contract = await ProxySimple.new();
  accounts = await web3.eth.getAccounts();
  owner = accounts[0];
  userlisted = accounts[1];
  notOwner = accounts[2];
  notuserlisted = accounts[3];

  await contract.deposit(0,{from: userlisted});
  });

  describe('Test de l\'ensemble du processus de dépôt-retrait', () => {

 /*   describe('Un client listé dépose 0', () => {

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
      
      expectEvent(valideDepotReceipt, "valideDepot",{client: userlisted , amount: new BN(100)});
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

    //describe('Un client dépose 100', () => {
      //it('on devrait voir totalDeposit du client s\'incrémenter de 100', async () => {

        //let totalDepositTest = await contract.user(userlisted).totalDeposit;
        //let totalDepositBefore = new BN(totalDepositTest); 

        //await contract.deposit(100, {from: userlisted});

        //totalDepositTest = await contract.user(userlisted).totalDeposit;
        //let totalDepositAfter= new BN(totalDepositTest); 
     
        //expect(totalDepositAfter).to.be.bignumber.equal(totalDepositBefore.add(new BN(100))); 
        
      //}); 
    //});

*/
    describe('Un client aillant déposé fait un demande de retrait supérieur à son solde', () => {
      it('on devrait voir une erreur', async () => {

        expectRevert(contract.withdrawPending(9999999, { from: userlisted })), "to much withdraw";
        
      }); 
    });
  });
});