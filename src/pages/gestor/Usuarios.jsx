import { useEffect, useState } from "react";
import { Alert, Badge, Button, Card, Col, Container, Form, Row, Table } from "react-bootstrap";
import { api, ApiError } from "../../services/api";

const USUARIO_VAZIO = { name: "", email: "", password: "", role: "funcionario" };

export function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const [novoUsuario, setNovoUsuario] = useState(USUARIO_VAZIO);
  const [erroForm, setErroForm] = useState(null);
  const [salvando, setSalvando] = useState(false);

  function carregarUsuarios() {
    setCarregando(true);
    api
      .get("/users")
      .then(setUsuarios)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }

  useEffect(carregarUsuarios, []);

  async function cadastrar(evento) {
    evento.preventDefault();
    setErroForm(null);
    setSalvando(true);
    try {
      await api.post("/users", novoUsuario);
      setNovoUsuario(USUARIO_VAZIO);
      carregarUsuarios();
    } catch (e) {
      setErroForm(e instanceof ApiError ? e.message : "Não foi possível cadastrar o usuário.");
    } finally {
      setSalvando(false);
    }
  }

  async function alternarAcesso(usuario) {
    await api.patch(`/users/${usuario.id}/active?ativo=${!usuario.active}`);
    carregarUsuarios();
  }

  return (
    <Container>
      <h1 className="mb-4">Usuários</h1>

      <Row>
        <Col md={7}>
          {erro && <Alert variant="danger">{erro}</Alert>}
          {carregando ? (
            <p>Carregando...</p>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Papel</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario) => (
                  <tr key={usuario.id}>
                    <td>{usuario.name}</td>
                    <td>{usuario.email}</td>
                    <td>{usuario.role === "gestor" ? "Gestor" : "Funcionário"}</td>
                    <td>
                      <Badge bg={usuario.active ? "success" : "secondary"}>
                        {usuario.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant={usuario.active ? "outline-danger" : "outline-success"}
                        onClick={() => alternarAcesso(usuario)}
                      >
                        {usuario.active ? "Desativar" : "Ativar"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Col>

        <Col md={5}>
          <Card>
            <Card.Body>
              <Card.Title>Novo usuário</Card.Title>

              {erroForm && <Alert variant="danger">{erroForm}</Alert>}

              <Form onSubmit={cadastrar}>
                <Form.Group className="mb-3">
                  <Form.Label>Nome</Form.Label>
                  <Form.Control
                    value={novoUsuario.name}
                    onChange={(e) => setNovoUsuario({ ...novoUsuario, name: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>E-mail</Form.Label>
                  <Form.Control
                    type="email"
                    value={novoUsuario.email}
                    onChange={(e) => setNovoUsuario({ ...novoUsuario, email: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Senha</Form.Label>
                  <Form.Control
                    type="password"
                    minLength={8}
                    value={novoUsuario.password}
                    onChange={(e) => setNovoUsuario({ ...novoUsuario, password: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Papel</Form.Label>
                  <Form.Select
                    value={novoUsuario.role}
                    onChange={(e) => setNovoUsuario({ ...novoUsuario, role: e.target.value })}
                  >
                    <option value="funcionario">Funcionário</option>
                    <option value="gestor">Gestor</option>
                  </Form.Select>
                </Form.Group>

                <Button type="submit" className="w-100" disabled={salvando}>
                  {salvando ? "Cadastrando..." : "Cadastrar"}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
