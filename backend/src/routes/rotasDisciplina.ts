/**
 * Rotas para gerenciamento de disciplinas
 * 
 * Este arquivo define os endpoints da API relacionados às disciplinas.
 * Inclui rotas para o sistema de versionamento de disciplinas.
 */
import * as express from 'express';
import { Response } from 'express';
import * as disciplinaController from '../controllers/controladorDisciplina';
import authMiddleware from '../middleware/autenticacao';
import { RequestDisciplina } from '../types/requestResponse';

const router = express.Router();

// Schemas estão definidos em: backend/src/docs/schemas/disciplinaSchemas.js

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware.autenticacao);

/**
 * @swagger
 * /api/disciplinas:
 *   get:
 *     summary: Listar todas as disciplinas
 *     description: Retorna uma lista completa de todas as disciplinas cadastradas no sistema, incluindo suas informações básicas e assuntos relacionados
 *     tags: [Disciplinas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de disciplinas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DisciplinaListResponse'
 *             examples:
 *               disciplinas:
 *                 summary: Lista de disciplinas
 *                 value:
 *                   - id: 1
 *                     nome: "Desenvolvimento Web"
 *                     descricao: "Disciplina focada em tecnologias web modernas"
 *                     ativa: true
 *                     versao: 1
 *                     disciplina_origem_id: null
 *                     assuntos:
 *                       - id: 1
 *                         nome: "HTML/CSS"
 *                         disciplinaId: 1
 *                         createdAt: "2024-01-15T10:30:00.000Z"
 *                         updatedAt: "2024-01-15T10:30:00.000Z"
 *                       - id: 2
 *                         nome: "JavaScript"
 *                         disciplinaId: 1
 *                         createdAt: "2024-01-15T10:30:00.000Z"
 *                         updatedAt: "2024-01-15T10:30:00.000Z"
 *       401:
 *         description: Token de autenticação inválido ou ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Token inválido"
 *               error: "Token expirado ou malformado"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Erro interno do servidor"
 *               error: "Database connection failed"
 */
router.get('/', disciplinaController.listarDisciplinas);

/**
 * @swagger
 * /api/disciplinas/ativas:
 *   get:
 *     summary: Listar disciplinas ativas
 *     description: Retorna apenas as disciplinas que estão ativas no sistema, excluindo as desabilitadas
 *     tags: [Disciplinas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de disciplinas ativas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DisciplinaListResponse'
 *             examples:
 *               disciplinas_ativas:
 *                 summary: Lista de disciplinas ativas
 *                 value:
 *                   - id: 1
 *                     nome: "Desenvolvimento Web"
 *                     descricao: "Disciplina focada em tecnologias web modernas"
 *                     ativa: true
 *                     versao: 1
 *                     disciplina_origem_id: null
 *                     assuntos:
 *                       - id: 1
 *                         nome: "HTML/CSS"
 *                         disciplinaId: 1
 *       401:
 *         description: Token de autenticação inválido ou ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Token inválido"
 *               error: "Token expirado ou malformado"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Erro interno do servidor"
 *               error: "Database connection failed"
 */
router.get('/ativas', disciplinaController.listarDisciplinasAtivas);

/**
 * @swagger
 * /api/disciplinas/{id}:
 *   get:
 *     summary: Buscar disciplina por ID
 *     description: Retorna os dados completos de uma disciplina específica, incluindo todos os seus assuntos
 *     tags: [Disciplinas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da disciplina
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Disciplina encontrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DisciplinaResponse'
 *             examples:
 *               disciplina_encontrada:
 *                 summary: Disciplina com assuntos
 *                 value:
 *                   id: 1
 *                   nome: "Desenvolvimento Web"
 *                   descricao: "Disciplina focada em tecnologias web modernas"
 *                   ativa: true
 *                   versao: 1
 *                   disciplina_origem_id: null
 *                   assuntos:
 *                     - id: 1
 *                       nome: "HTML/CSS"
 *                       disciplinaId: 1
 *                     - id: 2
 *                       nome: "JavaScript"
 *                       disciplinaId: 1
 *       404:
 *         description: Disciplina não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Disciplina não encontrada"
 *       401:
 *         description: Token de autenticação inválido ou ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Token inválido"
 *               error: "Token expirado ou malformado"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Erro interno do servidor"
 *               error: "Database connection failed"
 */
router.get('/:id', disciplinaController.buscarDisciplina);

