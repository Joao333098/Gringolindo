const { 
    ContainerBuilder, 
    TextDisplayBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ActionRowBuilder, 
    MediaGalleryBuilder, 
    MediaGalleryItemBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags 
} = require('discord.js');
const { General, perms } = require('../../DataBaseJson'); 

/**
 * Cria e envia o menu principal no canal configurado usando Component V2
 */
async function criarMenuPrincipal(client) {
    const canalId = General.get('menu_principal.canal');
    if (!canalId) return;

    const canal = await client.channels.fetch(canalId).catch(() => null);
    if (!canal) return;

    // Obter configurações dinâmicas via JSON
    const config = General.get('menu_principal.config') || {
        titulo: "## <:Pngtreeshoppingcartlineiconvecto:1269491777501659187> Sistema de Números SMS",
        descricao: "## 📖 Como Funciona?\n1. Clique no botão **Adquirir número** abaixo.\n2. Um ticket exclusivo será aberto para você.\n3. Siga as instruções no ticket para escolher seu serviço e receber o SMS!\n\n-# Adquira números SMS para diversas plataformas de forma rápida e segura!",
        servicos: "## <:caixa_cristalstore:1457178257823891536> Serviços Disponíveis\n-# 140+ serviços incluindo WhatsApp, Telegram, Instagram, Facebook, Twitter, TikTok e muito mais!\n\n## <:raiobranco_cristalstore:1457178212265234644> Entrega Rápida\n-# Receba seu número e SMS automaticamente em segundos!\n\n## <:bagdinheiro_cristalstore:1457178080350044334> Preços Competitivos",
        botao_label: "Adquirir número",
        botao_emoji: "1457179114124476498"
    };

    // Criar Container V2
    const container = new ContainerBuilder()
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(config.titulo)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(config.descricao)
        )
        .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(config.servicos)
        )
        .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        )
        .addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Success)
                    .setLabel(config.botao_label)
                    .setEmoji(config.botao_emoji)
                    .setCustomId("adquirir")
            )
        );

    // Lógica de envio/edição
    const mensagemId = General.get('menu_principal.mensagem_id');
    const payload = {
        components: [container],
        flags: [MessageFlags.IsComponentsV2]
    };

    if (mensagemId) {
        try {
            const mensagem = await canal.messages.fetch(mensagemId);
            await mensagem.edit(payload);
            return;
        } catch (error) {
            // Mensagem antiga não encontrada
        }
    }

    const mensagem = await canal.send(payload);
    General.set('menu_principal.mensagem_id', mensagem.id);
}

async function processarNovoMenuJSON(interaction) {
    const sessao = sessoesUsuario.get(interaction.user.id);
    if (!sessao?.novo_config_menu_json) return interaction.reply({ content: '❌ Nenhum JSON pendente.', ephemeral: true });

    // Salvar no banco
    General.set('menu_principal.config', sessao.novo_config_menu_json);
    
    await interaction.editReply({
        content: '✅ **Sistema de Menu atualizado com sucesso via JSON!**',
        components: []
    });
}

async function iniciarConfiguracaoMenuJSON(interaction) {
    const { user } = interaction;
    
    const configAtual = General.get('menu_principal.config') || {
        titulo: "## <:Pngtreeshoppingcartlineiconvecto:1269491777501659187> Sistema de Números SMS",
        descricao: "## 📖 Como Funciona?\n1. Clique no botão **Adquirir número** abaixo.\n2. Um ticket exclusivo será aberto para você.\n3. Siga as instruções no ticket para escolher seu serviço e receber o SMS!\n\n-# Adquira números SMS para diversas plataformas de forma rápida e segura!",
        servicos: "## <:caixa_cristalstore:1457178257823891536> Serviços Disponíveis\n-# 140+ serviços incluindo WhatsApp, Telegram, Instagram, Facebook, Twitter, TikTok e muito mais!\n\n## <:raiobranco_cristalstore:1457178212265234644> Entrega Rápida\n-# Receba seu número e SMS automaticamente em segundos!\n\n## <:bagdinheiro_cristalstore:1457178080350044334> Preços Competitivos",
        botao_label: "Adquirir número",
        botao_emoji: "1457179114124476498"
    };

    const jsonString = JSON.stringify(configAtual, null, 2);
    
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('confirmar_menu_json').setLabel('Confirmar Alteração').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('cancelar_menu_json').setLabel('Cancelar').setStyle(ButtonStyle.Danger)
    );

    await interaction.editReply({
        content: `📦 **Configuração Atual do Menu (JSON):**\n\`\`\`json\n${jsonString}\n\`\`\`\n\nPor favor, envie o **NOVO JSON** alterado no chat agora.`,
        components: [row]
    });

    const filter = m => m.author.id === user.id;
    const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 300000 });

    collector.on('collect', async m => {
        try {
            const novoJson = JSON.parse(m.content);
            sessoesUsuario.set(user.id, { ...sessoesUsuario.get(user.id), novo_config_menu_json: novoJson });
            await m.delete().catch(() => {});
            await interaction.editReply({
                content: `✅ **JSON do Menu recebido!**\nClique no botão abaixo para confirmar a aplicação.`,
                components: [row]
            });
        } catch (e) {
            await interaction.followUp({ content: '❌ JSON inválido!', ephemeral: true });
        }
    });
}

const sessoesUsuario = new Map();

module.exports = { 
    criarMenuPrincipal,
    run: async (interaction, client) => {
        const { customId, user } = interaction;
        if (customId === 'admin_config_menu_json') {
            if (!perms.has(user.id)) return;
            if (!interaction.deferred && !interaction.replied) await interaction.deferReply({ ephemeral: true });
            return iniciarConfiguracaoMenuJSON(interaction);
        }
        if (customId === 'confirmar_menu_json') {
            if (!interaction.deferred && !interaction.replied) await interaction.deferUpdate();
            await processarNovoMenuJSON(interaction);
            sessoesUsuario.delete(user.id);
            return;
        }
        if (customId === 'cancelar_menu_json') {
            if (!interaction.deferred && !interaction.replied) await interaction.deferUpdate();
            sessoesUsuario.delete(user.id);
            return interaction.editReply({ content: '❌ Cancelado.', components: [] });
        }
    }
};
