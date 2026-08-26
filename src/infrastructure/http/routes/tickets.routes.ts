import { Router } from 'express';
import { TicketFactory } from '@factories/TicketFactory.js';

const router = Router();
const ticketController = TicketFactory.criar();

/**
 * @openapi
 * tags:
 *   name: Tickets
 *   description: Gerenciamento e ciclo de vida de tickets de atendimento (Helpdesk)
 */

/**
 * @openapi
 * /api/v1/tickets:
 *   get:
 *     summary: Lista todos os tickets com filtros opcionais
 *     tags: [Tickets]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ABERTO, EM_ATENDIMENTO, RESOLVIDO]
 *         description: Filtra tickets pelo status
 *       - in: query
 *         name: prioridade
 *         schema:
 *           type: string
 *           enum: [BAIXA, MEDIA, ALTA, CRITICA]
 *         description: Filtra tickets pela prioridade
 *       - in: query
 *         name: clienteId
 *         schema:
 *           type: integer
 *         description: Filtra tickets abertos por um cliente específico
 *       - in: query
 *         name: analistaId
 *         schema:
 *           type: integer
 *         description: Filtra tickets atribuídos a um analista específico
 *     responses:
 *       200:
 *         description: Lista de tickets retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Parâmetro de busca inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroDTO'
 */
router.get('/', ticketController.listar);

/**
 * @openapi
 * /api/v1/tickets/pendentes:
 *   get:
 *     summary: Painel de tickets pendentes (status ABERTO ou EM_ATENDIMENTO)
 *     tags: [Tickets]
 *     parameters:
 *       - in: query
 *         name: prioridade
 *         schema:
 *           type: string
 *           enum: [BAIXA, MEDIA, ALTA, CRITICA]
 *         description: Filtra a fila de pendentes pela prioridade
 *     responses:
 *       200:
 *         description: Lista de tickets pendentes retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Parâmetro inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroDTO'
 */
router.get('/pendentes', ticketController.listarPendentes);

/**
 * @openapi
 * /api/v1/tickets/{id}:
 *   get:
 *     summary: Busca detalhes completos de um ticket por ID
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID numérico do ticket
 *     responses:
 *       200:
 *         description: Ticket encontrado com dados do cliente, analista e histórico de mensagens
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *       404:
 *         description: Ticket não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroDTO'
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroDTO'
 */
router.get('/:id', ticketController.buscarPorId);

/**
 * @openapi
 * /api/v1/tickets:
 *   post:
 *     summary: Abre um novo ticket de suporte (apenas perfil CLIENTE)
 *     tags: [Tickets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CriarTicketDTO'
 *     responses:
 *       201:
 *         description: Ticket criado com sucesso com status inicial ABERTO
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Dados inválidos ou usuário não é CLIENTE
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroDTO'
 */
router.post('/', ticketController.criar);

/**
 * @openapi
 * /api/v1/tickets/{id}/atribuir:
 *   patch:
 *     summary: Atribui um analista ao ticket (transita para EM_ATENDIMENTO)
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do ticket
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtribuirTicketDTO'
 *     responses:
 *       200:
 *         description: Ticket atribuído e atualizado para EM_ATENDIMENTO com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Usuário não é ANALISTA ou ticket já está RESOLVIDO
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroDTO'
 *       404:
 *         description: Ticket ou analista não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroDTO'
 */
router.patch('/:id/atribuir', ticketController.atribuir);

/**
 * @openapi
 * /api/v1/tickets/{id}/status:
 *   patch:
 *     summary: Altera o status do ticket (Apenas perfil ANALISTA)
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do ticket
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AlterarStatusDTO'
 *     responses:
 *       200:
 *         description: Status do ticket alterado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Transição inválida ou usuário não tem perfil ANALISTA
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroDTO'
 *       404:
 *         description: Ticket ou usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroDTO'
 */
router.patch('/:id/status', ticketController.alterarStatus);

/**
 * @openapi
 * /api/v1/tickets/{id}:
 *   delete:
 *     summary: Remove um ticket do sistema
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do ticket a ser excluído
 *     responses:
 *       204:
 *         description: Ticket excluído com sucesso (sem conteúdo)
 *       404:
 *         description: Ticket não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroDTO'
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroDTO'
 */
router.delete('/:id', ticketController.excluir);

export default router;
