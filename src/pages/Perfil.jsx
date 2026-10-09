import { useState } from "react";
import { Alert, Badge, Button, Card, Container, Form } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { api, ApiError } from "../services/api";

export function Perfil() {
  const { usuario, atualizarUsuario } = useAuth();
  const [name, setName] = useState(usuario.name);
  const [email, setEmail] = useState(usuario.email);
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(false);
  const [salvando, setSalvando] = useState(false);

  async function salvar(evento) {
    evento.preventDefault();
    setErro(null);
    setSucesso(false);

    if (novaSenha && novaSenha !== confirmarSenha) {
      setErro("As senhas digitadas não são iguais.");
      return;
    }

    setSalvando(true);
    try {
      const dados = await api.put("/users/me", {
        name,
        email,
        password: novaSenha || null,
      });
      atualizarUsuario(dados);
      setNovaSenha("");
      setConfirmarSenha("");
      setSucesso(true);
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Não foi possível salvar as alterações.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Container style={{ maxWidth: "480px" }}>
      <h1 className="mb-4">Meu perfil</h1>

      <Card>
        <Card.Body>
          <p className="mb-3">
            Papel: <Badge bg="secondary">{usuario.role === "gestor" ? "Gestor" : "Funcionário"}</Badge>
          </p>

          {erro && <Alert variant="danger">{erro}</Alert>}
          {sucesso && <Alert variant="success">Dados atualizados com sucesso.</Alert>}

          <Form onSubmit={salvar}>
            <Form.Group className="mb-3">
              <Form.Label>Nome</Form.Label>
              <Form.Control value={name} onChange={(e) => setName(e.target.value)} required />
            </Form.Group>

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
              <Form.Label>Nova senha</Form.Label>
              <Form.Control
                type="password"
                placeholder="Deixe em branco para não alterar"
                minLength={8}
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
              />
            </Form.Group>

            {novaSenha && (
              <Form.Group className="mb-3">
                <Form.Label>Confirmar nova senha</Form.Label>
                <Form.Control
                  type="password"
                  minLength={8}
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  required
                />
              </Form.Group>
            )}

            <Button type="submit" className="w-100" disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar alterações"}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
