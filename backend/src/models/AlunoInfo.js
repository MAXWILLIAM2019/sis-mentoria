const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const AlunoInfo = sequelize.define('AlunoInfo', {
  IdAlunoInfo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'idalunoinfo'
  },
  IdUsuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'usuario',
      key: 'idusuario'
    },
    field: 'idusuario'
  },
  email: {
    type: DataTypes.STRING(120),
    allowNull: false
  },
  cpf: {
    type: DataTypes.STRING(14),
    allowNull: true
  },
  telefone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'telefone'
  },
  cep: {
    type: DataTypes.STRING(9),
    allowNull: true,
    field: 'cep'
  },
  status_cadastro: {
    type: DataTypes.ENUM('PRE_CADASTRO', 'PAGAMENTO_PENDENTE', 'PAGAMENTO_CONFIRMADO', 'PLANO_ATRIBUIDO', 'ATIVO'),
    defaultValue: 'PRE_CADASTRO',
    allowNull: false,
    field: 'status_cadastro'
  },
  status_pagamento: {
    type: DataTypes.ENUM('PENDENTE', 'CONFIRMADO', 'CANCELADO'),
    defaultValue: 'PENDENTE',
    allowNull: false,
    field: 'status_pagamento'
  },
  data_nascimento: {
    type: DataTypes.DATE,
    allowNull: true
  },
  data_criacao: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'aluno_info',
  timestamps: false
});

module.exports = AlunoInfo; 