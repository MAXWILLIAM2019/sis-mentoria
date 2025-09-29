import * as express from 'express';
import { Router } from 'express';
import * as controladorPlanoMestre from '../controllers/controladorPlanoMestre';
import authMiddleware from '../middleware/autenticacao';

const router: Router = express.Router();

// Schemas estão definidos em: backend/src/docs/schemas/planoMestreSchemas.js

/**
 * @swagger
 * /api/planos-mestre:
 *   get:
 *     summary: Listar todos os planos mestre ativos
 *     description: |
 *       Retorna todos os planos mestre ativos do sistema, incluindo sua estrutura completa de sprints e metas.
 *       
 *       **Funcionalidades:**
 *       - Lista apenas planos mestre ativos (ativo: true)
 *       - Inclui sprints mestre ordenadas por posição
 *       - Inclui metas mestre de cada sprint
 *       - Ordenação por nome do plano
 *       
 *       **Uso:** Este endpoint é usado pelos administradores para visualizar todos os templates
 *       disponíveis para criação de planos personalizados.
 *     tags: [Planos Mestre]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de planos mestre obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlanoMestreListResponse'
 *             example:
 *               - id: 1
 *                 nome: "Plano de Desenvolvimento Web Frontend"
 *                 cargo: "Desenvolvedor Frontend"
 *                 descricao: "Plano completo para formação em desenvolvimento web frontend"
 *                 duracao: 6
 *                 versao: "1.0"
 *                 ativo: true
 *                 sprintsMestre:
 *                   - id: 1
 *                     nome: "Sprint 1 - HTML/CSS"
 *                     posicao: 1
 *                     dataInicio: "2024-01-15"
 *                     dataFim: "2024-01-29"
 *                     metasMestre:
 *                       - id: 1
 *                         disciplina: "HTML"
 *                         tipo: "teoria"
 *                         titulo: "Introdução ao HTML"
 *                         comandos: "Estudar tags básicas"
 *                         link: "https://example.com/html-basics"
 *                         relevancia: "Alta"
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-15T10:30:00.000Z"
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token de acesso requerido"
 *       403:
 *         description: Acesso negado - apenas administradores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Acesso negado - apenas administradores"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro ao listar planos mestre"
 *               error: "Database connection failed"
 */
router.get('/', authMiddleware.autenticacao, authMiddleware.apenasAdministrador, controladorPlanoMestre.listarPlanosMestre);

/**
 * @swagger
 * /api/planos-mestre/{id}:
 *   get:
 *     summary: Buscar plano mestre por ID
 *     description: |
 *       Retorna um plano mestre específico com sua estrutura completa de sprints e metas.
 *       
 *       **Funcionalidades:**
 *       - Busca plano mestre por ID
 *       - Inclui sprints mestre ordenadas por posição
 *       - Inclui metas mestre de cada sprint
 *       - Retorna erro 404 se não encontrado
 *       
 *       **Uso:** Este endpoint é usado pelos administradores para visualizar detalhes
 *       de um template específico antes de criar uma instância.
 *     tags: [Planos Mestre]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do plano mestre
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Plano mestre encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlanoMestreResponse'
 *             example:
 *               id: 1
 *               nome: "Plano de Desenvolvimento Web Frontend"
 *               cargo: "Desenvolvedor Frontend"
 *               descricao: "Plano completo para formação em desenvolvimento web frontend"
 *               duracao: 6
 *               versao: "1.0"
 *               ativo: true
 *               sprintsMestre:
 *                 - id: 1
 *                   nome: "Sprint 1 - HTML/CSS"
 *                   posicao: 1
 *                   dataInicio: "2024-01-15"
 *                   dataFim: "2024-01-29"
 *                   metasMestre:
 *                     - id: 1
 *                       disciplina: "HTML"
 *                       tipo: "teoria"
 *                       titulo: "Introdução ao HTML"
 *                       comandos: "Estudar tags básicas"
 *                       link: "https://example.com/html-basics"
 *                       relevancia: "Alta"
 *               createdAt: "2024-01-15T10:30:00.000Z"
 *               updatedAt: "2024-01-15T10:30:00.000Z"
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token de acesso requerido"
 *       403:
 *         description: Acesso negado - apenas administradores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Acesso negado - apenas administradores"
 *       404:
 *         description: Plano mestre não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Plano mestre não encontrado"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro ao buscar plano mestre"
 *               error: "Database connection failed"
 */
router.get('/:id', authMiddleware.autenticacao, authMiddleware.apenasAdministrador, controladorPlanoMestre.buscarPlanoMestrePorId);

