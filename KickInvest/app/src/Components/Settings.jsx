import React from "react";
import { Tab, Row, Col, Nav} from "react-bootstrap";
import BrowseProjects from "./BrowseProjects";
import AccountsLists from "./Accounts";



function Settings() {
    return (
    <Tab.Container defaultActiveKey="accounts-tab">
        <Row id="settings-panel">
            <Col sm={3} id="settings-left">
                <Nav variant="pills" className="flex-column">
                    <Nav.Item>
                        <Nav.Link eventKey="accounts-tab">Accounts</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="second">Tab 2</Nav.Link>
                    </Nav.Item>
                </Nav>
            </Col>
            <Col sm={9} id="settings-right">
                <Tab.Content>
                    <Tab.Pane eventKey="accounts-tab">
                        <AccountsLists/>
                    </Tab.Pane>
                    <Tab.Pane eventKey="second">
                        Other stuff...
                    </Tab.Pane>
                </Tab.Content>
            </Col>
        </Row>
    </Tab.Container>
    );
}

export default Settings;