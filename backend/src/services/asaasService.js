const axios = require('axios');
const { AsaasCliente, AsaasPagamento, AsaasWebhookLog, Usuario, AlunoPlano, Plano } = require('../models');
const { Op } = require('sequelize');

/**
 * 🔥 ASAAS SERVICE - INTEGRAÇÃO COMPLETA DE PAGAMENTOS
 * 
 * ⚠️  CRÍTICO: NÃO ALTERAR SEM CONSULTAR EQUIPE DE DESENVOLVIMENTO
 * 
 * Este serviço gerencia toda a integração com a API do Asaas, incluindo:
 * - Criação e reutilização de clientes
 * - Assinaturas recorrentes (mensais)
 * - Pagamentos únicos (pacotes 3 e 6 meses)
 * - Processamento de webhooks
 * - Validações de CPF, telefone e dados
 * 
 * 🏗️  ARQUITETURA DE PAGAMENTOS:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │                    TIPOS DE PAGAMENTO                           │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ 1. ASSINATURA MENSAL (R$ 297,00/mês):                          │
 * │    ├── Cria assinatura no Asaas: sub_abc123                    │
 * │    ├── Primeira cobrança: mesmo ID da assinatura               │
 * │    └── Próximas cobranças: pay_def456, pay_ghi789, etc.        │
 * │                                                                 │
 * │ 2. PACOTE 3 MESES (R$ 846,45 total):                          │
 * │    ├── Pagamento único: pay_abc123                             │
 * │    ├── Desconto: 5% sobre valor mensal                         │
 * │    └── Sem assinatura (campo NULL)                             │
 * │                                                                 │
 * │ 3. PACOTE 6 MESES (R$ 1.603,80 total):                        │
 * │    ├── Pagamento único: pay_abc123                             │
 * │    ├── Desconto: 10% sobre valor mensal                        │
 * │    └── Sem assinatura (campo NULL)                             │
 * └─────────────────────────────────────────────────────────────────┘
 * 
 * 📊 ESTRUTURA DA TABELA asaas_pagamento:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ CAMPO                  │ ASSINATURA    │ PACOTE                 │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ id_assinatura_asaas    │ sub_abc123    │ NULL                   │
 * │ id_pagamento_asaas     │ sub_abc123*   │ pay_abc123             │
 * │ proxima_cobranca       │ Data futura   │ NULL                   │
 * │ tipo_plano             │ 'ASSINATURA'  │ 'PACOTE'               │
 * │ duracao_meses          │ 1             │ 3 ou 6                 │
 * │ * Primeira cobrança usa mesmo ID da assinatura                  │
 * └─────────────────────────────────────────────────────────────────┘
 * 
 * 🔧 RECURSOS IMPLEMENTADOS:
 * ✅ Reutilização de clientes (evita duplicação)
 * ✅ Validação matemática de CPF
 * ✅ Formatação automática de telefone/CEP
 * ✅ Suporte a cartão de crédito e PIX
 * ✅ Webhooks para confirmação automática
 * ✅ Logs detalhados de todas as operações
 * ✅ Tratamento de erros robusto
 * 
 * 🚨 PONTOS CRÍTICOS:
 * - API Key do Asaas (sandbox): Não expor em produção
 * - Constraint UNIQUE em asaas_cliente.idusuario
 * - Relacionamento PK→PK: asaas_pagamento.idasaascliente
 * - Webhooks processam eventos em ordem cronológica
 * - Status de pagamento: PENDENTE → CONFIRMADO → CANCELADO
 * 
 * 🔄 FLUXO DE WEBHOOKS:
 * 1. SUBSCRIPTION_CREATED → Assinatura confirmada
 * 2. PAYMENT_CREATED → Cobrança criada
 * 3. PAYMENT_CONFIRMED → Pagamento aprovado ✅
 * 4. PAYMENT_RECEIVED → Valor creditado
 * 
 * 📱 FORMAS DE PAGAMENTO:
 * - CARTAO_CREDITO: Aprovação imediata (sandbox)
 * - PIX: Gera QR Code e aguarda confirmação
 * - BOLETO: Gera boleto bancário (não implementado)
 * 
 * @version 2.0
 * @since 2024-12-21
 * @author Equipe de Desenvolvimento
 * 
 * ⚠️  HISTÓRICO DE ALTERAÇÕES:
 * - v1.0: Implementação básica
 * - v2.0: Suporte a reutilização de clientes e múltiplas compras
 * 
 * 🚫 NÃO ALTERE ESTE SERVIÇO SEM:
 * 1. Consultar a equipe de desenvolvimento
 * 2. Testar em ambiente sandbox do Asaas
 * 3. Validar webhooks e fluxos de pagamento
 * 4. Verificar constraints e relacionamentos do banco
 * 5. Documentar todas as alterações
 */
