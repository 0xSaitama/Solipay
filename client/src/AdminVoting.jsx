import React, { useState, useEffect } from "react";
import Grid from "@material-ui/core/Grid";
import { makeStyles, ThemeProvider, createMuiTheme, useTheme } from "@material-ui/core/styles";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import UserVoting from "./UserVoting";
import TextareaAutosize from "@material-ui/core/TextareaAutosize";
import Borrow from "./build/contracts/Borrow.json";
import getWeb3 from "./getWeb3";
import getMessageError from "./getMessageError";
import TextField from "@material-ui/core/TextField";
import { green, amber } from '@material-ui/core/colors';

const theme = createMuiTheme({
palette: {
  primary: green,
  secondary: amber,
  },
  });

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  backButton: {
    marginRight: theme.spacing(1),
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}));

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

function getSteps() {
  return [
    "Registering Voters",
    "Registration proposal's Started",
    "Registration proposal's Ended",
    "Voting session started",
    "Voting session Ended",
    "Votes Tailed"
  ];
}



function AdminVoting({ account, setMsg }) {
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const [addr, setAddr] = useState(0);
  const [description, setDescription] = useState(0);
  const [winning, setWinning] = useState(0);
  const steps = getSteps();

  useEffect(() => {
  const getStep = async () => {
    const contract = await getContract(Borrow);
    const response = await contract.methods.status().call();
    setActiveStep(Number(response));
  }

  getStep();
}, []);
  const next = async () => {
    const contract = await getContract(Borrow);
    const web3 = await getWeb3();
    const toNextStep = await contract.methods
    .nextStep()
    .send({ from: account })
    .on("error", function (error) {
      setMsg("error");
    })
    .then(function (tx) {
      setMsg(`passed to the next step`);
      setActiveStep(activeStep + 1);
    });
  };

  const registeringVoters = async () => {
    const contract = await getContract(Borrow);
    const web3 = await getWeb3();
    const voters = await contract.methods
      .setEntity()
      .send({ from: account})
      .on("error", function (error) {
        setMsg("error");
      })
      .then(function (tx) {
        setMsg(`voters are registred`);
        console.log(tx);

      });
    };

    const registerProposal = async () => {
      const contract = await getContract(Borrow);
      const web3 = await getWeb3();
      const voters = await contract.methods
        .registerLoanRequest(description, addr)
        .send({ from: account})
        .on("error", function (error) {
          setMsg("error");
        })
        .then(function (tx) {
          setMsg(`proposal registered`);
          console.log(tx);

        });
      };



    const winningProposal = async() => {
      const contract = await getContract(Borrow);
      const web3 = await getWeb3();
      const winning = await contract.methods
        .getWinningProposal()
        .send({ from: account })
        .on("error", function (error) {
          setMsg("error");
        })
        .then(function (tx) {
          setMsg(`wining proposal setted`);
          console.log(tx);

        });

      };

  return (
    <Grid
       direction="column"
       container
       spacing={3}
       style={{ paddingTop: "20px"}}
     >
      <ThemeProvider theme={theme}>
      <Grid className="totalgrid">
          <img className="imagesolipayadminvoting" src="solipay.png" />
      </Grid>
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            style={{ backgroundColor:"rgba(255, 255, 255, 0)" }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Grid item>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => next()}
                  >
                    NEXT
                  </Button>
          </Grid>
          <Grid
             direction="row"
             container
             spacing={3}
             style={{ paddingTop: "20px", paddingLeft: "500px"}}
           >
           <Grid item>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => registeringVoters()}
                  >
                    SET VOTERS
                  </Button>
            </Grid>
            <Grid item>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => winningProposal()}
                  >
                    winning proposal
                  </Button>
            </Grid>
          </Grid>


    <Grid item>
      <TextareaAutosize style={{backgroundColor:"white",borderRadius:"1%", width:"500px" ,height:"200px"}}
        rowsMax={4}
        aria-label="maximum height"
        placeholder="register your proposal"
        onChange={({ target }) => setDescription(target.value)}
      />
    </Grid>
    <Grid item>
      <TextField
        rowsMin={4}
        id="standard-basic"
        label="AdresseTokenB"
        placeholder="Project Ethereum address..."
        onChange={({ target }) => setAddr(target.value)}
      />
    </Grid>
    <Grid item>
      <Button variant="contained" color="primary" onClick={() => registerProposal()}>
        enregistrer la proposition{" "}
      </Button>
    </Grid>
    </ThemeProvider>
    </Grid>
  );
}
export default AdminVoting;
