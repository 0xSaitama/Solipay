const { BN, expectRevert, expectEvent } = require("@openzeppelin/test-helpers");
const { web3 } = require("@openzeppelin/test-helpers/src/setup");
const { expect } = require("chai");
const Stacking = artifacts.require("Stacking");
const Dai = artifacts.require("Dai");
//const Uni = artifacts.require("Uni");
//const Oracle = artifacts.require("OracleSimplePair");
const uniRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"; //kovan
//const factory = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"; //kovan



describe("Stacking contract", function () {
  let accounts;
  let owner;

  // before ca le fait une fois avant de lancer tout les test // beforEach : Une fois avant chaque test
  before(async function () {
    contract = await Stacking.new(uniRouter);
    accounts = await web3.eth.getAccounts();
    owner = accounts[0];
    notOwner = accounts[1];
    dai = await Dai.new(42);
//  miningDate = Date.now() + 10;
//  uni = await Uni.new(owner, owner, miningDate);
//  oracle = await Oracle.new(factory,dai.address,uni.address);
    dai.mint(owner, 100000000, {from: owner});
    dai.approve(contract.address, 100000, {from: owner});
//  uni.approve(contract.address, 1000, {from: owner});

   });
      describe("Stacking contract address definition", () => {
        describe("someone who is not the owner try to set the contract address", () => {
          it("should revert the tx ", async () => {
            (await expectRevert(contract.setStackingAddress(contract.address, { from: notOwner }),"Ownable: caller is not the owner"));
          });
        });

        describe("the owner try to set the contract address", () => {
          it("should set the contract address", async () => {
            let Stacking_address_Before = await contract.stacking();
            expect(Stacking_address_Before).to.be.equal('0x0000000000000000000000000000000000000000');
            await contract.setStackingAddress(contract.address, { from: owner });
            let Stacking_address_After = await contract.stacking();
            expect(Stacking_address_After).to.be.equal(contract.address);
          });
        });
      });
      describe("Stacking contracts tranfers", () => {
        describe("the contract receive tokens", () => {
          it("should increase the contract balance ", async () => {
            let balanceBefore = await contract.getBalance(dai.address);
            console.log(balanceBefore);
            let balanceOwner = await dai.balanceOf(owner);
            console.log(balanceOwner);
            let txreceipt = await contract.receiveERC20(dai.address, contract.address, 100, {from: owner});
            console.log(txreceipt);
            balanceOwner = await dai.balanceOf(owner);
            console.log(balanceOwner);
            let balanceAfter = await contract.getBalance(dai.address);
            console.log(balanceAfter);
            console.log(contract.address);
            expect(balanceAfter).to.be.bignumber.equal(balanceBefore.add(new BN(100)));
          });
        });
        describe("the contract approve uniRouter", () => {
          it("should increase the uniRouter allowance ", async () => {
            let allowanceBefore = await dai.allowance(contract.address,uniRouter);
            console.log(allowanceBefore);
            let allow = await contract.approveERC20Uni(dai.address, 100, {from: owner});
            console.log(allow);
            let allowanceAfter = await dai.allowance(contract.address,uniRouter);
            console.log(allowanceAfter);
            expect(allowanceAfter).to.be.bignumber.equal(allowanceBefore.add(new BN(100)));
          });
        });
      });
      // describe("Stacking contract SWAP", () => {
      //        describe("the owner could consult the oracle contract", () => {
      //          it("should update average price of a token pair", async () => {
      //            let priceAverage0 = await oracle.price0Average();
      //            let priceAverage1 = await oracle.price1Average();
      //            expect(priceAverage0).to.be.bignumber.equal(new BN(0));
      //            expect(priceAverage1).to.be.bignumber.equal(new BN(0));
      //            await oracle.update({ from: owner });
      //            priceAverage0 = await oracle.price0Average();
      //            priceAverage1 = await oracle.price1Average();
      //            expect(priceAverage0).to.be.bignumber.differents(priceAverage1);
      //          });
      //        });
      //     });




    });
