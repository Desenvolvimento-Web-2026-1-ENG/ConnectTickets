# 🎨 Catálogo de Wireframes e Mapeamento de Integração da API ConnectTickets

Este documento apresenta a especificação técnica e visual das telas do sistema de Helpdesk **ConnectTickets**, acompanhado da matriz de mapeamento de cada componente de interface com as rotas RESTful da API.

---

## 📱 1. Telas Projetadas e Arquivos SVG

Os protótipos em vetor SVG de alta resolução encontram-se na pasta [`../wireframes/`](../wireframes/):

1. **[`01-painel-tickets.svg`](../wireframes/01-painel-tickets.svg)** — *Painel Geral de Chamados e Fila Operacional de Atendimento*
2. **[`02-abertura-ticket.svg`](../wireframes/02-abertura-ticket.svg)** — *Formulário de Abertura de Novo Chamado (Perfil Cliente)*
3. **[`03-atendimento-chat.svg`](../wireframes/03-atendimento-chat.svg)** — *Tela de Detalhes, Timeline de Interações/Chat e Ações do Analista*
4. **[`04-gestao-usuarios.svg`](../wireframes/04-gestao-usuarios.svg)** — *Gestão de Usuários e Alternância de Perfis (Cliente / Analista)*

---

## 🗺️ 2. Mapeamento Completo da Interface com a API (Frontend $\leftrightarrow$ Backend)

A tabela abaixo descreve detalhadamente como cada interação do usuário na interface consome os endpoints da API ConnectTickets:

| Tela / Componente | Evento / Ação do Usuário | Método HTTP | Rota (Endpoint) | Payload Enviado (Body / Query / Param) | Resposta Esperada (Status & Dados) |
|---|---|:---:|---|---|---|
| **Painel Geral** - Cards de Métricas | Carregamento da Dashboard | `GET` | `/api/v1/tickets` | Nenhum (carrega todos) | `200 OK` — Array com todos os tickets para cálculo de contadores |
| **Painel Geral** - Botão *Apenas Pendentes* | Clique no atalho de fila rápida | `GET` | `/api/v1/tickets/pendentes` | Query: `?prioridade=` (opcional) | `200 OK` — Array com tickets em status `ABERTO` e `EM_ATENDIMENTO` |
| **Painel Geral** - Filtro de Status / Prioridade | Mudança nos seletores da tabela | `GET` | `/api/v1/tickets` | Query: `?status=ABERTO&prioridade=ALTA` | `200 OK` — Array filtrado de tickets |
| **Painel Geral** - Botão *Atender* na linha do ticket | Analista clica para assumir ticket | `PATCH` | `/api/v1/tickets/:id/atribuir` | Param: `id` do ticket<br>Body: `{ "analistaId": 3 }` | `200 OK` — Ticket atualizado para status `EM_ATENDIMENTO` |
| **Painel Geral** - Botão *Excluir* | Excluir chamado | `DELETE` | `/api/v1/tickets/:id` | Param: `id` do ticket | `204 No Content` |
| **Abertura de Chamado** - Select de Cliente | Carregar lista de clientes no select | `GET` | `/api/v1/usuarios` | Query: `?perfil=CLIENTE` | `200 OK` — Array de usuários clientes |
| **Abertura de Chamado** - Botão *Criar Chamado* | Envio do formulário de abertura | `POST` | `/api/v1/tickets` | Body: `{ "titulo": "...", "descricao": "...", "categoria": "...", "prioridade": "ALTA", "clienteId": 1 }` | `201 Created` — Objeto do novo ticket com status `ABERTO` |
| **Detalhes / Chat** - Carregamento Inicial | Acesso à tela de detalhes | `GET` | `/api/v1/tickets/:id` | Param: `id` do ticket | `200 OK` — Objeto completo com dados do ticket, cliente e analista |
| **Detalhes / Chat** - Timeline de Mensagens | Carregamento do histórico de conversas | `GET` | `/api/v1/tickets/:id/mensagens` | Param: `id` do ticket | `200 OK` — Array cronológico de mensagens |
| **Detalhes / Chat** - Botão *Enviar* Mensagem | Envio de mensagem pelo cliente ou analista | `POST` | `/api/v1/tickets/:id/mensagens` | Param: `id` do ticket<br>Body: `{ "autorId": 3, "conteudo": "..." }` | `201 Created` — Objeto da mensagem criada |
| **Detalhes / Chat** - Botão *Marcar como RESOLVIDO* | Analista conclui o atendimento | `PATCH` | `/api/v1/tickets/:id/status` | Param: `id` do ticket<br>Body: `{ "novoStatus": "RESOLVIDO", "usuarioId": 3 }` | `200 OK` — Ticket finalizado (bloqueado para novas mensagens) |
| **Gestão de Usuários** - Tabela de Usuários | Carregamento da lista | `GET` | `/api/v1/usuarios` | Query: `?perfil=` (opcional) | `200 OK` — Array de usuários |
| **Gestão de Usuários** - Formulário *Salvar Usuário* | Cadastro de novo usuário | `POST` | `/api/v1/usuarios` | Body: `{ "nome": "...", "email": "...", "perfil": "CLIENTE" }` | `201 Created` — Objeto do usuário cadastrado |

---

## 🔒 3. Tratamento de Erros e Feedback Visual

A interface prevê toasts e caixas de alerta correspondentes aos códigos de status HTTP da API:

- **`400 Bad Request`**: Exibição de mensagem amigável no topo do formulário (ex: *"Apenas usuários com perfil CLIENTE têm permissão para abrir novos chamados"* ou *"Não é permitido adicionar mensagens a tickets com status RESOLVIDO"*).
- **`404 Not Found`**: Redirecionamento amigável com tela de *Ticket não localizado*.
- **`201 Created` / `200 OK`**: Notificação toast verde de confirmação da ação realizada com sucesso.
- **`204 No Content`**: Remoção instantânea da linha na tabela de tickets com animação de fade-out.
