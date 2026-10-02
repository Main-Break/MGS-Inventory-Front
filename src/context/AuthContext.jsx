import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const salvo = localStorage.getItem("usuario");
    return salvo ? JSON.parse(salvo) : null;
  });
  const [carregando, setCarregando] = useState(true);

  // Se já existe token guardado (recarregou a página), confirma com a API
  // que ele ainda é válido e recupera os dados do usuário.
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCarregando(false);
      return;
    }

    api
      .get("/users/me")
      .then((dados) => {
        setUsuario(dados);
        localStorage.setItem("usuario", JSON.stringify(dados));
      })
      .catch(() => setUsuario(null))
      .finally(() => setCarregando(false));
  }, []);

  async function login(email, password) {
    const { access_token } = await api.post("/auth/login", { email, password }, { semToken: true });
    localStorage.setItem("token", access_token);

    const dados = await api.get("/users/me");
    localStorage.setItem("usuario", JSON.stringify(dados));
    setUsuario(dados);
    return dados;
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