class AsaasService {
    constructor() {
        this.apiKey = '$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjQyNmVjM2VlLTlhOGYtNGFjMy1hNjMwLWNmM2U5YWE4NDNjOTo6JGFhY2hfMzAyYWE5MDAtNmIyNi00Y2Y0LWJmNGMtYTViZTA5NjM1ZTRk';
        this.baseURL = 'https://sandbox.asaas.com/api/v3';
        this.api = axios.create({
            baseURL: this.baseURL,
            headers: {
                'access_token': this.apiKey,
                'Content-Type': 'application/json'
            }
        });
    }

    /**
     * Verifica se o usuário existe (sem restrição de grupo)
     * Permite tanto alunos (grupo 1) quanto admins (grupo 2)
     */
    async _verificarUsuario(idUsuario) {
        const usuario = await Usuario.findByPk(idUsuario);
        
        if (!usuario) {
            throw new Error('Usuário não encontrado');
        }

        // Aceita qualquer grupo válido (1=aluno, 2=admin)
        if (usuario.grupo !== 1 && usuario.grupo !== 2) {
            throw new Error('Usuário não tem grupo válido');
        }

        return usuario;
    }

    /**
     * Formata o telefone para o padrão aceito pelo Asaas
     */
    _formatarTelefone(telefone) {
        // Remove todos os caracteres não numéricos
        const numeros = telefone.replace(/\D/g, '');
        
        // Verifica se tem 11 dígitos (com DDD)
        if (numeros.length === 11) {
            const ddd = numeros.substring(0, 2);
            const numero = numeros.substring(2);
            return `(${ddd})${numero}`; // Formato: (DDD)XXXXXXXXX
        }
        
        // Se tiver 9 dígitos, adiciona DDD 11
        if (numeros.length === 9) {
            return `(11)${numeros}`; // Formato: (11)XXXXXXXXX
        }

        // Se tiver 8 dígitos, adiciona 9 e DDD 11
        if (numeros.length === 8) {
            return `(11)9${numeros}`; // Formato: (11)9XXXXXXXX
        }

        throw new Error('Número de telefone inválido. Deve ter 8, 9 ou 11 dígitos');
    }

    /**
     * Formata o CPF removendo caracteres especiais
     */
    _formatarCPF(cpf) {
        // Remove todos os caracteres não numéricos
        return cpf.replace(/\D/g, '');
    }

    /**
     * Formata o CEP para o padrão aceito pelo Asaas (XXXXX-XXX)
     * Usa CEP padrão válido se o fornecido for inválido
     */
    _formatarCEP(cep) {
        if (!cep) return '01310-100'; // CEP padrão da Av. Paulista
        
        try {
            // Remove todos os caracteres não numéricos
            const numeros = cep.replace(/\D/g, '');
            
            // Verifica se tem 8 dígitos
            if (numeros.length === 8) {
                return `${numeros.substring(0, 5)}-${numeros.substring(5)}`;
            }
            
            // Se já estiver formatado, retorna como está
            if (cep.includes('-') && cep.length === 9) {
                return cep;
            }
            
            // Se não conseguir formatar, usa CEP padrão
            console.warn(`CEP inválido fornecido: ${cep}, usando CEP padrão`);
            return '01310-100';
        } catch (error) {
            console.warn(`Erro ao formatar CEP: ${cep}, usando CEP padrão`);
            return '01310-100';
        }
    }

