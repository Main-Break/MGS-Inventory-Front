import { useEffect, useState } from "react";
import { Alert, Button, Card, Col, Container, Form, Row, Table } from "react-bootstrap";
import { api, ApiError } from "../../services/api";

const ITEM_VAZIO = { label: "", name: "", stock_quantity: 0 };

export function Itens() {
  const [itens, setItens] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const [novoItem, setNovoItem] = useState(ITEM_VAZIO);
  const [erroForm, setErroForm] = useState(null);
  const [salvando, setSalvando] = useState(false);

  function carregarItens(q) {
    setCarregando(true);
    const caminho = q ? `/items?q=${encodeURIComponent(q)}` : "/items";
    api
      .get(caminho)
      .then(setItens)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }

  useEffect(() => carregarItens(""), []);

  // Busca enquanto digita, sem precisar de botão: mais simples pra quem
  // não é familiarizado com formulários de pesquisa.
  function buscar(evento) {
    const valor = evento.target.value;
    setBusca(valor);
    carregarItens(valor);
  }

  async function cadastrar(evento) {
    evento.preventDefault();
    setErroForm(null);
    setSalvando(true);
    try {
      await api.post("/items", { ...novoItem, stock_quantity: Number(novoItem.stock_quantity) });
      setNovoItem(ITEM_VAZIO);
      carregarItens(busca);
    } catch (e) {
      setErroForm(e instanceof ApiError ? e.message : "Não foi possível cadastrar o item.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Container>
      <h1 className="mb-4">Itens</h1>

      <Row>
        <Col md={7}>
          <Form.Group className="mb-3">
            <Form.Label>Buscar item</Form.Label>
            <Form.Control
              placeholder="Digite o nome do item..."
              value={busca}
              onChange={buscar}
            />
          </Form.Group>

          {erro && <Alert variant="danger">{erro}</Alert>}
          {carregando ? (
            <p>Carregando...</p>
          ) : itens.length === 0 ? (
            <p className="text-muted">Nenhum item encontrado.</p>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Label (classe da IA)</th>
                  <th>Estoque atual</th>
                </tr>
              </thead>
              <tbody>
                {itens.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.label}</td>
                    <td>{item.stock_quantity}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Col>

        <Col md={5}>
          <Card>
            <Card.Body>
              <Card.Title>Novo item</Card.Title>

              {erroForm && <Alert variant="danger">{erroForm}</Alert>}

              <Form onSubmit={cadastrar}>
                <Form.Group className="mb-3">
                  <Form.Label>Nome</Form.Label>
                  <Form.Control
                    placeholder="Ex: Parafuso 10mm"
                    value={novoItem.name}
                    onChange={(e) => setNovoItem({ ...novoItem, name: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Label</Form.Label>
                  <Form.Control
                    placeholder="Ex: parafuso_10mm"
                    value={novoItem.label}
                    onChange={(e) => setNovoItem({ ...novoItem, label: e.target.value })}
                    required
                  />
                  <Form.Text className="text-muted">
                    Tem que ser exatamente igual ao nome que a IA usa pra essa peça, letra por
                    letra. Se escrever diferente, a IA não vai conseguir contar esse item.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Estoque inicial</Form.Label>
                  <Form.Control
                    type="number"
                    min={0}
                    value={novoItem.stock_quantity}
                    onChange={(e) => setNovoItem({ ...novoItem, stock_quantity: e.target.value })}
                    required
                  />
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
