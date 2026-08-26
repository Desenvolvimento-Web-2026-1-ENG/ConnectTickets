import swaggerJSDoc from 'swagger-jsdoc';

const PORT = process.env.PORT || 3000;

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ConnectTickets API - Gestão de Tickets / Helpdesk',
      version: '1.0.0',
      description:
        'API RESTful robusta e documentada para gerenciamento de chamados de suporte técnico (Helpdesk), atribuição de analistas, controle de ciclo de vida de tickets e registro de histórico de mensagens.',
      contact: {
        name: 'Equipe de Desenvolvimento ConnectTickets',
        email: 'suporte@connecttickets.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Servidor de Desenvolvimento Local'
      }
    ]
  },
  apis: [
    './src/infrastructure/http/routes/*.ts',
    './src/infrastructure/http/routes/*.js',
    './src/infrastructure/http/docs/schemas.yaml',
    './dist/infrastructure/http/routes/*.js',
    './dist/infrastructure/http/docs/schemas.yaml'
  ]
};

export const swaggerSpec = swaggerJSDoc(options);
