import axios from "axios";
import { useState } from "react";
import {
  Button,
  Col,
  Container,
  Form,
  FormControl,
  Row,
  CardHeader,
  CardBody
} from "react-bootstrap";

import { useNavigate } from "react-router";
import { LOCAL_STORAGE_EMAIL, LOCAL_STORAGE_TOKEN } from "../utils/CONSTANTS";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const onFormSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:3000/auth/login", { email, password })
      .then((res) => {
        console.log(res.data);
        const token = res.data.token;
        localStorage.setItem(LOCAL_STORAGE_TOKEN, token);
        localStorage.setItem(LOCAL_STORAGE_EMAIL, email);
        navigate("/");
      })
      .catch((err) => {
        console.log(err);
        if (err.response.status === 401) {
          alert("Usuario o contraseña incorrectos");
        }
      });
  };

  return (
    <>
      <Container className="mt-3">
        <Row>
          <Col xs={6}>
              <CardHeader>Iniciar sesión</CardHeader>
              <CardBody>
                <div>
                  <Form onSubmit={onFormSubmit}>
                    <div>
                      <label>Email</label>
                      <FormControl
                        required="true"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <label>Contraseña</label>
                      <FormControl
                        required="true"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <div className="mt-2">
                      <Button variant="primary" type="submit">
                        Enviar
                      </Button>
                    </div>
                  </Form>
                </div>
              </CardBody>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Login;
