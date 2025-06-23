# Tipos de Planos - Sistema de Pagamentos Asaas

Este documento detalha os tipos de planos implementados no sistema de mentoria, suas características e integração com o gateway de pagamentos Asaas.

## 📋 Tipos de Planos Disponíveis

### 1. 🔄 ASSINATURA MENSAL RECORRENTE

**Características:**
- **Tipo:** `ASSINATURA_MENSAL`
- **Valor:** R$ 97,90/mês
- **Duração:** Indefinida (até cancelamento)
- **Cobrança:** Automática todo mês
- **Cancelamento:** A qualquer momento
- **Destaque:** Não

**Formas de Pagamento Aceitas:**
- ✅ Cartão de Crédito (`CARTAO_CREDITO`)
- ✅ PIX (`PIX`)
- ❌ Boleto (não recomendado para recorrência)

**Endpoint Backend:**
```http
POST /api/asaas/criar-assinatura
Content-Type: application/json
Authorization: Bearer {token}

{
  "usuario": {
    "nome": "João Silva",
    "email": "joao@email.com",
    "cpf": "12345678901",
    "telefone": "11999999999"
  },
  "plano": {
    "id": 1,
    "nome": "Assinatura Mensal",
    "valor": 97.90
  },
  "formaPagamento": "CARTAO_CREDITO"
}
```

---

### 2. 📦 PACOTE 3 MESES

**Características:**
- **Tipo:** `PACOTE_3_MESES`
- **Valor Mensal:** R$ 87,90/mês (10% desconto)
- **Valor Total:** R$ 263,70 (87,90 × 3)
- **Duração:** 3 meses fixos
- **Cobrança:** Pagamento único
- **Desconto:** 10% em relação ao plano mensal
- **Destaque:** Não

**Formas de Pagamento Aceitas:**
- ✅ Cartão de Crédito (`CARTAO_CREDITO`)
- ✅ Boleto Bancário (`BOLETO`)
- ✅ PIX (`PIX`)

**Endpoint Backend:**
```http
POST /api/asaas/criar-pagamento-pacote
Content-Type: application/json
Authorization: Bearer {token}

{
  "usuario": {
    "nome": "João Silva",
    "email": "joao@email.com",
    "cpf": "12345678901",
    "telefone": "11999999999"
  },
  "plano": {
    "id": 1,
    "nome": "Pacote 3 Meses",
    "valor": 87.90
  },
  "formaPagamento": "CARTAO_CREDITO",
  "duracaoMeses": 3,
  "numeroParcelas": 1
}
```

---

### 3. ⭐ PACOTE 6 MESES (RECOMENDADO)

**Características:**
- **Tipo:** `PACOTE_6_MESES`
- **Valor Mensal:** R$ 77,90/mês (20% desconto)
- **Valor Total:** R$ 467,40 (77,90 × 6)
- **Duração:** 6 meses fixos
- **Cobrança:** Pagamento único
- **Desconto:** 20% em relação ao plano mensal
- **Destaque:** ⭐ Plano Recomendado

**Formas de Pagamento Aceitas:**
- ✅ Cartão de Crédito (`CARTAO_CREDITO`)
- ✅ Boleto Bancário (`BOLETO`)
- ✅ PIX (`PIX`)

**Endpoint Backend:**
```http
POST /api/asaas/criar-pagamento-pacote
Content-Type: application/json
Authorization: Bearer {token}

{
  "usuario": {
    "nome": "João Silva",
    "email": "joao@email.com",
    "cpf": "12345678901",
    "telefone": "11999999999"
  },
  "plano": {
    "id": 1,
    "nome": "Pacote 6 Meses",
    "valor": 77.90
  },
  "formaPagamento": "PIX",
  "duracaoMeses": 6,
  "numeroParcelas": 1
}
```

---

## 💰 Comparativo de Valores

| Plano | Valor Mensal | Valor Total | Desconto | Economia |
|-------|-------------|-------------|----------|----------|
| Assinatura Mensal | R$ 97,90 | R$ 97,90/mês | 0% | - |
| Pacote 3 Meses | R$ 87,90 | R$ 263,70 | 10% | R$ 29,40 |
| Pacote 6 Meses | R$ 77,90 | R$ 467,40 | 20% | R$ 120,00 |

### Cálculo de Economia:
- **Pacote 3 Meses:** (97,90 × 3) - 263,70 = R$ 29,40 de economia
- **Pacote 6 Meses:** (97,90 × 6) - 467,40 = R$ 120,00 de economia

