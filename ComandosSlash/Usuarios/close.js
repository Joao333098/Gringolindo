const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('close')
        .setDescription('Fecha o ticket atual')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),

    async run(client, interaction) {
        if (!perms.has(interaction.user.id)) {
            return interaction.reply({
                content: `${emoji.get('erro') || '❌'} Você não tem permissão para usar este comando!`,
                ephemeral: true
            });
        }
        // Verifica se o canal é um ticket (começa com 🎫-)
        if (!interaction.channel.name.startsWith('🎫-')) {
            return interaction.reply({
                content: '❌ Este comando só pode ser usado dentro de um ticket!',
                ephemeral: true
            });
        }

        await interaction.reply('🔒 Este ticket será fechado em 5 segundos...');

        setTimeout(() => {
            interaction.channel.delete().catch(() => {});
        }, 5000);
    }
};