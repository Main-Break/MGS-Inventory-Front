import { useState } from "react";
import { Badge, Button, Offcanvas } from "react-bootstrap";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { aplicarTema, lerTema } from "../utils/tema";
import { inicial, nomePapel } from "../utils/formatacao";
import logo from "../assets/logo-mgs.png";

// Cada item só aparece pra quem tem a permissão dele; seção que fica vazia
// some junto. Rótulo por seção, como no menu do Simple ERP.
const MENU = [
  {
    secao: "Operação",
    itens: [
      { para: "/enviar-foto", rotulo: "Enviar foto", icone: "bi-camera", cor: "primary", permissao: "enviar_foto" },
      { para: "/minhas-verificacoes", rotulo: "Minhas verificações", icone: "bi-clock-history", cor: "success", permissao: "enviar_foto" },
      { para: "/verificacoes", rotulo: "Verificações", icone: "bi-clipboard-check", cor: "primary", permissao: "aprovar_verificacoes" },
      { para: "/itens", rotulo: "Itens do catálogo", icone: "bi-box-seam", cor: "warning", permissao: "itens" },
    ],
  },
  {
    secao: "Administração",
    itens: [{ para: "/usuarios", rotulo: "Usuários", icone: "bi-people", cor: "info", permissao: "usuarios" }],
  },
];

function BotaoTema() {
  const [tema, setTema] = useState(lerTema);

  function alternar() {
    const novo = tema === "dark" ? "light" : "dark";
    aplicarTema(novo);
    setTema(novo);
  }

  return (
    <Button
      variant="link"
      className="text-body p-2"
      onClick={alternar}
      title={tema === "dark" ? "Usar tema claro" : "Usar tema escuro"}
      aria-label="Alternar tema"
    >
      <i className={`bi ${tema === "dark" ? "bi-sun" : "bi-moon-stars"} fs-5`} />
    </Button>
  );
}

export function Layout() {
  const { usuario, logout, pode } = useAuth();
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);
  const fecharMenu = () => setMenuAberto(false);

  const menuPermitido = MENU.map((grupo) => ({
    ...grupo,
    itens: grupo.itens.filter((item) => pode(item.permissao)),
  })).filter((grupo) => grupo.itens.length > 0);

  function sair() {
    logout();
    navigate("/login");
  }

  return (
    <>
      <header className="topbar sticky-top d-flex align-items-center px-2 px-md-3 gap-2" style={{ zIndex: 1030 }}>
        <Button
          variant="link"
          className="text-body d-lg-none p-2"
          onClick={() => setMenuAberto(true)}
          aria-label="Abrir menu"
        >
          <i className="bi bi-list fs-4" />
        </Button>

        <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none">
          <span className="logo-marca"><img src={logo} alt="MGS Plásticos" height="30" /></span>
          <span className="vr d-none d-sm-block mx-1" />
          <span className="text-secondary fw-medium d-none d-sm-inline">Inventário por Foto</span>
        </Link>

        <div className="ms-auto d-flex align-items-center gap-1">
          <BotaoTema />
          <Link
            to="/perfil"
            className="d-flex align-items-center gap-2 text-decoration-none text-body ps-2"
            title="Meu perfil"
          >
            <span className="avatar avatar-sm bg-primary-subtle text-primary-emphasis">{inicial(usuario.name)}</span>
            <span className="d-none d-md-inline fw-medium">{usuario.name}</span>
          </Link>
        </div>
      </header>

      <div className="d-flex">
        <Offcanvas show={menuAberto} onHide={fecharMenu} responsive="lg" className="sidebar">
          <Offcanvas.Header closeButton>
            <Offcanvas.Title as="div" className="logo-marca">
              <img src={logo} alt="MGS Plásticos" height="30" />
            </Offcanvas.Title>
          </Offcanvas.Header>

          <Offcanvas.Body className="d-flex flex-column p-3 w-100 overflow-y-auto">
            <Link
              to="/perfil"
              onClick={fecharMenu}
              className="nav-user-card d-flex align-items-center gap-2 p-2 mb-2 text-decoration-none text-body"
            >
              <span className="avatar bg-primary-subtle text-primary-emphasis">{inicial(usuario.name)}</span>
              <span className="flex-grow-1 overflow-hidden">
                <span className="d-block fw-semibold text-truncate">{usuario.name}</span>
                <Badge pill bg="secondary-subtle" text="secondary-emphasis" className="fw-medium">
                  {nomePapel(usuario.role)}
                </Badge>
              </span>
              <i className="bi bi-chevron-right text-secondary small" />
            </Link>

            <nav className="flex-grow-1">
              {menuPermitido.map((grupo) => (
                <div key={grupo.secao}>
                  <div className="nav-section-label">{grupo.secao}</div>
                  {grupo.itens.map((item) => (
                    <NavLink key={item.para} to={item.para} onClick={fecharMenu} className="nav-item-link">
                      <span className={`nav-icon bg-${item.cor}-subtle text-${item.cor}-emphasis`}>
                        <i className={`bi ${item.icone}`} />
                      </span>
                      {item.rotulo}
                    </NavLink>
                  ))}
                </div>
              ))}

              <div className="nav-section-label">Conta</div>
              <NavLink to="/perfil" onClick={fecharMenu} className="nav-item-link">
                <span className="nav-icon bg-secondary-subtle text-secondary-emphasis">
                  <i className="bi bi-person-gear" />
                </span>
                Meu perfil
              </NavLink>
            </nav>

            <hr className="my-2" />
            <button type="button" className="nav-item-link text-danger" onClick={sair}>
              <span className="nav-icon bg-danger-subtle text-danger-emphasis">
                <i className="bi bi-box-arrow-left" />
              </span>
              Sair do sistema
            </button>
          </Offcanvas.Body>
        </Offcanvas>

        <main className="conteudo">
          <div className="mx-auto" style={{ maxWidth: "1200px" }}>
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
}
