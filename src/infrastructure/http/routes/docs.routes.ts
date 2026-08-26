import { Router, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../docs/swagger.js';

const router = Router();

// Rota JSON para exportação do Swagger para Postman / Insomnia
router.get('/json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Interface interativa Swagger UI
router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default router;
