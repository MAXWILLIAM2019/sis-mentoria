const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const AsaasWebhookLog = sequelize.define('AsaasWebhookLog', {
    idwebhooklog: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'idwebhooklog'
    },
    evento: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'evento'
    },
    idasaaspagamento: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'asaas_pagamento',
            key: 'idasaaspagamento'
        },
        field: 'idasaaspagamento'
    },
    dados_evento: {
        type: DataTypes.JSONB,
        allowNull: false,
        field: 'dados_evento'
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
    tableName: 'asaas_webhook_log',
    schema: 'public',
    timestamps: false
});

module.exports = AsaasWebhookLog; 