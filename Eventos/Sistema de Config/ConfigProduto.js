const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, RoleSelectMenuBuilder, ChannelSelectMenuBuilder, ChannelType } = require("discord.js")
const { perms, General, emoji, produto, tema, rankproduto } = require("../../DataBaseJson")
const axios = require('axios')
const fs = require('fs')
const collectS = {}

module.exports = {
   name: "interactionCreate",
   run: async(interaction, client) => {
       // Verificar se a interação já foi respondida
       if (interaction.replied || interaction.deferred) {
           return;
       }
       
       if (interaction.isButton()) {
          let ide = interaction.customId.split("_")[1]
          
          if (interaction.customId.endsWith("_altnome")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return
             
             const product = produto.get(ide)
             const embednew = new EmbedBuilder()
              .setTitle(`${interaction.client.user.username} | Gerenciar Produto`)
              .setDescription(`${emoji.get(`label`)} **| Nome Atual:** ${product.nome}\n\nEnvie o novo nome abaixo:\n\nCaso queira cancelar escreva abaixo **cancelar**`)
              .setColor(General.get(`color.padrao`))
             
             interaction.message.edit({ embeds: [embednew], components: [] })
             
             const collectorFilter = response => {
                return response.author.id === interaction.user.id;
             };
             interaction.channel.awaitMessages({ filter: collectorFilter, max: 1, time: 300000, errors: ['time'] })
             .then(async colleted => {
               const receivedMessage = colleted.first();
               receivedMessage.delete()
               
               if (receivedMessage.content == 'cancelar') return attembed()
               
               produto.set(`${ide}.nome`, receivedMessage.content)
               
               attembed()
             })
          }
          
          if (interaction.customId.endsWith("_altdesc")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return
             
             const product = produto.get(ide)
             const embednew = new EmbedBuilder()
              .setTitle(`${interaction.client.user.username} | Gerenciar Produto`)
              .setDescription(`${emoji.get(`label`)} **| Descrição Atual:** ${product.desc}\n\nEnvie a nova descrição abaixo:\n\nCaso queira cancelar escreva abaixo **cancelar**`)
              .setColor(General.get(`color.padrao`))
             
             interaction.message.edit({ embeds: [embednew], components: [] })
             
             const collectorFilter = response => {
                return response.author.id === interaction.user.id;
             };
             interaction.channel.awaitMessages({ filter: collectorFilter, max: 1, time: 300000, errors: ['time'] })
             .then(async colleted => {
               const receivedMessage = colleted.first();
               receivedMessage.delete()
               
               if (receivedMessage.content == 'cancelar') return attembed()
               
               produto.set(`${ide}.desc`, receivedMessage.content)
               
               attembed()
             })
          }
          
          if (interaction.customId.endsWith("_altpreco")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return
             
             const product = produto.get(ide)
             const embednew = new EmbedBuilder()
              .setTitle(`${interaction.client.user.username} | Gerenciar Produto`)
              .setDescription(`${emoji.get(`label`)} **| Preço Atual:** ${Number(product.preco).toFixed(2)}\n\nEnvie o novo preço abaixo:\n\nCaso queira cancelar escreva abaixo **cancelar**`)
              .setColor(General.get(`color.padrao`))
             
             interaction.message.edit({ embeds: [embednew], components: [] })
             
             const collectorFilter = response => {
                return response.author.id === interaction.user.id;
             };
             interaction.channel.awaitMessages({ filter: collectorFilter, max: 1, time: 300000, errors: ['time'] })
             .then(async colleted => {
               const receivedMessage = colleted.first();
               receivedMessage.delete()
               
               if (receivedMessage.content == 'cancelar') return attembed()
               
               if (isNaN(receivedMessage.content) == true) {
                  attembed()
                  interaction.channel.send(`${emoji.get(`emojix`)} | Preço inválido!`).then(msg => { setTimeout(() => { msg.delete() }, 4000)})
                  return
               }
               
               produto.set(`${ide}.preco`, receivedMessage.content)
               
               attembed()
             })
          }
          
          if (interaction.customId.endsWith("_configestoque")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return
             
             const estoqueInfo = produto.get(`${ide}.estoque`)
             const embednew = new EmbedBuilder()
             
             let resultado = estoqueInfo
              .map((item, i) => `📦 | ${i + 0}° - ${item}`).join('\n') || "Sem estoque, adicione."
             
             if (resultado.length >= 4000) {
               resultado = estoqueInfo
                .slice(0, 3)
                .map((item, i) => `📦 | ${i + 0}° - ${item}`).join('\n') || "Sem estoque, adicione."
                
               embednew
                .setTitle(`${interaction.client.user.username} | Gerenciar Produto`)
                .setDescription(`${emoji.get(`desc`)} | Este é seu estoque:\n\n${resultado}`)
                .setColor(General.get(`color.padrao`)).setFooter({ text: `Existem + produtos no estoque, faça um backup para ver seu estoque completo!`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
             } else {
               embednew
                .setTitle(`${interaction.client.user.username} | Gerenciar Produto`)
                .setDescription(`${emoji.get(`desc`)} | Este é seu estoque:\n\n${resultado}`)
                .setColor(General.get(`color.padrao`)).setFooter({ text: `${interaction.client.user.username} - Todos os direitos reservados.`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
             }
             
             const rownew = new ActionRowBuilder()
              .addComponents(
                  new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_addstock`)
                   .setLabel('ADICIONAR')
                   .setEmoji(`1141020908069326871`)
                   .setStyle(3),
                  new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_removestock`)
                   .setLabel('REMOVER')
                   .setEmoji(`1141020948909269054`)
                   .setStyle(2),
                  new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_backupstock`)
                   .setLabel('BACKUP')
                   .setEmoji('💾')
                   .setStyle(1),
                  new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_limparstock`)
                   .setLabel('LIMPAR')
                   .setEmoji(`1140438393373872148`)
                   .setStyle(4),
               )
               
              const rownew2 = new ActionRowBuilder()
               .addComponents(
                  new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_attmsg`)
                   .setLabel('Atualizar Mensagem')
                  .setEmoji(`1148666021041950790`)
                  .setStyle(1),
                  new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_voltarconfigpd`)
                   .setLabel('Voltar')
                  .setEmoji(`⬅️`)
                  .setStyle(2),
               )
               
              interaction.message.edit({ embeds: [embednew], components: [rownew, rownew2] })
          }
          
          if (interaction.customId.endsWith("_configavancada")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return
             
             const u = produto.get(ide)
             const embednew = new EmbedBuilder()
              .setTitle(`${interaction.client.user.username} | Outras Configurações `)
              .setDescription(`${emoji.get(`carrinho`)} | Categoria: ${interaction.guild.channels.cache.get(produto.get(`${ide}.categoria`)) || "Não definido"}\n${emoji.get(`pasta`)} | Banner: ${u.banner == null ? `Produto Sem Banner` : `[Banner](${u.banner})`}\n${emoji.get(`quadro`)} | Miniatura: ${u.thumb == null ? `Produto Sem Miniatura` : `[Miniatura](${u.thumb})`}\n${emoji.get(`user`)} | Cargo: ${u.cargo == "null" ? `Não Configurado` : `${interaction.guild.roles.cache.get(u.cargo)}`}\n${emoji.get(`pincel`)} | Cor Embed ${u.cor}\n${emoji.get(`caixa`)} | Cupom: ${u.cupom == 'ON' ? `Pode utilizar cupom nesse produto!` : `Não pode utilizar cupom nesse produto!`}`)
              .setColor(General.get(`color.padrao`))
              .setFooter({ text: `${interaction.client.user.username} - Todos os direitos reservados.`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
              
             const rownew = new ActionRowBuilder()
              .addComponents(
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_altbanner`)
                   .setLabel('Banner')
                   .setEmoji('🖼️')
                   .setStyle(1),
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_altthumn`)
                   .setLabel('Miniatura')
                   .setEmoji('🖼️')
                   .setStyle(1),
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_altcargo`)
                   .setLabel('Cargo')
                   .setEmoji(`1157337774622519296`)
                   .setStyle(1),
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_altcorembed`)
                   .setLabel('Cor Embed')
                   .setEmoji('🖌️')
                   .setStyle(1),
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_altcategoria`)
                   .setLabel('Definir Categoria')
                   .setEmoji(`1161241239182651413`)
                   .setStyle(1),
              )
              
             const rownew2 = new ActionRowBuilder()
              .addComponents(
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_cupomonoff`)
                   .setLabel('Ativar/Desativar Cupons')
                   .setEmoji(`1157338170757746729`)
                   .setStyle(1),
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_attmsg`)
                   .setLabel('Atualizar Mensagem')
                   .setEmoji(`1148666021041950790`)
                   .setStyle(1),
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_voltarconfigpd`)
                   .setLabel('Voltar')
                   .setEmoji(`⬅️`)
                   .setStyle(1),
              )
              
             interaction.message.edit({ embeds: [embednew], components: [rownew, rownew2] })
          }
          
          if (interaction.customId.endsWith("_attmsg")) {
             if (interaction.user.id != interaction.customId.split("_")[0]) return interaction.deferUpdate()
             
             const u = produto.get(ide)
             let uu = tema.get('embed.desc') 
             uu = uu.replace('#{desc}', `${u.desc}`)
             uu = uu.replace('#{nome}', `${u.nome}`)
             uu = uu.replace('#{preco}', `${Number(u.preco).toFixed(2)}`)
             uu = uu.replace('#{estoque}', `${u.estoque.length}`)
             let aa = tema.get('embed.titulo') 
             aa = aa.replace('#{desc}', `${u.desc}`)
             aa = aa.replace('#{nome}', `${u.nome}`)
             aa = aa.replace('#{preco}', `${Number(u.preco).toFixed(2)}`)
             aa = aa.replace('#{estoque}', `${u.estoque.length}`)
             const embedatt = new EmbedBuilder()
              .setTitle(aa)
              .setDescription(uu)
              .setColor(u.cor)
              
             if (u.banner != null) embedatt.setImage(u.banner)
             if (u.thumb != null) embedatt.setThumbnail(u.thumb)
             if (tema.get(`embed.rodape`) != "null") embedatt.setFooter({ text: `${tema.get(`embed.rodape`)}` })
             
             const rowatt = new ActionRowBuilder()
              .addComponents(
                 new ButtonBuilder()
                  .setCustomId(`${ide}_comprar`)
                  .setLabel(tema.get(`botao.label`))
                  .setEmoji(tema.get(`botao.emoji`))
                  .setStyle(tema.get(`botao.style`))
              )
              
             try {
               const canal = interaction.guild.channels.cache.get(produto.get(`${ide}.idcanal`))
               
               const message = await canal.messages.fetch(produto.get(`${ide}.idmsg`))
               
               message.edit({ embeds: [embedatt], components: [rowatt] })
                  
               interaction.reply({ content: `${emoji.get(`certo`)} | Mensagem Atualizada!`, ephemeral: true })
             } catch (error) {
               interaction.reply({ content: `${emoji.get(`alerta`)} | Erro ao atualizar a mensagem\n${emoji.get(`emojix`)} | Error: \`${error.code} ${error.message || error.toString() || "Erro desconhecido"}\``, ephemeral: true })
             }
          }
          
          if (interaction.customId.endsWith("_delproduto")) {
             if (interaction.user.id != interaction.customId.split("_")[0]) return interaction.deferUpdate()
             
             const modal = new ModalBuilder()
             .setCustomId(`${ide}_modaldelproduto`)
             .setTitle('Confirmar')
             
             const text = new TextInputBuilder()
             .setCustomId('confirmar')
             .setLabel('Para continuar escreva "SIM"')
             .setPlaceholder('SIM')
             .setRequired(true)
             .setStyle(1)
             
             modal.addComponents(new ActionRowBuilder().addComponents(text))
             
             interaction.showModal(modal)
          }
          
          if (interaction.customId.endsWith("_infoproduto")) {
             if (interaction.user.id != interaction.customId.split("_")[0]) return interaction.deferUpdate()
             
             const fernandinha = rankproduto.all().filter(i => i.data.totalganho).sort((a, b) => b.data.totalganho - a.data.totalganho).findIndex(entry => entry.ID == ide) + 1;
             
             const embedinfo = new EmbedBuilder()
              .setTitle('Estatísticas do Produto')
              .setDescription(`${emoji.get(`carrinho`)} | Total de Vendas: ${rankproduto.get(`${ide}.totalvendas`) || "0"}\n${emoji.get(`preco`)} | Rendeu: **R$${Number(rankproduto.get(`${ide}.totalganho`)).toFixed(2) || "0"}**\n${emoji.get(`trofeu`)} | Posição Rank: **__${fernandinha || "Nenhum venda realizada até o momento."}°__**`)
              .setColor(General.get(`color.padrao`))
              
             interaction.reply({ embeds: [embedinfo], ephemeral: true })
          }
          
          if (interaction.customId.endsWith("_addstock")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return
             
             const embednew = new EmbedBuilder()
              .setDescription(`${emoji.get(`lupa`)} | Você deseja adicionar diversos produtos de uma vez ou enviar um por um?`)
              .setColor(General.get(`color.padrao`))
              
             const rownew = new ActionRowBuilder()
              .addComponents(
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_addlinhastock`)
                   .setLabel(`ADICIONAR POR LINHA`)
                   .setEmoji(`1184105676545474631`)
                   .setStyle(3),
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_addumporumstock`)
                   .setLabel(`ADICIONAR UM POR UM`)
                   .setEmoji(`1141020908069326871`)
                   .setStyle(1),
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_addstocktxt`)
                   .setLabel(`ADICIONAR TXT`)
                   .setEmoji('📰')
                   .setStyle(3),
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_addstockfantasma`)
                   .setLabel(`ESTOQUE FANTASMA`)
                   .setEmoji('♾️')
                   .setStyle(1),
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_configestoque`)
                   .setLabel('Voltar')
                   .setEmoji(`⬅️`)
                   .setStyle(2),
              )
              
             interaction.message.edit({ embeds: [embednew], components: [rownew] })
          }
          
          if (interaction.customId.endsWith("_removestock")) {
             if (interaction.user.id != interaction.customId.split("_")[0]) return interaction.deferUpdate()
             
             if (produto.get(`${ide}.estoque`).length <= 0) return interaction.reply({ content: `${emoji.get(`emojix`)} | Não possui nenhum estoque no produto.`, ephemeral: true })
             
             interaction.deferUpdate()
             
             let resultado = ''
             if (produto.get(`${ide}.estoque`).length > 0) {
                resultado = produto.get(`${ide}.estoque`).slice(0, 99).map((entry, index) => {
                  return `📦 | ${index}° - ${entry}`
                }).join('\n')
             } else {
               resultado = "Sem estoque, adicione."
             }
             
             const embednew = new EmbedBuilder()
              .setTitle(`${interaction.client.user.username} | Gerenciar Produto`)
              .setDescription(`${emoji.get(`desc`)} | Este é seu estoque:\n\n${resultado}\n\nCaso queira cancelar digite **cancelar**`)
              .setColor(General.get(`color.padrao`))
              .setFooter({ text: `Para remover um intem você irá enviar o número da linha do produto!`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
              
             interaction.message.edit({ embeds: [embednew], components: [] })
             
             const collectorFilter = response => {
               return response.author.id === interaction.user.id;
             };
             interaction.channel.awaitMessages({ filter: collectorFilter, max: 1, time: 300000, errors: ['time'] })
             .then(async colleted => {
                const receivedMessage = colleted.first()
                receivedMessage.delete()
                
                if (receivedMessage.content == 'cancelar') return embedstock()
                
                if (isNaN(receivedMessage.content) == true) {
                   interaction.channel.send(`${emoji.get(`emojix`)} | Você inseriu um número inválido.`).then(msg => { setTimeout(() => { msg.delete() }, 4000)})
                   embedstock()
                   return
                }
                
                if (receivedMessage.content > Number(produto.get(`${ide}.estoque`).length)) {
                   interaction.channel.send(`${emoji.get(`emojix`)} | Error: item não encontrado!`).then(msg => { setTimeout(() => { msg.delete() }, 4000)})
                   embedstock()
                   return
                }
                
                const aka = produto.get(`${ide}.estoque`)
                aka.splice(receivedMessage.content, 1)
                produto.set(`${ide}.estoque`, aka)
                interaction.channel.send(`${emoji.get(`certo`)} | Produto número \`${receivedMessage.content}\` removido!`).then(msg => { setTimeout(() => { msg.delete() }, 4000)})
                embedstock()
             })
          }
          
          if (interaction.customId.endsWith("_backupstock")) {
             if (interaction.user.id != interaction.customId.split("_")[0]) return interaction.deferUpdate()
             
             if (produto.get(`${ide}.estoque`).length <= 0) return interaction.reply({ content: `${emoji.get(`emojix`)} | Error: o produto não possui nenhum estoque.`, ephemeral: true })
             
             const contas = produto.get(`${ide}.estoque`).map((entry, index) => {
                 return `📦 | ${index}° - ${entry}`
             }).join('\n')
             
             const localFile = `stock_${ide}.txt`
             
             fs.writeFile(`stock_${ide}.txt`, `${contas}`, (err) => {
                if (err) throw err;
             })
             
             interaction.reply({ content: `${emoji.get(`certo`)} | Estoque do produto \`${ide}\` enviado em seu privado.`, ephemeral: true })
             interaction.user.send({ files: [localFile] })
             
             setTimeout(() => {
               fs.unlink(localFile, (err) => {
                 if (err) {
                   console.error(`Erro ao apagar o arquivo: ${err}`);
                   return;
                 }
               })
             }, 5000)
          }
          
          if (interaction.customId.endsWith("_limparstock")) {
             if (interaction.user.id != interaction.customId.split("_")[0]) return interaction.deferUpdate()
             
             const modal = new ModalBuilder()
             .setCustomId(`${ide}_modallimparstock`)
             .setTitle('Limpar Estoque')
             
             const text = new TextInputBuilder()
             .setCustomId('confirmar')
             .setLabel('Para continuar escreva "SIM"')
             .setPlaceholder('SIM')
             .setRequired(true)
             .setStyle(1)
             
             modal.addComponents(new ActionRowBuilder().addComponents(text))
             
             interaction.showModal(modal)
          }
          
          if (interaction.customId.endsWith("_addlinhastock")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return
             
             const embednew = new EmbedBuilder()
              .setTitle(`${interaction.client.user.username} | Gerenciar Produto`)
              .setDescription(`${emoji.get(`jornal`)} | Envie a lista de produtos que você deseja adicionar no estoque!`)
              .setColor(General.get(`color.padrao`))
              
             interaction.message.edit({ embeds: [embednew], components: [] })
             
             const collectorFilter = response => {
               return response.author.id === interaction.user.id;
             };
             interaction.channel.awaitMessages({ filter: collectorFilter, max: 1, time: 300000, errors: ['time'] })
             .then(async colleted => {
               const message = colleted.first()
               const content = message.content.split(`\n`).filter(v => v != "");
               message.delete()
               
               for (let i = 0; i < content.length; i++) {
                 produto.push(`${ide}.estoque`, content[i]);
               }
               
               interaction.channel.send(`${emoji.get(`certo`)} | Foram adicionados \`${content.length}\`\ Produtos!`).then((msg) => {
                 setTimeout(() => {
                   msg.delete()
                 }, 5000)
                notificarestoque(content.length);
                embedstockadd()
             })
             })
          }
          
          let collector = ''
          let msgcount = ''
          if (interaction.customId.endsWith("_addumporumstock")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return
             
             const embednew = new EmbedBuilder()
              .setTitle(`${interaction.client.user.username} | Gerenciar Produto`)
              .setDescription(`${emoji.get(`jornal`)} | Envie os produtos de um em um, quando acabar clique no botão de finalizar.`)
              .setColor(General.get(`color.padrao`))
              
             const rownew = new ActionRowBuilder()
             .addComponents(
               new ButtonBuilder()
                .setLabel('Finalizar')
                .setStyle(3)
                .setEmoji(`1136604285887586324`)
                .setCustomId(`${interaction.user.id}_${ide}_finalizarstock`)
              )
             
             interaction.message.edit({ embeds: [embednew], components: [rownew] })
             
             const collectorFilter = response => {
               return response.author.id === interaction.user.id;
             };
             collectS[interaction.message.id] = await interaction.channel.createMessageCollector({ filter: collectorFilter, });
             collectS[interaction.message.id].on('collect', async (message) => {
                message.delete().catch(err => {})
                produto.push(`${ide}.estoque`, message.content)
             })
          }
          
          if (interaction.customId.endsWith("_finalizarstock")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return
             
             if (collectS[interaction.message.id]) collectS[interaction.message.id].stop();
             notificarestoque(produto.get(`${ide}.estoque`).length)
             embedstockadd()
          }
          
          if (interaction.customId.endsWith("_addstocktxt")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return
             
             const embednew = new EmbedBuilder()
              .setTitle(`${interaction.client.user.username} | Gerenciar Produto`)
              .setDescription(`${emoji.get(`jornal`)} | Envie o ARQUIVO TXT abaixo! (Iremos reconhecer por linha do TXT)`)
              .setColor(General.get(`color.padrao`))
              
             interaction.message.edit({ embeds: [embednew], components: [] })
             
             const collectorFilter = response => {
               return response.author.id === interaction.user.id;
             };
             interaction.channel.awaitMessages({ filter: collectorFilter, max: 1, time: 300000, errors: ['time'] })
             .then(async colleted => {
               const receivedMessage = colleted.first()
               receivedMessage.delete()
               
               if (!receivedMessage.attachments) {
                  interaction.channel.send(`${emoji.get(`emojix`)} | Você não enviou um arquivo txt.`).then(msg => { setTimeout(() => { msg.delete() }, 4000)})
                  embedstockadd()
                  return
               }
               
               if (receivedMessage.attachments.size > 0) {
                  
                  const attachment = receivedMessage.attachments.first()
                  
                  try {
                    const response = await axios.get(attachment.url)
                    const content = response.data
                    const lines = content.split('\n')
                    
                    const itemPromises = lines.map((line) => {
                       if (line.trim() != '') {
                         return new Promise(resolve => {
                           produto.push(`${ide}.estoque`, `${line}`)
                           resolve()
                         })
                       }
                       return Promise.resolve()
                    })
                    
                    await Promise.all(itemPromises)
                    embedstockadd()
                    notificarestoque(lines.length)
                    interaction.channel.send(`${emoji.get(`certo`)} Foram adicionados \`${lines.length}\` produtos no estoque com sucesso!`).then(msg => { setTimeout(() => { msg.delete() }, 4000)})
                  } catch (error) {
                    console.error(error)
                    embedstockadd()
                    interaction.channel.send(`${emoji.get(`alerta`)} Ocorreu um erro ao adicionar as contas.`).then(msg => { setTimeout(() => { msg.delete() }, 4000)})
                  }
                  
               } else {
                 interaction.channel.send(`${emoji.get(`emojix`)} | Você não enviou um arquivo txt.`).then(msg => { setTimeout(() => { msg.delete() }, 4000)})
                 embedstockadd()
                 return
               }
               
             })
          }
          
          if (interaction.customId.endsWith("_addstockfantasma")) {
             if (interaction.user.id != interaction.customId.split("_")[0]) return interaction.deferUpdate()
             
             const modal = new ModalBuilder()
             .setCustomId(`${ide}_modalstockfantasma`)
             .setTitle('Estoque Fantasma')
             
             const text = new TextInputBuilder()
             .setCustomId('quantidade')
             .setLabel('QUANTIDADE:')
             .setPlaceholder('Exemplo: 10')
             .setRequired(true)
             .setMaxLength(4)
             .setStyle(1)
             
             const text2 = new TextInputBuilder()
             .setCustomId('valor')
             .setLabel('VALOR FANTASMA:')
             .setPlaceholder('Exemplo: Abrir Ticket')
             .setRequired(true)
             .setStyle(1)
             
             modal.addComponents(new ActionRowBuilder().addComponents(text), new ActionRowBuilder().addComponents(text2))
             
             interaction.showModal(modal)
          }
          
          if (interaction.customId.endsWith("_altthumn")) {
             if (interaction.user.id != interaction.customId.split("_")[0]) return interaction.deferUpdate()
             
             const modal = new ModalBuilder()
             .setCustomId(`${ide}_modalthumbalt`)
             .setTitle('Alterar Miniatura')
             
             const text = new TextInputBuilder()
             .setCustomId('novo')
             .setLabel('LINK DA NOVA MINIATURA:')
             .setRequired(true)
             .setStyle(1)
             
             modal.addComponents(new ActionRowBuilder().addComponents(text))
             
             interaction.showModal(modal)
          }
          
          if (interaction.customId.endsWith("_altcargo")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return
             
             const embednew = new EmbedBuilder()
              .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
              .setDescription(`Selecione um cargo aqui para ser setado quando alguém comprar este produto.`)
              .setColor(General.get(`color.padrao`))
              
             const select = new ActionRowBuilder()
              .addComponents(
                 new RoleSelectMenuBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_selectcargo`)
                   .setPlaceholder('Selecione o Cargo:')
                   .setMinValues(1)
                   .setMaxValues(1)
              )
             
             const rowselect = new ActionRowBuilder()
              .addComponents(
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_removecargo`)
                   .setLabel('Remover Cargo')
                   .setEmoji(`1140438393373872148`)
                   .setStyle(4),
                  new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_configavancada`)
                   .setLabel('Voltar')
                   .setEmoji('⬅️')
                   .setStyle(2)
              )
              
             interaction.message.edit({ embeds: [embednew], components: [select, rowselect] })
          }
          
          if (interaction.customId.endsWith("_altcorembed")) {
             if (interaction.user.id != interaction.customId.split("_")[0]) return interaction.deferUpdate()
             
             const modal = new ModalBuilder()
             .setCustomId(`${ide}_modalcoralt`)
             .setTitle('Alterar Cor Padrão')
             
             const text = new TextInputBuilder()
             .setCustomId('novo')
             .setLabel('NOVA COR PADRÃO:')
             .setPlaceholder('Ex: #f4d03f')
             .setRequired(true)
             .setStyle(1)
             
             modal.addComponents(new ActionRowBuilder().addComponents(text))
             
             interaction.showModal(modal)
          }
          
          if (interaction.customId.endsWith("_altbanner")) {
             if (interaction.user.id != interaction.customId.split("_")[0]) return interaction.deferUpdate()
             
             const modal = new ModalBuilder()
             .setCustomId(`${ide}_modalbanneralt`)
             .setTitle('Alterar Banner')
             
             const text = new TextInputBuilder()
             .setCustomId('novo')
             .setLabel('LINK DO NOVO BANNER:')
             .setRequired(true)
             .setStyle(1)
             
             modal.addComponents(new ActionRowBuilder().addComponents(text))
             
             interaction.showModal(modal)
          }
          
          if (interaction.customId.endsWith("_altcategoria")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return
             
             const embednew = new EmbedBuilder()
              .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
              .setDescription(`Categoria definida: ${interaction.guild.channels.cache.get(produto.get(`${ide}.categoria`)) || "Não definido"}`)
              .setColor(General.get(`color.padrao`))
              
             const select = new ActionRowBuilder()
              .addComponents(
                 new ChannelSelectMenuBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_selectcategoria`)
                   .setPlaceholder(`Selecione o Canal:`)
                   .setMinValues(1)
                   .setMaxValues(1)
                   .setChannelTypes(ChannelType.GuildCategory)
              )
              
             const rowselect = new ActionRowBuilder()
              .addComponents(
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_configavancada`)
                   .setLabel('Voltar')
                   .setEmoji('⬅️')
                   .setStyle(2)
              )
              
             interaction.message.edit({ embeds: [embednew], components: [select, rowselect] })
          }
          
          if (interaction.customId.endsWith("_cupomonoff")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return
             
             if (produto.get(`${ide}.cupom`) == 'ON') {
                produto.set(`${ide}.cupom`, `OFF`)
             } else if (produto.get(`${ide}.cupom`) == 'OFF') {
                produto.set(`${ide}.cupom`, `ON`)
             }
             
             embedconfig()
          }
          
          if (interaction.customId.endsWith("_removecargo")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return
             
             produto.set(`${ide}.cargo`, "null")
             
             embedconfig()
          }
          
          if (interaction.customId.endsWith("_voltarconfigpd")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return
             
             attembed()
          }
          
          function attembed() {
             const produ = produto.get(ide)
             const embed = new EmbedBuilder()
             .setTitle(`${interaction.client.user.username} | Gerenciar Produto`)
             .setDescription(`${emoji.get(`desc`)} **| Descrição:**\n\n${produ.desc}\n\n${emoji.get(`lupa`)} | Id: ${ide}\n${emoji.get(`label`)} | Nome: ${produ.nome}\n${emoji.get(`preco`)} | Preço: R$ ${Number(produ.preco).toFixed(2)}\n${emoji.get(`caixa`)} | Estoque quantidade: ${produ.estoque.length}`)
            .setColor(General.get(`color.padrao`))
            .setFooter({ text: `${interaction.client.user.username} - Todos os direitos reservados.`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
        
          const row = new ActionRowBuilder()
           .addComponents(
            new ButtonBuilder()
              .setCustomId(`${interaction.user.id}_${ide}_altnome`)
              .setLabel('NOME')
              .setEmoji(`1136604220246728754`)
              .setStyle(3),
            new ButtonBuilder()
              .setCustomId(`${interaction.user.id}_${ide}_altpreco`)
              .setLabel('PREÇO')
              .setEmoji(`1136604253062955008`)
              .setStyle(3),
            new ButtonBuilder()
              .setCustomId(`${interaction.user.id}_${ide}_altdesc`)
              .setLabel('DESCRIÇÃO')
              .setEmoji(`1184105676545474631`)
              .setStyle(3),
            new ButtonBuilder()
              .setCustomId(`${interaction.user.id}_${ide}_configestoque`)
              .setLabel('ESTOQUE')
              .setEmoji(`1136604285887586324`)
              .setStyle(3),
         )
        
          const row2 = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(`${interaction.user.id}_${ide}_configavancada`)
              .setLabel('Configurações Avançadas')
              .setEmoji(`1136607333204643931`)
              .setStyle(1),
            new ButtonBuilder()
              .setCustomId(`${interaction.user.id}_${ide}_attmsg`)
              .setLabel('Atualizar Mensagem')
              .setEmoji(`1148666021041950790`)
              .setStyle(1),
            new ButtonBuilder()
              .setCustomId(`${interaction.user.id}_${ide}_delproduto`)
              .setLabel('DELETAR')
              .setEmoji(`1140438393373872148`)
              .setStyle(4),
            new ButtonBuilder()
              .setCustomId(`${interaction.user.id}_${ide}_infoproduto`)
              .setEmoji(`1136607825758527529`)
              .setStyle(1),
            )
           
           interaction.message.edit({ embeds: [embed], components: [row, row2] })
          }
          
          function embedstock() {
             const estoqueInfo = produto.get(`${ide}.estoque`)
             const embednew = new EmbedBuilder()
             
             let resultado = estoqueInfo
              .map((item, i) => `📦 | ${i + 0}° - ${item}`).join('\n') || "Sem estoque, adicione."
             
             if (resultado.length >= 4000) {
               resultado = estoqueInfo
                .slice(0, 3)
                .map((item, i) => `📦 | ${i + 0}° - ${item}`).join('\n') || "Sem estoque, adicione."
                
               embednew
                .setTitle(`${interaction.client.user.username} | Gerenciar Produto`)
                .setDescription(`${emoji.get(`desc`)} | Este é seu estoque:\n\n${resultado}`)
                .setColor(General.get(`color.padrao`)).setFooter({ text: `Existem + produtos no estoque, faça um backup para ver seu estoque completo!`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
             } else {
               embednew
                .setTitle(`${interaction.client.user.username} | Gerenciar Produto`)
                .setDescription(`${emoji.get(`desc`)} | Este é seu estoque:\n\n${resultado}`)
                .setColor(General.get(`color.padrao`)).setFooter({ text: `${interaction.client.user.username} - Todos os direitos reservados.`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
             }
              
             const rownew = new ActionRowBuilder()
              .addComponents(
                  new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_addstock`)
                   .setLabel('ADICIONAR')
                   .setEmoji(`1141020908069326871`)
                   .setStyle(3),
                  new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_removestock`)
                   .setLabel('REMOVER')
                   .setEmoji(`1141020948909269054`)
                   .setStyle(2),
                  new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_backupstock`)
                   .setLabel('BACKUP')
                   .setEmoji('💾')
                   .setStyle(1),
                  new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_limparstock`)
                   .setLabel('LIMPAR')
                   .setEmoji(`1140438393373872148`)
                   .setStyle(4),
               )
               
              const rownew2 = new ActionRowBuilder()
               .addComponents(
                  new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_attmsg`)
                   .setLabel('Atualizar Mensagem')
                  .setEmoji(`1148666021041950790`)
                  .setStyle(1),
                  new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_voltarconfigpd`)
                   .setLabel('Voltar')
                  .setEmoji(`⬅️`)
                  .setStyle(2),
               )
               
              interaction.message.edit({ embeds: [embednew], components: [rownew, rownew2] })
          }
          
          function embedstockadd() {
             const embednew = new EmbedBuilder()
              .setDescription(`${emoji.get(`lupa`)} | Você deseja adicionar diversos produtos de uma vez ou enviar um por um?`)
              .setColor(General.get(`color.padrao`))
              
             const rownew = new ActionRowBuilder()
              .addComponents(
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_addlinhastock`)
                   .setLabel(`ADICIONAR POR LINHA`)
                   .setEmoji(`1184105676545474631`)
                   .setStyle(3),
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_addumporumstock`)
                   .setLabel(`ADICIONAR UM POR UM`)
                   .setEmoji(`1141020908069326871`)
                   .setStyle(1),
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_addstocktxt`)
                   .setLabel(`ADICIONAR TXT`)
                   .setEmoji('📰')
                   .setStyle(3),
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_addstockfantasma`)
                   .setLabel(`ESTOQUE FANTASMA`)
                   .setEmoji('♾️')
                   .setStyle(1),
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_configestoque`)
                   .setLabel('Voltar')
                   .setEmoji(`⬅️`)
                   .setStyle(2),
              )
              
             interaction.message.edit({ embeds: [embednew], components: [rownew] })
          }
          
          function embedconfig() {
             const u = produto.get(ide)
             const embednew = new EmbedBuilder()
              .setTitle(`${interaction.client.user.username} | Outras Configurações `)
              .setDescription(`${emoji.get(`carrinho`)} | Categoria: ${interaction.guild.channels.cache.get(produto.get(`${ide}.categoria`)) || "Não definido"}\n${emoji.get(`pasta`)} | Banner: ${u.banner == null ? `Produto Sem Banner` : `[Banner](${u.banner})`}\n${emoji.get(`quadro`)} | Miniatura: ${u.thumb == null ? `Produto Sem Miniatura` : `[Miniatura](${u.thumb})`}\n${emoji.get(`user`)} | Cargo: ${u.cargo == "null" ? `Não Configurado` : `${interaction.guild.roles.cache.get(u.cargo)}`}\n${emoji.get(`pincel`)} | Cor Embed ${u.cor}\n${emoji.get(`caixa`)} | Cupom: ${u.cupom == 'ON' ? `Pode utilizar cupom nesse produto!` : `Não pode utilizar cupom nesse produto!`}`)
              .setColor(General.get(`color.padrao`))
              .setFooter({ text: `${interaction.client.user.username} - Todos os direitos reservados.`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
              
             const rownew = new ActionRowBuilder()
              .addComponents(
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_altbanner`)
                   .setLabel('Banner')
                   .setEmoji('🖼️')
                   .setStyle(1),
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_altthumn`)
                   .setLabel('Miniatura')
                   .setEmoji('🖼️')
                   .setStyle(1),
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_altcargo`)
                   .setLabel('Cargo')
                   .setEmoji(`1157337774622519296`)
                   .setStyle(1),
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_altcorembed`)
                   .setLabel('Cor Embed')
                   .setEmoji('🖌️')
                   .setStyle(1),
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_altcategoria`)
                   .setLabel('Definir Categoria')
                   .setEmoji(`1161241239182651413`)
                   .setStyle(1),
              )
              
             const rownew2 = new ActionRowBuilder()
              .addComponents(
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_cupomonoff`)
                   .setLabel('Ativar/Desativar Cupons')
                   .setEmoji(`1157338170757746729`)
                   .setStyle(1),
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_attmsg`)
                   .setLabel('Atualizar Mensagem')
                   .setEmoji(`1148666021041950790`)
                   .setStyle(1),
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_voltarconfigpd`)
                   .setLabel('Voltar')
                   .setEmoji(`⬅️`)
                   .setStyle(1),
              )
              
             interaction.message.edit({ embeds: [embednew], components: [rownew, rownew2] })
          }
          
          async function notificarestoque(totalestoque) {
             produto.get(`${ide}.notify`).forEach(entry => {
                const user = interaction.guild.members.cache.get(entry)
                
                if (user) {
                   const embednotify = new EmbedBuilder()
                    .setTitle(`${interaction.client.user.username} - Notificações`)
                    .setDescription(`${emoji.get(`sino`)} | O estoque do produto **${ide}**, foi reabastecido com \`${totalestoque}\` itens.\n${emoji.get(`carrinho`)} | O produto se encontra no canal ${interaction.guild.channels.cache.get(produto.get(`${ide}.idcanal`)) || `\`Canal não encontrado\``}`)
                    .setColor(General.get(`color.padrao`))
                    .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }))
                    
                   user.send({ content: `${user}`, embeds: [embednotify] })
                }
             })
             produto.set(`${ide}.notify`, [])
          }
       }
       
       
       if (interaction.isModalSubmit()) {
          const ide = interaction.customId.split("_")[0]
          
          if (interaction.customId.endsWith("_modalstockfantasma")) {
             const quantidade = interaction.fields.getTextInputValue("quantidade")
             const valor = interaction.fields.getTextInputValue("valor")
             
             if (isNaN(quantidade) == true) return interaction.reply({ content: `ERROR: você inseriu uma quantidade inválida`, ephemeral: true })
             
             for (let i = 0; i < quantidade; i++) {
                 produto.push(`${ide}.estoque`, valor)
             }
             
             interaction.reply({ content: `${emoji.get(`certo`)} | Foram adicionado \`${quantidade}\` produtos no estoque!`, ephemeral: true })
             notificarestoque(quantidade)
          }
          
          if (interaction.customId.endsWith("_modallimparstock")) {
             const sim = interaction.fields.getTextInputValue("confirmar")
             
             if (sim == 'sim' || sim == 'Sim' || sim == 'SIM') {
                produto.set(`${ide}.estoque`, [])
                interaction.reply({ content: `CERTO: estoque do produto \`${ide}\` limpo!`, ephemeral: true })
                const embednew = new EmbedBuilder()
                 .setTitle(`${interaction.client.user.username} | Gerenciar Produto`)
                 .setDescription(`${emoji.get(`desc`)} | Este é seu estoque:\n\nSem estoque, adicione.`)
                 .setColor(General.get(`color.padrao`))
                 .setFooter({ text: `${interaction.client.user.username} - Todos os direitos reservados.`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
                
                interaction.message.edit({ embeds: [embednew] })
             } else {
                interaction.reply({ content: `ERROR: você não escreveu \`SIM\` corretamente.`, ephemeral: true })
             }
          }
          
          if (interaction.customId.endsWith("_modalbanneralt")) {
             const novo = interaction.fields.getTextInputValue("novo")
             
             if (!link(novo)) return interaction.reply({ content: `${emoji.get(`emojix`)} | Error: link inválido.`, ephemeral: true })
             
             produto.set(`${ide}.banner`, novo)
             interaction.reply({ content: `${emoji.get(`certo`)} | Banner alterado!`, ephemeral: true })
             attembed()
          }
          
          if (interaction.customId.endsWith("_modalthumbalt")) {
             const novo = interaction.fields.getTextInputValue("novo")
             
             if (!link(novo)) return interaction.reply({ content: `${emoji.get(`emojix`)} | Error: link inválido.`, ephemeral: true })
             
             produto.set(`${ide}.thumb`, novo)
             interaction.reply({ content: `${emoji.get(`certo`)} | Miniatura alterada!`, ephemeral: true })
             attembed()
          }
          
          if (interaction.customId.endsWith("_modalcoralt")) {
             const novo = interaction.fields.getTextInputValue("novo")
             
             if (!corregex(novo)) return interaction.reply({ content: `${emoji.get(`emojix`)} | Error: Cor HEX inválida.`, ephemeral: true })
             
             produto.set(`${ide}.cor`, novo)
             interaction.reply({ content: `${emoji.get(`certo`)} | Cor da Embed alterada!`, ephemeral: true })
             attembed()
          }
          
          if (interaction.customId.endsWith("_modaldelproduto")) {
             const ss = interaction.fields.getTextInputValue("confirmar")
             
             if (ss == 'SIM') {
                produto.delete(ide)
                interaction.update({ content: `${emoji.get(`certo`)} | Produto \`${ss}\` deletado!`, embeds: [], components: [] }).then(msg => { setTimeout(() => { msg.delete() }, 4000)})
             } else {
                interaction.reply({ content: `ERROR: você não escreveu \`SIM\` corretamente.`, ephemeral: true })
             }
          }
          
          async function notificarestoque(totalestoque) {
             produto.get(`${ide}.notify`).forEach(entry => {
                const user = interaction.guild.members.cache.get(entry)
                
                if (user) {
                   const embednotify = new EmbedBuilder()
                    .setTitle(`${interaction.client.user.username} - Notificações`)
                    .setDescription(`${emoji.get(`sino`)} | O estoque do produto **${ide}**, foi reabastecido com \`${totalestoque}\` itens.\n${emoji.get(`carrinho`)} | O produto se encontra no canal ${interaction.guild.channels.cache.get(produto.get(`${ide}.idcanal`)) || `\`Canal não encontrado\``}`)
                    .setColor(General.get(`color.padrao`))
                    .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }))
                    
                   user.send({ content: `${user}`, embeds: [embednotify] })
                }
             })
             produto.set(`${ide}.notify`, [])
          }
          
          function link(n) {
              const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;
              return urlRegex.test(n)
          }
          
          function corregex(cor) {
             const corRegex = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/
             return corRegex.test(cor)
          }
          
          function attembed() {
             const u = produto.get(ide)
             const embednew = new EmbedBuilder()
              .setTitle(`${interaction.client.user.username} | Outras Configurações `)
              .setDescription(`${emoji.get(`carrinho`)} | Categoria: ${interaction.guild.channels.cache.get(produto.get(`${ide}.categoria`)) || "Não definido"}\n${emoji.get(`pasta`)} | Banner: ${u.banner == null ? `Produto Sem Banner` : `[Banner](${u.banner})`}\n${emoji.get(`quadro`)} | Miniatura: ${u.thumb == null ? `Produto Sem Miniatura` : `[Miniatura](${u.thumb})`}\n${emoji.get(`user`)} | Cargo: ${u.cargo == null ? `Não Configurado` : `${interaction.guild.roles.cache.get(u.cargo)}`}\n${emoji.get(`pincel`)} | Cor Embed ${u.cor}\n${emoji.get(`caixa`)} | Cupom: ${u.cupom == 'ON' ? `Pode utilizar cupom nesse produto!` : `Não pode utilizar cupom nesse produto!`}`)
              .setColor(General.get(`color.padrao`))
              .setFooter({ text: `${interaction.client.user.username} - Todos os direitos reservados.`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
              
             interaction.message.edit({ embeds: [embednew] })
          }
       }
       
       if (interaction.isRoleSelectMenu()) {
          const ide = interaction.customId.split("_")[1]
          if (interaction.customId.endsWith("_selectcargo")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return
             
             produto.set(`${ide}.cargo`, interaction.values[0])
             
             embedconfig()
          }
          
          function embedconfig() {
             const u = produto.get(ide)
             const embednew = new EmbedBuilder()
              .setTitle(`${interaction.client.user.username} | Outras Configurações `)
              .setDescription(`${emoji.get(`carrinho`)} | Categoria: ${interaction.guild.channels.cache.get(produto.get(`${ide}.categoria`)) || "Não definido"}\n${emoji.get(`pasta`)} | Banner: ${u.banner == null ? `Produto Sem Banner` : `[Banner](${u.banner})`}\n${emoji.get(`quadro`)} | Miniatura: ${u.thumb == null ? `Produto Sem Miniatura` : `[Miniatura](${u.thumb})`}\n${emoji.get(`user`)} | Cargo: ${u.cargo == "null" ? `Não Configurado` : `${interaction.guild.roles.cache.get(u.cargo)}`}\n${emoji.get(`pincel`)} | Cor Embed ${u.cor}\n${emoji.get(`caixa`)} | Cupom: ${u.cupom == 'ON' ? `Pode utilizar cupom nesse produto!` : `Não pode utilizar cupom nesse produto!`}`)
              .setColor(General.get(`color.padrao`))
              .setFooter({ text: `${interaction.client.user.username} - Todos os direitos reservados.`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
              
             const rownew = new ActionRowBuilder()
              .addComponents(
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_altbanner`)
                   .setLabel('Banner')
                   .setEmoji('🖼️')
                   .setStyle(1),
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_altthumn`)
                   .setLabel('Miniatura')
                   .setEmoji('🖼️')
                   .setStyle(1),
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_altcargo`)
                   .setLabel('Cargo')
                   .setEmoji(`1157337774622519296`)
                   .setStyle(1),
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_altcorembed`)
                   .setLabel('Cor Embed')
                   .setEmoji('🖌️')
                   .setStyle(1),
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_altcategoria`)
                   .setLabel('Definir Categoria')
                   .setEmoji(`1161241239182651413`)
                   .setStyle(1),
              )
              
             const rownew2 = new ActionRowBuilder()
              .addComponents(
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_cupomonoff`)
                   .setLabel('Ativar/Desativar Cupons')
                   .setEmoji(`1157338170757746729`)
                   .setStyle(1),
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_attmsg`)
                   .setLabel('Atualizar Mensagem')
                   .setEmoji(`1148666021041950790`)
                   .setStyle(1),
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_voltarconfigpd`)
                   .setLabel('Voltar')
                   .setEmoji(`⬅️`)
                   .setStyle(1),
              )
              
             interaction.message.edit({ embeds: [embednew], components: [rownew, rownew2] })
          }
       }
       
       if (interaction.isChannelSelectMenu()) {
          const ide = interaction.customId.split("_")[1]
          if (interaction.customId.endsWith("_selectcategoria")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return
             
             produto.set(`${ide}.categoria`, interaction.values[0])
             
             embedconfig()
          }
          
          function embedconfig() {
             const u = produto.get(ide)
             const embednew = new EmbedBuilder()
              .setTitle(`${interaction.client.user.username} | Outras Configurações `)
              .setDescription(`${emoji.get(`carrinho`)} | Categoria: ${interaction.guild.channels.cache.get(produto.get(`${ide}.categoria`)) || "Não definido"}\n${emoji.get(`pasta`)} | Banner: ${u.banner == null ? `Produto Sem Banner` : `[Banner](${u.banner})`}\n${emoji.get(`quadro`)} | Miniatura: ${u.thumb == null ? `Produto Sem Miniatura` : `[Miniatura](${u.thumb})`}\n${emoji.get(`user`)} | Cargo: ${u.cargo == "null" ? `Não Configurado` : `${interaction.guild.roles.cache.get(u.cargo)}`}\n${emoji.get(`pincel`)} | Cor Embed ${u.cor}\n${emoji.get(`caixa`)} | Cupom: ${u.cupom == 'ON' ? `Pode utilizar cupom nesse produto!` : `Não pode utilizar cupom nesse produto!`}`)
              .setColor(General.get(`color.padrao`))
              .setFooter({ text: `${interaction.client.user.username} - Todos os direitos reservados.`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
              
             const rownew = new ActionRowBuilder()
              .addComponents(
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_altbanner`)
                   .setLabel('Banner')
                   .setEmoji('🖼️')
                   .setStyle(1),
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_altthumn`)
                   .setLabel('Miniatura')
                   .setEmoji('🖼️')
                   .setStyle(1),
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_altcargo`)
                   .setLabel('Cargo')
                   .setEmoji(`1157337774622519296`)
                   .setStyle(1),
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_altcorembed`)
                   .setLabel('Cor Embed')
                   .setEmoji('🖌️')
                   .setStyle(1),
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_altcategoria`)
                   .setLabel('Definir Categoria')
                   .setEmoji(`1161241239182651413`)
                   .setStyle(1),
              )
              
             const rownew2 = new ActionRowBuilder()
              .addComponents(
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_cupomonoff`)
                   .setLabel('Ativar/Desativar Cupons')
                   .setEmoji(`1157338170757746729`)
                   .setStyle(1),
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_attmsg`)
                   .setLabel('Atualizar Mensagem')
                   .setEmoji(`1148666021041950790`)
                   .setStyle(1),
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_voltarconfigpd`)
                   .setLabel('Voltar')
                   .setEmoji(`⬅️`)
                   .setStyle(1),
              )
              
             interaction.message.edit({ embeds: [embednew], components: [rownew, rownew2] })
          }
       }
   }
}