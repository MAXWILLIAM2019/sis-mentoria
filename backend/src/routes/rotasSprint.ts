import * as express from 'express';
import { Router } from 'express';
import * as controladorSprint from '../controllers/controladorSprint';
import authMiddleware from '../middleware/autenticacao';
import { verificarPermissao } from '../middleware/verificarPermissao';

const router: Router = express.Router();

// Schemas estão definidos em: backend/src/docs/schemas/sprintSchemas.js

// Aplica o middleware de autenticação em todas as rotas
router.use(authMiddleware.autenticacao);

/**
 * @swagger
 * /api/sprints/test:
 *   get:
 *     summary: Testar conexão do módulo de sprints
 *     description: Endpoint de teste para verificar se o módulo de sprints está funcionando corretamente
 *     tags: [Sprints]
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
 *                   example: "Rota de sprint funcionando!"
 *             example:
 *               message: "Rota de sprint funcionando!"
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
  res.json({ message: 'Rota de sprint funcionando!' });
});

/**
 * @swagger
 * /api/sprints:
 *   get:
 *     summary: Listar todas as sprints
 *     description: Retorna todas as sprints cadastradas no sistema
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de sprints obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SprintListResponse'
 */
router.get('/', controladorSprint.obterTodasSprints);

/**
 * @swagger
 * /api/sprints:
 *   post:
 *     summary: Criar nova sprint
 *     description: Cria uma nova sprint no sistema
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SprintCreateRequest'
 *     responses:
 *       201:
 *         description: Sprint criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SprintResponse'
 */
router.post('/', authMiddleware.apenasAdministrador, controladorSprint.criarSprint);

/**
 * @swagger
 * /api/sprints/{id}:
 *   get:
 *     summary: Buscar sprint por ID
 *     description: Retorna uma sprint específica com suas metas
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da sprint
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sprint encontrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SprintResponse'
 */
router.get('/:id', controladorSprint.obterSprintPorId);

/**
 * @swagger
 * /api/sprints/{id}:
 *   put:
 *     summary: Atualizar sprint
 *     description: Atualiza os dados de uma sprint específica
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da sprint
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SprintUpdateRequest'
 *     responses:
 *       200:
 *         description: Sprint atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SprintResponse'
 */
router.put('/:id', authMiddleware.apenasAdministrador, controladorSprint.atualizarSprint);

/**
 * @swagger
 * /api/sprints/{id}:
 *   delete:
 *     summary: Deletar sprint
 *     description: Remove uma sprint do sistema
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da sprint
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sprint deletada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.delete('/:id', authMiddleware.apenasAdministrador, controladorSprint.deletarSprint);

/**
 * @swagger
 * /api/sprints/reordenar:
 *   put:
 *     summary: Reordenar sprints
 *     description: Reordena a sequência das sprints
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReordenarSprintsRequest'
 *     responses:
 *       200:
 *         description: Sprints reordenadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.put('/reordenar', authMiddleware.apenasAdministrador, controladorSprint.reordenarSprints);

/**
 * @swagger
 * /api/sprints/{id}/metas:
 *   post:
 *     summary: Adicionar metas à sprint
 *     description: Adiciona novas metas a uma sprint específica
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da sprint
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdicionarMetasRequest'
 *     responses:
 *       201:
 *         description: Metas adicionadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MetaListResponse'
 */
router.post('/:id/metas', authMiddleware.apenasAdministrador, controladorSprint.adicionarMetas);

/**
 * @swagger
 * /api/sprints/metas/{metaId}:
 *   put:
 *     summary: Atualizar meta mestre
 *     description: Atualiza os dados de uma meta mestre
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: metaId
 *         required: true
 *         description: ID da meta
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MetaUpdateRequest'
 *     responses:
 *       200:
 *         description: Meta atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MetaResponse'
 */
router.put('/metas/:metaId', authMiddleware.apenasAdministrador, controladorSprint.atualizarMetaMestre);

/**
 * @swagger
 * /api/sprints/instancias/{planoId}:
 *   get:
 *     summary: Buscar sprints instanciadas por plano
 *     description: Retorna todas as sprints instanciadas de um plano específico
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planoId
 *         required: true
 *         description: ID do plano
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sprints instanciadas obtidas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SprintInstanciaListResponse'
 */
router.get('/instancias/:planoId', controladorSprint.buscarSprintsInstanciadasPorPlano);

/**
 * @swagger
 * /api/sprints/instancias/metas/{metaId}:
 *   put:
 *     summary: Atualizar meta instância
 *     description: Atualiza os dados de uma meta instanciada
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: metaId
 *         required: true
 *         description: ID da meta instância
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MetaInstanciaUpdateRequest'
 *     responses:
 *       200:
 *         description: Meta instância atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MetaResponse'
 */
router.put('/instancias/metas/:metaId', controladorSprint.atualizarMetaInstancia);

export default router;


