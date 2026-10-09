import { Navigate, Route, BrowserRouter, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotificacaoProvider } from "./context/NotificacaoContext";
import { RotaProtegida, SemPermissao } from "./components/RotaProtegida";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Perfil } from "./pages/Perfil";
import { Usuarios } from "./pages/gestor/Usuarios";
import { FormularioUsuario } from "./pages/gestor/FormularioUsuario";
import { Itens } from "./pages/gestor/Itens";
import { Verificacoes } from "./pages/gestor/Verificacoes";
import { EnviarFoto } from "./pages/funcionario/EnviarFoto";
import { MinhasVerificacoes } from "./pages/funcionario/MinhasVerificacoes";

// Tela inicial de quem entra: a primeira que a pessoa tem permissão de usar.
const TELAS_INICIAIS = [
  { permissao: "aprovar_verificacoes", rota: "/verificacoes" },
  { permissao: "enviar_foto", rota: "/enviar-foto" },
  { permissao: "itens", rota: "/itens" },
  { permissao: "usuarios", rota: "/usuarios" },
];

function Inicio() {
  const { usuario, carregando, pode } = useAuth();
  if (carregando) return null;
  if (!usuario) return <Navigate to="/login" replace />;
  const inicial = TELAS_INICIAIS.find((t) => pode(t.permissao));
  return inicial ? <Navigate to={inicial.rota} replace /> : <SemPermissao />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificacaoProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Telas logadas: topo + menu lateral em volta. */}
            <Route element={<RotaProtegida><Layout /></RotaProtegida>}>
              <Route path="/" element={<Inicio />} />
              <Route path="/perfil" element={<Perfil />} />

              <Route path="/verificacoes" element={<RotaProtegida permissao="aprovar_verificacoes"><Verificacoes /></RotaProtegida>} />
              <Route path="/itens" element={<RotaProtegida permissao="itens"><Itens /></RotaProtegida>} />
              <Route path="/usuarios" element={<RotaProtegida permissao="usuarios"><Usuarios /></RotaProtegida>} />
              <Route path="/usuarios/novo" element={<RotaProtegida permissao="usuarios"><FormularioUsuario /></RotaProtegida>} />
              <Route path="/usuarios/:id" element={<RotaProtegida permissao="usuarios"><FormularioUsuario /></RotaProtegida>} />

              <Route path="/enviar-foto" element={<RotaProtegida permissao="enviar_foto"><EnviarFoto /></RotaProtegida>} />
              <Route path="/minhas-verificacoes" element={<RotaProtegida permissao="enviar_foto"><MinhasVerificacoes /></RotaProtegida>} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </NotificacaoProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
