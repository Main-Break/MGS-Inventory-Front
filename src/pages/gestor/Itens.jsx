import { useEffect, useState } from "react";
import { Alert, Button, Card, FloatingLabel, Form, Modal, Table } from "react-bootstrap";
import { api, ApiError } from "../../services/api";
import { useNotificacao } from "../../context/NotificacaoContext";
import { BotaoSalvar, CabecalhoPagina, Carregando, EstadoVazio } from "../../components/ui";

const ITEM_VAZIO = { label: "", name: "", stock_quantity: 0 };

export function Itens() {
  const notificar = useNotificacao();
  const [itens, setItens] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const [modalAberto, setModalAberto] = useState(false);
  const [novoItem, setNovoItem] = useState(ITEM_VAZIO);
  const [erroForm, setErroForm] = useState(null);
  const [salvando, setSalvando] = useState(false);

  function carregarItens(q) {
    setCarregando(true);
    setErro(null);
    const caminho = q ? `/items?q=${encodeURIComponent(q)}` : "/items";
    return api
      .get(caminho)
      .then(setItens)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }

  // Busca enquanto digita, com um respiro de 250ms pra não chamar a API a
  // cada tecla (mesmo debounce dos seletores do Simple ERP).
  useEffect(() => {
    const espera = setTimeout(() => carregarItens(busca.trim()), 250);
    return () => clearTimeout(espera);
  }, [busca]);

  function abrirModal() {
    setNovoItem(ITEM_VAZIO);
    setErroForm(null);
    setModalAberto(true);
  }

  async function cadastrar(evento) {
    evento.preventDefault();
    setErroForm(null);
    setSalvando(true);
    try {
      await api.post("/items", { ...novoItem, stock_quantity: Number(novoItem.stock_quantity) });
      setModalAberto(false);
      notificar(`Item "${novoItem.name}" cadastrado.`);
      carregarItens(busca.trim());
    } catch (e) {
      setErroForm(e instanceof ApiError ? e.message : "Não foi possível cadastrar o item.");
    } finally {
      setSalvando(false);
    }
  }

  const alterarCampo = (campo) => (e) => setNovoItem({ ...novoItem, [campo]: e.target.value });

  return (
    <>
      <CabecalhoPagina
        titulo="Itens do catálogo"
        subtitulo="Peças que a IA sabe reconhecer nas fotos e o estoque atual de cada uma."
      >
        <Button onClick={abrirModal}>
          <i className="bi bi-plus-lg me-2" />
          Novo item
        </Button>
      </CabecalhoPagina>

      {erro && <Alert variant="danger">{erro}</Alert>}

      <Card className="border-0 shadow-sm overflow-hidden">
        <Card.Header className="bg-body border-bottom d-flex flex-wrap justify-content-between align-items-center gap-2 py-3">
          <div className="campo-busca flex-grow-1" style={{ maxWidth: "360px" }}>
            <i className="bi bi-search" />
            <Form.Control
              size="sm"
              placeholder="Buscar por nome ou label..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              aria-label="Buscar item"
            />
          </div>
          {!carregando && (
            <span className="text-secondary small">
              {itens.length} {itens.length === 1 ? "item" : "itens"}
            </span>
          )}
        </Card.Header>

        {carregando ? (
          <Carregando />
        ) : itens.length === 0 ? (
          <EstadoVazio icone="bi-box-seam" titulo={busca ? "Nenhum item encontrado" : "Nenhum item cadastrado"}>
            {busca ? (
              "Confira a busca ou cadastre um item novo."
            ) : (
              <Button size="sm" variant="outline-primary" className="mt-2" onClick={abrirModal}>
                <i className="bi bi-plus-lg me-1" /> Cadastrar o primeiro item
              </Button>
            )}
          </EstadoVazio>
        ) : (
          <Table hover responsive className="tabela-lista">
            <thead>
              <tr>
                <th className="ps-3">Nome</th>
                <th>Label (classe da IA)</th>
                <th className="text-end pe-3">Estoque atual</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((item) => (
                <tr key={item.id}>
                  <td className="ps-3 fw-medium">{item.name}</td>
                  <td><code className="small">{item.label}</code></td>
                  <td className="text-end pe-3 fw-semibold numero">
                    {item.stock_quantity.toLocaleString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal show={modalAberto} onHide={() => setModalAberto(false)} centered>
        <Form onSubmit={cadastrar}>
          <Modal.Header closeButton>
            <Modal.Title as="h5">
              <i className="bi bi-box-seam me-2 text-warning" />
              Novo item
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {erroForm && <Alert variant="danger">{erroForm}</Alert>}

            <FloatingLabel controlId="item-nome" label="Nome" className="mb-3">
              <Form.Control
                placeholder="Parafuso 10mm"
                value={novoItem.name}
                onChange={alterarCampo("name")}
                autoFocus
                required
              />
            </FloatingLabel>

            <FloatingLabel controlId="item-label" label="Label (classe da IA)">
              <Form.Control
                placeholder="parafuso_10mm"
                value={novoItem.label}
                onChange={alterarCampo("label")}
                className="font-monospace"
                required
              />
            </FloatingLabel>
            <Form.Text className="d-flex gap-2 mt-2 mb-3">
              <i className="bi bi-info-circle" />
              <span>
                Tem que ser exatamente igual ao nome que a IA usa pra essa peça, letra por letra.
                Se for diferente, a IA não consegue contar esse item.
              </span>
            </Form.Text>

            <FloatingLabel controlId="item-estoque" label="Estoque inicial">
              <Form.Control
                type="number"
                min={0}
                placeholder="0"
                value={novoItem.stock_quantity}
                onChange={alterarCampo("stock_quantity")}
                required
              />
            </FloatingLabel>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setModalAberto(false)} disabled={salvando}>
              Cancelar
            </Button>
            <BotaoSalvar salvando={salvando}>Cadastrar item</BotaoSalvar>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
