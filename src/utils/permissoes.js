// Permissões por tela/ação, no mesmo modelo do OS-Mechanical: o papel
// (gestor/funcionário) traz um conjunto padrão fixo, e o gestor pode liberar
// permissões extras pra um usuário específico.
//
// A API é quem manda de verdade (toda rota confere a permissão e devolve
// 403). O front só esconde o que o usuário não pode usar, pra não mostrar
// botão que vai dar erro.
//
// Permissão nova: somar no grupo do módulo dela (ou criar um grupo novo).
// A tela de edição de usuário monta tudo a partir daqui.

export const GRUPOS_PERMISSOES = [
  {
    id: "contagem",
    rotulo: "Contagem por foto",
    icone: "bi-camera",
    cor: "primary",
    permissoes: [
      {
        chave: "enviar_foto",
        rotulo: "Enviar fotos para contagem",
        descricao: "Tira fotos, envia para a IA contar e acompanha o próprio histórico.",
      },
      {
        chave: "aprovar_verificacoes",
        rotulo: "Revisar verificações",
        descricao: "Vê as contagens de todos os funcionários e aprova ou rejeita.",
      },
    ],
  },
  {
    id: "catalogo",
    rotulo: "Catálogo",
    icone: "bi-box-seam",
    cor: "warning",
    permissoes: [
      {
        chave: "itens",
        rotulo: "Gerenciar itens do catálogo",
        descricao: "Cadastra, edita e exclui as peças que a IA reconhece.",
      },
    ],
  },
  {
    id: "administracao",
    rotulo: "Administração",
    icone: "bi-shield-lock",
    cor: "info",
    permissoes: [
      {
        chave: "usuarios",
        rotulo: "Gerenciar usuários",
        descricao: "Cadastra e edita usuários, libera permissões e bloqueia acessos.",
      },
    ],
  },
];

// Acesso direto por chave: PERMISSOES.itens.rotulo
export const PERMISSOES = Object.fromEntries(
  GRUPOS_PERMISSOES.flatMap((g) => g.permissoes.map((p) => [p.chave, { ...p, grupo: g.id }])),
);

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
