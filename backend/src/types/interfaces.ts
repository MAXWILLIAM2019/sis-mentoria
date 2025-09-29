/**
 * Interfaces de Dados Principais
 * 
 * Este arquivo contém todas as interfaces TypeScript principais do sistema,
 * seguindo as regras de nomenclatura: interfaces em português.
 * 
 * Organização:
 * - Interfaces de modelos de banco de dados
 * - Interfaces de request/response da API
 * - Interfaces de dados de negócio
 * - Enums e tipos auxiliares
 */

// ============================================================================
// INTERFACES DE MODELOS DE BANCO DE DADOS
// ============================================================================

/**
 * Interface para dados de usuário
 */
export interface Usuario {
  IdUsuario: number;
  nome: string;
  cpf: string;
  login: string;
  senha: string | null;
  grupo: number;
  situacao: boolean;
  ultimo_acesso: Date | null;
  data_senha_alterada: Date | null;
  data_senha_expirada: Date | null;
  login_secundario: string | null;
}

/**
 * Interface para dados de aluno
 */
export interface Aluno {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  senha: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para dados de plano
 */
export interface Plano {
  id: number;
  nome: string;
  cargo: string;
  descricao: string;
  duracao: number;
  plano_mestre_id: number | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para dados de sprint
 */
export interface Sprint {
  id: number;
  nome: string;
  dataInicio: Date;
  dataFim: Date;
  status: StatusSprint;
  posicao: number;
  sprint_mestre_id: number | null;
  PlanoId: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para dados de ranking
 */
export interface RankingData {
  id_ranking: number;
  id_usuario: number;
  nome_usuario: string;
  email_usuario: string;
  total_questoes: number;
  total_acertos: number;
  percentual_acerto: number;
  pontuacao_final: number;
  posicao: number;
  semana_inicio: Date;
  semana_fim: Date;
}

// ============================================================================
// ENUMS E TIPOS AUXILIARES
// ============================================================================

/**
 * Enum para status de sprint
 */
export enum StatusSprint {
  PENDENTE = 'Pendente',
  EM_ANDAMENTO = 'Em Andamento',
  CONCLUIDA = 'Concluída'
}

/**
 * Enum para tipos de usuário
 */
export enum TipoUsuario {
  ADMINISTRADOR = 'administrador',
  ALUNO = 'aluno'
}

/**
 * Enum para status de plano
 */
export enum StatusPlano {
  NAO_INICIADO = 'não iniciado',
  EM_ANDAMENTO = 'em andamento',
  CONCLUIDO = 'concluído',
  CANCELADO = 'cancelado'
}

// ============================================================================
// INTERFACES DE REQUEST/RESPONSE DA API
// ============================================================================

/**
 * Interface para resposta padrão da API
 */
export interface RespostaApi<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

/**
 * Interface para dados de autenticação
 */
export interface DadosAutenticacao {
  login: string;
  senha: string;
}

/**
 * Interface para resposta de autenticação
 */
export interface RespostaAutenticacao {
  token: string;
  usuario: Usuario;
  tipo: TipoUsuario;
}

/**
 * Interface para dados de criação de usuário
 */
export interface DadosCriacaoUsuario {
  nome: string;
  cpf: string;
  login: string;
  senha: string;
  grupo: number;
}

/**
 * Interface para dados de criação de aluno
 */
export interface DadosCriacaoAluno {
  nome: string;
  email: string;
  cpf: string;
  senha?: string;
}

/**
 * Interface para dados de criação de plano
 */
export interface DadosCriacaoPlano {
  nome: string;
  cargo: string;
  descricao: string;
  duracao: number;
  plano_mestre_id?: number;
}

/**
 * Interface para dados de criação de sprint
 */
export interface DadosCriacaoSprint {
  nome: string;
  dataInicio: Date;
  dataFim: Date;
  posicao: number;
  sprint_mestre_id?: number;
  PlanoId: number;
}

// ============================================================================
// INTERFACES DE DADOS DE NEGÓCIO
// ============================================================================

/**
 * Interface para dados de ranking formatados
 */
export interface RankingFormatado {
  top3: Array<{
    posicao: number;
    nome: string;
    pontuacao: number;
    totalQuestions: number;
  }>;
  list: Array<{
    posicao: number;
    nome: string;
    pontuacao: number;
    totalQuestions: number;
  }>;
  meuRanking: {
    posicao: number | null;
    nome: string;
    pontuacao: number;
    totalQuestions: number;
  } | null;
  tempoRestante: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
}

/**
 * Interface para dados de progresso do aluno
 */
export interface ProgressoAluno {
  alunoId: number;
  planoId: number;
  sprintAtual: number;
  totalSprints: number;
  percentualConcluido: number;
  metasCompletadas: number;
  totalMetas: number;
}

/**
 * Interface para dados de estatísticas
 */
export interface Estatisticas {
  totalAlunos: number;
  totalPlanos: number;
  totalSprints: number;
  alunosAtivos: number;
  planosAtivos: number;
}

// ============================================================================
// INTERFACES DE CONFIGURAÇÃO
// ============================================================================

/**
 * Interface para configuração do banco de dados
 */
export interface ConfiguracaoBanco {
  database: string;
  username: string;
  password: string;
  host: string;
  port: number;
  dialect: string;
}

/**
 * Interface para configuração JWT
 */
export interface ConfiguracaoJWT {
  secret: string;
  expiresIn: string;
}

// ============================================================================
// RE-EXPORTS DE TIPOS DE REQUEST/RESPONSE
// ============================================================================

// Re-exporta todos os tipos de request/response do arquivo dedicado
export * from './requestResponse';

/**
 * Interface para dados de token JWT
 */
export interface TokenJWT {
  IdUsuario: number;
  id?: number; // Compatibilidade com diferentes formatos
  role: TipoUsuario;
  iat: number;
  exp: number;
  'sis-mentoria'?: {
    impersonating?: {
      originalId: number;
      originalRole: TipoUsuario;
    };
  };
}
