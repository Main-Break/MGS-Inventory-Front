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

- `/login` - entrada, e-mail + senha
- `/gestor/usuarios` - lista, cadastra e ativa/desativa usuários
- `/gestor/itens` - cadastro e busca do catálogo
- `/gestor/verificacoes` - vê e aprova as contagens enviadas
- `/funcionario/enviar-foto` - tira ou escolhe uma foto, manda pra API contar
- `/funcionario/minhas-verificacoes` - histórico de envios do próprio funcionário

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
  main.jsx              # entrada, importa o CSS do Bootstrap
  App.jsx                # rotas
  context/
    AuthContext.jsx      # login, logout, usuário logado
  components/
    Navbar.jsx
    RotaProtegida.jsx    # bloqueia tela por token/papel
  services/
    api.js                # fetch com token, base URL e tratamento de erro
  pages/
    Login.jsx
    gestor/               # telas exclusivas de gestor
    funcionario/           # telas exclusivas de funcionário
```

## Pendências conhecidas

- As telas de Itens e Usuários já têm editar/excluir, mas a API ainda não
  tem as rotas. Enquanto não existirem, o front avisa "Essa função ainda
  não está disponível na API". Rotas esperadas:
  - `PUT /items/{id}` com `{ name, label, stock_quantity }`, devolve o item
  - `DELETE /items/{id}`
  - `PUT /users/{id}` com `{ name, email, role, password }` (`password`
    `null` = não muda), devolve o usuário
- Telas de `Itens` e `Verificações` do gestor, e `Minhas verificações`
  do funcionário, ainda são só esqueleto, falta ligar com a API de
  verdade (seguir o mesmo padrão de `Usuarios.jsx` ou `EnviarFoto.jsx`).
