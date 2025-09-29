/**
 * Serviço de Autenticação
 * 
 * Esta camada de abstração gerencia a autenticação de usuários
 * independente do provedor (local ou SSO).
 * Futuramente pode ser integrado com Keycloak ou outro provedor SSO.
 */
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Administrador } = require('../models');
const { Op } = require('sequelize');
const { Usuario, GrupoUsuario, AlunoInfo } = require('../models');
const { AdministradorInfo } = require('../models');

/**
 * Configurações de autenticação
 * No futuro, isso poderia vir de variáveis de ambiente ou
 * ser substituído pela configuração do Keycloak
 */
const AUTH_CONFIG = {
  tokenExpiresIn: '24h',
  jwtSecret: process.env.JWT_SECRET,
  // Quando migrar para SSO, adicionar aqui as URLs do servidor de autenticação
  // ssoServerUrl: process.env.SSO_SERVER_URL,
  // ssoRealm: process.env.SSO_REALM,
  // ssoClientId: process.env.SSO_CLIENT_ID,
};

/**
 * Obtém as permissões base para um determinado papel
 * @param {string} role - Papel do usuário
 * @returns {string[]} Array de permissões
 */
const getPermissionsForRole = (role) => {
  const permissions = {
    administrador: [
      'read:all',
      'write:all',
      'impersonate:aluno'
    ],
    aluno: [
      'read:own',
      'write:own'
    ]
  };
  return permissions[role] || [];
};

/**
 * Gera token JWT para um usuário
 * 
 * @param {Object} usuario - Dados do usuário
 * @param {string} role - Papel do usuário no sistema (admin, aluno, mentor, etc)
 * @param {Object} [impersonating] - Dados do usuário sendo impersonado (opcional)
 * @returns {string} Token JWT
 */
