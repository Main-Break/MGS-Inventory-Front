import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Bloqueia a rota se não tiver usuário logado, ou se o papel não bater
// com o exigido (ex: tela de gestor acessada por funcionário).
export function RotaProtegida({ papel, children }) {
  const { usuario, carregando } = useAuth();

  if (carregando) return null;
  if (!usuario) return <Navigate to="/login" replace />;
  if (papel && usuario.role !== papel) return <Navigate to="/" replace />;

  return children;
}
