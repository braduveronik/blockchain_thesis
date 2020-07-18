import React from "react";
import Card from "react-bootstrap/Card";
import ProjectModal from "./ProjectModal";
import { Modal, ModalBody, Form, Col, Button } from "react-bootstrap";
import KickInvest from "../scripts/KickInvest";


function ProjectCard(props) {
  const e = props.Element;

  const [modalShow, setModalShow] = React.useState(false);

  return (
    <>
      <Card onClick={() => setModalShow(true)}>
        <div className="card-img-overflow">
          <Card.Img variant="top" src={e.imgsrc} />
        </div>
        <Card.Body>
          <Card.Title>{e.name}</Card.Title>
          <Card.Text>{e.desc}</Card.Text>
        </Card.Body>
      </Card>
      <ProjectModal
        show={modalShow}
        onHideAction={setModalShow}
        Info={e}
      />
    </>
  );
}

function NewProject(props) {

  const [show, setShow] = React.useState(false);

  const [projectName, setProjectName] = React.useState('');
  const [projectImage, setProjectImage] = React.useState('');
  const [projectEmail, setProjectEmail] = React.useState('');
  const [projectDescription, setProjectDescription] = React.useState('');

  const [newProjState, setNewProjState] = React.useState("normal");
  const [newProjError, setNewProjError] = React.useState("");

  const projectNameOnChange = (e) => {
    setNewProjError("");
    setNewProjState("normal");
    setProjectName(e.target.value);
  };

  const projectImageOnChange = (e) => {
    setNewProjError("");
    setNewProjState("normal");
    setProjectImage(e.target.value);
  };

  const projectEmailOnChange = (e) => {
    setNewProjError("");
    setNewProjState("normal");
    setProjectEmail(e.target.value);
  };

  const projectDescriptionOnChange = (e)  =>{
    setNewProjError("");
    setNewProjState("normal");
    setProjectDescription(e.target.value);
  };

  const handleShow = () => {
    // Reset everything
    setProjectName("");
    setProjectEmail("");
    setProjectEmail("");
    setProjectDescription("");
    setNewProjState("normal");
    setShow(true);
  }
  const handleHide = () => setShow(false);

  const newProject = async (e) => {
    // Check inputs

    if(projectName.length == 0) {
      setNewProjError("Please fill in a project name");
      setNewProjState("error");
      return;
    }

    if(projectEmail.length == 0) {
      setNewProjError("Please fill in an email");
      setNewProjState("error");
      return;
    }

    if(projectImage.length == 0) {
      setNewProjError("Please fill in an image URL");
      setNewProjState("error");
      return;
    }

    if(projectDescription.length == 0) {
      setNewProjError("Please fill in a project description");
      setNewProjState("error");
      return;
    }

    setNewProjState("loading");
    KickInvest.getInstance().createProject(projectName, projectEmail, projectDescription, projectImage)
    .then((e) => {
      setNewProjState("done");
      props.Update();
      setTimeout(() => {
        setShow(false);
      }, 500);
    })
    .catch((e) => {
      setNewProjState("error");
    });
  }

  return (
    <>
      <div id="projects-add">
        <i className="fas fa-plus" onClick={handleShow}></i>
      </div>
      <Modal
          show={show}
          onHide={handleHide}
          size="lg"
          centered
          id="new-project-modal"
        >
        <ModalBody>
          <Form>
            <Form.Row>
              <Form.Group as={Col} controlId="formProjectName">
                <Form.Label>Project name</Form.Label>
                <Form.Control type="text" placeholder="A catchy name" value={projectName} onChange={projectNameOnChange}/>
              </Form.Group>

              <Form.Group as={Col} controlId="formProjectImage">
                <Form.Label>Image</Form.Label>
                <Form.Control type="url" placeholder="A nice image" pattern="http://.*|https://.*" value={projectImage} onChange={projectImageOnChange}/>
              </Form.Group>

              <Form.Group as={Col} controlId="formGridAddress2">
                <Form.Label>Email</Form.Label>
                <Form.Control type="text" placeholder="Email list address" value={projectEmail} onChange={projectEmailOnChange}/>
              </Form.Group>
            </Form.Row>

            <Form.Group controlId="formProjectDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control type="text" placeholder="Short description for your project" value={projectDescription} onChange={projectDescriptionOnChange}/>
            </Form.Group>

            {(newProjState == "normal") &&
              <Button variant="primary" onClick={() => newProject()}>
                Submit
              </Button>
            }

            {(newProjState == "loading") &&
              <Button variant="primary" disabled>
                <div className="spinner-border spinner-border-sm" role="status"></div> Loading
              </Button>
            }

            {(newProjState == "done") &&
              <Button variant="success" disabled>
                <i className="fas fa-check"></i> Done
              </Button>
            }

            {(newProjState == "error") &&
              <>
                <Button variant="danger" disabled>
                  <i className="fas fa-times"></i> Error
                </Button>
                <span style={{color: "#721c24", marginLeft: "1em"}}>{newProjError}</span>
              </>
            }
          </Form>
        </ModalBody>
      

      </Modal>
    </>
  )
}

function Projects() {

  const [projects, setProjects] = React.useState([]);

  React.useEffect(() => {
    KickInvest.getInstance().listProjects().then(proj => {
      setProjects(proj);
    });
  }, []);

  const updateProjects = () => {
    KickInvest.getInstance().listProjects(true).then(proj => {
      setProjects(proj);
    });
  }

  return (
    <>
      <div id="projects-flow">
        {projects.map((e, k) => {
          return (
            <ProjectCard Element={e} key={k}/>
          )
        })}
      </div>
      <NewProject Update={updateProjects}/>
    </>
  );
}


export default Projects;
