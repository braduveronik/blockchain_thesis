import React, {useState, useEffect} from "react";
import KickInvest from "../scripts/KickInvest";
import FilePicker from "./Helpers";
import {
    Form, Button, Alert, Tooltip, OverlayTrigger
  } from "react-bootstrap";

// Maybe use CSSTransitions -> http://reactcommunity.org/react-transition-group/css-transition
function Login() {
    const [ loggedIn, changeLoggedIn ] = useState(false);
    const [ showLoginScreen, setShowLoginScreen ] = useState(true);
    const [ toggleLoginMode, setToggleLoginMode ] = useState(false);
    const [ registerScreen, setRegisterScreen ] = useState(false);
  
    // Wallet loggin vars
    const [ password, setPassword ] = useState('');
    const [ walletFile, setWalletFile ] = useState('');

    // Private key logging vars
    const [ privateKey, setPrivateKey ] = useState('');

    // Register vars
    const [ registerPrivateKey, setRegisterPrivateKey ] = useState('');
    const [ registerName, setRegisterName ] = useState('');
    const [ registerWait, setRegisterWait ] = useState(null);

    // Error flags
    const [ loginError, setLoginError ] = useState(null);
    const [ registerErrorName, setRegisterErrorName ] = useState(null);
    const [ registerErrorPrivateKey, setRegisterErrorPrivateKey ] = useState(null);
    const [ configError, setConfigError ] = useState(false);
  
    useEffect(() => {
      try {
        KickInvest.getInstance().readConfig('../blockchain/kickinvest-cfg.json');
      }
      catch(exc) {
        console.log("error!");
        setConfigError(true);
      }
      // console.log(cfg);
    }, []);
  
    useEffect(() => {
      if(loggedIn) {
        setTimeout(() => {
          setShowLoginScreen(false);
        }, 200);
      }
    }, [loggedIn]);
  
    const passwordOnChange = (e) => {
      setPassword(e.target.value);
      setLoginError('');
    }

    const privateKeyOnChange = (e) => {
      setPrivateKey(e.target.value);
      setLoginError('');
    }
    
    const registerPrivateKeyOnChange = (e) => {
      setRegisterErrorPrivateKey(null);
      setRegisterPrivateKey(e.target.value);
    }

    const registerNameOnChange = (e) => {
      setRegisterErrorName(null);
      setRegisterName(e.target.value);
    }
  
    const loginAction = () => {
        if(!toggleLoginMode)
        {
            KickInvest.getInstance().loadWallet(walletFile, password).then(() => {
                console.log('password ok!');
                changeLoggedIn(true);
            })
            .catch((e) => {
                console.log(e);
                setLoginError("Wrong password.");
            });
        }
        else {
            console.log("Trying to log in with a private key...");
            KickInvest.getInstance().login(privateKey)
            .then((res) => {
              if(res){
                changeLoggedIn(true);
              }
              // else 
            })
            .catch((e) => {
              setLoginError(e);
            })
        }
    }

    const registerAction = () => {
      if(registerName.length == 0) {
        setRegisterErrorName("Please fill in with a valid name");
        return;
      }

      setRegisterWait('Loading...');
      KickInvest.getInstance().registerAccount(registerPrivateKey, registerName)
      .then((e) => {
        setRegisterWait('Done')
      })
      .catch((e) => {
        console.log(e);
        setRegisterErrorPrivateKey(e);
        setRegisterWait(null);
      })
    }
  
    function renderTooltip(props) {
      return (
        <Tooltip id="button-tooltip" {...props}>
          This will automatically create a KickInvest account, if you don't already have one.
        </Tooltip>
      );
    }
    
    if(showLoginScreen)
      return (
        <div id="login-screen-container" style={loggedIn ? {opacity: 0} : {opacity: 1}}>
          <div id="login-screen">
            {configError ? 
              <Alert variant="danger">
                Error while loading kickinvest-cfg.json file!
              </Alert>
            :
              <>
                {registerScreen ?
                  <Form>
                    <Form.Group controlId="accountName">
                      <Form.Label>Account name</Form.Label>
                      <Form.Control
                        className={(registerErrorName) ? 'invalid' : null}
                        value={registerName}
                        onChange={registerNameOnChange}
                        placeholder="Name for your account"
                      />
                      {(registerErrorName != null) ? <Form.Text className="form-error">{registerErrorName}</Form.Text> : null }
                    </Form.Group>
                    <Form.Group controlId="accountKey">
                      <Form.Label>Private key</Form.Label>
                      <Form.Control
                        className={(registerErrorPrivateKey) ? 'invalid' : null}
                        value={registerPrivateKey}
                        onChange={registerPrivateKeyOnChange}
                        placeholder="Private key"
                      />
                      {(registerErrorPrivateKey != null) ? <Form.Text className="form-error">{registerErrorPrivateKey}</Form.Text> : null }
                    </Form.Group>
                    {!registerWait 
                      ? <Button variant="success" onClick={registerAction}>Register</Button>
                      :
                        <>
                          <Button variant="success" disabled>
                            {(registerWait == "Loading...") ? <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...</> : null}
                            {(registerWait == "Done") ? <><i className="fas fa-check"></i> Done</> : null}
                          </Button>
                        </>
                    }
                  </Form>
                :
                  <Form>
                    {!toggleLoginMode ?
                        <Form.Group controlId="walletLogin">
                        <Form.Label>Wallet file</Form.Label>
                        <FilePicker File={setWalletFile}/>
                        <Form.Label>Wallet password</Form.Label>
                        <Form.Control
                            className={(loginError == "Bad password!") ? 'invalid' : null}
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={passwordOnChange}
                        />
                        {(loginError != null) ? <Form.Text className="form-error">{loginError}</Form.Text> : null }
                        <Form.Text className="text-muted">
                            Never share your password with anyone else!
                        </Form.Text>
                        </Form.Group>
                    :
                        <Form.Group controlId="accountRegister">
                            <Form.Label>Private key</Form.Label>
                            <Form.Control
                                className={(loginError) ? 'invalid' : null}
                                type="text"
                                placeholder="Enter private key"
                                value={privateKey}
                                onChange={privateKeyOnChange}
                            />
                            {(loginError != null) ? <Form.Text className="form-error">{loginError}</Form.Text> : null }
                        </Form.Group>
                    }

                    <div className="login-buttons-grid">
                      <div className="login-btn">
                        <Button variant="primary" onClick={() => loginAction()}>
                          Connect
                        </Button>
                      </div>
                      <div className="login-priv-key-btn">
                        <Button variant="link" onClick={() => {setToggleLoginMode(!toggleLoginMode); setLoginError('');}}>
                            {!toggleLoginMode ? "Login using a private key" : "Login using a wallet"}
                        </Button>
                      </div>
                    </div>
                  </Form>
                }
                <div className="register-btn">
                  <Button variant="link" className="register-button" onClick={() => setRegisterScreen(!registerScreen)}>
                      {registerScreen ? <><i className="fas fa-chevron-left"></i> Back to login</> : "Don't have an account? Register!"}
                  </Button>
                </div>
              </>
            }
            </div>
        </div>
      );
    else
      return null;
  }

  export default Login;