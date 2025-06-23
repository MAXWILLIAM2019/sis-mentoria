/**
 * 🔥 MODEL CRÍTICO - ASAAS PAGAMENTO
 * 
 * ⚠️  NÃO ALTERE SEM CONSULTAR EQUIPE DE DESENVOLVIMENTO
 * 
 * Este model gerencia todos os pagamentos do sistema Asaas.
 * Alterações podem quebrar o fluxo financeiro e causar problemas graves.
 * 
 * 🚨 PONTOS CRÍTICOS:
 * - Relacionamento PK→PK com asaas_cliente
 * - Foreign Key constraint obrigatória
 * - Campos de controle de assinatura/pagamento
 * - Status de pagamento (PENDENTE/CONFIRMADO/CANCELADO)
 * 
 * @version 2.0
 * @since 2024-12-21
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const AsaasPagamento = sequelize.define('AsaasPagamento', {
    idasaaspagamento: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'idasaaspagamento'
    },
    idasaascliente: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'idasaascliente',
        comment: 'FK para asaas_cliente.idasaascliente - Relacionamento direto com PK'
    },
    id_pagamento_asaas: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'id_pagamento_asaas'
    },
    id_assinatura_asaas: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'id_assinatura_asaas'
    },
    id_parcelamento_asaas: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'id_parcelamento_asaas'
    },
    tipo_plano: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
            isIn: [['ASSINATURA', 'PACOTE']]
        },
        field: 'tipo_plano'
    },
    duracao_meses: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'duracao_meses'
    },
    forma_pagamento: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
            isIn: [['CARTAO_CREDITO', 'BOLETO', 'PIX']]
        },
        field: 'forma_pagamento'
    },
    numero_parcelas: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        field: 'numero_parcelas'
    },
    valor_total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'valor_total'
    },
    valor_parcela: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'valor_parcela'
    },
    link_pagamento: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'link_pagamento'
    },
    codigo_pix: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'codigo_pix'
    },
    situacao: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'PENDENTE',
        validate: {
            isIn: [[
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
            ]]
        },
        field: 'situacao'
    },
    data_vencimento: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'data_vencimento'
    },
    data_confirmacao: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'data_confirmacao'
    },
    proxima_cobranca: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'proxima_cobranca'
    },
    excluido: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'excluido'
    },
    data_criacao: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'data_criacao'
    },
    data_atualizacao: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'data_atualizacao'
    }
}, {
    tableName: 'asaas_pagamento',
    schema: 'public',
    timestamps: false,
    indexes: [
        {
            fields: ['idasaascliente'],
            name: 'idx_asaas_pagamento_cliente'
        }
    ]
});

// ✅ Relacionamento com AsaasCliente já implementado no index.js
// AsaasPagamento.belongsTo(AsaasCliente, {
//     foreignKey: 'idasaascliente',
//     targetKey: 'idasaascliente',
//     as: 'cliente'
// });

module.exports = AsaasPagamento; 