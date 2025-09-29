/**
 * Middleware de Verificação de Permissões
 *
 * Este middleware verifica se o usuário possui as permissões necessárias
 * para acessar um recurso específico.
 * 
 * Facilita a transição para um sistema baseado em SSO como Keycloak no futuro.
 */

import { Response, NextFunction } from 'express';
import { RequestComAutenticacao } from '../types/requestResponse';
import { TipoUsuario } from '../types/interfaces';

/**
 * Cria um middleware que verifica se o usuário tem a permissão especificada
 * 
 * @param permissoesRequeridas - Permissão ou array de permissões necessárias
 * @returns Middleware de verificação de permissão
 */
export const verificarPermissao = (permissoesRequeridas: string | string[] | null) => {
  return (req: RequestComAutenticacao, res: Response, next: NextFunction): void => {
    console.log('🔒 Verificando permissões...');
    
    // Se não há permissões requeridas, segue adiante
    if (!permissoesRequeridas) {
      console.log('✅ Nenhuma permissão específica necessária');
      next();
      return;
    }
    
    // Se o usuário não está autenticado (sem permissões definidas)
    if (!req.permissions) {
      console.log('❌ Usuário sem permissões definidas');
      res.status(403).json({
        success: false,
        message: 'Você não tem permissão para acessar este recurso'
      });
      return;
    }
    
    // Converte para array caso seja uma única permissão
    const permissoes = Array.isArray(permissoesRequeridas) 
      ? permissoesRequeridas 
      : [permissoesRequeridas];
    
    // Verifica se o usuário tem permissão de "super usuário"
    if (req.permissions.includes('read:all') || req.permissions.includes('write:all')) {
      console.log('✅ Usuário com permissão de super usuário - acesso liberado');
      next();
      return;
    }
    
    // Verifica se o usuário tem pelo menos uma das permissões requeridas
    const temPermissao = permissoes.some(permissao => 
      req.permissions?.includes(permissao)
    );
    
    if (temPermissao) {
      console.log('✅ Usuário possui as permissões necessárias:', permissoes);
      next();
      return;
    }
    
    console.log('❌ Usuário não possui as permissões necessárias:', permissoes);
    res.status(403).json({
      success: false,
      message: 'Você não tem permissão para acessar este recurso'
    });
  };
};

/**
 * Middleware para restringir acesso apenas a administradores
 */
export const apenasAdministrador = (req: RequestComAutenticacao, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== TipoUsuario.ADMINISTRADOR) {
    res.status(403).json({
      success: false,
      message: 'Acesso restrito a administradores'
    });
    return;
  }
  next();
};

/**
 * Middleware para restringir acesso apenas a alunos
 */
export const apenasAluno = (req: RequestComAutenticacao, res: Response, next: NextFunction): void => {
  if (req.user?.role !== TipoUsuario.ALUNO) {
    res.status(403).json({
      success: false,
      message: 'Acesso restrito a alunos'
    });
    return;
  }
  next();
};

/**
 * Middleware para restringir acesso ao perfil do próprio usuário
 * Útil para impedir que um aluno acesse dados de outro aluno
 */
export const apenasPerfilProprio = (nomeParametro: string = 'id') => {
  return (req: RequestComAutenticacao, res: Response, next: NextFunction): void => {
    const idParametro = parseInt(req.params[nomeParametro] || '0');
    const idUsuario = req.user?.id;

    // Se for admin, permite o acesso
    if (req.user?.role === TipoUsuario.ADMINISTRADOR) {
      next();
      return;
    }

    // Se não for admin, verifica se é o próprio perfil
    if (!idUsuario || idParametro !== idUsuario) {
      res.status(403).json({
        success: false,
        message: 'Você só pode acessar seu próprio perfil'
      });
      return;
    }
    next();
  };
};

/**
 * Middleware para permitir acesso ao próprio perfil OU a administradores
 * Útil para permitir que admins gerenciem perfis de outros usuários
 */
export const perfilProprioOuAdministrador = (nomeParametro: string = 'id') => {
  return (req: RequestComAutenticacao, res: Response, next: NextFunction): void => {
    const idParametro = parseInt(req.params[nomeParametro] || '0');
    const idUsuario = req.user?.id;
    
    // Permite se for admin
    if (req.user?.role === TipoUsuario.ADMINISTRADOR) {
      next();
      return;
    }
    
    // Permite se for o próprio perfil
    if (idUsuario && idParametro === idUsuario) {
      next();
      return;
    }
    
    res.status(403).json({
      success: false,
      message: 'Você só pode acessar seu próprio perfil ou ser administrador para esta ação'
    });
  };
};

/**
 * Middleware para verificar se o usuário tem permissão para acessar recursos de um plano específico
 */
export const verificarAcessoPlano = (nomeParametro: string = 'planoId') => {
  return (req: RequestComAutenticacao, res: Response, next: NextFunction): void => {
    const idPlano = parseInt(req.params[nomeParametro] || '0');
    
    // Administradores têm acesso a todos os planos
    if (req.user?.role === TipoUsuario.ADMINISTRADOR) {
      next();
      return;
    }
    
    // Alunos só podem acessar seus próprios planos
    // TODO: Implementar verificação de associação aluno-plano
    // Por enquanto, permite acesso (será implementado quando migrarmos os controllers)
    console.log('⚠️ Verificação de acesso ao plano não implementada completamente');
    next();
  };
};

/**
 * Middleware para verificar se o usuário tem permissão para acessar recursos de uma sprint específica
 */
export const verificarAcessoSprint = (nomeParametro: string = 'sprintId') => {
  return (req: RequestComAutenticacao, res: Response, next: NextFunction): void => {
    const idSprint = parseInt(req.params[nomeParametro] || '0');
    
    // Administradores têm acesso a todas as sprints
    if (req.user?.role === TipoUsuario.ADMINISTRADOR) {
      next();
      return;
    }
    
    // Alunos só podem acessar sprints de seus próprios planos
    // TODO: Implementar verificação de associação aluno-plano-sprint
    // Por enquanto, permite acesso (será implementado quando migrarmos os controllers)
    console.log('⚠️ Verificação de acesso à sprint não implementada completamente');
    next();
  };
};

// Exportação padrão para compatibilidade com CommonJS
export default {
  verificarPermissao,
  apenasAdministrador,
  apenasAluno,
  apenasPerfilProprio,
  perfilProprioOuAdministrador,
  verificarAcessoPlano,
  verificarAcessoSprint
};
