/**
 * Rotas para Gerenciamento de Alunos
 * 
 * Este módulo define todas as rotas relacionadas às operações de alunos,
 * seguindo padrões RESTful para as operações CRUD.
 * 
 * Inclui controle de permissões para proteção de recursos.
 * 
 * Schemas estão definidos em: backend/src/docs/schemas/alunoSchemas.js
 */
import * as express from 'express';
import { Router } from 'express';
import * as controladorAluno from '../controllers/controladorAluno';
import authMiddleware from '../middleware/autenticacao';

const router: Router = express.Router();

/**
 * @swagger
 * /api/alunos/test:
 *   get:
 *     summary: Teste do módulo de alunos
 *     description: Verifica se o módulo de alunos está funcionando
 *     tags: [Alunos]
 *     responses:
 *       200:
 *         description: Módulo funcionando
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Rota de alunos funcionando!"
 */
router.get('/test', (req, res) => {
  res.json({ message: 'Rota de alunos funcionando!' });
});

/**
 * @swagger
 * /api/alunos:
 *   get:
 *     summary: Listar todos os alunos
 *     description: Retorna uma lista com todos os alunos cadastrados no sistema
 *     tags: [Alunos]
 *     responses:
 *       200:
 *         description: Lista de alunos obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AlunoListResponse'
 */
router.get('/', authMiddleware.autenticacao, controladorAluno.obterTodosAlunos);

/**
 * @swagger
 * /api/alunos:
 *   post:
 *     summary: Criar novo aluno
 *     description: Cria um novo aluno no sistema com dados de usuário e informações específicas do aluno
 *     tags: [Alunos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AlunoCreateRequest'
 *     responses:
 *       201:
 *         description: Aluno criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AlunoResponse'
 */
router.post('/', authMiddleware.autenticacao, authMiddleware.apenasAdministrador, controladorAluno.criarAluno);

/**
 * @swagger
 * /api/alunos/{id}:
 *   get:
 *     summary: Buscar aluno por ID
 *     description: Retorna os dados de um aluno específico
 *     tags: [Alunos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do aluno
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Aluno encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AlunoResponse'
 */
router.get('/:id', authMiddleware.autenticacao, authMiddleware.perfilProprioOuAdministrador('id'), controladorAluno.obterAlunoPorId);

/**
 * @swagger
 * /api/alunos/{id}:
 *   put:
 *     summary: Atualizar dados do aluno
 *     description: Atualiza as informações de um aluno específico
 *     tags: [Alunos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do aluno
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AlunoUpdateRequest'
 *     responses:
 *       200:
 *         description: Aluno atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AlunoResponse'
 */
router.put('/:id', authMiddleware.autenticacao, authMiddleware.perfilProprioOuAdministrador('id'), controladorAluno.atualizarAluno);

/**
 * @swagger
 * /api/alunos/{id}/senha:
 *   put:
 *     summary: Alterar senha do aluno
 *     description: Permite que o aluno altere sua própria senha ou que um administrador defina uma nova senha
 *     tags: [Alunos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do aluno
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AlterarSenhaRequest'
 *     responses:
 *       200:
 *         description: Senha alterada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.put('/:id/senha', authMiddleware.autenticacao, authMiddleware.perfilProprioOuAdministrador('id'), controladorAluno.definirSenha);

/**
 * @swagger
 * /api/alunos/{id}/sprints:
 *   get:
 *     summary: Buscar sprints do aluno
 *     description: Retorna todas as sprints associadas a um aluno específico
 *     tags: [Alunos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do aluno
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sprints do aluno obtidas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SprintListResponse'
 */
router.get('/:id/sprints', authMiddleware.autenticacao, authMiddleware.perfilProprioOuAdministrador('id'), controladorAluno.obterSprintsAluno);

/**
 * @swagger
 * /api/alunos/{id}/notificacoes:
 *   put:
 *     summary: Atualizar configurações de notificação
 *     description: Permite que o aluno atualize suas preferências de notificação
 *     tags: [Alunos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do aluno
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotificacoesRequest'
 *     responses:
 *       200:
 *         description: Configurações atualizadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificacoesResponse'
 */
router.put('/:id/notificacoes', authMiddleware.autenticacao, authMiddleware.perfilProprioOuAdministrador('id'), controladorAluno.atualizarNotificacoes);

export default router;
