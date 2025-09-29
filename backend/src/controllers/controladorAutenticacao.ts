/**
 * Controller de Autenticação
 * 
 * Gerencia todas as operações relacionadas à autenticação de usuários,
 * incluindo login, registro, verificação de perfil e impersonation.
 */

import { Response } from 'express';
import * as bcrypt from 'bcryptjs';
import { RequestComAutenticacao, RequestLogin, RequestCriarUsuario, RespostaSucesso, RespostaErro, UtilitarioResposta } from '../types/requestResponse';
import { TipoUsuario } from '../types/interfaces';

// Importações dos modelos e serviços
const authService = require('../services/authService');
const { Usuario, GrupoUsuario, AlunoInfo, AdministradorInfo } = require('../models');

/**
 * Registro de novo usuário (unificado)
 * @route POST /auth/register
 * @access Public
 */
export const registrar = async (req: RequestCriarUsuario, res: Response): Promise<void> => {
  try {
    const { nome, login, senha, grupo } = req.body;
    
    if (!nome || !login || !senha || !grupo) {
      res.status(400).json(UtilitarioResposta.erro('Preencha todos os campos obrigatórios.'));
      return;
    }

    // Verifica se já existe usuário com o mesmo login
    const usuarioExistente = await Usuario.findOne({ where: { login } });
    if (usuarioExistente) {
      res.status(400).json(UtilitarioResposta.erro('Login já está em uso.'));
      return;
    }

    // Busca o grupo na tabela grupo_usuario
    const grupoObj = await GrupoUsuario.findOne({ where: { nome: grupo } });
    if (!grupoObj) {
      res.status(400).json(UtilitarioResposta.erro('Grupo de usuário inválido.'));
      return;
    }

    // Criptografa a senha
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    // Cria o usuário
    const novoUsuario = await Usuario.create({
      login,
      senha: senhaCriptografada,
      grupo: grupoObj.IdGrupo,
      situacao: true
    });

    // Cria info complementar
    if (String(grupo) === 'aluno') {
      await AlunoInfo.create({
        IdUsuario: novoUsuario.IdUsuario,
        email: login
      });
    } else if (String(grupo) === 'administrador') {
      await AdministradorInfo.create({
        IdUsuario: novoUsuario.IdUsuario,
        email: login
      });
    }

    res.status(201).json(UtilitarioResposta.sucesso('Usuário cadastrado com sucesso!'));
  } catch (erro) {
    console.error('Erro ao registrar usuário:', erro);
    res.status(500).json(UtilitarioResposta.erro('Erro ao registrar usuário.'));
  }
};

/**
 * Login unificado (novo fluxo)
 * @route POST /auth/login
 * @access Public
 */
export const loginUnificado = async (req: RequestLogin, res: Response): Promise<void> => {
  try {
    const { login, senha, grupo } = req.body;
    console.log('Tentativa de login:', { login, grupo });
    
    // Busca o usuário pelo login
    const usuario = await Usuario.findOne({
      where: { login, situacao: true },
      include: [
        { model: GrupoUsuario, as: 'grupoUsuario' },
        { model: AlunoInfo, as: 'alunoInfo' },
        { model: AdministradorInfo, as: 'adminInfo' }
      ]
    });

    console.log('Usuário encontrado:', usuario ? {
      id: usuario.IdUsuario,
      login: usuario.login,
      grupo: usuario.grupoUsuario?.nome
    } : 'Não encontrado');

    if (!usuario) {
      throw new Error('Usuário ou senha inválidos');
    }

    // Verifica se a senha está correta
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    console.log('Senha válida:', senhaValida);
    
    if (!senhaValida) {
      throw new Error('Usuário ou senha inválidos');
    }

    // Verifica se o grupo informado corresponde ao grupo do usuário
    const grupoUsuario = usuario.grupoUsuario?.nome;
    console.log('Grupo do usuário:', grupoUsuario, 'Grupo informado:', grupo);
    
    if (grupoUsuario !== grupo) {
      throw new Error('Tipo de usuário incorreto');
    }

    // Gera o token JWT usando o authService
    const token = authService.gerarToken({
      id: usuario.IdUsuario,
      login: usuario.login,
      grupo: grupoUsuario,
      email: usuario.alunoInfo?.email || usuario.adminInfo?.email || null
    }, grupoUsuario);

    // Monta o objeto de resposta (sem senha)
    const usuarioSemSenha = usuario.toJSON();
    delete usuarioSemSenha.senha;

    console.log('Login bem-sucedido para:', grupoUsuario);
    
    res.json(UtilitarioResposta.sucesso('Login realizado com sucesso', {
      token,
      usuario: usuarioSemSenha,
      grupo: grupoUsuario
    }));
  } catch (erro) {
    console.error('Erro no login unificado:', erro);
    res.status(401).json(UtilitarioResposta.erro(
      (erro as Error).message || 'Usuário ou senha inválidos'
    ));
  }
};

