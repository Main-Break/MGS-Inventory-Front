// Data/hora da verificação em formato legível (dd/mm/aaaa hh:mm).
export function formatarData(dataIso) {
  return new Date(dataIso).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

// Transforma a lista de detecções da IA num texto curto, ex: "parafuso x12, porca x5".
export function resumoDeteccoes(detections) {
  if (!detections || detections.length === 0) return "Nenhum item detectado";
  return detections.map((d) => `${d.label} x${d.count}`).join(", ");
}
