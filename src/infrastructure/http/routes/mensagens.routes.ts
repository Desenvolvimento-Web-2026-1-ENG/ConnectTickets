import { Router } from 'express';
import { MensagemFactory } from '@factories/MensagemFactory.js';

const router = Router({ mergeParams: true });
const mensagemController = MensagemFactory.criar();

/**
 * @openapi
 * tags:
 *   name: Mensagens
 *   description: Histórico de interações e mensagens de atendimento do ticket
 */

/**
 * @openapi
 * /api/v1/tickets/{id}/mensagens:
 *   get:
 *     summary: Lista todas as mensagens de um ticket específico
 *     tags: [Mensagens]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID numérico do ticket
 *     responses:
 *       200:
 *         description: Lista de mensagens retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Mensagem'
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
router.get('/', mensagemController.listarPorTicket);

/**
 * @openapi
 * /api/v1/tickets/{id}/mensagens:
 *   post:
 *     summary: Adiciona uma nova mensagem / interação ao ticket
 *     tags: [Mensagens]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID numérico do ticket
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CriarMensagemDTO'
 *     responses:
 *       201:
 *         description: Mensagem adicionada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Mensagem'
 *       400:
 *         description: Ticket já está RESOLVIDO ou dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroDTO'
 *       404:
 *         description: Ticket ou autor não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroDTO'
 */
router.post('/', mensagemController.criar);

export default router;
