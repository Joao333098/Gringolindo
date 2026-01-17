const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, RoleSelectMenuBuilder } = require("discord.js")
const { perms, General, emoji, cupons } = require("../../DataBaseJson")

module.exports = {
   name: "interactionCreate",
   run: async(interaction, client) => {
       // Verificar se a interação já foi respondida
       if (interaction.replied || interaction.deferred) {
           return;
       }
       
       if (interaction.isButton()) {
          const ide = interaction.customId.split("_")[1]
          
          if (interaction.customId.endsWith("_altporcentagem")) {
             if (interaction.user.id != interaction.customId.split("_")[0]) return interaction.deferUpdate()
             
             const modal = new ModalBuilder()
             .setCustomId(`${ide}_modalporcentagem`)
             .setTitle('Alterar Porcentagem')
             
             const text = new TextInputBuilder()
             .setCustomId('novocupom')
             .setLabel('PORCENTAGEM:')
             .setPlaceholder('Exemplo: 10')
             .setRequired(true)
             .setStyle(1)
             
             modal.addComponents(new ActionRowBuilder().addComponents(text))
             
             interaction.showModal(modal)
          }
          
          if (interaction.customId.endsWith("_altvalormin")) {
             if (interaction.user.id != interaction.customId.split("_")[0]) return interaction.deferUpdate()
             
             const modal = new ModalBuilder()
             .setCustomId(`${ide}_modalvalormin`)
             .setTitle('Valor Mínimo')
             
             const text = new TextInputBuilder()
             .setCustomId('novocupom')
             .setLabel('VALOR:')
             .setPlaceholder('Exemplo: 5')
             .setRequired(true)
             .setStyle(1)
             
             modal.addComponents(new ActionRowBuilder().addComponents(text))
             
             interaction.showModal(modal)
          }
          
          if (interaction.customId.endsWith("_altquantiadecp")) {
             if (interaction.user.id != interaction.customId.split("_")[0]) return interaction.deferUpdate()
             
             const modal = new ModalBuilder()
             .setCustomId(`${ide}_modalquantidadecp`)
             .setTitle('Quantidade')
             
             const text = new TextInputBuilder()
             .setCustomId('novocupom')
             .setLabel('QUANTIDADE:')
             .setPlaceholder('Exemplo: 10')
             .setRequired(true)
             .setStyle(1)
             
             modal.addComponents(new ActionRowBuilder().addComponents(text))
             
             interaction.showModal(modal)
          }
          
          if (interaction.customId.endsWith("_cargocupom")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return 
             
             const embedcargo = new EmbedBuilder()
              .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
              .setDescription(`Cargo: ${interaction.guild.roles.cache.get(cupons.get(`${ide}.cargo`)) || "\`Todos podem utilizar cupom neste produto!\`"}`)
              .setColor(General.get(`color.padrao`))
              
             const row = new ActionRowBuilder()
              .addComponents(
                 new RoleSelectMenuBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_cargocupom`)
                   .setPlaceholder('Selecione o Cargo:')
                   .setMinValues(1)
                   .setMaxValues(1)
              )
             
             const rowvoltar = new ActionRowBuilder()
              .addComponents(
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_removecargocp`)
                   .setLabel('Remover Cargo')
                   .setEmoji(`1140438393373872148`)
                   .setStyle(4),
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_voltarcupom`)
                   .setLabel('Voltar')
                   .setEmoji('⬅️')
                   .setStyle(2)
              )
              
             interaction.message.edit({ embeds: [embedcargo], components: [row, rowvoltar] })
          }
          
          if (interaction.customId.endsWith("_delcupom")) {
             if (interaction.user.id != interaction.customId.split("_")[0]) return interaction.deferUpdate()
             
             const modal = new ModalBuilder()
             .setCustomId(`${ide}_modaldelcupom`)
             .setTitle('Confirmar')
             
             const text = new TextInputBuilder()
             .setCustomId('novocupom')
             .setLabel('Para continuar escreva "SIM":')
             .setPlaceholder('SIM')
             .setRequired(true)
             .setStyle(1)
             
             modal.addComponents(new ActionRowBuilder().addComponents(text))
             
             interaction.showModal(modal)
          }
          
          if (interaction.customId.endsWith("_removecargocp")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return 
             
             cupons.set(`${ide}.cargo`, 'todos')
             
             attembed()
          }
          
          if (interaction.customId.endsWith("_voltarcupom")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return 
             
             attembed()
          }
          
          
          function attembed() {
             const anna = cupons.get(ide)
             const embed = new EmbedBuilder()
              .setTitle(`${interaction.client.user.username} | Gerenciar Cupom`)
              .setDescription(`Cupom sendo gerenciado:\n\n${emoji.get(`lupa`)} **| Nome:** \`${ide}\`\n${emoji.get(`desc`)} **| Porcentagem:** \`${anna.porcentagem}\`\n${emoji.get(`preco`)} **| Valor mínimo:** \`R$${Number(anna.valormin).toFixed(2)}\`\n${emoji.get(`caixa`)} **| Quantidade:** \`${anna.quantidade}\`\n${emoji.get(`cadeado`)} **| Cargo:** ${interaction.guild.roles.cache.get(anna.cargo) || "\`Todos podem utilizar este cupom!\`"}`)
              .setColor(General.get(`color.padrao`))
              .setFooter({ text: `${interaction.client.user.username} - Todos os direitos reservados.`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
              
             const row = new ActionRowBuilder()
              .addComponents(
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_${ide}_altporcentagem`)
                  .setLabel('Porcentagem de Desconto')
                  .setEmoji(`1136604253062955008`)
                  .setStyle(3),
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_${ide}_altvalormin`)
                  .setLabel('Valor Mínimo')
                  .setEmoji(`1161241239182651413`)
                  .setStyle(3),
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_${ide}_altquantiadecp`)
                  .setLabel('Quantidade')
                  .setEmoji(`1184105676545474631`)
                  .setStyle(3),
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_${ide}_cargocupom`)
                  .setLabel('Cargo')
                  .setEmoji(`1157337774622519296`)
                  .setStyle(3),
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_${ide}_delcupom`)
                  .setLabel('DELETAR')
                  .setEmoji(`1140438393373872148`)
                  .setStyle(4),
                )
                
               interaction.message.edit({ embeds: [embed], components: [row] })
          }
       }
       
       
       if (interaction.isModalSubmit()) {
          const ide = interaction.customId.split("_")[0]
          
          if (interaction.customId.endsWith("_modalporcentagem")) {
             const novo = interaction.fields.getTextInputValue("novocupom")
             
             if (isNaN(novo) == true) return interaction.reply({ content: `${emoji.get(`emojix`)} | Error: Número inválido!`, ephemeral: true })
             
             cupons.set(`${ide}.porcentagem`, novo)
             interaction.reply({ content: `${emoji.get(`certo`)} | Porcentagem de desconto alterado!`, ephemeral: true })
             embedatt()
          }
          
          if (interaction.customId.endsWith("_modalvalormin")) {
             const novo = interaction.fields.getTextInputValue("novocupom")
             
             if (isNaN(novo) == true) return interaction.reply({ content: `${emoji.get(`emojix`)} | Error: Número inválido!`, ephemeral: true })
             
             cupons.set(`${ide}.valormin`, novo)
             interaction.reply({ content: `${emoji.get(`certo`)} | Valor mínimo alterado!`, ephemeral: true })
             embedatt()
          }
          
          if (interaction.customId.endsWith("_modalquantidadecp")) {
             const novo = interaction.fields.getTextInputValue("novocupom")
             
             if (isNaN(novo) == true) return interaction.reply({ content: `${emoji.get(`emojix`)} | Error: Número inválido!`, ephemeral: true })
             
             cupons.set(`${ide}.quantidade`, novo)
             interaction.reply({ content: `${emoji.get(`certo`)} | Quantidade alterada!`, ephemeral: true })
             embedatt()
          }
          
          if (interaction.customId.endsWith("_modaldelcupom")) {
             const novo = interaction.fields.getTextInputValue("novocupom")
             
             switch (novo) {
               case 'SIM':
                 cupons.delete(ide) 
                 interaction.update({ content: `${emoji.get(`certo`)} | Cupom \`${ide}\` deletado com sucesso!`, embeds: [], components: [] })
                 break;
                default: 
                 return interaction.reply({ content: `${emoji.get(`certo`)} | Cancelado!`, ephemeral: true })
             }
          }
          
          function embedatt() {
             const anna = cupons.get(ide)
             const embed = new EmbedBuilder()
              .setTitle(`${client.user.username} | Gerenciar Cupom`)
              .setDescription(`Cupom sendo gerenciado:\n\n${emoji.get(`lupa`)} **| Nome:** \`${ide}\`\n${emoji.get(`desc`)} **| Porcentagem:** \`${anna.porcentagem}\`\n${emoji.get(`preco`)} **| Valor mínimo:** \`R$${Number(anna.valormin).toFixed(2)}\`\n${emoji.get(`caixa`)} **| Quantidade:** \`${anna.quantidade}\`\n${emoji.get(`cadeado`)} **| Cargo:** ${interaction.guild.roles.cache.get(anna.cargo) || "\`Todos podem utilizar este cupom!\`"}`)
              .setColor(General.get(`color.padrao`))
              .setFooter({ text: `${client.user.username} - Todos os direitos reservados.`, iconURL: client.user.displayAvatarURL({ dynamic: true })})
              
             interaction.message.edit({ embeds: [embed] })
          }
       }
       
       if (interaction.isRoleSelectMenu()) {
          const ide = interaction.customId.split("_")[1]
          
          if (interaction.customId.endsWith("_cargocupom")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return 
             
             cupons.set(`${ide}.cargo`, interaction.values[0])
             
             attembed()
          }
          
          function attembed() {
             const anna = cupons.get(interaction.customId.split("_")[1])
             const embed = new EmbedBuilder()
              .setTitle(`${interaction.client.user.username} | Gerenciar Cupom`)
              .setDescription(`Cupom sendo gerenciado:\n\n${emoji.get(`lupa`)} **| Nome:** \`${ide}\`\n${emoji.get(`desc`)} **| Porcentagem:** \`${anna.porcentagem}\`\n${emoji.get(`preco`)} **| Valor mínimo:** \`R$${Number(anna.valormin).toFixed(2)}\`\n${emoji.get(`caixa`)} **| Quantidade:** \`${anna.quantidade}\`\n${emoji.get(`cadeado`)} **| Cargo:** ${interaction.guild.roles.cache.get(anna.cargo) || "\`Todos podem utilizar este cupom!\`"}`)
              .setColor(General.get(`color.padrao`))
              .setFooter({ text: `${interaction.client.user.username} - Todos os direitos reservados.`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
              
             const row = new ActionRowBuilder()
              .addComponents(
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_${ide}_altporcentagem`)
                  .setLabel('Porcentagem de Desconto')
                  .setEmoji(`1136604253062955008`)
                  .setStyle(3),
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_${ide}_altvalormin`)
                  .setLabel('Valor Mínimo')
                  .setEmoji(`1161241239182651413`)
                  .setStyle(3),
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_${ide}_altquantiadecp`)
                  .setLabel('Quantidade')
                  .setEmoji(`1184105676545474631`)
                  .setStyle(3),
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_${ide}_cargocupom`)
                  .setLabel('Cargo')
                  .setEmoji(`1157337774622519296`)
                  .setStyle(3),
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_${ide}_delcupom`)
                  .setLabel('DELETAR')
                  .setEmoji(`1140438393373872148`)
                  .setStyle(4),
                )
                
               interaction.message.edit({ embeds: [embed], components: [row] })
          }
       }
   }
}