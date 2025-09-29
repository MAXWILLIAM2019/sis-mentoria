/**
 * Arquivo de índice para modelos
 * 
 * Este arquivo centraliza a exportação de todos os modelos
 * e estabelece os relacionamentos da nova arquitetura de templates.
 * 
 * Arquitetura:
 * 1. Templates (Modelos Mestre):
 *    - PlanoMestre -> SprintMestre -> MetaMestre
 *    - Servem como base para criar instâncias personalizadas
 * 
 * 2. Instâncias:
 *    - Plano -> Sprint -> Meta
 *    - Cada instância mantém referência ao seu template
 *    - Permite customização individual sem afetar o template
 * 
 * 3. Disciplinas e Assuntos:
 *    - Vinculados diretamente às metas
 *    - Não seguem o padrão de templates
 *    - Suporte para importação via planilha
 */

// Importações dos modelos TypeScript
import Plano from './plano';
import Aluno from './aluno';
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

// Garante que os relacionamentos são estabelecidos
console.log('Configurando relacionamentos entre modelos...');
console.log('⚠️ TODOS OS RELACIONAMENTOS TEMPORARIAMENTE DESABILITADOS PARA DEBUG');

/*
// Relacionamento Plano -> Disciplina
console.log('Configurando relacionamento Plano -> Disciplina');
Disciplina.hasMany(Assunto, { 
  onDelete: 'CASCADE',
  foreignKey: 'disciplinaId',
  as: 'assuntos'
});
Assunto.belongsTo(Disciplina, { 
  foreignKey: 'disciplinaId'
});

// Relacionamento Plano -> Sprint
console.log('Configurando relacionamento Plano -> Sprint');
Plano.hasMany(Sprint, {
  onDelete: 'SET NULL',
  as: 'sprints'
});
Sprint.belongsTo(Plano, {
  foreignKey: 'PlanoId'
});

// Relacionamento Sprint -> Meta
console.log('Configurando relacionamento Sprint -> Meta');
Sprint.hasMany(Meta, {
  onDelete: 'CASCADE',
  as: 'metas'
});
Meta.belongsTo(Sprint);

// Relacionamento Aluno -> Plano (via AlunoPlano)
console.log('Configurando relacionamento Aluno -> Plano');
// Aluno.belongsToMany(Plano, { through: AlunoPlano, as: 'planos' });
// Plano.belongsToMany(Aluno, { through: AlunoPlano, as: 'alunos' });

// Relacionamento Aluno -> SprintAtual
console.log('Configurando relacionamento Aluno -> SprintAtual');
// Aluno.hasOne(SprintAtual, { foreignKey: 'AlunoId' });
// SprintAtual.belongsTo(Aluno, { foreignKey: 'AlunoId' });

// Relacionamento Sprint -> SprintAtual
console.log('Configurando relacionamento Sprint -> SprintAtual');
Sprint.hasOne(SprintAtual, { foreignKey: 'SprintId' });
SprintAtual.belongsTo(Sprint, { foreignKey: 'SprintId' });

// Relacionamento Usuario -> GrupoUsuario
console.log('Configurando relacionamento Usuario -> GrupoUsuario');
Usuario.belongsTo(GrupoUsuario, { foreignKey: 'grupo', as: 'grupoUsuario' });
GrupoUsuario.hasMany(Usuario, { foreignKey: 'grupo', as: 'usuarios' });

// Relacionamento Usuario -> AlunoInfo (1:1)
console.log('Configurando relacionamento Usuario -> AlunoInfo');
Usuario.hasOne(AlunoInfo, { foreignKey: 'IdUsuario', as: 'alunoInfo' });
AlunoInfo.belongsTo(Usuario, { foreignKey: 'IdUsuario', as: 'usuario' });

// Relacionamento Usuario -> AdministradorInfo (1:1)
console.log('Configurando relacionamento Usuario -> AdministradorInfo');
Usuario.hasOne(AdministradorInfo, { foreignKey: 'IdUsuario', as: 'adminInfo' });
AdministradorInfo.belongsTo(Usuario, { foreignKey: 'IdUsuario', as: 'usuario' });

// Relacionamentos dos Modelos Mestre
console.log('Configurando relacionamentos dos modelos mestre...');

// PlanoMestre -> SprintMestre
PlanoMestre.hasMany(SprintMestre, {
  foreignKey: 'PlanoMestreId',
  as: 'sprintsMestre',
  onDelete: 'CASCADE'
});
SprintMestre.belongsTo(PlanoMestre, {
  foreignKey: 'PlanoMestreId',
  as: 'planoMestre'
});

// SprintMestre -> MetaMestre
SprintMestre.hasMany(MetaMestre, {
  foreignKey: 'SprintMestreId',
  as: 'metasMestre',
  onDelete: 'CASCADE'
});
MetaMestre.belongsTo(SprintMestre, {
  foreignKey: 'SprintMestreId',
  as: 'sprintMestre'
});

// Relacionamentos de referência: PlanoMestre -> Planos (instâncias)
PlanoMestre.hasMany(Plano, {
  foreignKey: 'plano_mestre_id',
  as: 'instancias'
});
Plano.belongsTo(PlanoMestre, {
  foreignKey: 'plano_mestre_id',
  as: 'planoMestre'
});

console.log('Relacionamentos configurados com sucesso!');

// Exporte os modelos
export {
  // Modelos TypeScript
  Plano,
  Aluno,
  Sprint,
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
  Aluno,
  Sprint,
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
  AdministradorInfo,
  
  // Modelos Mestre
  PlanoMestre,
  SprintMestre,
  MetaMestre
};

