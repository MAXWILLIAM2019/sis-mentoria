import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

console.log('=== INICIANDO SISTEMA DE MENTORIA (BACKEND) ===');
console.log('Ambiente:', process.env.NODE_ENV || 'desenvolvimento');

// 1. PRIMEIRO: Inicializar conexão com banco
console.log('\n1. Inicializando conexão com banco de dados...');
import sequelize from './db';
console.log('✓ Conexão com banco inicializada');

// 2. SEGUNDO: Carregar modelos e relacionamentos
console.log('\n2. Carregando modelos e relacionamentos...');
require('./models');
console.log('✓ Modelos e relacionamentos carregados');

// 3. TERCEIRO: Carregar rotas (que podem usar os modelos)
console.log('\n3. Carregando módulos de rotas...');
import rotasIndex from './routes/index';
console.log('✓ Módulos de rotas carregados com sucesso');

const app = express();

// Configuração de middlewares
console.log('\n4. Configurando middlewares...');
app.use(cors());
app.use(express.json());
console.log('✓ Middlewares configurados: CORS e JSON Parser');

// Configuração do Swagger
console.log('\n5. Configurando documentação Swagger...');
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sistema de Mentoria API',
      version: '1.0.0',
      description: 'API para gerenciamento de sistema de mentoria acadêmica',
      contact: {
        name: 'Equipe de Desenvolvimento',
        email: 'dev@mentoria.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Servidor de Desenvolvimento'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.ts', './src/docs/schemas/*.js', './src/index.ts'] // Caminhos para arquivos com documentação
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
console.log('Schemas encontrados:', Object.keys((swaggerSpec as any).components?.schemas || {}));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
console.log('✓ Swagger configurado: http://localhost:3000/api-docs');

// Rotas da API - usando o roteador central TypeScript
console.log('\n6. Configurando rotas da API...');
app.use('/api', rotasIndex);
console.log('✓ Rotas configuradas via roteador central TypeScript:');
console.log('  - /api/sprints');
console.log('  - /api/alunos');
console.log('  - /api/planos');
console.log('  - /api/planos-mestre');
console.log('  - /api/auth');
console.log('  - /api/disciplinas');
console.log('  - /api/aluno-plano');
console.log('  - /api/sprint-atual');
console.log('  - /api/ranking');

// Rota básica de verificação
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'API do Sistema de Mentoria está funcionando!' });
});

// Sincronização do banco de dados e inicialização do servidor
console.log('\n7. Sincronizando banco de dados...');
sequelize.sync({ force: true, alter: true }).then(() => {
  console.log('✓ Banco de dados sincronizado com sucesso');
  console.log('\n8. Informações do banco de dados:');
  console.log('Modelos registrados:', Object.keys(sequelize.models).join(', '));
  
  // Inicializa o agendador de jobs
  console.log('\n9. Iniciando agendador de jobs...');
  const agendador = require('./jobs/agendador');
  agendador.default.iniciar();
  
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log('\n=== SISTEMA INICIADO COM SUCESSO ===');
    console.log(`Servidor rodando em: http://localhost:${PORT}`);
    console.log('Use Ctrl+C para encerrar\n');
  });
}).catch((error: any) => {
  console.error('\n❌ ERRO AO INICIAR O SISTEMA:');
  console.error('Detalhes:', error.message);
  console.error('Stack:', error.stack);
});

// Middleware de tratamento de erros
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('\n❌ ERRO NÃO TRATADO:');
  console.error('URL:', req.url);
  console.error('Método:', req.method);
  console.error('Detalhes:', err.message);
  console.error('Stack:', err.stack);
  
  res.status(500).json({ 
    message: 'Erro interno do servidor',
    error: err.message
  });
});
