import React, { useState, useEffect } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import KickInvest from "../scripts/KickInvest";
import smalltalk from "smalltalk";
const { dialog } = window.require('electron').remote;


function AccountsControlButtons(props) {

    const [showAddAccount, setShowAddAccount] = useState(false);
    const [isButtonActive, setButtonActive] = useState(true);

    const [privateKey, setPrivateKey] = useState('');
    const [accountName, setAccountName] = useState('');
    const [formError, setFormError] = useState('');

    useEffect(() => {
        ResetFields();
    }, [showAddAccount]);

    const NewAccountButton = () => {
        return (
            <Button variant="success" onClick={() => setShowAddAccount(!showAddAccount)}>
                {showAddAccount
                    ? <><i className="fas fa-sort-up"></i> Hide</>
                    : <><i className="fas fa-plus"></i> Add account</>
                }
            </Button>
        );
    };

    const ExportButton = () => {

        const [exportDialog, setExportDialog] = useState(false);
        const [password, setPassword] = useState('');

        const passwordHandleChange = (e) => {
            setPassword(e.target.value);
        };

        const handleSave = () => {
            const savePath = dialog.showSaveDialogSync({
                defaultPath: "wallet.dat"
            });

            if (typeof savePath !== "undefined" && password.length > 0) {
                console.log("Saving wallet to: " + savePath);
                KickInvest.getInstance().saveWallet(savePath, password);
            }

            setExportDialog(false);
        };

        return (
            <>
                <Modal className="export-dialog" show={exportDialog} onHide={() => setExportDialog(false)} centered>
                    <Form.Group>
                        <Form.Control type="password" placeholder="Enter password" value={password} onChange={passwordHandleChange} required />
                    </Form.Group>
                    <Button variant="success" onClick={() => handleSave()}><span><i className="far fa-save"></i> Save</span></Button>
                </Modal>
                <Button variant="link" onClick={() => setExportDialog(true)}>
                    Export
                </Button>
            </>
        );
    }

    const ImportButton = () => {

        const [importDialog, setImportDialog] = useState(false);
        const [password, setPassword] = useState('');
        const [fileLocation, setFileLocation] = useState('');

        const passwordHandleChange = (e) => {
            setPassword(e.target.value);
        };

        const fileLocationHandleChange = (e) => {
            setFileLocation(e.target.value);
            console.log(e.target.value);
        }

        const handleBrowseFiles = () => {
            dialog.showOpenDialogSync({
                properties: ['openFile'],
            });
        }

        const handleLoad = () => {

        }

        return (
            <>
                <Modal className="export-dialog" show={importDialog} onHide={() => setImportDialog(false)} centered>
                    <Form.Group>
                        <Form.Control type="password" placeholder="Enter password" value={password} onChange={passwordHandleChange} required />
                        <Button variant="link" onClick={() => handleBrowseFiles()}>Browse file</Button>
                        {/* <Form.File value={fileLocation} onChange={fileLocationHandleChange}></Form.File> */}
                    </Form.Group>
                    <Button variant="success" onClick={() => handleLoad()}><span><i className="far fa-save"></i> Import</span></Button>
                </Modal>
                <Button variant="link" onClick={() => setImportDialog(true)}>
                    Import
                </Button>
            </>
        );
    }

    const PrivateKeyHandleChange = (event) => {
        setPrivateKey(event.target.value);
        setFormError('');
    };

    const AccountNameHandleChange = (event) => {
        setAccountName(event.target.value);
        setFormError('');
    };

    const ResetFields = () => {
        setAccountName('');
        setPrivateKey('');
    }

    const NewPrivateKey = () => {
        const privateKey = KickInvest.getInstance().createPrivateKey();
        setPrivateKey(privateKey.privateKey);
    }

    const NewAccountHandler = async () => {
        console.log(privateKey);
        console.log(accountName);
        KickInvest.getInstance().addAccountToWallet(privateKey, accountName)
            .then(() => {
                console.log('Account added: ' + accountName);
                ResetFields();
                props.Refresh((e) => e + 1);
            })
            .catch((e) => {
                setFormError('' + e);
                console.log('bad! ' + e);
            });
    };

    const ExportHandler = () => {
        smalltalk.prompt('Password', 'Wallet password')
            .then((e) => {
                console.log(dialog.showSaveDialogSync({
                    properties: ['openFile', 'openDirectory']
                }));
                console.log(e);
            })
            .catch((e) => {
                console.log("Saving aborted." + e);
            });
    }

    const ImportHandler = () => {

    }

    return (
        <>
            <NewAccountButton />
            <span style={{ float: "right" }}>
                <ExportButton />|
            <ImportButton onClick={ImportHandler} />
            </span>
            <div className={`new-account-container ${showAddAccount ? "show" : "hidden"}`}>
                <div className='new-account'>
                    <Form.Group>
                        <Form.Control type="text" placeholder="Private key" value={privateKey} onChange={PrivateKeyHandleChange} required />
                        <Form.Control type="text" placeholder="Account name" value={accountName} onChange={AccountNameHandleChange} required />
                        {formError != '' &&
                            <div className="form-error">{formError}</div>
                        }
                        <Button variant="success" className="highlight-empty-btn" onClick={NewAccountHandler}><span><i className="fas fa-plus"></i> Add account</span></Button>
                        <Button variant="link" onClick={NewPrivateKey}><span>New private key</span></Button>
                    </Form.Group>
                </div>
            </div>
        </>
    );
}

function Accounts() {

    const [refresh, forceRefresh] = useState(0);

    const [accountsList, setAccountsList] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(() => {
        // return KickInvest.getInstance().getCurrentSelectedAccountIndex();
    });


    const SelectAccount = (e) => {
        KickInvest.getInstance().selectAccount(e)
        setSelectedAccount(e);
    };

    const DeleteAccount = (key, e) => {
        console.log(key);
        KickInvest.getInstance().deleteAccountFromWallet(key);
        forceRefresh((e) => e + 1);
        e.preventDefault();
        e.stopPropagation();
    }

    const Account = (props) => {
        const [kickInvestAccount, setKickInvestAccount] = useState('Loading...');

        return (
            <div onClick={props.onClick} className={"account-element" + ((selectedAccount == props.Key) ? " selected" : "")}>
                <div className="tick">
                    {(selectedAccount == props.Key)
                        ? <i className="fas fa-check-circle"></i>
                        : <i className="far fa-circle"></i>
                    }
                </div>
                <div className="name">{props.Name} - {kickInvestAccount}</div>
                <div className="addr">{props.Account}</div>
                <div className="delete" onClick={(e) => { DeleteAccount(props.Key, e) }}><i className="fas fa-trash-alt"></i></div>
            </div>
        );
    }

    return (
        <div id="account-list">
            <AccountsControlButtons
                Refresh={forceRefresh}
            />
            {accountsList.length == 0 &&
                <div className="empty-list">Nothing here. 😔</div>
            }
            {accountsList.map((e, key) => {
                return (
                    <Account
                        key={key}
                        Key={key}
                        Name={e.name}
                        Account={e.account}
                        onClick={() => { SelectAccount(key) }}
                    />
                );
            })}
        </div>
    );
}

export default Accounts;