/**
 * @swagger
 * /api/disciplinas:
 *   post:
 *     summary: Criar nova disciplina
 *     description: Cria uma nova disciplina no sistema. Se assuntos forem fornecidos, eles também serão criados automaticamente
 *     tags: [Disciplinas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDisciplinaRequest'
 *           examples:
 *             disciplina_completa:
 *               summary: Disciplina com assuntos
 *               value:
 *                 nome: "Desenvolvimento Mobile"
 *                 descricao: "Disciplina focada em desenvolvimento de aplicativos móveis"
 *                 ativa: true
 *                 assuntos:
 *                   - nome: "React Native"
 *                   - nome: "Flutter"
 *                   - nome: "Ionic"
 *             disciplina_simples:
 *               summary: Disciplina sem assuntos
 *               value:
 *                 nome: "Banco de Dados"
 *                 descricao: "Fundamentos de banco de dados relacionais"
 *                 ativa: true
 *     responses:
 *       201:
 *         description: Disciplina criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DisciplinaResponse'
 *             examples:
 *               disciplina_criada:
 *                 summary: Disciplina criada
 *                 value:
 *                   id: 3
 *                   nome: "Desenvolvimento Mobile"
 *                   descricao: "Disciplina focada em desenvolvimento de aplicativos móveis"
 *                   ativa: true
 *                   versao: 1
 *                   disciplina_origem_id: null
 *                   assuntos:
 *                     - id: 5
 *                       nome: "React Native"
 *                       disciplinaId: 3
 *                     - id: 6
 *                       nome: "Flutter"
 *                       disciplinaId: 3
 *       400:
 *         description: Dados inválidos ou disciplina já existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               disciplina_existente:
 *                 summary: Disciplina já existe
 *                 value:
 *                   success: false
 *                   message: "Já existe uma disciplina com este nome"
 *               dados_invalidos:
 *                 summary: Dados inválidos
 *                 value:
 *                   success: false
 *                   message: "Nome da disciplina é obrigatório"
 *       401:
 *         description: Token de autenticação inválido ou ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Token inválido"
 *               error: "Token expirado ou malformado"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Erro interno do servidor"
 *               error: "Database connection failed"
 */
router.post('/', disciplinaController.criarDisciplina);

/**
 * @swagger
 * /api/disciplinas/{id}:
 *   put:
 *     summary: Atualizar disciplina
 *     description: Atualiza uma disciplina existente. Se a disciplina estiver em uso por planos, uma nova versão será criada automaticamente
 *     tags: [Disciplinas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da disciplina
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateDisciplinaRequest'
 *           examples:
 *             atualizacao_simples:
 *               summary: Atualização simples
 *               value:
 *                 nome: "Desenvolvimento Web Avançado"
 *                 descricao: "Disciplina atualizada com novos conteúdos"
 *                 ativa: true
 *             atualizacao_com_assuntos:
 *               summary: Atualização com novos assuntos
 *               value:
 *                 nome: "Desenvolvimento Web"
 *                 descricao: "Disciplina com assuntos atualizados"
 *                 ativa: true
 *                 assuntos:
 *                   - nome: "HTML5"
 *                   - nome: "CSS3"
 *                   - nome: "JavaScript ES6+"
 *                   - nome: "React"
 *     responses:
 *       200:
 *         description: Disciplina atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DisciplinaUpdateResponse'
 *             examples:
 *               atualizacao_direta:
 *                 summary: Atualização direta
 *                 value:
 *                   disciplina:
 *                     id: 1
 *                     nome: "Desenvolvimento Web Avançado"
 *                     descricao: "Disciplina atualizada com novos conteúdos"
 *                     ativa: true
 *                     versao: 1
 *                     disciplina_origem_id: null
 *                     assuntos: []
 *                   message: "Disciplina atualizada com sucesso"
 *                   versionada: false
 *               nova_versao:
 *                 summary: Nova versão criada
 *                 value:
 *                   disciplina:
 *                     id: 4
 *                     nome: "Desenvolvimento Web (editada) v2"
 *                     descricao: "Disciplina com assuntos atualizados"
 *                     ativa: true
 *                     versao: 2
 *                     disciplina_origem_id: 1
 *                     assuntos:
 *                       - id: 7
 *                         nome: "HTML5"
 *                         disciplinaId: 4
 *                       - id: 8
 *                         nome: "CSS3"
 *                         disciplinaId: 4
 *                   message: "Nova versão da disciplina criada automaticamente pois está em uso por planos"
 *                   versionada: true
 *                   versao: 2
 *       404:
 *         description: Disciplina não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Disciplina não encontrada"
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Já existe outra disciplina com este nome"
 *       401:
 *         description: Token de autenticação inválido ou ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Token inválido"
 *               error: "Token expirado ou malformado"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Erro interno do servidor"
 *               error: "Database connection failed"
 */
router.put('/:id', disciplinaController.atualizarDisciplina);

/**
 * @swagger
 * /api/disciplinas/{id}:
 *   delete:
 *     summary: Remover disciplina
 *     description: Remove uma disciplina do sistema. Esta operação é irreversível e também remove todos os assuntos associados
 *     tags: [Disciplinas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da disciplina
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Disciplina removida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Disciplina removida com sucesso"
 *       404:
 *         description: Disciplina não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Disciplina não encontrada"
 *       401:
 *         description: Token de autenticação inválido ou ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Token inválido"
 *               error: "Token expirado ou malformado"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Erro interno do servidor"
 *               error: "Database connection failed"
 */
router.delete('/:id', disciplinaController.removerDisciplina);

