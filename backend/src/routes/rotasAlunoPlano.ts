/**
 * Rotas para Gerenciamento de Associações Aluno-Plano
 * 
 * Este módulo define todas as rotas relacionadas às operações de associação entre alunos e planos,
 * seguindo padrões RESTful para as operações CRUD.
 */
import * as express from 'express';
import { Router } from 'express';
import * as controladorAlunoPlano from '../controllers/controladorAlunoPlano';
import authMiddleware from '../middleware/autenticacao';

const router: Router = express.Router();

// Schemas estão definidos em: backend/src/docs/schemas/alunoSchemas.js

// Aplica o middleware de autenticação em todas as rotas
router.use(authMiddleware.autenticacao);

/**
 * @swagger
 * /api/aluno-plano/test:
 *   get:
 *     summary: Testar conexão do módulo de aluno-plano
 *     description: Endpoint de teste para verificar se o módulo de associações aluno-plano está funcionando corretamente
 *     tags: [Aluno-Plano]
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
 *                   example: "Rota de aluno-plano funcionando!"
 *             example:
 *               message: "Rota de aluno-plano funcionando!"
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
  res.json({ message: 'Rota de aluno-plano funcionando!' });
});

/**
 * @swagger
 * /api/aluno-plano:
 *   get:
 *     summary: Listar todas as associações aluno-plano
 *     description: Retorna todas as associações entre alunos e planos do sistema, incluindo dados do usuário e do plano
 *     tags: [Aluno-Plano]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de associações obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AlunoPlanoListResponse'
 *             example:
 *               - IdUsuario: 1
 *                 PlanoId: 1
 *                 dataInicio: "2024-01-15"
 *                 dataPrevisaoTermino: "2024-04-15"
 *                 dataConclusao: null
 *                 progresso: 25
 *                 status: "em andamento"
 *                 observacoes: "Aluno com bom desempenho"
 *                 ativo: true
 *                 usuario:
 *                   idusuario: 1
 *                   login: "joao.silva@email.com"
 *                 plano:
 *                   id: 1
 *                   nome: "Plano de Desenvolvimento Web"
 *                   cargo: "Desenvolvedor Frontend"
 *                   duracao: 90
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
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro ao listar associações"
 *               error: "Database connection failed"
 */
router.get('/', controladorAlunoPlano.listarAssociacoes);

/**
 * @swagger
 * /api/aluno-plano:
 *   post:
 *     summary: Atribuir plano a um aluno
 *     description: Cria uma nova associação entre um aluno e um plano. Se o aluno já tiver um plano ativo, o anterior será cancelado automaticamente.
 *     tags: [Aluno-Plano]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AlunoPlanoRequest'
 *           examples:
 *             atribuicao_completa:
 *               summary: Atribuição com todos os campos
 *               value:
 *                 idusuario: 1
 *                 PlanoId: 1
 *                 dataInicio: "2024-01-15"
 *                 dataPrevisaoTermino: "2024-04-15"
 *                 status: "não iniciado"
 *                 observacoes: "Plano atribuído pelo administrador"
 *             atribuicao_simples:
 *               summary: Atribuição básica (apenas campos obrigatórios)
 *               value:
 *                 idusuario: 2
 *                 PlanoId: 1
 *     responses:
 *       201:
 *         description: Plano atribuído com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AlunoPlanoResponse'
 *             example:
 *               IdUsuario: 1
 *               PlanoId: 1
 *               dataInicio: "2024-01-15"
 *               dataPrevisaoTermino: "2024-04-15"
 *               dataConclusao: null
 *               progresso: 0
 *               status: "não iniciado"
 *               observacoes: "Plano atribuído pelo administrador"
 *               ativo: true
 *               usuario:
 *                 idusuario: 1
 *                 login: "joao.silva@email.com"
 *               plano:
 *                 id: 1
 *                 nome: "Plano de Desenvolvimento Web"
 *                 cargo: "Desenvolvedor Frontend"
 *                 duracao: 90
 *               createdAt: "2024-01-15T10:30:00.000Z"
 *               updatedAt: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Dados inválidos ou campos obrigatórios faltando
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "idusuario e PlanoId são obrigatórios"
 *       404:
 *         description: Usuário ou plano não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Usuário não encontrado"
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token de acesso requerido"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro ao atribuir plano ao aluno"
 *               error: "Database connection failed"
 */
router.post('/', controladorAlunoPlano.atribuirPlanoAluno as any);