    /**
     * Valida se um CPF é válido
     */
    _validarCPF(cpf) {
        // Remove caracteres não numéricos
        const cpfLimpo = cpf.replace(/[^\d]/g, '');
        console.log('CPF para validação:', cpfLimpo);

        // Verifica se tem 11 dígitos
        if (cpfLimpo.length !== 11) {
            console.log('CPF não tem 11 dígitos');
            return false;
        }

        // Verifica se todos os dígitos são iguais
        if (/^(\d)\1+$/.test(cpfLimpo)) {
            console.log('CPF com dígitos repetidos');
            return false;
        }

        // Calcula o primeiro dígito verificador
        let soma = 0;
        for (let i = 0; i < 9; i++) {
            soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
        }
        let resto = soma % 11;
        const digito1 = resto < 2 ? 0 : 11 - resto;

        if (digito1 !== parseInt(cpfLimpo.charAt(9))) {
            console.log('Primeiro dígito verificador inválido');
            return false;
        }

        // Calcula o segundo dígito verificador
        soma = 0;
        for (let i = 0; i < 10; i++) {
            soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
        }
        resto = soma % 11;
        const digito2 = resto < 2 ? 0 : 11 - resto;

        if (digito2 !== parseInt(cpfLimpo.charAt(10))) {
            console.log('Segundo dígito verificador inválido');
            return false;
        }

        return true;
    }

    /**
     * Cria ou recupera um cliente no Asaas
     */
    async getOrCreateCustomer(usuario) {
        try {
            // Verifica se o usuário existe
            await this._verificarUsuario(usuario.idusuario);

            // Verifica se já existe um cliente Asaas para este usuário
            let asaasCliente = await AsaasCliente.findOne({ 
                where: { idusuario: usuario.idusuario } 
            });
            
            if (asaasCliente) {
                return asaasCliente;
            }

            // Validar CPF
            if (!this._validarCPF(usuario.cpf)) {
                throw new Error('CPF inválido');
            }

            // Formata o telefone e CPF
            const telefoneFormatado = this._formatarTelefone(usuario.telefone);
            const cpfFormatado = this._formatarCPF(usuario.cpf);

            // Cria um novo cliente no Asaas
            const response = await this.api.post('/customers', {
                name: usuario.nome,
                email: usuario.email,
                cpfCnpj: cpfFormatado,
                phone: telefoneFormatado,
                notificationDisabled: false
            });

            // Salva o ID do cliente Asaas no banco
            asaasCliente = await AsaasCliente.create({
                idusuario: usuario.idusuario,
                id_cliente_asaas: response.data.id,
                data_criacao: new Date(),
                data_atualizacao: new Date()
            });

            return asaasCliente;
        } catch (error) {
            console.error('Erro ao criar/recuperar cliente no Asaas:', error);
            
            // Captura a mensagem de erro específica do Asaas
            if (error.response && error.response.data) {
                const asaasError = error.response.data.errors?.[0]?.description || error.response.data.message;
                throw new Error(`Erro na API do Asaas: ${asaasError}`);
            }
            
            throw error; // Propaga o erro original se for de permissão
        }
    }