/**
 * @swagger
 * /api/disciplinas/{id}/versao:
 *   post:
 *     summary: Criar nova versão de disciplina
 *     description: Cria uma nova versão de uma disciplina existente, mantendo a versão original intacta
 *     tags: [Disciplinas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da disciplina original
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateVersionDisciplinaRequest'
 *           examples:
 *             nova_versao_com_assuntos:
 *               summary: Nova versão com assuntos
 *               value:
 *                 nome: "Desenvolvimento Web v2"
 *                 descricao: "Versão atualizada da disciplina"
 *                 ativa: true
 *                 assuntos:
 *                   - nome: "HTML5"
 *                   - nome: "CSS3"
 *                   - nome: "JavaScript ES6+"
 *                 copiarAssuntos: false
 *             nova_versao_copiando_assuntos:
 *               summary: Nova versão copiando assuntos
 *               value:
 *                 nome: "Desenvolvimento Web v2"
 *                 descricao: "Versão atualizada da disciplina"
 *                 ativa: true
 *                 copiarAssuntos: true
 *     responses:
 *       201:
 *         description: Nova versão criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DisciplinaResponse'
 *             examples:
 *               versao_criada:
 *                 summary: Nova versão criada
 *                 value:
 *                   id: 5
 *                   nome: "Desenvolvimento Web v2 (editada) v2"
 *                   descricao: "Versão atualizada da disciplina"
 *                   ativa: true
 *                   versao: 2
 *                   disciplina_origem_id: 1
 *                   assuntos:
 *                     - id: 9
 *                       nome: "HTML5"
 *                       disciplinaId: 5
 *                     - id: 10
 *                       nome: "CSS3"
 *                       disciplinaId: 5
 *       404:
 *         description: Disciplina original não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Disciplina original não encontrada"
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Nome da disciplina é obrigatório"
 *       401:
 *         description: Token de autenticação inválido ou ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Token inválido"
 *               error: "Token expirado ou malformado"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Erro interno do servidor"
 *               error: "Database connection failed"
 */
router.post('/:id/versao', disciplinaController.criarVersaoDisciplina);

/**
 * @swagger
 * /api/disciplinas/{id}/versoes:
 *   get:
 *     summary: Listar versões de disciplina
 *     description: Retorna todas as versões de uma disciplina, incluindo a versão original
 *     tags: [Disciplinas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da disciplina (qualquer versão)
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Lista de versões retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DisciplinaListResponse'
 *             examples:
 *               versoes:
 *                 summary: Lista de versões
 *                 value:
 *                   - id: 1
 *                     nome: "Desenvolvimento Web"
 *                     descricao: "Disciplina original"
 *                     ativa: true
 *                     versao: 1
 *                     disciplina_origem_id: null
 *                     assuntos:
 *                       - id: 1
 *                         nome: "HTML/CSS"
 *                         disciplinaId: 1
 *                   - id: 4
 *                     nome: "Desenvolvimento Web (editada) v2"
 *                     descricao: "Versão atualizada"
 *                     ativa: true
 *                     versao: 2
 *                     disciplina_origem_id: 1
 *                     assuntos:
 *                       - id: 7
 *                         nome: "HTML5"
 *                         disciplinaId: 4
 *       404:
 *         description: Disciplina não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Disciplina não encontrada"
 *       401:
 *         description: Token de autenticação inválido ou ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Token inválido"
 *               error: "Token expirado ou malformado"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Erro interno do servidor"
 *               error: "Database connection failed"
 */
router.get('/:id/versoes', disciplinaController.listarVersoesDisciplina);

/**
 * @swagger
 * /api/disciplinas/comparar/{id1}/{id2}:
 *   get:
 *     summary: Comparar versões de disciplina
 *     description: Compara duas versões de uma disciplina e retorna as diferenças entre elas
 *     tags: [Disciplinas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id1
 *         required: true
 *         description: ID da primeira versão
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: path
 *         name: id2
 *         required: true
 *         description: ID da segunda versão
 *         schema:
 *           type: integer
 *           example: 4
 *     responses:
 *       200:
 *         description: Comparação realizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DisciplinaComparisonResponse'
 *             examples:
 *               comparacao:
 *                 summary: Comparação entre versões
 *                 value:
 *                   metadados:
 *                     disciplina1:
 *                       id: 1
 *                       versao: 1
 *                     disciplina2:
 *                       id: 4
 *                       versao: 2
 *                   campos:
 *                     nome:
 *                       antes: "Desenvolvimento Web"
 *                       depois: "Desenvolvimento Web (editada) v2"
 *                     descricao:
 *                       antes: "Disciplina original"
 *                       depois: "Versão atualizada"
 *                   assuntos:
 *                     adicionados:
 *                       - "HTML5"
 *                       - "CSS3"
 *                     removidos:
 *                       - "HTML/CSS"
 *                     mantidos: []
 *       404:
 *         description: Uma ou ambas as disciplinas não foram encontradas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Uma ou ambas as disciplinas não foram encontradas"
 *       400:
 *         description: Disciplinas não são versões da mesma disciplina original
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "As disciplinas não são versões da mesma disciplina original"
 *       401:
 *         description: Token de autenticação inválido ou ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Token inválido"
 *               error: "Token expirado ou malformado"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Erro interno do servidor"
 *               error: "Database connection failed"
 */
router.get('/comparar/:id1/:id2', disciplinaController.compararVersoesDisciplina);

export default router;



