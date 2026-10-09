// Data/hora da verificação em formato legível (dd/mm/aaaa hh:mm).
export function formatarData(dataIso) {
  return new Date(dataIso).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

// Soma das peças contadas pela IA numa verificação.
export function totalDetectado(detections) {
  return (detections ?? []).reduce((soma, d) => soma + d.count, 0);
}

// Inicial do nome pro avatar (ex: "Maria Souza" -> "M").
export function inicial(nome) {
  return (nome ?? "").trim().charAt(0).toUpperCase() || "?";
}

export function nomePapel(role) {
  return role === "gestor" ? "Gestor" : "Funcionário";
}