    /**
     * Cria uma assinatura mensal recorrente
     */
    async criarAssinatura(usuario, plano, formaPagamento) {
        try {
            // Verifica se o usuário existe
            await this._verificarUsuario(usuario.idusuario);
            
            const cliente = await this.getOrCreateCustomer(usuario);
            
            // Dados da assinatura
            const valor = 297.00; // R$ 297,00 por mês
            const dataVencimento = new Date();
            
            // Para assinatura, primeira cobrança é sempre imediata
            // (cartão e PIX são processados no ato)
            dataVencimento.setDate(dataVencimento.getDate()); // Data atual
            
            // Calcula a data da próxima cobrança (1 mês após a primeira)
            // IMPORTANTE: Para assinaturas, sempre calculamos a próxima cobrança
            // independente da forma de pagamento (cartão/PIX processam imediatamente,
            // mas a recorrência continua conforme programado)
            const proximaCobranca = this._calcularProximaCobranca(dataVencimento, 'MONTHLY');
            
            const assinaturaData = {
                customer: cliente.id_cliente_asaas,
                billingType: this._converterFormaPagamento(formaPagamento),
                value: valor,
                nextDueDate: dataVencimento.toISOString().split('T')[0],
                cycle: 'MONTHLY',
                description: 'Assinatura Mensal - Sistema de Mentoria',
                // Configurações de notificação
                sendPaymentByPostalService: false,
                // Configurações de desconto
                discount: {
                    value: 0,
                    dueDateLimitDays: 0
                },
                // Configurações de multa
                fine: {
                    value: 2.00 // 2% de multa
                },
                // Configurações de juros
                interest: {
                    value: 1.00 // 1% de juros ao mês
                }
            };

            // Adiciona informações do cartão se necessário
            if (formaPagamento === 'CARTAO_CREDITO' && plano.cartao) {
                console.log('Dados do cartão recebidos:', plano.cartao);
                assinaturaData.creditCard = {
                    holderName: plano.cartao.nome,
                    number: plano.cartao.numero.replace(/\s/g, ''),
                    expiryMonth: plano.cartao.validade.split('/')[0],
                    expiryYear: '20' + plano.cartao.validade.split('/')[1], // Formato: 2028
                    ccv: plano.cartao.cvv
                };
                assinaturaData.creditCardHolderInfo = {
                    name: usuario.nome,
                    email: usuario.email,
                    cpfCnpj: this._formatarCPF(usuario.cpf),
                    postalCode: this._formatarCEP(usuario.cep), // CEP sempre formatado e válido
                    addressNumber: '1000',
                    addressComplement: null,
                    phone: usuario.telefone.replace(/\D/g, ''), // Apenas números conforme documentação
                    mobilePhone: usuario.telefone.replace(/\D/g, '') // Apenas números conforme documentação
                };
                console.log('Dados do cartão formatados para Asaas:', assinaturaData.creditCard);
            }

            const response = await this.api.post('/subscriptions', assinaturaData);
            
            // Salva o pagamento no banco (SEM associação ao plano ainda)
            const pagamento = await AsaasPagamento.create({
                idasaascliente: cliente.idasaascliente, // FK para asaas_cliente.idasaascliente
                
                // IMPORTANTE: Para assinaturas, o Asaas usa o MESMO ID para:
                // - A assinatura em si (contrato recorrente)
                // - A primeira cobrança da assinatura
                // Exemplo: sub_2q9ykm3gbsi1f7z1 será usado nos dois campos
                // 
                // Nas próximas cobranças mensais:
                // - id_assinatura_asaas: sub_2q9ykm3gbsi1f7z1 (sempre o mesmo)
                // - id_pagamento_asaas: pay_xyz123abc456 (novo ID único para cada cobrança)
                // - proxima_cobranca: será sempre 1 mês após a cobrança atual
                id_assinatura_asaas: response.data.id, // ID da assinatura (contrato recorrente)
                id_pagamento_asaas: response.data.id,   // ID da primeira cobrança (mesmo valor da assinatura)
                
                tipo_plano: 'ASSINATURA',
                duracao_meses: 0, // Assinatura é indefinida
                forma_pagamento: formaPagamento,
                numero_parcelas: 1,
                valor_total: valor,
                valor_parcela: valor,
                link_pagamento: response.data.invoiceUrl,
                codigo_pix: response.data.bankSlipUrl, // Para PIX, usar o campo de boleto
                situacao: 'PENDENTE',
                data_vencimento: dataVencimento,
                proxima_cobranca: proximaCobranca, // Data da próxima cobrança mensal
                data_criacao: new Date(),
                data_atualizacao: new Date()
            });

            console.log(`Assinatura criada - ID Asaas: ${response.data.id}, ID Banco: ${pagamento.idasaaspagamento}`);
            console.log(`📅 Próxima cobrança agendada para: ${proximaCobranca.toISOString().split('T')[0]}`);

            return {
                success: true,
                assinatura: response.data,
                pagamento: pagamento,
                linkPagamento: response.data.invoiceUrl,
                codigoPix: formaPagamento === 'PIX' ? response.data.bankSlipUrl : null
            };
        } catch (error) {
            console.error('Erro ao criar assinatura:', error);
            
            if (error.response && error.response.data) {
                const asaasError = error.response.data.errors?.[0]?.description || error.response.data.message;
                throw new Error(`Erro na API do Asaas: ${asaasError}`);
            }
            
            throw error;
        }
    }

