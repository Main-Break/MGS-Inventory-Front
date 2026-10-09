# MGS Plásticos - Inventário por Foto (Front)

Funcionário fotografa as peças, o modelo conta, e o gestor acompanha e
aprova. Esse aqui é o front, consome a API que fica na pasta `API/`
(outro repositório).

## Rodar

Precisa da API rodando antes, senão o login não vai ter com quem
conversar. Instruções dela estão no README da própria API.

```bash
npm install
cp .env.example .env   # ajuste VITE_API_URL se a API não estiver em localhost:8000
npm run dev             # http://localhost:5173
```

Se a API estiver rodando em outro endereço, ou se o front abrir numa
porta diferente de 5173 (o Vite troca de porta sozinho se a 5173 estiver
ocupada), precisa ajustar o `FRONTEND_ORIGIN` no `.env` da API também,
senão o navegador bloqueia as requisições por CORS.

Alternativa sem depender do CORS da API: `VITE_API_URL=/api` no `.env`.
O Vite repassa `/api/...` pra `http://localhost:8000/...` (ver
`vite.config.js`), então pro navegador é tudo a mesma origem.

## Build pra produção

```bash
npm run build    # gera a pasta dist/
npm run preview  # serve o build localmente, pra conferir antes de publicar
```

## Login

Primeiro acesso usa o gestor criado pela API (`ADMIN_EMAIL`/`ADMIN_PASSWORD`
do `.env` dela). A partir daí, esse gestor cadastra os outros usuários
pela tela de Usuários.

## Telas

| Rota | Permissão | O que faz |
|---|---|---|
| `/login` | - | entrada, e-mail + senha |
| `/perfil` | (logado) | edita os próprios dados e senha |
| `/verificacoes` | `aprovar_verificacoes` | vê e aprova/rejeita as contagens de todos |
| `/itens` | `itens` | cadastra, edita, exclui e busca itens do catálogo |
| `/usuarios` | `usuarios` | cadastra, edita, ativa/desativa e libera permissões |
| `/enviar-foto` | `enviar_foto` | tira ou escolhe uma foto, manda pra API contar |
| `/minhas-verificacoes` | `enviar_foto` | histórico de envios do próprio usuário |

`/` manda cada um pra primeira tela que ele tem permissão de usar.

## Permissões

Mesmo modelo do OS-Mechanical: o papel traz um conjunto fixo de
permissões, e o gestor pode liberar permissões extras pra um usuário
específico (tela de Usuários > Editar > Permissões). Catálogo e padrão
de cada papel ficam em `src/utils/permissoes.js`:

| Permissão | Gestor | Funcionário |
|---|---|---|
| `enviar_foto` | | ✓ |
| `aprovar_verificacoes` | ✓ | |
| `itens` | ✓ | |
| `usuarios` | ✓ | |

O front só esconde menu/tela de quem não tem a permissão: **quem
garante de verdade é a API**, conferindo a permissão em cada rota e
devolvendo `403`. Contrato esperado da API:

- `GET /users/me` e `GET /users` devolvem, em cada usuário,
  `extra_permissions: string[]` (o que foi liberado além do papel). Se
  também devolverem `permissions: string[]` (efetivas = papel + extras),
  o front usa essa lista direto em vez de calcular.
- `POST /users` e `PUT /users/{id}` aceitam `extra_permissions` no corpo.
- Mapeamento rota da API -> permissão:
  - `POST /verifications`, e `GET /verifications` das próprias: `enviar_foto`
  - `GET /verifications` de todos, `PATCH /verifications/{id}/approve`: `aprovar_verificacoes`
  - `POST/PUT/DELETE /items`: `itens` (`GET /items` só exige login, a tela de enviar foto usa)
  - `GET/POST /users`, `PUT /users/{id}`, `PATCH /users/{id}/active`: `usuarios`

Enquanto a API não devolver nada disso, o front calcula pelo papel e tudo
continua funcionando como antes.

Tirar foto pelo celular funciona abrindo o site no navegador do celular
(mesma rede, usando o IP da máquina em vez de `localhost`): o campo de
foto já abre a câmera direto, não precisa de app.

## Como foi montado

- **React + Vite**, sem TypeScript, sem framework de estado (Context API
  resolve o que precisa, que é só sessão/token).
- **react-router-dom** pras rotas, cada tela é uma página só, nada de
  rota aninhada complexa.
- **react-bootstrap** pros componentes visuais (tabela, formulário,
  navbar). Importante usar a versão React dos componentes do Bootstrap
  e não o Bootstrap puro, porque o JS dele mexe no DOM por fora do React
  e os dois brigam.
- **fetch nativo**, sem axios. Toda chamada pra API passa por
  `src/services/api.js`, que já cuida de mandar o token e de deslogar
  sozinho se a API responder 401.
- Sessão fica no `localStorage` (token + dados do usuário). Ao recarregar
  a página, o `AuthContext` confirma com a API se o token ainda é válido
  antes de liberar a tela.

## Estrutura

```
src/
  main.jsx                  # entrada, CSS do Bootstrap/ícones, aplica o tema
  App.jsx                   # rotas, cada uma com a permissão exigida
  index.css                 # estilos (só variáveis do Bootstrap, funciona nos 2 temas)
  context/
    AuthContext.jsx         # login, logout, usuário logado, pode(permissão)
    NotificacaoContext.jsx  # toasts de sucesso/erro
  components/
    Layout.jsx              # topo + menu lateral, filtrado por permissão
    RotaProtegida.jsx       # bloqueia tela por login/permissão
    ui.jsx                  # cabeçalho, cards, modal de confirmação etc.
  services/
    api.js                  # fetch com token, base URL e tratamento de erro
  utils/
    permissoes.js           # catálogo de permissões e padrão de cada papel
    tema.js                 # tema claro/escuro
    formatacao.js
  pages/
    Login.jsx, Perfil.jsx
    gestor/                 # telas que por padrão são do gestor
    funcionario/            # telas que por padrão são do funcionário
```

## Pendências conhecidas

- As telas de Itens e Usuários já têm editar/excluir, mas a API ainda não
  tem as rotas. Enquanto não existirem, o front avisa "Essa função ainda
  não está disponível na API". Rotas esperadas:
  - `PUT /items/{id}` com `{ name, label, stock_quantity }`, devolve o item
  - `DELETE /items/{id}`
  - `PUT /users/{id}` com `{ name, email, role, password, extra_permissions }`
    (`password` `null` = não muda), devolve o usuário
- Permissões: ver o contrato na seção [Permissões](#permissões).
