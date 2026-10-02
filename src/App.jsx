import { Navigate, Route, BrowserRouter, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { RotaProtegida } from "./components/RotaProtegida";
import { Navbar } from "./components/Navbar";
import { Login } from "./pages/Login";
import { Usuarios } from "./pages/gestor/Usuarios";
import { Itens } from "./pages/gestor/Itens";
import { Verificacoes } from "./pages/gestor/Verificacoes";
import { EnviarFoto } from "./pages/funcionario/EnviarFoto";
import { MinhasVerificacoes } from "./pages/funcionario/MinhasVerificacoes";

// "/" não é uma tela própria: só manda cada papel pra sua tela padrão.
function Inicio() {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;
  return usuario.role === "gestor"
    ? <Navigate to="/gestor/verificacoes" replace />
    : <Navigate to="/funcionario/enviar-foto" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Inicio />} />

          <Route path="/gestor/usuarios" element={<RotaProtegida papel="gestor"><Usuarios /></RotaProtegida>} />
          <Route path="/gestor/itens" element={<RotaProtegida papel="gestor"><Itens /></RotaProtegida>} />
          <Route path="/gestor/verificacoes" element={<RotaProtegida papel="gestor"><Verificacoes /></RotaProtegida>} />

          <Route path="/funcionario/enviar-foto" element={<RotaProtegida papel="funcionario"><EnviarFoto /></RotaProtegida>} />
          <Route path="/funcionario/minhas-verificacoes" element={<RotaProtegida papel="funcionario"><MinhasVerificacoes /></RotaProtegida>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