    /**
     * Cria um pagamento para pacote (3 ou 6 meses)
     */
    async criarPagamentoPacote(usuario, plano, formaPagamento, numeroParcelas, duracaoMeses) {
        try {
            // Verifica se o usuário existe
            await this._verificarUsuario(usuario.idusuario);
            
            const cliente = await this.getOrCreateCustomer(usuario);
            
            // Calcula valores baseado na duração
            let valorTotal, valorParcela;
            if (duracaoMeses === 3) {
                valorTotal = 846.45; // R$ 846,45 (5% desconto)
                valorParcela = valorTotal / numeroParcelas;
            } else if (duracaoMeses === 6) {
                valorTotal = 1603.80; // R$ 1.603,80 (10% desconto)
                valorParcela = valorTotal / numeroParcelas;
            } else {
                throw new Error('Duração inválida. Aceito apenas 3 ou 6 meses.');
            }
            
            const dataVencimento = new Date();
            dataVencimento.setDate(dataVencimento.getDate() + 7); // 7 dias para pagamento
            
            const pagamentoData = {
                customer: cliente.id_cliente_asaas,
                billingType: this._converterFormaPagamento(formaPagamento),
                value: valorParcela,
                dueDate: dataVencimento.toISOString().split('T')[0],
                description: `Pacote ${duracaoMeses} Meses - Sistema de Mentoria`,
                // Configurações de notificação
                postalService: false,
                // Configurações de desconto
                discount: {
                    value: 0,
                    dueDateLimitDays: 0
                },
                // Configurações de multa
                fine: {
                    value: 2.00 // 2% de multa
                },
                // Configurações de juros
                interest: {
                    value: 1.00 // 1% de juros ao mês
                }
            };

            // Para pagamentos parcelados
            if (numeroParcelas > 1) {
                pagamentoData.installmentCount = numeroParcelas;
                pagamentoData.installmentValue = valorParcela;
            }

            // Adiciona informações do cartão se necessário
            if (formaPagamento === 'CARTAO_CREDITO' && plano.cartao) {
                console.log('Dados do cartão recebidos (pacote):', plano.cartao);
                pagamentoData.creditCard = {
                    holderName: plano.cartao.nome,
                    number: plano.cartao.numero.replace(/\s/g, ''),
                    expiryMonth: plano.cartao.validade.split('/')[0],
                    expiryYear: '20' + plano.cartao.validade.split('/')[1], // Formato: 2028
                    ccv: plano.cartao.cvv
                };
                pagamentoData.creditCardHolderInfo = {
                    name: usuario.nome,
                    email: usuario.email,
                    cpfCnpj: this._formatarCPF(usuario.cpf),
                    postalCode: this._formatarCEP(usuario.cep), // CEP sempre formatado e válido
                    addressNumber: '1000',
                    addressComplement: null,
                    phone: usuario.telefone.replace(/\D/g, ''), // Apenas números conforme documentação
                    mobilePhone: usuario.telefone.replace(/\D/g, '') // Apenas números conforme documentação
                };
                console.log('Dados do cartão formatados para Asaas (pacote):', pagamentoData.creditCard);
            }

            const response = await this.api.post('/payments', pagamentoData);
            
            // Salva o pagamento no banco (SEM associação ao plano ainda)
            const pagamento = await AsaasPagamento.create({
                idasaascliente: cliente.idasaascliente, // FK para asaas_cliente.idasaascliente
                
                // PACOTES: Diferente das assinaturas, pacotes são pagamentos únicos
                // - id_assinatura_asaas: NULL (não é recorrente)
                // - id_pagamento_asaas: pay_abc123def456 (ID único da cobrança)
                // - id_parcelamento_asaas: Preenchido se for parcelado
                // - proxima_cobranca: NULL (não há cobrança futura)
                id_pagamento_asaas: response.data.id,
                id_parcelamento_asaas: response.data.installment || null,
                
                tipo_plano: 'PACOTE',
                duracao_meses: duracaoMeses,
                forma_pagamento: formaPagamento,
                numero_parcelas: numeroParcelas,
                valor_total: valorTotal,
                valor_parcela: valorParcela,
                link_pagamento: response.data.invoiceUrl,
                codigo_pix: response.data.qrCode?.payload || response.data.bankSlipUrl,
                situacao: 'PENDENTE',
                data_vencimento: dataVencimento,
                proxima_cobranca: null, // Pacotes não têm próxima cobrança (pagamento único)
                data_criacao: new Date(),
                data_atualizacao: new Date()
            });

            console.log(`Pacote criado - ID Asaas: ${response.data.id}, ID Banco: ${pagamento.idasaaspagamento}`);
            console.log(`📦 Pacote de ${duracaoMeses} meses - Pagamento único (sem cobrança futura)`);

            return {
                success: true,
                pagamento: response.data,
                pagamentoDB: pagamento,
                linkPagamento: response.data.invoiceUrl,
                codigoPix: formaPagamento === 'PIX' ? (response.data.qrCode?.payload || response.data.bankSlipUrl) : null
            };
        } catch (error) {
            console.error('Erro ao criar pagamento de pacote:', error);
            
            if (error.response && error.response.data) {
                const asaasError = error.response.data.errors?.[0]?.description || error.response.data.message;
                throw new Error(`Erro na API do Asaas: ${asaasError}`);
            }
            
            throw error;
        }
    }

