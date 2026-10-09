import { useEffect, useState } from "react";
import { Alert, Button, Card, Form, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import { useNotificacao } from "../../context/NotificacaoContext";
import { CabecalhoPagina, Carregando, EstadoVazio, ModalConfirmacao } from "../../components/ui";

export function Itens() {
  const notificar = useNotificacao();
  const [itens, setItens] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

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

  return (
    <>
      <CabecalhoPagina
        titulo="Itens do catálogo"
        subtitulo="Peças que a IA sabe reconhecer nas fotos e o estoque atual de cada uma."
      >
        <Button as={Link} to="/itens/novo">
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
              <Button as={Link} to="/itens/novo" size="sm" variant="outline-primary" className="mt-2">
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
                  <td className="ps-3 fw-medium">
                    <Link to={`/itens/${item.id}`} className="text-body text-decoration-none">{item.name}</Link>
                  </td>
                  <td><code className="small">{item.label}</code></td>
                  <td className="text-end fw-semibold numero">{item.stock_quantity.toLocaleString("pt-BR")}</td>
                  <td className="text-end pe-3 text-nowrap">
                    <Button as={Link} to={`/itens/${item.id}`} size="sm" variant="outline-primary" className="me-1" title="Editar item">
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
    </>
  );
}
