# 🔥 SISTEMA DE PAGAMENTOS ASAAS - DOCUMENTAÇÃO COMPLETA

## ⚠️ AVISO CRÍTICO PARA DESENVOLVEDORES

**🚫 NÃO ALTERE NENHUM CÓDIGO RELACIONADO AO SISTEMA DE PAGAMENTOS SEM CONSULTAR A EQUIPE DE DESENVOLVIMENTO**

Este sistema gerencia transações financeiras reais. Alterações inadequadas podem:
- Quebrar o fluxo de pagamentos
- Causar problemas financeiros
- Comprometer a integridade dos dados
- Afetar a experiência do usuário

---

## 📋 RESUMO DO SISTEMA

### Status: ✅ FUNCIONAL E TESTADO
- **Integração:** API Asaas (Sandbox)
- **Tipos de Pagamento:** Assinaturas + Pacotes
- **Formas de Pagamento:** Cartão de Crédito + PIX
- **Webhooks:** Implementados e funcionais
- **Reutilização de Usuários:** ✅ Implementada (v2.0)

---

## 🏗️ ARQUITETURA DO SISTEMA

### 1. FLUXO PRINCIPAL
```
Frontend (Checkout) → Pré-cadastro → Pagamento → Webhooks → Confirmação
```

### 2. COMPONENTES PRINCIPAIS
- **Controller:** `alunoController.js` - Pré-cadastro inteligente
- **Service:** `asaasService.js` - Integração com API Asaas
- **Models:** `AsaasCliente`, `AsaasPagamento`, `AsaasWebhookLog`
- **Routes:** `asaasRoutes.js` - Endpoints de pagamento

---

## 💰 TIPOS DE PLANOS IMPLEMENTADOS

| Plano | Valor | Tipo | Desconto | Duração |
|-------|-------|------|----------|---------|
| **Assinatura Mensal** | R$ 297,00/mês | Recorrente | - | Indefinida |
| **Pacote 3 Meses** | R$ 846,45 | Único | 5% | 3 meses |
| **Pacote 6 Meses** | R$ 1.603,80 | Único | 10% | 6 meses |

---

## 🔧 PRINCIPAIS FUNCIONALIDADES

### ✅ PRÉ-CADASTRO INTELIGENTE (v2.0)
- **Usuários Novos:** Criação completa
- **Usuários Existentes:** Reutilização para novas compras
- **Validações:** CPF, email, telefone
- **Segurança:** UPSERT para evitar duplicações

### ✅ INTEGRAÇÃO ASAAS
- **Clientes:** Criação/reutilização automática
- **Assinaturas:** Cobrança recorrente mensal
- **Pacotes:** Pagamento único com desconto
- **Webhooks:** Confirmação automática de pagamentos

### ✅ FORMAS DE PAGAMENTO
- **Cartão de Crédito:** Aprovação imediata (sandbox)
- **PIX:** QR Code + aguarda confirmação

---

## 📊 ESTRUTURA DO BANCO DE DADOS

### Tabela: `asaas_cliente`
```sql
CREATE TABLE asaas_cliente (
    idasaascliente SERIAL PRIMARY KEY,
    idusuario INTEGER UNIQUE NOT NULL, -- FK para usuario
    id_cliente_asaas VARCHAR(255) NOT NULL,
    data_criacao TIMESTAMP DEFAULT NOW(),
    data_atualizacao TIMESTAMP DEFAULT NOW()
);
```

### Tabela: `asaas_pagamento`
```sql
CREATE TABLE asaas_pagamento (
    idasaaspagamento SERIAL PRIMARY KEY,
    idasaascliente INTEGER NOT NULL, -- FK para asaas_cliente
    id_pagamento_asaas VARCHAR(255),
    id_assinatura_asaas VARCHAR(255),
    tipo_plano VARCHAR(20) NOT NULL,
    duracao_meses INTEGER NOT NULL,
    forma_pagamento VARCHAR(20) NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    situacao VARCHAR(50) DEFAULT 'PENDENTE',
    data_vencimento DATE NOT NULL,
    data_confirmacao DATE,
    proxima_cobranca DATE,
    -- ... outros campos
    FOREIGN KEY (idasaascliente) REFERENCES asaas_cliente(idasaascliente)
);
```

### Relacionamentos Críticos
- **PK → PK:** `asaas_pagamento.idasaascliente` → `asaas_cliente.idasaascliente`
- **UNIQUE:** `asaas_cliente.idusuario` (um cliente por usuário)
- **UNIQUE:** `aluno_info.IdUsuario` (um registro por usuário)

---

## 🔄 FLUXO DE WEBHOOKS

