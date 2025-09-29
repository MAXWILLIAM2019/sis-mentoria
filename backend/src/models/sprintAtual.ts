import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';

/**
 * Interface para os atributos do SprintAtual
 */
export interface AtributosSprintAtual {
  id: number;
  alunoId: number;
  sprintId: number;
  dataInicio: Date;
  dataFim: Date | null;
  status: string;
  progresso: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para criação (campos opcionais)
 */
export interface AtributosCriacaoSprintAtual extends Optional<AtributosSprintAtual, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * Classe do modelo SprintAtual
 */
class SprintAtual extends Model<AtributosSprintAtual, AtributosCriacaoSprintAtual> implements AtributosSprintAtual {
  public id!: number;
  public alunoId!: number;
  public sprintId!: number;
  public dataInicio!: Date;
  public dataFim!: Date | null;
  public status!: string;
  public progresso!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SprintAtual.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  alunoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID do aluno'
  },
  sprintId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID da sprint'
  },
  dataInicio: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Data de início da sprint'
  },
  dataFim: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data de fim da sprint'
  },
  status: {
    type: DataTypes.ENUM('ativa', 'concluida', 'pausada'),
    allowNull: false,
    defaultValue: 'ativa',
    comment: 'Status da sprint'
  },
  progresso: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Progresso da sprint (0-100%)'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'SprintAtual',
  tableName: 'sprint_atual',
  timestamps: true
});

export default SprintAtual;


