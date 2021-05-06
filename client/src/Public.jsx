import React, { useState, useEffect } from "react";
import getWeb3 from "./getWeb3";
import moment from 'moment';
import TextareaAutosize from "@material-ui/core/TextareaAutosize";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardActions from "@material-ui/core/CardActions"
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import ArchiveIcon from '@material-ui/icons/Archive';
import HowToVoteIcon from '@material-ui/icons/HowToVote';
import "./App.css";
import ProxySimple from "./build/contracts/ProxySimple.json";
import Stacking from "./build/contracts/Stacking.json";
import { GridList } from "@material-ui/core";
import Borrow from "./build/contracts/Borrow.json";
import { ThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import { green, amber } from '@material-ui/core/colors';


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

const theme = createMuiTheme({
palette: {
  primary: green,
  secondary: amber,
},
});

function Public({ account, setMsg }) {
  // Function deposite => params : Nbjour & montant
  const [montant, setMontant] = useState(0);
  // CI DESSOUS function retrait en attente True/False
  //const [withdrawPending, setWithdrawPending] = useState(false);
  const [deposit, setDeposit] = useState(0);
  // retrait
  const [montantRetirer, setMontantRetirer] = useState(0);

  const [clients, setClients] = useState([]);

  const [record, setRecord] = useState([]);

  const [share, setShare] = useState(0);

  const [total, setTotal] = useState(0);

  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {

    balanceView();
    pastDeposits();
    getVotingPower();
    getPoolShare();
  }, []);

  useEffect(() => {
  const getStep = async () => {
    const contract = await getContract(Borrow);
    const response = await contract.methods.status().call();
    setActiveStep(Number(response));
  }

  getStep();
}, []);

  const balanceView = async () => {
    let contract = await getContract(ProxySimple);
    const web3 = await getWeb3();
    const accounts = await web3.eth.getAccounts();
    const xDeposit = await contract.methods
      .getUserDeposits(accounts[0])
      .call();
    const x = await contract.methods.updateXprice(0).call();
    const z = 1000000;
    let depositTotal = (Number(xDeposit) * Number(x))/ z;
    depositTotal = web3.utils.fromWei(depositTotal.toString(), "ether");
    setDeposit(depositTotal);
  }

  const approval = async () => {
    const contract = await getContract(ProxySimple);
    const web3 = await getWeb3();
    const amount = web3.utils.toWei(montant.toString(), 'ether');
    const appr = await contract.methods
    .approveStacking(amount)
    .send({ from: account })
    .on("error", function (error) {
      setMsg("error");
    })
    .then(function (tx) {
      setMsg(`approve ${montant}`);
      console.log(tx);
    });
  }

  const getVotingPower = async () => {
    const contract = await getContract(ProxySimple);
    const web3 = await getWeb3();
    const accounts = await web3.eth.getAccounts();
    let votingPower = await contract.methods.getUserDeposits(accounts[0]).call();
    votingPower = web3.utils.fromWei(votingPower.toString(), "ether");
    return votingPower;
  }

  const getPoolShare = async () => {
    const contract = await getContract(ProxySimple);
    const web3 = await getWeb3();
    let totalVotingPower = await contract.methods.getTotalVotingPower().call();
    totalVotingPower = web3.utils.fromWei(totalVotingPower.toString(), "ether");
    const vot = await getVotingPower();
    console.log(vot);
    const pourcentage = (vot * 100)/ totalVotingPower ;
    console.log(pourcentage);
    setTotal(totalVotingPower);
    setShare(pourcentage);
  }

  // Rappelle les ".call" c'est juste pour voir "quand la function du contrat est en view"
  // .Send c'est pour modifier l'etat de la function
  const deposite = async () => {
    const contract = await getContract(ProxySimple);
    const web3 = await getWeb3();
    const amount = web3.utils.toWei(montant, 'ether');
    const depot = await contract.methods
      .deposit(amount)
      .send({ from: account })
      .on("error", function (error) {
        setMsg("error");
      })
      .then(function (tx) {
        setMsg(`Deposite ${montant}`);
        console.log(tx);
      });
  }

  const pastDeposits = async () => {
    const contract = await getContract(ProxySimple);
    const web3 = await getWeb3();
    const accounts = await web3.eth.getAccounts();
    const depositsRecorded = await contract
    .getPastEvents
    ("validDeposit",
    {filter: {client: accounts[0]},
    fromBlock: '24637147',
    toBlock: 'latest'});
    let depositRecord = []
      for (let i = 0; i < depositsRecorded.length; i++) {
        let deposited = web3.utils.fromWei((depositsRecorded[i].returnValues.amount).toString(), "ether");
        let block = await web3.eth.getBlock(depositsRecorded[i].blockNumber);
        let date = block.timestamp;
        depositRecord.push({
          hash: depositsRecorded[i].transactionHash,
          client: depositsRecorded[i].returnValues.client,
          deposit: deposited,
          timestamp: moment(new Date(date*1000)).locale('fr').format('LL'),
          stamp: date
        })
      }
      setTimeout(() => {
        setRecord(depositRecord);
      }, 1000)

  }
  // Function retrait
  const Withdraw = async () => {
    const contract = await getContract(ProxySimple);
    const web3 = await getWeb3();
    const amount = web3.utils.toWei(montant, 'ether');
    const retirer = await contract.methods
      .withdrawPending(amount)
      .send({ from: account })
      .on("error", function (error) {
        setMsg("error");
      })
      .then(function (tx) {
        setMsg(`Retrait ${montantRetirer}`);
        console.log(tx);
      });
  }

  return (

    <Grid
      direction="column"
      container
      spacing={1}
      style={{ paddingTop: "50px"}}
    >
    <Grid item>
      <Grid className="cardContentHome">
        <img className="listStyle" src="bank.png" /> Solipay Deposit value : {total} DAI
      </Grid>
    </Grid>
    <Grid
      direction="row"
      container
      spacing={7}
      style={{ paddingTop: "40px" }}
    >
    <Grid item xs>
        <Grid className="cardContentLeft">
              <img className="listStyle" src="money-bag.png" /> Deposited Amount : {deposit} DAI
              <br></br>
              <br></br>
              <img className="listStyle" src="rocket.png" /> APY : 5 %
              <br></br>
              <br></br>
              <img className="listStyle" src="vote.png" /> Voting Power : {share} %
              <br></br>
              <br></br>
              <img className="listStyle" src="timer.png" /> Time Lock : 4 months
      </Grid>
    </Grid>
    <Grid item xs>
        <Grid className="cardContentRight">
          <img className="listStyle" src="gone$.png" /> Amount
            <br></br>
            <br></br>
          <input
            type="number"
            rowsMin={6}
            id="standard-basic"
            label="Amount"
            onChange={({ target }) => setMontant(target.value)}
          />
          <br></br>
          <br></br>
          <ThemeProvider theme={theme}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => deposite()}
          >
            Deposit
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => Withdraw()}
          >
            Withdraw
          </Button>
        </ThemeProvider>
          <br></br>
          <br></br>
      </Grid>
    </Grid>
  </Grid>
    <Grid item>
        <Grid className="cardContentCentered">
          Your Deposit History
          <ul>
            {record.map(record =>
            <li key="{record}"> Deposited {record.deposit} DAI the {record.timestamp} <br></br>transaction hash : {record.hash}</li>
            )}
          </ul>
        </Grid>
    </Grid>
    <Grid className="homeText"><b>Actual Project Funding</b>
      <h5 style={{ color: "red" }}>
    {activeStep === 3
      ? "A Voting Session to choose the new Project to fund is live Now !"
      : ""
    }
  </h5>
    </Grid>
      <Card className="fundation">
        <CardActionArea>
          <CardMedia
            component="img"
            alt="Actual Funding Project"
            height="300"
            image="https://www.msf.fr/sites/default/files/styles/social_large/public/2018-02/background-presentation.jpg"
            title="Actual organisation"
            />
          <CardContent>
        <Typography gutterBottom variant="h5" component="h2">
          Medecins sans Frontières
        </Typography>
        <Typography variant="body2" color="textSecondary" component="p">
          We provide medical assistance to people affected by conflict, epidemics, disasters, or exclusion from healthcare.
          Our teams are made up of tens of thousands of health professionals, logistic and administrative staff - most of them hired locally.
          Our actions are guided by medical ethics and the principles of impartiality, independence and neutrality.
        </Typography>
      </CardContent>
    </CardActionArea>
    <CardActions>
    </CardActions>
  </Card>
    </Grid>


  );
}

export default Public;
