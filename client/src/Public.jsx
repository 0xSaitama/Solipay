import React, { useState, useEffect } from 'react'
import getWeb3 from './getWeb3'
import TextareaAutosize from '@material-ui/core/TextareaAutosize'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'

  const getContract = async (contract) => {
  const web3 = await getWeb3()

  // Get the contract instance.
  const networkId = await web3.eth.net.getId()
  const deployedNetwork = contract.networks[networkId]
  const instance = new web3.eth.Contract(
    contract.abi,
    deployedNetwork && deployedNetwork.address,
  )

  return instance
  }

  function Public({ account, setMsg }) {
     
// Function deposite => params : Nbjour & montant
          const [montant, setMontant] = useState(0)
          const [nbjour, setNbjour] = useState(0)

          const [proposals, setProposals] = useState([])
          const [activeStep, setActiveStep] = useState(0)

// FONCTION VALIDATION DE PAIMENT
  const ValidePaiment = () => {
    console.log(nbjour)
    console.log(montant)
  }
// // FONCTION A  CREER 
//   const registerProposal = async () => {
//     const contract = await getContract(Voting)
//     const web3 = await getWeb3()

//     await contract.methods.registerProposal(montant).send({ from: account }, async function (err, tx) {
//         if (tx) {
//           console.log(tx)
//           await web3.eth.getTransactionReceipt(tx, async function (
//             err,
//             receipt,
//           ) {
//             console.log(receipt)

//             if (receipt.status) {
//               setMontant('')
//               setProposals([...proposals,  { description: montant, voteCount: 0 },])
//               setMsg('Votre proposition a été enregistrée !')
//             }
//           })
//         } else if (err) {
//           console.log(err)
//           setMsg('error')
//         }
//       })
//   }
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
    <Grid direction="column" container spacing={3} style={{ padding: '100px' }}>
      <Grid item>
        <a href="/admin">PARTIE PUBLIC </a>
      </Grid>
      <Grid item>
        <h4>Aider l'association du moment </h4>
      </Grid>
      <Grid item>
        <Card>
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
            style={{ paddingTop: '100px' }}
          >
         <Card direction="column" container spacing={3} style={{ paddingTop: "10px"}}>
            <Grid>
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
              </Grid>
              <h4>Montant ? </h4>
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

              <Grid item >
                <Button 
                  variant="contained"
                  color="primary"
                  onClick={() => ValidePaiment()}>
                  Valider mon placement
                </Button>
              </Grid>
              <br></br><br></br>
            </Grid>
            </Card>  


          </Grid>
        </form>
      </Grid>

      <Grid item style={{ marginTop: 100 }}></Grid>
     
    </Grid>
  )
}

export default Public
