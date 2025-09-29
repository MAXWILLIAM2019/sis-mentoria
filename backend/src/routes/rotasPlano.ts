import * as express from 'express';
import { Router } from 'express';
import * as controladorPlano from '../controllers/controladorPlano';
import * as controladorSprint from '../controllers/controladorSprint';
import authMiddleware from '../middleware/autenticacao';

const router: Router = express.Router();

// Schemas estão definidos em: backend/src/docs/schemas/planoSchemas.js

/**
 * ATENÇÃO: Este arquivo contém rotas específicas para diferentes módulos do sistema.
 * Algumas rotas são exclusivas para a interface do administrador e outras para a interface do aluno.
 * NÃO altere o comportamento das rotas sem consultar o time de desenvolvimento.
 */

// Aplica o middleware de autenticação em todas as rotas
router.use(authMiddleware.autenticacao);

/**
 * @swagger
 * /api/planos/test:
 *   get:
 *     summary: Testar conexão do módulo de planos
 *     description: Endpoint de teste para verificar se o módulo de planos está funcionando corretamente
 *     tags: [Planos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Módulo funcionando corretamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Rota de plano funcionando!"
 *             example:
 *               message: "Rota de plano funcionando!"
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token de acesso requerido"
 */
router.get('/test', (req, res) => {
  res.json({ message: 'Rota de plano funcionando!' });
});

/**
 * @swagger
 * /api/planos:
 *   get:
 *     summary: Listar todos os planos mestre
 *     description: Retorna todos os planos mestre cadastrados no sistema
 *     tags: [Planos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de planos mestre obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlanoMestreListResponse'
 */
router.get('/', controladorPlano.listarPlanos);

/**
 * @swagger
 * /api/planos:
 *   post:
 *     summary: Criar novo plano mestre
 *     description: Cria um novo plano mestre no sistema
 *     tags: [Planos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PlanoMestreCreateRequest'
 *     responses:
 *       201:
 *         description: Plano mestre criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlanoMestreResponse'
 */
router.post('/', authMiddleware.apenasAdministrador, controladorPlano.criarPlano);

/**
 * @swagger
 * /api/planos/{id}:
 *   get:
 *     summary: Buscar plano mestre por ID
 *     description: Retorna um plano mestre específico com suas sprints e metas
 *     tags: [Planos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do plano mestre
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Plano mestre encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlanoMestreResponse'
 */
router.get('/:id', controladorPlano.buscarPlanoPorId);

/**
 * @swagger
 * /api/planos/{id}/sprints:
 *   get:
 *     summary: Listar sprints de um plano mestre
 *     description: Retorna todas as sprints de um plano mestre específico
 *     tags: [Planos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do plano mestre
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de sprints obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SprintMestreListResponse'
 */
router.get('/:id/sprints', controladorPlano.buscarSprintsPorPlano);

/**
 * @swagger
 * /api/planos/{id}/sprints:
 *   post:
 *     summary: Criar nova sprint em um plano mestre
 *     description: Adiciona uma nova sprint a um plano mestre existente
 *     tags: [Planos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do plano mestre
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SprintMestreCreateRequest'
 *     responses:
 *       201:
 *         description: Sprint criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SprintMestreResponse'
 */
router.post('/:id/sprints', authMiddleware.apenasAdministrador, controladorSprint.criarSprint);

/**
 * @swagger
 * /api/planos/disciplinas:
 *   get:
 *     summary: Listar disciplinas disponíveis
 *     description: Retorna todas as disciplinas cadastradas no sistema
 *     tags: [Planos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de disciplinas obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DisciplinaListResponse'
 */
router.get('/disciplinas', controladorPlano.buscarDisciplinasPorPlano);

// Rota para criar disciplina removida temporariamente - função não existe no controller

export default router;
