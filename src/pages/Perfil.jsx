import { useState } from "react";
import { Alert, Badge, Card, Col, FloatingLabel, Form, Row } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { useNotificacao } from "../context/NotificacaoContext";
import { api, ApiError } from "../services/api";
import { inicial, nomePapel } from "../utils/formatacao";
import { BotaoSalvar, CabecalhoPagina } from "../components/ui";

export function Perfil() {
  const { usuario, atualizarUsuario } = useAuth();
  const notificar = useNotificacao();
  const [name, setName] = useState(usuario.name);
  const [email, setEmail] = useState(usuario.email);
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const senhasDiferentes = novaSenha && confirmarSenha && novaSenha !== confirmarSenha;

  async function salvar(evento) {
    evento.preventDefault();
    setErro(null);

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
      notificar(novaSenha ? "Dados e senha atualizados." : "Dados atualizados.");
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Não foi possível salvar as alterações.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <>
      <CabecalhoPagina titulo="Meu perfil" subtitulo="Seus dados de acesso ao sistema." />

      <Row className="g-4">
        <Col lg={4}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body className="py-4">
              <span className="avatar avatar-lg bg-primary-subtle text-primary-emphasis mb-3">{inicial(usuario.name)}</span>
              <h2 className="h5 fw-bold mb-1">{usuario.name}</h2>
              <p className="text-secondary small mb-3 text-break">{usuario.email}</p>
              <Badge pill bg="primary-subtle" text="primary-emphasis" className="fw-medium px-3 py-2">
                <i className={`bi ${usuario.role === "gestor" ? "bi-shield-check" : "bi-person"} me-1`} />
                {nomePapel(usuario.role)}
              </Badge>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              {erro && <Alert variant="danger">{erro}</Alert>}

              <Form onSubmit={salvar}>
                <h6 className="secao-titulo">Dados pessoais</h6>
                <Row className="g-3 mb-4">
                  <Col md={6}>
                    <FloatingLabel controlId="perfil-nome" label="Nome">
                      <Form.Control placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} required />
                    </FloatingLabel>
                  </Col>
                  <Col md={6}>
                    <FloatingLabel controlId="perfil-email" label="E-mail">
                      <Form.Control
                        type="email"
                        placeholder="nome@empresa.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </FloatingLabel>
                  </Col>
                </Row>

                <h6 className="secao-titulo">Alterar senha</h6>
                <Row className="g-3 mb-2">
                  <Col md={6}>
                    <FloatingLabel controlId="perfil-senha" label="Nova senha">
                      <Form.Control
                        type="password"
                        placeholder="Nova senha"
                        autoComplete="new-password"
                        minLength={8}
                        value={novaSenha}
                        onChange={(e) => setNovaSenha(e.target.value)}
                      />
                    </FloatingLabel>
                  </Col>
                  <Col md={6}>
                    <FloatingLabel controlId="perfil-confirmar" label="Confirmar nova senha">
                      <Form.Control
                        type="password"
                        placeholder="Confirmar nova senha"
                        autoComplete="new-password"
                        minLength={8}
                        value={confirmarSenha}
                        onChange={(e) => setConfirmarSenha(e.target.value)}
                        disabled={!novaSenha}
                        required={Boolean(novaSenha)}
                        isInvalid={Boolean(senhasDiferentes)}
                      />
                      <Form.Control.Feedback type="invalid">As senhas não são iguais.</Form.Control.Feedback>
                    </FloatingLabel>
                  </Col>
                </Row>
                <Form.Text className="d-block mb-4">
                  Deixe em branco para manter a senha atual. Mínimo de 8 caracteres.
                </Form.Text>

                <div className="d-flex justify-content-end">
                  <BotaoSalvar salvando={salvando}>Salvar alterações</BotaoSalvar>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}
