/**
 * Modelo AlunoPlano
 * 
 * Representa a associação entre um aluno e uma instância de plano de estudos.
 * Armazena informações sobre o progresso do aluno no plano.
 */
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';

/**
 * Interface para os atributos do AlunoPlano
 */
export interface AtributosAlunoPlano {
  id: number;
  alunoId: number;
  planoId: number;
  dataInicio: Date;
  dataFim: Date | null;
  progresso: number;
  status: string;
  desempenho: number | null;
  tempoTotalEstudo: string | null;
  observacoes: string | null;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para criação (campos opcionais)
 */
export interface AtributosCriacaoAlunoPlano extends Optional<AtributosAlunoPlano, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * Classe do modelo AlunoPlano
 */
class AlunoPlano extends Model<AtributosAlunoPlano, AtributosCriacaoAlunoPlano> implements AtributosAlunoPlano {
  public id!: number;
  public alunoId!: number;
  public planoId!: number;
  public dataInicio!: Date;
  public dataFim!: Date | null;
  public progresso!: number;
  public status!: string;
  public desempenho!: number | null;
  public tempoTotalEstudo!: string | null;
  public observacoes!: string | null;
  public ativo!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

/**
 * Inicialização do modelo AlunoPlano
 */
AlunoPlano.init({
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
  planoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID do plano'
  },
  dataInicio: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Data de início do plano'
  },
  dataFim: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data de conclusão do plano'
  },
  progresso: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0,
      max: 100
    },
    comment: 'Progresso do aluno no plano (0-100%)'
  },
  status: {
    type: DataTypes.ENUM('ativo', 'concluido', 'pausado', 'cancelado'),
    allowNull: false,
    defaultValue: 'ativo',
    comment: 'Status do plano para o aluno'
  },
  desempenho: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    },
    comment: 'Desempenho médio do aluno (0-100)'
  },
  tempoTotalEstudo: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: 'Tempo total de estudo (HH:MM:SS)'
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Observações sobre o progresso'
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Indica se a associação está ativa'
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
  modelName: 'AlunoPlano',
  tableName: 'aluno_planos',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['alunoId', 'planoId'],
      name: 'unique_aluno_plano'
    }
  ]
});

export default AlunoPlano;


