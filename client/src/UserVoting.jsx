import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import AdminVoting from "./UserVoting";

const useStyles = makeStyles({
  root: {
    maxWidth: 345,
  },
  media: {
    height: 140,
  },
});

const UserVoting = () => {
  const classes = useStyles();

  return (
    <div className="cartog" >
        <Grid item>
          <a href="/adminvoting">Go To Admin Voting</a>
        </Grid>
      <div >
      <img  className=" imagesolipay" src="solipay.png"/>
      </div>

      <div >
      <img  className=" imagevote" src="vote.png"/>
      </div>
  
      <h1 className="votingtexte">vote for the association of your choice </h1>



      <br></br>

     
      <div>
      <Grid
  container
  direction="row"
  justify="center"
  alignItems="center"
>

          <div className="organisationglobal">
            <Card className={classes.root}>
              <CardActionArea>
                <CardMedia
                  className={classes.media}
                  image="./unicef.png"
                  title="Asssociation 1"
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="h2">
                    Help Me
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="p"
                  >
                    L'UOSSM garantit des soins médicaux de qualité aux pays
                    touchés par la guerre en Syrie. et dans les pays
                    limitrophes. Découvrez notre mission et nos actions. Plus
                    d'infos. Confiance. Transparence. Neutralité. Intégrité.
                    Caractéristiques: Transparence, Confiance, Neutralité.
                  </Typography>
                </CardContent>
              </CardActionArea>
              <CardActions>
                <Button size="small" color="primary">
                  JE VOTE
                </Button>
              </CardActions>
            </Card>
            <br></br>
            <br></br>

   
            <Card className={classes.root}>
              <CardActionArea>
                <CardMedia
                  className={classes.media}
                  image="./ensemble.jpeg"
                  title="Asssociation 1"
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="h2">
                    Help Me
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="p"
                  >
                    L'UOSSM garantit des soins médicaux de qualité aux pays
                    touchés par la guerre en Syrie. et dans les pays
                    limitrophes. Découvrez notre mission et nos actions. Plus
                    d'infos. Confiance. Transparence. Neutralité. Intégrité.
                    Caractéristiques: Transparence, Confiance, Neutralité.
                  </Typography>
                </CardContent>
              </CardActionArea>
              <CardActions>
                <Button size="small" color="primary">
                  JE VOTE
                </Button>
              </CardActions>
            </Card>
            <br></br>

            <br></br>

      <h5 style={{color:"white", fontFamily:"arial"}}> UNICEF </h5>
            <Card className={classes.root}>
              <CardActionArea>
                <CardMedia
                  className={classes.media}
                  image="./enfantPauvre.jpeg"
                  title="Asssociation 1"
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="h2">
                    Help Me
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="p"
                  >
                    L'UOSSM garantit des soins médicaux de qualité aux pays
                    touchés par la guerre en Syrie. et dans les pays
                    limitrophes. Découvrez notre mission et nos actions. Plus
                    d'infos. Confiance. Transparence. Neutralité. Intégrité.
                    Caractéristiques: Transparence, Confiance, Neutralité.
                  </Typography>
                </CardContent>
              </CardActionArea>
              <CardActions>
                <Button size="small" color="primary">
                  JE VOTE
                </Button>
              </CardActions>
            </Card>
          </div>
        </Grid>
        <br></br>
      </div>
    </div>
  );
};

export default UserVoting;