---

## 🔧 Implementação Técnica

### Estrutura no Frontend (`TIPOS_PLANOS`)

```javascript
const TIPOS_PLANOS = {
  ASSINATURA_MENSAL: {
    tipo: 'ASSINATURA_MENSAL',
    nome: 'Assinatura Mensal',
    descricao: 'Cobrança automática todo mês. Cancele quando quiser.',
    valor: 97.90,
    duracao: 1,
    recorrente: true,
    destaque: false,
    icone: '🔄'
  },
  PACOTE_3_MESES: {
    tipo: 'PACOTE_3_MESES', 
    nome: 'Pacote 3 Meses',
    descricao: 'Pagamento único para 3 meses de acesso completo.',
    valor: 87.90,
    duracao: 3,
    recorrente: false,
    destaque: false,
    icone: '📦'
  },
  PACOTE_6_MESES: {
    tipo: 'PACOTE_6_MESES',
    nome: 'Pacote 6 Meses', 
    descricao: 'Pagamento único para 6 meses. Melhor custo-benefício!',
    valor: 77.90,
    duracao: 6,
    recorrente: false,
    destaque: true,
    icone: '⭐'
  }
};
```

### Modelos de Banco de Dados

**Tabela `asaas_pagamento`:**
- `tipo_plano`: ENUM('ASSINATURA', 'PACOTE')
- `duracao_meses`: INTEGER (1, 3, 6)
- `valor_total`: DECIMAL(10,2)
- `valor_parcela`: DECIMAL(10,2)
- `forma_pagamento`: ENUM('CARTAO_CREDITO', 'BOLETO', 'PIX')

---

## 🚀 Como Usar

### 1. Frontend - Seleção de Planos
```javascript
// Navegar para checkout
navigate('/checkout');

// Ou com plano pré-selecionado
navigate('/checkout?plano=PACOTE_6_MESES');
```

### 2. Backend - Processar Pagamento
```javascript
// Para assinatura recorrente
const resultado = await asaasService.criarAssinatura(usuario, plano, formaPagamento);

// Para pacotes
const resultado = await asaasService.criarPagamentoPacote(
  usuario, plano, formaPagamento, numeroParcelas, duracaoMeses
);
```

### 3. Webhook - Confirmação de Pagamento
O sistema processa automaticamente as notificações do Asaas via webhook:
- `PAYMENT_RECEIVED`: Pagamento confirmado
- `PAYMENT_OVERDUE`: Pagamento em atraso
- `SUBSCRIPTION_RENEWED`: Assinatura renovada

---

## 🔐 Segurança e Validações

### Validações Implementadas:
- ✅ CPF válido (algoritmo da Receita Federal)
- ✅ Email formato válido
- ✅ Telefone formato brasileiro
- ✅ Formas de pagamento permitidas por tipo de plano
- ✅ Duração de pacotes válidas (3 ou 6 meses)
- ✅ Autenticação obrigatória para criação de pagamentos

### Ambiente de Desenvolvimento:
- **API Asaas:** Sandbox
- **Chave API:** Configurada para testes
- **Webhooks:** URL de desenvolvimento configurada

### Ambiente de Produção:
- **API Asaas:** Produção
- **Chave API:** Chave real (configurar em .env)
- **Webhooks:** URL de produção

---

## 📊 Métricas e Acompanhamento

### Logs Implementados:
- Criação de clientes Asaas
- Processamento de pagamentos
- Webhooks recebidos
- Erros de integração

### Tabelas de Controle:
- `asaas_cliente`: Clientes criados no Asaas
- `asaas_pagamento`: Pagamentos processados
- `asaas_webhook_log`: Logs de webhooks recebidos

---

## 🔄 Próximos Passos

### Funcionalidades Futuras:
- [ ] Cancelamento de assinaturas via interface
- [ ] Relatórios de pagamentos
- [ ] Notificações por email
- [ ] Gestão de inadimplência
- [ ] Cupons de desconto
- [ ] Planos corporativos

### Melhorias Técnicas:
- [ ] Testes automatizados
- [ ] Retry automático para falhas
- [ ] Cache de configurações de planos
- [ ] Monitoramento de performance
- [ ] Logs estruturados

---

**Última atualização:** $(date)
**Versão:** 1.0.0
**Responsável:** Equipe de Desenvolvimento 