const gerarToken = (usuario, role, impersonating = null) => {
  // Dados comuns a todos os tipos de usuário que serão incluídos no token
  const payload = {
    id: usuario.id || usuario.IdUsuario,
    email: usuario.email || usuario.login,
    role,
    // Namespace personalizado para dados específicos da aplicação
    'sis-mentoria': {
      role_name: role === 'administrador' ? 'Administrador' : 
                 role === 'aluno' ? 'Aluno' : 'Usuário',
      permissions: getPermissionsForRole(role)
    }
  };
  
  // Adiciona informações de impersonation se necessário
  if (impersonating) {
    payload['sis-mentoria'].impersonating = {
      originalId: impersonating.originalId,
      originalRole: impersonating.originalRole
    };
    // Atualiza o ID e role no token para refletir o usuário impersonado
    payload.id = usuario.id || usuario.IdUsuario;
    payload.role = role;
    payload.isImpersonating = true;
  }
  
  console.log('Gerando token com payload:', payload);
  
  return jwt.sign(payload, process.env.JWT_SECRET, { 
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

/**
 * Gera um token de impersonation para um administrador acessar como aluno
 * 
 * @param {Object} adminUser - Usuário administrador
 * @param {Object} targetUserId - ID do usuário aluno a ser impersonado
 * @returns {string} Token JWT com informações de impersonation
 * @throws {Error} Se o admin não tiver permissão ou o aluno não existir
 */
const generateImpersonationToken = async (adminUser, targetUserId) => {
  // Verifica se o usuário é um administrador
  const adminGrupo = await GrupoUsuario.findOne({ 
    where: { 
      IdGrupo: adminUser.grupo,
      nome: 'administrador'
    }
  });

  if (!adminGrupo) {
    throw new Error('Apenas administradores podem realizar impersonation');
  }

  // Busca o usuário alvo (aluno)
  const targetUser = await Usuario.findOne({
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

  if (!targetUser) {
    throw new Error('Aluno não encontrado ou inativo');
  }

  // Gera o token com as informações de impersonation
  return gerarToken(adminUser, 'administrador', {
    IdUsuario: targetUser.IdUsuario,
    email: targetUser.alunoInfo?.email || targetUser.login,
    nome: targetUser.nome
  });
};

/**
 * Verifica se um usuário existe e se a senha está correta
 * 
 * @param {string} email - Email do usuário
 * @param {string} senha - Senha em texto puro
 * @param {string} tipo - Tipo de usuário ('admin', 'aluno', etc)
 * @returns {Object|null} Objeto com usuário se autenticado, null caso contrário
 */
const verificarCredenciais = async (email, senha, tipo) => {
  try {
    let usuario;
    
    // Busca o usuário de acordo com seu tipo
    if (tipo === 'admin') {
      usuario = await Administrador.findOne({ where: { email } });
    } else if (tipo === 'aluno') {
      usuario = await Aluno.findOne({ where: { email } });
    } else {
      throw new Error(`Tipo de usuário não suportado: ${tipo}`);
    }
    
    // Verifica se o usuário existe
    if (!usuario) {
      return null;
    }
    
    // Verifica se o usuário tem senha definida
    if (!usuario.senha) {
      return null;
    }
    
    // Verifica se a senha está correta
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return null;
    }
    
    return usuario;
  } catch (error) {
    console.error(`Erro ao verificar credenciais para ${tipo}:`, error);
    throw error;
  }
};

/**
 * Realiza o login de um usuário
 * 
 * @param {Object} credentials - Credenciais do usuário
 * @param {string} tipo - Tipo de usuário ('admin', 'aluno', etc)
 * @returns {Object} Dados do usuário e token
 */
const realizarLogin = async (credentials, tipo) => {
  try {
    const { email, senha } = credentials;
    
    // Verifica as credenciais
    const usuario = await verificarCredenciais(email, senha, tipo);
    
    if (!usuario) {
      throw new Error('Credenciais inválidas');
    }
    
    // Gera o token JWT
    const token = gerarToken(usuario, tipo);
    
    // Remove a senha do objeto de resposta por segurança
    const usuarioSemSenha = usuario.toJSON();
    delete usuarioSemSenha.senha;
    
    return {
      success: true,
      token,
      usuario: usuarioSemSenha,
      tipo
    };
  } catch (error) {
    console.error(`Erro no login de ${tipo}:`, error);
    throw error;
  }
};

/**
 * Verifica se um token é válido e retorna os dados do payload
 * 
 * @param {string} token - Token JWT a ser verificado
 * @returns {Object} Payload do token
 */
const verificarToken = (token) => {
  try {
    return jwt.verify(token, AUTH_CONFIG.jwtSecret);
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    throw error;
  }
};

/**
 * Realiza o login unificado de um usuário
 * @param {Object} credentials - Credenciais do usuário
 * @returns {Object} Dados do usuário e token
 */
const realizarLoginUnificado = async (credentials) => {
  try {
    const { login, senha } = credentials;
    // Busca o usuário pelo login
    const usuario = await Usuario.findOne({
      where: { login, situacao: true },
      include: [
        { model: GrupoUsuario, as: 'grupoUsuario' },
        { model: AlunoInfo, as: 'alunoInfo' },
        { model: AdministradorInfo, as: 'adminInfo' }
      ]
    });
    if (!usuario) {
      throw new Error('Usuário ou senha inválidos');
    }
    // Verifica se a senha está correta
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      throw new Error('Usuário ou senha inválidos');
    }
    // Define o grupo/role
    const grupo = usuario.grupoUsuario?.nome || 'desconhecido';
    // Gera o token JWT
    const token = gerarToken({
      id: usuario.IdUsuario,
      login: usuario.login,
      grupo,
      email: usuario.alunoInfo?.email || usuario.adminInfo?.email || null
    }, grupo);
    // Monta o objeto de resposta (sem senha)
    const usuarioSemSenha = usuario.toJSON();
    delete usuarioSemSenha.senha;
    return {
      success: true,
      token,
      usuario: usuarioSemSenha,
      grupo
    };
  } catch (error) {
    console.error('Erro no login unificado:', error);
    throw error;
  }
};

module.exports = {
  realizarLogin,
  realizarLoginUnificado,
  verificarToken,
  gerarToken,
  getPermissionsForRole,
  generateImpersonationToken,
}; 