### Sequência de Eventos (Assinatura)
1. **SUBSCRIPTION_CREATED** → Assinatura confirmada
2. **PAYMENT_CREATED** → Primeira cobrança criada
3. **PAYMENT_CONFIRMED** → Pagamento aprovado ✅
4. **PAYMENT_RECEIVED** → Valor creditado (futuro)

### Sequência de Eventos (Pacote)
1. **PAYMENT_CREATED** → Cobrança única criada
2. **PAYMENT_CONFIRMED** → Pagamento aprovado ✅
3. **PAYMENT_RECEIVED** → Valor creditado (futuro)

---

## 🚨 PROBLEMAS RESOLVIDOS

### ❌ Problema v1.0: Usuários Existentes Bloqueados
```javascript
// ANTES (v1.0) - BLOQUEAVA usuários existentes
if (usuarioExistenteCPF) {
    return res.status(400).json({ error: 'CPF já cadastrado no sistema' });
}
```

### ✅ Solução v2.0: Reutilização Inteligente
```javascript
// AGORA (v2.0) - REUTILIZA usuários existentes
if (usuarioExistenteCPF) {
    // Reutiliza usuário para nova compra
    usuario = usuarioExistenteCPF;
    // UPSERT aluno_info (atualiza ou cria)
    const [alunoInfoResult, created] = await AlunoInfo.upsert({...});
}
```

### ❌ Problema: Constraint UNIQUE em aluno_info
```sql
-- ERRO: duplicate key value violates unique constraint "aluno_info_idusuario_key"
```

### ✅ Solução: UPSERT Pattern
```javascript
// UPSERT resolve constraint UNIQUE automaticamente
const [alunoInfoResult, created] = await AlunoInfo.upsert({
    IdUsuario: usuario.IdUsuario,
    // ... outros campos
}, {
    returning: true
});
```

---

## 🎯 ENDPOINTS CRÍTICOS

### POST `/api/alunos/pre-cadastro`
- **Função:** Pré-cadastro inteligente
- **Suporte:** Usuários novos + existentes
- **Validações:** CPF, email, telefone

### POST `/api/asaas/criar-assinatura`
- **Função:** Assinatura mensal recorrente
- **Valor:** R$ 297,00/mês
- **Formas:** Cartão + PIX

### POST `/api/asaas/criar-pagamento-pacote`
- **Função:** Pacotes 3 e 6 meses
- **Descontos:** 5% e 10%
- **Formas:** Cartão + PIX

### POST `/api/asaas/webhook`
- **Função:** Processamento de eventos Asaas
- **Eventos:** Criação, confirmação, recebimento
- **Logs:** Todos os eventos registrados

---

## 🧪 DADOS DE TESTE

### CPFs Válidos para Teste
```
87213957058 - Astrogildo Pantaleão Zeferino
12345678909 - Maria Silva Santos
98765432100 - João Pedro Oliveira
```

### Cartões de Teste (Asaas Sandbox)
```javascript
// Aprovação Automática
{
    "numero": "4444444444444444",
    "nome": "NOME DO TITULAR",
    "validade": "12/28",
    "cvv": "123"
}

// Recusa Automática
{
    "numero": "4000000000000002",
    "nome": "NOME DO TITULAR", 
    "validade": "12/28",
    "cvv": "123"
}
```

---

## 📝 LOG DE ALTERAÇÕES

### v2.0 (2024-12-21)
- ✅ Implementado pré-cadastro inteligente
- ✅ Suporte a reutilização de usuários existentes
- ✅ Correção de constraint UNIQUE em aluno_info
- ✅ UPSERT pattern para segurança
- ✅ Documentação completa adicionada

### v1.0 (2024-12-20)
- ✅ Integração básica com Asaas
- ✅ Assinaturas e pacotes
- ✅ Webhooks funcionais
- ❌ Bloqueava usuários existentes

---

## 🚫 REGRAS DE DESENVOLVIMENTO

### ANTES DE ALTERAR QUALQUER CÓDIGO:

1. **✋ PARE** - Consulte a equipe de desenvolvimento
2. **🧪 TESTE** - Use ambiente de desenvolvimento
3. **🔍 VALIDE** - Verifique integração com Asaas
4. **📊 CONFIRME** - Teste constraints do banco
5. **📝 DOCUMENTE** - Registre todas as alterações

### ARQUIVOS CRÍTICOS (NÃO ALTERAR):
- `backend/src/controllers/alunoController.js`
- `backend/src/services/asaasService.js`
- `backend/src/models/AsaasCliente.js`
- `backend/src/models/AsaasPagamento.js`
- `backend/src/routes/asaasRoutes.js`

---

## 📞 CONTATO

Para alterações ou dúvidas sobre o sistema de pagamentos:
**👥 Consulte a equipe de desenvolvimento**

---

**⚠️ LEMBRE-SE: Este sistema gerencia dinheiro real. Seja responsável!** 