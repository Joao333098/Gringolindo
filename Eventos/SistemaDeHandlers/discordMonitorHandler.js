const { perms, emoji, General } = require('../../DataBaseJson');

module.exports = {
    name: 'messageCreate',
    run: async (message, client) => {
        const CANAL_MONITORAMENTO = '1442998689802092676';
        
        if (message.channelId !== CANAL_MONITORAMENTO) return;
        if (message.author.id === client.user.id) return;
        if (!perms.has(message.author.id)) return;

        console.log('[MONITORAMENTO] Mensagem recebida:', message.content.substring(0, 50));
        
        await processarInstrucao(message, client);
    }
};

async function processarInstrucao(message, client) {
    const conteudo = message.content.toLowerCase();
    
    try {
        if (conteudo.includes('atualizar ticket') || conteudo.includes('update ticket')) {
            await atualizarMensagemTicket(message, client);
        }
        else if (conteudo.includes('atualizar termos') || conteudo.includes('update terms')) {
            await atualizarMensagemTermos(message, client);
        }
        else if (conteudo.includes('status') || conteudo.includes('help')) {
            await mostrarStatus(message, client);
        }
        else if (conteudo.includes('reiniciar') || conteudo.includes('restart')) {
            await message.reply('Reiniciando...');
            setTimeout(() => process.exit(0), 1000);
        }
        else if (conteudo.includes('{') && conteudo.includes('}')) {
            await message.reply('Use "atualizar ticket" ou "atualizar termos" para atualizar.');
        }
    } catch (error) {
        console.error('[MONITORAMENTO] Erro:', error);
        await message.reply('Erro: ' + error.message).catch(() => {});
    }
}

async function atualizarMensagemTicket(message, client) {
    try {
        const canalId = General.get('tickets.canal_msg');
        if (!canalId) {
            return message.reply('Canal de mensagem nao configurado!');
        }

        const canal = await client.channels.fetch(canalId);
        const messages = await canal.messages.fetch({ limit: 10 });
        const mensagem = messages.find(m => m.author.id === client.user.id);

        if (!mensagem) {
            return message.reply('Nenhuma mensagem encontrada!');
        }

        const jsonAtual = JSON.stringify(mensagem.components, null, 2);
        await message.reply('JSON da mensagem de Ticket:\n```json\n' + jsonAtual + '\n```');
        await message.reply('Envie o novo JSON para atualizar (ou "cancelar")');

        const filter = m => m.author.id === message.author.id;
        const collector = message.channel.createMessageCollector({ filter, max: 1, time: 300000 });

        collector.on('collect', async (m) => {
            if (m.content.toLowerCase() === 'cancelar') {
                return m.reply('Atualizacao cancelada.');
            }

            try {
                let cleanContent = m.content.replace(/```json|```/g, '').trim();
                let userComponents = JSON.parse(cleanContent);

                userComponents = userComponents.map(comp => {
                    if (comp.type === 12 && comp.items) {
                        comp.items = comp.items.filter(item => item.media && item.media.url && item.media.url.length > 5);
                    }
                    return comp;
                });

                await mensagem.edit({ components: userComponents });
                await m.reply('Mensagem de Ticket atualizada!');
            } catch (error) {
                await m.reply('Erro: ' + error.message);
            }
        });

    } catch (error) {
        console.error('Erro ao atualizar ticket:', error);
        await message.reply('Erro: ' + error.message);
    }
}

async function atualizarMensagemTermos(message, client) {
    try {
        const categoriaId = General.get('tickets.categoria');
        if (!categoriaId) {
            return message.reply('Categoria nao configurada!');
        }

        const categoria = await client.channels.fetch(categoriaId);
        const canaisTicket = message.guild.channels.cache.filter(c => 
            c.parentId === categoriaId && c.type === 0
        );

        let mensagemTermos = null;
        for (const [_, canal] of canaisTicket) {
            try {
                const messages = await canal.messages.fetch({ limit: 5 });
                const msg = messages.find(m => m.components && m.components.length > 0);
                if (msg) {
                    mensagemTermos = msg;
                    break;
                }
            } catch (e) {}
        }

        if (!mensagemTermos) {
            return message.reply('Nenhum ticket com termos encontrado!');
        }

        const jsonAtual = JSON.stringify(mensagemTermos.components, null, 2);
        await message.reply('JSON da mensagem de Termos:\n```json\n' + jsonAtual + '\n```');
        await message.reply('Envie o novo JSON para atualizar (ou "cancelar")');

        const filter = m => m.author.id === message.author.id;
        const collector = message.channel.createMessageCollector({ filter, max: 1, time: 300000 });

        collector.on('collect', async (m) => {
            if (m.content.toLowerCase() === 'cancelar') {
                return m.reply('Atualizacao cancelada.');
            }

            try {
                let cleanContent = m.content.replace(/```json|```/g, '').trim();
                let userComponents = JSON.parse(cleanContent);

                await mensagemTermos.edit({ components: userComponents });
                await m.reply('Mensagem de Termos atualizada!');
            } catch (error) {
                await m.reply('Erro: ' + error.message);
            }
        });

    } catch (error) {
        console.error('Erro ao atualizar termos:', error);
        await message.reply('Erro: ' + error.message);
    }
}

async function mostrarStatus(message, client) {
    const stats = General.get('estatisticas') || {};
    const smsSaldo = General.get('sms24h.saldo') || 0;
    const categoria = General.get('tickets.categoria');
    const canal = General.get('tickets.canal_msg');

    await message.reply(
        'Status do Bot:\n' +
        '- Saldo SMS24H: R$ ' + smsSaldo.toFixed(2) + '\n' +
        '- Vendas Totais: ' + (stats.vendas_totais || 0) + '\n' +
        '- Faturamento: R$ ' + (stats.faturamento || 0).toFixed(2) + '\n' +
        '- Categoria: ' + (categoria || 'Nao configurado') + '\n' +
        '- Canal: ' + (canal || 'Nao configurado') + '\n' +
        '- Status: Online'
    );
}
