import { useEffect, useState } from "react";
import { Alert, Button, Card, Container, Form, Table } from "react-bootstrap";
import { api, ApiError } from "../../services/api";

export function EnviarFoto() {
  const [itens, setItens] = useState([]);
  const [itemId, setItemId] = useState("");
  const [arquivo, setArquivo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    api.get("/items").then(setItens).catch(() => setItens([]));
  }, []);

  function escolherArquivo(evento) {
    const escolhido = evento.target.files[0];
    setArquivo(escolhido);
    setResultado(null);
    setPreview(escolhido ? URL.createObjectURL(escolhido) : null);
  }

  async function enviar(evento) {
    evento.preventDefault();
    if (!arquivo) return;

    setErro(null);
    setResultado(null);
    setEnviando(true);

    const dados = new FormData();
    dados.append("file", arquivo);
    if (itemId) dados.append("item_id", itemId);

    try {
      const verificacao = await api.post("/verifications", dados);
      setResultado(verificacao);
      setArquivo(null);
      setPreview(null);
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Não foi possível enviar a foto.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Container style={{ maxWidth: "480px" }}>
      <h1 className="mb-4">Enviar foto</h1>

      {erro && <Alert variant="danger">{erro}</Alert>}

      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={enviar}>
            <Form.Group className="mb-3">
              <Form.Label>Item (opcional)</Form.Label>
              <Form.Select value={itemId} onChange={(e) => setItemId(e.target.value)}>
                <option value="">Não informar</option>
                {itens.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Foto</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                capture="environment"
                onChange={escolherArquivo}
                required
              />
            </Form.Group>

            {preview && (
              <img src={preview} alt="Pré-visualização" className="img-fluid rounded mb-3" />
            )}

            <Button type="submit" className="w-100" disabled={enviando || !arquivo}>
              {enviando ? "Enviando..." : "Enviar e contar"}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {resultado && (
        <Card>
          <Card.Body>
            <Card.Title>Resultado</Card.Title>
            <Table size="sm" bordered>
              <thead>
                <tr>
                  <th>Classe</th>
                  <th>Contagem</th>
                  <th>Confiança</th>
                </tr>
              </thead>
              <tbody>
                {resultado.detections.map((d, i) => (
                  <tr key={i}>
                    <td>{d.label}</td>
                    <td>{d.count}</td>
                    <td>{(d.confidence * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <p className="text-muted mb-0">Verificação #{resultado.id}, aguardando aprovação do gestor.</p>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}
