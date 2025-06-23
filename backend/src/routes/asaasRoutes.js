/**
 * 🔥 ROTAS CRÍTICAS - SISTEMA DE PAGAMENTOS ASAAS
 * 
 * ⚠️  NÃO ALTERE SEM CONSULTAR EQUIPE DE DESENVOLVIMENTO
 * 
 * Este arquivo define todas as rotas relacionadas ao sistema de pagamentos.
 * Alterações podem quebrar o fluxo financeiro e causar problemas graves.
 * 
 * 🚨 ROTAS CRÍTICAS:
 * - /webhook: Recebe notificações do Asaas (PÚBLICO)
 * - /criar-assinatura: Assinaturas mensais recorrentes
 * - /criar-pagamento-pacote: Pacotes com desconto
 * 
 * 💰 TIPOS DE PLANOS SUPORTADOS:
 * 1. ASSINATURA MENSAL RECORRENTE - R$ 297,00/mês (sem parcelamento)
 * 2. PACOTE 3 MESES - R$ 282,15/mês × 3 = R$ 846,45 total (5% desconto)
 * 3. PACOTE 6 MESES - R$ 267,30/mês × 6 = R$ 1.603,80 total (10% desconto)
 * 
 * 📱 FORMAS DE PAGAMENTO:
 * - CARTAO_CREDITO, PIX
 * 
 * 🔄 WEBHOOK: POST /webhook (público - chamado pelo Asaas)
 * 
 * @version 2.0
 * @since 2024-12-21
 * @author Equipe de Desenvolvimento
 */
const express = require('express');
const router = express.Router();
const asaasWebhookController = require('../controllers/asaasWebhookController');
const asaasController = require('../controllers/asaasController');
// const { auth } = require('../middleware/auth'); // Removido - rotas agora são públicas

// === ROTAS PÚBLICAS ===

/**
 * Webhook do Asaas - recebe notificações de pagamento
 * Não precisa de autenticação pois é chamada pelo Asaas
 * 
 * @route POST /asaas/webhook
 * @access Public (Asaas)
 */
router.post('/webhook', asaasWebhookController.processarWebhook);

/**
 * Lista os tipos de planos disponíveis
 * Endpoint público para consulta dos planos e valores
 * 
 * @route GET /asaas/tipos-planos
 * @access Public
 */
router.get('/tipos-planos', asaasController.listarTiposPlanos);

// === ROTAS PÚBLICAS DE PAGAMENTO ===

/**
 * Cria assinatura mensal recorrente
 * TIPO: ASSINATURA_MENSAL
 * Valor: R$ 297,00/mês - Cobrança automática (sem parcelamento)
 * 
 * @route POST /asaas/criar-assinatura
 * @access Public (permite novos clientes)
 */
router.post('/criar-assinatura', asaasController.criarAssinatura);

/**
 * Cria pagamento único para pacotes
 * TIPOS: PACOTE_3_MESES, PACOTE_6_MESES
 * - 3 meses: R$ 282,15/mês × 3 = R$ 846,45 total (5% desconto)
 * - 6 meses: R$ 267,30/mês × 6 = R$ 1.603,80 total (10% desconto)
 * 
 * @route POST /asaas/criar-pagamento-pacote
 * @access Public (permite novos clientes)
 */
router.post('/criar-pagamento-pacote', asaasController.criarPagamentoPacote);

// === ROTAS DE TESTE (DESENVOLVIMENTO) ===

/**
 * Endpoints de teste para desenvolvimento
 * ATENÇÃO: Remover ou proteger em produção
 */
router.post('/teste/cliente', asaasController.criarClienteTeste);
router.post('/teste/assinatura', asaasController.criarAssinaturaTeste);
router.post('/teste/pacote', asaasController.criarPagamentoPacoteTeste);

// ENDPOINT TEMPORÁRIO - Confirmar pagamento manualmente (TESTE)
router.post('/confirmar-pagamento-teste/:id', asaasController.confirmarPagamentoTeste);

module.exports = router; 