import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';

// Interface para os atributos do Aluno
export interface AtributosAluno {
  IdAlunoInfo: number;
  IdUsuario: number;
  email: string;
  cpf?: string;
  data_nascimento?: Date;
  data_criacao: Date;
  telefone?: string;
  biografia?: string;
  formacao?: string;
  is_trabalhando: boolean;
  is_aceita_termos: boolean;
  notif_novidades_plataforma: boolean;
  notif_mensagens_mentor: boolean;
  notif_novo_material: boolean;
  notif_atividades_simulados: boolean;
  notif_mentorias: boolean;
}

// Interface para criação (campos opcionais)
export interface AtributosCriacaoAluno extends Optional<AtributosAluno, 'IdAlunoInfo' | 'data_criacao'> {}

// Classe do modelo Aluno
class Aluno extends Model<AtributosAluno, AtributosCriacaoAluno> implements AtributosAluno {
  public IdAlunoInfo!: number;
  public IdUsuario!: number;
  public email!: string;
  public cpf?: string;
  public data_nascimento?: Date;
  public data_criacao!: Date;
  public telefone?: string;
  public biografia?: string;
  public formacao?: string;
  public is_trabalhando!: boolean;
  public is_aceita_termos!: boolean;
  public notif_novidades_plataforma!: boolean;
  public notif_mensagens_mentor!: boolean;
  public notif_novo_material!: boolean;
  public notif_atividades_simulados!: boolean;
  public notif_mentorias!: boolean;
}

// Inicialização do modelo
Aluno.init({
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
    type: DataTypes.STRING(120),
    allowNull: false
  },
  cpf: {
    type: DataTypes.STRING(14),
    allowNull: true
  },
  data_nascimento: {
    type: DataTypes.DATE,
    allowNull: true
  },
  data_criacao: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  telefone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  biografia: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  formacao: {
    type: DataTypes.STRING(50),
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
  // Campos de notificações
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
    defaultValue: false
  },
  notif_mentorias: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  sequelize,
  modelName: 'AlunoInfo',
  tableName: 'aluno_info',
  timestamps: false
});

export default Aluno;