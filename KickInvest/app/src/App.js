import React from "react";
import "./css/App.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  Route,
  BrowserRouter as Router,
  Switch,
  Redirect,
} from "react-router-dom";
import Login from "./Components/Login";
import Header from "./Components/Header";
import BrowseProjects from "./Components/BrowseProjects";
import KickInvest from "./scripts/KickInvest";
import Investments from "./Components/Investments";
import MyProjects from "./Components/MyProjects";

KickInvest.getInstance().loadConfig('../blockchain/kickinvest-cfg.json');

function MainBody(props) {
  const SwitchRoute = () => {
    return (
      <div id="main-body" className="app-body">
        <Switch>
          <Redirect from="/" exact to="/projects" />
          <Route path="/browse" exact component={BrowseProjects} />
          <Route path="/investments" exact component={Investments} />
          <Route path="/myprojects" exact component={MyProjects} />
        </Switch>
      </div>
    );
  }

  return (
    <>
      <SwitchRoute />
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
          <Login />
        </div>
      </Router>
    </>
  );
}

export default App;
