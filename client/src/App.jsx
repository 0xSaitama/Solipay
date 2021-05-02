import React, { useState, useEffect } from "react";
import { useWallet, UseWalletProvider } from 'use-wallet';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import getWeb3 from "./getWeb3";
import Snackbar from '@material-ui/core/Snackbar';

import "./App.css";
import Admin from "./Admin";
import Public from "./Public";
import UserVoting from "./UserVoting"
import AdminVoting from "./AdminVoting"

const CHAIN_ID = 42;

function App() {
  const wallet = useWallet();

  const [account, setAccount] = useState(null);
  const [msg, setMsg] = useState();

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
      <Router>
        <Switch>
          <Route exact path="/">
            <Public account={account} setMsg={setMsg} />
          </Route>
          <Route path="/admin">
            <Admin account={account} setMsg={setMsg} />
          </Route>
          <Route exact path="/adminvoting" component = {AdminVoting}/>
          <Route exact path="/uservoting" component = {UserVoting}/>
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
