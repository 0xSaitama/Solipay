// deployer un contrat et si il a des constructor il faut les deployer aussi
const Stacking = artifacts.require("Stacking");
const Oracle = artifacts.require("OracleSimplePair");
const ProxySimple = artifacts.require("ProxySimple");
module.exports = async function(deployer, _network, accounts) {

  const usdtAddress = "0x07de306ff27a2b630b1141956844eb1552b956b5";//kovan
  const factory = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"; //kovan

  //const factory = "0x0E32399AC960bEB625a29831704541F904fba998" //mumbai
  const daiAddress = "0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa";//kovan
  const uniRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";//kovan
  const wethAddress = "0xd0a1e359811322d97991e03f863a0c30c2cf029c";//kovan
  const expirationDate = 16179999999;
  const uniAddress = "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984";//kovan


 await deployer.deploy(Stacking, uniRouter);
 const stacking = await Stacking.deployed()
 await deployer.deploy(ProxySimple);
 await deployer.deploy(Oracle, factory, daiAddress, uniAddress);
 //let stacking = await Stacking.deployed()
//const oracle = await OracleSimplePair.deployed();
 // await MyDeFi.approveStack(daiAddress,MyDeFi.address,10);
 // const balanceWBefore = await MyDeFi.getbalance(wethAddress, accounts[0]);
 // const balanceDBefore = await MyDeFi.getBalance(daiAddress, accounts[0]);
 //let update = await oracle.update()
 // let amountmin = await oracle.consult(daiAddress,10000000000)
 // let approveDai = await stacking.approveERC20Uni(daiAddress,10000000000)
  //  let approveUni = await stacking.approveERC20Uni(uniAddress,10000000000)
  // let transferDai = await stacking.transferERC20(daiAddress,10000000000)
  // let transferUni = await stacking.transferERC20(uniAddress,amountmin)
 // await stacking.swapTokensForEth(daiAddress, 10, amountmin , 60);
 // const balanceWAfter = await MyDeFi.getbalance(wethAddress, accounts[0]);
 // const balanceDAfter = await MyDeFi.getbalance(daiAddress, accounts[0]);
 // let add = await stacking.addLiquidity(daiAddress,uniAddress,10000000000,amountmin,8000000000,227149282,16179999999)
 // console.log(balanceWBefore.toString(), balanceDBefore.toString());
 // console.log(balanceWAfter.toString(), balanceDAfter.toString());

};
