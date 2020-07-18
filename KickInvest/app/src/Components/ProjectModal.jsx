import React from "react";
import {Modal, Button, Form } from "react-bootstrap";
import KickInvest, {KickInvestUtil} from "../scripts/KickInvest";


// Bug bug bug https://github.com/react-bootstrap/react-bootstrap/issues/5075
function ProjectModal(props) {

  const {Info, onHideAction, ...rest} = props;

  const [loadingStatus, setLoadingStatus] = React.useState(false);
  const [resultStatus, setResultStatus] = React.useState(null);
  const [investDialog, setInvestDialog] = React.useState(false);
  const [investmentValue, setInvestmentValue] = React.useState('');

  const investOnClick = async (project) => {
    setLoadingStatus(true);
    setResultStatus("loading");

    console.log("Investing "  + investmentValue);
    const c = await KickInvest.getInstance().investProject(project, investmentValue)
    .then((e) => {
      KickInvest.getInstance().refreshProjects();
      setResultStatus("success");
    })
    .catch((e) => {
      setResultStatus("error");
      console.log(e);
    });

  }

  const valueOnChange = (e) => {
    if(parseInt(e.target.value) > 0){
      setInvestmentValue(e.target.value);
    }
    else {
      setInvestmentValue("");
    }
  }

  const hideAction = () => {
    setResultStatus(null);
    setLoadingStatus(false);
    setInvestmentValue('');
    setInvestDialog(false);
    onHideAction(false);
  };

  return (
    <>
      <Modal
        {...rest}
        onHide={() => hideAction()}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="project-modal"
      >
        <Modal.Header closeButton style={{backgroundImage: `url(${props.Info.imgsrc})`}}>
          <Modal.Title id="contained-modal-title-vcenter">
            {props.Info.name}
          </Modal.Title>
          <div className="modal-left">
              <span className="investors">Investors: {props.Info.investors}</span>
              <span className="Account">Account: {KickInvestUtil.ethereumConverter(props.Info.account)}</span>
          </div>
        </Modal.Header>
        <Modal.Body>
          <p>
            {props.Info.desc}
          </p>
        </Modal.Body>
        <Modal.Footer>
          {investDialog ?
            <>
            {loadingStatus ?
              <>
                {(resultStatus == "loading") &&
                  <Button variant="success" disabled>
                    <div className="spinner-border spinner-border-sm" role="status"></div> Loading
                  </Button>

                }
                {(resultStatus == "success") &&
                  <Button variant="success" disabled>
                    <i className="fas fa-check"></i> Done
                  </Button>
                }
                {(resultStatus == "error") &&
                  <>
                    <span style={{color: "#721c24"}}>Not enough funds</span>
                    <Button variant="danger" disabled>
                      <i className="fas fa-times"></i> Error
                    </Button>
                  </>
                }
              </>
            :
              <>
                <div className="investment-dialog-container">
                  <div className="investment-value">
                    <Form.Control type="number" min="0" placeholder="How much? (wei)" value={investmentValue} onChange={valueOnChange}/>
                  </div>
                  <div className="validate-investment">
                    <Button variant="success" onClick={() => investOnClick(props.Info.obj)}>Invest</Button>
                  </div>
                  <div className="cancel-investment">
                    <Button variant="danger" onClick={() => setInvestDialog(false)}>Cancel</Button>
                  </div>
                </div>
              </>
            }
            </>
          :
            <Button onClick={() => setInvestDialog(true)}>Invest</Button>
          }
        </Modal.Footer>
      </Modal>
    </>
  );
}
  
export default ProjectModal;