# Backend - Sistema de Mentoria com Arquitetura de Templates

Este backend implementa uma arquitetura avançada de **templates reutilizáveis** para gerenciamento de mentorias, permitindo que administradores criem planos mestre que podem ser instanciados para múltiplos alunos.

## 🏗️ Arquitetura de Templates

### Conceito Principal
O sistema trabalha com duas camadas distintas:

#### 🎯 **Templates (Modelos Mestre)**
- **PlanoMestre**: Templates de planos criados por administradores
- **SprintMestre**: Templates de sprints dentro dos planos mestre  
- **MetaMestre**: Templates de metas dentro das sprints mestre

#### 👥 **Instâncias (Dados do Aluno)**
- **Plano**: Instância personalizada baseada em PlanoMestre
- **Sprint**: Instância com datas e progresso real
- **Meta**: Instância com dados de execução e performance

## 🚀 Como rodar

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Configure o banco PostgreSQL:**
   ```bash
   # Crie um banco PostgreSQL
   createdb sis_mentoria
   ```

3. **Configure variáveis de ambiente:**
   ```bash
   cp .env.example .env
   # Edite as configurações do banco e do Asaas no .env
   ```

4. **Inicie o serviço:**
   ```bash
   # Desenvolvimento
   npm run dev
   
   # Produção
   npm start
   ```

O serviço estará disponível em `http://localhost:3000`.

## 🔧 Variáveis de Ambiente

```env
# JWT
JWT_SECRET=sua_chave_secreta_jwt_super_segura

# Banco de Dados PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sis_mentoria
DB_USER=seu_usuario
DB_PASS=sua_senha

# Asaas
ASAAS_API_KEY=sua_chave_api_asaas
ASAAS_API_URL=https://sandbox.asaas.com/api/v3  # Sandbox
# ASAAS_API_URL=https://api.asaas.com/api/v3    # Produção

# Servidor
PORT=3000
NODE_ENV=development
```

## 💳 Integração com Asaas

O sistema utiliza o Asaas como gateway de pagamentos, oferecendo:

### Funcionalidades
- Assinatura recorrente mensal
- Pacotes fechados de 3 ou 6 meses com parcelamento
- Múltiplas formas de pagamento (PIX, Cartão, Boleto)
- Webhook para atualização automática dos pagamentos

### Modelos de Dados
- **AsaasCliente**: Vincula usuário do sistema ao cliente no Asaas
- **AsaasPagamento**: Controla pagamentos e assinaturas
- **AsaasWebhookLog**: Registra eventos recebidos do Asaas

### Dependências
- `asaas-node`: SDK oficial do Asaas para Node.js
- `axios`: Cliente HTTP para requisições à API do Asaas

## 📊 Modelos de Dados

### Templates (Tabelas Mestre)

#### PlanoMestre
```javascript
{
  id: integer,
  nome: string,
  cargo: string,
  descricao: text,
  duracao: integer, // meses
  versao: string,
  ativo: boolean,
  createdAt: datetime,
  updatedAt: datetime
}
```

#### SprintMestre
```javascript
{
  id: integer,
  nome: string,
  dataInicio: date,      // Opcional para templates
  dataFim: date,         // Opcional para templates
  status: enum,          // Compatibilidade frontend
  posicao: integer,
  descricao: text,       // Específico para templates
  PlanoMestreId: integer,
  createdAt: datetime,
  updatedAt: datetime
}
```

#### MetaMestre  
```javascript
{
  id: integer,
  disciplina: string,
  tipo: enum('teoria','questoes','revisao','reforco'),
  titulo: string,
  comandos: string,      // Suporte a HTML
  link: string,
  relevancia: integer,   // 1-5
  tempoEstudado: string, // HH:MM
  desempenho: decimal,   // 0-100
  status: enum,
  totalQuestoes: integer,
  questoesCorretas: integer,
  SprintMestreId: integer,
  createdAt: datetime,
  updatedAt: datetime
}
```

### Instâncias (Dados do Aluno)

#### Plano, Sprint, Meta
- Estrutura **idêntica** às tabelas mestre
- Campos adicionais: referência ao template de origem
- Datas e progresso **obrigatórios** para instâncias

## 🔌 Endpoints Principais

### Templates (Administrador)

#### Planos Mestre
```http
GET    /planos          # Listar templates
POST   /planos          # Criar template  
GET    /planos/:id      # Buscar template específico
PUT    /planos/:id      # Atualizar template
DELETE /planos/:id      # Excluir template (soft delete)
GET    /planos/:id/disciplinas # Buscar disciplinas
GET    /planos/:id/sprints     # Buscar sprints do plano
```

#### Sprints Mestre
```http
GET    /sprints         # Listar templates de sprint
POST   /sprints         # Criar template de sprint
GET    /sprints/:id     # Buscar template específico
PUT    /sprints/:id     # Atualizar template
DELETE /sprints/:id     # Excluir template
PUT    /sprints/reordenar # Reordenar sprints
```

#### Metas Mestre
```http
PUT    /sprints/metas/:id # Atualizar meta específica
```

### Instâncias (Sistema)

#### Criação Automática de Instâncias
```http
POST /planos-mestre/criar-instancia
{
  "planoMestreId": 1,
  "idUsuario": 123,
  "dataInicio": "2024-01-01",
  "status": "não iniciado",
  "observacoes": "Plano personalizado"
}
```

### Sistema de Autenticação

