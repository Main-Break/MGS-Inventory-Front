import { useState } from "react";
import { Badge, Button, Collapse, Form } from "react-bootstrap";
import { GRUPOS_PERMISSOES, PERMISSOES_DO_PAPEL } from "../utils/permissoes";
import { EstadoVazio } from "./ui";

// Lista de permissões pensada pra crescer (dezenas/centenas de chaves):
// agrupada por módulo, com busca, contador, grupos recolhíveis e
// "liberar todas" por grupo.
//
// `extras` são só as liberadas além do papel; as do papel aparecem marcadas
// e travadas, porque não dá pra tirar uma permissão que o papel garante.
export function EditorPermissoes({ papel, extras, onChange, bloqueado = false }) {
  const [busca, setBusca] = useState("");
  const [soLiberadas, setSoLiberadas] = useState(false);
  const [recolhidos, setRecolhidos] = useState([]);

  const doPapel = PERMISSOES_DO_PAPEL[papel] ?? [];
  const liberada = (chave) => doPapel.includes(chave) || extras.includes(chave);

  const total = GRUPOS_PERMISSOES.reduce((soma, g) => soma + g.permissoes.length, 0);
  const totalLiberadas = GRUPOS_PERMISSOES.reduce(
    (soma, g) => soma + g.permissoes.filter((p) => liberada(p.chave)).length,
    0,
  );

  const termo = busca.trim().toLowerCase();
  const grupos = GRUPOS_PERMISSOES.map((g) => ({
    ...g,
    visiveis: g.permissoes.filter(
      (p) =>
        (!soLiberadas || liberada(p.chave)) &&
        (!termo || `${p.rotulo} ${p.descricao} ${p.chave} ${g.rotulo}`.toLowerCase().includes(termo)),
    ),
  })).filter((g) => g.visiveis.length > 0);

  function alternar(chave) {
    onChange(extras.includes(chave) ? extras.filter((c) => c !== chave) : [...extras, chave]);
  }

  // Libera (ou tira) de uma vez todas as do grupo que não vêm do papel.
  function alternarGrupo(grupo, liberar) {
    const chaves = grupo.permissoes.map((p) => p.chave).filter((c) => !doPapel.includes(c));
    onChange(liberar ? [...new Set([...extras, ...chaves])] : extras.filter((c) => !chaves.includes(c)));
  }

  function alternarRecolhido(id) {
    setRecolhidos((atual) => (atual.includes(id) ? atual.filter((g) => g !== id) : [...atual, id]));
  }

  return (
    <>
      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        <div className="campo-busca flex-grow-1" style={{ minWidth: "220px" }}>
          <i className="bi bi-search" />
          <Form.Control
            size="sm"
            placeholder="Buscar permissão..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            aria-label="Buscar permissão"
          />
        </div>
        <Form.Check
          type="switch"
          id="so-liberadas"
          label="Só as liberadas"
          className="small mb-0"
          checked={soLiberadas}
          onChange={(e) => setSoLiberadas(e.target.checked)}
        />
        <Badge pill bg="primary-subtle" text="primary-emphasis" className="fw-medium px-3 py-2 ms-auto">
          {totalLiberadas} de {total} liberadas
        </Badge>
      </div>

      {bloqueado && (
        <div className="alert alert-secondary small d-flex gap-2 py-2">
          <i className="bi bi-lock" />
          Você não pode mudar as próprias permissões.
        </div>
      )}

      {grupos.length === 0 ? (
        <EstadoVazio icone="bi-search" titulo="Nenhuma permissão encontrada">
          Tente outro termo de busca.
        </EstadoVazio>
      ) : (
        <div className="d-flex flex-column gap-3">
          {grupos.map((g) => {
            const liberadasNoGrupo = g.permissoes.filter((p) => liberada(p.chave)).length;
            const todasLiberadas = liberadasNoGrupo === g.permissoes.length;
            // Buscando, abre tudo: senão o resultado fica escondido no grupo fechado.
            const aberto = Boolean(termo) || !recolhidos.includes(g.id);
            return (
              <div key={g.id} className="border rounded-3 overflow-hidden">
                <div className="d-flex align-items-center gap-2 px-3 py-2 bg-body-tertiary">
                  <button
                    type="button"
                    className="btn btn-link text-body text-decoration-none p-0 d-flex align-items-center gap-2 flex-grow-1 text-start"
                    onClick={() => alternarRecolhido(g.id)}
                    aria-expanded={aberto}
                  >
                    <i className={`bi bi-chevron-${aberto ? "down" : "right"} small text-secondary`} />
                    <span className={`nav-icon bg-${g.cor}-subtle text-${g.cor}-emphasis`} style={{ width: 28, height: 28 }}>
                      <i className={`bi ${g.icone}`} />
                    </span>
                    <span className="fw-semibold">{g.rotulo}</span>
                    <span className="text-secondary small">
                      {liberadasNoGrupo}/{g.permissoes.length}
                    </span>
                  </button>
                  {!bloqueado && (
                    <Button
                      size="sm"
                      variant="link"
                      className="text-decoration-none p-0"
                      onClick={() => alternarGrupo(g, !todasLiberadas)}
                    >
                      {todasLiberadas ? "Tirar todas" : "Liberar todas"}
                    </Button>
                  )}
                </div>

                <Collapse in={aberto}>
                  <div>
                    {g.visiveis.map((p) => {
                      const ehDoPapel = doPapel.includes(p.chave);
                      return (
                        <label
                          key={p.chave}
                          htmlFor={`permissao-${p.chave}`}
                          className="d-flex align-items-start gap-3 px-3 py-2 border-top mb-0"
                          style={{ cursor: ehDoPapel || bloqueado ? "default" : "pointer" }}
                        >
                          <Form.Check
                            type="switch"
                            id={`permissao-${p.chave}`}
                            className="mt-1"
                            checked={liberada(p.chave)}
                            disabled={ehDoPapel || bloqueado}
                            onChange={() => alternar(p.chave)}
                          />
                          <span className="flex-grow-1">
                            <span className="fw-medium d-block">
                              {p.rotulo}
                              {ehDoPapel && (
                                <Badge pill bg="secondary-subtle" text="secondary-emphasis" className="fw-medium ms-2">
                                  do papel
                                </Badge>
                              )}
                            </span>
                            <span className="text-secondary small d-block">{p.descricao}</span>
                          </span>
                          <code className="small text-secondary d-none d-md-inline">{p.chave}</code>
                        </label>
                      );
                    })}
                  </div>
                </Collapse>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
