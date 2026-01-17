const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
    StringSelectMenuOptionBuilder, 
    PermissionFlagsBits, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle 
} = require('discord.js');
const { General, perms, emoji } = require('../../DataBaseJson');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('painel')
        .setDescription('Painel de Administração Geral')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async run(client, interaction) {
        try {
            const isOwner = interaction.user.id === interaction.guild.ownerId;
            const hasPerm = perms.get(interaction.user.id) || isOwner;
            
            if (!hasPerm) {
                return interaction.reply({ content: '❌ Você não tem permissão.', ephemeral: true });
            }

            await interaction.deferReply({ ephemeral: true });

            const stats = General.get('estatisticas') || {};
            const smsSaldo = General.get('sms24h.saldo') || 0;

            const embed = new EmbedBuilder()
                .setTitle('Painel de Administração')
                .setDescription('Utilize o menu abaixo para gerenciar o sistema.')
                .setColor(General.get('color.padrao') || '#090b0c')
                .addFields(
                    { name: '💰 Saldo SMS24H', value: `R$ ${smsSaldo.toFixed(2)}`, inline: true },
                    { name: '📊 Vendas Totais', value: `${stats.vendas_totais || 0}`, inline: true },
                    { name: '💵 Faturamento', value: `R$ ${(stats.faturamento || 0).toFixed(2)}`, inline: true }
                );

            const select = new StringSelectMenuBuilder()
                .setCustomId('painel_admin_select')
                .setPlaceholder('Selecione uma ação...')
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Mercado Pago')
                        .setValue('opt_mp')
                        .setDescription('Configurar Token do MP')
                        .setEmoji('💸'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('SMS24h API')
                        .setValue('opt_sms')
                        .setDescription('Configurar API Key SMS')
                        .setEmoji('📩'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Estatísticas')
                        .setValue('opt_stats')
                        .setDescription('Ver dados detalhados')
                        .setEmoji('📊'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Ticket Dinâmico')
                        .setValue('opt_ticket')
                        .setDescription('Configurar Categoria e Logs')
                        .setEmoji('🎫'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Pedidos')
                        .setValue('opt_pedidos')
                        .setDescription('Visualizar últimos pedidos')
                        .setEmoji('🛒'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Blacklist')
                        .setValue('opt_blacklist')
                        .setDescription('Banir usuário do bot')
                        .setEmoji('🚫'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Adicionar Saldo')
                        .setValue('opt_saldo')
                        .setDescription('Adicionar saldo a um user')
                        .setEmoji('💰'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Atualizar Mensagem')
                        .setValue('opt_atualizar_msg')
                        .setDescription('Atualizar layout via JSON (Type 17)')
                        .setEmoji('🔄'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('JSON Termos')
                        .setValue('opt_json_termos')
                        .setDescription('Ver e copiar JSON dos Termos do Ticket')
                        .setEmoji('📄')
                );

            const row = new ActionRowBuilder().addComponents(select);

            await interaction.editReply({ 
                embeds: [embed], 
                components: [row]
            });

        } catch (error) {
            console.error('Erro ao abrir painel:', error);
        }
    },

    async handleSelection(interaction) {
        try {
            const selected = interaction.values[0];
            // Opções que abrem modais NÃO devem receber deferUpdate/deferReply
            const modais = ['opt_mp', 'opt_sms', 'opt_blacklist', 'opt_saldo'];
            const isModal = modais.includes(selected);
            
            if (!isModal) {
                try {
                    if (!interaction.deferred && !interaction.replied) {
                        await interaction.deferUpdate().catch(() => {});
                    }
                } catch (e) {}
            }

            if (selected === 'opt_mp') {
                const modal = new ModalBuilder().setCustomId('modal_mp').setTitle('Configurar Mercado Pago');
                const token = new TextInputBuilder().setCustomId('access_token').setLabel('Access Token').setRequired(true).setStyle(TextInputStyle.Paragraph);
                modal.addComponents(new ActionRowBuilder().addComponents(token));
                return interaction.showModal(modal);
            }

            if (selected === 'opt_sms') {
                const modal = new ModalBuilder().setCustomId('modal_sms24h').setTitle('Configurar SMS24h');
                const key = new TextInputBuilder().setCustomId('api_key').setLabel('API Key').setRequired(true).setStyle(TextInputStyle.Short);
                modal.addComponents(new ActionRowBuilder().addComponents(key));
                return interaction.showModal(modal);
            }

            if (selected === 'opt_ticket') {
                const embed = new EmbedBuilder()
                    .setTitle('🎫 Configuração de Ticket')
                    .setDescription('Selecione abaixo a categoria para os tickets e o canal onde os logs serão enviados.')
                    .setColor('#090b0c');

                const rowCategory = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('ticket_select_category')
                        .setPlaceholder('Selecione a Categoria de Tickets')
                        .addOptions(
                            interaction.guild.channels.cache
                                .filter(c => c.type === 4) // Category
                                .first(25)
                                .map(c => new StringSelectMenuOptionBuilder().setLabel(c.name).setValue(c.id))
                        )
                );

                const rowLogs = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('ticket_select_logs')
                        .setPlaceholder('Selecione o Canal de Logs')
                        .addOptions(
                            interaction.guild.channels.cache
                                .filter(c => c.type === 0) // Text Channel
                                .first(25)
                                .map(c => new StringSelectMenuOptionBuilder().setLabel(c.name).setValue(c.id))
                        )
                );

                const rowVoltar = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('painel_admin_select')
                        .setPlaceholder('Voltar ao Menu Principal')
                        .addOptions(
                            new StringSelectMenuOptionBuilder().setLabel('Voltar').setValue('voltar_inicio').setEmoji('⬅️')
                        )
                );

                if (interaction.deferred || interaction.replied) {
                    return interaction.editReply({ embeds: [embed], components: [rowCategory, rowLogs, rowVoltar] });
                } else {
                    return interaction.reply({ embeds: [embed], components: [rowCategory, rowLogs, rowVoltar], ephemeral: true });
                }
            }

            if (selected === 'voltar_inicio') {
                const stats = General.get('estatisticas') || {};
                const smsSaldo = General.get('sms24h.saldo') || 0;

                const embed = new EmbedBuilder()
                    .setTitle('Painel de Administração')
                    .setDescription('Utilize o menu abaixo para gerenciar o sistema.')
                    .setColor(General.get('color.padrao') || '#090b0c')
                    .addFields(
                        { name: '💰 Saldo SMS24H', value: `R$ ${smsSaldo.toFixed(2)}`, inline: true },
                        { name: '📊 Vendas Totais', value: `${stats.vendas_totais || 0}`, inline: true },
                        { name: '💵 Faturamento', value: `R$ ${(stats.faturamento || 0).toFixed(2)}`, inline: true }
                    );
                
                // Reutiliza a criação do menu principal
                const select = new StringSelectMenuBuilder()
                    .setCustomId('painel_admin_select')
                    .setPlaceholder('Selecione uma ação...')
                    .addOptions(
                        new StringSelectMenuOptionBuilder().setLabel('Mercado Pago').setValue('opt_mp').setDescription('Configurar Token do MP').setEmoji('💸'),
                        new StringSelectMenuOptionBuilder().setLabel('SMS24h API').setValue('opt_sms').setDescription('Configurar API Key SMS').setEmoji('📩'),
                        new StringSelectMenuOptionBuilder().setLabel('Estatísticas').setValue('opt_stats').setDescription('Ver dados detalhados').setEmoji('📊'),
                        new StringSelectMenuOptionBuilder().setLabel('Ticket Dinâmico').setValue('opt_ticket').setDescription('Configurar Categoria e Logs').setEmoji('🎫'),
                        new StringSelectMenuOptionBuilder().setLabel('Pedidos').setValue('opt_pedidos').setDescription('Visualizar últimos pedidos').setEmoji('🛒'),
                        new StringSelectMenuOptionBuilder().setLabel('Blacklist').setValue('opt_blacklist').setDescription('Banir usuário do bot').setEmoji('🚫'),
                        new StringSelectMenuOptionBuilder().setLabel('Adicionar Saldo').setValue('opt_saldo').setDescription('Adicionar saldo a um user').setEmoji('💰'),
                        new StringSelectMenuOptionBuilder().setLabel('Atualizar Mensagem').setValue('opt_atualizar_msg').setDescription('Atualizar layout via JSON (Type 17)').setEmoji('🔄'),
                        new StringSelectMenuOptionBuilder().setLabel('JSON Termos').setValue('opt_json_termos').setDescription('Ver e copiar JSON dos Termos do Ticket').setEmoji('📄')
                    );

                return interaction.editReply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(select)] });
            }

            if (selected === 'opt_blacklist') {
                const modal = new ModalBuilder().setCustomId('modal_blacklist').setTitle('Gerenciar Blacklist');
                const uId = new TextInputBuilder().setCustomId('user_id').setLabel('ID do Usuário').setRequired(true).setStyle(TextInputStyle.Short);
                modal.addComponents(new ActionRowBuilder().addComponents(uId));
                return interaction.showModal(modal);
            }

            if (selected === 'opt_saldo') {
                const modal = new ModalBuilder().setCustomId('modal_saldo').setTitle('Adicionar Saldo');
                const uId = new TextInputBuilder().setCustomId('user_id').setLabel('ID do Usuário').setRequired(true).setStyle(TextInputStyle.Short);
                const val = new TextInputBuilder().setCustomId('valor').setLabel('Valor (R$)').setRequired(true).setStyle(TextInputStyle.Short);
                modal.addComponents(new ActionRowBuilder().addComponents(uId), new ActionRowBuilder().addComponents(val));
                return interaction.showModal(modal);
            }

            if (selected === 'opt_json_termos') {
                // Retornar o JSON dos termos sem embed, conforme definido no ticketHandler
                const termosJson = {
                    titulo: "📋 Olá, {userId}!\n## Leia os Termos de Uso",
                    regras: [
                        "**Regras do Sistema:**\n",
                        "-# 1. O número é único e exclusivo para você.\n",
                        "-# 2. Utilize apenas para fins legais.\n",
                        "-# 3. O código SMS deve ser usado dentro de 10 minutos.\n\n",
                        "**⚠️ Garantia:**\n",
                        "-# Se o código não chegar, o saldo é estornado automaticamente."
                    ],
                    botao_aceitar: "Concordar e Continuar",
                    botao_cancelar: "Cancelar"
                };
                
                return interaction.editReply({ 
                    content: `\`\`\`json\n${JSON.stringify(termosJson, null, 2)}\n\`\`\``,
                    embeds: [],
                    components: []
                });
            }

            // Opções de Atualização (Com deferUpdate)
            try {
                if (!interaction.deferred && !interaction.replied) {
                    await interaction.deferUpdate().catch(() => {});
                }
            } catch (e) {}

            const stats = General.get('estatisticas') || {};

            if (selected === 'opt_stats') {
                const embed = new EmbedBuilder()
                    .setTitle('📊 Estatísticas')
                    .setColor('#090b0c')
                    .addFields(
                        { name: 'Vendas Totais', value: `${stats.vendas_totais || 0}`, inline: true },
                        { name: 'Faturamento', value: `R$ ${(stats.faturamento || 0).toFixed(2)}`, inline: true },
                        { name: 'SMS Entregues', value: `${stats.sms_entregues || 0}`, inline: true }
                    );
                return interaction.editReply({ embeds: [embed] });
            }

            if (selected === 'opt_pedidos') {
                const embed = new EmbedBuilder()
                    .setTitle('🛒 Pedidos')
                    .setDescription('Lista de pedidos recentes (vazio).')
                    .setColor('#090b0c');
                return interaction.editReply({ embeds: [embed] });
            }

            if (selected === 'opt_atualizar_msg') {
                // SEM EMBED - Usando apenas content como solicitado
                const select = new StringSelectMenuBuilder()
                    .setCustomId('update_msg_type_select')
                    .setPlaceholder('Escolha o tipo de mensagem...')
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Abrir Ticket')
                            .setValue('type_ticket')
                            .setDescription('Atualizar mensagem do /menu (menuPrincipal.js)')
                            .setEmoji('🎫'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Termos')
                            .setValue('type_termos')
                            .setDescription('Atualizar mensagem de Termos (mensagens.json)')
                            .setEmoji('📜'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Outra Mensagem')
                            .setValue('type_other')
                            .setDescription('Atualizar qualquer mensagem via ID')
                            .setEmoji('📝')
                    );

                return interaction.editReply({ 
                    content: '🔄 **Atualizar Mensagem (Type 17)**\nEscolha qual mensagem você deseja atualizar:',
                    embeds: [],
                    components: [new ActionRowBuilder().addComponents(select)] 
                });
            }

            if (selected === 'ticket_select_category') {
                const categoriaId = interaction.values[0];
                
                // Deferir a resposta ANTES de qualquer operação
                try {
                    if (!interaction.deferred && !interaction.replied) {
                        await interaction.deferUpdate().catch(() => {});
                    }
                } catch (e) {
                    console.error('Erro ao deferir:', e);
                }

                // Deferir a resposta antes de atualizar o menu
                if (!interaction.deferred && !interaction.replied) {
                    await interaction.deferUpdate().catch(() => {});
                }

                await interaction.followUp({
                    content: `✅ **Categoria configurada com sucesso!**\n📁 **Categoria:** ${nomeCategoria}\n🆔 **ID:** \`${categoriaId}\``,
                    ephemeral: true
                });

                // Atualizar o menu para mostrar a nova configuração
                return interaction.editReply({ 
                    content: '✅ Categoria salva! Selecione o canal de logs abaixo:',
                    embeds: [],
                    components: [
                        new ActionRowBuilder().addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId('ticket_select_logs')
                                .setPlaceholder('Selecione o Canal de Logs')
                                .addOptions(
                                    interaction.guild.channels.cache
                                        .filter(c => c.type === 0)
                                        .first(25)
                                        .map(c => new StringSelectMenuOptionBuilder().setLabel(c.name).setValue(c.id))
                                )
                        ),
                        new ActionRowBuilder().addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId('painel_admin_select')
                                .setPlaceholder('Voltar ao Menu Principal')
                                .addOptions(
                                    new StringSelectMenuOptionBuilder().setLabel('Voltar').setValue('voltar_inicio').setEmoji('⬅️')
                                )
                        )
                    ]
                });
            }

            if (selected === 'ticket_select_logs') {
                const canalId = interaction.values[0];
                
                // Salvar o canal selecionado
                General.set('tickets.logs', canalId);

                // Buscar nome do canal
                const canal = interaction.guild.channels.cache.get(canalId);
                const nomeCanal = canal ? canal.name : 'Desconhecido';

                // Deferir a resposta antes de atualizar o menu
                if (!interaction.deferred && !interaction.replied) {
                    await interaction.deferUpdate().catch(() => {});
                }

                await interaction.followUp({
                    content: `✅ **Canal de logs configurado com sucesso!**\n# **Canal:** ${nomeCanal}\n🆔 **ID:** \`${canalId}\``,
                    ephemeral: true
                });

                // Voltar ao painel principal
                return interaction.editReply({ 
                    content: '✅ Configuração de ticket completa!',
                    embeds: [],
                    components: []
                });
            }

            if (selected === 'type_ticket' || selected === 'type_termos' || selected === 'type_other') {
                const axios = require('axios');
                const config = require('../../config.json');
                const updateType = selected;

                let canalId, mensagemId;
                
                if (updateType === 'type_ticket') {
                    canalId = General.get('menu_principal.canal');
                    mensagemId = General.get('menu_principal.mensagem_id');
                } else if (updateType === 'type_termos') {
                    // Canais de termos geralmente são configurados dinamicamente nos tickets, 
                    // mas para atualizar a mensagem existente, precisamos do ID salvo.
                    canalId = General.get('ticket.canal_termos'); 
                    mensagemId = General.get('ticket.mensagem_termos_id');
                }

                // SEM EMBED - Usando apenas content como solicitado
                if (!canalId || !mensagemId || updateType === 'type_other') {
                    await interaction.editReply({ 
                        content: '1. Primeiro, envie o **ID do Canal**.\n\n*Aguardando ID do Canal...*',
                        embeds: [],
                        components: [] 
                    });
                } else {
                    // Buscar JSON atual
                    let currentJson = "Não foi possível recuperar o JSON atual.";
                    try {
                        const response = await axios.get(
                            `https://discord.com/api/v10/channels/${canalId}/messages/${mensagemId}`,
                            { headers: { 'Authorization': `Bot ${config.token}` } }
                        );
                        if (response.data.components && response.data.components[0] && response.data.components[0].type === 17) {
                            currentJson = JSON.stringify(response.data.components[0].components, null, 2);
                        }
                    } catch (e) {}

                    const jsonPreview = currentJson.length > 1500 ? currentJson.substring(0, 1500) + '\n... (JSON truncado)' : currentJson;
                    
                    await interaction.editReply({ 
                        content: `1. Canal: \`${canalId}\` ✅\n2. Mensagem: \`${mensagemId}\` ✅\n\n**JSON Atual:**\n\`\`\`json\n${jsonPreview}\n\`\`\`\n\n3. *Envie o NOVO JSON dos Componentes agora...*`,
                        embeds: [],
                        components: [] 
                    });
                }

                const filter = m => m.author.id === interaction.user.id;
                const collector = interaction.channel.createMessageCollector({ filter, time: 120000 });
                
                let step = (!canalId || !mensagemId || updateType === 'type_other') ? 1 : 3;

                collector.on('collect', async m => {
                    try {
                        if (step === 1) {
                            canalId = m.content.trim();
                            await m.delete().catch(() => {});
                            step = 2;
                            return interaction.editReply({ 
                                content: '1. Canal: `' + canalId + '` ✅\n2. *Aguardando ID da Mensagem...*',
                                embeds: [],
                                components: [] 
                            });
                        }

                        if (step === 2) {
                            mensagemId = m.content.trim();
                            await m.delete().catch(() => {});
                            
                            let currentJson = "Não foi possível recuperar o JSON atual.";
                            try {
                                const response = await axios.get(
                                    `https://discord.com/api/v10/channels/${canalId}/messages/${mensagemId}`,
                                    { headers: { 'Authorization': `Bot ${config.token}` } }
                                );
                                if (response.data.components && response.data.components[0] && response.data.components[0].type === 17) {
                                    currentJson = JSON.stringify(response.data.components[0].components, null, 2);
                                }
                            } catch (e) {}

                            step = 3;
                            const jsonPreview = currentJson.length > 1500 ? currentJson.substring(0, 1500) + '\n... (JSON truncado)' : currentJson;
                            return interaction.editReply({ 
                                content: '1. Canal: `' + canalId + '` ✅\n2. Mensagem: `' + mensagemId + '` ✅\n\n**JSON Atual:**\n```json\n' + jsonPreview + '\n```\n\n3. *Envie o NOVO JSON dos Componentes agora...*',
                                embeds: [],
                                components: [] 
                            });
                        }

                        if (step === 3) {
                            let cleanContent = m.content.replace(/```json|```/g, '').trim();
                            let userComponents;
                            try { userComponents = JSON.parse(cleanContent); } catch (e) {
                                return m.reply({ content: '❌ **JSON Inválido!**', ephemeral: true }).then(msg => setTimeout(() => msg.delete(), 5000));
                            }
                            await m.delete().catch(() => {});

                            // Correção automática Type 12
                            userComponents = userComponents.map(comp => {
                                if (comp.type === 12 && comp.items) {
                                    comp.items = comp.items.filter(item => item.media && item.media.url && item.media.url.length > 5);
                                }
                                return comp;
                            });

                            const finalPayload = {
                                content: null,
                                components: [{ type: 17, accent_color: 9225410, spoiler: false, components: userComponents }]
                            };

                            await axios.patch(
                                `https://discord.com/api/v10/channels/${canalId}/messages/${mensagemId}`,
                                finalPayload,
                                { headers: { 'Authorization': `Bot ${config.token}`, 'Content-Type': 'application/json' } }
                            );

                            // Persistência se for tipo conhecido
                            if (updateType === 'type_termos') {
                                const mensagens = require('../../DataBaseJson/mensagens.json');
                                mensagens.termos.components = userComponents;
                                const fs = require('fs');
                                fs.writeFileSync('./DataBaseJson/mensagens.json', JSON.stringify(mensagens, null, 4));
                            }

                            collector.stop();
                            return interaction.editReply({ 
                                content: '✅ **Interface atualizada com sucesso!**',
                                embeds: [],
                                components: [] 
                            });
                        }
                    } catch (error) {
                        console.error(error);
                        interaction.followUp({ content: `❌ **Erro:** ${error.message}`, ephemeral: true });
                    }
                });
            }

        } catch (error) {
            console.error('Erro no seletor:', error);
        }
    }
};