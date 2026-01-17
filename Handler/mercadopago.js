const axios = require('axios');
const { MercadoPagoConfig, Payment, Preference } = require('mercadopago');

/**
 * Sistema de Pagamento Automático via Mercado Pago
 */
class MercadoPagoHandler {
    constructor(accessToken) {
        this.client = new MercadoPagoConfig({ accessToken: accessToken });
        this.payment = new Payment(this.client);
        this.preference = new Preference(this.client);
    }

    /**
     * Criar pagamento PIX
     */
    async criarPagamentoPix(valor, descricao) {
        try {
            const paymentData = {
                transaction_amount: Number(valor),
                description: descricao,
                payment_method_id: 'pix',
                payer: {
                    email: 'cliente@email.com',
                    first_name: 'Cliente',
                    last_name: 'Bot',
                    identification: {
                        type: 'CPF',
                        number: '00000000000'
                    }
                }
            };

            const payment = await this.payment.create({ body: paymentData });

            return {
                id: payment.id,
                qr_code: payment.point_of_interaction?.transaction_data?.qr_code,
                qr_code_base64: payment.point_of_interaction?.transaction_data?.qr_code_base64,
                ticket_url: payment.point_of_interaction?.transaction_data?.ticket_url,
                status: payment.status,
                valor: valor
            };
        } catch (error) {
            console.error('[MercadoPago] Erro ao criar pagamento:', error.message);
            throw error;
        }
    }

    /**
     * Verificar status do pagamento
     */
    async verificarPagamento(paymentId) {
        try {
            const payment = await this.payment.get({ id: paymentId });

            return {
                id: payment.id,
                status: payment.status,
                status_detail: payment.status_detail,
                valor: payment.transaction_amount
            };
        } catch (error) {
            console.error('[MercadoPago] Erro ao verificar pagamento:', error.message);
            throw error;
        }
    }

    /**
     * Aguardar pagamento aprovado
     */
    async aguardarPagamento(paymentId, maxAttempts = 30, interval = 10) {
        for (let i = 0; i < maxAttempts; i++) {
            try {
                const status = await this.verificarPagamento(paymentId);
                
                if (status.status === 'approved') {
                    return status;
                }
                
                if (status.status === 'rejected' || status.status === 'cancelled') {
                    return status;
                }
                
                await new Promise(resolve => setTimeout(resolve, interval * 1000));
                
            } catch (error) {
                console.error(`[MercadoPago] Erro na tentativa ${i + 1}:`, error.message);
            }
        }
        
        return {
            id: paymentId,
            status: 'timeout',
            valor: 0
        };
    }

    /**
     * Reembolsar pagamento
     */
    async reembolsar(paymentId) {
        try {
            const refund = await this.payment.refund(paymentId);
            return refund;
        } catch (error) {
            console.error('[MercadoPago] Erro ao reembolsar:', error.message);
            throw error;
        }
    }
}

module.exports = MercadoPagoHandler;