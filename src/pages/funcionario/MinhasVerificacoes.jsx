import { useEffect, useState } from "react";
import { Alert, Badge, Container, Table } from "react-bootstrap";
import { api } from "../../services/api";
import { formatarData, resumoDeteccoes } from "../../utils/formatacao";

function Status({ approved }) {
  if (approved === null) return <Badge bg="warning" text="dark">Pendente</Badge>;
  return approved ? <Badge bg="success">Aprovada</Badge> : <Badge bg="danger">Rejeitada</Badge>;
}

export function MinhasVerificacoes() {
  const [verificacoes, setVerificacoes] = useState([]);
  const [itensPorId, setItensPorId] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    Promise.all([api.get("/verifications"), api.get("/items")])
      .then(([verificationsData, itemsData]) => {
        setVerificacoes(verificationsData);
        setItensPorId(Object.fromEntries(itemsData.map((i) => [i.id, i.name])));
      })
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  return (
    <Container>
      <h1 className="mb-4">Minhas verificações</h1>

      {erro && <Alert variant="danger">{erro}</Alert>}

      {carregando ? (
        <p>Carregando...</p>
      ) : verificacoes.length === 0 ? (
        <p className="text-muted">Você ainda não enviou nenhuma foto.</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Data</th>
              <th>Item</th>
              <th>Itens detectados pela IA</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {verificacoes.map((v) => (
              <tr key={v.id}>
                <td>{formatarData(v.created_at)}</td>
                <td>{v.item_id ? (itensPorId[v.item_id] ?? `Item #${v.item_id}`) : "Não informado"}</td>
                <td>{resumoDeteccoes(v.detections)}</td>
                <td><Status approved={v.approved} /></td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}