    /**
     * Processa eventos de webhook do Asaas
     * 
     * ESTRATÉGIA DE EVENTOS:
     * - Eventos que alteram status: PAYMENT_CONFIRMED, PAYMENT_RECEIVED, etc.
     * - Eventos informativos: SUBSCRIPTION_CREATED, PAYMENT_CREATED, PAYMENT_UPDATED
     * 
     * ORDEM TÍPICA DOS EVENTOS:
     * 1. SUBSCRIPTION_CREATED (pode chegar depois dos outros)
     * 2. PAYMENT_CREATED 
     * 3. PAYMENT_CONFIRMED/PAYMENT_RECEIVED
     * 
     * O sistema persiste o registro durante a criação da assinatura/pagamento,
     * e os webhooks apenas atualizam o status conforme necessário.
     */
    async processarWebhook(event, payload) {
        try {
            console.log('Processando webhook:', event, 'Payload:', JSON.stringify(payload, null, 2));
            
            // Identifica o tipo de evento e extrai IDs relevantes
            let pagamentoId = null;
            let assinaturaId = null;
            
            if (payload.payment) {
                // Eventos de pagamento (PAYMENT_*)
                pagamentoId = payload.payment.id;
                assinaturaId = payload.payment.subscription;
            } else if (payload.subscription) {
                // Eventos de assinatura (SUBSCRIPTION_*)
                assinaturaId = payload.subscription.id;
            }

            // Busca o pagamento relacionado com lógica mais robusta
            // 
            // ESTRATÉGIA DE BUSCA:
            // 1. Primeiro busca por id_pagamento_asaas (mais específico)
            // 2. Se não encontrar, busca por id_assinatura_asaas (para primeira cobrança de assinatura)
            // 
            // CASOS TÍPICOS:
            // - Primeira cobrança de assinatura: ambos os IDs são iguais (ex: sub_abc123)
            // - Cobranças subsequentes: id_pagamento_asaas único (ex: pay_def456)
            // - Pacotes: apenas id_pagamento_asaas preenchido
            let pagamento = null;
            
            if (pagamentoId) {
                // Para eventos de pagamento, busca por ID do pagamento
                pagamento = await AsaasPagamento.findOne({
                    where: { id_pagamento_asaas: pagamentoId }
                });
                console.log(`Busca por ID pagamento: ${pagamentoId} - Encontrado: ${pagamento?.idasaaspagamento || 'null'}`);
            }
            
            // Se não encontrou por ID do pagamento, tenta por ID da assinatura
            // (útil para primeira cobrança onde ambos os IDs são iguais)
            if (!pagamento && assinaturaId) {
                pagamento = await AsaasPagamento.findOne({
                    where: { id_assinatura_asaas: assinaturaId },
                    order: [['data_criacao', 'DESC']] // Pega o mais recente
                });
                console.log(`Busca por ID assinatura: ${assinaturaId} - Encontrado: ${pagamento?.idasaaspagamento || 'null'}`);
            }
            
            console.log(`Webhook processado - Event: ${event}, PaymentID: ${pagamentoId}, SubscriptionID: ${assinaturaId}, Found: ${pagamento?.idasaaspagamento || 'null'}`);

            await AsaasWebhookLog.create({
                evento: event,
                idasaaspagamento: pagamento?.idasaaspagamento,
                dados_evento: payload,
                data_criacao: new Date(),
                data_atualizacao: new Date()
            });

            // Atualiza o status do pagamento baseado no evento
            if (pagamento) {
                console.log(`Atualizando pagamento ${pagamento.idasaaspagamento} para evento ${event}`);
                
                let novoStatus = null;
                let dataConfirmacao = null;
                
                switch (event) {
                    case 'PAYMENT_RECEIVED':
                    case 'PAYMENT_CONFIRMED':
                    case 'SUBSCRIPTION_RECEIVED':
                        novoStatus = 'CONFIRMADO';
                        dataConfirmacao = new Date();
                        break;
                    case 'PAYMENT_OVERDUE':
                        novoStatus = 'ATRASADO';
                        break;
                    case 'PAYMENT_REFUNDED':
                        novoStatus = 'ESTORNADO';
                        break;
                    case 'SUBSCRIPTION_CREATED':
                        // Evento informativo - assinatura criada
                        // Não altera status pois o registro já foi criado
                        console.log(`📋 Assinatura criada confirmada: ${assinaturaId}`);
                        break;
                    case 'PAYMENT_CREATED':
                        // Evento informativo - cobrança criada
                        // Não altera status pois o registro já foi criado
                        console.log(`📋 Cobrança criada confirmada: ${pagamentoId}`);
                        break;
                    case 'PAYMENT_UPDATED':
                        // Evento informativo - cobrança atualizada
                        console.log(`📝 Cobrança atualizada: ${pagamentoId}`);
                        break;
                    // Adicione outros casos conforme necessário
                }
                
                if (novoStatus) {
                    const dadosAtualizacao = {
                        situacao: novoStatus,
                        data_atualizacao: new Date()
                    };
                    
                    if (dataConfirmacao) {
                        dadosAtualizacao.data_confirmacao = dataConfirmacao;
                    }
                    
                    await pagamento.update(dadosAtualizacao);
                    console.log(`✅ Pagamento ${pagamento.idasaaspagamento} atualizado: ${novoStatus}${dataConfirmacao ? ' com data de confirmação' : ''}`);
                } else {
                    // Eventos informativos que não alteram status
                    const eventosInformativos = ['SUBSCRIPTION_CREATED', 'PAYMENT_CREATED', 'PAYMENT_UPDATED'];
                    if (eventosInformativos.includes(event)) {
                        console.log(`ℹ️ Evento informativo processado: ${event} - Nenhuma atualização necessária`);
                    } else {
                        console.log(`⚠️ Evento ${event} não requer atualização de status`);
                    }
                }
            } else {
                console.warn(`❌ Pagamento não encontrado para o evento ${event}:`, {
                    payment_id: pagamentoId,
                    subscription_id: assinaturaId,
                    event_type: payload.payment ? 'PAYMENT' : 'SUBSCRIPTION'
                });
            }

            return true;
        } catch (error) {
            console.error('Erro ao processar webhook do Asaas:', error);
            throw new Error('Erro ao processar webhook');
        }
    }

