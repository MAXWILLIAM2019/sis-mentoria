/**
 * 🔥 MODEL CRÍTICO - ASAAS CLIENTE
 * 
 * ⚠️  NÃO ALTERE SEM CONSULTAR EQUIPE DE DESENVOLVIMENTO
 * 
 * Este model gerencia os clientes do sistema Asaas.
 * Controla a reutilização de clientes e evita duplicações.
 * 
 * 🚨 PONTOS CRÍTICOS:
 * - Constraint UNIQUE em idusuario (um cliente por usuário)
 * - Relacionamento com usuario (FK)
 * - Reutilização automática via getOrCreateCustomer()
 * 
 * @version 2.0
 * @since 2024-12-21
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const AsaasCliente = sequelize.define('AsaasCliente', {
    idasaascliente: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'idasaascliente'
    },
    idusuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: 'usuario',
            key: 'idusuario'
        },
        field: 'idusuario'
    },
    id_cliente_asaas: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'id_cliente_asaas'
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
    tableName: 'asaas_cliente',
    schema: 'public',
    timestamps: false
});

module.exports = AsaasCliente; 