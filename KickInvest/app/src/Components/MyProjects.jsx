import React from "react";
import { useEffect, useState } from "react";
import { Tab, Row, Col, Nav, Form, Button, Tabs } from "react-bootstrap";
import KickInvest, { KickInvestUtil } from "../scripts/KickInvest";


function NewTransaction(props) {

    const [showNewTransaction, setShowNewTransaction] = useState(false);

    const [recipientAddress, setRecipientAddress] = useState('');
    const [transferReason, setTransferReason] = useState('');
    const [transferValue, setTransferValue] = useState('');

    const [transactionError, setTransactionError] = useState(null);
    const [transactionStatus, setTransactionStatus] = useState("normal");
    const [transactionAddressError, setTransactionAddressError] = useState(false);
    const [transactionValueError, setTransactionValueError] = useState(false);

    const OnTransactionButton = () => {
        setShowNewTransaction(!showNewTransaction);
        setRecipientAddress('');
        setTransferReason('');
        setTransferValue('');
        setTransactionValueError(false);
        setTransactionError(null);
        setTransactionStatus("normal");
    }

    const NewTransactionButton = (props) => {
        return (
            <Button variant="success" onClick={() => OnTransactionButton()}>
                {showNewTransaction
                    ? <><i className="fas fa-sort-up"></i> Hide</>
                    : <><i className="fas fa-plus"></i> New transaction</>
                }
            </Button>
        );
    };

    const sendNewTransaction = (e) => {
        setTransactionStatus("loading");
        if (!KickInvestUtil.isAddress(recipientAddress)) {
            setTransactionStatus("normal");
            setTransactionAddressError(true);
            return;
        }

        if (transferValue === '' || parseInt(transferValue) <= 0) {
            setTransactionValueError(true);
            setTransactionStatus("normal");
            return;
        }

        KickInvest.getInstance().initTransfer(e.obj, recipientAddress, transferReason, transferValue)
            .then(() => {
                setTransactionStatus("done");
                KickInvest.getInstance().listTransferList(props.Project.obj).then((e) => {
                    props.OnUpdate(e);
                });
            })
            .catch((e) => {
                setTransactionError("Not enough money!");
            });
    };

    const addressOnChange = (e) => {
        setRecipientAddress(e.target.value);
        setTransactionAddressError(false);
    };

    const valueOnChange = (e) => {
        setTransactionError(null);
        setTransactionStatus("normal");
        setTransactionValueError(false)
        if (e.target.value > 0) {
            setTransferValue(e.target.value);
        }
        else {
            setTransferValue("");
        }
    };

    const reasonOnChange = (e) => {
        setTransferReason(e.target.value);
    };

    return (
        <>
            <NewTransactionButton />
            <div className={`new-transaction-container ${showNewTransaction ? "show" : "hidden"}`}>
                <div className='new-transaction'>
                    <Form.Group>
                        <Form.Control type="text" placeholder="Recipient address" value={recipientAddress} onChange={addressOnChange} required />
                        {transactionAddressError &&
                            <Form.Text className="form-error">Invalid address</Form.Text>
                        }
                        <Form.Control type="number" min="0" placeholder="Value" value={transferValue} onChange={valueOnChange} required />
                        {transactionValueError &&
                            <Form.Text className="form-error">Value must be &gt; 0</Form.Text>
                        }
                        <Form.Control type="text" placeholder="Reason" value={transferReason} onChange={reasonOnChange} required />
                        <div className="new-transaction-footer">
                            {(transactionError) ?
                                <>
                                    <span style={{ color: "#721c24" }}>Not enough funds</span>
                                    <Button variant="danger" disabled><span><i className="fas fa-times"></i> Error</span></Button>
                                </>
                                :
                                <>
                                    <Button disabled={!(transactionStatus === "normal")} variant="success" onClick={() => sendNewTransaction(props.Project)}>
                                        {(transactionStatus === "normal") &&
                                            <span><i className="fas fa-paper-plane"></i> Send</span>
                                        }
                                        {(transactionStatus === "loading") &&
                                            <span><div className="spinner-border spinner-border-sm" role="status"></div> Loading</span>
                                        }
                                        {(transactionStatus === "done") &&
                                            <span><i className="fas fa-check"></i> Done</span>
                                        }
                                    </Button>
                                </>
                            }
                        </div>


                    </Form.Group>
                </div>
            </div>
        </>
    );
}


