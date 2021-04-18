import React, { useState, useEffect } from "react";
import OracleSimplePair from "./build/contracts/OracleSimplePair.json";
import Stacking from "./build/contracts/Stacking.json";
import getWeb3 from "./getWeb3";
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
<<<<<<< HEAD
// import {useToasts} from 'react-toast-notifications';
// import { ChainId, Fetcher, Route, Trade, TokenAmount, TradeType, WETH } from '@uniswap/sdk'
=======
import {useToasts} from 'react-toast-notifications';
import { ChainId, Fetcher, Route, Trade, TokenAmount, TradeType, WETH } from '@uniswap/sdk'
>>>>>>> 301a359bef8be200d1344f847daa9c156776a200
import getMessageError from './getMessageError'


const getContract = async (contract) => {
  const web3 = await getWeb3();

  // Get the contract instance.
  const networkId = await web3.eth.net.getId();
  const deployedNetwork = contract.networks[networkId];
  const instance = new web3.eth.Contract(
    contract.abi,
    deployedNetwork && deployedNetwork.address,
  );

  return instance;
}

function Admin({ account, setMsg }) {
  const [addr1, setAddr1] = useState(0);
  const [addr2, setAddr2] = useState(0);
  const [amount, setAmount] = useState(0);
  const [outputValue, setOutputValue] = useState(0);
  const [tolerance, setTolerance] = useState(0);
  const [balance, setBalance] = useState(0);




  const approveUni = async() => {
    const contract = await getContract(Stacking);
    const web3 = await getWeb3();
    const amountDcm = await contract.methods.getAmountDcm(amount);
    const approved = await contract.methods.approveERC20Uni(addr1,amountDcm).send({ from: account }, async function(err, tx) {
      if (tx) {
        console.log(tx);
        await web3.eth.getTransactionReceipt(tx, async function(err, receipt) {
          console.log(receipt);

          if(receipt.status){
            setMsg(`Vous avez alloué ${approved}`);
          }
        })
      }
      else if (err) {
        console.log(err);
        setMsg('error');
      }
    });
  }



  const balanceView = async () => {
    console.log(addr1);
    const contract = await getContract(Stacking);
    const web3 = await getWeb3();
    const balanceCall = await contract.methods.getBalance(addr1).call({ from: account});
            setBalance(Number(balanceCall));
            setMsg(`balance actualisée : ${balance}`);
    }

    const transfer = async() => {
      const contract = await getContract(Stacking);
      const web3 = await getWeb3();
      const amountDcm = await contract.methods.getAmountDcm(addr1,amount).call();
      console.log(amountDcm);
      const transferERC20 = await contract.methods.transferERC20(addr1,amountDcm).send(
        {from :account}).on('error', function(error){
          setMsg('error');
          })
          .then(function(tx) {
            setMsg(`transfered ${amountDcm}`);
          });

    }

  const updatePrice = async() => {
    const contract = await getContract(OracleSimplePair);
    const web3 = await getWeb3();
    await contract.methods.update().send({ from: account }).on('error', function(error){
      setMsg('error');
      })
      .then(function(tx) {
        setMsg(`prices updated`);
      });

    }

  const convert = async() => {
    let contract = await getContract(Stacking);
    const web3 = await getWeb3();
    const amountDcm = await contract.methods.getAmountDcm(addr1,amount);
    const amountIn = Number(amountDcm);
    console.log(amountDcm);
    contract = await getContract(OracleSimplePair);
    const output = await contract.methods.consult(addr1,amount).call({ from: account }, function(error, result) {
      if (error ==null) {
        setMsg(`prices updated`);
        setOutputValue(Number(result));
        console.log(outputValue);
      } else {
        setMsg(`error`);
        }
      });

    }

//   const convert = async () => {
//     const tokenA = await Fetcher.fetchTokenData(ChainId.KOVAN, addr1, 18);
//     const tokenB = await Fetcher.fetchTokenData(ChainId.KOVAN, addr2, 18);
//
//     const pair = await Fetcher.fetchPairData(tokenA, tokenB);
//     const route = new Route([pair], tokenA);
//
//     const trade = new Trade(route, new TokenAmount(tokenA,amount), TradeType.EXACT_INPUT);
//     console.log(trade.executionPrice.toSignificant(6))
//     console.log(trade.nextMidPrice.toSignificant(6))
// }


  const swap = async() => {
    const contract = await getContract(Stacking);
    const web3 = await getWeb3();
    let amountDcm = await contract.methods.getAmountDcm(addr1,amount).call();
    let amountMin = await contract.methods.getAmountMin(amountDcm, tolerance).call();
    let currentDate = await web3.eth.getBlock('latest').timestamp;
    let deadline = currentDate + 180; //set deadline at 3min;
    let swap = await contract.methods.swapTokens(addr1,addr2,amountDcm,amountMin,deadline).send({ from: account }, async function(err, tx) {
      if (tx) {
        console.log(tx);
        await web3.eth.getTransactionReceipt(tx, async function(err, receipt) {
          console.log(receipt);

          if(receipt.status){
            setMsg(`Vous avez swap ${amountMin}`);
          }
        })
      }
      else if (err) {
        console.log(err);
        setMsg('error');
      }
    });
  }

  return (
    <div>
      <Grid item>
        <a href="/">Jump_To_Public</a>
      </Grid>
      <h2>Administration</h2>
      <form noValidate autoComplete="off">
        <Grid direction="column" container spacing={3} style={{ paddingTop: "100px" }}>
          <Grid item>
            <h4>TokenPair</h4>
          </Grid>
          <Grid item>
            <TextField id="standard-basic" label="AdresseTokenA" defaultValue='0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa' onChange={({ target }) => setAddr1(target.value)}/>
          </Grid>
          <Grid item>
            <TextField id="standard-basic" label="AdresseTokenB" defaultValue='0x1f9840a85d5af5bf1d1762f925bdaddc4201f984' onChange={({ target }) => setAddr2(target.value)}/>
          </Grid>
          <Grid item>
            <Button color="secondary" onClick={() => balanceView()}>
              balance
            </Button>
          </Grid>
        </Grid>
      </form>
      <Grid direction="column" container spacing={3} style={{ paddingTop: "100px" }}>
        <Grid item>
          <h4>SWAP & MANAGE LIQUIDITY</h4>
        </Grid>
<<<<<<< HEAD
       
=======
        <Grid item>
        <TextField id="standard-basic" label="TokenA" onChange={async ({target}) => await setAmount(target.value).then() => convert()}/> //enchainement fonction ? async ?
      </Grid>
>>>>>>> 301a359bef8be200d1344f847daa9c156776a200
      <Grid item>
      <input
                type="number"
                rowsMin={6}
                id="standard-basic"
                label="TokenB"
                defaultValue={outputValue}
                onChange={({ target }) => setOutputValue(target.value)}
              />
        </Grid>
        <Grid item>
            <Button variant="contained" color="secondary" onClick={() => swap()}>
              SWAP
            </Button>
            <Button variant="contained" color="secondary" onClick={() => transfer()}>
              TRANSFER
            </Button>
            <Button variant="contained" color="primary" >
              ADD LIQUIDITY
            </Button>
        </Grid>
        <Grid item>
        <Button variant="contained" color="secondary" onClick={() => updatePrice()}>
          updatePrices
        </Button>
        <Grid item>
        <input
                  type="number"
                  rowsMin={6}
                  id="standard-basic"
                  label="tolerance"
                  onChange={({ target }) => setTolerance(target.value)}
                />
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}

export default Admin;
