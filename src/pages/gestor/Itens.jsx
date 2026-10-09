import { useEffect, useState } from "react";
import { Alert, Button, Card, FloatingLabel, Form, Modal, Table } from "react-bootstrap";
import { api, ApiError } from "../../services/api";
import { useNotificacao } from "../../context/NotificacaoContext";
import { BotaoSalvar, CabecalhoPagina, Carregando, EstadoVazio, ModalConfirmacao } from "../../components/ui";

const ITEM_VAZIO = { label: "", name: "", stock_quantity: 0 };

export function Itens() {
  const notificar = useNotificacao();
  const [itens, setItens] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // Modal de cadastro/edição: editandoId null = item novo.
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(ITEM_VAZIO);
  const [erroForm, setErroForm] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const [paraExcluir, setParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

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

  function abrirNovo() {
    setEditandoId(null);
    setForm(ITEM_VAZIO);
    setErroForm(null);
    setModalAberto(true);
  }

  function abrirEdicao(item) {
    setEditandoId(item.id);
    setForm({ label: item.label, name: item.name, stock_quantity: item.stock_quantity });
    setErroForm(null);
    setModalAberto(true);
  }

  async function salvar(evento) {
    evento.preventDefault();
    setErroForm(null);
    setSalvando(true);
    const corpo = { ...form, stock_quantity: Number(form.stock_quantity) };
    try {
      if (editandoId) {
        // Rota a implementar na API: PUT /items/{id}
        await api.put(`/items/${editandoId}`, corpo);
        notificar(`Item "${form.name}" atualizado.`);
      } else {
        await api.post("/items", corpo);
        notificar(`Item "${form.name}" cadastrado.`);
      }
      setModalAberto(false);
      carregarItens(busca.trim());
    } catch (e) {
      setErroForm(e instanceof ApiError ? e.message : "Não foi possível salvar o item.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluir() {
    setExcluindo(true);
    try {
      // Rota a implementar na API: DELETE /items/{id}
      await api.delete(`/items/${paraExcluir.id}`);
      setItens((lista) => lista.filter((i) => i.id !== paraExcluir.id));
      notificar(`Item "${paraExcluir.name}" excluído.`);
      setParaExcluir(null);
    } catch (e) {
      notificar(e.message, "erro");
    } finally {
      setExcluindo(false);
    }
  }

  const alterarCampo = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  return (
    <>
      <CabecalhoPagina
        titulo="Itens do catálogo"
        subtitulo="Peças que a IA sabe reconhecer nas fotos e o estoque atual de cada uma."
      >
        <Button onClick={abrirNovo}>
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
              <Button size="sm" variant="outline-primary" className="mt-2" onClick={abrirNovo}>
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
                <th className="text-end">Estoque atual</th>
                <th className="text-end pe-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((item) => (
                <tr key={item.id}>
                  <td className="ps-3 fw-medium">{item.name}</td>
                  <td><code className="small">{item.label}</code></td>
                  <td className="text-end fw-semibold numero">{item.stock_quantity.toLocaleString("pt-BR")}</td>
                  <td className="text-end pe-3 text-nowrap">
                    <Button size="sm" variant="outline-primary" className="me-1" onClick={() => abrirEdicao(item)} title="Editar item">
                      <i className="bi bi-pencil" /> <span className="d-none d-md-inline">Editar</span>
                    </Button>
                    <Button size="sm" variant="outline-danger" onClick={() => setParaExcluir(item)} title="Excluir item">
                      <i className="bi bi-trash" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <ModalConfirmacao
        show={paraExcluir !== null}
        titulo="Excluir item"
        textoConfirmar="Excluir"
        variante="danger"
        processando={excluindo}
        onConfirmar={excluir}
        onCancelar={() => setParaExcluir(null)}
      >
        <p className="mb-2">
          Excluir <strong>{paraExcluir?.name}</strong> do catálogo?
        </p>
        <p className="text-secondary small mb-0">
          A IA continua reconhecendo a peça, mas as próximas contagens não vão mais ficar ligadas a esse item.
        </p>
      </ModalConfirmacao>

      <Modal show={modalAberto} onHide={() => setModalAberto(false)} centered>
        <Form onSubmit={salvar}>
          <Modal.Header closeButton>
            <Modal.Title as="h5">
              <i className={`bi ${editandoId ? "bi-pencil-square" : "bi-box-seam"} me-2 text-warning`} />
              {editandoId ? "Editar item" : "Novo item"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {erroForm && <Alert variant="danger">{erroForm}</Alert>}

            <FloatingLabel controlId="item-nome" label="Nome" className="mb-3">
              <Form.Control placeholder="Parafuso 10mm" value={form.name} onChange={alterarCampo("name")} autoFocus required />
            </FloatingLabel>

            <FloatingLabel controlId="item-label" label="Label (classe da IA)">
              <Form.Control
                placeholder="parafuso_10mm"
                value={form.label}
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

            <FloatingLabel controlId="item-estoque" label={editandoId ? "Estoque atual" : "Estoque inicial"}>
              <Form.Control
                type="number"
                min={0}
                placeholder="0"
                value={form.stock_quantity}
                onChange={alterarCampo("stock_quantity")}
                required
              />
            </FloatingLabel>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setModalAberto(false)} disabled={salvando}>
              Cancelar
            </Button>
            <BotaoSalvar salvando={salvando}>{editandoId ? "Salvar alterações" : "Cadastrar item"}</BotaoSalvar>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
