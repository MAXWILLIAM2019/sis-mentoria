/**
 * Modelo Plano
 * Representa uma instância de plano de estudos gerada a partir de um PlanoMestre (template)
 * 
 * Campos:
 * - nome: Nome do plano (herdado do template)
 * - cargo: Cargo alvo do plano (herdado do template)
 * - descricao: Descrição detalhada do plano (herdado do template)
 * - duracao: Duração em meses (herdado do template)
 * - plano_mestre_id: Referência ao template que originou esta instância
 * 
 * Relacionamentos:
 * - belongsTo PlanoMestre: Uma instância pertence a um template
 * - hasMany Sprint: Uma instância pode ter várias sprints
 * - belongsToMany Disciplina: Mantém as disciplinas associadas à instância
 * 
 * Nota: Os relacionamentos são definidos no arquivo index.js para evitar
 * problemas de referência circular e duplicação.
 */
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';

/**
 * Interface para definir os atributos do modelo Plano
 * Seguindo as regras de nomenclatura: interfaces em português
 */
interface AtributosPlano {
  id: number;
  nome: string;
  cargo: string;
  descricao: string;
  duracao: number;
  plano_mestre_id: number | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para atributos opcionais durante criação
 * Permite criar plano sem campos que são gerados automaticamente
 */
interface AtributosCriacaoPlano extends Optional<AtributosPlano, 'id' | 'plano_mestre_id' | 'createdAt' | 'updatedAt'> {}

/**
 * Classe do modelo Plano estendendo Model do Sequelize
 * Seguindo as regras de nomenclatura: classes em português
 */
class Plano extends Model<AtributosPlano, AtributosCriacaoPlano> implements AtributosPlano {
  // Propriedades obrigatórias
  public id!: number;
  public nome!: string;
  public cargo!: string;
  public descricao!: string;
  public duracao!: number;
  public plano_mestre_id!: number | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

/**
 * Inicialização do modelo Plano
 * Configuração das colunas e opções da tabela
 */
Plano.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cargo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  duracao: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  plano_mestre_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'plano_mestres',
      key: 'id'
    },
    comment: 'Referência ao plano mestre (template) que originou esta instância'
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
  modelName: 'Plano',
  tableName: 'Plano',
  timestamps: true
});

export default Plano;
export { AtributosPlano, AtributosCriacaoPlano };

