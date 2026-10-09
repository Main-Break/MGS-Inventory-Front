import { Container, Nav, Navbar as BsNavbar } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo-mgs.png";

export function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  if (!usuario) return null;

  function sair() {
    logout();
    navigate("/login");
  }

  return (
    <BsNavbar bg="light" variant="light" expand="md" className="mb-4 border-bottom shadow-sm">
      <Container>
        <BsNavbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
          <img src={logo} alt="MGS Plásticos" height="32" />
          <span className="text-muted">Inventário por Foto</span>
        </BsNavbar.Brand>
        <BsNavbar.Toggle aria-controls="navbar-principal" />
        <BsNavbar.Collapse id="navbar-principal">
          <Nav className="me-auto">
            {usuario.role === "gestor" ? (
              <>
                <Nav.Link as={Link} to="/gestor/usuarios">Usuários</Nav.Link>
                <Nav.Link as={Link} to="/gestor/itens">Itens</Nav.Link>
                <Nav.Link as={Link} to="/gestor/verificacoes">Verificações</Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/funcionario/enviar-foto">Enviar foto</Nav.Link>
                <Nav.Link as={Link} to="/funcionario/minhas-verificacoes">Minhas verificações</Nav.Link>
              </>
            )}
          </Nav>
          <Nav>
            <Nav.Link as={Link} to="/perfil">{usuario.name}</Nav.Link>
            <Nav.Link onClick={sair}>Sair</Nav.Link>
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
}
