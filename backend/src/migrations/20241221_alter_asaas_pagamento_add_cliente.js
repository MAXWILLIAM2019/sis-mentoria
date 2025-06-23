/**
 * Migration: Alterar tabela asaas_pagamento
 * - Remove campos: idalunoplano, PlanoId
 * - Adiciona campo: id_cliente_asaas
 * - Remove índice antigo e cria novo
 * 
 * Motivo: Separar responsabilidades - pagamento não deve estar diretamente
 * vinculado ao plano. A associação será feita pelo mentor após diagnóstico.
 */

const { QueryInterface, DataTypes } = require('sequelize');

module.exports = {
    up: async (queryInterface) => {
        console.log('🔄 Iniciando alteração da tabela asaas_pagamento...');
        
        try {
            // 1. Remover índice existente se existir
            try {
                await queryInterface.removeIndex('asaas_pagamento', 'fk_asaas_pagamento_alunoplano');
                console.log('✅ Índice fk_asaas_pagamento_alunoplano removido');
            } catch (error) {
                console.log('ℹ️ Índice fk_asaas_pagamento_alunoplano não existe ou já foi removido');
            }
            
            // 2. Adicionar campo id_cliente_asaas
            await queryInterface.addColumn('asaas_pagamento', 'id_cliente_asaas', {
                type: DataTypes.STRING(50),
                allowNull: true, // Temporariamente nullable para dados existentes
                field: 'id_cliente_asaas'
            });
            console.log('✅ Campo id_cliente_asaas adicionado');
            
            // 3. Remover campos antigos
            await queryInterface.removeColumn('asaas_pagamento', 'idalunoplano');
            console.log('✅ Campo idalunoplano removido');
            
            await queryInterface.removeColumn('asaas_pagamento', 'PlanoId');
            console.log('✅ Campo PlanoId removido');
            
            // 4. Criar índice para o novo campo
            await queryInterface.addIndex('asaas_pagamento', ['id_cliente_asaas'], {
                name: 'idx_asaas_pagamento_cliente_asaas'
            });
            console.log('✅ Índice idx_asaas_pagamento_cliente_asaas criado');
            
            console.log('🎉 Alteração da tabela asaas_pagamento concluída com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro na migration:', error);
            throw error;
        }
    },

    down: async (queryInterface) => {
        console.log('🔄 Revertendo alterações da tabela asaas_pagamento...');
        
        try {
            // 1. Remover índice novo
            await queryInterface.removeIndex('asaas_pagamento', 'idx_asaas_pagamento_cliente_asaas');
            
            // 2. Adicionar campos antigos
            await queryInterface.addColumn('asaas_pagamento', 'idalunoplano', {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'idalunoplano'
            });
            
            await queryInterface.addColumn('asaas_pagamento', 'PlanoId', {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'PlanoId'
            });
            
            // 3. Remover campo novo
            await queryInterface.removeColumn('asaas_pagamento', 'id_cliente_asaas');
            
            // 4. Recriar índice antigo
            await queryInterface.addIndex('asaas_pagamento', ['idalunoplano', 'PlanoId'], {
                name: 'fk_asaas_pagamento_alunoplano'
            });
            
            console.log('✅ Reversão concluída');
            
        } catch (error) {
            console.error('❌ Erro na reversão:', error);
            throw error;
        }
    }
}; 