const { perms, emoji } = require('../../DataBaseJson');
const painelFunctions = require('../../ComandosSlash/Administracao/painel.js');
const configTicket = require('../Sistema de Config/ConfigTicketDinamico.js');

module.exports = {
    name: 'interactionCreate',
    run: async (interaction, client) => {
        if (interaction.replied || interaction.deferred) return;
        if (!interaction.isButton() || !interaction.customId.startsWith('admin_')) return;

        const action = interaction.customId.replace('admin_', '');

        if (!perms.has(interaction.user.id)) {
            return interaction.reply({ content: 'Sem permissao', ephemeral: true });
        }

        try {
            if (action === 'voltar_painel') {
                await interaction.update({ content: 'Voltando...', components: [], embeds: [] });
            } else if (action === 'config_ticket') {
                await interaction.deferUpdate().catch(() => {});
                await painelFunctions.modalConfigTicket(interaction);
            } else if (action === 'config_mp') {
                await interaction.deferUpdate().catch(() => {});
                await painelFunctions.modalMercadoPago(interaction);
            } else if (action === 'atualizar_msg') {
                await interaction.deferUpdate().catch(() => {});
                await painelFunctions.modalAtualizarMensagens(interaction);
            } else {
                console.log('Acao desconhecida:', action);
            }
        } catch (error) {
            console.error('Erro:', error);
        }
    }
};
