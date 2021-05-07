import React, { useState, useEffect } from "react";
import { makeStyles, useTheme, ThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import AdminVoting from "./UserVoting";
import { TextareaAutosize } from "@material-ui/core";
import PropTypes from 'prop-types';
import SwipeableViews from 'react-swipeable-views';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Borrow from "./build/contracts/Borrow.json";
import getWeb3 from "./getWeb3";
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


  function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`full-width-tabpanel-${index}`}
        aria-labelledby={`full-width-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box p={3}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }

  TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
  };

  function a11yProps(index) {
    return {
      id: `full-width-tab-${index}`,
      'aria-controls': `full-width-tabpanel-${index}`,
    };
  }

  const theme = createMuiTheme({
  palette: {
    primary: green,
    secondary: amber,
  },
});

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    maxWidth: 600,
    maxheight: 500,
  },
  media: {
    height: 200,
  },
}));

function UserVoting({ account, setMsg }) {
  const classes = useStyles();
  const steps = [
  "Registering Voters",
  "Registration proposal's Started",
  "Registration proposal's Ended",
  "Voting session started",
  "Voting session Ended",
  "Votes Tailed"
];
  const [activeStep, setActiveStep] = useState(0);
  const [picture, setPicture] = useState(null);
  const [value, setValue] = useState(0);
  const [users, setUsers] = useState([]);

  useEffect(() => {
  const getStep = async () => {
    const contract = await getContract(Borrow);
    const response = await contract.methods.status().call();
    setActiveStep(Number(response));
  }

  getStep();
  getVoters();
}, []);

function getStepContent(stepIndex) {
switch (stepIndex) {
  case 0:
    return "Solipay is currently registering voters";
  case 1:
    return "Solipay is currently registering project proposals";
  case 2:
    return "Solipay is currently setting the voting session";
  case 3:
    return "Voting session is live now, vote for the project of your choice";
  case 4:
    return "Solipay is currently tailing votes";
  case 5:
    return "Here there is the new project to fund";
  default:
    return "Unknown stepIndex";
  }
}

const getVoters =  async() => {
    const contract = await getContract(Borrow);
    const web3 = await getWeb3();
    const entities = await contract
    .getPastEvents
    ("EntityRegistered",
    {fromBlock: '24637147',
    toBlock: 'latest'});
    const voters = entities[0].returnValues.soliAddress;
    const votersInfo = [];
    for (let i = 0; i < voters.length; i++) {
      let votingPower = await contract.methods.getVotersPower(voters[i]).call();
      votingPower = web3.utils.fromWei(votingPower, "ether");
      console.log(votingPower);
      let id = await contract.methods.getVotersProp(voters[i]).call();
      votersInfo.push({
        voter: voters[i],
        power: votingPower,
        proposal: id,
      })
    }
    setTimeout(() => {
      setUsers(votersInfo);
    }, 1000)


    setUsers(voters);

    };

const vote = async(Id) => {
  const contract = await getContract(Borrow);
  const web3 = await getWeb3();
  const voted = await contract.methods
  .addVote(Id)
  .send({ from: account })
  .on("error", function (error) {
    setMsg("error");
  })
  .then(function (tx) {
    setMsg(`Vote Cast !`);
  });
};

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index) => {
    setValue(index);
  };


  return (
          <Grid
            direction="column"
            container
            spacing={3}
            style={{ paddingTop: "50px"}}
          >
          <ThemeProvider theme={theme}>
          <Grid item>
        <h4 className="homeText">Voting Steps</h4>
      </Grid>
      <Grid item>
        <Stepper activeStep={activeStep} alternativeLabel  style={{ backgroundColor:"rgba(255, 255, 255, 0)" }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <br></br>
      <h4 className="homeText">{getStepContent(activeStep)}</h4>
      </Grid>
      </ThemeProvider>
    <Grid item>
      <Grid className="center">
        <ThemeProvider theme={theme}>
        <div className={classes.root}>
          <AppBar position="static" color="default">
            <Tabs
              value={value}
              onChange={handleChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
              aria-label="full width tabs example"
            >
              <Tab label="1.UNICEF" {...a11yProps(0)} />
              <Tab label="2.AMNESTY" {...a11yProps(1)} />
              <Tab label="3.GREENPEACE" {...a11yProps(2)} />
            </Tabs>
          </AppBar>
          <SwipeableViews
            axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
            index={value}
            onChangeIndex={handleChangeIndex}
          >
            <TabPanel value={value} index={0} dir={theme.direction}>
              <Card className={classes.root}>
                <CardActionArea>
                  <CardMedia
                    className={classes.media}
                    image="./cov19.jpeg"
                    title="unicef"
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">
                      UNICEF
                    </Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      component="p"
                    >
                      The COVID-19 pandemic has upended the lives of children and their families across the globe.
                      UNICEF is working with experts to promote facts over fear, bringing reliable guidance to parents,
                      caregivers and educators, and partnering with front-line responders to ensure they have the information
                      and resources they need to keep children healthy and learning.
                    </Typography>
                  </CardContent>
                </CardActionArea>
                <CardActions>
                  <Button size="large" color="primary" disabled={activeStep !== 3} onClick={() => vote(1)}>
                    VOTE
                  </Button>
                  <Button size="large" color="secondary" href="https://www.msf.fr/decouvrir-msf/qui-sommes-nous">
                    Learn More
                  </Button>
                </CardActions>
              </Card>
            </TabPanel>
            <TabPanel value={value} index={1} dir={theme.direction}>
              <Card className={classes.root}>
                <CardActionArea>
                  <CardMedia
                    className={classes.media}
                    image="./amnesty.png"
                    title="amnesty"
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">
                      AMNESTY
                    </Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      component="p"
                    >
                      Through our detailed research and determined campaigning,
                      we help fight abuses of human rights worldwide. We bring torturers to justice.
                      Change oppressive laws. And free people jailed just for voicing their opinion.
                      Our experts do accurate, cross-checked research into human rights violations by
                      governments and others worldwide. We use our analysis to influence and press governments,
                       companies and decision-makers to do the right thing.
                    </Typography>
                  </CardContent>
                </CardActionArea>
                <CardActions>
                  <Button size="large" color="primary" disabled={activeStep !== 3} onClick={() => vote(2)}>
                    VOTE
                  </Button>
                  <Button size="large" color="secondary" href="https://www.amnesty.org/en/what-we-do/">
                    Learn More
                  </Button>
                </CardActions>
              </Card>
            </TabPanel>
            <TabPanel value={value} index={2} dir={theme.direction}>
              <Card className={classes.root}>
                <CardActionArea>
                  <CardMedia
                    className={classes.media}
                    image="./greenPeace.jpeg"
                    title="greenpeace"
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">
                      GREENPEACE
                    </Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      component="p"
                      GREENPEACE
                    >
                    We want to live on a healthy, peaceful planet.
                    A planet where forests flourish, oceans are full of life and where once-threatened animals safely roam.
                    Where our quality of life is measured in relationships, not things. Where our food is delicious,
                     nutritious, and grown with love. Where the air we breathe is fresh and clear. Where our energy is as clean as a mountain stream. Where everyone has the security, dignity and joy we all deserve.
                     It’s all possible. We can’t make it happen alone, but have no doubt: We can do it together.
                    </Typography>
                  </CardContent>
                </CardActionArea>
                <CardActions>
                  <Button size="large" color="primary" disabled={activeStep !== 3} onClick={() => vote(3)}>
                    VOTE
                  </Button>
                  <Button size="large" color="secondary" href="https://www.greenpeace.org/international/explore/about/about-us/">
                    Learn More
                  </Button>
                </CardActions>
              </Card>
            </TabPanel>
          </SwipeableViews>
        </div>
    </ThemeProvider>
    </Grid>
  </Grid>
  <Grid item>
      <Grid className="cardContentCentered">
        Voters List
        <ul>
          {users.map(users =>
          <li key="{users}"> Address {users.voter} Voting Power {users.power} Voted {users.proposal}</li>
          )}
        </ul>
      </Grid>
  </Grid>
</Grid>



  );
}

export default UserVoting;
