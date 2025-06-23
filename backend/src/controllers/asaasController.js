/**
 * Controller de Integração Asaas - Sistema de Pagamentos
 * 
 * TIPOS DE PLANOS IMPLEMENTADOS:
 * 1. ASSINATURA MENSAL RECORRENTE - Cobrança automática todo mês
 * 2. PACOTE 3 MESES - Pagamento único para 3 meses de acesso
 * 3. PACOTE 6 MESES - Pagamento único para 6 meses de acesso
 * 
 * FORMAS DE PAGAMENTO SUPORTADAS:
 * - CARTAO_CREDITO: Aprovação imediata
 * - BOLETO: Vencimento em 3 dias úteis  
 * - PIX: Pagamento instantâneo
 * 
 * AMBIENTE: Configurado para Sandbox (desenvolvimento)
 * API_KEY: Sandbox key configurada no asaasService.js
 */
const asaasService = require('../services/asaasService');

const asaasController = {
    /**
     * Cria uma assinatura mensal recorrente
     * 
     * TIPO DE PLANO: ASSINATURA_MENSAL
     * - Cobrança automática todo mês
     * - Valor: R$ 297,00/mês (sem parcelamento)
     * - Cancelamento: A qualquer momento
     * 
     * @route POST /asaas/criar-assinatura
     * @access Private (requer autenticação)
     */
    async criarAssinatura(req, res) {
        try {
            const { usuario, plano, formaPagamento } = req.body;

            console.log('=== CRIANDO ASSINATURA MENSAL RECORRENTE ===');
            console.log('Dados recebidos:', { usuario: usuario.nome, plano: plano.nome, formaPagamento });
            console.log('Dados completos do plano:', plano);
            console.log('Tem dados do cartão?', !!plano.cartao);

            // Validação dos dados obrigatórios
            if (!usuario || !plano || !formaPagamento) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados obrigatórios não fornecidos (usuario, plano, formaPagamento)'
                });
            }

            // Valida forma de pagamento para assinatura
            const formasPermitidas = ['CARTAO_CREDITO', 'PIX'];
            if (!formasPermitidas.includes(formaPagamento)) {
                return res.status(400).json({
                    success: false,
                    message: 'Forma de pagamento não permitida para assinaturas. Use: CARTAO_CREDITO ou PIX'
                });
            }

            const resultado = await asaasService.criarAssinatura(usuario, plano, formaPagamento);

            console.log('Assinatura criada com sucesso:', resultado.pagamento.idasaaspagamento);

            return res.json({
                success: true,
                message: 'Assinatura mensal criada com sucesso',
                data: {
                    pagamento: resultado.pagamento,
                    asaasId: resultado.assinatura.id,
                    linkPagamento: resultado.linkPagamento,
                    codigoPix: resultado.codigoPix
                }
            });
        } catch (error) {
            console.error('Erro ao criar assinatura:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro ao criar assinatura',
                error: error.message
            });
        }
    },

    /**
     * Cria um pagamento único para pacotes (3 ou 6 meses)
     * 
     * TIPOS DE PLANOS: PACOTE_3_MESES, PACOTE_6_MESES
     * - PACOTE_3_MESES: R$ 282,15/mês × 3 = R$ 846,45 total (5% desconto)
     * - PACOTE_6_MESES: R$ 267,30/mês × 6 = R$ 1.603,80 total (10% desconto)
     * - Pagamento único (não recorrente)
     * - Desconto progressivo por duração
     * 
     * @route POST /asaas/criar-pagamento-pacote
     * @access Private (requer autenticação)
     */
    async criarPagamentoPacote(req, res) {
        try {
            const { usuario, plano, formaPagamento, duracaoMeses, numeroParcelas = 1 } = req.body;

            console.log('=== CRIANDO PAGAMENTO DE PACOTE ===');
            console.log('Dados recebidos:', { 
                usuario: usuario.nome, 
                plano: plano.nome, 
                formaPagamento, 
                duracaoMeses,
                numeroParcelas 
            });
            console.log('Dados completos do plano:', plano);
            console.log('Tem dados do cartão?', !!plano.cartao);

            // Validação dos dados obrigatórios
            if (!usuario || !plano || !formaPagamento || !duracaoMeses) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados obrigatórios não fornecidos (usuario, plano, formaPagamento, duracaoMeses)'
                });
            }

            // Valida duração do pacote
            const duracoesPermitidas = [3, 6];
            if (!duracoesPermitidas.includes(duracaoMeses)) {
                return res.status(400).json({
                    success: false,
                    message: 'Duração de pacote não permitida. Use: 3 ou 6 meses'
                });
            }

            // Valida forma de pagamento
            const formasPermitidas = ['CARTAO_CREDITO', 'PIX'];
            if (!formasPermitidas.includes(formaPagamento)) {
                return res.status(400).json({
                    success: false,
                    message: 'Forma de pagamento não permitida. Use: CARTAO_CREDITO ou PIX'
                });
            }

            const resultado = await asaasService.criarPagamentoPacote(
                usuario, 
                plano, 
                formaPagamento, 
                numeroParcelas, 
                duracaoMeses
            );

            console.log('Pagamento de pacote criado com sucesso:', resultado.pagamentoDB.idasaaspagamento);

            return res.json({
                success: true,
                message: `Pagamento de pacote ${duracaoMeses} meses criado com sucesso`,
                data: {
                    pagamento: resultado.pagamentoDB,
                    asaasId: resultado.pagamento.id,
                    linkPagamento: resultado.linkPagamento,
                    codigoPix: resultado.codigoPix,
                    valorTotal: resultado.pagamentoDB.valor_total,
                    duracaoMeses: duracaoMeses
                }
            });
        } catch (error) {
            console.error('Erro ao criar pagamento de pacote:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro ao criar pagamento de pacote',
                error: error.message
            });
        }
    },

    /**
     * Endpoint para listar os tipos de planos disponíveis
     * 
     * VALORES ATUALIZADOS:
     * - ASSINATURA_MENSAL: R$ 297,00/mês (sem parcelamento)
     * - PACOTE_3_MESES: R$ 282,15/mês (5% desconto) = R$ 846,45 total
     * - PACOTE_6_MESES: R$ 267,30/mês (10% desconto) = R$ 1.603,80 total
     * 
     * Retorna a configuração dos planos com valores e descrições
     * Para uso no frontend na seleção de planos
     * 
     * @route GET /asaas/tipos-planos
     * @access Public
     */
    async listarTiposPlanos(req, res) {
        try {
            const tiposPlanos = {
                ASSINATURA_MENSAL: {
                    tipo: 'ASSINATURA_MENSAL',
                    nome: 'Assinatura Mensal',
                    descricao: 'Cobrança automática todo mês. Cancele quando quiser.',
                    valor: 297.00,
                    duracao: 1,
                    recorrente: true,
                    destaque: false,
                    formasPagamento: ['CARTAO_CREDITO', 'PIX']
                },
                PACOTE_3_MESES: {
                    tipo: 'PACOTE_3_MESES',
                    nome: 'Pacote 3 Meses',
                    descricao: 'Pagamento único para 3 meses de acesso completo.',
                    valor: 282.15, // Valor mensal com 5% desconto (297 * 0.95)
                    valorTotal: 846.45, // 282.15 × 3
                    duracao: 3,
                    recorrente: false,
                    destaque: false,
                    desconto: 5, // 5% de desconto
                    formasPagamento: ['CARTAO_CREDITO', 'PIX']
                },
                PACOTE_6_MESES: {
                    tipo: 'PACOTE_6_MESES',
                    nome: 'Pacote 6 Meses',
                    descricao: 'Pagamento único para 6 meses. Melhor custo-benefício!',
                    valor: 267.30, // Valor mensal com 10% desconto (297 * 0.90)
                    valorTotal: 1603.80, // 267.30 × 6
                    duracao: 6,
                    recorrente: false,
                    destaque: true, // Plano recomendado
                    desconto: 10, // 10% de desconto
                    formasPagamento: ['CARTAO_CREDITO', 'PIX']
                }
            };

            return res.json({
                success: true,
                data: tiposPlanos
            });
        } catch (error) {
            console.error('Erro ao listar tipos de planos:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro ao listar tipos de planos',
                error: error.message
            });
        }
    },

    /**
     * ENDPOINTS DE TESTE - DESENVOLVIMENTO
     * 
     * Os endpoints abaixo são para testes durante o desenvolvimento
     * Devem ser removidos ou protegidos em produção
     */

    /**
     * Cria um cliente de teste no Asaas
     * 
     * @route POST /asaas/teste/cliente
     * @access Private (desenvolvimento)
     */
    async criarClienteTeste(req, res) {
        try {
            const usuarioTeste = {
                idusuario: 56, // Usuário com grupo 1
                nome: "Cliente Teste",
                email: "teste@email.com",
                cpf: "529.982.247-25", // CPF válido para testes
                telefone: "11987654321", // Formato: DDD + 9 dígitos
                grupo: 1 // Grupo com permissão para pagamentos
            };

            const cliente = await asaasService.getOrCreateCustomer(usuarioTeste);
            return res.json({
                message: 'Cliente criado com sucesso',
                cliente
            });
        } catch (error) {
            console.error('Erro ao criar cliente teste:', error);
            return res.status(500).json({ 
                error: 'Erro ao criar cliente',
                details: error.message 
            });
        }
    },

    /**
     * Cria uma assinatura mensal de teste
     * 
     * @route POST /asaas/teste/assinatura
     * @access Private (desenvolvimento)
     */
    async criarAssinaturaTeste(req, res) {
        try {
            const usuarioTeste = {
                idusuario: 1, // ajuste conforme necessário
                nome: "Cliente Teste",
                email: "teste@email.com",
                cpf: "12345678909",
                telefone: "11999999999"
            };

            const planoTeste = {
                id: 1,
                nome: "Plano Mensal Teste",
                valor: 99.90
            };

            const resultado = await asaasService.criarAssinatura(
                usuarioTeste,
                planoTeste,
                'CARTAO_CREDITO'
            );

            return res.json({
                message: 'Assinatura criada com sucesso',
                resultado
            });
        } catch (error) {
            console.error('Erro ao criar assinatura teste:', error);
            return res.status(500).json({ 
                error: 'Erro ao criar assinatura',
                details: error.message 
            });
        }
    },

    /**
     * Cria um pagamento de pacote de teste
     * 
     * @route POST /asaas/teste/pacote
     * @access Private (desenvolvimento)
     */
    async criarPagamentoPacoteTeste(req, res) {
        try {
            const usuarioTeste = {
                idusuario: 1, // ajuste conforme necessário
                nome: "Cliente Teste",
                email: "teste@email.com",
                cpf: "12345678909",
                telefone: "11999999999"
            };

            const planoTeste = {
                id: 1,
                nome: "Pacote Trimestral Teste",
                valor: 89.90 // valor mensal
            };

            const resultado = await asaasService.criarPagamentoPacote(
                usuarioTeste,
                planoTeste,
                'CARTAO_CREDITO',
                3, // número de parcelas
                3  // duração em meses
            );

            return res.json({
                message: 'Pagamento de pacote criado com sucesso',
                resultado
            });
        } catch (error) {
            console.error('Erro ao criar pagamento de pacote teste:', error);
            return res.status(500).json({ 
                error: 'Erro ao criar pagamento de pacote',
                details: error.message 
            });
        }
    },

    /**
     * ENDPOINT TEMPORÁRIO - Forçar confirmação de pagamento (APENAS PARA TESTE)
     * 
     * @route POST /asaas/confirmar-pagamento-teste/:id
     * @access Private (desenvolvimento)
     */
    async confirmarPagamentoTeste(req, res) {
        try {
            const { id } = req.params;
            
            console.log('=== CONFIRMANDO PAGAMENTO MANUALMENTE (TESTE) ===');
            console.log('ID do pagamento:', id);

            // Buscar o pagamento
            const { AsaasPagamento } = require('../models');
            const pagamento = await AsaasPagamento.findByPk(id);
            
            if (!pagamento) {
                return res.status(404).json({
                    success: false,
                    message: 'Pagamento não encontrado'
                });
            }

            // Atualizar para confirmado
            await pagamento.update({
                situacao: 'CONFIRMADO',
                data_confirmacao: new Date(),
                data_atualizacao: new Date()
            });

            console.log('Pagamento confirmado manualmente:', id);

            return res.json({
                success: true,
                message: 'Pagamento confirmado manualmente',
                data: {
                    id: pagamento.idasaaspagamento,
                    situacao: 'CONFIRMADO',
                    data_confirmacao: pagamento.data_confirmacao
                }
            });
        } catch (error) {
            console.error('Erro ao confirmar pagamento:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro ao confirmar pagamento',
                error: error.message
            });
        }
    }
};

module.exports = asaasController; 