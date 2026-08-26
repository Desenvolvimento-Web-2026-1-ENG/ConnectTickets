import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    path.join(__dirname, '../routes/*.ts'),
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, './schemas.yaml'),
    path.join(process.cwd(), 'src/infrastructure/http/routes/*.ts'),
    path.join(process.cwd(), 'src/infrastructure/http/docs/schemas.yaml'),
    path.join(process.cwd(), 'dist/infrastructure/http/routes/*.js'),
    path.join(process.cwd(), 'dist/infrastructure/http/docs/schemas.yaml')
  ]
};

export const swaggerSpec = swaggerJSDoc(options);
