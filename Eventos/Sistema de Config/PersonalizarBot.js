const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder } = require("discord.js")
const { perms, General, emoji, produto, tema } = require("../../DataBaseJson")
let collector = ''

module.exports = {
  name: "interactionCreate",
  run: async(interaction, client) => {
    // Verificar se a interação já foi respondida
    if (interaction.replied || interaction.deferred) {
        return;
    }
    
      if (interaction.isButton()) {
        
         if (interaction.customId.endsWith("_personalizarembed")) {
            interaction.deferUpdate()
            if (interaction.user.id != interaction.customId.split("_")[0]) return
            
            const embedn = new EmbedBuilder()
             .setTitle(`${interaction.client.user.username} | Personalizar Mensagem de Compra`)
             .setDescription(`**Titulo atual:** \`${tema.get(`embed.titulo`)}\`\n\n**Descrição Atual:**\n${tema.get(`embed.desc`)}\n\n**Rodapé Atual:** \`${tema.get(`embed.rodape`) == "null" ? `Sem rodapé` : tema.get(`embed.rodape`)}\``)
             .setColor(General.get(`color.padrao`))
             .setFooter({ text: `Escolha oque você deseja mudar:`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
             
            const rown = new ActionRowBuilder()
             .addComponents(
                new ButtonBuilder()
                 .setCustomId(`${interaction.user.id}_tituloembed`)
                 .setLabel('Título da embed')
                 .setEmoji(`1136607333204643931`)
                 .setStyle(1),
                new ButtonBuilder()
                 .setCustomId(`${interaction.user.id}_descembed`)
                 .setLabel('Descrição da embed')
                 .setEmoji(`1136607333204643931`)
                 .setStyle(1),
                new ButtonBuilder()
                 .setCustomId(`${interaction.user.id}_rodapeembed`)
                 .setLabel('Rodapé da embed')
                 .setEmoji(`1136607333204643931`)
                 .setStyle(1),
                new ButtonBuilder()
                 .setCustomId(`${interaction.user.id}_botaoembed`)
                 .setLabel('Botão da embed')
                 .setEmoji(`1136607333204643931`)
                 .setStyle(1),
                new ButtonBuilder()
                 .setCustomId(`${interaction.user.id}_resetembed`)
                 .setLabel('Resetar embed')
                 .setEmoji(`1136607333204643931`)
                 .setStyle(4),
             )
             
            const rown2 = new ActionRowBuilder()
             .addComponents(
                new ButtonBuilder()
                 .setCustomId(`${interaction.user.id}_atttodasmsg`)
                 .setLabel('Atualizar Todas Mensagens de Compra')
                 .setEmoji(`1148666021041950790`)
                 .setStyle(1),
                new ButtonBuilder()
                 .setCustomId(`${interaction.user.id}_voltarpersonalizar`)
                 .setLabel('Voltar')
                 .setEmoji(`⬅️`)
                 .setStyle(2),
             )
             
            interaction.message.edit({ embeds: [embedn], components: [rown, rown2] })
         }
         
         if (interaction.customId.endsWith("_personalizaremojis")) {
            interaction.deferUpdate()
            if (interaction.user.id != interaction.customId.split("_")[0]) return
            
            const todosEmojis = emoji.all().map((hxwx, index) => {
               return `• ${index} - ${hxwx.data}`
            }).join('\n')
            
            const embedn = new EmbedBuilder()
             .setTitle(`${interaction.client.user.username} | Gerenciar Emojis`)
             .setDescription(`Este são os emojis atuais:\n${todosEmojis}`)
             .setColor(General.get(`color.padrao`))
             .setFooter({ text: `Para alterar um emoji você deverá enviar o número do emoji, após clicar no botão abaixo!`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
             
            const rown = new ActionRowBuilder()
             .addComponents(
                new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_editaremoji`)
                  .setLabel('Alterar Emoji')
                  .setEmoji(`1136607333204643931`)
                  .setStyle(1),
                new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_voltarpersonalizar`)
                  .setLabel('Voltar')
                  .setEmoji(`⬅️`)
                  .setStyle(2),
             )
             
            interaction.message.edit({ embeds: [embedn], components: [rown] })
         }
         
         if (interaction.customId.endsWith("_editaremoji")) {
            if (interaction.user.id != interaction.customId.split("_")[0]) return interaction.deferUpdate()
            
            const modal = new ModalBuilder()
            .setCustomId('modaleditemoji')
            .setTitle('✏️ | Alterar Emoji')
            
            const text = new TextInputBuilder()
            .setCustomId('numeroemoji')
            .setLabel('Número do Emoji:')
            .setPlaceholder('Ex: 1')
            .setRequired(true)
            .setMaxLength(2)
            .setStyle(1)
            
            modal.addComponents(new ActionRowBuilder().addComponents(text))
            
            interaction.showModal(modal)
         }
         
         if (interaction.customId.endsWith("_tituloembed")) {
            interaction.deferUpdate()
            if (interaction.user.id != interaction.customId.split("_")[0]) return
            
            const embednew = new EmbedBuilder()
             .setTitle(`${interaction.client.user.username} | Personalizar Mensagem de Compra`)
             .setDescription(`Envie o novo título da embed de compra, caso queira use as variáveis:\n\`• #{nome}\n• #{preco}\n• #{estoque}\``)
             .setColor(General.get(`color.padrao`))
            
            const rowcancelar = new ActionRowBuilder()
             .addComponents(
                new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_cancelarcoletor`)
                  .setLabel('Cancelar')
                  .setEmoji(`1136612240217346092`)
                  .setStyle(4)
             )
            
            interaction.message.edit({ embeds: [embednew], components: [rowcancelar] })
            
            const collectorFilter = response => {
               return response.author.id === interaction.user.id;
             };
             collector = await interaction.channel.createMessageCollector({ filter: collectorFilter, max: 1, time: 120000 });
             collector.on('collect', async (message) => {
                tema.set(`embed.titulo`, message.content)
                message.delete()
                embedperso()
             })
         }
         
         if (interaction.customId.endsWith("_descembed")) {
            interaction.deferUpdate()
            if (interaction.user.id != interaction.customId.split("_")[0]) return
            
            const embednew = new EmbedBuilder()
             .setTitle(`${interaction.client.user.username} | Personalizar Mensagem de Compra`)
             .setDescription(`Envie a nova descrição da embed de compra, caso queira use as variáveis:\n\`• #{desc}\n• #{nome}\n• #{preco}\n• #{estoque}\`\n\n**Exemplo:**`)
             .setColor(General.get(`color.padrao`))
             .setImage('https://media.discordapp.net/attachments/1023331568644800532/1066084266661904574/image.png?ex=658f24d8&is=657cafd8&hm=471b06af722d46c06190f91c55f89f24ffdbe9698d58bc977c6587bad416ff6d&')
            
            const rowcancelar = new ActionRowBuilder()
             .addComponents(
                new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_cancelarcoletor`)
                  .setLabel('Cancelar')
                  .setEmoji(`1136612240217346092`)
                  .setStyle(4)
             )
            
            interaction.message.edit({ embeds: [embednew], components: [rowcancelar] })
            
            const collectorFilter = response => {
               return response.author.id === interaction.user.id;
             };
             collector = await interaction.channel.createMessageCollector({ filter: collectorFilter, max: 1, time: 120000 });
             collector.on('collect', async (message) => {
                tema.set(`embed.desc`, message.content)
                message.delete()
                embedperso()
             })
         }
         
         if (interaction.customId.endsWith("_rodapeembed")) {
            interaction.deferUpdate()
            if (interaction.user.id != interaction.customId.split("_")[0]) return
            
            const embednew = new EmbedBuilder()
             .setTitle(`${interaction.client.user.username} | Personalizar Mensagem de Compra`)
             .setDescription(`Envie o novo rodapé abaixo: **Obs: caso queira remover envie: "remover"**`)
             .setColor(General.get(`color.padrao`))
            
            const rowcancelar = new ActionRowBuilder()
             .addComponents(
                new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_cancelarcoletor`)
                  .setLabel('Cancelar')
                  .setEmoji(`1136612240217346092`)
                  .setStyle(4)
             )
            
            interaction.message.edit({ embeds: [embednew], components: [rowcancelar] })
            
            const collectorFilter = response => {
               return response.author.id === interaction.user.id;
             };
             collector = await interaction.channel.createMessageCollector({ filter: collectorFilter, max: 1, time: 120000 });
             collector.on('collect', async (message) => {
                message.delete()
                
                if (message.content == 'remover') {
                  tema.set(`embed.rodape`, "null")
                } else {
                  tema.set(`embed.rodape`, message.content)
                }
                
                embedperso()
             })
         }
         
         if (interaction.customId.endsWith("_botaoembed")) {
            interaction.deferUpdate()
            if (interaction.user.id != interaction.customId.split("_")[0]) return
            
            let corbotao = tema.get(`botao.style`)
            switch (corbotao) {
              case '1':
                corbotao = 'Azul'
                break;
              case '2':
                corbotao = 'Cinza'
                break;
              case '3': 
                corbotao = 'Verde'
                break;
              case '4':
                corbotao = 'Vermelho'
                break;
            }
            
            const embednew = new EmbedBuilder()
             .setTitle(`${interaction.client.user.username} | Personalizar Mensagem de Compra`)
             .setDescription(`Texto do botão: \`${tema.get(`botao.label`)}\`\n\nCor do Botão: \`${corbotao}\`\n\nEmoji do botão: ${tema.get(`botao.emoji`)}`)
             .setColor(General.get(`color.padrao`))
             .setFooter({ text: `Escolha oque deseja mudar:`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
             
            const rownew = new ActionRowBuilder()
             .addComponents(
                new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_textbotao`)
                  .setLabel('Texto do Botão')
                  .setEmoji(`1136607333204643931`)
                  .setStyle(1),
                new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_corbotao`)
                  .setLabel('Cor do Botão')
                  .setEmoji(`1136607333204643931`)
                  .setStyle(1),
                new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_emojibotao`)
                  .setLabel('Emoji do Botão')
                  .setEmoji(`1136607333204643931`)
                  .setStyle(1),
                new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_personalizarembed`)
                  .setLabel('Voltar')
                  .setEmoji(`⬅️`)
                  .setStyle(2),
             )
             
            interaction.message.edit({ embeds: [embednew], components: [rownew] })
         }
         
         if (interaction.customId.endsWith("_resetembed")) {
            if (interaction.user.id != interaction.customId.split("_")[0]) return interaction.deferUpdate()
            
            const modal = new ModalBuilder()
            .setCustomId('modalresetembed')
            .setTitle('Confirmar')
            
            const text = new TextInputBuilder()
            .setCustomId('novo')
            .setLabel('Para continuar escreva "SIM"')
            .setPlaceholder('SIM')
            .setRequired(true)
            .setStyle(1)
            
            modal.addComponents(new ActionRowBuilder().addComponents(text))
            
            interaction.showModal(modal)
         }
         
         if (interaction.customId.endsWith("_atttodasmsg")) {
            if (interaction.user.id != interaction.customId.split("_")[0]) return interaction.deferUpdate()
            
            const msg = await interaction.reply({ content: `${emoji.get(`carregando`)} | Atualizando Mensagens...`, ephemeral: true })
            
            const filtrados = produto.all().filter(x => x.data.idcanal && x.data.idmsg).forEach(x => {
               const canal = interaction.guild.channels.cache.get(x.data.idcanal)
               
               canal.messages.fetch(x.data.idmsg)
               .then(message => {
                 const u = produto.get(x.ID)
                 let desc = tema.get('embed.desc') 
                 desc = desc.replace('#{desc}', `${u.desc}`)
                 desc = desc.replace('#{nome}', `${u.nome}`)
                 desc = desc.replace('#{preco}', `${Number(u.preco).toFixed(2)}`)
                 desc = desc.replace('#{estoque}', `${u.estoque.length}`)
                 let titulo = tema.get('embed.titulo') 
                 titulo = titulo.replace('#{desc}', `${u.desc}`)
                 titulo = titulo.replace('#{nome}', `${u.nome}`)
                 titulo = titulo.replace('#{preco}', `${Number(u.preco).toFixed(2)}`)
                 titulo = titulo.replace('#{estoque}', `${u.estoque.length}`)
                 
                const embed = new EmbedBuilder()
                .setTitle(titulo)
                .setDescription(desc)
                .setColor(u.cor)
                
               if (u.banner != null) embed.setImage(u.banner)
               if (u.thumb != null) embed.setThumbnail(u.thumb)
               if (tema.get(`embed.rodape`) != "null") embed.setFooter({ text: `${tema.get(`embed.rodape`)}` })
               
               const row = new ActionRowBuilder()
                .addComponents(
                   new ButtonBuilder()
                    .setCustomId(`${x.ID}_comprar`)
                    .setLabel(tema.get(`botao.label`))
                    .setEmoji(tema.get(`botao.emoji`))
                    .setStyle(tema.get(`botao.style`))
                 )
                 
                message.edit({ embeds: [embed], components: [row] })
               })
               .catch(err => {
                 if (err.code == 10008) {
                   return;
                 }
               })
            })
            
            msg.edit(`${emoji.get(`certo`)} | Mensagens Atualizadas!`)
         }
         
         if (interaction.customId.endsWith("_textbotao")) {
            if (interaction.user.id != interaction.customId.split("_")[0]) return interaction.deferUpdate()
            
            const modal = new ModalBuilder()
            .setCustomId('modaltextbotao')
            .setTitle('Alterar Texto do Botão')
            
            const text = new TextInputBuilder()
            .setCustomId('novo')
            .setLabel('Novo Texto do Botão')
            .setPlaceholder('Ex: Comprar')
            .setRequired(true)
            .setStyle(1)
            
            modal.addComponents(new ActionRowBuilder().addComponents(text))
            
            interaction.showModal(modal)
         }
         
         if (interaction.customId.endsWith("_corbotao")) {
            interaction.deferUpdate()
            if (interaction.user.id != interaction.customId.split("_")[0]) return
            
            const embednew = new EmbedBuilder()
             .setDescription(`${emoji.get(`seta`)} | Envie a nova cor do botão, utilizando uma das variáveis:\`\n• Azul\n• Cinza\n• Verde\n• Vermelho\``)
             .setColor(General.get(`color.padrao`))
             
            const rowcancelar = new ActionRowBuilder()
             .addComponents(
                new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_cancelarcoletor`)
                  .setLabel('Cancelar')
                  .setEmoji(`1136612240217346092`)
                  .setStyle(4)
             )
            
            interaction.message.edit({ embeds: [embednew], components: [rowcancelar] })
            
            const collectorFilter = response => {
               return response.author.id === interaction.user.id;
             };
             collector = await interaction.channel.createMessageCollector({ filter: collectorFilter, max: 1, time: 120000 });
             collector.on('collect', async (message) => {
                message.delete()
                
                switch (message.content) {
                  case 'Azul':
                    tema.set(`botao.style`, `1`)
                    break;
                  case 'Cinza':
                    tema.set(`botao.style`, `2`)
                    break;
                  case 'Verde':
                    tema.set(`botao.style`, `3`)
                    break;
                  case 'Vermelho':
                    tema.set(`botao.style`, `4`)
                    break;
                  default: 
                    interaction.channel.send(`${emoji.get(`emojix`)} | Cor inválida!`).then(msgg => { setTimeout(() => { msgg.delete() }, 4000)})
                }
                
                embedbotao()
             })
         }
         
         if (interaction.customId.endsWith("_emojibotao")) {
            interaction.deferUpdate()
            if (interaction.user.id != interaction.customId.split("_")[0]) return
            
           const embednew = new EmbedBuilder()
            .setDescription(`${emoji.get(`seta`)} | Envie o Emoji abaixo:\n**O emoji tem que estar em um server que o bot também está!**`)
            .setColor(General.get(`color.padrao`))
           
           const rowcancelar = new ActionRowBuilder()
             .addComponents(
                new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_cancelarcoletor`)
                  .setLabel('Cancelar')
                  .setEmoji(`1136612240217346092`)
                  .setStyle(4)
             )
            
            interaction.message.edit({ embeds: [embednew], components: [rowcancelar] })
            
            const collectorFilter = response => {
               return response.author.id === interaction.user.id;
             };
             collector = await interaction.channel.createMessageCollector({ filter: collectorFilter, max: 1, time: 120000 });
             collector.on('collect', async (message) => {
                message.delete()
                const emojiRegex = /<a?:(.+):(\d+)>/;
                const match = message.content.match(emojiRegex)
                
                if (!match) {
                  interaction.channel.send(`${emoji.get(`emojix`)} | Emoji inválido!`).then(msgaa => { setTimeout(() => { msgaa.delete() }, 4000)})
                  embedbotao()
                  return;
                }
                
                tema.set(`botao.emoji`, message.content)
                interaction.channel.send(`${emoji.get(`certo`)} | Emoji do botão alterado com sucesso!`).then(msgaa => { setTimeout(() => { msgaa.delete() }, 4000)})
                embedbotao()
             })
         }
         
         if (interaction.customId.endsWith("_cancelarcoletor")) {
            interaction.deferUpdate()
            if (interaction.user.id != interaction.customId.split("_")[0]) return
            
            if (collector) collector.stop()
            embedperso()
         }
         
         if (interaction.customId.endsWith("_voltarpersonalizar")) {
            interaction.deferUpdate()
            if (interaction.user.id != interaction.customId.split("_")[0]) return
            
            attembed()
         }
         
         
         function attembed() {
           const embed = new EmbedBuilder()
            .setTitle(`${interaction.client.user.username} | Personalizar`)
            .setDescription(`Clique no que você deseja personalizar:`)
            .setColor(General.get(`color.padrao`))
            .setFooter({ text: `${interaction.client.user.username} - Todos os direitos reservados.`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
            
           const row = new ActionRowBuilder()
            .addComponents(
               new ButtonBuilder()
                 .setCustomId(`${interaction.user.id}_personalizarembed`)
                 .setLabel('Mensagem de Compra')
                 .setEmoji(`1136607333204643931`)
                 .setStyle(1),
               new ButtonBuilder()
                 .setCustomId(`${interaction.user.id}_personalizaremojis`)
                 .setLabel('Alterar Emojis Padrões')
                 .setEmoji(`1136607333204643931`)
                 .setStyle(1),
             )
             
            interaction.message.edit({ embeds: [embed], components: [row] })
         }
         
         function embedperso() {
            const embedn = new EmbedBuilder()
             .setTitle(`${interaction.client.user.username} | Personalizar Mensagem de Compra`)
             .setDescription(`**Titulo atual:** \`${tema.get(`embed.titulo`)}\`\n\n**Descrição Atual:**\n${tema.get(`embed.desc`)}\n\n**Rodapé Atual:** \`${tema.get(`embed.rodape`) == "null" ? `Sem rodapé` : tema.get(`embed.rodape`)}\``)
             .setColor(General.get(`color.padrao`))
             .setFooter({ text: `Escolha oque você deseja mudar:`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
             
            const rown = new ActionRowBuilder()
             .addComponents(
                new ButtonBuilder()
                 .setCustomId(`${interaction.user.id}_tituloembed`)
                 .setLabel('Título da embed')
                 .setEmoji(`1136607333204643931`)
                 .setStyle(1),
                new ButtonBuilder()
                 .setCustomId(`${interaction.user.id}_descembed`)
                 .setLabel('Descrição da embed')
                 .setEmoji(`1136607333204643931`)
                 .setStyle(1),
                new ButtonBuilder()
                 .setCustomId(`${interaction.user.id}_rodapeembed`)
                 .setLabel('Rodapé da embed')
                 .setEmoji(`1136607333204643931`)
                 .setStyle(1),
                new ButtonBuilder()
                 .setCustomId(`${interaction.user.id}_botaoembed`)
                 .setLabel('Botão da embed')
                 .setEmoji(`1136607333204643931`)
                 .setStyle(1),
                new ButtonBuilder()
                 .setCustomId(`${interaction.user.id}_resetembed`)
                 .setLabel('Resetar embed')
                 .setEmoji(`1136607333204643931`)
                 .setStyle(4),
             )
             
            const rown2 = new ActionRowBuilder()
             .addComponents(
                new ButtonBuilder()
                 .setCustomId(`${interaction.user.id}_atttodasmsg`)
                 .setLabel('Atualizar Todas Mensagens de Compra')
                 .setEmoji(`1148666021041950790`)
                 .setStyle(1),
                new ButtonBuilder()
                 .setCustomId(`${interaction.user.id}_voltarpersonalizar`)
                 .setLabel('Voltar')
                 .setEmoji(`⬅️`)
                 .setStyle(2),
             )
             
            interaction.message.edit({ embeds: [embedn], components: [rown, rown2] })
         }
         
         function embedemoji() {
            const todosEmojis = emoji.all().map((hxwx, index) => {
               return `• ${index} - ${hxwx.data}`
            }).join('\n')
            
            const embedn = new EmbedBuilder()
             .setTitle(`${interaction.client.user.username} | Gerenciar Emojis`)
             .setDescription(`Este são os emojis atuais:\n${todosEmojis}`)
             .setColor(General.get(`color.padrao`))
             .setFooter({ text: `Para alterar um emoji você deverá enviar o número do emoji, após clicar no botão abaixo!`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
             
            const rown = new ActionRowBuilder()
             .addComponents(
                new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_editaremoji`)
                  .setLabel('Alterar Emoji')
                  .setEmoji(`1136607333204643931`)
                  .setStyle(1),
                new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_voltarpersonalizar`)
                  .setLabel('Voltar')
                  .setEmoji(`⬅️`)
                  .setStyle(2),
             )
             
            interaction.message.edit({ embeds: [embedn], components: [rown] })
         }
         
         function embedbotao() {
            let corbotao = tema.get(`botao.style`)
            switch (corbotao) {
              case '1':
                corbotao = 'Azul'
                break;
              case '2':
                corbotao = 'Cinza'
                break;
              case '3': 
                corbotao = 'Verde'
                break;
              case '4':
                corbotao = 'Vermelho'
                break;
            }
            
            const embednew = new EmbedBuilder()
             .setTitle(`${interaction.client.user.username} | Personalizar Mensagem de Compra`)
             .setDescription(`Texto do botão: \`${tema.get(`botao.label`)}\`\n\nCor do Botão: \`${corbotao}\`\n\nEmoji do botão: ${tema.get(`botao.emoji`)}`)
             .setColor(General.get(`color.padrao`))
             .setFooter({ text: `Escolha oque deseja mudar:`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
             
            const rownew = new ActionRowBuilder()
             .addComponents(
                new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_textbotao`)
                  .setLabel('Texto do Botão')
                  .setEmoji(`1136607333204643931`)
                  .setStyle(1),
                new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_corbotao`)
                  .setLabel('Cor do Botão')
                  .setEmoji(`1136607333204643931`)
                  .setStyle(1),
                new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_emojibotao`)
                  .setLabel('Emoji do Botão')
                  .setEmoji(`1136607333204643931`)
                  .setStyle(1),
                new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_personalizarembed`)
                  .setLabel('Voltar')
                  .setEmoji(`⬅️`)
                  .setStyle(2),
             )
             
            interaction.message.edit({ embeds: [embednew], components: [rownew] })
         }
      }
      
      if (interaction.isModalSubmit()) {
         
         if (interaction.customId == 'modaleditemoji') {
            const numero = interaction.fields.getTextInputValue("numeroemoji")
            
            if (isNaN(numero) == true || Number(numero) >= emoji.all().length) return interaction.reply({ content: `${emoji.get(`emojix`)} | Número do Emoji inválido!`, ephemeral: true })
            
            interaction.update({
               embeds: [new EmbedBuilder()
                  .setTitle(`Alterar Emoji • ${numero} - ${emoji.all()[numero].data}`)
                  .setDescription(`${emoji.get(`seta`)} | Envie o novo Emoji abaixo:\n**O emoji tem que estar em um server que o bot também está!**`)
                  .setColor(General.get(`color.padrao`))
                ],
               components: []
            })
            
            const collectorFilter = response => {
             return response.author.id == interaction.user.id;
            };
            interaction.channel.awaitMessages({ filter: collectorFilter, max: 1, time: 300000, errors: ['time'] })
            .then(async colleted => {
              const receivedMessage = colleted.first();
              receivedMessage.delete()
              
              const emojiRegex = new RegExp('<a?:(.*?):(\\d+)>|<:[a-zA-Z0-9_]+:(\\d+)>|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]', 'g')
              const match = receivedMessage.content.match(emojiRegex)
              
              if (!match) {
                 interaction.channel.send({ content: `${emoji.get(`emojix`)} | Emoji inválido!`, embeds: [] }).then(msga => { setTimeout(() => { msga.delete() }, 4000)})
                 embedemoji()
                 return
              }
              
              const emojiSelecionado = emoji.all()[numero].ID;
              
              emoji.set(`${emojiSelecionado}`, receivedMessage.content)
              interaction.channel.send({ content: `${emoji.get(`certo`)} | Emoji atualizado com sucesso!`, embeds: [] }).then(msga => { setTimeout(() => { msga.delete() }, 4000)})
              embedemoji()
            })
         }
         
         if (interaction.customId.endsWith("modaltextbotao")) {
            const novo = interaction.fields.getTextInputValue("novo")
            
            let corbotao = tema.get(`botao.style`)
            switch (corbotao) {
              case '1':
                corbotao = 'Azul'
                break;
              case '2':
                corbotao = 'Cinza'
                break;
              case '3': 
                corbotao = 'Verde'
                break;
              case '4':
                corbotao = 'Vermelho'
                break;
            }
            
            tema.set(`botao.label`, novo)
            interaction.update({
               embeds: [new EmbedBuilder()
                  .setTitle(`${interaction.client.user.username} | Personalizar Mensagem de Compra`)
                  .setDescription(`Texto do botão: \`${tema.get(`botao.label`)}\`\n\nCor do Botão: \`${corbotao}\`\n\nEmoji do botão: ${tema.get(`botao.emoji`)}`)
                  .setColor(General.get(`color.padrao`))
                  .setFooter({ text: `Escolha oque deseja mudar:`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
                ]
            })
         }
         
         if (interaction.customId.endsWith("modalresetembed")) {
            const novo = interaction.fields.getTextInputValue("novo")
            
            if (novo != 'SIM') return interaction.reply({ content: `${emoji.get(`lupa`)} | Ação ancelada!`, ephemeral: true })
            
            tema.set(`embed.titulo`, "#{nome} | Produto")
            tema.set(`embed.desc`, "\`\`\`#{desc}\`\`\`\n🪐 **| Nome: #{nome}**\n💸 **| Preço: __R$#{preco}__**\n📦 **| Estoque: __#{estoque}__**")
            tema.set(`embed.rodape`, "null")
            interaction.reply({ content: `${emoji.get(`certo`)} | Embed resetada com sucesso!`, ephemeral: true })
            interaction.message.edit({
              embeds: [new EmbedBuilder()
                 .setTitle(`${interaction.client.user.username} | Personalizar Mensagem de Compra`)
                 .setDescription(`**Titulo atual:** \`${tema.get(`embed.titulo`)}\`\n\n**Descrição Atual:**\n${tema.get(`embed.desc`)}\n\n**Rodapé Atual:** \`${tema.get(`embed.rodape`) == "null" ? `Sem rodapé` : tema.get(`embed.rodape`)}\``)
                 .setColor(General.get(`color.padrao`))
                 .setFooter({ text: `Escolha oque você deseja mudar:`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
               ]
            })
         }
         
         function embedemoji() {
            const todosEmojis = emoji.all().map((hxwx, index) => {
               return `• ${index} - ${hxwx.data}`
            }).join('\n')
            
            const embedn = new EmbedBuilder()
             .setTitle(`${interaction.client.user.username} | Gerenciar Emojis`)
             .setDescription(`Este são os emojis atuais:\n${todosEmojis}`)
             .setColor(General.get(`color.padrao`))
             .setFooter({ text: `Para alterar um emoji você deverá enviar o número do emoji, após clicar no botão abaixo!`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
             
            const rown = new ActionRowBuilder()
             .addComponents(
                new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_editaremoji`)
                  .setLabel('Alterar Emoji')
                  .setEmoji(`1136607333204643931`)
                  .setStyle(1),
                new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_voltarpersonalizar`)
                  .setLabel('Voltar')
                  .setEmoji(`⬅️`)
                  .setStyle(2),
             )
             
            interaction.message.edit({ embeds: [embedn], components: [rown] })
         }
      }
  }
}