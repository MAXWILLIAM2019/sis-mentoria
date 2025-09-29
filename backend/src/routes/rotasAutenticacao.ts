import * as express from 'express';
import { Router } from 'express';
import * as controladorAutenticacao from '../controllers/controladorAutenticacao';
import authMiddleware from '../middleware/autenticacao';

const router: Router = express.Router();

// Schemas estão definidos em: backend/src/docs/schemas/authSchemas.js

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar novo usuário
 *     description: Cria uma nova conta de usuário no sistema (aluno ou administrador)
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           examples:
 *             aluno:
 *               summary: Registro de aluno
 *               value:
 *                 nome: "João Silva Santos"
 *                 login: "joao.silva@email.com"
 *                 senha: "123456"
 *                 grupo: "aluno"
 *             administrador:
 *               summary: Registro de administrador
 *               value:
 *                 nome: "Maria Admin Silva"
 *                 login: "maria.admin@email.com"
 *                 senha: "admin123"
 *                 grupo: "administrador"
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               success: true
 *               message: "Usuário cadastrado com sucesso!"
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Dados inválidos"
 *               error: "Email já está em uso"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Erro interno do servidor"
 *               error: "Falha ao criar usuário"
 */
router.post('/register', controladorAutenticacao.registrar);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Fazer login
 *     description: Autentica um usuário e retorna um token JWT para acesso às rotas protegidas
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             login_aluno:
 *               summary: Login de aluno
 *               value:
 *                 login: "joao.silva@email.com"
 *                 senha: "123456"
 *                 grupo: "aluno"
 *             login_admin:
 *               summary: Login de administrador
 *               value:
 *                 login: "maria.admin@email.com"
 *                 senha: "admin123"
 *                 grupo: "administrador"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               success: true
 *               message: "Login realizado com sucesso"
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               usuario:
 *                 IdUsuario: 1
 *                 login: "joao.silva@email.com"
 *                 grupo: 1
 *                 situacao: true
 *                 grupoUsuario:
 *                   IdGrupo: 1
 *                   nome: "aluno"
 *                 alunoInfo:
 *                   email: "joao.silva@email.com"
 *                   cpf: "123.456.789-00"
 *                   telefone: "(11) 99999-9999"
 *                   biografia: "Estudante de desenvolvimento web com foco em React e Node.js"
 *                   formacao: "ensino-superior-completo"
 *                   is_trabalhando: true
 *                   is_aceita_termos: true
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Credenciais inválidas"
 *               error: "Email ou senha incorretos"
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Dados inválidos"
 *               error: "Email e senha são obrigatórios"
 */
router.post('/login', controladorAutenticacao.loginUnificado);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obter dados do usuário logado
 *     description: Retorna os dados do usuário autenticado baseado no token JWT
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário obtidos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Dados do usuário obtidos com sucesso"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *             example:
 *               success: true
 *               message: "Dados do usuário obtidos com sucesso"
 *               usuario:
 *                 IdUsuario: 1
 *                 login: "joao.silva@email.com"
 *                 grupo: 1
 *                 situacao: true
 *                 grupoUsuario:
 *                   IdGrupo: 1
 *                   nome: "aluno"
 *                 alunoInfo:
 *                   email: "joao.silva@email.com"
 *                   cpf: "123.456.789-00"
 *                   telefone: "(11) 99999-9999"
 *                   biografia: "Estudante de desenvolvimento web com foco em React e Node.js"
 *                   formacao: "ensino-superior-completo"
 *                   is_trabalhando: true
 *                   is_aceita_termos: true
 *       401:
 *         description: Token inválido ou expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Token inválido"
 *               error: "Token expirado ou malformado"
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Usuário não encontrado"
 *               error: "Usuário com ID do token não existe"
 */
router.get('/me', authMiddleware.autenticacao, controladorAutenticacao.obterMeuPerfil);

/**
 * @swagger
 * /api/auth/impersonate/{id}:
 *   post:
 *     summary: Impersonar usuário (Admin)
 *     description: Permite que um administrador gere um token para acessar o sistema como outro usuário
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do usuário a ser impersonado
 *         schema:
 *           type: integer
 *           example: 5
 *     responses:
 *       200:
 *         description: Token de impersonação gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Token de impersonação gerado com sucesso"
 *                 token:
 *                   type: string
 *                   description: Token JWT para impersonação
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 originalUser:
 *                   $ref: '#/components/schemas/User'
 *             example:
 *               success: true
 *               message: "Token de impersonação gerado com sucesso"
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               usuario:
 *                 IdUsuario: 5
 *                 login: "pedro.aluno@email.com"
 *                 grupo: 1
 *                 situacao: true
 *                 grupoUsuario:
 *                   IdGrupo: 1
 *                   nome: "aluno"
 *                 alunoInfo:
 *                   email: "pedro.aluno@email.com"
 *                   cpf: "987.654.321-00"
 *                   telefone: "(11) 99999-9999"
 *                   biografia: "Estudante de desenvolvimento web com foco em React e Node.js"
 *                   formacao: "ensino-superior-completo"
 *                   is_trabalhando: true
 *                   is_aceita_termos: true
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Não autorizado"
 *               error: "Apenas administradores podem impersonar usuários"
 *       403:
 *         description: Acesso negado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Acesso negado"
 *               error: "Usuário não é administrador"
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Usuário não encontrado"
 *               error: "Usuário com ID 5 não existe"
 */
router.post('/impersonate/:id', authMiddleware.autenticacao, authMiddleware.apenasAdministrador, controladorAutenticacao.impersonarUsuario);

export default router;
