-- =====================================================
-- DDL: Tabela asaas_pagamento - Nova Estrutura
-- Sistema de Mentoria - Integração Asaas
-- =====================================================

-- 1. Remover tabela existente (se necessário)
-- DROP TABLE IF EXISTS asaas_pagamento CASCADE;

-- 2. Criar tabela com nova estrutura
CREATE TABLE IF NOT EXISTS asaas_pagamento (
    -- Chave primária
    idasaaspagamento SERIAL PRIMARY KEY,
    
    -- ✅ NOVO CAMPO: Relaciona com cliente Asaas
    id_cliente_asaas VARCHAR(50) NOT NULL,
    
    -- IDs do Asaas para rastreamento
    id_pagamento_asaas VARCHAR(255) NULL,
    id_assinatura_asaas VARCHAR(255) NULL,
    id_parcelamento_asaas VARCHAR(255) NULL,
    
    -- Informações do plano
    tipo_plano VARCHAR(20) NOT NULL CHECK (tipo_plano IN ('ASSINATURA', 'PACOTE')),
    duracao_meses INTEGER NOT NULL,
    
    -- Informações de pagamento
    forma_pagamento VARCHAR(20) NOT NULL CHECK (forma_pagamento IN ('CARTAO_CREDITO', 'BOLETO', 'PIX')),
    numero_parcelas INTEGER DEFAULT 1,
    valor_total DECIMAL(10,2) NOT NULL,
    valor_parcela DECIMAL(10,2) NOT NULL,
    
    -- Links e códigos de pagamento
    link_pagamento VARCHAR(255) NULL,
    codigo_pix VARCHAR(255) NULL,
    
    -- Status do pagamento
    situacao VARCHAR(50) NOT NULL DEFAULT 'PENDENTE' CHECK (situacao IN (
        'PENDENTE',
        'RECEBIDO', 
        'CONFIRMADO',
        'ATRASADO',
        'DEVOLVIDO',
        'RECEBIDO_EM_DINHEIRO',
        'DEVOLUCAO_SOLICITADA',
        'CONTESTACAO_SOLICITADA',
        'EM_DISPUTA',
        'AGUARDANDO_REVERSAO_CONTESTACAO',
        'RECUPERACAO_SOLICITADA',
        'RECUPERADO',
        'ANALISE_RISCO'
    )),
    
    -- Datas importantes
    data_vencimento DATE NOT NULL,
    data_confirmacao DATE NULL,
    proxima_cobranca DATE NULL,
    
    -- Controle de sistema
    excluido BOOLEAN DEFAULT FALSE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_asaas_pagamento_cliente_asaas 
ON asaas_pagamento (id_cliente_asaas);

CREATE INDEX IF NOT EXISTS idx_asaas_pagamento_id_pagamento 
ON asaas_pagamento (id_pagamento_asaas);

CREATE INDEX IF NOT EXISTS idx_asaas_pagamento_id_assinatura 
ON asaas_pagamento (id_assinatura_asaas);

CREATE INDEX IF NOT EXISTS idx_asaas_pagamento_situacao 
ON asaas_pagamento (situacao);

CREATE INDEX IF NOT EXISTS idx_asaas_pagamento_data_vencimento 
ON asaas_pagamento (data_vencimento);

-- 4. Comentários explicativos
COMMENT ON TABLE asaas_pagamento IS 'Tabela de pagamentos integrados com Asaas - Sistema de Mentoria';

COMMENT ON COLUMN asaas_pagamento.id_cliente_asaas IS 'ID do cliente no Asaas (ex: cus_000006789280) - relaciona com asaas_cliente.id_cliente_asaas';

COMMENT ON COLUMN asaas_pagamento.id_pagamento_asaas IS 'ID único da cobrança no Asaas (ex: pay_abc123def456)';

COMMENT ON COLUMN asaas_pagamento.id_assinatura_asaas IS 'ID da assinatura no Asaas (ex: sub_abc123def456) - NULL para pacotes';

COMMENT ON COLUMN asaas_pagamento.tipo_plano IS 'Tipo do plano: ASSINATURA (recorrente) ou PACOTE (pagamento único)';

COMMENT ON COLUMN asaas_pagamento.duracao_meses IS 'Duração em meses: 0 para assinatura indefinida, 3 ou 6 para pacotes';

COMMENT ON COLUMN asaas_pagamento.proxima_cobranca IS 'Data da próxima cobrança - NULL para pacotes (pagamento único)';

-- =====================================================
-- FLUXO DE INTEGRAÇÃO DOCUMENTADO
-- =====================================================

/*
FLUXO ATUAL (SEM MENTOR):
1. Cliente faz pagamento → Asaas confirma → Salva asaas_pagamento
2. Formulário de diagnóstico é liberado
3. Aluno preenche diagnóstico + escolhe mentor
4. 🔮 FUTURE: Mentor é notificado (feature pendente)
5. 🔮 FUTURE: Mentor valida pagamento → Cria alunoPlanos

RELACIONAMENTOS:
- asaas_pagamento.id_cliente_asaas → asaas_cliente.id_cliente_asaas
- asaas_cliente.idusuario → usuario.idusuario
- 🔮 FUTURE: Após diagnóstico → alunoPlanos.idusuario

TIPOS DE PLANOS:
1. ASSINATURA_MENSAL: R$ 297,00/mês (recorrente)
2. PACOTE_3_MESES: R$ 846,45 total (5% desconto)
3. PACOTE_6_MESES: R$ 1.603,80 total (10% desconto)

ESTRUTURA DE IDs ASAAS:
- Assinaturas: id_assinatura_asaas = id_pagamento_asaas (primeira cobrança)
- Próximas cobranças: id_assinatura_asaas fixo, id_pagamento_asaas único
- Pacotes: id_assinatura_asaas = NULL, apenas id_pagamento_asaas
*/

-- =====================================================
-- COMANDOS PARA MIGRAÇÃO DE DADOS EXISTENTES
-- =====================================================

/*
-- Se houver dados existentes, migrar assim:

-- 1. Adicionar coluna temporariamente como nullable
ALTER TABLE asaas_pagamento ADD COLUMN id_cliente_asaas VARCHAR(50) NULL;

-- 2. Atualizar registros existentes (exemplo)
UPDATE asaas_pagamento 
SET id_cliente_asaas = (
    SELECT ac.id_cliente_asaas 
    FROM asaas_cliente ac 
    JOIN usuario u ON ac.idusuario = u.idusuario 
    WHERE u.idusuario = 1 -- Substituir pela lógica correta
)
WHERE id_cliente_asaas IS NULL;

-- 3. Tornar campo obrigatório
ALTER TABLE asaas_pagamento ALTER COLUMN id_cliente_asaas SET NOT NULL;

-- 4. Remover campos antigos
ALTER TABLE asaas_pagamento DROP COLUMN IF EXISTS idalunoplano;
ALTER TABLE asaas_pagamento DROP COLUMN IF EXISTS PlanoId;
*/ 