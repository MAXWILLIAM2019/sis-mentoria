import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';

// Interface para os atributos do Usuario
export interface AtributosUsuario {
  IdUsuario: number;
  login: string;
  senha: string;
  situacao: boolean;
  nome?: string;
  cpf?: string;
  grupo: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface para criação (campos opcionais)
export interface AtributosCriacaoUsuario extends Optional<AtributosUsuario, 'IdUsuario' | 'createdAt' | 'updatedAt'> {}

// Classe do modelo Usuario
class Usuario extends Model<AtributosUsuario, AtributosCriacaoUsuario> implements AtributosUsuario {
  public IdUsuario!: number;
  public login!: string;
  public senha!: string;
  public situacao!: boolean;
  public nome?: string;
  public cpf?: string;
  public grupo!: number;
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;
}

// Inicialização do modelo
Usuario.init({
  IdUsuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'idusuario'
  },
  login: {
    type: DataTypes.STRING(120),
    allowNull: false,
    unique: true
  },
  senha: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  situacao: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  nome: {
    type: DataTypes.STRING(120),
    allowNull: true
  },
  cpf: {
    type: DataTypes.STRING(14),
    allowNull: true,
    unique: true
  },
  grupo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'grupo_usuario',
      key: 'idgrupo'
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
  modelName: 'Usuario',
  tableName: 'usuario',
  timestamps: false
});

export default Usuario;