/**
 * Obtém dados do usuário logado
 * @route GET /api/auth/me
 * @access Private
 */
export const obterMeuPerfil = async (req: RequestComAutenticacao, res: Response): Promise<void> => {
  try {
    console.log('Buscando dados do usuário logado. Token decoded:', req.user);
    
    // O middleware de autenticação já validou o token e definiu req.user
    const userId = req.user?.id;
    const userRole = req.user?.role;
    
    if (!userId || !userRole) {
      res.status(401).json(UtilitarioResposta.erro('Usuário não autenticado'));
      return;
    }

    // Busca o usuário completo com as informações específicas do seu tipo
    const usuario = await Usuario.findOne({
      where: { IdUsuario: userId, situacao: true },
      include: [
        { model: GrupoUsuario, as: 'grupoUsuario' },
        { model: AlunoInfo, as: 'alunoInfo' },
        { model: AdministradorInfo, as: 'adminInfo' }
      ]
    });

    if (!usuario) {
      res.status(404).json(UtilitarioResposta.erro('Usuário não encontrado'));
      return;
    }

    // Remove a senha do objeto de resposta
    const usuarioSemSenha = usuario.toJSON();
    delete usuarioSemSenha.senha;

    // Monta a resposta baseada no tipo de usuário
    let dadosResposta: any = {
      usuario: usuarioSemSenha,
      grupo: userRole
    };

    // Adiciona dados específicos do tipo de usuário para compatibilidade
    if (userRole === TipoUsuario.ALUNO) {
      dadosResposta.aluno = {
        id: usuario.IdUsuario,
        nome: usuario.nome,
        email: usuario.alunoInfo?.email || usuario.login,
        cpf: usuario.alunoInfo?.cpf || usuario.cpf,
        login: usuario.login,
        telefone: usuario.alunoInfo?.telefone || '',
        biografia: usuario.alunoInfo?.biografia || '',
        formacao: usuario.alunoInfo?.formacao || '',
        isTrabalhando: usuario.alunoInfo?.is_trabalhando || false,
        isAceitaTermos: usuario.alunoInfo?.is_aceita_termos || false,
        // Campos de notificações
        notificacoes: {
          novidadesPlataforma: usuario.alunoInfo?.notif_novidades_plataforma ?? true,
          mensagensMentor: usuario.alunoInfo?.notif_mensagens_mentor ?? true,
          novoMaterial: usuario.alunoInfo?.notif_novo_material ?? true,
          atividadesSimulados: usuario.alunoInfo?.notif_atividades_simulados ?? false,
          mentorias: usuario.alunoInfo?.notif_mentorias ?? false
        }
      };
    } else if (userRole === TipoUsuario.ADMINISTRADOR && usuario.adminInfo) {
      dadosResposta.administrador = {
        id: usuario.IdUsuario,
        nome: usuario.nome,
        email: usuario.adminInfo.email,
        cpf: usuario.adminInfo.cpf,
        login: usuario.login
      };
    }

    console.log('Dados do usuário retornados com sucesso para:', userRole);
    res.json(UtilitarioResposta.sucesso('Dados do usuário obtidos com sucesso', dadosResposta));
  } catch (erro) {
    console.error('Erro ao buscar dados do usuário logado:', erro);
    res.status(500).json(UtilitarioResposta.erro('Erro interno do servidor'));
  }
};

