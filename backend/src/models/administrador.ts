import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';

/**
 * Atributos do modelo Administrador
 */
interface AtributosAdministrador {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  senha: string | null;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Atributos opcionais para criação
 */
interface AtributosCriacaoAdministrador extends Optional<AtributosAdministrador, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * Modelo Administrador
 */
class Administrador extends Model<AtributosAdministrador, AtributosCriacaoAdministrador> implements AtributosAdministrador {
  public id!: number;
  public nome!: string;
  public email!: string;
  public cpf!: string;
  public senha!: string | null;
  public ativo!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Administrador.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  cpf: {
    type: DataTypes.STRING(11),
    allowNull: false,
    unique: true
  },
  senha: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
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
  modelName: 'Administrador',
  tableName: 'administradores',
  timestamps: true
});

export default Administrador;


