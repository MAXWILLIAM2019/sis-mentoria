import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';

/**
 * Modelo Sprint
 * Representa uma sprint de estudos com suas metas
 * 
 * Campos:
 * - nome: Nome da sprint (ex: "Sprint 19")
 * - dataInicio: Data de início da sprint
 * - dataFim: Data de término da sprint
 * - PlanoId: ID do plano associado a esta sprint
 * - status: Status atual da sprint (Pendente, Em Andamento, Concluída)
 * - posicao: Posição da sprint na sequência do plano (para ordenação)
 * 
 * Restrições:
 * - Não pode existir duas sprints com a mesma posição no mesmo plano (restrição de unicidade composta)
 * - Cada sprint deve estar associada a um plano (chave estrangeira)
 * 
 * Relacionamentos:
 * - hasMany Meta: Uma sprint pode ter várias metas
 * - belongsTo Plano: Uma sprint pertence a um plano
 * 
 * Nota: Atualmente, cada sprint está associada a um único plano.
 * Futuramente, pode ser necessário implementar uma relação muitos-para-muitos,
 * onde uma sprint poderá estar associada a múltiplos planos.
 */

/**
 * Enum para os status possíveis da sprint
 * Seguindo as regras de nomenclatura: em português
 */
export enum StatusSprint {
  PENDENTE = 'Pendente',
  EM_ANDAMENTO = 'Em Andamento',
  CONCLUIDA = 'Concluída'
}

/**
 * Interface para definir os atributos do modelo Sprint
 * Seguindo as regras de nomenclatura: interfaces em português
 */
interface AtributosSprint {
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
 * Interface para atributos opcionais durante criação
 * Permite criar sprint sem campos que são gerados automaticamente
 */
interface AtributosCriacaoSprint extends Optional<AtributosSprint, 'id' | 'sprint_mestre_id' | 'PlanoId' | 'createdAt' | 'updatedAt'> {}

/**
 * Classe do modelo Sprint estendendo Model do Sequelize
 * Seguindo as regras de nomenclatura: classes em português
 */
class Sprint extends Model<AtributosSprint, AtributosCriacaoSprint> implements AtributosSprint {
  // Propriedades obrigatórias
  public id!: number;
  public nome!: string;
  public dataInicio!: Date;
  public dataFim!: Date;
  public status!: StatusSprint;
  public posicao!: number;
  public sprint_mestre_id!: number | null;
  public PlanoId!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

/**
 * Inicialização do modelo Sprint
 * Configuração das colunas e opções da tabela
 */
Sprint.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dataInicio: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  dataFim: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Pendente', 'Em Andamento', 'Concluída'),
    defaultValue: 'Pendente',
    allowNull: false
  },
  posicao: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  sprint_mestre_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'sprint_mestres',
      key: 'id'
    },
    comment: 'Referência ao sprint mestre que originou esta sprint'
  },
  PlanoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Plano',
      key: 'id'
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'Sprint',
  indexes: [
    {
      unique: true,
      fields: ['PlanoId', 'posicao'],
      name: 'plano_posicao_unique'
    }
  ]
});

export default Sprint;
export { AtributosSprint, AtributosCriacaoSprint };
