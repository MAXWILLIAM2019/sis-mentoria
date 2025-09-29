import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';

/**
 * Interface para os atributos da Meta
 */
export interface AtributosMeta {
  id: number;
  disciplina: string;
  tipo: string;
  titulo: string;
  comandos: string | null;
  link: string | null;
  relevancia: number;
  tempoEstudado: string | null;
  desempenho: number | null;
  status: string;
  totalQuestoes: number | null;
  questoesCorretas: number | null;
  sprintId: number;
  meta_mestre_id: number | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para criação (campos opcionais)
 */
export interface AtributosCriacaoMeta extends Optional<AtributosMeta, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * Classe do modelo Meta
 */
class Meta extends Model<AtributosMeta, AtributosCriacaoMeta> implements AtributosMeta {
  public id!: number;
  public disciplina!: string;
  public tipo!: string;
  public titulo!: string;
  public comandos!: string | null;
  public link!: string | null;
  public relevancia!: number;
  public tempoEstudado!: string | null;
  public desempenho!: number | null;
  public status!: string;
  public totalQuestoes!: number | null;
  public questoesCorretas!: number | null;
  public sprintId!: number;
  public meta_mestre_id!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

/**
 * Inicialização do modelo Meta
 */
Meta.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  disciplina: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Nome da disciplina'
  },
  tipo: {
    type: DataTypes.ENUM('teoria', 'questoes', 'revisao', 'reforco'),
    allowNull: false,
    comment: 'Tipo da meta'
  },
  titulo: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Título da meta'
  },
  comandos: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Comandos específicos para a meta'
  },
  link: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Link de referência'
  },
  relevancia: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 3,
    validate: {
      min: 1,
      max: 5
    },
    comment: 'Nível de relevância (1-5)'
  },
  tempoEstudado: {
    type: DataTypes.STRING(5),
    allowNull: true,
    comment: 'Tempo estudado (HH:MM)'
  },
  desempenho: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    },
    comment: 'Pontuação de desempenho (0-100)'
  },
  status: {
    type: DataTypes.ENUM('Pendente', 'Em Andamento', 'Concluída'),
    allowNull: false,
    defaultValue: 'Pendente',
    comment: 'Status da meta'
  },
  totalQuestoes: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Total de questões'
  },
  questoesCorretas: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Questões corretas'
  },
  sprintId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID da sprint'
  },
  meta_mestre_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID da meta mestre (template)'
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
  modelName: 'Meta',
  tableName: 'metas',
  timestamps: true
});

export default Meta;


