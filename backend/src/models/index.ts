/**
 * Arquivo de índice TEMPORÁRIO para modelos - SEM RELACIONAMENTOS
 * 
 * Este arquivo centraliza a exportação de todos os modelos
 * sem relacionamentos para debug de criação de tabelas.
 */

// Modelos TypeScript migrados
import Aluno from './aluno';
import Plano from './plano';
import Sprint from './sprint';
import Usuario from './usuario';
import Ranking from './ranking';

// Importações dos modelos JavaScript (ainda não migrados)
import Disciplina from './disciplina';
import Assunto from './assunto';
import Meta from './meta';
import AlunoPlano from './alunoPlano';
import AlunoInfo from './alunoInfo';
import SprintAtual from './sprintAtual';
import GrupoUsuario from './grupoUsuario';
import Administrador from './administrador';
import AdministradorInfo from './administradorInfo';

// Modelos Mestre (Templates) - migrados para TypeScript
import PlanoMestre from './planoMestre';
import SprintMestre from './sprintMestre';
import MetaMestre from './metaMestre';

console.log('⚠️ USANDO ARQUIVO TEMPORÁRIO SEM RELACIONAMENTOS PARA DEBUG');

export {
  // Modelos TypeScript
  Plano,
  Sprint,
  Aluno,
  Usuario,
  Ranking,
  
  // Modelos JavaScript (ainda não migrados)
  Disciplina,
  Assunto,
  Meta,
  AlunoPlano,
  SprintAtual,
  GrupoUsuario,
  AlunoInfo,
  Administrador,
  AdministradorInfo,
  
  // Modelos Mestre
  PlanoMestre,
  SprintMestre,
  MetaMestre
};

// Exportação padrão para compatibilidade com CommonJS
export default {
  // Modelos TypeScript
  Plano,
  Sprint,
  Aluno,
  Usuario,
  Ranking,
  
  // Modelos JavaScript
  Disciplina,
  Assunto,
  Meta,
  AlunoPlano,
  SprintAtual,
  GrupoUsuario,
  AlunoInfo,
  Administrador,
  AdministradorInfo,
  
  // Modelos Mestre
  PlanoMestre,
  SprintMestre,
  MetaMestre
};
