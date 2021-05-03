import React, { useState } from "react";
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
import { TextareaAutosize } from "@material-ui/core";

// Card
const useStyles = makeStyles({
  root: {
    maxWidth: 545,
  },
  media: {
    height: 380,
  },
});

const UserVoting = () => {
  const classes = useStyles();
  const [picture, setPicture] = useState(null);
  // proposer une association
  const handlePicture = (e) => {
    setPicture(URL.createObjectURL(e.target.files[0]));
    console.log(picture);
  };

  return (
    <div className="cartog">
      <Grid item>
        {" "}
        // link to other page
        <a href="/adminvoting">Go To Admin Voting</a>
      </Grid>
      // image
      <div>
        <img className=" imagesolipay" src="solipay.png" />
      </div>
      <div>
        <img className=" imagevote" src="vote.png" />
      </div>
      <h1 className="votingtexte">vote for the association of your choice </h1>
      {/* // voting power of the voter depending on the funds invested */}
      <div className="powervoting">Your voting power is 154 {}</div>
      <br></br>
      <div>
        <Grid container direction="row" justify="center" alignItems="center">
          <div className="organisationglobal">
            <h5 style={{ color: "white", fontFamily: "arial" }}>
              {" "}
              Parrainage{" "}
            </h5>
            <Card className={classes.root}>
              <CardActionArea>
                <CardMedia
                  className={classes.media}
                  image="./giphy.gif"
                  title="Asssociation 1"
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="h2">
                    FAIRE PARRAINER UN ENFANT
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="p"
                  >
                    Le conseil municipal réfléchit à la création d’un cabinet
                    médical dans un beau bâtiment ancien de la rue du
                    Met-Jacquet, actuellement vacant. Objectif : développer à
                    l’horizon 2022 l’offre de soins dans la commune où se
                    trouvent déjà une pharmacie et un cabinet d’infirmiers.
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
            <h5 style={{ color: "white", fontFamily: "arial" }}>
              {" "}
              Soutenez les Syriens{" "}
            </h5>
            <Card className={classes.root}>
              <CardActionArea>
                <CardMedia
                  className={classes.media}
                  image="./guerresyrie.gif"
                  title="Asssociation 1"
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="h2">
                    STOP A LA GUERRE
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
            {/* // card N°3  */}
            <h5 style={{ color: "white", fontFamily: "arial" }}>
              {" "}
              Les Associations de chiens Guides d’Aveugles{" "}
            </h5>
            <Card className={classes.root}>
              <CardActionArea>
                <CardMedia
                  className={classes.media}
                  image="./chienguide.gif"
                  title="Asssociation 1"
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="h2">
                    CHIENS GUIDES PARIS
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="p"
                    CHIEN
                  >
                    A l’occasion de la période trouble que nous vivons
                    actuellement, nous avons encore plus besoin de vous. La
                    solidarité doit l’emporter sur tout, aidons ensemble des
                    personnes en situation de handicap visuel. Mobilisons-nous
                    pour des actions concrètes sur la base du volontariat.
                  </Typography>
                </CardContent>
              </CardActionArea>
              <CardActions>
                <Button size="small" color="primary">
                  JE VOTE
                </Button>
              </CardActions>
            </Card>

            {/* // propositiond e d'association  */}
            <h5 style={{ color: "white", fontFamily: "arial" }}>
              {" "}
              Proposer un projets associatif ?{" "}
            </h5>
            <Card className={classes.root}>
              <CardActionArea>
                <CardMedia
                  className={classes.media}
                  image={picture}
                  title="Asssociation 1"
                >
                  <div>
                    <input
                      type="file"
                      name="file"
                      onChange={(e) => handlePicture(e)}
                    />
                  </div>
                </CardMedia>

                <CardContent>
                  <Typography gutterBottom variant="h5" component="h2">
                    Description de l'association
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="p"
                    CHIEN
                  >
                    <TextareaAutosize
                      style={{ width: "300px", height: "500px" }}
                      placeholder="Detailler l'association que vous voudriez promouvoir  "
                    ></TextareaAutosize>
                  </Typography>
                </CardContent>
              </CardActionArea>
              <CardActions>
                <Button size="small" color="primary">
                  Send my proposal
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