    /**
     * Calcula a data da próxima cobrança para assinaturas
     * 
     * @param {Date} dataAtual - Data da cobrança atual
     * @param {string} ciclo - Ciclo da assinatura ('MONTHLY', 'YEARLY', etc.)
     * @returns {Date|null} Data da próxima cobrança ou null se não for recorrente
     */
    _calcularProximaCobranca(dataAtual, ciclo = 'MONTHLY') {
        if (!dataAtual || ciclo === 'NONE') {
            return null; // Pacotes não têm próxima cobrança
        }

        const proximaData = new Date(dataAtual);
        
        switch (ciclo.toUpperCase()) {
            case 'MONTHLY':
                proximaData.setMonth(proximaData.getMonth() + 1);
                break;
            case 'YEARLY':
                proximaData.setFullYear(proximaData.getFullYear() + 1);
                break;
            case 'WEEKLY':
                proximaData.setDate(proximaData.getDate() + 7);
                break;
            default:
                return null; // Ciclo não reconhecido
        }
        
        return proximaData;
    }

    /**
     * Converte a forma de pagamento do nosso sistema para o formato do Asaas
     */
    _converterFormaPagamento(formaPagamento) {
        const mapeamento = {
            'CARTAO_CREDITO': 'CREDIT_CARD',
            'BOLETO': 'BOLETO',
            'PIX': 'PIX'
        };
        return mapeamento[formaPagamento] || 'UNDEFINED';
    }
}

module.exports = new AsaasService(); 