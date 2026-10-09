import { useEffect, useState } from "react";
import { Alert, Button, ButtonGroup, Card, Col, Form, Row, Spinner, Table } from "react-bootstrap";
import { api } from "../../services/api";
import { useNotificacao } from "../../context/NotificacaoContext";
import { formatarData, totalDetectado } from "../../utils/formatacao";
import {
  CabecalhoPagina,
  CartaoIndicador,
  Carregando,
  EstadoVazio,
  ListaDeteccoes,
  StatusVerificacao,
} from "../../components/ui";

const FILTROS = {
  pendentes: { rotulo: "Pendentes", teste: (v) => v.approved === null, icone: "bi-hourglass-split", cor: "warning" },
  aprovadas: { rotulo: "Aprovadas", teste: (v) => v.approved === true, icone: "bi-check-circle", cor: "success" },
  rejeitadas: { rotulo: "Rejeitadas", teste: (v) => v.approved === false, icone: "bi-x-circle", cor: "danger" },
  todas: { rotulo: "Todas", teste: () => true, icone: "bi-collection", cor: "primary" },
};

export function Verificacoes() {
  const notificar = useNotificacao();
  const [verificacoes, setVerificacoes] = useState([]);
  const [usuariosPorId, setUsuariosPorId] = useState({});
  const [itensPorId, setItensPorId] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [filtro, setFiltro] = useState("pendentes");
  const [busca, setBusca] = useState("");
  const [decidindo, setDecidindo] = useState(null); // id da verificação sendo salva

  function carregarTudo() {
    setCarregando(true);
    setErro(null);
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

  async function decidir(verificacao, aprovado) {
    setDecidindo(verificacao.id);
    try {
      const atualizada = await api.patch(`/verifications/${verificacao.id}/approve?aprovado=${aprovado}`);
      // Atualiza só a linha, sem recarregar a lista inteira.
      setVerificacoes((lista) => lista.map((v) => (v.id === atualizada.id ? atualizada : v)));
      notificar(`Verificação #${verificacao.id} ${aprovado ? "aprovada" : "rejeitada"}.`);
    } catch (e) {
      notificar(e.message, "erro");
    } finally {
      setDecidindo(null);
    }
  }

  const nomeFuncionario = (v) => usuariosPorId[v.user_id] ?? `Usuário #${v.user_id}`;
  const nomeItem = (v) => (v.item_id ? (itensPorId[v.item_id] ?? `Item #${v.item_id}`) : null);

  const contagem = Object.fromEntries(
    Object.entries(FILTROS).map(([chave, f]) => [chave, verificacoes.filter(f.teste).length]),
  );

  const termo = busca.trim().toLowerCase();
  const listaFiltrada = verificacoes
    .filter(FILTROS[filtro].teste)
    .filter((v) => !termo || `${nomeFuncionario(v)} ${nomeItem(v) ?? ""}`.toLowerCase().includes(termo));

  return (
    <>
      <CabecalhoPagina
        titulo="Verificações"
        subtitulo="Revise as contagens feitas pela IA e aprove ou rejeite cada uma."
      >
        <Button variant="outline-secondary" onClick={carregarTudo} disabled={carregando}>
          <i className="bi bi-arrow-clockwise me-2" />
          Atualizar
        </Button>
      </CabecalhoPagina>

      <Row className="g-3 mb-4">
        {Object.entries(FILTROS).map(([chave, f]) => (
          <Col xs={6} lg={3} key={chave}>
            <CartaoIndicador
              rotulo={f.rotulo}
              valor={carregando ? "–" : contagem[chave]}
              icone={f.icone}
              cor={f.cor}
              ativo={filtro === chave}
              onClick={() => setFiltro(chave)}
            />
          </Col>
        ))}
      </Row>

      {erro && <Alert variant="danger">{erro}</Alert>}

      <Card className="border-0 shadow-sm overflow-hidden">
        <Card.Header className="bg-body border-bottom d-flex flex-wrap justify-content-between align-items-center gap-2 py-3">
          <ButtonGroup size="sm">
            {Object.entries(FILTROS).map(([chave, f]) => (
              <Button
                key={chave}
                variant={filtro === chave ? "primary" : "outline-secondary"}
                onClick={() => setFiltro(chave)}
              >
                {f.rotulo}
              </Button>
            ))}
          </ButtonGroup>
          <div className="campo-busca" style={{ minWidth: "240px" }}>
            <i className="bi bi-search" />
            <Form.Control
              size="sm"
              placeholder="Buscar funcionário ou item..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </Card.Header>

        {carregando ? (
          <Carregando />
        ) : listaFiltrada.length === 0 ? (
          <EstadoVazio icone="bi-clipboard-check" titulo="Nenhuma verificação por aqui">
            {filtro === "pendentes" && !termo
              ? "Tudo revisado. Novas fotos dos funcionários aparecem aqui."
              : "Tente outro filtro ou outra busca."}
          </EstadoVazio>
        ) : (
          <Table hover responsive className="tabela-lista">
            <thead>
              <tr>
                <th className="ps-3">#</th>
                <th>Data</th>
                <th>Funcionário</th>
                <th>Item</th>
                <th>Detectado pela IA</th>
                <th className="text-end">Total</th>
                <th>Status</th>
                <th className="text-end pe-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {listaFiltrada.map((v) => (
                <tr key={v.id}>
                  <td className="ps-3 text-secondary numero">{v.id}</td>
                  <td className="text-nowrap">{formatarData(v.created_at)}</td>
                  <td className="fw-medium">{nomeFuncionario(v)}</td>
                  <td>{nomeItem(v) ?? <span className="text-secondary">Não informado</span>}</td>
                  <td><ListaDeteccoes detections={v.detections} /></td>
                  <td className="text-end fw-semibold numero">{totalDetectado(v.detections)}</td>
                  <td><StatusVerificacao approved={v.approved} /></td>
                  <td className="text-end pe-3 text-nowrap">
                    {decidindo === v.id ? (
                      <Spinner animation="border" size="sm" className="text-secondary" />
                    ) : (
                      <ButtonGroup size="sm">
                        <Button
                          variant={v.approved === true ? "success" : "outline-success"}
                          onClick={() => decidir(v, true)}
                          disabled={v.approved === true}
                          title="Aprovar"
                        >
                          <i className="bi bi-check-lg" /> <span className="d-none d-xl-inline">Aprovar</span>
                        </Button>
                        <Button
                          variant={v.approved === false ? "danger" : "outline-danger"}
                          onClick={() => decidir(v, false)}
                          disabled={v.approved === false}
                          title="Rejeitar"
                        >
                          <i className="bi bi-x-lg" /> <span className="d-none d-xl-inline">Rejeitar</span>
                        </Button>
                      </ButtonGroup>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </>
  );
}
