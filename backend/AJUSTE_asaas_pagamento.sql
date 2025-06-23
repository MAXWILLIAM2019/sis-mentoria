-- =====================================================
-- AJUSTE EXATO: Tabela asaas_pagamento
-- Remove: idalunoplano, PlanoId
-- Adiciona: id_cliente_asaas
-- =====================================================

-- 1. Remover constraint de foreign key
ALTER TABLE public.asaas_pagamento 
DROP CONSTRAINT IF EXISTS fk_asaas_pagamento_alunoplano;

-- 2. Remover índice existente
DROP INDEX IF EXISTS fk_asaas_pagamento_alunoplano;

-- 3. Adicionar novo campo (temporariamente nullable)
ALTER TABLE public.asaas_pagamento 
ADD COLUMN id_cliente_asaas VARCHAR(50) NULL;

-- 4. Remover campos antigos
ALTER TABLE public.asaas_pagamento 
DROP COLUMN IF EXISTS idalunoplano;

ALTER TABLE public.asaas_pagamento 
DROP COLUMN IF EXISTS "PlanoId";

-- 5. Tornar o novo campo obrigatório (após popular dados se necessário)
-- ALTER TABLE public.asaas_pagamento 
-- ALTER COLUMN id_cliente_asaas SET NOT NULL;

-- 6. Criar novo índice
CREATE INDEX idx_asaas_pagamento_cliente_asaas 
ON public.asaas_pagamento (id_cliente_asaas);

-- 7. Adicionar comentário explicativo
COMMENT ON COLUMN public.asaas_pagamento.id_cliente_asaas 
IS 'ID do cliente no Asaas (ex: cus_000006789280) - relaciona com asaas_cliente.id_cliente_asaas';

-- =====================================================
-- COMANDOS OPCIONAIS (se houver dados para migrar)
-- =====================================================

/*
-- Caso precise popular o campo id_cliente_asaas com dados existentes:

UPDATE public.asaas_pagamento 
SET id_cliente_asaas = 'cus_exemplo123'  -- Substituir pela lógica correta
WHERE id_cliente_asaas IS NULL;

-- Depois tornar obrigatório:
ALTER TABLE public.asaas_pagamento 
ALTER COLUMN id_cliente_asaas SET NOT NULL;
*/

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar estrutura final da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'asaas_pagamento' 
  AND table_schema = 'public'
ORDER BY ordinal_position; 