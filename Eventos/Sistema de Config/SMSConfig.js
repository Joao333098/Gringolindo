const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder } = require("discord.js");
const { perms, General, emoji } = require("../../DataBaseJson");

module.exports = {
   name: "interactionCreate",
   run: async(interaction, client) => {
      // Verificar se a interação já foi respondida
      if (interaction.replied || interaction.deferred) {
         return;
      }
      
      if (interaction.isButton()) {
         
         // Configurar SMS
         if (interaction.customId.endsWith("_configsms")) {
            interaction.deferUpdate()
            if (interaction.user.id != interaction.customId.split("_")[0]) return
            
            const embed = new EmbedBuilder()
              .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
              .setDescription(`${emoji.get(`config`)} **| Painel de Configuração de SMS**\n\nNúmero SMS: ${General.get(`sms.numero`) || "Não configurado"}\n\n**Você pode configurar o SMS utilizando os botões abaixo:**`)
              .setColor(General.get(`color.padrao`))
              
            const row = new ActionRowBuilder()
              .addComponents(
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_altnumerosms`)
                  .setLabel('Alterar Número SMS')
                  .setEmoji(`1136607333204643931`)
                  .setStyle(1),
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_voltarbotconfig`)
                  .setLabel('Voltar')
                  .setEmoji('\u2b05\ufe0f')
                  .setStyle(2),
              )
              
            interaction.message.edit({ embeds: [embed], components: [row] })
         }
         
         // Alterar número SMS
         if (interaction.customId.endsWith("_altnumerosms")) {
            if (interaction.user.id != interaction.customId.split("_")[0]) return interaction.deferUpdate()
            
            const modal = new ModalBuilder()
            .setCustomId(`${interaction.user.id}_modalnumerossms`)
            .setTitle('Alterar Número SMS')
            
            const text = new TextInputBuilder()
            .setCustomId('novo')
            .setLabel('Novo Número SMS:')
            .setPlaceholder('Ex: 5511999999999')
            .setRequired(true)
            .setStyle(1)
            
            modal.addComponents(new ActionRowBuilder().addComponents(text))
            
            interaction.showModal(modal)
         }
         
         // Configurar Histórico
         if (interaction.customId.endsWith("_confighistorico")) {
            interaction.deferUpdate()
            if (interaction.user.id != interaction.customId.split("_")[0]) return
            
            const embed = new EmbedBuilder()
              .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
              .setDescription(`${emoji.get(`config`)} **| Painel de Configuração de Histórico**\n\nNúmero de Histórico: ${General.get(`historico.numero`) || "Não configurado"}\n\n**Você pode configurar o histórico utilizando os botões abaixo:**`)
              .setColor(General.get(`color.padrao`))
              
            const row = new ActionRowBuilder()
              .addComponents(
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_altnumerohistorico`)
                  .setLabel('Alterar Número de Histórico')
                  .setEmoji(`1136607333204643931`)
                  .setStyle(1),
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_voltarbotconfig`)
                  .setLabel('Voltar')
                  .setEmoji('\u2b05\ufe0f')
                  .setStyle(2),
              )
              
            interaction.message.edit({ embeds: [embed], components: [row] })
         }
         
         // Alterar número de histórico
         if (interaction.customId.endsWith("_altnumerohistorico")) {
            if (interaction.user.id != interaction.customId.split("_")[0]) return interaction.deferUpdate()
            
            const modal = new ModalBuilder()
            .setCustomId('modalnumerohistorico')
            .setTitle('Alterar Número de Histórico')
            
            const text = new TextInputBuilder()
            .setCustomId('novo')
            .setLabel('Novo Número de Histórico:')
            .setPlaceholder('Ex: 123456')
            .setRequired(true)
            .setStyle(1)
            
            modal.addComponents(new ActionRowBuilder().addComponents(text))
            
            interaction.showModal(modal)
         }
      }
      
      if (interaction.isModalSubmit()) {
         
         // Processar modal de número SMS
         if (interaction.customId.endsWith("_modalnumerossms")) {
            const novo = interaction.fields.getTextInputValue("novo")
            
            General.set(`sms.numero`, novo)
            
            const embed = new EmbedBuilder()
              .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
              .setDescription(`${emoji.get(`config`)} **| Painel de Configuração de SMS**\n\nNúmero SMS: ${General.get(`sms.numero`)}\n\n**Você pode configurar o SMS utilizando os botões abaixo:**`)
              .setColor(General.get(`color.padrao`))
              
            const row = new ActionRowBuilder()
              .addComponents(
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_altnumerosms`)
                  .setLabel('Alterar Número SMS')
                  .setEmoji(`1136607333204643931`)
                  .setStyle(1),
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_voltarbotconfig`)
                  .setLabel('Voltar')
                  .setEmoji('\u2b05\ufe0f')
                  .setStyle(2),
              )
            
            interaction.update({ embeds: [embed], components: [row] })
         }
         
         // Processar modal de número de histórico
         if (interaction.customId === 'modalnumerohistorico') {
            const novo = interaction.fields.getTextInputValue("novo")
            
            General.set(`historico.numero`, novo)
            
            const embed = new EmbedBuilder()
              .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
              .setDescription(`${emoji.get(`config`)} **| Painel de Configuração de Histórico**\n\nNúmero de Histórico: ${General.get(`historico.numero`)}\n\n**Você pode configurar o histórico utilizando os botões abaixo:**`)
              .setColor(General.get(`color.padrao`))
              
            const row = new ActionRowBuilder()
              .addComponents(
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_altnumerohistorico`)
                  .setLabel('Alterar Número de Histórico')
                  .setEmoji(`1136607333204643931`)
                  .setStyle(1),
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_voltarbotconfig`)
                  .setLabel('Voltar')
                  .setEmoji('\u2b05\ufe0f')
                  .setStyle(2),
              )
            
            interaction.update({ embeds: [embed], components: [row] })
         }
      }
   }
}