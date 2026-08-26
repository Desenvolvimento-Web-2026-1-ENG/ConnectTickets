import { Router } from 'express';
import { UsuarioFactory } from '@factories/UsuarioFactory.js';

const router = Router();
const usuarioController = UsuarioFactory.criar();

/**
 * @openapi
 * tags:
 *   name: Usuários
 *   description: Gerenciamento de usuários do sistema (Clientes e Analistas)
 */

/**
 * @openapi
 * /api/v1/usuarios:
 *   get:
 *     summary: Lista todos os usuários
 *     tags: [Usuários]
 *     parameters:
 *       - in: query
 *         name: perfil
 *         schema:
 *           type: string
 *           enum: [CLIENTE, ANALISTA]
 *         description: Filtra usuários pelo perfil de acesso
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Requisição inválida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroDTO'
 */
router.get('/', usuarioController.listar);

/**
 * @openapi
 * /api/v1/usuarios/{id}:
 *   get:
 *     summary: Busca um usuário por ID
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID numérico do usuário
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       404:
 *         description: Usuário não encontrado
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
router.get('/:id', usuarioController.buscarPorId);

/**
 * @openapi
 * /api/v1/usuarios:
 *   post:
 *     summary: Cadastra um novo usuário
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *               $ref: '#/components/schemas/CriarUsuarioDTO'
 *     responses:
 *       201:
 *         description: Usuário cadastrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Dados inválidos ou e-mail já cadastrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroDTO'
 */
router.post('/', usuarioController.criar);

export default router;
