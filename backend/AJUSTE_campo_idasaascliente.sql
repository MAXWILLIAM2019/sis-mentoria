-- =====================================================
-- AJUSTE: Alterar campo de relacionamento
-- De: id_cliente_asaas (VARCHAR) 
-- Para: idasaascliente (INTEGER - PK da tabela asaas_cliente)
-- =====================================================

-- 1. Verificar estrutura atual
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'asaas_cliente' 
ORDER BY ordinal_position;

-- 2. Ver dados atuais para entender o mapeamento
SELECT idasaascliente, id_cliente_asaas, idusuario 
FROM public.asaas_cliente 
LIMIT 5;

-- 3. Ver dados atuais da tabela asaas_pagamento
SELECT idasaaspagamento, id_cliente_asaas, tipo_plano, situacao 
FROM public.asaas_pagamento 
LIMIT 5;

-- =====================================================
-- EXECUÇÃO DO AJUSTE
-- =====================================================

-- 4. Remover índice atual
DROP INDEX IF EXISTS idx_asaas_pagamento_cliente_asaas;

-- 5. Adicionar novo campo (temporariamente nullable)
ALTER TABLE public.asaas_pagamento 
ADD COLUMN idasaascliente INTEGER NULL;

-- 6. Popular o novo campo baseado no mapeamento
-- IMPORTANTE: Execute este UPDATE apenas se houver dados para migrar
-- UPDATE public.asaas_pagamento 
-- SET idasaascliente = (
--     SELECT ac.idasaascliente 
--     FROM public.asaas_cliente ac 
--     WHERE ac.id_cliente_asaas = asaas_pagamento.id_cliente_asaas
-- );

-- 7. Remover campo antigo
ALTER TABLE public.asaas_pagamento 
DROP COLUMN id_cliente_asaas;

-- 8. Tornar o novo campo obrigatório
ALTER TABLE public.asaas_pagamento 
ALTER COLUMN idasaascliente SET NOT NULL;

-- 9. Criar foreign key constraint
ALTER TABLE public.asaas_pagamento 
ADD CONSTRAINT fk_asaas_pagamento_cliente 
FOREIGN KEY (idasaascliente) 
REFERENCES public.asaas_cliente(idasaascliente) 
ON DELETE RESTRICT ON UPDATE CASCADE;

-- 10. Criar índice para performance
CREATE INDEX idx_asaas_pagamento_cliente 
ON public.asaas_pagamento(idasaascliente);

-- 11. Adicionar comentário
COMMENT ON COLUMN public.asaas_pagamento.idasaascliente IS 
'FK para asaas_cliente.idasaascliente - Relacionamento direto com PK';

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- 12. Verificar estrutura final
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'asaas_pagamento' 
AND column_name = 'idasaascliente';

-- 13. Verificar constraint criada
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'asaas_pagamento'; 