import { useState } from "react";
import { Alert, Button, FloatingLabel, Form, Spinner } from "react-bootstrap";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo-mgs.png";

const ANO_ATUAL = new Date().getFullYear();

const DESTAQUES = [
  { icone: "bi-camera", texto: "Fotografe as peças direto do celular, sem planilha." },
  { icone: "bi-cpu", texto: "A IA identifica e conta cada item da foto." },
  { icone: "bi-clipboard-check", texto: "O gestor revisa e aprova cada contagem." },
];

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const { usuario, login } = useAuth();
  const navigate = useNavigate();

  if (usuario) return <Navigate to="/" replace />;

  async function enviar(evento) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (erroRequisicao) {
      setErro(erroRequisicao.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="login-pagina">
      {/* Painel da marca: só em tela grande, no celular vai direto pro formulário. */}
      <aside className="login-marca d-none d-lg-flex flex-column">
        <div>
          <span className="login-marca__logo">
            <img src={logo} alt="MGS Plásticos de Engenharia" height="40" />
          </span>
        </div>

        <div className="my-auto position-relative" style={{ maxWidth: "440px", zIndex: 1 }}>
          <h2 className="display-6 fw-bold mb-3">
            Inventário por <span className="login-marca__destaque">foto</span>.
          </h2>
          <p className="fs-5 mb-4" style={{ color: "rgba(255,255,255,.75)" }}>
            Contagem de estoque mais rápida e com registro de quem contou o quê.
          </p>
          <ul className="login-marca__lista list-unstyled mb-0">
            {DESTAQUES.map((d) => (
              <li key={d.icone}>
                <i className={`bi ${d.icone}`} />
                <span>{d.texto}</span>
              </li>
            ))}
          </ul>
        </div>

        <small style={{ color: "rgba(255,255,255,.5)" }}>
          © {ANO_ATUAL} MGS Plásticos de Engenharia
        </small>
      </aside>

      <main className="login-form">
        <div className="login-form__caixa">
          <div className="text-center text-lg-start mb-4">
            <span className="logo-marca d-lg-none mb-4">
              <img src={logo} alt="MGS Plásticos de Engenharia" height="48" />
            </span>
            <h1 className="h3 fw-bold mb-1">Entrar</h1>
            <p className="text-secondary mb-0">Use o e-mail e a senha cadastrados pelo seu gestor.</p>
          </div>

          {erro && (
            <Alert variant="danger" className="d-flex align-items-start gap-2">
              <i className="bi bi-exclamation-triangle-fill" />
              <span>{erro}</span>
            </Alert>
          )}

          <Form onSubmit={enviar}>
            <FloatingLabel controlId="login-email" label="E-mail" className="mb-3">
              <Form.Control
                type="email"
                placeholder="nome@empresa.com"
                autoComplete="username"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </FloatingLabel>

            <div className="input-group mb-4">
              <FloatingLabel controlId="login-senha" label="Senha">
                <Form.Control
                  type={mostrarSenha ? "text" : "password"}
                  placeholder="Senha"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </FloatingLabel>
              <Button
                variant="outline-secondary"
                onClick={() => setMostrarSenha((v) => !v)}
                title={mostrarSenha ? "Esconder senha" : "Mostrar senha"}
                aria-label={mostrarSenha ? "Esconder senha" : "Mostrar senha"}
              >
                <i className={`bi ${mostrarSenha ? "bi-eye-slash" : "bi-eye"}`} />
              </Button>
            </div>

            <Button type="submit" size="lg" className="w-100" disabled={enviando}>
              {enviando ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Entrando...
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right me-2" />
                  Entrar
                </>
              )}
            </Button>
          </Form>

          <p className="text-secondary small text-center mt-4 mb-0">
            Esqueceu a senha? Fale com o gestor responsável.
          </p>
        </div>
      </main>
    </div>
  );
}
