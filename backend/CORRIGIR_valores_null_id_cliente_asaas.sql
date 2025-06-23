-- =====================================================
-- CORREÇÃO: Valores NULL em id_cliente_asaas
-- =====================================================

-- 1. Verificar quantos registros têm valores NULL
SELECT COUNT(*) as total_registros_null
FROM public.asaas_pagamento 
WHERE id_cliente_asaas IS NULL;

-- 2. Ver detalhes dos registros com NULL
SELECT idasaaspagamento, id_pagamento_asaas, id_assinatura_asaas, 
       tipo_plano, valor_total, situacao, data_criacao
FROM public.asaas_pagamento 
WHERE id_cliente_asaas IS NULL
ORDER BY data_criacao DESC;

-- =====================================================
-- OPÇÕES PARA CORRIGIR OS VALORES NULL:
-- =====================================================

-- OPÇÃO 1: Se houver poucos registros de teste, DELETAR
/*
DELETE FROM public.asaas_pagamento 
WHERE id_cliente_asaas IS NULL;
*/

-- OPÇÃO 2: Atribuir um cliente padrão (se existir um cliente de teste)
/*
-- Primeiro, verificar se existe algum cliente na tabela asaas_cliente
SELECT id_cliente_asaas, idusuario FROM public.asaas_cliente LIMIT 5;

-- Depois, atualizar com um cliente existente
UPDATE public.asaas_pagamento 
SET id_cliente_asaas = 'cus_XXXXXX'  -- Substituir pelo ID real
WHERE id_cliente_asaas IS NULL;
*/

-- OPÇÃO 3: Criar um cliente "TESTE" temporário e associar
/*
-- Verificar se existe usuário de teste (ID 1, por exemplo)
SELECT idusuario, nome, email FROM public.usuario WHERE idusuario = 1;

-- Se não existir cliente para esse usuário, criar um cliente de teste
INSERT INTO public.asaas_cliente (idusuario, id_cliente_asaas, nome, email, cpf, telefone, data_criacao)
VALUES (1, 'cus_teste_migracao', 'Cliente Teste Migração', 'teste@exemplo.com', '00000000000', '11999999999', CURRENT_TIMESTAMP);

-- Associar registros NULL ao cliente de teste
UPDATE public.asaas_pagamento 
SET id_cliente_asaas = 'cus_teste_migracao'
WHERE id_cliente_asaas IS NULL;
*/

-- =====================================================
-- APÓS CORRIGIR OS VALORES NULL:
-- =====================================================

-- Verificar se ainda há valores NULL
SELECT COUNT(*) as registros_null_restantes
FROM public.asaas_pagamento 
WHERE id_cliente_asaas IS NULL;

-- Se retornar 0, então pode tornar o campo obrigatório:
-- ALTER TABLE public.asaas_pagamento 
-- ALTER COLUMN id_cliente_asaas SET NOT NULL; 