/**
 * Gera um token de impersonation para um administrador acessar como aluno
 * @route POST /auth/impersonate/:id
 * @access Private/Admin
 */
export const impersonarUsuario = async (req: RequestComAutenticacao, res: Response): Promise<void> => {
  try {
    const targetUserId = parseInt(req.params.id || '0');
    const timestamp = new Date().toLocaleString();
    console.log(`[${timestamp}] 🔄 Iniciando processo de impersonation:`);
    console.log(`[${timestamp}] 👤 Admin:`, {
      id: req.user?.id,
      role: req.user?.role
    });
    console.log(`[${timestamp}] 🎯 Aluno alvo: ${targetUserId}`);
    
    // Busca o administrador atual
    const admin = await Usuario.findOne({
      where: { 
        IdUsuario: req.user?.id,
        situacao: true
      },
      include: [
        {
          model: GrupoUsuario,
          as: 'grupoUsuario',
          where: { nome: 'administrador' }
        },
        {
          model: AdministradorInfo,
          as: 'adminInfo'
        }
      ]
    });

    if (!admin) {
      console.log(`[${timestamp}] ❌ Acesso negado: Usuário não é administrador`);
      res.status(403).json(UtilitarioResposta.erro('Apenas administradores podem realizar impersonation'));
      return;
    }

    // Busca o aluno alvo
    const aluno = await Usuario.findOne({
      where: { 
        IdUsuario: targetUserId,
        situacao: true
      },
      include: [
        {
          model: GrupoUsuario,
          as: 'grupoUsuario',
          where: { nome: 'aluno' }
        },
        {
          model: AlunoInfo,
          as: 'alunoInfo'
        }
      ]
    });

    if (!aluno) {
      console.log(`[${timestamp}] ❌ Aluno não encontrado: ${targetUserId}`);
      res.status(404).json(UtilitarioResposta.erro('Aluno não encontrado'));
      return;
    }

    console.log(`[${timestamp}] ✅ Validações concluídas com sucesso`);
    console.log(`[${timestamp}] 🔑 Gerando token de impersonation:`, {
      admin: admin.IdUsuario,
      aluno: aluno.IdUsuario,
      nome_aluno: aluno.nome
    });

    // Gera o token de impersonation
    const impersonationToken = authService.gerarToken(
      {
        id: aluno.IdUsuario,
        login: aluno.login,
        email: aluno.alunoInfo?.email
      },
      'aluno',
      {
        originalId: admin.IdUsuario,
        originalRole: 'administrador'
      }
    );

    console.log(`[${timestamp}] ✨ Token de impersonation gerado com sucesso`);

    res.json(UtilitarioResposta.sucesso('Token de impersonation gerado com sucesso', {
      token: impersonationToken,
      usuario: {
        id: aluno.IdUsuario,
        nome: aluno.nome,
        email: aluno.alunoInfo?.email,
        login: aluno.login
      }
    }));

  } catch (erro) {
    const timestamp = new Date().toLocaleString();
    console.error(`[${timestamp}] ❌ Erro ao gerar token de impersonation:`, erro);
    const statusCode = (erro as Error).message?.includes('não encontrado') ? 404 : 500;
    res.status(statusCode).json(UtilitarioResposta.erro(
      (erro as Error).message || 'Erro ao gerar token de impersonation'
    ));
  }
};

// Exportação padrão para compatibilidade com CommonJS
export default {
  registrar,
  loginUnificado,
  obterMeuPerfil,
  impersonarUsuario
};
