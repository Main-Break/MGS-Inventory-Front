import { createContext, useCallback, useContext, useState } from "react";
import { Toast, ToastContainer } from "react-bootstrap";

const NotificacaoContext = createContext(null);

const ESTILOS = {
  sucesso: { bg: "success", icone: "bi-check-circle-fill", titulo: "Sucesso" },
  erro: { bg: "danger", icone: "bi-exclamation-triangle-fill", titulo: "Erro" },
  info: { bg: "primary", icone: "bi-info-circle-fill", titulo: "Aviso" },
};

// Toasts no canto inferior direito, mesmo padrão do Simple ERP: feedback de
// ação sem tirar o usuário da tela.
export function NotificacaoProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const notificar = useCallback((mensagem, tipo = "sucesso") => {
    // Sem crypto.randomUUID: ele não existe fora de HTTPS (ex: celular
    // acessando pelo IP da rede).
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((atuais) => [...atuais, { id, mensagem, tipo }]);
  }, []);

  function fechar(id) {
    setToasts((atuais) => atuais.filter((t) => t.id !== id));
  }

  return (
    <NotificacaoContext.Provider value={notificar}>
      {children}
      <ToastContainer position="bottom-end" className="p-3 position-fixed" style={{ zIndex: 1080 }}>
        {toasts.map((t) => {
          const estilo = ESTILOS[t.tipo] ?? ESTILOS.info;
          return (
            <Toast key={t.id} onClose={() => fechar(t.id)} delay={5000} autohide>
              <Toast.Header className={`bg-${estilo.bg} text-white`} closeVariant="white">
                <i className={`bi ${estilo.icone} me-2`} />
                <strong className="me-auto">{estilo.titulo}</strong>
              </Toast.Header>
              <Toast.Body>{t.mensagem}</Toast.Body>
            </Toast>
          );
        })}
      </ToastContainer>
    </NotificacaoContext.Provider>
  );
}

export function useNotificacao() {
  return useContext(NotificacaoContext);
}
