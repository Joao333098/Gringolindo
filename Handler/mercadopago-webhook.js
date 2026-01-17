const express = require('express');
const { MercadoPagoConfig, Payment } = require('mercadopago');
const { General, emoji } = require('../DataBaseJson');
const { EmbedBuilder } = require('discord.js');

const router = express.Router();

/**
 * Webhook para receber notificações do Mercado Pago
 * Processa automaticamente pagamentos aprovados
 */
router.post('/webhook', async (req, res) => {
    try {
        const { type, data } = req.body;
        
        // Verificar se é uma notificação de pagamento
        if (type === 'payment' && data && data.id) {
            console.log(`[MercadoPago Webhook] Recebida notificação de pagamento ID: ${data.id}`);
            
            // Configurar cliente Mercado Pago
            const mpConfig = General.get('mercadopago');
            if (!mpConfig || !mpConfig.access_token) {
                console.error('[MercadoPago Webhook] Mercado Pago não configurado!');
                return res.status(500).json({ error: 'Mercado Pago não configurado' });
            }
            
            const mpLogin = new MercadoPagoConfig({ 
                accessToken: mpConfig.access_token 
            });
            const payment = new Payment(mpLogin);
            
            // Buscar informações do pagamento
            const paymentInfo = await payment.get({ id: data.id });
            
            console.log(`[MercadoPago Webhook] Status do pagamento: ${paymentInfo.status}`);
            
            // Se o pagamento foi aprovado
            if (paymentInfo.status === 'approved') {
                console.log(`[MercadoPago Webhook] Pagamento ${data.id} aprovado! Processando...`);
                
                // Buscar carrinho associado a este pagamento
                // Isso pode ser feito verificando a descrição ou usando um mapeamento
                // Por enquanto, vamos logar e esperar implementação específica
                console.log(`[MercadoPago Webhook] Valor: R$${paymentInfo.transaction_amount}`);
                console.log(`[MercadoPago Webhook] Descrição: ${paymentInfo.description}`);
                
                // TODO: Implementar lógica para aprovar compra automaticamente
                // Precisa encontrar o carrinho correspondente e chamar compraAprovada()
            }
        }
        
        // Responder ao Mercado Pago com status 200
        res.status(200).json({ received: true });
    } catch (error) {
        console.error('[MercadoPago Webhook] Erro ao processar notificação:', error);
        res.status(500).json({ error: 'Erro interno' });
    }
});

module.exports = router;