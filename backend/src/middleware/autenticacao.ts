/**
 * Middleware de Autenticação
 * 
 * Verifica se o usuário está autenticado através do token JWT.
 * Este middleware é aplicado às rotas protegidas.
 * Suporta autenticação de administradores e alunos.
 * 
 * Projetado para ser compatível com futura integração SSO (Keycloak).
 */

import * as jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { TokenJWT, TipoUsuario } from '../types/interfaces';

// Interface local para Request com autenticação
interface RequestComAutenticacao extends Request {
  user?: {
    id: number;
    role: TipoUsuario;
    permissions: string[];
    isImpersonating?: boolean;
    originalId?: number;
    originalRole?: TipoUsuario;
  };
  permissions?: string[];
}

// Mapeamento de roles para permissões
const permissoesPorRole: Record<TipoUsuario, string[]> = {
  [TipoUsuario.ADMINISTRADOR]: ['administrador', 'read:all', 'write:all'],
  [TipoUsuario.ALUNO]: ['aluno', 'read:own_profile', 'write:own_profile']
};

/**
 * Middleware principal de autenticação
 * Verifica o token JWT e adiciona informações do usuário à requisição
 */
export const autenticacao = async (req: RequestComAutenticacao, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('🔐 Middleware de autenticação iniciado');
    console.log('🔄 Método da requisição:', req.method);
    console.log('🌐 URL da requisição:', req.originalUrl);

    // Verifica se o token foi fornecido
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      res.status(401).json({ 
        success: false, 
        message: 'Token não fornecido' 
      });
      return;
    }

    // Verifica e decodifica o token
    const tokenDecodificado = jwt.verify(token, process.env.JWT_SECRET as string) as TokenJWT;
    
    // Informações básicas do usuário
    const informacoesUsuario: {
      id: number;
      role: TipoUsuario;
      permissions: string[];
      isImpersonating?: boolean;
      originalId?: number;
      originalRole?: TipoUsuario;
    } = {
      id: tokenDecodificado.IdUsuario || tokenDecodificado.id || 0, // Compatibilidade com ambos os formatos
      role: tokenDecodificado.role,
      permissions: []
    };

    // Se houver impersonation, adiciona as informações originais
    if (tokenDecodificado['sis-mentoria']?.impersonating) {
      informacoesUsuario.isImpersonating = true;
      informacoesUsuario.originalId = tokenDecodificado['sis-mentoria'].impersonating.originalId;
      informacoesUsuario.originalRole = tokenDecodificado['sis-mentoria'].impersonating.originalRole;
    }

    // Adiciona as permissões baseadas no role do usuário
    const role = informacoesUsuario.isImpersonating ? informacoesUsuario.originalRole : informacoesUsuario.role;
    informacoesUsuario.permissions = permissoesPorRole[role as keyof typeof permissoesPorRole] || [];

    // Adiciona as informações do usuário à requisição
    req.user = informacoesUsuario;
    req.permissions = informacoesUsuario.permissions;

    // Log das informações do usuário (útil para debug)
    console.log('👤 Informações do usuário:', {
      ...informacoesUsuario,
      permissions: req.permissions,
      url: req.originalUrl,
      method: req.method
    });

    next();
  } catch (erro) {
    console.error('❌ Erro no middleware de autenticação:', erro);
    res.status(401).json({ 
      success: false, 
      message: 'Token inválido ou expirado' 
    });
  }
};

/**
 * Middleware para verificar se o usuário é administrador
 */
export const apenasAdministrador = async (req: RequestComAutenticacao, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Se estiver impersonating, usa o papel original
    const role = req.user?.isImpersonating ? req.user.originalRole : req.user?.role;
    
    if (role !== TipoUsuario.ADMINISTRADOR) {
      res.status(403).json({ 
        success: false, 
        message: 'Acesso permitido apenas para administradores' 
      });
      return;
    }
    next();
  } catch (erro) {
    console.error('Erro ao verificar permissão de administrador:', erro);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao verificar permissões' 
    });
  }
};

/**
 * Middleware para verificar se o usuário é o dono do recurso ou um administrador
 * @param nomeParametroId - Nome do parâmetro que contém o ID do recurso
 */
export const perfilProprioOuAdministrador = (nomeParametroId: string) => {
  return async (req: RequestComAutenticacao, res: Response, next: NextFunction): Promise<void> => {
    try {
      const idRecurso = req.params[nomeParametroId];
      const idUsuario = req.user?.id;
      const role = req.user?.isImpersonating ? req.user.originalRole : req.user?.role;

      if (role === TipoUsuario.ADMINISTRADOR || idUsuario === parseInt(idRecurso || '0')) {
        next();
        return;
      }

      res.status(403).json({ 
        success: false, 
        message: 'Acesso não autorizado a este recurso' 
      });
    } catch (erro) {
      console.error('Erro ao verificar permissão de acesso:', erro);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao verificar permissões' 
      });
    }
  };
};

// Exportação padrão para compatibilidade com CommonJS
export default {
  autenticacao,
  apenasAdministrador,
  perfilProprioOuAdministrador
};
