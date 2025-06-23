const express = require('express');
const router = express.Router();
const alunoRoutes = require('./alunoRoutes');
const asaasRoutes = require('./asaasRoutes');

// Rotas do aluno
router.use('/aluno', alunoRoutes);

// Rotas do Asaas
router.use('/asaas', asaasRoutes);

module.exports = router; 