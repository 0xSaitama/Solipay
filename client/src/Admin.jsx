import React, { useState, useEffect } from "react";
import OracleSimplePair from "./build/contracts/OracleSimplePair.json";
import Stacking from "./build/contracts/Stacking.json";
import ProxySimple from "./build/contracts/ProxySimple.json";
import getWeb3 from "./getWeb3";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";


import getMessageError from "./getMessageError";
import { rgbToHex } from "@material-ui/core";

const getContract = async (contract) => {
  const web3 = await getWeb3();

  // Get the contract instance.
  const networkId = await web3.eth.net.getId();
  const deployedNetwork = contract.networks[networkId];
  const instance = new web3.eth.Contract(
    contract.abi,
    deployedNetwork && deployedNetwork.address
  );

  return instance;
};

function Admin({ account, setMsg }) {
  const [addr1, setAddr1] = useState(
    "0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa"
  );
  const [addr2, setAddr2] = useState(
    "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984"
  );
  const [lpAddress, setlpAddress] = useState(
    "0xFA73472326E0e0128E2CA6CeB1964fd77F4AE78d"
  );
  const [addressContract, setAddressContract] = useState(
    "0x327F793f4008515Bebf9ec8b7DEcd6f02687f1D2"
  );
  const [proxyaddr, setProxyAddress] = useState(
    "0x466F4b0f1a563B071cE0423fAc04678976639093"
  );
  const [amount, setAmount] = useState(0);
  const [amount2, setAmount2] = useState(0);
  const [outputValue, setOutputValue] = useState(0);
  const [tolerance, setTolerance] = useState(0);
  const [balance1, setBalance1] = useState(0);
  const [balance2, setBalance2] = useState(0);
  const [symbol1, setSymbol1] = useState("TOKEN");
  const [symbol2, setSymbol2] = useState("TOKEN");
  const [lpAmount, setlpAmount] = useState(0);
  const [lpBalance, setLpBalance] = useState(0);
  const [lpPriceT0, setLpPriceT0] = useState(0);
  const [lpPriceT1, setLpPriceT1] = useState(0);
  const [decimal1, setDecimal1] = useState(18);
  const [decimal2, setDecimal2] = useState(18);

  useEffect(() => {
    // const decimals = async () => {
    //   const contract = await getContract(Stacking);
    //   const web3 = await getWeb3();
    //   const decimals1 = await contract.methods.getDecimals(addr1).call();
    //   const decimals2 = await contract.methods.getDecimals(addr2).call();
    //   setDecimal1(Number(decimals1));
    //   setDecimal2(Number(decimals2));
    // }

    const balanceView = async () => {
      const contract = await getContract(Stacking);
      const web3 = await getWeb3();
      const balanceCall1 = await contract.methods.getBalance(addr1).call();
      const balanceCall2 = await contract.methods.getBalance(addr2).call();
      const balanceLpCall = await contract.methods.getBalance(lpAddress).call();
      setBalance1(web3.utils.fromWei(balanceCall1.toString(), "ether"));
      setBalance2(web3.utils.fromWei(balanceCall2.toString(), "ether"));
      setLpBalance(web3.utils.fromWei(balanceLpCall.toString(), "ether"));
    };

    const getSymbols = async () => {
      const contract = await getContract(Stacking);
      const web3 = await getWeb3();
      const symbolA = await contract.methods.getSymbol(addr1).call();
      const symbolB = await contract.methods.getSymbol(addr2).call();
      setSymbol1(symbolA.toString());
      setSymbol2(symbolB.toString());
    };

    //decimals();
    balanceView();
    getSymbols();
  }, []);

  const amountMin = (x) => {
    let tolerated = (x * tolerance) / 100;
    let MinimalAmount = x - tolerated;
    return MinimalAmount;
  };

  const setContractAddress = async () => {
    let contract = await getContract(Stacking);
    const web3 = await getWeb3();
    //const addr = await contract.address;
    await contract.methods.setStackingAddress(addressContract).send({ from: account });
    contract = await getContract(ProxySimple);
    await contract.methods.setStackingAddress(addressContract).send({ from: account });
  };

  const TokenAd = async () => {
    const contract = await getContract(ProxySimple);
    await contract.methods.setTokenAd(addr1).send({from: account});
  }

  const setProxySimpleAddress = async () => {
    const contract = await getContract(Stacking);
    const web3 = await getWeb3();
    const addr = proxyaddr;
    await contract.methods.setProxyAddress(addr).send({ from: account });
  };

  const approveUni = async (address) => {
    const contract = await getContract(Stacking);
    const web3 = await getWeb3();
    const toApprove = web3.utils.toWei("999999", "ether");
    const approved = await contract.methods
      .approveERC20Uni(address, toApprove)
      .send({ from: account })
      .on("error", function (error) {
        setMsg("error");
      })
      .then(function (tx) {
        setMsg(`UniRouter approved ${amount}`);
      });
  };

  const approveProxy = async () => {
    const contract = await getContract(Stacking);
    const web3 = await getWeb3();
    const toApprove = web3.utils.toWei("999999", "ether");
    const approved = await contract.methods
      .approveProxy(addr1, toApprove)
      .send({ from: account })
      .on("error", function (error) {
        setMsg("error");
      })
      .then(function (tx) {
        setMsg(`UniRouter approved ${amount}`);
      });
  };

  const transfer = async () => {
    const contract = await getContract(Stacking);
    const web3 = await getWeb3();
    const transferERC20 = await contract.methods
      .transferERC20(addr1, proxyaddr, amount)
      .send({ from: account })
      .on("error", function (error) {
        setMsg("error");
      })
      .then(function (tx) {
        setMsg(`transfered ${amount}`);
      });
  };

  const sendLP = async () => {
    const contract = await getContract(Stacking);
    const web3 = await getWeb3();
    const amountDcm = web3.utils.toWei(amount, "ether");
    const send = await contract.methods
    .sendLP(addr1, account, amountDcm)
    .send({ from: account })
    .on("error", function (error) {
      setMsg("error");
    })
    .then(function (tx) {
      setMsg(`prices updated`);
    });
  };


  const updatePrice = async () => {
    const contract = await getContract(OracleSimplePair);
    const web3 = await getWeb3();
    await contract.methods
      .update()
      .send({ from: account })
      .on("error", function (error) {
        setMsg("error");
      })
      .then(function (tx) {
        setMsg(`prices updated`);
      });
  };

  const convert = async () => {
    let contract = await getContract(Stacking);
    const web3 = await getWeb3();
    contract = await getContract(OracleSimplePair);
    const toConvert = web3.utils.toWei(amount.toString(), "ether");
    const output = await contract.methods
      .consult(addr1, toConvert)
      .call({ from: account }, function (error, result) {
        if (error == null) {
          setMsg(`prices updated`);
        } else {
          setMsg(`error`);
        }
      });
    setOutputValue(web3.utils.fromWei(output.toString(), "ether"));
  };

  const stacking = async () => {
    const contract = await getContract(Stacking);
    const web3 = await getWeb3();
    let amountDesiredA = web3.utils.toWei(amount.toString(), "ether");
    let amountDesiredB = web3.utils.toWei(amount2.toString(), "ether");
    let amountMinA = web3.utils.toWei(amountMin(amount).toString(), "ether");
    let amountMinB = web3.utils.toWei(amountMin(amount2).toString(), "ether");
    let deadline = Date.now() + 180; //set deadline at 3min;
    const add = await contract.methods
      .addLiquidity(
        addr1,
        addr2,
        amountDesiredA,
        amountDesiredB,
        amountMinA,
        amountMinB,
        deadline
      )
      .send({ from: account })
      .on("error", function (error) {
        setMsg("error");
      })
      .then(function (tx) {
        console.log(tx);
        const Liquidity = Number(tx);
        setMsg(`liquidity added ${Liquidity}`);
      });
  };
  const lpPricing = async () => {
    const contract = await getContract(OracleSimplePair);
    const web3 = await getWeb3();
    const toPrice = web3.utils.toWei(lpBalance.toString(), "ether");
    const price = await contract.methods.getLpPrice(lpAddress, toPrice).call();
    setLpPriceT0(web3.utils.fromWei(price.toString(), "ether"));
    console.log(lpPriceT0);
  };

  const swap = async () => {
    const contract = await getContract(Stacking);
    const web3 = await getWeb3();
    let amountIn = web3.utils.toWei(amount.toString(), "ether");
    let amountOutMin = web3.utils.toWei(amountMin(amount2).toString(), "ether");
    let deadline = Date.now() + 180; //set deadline at 3min;
    let swap = await contract.methods
      .swapTokens(addr1, addr2, amountIn, amountOutMin, deadline)
      .send({ from: account })
      .on("error", function (error) {
        setMsg("error");
      })
      .then(function (tx) {
        console.log(tx);
        const swaped = Number(tx);
        setMsg(`swap confirmed you get ${swaped}`);
      });
  };

  const exitStaking = async () => {
    const contract = await getContract(Stacking);
    const web3 = await getWeb3();
    const liquidity = web3.utils.toWei(lpAmount.toString(), "ether");
    const amountAmin = web3.utils.toWei(amountMin(amount).toString(), "ether");
    const amountBmin = web3.utils.toWei(amountMin(amount2).toString(), "ether");
    let deadline = Date.now() + 180; //set deadline at 3min;
    const removed = await contract.methods
      .removeLiquidity(
        addr1,
        addr2,
        liquidity,
        amountAmin,
        amountBmin,
        deadline
      )
      .send({ from: account })
      .on("error", function (error) {
        setMsg("error");
      })
      .then(function (result) {
        console.log(result);
        setMsg(`removed liquidity ${removed}`);
      });
  };

  return (

 // VIEW
 <Grid
   direction="row"
   container
   spacing={5}
   style={{ paddingTop: "50px", paddingLeft: "50px"}}
 >
          <Grid item>
            <Grid className="settingCard">
            <Typography>
              <h2>Token Pair</h2>
              </Typography>
              <TextField
                id="standard-basic"
                label="AdresseTokenA"
                defaultValue="0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa"
                onChange={({ target }) => setAddr1(target.value)}
              />

            <Typography color="secondary" gutterBottom>
              <TextField
                id="standard-basic"
                label="AdresseTokenB"
                defaultValue="0x1f9840a85d5af5bf1d1762f925bdaddc4201f984"
                onChange={({ target }) => setAddr2(target.value)}
              />
            </Typography>
            <Typography color="secondary" gutterBottom>
              <TextField
                id="standard-basic"
                label="proxyAddress"
                defaultValue="0x21a0BF5f05b5AAab451e0B8c6D57145cc3240942"
                onChange={({ target }) => setProxyAddress(target.value)}
              />
            </Typography>
              <br></br>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => approveProxy()}
              >
                Approve
              </Button>
          </Grid>
        </Grid>
          <Grid item>
            <Grid className="settingCard">
              <Typography>
                <h2>Balance</h2>
              </Typography>
              <br></br>
              <Typography color="primary" gutterBottom>
                {balance1} {symbol1}
              </Typography>
              <br></br>
              <Typography color="primary" gutterBottom>
                {balance2} {symbol2}
              </Typography>
              <br></br>
              <Typography color="secondary" gutterBottom>
                {lpBalance} LP
              </Typography>
              <Typography color="secondary" gutterBottom>
                LP Value {lpPriceT0}
              </Typography>
              <br></br>
          </Grid>
        </Grid>
        <Grid item>
          <Grid className="settingCard">
            <Typography>
              <h2>Manage</h2>
            </Typography>
            <Typography color="secondary" gutterBottom>
              <input
                type="number"
                id="standard-basic"
                label="TokenA"
                onChange={async ({ target }) => await setAmount(target.value)}
              />{" "}
              <Button
                variant="contained"
                color="secondary"
                onClick={() => approveUni(addr1)}
              >
                Approve
              </Button>
            </Typography>
            <Typography color="secondary" gutterBottom>
              <input
                type="number"
                id="standard-basic"
                label="TokenB"
                placeholder={outputValue}
                onChange={async ({ target }) => await setAmount2(target.value)}
              />{" "}
              <Button
                variant="contained"
                color="secondary"
                onClick={() => approveUni(addr2)}
              >
                Approve
              </Button>
            </Typography>
            <Typography>estimated output {outputValue}</Typography>
            <Typography>
              <input
                type="number"
                id="standard-basic"
                label="LP"
                placeholder={lpAmount}
                onChange={async ({ target }) => await setlpAmount(target.value)}
              />{" "}
              <Button
                variant="contained"
                color="secondary"
                onClick={() => approveUni(lpAddress)}
              >
                Approve
              </Button>
            </Typography>
          </Grid>
        </Grid>
        <Grid item>
          <Grid className="settingCard">
            <Typography>
                  <h2>Operations</h2>
                </Typography>
                <Typography>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => swap()}
                  >
                    SWAP
                  </Button>
                </Typography>
                <br></br>
                <Typography>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => transfer()}
                  >
                    TRANSFER
                  </Button>
                </Typography>
                <br></br>
                <Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => stacking()}
                  >
                    ADD LIQUIDITY
                  </Button>
                </Typography>
                <br></br>
                <Typography>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => exitStaking()}
                  >
                    REMOVE LIQUIDITY
                  </Button>
                </Typography>
              </Grid>
            </Grid>
            <Grid item>
              <Grid className="settingCard">
                <Typography>
                  <h2>Settings</h2>
                </Typography>
                <br></br>
                <Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setContractAddress()}
                  >
                    Set Contract Address
                  </Button>
                </Typography>
                <br></br>
                <Typography>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => updatePrice()}
                  >
                    updatePrices
                  </Button>
                </Typography>
                <br></br>
                <Typography>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => convert()}
                  >
                    convert
                  </Button>
                </Typography>
                <br></br>
                <Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => lpPricing()}
                  >
                    Refresh LP Price
                  </Button>
                </Typography>
                <br></br>
                <Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => TokenAd()}
                  >
                    Token Accepted
                  </Button>
                </Typography>
                <br></br>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => sendLP()}
                  >
                    SEND LP
                  </Button>
                <Typography>
                  Tolerance
                  <input
                    type="number"
                    id="standard-basic"
                    label="tolerance"
                    onChange={({ target }) => setTolerance(target.value)}
                  />
                </Typography>
              </Grid>
            </Grid>
        </Grid>

  );
}

export default Admin;
