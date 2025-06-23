-- =====================================================
-- AJUSTE SIMPLES: Forçar estrutura correta
-- (Não importa perder dados de teste)
-- =====================================================

-- 1. Limpar tabela (força)
TRUNCATE TABLE public.asaas_pagamento CASCADE;

-- 2. Remover todos os índices antigos
DROP INDEX IF EXISTS idx_asaas_pagamento_cliente_asaas;
DROP INDEX IF EXISTS idx_asaas_pagamento_cliente;

-- 3. Remover todas as constraints antigas
ALTER TABLE public.asaas_pagamento DROP CONSTRAINT IF EXISTS fk_asaas_pagamento_cliente;

-- 4. Remover campo antigo (se existir)
ALTER TABLE public.asaas_pagamento DROP COLUMN IF EXISTS id_cliente_asaas;

-- 5. Adicionar campo correto
ALTER TABLE public.asaas_pagamento ADD COLUMN IF NOT EXISTS idasaascliente INTEGER NOT NULL DEFAULT 1;

-- 6. Criar foreign key
ALTER TABLE public.asaas_pagamento 
ADD CONSTRAINT fk_asaas_pagamento_cliente 
FOREIGN KEY (idasaascliente) 
REFERENCES public.asaas_cliente(idasaascliente) 
ON DELETE RESTRICT ON UPDATE CASCADE;

-- 7. Criar índice
CREATE INDEX idx_asaas_pagamento_cliente 
ON public.asaas_pagamento(idasaascliente);

-- 8. Remover default (após criar a estrutura)
ALTER TABLE public.asaas_pagamento ALTER COLUMN idasaascliente DROP DEFAULT;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- 9. Mostrar estrutura final
\d public.asaas_pagamento; 