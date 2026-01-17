const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, StringSelectMenuBuilder, ChannelSelectMenuBuilder, ChannelType, PermissionFlagsBits, ComponentType, AttachmentBuilder } = require("discord.js")
const { perms, General, emoji, produto, tema, rankproduto, carrinhos, rank, cupons, rendimentos, saldo, painel } = require("../../DataBaseJson");
const axios = require('axios');
const fs = require('fs')
const coodolwn = new Map()
const moment = require('moment');
const { MercadoPagoConfig, Payment, Preference, MerchantOrder, PaymentRefund } = require('mercadopago');

module.exports = {
  name: "interactionCreate",
    
  run: async(interaction, client) => {
    // Verificar se a interação já foi respondida
    if (interaction.replied || interaction.deferred) {
      return;
    }

    if (interaction.isButton()) {
      
      if (interaction.customId.endsWith("_comprar")) {
        const now = Date.now();
        attproduto()
        if (coodolwn.has(interaction.user.id)) {
          const tempofalta = 5000 - (now - coodolwn.get(interaction.user.id))
          return interaction.reply({ content: `Aguarde ${Number(tempofalta / 1000).toFixed(0)} segundos para interagir novamente.`, ephemeral: true })
        }
        coodolwn.set(interaction.user.id, now)
        setTimeout(() => {
          coodolwn.delete(interaction.user.id)
        }, 5000)
        
        if (General.get(`vendas`) != 'ON') return interaction.reply({
          embeds: [new EmbedBuilder()
             .setDescription(`${emoji.get(`alerta`)} | O sistema de vendas se encontra desativado, aguarde até ele ser ligado novamente!`)
             .setColor("Red")
           ],
          ephemeral: true
        })
        
        if (General.get(`blacklist`)?.includes(interaction.user.id)) {
          await interaction.reply({ content: `${emoji.get(`emojix`)} | Você está registrado na **BLACK-LIST** de nosso sistema de LOJA!`, ephemeral: true })
          return;
        }
        
        if (!interaction.guild.channels.cache.get(General.get(`canais.categoria`))) return interaction.reply({ content: `${emoji.get(`alerta`)} | A categoria de carrinhos não está configurada!`, ephemeral: true })
        
        const product = produto.get(interaction.customId.split("_")[0])
        const ide = interaction.customId.split("_")[0]
        
        if (product.estoque.length < 1) return interaction.reply({
           embeds: [new EmbedBuilder()
             .setDescription(`${emoji.get(`error`)} | Este produto está sem estoque, aguarde um reabastecimento!`)
             .setColor(General.get(`color.padrao`))
           ],
           components: [new ActionRowBuilder()
              .addComponents(
                 new ButtonBuilder()
                   .setCustomId(`${ide}_ativarnotificacao`)
                   .setLabel('Ativar Notificações')
                   .setEmoji(`1136604466804699136`)
                   .setStyle(2)
              )
            ],
           ephemeral: true
        })
        
        if (interaction.guild.channels.cache.find(c => c.topic == `compra-${interaction.user.id}`)) {
          const c = interaction.guild.channels.cache.find(c => c.topic == `compra-${interaction.user.id}`)
           
          if (carrinhos.get(`${c.id}.addprodutos`) == "nao") return interaction.reply({
            content: `${emoji.get(`alerta`)} | Não é possivel adicionar mais produtos no seu carrinho!`,
            components: [new ActionRowBuilder()
              .addComponents(
                 new ButtonBuilder()
                  .setLabel('🛒 • Ir para o Carrinho')
                  .setURL(c.url)
                  .setStyle(5)
              )
             ],
            ephemeral: true
          })
          
          if (carrinhos.get(`${c.id}.produtos`).length >= 5) return interaction.reply({
             embeds: [new EmbedBuilder()
                .setDescription(`${emoji.get(`alerta`)} | O carrinho já atingiu o máximo de produtos!`)
                .setColor("Red")
              ],
             components: [new ActionRowBuilder()
               .addComponents(
                 new ButtonBuilder()
                  .setLabel('🛒 • Ir para o Carrinho')
                  .setURL(c.url)
                  .setStyle(5)
                )
               ],
              ephemeral: true
          })
          
         
          if (carrinhos.get(`${c.id}.produtos`).includes(ide)) return interaction.reply({
            content: `${emoji.get(`alerta`)} | Esse produto já está no seu carrinho!`,
            components: [new ActionRowBuilder()
               .addComponents(
                 new ButtonBuilder()
                  .setLabel('🛒 • Ir para o Carrinho')
                  .setURL(c.url)
                  .setStyle(5)
                )
              ],
            ephemeral: true
          })
          
          c.send({
            embeds: [new EmbedBuilder()
               .setDescription(`${emoji.get(`produto`)} | Produto: \`${product.nome}\`\n\n${emoji.get(`caixa`)} | Quantidade: \`1\`\n\n${emoji.get(`preco`)} | Valor: \`${Number(product.preco).toFixed(2)}\`\n\n${emoji.get(`desc`)} | Quantidade disponível: \`${product.estoque.length}\``)
               .setColor(General.get(`color.padrao`))
             ],
            components: [new ActionRowBuilder()
              .addComponents(
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_${ide}_addboton`)
                  .setLabel('+')
                  .setStyle(2),
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_${ide}_lapisadd`)
                  .setEmoji('✏️')
                  .setStyle(3),
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_${ide}_removproduct`)
                  .setLabel('-')
                  .setStyle(2),
                 new ButtonBuilder()
                 .setCustomId(`${interaction.user.id}_${ide}_delprod`)
                 .setEmoji('1179008431781314670')
                 .setStyle(4),
                )
              ],
             ephemeral: true
          })
          carrinhos.push(`${c.id}.produtos`, ide)
          carrinhos.set(`${c.id}.${ide}.ID`, ide)
          carrinhos.set(`${c.id}.${ide}.nome`, product.nome)
          carrinhos.set(`${c.id}.${ide}.quantidade`, 1)
          carrinhos.set(`${c.id}.${ide}.valor`, product.preco)
          
          return interaction.reply({
            embeds: [new EmbedBuilder()
              .setDescription(`${emoji.get(`certo`)} | ${interaction.user} Produto adicionado com sucesso no seu carrinho!`)
              .setColor("Green")
             ],
            components: [new ActionRowBuilder()
              .addComponents(
                 new ButtonBuilder()
                  .setLabel('🛒 • Ir para o Carrinho')
                  .setURL(c.url)
                  .setStyle(5)
               )
             ],
            ephemeral: true
          })
        }
        
        const msg = await interaction.reply({
          content: `${emoji.get(`carregando`)} | Criando carrinho...`,
          ephemeral: true,
        }).catch(error => {})
        
        interaction.guild.channels.create({
          name: `🛒・${interaction.user.username}`,
          type: 0,
          parent: interaction.guild.channels.cache.get(product.categoria) || interaction.guild.channels.cache.get(General.get(`canais.categoria`)),
          topic: `compra-${interaction.user.id}`,
          permissionOverwrites: [
            {
              id: interaction.guild.id,
              deny: ["ViewChannel"],
            },
            {
              id: interaction.user.id,
              allow: ["ViewChannel", "AddReactions"],
              deny: ["SendMessages"]
            },
           ],
        }).then(async (c) => {
          
          try {
            await msg.edit({
              content: ` `,
              embeds: [
                new EmbedBuilder()
                 .setTitle(`${interaction.client.user.username} | Sistema de Vendas`)
                 .setDescription(`${emoji.get(`certo`)} | ${interaction.user} **Seu carrinho foi aberto com sucesso em: ${c}, fique à vontade para adicionar mais produtos.**`)
                 .setColor("Green")
               ],
              components: [
                 new ActionRowBuilder()
                  .addComponents(
                    new ButtonBuilder()
                     .setStyle(5)
                     .setLabel("🛒・Ir para carrinho")
                     .setURL(c.url)
                   )
                ],
              ephemeral: true,
            })
          } catch (error) {
            if (error.code == 10008) {
              throw error;
            }
          }
          
          const canallogs = await interaction.guild.channels.cache.get(General.get(`canais.logs_adm`))
          try {
            await canallogs.send({
              embeds: [new EmbedBuilder()
                 .setTitle(`${interaction.client.user.username} | Carrinho Criado`)
                 .setDescription(`${emoji.get(`seta`)} | ${interaction.user} | ${interaction.user.username} Criou um Carrinho\n\nProduto: \`${ide}\`\nValor: \`${Number(product.preco).toFixed(2)}\``)
                 .setColor("Green")
                 .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
               ]
            })
          } catch (error) {
            //
          }
          
          carrinhos.set(`${c.id}.status`, 'Gerenciando')
          carrinhos.set(`${c.id}.user`, interaction.user.id)
          carrinhos.set(`${c.id}.username`, interaction.user.username)
          carrinhos.set(`${c.id}.preco`, 0)
          carrinhos.set(`${c.id}.data`, new Date().getTime())
          carrinhos.set(`${c.id}.pagamento`, 'Pix')
          carrinhos.set(`${c.id}.cupomutilizado`, 'Nenhum')
          carrinhos.set(`${c.id}.valorcupom`, 0)
          carrinhos.push(`${c.id}.produtos`, ide)
          carrinhos.set(`${c.id}.addprodutos`, 'sim')
          carrinhos.set(`${c.id}.avaliou`, 'nao')
          carrinhos.set(`${c.id}.idreembolso`, 'sem')
          carrinhos.set(`${c.id}.entregue`, [])
          carrinhos.set(`${c.id}.${ide}.ID`, ide)
          carrinhos.set(`${c.id}.${ide}.nome`, product.nome)
          carrinhos.set(`${c.id}.${ide}.quantidade`, 1)
          carrinhos.set(`${c.id}.${ide}.valor`, product.preco)
          
          
          const timer = setTimeout(async () => {
             if (!interaction.guild.channels.cache.find(c => c.topic == `compra-${interaction.user.id}`)) {
              clearTimeout(timer)
              return;
             }
            
            clearTimeout(timer)
            if (carrinhos.get(`${c.id}.status`) == 'Gerenciando') {
              try {
                await c.delete()
                carrinhos.delete(c.id)
                interaction.user.send({
                  embeds: [new EmbedBuilder()
                    .setTitle(`${interaction.client.user.username} | Compra Cancelada`)
                    .setDescription(`Olá **${interaction.user},**\n\n• A sua compra foi cancelada por **inatividade**, e todos os produtos foram devolvidos para o estoque. Você pode voltar a comprar quando quiser!`)
                    .setColor("Red")
                   ]
                })
              } catch (error) {
                return;
              }
            }
          }, 300000)
          
          c.send({
            embeds: [new EmbedBuilder()
               .setTitle(`${interaction.client.user.username} | Sistema de Compra`)
               .setDescription(`${emoji.get(`aviso`)} | Olá ${interaction.user}, este é seu carrinho, fique à vontade para adicionar mais produtos ou fazer as modificações que achar necessário.\n\n${emoji.get(`sirene`)} | Lembre-se de ler nossos termos de compra, para não ter nenhum problema futuramente, ao continuar com a compra, você concorda com nossos termos.\n\n${emoji.get(`sino`)} | Quando estiver tudo pronto aperte o botão abaixo, para continuar com sua compra!`)
               .setColor(General.get(`color.padrao`))
               .setFooter({ text: `${interaction.client.user.username} - Todos os direitos reservados.` })
             ],
            components: [new ActionRowBuilder()
               .addComponents(
                  new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_continuarcompra`)
                   .setLabel('Aceitar e Continuar')
                   .setEmoji(`1136612206155407470`)
                   .setStyle(3),
                  new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_cancelarcompra`)
                   .setLabel('Cancelar')
                   .setEmoji(`1136612240217346092`)
                   .setStyle(4),
                  new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_lertermos`)
                   .setLabel('Ler Os Termos')
                   .setEmoji('📋')
                   .setStyle(3),
                )
             ]
          })
          
          c.send({
            embeds: [new EmbedBuilder()
               .setDescription(`${emoji.get(`produto`)} | Produto: \`${product.nome}\`\n\n${emoji.get(`caixa`)} | Quantidade: \`1\`\n\n${emoji.get(`preco`)} | Valor: \`${Number(product.preco).toFixed(2)}\`\n\n${emoji.get(`desc`)} | Quantidade disponível: \`${product.estoque.length}\``)
                .setColor(General.get(`color.padrao`))
             ],
            components: [new ActionRowBuilder()
               .addComponents(
                  new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_addboton`)
                   .setLabel('+')
                   .setStyle(2),
                  new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_lapisadd`)
                   .setEmoji('✏️')
                   .setStyle(3),
                  new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_removproduct`)
                   .setLabel('-')
                   .setStyle(2),
                  new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_delprod`)
                   .setEmoji('1179008431781314670')
                   .setStyle(4),
               )
             ]
          })
        })
     }
     
     if (interaction.customId.endsWith("_addboton")) {
       const user = interaction.customId.split("_")[0]
       const product = interaction.customId.split("_")[1]
       if (interaction.user.id != user) return interaction.deferUpdate()
       
       if (carrinhos.get(`${interaction.channel.id}.${product}.quantidade`) >= produto.get(`${product}.estoque`).length) return interaction.reply({ content: `${emoji.get(`emojix`)} | Você não pode adicionar mais produtos.`, ephemeral: true })
       
       const u = carrinhos.get(interaction.channel.id)
       const preco = (parseFloat(Number(produto.get(`${product}.preco`)) + Number(carrinhos.get(`${interaction.channel.id}.${product}.valor`)))).toFixed(2)
       carrinhos.add(`${interaction.channel.id}.${product}.quantidade`, 1)
       carrinhos.set(`${interaction.channel.id}.${product}.valor`, preco)
       
       interaction.update({
         embeds: [new EmbedBuilder()
            .setDescription(`${emoji.get(`produto`)} | Produto: \`${carrinhos.get(`${interaction.channel.id}.${product}.nome`)}\`\n\n${emoji.get(`caixa`)} | Quantidade: \`${carrinhos.get(`${interaction.channel.id}.${product}.quantidade`)}\`\n\n${emoji.get(`preco`)} | Valor: \`${Number(carrinhos.get(`${interaction.channel.id}.${product}.valor`)).toFixed(2)}\`\n\n${emoji.get(`desc`)} | Quantidade disponível: \`${produto.get(`${product}.estoque`).length}\``)
            .setColor(General.get(`color.padrao`))
          ]
       })
     }
     
     if (interaction.customId.endsWith("_removproduct")) {
       const user = interaction.customId.split("_")[0]
       const product = interaction.customId.split("_")[1]
       if (interaction.user.id != user) return interaction.deferUpdate()
       
       if (carrinhos.get(`${interaction.channel.id}.${product}.quantidade`) <= 1) return interaction.reply({ content: `${emoji.get(`emojix`)} | Você não pode remover mais produtos.`, ephemeral: true })
       
       const u = carrinhos.get(interaction.channel.id)
       const preco = (parseFloat(Number(carrinhos.get(`${interaction.channel.id}.${product}.valor`)) - Number(produto.get(`${product}.preco`)))).toFixed(2)
       carrinhos.set(`${interaction.channel.id}.${product}.quantidade`, carrinhos.get(`${interaction.channel.id}.${product}.quantidade`) - 1)
       carrinhos.set(`${interaction.channel.id}.${product}.valor`, preco)
       
       interaction.update({
         embeds: [new EmbedBuilder()
            .setDescription(`${emoji.get(`produto`)} | Produto: \`${carrinhos.get(`${interaction.channel.id}.${product}.nome`)}\`\n\n${emoji.get(`caixa`)} | Quantidade: \`${carrinhos.get(`${interaction.channel.id}.${product}.quantidade`)}\`\n\n${emoji.get(`preco`)} | Valor: \`${Number(carrinhos.get(`${interaction.channel.id}.${product}.valor`)).toFixed(2)}\`\n\n${emoji.get(`desc`)} | Quantidade disponível: \`${produto.get(`${product}.estoque`).length}\``)
            .setColor(General.get(`color.padrao`))
          ]
       })
     }
     
     if (interaction.customId.endsWith("_lapisadd")) {
       const user = interaction.customId.split("_")[0]
       const product = interaction.customId.split("_")[1]
       if (interaction.user.id != user) return interaction.deferUpdate()
       
       const modal = new ModalBuilder()
       .setCustomId(`${interaction.user.id}_${product}_modallapis`)
       .setTitle(`✏️ | Editar Quantidade - ${product}`)
       
       const text = new TextInputBuilder()
       .setCustomId('quantity')
       .setLabel('Quantidade')
       .setPlaceholder('Exemplo: 2')
       .setRequired(true)
       .setStyle(1)
       
       modal.addComponents(new ActionRowBuilder().addComponents(text))
       
       interaction.showModal(modal)
     }
     
     if (interaction.customId.endsWith("_continuarcompra")) {
       interaction.deferUpdate()
       const user = interaction.customId.split("_")[0]
       const ide = interaction.customId.split("_")[1]
       if (interaction.user.id != user) return
       await interaction.channel.bulkDelete(10)
       
       carrinhos.set(`${interaction.channel.id}.addprodutos`, `nao`)
       carrinhos.set(`${interaction.channel.id}.status`, `Gerenciando (2)`)
       
       const timer = setTimeout(async () => {
         if (!interaction.guild.channels.cache.find(c => c.topic == `compra-${interaction.user.id}`)) {
           clearTimeout(timer)
           return;
         }
         
         clearTimeout(timer)
         if (carrinhos.get(`${interaction.channel.id}.status`) == 'Gerenciando (2)') {
           try {
             await interaction.channel.delete()
             carrinhos.delete(interaction.channel.id)
             interaction.user.send({
               embeds: [new EmbedBuilder()
                 .setTitle(`${interaction.client.user.username} | Compra Cancelada`)
                 .setDescription(`Olá **${interaction.user},**\n\n• A sua compra foi cancelada por **inatividade**, e todos os produtos foram devolvidos para o estoque. Você pode voltar a comprar quando quiser!`)
                 .setColor("Red")
                ]
             })
           } catch (error) {
              return;
           }
          }
        }, 300000)
        
        const carprodutosObject = carrinhos.get(interaction.channel.id) || {};
        const products = carprodutosObject.produtos.map(productKey => {
          const product = carprodutosObject[productKey];
          return `${emoji.get(`produto`)} | Produto: \`${product.nome}\`\n${emoji.get(`preco`)} | Valor unitário: \`R$${Number(produto.get(`${product.ID}.preco`)).toFixed(2)}\`\n${emoji.get(`caixa`)} | Quantidade: \`${product.quantidade}\`\n${emoji.get(`preco`)} | Total: \`R$${Number(product.valor).toFixed(2)}\`\n\n`;
        }).join('');
        
        const totalValor = Object.values(carrinhos.get(interaction.channel.id)).reduce((acc, product) => {
          const productValue = parseFloat(product.valor);
          return isNaN(productValue) ? acc : acc + productValue;
        }, 0);
        
        carrinhos.set(`${interaction.channel.id}.preco`, totalValor)
        interaction.channel.send({
          embeds: [new EmbedBuilder()
             .setTitle(`${interaction.client.user.username} | Resumo da Compra`)
             .setDescription(`${products}\n${emoji.get(`caixa`)} **| Produtos no Carrinho:** \`${carrinhos.get(`${interaction.channel.id}.produtos`).length}\`\n${emoji.get(`preco`)} **| Valor a Pagar:** \`R$${Number(totalValor).toFixed(2)}\`\n${emoji.get(`presente`)} **| Cupom adicionado:** \`Sem cupom.\``)
             .setColor(General.get(`color.padrao`))
           ],
          components: [new ActionRowBuilder()
             .addComponents(
                new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_${ide}_irparaopayment`)
                  .setLabel('Ir Para o Pagamento')
                  .setEmoji(`1136612206155407470`)
                  .setStyle(3),
                new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_${ide}_addcupom`)
                  .setLabel('Adicionar Cupom de Desconto')
                  .setEmoji('🏷️')
                  .setStyle(1),
                new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_${ide}_cancelarcompra`)
                  .setLabel('Cancelar Compra')
                  .setEmoji(`1136612240217346092`)
                  .setStyle(4),
             )
           ]
        })
     }
     
     if (interaction.customId.endsWith("_addcupom")) {
       const user = interaction.customId.split("_")[0]
       const ide = interaction.customId.split("_")[1]
       if (interaction.user.id != user) return interaction.deferUpdate()
       
       const modal = new ModalBuilder()
       .setCustomId(`${ide}_modaladdcupom`)
       .setTitle('Adicionar Cupom')
       
       const text = new TextInputBuilder()
       .setCustomId('cupom')
       .setLabel('NOME DO CUPOM?')
       .setRequired(true)
       .setStyle(1)
       
       modal.addComponents(new ActionRowBuilder().addComponents(text))
       
       interaction.showModal(modal)
     }
     
     if (interaction.customId.endsWith("_irparaopayment")) {
       interaction.deferUpdate()
       const user = interaction.customId.split("_")[0]
       const ide = interaction.customId.split("_")[1]
       if (interaction.user.id != user) return
       
       if (General.get(`paymentauto.pix`) == "ON") {
         carrinhos.set(`${interaction.channel.id}.status`, `Pagando`)
       
       const timer = setTimeout(async () => {
         if (!interaction.guild.channels.cache.find(c => c.topic == `compra-${interaction.user.id}`)) {
           clearTimeout(timer)
           return;
         }
         
         clearTimeout(timer)
         if (carrinhos.get(`${interaction.channel.id}.status`) == 'Pagando') {
           try {
             await interaction.channel.delete()
             carrinhos.delete(interaction.channel.id)
             interaction.user.send({
               embeds: [new EmbedBuilder()
                 .setTitle(`${interaction.client.user.username} | Compra Cancelada`)
                 .setDescription(`Olá **${interaction.user},**\n\n• A sua compra foi cancelada por **inatividade**, e todos os produtos foram devolvidos para o estoque. Você pode voltar a comprar quando quiser!`)
                 .setColor("Red")
                ]
             })
           } catch (error) {
              return;
           }
          }
        }, 300000)
        
        const carprodutosObject = carrinhos.get(interaction.channel.id) || {};
   
        const products = carprodutosObject.produtos.map(productKey => {
          
          const product = carprodutosObject[productKey];
          if (product && product.nome && product.quantidade) {
            return `${product.nome} x${product.quantidade}\n`;
          }
        }).join('')
        
        interaction.message.edit({
          embeds: [new EmbedBuilder()
             .setTitle(`${interaction.client.user.username} | Sistema de pagamento`)
             .setDescription(`\`\`\`Escolha a forma de pagamento.\`\`\`\n${emoji.get(`produto`)} **| Produto(s)**:\n${products}${emoji.get(`preco`)} **| Valor:**\nR$${Number(carrinhos.get(`${interaction.channel.id}.preco`)).toFixed(2)}`)
             .setColor(General.get(`color.padrao`))
             .setFooter({ text: `Escolha a forma de pagamento utilizando os botões abaixo:` })
           ],
          components: [new ActionRowBuilder()
             .addComponents(
                new ButtonBuilder()
                 .setCustomId(`${interaction.user.id}_pagarpix`)
                 .setLabel('Pix')
                 .setEmoji(`1158901133692117022`)
                 .setDisabled(General.get(`paymentauto.pix`) == 'OFF')
                 .setStyle(1),
                new ButtonBuilder()
                 .setCustomId(`${interaction.user.id}_pagarsaldo`)
                 .setLabel('Saldo')
                 .setEmoji('💰')
                 .setDisabled(General.get(`saldo.saldo`) == 'OFF')
                 .setStyle(1),
                new ButtonBuilder()
                 .setCustomId(`${interaction.user.id}_pagarsite`)
                 .setLabel('Pagar no Site')
                 .setEmoji(`1136636593592090634`)
                 .setDisabled(General.get(`paymentauto.pagarsite`) == 'OFF')
                 .setStyle(1),
                new ButtonBuilder()
                 .setCustomId(`${interaction.user.id}_${ide}_cancelarcompra`)
                 .setEmoji(`1136612240217346092`)
                 .setStyle(4),
             )
           ]
        })       
       } else if (General.get(`paymentsemi.pix`) == "ON") {
         const member = interaction.guild.members.cache.get(interaction.user.id)
         interaction.channel.permissionOverwrites.edit(member, { ViewChannel: true, SendMessages: true, AttachFiles: true })
         
         const carprodutosObject = carrinhos.get(interaction.channel.id) || {};
         
         const products = carprodutosObject.produtos.map(productKey => {
           const product = carprodutosObject[productKey];
           if (product && product.nome && product.quantidade) {
             return `${product.nome} x${product.quantidade}\n`;
           }
         }).join('')
         
         interaction.message.edit({
           embeds: [new EmbedBuilder()
              .setTitle(`${interaction.client.user.username} | Sistema de pagamento`)
              .setDescription(`\`\`\`Efetue o pagamento utilizando utilizando a Chave Pix ou Qr Code.\`\`\`\n${emoji.get(`produto`)} **| Produto(s):**\n${products}${emoji.get(`preco`)} **| Valor:**\nR$${Number(carrinhos.get(`${interaction.channel.id}.preco`)).toFixed(2)}`)
              .setColor(General.get(`color.padrao`))
              .setFooter({ text: `Após efetuar o pagamento, mande o comprovante, e aguarde a verificação.`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
            ],
           components: [new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                 .setCustomId(`chavepixsemi`)
                 .setLabel('Chave Pix')
                 .setEmoji(`1158901133692117022`)
                 .setStyle(1),
                new ButtonBuilder()
                 .setCustomId(`qrcodesemi`)
                 .setLabel('Qr Code')
                 .setEmoji(`1141320238361747526`)
                 .setStyle(1),
                new ButtonBuilder()
                 .setCustomId(`aprovarcompra`)
                 .setLabel('Aprovar Compra')
                 .setEmoji(`1136612206155407470`)
                 .setStyle(3),
                new ButtonBuilder()
                 .setCustomId(`${interaction.user.id}_${ide}_cancelarcompra`)
                 .setEmoji(`1136612240217346092`)
                 .setStyle(4),
              )
            ]
         })
       }
     }
     
     if (interaction.customId.startsWith("chavepixsemi")) {
       await interaction.reply({
         embeds: [new EmbedBuilder()
            .setTitle('Chave Pix')
            .addFields(
              { name: `${emoji.get(`chave`)} | Tipo da Chave:`, value: `${General.get(`paymentsemi.tipochave`) || "Não configurado"}`, inline: false },
              { name: `${emoji.get(`link`)} | Chave Pix:`, value: `${General.get(`paymentsemi.chavepix`) || "Não configurado"}`, inline: false }
            )
            .setColor(General.get(`color.padrao`))
            .setFooter({ text: `${interaction.client.user.username} - Todos os direitos reservados.`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
            .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }))
           ],
           ephemeral: true
       })
     }
     
     if (interaction.customId.startsWith("qrcodesemi")) {
       if (!General.get(`paymentsemi.qrcode`).startsWith("https://")) return interaction.reply({ content: `${emoji.get(`alerta`)} | Qr Code mal configurado!`, ephemeral: true })
       
       await interaction.reply({
         embeds: [new EmbedBuilder()
            .setTitle('Qr Code')
            .setImage(General.get(`paymentsemi.qrcode`))
            .setColor(General.get(`color.padrao`))
          ],
         ephemeral: true
       })
     }
     
     if (interaction.customId.startsWith("aprovarcompra")) {
       if (!perms.has(interaction.user.id)) return interaction.reply({
         embeds: [new EmbedBuilder()
           .setDescription(`${emoji.get(`alerta`)} | Você não possui permissão para aprovar essa compra!`)
           .setColor("Red")
         ],
         ephemeral: true
       })
       
       interaction.deferUpdate()
       carrinhos.set(`${interaction.channel.id}.status`, `Pago`)
       carrinhos.set(`${interaction.channel.id}.pagamento`, `Aprovação manual`)
       
       compraAprovada()
     }
     
     if (interaction.customId.endsWith("_pagarpix")) {
       interaction.deferUpdate()
       if (interaction.user.id != interaction.customId.split("_")[0]) return
       carrinhos.set(`${interaction.channel.id}.status`, `Pagando com pix`)
       
       const msg = await interaction.message.edit({ content: `${emoji.get(`carregando`)} | Gerando pagamento...`, embeds: [], components: [] })
       
       const timer = setTimeout(async () => {
         if (!interaction.guild.channels.cache.find(c => c.topic == `compra-${interaction.user.id}`)) {
           clearTimeout(timer)
           return
         }
         
           try {
             await interaction.channel.delete()
             carrinhos.delete(interaction.channel.id)
             interaction.user.send({
               embeds: [new EmbedBuilder()
                 .setTitle(`${interaction.client.user.username} | Compra Cancelada`)
                 .setDescription(`Olá **${interaction.user},**\n\n• A sua compra foi cancelada por **inatividade**, e todos os produtos foram devolvidos para o estoque. Você pode voltar a comprar quando quiser!`)
                 .setColor("Red")
                ]
             })
           } catch (error) {
              return;
           }
        }, General.get(`paymentauto.tempopagar`) * 60 * 1000)
        
        const carprodutosObject = carrinhos.get(interaction.channel.id) || {};
        
        const products = carprodutosObject.produtos.map(productKey => {
          const product = carprodutosObject[productKey];
          if (product && product.nome && product.quantidade) {
            return `${product.nome} x${product.quantidade}\n`;
          }
        }).join('')
        
        const mpLogin = new MercadoPagoConfig({ accessToken: General.get(`paymentauto.access_token`) })
        const payment = new Payment(mpLogin)
        
        // Obter URL do webhook (configurar no servidor ou usar serviço externo)
        const webhookUrl = General.get(`paymentauto.webhook_url`) || "";
        
        const paymentData = {
          transaction_amount: Number(carrinhos.get(`${interaction.channel.id}.preco`)),
          description: `Compra Produto - ${interaction.user.username} - Canal:${interaction.channel.id}`,
          payment_method_id: "pix",
          payer: {
            email: "cliente@gmail.com"
          },
          // Adicionar URL de notificação para webhook
          ...(webhookUrl ? { notification_url: webhookUrl } : {})
        }
        
        try {
        const data = await payment.create({ body: paymentData })
        
        const buffer = Buffer.from(data.point_of_interaction.transaction_data.qr_code_base64, 'base64');
        const attachment = new AttachmentBuilder(buffer, "payment.png");
        
        let agora = new Date();
        agora.setMinutes(agora.getMinutes() + Number(General.get(`paymentauto.tempopagar`)))
        const time = Math.floor(agora.getTime() / 1000);
        
        const row = new ActionRowBuilder()
         .addComponents(
            new ButtonBuilder()
             .setCustomId(`pixcpc`)
             .setLabel('Pix Copia e Cola')
             .setEmoji(`1158901133692117022`)
             .setStyle(1),
            new ButtonBuilder()
             .setCustomId(`qrcodepix`)
             .setLabel('Qr Code')
             .setEmoji(`1141320238361747526`)
             .setStyle(1),
            new ButtonBuilder()
             .setCustomId(`verifypayment`)
             .setLabel('Verificar o Pagamento')
             .setEmoji(`1136612206155407470`)
             .setStyle(3),
            new ButtonBuilder()
             .setCustomId(`${interaction.user.id}_a_cancelarcompra`)
             .setEmoji(`1136612240217346092`)
             .setStyle(4),
         )
         
        const userid = interaction.user.id;
        
        msg.edit({
          content: ``,
          embeds: [new EmbedBuilder()
             .setTitle(`${interaction.client.user.username} | Sistema de pagamento`)
             .setDescription(`\`\`\`Pague com pix para receber o produto.\`\`\`\n${emoji.get(`produto`)} **| Produto(s):**\n${products}${emoji.get(`preco`)} **| Valor:**\nR$${Number(carrinhos.get(`${interaction.channel.id}.preco`)).toFixed(2)}\n${emoji.get(`lupa`)} | Pagamento expira em:\n<t:${time}:f> (<t:${time}:R>)`)
             .setFooter({ text: `Após efetuar o pagamento, clique no botão para eu verificar se o pagamento foi aprovado!` })
             .setColor(General.get(`color.padrao`))
           ],
          components: [row]
        })
        
        const interação = msg.createMessageComponentCollector({ componentType: ComponentType.Button, });
        interação.on("collect", async (interaction) => {
         if (interaction.user.id != interaction.user.id) {
              return;
         }
         
         if (interaction.customId == 'pixcpc') {
           if (interaction.user.id != userid) return interaction.deferUpdate()
           
           await interaction.reply({ content: `${data.point_of_interaction.transaction_data.qr_code}`, ephemeral: true })
         }
         
         if (interaction.customId == 'qrcodepix') {
           if (interaction.user.id != userid) return interaction.deferUpdate()
           
           await interaction.reply({
                files: [attachment],
                ephemeral: true 
           });
         }
         
         if (interaction.customId == 'verifypayment') {
           if (interaction.user.id != userid) return interaction.deferUpdate()
           
           const msg2 = await interaction.deferReply({ content: `...`, ephemeral: true })
           
           const infoPayment = await payment.get({ id: data.id })
           
               if (infoPayment.status == 'approved') {
                 const resposta = await axios.get(`https://api.mercadopago.com/v1/payments/${data.id}`, {
                   headers: {
                     Authorization: `Bearer ${General.get(`paymentauto.access_token`)}`,
                   },
                 })
                 
                 if (!General.has('bancos_bloqueados')) General.set('bancos_bloqueados.nenhum', 'nenhum')
                 
                 const bancos_bloqueado = General.get(`bancos_bloqueados`) || {};
                 
                 const longName = resposta.data.point_of_interaction.transaction_data.bank_info.payer.long_name.toLowerCase()
                 
                 const encontrado = Object.keys(bancos_bloqueado).some(banco => longName.includes(banco.toLowerCase()))
                 
                 if (encontrado) {
                   interaction.message.edit({
                     embeds: [new EmbedBuilder()
                       .setAuthor({name: `Pedido #${interaction.channel.id}`})
                       .setTitle('Pedido não aprovado')
                       .setDescription(`Esse servidor não está aceitando pagamentos desta instituição \`${resposta.data.point_of_interaction.transaction_data.bank_info.payer.long_name},\` seu dinheiro foi reembolsado, tente novamente usando outro banco.`)
                       .setColor("#f50000")
                     ],
                     components: []
                   })
                   
                   const refund = new PaymentRefund(mpLogin)
                   
                   refund.create({ payment_id: data.id }).then(console.log).catch(console.log)
                   
                   setTimeout(async () => {
                     try {
                       await interaction.channel.delete()
                       carrinhos.delete(interaction.channel.id)
                     } catch (error) {
                       return;
                     }
                   }, 30000)
                   
                   return;
                 }
                 
                 carrinhos.set(`${interaction.channel.id}.status`, `Pago`)
                 compraAprovada()
                 msg2.edit({ content: `${emoji.get(`certo`)} Pagamento aprovado!`, ephemeral: true })
                 clearTimeout(timer)
                 carrinhos.set(`${interaction.channel.id}.idreembolso`, data.id)
               } else {
                 row.components[2].setDisabled(true)
                 msg2.edit({ content: `${emoji.get(`lupa`)} | Pagamento pendente!`, ephemeral: true })
                 msg.edit({ components: [row] })
                 setTimeout(() => {
                   row.components[2].setDisabled(false)
                   msg.edit({ components: [row] })
                 }, 10000)
               }
         }
         
         const checkPay = setInterval(() => {
           if (!interaction.guild.channels.cache.find(c => c.topic == `compra-${interaction.user.id}`)) {
             clearTimeout(timer)
             clearInterval(checkPay)
             return
           }
           
           if (carrinhos.get(`${interaction.channel.id}.status`) == `aprovado`) {
             clearTimeout(timer)
             clearInterval(checkPay)
             compraAprovada()
           }
         }, 2000)
        })
        } catch (error) {
          msg.edit({ content: `${emoji.get(`alerta`)} | Erro ao gerar o pagamento!\n${emoji.get(`emojix`)} | Error: \`${error.message || error.toString() || "Erro desconhecido"}\`` })
        }
     }
     
     if (interaction.customId.endsWith("_pagarsite")) {
       interaction.deferUpdate()
       if (interaction.user.id != interaction.customId.split("_")[0]) return
       carrinhos.set(`${interaction.channel.id}.status`, `Pagando com site`)
       
       const msg = await interaction.message.edit({ content: `${emoji.get(`carregando`)} | Gerando pagamento...`, embeds: [], components: [] })
       
       const timer = setTimeout(async () => {
         if (!interaction.guild.channels.cache.find(c => c.topic == `compra-${interaction.user.id}`)) {
           clearTimeout(timer)
           return
         }
         
           try {
             await interaction.channel.delete()
             carrinhos.delete(interaction.channel.id)
             interaction.user.send({
               embeds: [new EmbedBuilder()
                 .setTitle(`${interaction.client.user.username} | Compra Cancelada`)
                 .setDescription(`Olá **${interaction.user},**\n\n• A sua compra foi cancelada por **inatividade**, e todos os produtos foram devolvidos para o estoque. Você pode voltar a comprar quando quiser!`)
                 .setColor("Red")
                ]
             })
           } catch (error) {
              return;
           }
       }, General.get(`paymentauto.tempopagar`) * 60 * 1000)
       
       const carprodutosObject = carrinhos.get(interaction.channel.id) || {};
       
       const products = carprodutosObject.produtos.map(productKey => {
          const product = carprodutosObject[productKey];
          if (product && product.nome && product.quantidade) {
            return `${product.nome} x${product.quantidade}\n`;
          }
       }).join('')
       
       const mpLogin = new MercadoPagoConfig({ accessToken: General.get(`paymentauto.access_token`) })
       const mpPreference = new Preference(mpLogin)
       const mpMerchantOrder = new MerchantOrder(mpLogin)
       
       const paymentPreference = {
         items: [
           {
             id: 'Compra',
             title: `Comprar Produto - ${interaction.user.username} - ${interaction.user.id}`,
             picture_url: client.user.avatarURL(),
             quantity: 1,
             currency_id: `BRL`,
             unit_price: Number(carrinhos.get(`${interaction.channel.id}.preco`))
           }
         ],
         back_urls: {
           success: `https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}`,
           pending: `https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}`,
           failure: `https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}`
         },
         auto_return: 'approved',
         payer: {
           email: 'hxwxlindo@gmail.com'
         }
       }
       
       try {
         const data = await mpPreference.create({ body: paymentPreference })
         
         let agora = new Date();
         agora.setMinutes(agora.getMinutes() + Number(General.get(`paymentauto.tempopagar`)))
         const time = Math.floor(agora.getTime() / 1000);
         
         await msg.edit({
          content: ``,
          embeds: [new EmbedBuilder()
             .setTitle(`${interaction.client.user.username} | Sistema de pagamento`)
             .setDescription(`\`\`\`Pague com pix para receber o produto.\`\`\`\n${emoji.get(`produto`)} **| Produto(s):**\n${products}${emoji.get(`preco`)} **| Valor:**\nR$${Number(carrinhos.get(`${interaction.channel.id}.preco`)).toFixed(2)}\n${emoji.get(`lupa`)} | Pagamento expira em:\n<t:${time}:f> (<t:${time}:R>)`)
             .setFooter({ text: `Após efetuar o pagamento, o tempo de entrega é de no máximo 1 minuto!` })
             .setColor(General.get(`color.padrao`))
           ],
          components: [new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
               .setLabel('Realizar o Pagamento')
               .setEmoji(`1136636593592090634`)
               .setURL(data.init_point)
               .setStyle(5),
              new ButtonBuilder()
               .setCustomId(`${interaction.user.id}_a_cancelarcompra`)
               .setLabel('Cancelar')
               .setEmoji(`1136612240217346092`)
               .setStyle(4),
            )
          ]
        })
        
        const paymentStatus = setInterval(async () => {
          const buscarPreference = await mpMerchantOrder.search({ options: { preference_id: data.id } })
          
          const preferenceElements = buscarPreference.elements
          
          if (preferenceElements == null) {
            return;
          } else {
            const preferenceStatus = preferenceElements[0].payments[0].status
            
            carrinhos.set(`${interaction.channel.send}.idreembolso`, preferenceElements[0].payments[0].id)
            
            if (preferenceStatus == "approved") {
              clearInterval(paymentStatus)
              compraAprovada()
            }
          }
        }, 2000)
        
        const checkPay = setInterval(() => {
           if (!interaction.guild.channels.cache.find(c => c.topic == `compra-${interaction.user.id}`)) {
             clearTimeout(timer)
             clearInterval(paymentStatus)
             clearInterval(checkPay)
             return
           }
           
           if (carrinhos.get(`${interaction.channel.id}.status`) == `aprovado`) {
             clearTimeout(timer)
             clearInterval(checkPay)
             clearInterval(paymentStatus)
             compraAprovada()
           }
         }, 2000)
       } catch (error) {
         msg.edit({ content: `${emoji.get(`alerta`)} | Erro ao gerar o pagamento!\n${emoji.get(`emojix`)} | Error: \`${error.message || error.toString() || "Erro desconhecido"}\`` })
       }
     }
     
     if (interaction.customId.endsWith("_pagarsaldo")) {
       interaction.deferUpdate()
       if (interaction.user.id != interaction.customId.split("_")[0]) return
       
       if (Number(saldo.get(interaction.user.id)) < Number(carrinhos.get(`${interaction.channel.id}.preco`))) {
         const msg = await interaction.channel.send(`${emoji.get(`emojix`)} | Você não tem saldo suficiente para realizar essa compra. Seu saldo: \`R$${Number(saldo.get(interaction.user.id)).toFixed(2)}\`, valor da compra: \`R$${Number(carrinhos.get(`${interaction.channel.id}.preco`)).toFixed(2)}\``)
         
         interaction.message.edit({
           components: [new ActionRowBuilder()
              .addComponents(
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_pagarpix`)
                  .setLabel('Pix')
                  .setEmoji(`1158901133692117022`)
                  .setDisabled(General.get(`paymentauto.pix`) == 'OFF')
                     .setStyle(1),
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_pagarsaldo`)
                   .setLabel('Saldo')
                   .setEmoji('💰')
                   .setDisabled(true)
                   .setStyle(1),
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_pagarsite`)
                   .setLabel('Pagar no Site')
                   .setEmoji(`1136636593592090634`)
                   .setDisabled(General.get(`paymentauto.pagarsite`) == 'OFF')
                   .setStyle(1),
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_a_cancelarcompra`)
                   .setEmoji(`1136612240217346092`)
                   .setStyle(4),
              )
            ]
         })
         
         setTimeout(async () => {
           try {
             await msg.delete()
           } catch (error) {
             return
           }
         }, 4000)
         return;
       }
       
       const carprodutosObject = carrinhos.get(interaction.channel.id) || {};
       
       const products = carprodutosObject.produtos.map(productKey => {
         const product = carprodutosObject[productKey];
         if (product && product.nome && product.quantidade) {
           return `${product.nome} x${product.quantidade}, `;
         }
       }).join('')
       
       interaction.message.edit({
         embeds: [new EmbedBuilder()
            .setTitle(`${interaction.client.user.username} | Sistema de pagamento`)
            .setDescription(`${emoji.get(`seta`)} - **Você deseja efetuar o pagamento** de \`${products}\` no valor de \`R$${Number(carrinhos.get(`${interaction.channel.id}.preco`))}\` utilizando seu saldo de \`R$${Number(saldo.get(interaction.user.id)).toFixed(2)}\`?`)
            .setColor(General.get(`color.padrao`))
            .setFooter({ text: `Após efetuar o pagamento, o tempo de entrega é de no maximo 1 minuto!` })
          ],
         components: [new ActionRowBuilder()
            .addComponents(
               new ButtonBuilder()
                 .setCustomId(`${interaction.user.id}_confirmarsaldo`)
                 .setLabel('Confirmar')
                 .setEmoji(`1136612206155407470`)
                 .setStyle(3),
               new ButtonBuilder()
                 .setCustomId(`${interaction.user.id}_irparaopayment`)
                 .setEmoji(`⬅️`)
                 .setStyle(3),
            )
          ]
       })    
     }
     
     if (interaction.customId.endsWith("_confirmarsaldo")) {
       interaction.deferUpdate()
       if (interaction.user.id != interaction.customId.split("_")[0]) return
       
       carrinhos.set(`${interaction.channel.id}.status`, `Pago`)
       carrinhos.get(`${interaction.channel.id}.pagamento`, `Saldo`)
       saldo.set(interaction.user.id, saldo.get(interaction.user.id) - Number(carrinhos.get(`${interaction.channel.id}.preco`)))
       compraAprovada()
     }
     
     async function compraAprovada() {
       
       const carprodutosObject = carrinhos.get(interaction.channel.id) || {};
       
       const products = carprodutosObject.produtos.map(productKey => {
         const product = carprodutosObject[productKey];
         if (product && product.nome && product.quantidade) {
           return `${product.nome} x${product.quantidade}\n`;
         }
       }).join('') 
       
       const member = interaction.guild.members.cache.get(carrinhos.get(`${interaction.channel.id}.user`))
       
       const embedentrega = new EmbedBuilder()
        .setTitle(`${emoji.get(`sorteio`)} ${interaction.client.user.username} | Compra Aprovada ${emoji.get(`sorteio`)}`)
        .addFields(
          { name: `${emoji.get(`carrinho`)} | Produto(s) Comprado(s):`, value: `${products}`, inline: false },
          { name: `${emoji.get(`raio`)} | Id da Compra:`, value: `${interaction.channel.id}`, inline: false },
          { name: `${emoji.get(`coracao`)} | Muito obrigado por comprar conosco,`, value: `**${interaction.guild.name} Agradece sua preferência!**`, inline: false }
         )
         .setColor(General.get(`color.padrao`))
         .setFooter({ text: `Seu(s) Produto(s):` })
         
         if (General.get(`images.banner`) != "") embedentrega.setImage(General.get(`images.banner`))
         if (General.get(`images.thumbnail`) != "") embedentrega.setThumbnail(General.get(`images.thumbnail`))
       
       try {
         const dm = await member.send({ embeds: [embedentrega] })
         
         interaction.message.edit({
           content: `${emoji.get(`certo`)} | Pagamento Aprovado\n${emoji.get(`seta`)} | ID da Compra: ${interaction.channel.id}`,
           embeds: [new EmbedBuilder()
               .setTitle(`${emoji.get(`sorteio`)} ${interaction.client.user.username} | Pagamento Aprovado ${emoji.get(`sorteio`)}`)
               .setDescription(`${interaction.guild.members.cache.get(carrinhos.get(`${interaction.channel.id}.user`))} **Pagamento aprovado verifique sua Dm**`)
               .setColor(General.get(`color.padrao`))
             ],
            components: [new ActionRowBuilder()
               .addComponents(
                 new ButtonBuilder()
                  .setLabel('Atalho para DM')
                  .setURL(dm.url)
                  .setStyle(5)
               )
             ]
         })
       } catch (error) {
         await interaction.channel.bulkDelete(10)
         interaction.channel.send({ content: `${emoji.get(`certo`)} | Pagamento Aprovado\n${emoji.get(`seta`)} | ID da Compra: ${interaction.channel.id}`, })
         interaction.channel.send({
           embeds: [new EmbedBuilder()
              .setDescription(`Olá ${interaction.user}, seu produto não foi enviado na sua dm pois você está com a DM fechada!\n**Aqui está o seu produto:**`)
              .setColor("Red")
            ]
         })
       }
       
       const carprodutosArray = Object.values(carrinhos.get(interaction.channel.id) || {});
       let entregaText = ""
       let productId = ""
       
       for (const product of carprodutosArray) {
         productId = product.ID;
         if (!productId) continue;
         
         const pegardbstock = produto.get(`${productId}.estoque`);
         if (pegardbstock && pegardbstock.length >= Number(product.quantidade)) {
           const entregue = pegardbstock.splice(0, Number(product.quantidade));
           produto.set(`${productId}.estoque`, pegardbstock);
           
          entregaText += `${emoji.get(`caixa`)} | Entrega do Produto: ${product.nome} - ${entregue.length}/${product.quantidade}\n${entregue.map(item => `${item}`).join('\n')}\n\n`; 
         } else {
           member.send({ content: `${emoji.get(`alerta`)} | Infelizmente alguem comprou o produto: \`${product.nome} x${product.quantidade}\` antes de você.\n**Informe a Staff do servidor**` })
           entregaText += `${emoji.get(`alerta`)} | Falha ao entregar o Produto: ${product.nome}, Quantidade: ${product.quantidade}, Motivo: Estoque do produto esgotado!\n\n`
         }
         
         attembeds()
         rankproduto.add(`${productId}.totalganho`, carrinhos.get(`${interaction.channel.id}.preco`))
         rankproduto.add(`${productId}.totalvendas`, product.quantidade)
         
         rendimentos.add('pedidostotal', 1)
         rendimentos.add('gastostotal', Number(carrinhos.get(`${interaction.channel.id}.preco`)))
         rendimentos.add(`${moment().format('L')}.pedidos`, 1)
         rendimentos.add(`${moment().format('L')}.recebimentos`, Number(carrinhos.get(`${interaction.channel.id}.preco`)))
         
         const role = interaction.guild.roles.cache.get(produto.get(`${productId}.cargo`))
         try {
           await member.roles.add(role)
         } catch (error) {
           //
         }
         
         if (carrinhos.get(`${interaction.channel.id}.cupomutilizado`) != "Nenhum") {
           cupons.set(`${carrinhos.get(`${interaction.channel.id}.cupomutilizado`)}.quantidade`, cupons.get(`${carrinhos.get(`${interaction.channel.id}.cupomutilizado`)}.quantidade`)  - 1)
         }
         
         async function attembeds() {
           const ide = productId
           const u = produto.get(ide)
           let desc = tema.get('embed.desc') || '#{desc}'
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
                 .setCustomId(`${ide}_comprar`)
                 .setLabel(tema.get(`botao.label`))
                 .setEmoji(tema.get(`botao.emoji`))
                 .setStyle(tema.get(`botao.style`))
              )
              
            const channel = interaction.guild.channels.cache.get(produto.get(`${product.ID}.idcanal`))
            
            try {
            const message = await channel.messages.fetch(produto.get(`${product.ID}.idmsg`))
            
            message.edit({ embeds: [embed], components: [row] })
            } catch (error) {
              if (error.code == 10008) {
                //
              }
            }
         }
       }
       
       if (entregaText) {
         carrinhos.push(`${interaction.channel.id}.entregue`, entregaText)
         let quantidadecomprada = 0
         const pasta = `entrega_produto-${interaction.channel.id}.txt`
         const products2 = carprodutosObject.produtos.map(productKey => {
           const product = carprodutosObject[productKey];
           if (product && product.nome && product.quantidade) {
             quantidadecomprada += product.quantidade
             return `${product.quantidade}\n`;
           }
         }).join('')
         
         if (quantidadecomprada >= 5) {
           fs.writeFile(`entrega_produto-${interaction.channel.id}.txt`, entregaText, (err) => {
             if (err) throw err;
           })
           
           member.send({ files: [pasta] }).catch(err => {
             interaction.channel.send({ files: [pasta] })
           })
           
           setTimeout(async () => {
             fs.unlink(pasta, (err) => {
               if (err) console.error(err)
             })
           }, 7000)
         } else {
           member.send(entregaText).catch(err => {
             interaction.channel.send(entregaText)
           })
         }
         
         const canallogs = await interaction.guild.channels.cache.get(General.get(`canais.logs_adm`))
         try {
           await canallogs.send({
             embeds: [new EmbedBuilder()
               .setTitle(`${interaction.client.user.username} | Compra aprovada`)
               .addFields(
                 { name: `${emoji.get(`estrela2`)} | ID DO PEDIDO:`, value: `${interaction.channel.id}`, inline: false },
                 { name: `${emoji.get(`user`)} | COMPRADOR:`, value: `${member} | ${member.id}`, inline: false },
                 { name: `${emoji.get(`id`)} | ID DO COMPRADOR:`, value: `${member.id}`, inline: false },
                 { name: `${emoji.get(`data`)} | DATA:`, value: `<t:${Math.floor(carrinhos.get(`${interaction.channel.id}.data`) / 1000)}:f>(<t:${Math.floor(carrinhos.get(`${interaction.channel.id}.data`) / 1000)}:R>)`, inline: false },
                 { name: `${emoji.get(`produto`)} | PRODUTO(S) ID(S):`, value: `\`${carrinhos.get(`${interaction.channel.id}.produtos`).map(x => `${x}`).join('\n')}\``, inline: false },
                 { name: `${emoji.get(`carrinho`)} | PRODUTO(S) NOME(S):`, value: `${carrinhos.get(`${interaction.channel.id}.produtos`).map(x => produto.get(`${x}.nome`)).join('\n')}`, inline: false },
                 { name: `${emoji.get(`preco`)} | VALOR PAGO:`, value: `\`R$${Number(carrinhos.get(`${interaction.channel.id}.preco`)).toFixed(2)}\``, inline: false },
                 { name: `${emoji.get(`comprimento`)} | MÉTODO DE PAGAMENTO:`, value: `\`${carrinhos.get(`${interaction.channel.id}.pagamento`)}\``, inline: false },
                 { name: `${emoji.get(`saco`)} | CUPOM UTILIZADO:`, value: `${carrinhos.get(`${interaction.channel.id}.cupomutilizado`) == "Nenhum" ? `\`NENHUM CUPOM USADO!\`` : `\`${carrinhos.get(`${interaction.channel.id}.cupomutilizado`)}\``}`, inline: false },
                 { name: `${emoji.get(`presente`)} | VALOR DO DESCONTO:`, value: `\`R$${Number(carrinhos.get(`${interaction.channel.id}.valorcupom`)).toFixed(2)}\``, inline: false },
                 { name: `${emoji.get(`estrela`)} | PRODUTO ENTREGUE:`, value: `\`\`\`${quantidadecomprada >= 10 ? `No arquivo txt` : entregaText}\`\`\``, inline: false }
               )
               .setColor(General.get(`color.padrao`))
               .setFooter({ text: `${interaction.client.user.username} - Todos os direitos reservados.` })
               ],
               components: [new ActionRowBuilder()
                 .addComponents(
                   new ButtonBuilder()
                    .setCustomId(`${interaction.channel.id}_reembolsar`)
                    .setLabel('Reembolsar')
                    .setEmoji(`1136636593592090634`)
                    .setDisabled(carrinhos.get(`${interaction.channel.id}.pagamento`) == 'Aprovação manual' || carrinhos.get(`${interaction.channel.id}.pagamento`) == 'Saldo')
                    .setStyle(2)
                 )
               ]
           })
           
           if (quantidadecomprada >= 10) {
             await canallogs.send({ files: [pasta] })
           }
         } catch (error) {
           //
         }
         
         const role2 = interaction.guild.roles.cache.get(General.get(`canais.cargo_cliente`))
         try {
           await member.roles.add(role2)
         } catch (error) {
           //
         }
         
         const idcanal = interaction.channel.id
         
         const msgav = await member.send({
           embeds: [new EmbedBuilder()
              .setTitle(`${emoji.get(`coracao`)} ${interaction.client.user.username} | Faça uma Avaliação ${emoji.get(`coracao`)}`)
              .setDescription(`**Caso queira, escolha uma nota para a venda:**`)
              .setColor(General.get(`color.padrao`))
            ],
           components: [new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                 .setCustomId(`1_${interaction.channel.id}_estrelas`)
                 .setLabel('1')
                 .setEmoji('⭐')
                 .setStyle(2),
                new ButtonBuilder()
                 .setCustomId(`2_${interaction.channel.id}_estrelas`)
                 .setLabel('2')
                 .setEmoji('⭐')
                 .setStyle(2),
                new ButtonBuilder()
                 .setCustomId(`3_${interaction.channel.id}_estrelas`)
                 .setLabel('3')
                 .setEmoji('⭐')
                 .setStyle(2),
                new ButtonBuilder()
                 .setCustomId(`4_${interaction.channel.id}_estrelas`)
                 .setLabel('4')
                 .setEmoji('⭐')
                 .setStyle(2),
                new ButtonBuilder()
                 .setCustomId(`5_${interaction.channel.id}_estrelas`)
                 .setLabel('5')
                 .setEmoji('⭐')
                 .setStyle(2),
              )
            ]
         }).catch(err => {})
         
         const interação = msgav.createMessageComponentCollector({ componentType: ComponentType.Button, });
         interação.on("collect", async (interaction) => {
           if (member.id != member.id) {
             return;
           }
           
           if (interaction.customId.endsWith("_estrelas")) {
             const modal = new ModalBuilder()
             .setCustomId(`${interaction.customId.split("_")[0]}_${idcanal}_modalavaliar`)
             .setTitle('Avaliação')
             
             const text = new TextInputBuilder()
             .setCustomId(`mensagemavaliativa`)
             .setLabel(`Avaliação - ${transformasNumeroEmEstrelas(interaction.customId.split("_")[0])} (${interaction.customId.split("_")[0]})`)
             .setPlaceholder('Escreva uma breve avaliação aqui.')
             .setRequired(false)
             .setStyle(1)
             
             modal.addComponents(new ActionRowBuilder().addComponents(text))
             
             interaction.showModal(modal)
           }
           
         })
         
         function transformasNumeroEmEstrelas(n) {
           return '⭐'.repeat(n)
         }
         
         carrinhos.set(`${interaction.channel.id}.status`, 'Entregue')
         rank.add(`${member.id}.gastosaprovados`, carrinhos.get(`${interaction.channel.id}.preco`))
         rank.add(`${member.id}.pedidosaprovados`, 1)
          
         setTimeout(async () => {
           try {
             await interaction.channel.delete()
           } catch (error) {
             return;
           }
         }, 120000)
         
         const timerr = setTimeout(async () => {
           if (carrinhos.get(`${idcanal}.avaliou`) == "nao") {
             clearTimeout(timerr)
             msgav.delete().catch(err => {
               if (err.code == 10008) {
                 //
               }
             })
             
             carrinhos.set(`${idcanal}.avaliou`, 'tempoacabaou')
             
             const canalpublico = await interaction.client.channels.fetch(General.get(`canais.logs_publica`))
             
             const embedlogs = new EmbedBuilder()
             .setTitle(`${interaction.client.user.username} | Compra aprovada`)
             .addFields(
               { name: `${emoji.get(`user`)} | COMPRADOR:`, value: `${carrinhos.get(`${idcanal}.username`)} - ${member.id}`, inline: false },
               { name: `${emoji.get(`carrinho`)} | PRODUTO(S) COMPRADO(S):`, value: `${products}`, inline: false },
               { name: `${emoji.get(`preco`)} | VALOR PAGO:`, value: `\`R$${Number(carrinhos.get(`${idcanal}.preco`)).toFixed(2)}\``, inline: false },
               { name: `${emoji.get(`presente`)} | VALOR DE DESCONTO:`, value: `\`R$${Number(carrinhos.get(`${idcanal}.valorcupom`)).toFixed(2)}\``, inline: false },
               { name: `${emoji.get(`data`)} | DATA:`, value: `<t:${Math.floor(carrinhos.get(`${idcanal}.data`) / 1000)}:f>(<t:${Math.floor(carrinhos.get(`${idcanal}.data`) / 1000)}:R>)`, inline: false },
               { name: `${emoji.get(`estrela`)} | Avaliação:`, value: `\`Nenhuma avaliação\``, inline: false }
             )
             .setColor(General.get(`color.padrao`))
             .setFooter({ text: `${interaction.client.user.username} - Todos os direitos reservados.` })
             
             if (General.get(`images.banner`)?.startsWith("https://")) {
               embedlogs.setImage(General.get(`images.banner`))
             }
             
             try {
               await canalpublico.send({
                 content: `${member}`,
                 embeds: [embedlogs]
               })
             } catch (error) {
               return;
             }
           }
         }, 300000)
       
       }

     }
     
     if (interaction.customId.endsWith("_cancelarcompra")) {
       interaction.deferUpdate()
       const user = interaction.customId.split("_")[0]
       const product = interaction.customId.split("_")[1]
       if (interaction.user.id != user) return
       
       const canallogs = interaction.guild.channels.cache.get(General.get(`canais.logs_adm`))
       
       try {
         // Adicionar contador de cancelamentos
         rendimentos.add(`${moment().format('L')}.cancelamentos`, 1)
         rendimentos.add('cancelamentostotal', 1)
         
         await canallogs.send({
           embeds: [new EmbedBuilder()
              .setTitle(`${interaction.client.user.username} | Compra Cancelada`)
              .setDescription(`${emoji.get(`seta`)} | ${interaction.user} | ${interaction.user.username} Cancelou sua Compra\n\nProduto: \`${product}\`\nValor: \`${Number(produto.get(`${product}.preco`)).toFixed(2)}\``)
              .setColor("Red")
              .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            ]
         })
         await interaction.channel.delete()
         carrinhos.delete(interaction.channel.id)
       } catch (error) {
         return;
       }
     }
     
     if (interaction.customId.endsWith("_delprod")) {
       const user = interaction.customId.split("_")[0]
       const product = interaction.customId.split("_")[1]
       if (interaction.user.id != user) return interaction.deferUpdate()
       
       if (Number(carrinhos.get(`${interaction.channel.id}.produtos`).length) <= 1) return interaction.reply({ content: `${emoji.get(`emojix`)} | Você não pode remover mais produtos.`, ephemeral: true })
       
       interaction.message.delete()
       interaction.reply({ content: `${emoji.get(`certo`)} | Produto removido!`, ephemeral: true })
       carrinhos.delete(`${interaction.channel.id}.${product}`)
       carrinhos.pull(`${interaction.channel.id}.produtos`, (element) => element == product)
     }
     
     if (interaction.customId.endsWith("_lertermos")) {
       const user = interaction.customId.split("_")[0]
       if (interaction.user.id != user) return interaction.deferUpdate()
       
       interaction.reply({
         embeds: [new EmbedBuilder()
            .setTitle(`${interaction.client.user.username} | Termos de Compra`)
            .setDescription(`${General.get(`termos`) || "Não configurado"}`)
            .setColor(General.get(`color.padrao`))
          ],
         ephemeral: true
       }) 
     }
     
     if (interaction.customId.endsWith("_ativarnotificacao")) {
       const ide = interaction.customId.split("_")[0]
       
       if (produto.get(`${ide}.notify`).includes(interaction.user.id)) {
         interaction.reply({ content: `${emoji.get(`certo`)} | Você já estava com as notificações ativadas, portanto elas foram desativadas.\n**Caso queira ativar só clicar no botão novamente!**`, ephemeral: true })
         produto.pull(`${ide}.notify`, (element) => element == interaction.user.id)
       } else if (!produto.get(`${ide}.notify`).includes(interaction.user.id)) {
         produto.push(`${ide}.notify`, interaction.user.id)
         interaction.reply({ content: `${emoji.get(`certo`)} | Notificações ativadas com sucesso!`, ephemeral: true })
       }
     }
     
     function attproduto() {
       const ide = interaction.customId.split("_")[0]
       const u = produto.get(ide)
       if (!u) return;

            let desc = tema.get('embed.desc') || '#{desc}'
            desc = desc.replace('#{desc}', `${u.desc || ''}`)
            desc = desc.replace('#{nome}', `${u.nome || ''}`)
            desc = desc.replace('#{preco}', `${Number(u.preco || 0).toFixed(2)}`)
            desc = desc.replace('#{estoque}', `${(u.estoque || []).length}`)
            let titulo = tema.get('embed.titulo') || '#{nome}'
            titulo = titulo.replace('#{desc}', `${u.desc || ''}`)
            titulo = titulo.replace('#{nome}', `${u.nome || ''}`)
            titulo = titulo.replace('#{preco}', `${Number(u.preco || 0).toFixed(2)}`)
            titulo = titulo.replace('#{estoque}', `${(u.estoque || []).length}`)   
            
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
                 .setCustomId(`${ide}_comprar`)
                 .setLabel(tema.get(`botao.label`))
                 .setEmoji(tema.get(`botao.emoji`))
                 .setStyle(tema.get(`botao.style`))
               )
               
       interaction.message.edit({ embeds: [embed], components: [row] })
     }
    }
    
    if (interaction.isModalSubmit()) {
      
      if (interaction.customId.endsWith("_modallapis")) {
        const novo = parseInt(interaction.fields.getTextInputValue("quantity"))
        
        const user = interaction.customId.split("_")[0]
        const product = interaction.customId.split("_")[1]
        
        if (isNaN(novo) == true) return interaction.reply({ content: `${emoji.get(`emojix`)} | Quantidade inválida.`, ephemeral: true })
        
        if (novo > produto.get(`${product}.estoque`).length) return interaction.reply({ content: `${emoji.get(`emojix`)} | Você não pode adicionar uma quantidade maior do que do estoque.`, ephemeral: true })
        
        if (novo <= 0) return interaction.reply({ content: `${emoji.get(`emojix`)} | Você não pode adicionar uma quantidade menor do que do estoque.`, ephemeral: true })
        
        const preco = (parseFloat(produto.get(`${product}.preco`)) * novo).toFixed(2);
        
        carrinhos.set(`${interaction.channel.id}.${product}.quantidade`, novo)
        carrinhos.set(`${interaction.channel.id}.${product}.valor`, preco)
        
        interaction.reply({ content: `${emoji.get(`certo`)} | Quantidade alterada!`, ephemeral: true })
        
        interaction.message.edit({
         embeds: [new EmbedBuilder()
            .setDescription(`${emoji.get(`produto`)} | Produto: \`${carrinhos.get(`${interaction.channel.id}.${product}.nome`)}\`\n\n${emoji.get(`caixa`)} | Quantidade: \`${carrinhos.get(`${interaction.channel.id}.${product}.quantidade`)}\`\n\n${emoji.get(`preco`)} | Valor: \`${Number(carrinhos.get(`${interaction.channel.id}.${product}.valor`)).toFixed(2)}\`\n\n${emoji.get(`desc`)} | Quantidade disponível: \`${produto.get(`${product}.estoque`).length}\``)
            .setColor(General.get(`color.padrao`))
          ]
       })
      }
      
      if (interaction.customId.endsWith("_modaladdcupom")) {
        const cupom = interaction.fields.getTextInputValue("cupom")
        const ide = interaction.customId.split("_")[0]
        
        const infocupom = cupons.get(cupom)
        if (!cupons.has(cupom)) return interaction.reply({ content: `${emoji.get(`emojix`)} | Cupom inexistente.`, ephemeral: true })
        
        if (interaction.guild.roles.cache.get(infocupom.cargo)) {
          if (!interaction.member.roles.cache.has(infocupom.cargo)) return interaction.reply({ content: `${emoji.get(`emojix`)} | Você não possui o cargo necessário para usar este cupom!`, ephemeral: true })
        }
        
        if (Number(infocupom.quantidade) <= 0) return interaction.reply({ content: `${emoji.get(`emojix`)} | Este cupom não possui quantidade suficientes!`, ephemeral: true })
        
        if (Number(carrinhos.get(`${interaction.channel.id}.preco`)) < Number(infocupom.valormin)) return interaction.reply({ content: `${emoji.get('emojix')} | O valor mínimo para utilizar esse cupom é: \`${Number(infocupom.valormin).toFixed(2)}\``, ephemeral: true })
        
        const precoll = carrinhos.get(`${interaction.channel.id}.preco`)
        
        const descontinho = (infocupom.porcentagem / 100)
        const valorDesconto = Number(precoll * descontinho)
        const novoValor = precoll - valorDesconto
        
        carrinhos.set(`${interaction.channel.id}.cupomutilizado`, cupom)
        carrinhos.set(`${interaction.channel.id}.valorcupom`, valorDesconto)
        carrinhos.set(`${interaction.channel.id}.preco`, Number(novoValor))
        const carprodutosObject = carrinhos.get(interaction.channel.id) || {};
        const products = carprodutosObject.produtos.map(productKey => {
          const product = carprodutosObject[productKey];
          return `${emoji.get(`produto`)} | Produto: \`${product.nome}\`\n${emoji.get(`preco`)} | Valor unitário: \`R$${Number(produto.get(`${product.ID}.preco`)).toFixed(2)}\`\n${emoji.get(`caixa`)} | Quantidade: \`${product.quantidade}\`\n${emoji.get(`preco`)} | Total: \`R$${Number(product.valor).toFixed(2)}\`\n\n`;
        }).join('');
        
        const totalValor = Object.values(carrinhos.get(interaction.channel.id)).reduce((acc, product) => {
          const productValue = parseFloat(product.valor);
          return isNaN(productValue) ? acc : acc + productValue;
        }, 0);
        
        interaction.update({
          embeds: [new EmbedBuilder()
             .setTitle(`${interaction.client.user.username} | Resumo da Compra`)
             .setDescription(`${products}\n${emoji.get(`caixa`)} **| Produtos no Carrinho:** \`${carrinhos.get(`${interaction.channel.id}.produtos`).length}\`\n${emoji.get(`preco`)} **| Valor a pagar:** \`R$${Number(precoll).toFixed(2)}\`\n\n${emoji.get(`preco`)} **| Valor a Pagar:** \`R$${Number(novoValor).toFixed(2)}\`\n${emoji.get(`sorteio`)} **| Valor do cupom de desconto aplicado:** \`R$${valorDesconto.toFixed(2)} - ${infocupom.porcentagem}%\`\n${emoji.get(`presente`)} **| Cupom adicionado:** \`${cupom}\``)
             .setColor(General.get(`color.padrao`))
           ],
          components: [new ActionRowBuilder()
             .addComponents(
               new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${ide}_irparaopayment`)
                .setLabel('Ir Para o Pagamento')
                .setEmoji(`1136612206155407470`)
                .setStyle(3),
               new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${ide}_addcupom`)
                .setLabel('Adicionar Cupom de Desconto')
                .setEmoji('🏷️')
                .setDisabled(true)
                .setStyle(1),
               new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${ide}_cancelarcompra`)
                .setLabel('Cancelar Compra')
                .setEmoji(`1136612240217346092`)
                .setStyle(4),
             )
           ]
        })
      }
      
      if (interaction.customId.endsWith("_modalavaliar")) {
        const estrelas = interaction.customId.split("_")[0]
        const idcanal = interaction.customId.split("_")[1]
        const msgav = interaction.fields.getTextInputValue("mensagemavaliativa") || "Nenhum comentário adicional"
        
        const carprodutosObject = carrinhos.get(idcanal) || {};
        
        const products = carprodutosObject.produtos.map(productKey => {
          const product = carprodutosObject[productKey];
          if (product && product.nome && product.quantidade) {
            return `${product.nome} x${product.quantidade}\n`;
          }
        }).join('') 
        
        const canalpublico = await interaction.client.channels.fetch(General.get(`canais.logs_publica`))
        
        const embedlogs = new EmbedBuilder()
        .setTitle(`${interaction.client.user.username} | Compra aprovada`)
        .addFields(
          { name: `${emoji.get(`user`)} | COMPRADOR:`, value: `${carrinhos.get(`${idcanal}.username`)} - ${interaction.user.id}`, inline: false },
          { name: `${emoji.get(`carrinho`)} | PRODUTO(S) COMPRADO(S):`, value: `${products}`, inline: false },
          { name: `${emoji.get(`preco`)} | VALOR PAGO:`, value: `\`R$${Number(carrinhos.get(`${idcanal}.preco`)).toFixed(2)}\``, inline: false },
          { name: `${emoji.get(`presente`)} | VALOR DE DESCONTO:`, value: `\`R$${Number(carrinhos.get(`${idcanal}.valorcupom`)).toFixed(2)}\``, inline: false },
          { name: `${emoji.get(`data`)} | DATA:`, value: `<t:${Math.floor(carrinhos.get(`${idcanal}.data`) / 1000)}:f>(<t:${Math.floor(carrinhos.get(`${idcanal}.data`) / 1000)}:R>)`, inline: false },
          { name: `${emoji.get(`estrela`)} | Avaliação:`, value: `${transformasNumeroEmEstrelas(interaction.customId.split("_")[0])} (${interaction.customId.split("_")[0]})\n**__${interaction.user.username}:__** \`${msgav}\``, inline: false }
        )
        .setColor(General.get(`color.padrao`))
        .setFooter({ text: `${interaction.client.user.username} - Todos os direitos reservados.` })
        
        if (General.get(`images.banner`)?.startsWith("https://")) {
          embedlogs.setImage(General.get(`images.banner`))
        }
        
        try {
          canalpublico.send({
            content: `${interaction.user}`,
            embeds: [embedlogs]
          })
          
          interaction.message.delete()
          interaction.reply({ content: `${emoji.get(`certo`)} | Obrigado por avaliar!` }).then(msga => { setTimeout(() => { msga.delete() }, 10000)})
          carrinhos.set(`${idcanal}.avaliou`, `sim`)
        } catch (error) {
          return;
        }
      }
      
      function transformasNumeroEmEstrelas(n) {
        return '\u2B50'.repeat(n)
      }
    }
    
    
    // comprar pelo select
    if (interaction.isStringSelectMenu()) {
       const id = interaction.customId.split("_")[0]
       
       if (interaction.customId.endsWith("_comprar")) {
        const now = Date.now();
        attproduto()
        if (coodolwn.has(interaction.user.id)) {
          const tempofalta = 5000 - (now - coodolwn.get(interaction.user.id))
          return interaction.reply({ content: `Aguarde ${Number(tempofalta / 1000).toFixed(0)} segundos para interagir novamente.`, ephemeral: true })
        }
        coodolwn.set(interaction.user.id, now)
        setTimeout(() => {
          coodolwn.delete(interaction.user.id)
        }, 5000)
        
        if (General.get(`vendas`) != 'ON') return interaction.reply({
          embeds: [new EmbedBuilder()
             .setDescription(`${emoji.get(`alerta`)} | O sistema de vendas se encontra desativado, aguarde até ele ser ligado novamente!`)
             .setColor("Red")
           ],
          ephemeral: true
        })
        
        if (General.get(`blacklist`)?.includes(interaction.user.id)) {
          await interaction.reply({ content: `${emoji.get(`emojix`)} | Você está registrado na **BLACK-LIST** de nosso sistema de LOJA!`, ephemeral: true })
          return;
        }
        
        if (!interaction.guild.channels.cache.get(General.get(`canais.categoria`))) return interaction.reply({ content: `${emoji.get(`alerta`)} | A categoria de carrinhos não está configurada!`, ephemeral: true })
        
        const product = produto.get(interaction.values[0].split("_")[0])
        const ide = interaction.values[0].split("_")[0]
        
        if (product.estoque.length < 1) return interaction.reply({
           embeds: [new EmbedBuilder()
             .setDescription(`${emoji.get(`error`)} | Este produto está sem estoque, aguarde um reabastecimento!`)
             .setColor(General.get(`color.padrao`))
           ],
           components: [new ActionRowBuilder()
              .addComponents(
                 new ButtonBuilder()
                   .setCustomId(`${ide}_ativarnotificacao`)
                   .setLabel('Ativar Notificações')
                   .setEmoji(`1136604466804699136`)
                   .setStyle(2)
              )
            ],
           ephemeral: true
        })
        
        if (interaction.guild.channels.cache.find(c => c.topic == `compra-${interaction.user.id}`)) {
          const c = interaction.guild.channels.cache.find(c => c.topic == `compra-${interaction.user.id}`)
           
          if (carrinhos.get(`${c.id}.addprodutos`) == "nao") return interaction.reply({
            content: `${emoji.get(`alerta`)} | Não é possivel adicionar mais produtos no seu carrinho!`,
            components: [new ActionRowBuilder()
              .addComponents(
                 new ButtonBuilder()
                  .setLabel('🛒 • Ir para o Carrinho')
                  .setURL(c.url)
                  .setStyle(5)
              )
             ],
            ephemeral: true
          })
          
          if (carrinhos.get(`${c.id}.produtos`).length >= 5) return interaction.reply({
             embeds: [new EmbedBuilder()
                .setDescription(`${emoji.get(`alerta`)} | O carrinho já atingiu o máximo de produtos!`)
                .setColor("Red")
              ],
             components: [new ActionRowBuilder()
               .addComponents(
                 new ButtonBuilder()
                  .setLabel('🛒 • Ir para o Carrinho')
                  .setURL(c.url)
                  .setStyle(5)
                )
               ],
              ephemeral: true
          })
          
         
          if (carrinhos.get(`${c.id}.produtos`).includes(ide)) return interaction.reply({
            content: `${emoji.get(`alerta`)} | Esse produto já está no seu carrinho!`,
            components: [new ActionRowBuilder()
               .addComponents(
                 new ButtonBuilder()
                  .setLabel('🛒 • Ir para o Carrinho')
                  .setURL(c.url)
                  .setStyle(5)
                )
              ],
            ephemeral: true
          })
          
          c.send({
            embeds: [new EmbedBuilder()
               .setDescription(`${emoji.get(`produto`)} | Produto: \`${product.nome}\`\n\n${emoji.get(`caixa`)} | Quantidade: \`1\`\n\n${emoji.get(`preco`)} | Valor: \`${Number(product.preco).toFixed(2)}\`\n\n${emoji.get(`desc`)} | Quantidade disponível: \`${product.estoque.length}\``)
               .setColor(General.get(`color.padrao`))
             ],
            components: [new ActionRowBuilder()
              .addComponents(
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_${ide}_addboton`)
                  .setLabel('+')
                  .setStyle(2),
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_${ide}_lapisadd`)
                  .setEmoji('✏️')
                  .setStyle(3),
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_${ide}_removproduct`)
                  .setLabel('-')
                  .setStyle(2),
                 new ButtonBuilder()
                 .setCustomId(`${interaction.user.id}_${ide}_delprod`)
                 .setEmoji('1179008431781314670')
                 .setStyle(4),
                )
              ],
             ephemeral: true
          })
          carrinhos.push(`${c.id}.produtos`, ide)
          carrinhos.set(`${c.id}.${ide}.ID`, ide)
          carrinhos.set(`${c.id}.${ide}.nome`, product.nome)
          carrinhos.set(`${c.id}.${ide}.quantidade`, 1)
          carrinhos.set(`${c.id}.${ide}.valor`, product.preco)
          
          return interaction.reply({
            embeds: [new EmbedBuilder()
              .setDescription(`${emoji.get(`certo`)} | ${interaction.user} Produto adicionado com sucesso no seu carrinho!`)
              .setColor("Green")
             ],
            components: [new ActionRowBuilder()
              .addComponents(
                 new ButtonBuilder()
                  .setLabel('🛒 • Ir para o Carrinho')
                  .setURL(c.url)
                  .setStyle(5)
               )
             ],
            ephemeral: true
          })
        }
        
        const msg = await interaction.reply({
          content: `${emoji.get(`carregando`)} | Criando carrinho...`,
          ephemeral: true,
        }).catch(error => {})
        
        interaction.guild.channels.create({
          name: `🛒・${interaction.user.username}`,
          type: 0,
          parent: interaction.guild.channels.cache.get(product.categoria) || interaction.guild.channels.cache.get(General.get(`canais.categoria`)),
          topic: `compra-${interaction.user.id}`,
          permissionOverwrites: [
            {
              id: interaction.guild.id,
              deny: ["ViewChannel"],
            },
            {
              id: interaction.user.id,
              allow: ["ViewChannel", "AddReactions"],
              deny: ["SendMessages"]
            },
           ],
        }).then(async (c) => {
          
          try {
            await msg.edit({
              content: ` `,
              embeds: [
                new EmbedBuilder()
                 .setTitle(`${interaction.client.user.username} | Sistema de Vendas`)
                 .setDescription(`${emoji.get(`certo`)} | ${interaction.user} **Seu carrinho foi aberto com sucesso em: ${c}, fique à vontade para adicionar mais produtos.**`)
                 .setColor("Green")
               ],
              components: [
                 new ActionRowBuilder()
                  .addComponents(
                    new ButtonBuilder()
                     .setStyle(5)
                     .setLabel("🛒・Ir para carrinho")
                     .setURL(c.url)
                   )
                ],
              ephemeral: true,
            })
          } catch (error) {
            if (error.code == 10008) {
              throw error;
            }
          }
          
          const canallogs = await interaction.guild.channels.cache.get(General.get(`canais.logs_adm`))
          try {
            await canallogs.send({
              embeds: [new EmbedBuilder()
                 .setTitle(`${interaction.client.user.username} | Carrinho Criado`)
                 .setDescription(`${emoji.get(`seta`)} | ${interaction.user} | ${interaction.user.username} Criou um Carrinho\n\nProduto: \`${ide}\`\nValor: \`${Number(product.preco).toFixed(2)}\``)
                 .setColor("Green")
                 .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
               ]
            })
          } catch (error) {
            //
          }
          
          carrinhos.set(`${c.id}.status`, 'Gerenciando')
          carrinhos.set(`${c.id}.user`, interaction.user.id)
          carrinhos.set(`${c.id}.username`, interaction.user.username)
          carrinhos.set(`${c.id}.preco`, 0)
          carrinhos.set(`${c.id}.data`, new Date().getTime())
          carrinhos.set(`${c.id}.pagamento`, 'Pix')
          carrinhos.set(`${c.id}.cupomutilizado`, 'Nenhum')
          carrinhos.set(`${c.id}.valorcupom`, 0)
          carrinhos.push(`${c.id}.produtos`, ide)
          carrinhos.set(`${c.id}.addprodutos`, 'sim')
          carrinhos.set(`${c.id}.avaliou`, 'nao')
          carrinhos.set(`${c.id}.idreembolso`, 'sem')
          carrinhos.set(`${c.id}.entregue`, [])
          carrinhos.set(`${c.id}.${ide}.ID`, ide)
          carrinhos.set(`${c.id}.${ide}.nome`, product.nome)
          carrinhos.set(`${c.id}.${ide}.quantidade`, 1)
          carrinhos.set(`${c.id}.${ide}.valor`, product.preco)
          
          
          const timer = setTimeout(async () => {
            clearTimeout(timer)
            if (carrinhos.get(`${c.id}.status`) == 'Gerenciando') {
              try {
                await c.delete()
                carrinhos.delete(c.id)
                interaction.user.send({
                  embeds: [new EmbedBuilder()
                    .setTitle(`${interaction.client.user.username} | Compra Cancelada`)
                    .setDescription(`Olá **${interaction.user},**\n\n• A sua compra foi cancelada por **inatividade**, e todos os produtos foram devolvidos para o estoque. Você pode voltar a comprar quando quiser!`)
                    .setColor("Red")
                   ]
                })
              } catch (error) {
                return;
              }
            }
          }, 300000)
          
          c.send({
            embeds: [new EmbedBuilder()
               .setTitle(`${interaction.client.user.username} | Sistema de Compra`)
               .setDescription(`${emoji.get(`aviso`)} | Olá ${interaction.user}, este é seu carrinho, fique à vontade para adicionar mais produtos ou fazer as modificações que achar necessário.\n\n${emoji.get(`sirene`)} | Lembre-se de ler nossos termos de compra, para não ter nenhum problema futuramente, ao continuar com a compra, você concorda com nossos termos.\n\n${emoji.get(`sino`)} | Quando estiver tudo pronto aperte o botão abaixo, para continuar com sua compra!`)
               .setColor(General.get(`color.padrao`))
               .setFooter({ text: `${interaction.client.user.username} - Todos os direitos reservados.` })
             ],
            components: [new ActionRowBuilder()
               .addComponents(
                  new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_continuarcompra`)
                   .setLabel('Aceitar e Continuar')
                   .setEmoji(`1136612206155407470`)
                   .setStyle(3),
                  new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_cancelarcompra`)
                   .setLabel('Cancelar')
                   .setEmoji(`1136612240217346092`)
                   .setStyle(4),
                  new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_lertermos`)
                   .setLabel('Ler Os Termos')
                   .setEmoji('📋')
                   .setStyle(3),
                )
             ]
          })
          
          c.send({
            embeds: [new EmbedBuilder()
               .setDescription(`${emoji.get(`produto`)} | Produto: \`${product.nome}\`\n\n${emoji.get(`caixa`)} | Quantidade: \`1\`\n\n${emoji.get(`preco`)} | Valor: \`${Number(product.preco).toFixed(2)}\`\n\n${emoji.get(`desc`)} | Quantidade disponível: \`${product.estoque.length}\``)
                .setColor(General.get(`color.padrao`))
             ],
            components: [new ActionRowBuilder()
               .addComponents(
                  new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_addboton`)
                   .setLabel('+')
                   .setStyle(2),
                  new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_lapisadd`)
                   .setEmoji('✏️')
                   .setStyle(3),
                  new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_removproduct`)
                   .setLabel('-')
                   .setStyle(2),
                  new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_${ide}_delprod`)
                   .setEmoji('1179008431781314670')
                   .setStyle(4),
               )
             ]
          })
        })
     }
          
          function attproduto() {
            const info = painel.get(id)
            const embed = new EmbedBuilder()
             .setTitle(info.titulo)
             .setDescription(info.desc)
             .setColor(info.cor)
             
            if (info.banner != "null") embed.setImage(info.banner)
            if (info.thumb != "null") embed.setThumbnail(info.thumb)
            if (info.rodape != "null") embed.setFooter({ text: info.rodape })
            
            const products = []
            painel.get(`${id}.produtos`).forEach(x => {
              const info = produto.get(x)
              products.push({
                label: info.nome,
                description: `💸 | Valor: R$${Number(info.preco).toFixed(2)} - 📦 | Estoque: ${info.estoque.length}`,
                emoji: info.emoji || "<:carrinho_Lgt:1161241239182651413>",
                value: `${x}_comprar`
              })
            })
            
            const rowprodutos = new ActionRowBuilder()
             .addComponents(
                new StringSelectMenuBuilder()
                 .setCustomId(`${id}_comprar`)
                 .setPlaceholder(info.placeholder)
                 .addOptions(products)
             )
             
            interaction.message.edit({ embeds: [embed], components: [rowprodutos] })
          }
    }
    
    
    // reembolsar pelo button()
    if (interaction.isButton()) {
      if (interaction.customId.endsWith("_reembolsar")) {
        if (!perms.has(interaction.user.id)) {
          interaction.deferUpdate()
          return;
        }
        
        const id = interaction.customId.split("_")[0]
        
        const modal = new ModalBuilder()
        .setCustomId(`${id}_modalreembolsar`)
        .setTitle('Confirmar')
        
        const text = new TextInputBuilder()
        .setCustomId('sim')
        .setLabel('Para continuar escreva "SIM"')
        .setPlaceholder("SIM")
        .setRequired(true)
        .setStyle(1)
        
        modal.addComponents(new ActionRowBuilder().addComponents(text))
        
        await interaction.showModal(modal)
      }
    }
    
    if (interaction.isModalSubmit()) {
      if (interaction.customId.endsWith("_modalreembolsar")) {
        const confirmar = interaction.fields.getTextInputValue("sim")
        
        if (confirmar != "SIM") {
          await interaction.reply({ content: `${emoji.get(`lupa`)} | ação cancelada!`, ephemeral: true })
          return;
        }
        
        const id = interaction.customId.split("_")[0]
        const mpLogin = new MercadoPagoConfig({ accessToken: General.get(`paymentauto.access_token`) })
        const mpRefund = new PaymentRefund(mpLogin)
        
        await mpRefund.create({ payment_id: carrinhos.get(`${id}.idreembolso`) })
        .then(async (refund) => {
          await interaction.reply({ content: `${emoji.get(`certo`)} | Reembolso aprovado\n${emoji.get(`lupa`)} | ID do Pagamento: ${id}\n${emoji.get(`preco`)} | Valor Reembolsado: R$${Number(carrinhos.get(`${id}.preco`)).toFixed(2)}`, ephemeral: true })
          await interaction.message.edit({
            components: [new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                 .setCustomId(`${interaction.channel.id}_reembolsar`)
                 .setLabel('Reembolsar')
                 .setEmoji(`1136636593592090634`)
                 .setDisabled(true)
                 .setStyle(2)
              )
            ]
          })
          carrinhos.set(`${id}.status`, `Reembolsado`)
        })
        .catch(async (error) => {
          await interaction.reply({ content: `${emoji.get(`alerta`)} | Erro realizar o reembolso!\n${emoji.get(`emojix`)} | Mercado Pago Error: \`${error.message || error.toString() || "Erro desconhecido"}\``, ephemeral: true })
        })
      }
    }
  }
}