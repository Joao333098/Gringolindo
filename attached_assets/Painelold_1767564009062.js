const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { General, perms, emoji } = require('../../DataBaseJson');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('painel')
        .setDescription('Painel de Administração - Apenas Dono')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    // Expondo as funções auxiliares para serem usadas pelo seu handler global se necessário
    modalSMS24H,
    modalPIX,
    modalMercadoPago,
    mostrarEstatisticas,
    mostrarPedidos,
    modalConfigTicket,
    editarMenuPrincipal,
    modalAddSaldo,
    modalBlacklist,
    voltarPainel,
    modalAtualizarMensagens,

    async run(client, interaction) {
        // 1. Verificar permissões
        if (!perms.has(interaction.user.id)) {
            return interaction.reply({
                content: `${emoji.erro} Você não tem permissão para usar este comando!`,
                ephemeral: true
            }).catch(() => {});
        }

        // 2. Tentar dar defer imediatamente. Se falhar aqui, o código para (evita o erro InteractionNotReplied).
        try {
            await interaction.deferReply({ ephemeral: true });
        } catch (error) {
            console.error("Erro fatal ao deferir interação (provável timeout ou lag):", error);
            return; // Encerra a execução para não causar mais erros
        }

        // 3. Construção do Painel
        const embed = new EmbedBuilder()
            .setTitle(`${emoji.admin} Painel de Administração`)
            .setDescription('Bem-vindo ao painel administrativo. Selecione uma opção:')
            .setColor(General.get('color.padrao') || '#090b0c')
            .setThumbnail(client.user.displayAvatarURL())
            .setFooter({ text: `${client.user.username} - Admin Panel` })
            .addFields(
                { name: '💰 Saldo SMS24H', value: `R$ ${(General.get('sms24h.saldo') || 0).toFixed(2)}`, inline: true },
                { name: '📊 Vendas Totais', value: `${General.get('estatisticas.vendas_totais') || 0}`, inline: true },
                { name: '💵 Faturamento', value: `R$ ${(General.get('estatisticas.faturamento') || 0).toFixed(2)}`, inline: true }
            );

        // Linha 1 - Configurações
        const row1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('admin_config_sms24h')
                    .setLabel('⚙️ Configurar SMS24H')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('admin_config_pix')
                    .setLabel('💳 Configurar PIX')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('admin_config_mp')
                    .setLabel('💵 Configurar Mercado Pago')
                    .setStyle(ButtonStyle.Secondary)
            );

        // Linha 2 - Gerenciamento
        const row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('admin_estatisticas')
                    .setLabel('📊 Estatísticas')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('admin_pedidos')
                    .setLabel('🛒 Pedidos')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('admin_config_ticket')
                    .setLabel('🎫 Configurar Ticket')
                    .setStyle(ButtonStyle.Primary)
            );

        // Linha 3 - Edição
        const row3 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('admin_editar_menu')
                    .setLabel('✏️ Editar Menu Principal')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('admin_add_saldo')
                    .setLabel('💰 Adicionar Saldo')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('admin_blacklist')
                    .setLabel('🚫 Blacklist')
                    .setStyle(ButtonStyle.Danger)
            );

        // Linha 4 - Atualizar Mensagens
        const row4 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('admin_atualizar_msg')
                    .setLabel('🔄 Atualizar Mensagens')
                    .setStyle(ButtonStyle.Primary)
            );

        // 4. Enviar a resposta (Editando o defer)
        try {
            await interaction.editReply({
                embeds: [embed],
                components: [row1, row2, row3, row4]
            });
        } catch (error) {
            console.error('Erro ao enviar o painel (editReply):', error);
        }
    }
};

// --- Funções Auxiliares ---
// NOTA: Estas funções devem ser chamadas pelo seu Global Handler ao detectar o customId dos botões.
// Elas NÃO devem conter 'client.on' internamente, pois isso causa vazamento de memória.

async function modalSMS24H(interaction) {
    // ATENÇÃO: NÃO use deferReply antes de chamar showModal. Modals só abrem se forem a primeira resposta.
    const modal = new ModalBuilder()
        .setCustomId('modal_sms24h')
        .setTitle('Configurar API SMS24H');

    const apiKey = new TextInputBuilder()
        .setCustomId('api_key')
        .setLabel('API Key SMS24H')
        .setPlaceholder('Cole sua API Key aqui')
        .setRequired(true)
        .setStyle(TextInputStyle.Short);

    modal.addComponents(new ActionRowBuilder().addComponents(apiKey));

    await interaction.showModal(modal);
    // A lógica de salvar o que foi digitado no modal deve ficar no seu evento 'interactionCreate' (isModalSubmit)
}

