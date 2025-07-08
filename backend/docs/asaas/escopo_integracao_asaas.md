# Escopo da Integração Asaas

## Necessidade de Implantação

- Integrar o sistema atual com o gateway de pagamento Asaas.
- Utilizar o checkout pronto do Asaas para cobranças seguras e práticas.
- Sincronizar dados dos usuários captados no checkout do Asaas com a base local, mantendo unicidade de cadastro.
- Gerenciar clientes/pagadores: buscar, conciliar e atualizar clientes do Asaas na base local.
- Permitir ativação manual de assinaturas/pagamentos para casos de pagamento externo, cortesia, transferência, etc.
- Registrar e conciliar todos os pagamentos (automáticos e manuais) e assinaturas, mantendo histórico e rastreabilidade.
- Preparar o sistema para expansão futura (ex: associação com planos de curso, upgrades, relatórios, etc.).

## Requisitos dos Planos de Assinatura

1. **Assinatura Recorrente**
   - Valor: R$297/mês
   - Pagamento: apenas cartão de crédito (restrição da API Asaas)
   - Cobrança automática mensal

2. **Plano Trimestral**
   - Valor: R$831
   - Pagamento: Pix/crédito à vista ou parcelado em até 6x no crédito
   - Cobrança única

3. **Plano Semestral**
   - Valor: R$1602
   - Pagamento: Pix/crédito à vista ou parcelado em até 6x no crédito
   - Cobrança única

## Funcionalidades do Gateway no Sistema

- Checkout pronto do Asaas: usuário é direcionado para o checkout, preenche dados e realiza o pagamento.
- Webhooks: sistema recebe notificações automáticas do Asaas sobre pagamentos, assinaturas, status, etc.
- Sincronização de clientes: rotina para buscar/atualizar clientes do Asaas na base local.
- Conciliação automática/manual: pagamentos e assinaturas são associados ao usuário local, mesmo que o cadastro seja feito depois do pagamento.
- Ativação manual: operador pode ativar planos e registrar pagamentos externos diretamente no sistema.
- Logs de eventos: todos os eventos recebidos do Asaas são registrados para auditoria, idempotência e troubleshooting.
- Flexibilidade para expansão: estrutura pronta para associar planos de curso, upgrades, relatórios, etc., no futuro.

## Estrutura das Tabelas Essenciais para Integração

> **Atenção:**
> As tabelas `Alunos` e `aluno_info` já existem no sistema e são utilizadas para identificação e informações cadastrais dos alunos.
> As tabelas `assinatura`, `pagamento` e `webhook_event` **ainda não existem** e deverão ser criadas para viabilizar a integração robusta com o Asaas.

### Tabela: Alunos (já existente)

```sql
CREATE TABLE public."Alunos" (
    id serial4 NOT NULL,
    nome varchar(255) NOT NULL,
    email varchar(255) NOT NULL,
    cpf varchar(255) NOT NULL,
    senha varchar(255) NULL,
    "createdAt" timestamptz NOT NULL,
    "updatedAt" timestamptz NOT NULL,
    CONSTRAINT "Alunos_cpf_key" UNIQUE (cpf),
    CONSTRAINT "Alunos_email_key" UNIQUE (email),
    CONSTRAINT "Alunos_pkey" PRIMARY KEY (id)
);
```

### Tabela: aluno_info (já existente)

```sql
CREATE TABLE public.aluno_info (
    idalunoinfo serial4 NOT NULL,
    idusuario int4 NOT NULL,
    email varchar(120) NOT NULL,
    cpf varchar(14) NULL,
    data_nascimento date NULL,
    data_criacao timestamp DEFAULT CURRENT_TIMESTAMP NULL,
    telefone varchar(20) NULL,
    status_cadastro public."enum_aluno_info_status_cadastro" DEFAULT 'PRE_CADASTRO'::enum_aluno_info_status_cadastro NOT NULL,
    status_pagamento public."enum_aluno_info_status_pagamento" DEFAULT 'PENDENTE'::enum_aluno_info_status_pagamento NOT NULL,
    cep varchar(9) NULL,
    CONSTRAINT aluno_info_idusuario_key UNIQUE (idusuario),
    CONSTRAINT aluno_info_pkey PRIMARY KEY (idalunoinfo),
    CONSTRAINT fk_aluno_usuario FOREIGN KEY (idusuario) REFERENCES public.usuario(idusuario) ON DELETE CASCADE
);
```

### Tabela: assinatura (a ser criada)

```sql
CREATE TABLE public.assinatura (
    id serial PRIMARY KEY,
    idusuario int4 NOT NULL REFERENCES public.usuario(idusuario),
    id_asaas varchar(50),
    ciclo varchar(20) NOT NULL,
    status varchar(20) NOT NULL,
    data_inicio timestamptz NOT NULL,
    data_fim timestamptz,
    valor decimal(10,2) NOT NULL,
    forma_pagamento varchar(20) NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
```

### Tabela: pagamento (a ser criada)

```sql
CREATE TABLE public.pagamento (
    id serial PRIMARY KEY,
    idusuario int4 REFERENCES public.usuario(idusuario),
    assinatura_id int4 REFERENCES public.assinatura(id),
    id_asaas varchar(50),
    valor decimal(10,2) NOT NULL,
    status varchar(20) NOT NULL,
    data_vencimento timestamptz,
    data_pagamento timestamptz,
    forma_pagamento varchar(20) NOT NULL,
    tipo varchar(20) NOT NULL,
    json_detalhe jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
```

### Tabela: webhook_event (a ser criada)

```sql
CREATE TABLE public.webhook_event (
    id serial PRIMARY KEY,
    event_id varchar(100) NOT NULL UNIQUE,
    tipo_evento varchar(50) NOT NULL,
    payload jsonb NOT NULL,
    status_processamento varchar(20) DEFAULT 'pendente',
    data_recebimento timestamptz DEFAULT now() NOT NULL,
    data_processamento timestamptz
);
``` 