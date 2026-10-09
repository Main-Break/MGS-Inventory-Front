import { useEffect, useState } from "react";
import { Alert, Badge, Button, Card, Col, FloatingLabel, Form, Modal, Row, Table } from "react-bootstrap";
import { api, ApiError } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useNotificacao } from "../../context/NotificacaoContext";
import { inicial, nomePapel } from "../../utils/formatacao";
import { BotaoSalvar, CabecalhoPagina, Carregando, EstadoVazio, ModalConfirmacao } from "../../components/ui";

const USUARIO_VAZIO = { name: "", email: "", password: "", role: "funcionario" };

export function Usuarios() {
  const { usuario: eu } = useAuth();
  const notificar = useNotificacao();
  const [usuarios, setUsuarios] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // Modal de cadastro/edição: editandoId null = usuário novo.
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(USUARIO_VAZIO);
  const [erroForm, setErroForm] = useState(null);
  const [salvando, setSalvando] = useState(false);

  // Usuário que está pra ser desativado (abre o modal de confirmação).
  const [paraDesativar, setParaDesativar] = useState(null);
  const [alterandoAcesso, setAlterandoAcesso] = useState(false);

  function carregarUsuarios() {
    setCarregando(true);
    setErro(null);
    api
      .get("/users")
      .then(setUsuarios)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }

  useEffect(carregarUsuarios, []);

  function abrirNovo() {
    setEditandoId(null);
    setForm(USUARIO_VAZIO);
    setErroForm(null);
    setModalAberto(true);
  }

  function abrirEdicao(usuario) {
    setEditandoId(usuario.id);
    setForm({ name: usuario.name, email: usuario.email, password: "", role: usuario.role });
    setErroForm(null);
    setModalAberto(true);
  }

  async function salvar(evento) {
    evento.preventDefault();
    setErroForm(null);
    setSalvando(true);
    try {
      if (editandoId) {
        // Rota a implementar na API: PUT /users/{id}. Senha vazia = não muda.
        const atualizado = await api.put(`/users/${editandoId}`, { ...form, password: form.password || null });
        setUsuarios((lista) => lista.map((u) => (u.id === atualizado.id ? atualizado : u)));
        notificar(`Dados de ${form.name} atualizados.`);
      } else {
        await api.post("/users", form);
        notificar(`${form.name} cadastrado como ${nomePapel(form.role).toLowerCase()}.`);
        carregarUsuarios();
      }
      setModalAberto(false);
    } catch (e) {
      setErroForm(e instanceof ApiError ? e.message : "Não foi possível salvar o usuário.");
    } finally {
      setSalvando(false);
    }
  }

  async function mudarAcesso(usuario, ativo) {
    setAlterandoAcesso(true);
    try {
      const atualizado = await api.patch(`/users/${usuario.id}/active?ativo=${ativo}`);
      setUsuarios((lista) => lista.map((u) => (u.id === atualizado.id ? atualizado : u)));
      notificar(`Acesso de ${usuario.name} ${ativo ? "liberado" : "bloqueado"}.`);
      setParaDesativar(null);
    } catch (e) {
      notificar(e.message, "erro");
    } finally {
      setAlterandoAcesso(false);
    }
  }

  const alterarCampo = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const termo = busca.trim().toLowerCase();
  const listaFiltrada = usuarios.filter(
    (u) => !termo || `${u.name} ${u.email}`.toLowerCase().includes(termo),
  );

  return (
    <>
      <CabecalhoPagina titulo="Usuários" subtitulo="Quem pode entrar no sistema e o que cada um pode fazer.">
        <Button onClick={abrirNovo}>
          <i className="bi bi-person-plus me-2" />
          Novo usuário
        </Button>
      </CabecalhoPagina>

      {erro && <Alert variant="danger">{erro}</Alert>}

      <Card className="border-0 shadow-sm overflow-hidden">
        <Card.Header className="bg-body border-bottom d-flex flex-wrap justify-content-between align-items-center gap-2 py-3">
          <div className="campo-busca flex-grow-1" style={{ maxWidth: "360px" }}>
            <i className="bi bi-search" />
            <Form.Control
              size="sm"
              placeholder="Buscar por nome ou e-mail..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              aria-label="Buscar usuário"
            />
          </div>
          {!carregando && (
            <span className="text-secondary small">
              {usuarios.filter((u) => u.active).length} de {usuarios.length} com acesso ativo
            </span>
          )}
        </Card.Header>

        {carregando ? (
          <Carregando />
        ) : listaFiltrada.length === 0 ? (
          <EstadoVazio icone="bi-people" titulo="Nenhum usuário encontrado">
            Confira a busca digitada.
          </EstadoVazio>
        ) : (
          <Table hover responsive className="tabela-lista">
            <thead>
              <tr>
                <th className="ps-3">Usuário</th>
                <th>Papel</th>
                <th>Status</th>
                <th className="text-end pe-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {listaFiltrada.map((u) => (
                <tr key={u.id} className={u.active ? "" : "opacity-75"}>
                  <td className="ps-3">
                    <div className="d-flex align-items-center gap-2">
                      <span className="avatar avatar-sm bg-primary-subtle text-primary-emphasis">{inicial(u.name)}</span>
                      <div className="overflow-hidden">
                        <div className="fw-medium text-truncate">
                          {u.name}
                          {u.id === eu.id && <span className="text-secondary small ms-1">(você)</span>}
                        </div>
                        <div className="text-secondary small text-truncate">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Badge
                      pill
                      bg={u.role === "gestor" ? "primary-subtle" : "secondary-subtle"}
                      text={u.role === "gestor" ? "primary-emphasis" : "secondary-emphasis"}
                      className="fw-medium"
                    >
                      {nomePapel(u.role)}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={u.active ? "success" : "secondary"}>{u.active ? "Ativo" : "Inativo"}</Badge>
                  </td>
                  <td className="text-end pe-3 text-nowrap">
                    <Button size="sm" variant="outline-primary" className="me-1" onClick={() => abrirEdicao(u)} title="Editar usuário">
                      <i className="bi bi-pencil" /> <span className="d-none d-md-inline">Editar</span>
                    </Button>
                    {u.active ? (
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => setParaDesativar(u)}
                        disabled={u.id === eu.id}
                        title={u.id === eu.id ? "Você não pode bloquear o próprio acesso" : "Bloquear acesso"}
                      >
                        <i className="bi bi-person-slash me-1" /> Desativar
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline-success" onClick={() => mudarAcesso(u, true)} disabled={alterandoAcesso}>
                        <i className="bi bi-person-check me-1" /> Ativar
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <ModalConfirmacao
        show={paraDesativar !== null}
        titulo="Desativar usuário"
        textoConfirmar="Desativar"
        variante="danger"
        processando={alterandoAcesso}
        onConfirmar={() => mudarAcesso(paraDesativar, false)}
        onCancelar={() => setParaDesativar(null)}
      >
        <p className="mb-2">
          <strong>{paraDesativar?.name}</strong> não vai mais conseguir entrar no sistema.
        </p>
        <p className="text-secondary small mb-0">
          As verificações que essa pessoa já enviou continuam guardadas. Dá pra reativar o acesso a qualquer momento.
        </p>
      </ModalConfirmacao>

      <Modal show={modalAberto} onHide={() => setModalAberto(false)} centered>
        <Form onSubmit={salvar}>
          <Modal.Header closeButton>
            <Modal.Title as="h5">
              <i className={`bi ${editandoId ? "bi-person-gear" : "bi-person-plus"} me-2 text-info`} />
              {editandoId ? "Editar usuário" : "Novo usuário"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {erroForm && <Alert variant="danger">{erroForm}</Alert>}

            <FloatingLabel controlId="usuario-nome" label="Nome completo" className="mb-3">
              <Form.Control placeholder="Nome" value={form.name} onChange={alterarCampo("name")} autoFocus required />
            </FloatingLabel>

            <FloatingLabel controlId="usuario-email" label="E-mail" className="mb-3">
              <Form.Control
                type="email"
                placeholder="nome@empresa.com"
                autoComplete="off"
                value={form.email}
                onChange={alterarCampo("email")}
                required
              />
            </FloatingLabel>

            <Row className="g-3">
              <Col sm={7}>
                <FloatingLabel controlId="usuario-senha" label={editandoId ? "Nova senha" : "Senha inicial"}>
                  <Form.Control
                    type="password"
                    placeholder="Senha"
                    autoComplete="new-password"
                    minLength={8}
                    value={form.password}
                    onChange={alterarCampo("password")}
                    required={!editandoId}
                  />
                </FloatingLabel>
                <Form.Text>
                  {editandoId ? "Deixe em branco para manter a atual." : "Mínimo de 8 caracteres."}
                </Form.Text>
              </Col>
              <Col sm={5}>
                {/* Tirar o próprio papel de gestor deixaria a conta sem acesso a esta tela. */}
                <FloatingLabel controlId="usuario-papel" label="Papel">
                  <Form.Select
                    value={form.role}
                    onChange={alterarCampo("role")}
                    disabled={editandoId === eu.id}
                    title={editandoId === eu.id ? "Você não pode mudar o próprio papel" : undefined}
                  >
                    <option value="funcionario">Funcionário</option>
                    <option value="gestor">Gestor</option>
                  </Form.Select>
                </FloatingLabel>
              </Col>
            </Row>

            <Alert variant="secondary" className="small mt-3 mb-0 d-flex gap-2">
              <i className="bi bi-info-circle" />
              <span>
                <strong>Funcionário</strong> envia fotos e acompanha as próprias contagens.{" "}
                <strong>Gestor</strong> aprova contagens e gerencia itens e usuários.
              </span>
            </Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setModalAberto(false)} disabled={salvando}>
              Cancelar
            </Button>
            <BotaoSalvar salvando={salvando}>{editandoId ? "Salvar alterações" : "Cadastrar usuário"}</BotaoSalvar>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