/**
 * @swagger
 * /api/aluno-plano/meu-plano:
 *   get:
 *     summary: Buscar plano do aluno logado
 *     description: Retorna o plano ativo associado ao aluno autenticado, incluindo sprints e metas
 *     tags: [Aluno-Plano]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Plano do aluno obtido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AlunoPlanoResponse'
 *             example:
 *               IdUsuario: 1
 *               PlanoId: 1
 *               dataInicio: "2024-01-15"
 *               dataPrevisaoTermino: "2024-04-15"
 *               dataConclusao: null
 *               progresso: 25
 *               status: "em andamento"
 *               observacoes: "Aluno com bom desempenho"
 *               ativo: true
 *               usuario:
 *                 idusuario: 1
 *                 login: "joao.silva@email.com"
 *               plano:
 *                 id: 1
 *                 nome: "Plano de Desenvolvimento Web"
 *                 cargo: "Desenvolvedor Frontend"
 *                 duracao: 90
 *                 sprints:
 *                   - id: 1
 *                     nome: "Sprint 1 - HTML/CSS"
 *                     metas:
 *                       - id: 1
 *                         titulo: "Criar página HTML"
 *                         status: "concluído"
 *               createdAt: "2024-01-15T10:30:00.000Z"
 *               updatedAt: "2024-01-15T10:30:00.000Z"
 *       404:
 *         description: Aluno não possui planos atribuídos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Você não possui planos de estudo atribuídos."
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token de acesso requerido"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro ao buscar plano do aluno"
 */
router.get('/meu-plano', controladorAlunoPlano.buscarPlanoDoAlunoLogado as any);

/**
 * @swagger
 * /api/aluno-plano/aluno/{alunoId}:
 *   get:
 *     summary: Buscar planos de um aluno específico
 *     description: Retorna todos os planos associados a um aluno específico, incluindo histórico de planos
 *     tags: [Aluno-Plano]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: alunoId
 *         required: true
 *         description: ID do aluno
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Planos do aluno obtidos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AlunoPlanoListResponse'
 *             example:
 *               - IdUsuario: 1
 *                 PlanoId: 1
 *                 dataInicio: "2024-01-15"
 *                 dataPrevisaoTermino: "2024-04-15"
 *                 dataConclusao: null
 *                 progresso: 25
 *                 status: "em andamento"
 *                 observacoes: "Plano atual"
 *                 ativo: true
 *                 plano:
 *                   id: 1
 *                   nome: "Plano de Desenvolvimento Web"
 *                   cargo: "Desenvolvedor Frontend"
 *                   duracao: 90
 *               - IdUsuario: 1
 *                 PlanoId: 2
 *                 dataInicio: "2023-10-01"
 *                 dataPrevisaoTermino: "2023-12-31"
 *                 dataConclusao: "2023-12-20"
 *                 progresso: 100
 *                 status: "concluído"
 *                 observacoes: "Plano anterior concluído"
 *                 ativo: false
 *                 plano:
 *                   id: 2
 *                   nome: "Plano de Fundamentos"
 *                   cargo: "Desenvolvedor Iniciante"
 *                   duracao: 90
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token de acesso requerido"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro ao buscar planos do aluno"
 */
router.get('/aluno/:alunoId', controladorAlunoPlano.buscarPlanosPorAluno as any);

/**
 * @swagger
 * /api/aluno-plano/plano/{planoId}:
 *   get:
 *     summary: Buscar alunos de um plano específico
 *     description: Retorna todos os alunos associados a um plano específico, incluindo dados de progresso
 *     tags: [Aluno-Plano]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planoId
 *         required: true
 *         description: ID do plano
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Alunos do plano obtidos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AlunoPlanoListResponse'
 *             example:
 *               - IdUsuario: 1
 *                 PlanoId: 1
 *                 dataInicio: "2024-01-15"
 *                 dataPrevisaoTermino: "2024-04-15"
 *                 dataConclusao: null
 *                 progresso: 25
 *                 status: "em andamento"
 *                 observacoes: "Aluno com bom desempenho"
 *                 ativo: true
 *                 usuario:
 *                   idusuario: 1
 *                   login: "joao.silva@email.com"
 *               - IdUsuario: 2
 *                 PlanoId: 1
 *                 dataInicio: "2024-01-20"
 *                 dataPrevisaoTermino: "2024-04-20"
 *                 dataConclusao: null
 *                 progresso: 50
 *                 status: "em andamento"
 *                 observacoes: "Aluno avançado"
 *                 ativo: true
 *                 usuario:
 *                   idusuario: 2
 *                   login: "maria.santos@email.com"
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token de acesso requerido"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro ao buscar alunos do plano"
 */
router.get('/plano/:planoId', controladorAlunoPlano.buscarAlunosPorPlano as any);

