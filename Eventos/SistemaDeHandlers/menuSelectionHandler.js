const { perms, General } = require('../../DataBaseJson');

module.exports = {
    name: 'interactionCreate',
    run: async (interaction, client) => {
        if (!interaction.isStringSelectMenu()) return;

        const customId = interaction.customId;

        const isOwner = interaction.user.id === interaction.guild.ownerId;
        const hasPerm = perms.get(interaction.user.id) || isOwner;

        if (!hasPerm) {
            return interaction.reply({ content: 'Sem permissao', ephemeral: true });
        }

        try {
            // Seleção do Painel Admin (Menu Principal e Submenus)
            if (customId === 'painel_admin_select' || customId === 'ticket_select_category' || customId === 'ticket_select_logs' || customId === 'update_msg_type_select') {
                const painelCmd = require('../../ComandosSlash/Administracao/painel.js');
                
                if (customId === 'ticket_select_category') {
                    if (!interaction.deferred && !interaction.replied) {
                        await interaction.deferUpdate().catch(() => {});
                    }
                    const categoryId = interaction.values[0];
                    General.set('ticket.categoria', categoryId);
                    return interaction.followUp({ content: `✅ Categoria de tickets configurada com sucesso!`, ephemeral: true });
                }

                if (customId === 'ticket_select_logs') {
                    if (!interaction.deferred && !interaction.replied) {
                        await interaction.deferUpdate().catch(() => {});
                    }
                    const logsId = interaction.values[0];
                    General.set('ticket.logs', logsId);
                    return interaction.followUp({ content: `✅ Canal de logs configurado com sucesso!`, ephemeral: true });
                }

                await painelCmd.handleSelection(interaction);
                return;
            }

            // Seleção de ticket
            if (customId === 'select_ticket_op') {
                const opcao = interaction.values[0];
                
                if (opcao === 'config_categoria') {
                    const configTicket = require('../Sistema de Config/ConfigTicketDinamico.js');
                    await configTicket.run(interaction, client);
                } else if (opcao === 'config_canal') {
                    await interaction.update({ content: 'Use o Ticket Dinamico para configurar!', components: [], embeds: [] });
                }
            }
            // Seleção de tipo de mensagem
            else if (customId === 'select_msg_type') {
                const tipo = interaction.values[0];
                
                if (tipo === 'abrir_ticket' || tipo === 'termos') {
                    await interaction.update({ content: 'Para atualizar, use: "atualizar ticket" ou "atualizar termos" no canal de monitoramento', components: [], embeds: [] });
                }
            }
        } catch (error) {
            // Silencia erros comuns de interação (10062: Unknown Interaction, 40060: Interaction already replied)
            if (error.code !== 10062 && error.code !== 40060) {
                console.error('Erro no seletor:', error);
            }
        }
    }
};