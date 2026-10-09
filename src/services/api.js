const BASE_URL = import.meta.env.VITE_API_URL;

// Erro customizado pra quem chama poder checar o status sem parsear mensagem.
export class ApiError extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

function pegarToken() {
  return localStorage.getItem("token");
}

// Monta a requisição, injeta o token e já devolve o JSON (ou lança ApiError).
// `body` pode ser um objeto comum (vira JSON) ou um FormData (ex: upload de foto).
async function requisitar(caminho, { method = "GET", body, semToken = false } = {}) {
  const headers = {};
  const options = { method, headers };

  if (body instanceof FormData) {
    options.body = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  if (!semToken) {
    const token = pegarToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let resposta;
  try {
    resposta = await fetch(`${BASE_URL}${caminho}`, options);
  } catch {
    // fetch só lança em falha de rede ("Failed to fetch"): troca por algo
    // que o usuário entenda.
    throw new ApiError(0, "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.");
  }

  // Sem token (ex: login), 401 é só e-mail/senha errados: não é sessão expirada.
  if (resposta.status === 401 && !semToken) {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "/login";
    throw new ApiError(401, "Sessão expirada");
  }

  const dados = await resposta.json().catch(() => null);

  // Rota que o front já usa mas a API ainda não implementou: o FastAPI
  // responde 405 (caminho existe com outro método) ou 404 "Not Found" puro.
  if (resposta.status === 405 || (resposta.status === 404 && dados?.detail === "Not Found")) {
    throw new ApiError(resposta.status, `Essa função ainda não está disponível na API (${method} ${caminho}).`);
  }

  if (!resposta.ok) {
    // Erro de validação (422) vem como lista de campos, não como texto.
    const detalhe = Array.isArray(dados?.detail)
      ? dados.detail.map((d) => d.msg).join(" ")
      : dados?.detail;
    throw new ApiError(resposta.status, detalhe ?? "Erro na requisição");
  }

  return dados;
}

export const api = {
  get: (caminho) => requisitar(caminho),
  post: (caminho, body, opcoes) => requisitar(caminho, { method: "POST", body, ...opcoes }),
  put: (caminho, body) => requisitar(caminho, { method: "PUT", body }),
  patch: (caminho, body) => requisitar(caminho, { method: "PATCH", body }),
  delete: (caminho) => requisitar(caminho, { method: "DELETE" }),
};
