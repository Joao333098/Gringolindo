const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('closeall')
        .setDescription('Fecha todos os tickets abertos no servidor')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async run(client, interaction) {
        if (!perms.has(interaction.user.id)) {
            return interaction.reply({
                content: `${emoji.get('erro') || '❌'} Você não tem permissão para usar este comando!`,
                ephemeral: true
            });
        }
        // Busca todos os canais que começam com 🎫-
        const channels = interaction.guild.channels.cache.filter(c => c.name.startsWith('🎫-'));

        if (channels.size === 0) {
            return interaction.reply({
                content: '❌ Não há nenhum ticket aberto no momento!',
                ephemeral: true
            });
        }

        await interaction.reply({
            content: `🔒 Fechando **${channels.size}** tickets...`,
            ephemeral: true
        });

        channels.forEach(channel => {
            channel.delete().catch(() => {});
        });
    }
};