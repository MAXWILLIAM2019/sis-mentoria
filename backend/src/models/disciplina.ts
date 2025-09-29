/**
 * Modelo Disciplina
 * 
 * Representa uma disciplina do sistema com seus assuntos.
 * Este modelo define a estrutura da tabela Disciplina no banco de dados,
 * incluindo validações e regras de negócio para cada campo.
 * Suporta versionamento de disciplinas para manter a integridade dos planos existentes.
 */
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';

/**
 * Interface para os atributos da Disciplina
 */
export interface AtributosDisciplina {
  id: number;
  nome: string;
  descricao: string | null;
  cor: string | null;
  icone: string | null;
  ativo: boolean;
  versao: number;
  disciplina_pai_id: number | null;
  data_criacao: Date;
  data_atualizacao: Date;
}

/**
 * Interface para criação (campos opcionais)
 */
export interface AtributosCriacaoDisciplina extends Optional<AtributosDisciplina, 'id' | 'data_criacao' | 'data_atualizacao'> {}

/**
 * Classe do modelo Disciplina
 */
class Disciplina extends Model<AtributosDisciplina, AtributosCriacaoDisciplina> implements AtributosDisciplina {
  public id!: number;
  public nome!: string;
  public descricao!: string | null;
  public cor!: string | null;
  public icone!: string | null;
  public ativo!: boolean;
  public versao!: number;
  public disciplina_pai_id!: number | null;
  public readonly data_criacao!: Date;
  public readonly data_atualizacao!: Date;
}

/**
 * Inicialização do modelo Disciplina
 */
Disciplina.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    comment: 'Identificador único da disciplina'
  },
  nome: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Nome da disciplina'
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descrição detalhada da disciplina'
  },
  cor: {
    type: DataTypes.STRING(7),
    allowNull: true,
    comment: 'Cor da disciplina em formato hexadecimal (#RRGGBB)'
  },
  icone: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Nome do ícone da disciplina'
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Indica se a disciplina está ativa'
  },
  versao: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: 'Versão da disciplina para controle de mudanças'
  },
  disciplina_pai_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID da disciplina pai (para versionamento)'
  },
  data_criacao: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Data de criação da disciplina'
  },
  data_atualizacao: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Data da última atualização'
  }
}, {
  sequelize,
  modelName: 'Disciplina',
  tableName: 'disciplinas',
  timestamps: false, // Usando campos customizados
  underscored: true,
  comment: 'Tabela de disciplinas do sistema'
});

export default Disciplina;


