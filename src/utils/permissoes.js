// Permissões por tela/ação, no mesmo modelo do OS-Mechanical: o papel
// (gestor/funcionário) traz um conjunto padrão fixo, e o gestor pode liberar
// permissões extras pra um usuário específico.
//
// A API é quem manda de verdade (toda rota confere a permissão e devolve
// 403). O front só esconde o que o usuário não pode usar, pra não mostrar
// botão que vai dar erro.

export const PERMISSOES = {
  enviar_foto: {
    rotulo: "Enviar fotos para contagem",
    descricao: "Tira fotos, envia para a IA contar e acompanha o próprio histórico.",
  },
  aprovar_verificacoes: {
    rotulo: "Revisar verificações",
    descricao: "Vê as contagens de todos os funcionários e aprova ou rejeita.",
  },
  itens: {
    rotulo: "Gerenciar itens do catálogo",
    descricao: "Cadastra, edita e exclui as peças que a IA reconhece.",
  },
  usuarios: {
    rotulo: "Gerenciar usuários",
    descricao: "Cadastra e edita usuários, libera permissões e bloqueia acessos.",
  },
};

export const PERMISSOES_DO_PAPEL = {
  gestor: ["aprovar_verificacoes", "itens", "usuarios"],
  funcionario: ["enviar_foto"],
};

// Permissões efetivas do usuário. Se a API já devolver a lista pronta
// (`permissions`), ela vale; senão, calcula pelo papel + extras liberadas
// (`extra_permissions`). O cálculo local é o que mantém o front funcionando
// com a API de hoje, que ainda não tem permissões.
export function permissoesDoUsuario(usuario) {
  if (!usuario) return [];
  if (Array.isArray(usuario.permissions)) return usuario.permissions;
  const doPapel = PERMISSOES_DO_PAPEL[usuario.role] ?? [];
  return [...new Set([...doPapel, ...(usuario.extra_permissions ?? [])])];
}

export function temPermissao(usuario, chave) {
  return permissoesDoUsuario(usuario).includes(chave);
}
