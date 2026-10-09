import { useEffect, useState } from "react";
import { Alert, Button, Card, Col, FloatingLabel, Form, Row } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, ApiError } from "../../services/api";
import { useNotificacao } from "../../context/NotificacaoContext";
import { BotaoSalvar, CabecalhoPagina, Carregando, EstadoVazio, ModalConfirmacao } from "../../components/ui";

const ITEM_VAZIO = { label: "", name: "", stock_quantity: 0 };

// Cadastro (/itens/novo) e edição (/itens/:id) de item do catálogo, em tela
// própria como o resto do sistema (modal fica só pra confirmação).
export function FormularioItem() {
  const { id } = useParams();
  const editando = Boolean(id);
  const notificar = useNotificacao();
  const navigate = useNavigate();

  const [form, setForm] = useState(ITEM_VAZIO);
  const [original, setOriginal] = useState(null);
  const [carregando, setCarregando] = useState(editando);
  const [naoEncontrado, setNaoEncontrado] = useState(false);
  const [erro, setErro] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    if (!editando) return;
    api
      .get(`/items/${id}`)
      .then((item) => {
        const dados = { label: item.label, name: item.name, stock_quantity: item.stock_quantity };
        setForm(dados);
        setOriginal(dados);
      })
      .catch((e) => (e instanceof ApiError && e.status === 404 ? setNaoEncontrado(true) : setErro(e.message)))
      .finally(() => setCarregando(false));
  }, [editando, id]);

  const alterarCampo = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const alterado = editando
    ? original &&
      (form.name !== original.name ||
        form.label !== original.label ||
        Number(form.stock_quantity) !== original.stock_quantity)
    : form.name || form.label;

  async function salvar(evento) {
    evento.preventDefault();
    setErro(null);
    setSalvando(true);
    const corpo = { ...form, stock_quantity: Number(form.stock_quantity) };
    try {
      if (editando) {
        // Rota a implementar na API: PUT /items/{id}
        await api.put(`/items/${id}`, corpo);
        notificar(`Item "${form.name}" atualizado.`);
      } else {
        await api.post("/items", corpo);
        notificar(`Item "${form.name}" cadastrado.`);
      }
      navigate("/itens");
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Não foi possível salvar o item.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSalvando(false);
    }
  }

  async function excluir() {
    setExcluindo(true);
    try {
      // Rota a implementar na API: DELETE /items/{id}
      await api.delete(`/items/${id}`);
      notificar(`Item "${original.name}" excluído.`);
      navigate("/itens");
    } catch (e) {
      notificar(e.message, "erro");
      setConfirmarExclusao(false);
    } finally {
      setExcluindo(false);
    }
  }

  if (carregando) return <Carregando />;
  if (naoEncontrado) {
    return (
      <EstadoVazio icone="bi-box-seam" titulo="Item não encontrado">
        <Button as={Link} to="/itens" size="sm" variant="outline-primary" className="mt-2">
          Voltar para Itens
        </Button>
      </EstadoVazio>
    );
  }

  return (
    <Form onSubmit={salvar} className="pagina-formulario">
      <Link to="/itens" className="text-decoration-none small d-inline-flex align-items-center gap-1 mb-2">
        <i className="bi bi-arrow-left" /> Itens do catálogo
      </Link>
      <CabecalhoPagina
        titulo={editando ? original?.name : "Novo item"}
        subtitulo={editando ? "Dados da peça e estoque atual." : "Cadastre uma peça que a IA sabe reconhecer nas fotos."}
      />

      {erro && (
        <Alert variant="danger" className="d-flex gap-2">
          <i className="bi bi-exclamation-triangle-fill" />
          <span>{erro}</span>
        </Alert>
      )}

      <Row className="g-4">
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h6 className="secao-titulo">Identificação</h6>
              <FloatingLabel controlId="item-nome" label="Nome" className="mb-3">
                <Form.Control placeholder="Parafuso 10mm" value={form.name} onChange={alterarCampo("name")} autoFocus={!editando} required />
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
              <Form.Text className="d-flex gap-2 mt-2 mb-4">
                <i className="bi bi-info-circle" />
                <span>
                  Tem que ser exatamente igual ao nome que a IA usa pra essa peça, letra por letra.
                  Se for diferente, a IA não consegue contar esse item.
                </span>
              </Form.Text>

              <h6 className="secao-titulo">Estoque</h6>
              <Row>
                <Col sm={6}>
                  <FloatingLabel controlId="item-estoque" label={editando ? "Estoque atual" : "Estoque inicial"}>
                    <Form.Control
                      type="number"
                      min={0}
                      placeholder="0"
                      value={form.stock_quantity}
                      onChange={alterarCampo("stock_quantity")}
                      required
                    />
                  </FloatingLabel>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {editando && (
          <Col lg={4}>
            <Card className="border-0 shadow-sm border-start border-danger border-3">
              <Card.Body className="p-4">
                <h6 className="secao-titulo text-danger">Excluir item</h6>
                <p className="text-secondary small">
                  Tira a peça do catálogo. As verificações já feitas continuam guardadas.
                </p>
                <Button variant="outline-danger" size="sm" onClick={() => setConfirmarExclusao(true)}>
                  <i className="bi bi-trash me-1" /> Excluir item
                </Button>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

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
        <Button as={Link} to="/itens" variant="outline-secondary" disabled={salvando}>
          Cancelar
        </Button>
        <BotaoSalvar salvando={salvando} disabled={salvando || !alterado}>
          {editando ? "Salvar alterações" : "Cadastrar item"}
        </BotaoSalvar>
      </div>

      <ModalConfirmacao
        show={confirmarExclusao}
        titulo="Excluir item"
        textoConfirmar="Excluir"
        variante="danger"
        processando={excluindo}
        onConfirmar={excluir}
        onCancelar={() => setConfirmarExclusao(false)}
      >
        <p className="mb-2">
          Excluir <strong>{original?.name}</strong> do catálogo?
        </p>
        <p className="text-secondary small mb-0">
          A IA continua reconhecendo a peça, mas as próximas contagens não vão mais ficar ligadas a esse item.
        </p>
      </ModalConfirmacao>
    </Form>
  );
}
