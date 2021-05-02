const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');
const { expect } = require('chai');
const Borrow = artifacts.require('Borrow');
const Proxy = artifacts.require("ProxySimple");
const Stacking = artifacts.require("Stacking");
const Erc20 = artifacts.require('ERC20Token');
const uniRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"; //kovan


describe("Borrow contract", function() {
    let accounts;
    let contract;
    let owner;
    let whitelisted;
    let notWhitelisted;
    let project;

   before(async function() {
        stacking = await Stacking.new(uniRouter);
        proxy = await Proxy.new()
        erc20 = await Erc20.new(1000);
        contract = await Borrow.new(stacking.address, proxy.address);
        accounts = await web3.eth.getAccounts();
        owner = accounts[0];
        whitelisted = accounts[1];
        notOwner = accounts[2];
        notWhitelisted = accounts[3];
        project1 = accounts[4];
        await proxy.setStackingAddress(stacking.address);
        await proxy.setTokenAd(erc20.address);
        await erc20.approve(whitelisted, 1000, {from: owner});
        await erc20.transfer(whitelisted, 100, {from: owner});
        await erc20.approve(proxy.address, 1000, {from: whitelisted});
        await proxy.deposit(100, {from: whitelisted});
    });

    describe('Test de l\'ensemble du processus de vote', () => {

        describe('L\'administrateur du vote enregistre une liste blanche d\'électeurs', () => {

            it('revert si ce n\'est pas le owner', async () => {
                await (expectRevert(contract.setEntity({from: notOwner}), "Ownable: caller is not the owner"));
            });

            it('on devrait pouvoir ajouter à la liste blanche en tant qu\'owner', async () => {
                let receipt = await contract.setEntity({from: owner});
                await expectEvent(receipt,"EntityRegistered", {soliAddress:[whitelisted]});
            });
        });

        describe('On passe à l\'étape : Enregistrement des propositions', () => {
             describe('Appel de la fonction nextStep()', () => {

                 it('on devrait passer à l\'étape : enregistrement des propositions', async () => {
                     let votingStatusBefore = await contract.status();
                     expect(votingStatusBefore).to.be.bignumber.equal(new BN(0));

                     let receipt = await contract.nextStep({from: owner});

                     let votingStatusAfter = await contract.status();
                     expect(votingStatusAfter).to.be.bignumber.equal(new BN(1));
                     await expectEvent(receipt, "ProposalsRegistrationStarted");

                     let firstProposal = await contract.loans(0);
                     await expect(firstProposal.description).to.equal('none of following proposals');
                 });

                 it('on doit pouvoir ajouter une proposition', async () => {
                     let proposalDescription = 'Proposition 1';
                     let receipt = await contract.registerLoanRequest(proposalDescription, project1);
                     let secondProposal = await contract.loans(1);
                     await expect(secondProposal.description).to.equal(proposalDescription);
                     await expectEvent(receipt, "ProposalRegistered", {loanRequestId: new BN(1)});
                 });

                 it('on devrait passer à l\'étape : fin de la session d\'enregistement des propositions', async () => {
                   let votingStatusBefore = await contract.status();
                   expect(votingStatusBefore).to.be.bignumber.equal(new BN(1));

                   let receipt = await contract.nextStep({from: owner});
                   let votingStatusAfter = await contract.status();
                   expect(votingStatusAfter).to.be.bignumber.equal(new BN(2));
                   await expectEvent(receipt, "ProposalsRegistrationEnded");
                 });
                 it('on ne doit pas pouvoir ajouter de propositions après la cloture de l\'enregistement', async () => {
                     let proposalDescription = 'Proposition 1';
                     await (expectRevert(contract.registerLoanRequest(proposalDescription, project1), "Not allowed"));
                });
              });
            });

             describe('On passe à l\'étape : Enregistrement des votes', () => {

                 describe('Appel de la fonction nextStep()', () => {

                  it('on devrait passer à l\'étape : enregistrement des votes', async () => {
                      let votingStatusBefore = await contract.status();
                      expect(votingStatusBefore).to.be.bignumber.equal(new BN(2));

                      let receipt = await contract.nextStep({from: owner});

                      let votingStatusAfter = await contract.status();
                      expect(votingStatusAfter).to.be.bignumber.equal(new BN(3));
                      await expectEvent(receipt, "VotingSessionStarted");
                  });

                  it('on devrait pouvoir voter pour une proposition', async () => {
                    let secondProposalBefore = await contract.loans(1);
                    expect(secondProposalBefore.voteCount).to.be.bignumber.equal(new BN(0));

                    let receipt = await contract.addVote(1, {from: whitelisted});

                    let secondProposalAfter = await contract.loans(1);
                    expect(secondProposalAfter.voteCount).to.be.bignumber.equal(new BN(100));
                    await expectEvent(receipt, "Voted", {entity: whitelisted, loanRequestId: new BN(1)});
                  });

                  it('on ne devrait pas pouvoir voter plusieurs fois avec le même compte', async () => {
                    await (expectRevert(contract.addVote(1, {from: whitelisted}), "Already voted"));
                  });

                  it('on ne devrait pas pouvoir accéder à la proposition gagante avec de Comptabiliser les votes', async() => {
                    await (expectRevert(contract.getWinningProposal(),"Not allowed"));
                  });

                  it('on devrait passer à l\'étape : fin de la session d\'enregistement des votes', async () => {
                    let votingStatusBefore = await contract.status();
                    expect(votingStatusBefore).to.be.bignumber.equal(new BN(3));

                    let receipt = await contract.nextStep({from: owner});
                    let votingStatusAfter = await contract.status();
                    expect(votingStatusAfter).to.be.bignumber.equal(new BN(4));
                    await expectEvent(receipt, "VotingSessionEnded");
                  });

                  it('on ne devrait pas pouvoir voter après la cloture de l\'enregistement', async () => {
                    await (expectRevert(contract.addVote(1, {from: whitelisted}),"Not allowed"));
                  });
                });
              });
          describe('On passe à l\'étape : Comptabiliser des votes', () => {

            it('on devrait pouvoir determiner la proposition gagante', async() => {
              let winingProposalId = await contract.getWinningProposalId();

              expect(winingProposalId).to.be.bignumber.equal(new BN(0));
              let receipt = await contract.getWinningProposal({from: owner});
              await expectEvent(receipt, "VotesTallied");
              winingProposalId = await contract.getWinningProposalId();
              expect(winingProposalId).to.be.bignumber.equal(new BN(1));
              let receiverAddress = await contract.getReceiverAddress();
              expect(receiverAddress).to.be.equal(project1);
            });

                describe('Appel de la fonction nextStep()', () => {

                  it('on devrait passer à l\'étape : Comptabiliser les votes', async () => {
                      let votingStatusBefore = await contract.status();
                      expect(votingStatusBefore).to.be.bignumber.equal(new BN(4));

                      let receipt = await contract.nextStep({from: owner});

                      let votingStatusAfter = await contract.status();
                      expect(votingStatusAfter).to.be.bignumber.equal(new BN(5));

                  });

                });
              });

  });
});
