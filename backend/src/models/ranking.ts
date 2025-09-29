import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';

/**
 * Modelo Ranking
 * Representa a tabela ranking_semanal que armazena os dados de ranking semanal dos alunos
 * 
 * Campos:
 * - id_ranking: ID único do registro de ranking
 * - id_usuario: ID do usuário (aluno)
 * - nome_usuario: Nome do usuário
 * - email_usuario: Email do usuário
 * - total_questoes: Total de questões respondidas na semana
 * - total_acertos: Total de acertos na semana
 * - percentual_acerto: Percentual de acerto (0.00 a 100.00)
 * - pontuacao_final: Pontuação final calculada
 * - posicao: Posição no ranking (1, 2, 3, etc.)
 * - semana_inicio: Data de início da semana do ranking
 * - semana_fim: Data de fim da semana do ranking
 * - ultima_atualizacao: Timestamp da última atualização
 * 
 * Nota: Este modelo representa uma tabela que é populada por jobs automatizados
 * e consultada pelas rotas de ranking. Não possui timestamps automáticos do Sequelize.
 */
interface AtributosRanking {
  id_ranking: number;
  id_usuario: number;
  nome_usuario: string;
  email_usuario: string;
  total_questoes: number;
  total_acertos: number;
  percentual_acerto: number;
  pontuacao_final: number;
  posicao: number;
  semana_inicio: Date;
  semana_fim: Date;
  ultima_atualizacao: Date;
}

/**
 * Interface para atributos opcionais durante criação
 * Permite criar ranking sem campos que são gerados automaticamente
 */
interface AtributosCriacaoRanking extends Optional<AtributosRanking, 'id_ranking' | 'ultima_atualizacao'> {}

/**
 * Classe do modelo Ranking estendendo Model do Sequelize
 * Seguindo as regras de nomenclatura: classes em português
 */
class Ranking extends Model<AtributosRanking, AtributosCriacaoRanking> implements AtributosRanking {
  // Propriedades obrigatórias
  public id_ranking!: number;
  public id_usuario!: number;
  public nome_usuario!: string;
  public email_usuario!: string;
  public total_questoes!: number;
  public total_acertos!: number;
  public percentual_acerto!: number;
  public pontuacao_final!: number;
  public posicao!: number;
  public semana_inicio!: Date;
  public semana_fim!: Date;
  public ultima_atualizacao!: Date;
}

/**
 * Inicialização do modelo Ranking
 * Configuração das colunas e opções da tabela
 */
Ranking.init({
  id_ranking: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_ranking'
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'id_usuario',
    references: {
      model: 'usuario',
      key: 'idusuario'
    }
  },
  nome_usuario: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'nome_usuario'
  },
  email_usuario: {
    type: DataTypes.STRING(120),
    allowNull: false,
    field: 'email_usuario'
  },
  total_questoes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'total_questoes'
  },
  total_acertos: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'total_acertos'
  },
  percentual_acerto: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'percentual_acerto'
  },
  pontuacao_final: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'pontuacao_final'
  },
  posicao: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'posicao'
  },
  semana_inicio: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'semana_inicio'
  },
  semana_fim: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'semana_fim'
  },
  ultima_atualizacao: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'ultima_atualizacao'
  }
}, {
  sequelize,
  modelName: 'Ranking',
  tableName: 'ranking_semanal',
  timestamps: false, // Não usar timestamps automáticos do Sequelize
  indexes: [
    {
      name: 'idx_ranking_semanal_posicao',
      fields: ['semana_inicio', 'posicao']
    },
    {
      name: 'idx_ranking_semanal_usuario',
      fields: ['id_usuario', 'semana_inicio']
    }
  ]
});

export default Ranking;
export { AtributosRanking, AtributosCriacaoRanking };



