import React, { useState, useEffect } from "react";
import getWeb3 from "./getWeb3";
import TextareaAutosize from "@material-ui/core/TextareaAutosize";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import "./App.css";
import ProxySimple from "./build/contracts/ProxySimple.json";
//import ProxySimple from "";

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
  const [nbjour, setNbjour] = useState(0);
  //const [withdrawPending, setWithdrawPending] = useState(false);

  const [clients, setClients] = useState([]);
  const [activeStep, setActiveStep] = useState(0);

  // FONCTION VALIDATION DE PAIMENT
  const ValidePaiment = () => {
    console.log("NOMBRE DE JOUR ",nbjour);
    console.log("L'OSEILE QUI A ETE MIS EN PLACE ", montant);
  };

  // call function view poour voir letat de la boockchain
  const deposite = async () => {
    const contract = await getContract(ProxySimple);
    console.log("ligne43-----------------", deposite);
    const web3 = await getWeb3();
    console.log("ligne45-----------------", web3);
    const depot = await contract.methods
      .deposite(montant, nbjour)
      .send({ from: account })
      .on("error", function (error) {
        setMsg("error");
      })
      .then(function (tx) {
        setMsg(`Deposite ${(montant, nbjour)}`);
        console.log("ligne54 ");
        console.log("transac ligne 55",tx);
      });
  };

// ---------------------------------------------
 // Function de retrait en attente 
//  const withdrawPending = async () => {
//   const contract = await getContract(ProxySimple);
//   console.log("ligne43-----------------", withdrawPending);
//   const web3 = await getWeb3();
//   console.log("ligne45-----------------", web3);
//   const depot = await contract.methods
//     .withdrawPending(withdrawalAmount)
//     .send({ from: account })
//     .on("error", function (error) {
//       setMsg("error");
//     })
//     .then(function (tx) {
//       setMsg(`WithdrawPending ${(withdrawalAmount}`);
//       console.log("ligne54 ");
//       console.log("transac ligne 55",tx);
//     });
// };





  // call function view poour voir letat de la boockchain
  // const deposite = async () => {
  //   const contract = await getContract(ProxySimple);

  //   console.log("ligne44-----------------",deposite)
  //   const web3 = await getWeb3();

  //   console.log("ligne47-----------------",web3)
  //   const depot = await contract.methods
  //     .deposite(montant, nbjour)
  //     .send({ from: account})
  //     .on("error", function (error) {
  //       console.log("ligne52 ",depot)
  //       setMsg("error");
  //     })
  //     .then(function (tx) {
  //       setMsg(`Deposite ${(montant, nbjour)}`);
  //       console.log("ligne55 ",depot) });
  // };

  // // FONCTION A  CREER
  // const Deposite = async () => {
  //   const contract = await getContract(Voting)
  //   const web3 = await getWeb3()

  //   await contract.methods.Deposite(montant).send({ from: account }, async function (err, tx) {
  //       if (tx) {
  //         console.log(tx)
  //         await web3.eth.getTransactionReceipt(tx, async function (
  //           err,
  //           receipt,
  //         ) {
  //           console.log(receipt)

  //           if (receipt.status) {
  //             setMontant('')
  //             setProposals([...proposals,  { description: montant, voteCount: 0 },])
  //             setMsg('Votre proposition a été enregistrée !')
  //           }
  //         })
  //       } else if (err) {
  //         console.log(err)
  //         setMsg('error')
  //       }
  //     })
  // }
  // FONCTION A CREER
  // const vote = async (i) => {
  //   const contract = await getContract(Voting)
  //   const web3 = await getWeb3()

  //   await contract.methods
  //     .vote(i + 1)
  //     .send({ from: account }, async function (err, tx) {
  //       if (tx) {
  //         console.log(tx)
  //         await web3.eth.getTransactionReceipt(tx, async function (
  //           err,
  //           receipt,
  //         ) {
  //           console.log(receipt)

  //           if (receipt.status) {
  //             setMsg('Votre vote a été enregistré !')
  //           }
  //         })
  //       } else if (err) {
  //         console.log(err)
  //         setMsg('error')
  //       }
  //     })
  // }
  // FRONT FFFF
  return (
    <Grid
      ClassName="principalGrid"
      direction="column"
      container
      spacing={3}
      style={{ padding: "100px" }}
    >
      <Grid item>
        <a href="/admin">Vous etes sur le public </a>
      </Grid>
      <Grid item>
        <h4>Aider l'association du moment </h4>
      </Grid>
      <Grid item>
        <Card className="association">
          <h4>
            UNICEF
            <h6>
              Faîtes un don en ligne. C'est grâce à vous que nous construisons
              un avenir meilleur pour les enfants !
            </h6>
          </h4>
        </Card>
      </Grid>
      <Grid item>
        <form noValidate autoComplete="off">
          <Grid
            direction="column"
            container
            spacing={3}
            style={{ paddingTop: "100px" }}
          >
            <Card
              direction="column"
              container
              spacing={3}
              style={{ paddingTop: "10px" }}
            >
              <Grid className="carte">
                <Grid item>
                  <h4>Nombre de nbjour d'interet ? </h4>
                </Grid>
                <Grid item>
                  <input
                    type="number"
                    rowsMin={6}
                    id="standard-basic"
                    label="Adresse"
                    onChange={({ target }) => setNbjour(target.value)}
                  />
                </Grid >
                <h4 className ="Montant" >Montant ? </h4>
                <Grid item>
                  <input
                    type="number"
                    rowsMin={6}
                    id="standard-basic"
                    label="Adresse"
                    onChange={({ target }) => setMontant(target.value)}
                  />
                </Grid>
                <br></br>
                <Grid> estimation du retour sur investissement </Grid>

                <Grid item>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => deposite()}
                  >
                    ValidePaiment
                  </Button>
                </Grid>
                <br></br>
                <br></br>
              </Grid>
            </Card>
          </Grid>
        </form>
      </Grid>

      <Grid item style={{ marginTop: 100 }}></Grid>
    </Grid>
  );
}

export default Public;
