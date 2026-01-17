const { perms, emoji } = require('../../DataBaseJson');

const painelFunctions = require('../../ComandosSlash/Administracao/painel.js');

module.exports = {
    name: 'interactionCreate',
    run: async (interaction, client) => {
        if (interaction.replied || interaction.deferred) {
            return;
        }

        // Processar menu de seleção de tipo de mensagem
        if (interaction.isStringSelectMenu() && interaction.customId === 'selecionar_tipo_mensagem') {
            return await processarSelecaoMensagem(interaction, client);
        }

        // Processar botão de cancelar atualização
        if (interaction.isButton() && interaction.customId.startsWith('cancelar_atualizacao_')) {
            return await processarCancelamento(interaction, client);
        }
    }
};

async function processarSelecaoMensagem(interaction, client) {
    try {
        const tipo = interaction.values[0];
        
        if (!perms.has(interaction.user.id)) {
            return interaction.reply({
                content: `${emoji.erro} Você não tem permissão para usar esta função!`,
                ephemeral: true
            }).catch(() => {});
        }

        await painelFunctions.enviarJSONParaAtualizacao(interaction, tipo, client);

    } catch (error) {
        console.error('Erro ao processar seleção de mensagem:', error);
        await interaction.reply({
            content: `${emoji.erro} Erro ao processar seleção.`,
            ephemeral: true
        }).catch(() => {});
    }
}

async function processarCancelamento(interaction, client) {
    try {
        const tipo = interaction.customId.replace('cancelar_atualizacao_', '');
        
        if (!perms.has(interaction.user.id)) {
            return interaction.reply({
                content: `${emoji.erro} Você não tem permissão para usar esta função!`,
                ephemeral: true
            }).catch(() => {});
        }

        await painelFunctions.voltarPainel(interaction, client);

    } catch (error) {
        console.error('Erro ao processar cancelamento:', error);
        await interaction.reply({
            content: `${emoji.erro} Erro ao cancelar.`,
            ephemeral: true
        }).catch(() => {});
    }
}