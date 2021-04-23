import React, { useState, useEffect } from "react";
import OracleSimplePair from "./build/contracts/OracleSimplePair.json";
import Stacking from "./build/contracts/Stacking.json";
import getWeb3 from "./getWeb3";
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import getMessageError from './getMessageError'
var bigInt = require("big-integer");

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
  const [addr1, setAddr1] = useState('0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa');
  const [addr2, setAddr2] = useState('0x1f9840a85d5af5bf1d1762f925bdaddc4201f984');
  const [lpAddress, setlpAddress] = useState('0xfa73472326e0e0128e2ca6ceb1964fd77f4ae78d')
  const [addressContract, setAddressContract] = useState('0xF3830e7711591c937157c92A209CccE34C741a52');
  const [amount, setAmount] = useState(0);
  const [amount2, setAmount2] = useState(0);
  const [outputValue, setOutputValue] = useState(0);
  const [tolerance, setTolerance] = useState(0);
  const [balance1, setBalance1] = useState();
  const [balance2, setBalance2] = useState();
  const [lpBalance, setLpBalance] = useState(0);
  const [lpPriceT0, setLpPriceT0] = useState();
  const [lpPriceT1, setLpPriceT1] = useState(0);
  const [decimal1, setDecimal1] = useState(18);
  const [decimal2, setDecimal2] = useState(18);