function TransactionList(props) {

    const { Project } = props;

    const [transactionList, setTransactionList] = useState([]);
    const [refreshTransactionList, setRefreshTransactionList] = useState(false);

    useEffect(() => {
        KickInvest.getInstance().listTransferList(props.Project.obj).then((e) => {
            console.log(e);
            setTransactionList(e);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshTransactionList]);

    const TransactionEntry = (props) => {

        const [refreshStatus, setRefreshStatus] = useState(false);
        const [removeStatus, setRemoveStatus] = useState(false);
        const [checkVoteError, setCheckVoteError] = useState(false);

        const refreshOnClick = (e) => {
            setRefreshStatus(true);
            KickInvest.getInstance().checkVotes(props.Transaction.obj)
                .then((newStatus) => {
                    console.log(newStatus);

                    // Stop animation after ~2 sec
                    setTimeout(() => {
                        setRefreshStatus(false);
                    }, 2000);

                    if (newStatus !== "0") {
                        setRefreshTransactionList(!refreshTransactionList);
                    }
                    else {
                        setCheckVoteError(true);
                        setRefreshStatus(false);
                        setTimeout(() => {
                            setCheckVoteError(false);
                        }, 2000);
                    }
                })
                .catch((e) => {
                    console.log("bad");
                    setRefreshStatus(false);

                })
        };

        const deleteOnClick = (e) => {
            setRemoveStatus(true);
            KickInvest.getInstance().removeTransfer(props.Transaction.obj)
                .then((e) => {
                    console.log("Removed!");
                    setTimeout(() => {
                        setRemoveStatus(false);
                        setRefreshTransactionList(!refreshTransactionList);
                    }, 1000);
                })
                .catch((e) => {
                    setRemoveStatus(false);
                    console.log("Error!");
                });
        };

        return (
            <div className={`list-element ${(props.Transaction.status)}`}>
                <div className="my-transfer-address">
                    {KickInvestUtil.ethereumConverter(props.Transaction.value)} <i className="fas fa-share"></i> {props.Transaction.recipient} | {props.Transaction.reason}<br />
                </div>
                <div className="my-transfer-votes">
                    <span style={{ color: "#28a745" }}>
                        {Math.round(parseInt(props.Transaction.ayeVotes) / parseInt(Project.investors) * 100)}% <i className="fas fa-check"></i>
                    </span>
                    /
                    <span style={{ color: "#dc3545" }}>
                        {Math.round(parseInt(props.Transaction.nayVotes) / parseInt(Project.investors) * 100)}% <i className="fas fa-times"></i>
                    </span>
                </div>
                {(props.Transaction.status === "active") &&
                    <div className="my-transfer-controls">
                        {checkVoteError ?
                            <>
                                <span className="check-vote-error"><i className="fas fa-exclamation-triangle"></i></span>
                            </>
                            :
                            <>
                                <span onClick={refreshOnClick} className={`check-votes${refreshStatus ? " loading" : ""}`}><i className="fas fa-sync"></i></span>
                            </>
                        }
                        <span onClick={deleteOnClick} className={`remove${removeStatus ? " loading" : ""}`}><i className="fas fa-trash-alt"></i></span>
                    </div>
                }
                {(props.Transaction.status === "resolved") &&
                    <div className="my-transfer-controls status"><i className="far fa-check-circle"></i></div>
                }
                {(props.Transaction.status === "rejected") &&
                    <div className="my-transfer-controls status"><i className="far fa-times-circle"></i></div>
                }
            </div>
        );
    }

    return (
        <>
            <NewTransaction Project={Project} OnUpdate={setTransactionList} />
            <div className="list">
                {transactionList.map((e, k) => {
                    console.log(e);
                    return (
                        <TransactionEntry key={k} Transaction={e} />
                    );
                })}
            </div>
        </>
    );
}

function MyProjects() {

    const [personalProjects, setPersonalProjects] = useState([]);

    useEffect(() => {
        KickInvest.getInstance().listPersonalProjects().then((list) => {
            setPersonalProjects(list);
        })
    }, []);

    if (personalProjects.length === 0) {

        return (
            <div className="nothing-container">
                <div className="nothing-box">
                    <span className="nothing-main">
                        <i className="fas fa-box-open"></i> Nothing to show
                    </span>
                    <span className="nothing-info">
                        To create a new project, switch to <span className="nothing-tab"><i className="fas fa-lightbulb"></i> browse</span> tab and click <i className="fas fa-plus"></i>
                    </span>
                </div>
            </div>
        );
    }
    return (
        <Tab.Container>
            <Row id="myprojects-panel">
                <Col sm={3} id="myprojects-left">
                    <Nav variant="pills" className="flex-column">
                        {personalProjects.map((e, k) => {
                            return (
                                <Nav.Item>
                                    <Nav.Link key={k} eventKey={e.address}>{e.name}</Nav.Link>
                                </Nav.Item>
                            );
                        })}
                    </Nav>
                </Col>
                <Col sm={9} id="myprojects-right">
                    <Tab.Content>
                        {personalProjects.map((e, k) => {
                            return (
                                <Tab.Pane key={k} eventKey={e.address}>
                                    <Tabs fill defaultActiveKey="proj-info" id="myproject-tabs">
                                        <Tab eventKey="proj-info" title="Project info">
                                            <Form>
                                                <Form.Group as={Row} controlId="myProjectAddress">
                                                    <Form.Label column sm="2">Address</Form.Label>
                                                    <Col sm="10">
                                                        <Form.Control readOnly placeholder={e.address} />
                                                    </Col>
                                                </Form.Group>

                                                <Form.Group as={Row} controlId="myProjectName">
                                                    <Form.Label column sm="2">Name</Form.Label>
                                                    <Col sm="10">
                                                        <Form.Control readOnly placeholder={e.name} />
                                                    </Col>
                                                </Form.Group>

                                                <Form.Group as={Row} controlId="myProjectImage">
                                                    <Form.Label column sm="2">Image</Form.Label>
                                                    <Col sm="10">
                                                        <Form.Control readOnly placeholder={e.imgsrc} />
                                                    </Col>
                                                </Form.Group>

                                                <Form.Group as={Row} controlId="myProjectEmail">
                                                    <Form.Label column sm="2">Email</Form.Label>
                                                    <Col sm="10">
                                                        <Form.Control readOnly placeholder={e.email} />
                                                    </Col>
                                                </Form.Group>

                                                <Form.Group as={Row} controlId="myProjectDescription">
                                                    <Form.Label column sm="2">Description</Form.Label>
                                                    <Col sm="10">
                                                        <Form.Control as="textarea" readOnly placeholder={e.desc} rows="3" />
                                                        {/* <Form.Control readOnly placeholder={e.imgsrc} /> */}
                                                    </Col>
                                                </Form.Group>

                                                <Form.Group as={Row} controlId="myProjectAmmount">
                                                    <Form.Label column sm="2">Amount</Form.Label>
                                                    <Col sm="10">
                                                        <Form.Control readOnly placeholder={e.account} />
                                                    </Col>
                                                </Form.Group>

                                                <Form.Group as={Row} controlId="myProjectInvestors">
                                                    <Form.Label column sm="2">Number of investors</Form.Label>
                                                    <Col sm="10">
                                                        <Form.Control readOnly placeholder={e.investors} />
                                                    </Col>
                                                </Form.Group>
                                            </Form>
                                        </Tab>
                                        <Tab eventKey="proj-transfers" title="Transfers">
                                            <TransactionList Project={e} />
                                        </Tab>
                                    </Tabs>
                                </Tab.Pane>
                            );
                        })}
                    </Tab.Content>
                </Col>
            </Row>
        </Tab.Container>
    );
}

export default MyProjects;