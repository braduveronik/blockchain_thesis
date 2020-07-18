import React, { useState, useEffect } from "react";
import { Tab, Row, Col, Nav } from "react-bootstrap";
import KickInvest, { KickInvestUtil } from "../scripts/KickInvest";


function Investments() {

    const InvestmentProject = function (props) {

        const VoteList = function (props) {

            const [newVoteList, setNewVoteList] = useState([]);
            const [oldVoteList, setOldVoteList] = useState([]);

            useEffect(() => {
                console.log(props.Project.obj);
                KickInvest.getInstance().listTransferList(props.Project.obj).then((transferList) => {

                    let newTransferList = [];
                    let oldTransferList = [];
                    transferList.forEach(element => {
                        if (element.castVote === "0" && element.status === "active") {
                            newTransferList.push(element);
                        }
                        else {
                            oldTransferList.push(element);
                        }
                    });
                    setNewVoteList(newTransferList);
                    setOldVoteList(oldTransferList);
                });
                // eslint-disable-next-line react-hooks/exhaustive-deps
            }, []);

            const Vote = (props) => {

                const [ayeVotes, setAyeVotes] = useState(parseInt(props.Info.ayeVotes));
                const [nayVotes, setNayVotes] = useState(parseInt(props.Info.nayVotes));
                const [castVote, setCastVote] = useState(parseInt(props.Info.castVote));

                const castAye = () => {
                    if (castVote === 1) {
                        KickInvest.getInstance().removeVote(props.Info.obj)
                            .then((e) => {
                                setCastVote(0);
                                setAyeVotes(ayeVotes - 1);
                            });
                        return;
                    }

                    console.log("Casting vote Aye");
                    KickInvest.getInstance().castAye(props.Info.obj)
                        .then(() => {
                            setCastVote(1);
                            setAyeVotes(ayeVotes + 1);
                            if (castVote === 2) {
                                setNayVotes(nayVotes - 1);
                            }
                        })
                        .catch((e) => {
                            // Error
                        });

                }

                const castNay = () => {
                    if (castVote === 2) {
                        KickInvest.getInstance().removeVote(props.Info.obj)
                            .then((e) => {
                                setCastVote(0);
                                setNayVotes(nayVotes - 1);
                            });
                        return;
                    }

                    console.log("Casting vote Nay");
                    KickInvest.getInstance().castNay(props.Info.obj)
                        .then(() => {
                            setCastVote(2);
                            setNayVotes(nayVotes + 1);
                            if (castVote === 1) {
                                setAyeVotes(ayeVotes - 1);
                            }
                        })
                        .catch((e) => {
                            // error
                        });
                }

                return (
                    <div onClick={props.onClick} className={`list-element ${props.Info.status}`}>
                        <div className="name">{KickInvestUtil.ethereumConverter(props.Info.value)} - {props.Info.reason}</div>
                        <div className="addr"><i className="fas fa-share"></i> {props.Info.recipient}</div>
                        {(props.Info.status === "active")
                            ?
                            <div className="vote">
                                <div className={`aye ${(castVote === 1) ? "cast" : ""}`} onClick={castAye}>{ayeVotes} <i className="fas fa-thumbs-up"></i></div>
                                <div className={`nay ${(castVote === 2) ? "cast" : ""}`} onClick={castNay}>{nayVotes} <i className="fas fa-thumbs-down"></i></div>
                            </div>
                            :
                            <div className="outcome">
                                {(props.Info.status === "resolved")
                                    ?
                                    <i className="far fa-check-circle"></i>
                                    :
                                    <i className="far fa-times-circle"></i>
                                }
                            </div>
                        }
                    </div>
                );
            }

            return (
                <div id="transfer-list" className="list">
                    {newVoteList.length !== 0 &&
                        <span className="list-category">New transfers</span>
                    }
                    {newVoteList.map((e, key) => {
                        return (
                            <Vote
                                key={key}
                                Info={e}
                            />
                        );
                    })}

                    <span className="list-category">Transfer history</span>
                    {newVoteList.length === 0 && oldVoteList.length === 0 &&
                        <div className="empty-list">No history</div>
                    }
                    {oldVoteList.map((e, key) => {
                        return (
                            <Vote
                                key={key}
                                Info={e}
                            />
                        );
                    })}
                </div>
            )
        }

        return (
            <>
                <div className="investment-container">
                    <div className="header" style={{ 'backgroundImage': `url(${props.Investment.imgsrc})` }}>
                        <span className="title">{props.Investment.name}</span>
                    </div>
                    <div className="info">
                        <h5>Description</h5>
                        <p>{props.Investment.desc}</p>
                        <div className="extra">
                            <span>Investors:</span> {props.Investment.investors}<br />
                            <span>Project account:</span> {props.Investment.account}<br />
                            <span>Contact:</span> {props.Investment.email}<br />

                        </div>
                    </div>
                    <div className="transfers">
                        <VoteList Project={props.Investment} />
                    </div>
                </div>
            </>
        );
    }

    const [projects, setProjects] = React.useState([]);

    React.useEffect(() => {
        KickInvest.getInstance().listInvestedProjects().then((investedProjAddressList) => {
            setProjects(investedProjAddressList);
        });
    }, []);

    if (projects.length === 0) {

        return (
            <div className="nothing-container">
                <div className="nothing-box">
                    <span className="nothing-main">
                        <i className="fas fa-box-open"></i> Nothing to show
                    </span>
                    <span className="nothing-info">
                        To invest in a project, switch to <span className="nothing-tab"><i className="fas fa-lightbulb"></i> browse</span>
                    </span>
                </div>
            </div>
        );
    }

    return (
        <Tab.Container defaultActiveKey={(projects.length > 0) ? projects[0].name : null}>
            <Row id="investments-panel">
                <Col sm={3} id="investments-left">
                    <Nav variant="pills" className="flex-column">
                        {projects.map((e, k) => {
                            return (
                                <Nav.Item key={k}>
                                    <Nav.Link eventKey={e.name}>
                                        <span className="proj-title">{e.name}</span>
                                        <span className="proj-addr">{e.address}</span>
                                        <span className="proj-invested">{KickInvestUtil.ethereumConverter(e.investment)}</span>
                                    </Nav.Link>
                                </Nav.Item>
                            )
                        })
                        }
                    </Nav>
                </Col>
                <Col sm={9} id="investments-right">
                    <Tab.Content>
                        {projects.map((e, k) => {
                            return (
                                <Tab.Pane key={k} eventKey={e.name}>
                                    <InvestmentProject Investment={e} />
                                </Tab.Pane>
                            )
                        })
                        }
                    </Tab.Content>
                </Col>
            </Row>
        </Tab.Container>
    );
}

export default Investments;