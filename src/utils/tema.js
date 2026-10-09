// Tema claro/escuro via data-bs-theme do Bootstrap 5.3: todas as classes
// nativas (bg-body, text-body, *-subtle...) trocam sozinhas.
const CHAVE = "tema";

export function lerTema() {
  try {
    const salvo = localStorage.getItem(CHAVE);
    if (salvo === "light" || salvo === "dark") return salvo;
  } catch {
    // localStorage bloqueado (aba anônima etc.): segue o sistema.
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function aplicarTema(tema) {
  document.documentElement.setAttribute("data-bs-theme", tema);
  try {
    localStorage.setItem(CHAVE, tema);
  } catch {
    // Sem persistência, só vale até recarregar.
  }
}