/**
 * @swagger
 * /api/aluno-plano/{id}:
 *   get:
 *     summary: Buscar associação aluno-plano por ID (DEPRECIADO)
 *     description: |
 *       **ATENÇÃO: Este endpoint está com problema de implementação.**
 *       
 *       O modelo AlunoPlano usa chave primária composta (IdUsuario + PlanoId), 
 *       mas este endpoint tenta buscar por um campo 'id' único que não existe.
 *       
 *       **Recomendação:** Use os endpoints específicos:
 *       - `GET /api/aluno-plano/aluno/{alunoId}` - Para buscar planos de um aluno
 *       - `GET /api/aluno-plano/plano/{planoId}` - Para buscar alunos de um plano
 *     tags: [Aluno-Plano]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da associação (NÃO FUNCIONAL - campo não existe)
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       500:
 *         description: Erro de implementação - campo 'id' não existe no modelo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro ao buscar associação"
 *               error: "Campo 'id' não existe no modelo AlunoPlano"
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token de acesso requerido"
 */
router.get('/:id', controladorAlunoPlano.buscarAssociacaoPorId as any);

/**
 * @swagger
 * /api/aluno-plano/{id}:
 *   put:
 *     summary: Atualizar progresso de um aluno em um plano
 *     description: |
 *       Atualiza o progresso, status e observações de um aluno em um plano específico. 
 *       Se o status for alterado para 'concluído', a data de conclusão é definida automaticamente.
 *       
 *       **IMPORTANTE:** O parâmetro `{id}` da URL não é utilizado. A identificação da associação 
 *       é feita através dos campos `idusuario` e `PlanoId` no corpo da requisição.
 *     tags: [Aluno-Plano]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da associação (NÃO UTILIZADO - mantido apenas para compatibilidade de rota)
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AlunoPlanoUpdateRequest'
 *           examples:
 *             atualizar_progresso:
 *               summary: Atualizar apenas progresso
 *               value:
 *                 idusuario: 1
 *                 PlanoId: 1
 *                 progresso: 50
 *             atualizar_status:
 *               summary: Atualizar status para concluído
 *               value:
 *                 idusuario: 1
 *                 PlanoId: 1
 *                 status: "concluído"
 *                 observacoes: "Aluno concluiu todas as atividades"
 *             atualizar_completo:
 *               summary: Atualização completa
 *               value:
 *                 idusuario: 1
 *                 PlanoId: 1
 *                 progresso: 100
 *                 status: "concluído"
 *                 dataConclusao: "2024-04-10"
 *                 observacoes: "Excelente desempenho em todas as atividades"
 *     responses:
 *       200:
 *         description: Progresso atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AlunoPlanoResponse'
 *             example:
 *               IdUsuario: 1
 *               PlanoId: 1
 *               dataInicio: "2024-01-15"
 *               dataPrevisaoTermino: "2024-04-15"
 *               dataConclusao: "2024-04-10"
 *               progresso: 100
 *               status: "concluído"
 *               observacoes: "Excelente desempenho em todas as atividades"
 *               ativo: true
 *               usuario:
 *                 idusuario: 1
 *                 login: "joao.silva@email.com"
 *               plano:
 *                 id: 1
 *                 nome: "Plano de Desenvolvimento Web"
 *                 cargo: "Desenvolvedor Frontend"
 *                 duracao: 90
 *               createdAt: "2024-01-15T10:30:00.000Z"
 *               updatedAt: "2024-04-10T15:45:00.000Z"
 *       400:
 *         description: Dados inválidos ou campos obrigatórios faltando
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "idusuario e PlanoId são obrigatórios"
 *       404:
 *         description: Associação aluno-plano não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Associação aluno-plano não encontrada"
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token de acesso requerido"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro ao atualizar progresso"
 *               error: "Database connection failed"
 */
router.put('/:id', controladorAlunoPlano.atualizarProgresso as any);

/**
 * @swagger
 * /api/aluno-plano/{id}:
 *   delete:
 *     summary: Remover associação aluno-plano
 *     description: |
 *       Remove permanentemente a associação entre um aluno e um plano. 
 *       **ATENÇÃO:** Esta operação é irreversível e deve ser usada apenas para correção de dados.
 *       
 *       **IMPORTANTE:** O parâmetro `{id}` da URL não é utilizado. A identificação da associação 
 *       é feita através dos campos `idusuario` e `PlanoId` no corpo da requisição.
 *     tags: [Aluno-Plano]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da associação (NÃO UTILIZADO - mantido apenas para compatibilidade de rota)
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AlunoPlanoDeleteRequest'
 *           example:
 *             idusuario: 1
 *             PlanoId: 1
 *     responses:
 *       200:
 *         description: Associação removida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AlunoPlanoDeleteResponse'
 *             example:
 *               message: "Associação aluno-plano removida com sucesso"
 *       400:
 *         description: Dados inválidos ou campos obrigatórios faltando
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "idusuario e PlanoId são obrigatórios"
 *       404:
 *         description: Associação aluno-plano não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Associação aluno-plano não encontrada"
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token de acesso requerido"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro ao remover associação aluno-plano"
 *               error: "Database connection failed"
 */
router.delete('/:id', controladorAlunoPlano.removerAssociacao as any);

export default router;