useEffect(() => {

  const decimals = async () => {
    const contract = await getContract(Stacking);
    const web3 = await getWeb3();
    const decimals1 = await contract.methods.getDecimals(addr1).call();
    const decimals2 = await contract.methods.getDecimals(addr2).call();
    setDecimal1(Number(decimals1));
    setDecimal2(Number(decimals2));
  }

  const balanceView = async () => {
    const contract = await getContract(Stacking);
    const web3 = await getWeb3();
    const balanceCall1 = await contract.methods.getBalance(addr1).call();
    const balanceCall2 = await contract.methods.getBalance(addr2).call();
    const balanceLpCall = await contract.methods.getBalance(lpAddress).call();
    setBalance1(Number(balanceCall1)/(10**decimal1));
    setBalance2(Number(balanceCall2)/(10**decimal2));
    setLpBalance(Number(balanceLpCall)/(10**decimal2))
    }

  decimals();
  balanceView();

  }, []);

  const amountMin = (x) => {
    let tolerated = (x * tolerance) / 100 ;
    let MinimalAmount = x - tolerated;
    return MinimalAmount;
  }

  const setContractAddress = async () => {
    const contract = await getContract(Stacking);
    const web3 = await getWeb3();
    const addr = await contract.address;
    await contract.methods.setStackingAddress(addressContract).send({from: account});

    }

  const approveUni = async(address) => {
    const contract = await getContract(Stacking);
    const web3 = await getWeb3();
    const toApprove = "9999999999999999999999";
    const approved = await contract.methods.approveERC20Uni(address,toApprove).send({ from: account }).on('error', function(error){
      setMsg('error');
      })
      .then(function(tx) {
        setMsg(`UniRouter approved ${amount}`);
      });

    }



  // const balanceView = async (address) => {
  //   const contract = await getContract(Stacking);
  //   const web3 = await getWeb3();
  //   const balanceCall = await contract.methods.getBalance(address).call({ from: account});
  //   setBalance(Number(balanceCall));
  //   setMsg(`balance actualisée : ${balance}`);
  //   }

    const transfer = async() => {
      const contract = await getContract(Stacking);
      const web3 = await getWeb3();
      const transferERC20 = await contract.methods.transferERC20(addr1,amount).send(
        {from :account}).on('error', function(error){
          setMsg('error');
          })
          .then(function(tx) {
            setMsg(`transfered ${amount}`);
          });

    }

  const updatePrice = async() => {
    const contract = await getContract(OracleSimplePair);
    const web3 = await getWeb3();
    await contract.methods.update().send({from: account}).on('error', function(error){
      setMsg('error');
      })
      .then(function(tx) {
        setMsg(`prices updated`);
      });

    }

  const convert = async() => {
    let contract = await getContract(Stacking);
    const web3 = await getWeb3();
    contract = await getContract(OracleSimplePair);
    const toConvert = (amount*10**decimal1).toString();
    const output = await contract.methods.consult(addr1,toConvert).call({ from: account }, function(error, result) {
      if (error ==null) {
        setMsg(`prices updated`);

        console.log(outputValue);
      } else {
        setMsg(`error`);
        }
      });
      setOutputValue(Number(output)/10**18);
    }

    const stacking = async() => {
      const contract = await getContract(Stacking);
      const web3 = await getWeb3();
      let amountDesiredA = (Number(amount)*10**decimal1).toString();
      let amountDesiredB = (Number(amount2)*10**decimal2).toString();
      let amountMinA = (amountMin(amount*10**decimal1)).toString();
      let amountMinB = (amountMin(amount2*10**decimal2)).toString();
      let deadline = Date.now() + 180; //set deadline at 3min;
      const add = await contract.methods.addLiquidity(addr1,addr2,amountDesiredA,amountDesiredB,amountMinA,amountMinB,deadline).send({from:account})
      .on('error', function(error){
        setMsg('error');
        })
        .then(function(tx) {
          console.log(tx);
          const Liquidity = Number(tx);
          setMsg(`liquidity added ${Liquidity}`);
        });
    }
  const lpPricing = async() => {
    const contract = await getContract(OracleSimplePair);
    const web3 = await getWeb3();
    const toPrice = (Number(lpBalance)*10**decimal1).toString();
    const price = await contract.methods.getLpPrice(lpAddress, toPrice).call();
      setLpPriceT0(Number(price));
      console.log(lpPriceT0);
    }


  const swap = async() => {
    const contract = await getContract(Stacking);
    const web3 = await getWeb3();
    let amountIn = (Number(amount)*10**decimal1).toString();
    let amountOutMin = (amountMin(amount2*10**decimal2)).toString();
    let deadline = Date.now() + 180; //set deadline at 3min;
    let swap = await contract.methods.swapTokens(addr1,addr2,amountIn,amountOutMin,deadline).send({ from: account }).on('error', function(error){
      setMsg('error');
      })
      .then(function(tx) {
        console.log(tx);
        const swaped = Number(tx);
        setMsg(`swap confirmed you get ${swaped}`);
      });

    }

    const exitStaking = async () => {
      const contract = await getContract(Stacking);
      const web3 = await getWeb3();
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
            <Card>
              <CardContent>
                <Typography color="secondary" gutterBottom>
                  Balance1
                </Typography>
                <Typography color="primary" gutterBottom>
                  {balance1}
                </Typography>
                  <Typography color="secondary" gutterBottom>
                    Balance2
                  </Typography>
                  <Typography color="primary" gutterBottom>
                    {balance2}
                  </Typography>
                  <Typography color="secondary" gutterBottom>
                    Balance LP
                  </Typography>
                  <Typography color="primary" gutterBottom>
                    {lpBalance}
                  </Typography>
                  <Typography color="secondary" gutterBottom>
                    LP PRICE
                  </Typography>
                  <Typography color="primary" gutterBottom>
                    {lpPriceT0} {lpPriceT1}
                  </Typography>
                </CardContent>
            </Card>
          </Grid>
        </Grid>
      </form>
      <Grid direction="column" container spacing={3} style={{ paddingTop: "100px" }}>
        <Grid item>
          <h4>SWAP & MANAGE LIQUIDITY</h4>
        </Grid>
        <Grid item>
        <TextField id="standard-basic" label="TokenA" onChange={async ({target}) => await setAmount(target.value)}/>
      </Grid>
      <Grid item>
        <Card>
          <CardContent>
            <Typography color="secondary" gutterBottom>
              estimated price
            </Typography>
            <Typography color="primary" gutterBottom>
              {outputValue}
            </Typography>
          </CardContent>
        </Card>
          </Grid>
        <Grid item>
          <input
                    type="number"
                    id="standard-basic"
                    label="TokenB"
                    placeholder={outputValue}
                    onChange={async({target}) => await setAmount2(target.value)}
                  />
            </Grid>
            <Grid item>
            <Button variant="contained" color="secondary" onClick={() => swap()}>
              SWAP
            </Button>
            <Button variant="contained" color="secondary" onClick={() => transfer()}>
              TRANSFER
            </Button>
            <Button variant="contained" color="primary" onClick={() => stacking()}>
              ADD LIQUIDITY
            </Button>
        </Grid>
        <Grid item>
        <Button variant="contained" color="secondary" onClick={() => updatePrice()}>
          updatePrices
        </Button>
        <Button variant="contained" color="secondary" onClick={() => convert()}>
        convert
        </Button>
        <Button variant="contained" color="secondary" onClick={() => approveUni(addr1)}>
        Approve1
        </Button>
        <Button variant="contained" color="secondary" onClick={() => approveUni(addr2)}>
        Approve2
        </Button>
        <Button variant="contained" color="primary" onClick={() => setContractAddress()}>
          setContract
        </Button>
        <Button variant="contained" color="primary" onClick={() => lpPricing()}>
          Refresh LP Price
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