/**
 * @swagger
 * /api/planos-mestre:
 *   post:
 *     summary: Criar novo plano mestre
 *     description: |
 *       Cria um novo plano mestre (template) que pode ser usado para gerar planos personalizados.
 *       
 *       **Funcionalidades:**
 *       - Cria um novo template de plano
 *       - Define dados básicos (nome, cargo, descrição, duração)
 *       - Define versão (padrão: 1.0)
 *       - Define como ativo por padrão
 *       
 *       **Uso:** Este endpoint é usado pelos administradores para criar novos templates
 *       que podem ser instanciados para alunos.
 *       
 *       **NOTA:** A validação de campos obrigatórios é feita pelo Sequelize. Se campos
 *       obrigatórios não forem fornecidos, será retornado erro 400 com mensagem de validação.
 *     tags: [Planos Mestre]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PlanoMestreRequest'
 *           example:
 *             nome: "Plano de Desenvolvimento Web Frontend"
 *             cargo: "Desenvolvedor Frontend"
 *             descricao: "Plano completo para formação em desenvolvimento web frontend com foco em React, HTML, CSS e JavaScript"
 *             duracao: 6
 *             versao: "1.0"
 *     responses:
 *       201:
 *         description: Plano mestre criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlanoMestreResponse'
 *             example:
 *               id: 1
 *               nome: "Plano de Desenvolvimento Web Frontend"
 *               cargo: "Desenvolvedor Frontend"
 *               descricao: "Plano completo para formação em desenvolvimento web frontend"
 *               duracao: 6
 *               versao: "1.0"
 *               ativo: true
 *               sprintsMestre: []
 *               createdAt: "2024-01-15T10:30:00.000Z"
 *               updatedAt: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Dados inválidos ou campos obrigatórios faltando
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Validation error: nome cannot be null"
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token de acesso requerido"
 *       403:
 *         description: Acesso negado - apenas administradores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Acesso negado - apenas administradores"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro ao criar plano mestre"
 *               error: "Database connection failed"
 */
router.post('/', authMiddleware.autenticacao, authMiddleware.apenasAdministrador, controladorPlanoMestre.criarPlanoMestre);

/**
 * @swagger
 * /api/planos-mestre/criar-instancia:
 *   post:
 *     summary: Criar instância personalizada de plano mestre
 *     description: |
 *       Cria uma instância personalizada de um plano mestre para um aluno específico.
 *       Este é um dos endpoints mais importantes do sistema.
 *       
 *       **Funcionalidades:**
 *       - Cria uma cópia personalizada de um plano mestre
 *       - Copia toda a estrutura de sprints e metas
 *       - Associa o plano ao aluno
 *       - Executa em transação para garantir consistência
 *       
 *       **Fluxo Detalhado:**
 *       1. **Validação:** Verifica dados obrigatórios e existência do plano mestre
 *       2. **Criação do Plano:** Copia dados básicos mantendo referência ao template
 *       3. **Criação das Sprints:** Para cada sprint do template, cria instância com datas calculadas
 *       4. **Criação das Metas:** Para cada meta do template, cria instância associada à sprint
 *       5. **Associação com Aluno:** Cria registro em AlunoPlano com ativo = true
 *       
 *       **Importante:**
 *       - Todo o processo é executado em uma transação
 *       - Se qualquer etapa falhar, todas as alterações são revertidas
 *       - Mantém rastreabilidade completa ao template original
 *       - Define ativo = true na associação com o aluno
 *     tags: [Planos Mestre]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CriarInstanciaRequest'
 *           examples:
 *             instancia_completa:
 *               summary: Criação com todos os campos
 *               value:
 *                 planoMestreId: 1
 *                 idUsuario: 1
 *                 dataInicio: "2024-01-15"
 *                 status: "não iniciado"
 *                 observacoes: "Plano criado a partir do template de Desenvolvimento Web"
 *             instancia_simples:
 *               summary: Criação básica (apenas campos obrigatórios)
 *               value:
 *                 planoMestreId: 1
 *                 idUsuario: 1
 *     responses:
 *       201:
 *         description: Instância criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CriarInstanciaResponse'
 *             example:
 *               message: "Plano personalizado criado com sucesso"
 *               plano:
 *                 id: 1
 *                 nome: "Plano de Desenvolvimento Web Frontend"
 *                 cargo: "Desenvolvedor Frontend"
 *                 plano_mestre_id: 1
 *       400:
 *         description: Dados inválidos ou campos obrigatórios faltando
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "planoMestreId e idUsuario são obrigatórios"
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token de acesso requerido"
 *       403:
 *         description: Acesso negado - apenas administradores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Acesso negado - apenas administradores"
 *       404:
 *         description: Plano mestre não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Plano mestre não encontrado"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro interno do servidor"
 *               error: "Transaction failed"
 */
router.post('/criar-instancia', authMiddleware.autenticacao, authMiddleware.apenasAdministrador, controladorPlanoMestre.criarInstancia);

export default router;