#### Auth Endpoints
```http
POST /auth/register    # Registro de usuário
POST /auth/login       # Login unificado
POST /auth/verify      # Validação de token
```

#### Healthcheck
```http
GET /health           # Verifica se o serviço está online
```

## 🔐 Sistema de Autenticação Centralizado

### Arquitetura
- **Tabela `usuario`**: Controle centralizado de login
- **Tabelas complementares**: `aluno_info`, `administrador_info`
- **`grupo_usuario`**: Definição de perfis/roles
- **JWT**: Tokens seguros com expiração

### Fluxo de Autenticação
1. **Registro**: Cria usuário + perfil específico
2. **Login**: Valida credenciais + gera JWT
3. **Autorização**: Middleware valida token em rotas protegidas

## 🎯 Processo de Instanciação

### Criação Automática de Instâncias

Quando um aluno é associado a um PlanoMestre:

1. ✅ **Cria Plano** (instância baseada no PlanoMestre)
2. ✅ **Cria Sprints** (instâncias de todas as SprintsMestre)
3. ✅ **Calcula Datas** (baseado na duração e posição)
4. ✅ **Cria Metas** (instâncias de todas as MetasMestre)
5. ✅ **Associa Aluno** (via tabela AlunoPlano)

### Exemplo de Processo
```javascript
// Template com 10 sprints → Gera 10 sprints para o aluno
// Template com 50 metas → Gera 50 metas executáveis
// Datas calculadas automaticamente: sprint1 (01/01), sprint2 (15/01), etc.
```

## 🛠️ Estrutura de Controllers

### Templates (Admin Interface)
- **`planoController.js`**: CRUD de PlanosMestre
- **`sprintController.js`**: CRUD de SprintsMestre + MetasMestre
- **`planoMestreController.js`**: Criação de instâncias

### Autenticação
- **`authController.js`**: Login, registro, validação JWT

### Legacy (Manter Compatibilidade)
- **`alunoController.js`**: Gestão de alunos
- Outros controllers existentes

## 📝 Suporte para Conteúdo Rich Text (HTML)

### Campos com HTML
- **`comandos`** nas MetasMestre e Meta
- Suporte completo a formatação do React Quill
- Armazenamento seguro no PostgreSQL

### Funcionalidades Suportadas
- ✅ Formatação de texto (negrito, itálico, etc.)
- ✅ Listas ordenadas e não ordenadas
- ✅ Links e elementos HTML básicos
- ✅ Preservação de formatação entre frontend/backend

## 🔄 Relacionamentos Entre Modelos

### Templates
```
PlanoMestre (1:N) SprintMestre (1:N) MetaMestre
```

### Instâncias  
```
Plano (1:N) Sprint (1:N) Meta
```

### Template → Instância
```
PlanoMestre (1:N) Plano (via plano_mestre_id)
SprintMestre (1:N) Sprint (via sprint_mestre_id)
MetaMestre (1:N) Meta (via meta_mestre_id)
```

### Aluno ↔ Plano
```
Usuario (N:M) Plano (via AlunoPlano)
```

## 🚨 Boas Práticas Implementadas

### Compatibilidade
- ✅ **Zero Breaking Changes**: Frontend usa mesmas rotas
- ✅ **Estruturas Idênticas**: Templates e instâncias simétricos
- ✅ **Migração Transparente**: Admin não percebe diferença

### Performance
- ✅ **Lazy Loading**: Instâncias criadas sob demanda
- ✅ **Índices Otimizados**: Consultas rápidas
- ✅ **Soft Delete**: Preserva integridade referencial

### Escalabilidade
- ✅ **Templates Reutilizáveis**: 1 template → ∞ alunos
- ✅ **Versionamento**: Controle de versões
- ✅ **Isolamento**: Instâncias independentes

## 🎮 Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Inicia em modo desenvolvimento
npm start               # Inicia em produção

# Banco de Dados  
npm run db:sync         # Sincroniza modelos com banco
npm run db:reset        # Reset completo do banco
npm run db:migrate      # Executa migrações

# Testes
npm test               # Executa testes
npm run test:watch     # Testes em modo watch
```

## 📈 Casos de Uso Práticos

### Cenário: Preparatório para Concurso
```javascript
// Admin cria 1 PlanoMestre com 20 SprintsMestre
// Sistema instancia para 1000 alunos automaticamente
// Resultado: 20.000 sprints + 200.000+ metas executáveis
```

### Cenário: Curso de Programação
```javascript
// Admin cria template "Full Stack Developer"
// 16 sprints com projetos progressivos
// Cada aluno recebe cronograma personalizado
```

## 🔮 Próximos Passos

### Em Desenvolvimento
- [ ] **Dashboard de progresso avançado**
- [ ] **Relatórios e analytics detalhados**
- [ ] **Sistema de notificações automáticas**
- [ ] **API de integração com sistemas externos**

### Roadmap Futuro
- [ ] **Integração com SSO corporativo**
- [ ] **Sistema de certificações automáticas**
- [ ] **IA para recomendações personalizadas**
- [ ] **Mobile API para aplicativo nativo**

---

## 🤝 Contribuindo

1. Siga os padrões de arquitetura de templates
2. Mantenha compatibilidade com frontend existente
3. Documente novos endpoints adequadamente
4. Teste tanto templates quanto instâncias

**Para dúvidas técnicas, consulte a equipe de desenvolvimento.** 