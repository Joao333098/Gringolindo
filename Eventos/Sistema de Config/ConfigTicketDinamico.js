const { 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
    StringSelectMenuOptionBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');
const { General, perms, emoji } = require('../../DataBaseJson');

module.exports = {
    name: 'interactionCreate',
    run: async (interaction, client) => {
        // Verificar se a interação já foi processada
        if (interaction.replied || interaction.deferred) {
            return;
        }

        // Processar apenas botões relacionados à configuração de ticket dinâmica
        if (interaction.isButton() && interaction.customId === 'admin_config_ticket_dinamico') {
            return await mostrarMenuSelecaoTicket(interaction, client);
        }

        // Processar menu de seleção de categoria
        if (interaction.isStringSelectMenu() && interaction.customId === 'selecionar_categoria_ticket') {
            return await processarSelecaoCategoria(interaction, client);
        }

        // Processar menu de seleção de canal
        if (interaction.isStringSelectMenu() && interaction.customId === 'selecionar_canal_ticket') {
            return await processarSelecaoCanal(interaction, client);
        }
    }
};

/**
 * Mostra o menu de seleção para configurar tickets dinamicamente
 */
async function mostrarMenuSelecaoTicket(interaction, client) {
    // Verificar permissões
    if (!perms.has(interaction.user.id)) {
        return interaction.reply({
            content: `${emoji.erro} Você não tem permissão para usar esta função!`,
            ephemeral: true
        }).catch(() => {});
    }

    try {
        // Deferir para não ter timeout
        if (!interaction.deferred && !interaction.replied) {
            await interaction.deferUpdate().catch(() => {});
        }

        // Buscar categorias disponíveis no servidor
        const guild = interaction.guild;
        const categorias = guild.channels.cache.filter(c => c.type === 4); // Type 4 = Category

        // Buscar canais de texto disponíveis
        const canais = guild.channels.cache.filter(c => c.type === 0); // Type 0 = Text

        // Criar opções para o menu de categorias
        const opcoesCategoria = categorias.map(categoria => 
            new StringSelectMenuOptionBuilder()
                .setLabel(`📁 ${categoria.name}`)
                .setDescription(`ID: ${categoria.id}`)
                .setValue(categoria.id)
        ).slice(0, 25); // Discord limita a 25 opções

        // Criar opções para o menu de canais
        const opcoesCanal = canais.map(canal => 
            new StringSelectMenuOptionBuilder()
                .setLabel(`# ${canal.name}`)
                .setDescription(`ID: ${canal.id}`)
                .setValue(canal.id)
        ).slice(0, 25);

        // Verificar configuração atual
        const categoriaAtual = General.get('tickets.categoria') || 'Não configurado';
        const canalAtual = General.get('tickets.canal_msg') || 'Não configurado';

        // Embed informativa
        const embed = new EmbedBuilder()
            .setTitle('⚙️ Configuração Dinâmica de Tickets')
            .setDescription('Selecione a **categoria** onde os tickets serão criados e o **canal** onde ficará a mensagem de abrir ticket.')
            .setColor(General.get('color.padrao') || '#5865F2')
            .addFields(
                { name: '📁 Categoria Atual', value: `${categoriaAtual}`, inline: true },
                { name: '# Canal Atual', value: `${canalAtual}`, inline: true }
            )
            .setFooter({ text: 'Selecione as opções abaixo para configurar' });

        // Linha 1 - Seleção de Categoria
        const row1 = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('selecionar_categoria_ticket')
                .setPlaceholder('📁 Selecione a Categoria dos Tickets...')
                .addOptions(opcoesCategoria.length > 0 ? opcoesCategoria : [
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Nenhuma categoria encontrada')
                        .setValue('none')
                        .setDescription('Crie uma categoria primeiro')
                ])
        );

        // Linha 2 - Seleção de Canal
        const row2 = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('selecionar_canal_ticket')
                .setPlaceholder('# Selecione o Canal da Mensagem...')
                .addOptions(opcoesCanal.length > 0 ? opcoesCanal : [
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Nenhum canal encontrado')
                        .setValue('none')
                        .setDescription('Crie um canal primeiro')
                ])
        );

        await interaction.editReply({ 
            embeds: [embed], 
            components: [row1, row2] 
        }).catch(() => {});

    } catch (error) {
        console.error('Erro ao mostrar menu de seleção de ticket:', error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: `${emoji.erro} Ocorreu um erro ao carregar o menu.`,
                ephemeral: true
            }).catch(() => {});
        }
    }
}

/**
 * Processa a seleção de categoria
 */
async function processarSelecaoCategoria(interaction, client) {
    try {
        const categoriaId = interaction.values[0];
        
        if (categoriaId === 'none') {
            return interaction.reply({
                content: `${emoji.erro} Selecione uma categoria válida!`,
                ephemeral: true
            });
        }

        // Salvar a categoria selecionada
        General.set('tickets.categoria', categoriaId);

        // Buscar nome da categoria
        const categoria = interaction.guild.channels.cache.get(categoriaId);
        const nomeCategoria = categoria ? categoria.name : 'Desconhecida';

        // Deferir a resposta antes de atualizar o menu
        if (!interaction.deferred && !interaction.replied) {
            await interaction.deferUpdate().catch(() => {});
        }

        await interaction.followUp({
            content: `✅ **Categoria configurada com sucesso!**\n📁 **Categoria:** ${nomeCategoria}\n🆔 **ID:** \`${categoriaId}\``,
            ephemeral: true
        });

        // Atualizar o menu para mostrar a nova configuração
        await mostrarMenuSelecaoTicket(interaction, client);

    } catch (error) {
        console.error('Erro ao processar seleção de categoria:', error);
        await interaction.reply({
            content: `${emoji.erro} Erro ao configurar categoria.`,
            ephemeral: true
        }).catch(() => {});
    }
}

/**
 * Processa a seleção de canal
 */
async function processarSelecaoCanal(interaction, client) {
    try {
        const canalId = interaction.values[0];
        
        if (canalId === 'none') {
            return interaction.reply({
                content: `${emoji.erro} Selecione um canal válido!`,
                ephemeral: true
            });
        }

        // Salvar o canal selecionado
        General.set('tickets.canal_msg', canalId);

        // Buscar nome do canal
        const canal = interaction.guild.channels.cache.get(canalId);
        const nomeCanal = canal ? canal.name : 'Desconhecido';

        // Deferir a resposta antes de atualizar o menu
        if (!interaction.deferred && !interaction.replied) {
            await interaction.deferUpdate().catch(() => {});
        }

        await interaction.followUp({
            content: `✅ **Canal configurado com sucesso!**\n# **Canal:** ${nomeCanal}\n🆔 **ID:** \`${canalId}\``,
            ephemeral: true
        });

        // Atualizar o menu para mostrar a nova configuração
        await mostrarMenuSelecaoTicket(interaction, client);

    } catch (error) {
        console.error('Erro ao processar seleção de canal:', error);
        await interaction.reply({
            content: `${emoji.erro} Erro ao configurar canal.`,
            ephemeral: true
        }).catch(() => {});
    }
}