import { useEffect, useRef, useState } from "react";
import { Alert, Button, Card, FloatingLabel, Form, Spinner, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { api, ApiError } from "../../services/api";
import { totalDetectado } from "../../utils/formatacao";
import { CabecalhoPagina, StatusVerificacao } from "../../components/ui";

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

  // Libera a memória da foto anterior quando troca o preview.
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

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

  function novaFoto() {
    setResultado(null);
    setPreview(null);
    setErro(null);
  }

  return (
    <div className="mx-auto" style={{ maxWidth: "560px" }}>
      <CabecalhoPagina titulo="Enviar foto" subtitulo="Fotografe as peças e a IA faz a contagem pra você." />

      {erro && (
        <Alert variant="danger" className="d-flex gap-2">
          <i className="bi bi-exclamation-triangle-fill" />
          <span>{erro}</span>
        </Alert>
      )}

      {!resultado && (
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body className="p-4">
            <h6 className="secao-titulo">1. Qual peça você vai contar?</h6>
            <FloatingLabel controlId="foto-item" label="Item (opcional)" className="mb-4">
              <Form.Select value={itemId} onChange={(e) => setItemId(e.target.value)} disabled={enviando}>
                <option value="">Não sei / não informar</option>
                {itens.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </Form.Select>
            </FloatingLabel>

            <h6 className="secao-titulo">2. Tire a foto</h6>
            {preview ? (
              <div className="preview-foto mb-3">
                <img src={preview} alt="Foto enviada" />
                {enviando && (
                  <div className="preview-foto__overlay">
                    <Spinner animation="border" />
                    <span className="fw-medium">Contando as peças...</span>
                  </div>
                )}
              </div>
            ) : null}

            {!enviando && (
              <label className="area-foto w-100" htmlFor="foto-arquivo">
                <i className="bi bi-camera" />
                <span className="fw-semibold">{preview ? "Tirar outra foto" : "Toque para tirar a foto"}</span>
                <span className="text-secondary small">
                  Enquadre todas as peças, com boa luz e sem sobreposição.
                </span>
              </label>
            )}
            <input
              id="foto-arquivo"
              ref={inputFotoRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={fotoTirada}
              disabled={enviando}
              className="d-none"
            />
          </Card.Body>
        </Card>
      )}

      {resultado && (
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body className="p-4">
            <div className="d-flex align-items-center gap-3 mb-4">
              <span className="nav-icon bg-success-subtle text-success-emphasis" style={{ width: 48, height: 48, fontSize: "1.5rem" }}>
                <i className="bi bi-check2-circle" />
              </span>
              <div>
                <h2 className="h5 fw-bold mb-0">Foto enviada</h2>
                <span className="text-secondary small">
                  Verificação #{resultado.id} · <StatusVerificacao approved={resultado.approved} />
                </span>
              </div>
            </div>

            {preview && (
              <div className="preview-foto mb-4">
                <img src={preview} alt="Foto enviada" />
              </div>
            )}

            <div className="text-center mb-4">
              <div className="text-secondary small">Total de peças contadas</div>
              <div className="display-5 fw-bold numero">{totalDetectado(resultado.detections)}</div>
            </div>

            {resultado.detections.length > 0 ? (
              <Table size="sm" className="tabela-lista mb-3">
                <thead>
                  <tr>
                    <th>Peça</th>
                    <th className="text-end">Qtd.</th>
                    <th className="text-end">Confiança</th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.detections.map((d) => (
                    <tr key={d.label}>
                      <td><code className="small">{d.label}</code></td>
                      <td className="text-end fw-semibold numero">{d.count}</td>
                      <td className="text-end text-secondary numero">{(d.confidence * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <Alert variant="warning" className="small">
                A IA não reconheceu nenhuma peça. Tente outra foto com mais luz e as peças mais visíveis.
              </Alert>
            )}

            <p className="text-secondary small mb-4">
              <i className="bi bi-info-circle me-1" />
              O gestor vai revisar essa contagem antes de ela valer no estoque.
            </p>

            <div className="d-grid gap-2">
              <Button size="lg" onClick={novaFoto}>
                <i className="bi bi-camera me-2" />
                Enviar outra foto
              </Button>
              <Button as={Link} to="/minhas-verificacoes" variant="outline-secondary">
                Ver minhas verificações
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
