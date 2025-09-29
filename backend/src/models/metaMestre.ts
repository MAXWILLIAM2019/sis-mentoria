import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';

/**
 * Interface para os atributos do MetaMestre
 */
export interface AtributosMetaMestre {
  id: number;
  disciplina: string;
  tipo: string;
  titulo: string;
  comandos: string | null;
  link: string | null;
  relevancia: number;
  sprintMestreId: number;
  posicao: number;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para criação (campos opcionais)
 */
export interface AtributosCriacaoMetaMestre extends Optional<AtributosMetaMestre, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * Classe do modelo MetaMestre
 */
class MetaMestre extends Model<AtributosMetaMestre, AtributosCriacaoMetaMestre> implements AtributosMetaMestre {
  public id!: number;
  public disciplina!: string;
  public tipo!: string;
  public titulo!: string;
  public comandos!: string | null;
  public link!: string | null;
  public relevancia!: number;
  public sprintMestreId!: number;
  public posicao!: number;
  public ativo!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

MetaMestre.init({
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
    comment: 'Comandos específicos'
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
  sprintMestreId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID da sprint mestre'
  },
  posicao: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Posição da meta na sprint'
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Indica se a meta está ativa'
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
  modelName: 'MetaMestre',
  tableName: 'meta_mestres',
  timestamps: true
});

export default MetaMestre;


