/**
 * Modelo Assunto
 * 
 * Representa um assunto dentro de uma disciplina.
 * Este modelo define a estrutura da tabela Assunto no banco de dados,
 * incluindo validações e regras de negócio para cada campo.
 */
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';

/**
 * Interface para os atributos do Assunto
 */
export interface AtributosAssunto {
  id: number;
  nome: string;
  disciplinaId: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para criação (campos opcionais)
 */
export interface AtributosCriacaoAssunto extends Optional<AtributosAssunto, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * Classe do modelo Assunto
 */
class Assunto extends Model<AtributosAssunto, AtributosCriacaoAssunto> implements AtributosAssunto {
  public id!: number;
  public nome!: string;
  public disciplinaId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

/**
 * Inicialização do modelo Assunto
 */
Assunto.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    comment: 'Identificador único do assunto'
  },
  nome: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Nome do assunto'
  },
  disciplinaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID da disciplina a que pertence'
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
  modelName: 'Assunto',
  tableName: 'assuntos',
  timestamps: true,
  underscored: true,
  comment: 'Tabela de assuntos das disciplinas'
});

export default Assunto;


