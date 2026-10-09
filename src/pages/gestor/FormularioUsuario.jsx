import { useEffect, useState } from "react";
import { Alert, Badge, Button, Card, Col, FloatingLabel, Form, Row } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, ApiError } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useNotificacao } from "../../context/NotificacaoContext";
import { inicial, nomePapel } from "../../utils/formatacao";
import { PERMISSOES_DO_PAPEL } from "../../utils/permissoes";
import { EditorPermissoes } from "../../components/EditorPermissoes";
import { BotaoSalvar, CabecalhoPagina, Carregando, EstadoVazio } from "../../components/ui";

const USUARIO_VAZIO = { name: "", email: "", password: "", role: "funcionario", extra_permissions: [] };

// Cadastro (/usuarios/novo) e edição (/usuarios/:id) de usuário numa tela
// própria, e não em modal: a lista de permissões pode ficar grande.
export function FormularioUsuario() {
  const { id } = useParams();
  const editando = Boolean(id);
  const { usuario: eu } = useAuth();
  const notificar = useNotificacao();
  const navigate = useNavigate();

  const [form, setForm] = useState(USUARIO_VAZIO);
  const [original, setOriginal] = useState(null);
  const [carregando, setCarregando] = useState(editando);
  const [naoEncontrado, setNaoEncontrado] = useState(false);
  const [erro, setErro] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const souEu = editando && Number(id) === eu.id;

  // A API não tem GET /users/{id}: busca a lista e acha o usuário nela.
  useEffect(() => {
    if (!editando) return;
    api
      .get("/users")
      .then((lista) => {
        const u = lista.find((x) => x.id === Number(id));
        if (!u) {
          setNaoEncontrado(true);
          return;
        }
        const dados = {
          name: u.name,
          email: u.email,
          password: "",
          role: u.role,
          extra_permissions: u.extra_permissions ?? [],
        };
        setForm(dados);
        setOriginal({ ...u, ...dados });
      })
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, [editando, id]);

  const alterarCampo = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  // Indicador de "alterações não salvas" na barra de ações.
  const alterado = editando
    ? original &&
      (form.name !== original.name ||
        form.email !== original.email ||
        form.role !== original.role ||
        form.password !== "" ||
        [...form.extra_permissions].sort().join() !== [...original.extra_permissions].sort().join())
    : form.name || form.email || form.password;

  async function salvar(evento) {
    evento.preventDefault();
    setErro(null);
    setSalvando(true);
    // Extra que o papel já cobre não precisa ir (ex: virou gestor).
    const doPapel = PERMISSOES_DO_PAPEL[form.role] ?? [];
    const corpo = { ...form, extra_permissions: form.extra_permissions.filter((p) => !doPapel.includes(p)) };
    try {
      if (editando) {
        // Rota a implementar na API: PUT /users/{id}. Senha vazia = não muda.
        await api.put(`/users/${id}`, { ...corpo, password: corpo.password || null });
        notificar(`Dados de ${form.name} atualizados.`);
      } else {
        await api.post("/users", corpo);
        notificar(`${form.name} cadastrado como ${nomePapel(form.role).toLowerCase()}.`);
      }
      navigate("/usuarios");
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Não foi possível salvar o usuário.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <Carregando />;
  if (naoEncontrado) {
    return (
      <EstadoVazio icone="bi-person-x" titulo="Usuário não encontrado">
        <Button as={Link} to="/usuarios" size="sm" variant="outline-primary" className="mt-2">
          Voltar para Usuários
        </Button>
      </EstadoVazio>
    );
  }

  return (
    <Form onSubmit={salvar} className="pagina-formulario">
      <Link to="/usuarios" className="text-decoration-none small d-inline-flex align-items-center gap-1 mb-2">
        <i className="bi bi-arrow-left" /> Usuários
      </Link>
      <CabecalhoPagina
        titulo={editando ? original?.name : "Novo usuário"}
        subtitulo={editando ? "Dados de acesso e permissões deste usuário." : "Cadastre o acesso e defina o que a pessoa pode fazer."}
      >
        {editando && original && (
          <Badge bg={original.active ? "success" : "secondary"} className="align-self-center">
            {original.active ? "Ativo" : "Inativo"}
          </Badge>
        )}
      </CabecalhoPagina>

      {erro && (
        <Alert variant="danger" className="d-flex gap-2">
          <i className="bi bi-exclamation-triangle-fill" />
          <span>{erro}</span>
        </Alert>
      )}

      <Row className="g-4">
        <Col lg={4}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="p-4">
              {editando && (
                <div className="d-flex align-items-center gap-3 mb-4">
                  <span className="avatar avatar-lg bg-primary-subtle text-primary-emphasis">{inicial(form.name)}</span>
                  <div className="overflow-hidden">
                    <div className="fw-semibold text-truncate">{form.name || "Sem nome"}</div>
                    <div className="text-secondary small text-truncate">{form.email}</div>
                  </div>
                </div>
              )}

              <h6 className="secao-titulo">Dados de acesso</h6>
              <FloatingLabel controlId="usuario-nome" label="Nome completo" className="mb-3">
                <Form.Control placeholder="Nome" value={form.name} onChange={alterarCampo("name")} autoFocus={!editando} required />
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

              <FloatingLabel controlId="usuario-senha" label={editando ? "Nova senha" : "Senha inicial"}>
                <Form.Control
                  type="password"
                  placeholder="Senha"
                  autoComplete="new-password"
                  minLength={8}
                  value={form.password}
                  onChange={alterarCampo("password")}
                  required={!editando}
                />
              </FloatingLabel>
              <Form.Text className="d-block mb-4">
                {editando ? "Deixe em branco para manter a senha atual." : "Mínimo de 8 caracteres. A pessoa pode trocar depois no perfil."}
              </Form.Text>

              <h6 className="secao-titulo">Papel</h6>
              <div className="d-flex flex-column gap-2">
                {[
                  { valor: "funcionario", icone: "bi-person", texto: "Envia fotos e acompanha as próprias contagens." },
                  { valor: "gestor", icone: "bi-shield-check", texto: "Revisa contagens e gerencia itens e usuários." },
                ].map((papel) => (
                  <label
                    key={papel.valor}
                    htmlFor={`papel-${papel.valor}`}
                    className={`d-flex gap-3 border rounded-3 p-3 mb-0 ${form.role === papel.valor ? "border-primary bg-primary-subtle" : ""}`}
                    style={{ cursor: souEu ? "default" : "pointer" }}
                  >
                    <Form.Check
                      type="radio"
                      id={`papel-${papel.valor}`}
                      name="papel"
                      value={papel.valor}
                      checked={form.role === papel.valor}
                      onChange={alterarCampo("role")}
                      disabled={souEu}
                    />
                    <span>
                      <span className="fw-semibold d-block">
                        <i className={`bi ${papel.icone} me-1`} />
                        {nomePapel(papel.valor)}
                      </span>
                      <span className="text-secondary small">{papel.texto}</span>
                    </span>
                  </label>
                ))}
              </div>
              {souEu && <Form.Text className="d-block mt-2">Você não pode mudar o próprio papel.</Form.Text>}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h6 className="secao-titulo mb-1">Permissões</h6>
              <p className="text-secondary small mb-3">
                O papel já libera as permissões marcadas como <em>do papel</em>. As outras podem ser liberadas só para este usuário.
              </p>
              <EditorPermissoes
                papel={form.role}
                extras={form.extra_permissions}
                onChange={(extras) => setForm({ ...form, extra_permissions: extras })}
                bloqueado={souEu}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Barra fixa no rodapé: salvar fica sempre à mão, mesmo com a lista de permissões longa. */}
      <div className="barra-acoes">
        <span className="text-secondary small me-auto">
          {alterado ? (
            <>
              <i className="bi bi-circle-fill text-warning me-1" style={{ fontSize: ".5rem" }} />
              Alterações não salvas
            </>
          ) : (
            "Nenhuma alteração"
          )}
        </span>
        <Button as={Link} to="/usuarios" variant="outline-secondary" disabled={salvando}>
          Cancelar
        </Button>
        <BotaoSalvar salvando={salvando} disabled={salvando || !alterado}>
          {editando ? "Salvar alterações" : "Cadastrar usuário"}
        </BotaoSalvar>
      </div>
    </Form>
  );
}
