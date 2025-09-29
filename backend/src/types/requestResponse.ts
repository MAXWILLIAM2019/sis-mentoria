/**
 * Tipos para Request e Response em português
 * 
 * Este arquivo centraliza todas as interfaces relacionadas a
 * requisições HTTP e respostas da API, seguindo as convenções
 * de nomenclatura do projeto.
 */

import { Request, Response } from 'express';
import { TipoUsuario, StatusSprint } from './interfaces';

// ============================================================================
// INTERFACES DE REQUEST ESTENDIDAS
// ============================================================================

/**
 * Interface base para Request com autenticação
 */
export interface RequestComAutenticacao extends Request {
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

/**
 * Interface para request de criação de usuário
 */
export interface RequestCriarUsuario extends Request {
  body: {
    nome: string;
    cpf: string;
    login: string;
    senha: string;
    grupo: number;
  };
}

/**
 * Interface para request de login
 */
export interface RequestLogin extends Request {
  body: {
    login: string;
    senha: string;
    grupo?: string;
  };
}

/**
 * Interface para request de atualização de perfil
 */
export interface RequestAtualizarPerfil extends Request {
  params: {
    id: string;
  };
  body: {
    nome?: string;
    email?: string;
    senha?: string;
  };
}

/**
 * Interface para request de ranking
 */
export interface RequestRanking extends Request {
  query: {
    pagina?: string;
    limite?: string;
    semana?: string;
  };
  user: {
    id: number;
  };
}

/**
 * Interface para request de plano
 */
export interface RequestPlano extends Request {
  params: {
    id?: string;
  };
  body: {
    nome?: string;
    cargo?: string;
    descricao?: string;
    duracao?: number;
    plano_mestre_id?: number;
    disciplinas?: any[];
  };
}

/**
 * Interface para request de sprint
 */
export interface RequestSprint extends Request {
  params: {
    id?: string;
    planoId?: string;
  };
  body: {
    nome?: string;
    dataInicio?: string;
    dataFim?: string;
    status?: StatusSprint;
    posicao?: number;
    planoId?: number;
    metas?: any[];
    disciplina?: string;
    tipo?: string;
    titulo?: string;
    comandos?: string;
    link?: string;
    relevancia?: string;
    tempoEstudado?: string;
    desempenho?: number;
    totalQuestoes?: number;
    questoesCorretas?: number;
    ordemSprints?: number[];
  };
}

/**
 * Interface para request de meta
 */
export interface RequestMeta extends Request {
  params: {
    id?: string;
    sprintId?: string;
  };
  body: {
    disciplina?: string;
    tipo?: string;
    titulo?: string;
    comandos?: string;
    link?: string;
    relevancia?: string;
    sprintId?: number;
    ordemMetas?: number[];
  };
}

/**
 * Interface para request de disciplina
 */
export interface RequestDisciplina extends Request {
  params: {
    id?: string;
    id1?: string;
    id2?: string;
  };
  body: {
    nome?: string;
    descricao?: string;
    ativa?: boolean;
    assuntos?: Array<{
      nome: string;
    }>;
    copiarAssuntos?: boolean;
  };
}

/**
 * Interface para request de sprint atual
 */
export interface RequestSprintAtual extends Request {
  params: {
    id?: string;
  };
  body: {
    sprintId?: number;
  };
  user: {
    id: number;
    aluno?: {
      id: number;
    };
  };
}

/**
 * Interface para request de aluno plano
 */
export interface RequestAlunoPlano extends Request {
  params: {
    id?: string;
    alunoId?: string;
    planoId?: string;
  };
  body: {
    idusuario?: number;
    PlanoId?: number;
    dataInicio?: string;
    dataPrevisaoTermino?: string;
    status?: string;
    observacoes?: string;
    progresso?: number;
    dataConclusao?: string;
  };
  user: {
    id: number;
  };
}

/**
 * Interface para request de plano mestre
 */
export interface RequestPlanoMestre extends Request {
  params: {
    id?: string;
  };
  body: {
    nome?: string;
    cargo?: string;
    descricao?: string;
    duracao?: number;
    versao?: string;
    planoMestreId?: number;
    idUsuario?: number;
    dataInicio?: string;
    status?: string;
    observacoes?: string;
  };
}


/**
 * Interface para request de aluno
 */
export interface RequestAluno extends Request {
  params: {
    id?: string;
  };
  body: {
    nome?: string;
    email?: string;
    cpf?: string;
    senha?: string;
    telefone?: string;
    biografia?: string;
    formacao?: string;
    isTrabalhando?: boolean;
    isAceitaTermos?: boolean;
    notificacoes?: {
      novidadesPlataforma?: boolean;
      mensagensMentor?: boolean;
      novoMaterial?: boolean;
      atividadesSimulados?: boolean;
      mentorias?: boolean;
    };
  };
}

// ============================================================================
// INTERFACES DE RESPONSE PADRONIZADAS
// ============================================================================

/**
 * Interface para resposta de sucesso genérica
 */
export interface RespostaSucesso<T = any> {
  success: true;
  message: string;
  data?: T;
  paginacao?: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
}

/**
 * Interface para resposta de erro
 */
export interface RespostaErro {
  success: false;
  message: string;
  error?: string;
  detalhes?: any;
}

/**
 * Interface para resposta de validação
 */
export interface RespostaValidacao {
  success: false;
  message: string;
  erros: Array<{
    campo: string;
    mensagem: string;
  }>;
}

/**
 * Interface para resposta de autenticação
 */
export interface RespostaAutenticacaoSucesso {
  success: true;
  message: string;
  data: {
    token: string;
    usuario: {
      id: number;
      nome: string;
      email: string;
      role: TipoUsuario;
    };
  };
}

/**
 * Interface para resposta de ranking
 */
export interface RespostaRanking {
  success: true;
  message: string;
  data: {
    ranking: Array<{
      posicao: number;
      nome: string;
      pontuacao: number;
      totalQuestoes: number;
    }>;
    meuRanking?: {
      posicao: number;
      nome: string;
      pontuacao: number;
      totalQuestoes: number;
    } | null;
    tempoRestante?: {
      days: number;
      hours: number;
      minutes: number;
      seconds: number;
    };
  };
}

/**
 * Interface para resposta de lista paginada
 */
export interface RespostaListaPaginada<T> {
  success: true;
  message: string;
  data: T[];
  paginacao: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
}

// ============================================================================
// TIPOS AUXILIARES PARA RESPONSE
// ============================================================================

/**
 * Tipo união para todas as respostas possíveis
 */
export type RespostaApi<T = any> = RespostaSucesso<T> | RespostaErro | RespostaValidacao;

/**
 * Tipo para resposta de lista com paginação
 */
export type RespostaLista<T> = RespostaListaPaginada<T> | RespostaErro;

/**
 * Tipo para resposta de item único
 */
export type RespostaItem<T> = RespostaSucesso<T> | RespostaErro;

// ============================================================================
// UTILITÁRIOS PARA RESPONSE
// ============================================================================

/**
 * Classe utilitária para criar respostas padronizadas
 */
export class UtilitarioResposta {
  /**
   * Cria uma resposta de sucesso
   */
  static sucesso<T>(message: string, data?: T, paginacao?: RespostaSucesso<T>['paginacao']): RespostaSucesso<T> {
    const response: RespostaSucesso<T> = {
      success: true,
      message
    };
    
    if (data !== undefined) {
      response.data = data;
    }
    
    if (paginacao !== undefined) {
      response.paginacao = paginacao;
    }
    
    return response;
  }

  /**
   * Cria uma resposta de erro
   */
  static erro(message: string, error?: string, detalhes?: any): RespostaErro {
    const response: RespostaErro = {
      success: false,
      message
    };
    
    if (error !== undefined) {
      response.error = error;
    }
    
    if (detalhes !== undefined) {
      response.detalhes = detalhes;
    }
    
    return response;
  }

  /**
   * Cria uma resposta de validação
   */
  static validacao(message: string, erros: Array<{ campo: string; mensagem: string }>): RespostaValidacao {
    return {
      success: false,
      message,
      erros
    };
  }

  /**
   * Cria uma resposta de autenticação
   */
  static autenticacao(message: string, token: string, usuario: RespostaAutenticacaoSucesso['data']['usuario']): RespostaAutenticacaoSucesso {
    return {
      success: true,
      message,
      data: {
        token,
        usuario
      }
    };
  }

  /**
   * Cria uma resposta de ranking
   */
  static ranking(message: string, dados: RespostaRanking['data']): RespostaRanking {
    return {
      success: true,
      message,
      data: dados
    };
  }
}
