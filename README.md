# 🎫 ConnectTickets
API RESTful para gerenciamento de chamados técnicos (Helpdesk), permitindo abertura, acompanhamento e resolução de tickets entre clientes e analistas de suporte.

---

# 📌 Objetivo

O sistema tem como objetivo fornecer uma solução simples e eficiente para suporte técnico, permitindo:

- Abertura de chamados por clientes;
- Acompanhamento do status dos tickets;
- Comunicação entre cliente e analista;
- Gerenciamento de prioridades;
- Controle do fluxo de atendimento.

---

# 👥 Perfis de Usuário

## Cliente
Responsável por:

- Abrir chamados;
- Visualizar seus tickets;
- Enviar mensagens no ticket;
- Acompanhar o status do atendimento.

## Analista de Suporte
Responsável por:

- Visualizar tickets pendentes;
- Assumir chamados;
- Alterar status dos tickets;
- Responder mensagens;
- Resolver tickets.

---

# 🔄 Fluxo do Ticket

O ticket segue o seguinte ciclo de vida:

```text
ABERTO -> EM_ATENDIMENTO -> RESOLVIDO
```

## Regras de Negócio

- Todo ticket inicia com status `ABERTO`;
- Um ticket pode ser atribuído a um analista disponível;
- Somente analistas podem alterar o status do ticket;
- Apenas analistas podem marcar tickets como `RESOLVIDO`;
- Clientes e analistas podem trocar mensagens dentro do ticket;
- Tickets podem possuir prioridade:
  - BAIXA
  - MEDIA
  - ALTA
  - CRITICA

---

# ⚙️ Funcionalidades

## Autenticação
- Cadastro de usuários;
- Login com JWT;
- Controle de permissões por perfil.

## Tickets
- Criar ticket;
- Listar tickets;
- Visualizar detalhes do ticket;
- Alterar status;
- Atribuir analista;
- Filtrar tickets por prioridade e status.

## Mensagens
- Adicionar mensagens ao ticket;
- Histórico completo de interações.

---

# 🛠️ Tecnologias Planejadas

## Backend
- Node.js
- Express.js

## Banco de Dados
- PostgreSQL

## ORM
- Prisma ORM

## Autenticação
- JWT (JSON Web Token)
- Bcrypt

## Documentação
- Swagger / OpenAPI

## Testes
- Jest
- Supertest

---

# 📁 Estrutura Inicial do Projeto

```text
src/
│
├── controllers/
├── services/
├── repositories/
├── middlewares/
├── routes/
├── prisma/
├── utils/
├── validators/
├── config/
└── app.js
```

---

# 🗃️ Entidades Principais

## User

```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "CLIENTE | ANALISTA"
}
```

## Ticket

```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "status": "ABERTO | EM_ATENDIMENTO | RESOLVIDO",
  "priority": "BAIXA | MEDIA | ALTA | CRITICA",
  "category": "string",
  "clientId": "uuid",
  "analystId": "uuid"
}
```

## Message

```json
{
  "id": "uuid",
  "content": "string",
  "ticketId": "uuid",
  "senderId": "uuid",
  "createdAt": "date"
}
```

---

# 📡 Endpoints Planejados

## Auth
| Método | Rota | Descrição |
|---|---|---|
| POST | /auth/register | Cadastro |
| POST | /auth/login | Login |

## Tickets
| Método | Rota | Descrição |
|---|---|---|
| POST | /tickets | Criar ticket |
| GET | /tickets | Listar tickets |
| GET | /tickets/:id | Detalhes do ticket |
| PATCH | /tickets/:id/status | Alterar status |
| PATCH | /tickets/:id/assign | Atribuir analista |

## Messages
| Método | Rota | Descrição |
|---|---|---|
| POST | /tickets/:id/messages | Adicionar mensagem |
| GET | /tickets/:id/messages | Listar mensagens |

---

# 🔐 Controle de Permissões

| Ação | Cliente | Analista |
|---|---|---|
| Criar ticket | ✅ | ❌ |
| Visualizar próprios tickets | ✅ | ✅ |
| Alterar status | ❌ | ✅ |
| Resolver ticket | ❌ | ✅ |
| Enviar mensagens | ✅ | ✅ |

---

# 🚀 Como Executar (Planejado)

```bash
# Instalar dependências
npm install

# Rodar servidor
npm run dev
```

---

# 📌 Melhorias Futuras

- Upload de anexos;
- Notificações em tempo real;
- SLA de atendimento;
- Dashboard administrativo;
- WebSocket para chat em tempo real;
- Logs de auditoria;
- Dockerização;
- Deploy em nuvem.

---

# 📄 Licença

Projeto desenvolvido para fins acadêmicos e aprendizado.