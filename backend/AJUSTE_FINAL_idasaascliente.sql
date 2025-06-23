-- =====================================================
-- AJUSTE FINAL: Adicionar campo idasaascliente
-- (Campo id_cliente_asaas já foi removido anteriormente)
-- =====================================================

-- 1. Verificar estrutura atual
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'asaas_pagamento' 
ORDER BY ordinal_position;

-- 2. Verificar se o campo idasaascliente já existe
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'asaas_pagamento' 
AND column_name = 'idasaascliente';

-- =====================================================
-- ADICIONAR CAMPO E ESTRUTURAS
-- =====================================================

-- 3. Adicionar campo idasaascliente (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'asaas_pagamento' 
        AND column_name = 'idasaascliente'
    ) THEN
        ALTER TABLE public.asaas_pagamento 
        ADD COLUMN idasaascliente INTEGER;
        
        RAISE NOTICE '✅ Campo idasaascliente adicionado';
    ELSE
        RAISE NOTICE '⚠️  Campo idasaascliente já existe';
    END IF;
END $$;

-- 4. Preencher valores NULL com primeiro cliente disponível
UPDATE public.asaas_pagamento 
SET idasaascliente = (
    SELECT idasaascliente 
    FROM public.asaas_cliente 
    LIMIT 1
)
WHERE idasaascliente IS NULL;

-- 5. Tornar campo obrigatório
ALTER TABLE public.asaas_pagamento 
ALTER COLUMN idasaascliente SET NOT NULL;

-- 6. Remover índice antigo (se existir)
DROP INDEX IF EXISTS idx_asaas_pagamento_cliente_asaas;

-- 7. Criar índice correto
CREATE INDEX IF NOT EXISTS idx_asaas_pagamento_cliente 
ON public.asaas_pagamento(idasaascliente);

-- 8. Adicionar foreign key constraint (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_asaas_pagamento_cliente'
        AND table_name = 'asaas_pagamento'
    ) THEN
        ALTER TABLE public.asaas_pagamento 
        ADD CONSTRAINT fk_asaas_pagamento_cliente 
        FOREIGN KEY (idasaascliente) 
        REFERENCES public.asaas_cliente(idasaascliente) 
        ON DELETE RESTRICT ON UPDATE CASCADE;
        
        RAISE NOTICE '✅ Foreign key constraint adicionada';
    ELSE
        RAISE NOTICE '⚠️  Foreign key constraint já existe';
    END IF;
END $$;

-- 9. Adicionar comentário
COMMENT ON COLUMN public.asaas_pagamento.idasaascliente IS 
'FK para asaas_cliente.idasaascliente - Relacionamento direto com PK';

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- 10. Verificar estrutura final
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'asaas_pagamento' 
AND column_name = 'idasaascliente';

-- 11. Verificar constraint criada
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'asaas_pagamento';

-- 12. Verificar dados com relacionamento
SELECT ap.idasaaspagamento, ap.idasaascliente, ac.id_cliente_asaas, ac.idusuario
FROM public.asaas_pagamento ap
LEFT JOIN public.asaas_cliente ac ON ap.idasaascliente = ac.idasaascliente
LIMIT 5; 