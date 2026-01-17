const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { General, emoji, perms } = require('../../DataBaseJson');
const { criarMenuPrincipal } = require('../../Eventos/SistemaDeHandlers/menuPrincipal');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('menu')
        .setDescription('Criar/Atualizar Menu Principal')
        .addSubcommand(subcommand =>
            subcommand
                .setName('criar')
                .setDescription('Criar o menu principal no canal atual')
                .addChannelOption(option =>
                    option.setName('canal')
                        .setDescription('Canal onde o menu será criado')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('atualizar')
                .setDescription('Atualizar o menu principal')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async run(client, interaction) {
        if (!perms.has(interaction.user.id)) {
            return interaction.reply({
                content: `${emoji.erro} Você não tem permissão para usar este comando!`,
                ephemeral: true
            });
        }

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'criar') {
            const canal = interaction.options.getChannel('canal');
            
            General.set('menu_principal.canal', canal.id);
            
            await interaction.reply({
                content: `${emoji.sucesso} Menu será criado no canal ${canal}...`,
                ephemeral: true
            });

            await criarMenuPrincipal(client);
            
            await interaction.editReply({
                content: `${emoji.sucesso} Menu criado com sucesso em ${canal}!`
            });

        } else if (subcommand === 'atualizar') {
            await interaction.reply({
                content: `${emoji.carregando} Atualizando menu...`,
                ephemeral: true
            });

            await criarMenuPrincipal(client);
            
            await interaction.editReply({
                content: `${emoji.sucesso} Menu atualizado com sucesso!`
            });
        }
    }
};