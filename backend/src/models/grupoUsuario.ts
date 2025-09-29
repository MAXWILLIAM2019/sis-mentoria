import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';

/**
 * Interface para os atributos do GrupoUsuario
 */
export interface AtributosGrupoUsuario {
  id: number;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para criação (campos opcionais)
 */
export interface AtributosCriacaoGrupoUsuario extends Optional<AtributosGrupoUsuario, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * Classe do modelo GrupoUsuario
 */
class GrupoUsuario extends Model<AtributosGrupoUsuario, AtributosCriacaoGrupoUsuario> implements AtributosGrupoUsuario {
  public id!: number;
  public nome!: string;
  public descricao!: string | null;
  public ativo!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

GrupoUsuario.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Nome do grupo'
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descrição do grupo'
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Indica se o grupo está ativo'
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
  modelName: 'GrupoUsuario',
  tableName: 'grupo_usuarios',
  timestamps: true
});

export default GrupoUsuario;


