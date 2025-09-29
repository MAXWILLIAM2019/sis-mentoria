import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';

/**
 * Interface para os atributos do AlunoInfo
 */
export interface AtributosAlunoInfo {
  IdAlunoInfo: number;
  IdUsuario: number;
  email: string;
  cpf: string | null;
  data_nascimento: Date | null;
  data_criacao: Date;
  telefone: string | null;
  biografia: string | null;
  formacao: string | null;
  is_trabalhando: boolean;
  is_aceita_termos: boolean;
  notif_novidades_plataforma: boolean;
  notif_mensagens_mentor: boolean;
  notif_novo_material: boolean;
  notif_atividades_simulados: boolean;
  notif_mentorias: boolean;
}

/**
 * Interface para criação (campos opcionais)
 */
export interface AtributosCriacaoAlunoInfo extends Optional<AtributosAlunoInfo, 'IdAlunoInfo' | 'data_criacao'> {}

/**
 * Classe do modelo AlunoInfo
 */
class AlunoInfo extends Model<AtributosAlunoInfo, AtributosCriacaoAlunoInfo> implements AtributosAlunoInfo {
  public IdAlunoInfo!: number;
  public IdUsuario!: number;
  public email!: string;
  public cpf!: string | null;
  public data_nascimento!: Date | null;
  public data_criacao!: Date;
  public telefone!: string | null;
  public biografia!: string | null;
  public formacao!: string | null;
  public is_trabalhando!: boolean;
  public is_aceita_termos!: boolean;
  public notif_novidades_plataforma!: boolean;
  public notif_mensagens_mentor!: boolean;
  public notif_novo_material!: boolean;
  public notif_atividades_simulados!: boolean;
  public notif_mentorias!: boolean;
}

/**
 * Inicialização do modelo AlunoInfo
 */
AlunoInfo.init({
  IdAlunoInfo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'idalunoinfo'
  },
  IdUsuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'usuario',
      key: 'idusuario'
    },
    field: 'idusuario'
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  cpf: {
    type: DataTypes.STRING(11),
    allowNull: true,
    unique: true
  },
  data_nascimento: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  data_criacao: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  telefone: {
    type: DataTypes.STRING(15),
    allowNull: true
  },
  biografia: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  formacao: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  is_trabalhando: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  is_aceita_termos: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  notif_novidades_plataforma: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  notif_mensagens_mentor: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  notif_novo_material: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  notif_atividades_simulados: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  notif_mentorias: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  sequelize,
  modelName: 'AlunoInfo',
  tableName: 'alunoinfo',
  timestamps: false
});

export default AlunoInfo;
