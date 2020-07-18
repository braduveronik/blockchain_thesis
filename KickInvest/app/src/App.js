import React, { useState, useEffect, createContext, useContext } from "react";
import "./css/App.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  Route,
  BrowserRouter as Router,
  Switch,
  Link,
  Redirect,
} from "react-router-dom";
import {
  Tab, Row, Col, Nav, Form, Button, Alert
} from "react-bootstrap";
import Login from "./Components/Login";
import Header from "./Components/Header";
import BrowseProjects from "./Components/BrowseProjects";
import KickInvest from "./scripts/KickInvest";
import Settings from "./Components/Settings";
import Investments from "./Components/Investments";
import MyProjects from "./Components/MyProjects";
import Web3 from "web3";
import { EthDriver } from "./scripts/EthDriver";
// const { ipcRenderer }  = require('electron').remote;


KickInvest.getInstance().loadConfig('../blockchain/kickinvest-cfg.json');
// KickInvest.getInstance().addAccountToWallet('0xf8e9adc5b55989814c3f02272c12fb5b344cac9b0cb8c6530294e3f9b7bacc56', 'test');
// KickInvest.getInstance().addAccountToWallet('0x79f2be5a8eeff37eaaa078f6c79f6df1b1ea764df468cfec79c451768c32d34c', 'Cosmin');
// KickInvest.getInstance().saveWallet('test.dat', 'a');

class Home extends React.Component {
  render() {
    return (
        // <Projects />
        <h1>hello!</h1>
    );
  }
}

function Profile() {
  return <h1>Profile!</h1>;
}

function About() {
  return (
    <div>
      <b>hello!</b>
    </div>
  );
}


function MainBody(props) {
  const SwitchRoute = () => {
    return (
      <div id="main-body" className="app-body">
        <Switch>
          {/* <Route path="/" exact component={Home} /> */}
          <Redirect from="/" exact to="/projects"/>
          <Route path="/browse" exact component={BrowseProjects} />
          <Route path="/investments" exact component={Investments} />
          <Route path="/myprojects" exact component={MyProjects} />
          <Route path="/settings" exact component={Settings} />
        </Switch>
      </div>
    );
  }

  return (
    <>
      <SwitchRoute/>
    </>
  );
}

function App() {
  return (
    <>
    <Router>
      <div id="app-grid">
        <Header />
        <MainBody />
        <Login/>
      </div>
    </Router>
    </>
  );
}

export default App;
