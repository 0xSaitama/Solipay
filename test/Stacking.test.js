const { BN, expectRevert, expectEvent } = require("@openzeppelin/test-helpers");
const { web3 } = require("@openzeppelin/test-helpers/src/setup");
const { expect } = require("chai");
const Stacking = artifacts.require("Stacking");
const uniRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"; //kovan



describe("Stacking contract", function () {
  let accounts;
  let owner;

  // before ca le fait une fois avant de lancer tout les test // beforEach : Une fois avant chaque test
  before(async function () {
    contract = await Stacking.new(uniRouter);
    accounts = await web3.eth.getAccounts();
    daiAddress = "0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa";
    uniAddress = "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984";
    owner = accounts[0];
    notOwner = accounts[1];
    stackingAddress = contract.address;
    proxyAddress ="0xbE9cEd94991D3f97A2e1490dE744bE9860D1634e";

  });
      describe("Stacking contract address definition", () => {
        describe("someone who is not the owner try to set the contract address", () => {
          it("should revert the tx ", async () => {
            (await expectRevert(contract.setStackingAddress(stackingAddress, { from: notOwner }),"Ownable: caller is not the owner"));
          });
        });

        describe("the owner try to set the contract address", () => {
          it("should set the contract address", async () => {
            const Stacking_address_Before = await contract.stacking();
            expect(Stacking_address_Before).to.be.equal('0x0000000000000000000000000000000000000000');
            await contract.setStackingAddress(stackingAddress, { from: owner });
            const Stacking_address_After = await contract.stacking();
            expect(Stacking_address_After).to.be.equal(contract.address);
          });
        });
      });
      describe("Stacking contracts tranfers", () => {
        describe("the contract receive tokens", () => {
          it("should increase the contract balance ", async () => {
            const daiAddress = "0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa";
            const balanceBefore = await contract.getBalance(daiAddress);
            await contract.approveERC20(daiAddress, contract.address, 10);
            await contract.transferERC20(daiAddress, contract.address, 10);
            const balanceAfter = await contract.getBalance(daiAddress);
            expect(balanceAfter).to.be.bignumber.equal(balanceBefore.add(new BN(10)));
          });
        });
      });



    });
