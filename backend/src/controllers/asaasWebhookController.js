const asaasService = require('../services/asaasService');

const webhookController = {
    /**
     * Processa os eventos recebidos do webhook do Asaas
     */
    async processarWebhook(req, res) {
        try {
            const event = req.body.event;
            const payload = req.body;

            // Valida se o evento é suportado
            const eventosSuportados = [
                'PAYMENT_CREATED',
                'PAYMENT_UPDATED',
                'PAYMENT_CONFIRMED',
                'PAYMENT_RECEIVED',
                'PAYMENT_OVERDUE',
                'PAYMENT_DELETED',
                'PAYMENT_RESTORED',
                'PAYMENT_REFUNDED',
                'PAYMENT_RECEIVED_IN_CASH_UNDONE',
                'PAYMENT_CHARGEBACK_REQUESTED',
                'PAYMENT_CHARGEBACK_DISPUTE',
                'PAYMENT_AWAITING_CHARGEBACK_REVERSAL',
                'PAYMENT_DUNNING_RECEIVED',
                'PAYMENT_DUNNING_REQUESTED',
                'PAYMENT_BANK_SLIP_VIEWED',
                'PAYMENT_CHECKOUT_VIEWED',
                'SUBSCRIPTION_CREATED',
                'SUBSCRIPTION_UPDATED',
                'SUBSCRIPTION_DELETED',
                'SUBSCRIPTION_RENEWED',
                'SUBSCRIPTION_OVERDUE',
                'SUBSCRIPTION_RECEIVED',
                'SUBSCRIPTION_RECEIVED_IN_CASH',
                'SUBSCRIPTION_REFUNDED',
                'SUBSCRIPTION_RENEWED_AUTO',
                'SUBSCRIPTION_PAYMENT_DUNNING_RECEIVED',
                'SUBSCRIPTION_PAYMENT_DUNNING_REQUESTED'
            ];

            if (!eventosSuportados.includes(event)) {
                console.warn(`Evento não suportado recebido do Asaas: ${event}`);
                return res.status(200).json({ message: 'Evento não suportado' });
            }

            // Processa o evento
            await asaasService.processarWebhook(event, payload);

            return res.status(200).json({ message: 'Webhook processado com sucesso' });
        } catch (error) {
            console.error('Erro ao processar webhook do Asaas:', error);
            return res.status(500).json({ 
                error: 'Erro interno ao processar webhook',
                details: error.message 
            });
        }
    }
};

module.exports = webhookController; 