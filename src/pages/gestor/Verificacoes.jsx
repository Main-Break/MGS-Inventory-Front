import { useEffect, useState } from "react";
import { Alert, Badge, Button, ButtonGroup, Container, Form, Table } from "react-bootstrap";
import { api } from "../../services/api";
import { formatarData, resumoDeteccoes } from "../../utils/formatacao";

const FILTROS = {
  todas: () => true,
  pendentes: (v) => v.approved === null,
  aprovadas: (v) => v.approved === true,
  rejeitadas: (v) => v.approved === false,
};

function Status({ approved }) {
  if (approved === null) return <Badge bg="warning" text="dark">Pendente</Badge>;
  return approved ? <Badge bg="success">Aprovada</Badge> : <Badge bg="danger">Rejeitada</Badge>;
}

export function Verificacoes() {
  const [verificacoes, setVerificacoes] = useState([]);
  const [usuariosPorId, setUsuariosPorId] = useState({});
  const [itensPorId, setItensPorId] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [filtro, setFiltro] = useState("pendentes");

  function carregarTudo() {
    setCarregando(true);
    Promise.all([api.get("/verifications"), api.get("/users"), api.get("/items")])
      .then(([verificationsData, usersData, itemsData]) => {
        setVerificacoes(verificationsData);
        setUsuariosPorId(Object.fromEntries(usersData.map((u) => [u.id, u.name])));
        setItensPorId(Object.fromEntries(itemsData.map((i) => [i.id, i.name])));
      })
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }

  useEffect(carregarTudo, []);

  async function decidir(verificationId, aprovado) {
    await api.patch(`/verifications/${verificationId}/approve?aprovado=${aprovado}`);
    carregarTudo();
  }

  const listaFiltrada = verificacoes.filter(FILTROS[filtro]);

  return (
    <Container>
      <h1 className="mb-4">Verificações</h1>

      <Form.Group className="mb-3" style={{ maxWidth: "260px" }}>
        <Form.Label>Mostrar</Form.Label>
        <Form.Select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
          <option value="pendentes">Pendentes de aprovação</option>
          <option value="aprovadas">Aprovadas</option>
          <option value="rejeitadas">Rejeitadas</option>
          <option value="todas">Todas</option>
        </Form.Select>
      </Form.Group>

      {erro && <Alert variant="danger">{erro}</Alert>}

      {carregando ? (
        <p>Carregando...</p>
      ) : listaFiltrada.length === 0 ? (
        <p className="text-muted">Nenhuma verificação encontrada.</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Data</th>
              <th>Funcionário</th>
              <th>Item</th>
              <th>Itens detectados pela IA</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {listaFiltrada.map((v) => (
              <tr key={v.id}>
                <td>{formatarData(v.created_at)}</td>
                <td>{usuariosPorId[v.user_id] ?? `Usuário #${v.user_id}`}</td>
                <td>{v.item_id ? (itensPorId[v.item_id] ?? `Item #${v.item_id}`) : "Não informado"}</td>
                <td>{resumoDeteccoes(v.detections)}</td>
                <td><Status approved={v.approved} /></td>
                <td>
                  <ButtonGroup size="sm">
                    <Button
                      variant={v.approved === true ? "success" : "outline-success"}
                      onClick={() => decidir(v.id, true)}
                    >
                      Aprovar
                    </Button>
                    <Button
                      variant={v.approved === false ? "danger" : "outline-danger"}
                      onClick={() => decidir(v.id, false)}
                    >
                      Rejeitar
                    </Button>
                  </ButtonGroup>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}
