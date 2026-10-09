import { Button } from "react-bootstrap";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { EstadoVazio } from "./ui";

// Bloqueia a rota se não tiver usuário logado, ou se ele não tiver a
// permissão exigida pela tela (ver utils/permissoes.js).
export function RotaProtegida({ permissao, children }) {
  const { usuario, carregando, pode } = useAuth();

  if (carregando) return null;
  if (!usuario) return <Navigate to="/login" replace />;
  if (permissao && !pode(permissao)) return <SemPermissao />;

  return children;
}

// Tela de acesso negado: explica em vez de só jogar o usuário pra outra tela.
export function SemPermissao() {
  return (
    <EstadoVazio icone="bi-shield-lock" titulo="Você não tem acesso a esta tela">
      <p className="mb-3">Se precisar usar essa função, peça para o gestor liberar a permissão no seu usuário.</p>
      <Button as={Link} to="/" size="sm" variant="outline-primary">
        Voltar para o início
      </Button>
    </EstadoVazio>
  );
}
