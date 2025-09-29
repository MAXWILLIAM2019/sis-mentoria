import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';

/**
 * Interface para os atributos do AdministradorInfo
 */
export interface AtributosAdministradorInfo {
  id: number;
  IdUsuario: number;
  nome: string;
  email: string;
  cpf: string | null;
  telefone: string | null;
  departamento: string | null;
  cargo: string | null;
  data_criacao: Date;
  ativo: boolean;
}

/**
 * Interface para criação (campos opcionais)
 */
export interface AtributosCriacaoAdministradorInfo extends Optional<AtributosAdministradorInfo, 'id' | 'data_criacao'> {}

/**
 * Classe do modelo AdministradorInfo
 */
class AdministradorInfo extends Model<AtributosAdministradorInfo, AtributosCriacaoAdministradorInfo> implements AtributosAdministradorInfo {
  public id!: number;
  public IdUsuario!: number;
  public nome!: string;
  public email!: string;
  public cpf!: string | null;
  public telefone!: string | null;
  public departamento!: string | null;
  public cargo!: string | null;
  public data_criacao!: Date;
  public ativo!: boolean;
}

AdministradorInfo.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  IdUsuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    comment: 'ID do usuário'
  },
  nome: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Nome do administrador'
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    },
    comment: 'Email do administrador'
  },
  cpf: {
    type: DataTypes.STRING(11),
    allowNull: true,
    unique: true,
    comment: 'CPF do administrador'
  },
  telefone: {
    type: DataTypes.STRING(15),
    allowNull: true,
    comment: 'Telefone do administrador'
  },
  departamento: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Departamento do administrador'
  },
  cargo: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Cargo do administrador'
  },
  data_criacao: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Data de criação do registro'
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Indica se o administrador está ativo'
  }
}, {
  sequelize,
  modelName: 'AdministradorInfo',
  tableName: 'administrador_info',
  timestamps: false
});

export default AdministradorInfo;


