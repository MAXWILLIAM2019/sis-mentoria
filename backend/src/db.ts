import { Sequelize } from 'sequelize';

// Configuração para PostgreSQL
const sequelize = new Sequelize({
  database: 'mentoring',       // Nome do banco de dados
  username: 'postgres',        // Nome de usuário padrão
  password: '1127',            // Senha do banco
  host: 'localhost',           // Host onde o PostgreSQL está rodando
  port: 5432,                  // Porta padrão do PostgreSQL
  dialect: 'postgres',
  logging: console.log,        // Manter logs para debug
  dialectOptions: {
    // Opções específicas do PostgreSQL se necessário
  },
  pool: {
    max: 5,                    // Máximo de conexões no pool
    min: 0,                    // Mínimo de conexões no pool
    acquire: 30000,            // Tempo máximo em ms para adquirir uma conexão
    idle: 10000                // Tempo máximo em ms que uma conexão pode ficar ociosa
  }
});

export default sequelize;


