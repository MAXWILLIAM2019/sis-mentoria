import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';

/**
 * Interface para os atributos do PlanoMestre
 */
export interface AtributosPlanoMestre {
  id: number;
  nome: string;
  descricao: string | null;
  categoria: string | null;
  nivel: string | null;
  duracaoEstimada: number | null;
  objetivos: string | null;
  prerequisitos: string | null;
  publico_alvo: string | null;
  ativo: boolean;
  versao: number;
  autor: string | null;
  tags: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para criação (campos opcionais)
 */
export interface AtributosCriacaoPlanoMestre extends Optional<AtributosPlanoMestre, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * Classe do modelo PlanoMestre
 */
class PlanoMestre extends Model<AtributosPlanoMestre, AtributosCriacaoPlanoMestre> implements AtributosPlanoMestre {
  public id!: number;
  public nome!: string;
  public descricao!: string | null;
  public categoria!: string | null;
  public nivel!: string | null;
  public duracaoEstimada!: number | null;
  public objetivos!: string | null;
  public prerequisitos!: string | null;
  public publico_alvo!: string | null;
  public ativo!: boolean;
  public versao!: number;
  public autor!: string | null;
  public tags!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PlanoMestre.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nome: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Nome do plano mestre'
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descrição detalhada do plano'
  },
  categoria: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Categoria do plano'
  },
  nivel: {
    type: DataTypes.ENUM('iniciante', 'intermediario', 'avancado'),
    allowNull: true,
    comment: 'Nível de dificuldade'
  },
  duracaoEstimada: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Duração estimada em dias'
  },
  objetivos: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Objetivos do plano'
  },
  prerequisitos: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Pré-requisitos necessários'
  },
  publico_alvo: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Público alvo do plano'
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Indica se o plano está ativo'
  },
  versao: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: 'Versão do plano'
  },
  autor: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Autor do plano'
  },
  tags: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Tags do plano (JSON)'
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
  modelName: 'PlanoMestre',
  tableName: 'plano_mestres',
  timestamps: true
});

export default PlanoMestre;


