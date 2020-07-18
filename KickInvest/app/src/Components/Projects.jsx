import React from "react";
import Card from "react-bootstrap/Card";
import ProjectModal from "./ProjectModal";
import { Modal, Form, Col, Button } from "react-bootstrap";
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

  const [newProjectShow, setNewProjectShow] = React.useState(false);

  const [projectName, setProjectName] = React.useState('');
  const [projectImage, setProjectImage] = React.useState('');
  const [projectEmail, setProjectEmail] = React.useState('');
  const [projectDescription, setProjectDescription] = React.useState('');

  const projectNameOnChange = (e) => {
    setProjectName(e.target.value);
  };

  const projectImageOnChange = (e) => {
    setProjectImage(e.target.value);
  };

  const projectEmailOnChange = (e) => {
    setProjectEmail(e.target.value);
  };

  const projectDescriptionOnChange = (e)  =>{
    setProjectDescription(e.target.value);
  };

  const newProject = async (e) => {
    KickInvest.getInstance().createProject(projectName, projectEmail, projectDescription, projectImage).then((e) => {
      props.Update();
    })
  }

  return (
    <>
      <div id="projects-add">
        <i className="fas fa-plus" onClick={() => setNewProjectShow(true)}></i>
      </div>
      <Modal
          show={newProjectShow}
          onHide={() => setNewProjectShow(false)}
          size="lg"
          centered
          id="new-project-modal"
        >
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

          <Button variant="primary" onClick={() => newProject()}>
            Submit
          </Button>
        </Form>
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
