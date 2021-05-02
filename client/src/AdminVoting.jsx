import React from "react";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import UserVoting from "./UserVoting";
import TextareaAutosize from '@material-ui/core/TextareaAutosize';

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

function getSteps() {
  return ["Opening of votes", "end of votes ", "Counting the votes"];
}

function getStepContent(stepIndex) {
  switch (stepIndex) {
    case 0:
      return "Ballots are open";
    case 1:
      return "is this the end of the votes";
    case 2:
      return "here is the winning association";
    default:
      return "Unknown stepIndex";
  }
}

export default function AdminVoting() {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const steps = getSteps();

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <Grid>
      <Grid className="totalgrid">
      <Grid item>
          <a href="/uservoting">Go To Public Voting</a>
          <br></br>
          <a href="/admin">Go To AdminControle</a>
        </Grid>
        <div>
          <img className="imagesolipayadminvoting" src="solipay.png" />
        </div>
        <div className="voteadmintext">administration of Solipay voting </div>
        <br></br>
      </Grid>

      <div className="partibass">
        <div className={classes.root} >
          <Stepper activeStep={activeStep} alternativeLabel style={{backgroundColor:"   rgba(247, 254, 255, 0.034)"}}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <div className="startnewvote">
            {activeStep === steps.length ? (
              <div>
                <Typography className={classes.instructions}>
                  UNICEF A GAGNER
                </Typography>
                <Button onClick={handleReset}>start new votes</Button>
              </div>
            ) : (
              <div className="millieu">
                <Typography className={classes.instructions}>
                  {getStepContent(activeStep)}
                </Typography>
                <div>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    className={classes.backButton}
                  >
                    back
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                  >
                    {activeStep === steps.length - 1 ? "Finish" : "next steps"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
     
      <TextareaAutosize
      rowsMax={4}
      aria-label="maximum height"
      placeholder="Maximum 4 rows"
      defaultValue="enregister your proposal "
    />
<br></br>
<Button variant="contained" color="primary">enregistrer la proposition </Button>


      <div className="photodugagnant">
        <img src="/unicef.png" />
      </div>
    </Grid>
  );
}

// export default AdminVoting;
