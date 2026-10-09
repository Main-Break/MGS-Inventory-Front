import { useEffect, useState } from "react";
import { Alert, Badge, Button, Card, Form, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useNotificacao } from "../../context/NotificacaoContext";
import { inicial, nomePapel } from "../../utils/formatacao";
import { PERMISSOES } from "../../utils/permissoes";
import { CabecalhoPagina, Carregando, EstadoVazio, ModalConfirmacao } from "../../components/ui";

export function Usuarios() {
  const { usuario: eu } = useAuth();
  const notificar = useNotificacao();
  const [usuarios, setUsuarios] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // Usuário que está pra ser desativado (abre o modal de confirmação).
  const [paraDesativar, setParaDesativar] = useState(null);
  const [alterandoAcesso, setAlterandoAcesso] = useState(false);

  useEffect(() => {
    api
      .get("/users")
      .then(setUsuarios)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

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

  const termo = busca.trim().toLowerCase();
  const listaFiltrada = usuarios.filter(
    (u) => !termo || `${u.name} ${u.email}`.toLowerCase().includes(termo),
  );

  return (
    <>
      <CabecalhoPagina titulo="Usuários" subtitulo="Quem pode entrar no sistema e o que cada um pode fazer.">
        <Button as={Link} to="/usuarios/novo">
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
                    <Link to={`/usuarios/${u.id}`} className="d-flex align-items-center gap-2 text-decoration-none text-body">
                      <span className="avatar avatar-sm bg-primary-subtle text-primary-emphasis">{inicial(u.name)}</span>
                      <div className="overflow-hidden">
                        <div className="fw-medium text-truncate">
                          {u.name}
                          {u.id === eu.id && <span className="text-secondary small ms-1">(você)</span>}
                        </div>
                        <div className="text-secondary small text-truncate">{u.email}</div>
                      </div>
                    </Link>
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
                    {u.extra_permissions?.length > 0 && (
                      <Badge
                        pill
                        bg="info-subtle"
                        text="info-emphasis"
                        className="fw-medium ms-1"
                        title={u.extra_permissions.map((p) => PERMISSOES[p]?.rotulo ?? p).join(", ")}
                      >
                        +{u.extra_permissions.length} {u.extra_permissions.length === 1 ? "permissão" : "permissões"}
                      </Badge>
                    )}
                  </td>
                  <td>
                    <Badge bg={u.active ? "success" : "secondary"}>{u.active ? "Ativo" : "Inativo"}</Badge>
                  </td>
                  <td className="text-end pe-3 text-nowrap">
                    <Button as={Link} to={`/usuarios/${u.id}`} size="sm" variant="outline-primary" className="me-1" title="Editar usuário">
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
    </>
  );
}
