import React, { useState, useEffect } from "react";
import getWeb3 from "./getWeb3";
import TextareaAutosize from "@material-ui/core/TextareaAutosize";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import "./App.css";
import ProxySimple from "./build/contracts/ProxySimple.json";
import Stacking from "./build/contracts/Stacking.json";
import { GridList } from "@material-ui/core";

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

function Public({ account, setMsg }) {
  // Function deposite => params : Nbjour & montant
  const [montant, setMontant] = useState(0);
  // CI DESSOUS function retrait en attente True/False
  //const [withdrawPending, setWithdrawPending] = useState(false);
  const [deposit, setDeposit] = useState(0);
  // retrait
  const [montantRetirer, setMontantRetirer] = useState(0);

  const [clients, setClients] = useState([]);

  useEffect(() => {
    const balanceView = async () => {
      let contract = await getContract(ProxySimple);
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const xDeposit = await contract.methods
        .getUserDeposits(accounts[0])
        .call();
      const x = await contract.methods.updateXprice(0).call();
      const depositTotal = Number(xDeposit) * Number(x);
      setDeposit(depositTotal);
    };

    balanceView();
  }, []);

  // FONCTION VALIDATION DE PAIMENT
  const ValidePaiment = () => {
    console.log("DEPOT ", montant);
  };

  // Fonction Retrait
  const Retrait = () => {
    console.log("----------Retrait en cours ", setMontantRetirer);
  };

  // Rappelle les ".call" c'est juste pour voir "quand la function du contrat est en view"
  // .Send c'est pour modifier l'etat de la function
  const deposite = async () => {
    const contract = await getContract(ProxySimple);
    const web3 = await getWeb3();
    const depot = await contract.methods
      .deposit(montant)
      .send({ from: account })
      .on("error", function (error) {
        setMsg("error");
      })
      .then(function (tx) {
        setMsg(`Deposite ${montant}`);
        console.log(tx);
      });
  };

  // Function retrait
  const Withdraw = async () => {
    const contract = await getContract(ProxySimple);
    const web3 = await getWeb3();
    const retirer = await contract.methods
      .withdrawPending(montantRetirer)
      .send({ from: account })
      .on("error", function (error) {
        setMsg("error");
      })
      .then(function (tx) {
        setMsg(`Retrait ${montantRetirer}`);
        console.log(tx);
      });
  };

  return (
    <Grid ClassName="principalGrid">
      <Grid ClassName="logo">
        <img width="208" src="solipay.png" href="." alt="solipay-Logo" />
      </Grid>
      <Grid ClassName="basculer">
        <a href="/admin">Move towards Admin </a>
      </Grid>

      <Grid ClassName="Aider">
        <h4>Help an association </h4>
      </Grid>

      <Grid className="unicef">
        <h3>
          UNICEF <br></br>
          <br></br>
          Make a donation
        </h3>

        <Grid ClassName="imageUni">
          <img width="308" src="unicef.png" href="." alt="logo association " />
        </Grid>
      </Grid>

      <Grid item>
        <Grid className="usdc">
          {" "}
          the amounts deposited <br></br>
          {deposit} USDC
        </Grid>
      </Grid>
      <Grid item>
        <form noValidate autoComplete="off">
          <Grid
            direction="column"
            container
            spacing={3}
            style={{ paddingTop: "100px" }}
          >
            <Grid className="carte">
              Amount you would like to deposit
              <Grid>
                {" "}
                <br></br>
                <input
                  type="number"
                  rowsMin={6}
                  id="standard-basic"
                  label="Adresse"
                  onChange={({ target }) => setMontant(target.value)}
                />
              </Grid>
              <br></br>
              <Grid>
                <Button
                  variant="contained"
                  color="red"
                  onClick={() => deposite()}
                >
                  validate the payment
                </Button>
              </Grid>
              <br></br>
              Withdrawal request
              <Grid item>
                <br></br>
                <input
                  type="number"
                  rowsMin={6}
                  id="standard-basic"
                  label="Adresse"
                  onChange={({ target }) => setMontantRetirer(target.value)}
                />
              </Grid>
              <Grid item>
                <br></br>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => Withdraw()}
                >
                  Send request
                </Button>
              </Grid>
              <br></br>
              <br></br>
            </Grid>
          </Grid>
        </form>
      </Grid>
    </Grid>
  );
}

export default Public;