async function modalPIX(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('modal_pix')
        .setTitle('Configurar Chave PIX');

    const chave = new TextInputBuilder()
        .setCustomId('chave_pix')
        .setLabel('Chave PIX')
        .setRequired(true)
        .setStyle(TextInputStyle.Short);

    const tipo = new TextInputBuilder()
        .setCustomId('tipo_pix')
        .setLabel('Tipo (CPF, Email, Telefone, Aleatória)')
        .setRequired(true)
        .setStyle(TextInputStyle.Short);

    modal.addComponents(
        new ActionRowBuilder().addComponents(chave),
        new ActionRowBuilder().addComponents(tipo)
    );

    await interaction.showModal(modal);
}

async function modalMercadoPago(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('modal_mp')
        .setTitle('Configurar Mercado Pago');

    const accessToken = new TextInputBuilder()
        .setCustomId('access_token')
        .setLabel('Access Token')
        .setRequired(true)
        .setStyle(TextInputStyle.Paragraph);

    modal.addComponents(new ActionRowBuilder().addComponents(accessToken));

    await interaction.showModal(modal);
}

async function mostrarEstatisticas(interaction) {
    // Como isso vem de um botão, a interação já deve estar deferida ou precisa de update
    const stats = General.get('estatisticas') || {};

    const embed = new EmbedBuilder()
        .setTitle(`${emoji.estatisticas} Estatísticas`)
        .addFields(
            { name: 'Vendas Totais', value: `${stats.vendas_totais || 0}`, inline: true },
            { name: 'Faturamento', value: `R$ ${(stats.faturamento || 0).toFixed(2)}`, inline: true },
            { name: 'Lucro (15%)', value: `R$ ${((stats.faturamento || 0) * 0.15).toFixed(2)}`, inline: true },
            { name: 'SMS Entregues', value: `${stats.sms_entregues || 0}`, inline: true },
            { name: 'Tickets Criados', value: `${stats.tickets_criados || 0}`, inline: true },
            { name: 'Usuarios Ativos', value: `${stats.usuarios_ativos || 0}`, inline: true }
        )
        .setColor(General.get('color.padrao') || '#090b0c');

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('admin_voltar_painel')
            .setLabel('⬅️ Voltar')
            .setStyle(ButtonStyle.Secondary)
    );

    // Verifica se pode editar ou se precisa atualizar
    if (interaction.isButton()) {
        await interaction.update({ embeds: [embed], components: [row] }).catch(() => {});
    } else {
        await interaction.editReply({ embeds: [embed], components: [row] }).catch(() => {});
    }
}

async function mostrarPedidos(interaction) {
    const embed = new EmbedBuilder()
        .setTitle(`${emoji.carrinho} Pedidos Recentes`)
        .setDescription('Sistema de pedidos em desenvolvimento.')
        .setColor(General.get('color.padrao') || '#090b0c');

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('admin_voltar_painel')
            .setLabel('⬅️ Voltar')
            .setStyle(ButtonStyle.Secondary)
    );

    if (interaction.isButton()) {
        await interaction.update({ embeds: [embed], components: [row] }).catch(() => {});
    } else {
        await interaction.editReply({ embeds: [embed], components: [row] }).catch(() => {});
    }
}

async function modalConfigTicket(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('modal_ticket')
        .setTitle('Configurar Tickets');

    const categoria = new TextInputBuilder()
        .setCustomId('categoria')
        .setLabel('ID da Categoria de Tickets')
        .setRequired(true)
        .setStyle(TextInputStyle.Short);

    const logs = new TextInputBuilder()
        .setCustomId('logs')
        .setLabel('ID do Canal de Logs')
        .setRequired(true)
        .setStyle(TextInputStyle.Short);

    modal.addComponents(
        new ActionRowBuilder().addComponents(categoria),
        new ActionRowBuilder().addComponents(logs)
    );

    await interaction.showModal(modal);
}

async function editarMenuPrincipal(interaction) {
    const embed = new EmbedBuilder()
        .setTitle('✏️ Editar Menu Principal')
        .setDescription('Selecione uma opção para editar:')
        .setColor(General.get('color.padrao') || '#090b0c');

    const rows = [
        new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('admin_edit_titulo')
                    .setLabel('Título')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('admin_edit_descricao')
                    .setLabel('Descrição')
                    .setStyle(ButtonStyle.Secondary)
            ),
        new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('admin_edit_cor')
                    .setLabel('Cor')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('admin_voltar_painel')
                    .setLabel('⬅️ Voltar')
                    .setStyle(ButtonStyle.Primary)
            )
    ];

    if (interaction.isButton()) {
        await interaction.update({ embeds: [embed], components: rows }).catch(() => {});
    } else {
        await interaction.editReply({ embeds: [embed], components: rows }).catch(() => {});
    }
}

