import { Badge, Button, Modal, Spinner } from "react-bootstrap";

// Componentes visuais pequenos, reaproveitados por todas as telas.

// Título + subtítulo + ação principal da tela (padrão das listagens do
// Simple ERP / OS-Mechanical).
export function CabecalhoPagina({ titulo, subtitulo, children }) {
  return (
    <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
      <div>
        <h1 className="h3 fw-bold mb-1">{titulo}</h1>
        {subtitulo && <p className="text-secondary mb-0">{subtitulo}</p>}
      </div>
      {children && <div className="d-flex gap-2">{children}</div>}
    </div>
  );
}

// Card de indicador. Com onClick vira botão (ex: filtrar a lista pelo status).
export function CartaoIndicador({ rotulo, valor, icone, cor = "primary", ativo = false, onClick }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      className={`stat-card ${ativo ? "ativo" : ""}`}
      onClick={onClick}
      aria-pressed={onClick ? ativo : undefined}
    >
      <div className="stat-card__head">
        <span className="stat-card__label">{rotulo}</span>
        <span className={`stat-card__icon bg-${cor}-subtle text-${cor}-emphasis`}>
          <i className={`bi ${icone}`} />
        </span>
      </div>
      <div className="stat-card__value">{valor}</div>
    </Tag>
  );
}

export function EstadoVazio({ icone = "bi-inbox", titulo, children }) {
  return (
    <div className="estado-vazio">
      <i className={`bi ${icone}`} />
      <p className="fw-semibold text-body mb-1">{titulo}</p>
      {children && <div className="small">{children}</div>}
    </div>
  );
}

export function Carregando({ texto = "Carregando..." }) {
  return (
    <div className="d-flex justify-content-center align-items-center gap-2 text-secondary py-5">
      <Spinner animation="border" size="sm" />
      {texto}
    </div>
  );
}

export function StatusVerificacao({ approved }) {
  if (approved === null) return <Badge bg="warning" text="dark">Pendente</Badge>;
  return approved ? <Badge bg="success">Aprovada</Badge> : <Badge bg="danger">Rejeitada</Badge>;
}

// Cada classe detectada pela IA vira uma "pílula" com a contagem.
export function ListaDeteccoes({ detections }) {
  if (!detections || detections.length === 0) {
    return <span className="text-secondary small">Nada detectado</span>;
  }
  return (
    <div className="d-flex flex-wrap gap-1">
      {detections.map((d) => (
        <Badge key={d.label} pill bg="secondary-subtle" text="secondary-emphasis" className="fw-medium">
          {d.label} <span className="fw-bold">×{d.count}</span>
        </Badge>
      ))}
    </div>
  );
}

// Confirmação de ação em modal (nunca window.confirm, ver Rules.md do Simple ERP).
export function ModalConfirmacao({
  show,
  titulo,
  children,
  textoConfirmar = "Confirmar",
  variante = "primary",
  processando = false,
  onConfirmar,
  onCancelar,
}) {
  return (
    <Modal show={show} onHide={onCancelar} centered>
      <Modal.Header closeButton>
        <Modal.Title as="h5">{titulo}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onCancelar} disabled={processando}>
          Cancelar
        </Button>
        <Button variant={variante} onClick={onConfirmar} disabled={processando}>
          {processando && <Spinner animation="border" size="sm" className="me-2" />}
          {textoConfirmar}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

// Botão de salvar padrão (verde com disquete, igual ao Simple ERP).
export function BotaoSalvar({ salvando, children = "Salvar", ...props }) {
  return (
    <Button type="submit" variant="success" disabled={salvando} {...props}>
      {salvando ? (
        <Spinner animation="border" size="sm" className="me-2" />
      ) : (
        <i className="bi bi-floppy me-2" />
      )}
      {salvando ? "Salvando..." : children}
    </Button>
  );
}
