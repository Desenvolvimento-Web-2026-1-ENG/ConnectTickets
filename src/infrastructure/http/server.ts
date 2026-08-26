import express from 'express';
import usuariosRoutes from './routes/usuarios.routes.js';
import ticketsRoutes from './routes/tickets.routes.js';
import mensagensRoutes from './routes/mensagens.routes.js';
import docsRoutes from './routes/docs.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());

// Rotas da API v1
app.use('/api/v1/usuarios', usuariosRoutes);
app.use('/api/v1/tickets', ticketsRoutes);
app.use('/api/v1/tickets/:id/mensagens', mensagensRoutes);

// Documentação Swagger OpenAPI
app.use('/api-docs', docsRoutes);

// Rota raiz com informações da API
app.get('/', (_req, res) => {
  res.json({
    projeto: 'ConnectTickets API',
    versao: '1.0.0',
    descricao: 'API RESTful de Gestão de Tickets / Helpdesk',
    documentacao: `http://localhost:${PORT}/api-docs`,
    documentacao_json: `http://localhost:${PORT}/api-docs/json`,
    endpoints: {
      usuarios: `/api/v1/usuarios`,
      tickets: `/api/v1/tickets`,
      tickets_pendentes: `/api/v1/tickets/pendentes`,
      mensagens: `/api/v1/tickets/:id/mensagens`
    }
  });
});

// Inicialização do Servidor
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log('====================================================');
    console.log(`🚀 ConnectTickets API rodando em: http://localhost:${PORT}`);
    console.log(`📚 Swagger UI disponível em:      http://localhost:${PORT}/api-docs`);
    console.log(`📄 Especificação OpenAPI JSON em:  http://localhost:${PORT}/api-docs/json`);
    console.log('====================================================');
  });
}

export default app;
