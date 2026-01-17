const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder,  } = require("discord.js")
const { perms, General, emoji, saldo, rank } = require("../../DataBaseJson")

module.exports = {
       data: new SlashCommandBuilder()
        .setName('perfil')
        .setDescription('Veja o seu perfil ou o perfil de algum usuário')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Mencione o usuário que você deseja ver o perfil.')
                .setRequired(false)
        ),

    run: async(client, interaction) => {
       const user = interaction.options.getUser('user') || interaction.user
       
       const allRank = rank.all() || [];
       const calculos = allRank.filter(i => i.data && i.data.gastosaprovados).sort((a, b) => b.data.gastosaprovados - a.data.gastosaprovados).findIndex(entry => entry.ID === user.id) + 1
       
       const embed = new EmbedBuilder()
        .setTitle(`Perfil do Usuário | ${user.username}`)
        .setDescription(`${emoji.get(`carrinho`) || '🛒'} | Produtos Comprados: \`${rank.get(`${user.id}.pedidosaprovados`) || "0"}\`\n${emoji.get(`cartao`) || '💳'} | Já gasto: \`R$ ${Number(rank.get(`${user.id}.gastosaprovados`) || 0).toFixed(2)}\`\n${emoji.get(`saco`) || '💰'} | Saldo: \`R$ ${Number(saldo.get(user.id) || 0).toFixed(2)}\`\n${emoji.get(`trofeu`) || '🏆'} | Rank: ${!rank.has(user.id) ? `${user.username} não está no rank!` : `${user.username} está na __${calculos}°__ posição do rank!`}`)
        .setColor(General.get(`color.padrao`) || '#000000')
        
       interaction.reply({ embeds: [embed] })
   }
}