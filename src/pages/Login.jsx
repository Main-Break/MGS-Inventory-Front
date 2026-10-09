import { useState } from "react";
import { Alert, Button, Card, Container, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo-mgs.png";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function enviar(evento) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (erroRequisicao) {
      setErro(erroRequisicao.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <Card style={{ width: "100%", maxWidth: "380px" }}>
        <Card.Body>
          <div className="text-center mb-4">
            <img src={logo} alt="MGS Plásticos" className="img-fluid mb-2" style={{ maxHeight: "64px" }} />
            <Card.Title className="text-muted mb-0">Inventário por Foto</Card.Title>
          </div>

          {erro && <Alert variant="danger">{erro}</Alert>}

          <Form onSubmit={enviar}>
            <Form.Group className="mb-3">
              <Form.Label>E-mail</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Senha</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button type="submit" className="w-100" disabled={enviando}>
              {enviando ? "Entrando..." : "Entrar"}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
