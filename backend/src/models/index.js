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
const Plano = require('./Plano');
const Disciplina = require('./Disciplina');
const Assunto = require('./Assunto');
const Aluno = require('./Aluno');
const Sprint = require('./Sprint');
const Meta = require('./Meta');
const AlunoPlano = require('./AlunoPlano');
const SprintAtual = require('./SprintAtual');
const Usuario = require('./Usuario');
const GrupoUsuario = require('./GrupoUsuario');
const AlunoInfo = require('./AlunoInfo');
const AdministradorInfo = require('./AdministradorInfo');

// Modelos Mestre (Templates)
const PlanoMestre = require('./PlanoMestre');
const SprintMestre = require('./SprintMestre');
const MetaMestre = require('./MetaMestre');

// Importar os modelos do Asaas
const AsaasCliente = require('./AsaasCliente');
const AsaasPagamento = require('./AsaasPagamento');
const AsaasWebhookLog = require('./AsaasWebhookLog');

// Importar Op do Sequelize para operadores
const { Op } = require('sequelize');

// Garante que os relacionamentos são estabelecidos
console.log('Configurando relacionamentos entre modelos...');

// Relacionamento Plano -> Disciplina
console.log('Configurando relacionamento Plano -> Disciplina');
Plano.belongsToMany(Disciplina, { 
  through: 'PlanoDisciplina',
  as: 'disciplinas'
});
Disciplina.belongsToMany(Plano, { 
  through: 'PlanoDisciplina',
  as: 'planos'
});

// Relacionamento Disciplina -> Assunto
console.log('Configurando relacionamento Disciplina -> Assunto');
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

// Definir as associações do Asaas
AsaasCliente.belongsTo(Usuario, { foreignKey: 'idusuario' });

// Relacionamento AsaasPagamento -> AsaasCliente (PK → PK)
AsaasPagamento.belongsTo(AsaasCliente, {
    foreignKey: 'idasaascliente',
    targetKey: 'idasaascliente',
    as: 'cliente'
});

// 🔮 FUTURE: Relacionamento inverso será implementado após feature do mentor
// AsaasCliente.hasMany(AsaasPagamento, {
//     foreignKey: 'idasaascliente',
//     as: 'pagamentos'
// });

AsaasWebhookLog.belongsTo(AsaasPagamento, { foreignKey: 'idasaaspagamento' });

// Exporte os modelos
module.exports = {
  Plano,
  Disciplina,
  Assunto,
  Aluno,
  Sprint,
  Meta,
  AlunoPlano,
  SprintAtual,
  Usuario,
  GrupoUsuario,
  AlunoInfo,
  AdministradorInfo,
  
  // Modelos Mestre
  PlanoMestre,
  SprintMestre,
  MetaMestre,
  AsaasCliente,
  AsaasPagamento,
  AsaasWebhookLog,
  
  // Operadores Sequelize
  Op
}; 