import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {Tooltip, OverlayTrigger, Modal, Form, Button} from "react-bootstrap";
import { useEffect } from "react";
import KickInvest, {KickInvestUtil} from "../scripts/KickInvest";

const { dialog, getCurrentWindow, clipboard } = window.require('electron').remote;

let remote;

if (window.require !== undefined) {
  console.log("[*] [Header.jsx] App is running inside an electron application...");
  remote = window.require("electron").remote;
} else {
  remote = null;
}

class WinWindowButtons extends React.Component {
  constructor() {
    super();
    this.state = {
      minimize: true,
    };

    remote.BrowserWindow.getAllWindows()[0].on("maximize", (e) => {
      this.SetMinimizeState();
    });

    remote.BrowserWindow.getAllWindows()[0].on("unmaximize", (e) => {
      this.SetRestoreState();
    });
  }

  MinimizeWindow() {
    if (remote != null) {
      remote.BrowserWindow.getFocusedWindow().minimize();
    }
  }

  CloseWindow() {
    if (remote != null) {
      remote.BrowserWindow.getFocusedWindow().destroy();
    }
  }

  MaximizeWindow() {
    remote.BrowserWindow.getFocusedWindow().maximize();
  }

  RestoreWindow = () => {
    remote.BrowserWindow.getFocusedWindow().restore();
  };

  SetMinimizeState = () => {
    this.setState({
      minimize: false,
    });
  };

  SetRestoreState = () => {
    this.setState({
      minimize: true,
    });
  };

  MaximizeRestoreButton() {
    if (this.state.minimize) {
      return (
        <div className="minimize-window" onClick={this.MaximizeWindow}>
          &#xE922;
        </div>
      );
    } else {
      return (
        <div className="minimize-window" onClick={this.RestoreWindow}>
          &#xE923;
        </div>
      );
    }
  }

  render() {
    if (remote.process.platform == "darwin" || !remote) {
      return <div id="window-buttons-replacement"></div>;
    }

    if (remote.process.platform == "win32") {
      return (
        <div id="window-buttons-win32">
          <div className="minimize-window" onClick={this.MinimizeWindow}>
            &#xE921;
          </div>
          {this.MaximizeRestoreButton()}
          <div className="close-window" onClick={this.CloseWindow}>
            &#xE8BB;
          </div>
        </div>
      );
    }

    return (
      <div id="window-buttons-other">
        <div className="minimize-window" onClick={this.MinimizeWindow}>
          _
        </div>
        <div className="close-window" onClick={this.CloseWindow}>
          X
        </div>
      </div>
    );
  }
}

class MacWindowButtons extends React.Component {
  render() {
    if (remote.process.platform == "darwin") {
      // "darwin"
      return <div id="window-buttons-darwin"></div>;
    } else {
      return null;
    }
  }
}

class Navbar extends React.Component {
  constructor() {
    super();
    this.state = {
      menuLinks: [
        // { name: "home", url: "/", icon: "fas fa-home" },
        { name: "browse", url: "/browse", icon: "fas fa-lightbulb" }, // browse projects
        { name: "investments", url: "/investments", icon: "fas fa-chart-line" }, // investments
        {name: "my projects", url: "/myprojects", icon: "fas fa-project-diagram"},
        // { name: "settings", url: "/settings", icon: "fas fa-cogs" }, // settings
      ],
    };
  }

  getIcon(menuItem) {
    if (menuItem.hasOwnProperty("icon")) {
      return <i className={menuItem.icon} style={{ paddingRight: "5px" }}></i>;
    }
    return null;
  }

  render() {
    return (
      <div>
        <nav>
          <ul>
            {this.state.menuLinks.map((e) => (
              <li key={e.name}>
                <NavLink to={e.url} activeClassName="navbar-active" exact>
                  {this.getIcon(e)}
                  {e.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    );
  }
}

function ExportButton(props) {

  const [ exportDialog, setExportDialog ] = useState(false);
  const [ password, setPassword ] = useState('');

  const passwordHandleChange = (e) => {
      setPassword(e.target.value);
  };

  const handleSave = () => {
      const savePath = dialog.showSaveDialogSync({
          defaultPath: "wallet.dat"
      });

      if(typeof savePath !== "undefined" && password.length > 0) {
          console.log("Saving wallet to: " + savePath);
          KickInvest.getInstance().saveWallet(savePath, password);
      }

      setExportDialog(false);
  };

  return (
      <>
          <Modal className="export-dialog" show={exportDialog} onHide={() => setExportDialog(false)} centered>
              <Form.Group>
                  <Form.Control type="password" placeholder="Enter password" value={password} onChange={passwordHandleChange} required/>
              </Form.Group>
              <Button variant="success" onClick={() => handleSave()}><span><i className="far fa-save"></i> Save</span></Button>
          </Modal>
          <div className="menu-btn export" onClick={() => setExportDialog(true)}><i className="fas fa-external-link-alt"></i> Export wallet</div>
      </>
  );
}

function BubbleMenu() {

  const [ accountInfo, setAccountInfo ] = useState({});
  const [ doneCopy, setDoneCopy ] = useState(false);

  useEffect(() => {
    KickInvest.getInstance().getCurrentAccountInfo().then((info) => {
      setAccountInfo(info);
    })
  }, []);

  const renderBalanceTooltip = (props) => {
    return (
      <Tooltip {...props}>
        Simple tooltip
      </Tooltip>
    );
  };

  const logoutAction = () => {
    setTimeout(() => {
      getCurrentWindow().reload();
    }, 200);
  };

  const copyAddressAction = () => {
    setDoneCopy(true);
    clipboard.writeText(accountInfo.address);
    setTimeout(() => {
      setDoneCopy(false);
    }, 500);
  };

  return (
    <div id="bubble-menu">
      <div className="bubble-info">
        <div className="name">
          <i className="fas fa-user"></i>{accountInfo.name}
        </div>
        <div className="balance">
          <OverlayTrigger
            placement="top"
            delay={{ show: 250, hide: 400 }}
            overlay={renderBalanceTooltip}
          >
            <>
              <i className="fas fa-coins"></i>{KickInvestUtil.ethereumConverter(accountInfo.balance)}
            </>
          </OverlayTrigger>
        </div>
        <div className={`address${doneCopy ? " copied" : ""}`} onClick={copyAddressAction}><i className="fab fa-ethereum"></i>{accountInfo.address}</div>
      </div>
      <div className="menu-buttons">
        <ExportButton/>
        <NavLink to="/browse">
          <div className="menu-btn logout" onClick={logoutAction}><i className="fas fa-sign-out-alt"></i> Sign out</div>
        </NavLink>
      </div>
    </div>
  );
}

// https://reactjs.org/docs/faq-state.html
// maybe this: https://stackoverflow.com/questions/32553158/detect-click-outside-react-component
function UserBubble() {
  const [showResults, setShowResults] = useState(false);

  const handleClick = () => {
    if (!showResults) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  return (
    <div id="user-bubble">
      <i onClick={handleClick} className="fas fa-key"></i>
      { showResults ? <BubbleMenu/> : null}
    </div>
  );
}

function Header(props) {
  return (
    <div className="app-header">
      <header className="grid">
        <MacWindowButtons />
        <div className="menu-bar">
            <Navbar /> 
        </div>
        <div className="middle-bar"></div>
        <div className="profile">
          <UserBubble />
        </div>
        <div className="window-controls">
          <WinWindowButtons />
        </div>
      </header>
    </div>
  );
}

export default Header;
