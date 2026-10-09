import { useEffect, useState } from "react";
import { Alert, Button, ButtonGroup, Card, ListGroup } from "react-bootstrap";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import { formatarData, totalDetectado } from "../../utils/formatacao";
import { CabecalhoPagina, Carregando, EstadoVazio, ListaDeteccoes, StatusVerificacao } from "../../components/ui";

const FILTROS = {
  todas: { rotulo: "Todas", teste: () => true },
  pendentes: { rotulo: "Pendentes", teste: (v) => v.approved === null },
  aprovadas: { rotulo: "Aprovadas", teste: (v) => v.approved === true },
  rejeitadas: { rotulo: "Rejeitadas", teste: (v) => v.approved === false },
};

export function MinhasVerificacoes() {
  const [verificacoes, setVerificacoes] = useState([]);
  const [itensPorId, setItensPorId] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [filtro, setFiltro] = useState("todas");

  useEffect(() => {
    Promise.all([api.get("/verifications"), api.get("/items")])
      .then(([verificationsData, itemsData]) => {
        setVerificacoes(verificationsData);
        setItensPorId(Object.fromEntries(itemsData.map((i) => [i.id, i.name])));
      })
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  const listaFiltrada = verificacoes.filter(FILTROS[filtro].teste);

  return (
    <div className="mx-auto" style={{ maxWidth: "860px" }}>
      <CabecalhoPagina titulo="Minhas verificações" subtitulo="As fotos que você enviou e o que o gestor decidiu.">
        <Button as={Link} to="/funcionario/enviar-foto">
          <i className="bi bi-camera me-2" />
          Nova foto
        </Button>
      </CabecalhoPagina>

      {erro && <Alert variant="danger">{erro}</Alert>}

      <Card className="border-0 shadow-sm overflow-hidden">
        <Card.Header className="bg-body border-bottom py-3 overflow-x-auto">
          <ButtonGroup size="sm">
            {Object.entries(FILTROS).map(([chave, f]) => (
              <Button
                key={chave}
                variant={filtro === chave ? "primary" : "outline-secondary"}
                onClick={() => setFiltro(chave)}
              >
                {f.rotulo}
                {!carregando && (
                  <span className="ms-1 opacity-75">({verificacoes.filter(f.teste).length})</span>
                )}
              </Button>
            ))}
          </ButtonGroup>
        </Card.Header>

        {carregando ? (
          <Carregando />
        ) : listaFiltrada.length === 0 ? (
          <EstadoVazio
            icone="bi-camera"
            titulo={verificacoes.length === 0 ? "Você ainda não enviou nenhuma foto" : "Nada com esse filtro"}
          >
            {verificacoes.length === 0 && (
              <Button as={Link} to="/funcionario/enviar-foto" size="sm" variant="outline-primary" className="mt-2">
                Enviar a primeira foto
              </Button>
            )}
          </EstadoVazio>
        ) : (
          // Lista em vez de tabela: quem usa essa tela está no celular.
          <ListGroup variant="flush">
            {listaFiltrada.map((v) => (
              <ListGroup.Item key={v.id} className="py-3 px-3">
                <div className="d-flex justify-content-between align-items-start gap-3">
                  <div className="overflow-hidden">
                    <div className="fw-semibold">
                      {v.item_id ? (itensPorId[v.item_id] ?? `Item #${v.item_id}`) : "Item não informado"}
                    </div>
                    <div className="text-secondary small mb-2">
                      #{v.id} · {formatarData(v.created_at)}
                    </div>
                    <ListaDeteccoes detections={v.detections} />
                  </div>
                  <div className="text-end flex-shrink-0">
                    <StatusVerificacao approved={v.approved} />
                    <div className="fs-4 fw-bold numero mt-1">{totalDetectado(v.detections)}</div>
                    <div className="text-secondary small">peças</div>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card>
    </div>
  );
}
