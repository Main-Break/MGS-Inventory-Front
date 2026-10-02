import { useEffect, useRef, useState } from "react";
import { Alert, Card, Container, Form, Spinner, Table } from "react-bootstrap";
import { api, ApiError } from "../../services/api";

export function EnviarFoto() {
  const [itens, setItens] = useState([]);
  const [itemId, setItemId] = useState("");
  const [preview, setPreview] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);
  const [resultado, setResultado] = useState(null);
  const inputFotoRef = useRef(null);

  useEffect(() => {
    api.get("/items").then(setItens).catch(() => setItens([]));
  }, []);

  // A foto só vem do input depois que o usuário já tirou e confirmou no
  // app de câmera do celular, então a escolha do arquivo já vale como
  // confirmação: manda pra API na hora, sem precisar de outro clique.
  async function fotoTirada(evento) {
    const arquivo = evento.target.files[0];
    if (!arquivo) return;

    setErro(null);
    setResultado(null);
    setPreview(URL.createObjectURL(arquivo));
    setEnviando(true);

    const dados = new FormData();
    dados.append("file", arquivo);
    if (itemId) dados.append("item_id", itemId);

    try {
      const verificacao = await api.post("/verifications", dados);
      setResultado(verificacao);
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Não foi possível enviar a foto.");
    } finally {
      setEnviando(false);
      if (inputFotoRef.current) inputFotoRef.current.value = "";
    }
  }

  return (
    <Container style={{ maxWidth: "480px" }}>
      <h1 className="mb-4">Enviar foto</h1>

      {erro && <Alert variant="danger">{erro}</Alert>}

      <Card className="mb-4">
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Label>Item (opcional)</Form.Label>
            <Form.Select value={itemId} onChange={(e) => setItemId(e.target.value)} disabled={enviando}>
              <option value="">Não informar</option>
              {itens.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Foto</Form.Label>
            <Form.Control
              ref={inputFotoRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={fotoTirada}
              disabled={enviando}
            />
          </Form.Group>

          {preview && (
            <img src={preview} alt="Última foto enviada" className="img-fluid rounded mb-2" />
          )}

          {enviando && (
            <div className="d-flex align-items-center gap-2 text-muted">
              <Spinner animation="border" size="sm" />
              Enviando e contando...
            </div>
          )}
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
