import * as express from 'express';
import { Router } from 'express';
import * as controladorSprintAtual from '../controllers/controladorSprintAtual';
import authMiddleware from '../middleware/autenticacao';

const router: Router = express.Router();

// Schemas estão definidos em: backend/src/docs/schemas/sprintAtualSchemas.js

// NOTA: Existe um método adicional 'inicializarSprintAtual' no controller que não está documentado
// pois não possui rota correspondente. Este método é usado internamente pelo sistema.

/**
 * @swagger
 * /api/sprint-atual:
 *   get:
 *     summary: Buscar sprint atual do aluno
 *     description: |
 *       Retorna a sprint atual do aluno autenticado, incluindo todas as metas associadas.
 *       
 *       **Funcionalidades:**
 *       - Se o aluno não possui sprint atual, cria automaticamente com a primeira sprint do seu plano
 *       - Retorna dados completos da sprint com metas instanciadas
 *       - Considera o plano ativo do aluno através da tabela AlunoPlano
 *       
 *       **Fluxo:**
 *       1. Busca o plano ativo do aluno (filtrado por ativo: true)
 *       2. Se não existe sprint atual, cria com a primeira sprint do plano
 *       3. Retorna sprint completa com metas formatadas
 *       
 *       **NOTA:** Este endpoint busca apenas planos ativos do aluno.
 *     tags: [Sprint Atual]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sprint atual obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SprintAtualResponse'
 *             example:
 *               id: 1
 *               nome: "Sprint 1 - HTML/CSS"
 *               posicao: 1
 *               dataInicio: "2024-01-15"
 *               dataFim: "2024-01-29"
 *               PlanoId: 1
 *               metas:
 *                 - id: 1
 *                   disciplina: "HTML"
 *                   tipo: "Teórica"
 *                   titulo: "Introdução ao HTML"
 *                   comandos: "Estudar tags básicas"
 *                   link: "https://example.com/html-basics"
 *                   relevancia: "Alta"
 *                   tempoEstudado: "02:30"
 *                   desempenho: 85
 *                   status: "Concluída"
 *                   totalQuestoes: 10
 *                   questoesCorretas: 8
 *                   SprintId: 1
 *                 - id: 2
 *                   disciplina: "CSS"
 *                   tipo: "Prática"
 *                   titulo: "Estilização com CSS"
 *                   comandos: "Criar folha de estilos"
 *                   link: "https://example.com/css-basics"
 *                   relevancia: "Alta"
 *                   tempoEstudado: "01:45"
 *                   desempenho: 0
 *                   status: "Pendente"
 *                   totalQuestoes: 0
 *                   questoesCorretas: 0
 *                   SprintId: 1
 *       400:
 *         description: ID do usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "ID do usuário não encontrado"
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token de acesso requerido"
 *       404:
 *         description: Usuário não possui plano de estudo com sprints
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Usuário não possui plano de estudo com sprints"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro ao buscar sprint atual"
 */
router.get('/', authMiddleware.autenticacao, controladorSprintAtual.obterSprintAtual as any);

/**
 * @swagger
 * /api/sprint-atual:
 *   put:
 *     summary: Atualizar sprint atual do aluno
 *     description: |
 *       Atualiza a sprint atual do aluno para uma nova sprint do seu plano.
 *       
 *       **Funcionalidades:**
 *       - Valida se a sprint pertence ao plano do aluno
 *       - Marca a sprint anterior como concluída se todas as metas foram finalizadas
 *       - Atualiza ou cria o registro da sprint atual
 *       - Retorna a nova sprint completa com metas
 *       
 *       **Validações de Segurança:**
 *       - Verifica se a sprint pertence ao plano ativo do aluno
 *       - Verifica se o aluno possui plano ativo
 *       - Verifica conclusão das metas antes de avançar
 *       
 *       **Fluxo:**
 *       1. Valida se a sprint existe e pertence ao plano do aluno
 *       2. Marca sprint anterior como concluída se todas metas foram finalizadas
 *       3. Atualiza ou cria registro da sprint atual
 *       4. Retorna nova sprint completa (objeto bruto do Sequelize)
 *       
 *       **NOTA:** O retorno inclui campos adicionais do Sequelize (createdAt, updatedAt, etc.)
 *     tags: [Sprint Atual]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SprintAtualUpdateRequest'
 *           example:
 *             sprintId: 2
 *     responses:
 *       200:
 *         description: Sprint atual atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SprintAtualUpdateResponse'
 *             example:
 *               id: 2
 *               nome: "Sprint 2 - JavaScript"
 *               posicao: 2
 *               dataInicio: "2024-01-30"
 *               dataFim: "2024-02-13"
 *               PlanoId: 1
 *               status: "Ativa"
 *               metas:
 *                 - id: 3
 *                   disciplina: "JavaScript"
 *                   tipo: "Teórica"
 *                   titulo: "Fundamentos do JavaScript"
 *                   comandos: "Estudar variáveis e funções"
 *                   link: "https://example.com/js-basics"
 *                   relevancia: "Alta"
 *                   tempoEstudado: "00:00"
 *                   desempenho: 0
 *                   status: "Pendente"
 *                   totalQuestoes: 0
 *                   questoesCorretas: 0
 *                   SprintId: 2
 *                   createdAt: "2024-01-15T10:30:00.000Z"
 *                   updatedAt: "2024-01-15T10:30:00.000Z"
 *               createdAt: "2024-01-15T10:30:00.000Z"
 *               updatedAt: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: ID da sprint é obrigatório
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "ID da sprint é obrigatório"
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token de acesso requerido"
 *       403:
 *         description: Acesso negado - sprint não pertence ao plano do aluno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               sem_plano:
 *                 summary: Aluno sem plano ativo
 *                 value:
 *                   message: "Aluno não possui plano ativo"
 *               sprint_invalida:
 *                 summary: Sprint não pertence ao plano
 *                 value:
 *                   message: "Sprint não pertence ao plano do usuário"
 *       404:
 *         description: Sprint não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Sprint não encontrada"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro ao atualizar sprint atual"
 */
router.put('/', authMiddleware.autenticacao, controladorSprintAtual.atualizarSprintAtual as any);

export default router;
