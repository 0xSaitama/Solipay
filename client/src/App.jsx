import React, { useState, useEffect } from "react";
import { useWallet, UseWalletProvider } from 'use-wallet';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import getWeb3 from "./getWeb3";
import Grid from "@material-ui/core/Grid";
import Snackbar from '@material-ui/core/Snackbar';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import GitHubIcon from '@material-ui/icons/GitHub';
import HowToVoteIcon from '@material-ui/icons/HowToVote';
import "./App.css";
import Admin from "./Admin";
import Public from "./Public";
import UserVoting from "./UserVoting";
import AdminVoting from "./AdminVoting";
import ProxySimple from "./build/contracts/ProxySimple.json";

const CHAIN_ID = 42;

function App() {
  const wallet = useWallet();

  const [account, setAccount] = useState(null);
  const [msg, setMsg] = useState();

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

  useEffect(() => {
    if (window.ethereum && window.ethereum.on) {
      window.ethereum.on('accountsChanged', () => {
        wallet.connect();
      });
    }
  }, [wallet]);

  useEffect(() => {
    const getAccounts = async () => {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();
      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0])
    };

    getAccounts();
  }, []);

  return (
    <div className="App">
      <AppBar position="static" className="AppBar">
        <Toolbar className="AppBar" >
          <IconButton edge="start" color="inherit" aria-label="home" href="/" >
            <img width="100" src="solipay.png" href="." alt="solipay-Logo" />
          </IconButton>
          <IconButton edge="start" color="inherit" aria-label="vote" href="/uservoting" >
            <img width="70" src="vote.png" href="." alt="vote-Logo"/>
          </IconButton>
          <IconButton edge="end" color="inherit" aria-label="github" href="https://github.com/0xSaitama/Solipay" >
            <GitHubIcon fontSize="large"/>
          </IconButton>
            <Button color="inherit">{account}</Button>
        </Toolbar>
      </AppBar>

      <Router>
        <Switch>
          <Route exact path="/">
            <Public account={account} setMsg={setMsg} />
          </Route>
          <Route path="/admin">
            <Admin account={account} setMsg={setMsg} />
          </Route>
          <Route exact path="/adminvoting">
            <AdminVoting account={account} setMsg={setMsg} />
          </Route>
          <Route exact path="/uservoting">
            <UserVoting account={account} setMsg={setMsg} />
          </Route>
        </Switch>
      </Router>
      <Snackbar autoHideDuration={6000} open={!!msg} onClose={() => setMsg(null)} message={msg}/>
    </div>
  );
}

export default () => (
  <UseWalletProvider chainId={CHAIN_ID}>
    <App/>
  </UseWalletProvider>
)
