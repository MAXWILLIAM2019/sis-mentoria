import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';

/**
 * Interface para os atributos do SprintMestre
 */
export interface AtributosSprintMestre {
  id: number;
  nome: string;
  descricao: string | null;
  posicao: number;
  duracaoEstimada: number | null;
  objetivos: string | null;
  planoMestreId: number;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para criação (campos opcionais)
 */
export interface AtributosCriacaoSprintMestre extends Optional<AtributosSprintMestre, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * Classe do modelo SprintMestre
 */
class SprintMestre extends Model<AtributosSprintMestre, AtributosCriacaoSprintMestre> implements AtributosSprintMestre {
  public id!: number;
  public nome!: string;
  public descricao!: string | null;
  public posicao!: number;
  public duracaoEstimada!: number | null;
  public objetivos!: string | null;
  public planoMestreId!: number;
  public ativo!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SprintMestre.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nome: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Nome da sprint mestre'
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descrição da sprint'
  },
  posicao: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Posição da sprint no plano'
  },
  duracaoEstimada: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Duração estimada em dias'
  },
  objetivos: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Objetivos da sprint'
  },
  planoMestreId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID do plano mestre'
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Indica se a sprint está ativa'
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
  modelName: 'SprintMestre',
  tableName: 'sprint_mestres',
  timestamps: true
});

export default SprintMestre;