async function modalAddSaldo(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('modal_saldo')
        .setTitle('Adicionar Saldo');

    const userId = new TextInputBuilder()
        .setCustomId('user_id')
        .setLabel('ID do Usuário')
        .setRequired(true)
        .setStyle(TextInputStyle.Short);

    const valor = new TextInputBuilder()
        .setCustomId('valor')
        .setLabel('Valor (R$)')
        .setRequired(true)
        .setStyle(TextInputStyle.Short);

    modal.addComponents(
        new ActionRowBuilder().addComponents(userId),
        new ActionRowBuilder().addComponents(valor)
    );

    await interaction.showModal(modal);
}

async function modalBlacklist(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('modal_blacklist')
        .setTitle('Gerenciar Blacklist');

    const userId = new TextInputBuilder()
        .setCustomId('user_id')
        .setLabel('ID do Usuário')
        .setRequired(true)
        .setStyle(TextInputStyle.Short);

    modal.addComponents(new ActionRowBuilder().addComponents(userId));

    await interaction.showModal(modal);
}

async function voltarPainel(interaction) {
    const embed = new EmbedBuilder()
        .setTitle(`${emoji.admin} Painel de Administração`)
        .setDescription('Bem-vindo ao painel administrativo. Selecione uma opção:')
        .setFooter({ text: 'Admin Panel' }) // Pequeno ajuste para evitar undefined se client não for passado
        .setColor(General.get('color.padrao') || '#090b0c');

        // Adicionar campos de volta para manter consistência
        const stats = General.get('estatisticas') || {};
        const smsSaldo = General.get('sms24h.saldo') || 0;

        embed.addFields(
            { name: '💰 Saldo SMS24H', value: `R$ ${smsSaldo.toFixed(2)}`, inline: true },
            { name: '📊 Vendas Totais', value: `${stats.vendas_totais || 0}`, inline: true },
            { name: '💵 Faturamento', value: `R$ ${(stats.faturamento || 0).toFixed(2)}`, inline: true }
        );

    const row1 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('admin_config_sms24h')
                .setLabel('⚙️ Configurar SMS24H')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('admin_config_pix')
                .setLabel('💳 Configurar PIX')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('admin_config_mp')
                .setLabel('💵 Configurar Mercado Pago')
                .setStyle(ButtonStyle.Secondary)
        );

    const row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('admin_estatisticas')
                    .setLabel('📊 Estatísticas')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('admin_pedidos')
                    .setLabel('🛒 Pedidos')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('admin_config_ticket')
                    .setLabel('🎫 Configurar Ticket')
                    .setStyle(ButtonStyle.Primary)
            );

        const row3 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('admin_editar_menu')
                    .setLabel('✏️ Editar Menu Principal')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('admin_add_saldo')
                    .setLabel('💰 Adicionar Saldo')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('admin_blacklist')
                    .setLabel('🚫 Blacklist')
                    .setStyle(ButtonStyle.Danger)
            );

    const row4 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('admin_atualizar_msg')
                .setLabel('🔄 Atualizar Mensagens')
                .setStyle(ButtonStyle.Primary)
        );

    if (interaction.isButton()) {
        await interaction.update({ embeds: [embed], components: [row1, row2, row3, row4] }).catch(() => {});
    } else {
        await interaction.editReply({ embeds: [embed], components: [row1, row2, row3, row4] }).catch(() => {});
    }
}

async function modalAtualizarMensagens(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('modal_atualizar_msg')
        .setTitle('Atualizar Mensagens V2');

    const mensagem = new TextInputBuilder()
        .setCustomId('json_components')
        .setLabel('JSON dos Componentes V2')
        .setPlaceholder('Cole o JSON dos componentes (types 9-14 ou 1) aqui...')
        .setRequired(true)
        .setStyle(TextInputStyle.Paragraph);

    const channelId = new TextInputBuilder()
        .setCustomId('channel_id')
        .setLabel('ID do Canal (Opcional - usa o atual se vazio)')
        .setPlaceholder('Deixe vazio para usar o canal atual')
        .setRequired(false)
        .setStyle(TextInputStyle.Short);

    const messageId = new TextInputBuilder()
        .setCustomId('message_id')
        .setLabel('ID da Mensagem')
        .setPlaceholder('ID da mensagem a ser atualizada')
        .setRequired(true)
        .setStyle(TextInputStyle.Short);

    modal.addComponents(
        new ActionRowBuilder().addComponents(mensagem),
        new ActionRowBuilder().addComponents(channelId),
        new ActionRowBuilder().addComponents(messageId)
    );

    await interaction.showModal(modal);
}
