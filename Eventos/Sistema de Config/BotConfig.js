const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, ChannelSelectMenuBuilder, RoleSelectMenuBuilder, ChannelType, UserSelectMenuBuilder, StringSelectMenuBuilder } = require("discord.js")
const { perms, General, emoji } = require("../../DataBaseJson")
const axios = require('axios');
const timer = {};
const moment = require('moment');

module.exports = {
   name: "interactionCreate",
   run: async(interaction, client) => {
       // Verificar se a interação já foi respondida
       if (interaction.replied || interaction.deferred) {
           return;
       }
       
       if (interaction.isButton()) {
          
          if (interaction.customId.endsWith("_vendasonoff")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return
             
             if (General.get(`vendas`) == 'ON') {
                General.set(`vendas`, `OFF`)
             } else if (General.get(`vendas`) == 'OFF') {
                General.set(`vendas`, `ON`)
             }
             
             attembed()
          }
          
          if (interaction.customId.endsWith("_configpayment")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return
             
             const embeded = new EmbedBuilder()
              .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
              .setDescription(`${emoji.get(`config`)} **| Painel de Configuração do Bot**\n\nSelecione o Sistema que Deseja configurar`)
              .setColor(General.get(`color.padrao`))
              
             const rowew = new ActionRowBuilder()
              .addComponents(
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_configmp`)
                  .setLabel(`Mercado Pago`)
                  .setEmoji(`1136636593592090634`)
                  .setStyle(1),
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_configsaldo`)
                  .setLabel(`Saldo`)
                  .setEmoji('💰')
                  .setStyle(1),
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_configsemiauto`)
                  .setLabel(`Pagamento Semiauto`)
                  .setEmoji(`1136604253062955008`)
                  .setStyle(1),
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_voltarbotconfig`)
                  .setLabel(`Voltar`)
                  .setEmoji('⬅️')
                  .setStyle(2),
              )
              
             interaction.message.edit({ embeds: [embeded], components: [rowew] })
          }
          
          if (interaction.customId.endsWith("_configbot")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return
             
             const embed = new EmbedBuilder()
              .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
              .setDescription(`Nome Atual: **${interaction.client.user.username}**\nAvatar Atual: [Avatar](${interaction.client.user.displayAvatarURL({ dynamic: true })})\nCor Padrão do Bot Atual: ${General.get(`color.padrao`)}\nBanner Defalt do BOT: ${General.get(`images.banner`) == '' ? `Não definido!` : `[Banner](${General.get(`images.banner`)})`}\nMiniatura Defalt do BOT: ${General.get(`images.thumbnail`) == '' ? `Não definido!` : `[Miniatura](${General.get(`images.thumbnail`)})`}\n\n**Você pode configurar o bot usando os botões abaixo:**`)
              .setColor(General.get(`color.padrao`))
                
               const roww = new ActionRowBuilder()
                .addComponents(
                   new ButtonBuilder()
                    .setCustomId(`${interaction.user.id}_altnomebot`)
                    .setLabel('Alterar Nome')
                    .setEmoji(`1136607333204643931`)
                    .setStyle(1),
                   new ButtonBuilder()
                    .setCustomId(`${interaction.user.id}_altavatarbot`)
                    .setLabel('Alterar Avatar')
                    .setEmoji(`1136607333204643931`)
                    .setStyle(1),
                   new ButtonBuilder()
                    .setCustomId(`${interaction.user.id}_altcorpadrao`)
                    .setLabel('Alterar Cor Padrão do Bot')
                    .setEmoji(`1136607333204643931`)
                    .setStyle(1),
                   new ButtonBuilder()
                    .setCustomId(`${interaction.user.id}_altstatusbot`)
                    .setLabel('Alterar Status do bot')
                    .setEmoji(`1136607333204643931`)
                    .setStyle(1),
                )
                
               const roww2 = new ActionRowBuilder()
                .addComponents(
                   new ButtonBuilder()
                    .setCustomId(`${interaction.user.id}_altbannerbot`)
                    .setLabel('Alterar Banner')
                    .setEmoji(`1136607333204643931`)
                    .setStyle(1),
                   new ButtonBuilder()
                    .setCustomId(`${interaction.user.id}_altthumnbot`)
                    .setLabel('Alterar Miniatura')
                    .setEmoji(`1136607333204643931`)
                    .setStyle(1),
                   new ButtonBuilder()
                    .setCustomId(`${interaction.user.id}_voltarbotconfig`)
                    .setLabel(`Voltar`)
                    .setEmoji('⬅️')
                    .setStyle(2),
                )
                
               interaction.message.edit({ embeds: [embed], components: [roww, roww2] })
          }
          
          if (interaction.customId.endsWith("_configcanais")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return
             
             const embed = new EmbedBuilder()
              .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
              .setDescription(`Canal de Logs Adm Atual: ${interaction.guild.channels.cache.get(General.get(`canais.logs_adm`)) || "Não configurado"}\nCanal de Logs Públicas Atual: ${interaction.guild.channels.cache.get(General.get(`canais.logs_publica`)) || "Não configurado"}\nCategoria de Carrinhos Atual: ${interaction.guild.channels.cache.get(General.get(`canais.categoria`)) || "Não configurado"}\nCargo Cliente Atual: ${interaction.guild.roles.cache.get(General.get(`canais.cargo_cliente`)) || "Não configurado "}\n\n**Você pode configurar os canais utilizando os botões abaixo:**`)
              .setColor(General.get(`color.padrao`))
              
             const roww = new ActionRowBuilder()
              .addComponents(
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_logsadm`)
                  .setLabel('Configurar Logs Adm')
                  .setEmoji(`1136607333204643931`)
                  .setStyle(1),
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_logspublica`)
                  .setLabel('Configurar Logs Pública')
                  .setEmoji(`1136607333204643931`)
                  .setStyle(1),
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_altcategoriacar`)
                  .setLabel('Alterar Categoria dos Carrinhos')
                  .setEmoji(`1136607333204643931`)
                  .setStyle(1),
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_cargocliente`)
                  .setLabel('Alterar Cargo Cliente')
                  .setEmoji(`1136607333204643931`)
                  .setStyle(1),
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_voltarbotconfig`)
                   .setLabel(`Voltar`)
                   .setEmoji('⬅️')
                   .setStyle(2),
              )
              
             interaction.message.edit({ embeds: [embed], components: [roww] })
          }
          
          if (interaction.customId.endsWith("_configtermos")) {
             if (interaction.user.id != interaction.customId.split("_")[0]) return interaction.deferUpdate()
             
             const modal = new ModalBuilder()
             .setCustomId('modaltermos')
             .setTitle('Alterar Termos de Compra')
             
             const text = new TextInputBuilder()
             .setCustomId('novo')
             .setLabel('NOVO TERMO DE SUAS COMPRAS:')
             .setRequired(true)
             .setStyle(2)
             
             modal.addComponents(new ActionRowBuilder().addComponents(text))
             
             interaction.showModal(modal)
          }
          
          if (interaction.customId.endsWith("_configsms")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return
             
             const embed = new EmbedBuilder()
              .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
              .setDescription(`${emoji.get(`config`)} **| Painel de Configuração de SMS**\n\nNúmero SMS: ${General.get(`sms.numero`) || "Não configurado"}\n\n**Vocês pode configurar o SMS utilizando os botões abaixo:**`)
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
          
          if (interaction.customId.endsWith("_confighistorico")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return
             
             const embed = new EmbedBuilder()
              .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
              .setDescription(`${emoji.get(`config`)} **| Painel de Configuração de Histórico**\n\nNúmero de Histórico: ${General.get(`historico.numero`) || "Não configurado"}\n\n**Vocês pode configurar o histórico utilizando os botões abaixo:**`)
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
          
          if (interaction.customId.endsWith("_blacklist")) {
            interaction.deferUpdate()
            if (interaction.user.id != interaction.customId.split("_")[0]) return
            
            const msg = await interaction.message.edit({ content: `${emoji.get(`carregando`)} | Aguarde...`, embeds: [], components: [] })
            
            const usersBlack = General.get(`blacklist`)?.map((x, index) => {
              return `**ID: ${index + 1} -** ${interaction.guild.members.cache.get(x) || "Não encontrado"} - \`(${x})\``
            }).join("\n")
            
            const embed = new EmbedBuilder()
            .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
            .setDescription(!General.has('blacklist') || !General.get(`blacklist`).length ? "Nenhum usuário se encontra na BlackList!" : `Usuários que está na BlackList:\n\n${usersBlack}`)
            .setColor(General.get(`color.padrao`))
            
            const row = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
               .setCustomId(`${interaction.user.id}_addblacklist`)
               .setLabel("Adicionar Membro na Black-List")
               .setEmoji(`1141020908069326871`)
               .setStyle(3),
              new ButtonBuilder()
               .setCustomId(`${interaction.user.id}_delblacklist`)
               .setLabel("Remover Membro da Black-List")
               .setEmoji(`1141020948909269054`)
               .setStyle(4),
              new ButtonBuilder()
               .setCustomId(`${interaction.user.id}_voltarbotconfig`)
               .setLabel(`Voltar`)
               .setEmoji('⬅️')
               .setStyle(2)
            )
            
            await msg.edit({ content: ``, embeds: [embed], components: [row] })
          }  
          
          if (interaction.customId.endsWith("_addblacklist")) {
            interaction.deferUpdate();
            if (interaction.user.id != interaction.customId.split("_")[0]) return;
             
            const row = new ActionRowBuilder()
                .addComponents(
                    new UserSelectMenuBuilder()
                        .setCustomId(`${interaction.user.id}_addblack`)
                        .setPlaceholder("Selecione um usuário")
                        .setMinValues(1)
                        .setMaxValues(1)
                );
        
                const row2 = new ActionRowBuilder()
                .addComponents(
                  new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_voltarbotconfig4`)
                   .setLabel("Voltar")
                   .setEmoji("⬅️")
                   .setStyle(2)
                )
                
            // Envie a linha de interação para o canal
            interaction.message.edit({ components: [row, row2] })
        }

          if (interaction.customId.endsWith("_delblacklist")) {
            interaction.deferUpdate()
            if (interaction.user.id != interaction.customId.split("_")[0]) return
             
             const row = new ActionRowBuilder()
             .addComponents(
               new UserSelectMenuBuilder()
                .setCustomId(`${interaction.user.id}_delblack`)
                .setPlaceholder("Selecione o usuário")
                .setMinValues(1)
                .setMaxValues(1)
             )
             
             const row2 = new ActionRowBuilder()
             .addComponents(
               new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_voltarbotconfig4`)
                .setLabel("Voltar")
                .setEmoji("⬅️")
                .setStyle(2)
             )
             
             interaction.message.edit({ components: [row, row2] })
          }
          
          if (interaction.customId.endsWith("_configmp")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return
             
             const embed = new EmbedBuilder()
              .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
              .setDescription(`${emoji.get(`comprimento`)} **| Configurar Mercado Pago**\n\n${emoji.get(`link`)} | Pix: ${General.get(`paymentauto.pix`)}\n${emoji.get(`comprimento`)} | Pagar pelo Site: ${General.get(`paymentauto.pagarsite`)}\n${emoji.get(`relogio`)} | Tempo máximo para pagar: ${General.get(`paymentauto.tempopagar`)} Minutos\n${emoji.get(`config`)} | Access Token: ${General.get(`paymentauto.access_token`) == '' ? `Não definido` : `||${General.get(`paymentauto.access_token`)}||`}\n${emoji.get(`alerta`)} | Bancos Bloqueados: ${Object.entries(General.get(`bancos_bloqueados`)).map(([key, value]) => `${key}`).join(', ') || "Nenhum"}`)
              .setColor(General.get(`color.padrao`))
              
             const roww = new ActionRowBuilder()
              .addComponents(
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_pixonoff`)
                  .setLabel('Pix ON/OFF')
                  .setEmoji(`<a:onoff:1258076650650861661>`)
                  .setStyle(1),
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_siteonoff`)
                  .setLabel('Site ON/OFF')
                  .setEmoji(`<a:onoff:1258076650650861661>`)
                  .setStyle(1),
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_tempopagar`)
                  .setLabel('Tempo para Pagar')
                  .setEmoji(`1136607333204643931`)
                  .setStyle(2),
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_altaccesstoken`)
                  .setLabel('Altera Access Token')
                  .setEmoji(`1136607333204643931`)
                  .setStyle(2),
              )
             
             const roww2 = new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                 .setCustomId(`${interaction.user.id}_bloquearbanco`)
                 .setLabel('Bloquear Bancos')
                 .setEmoji(`1136607825758527529`)
                 .setStyle(2),
                new ButtonBuilder()
                 .setCustomId(`${interaction.user.id}_voltarbotconfig2`)
                 .setLabel(`Voltar`)
                 .setEmoji('⬅️')
                 .setStyle(2),
              )
             
             interaction.message.edit({ embeds: [embed], components: [roww, roww2] })
          }

          if (interaction.customId.endsWith("_altaccesstoken")) {
             if (interaction.user.id != interaction.customId.split("_")[0]) return interaction.deferUpdate()
             
             const modal = new ModalBuilder()
             .setCustomId(`${interaction.user.id}_modalaccesstoken`)
             .setTitle('Alterar Access Token')
             
             const text = new TextInputBuilder()
             .setCustomId('novotoken')
             .setLabel('Novo Access Token:')
             .setPlaceholder('Ex: APP_USR-...')
             .setRequired(true)
             .setStyle(1)
             
             modal.addComponents(new ActionRowBuilder().addComponents(text))
             
             interaction.showModal(modal)
          }
          
          if (interaction.customId.endsWith("_configsaldo")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return
             
             const embed = new EmbedBuilder()
              .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
              .setDescription(`${emoji.get(`saco`)} **| Configurar Sistema de Saldo**\n\nSistema de Saldo: ${General.get(`saldo.saldo`)}\nBônus depósito: ${General.get(`saldo.bonus`)}%\nValor minimo para depósito: R$${General.get(`saldo.minimo`)}`)
              .setColor(General.get(`color.padrao`))
              
             const roww = new ActionRowBuilder()
              .addComponents(
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_saldoonoff`)
                  .setLabel(`Saldo ON/OFF`)
                  .setEmoji(`<a:onoff:1258076650650861661>`)
                  .setStyle(1),
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_bonusdeposito`)
                  .setLabel(`Bônus por depósito`)
                  .setEmoji(`1136607333204643931`)
                  .setStyle(1),
                new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_voltarbotconfig2`)
                  .setLabel(`Voltar`)
                  .setEmoji('⬅️')
                  .setStyle(2),
              )
              
             interaction.message.edit({ embeds: [embed], components: [roww] })
          }
          
          if (interaction.customId.endsWith("_configsemiauto")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return
             
             const embed = new EmbedBuilder()
              .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
              .setDescription(`${emoji.get(`martelo`)} **| Sistema de Pagamento Semi Automático.**\n\n${emoji.get(`config`)} | Sistema: ${General.get(`paymentsemi.pix`)}\n${emoji.get(`link`)} | Chave Pix: ${General.get(`paymentsemi.chavepix`) == '' ? `Não definido` : General.get(`paymentsemi.chavepix`)}\n${emoji.get(`tabela`)} | Qr Code: ${General.get(`paymentsemi.qrcode`) == '' ? `Não definido` : `[QrCode](${General.get(`paymentsemi.qrcode`)})`}`)
              .setColor(General.get(`color.padrao`))
              
             const roww = new ActionRowBuilder()
              .addComponents(
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_semionoff`)
                   .setLabel(`Semiauto ON/OFF`)
                   .setEmoji(`<a:onoff:1258076650650861661>`)
                   .setStyle(1),
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_altchavepix`)
                   .setLabel(`Chave Pix`)
                   .setEmoji(`1136607333204643931`)
                   .setStyle(1),
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_altqrcode`)
                   .setLabel(`Qr Code`)
                   .setEmoji(`1136607333204643931`)
                   .setStyle(1),
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_voltarbotconfig2`)
                   .setLabel(`Voltar`)
                   .setEmoji('⬅️')
                   .setStyle(2),
              )
              
             interaction.message.edit({ embeds: [embed], components: [roww] })
          }
          
          if (interaction.customId.endsWith("_pixonoff")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return
             
             if (General.get(`paymentauto.pix`) == 'ON') {
                General.set(`paymentauto.pix`, `OFF`)
                General.set(`paymentsemi.pix`, `ON`)
             } else if (General.get(`paymentauto.pix`) == 'OFF') {
                General.set(`paymentauto.pix`, `ON`)
                General.set(`paymentsemi.pix`, `OFF`)
             }
             
             embedmp()
             
             function embedmp() {
               const embed2 = new EmbedBuilder()
                .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
                .setDescription(`${emoji.get(`comprimento`)} **| Configurar Mercado Pago**\n\n${emoji.get(`link`)} | Pix: ${General.get(`paymentauto.pix`)}\n${emoji.get(`comprimento`)} | Pagar pelo Site: ${General.get(`paymentauto.pagarsite`)}\n${emoji.get(`relogio`)} | Tempo máximo para pagar: ${General.get(`paymentauto.tempopagar`)} Minutos\n${emoji.get(`config`)} | Access Token: ${General.get(`paymentauto.access_token`) == '' ? `Não definido` : `||${General.get(`paymentauto.access_token`)}||`}\n${emoji.get(`alerta`)} | Bancos Bloqueados: ${Object.entries(General.get(`bancos_bloqueados`)).map(([key, value]) => `${key}`).join(', ') || "Nenhum"}`)
                .setColor(General.get(`color.padrao`))
                
               interaction.message.edit({ embeds: [embed2] })
             }
          }
          
          if (interaction.customId.endsWith("_siteonoff")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return
             
             if (General.get(`paymentauto.pagarsite`) == 'ON') {
                General.set(`paymentauto.pagarsite`, `OFF`)
             } else if (General.get(`paymentauto.pagarsite`) == 'OFF') {
                General.set(`paymentauto.pagarsite`, `ON`)
             }
             
             embedmp()
             
             function embedmp() {
               const embed2 = new EmbedBuilder()
                .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
                .setDescription(`${emoji.get(`comprimento`)} **| Configurar Mercado Pago**\n\n${emoji.get(`link`)} | Pix: ${General.get(`paymentauto.pix`)}\n${emoji.get(`comprimento`)} | Pagar pelo Site: ${General.get(`paymentauto.pagarsite`)}\n${emoji.get(`relogio`)} | Tempo máximo para pagar: ${General.get(`paymentauto.tempopagar`)} Minutos\n${emoji.get(`config`)} | Access Token: ${General.get(`paymentauto.access_token`) == '' ? `Não definido` : `||${General.get(`paymentauto.access_token`)}||`}`)
                .setColor(General.get(`color.padrao`))
                
               interaction.message.edit({ embeds: [embed2] })
             }
          }
          
          if (interaction.customId.endsWith("_tempopagar")) {
             if (interaction.user.id != interaction.customId.split("_")[0]) return interaction.deferUpdate()
             
             const modal = new ModalBuilder()
             .setCustomId(`modaltempopagar`)
             .setTitle('Alterar Tempo')
             
             const text = new TextInputBuilder()
             .setCustomId('novotempo')
             .setLabel('TEMPO: (ENTRE 5 A 20 MINUTOS)')
             .setPlaceholder('10')
             .setRequired(true)
             .setStyle(1)
             
             modal.addComponents(new ActionRowBuilder().addComponents(text))
             
             interaction.showModal(modal)
          }
          
          if (interaction.customId.endsWith("_altaccesstoken")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return 
             
             interaction.message.edit({
               embeds: [new EmbedBuilder()
                 .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL()})
                 .setDescription(`${emoji.get(`comprimento`)} **| Alterar Access Token**\n\nSe a sua conta do Mercado Pago for de um menor de idade, opte pela segunda opção.`)
                 .setColor(General.get(`color.padrao`))
                 .setThumbnail(interaction.client.user.displayAvatarURL())
               ],
               components: [new ActionRowBuilder()
                 .addComponents(
                   new ButtonBuilder()
                    .setCustomId(`${interaction.user.id}_setaraccesstoken`)
                    .setLabel('Setar Access Token')
                    .setEmoji(`1146901750532554812`)
                    .setStyle(1),
                   new ButtonBuilder()
                    .setCustomId(`${interaction.user.id}_autmp`)
                    .setLabel('Autenticar MercadoPago [-18]')
                    .setEmoji('🔗')
                    .setStyle(2),
                   new ButtonBuilder()
                    .setCustomId(`${interaction.user.id}_voltarbotconfig5`)
                    .setLabel('Voltar')
                    .setEmoji('⬅️')
                    .setStyle(2)
                 )
               ]
             })
          }
          
          if (interaction.customId.endsWith("_setaraccesstoken")) {
             if (interaction.user.id != interaction.customId.split("_")[0]) return interaction.deferUpdate()
             
             const modal = new ModalBuilder()
             .setCustomId(`modalaccesstoken`)
             .setTitle('Alterar Token')
             
             const text = new TextInputBuilder()
             .setCustomId('novotoken')
             .setLabel('TOKEN: APP_USR-4895230458252332-050712')
             .setPlaceholder('APP_USR-4895230458252332-050712-eecba8c8c2')
             .setRequired(true)
             .setStyle(1)
             
             modal.addComponents(new ActionRowBuilder().addComponents(text))
             
             interaction.showModal(modal)
          }
          
          if (interaction.customId.endsWith("_autmp")) {
            interaction.deferUpdate()
            if (interaction.user.id != interaction.customId.split("_")[0]) return;
            
            const min = moment().add(10, 'minutes');
            const msg = await interaction.message.edit({
              content:`Autorizar seu **Mercado Pago** á **Blank**\n\n**Status:** Aguardando autorizar.\nEssa mensagem vai expirar em <t:${Math.floor(min / 1000)}:R>\n(Para autorizar, clique no botão abaixo, selecione 'Brasil' e clique em Continuar/Confirmar/Autorizar)`,
              embeds: [],
              components: [new ActionRowBuilder()
                .addComponents(
                  new ButtonBuilder()
                   .setLabel('Autorizar Mercado Pago')
                   .setURL(`https://rubymp.squareweb.app/mp/${interaction.guild.id}/vendasv1`)
                   .setStyle(5),
                  new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_voltarbotconfig5`)
                   .setLabel('Voltar')
                   .setEmoji('⬅️')
                   .setStyle(2)
                )
              ]
            })
            
            const check = setInterval(async() => {
              try {
                const response = await axios.get(`https://rubymp.squareweb.app/mp/${interaction.guild.id}/api`);
                const data = response.data;
                console.log(data)
                if (data.access_token) {
                  clearInterval(check)
                  General.set(`paymentauto.access_token`, data.access_token)
                  msg.edit({
                    content:`**Status:** ✅ Autorização bem sucedida!`,
                    components: [new ActionRowBuilder()
                      .addComponents(
                        new ButtonBuilder()
                         .setCustomId(`${interaction.user.id}_voltarbotconfig5`)
                         .setEmoji('⬅️')
                         .setStyle(1)
                      )
                    ]
                  })
                  
                  if (timer[interaction.message.id]) {
                    clearTimeout(timer[interaction.message.id])
                    delete timer[interaction.message.id]
                  }
                }
              } catch (err) {
              }
            }, 3000)
            
            timer[interaction.message.id] = setTimeout(() => {
              clearInterval(check)
              clearTimeout(timer[interaction.message.id])
              msg.edit({
                content: `${emoji.get(`alerta`)} | Você não se cadastrou durante 10 Minutos, cadastre-se novamente!`,
                components: [new ActionRowBuilder()
                  .addComponents(
                    new ButtonBuilder()
                     .setCustomId(`${interaction.user.id}_voltarbotconfig5`)
                     .setEmoji('⬅️')
                     .setStyle(1)
                   )
                ],
                embeds: [],
                files: []
              })
              delete timer[interaction.message.id]
            }, 10 * 60 * 1000)
          }
          
          if (interaction.customId.endsWith("_bloquearbanco")) {
            interaction.deferUpdate()
            if (interaction.user.id != interaction.customId.split("_")[0]) return;
            
            const select = new ActionRowBuilder()
            .addComponents(
              new StringSelectMenuBuilder()
               .setCustomId(`${interaction.user.id}_blockbancos`)
               .setPlaceholder('Selecione os bancos que deseja bloquear')
               .addOptions([
                 {
                   label: 'Banco Inter S.A.',
                   emoji: '🇧🇷',
                   value: 'inter'
                 },
                 {
                   label: 'Banco Bradesco S.A.',
                   emoji: '🇧🇷',
                   value: 'bradesco'
                 },
                 {
                   label: 'Nu Pagamentos S.A.',
                   emoji: '🇧🇷',
                   value: 'nu'
                 },
                 {
                   label: 'Banco do Brasil S.A.',
                   emoji: '🇧🇷',
                   value: 'brasil'
                 },
                 {
                   label: 'Banco Itaucard S.A.',
                   emoji: '🇧🇷',
                   value: 'itaucard'
                 },
               ])
               .setMaxValues(5)
               .setMinValues(1)
            )
            
            const rowback = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
               .setCustomId(`${interaction.user.id}_desblockallbank`)
               .setLabel('Desbloquear Todos')
               .setEmoji(`1140438393373872148`)
               .setStyle(2),
              new ButtonBuilder()
               .setCustomId(`${interaction.user.id}_voltarbotconfig5`)
               .setLabel('Voltar')
               .setEmoji('⬅️')
               .setStyle(2)
            )
            
            interaction.message.edit({
              embeds: [],
              components: [select, rowback]
            })
          }
          
          if (interaction.customId.endsWith("_saldoonoff")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return
             
             if (General.get(`saldo.saldo`) == 'ON') {
                General.set(`saldo.saldo`, `OFF`)
             } else if (General.get(`saldo.saldo`) == 'OFF') {
                General.set(`saldo.saldo`, `ON`)
             }
             
             embedsaldo()
             
             function embedsaldo() {
               const embed = new EmbedBuilder()
                .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
                .setDescription(`${emoji.get(`saco`)} **| Configurar Sistema de Saldo**\n\nSistema de Saldo: ${General.get(`saldo.saldo`)}\nBônus depósito: ${General.get(`saldo.bonus`)}%\nValor minimo para depósito: R$${General.get(`saldo.minimo`)}`)
                .setColor(General.get(`color.padrao`))
                
               interaction.message.edit({ embeds: [embed] })
             }
          }
          
          if (interaction.customId.endsWith("_bonusdeposito")) {
             if (interaction.user.id != interaction.customId.split("_")[0]) return interaction.deferUpdate()
             
             const modal = new ModalBuilder()
             .setCustomId(`modalbonusdeposito`)
             .setTitle('Bônus por depósito')
             
             const text = new TextInputBuilder()
             .setCustomId('porcentagem')
             .setLabel('PORCENTAGEM DO BÔNUS')
             .setPlaceholder('10')
             .setRequired(true)
             .setStyle(1)
             
             const text2 = new TextInputBuilder()
             .setCustomId('valormin')
             .setLabel('VALOR MÍNIMO')
             .setPlaceholder('5')
             .setRequired(true)
             .setStyle(1)
             
             modal.addComponents(new ActionRowBuilder().addComponents(text), new ActionRowBuilder().addComponents(text2))
             
             interaction.showModal(modal)
          }
          
          if (interaction.customId.endsWith("_semionoff")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return
             
             if (General.get(`paymentsemi.pix`) == 'ON') {
                General.set(`paymentsemi.pix`, `OFF`)
                General.set(`paymentauto.pix`, `ON`)
             } else if (General.get(`paymentsemi.pix`) == 'OFF') {
                General.set(`paymentsemi.pix`, `ON`)
                General.set(`paymentauto.pix`, `OFF`)
             }
             
             embedsemi()
             
             function embedsemi() {
               const embed = new EmbedBuilder()
                .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
                .setDescription(`${emoji.get(`martelo`)} **| Sistema de Pagamento Semi Automático.**\n\n${emoji.get(`config`)} | Sistema: ${General.get(`paymentsemi.pix`)}\n${emoji.get(`link`)} | Chave Pix: ${General.get(`paymentsemi.chavepix`) == '' ? `Não definido` : General.get(`paymentsemi.chavepix`)}\n${emoji.get(`tabela`)} | Qr Code: ${General.get(`paymentsemi.qrcode`) == '' ? `Não definido` : `[QrCode](${General.get(`paymentsemi.qrcode`)})`}`)
                .setColor(General.get(`color.padrao`))
                
               interaction.message.edit({ embeds: [embed] })
             }
          }
          
          if (interaction.customId.endsWith("_altchavepix")) {
             if (interaction.user.id != interaction.customId.split("_")[0]) return interaction.deferUpdate()
             
             const modal = new ModalBuilder()
             .setCustomId(`modalchavepix`)
             .setTitle('Chave Pix')
             
             const text = new TextInputBuilder()
             .setCustomId('novoo')
             .setLabel('TIPO DA CHAVE:')
             .setPlaceholder('Email, Cpf, Aleatória, ETC.')
             .setRequired(true)
             .setStyle(1)
             
             const text2 = new TextInputBuilder()
             .setCustomId('novo')
             .setLabel('CHAVE:')
             .setPlaceholder('hxwxdev@gmail.com')
             .setRequired(true)
             .setStyle(1)
             
             modal.addComponents(new ActionRowBuilder().addComponents(text), new ActionRowBuilder().addComponents(text2))
             
             interaction.showModal(modal)
          }
          
          if (interaction.customId.endsWith("_altqrcode")) {
             if (interaction.user.id != interaction.customId.split("_")[0]) return interaction.deferUpdate()
             
             const modal = new ModalBuilder()
             .setCustomId(`modalqrcode`)
             .setTitle('Qr Code')
             
             const text = new TextInputBuilder()
             .setCustomId('novo')
             .setLabel('QR CODE')
             .setRequired(true)
             .setStyle(1)
             
             modal.addComponents(new ActionRowBuilder().addComponents(text))
             
             interaction.showModal(modal)
          }
          
          if (interaction.customId.endsWith("_altnomebot")) {
             if (interaction.user.id != interaction.customId.split("_")[0]) return interaction.deferUpdate()
             
             const modal = new ModalBuilder()
             .setCustomId('modalnomebot')
             .setTitle('Alterar Nome')
             
             const text = new TextInputBuilder()
             .setCustomId('nome')
             .setLabel('NOME:')
             .setRequired(true)
             .setStyle(1)
             
             modal.addComponents(new ActionRowBuilder().addComponents(text))
             
             interaction.showModal(modal)
          }
          
          if (interaction.customId.endsWith("_altavatarbot")) {
             if (interaction.user.id != interaction.customId.split("_")[0]) return interaction.deferUpdate()
             
             const modal = new ModalBuilder()
             .setCustomId('modalavatarbot')
             .setTitle('Alterar Avatar')
             
             const text = new TextInputBuilder()
             .setCustomId('avatar')
             .setLabel('AVATAR:')
             .setRequired(true)
             .setStyle(1)
             
             modal.addComponents(new ActionRowBuilder().addComponents(text))
             
             interaction.showModal(modal)
          }
          
          if (interaction.customId.endsWith("_altcorpadrao")) {
             if (interaction.user.id != interaction.customId.split("_")[0]) return interaction.deferUpdate()
             
             const modal = new ModalBuilder()
             .setCustomId('modalcorbot')
             .setTitle('Alterar Cor')
             
             const text = new TextInputBuilder()
             .setCustomId('color')
             .setLabel('COR EM (HEX):')
             .setPlaceholder('Exemplo: #000000, #00FF00')
             .setRequired(true)
             .setStyle(1)
             
             modal.addComponents(new ActionRowBuilder().addComponents(text))
             
             interaction.showModal(modal)
          }
          
          if (interaction.customId.endsWith("_altstatusbot")) {
             if (interaction.user.id != interaction.customId.split("_")[0]) return interaction.deferUpdate()
             
             const modal = new ModalBuilder()
             .setCustomId('modalstatusbot')
             .setTitle('Alterar Status')
             
             const text = new TextInputBuilder()
             .setCustomId('presenca')
             .setLabel('ESCOLHA O TIPO DE PRESENÇA:')
             .setPlaceholder('Online, Ausente, Invisível ou Não Perturbar')
             .setRequired(true)
             .setStyle(1)
             
             const text2 = new TextInputBuilder()
             .setCustomId('atividade')
             .setLabel('ESCOLHA O TIPO DE ATIVIDADE:')
             .setPlaceholder('Jogando, Competindo, Assistindo, Transmitindo, Ouvindo')
             .setRequired(true)
             .setStyle(1)
             
             const text3 = new TextInputBuilder()
             .setCustomId('texto')
             .setLabel('ESCREVA O TEXTO DA ATIVIDADE:')
             .setPlaceholder('Vendas Automáticas')
             .setRequired(true)
             .setStyle(1)
             
             const text4 = new TextInputBuilder()
             .setCustomId('url')
             .setLabel('URL DO CANAL:')
             .setPlaceholder('Se a escolha for Transmitindo, Coloque a Url aqui, ex:\nhttps://www.twitch.tv/hxwx2707')
             .setRequired(false)
             .setStyle(2)
             
             modal.addComponents(new ActionRowBuilder().addComponents(text), new ActionRowBuilder().addComponents(text2), new ActionRowBuilder().addComponents(text3), new ActionRowBuilder().addComponents(text4))
             
             interaction.showModal(modal)
          }
          
          if (interaction.customId.endsWith("_altbannerbot")) {
             if (interaction.user.id != interaction.customId.split("_")[0]) return interaction.deferUpdate()
             
             const modal = new ModalBuilder()
             .setCustomId('modalbannerbot')
             .setTitle('Alterar Banner')
             
             const text = new TextInputBuilder()
             .setCustomId('banner')
             .setLabel('LINK BANNER:')
             .setPlaceholder('Link aqui')
             .setRequired(true)
             .setStyle(1)
             
             modal.addComponents(new ActionRowBuilder().addComponents(text))
             
             interaction.showModal(modal)
          }
          
          if (interaction.customId.endsWith("_altthumnbot")) {
             if (interaction.user.id != interaction.customId.split("_")[0]) return interaction.deferUpdate()
             
             const modal = new ModalBuilder()
             .setCustomId('modalthumbbot')
             .setTitle('Alterar Miniatura')
             
             const text = new TextInputBuilder()
             .setCustomId('thumb')
             .setLabel('LINK MINIATURA:')
             .setPlaceholder('Link aqui')
             .setRequired(true)
             .setStyle(1)
             
             modal.addComponents(new ActionRowBuilder().addComponents(text))
             
             interaction.showModal(modal)
          }
          
          if (interaction.customId.endsWith("_logsadm")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return
             
             const embed = new EmbedBuilder()
              .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
              .setDescription(`Canal Definido: ${interaction.guild.channels.cache.get(General.get(`canais.logs_adm`)) || `Não definido`}`)
              .setColor(General.get(`color.padrao`))
             
             const select = new ActionRowBuilder()
              .addComponents(
                  new ChannelSelectMenuBuilder()
                   .setCustomId(`${interaction.user.id}_altlogsadm`)
                   .setPlaceholder(`Selecione o Canal de Logs Adm`)
                   .setMinValues(1)
                   .setMaxValues(1)
                   .setChannelTypes(ChannelType.GuildText)
               )
             const rowback = new ActionRowBuilder()
              .addComponents(
                  new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_voltarbotconfig3`)
                   .setLabel('Voltar')
                   .setEmoji('⬅️')
                   .setStyle(2)
               )
               
             interaction.message.edit({ embeds: [embed], components: [select, rowback] })
          }
          
          if (interaction.customId.endsWith("_logspublica")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return
             
             const embed = new EmbedBuilder()
              .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
              .setDescription(`Canal Definido: ${interaction.guild.channels.cache.get(General.get(`canais.logs_publica`)) || `Não definido`}`)
              .setColor(General.get(`color.padrao`))
             
             const select = new ActionRowBuilder()
              .addComponents(
                  new ChannelSelectMenuBuilder()
                   .setCustomId(`${interaction.user.id}_altlogspublica`)
                   .setPlaceholder(`Selecione o Canal de Logs Pública`)
                   .setMinValues(1)
                   .setMaxValues(1)
                   .setChannelTypes(ChannelType.GuildText)
               )
             const rowback = new ActionRowBuilder()
              .addComponents(
                  new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_voltarbotconfig3`)
                   .setLabel('Voltar')
                   .setEmoji('⬅️')
                   .setStyle(2)
               )
               
             interaction.message.edit({ embeds: [embed], components: [select, rowback] })
          }
          
          if (interaction.customId.endsWith("_altcategoriacar")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return
             
             const embed = new EmbedBuilder()
              .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
              .setDescription(`Canal Definido: ${interaction.guild.channels.cache.get(General.get(`canais.categoria`)) || `Não definido`}`)
              .setColor(General.get(`color.padrao`))
             
             const select = new ActionRowBuilder()
              .addComponents(
                  new ChannelSelectMenuBuilder()
                   .setCustomId(`${interaction.user.id}_altcategoriaselect`)
                   .setPlaceholder(`Selecione a Categoria de Carrinhos`)
                   .setMinValues(1)
                   .setMaxValues(1)
                   .setChannelTypes(ChannelType.GuildCategory)
               )
             const rowback = new ActionRowBuilder()
              .addComponents(
                  new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_voltarbotconfig3`)
                   .setLabel('Voltar')
                   .setEmoji('⬅️')
                   .setStyle(2)
               )
               
             interaction.message.edit({ embeds: [embed], components: [select, rowback] })
          }
          
          if (interaction.customId.endsWith("_desblockallbank")) {
            interaction.deferUpdate()
            if (interaction.user.id != interaction.customId.split("_")[0]) return
             
            General.delete('bancos_bloqueados')
            General.set('bancos_bloqueados.nenhum', 'nenhum')
            embedmp2(interaction.message)
          }
          
          if (interaction.customId.endsWith("_cargocliente")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return
             
             const embed = new EmbedBuilder()
              .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
              .setDescription(`Cargo Definido: ${interaction.guild.roles.cache.get(General.get(`canais.cargo_cliente`)) || `Não definido`}`)
              .setColor(General.get(`color.padrao`))
             
             const select = new ActionRowBuilder()
              .addComponents(
                  new RoleSelectMenuBuilder()
                   .setCustomId(`${interaction.user.id}_altcargocliente`)
                   .setPlaceholder(`Selecione o Cargo Cliente`)
                   .setMinValues(1)
                   .setMaxValues(1)
               )
             const rowback = new ActionRowBuilder()
              .addComponents(
                  new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_voltarbotconfig3`)
                   .setLabel('Voltar')
                   .setEmoji('⬅️')
                   .setStyle(2)
               )
               
             interaction.message.edit({ embeds: [embed], components: [select, rowback] })
          }
          
          if (interaction.customId.endsWith("_voltarbotconfig")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return
             
             attembed()
          }
          
          if (interaction.customId.endsWith("_voltarbotconfig2")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return
             
             embedpayment()
          }
          
          if (interaction.customId.endsWith("_voltarbotconfig3")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return
             
             embedcanal()
          }
          
          if (interaction.customId.endsWith("_voltarbotconfig4")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return
             
             embedblacklist()
          }
          
          if (interaction.customId.endsWith("_voltarbotconfig5")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return
             
             if (timer[interaction.message.id]) {
               clearTimeout(timer[interaction.message.id])
               delete timer[interaction.message.id]
             }
             embedmp2(interaction.message)
          }
          
          function attembed() {
            const embed = new EmbedBuilder()
            .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL()})
            .setDescription(`${emoji.get(`configbot`)} | **Painel de Configuração do bot**\n\n<:Pussy_verificadd:1258087335501762570> | Sistema de Vendas:* ${General.get(`vendas`)}\n\n[Blank](https://discord.gg/exemplo)`)
            .setColor(General.get(`color.padrao`))
            .setThumbnail(interaction.client.user.displayAvatarURL())
             
             const row = new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                 .setCustomId(`${interaction.user.id}_vendasonoff`)
                 .setLabel('Vendas On/Off')
                 .setEmoji(`<a:onoff:1258076650650861661>`)
                 .setStyle(General.get(`vendas`) == "ON" ? 3 : 4),
               new ButtonBuilder()
                 .setCustomId(`${interaction.user.id}_configpayment`)
                 .setLabel('Configurar Pagamento')
                 .setEmoji(`1157338170757746729`)
                 .setStyle(1),
               new ButtonBuilder()
                 .setCustomId(`${interaction.user.id}_configbot`)
                 .setLabel('Configurar Bot')
                 .setEmoji(`<:robo:1258088520497758228>`)
                 .setStyle(1),
               new ButtonBuilder()
               .setCustomId(`${interaction.user.id}_configcanais`)
               .setLabel('Configurar Canais')
               .setEmoji(`<:Pussy_kit:1258088730959548429>`)
               .setStyle(1),
             new ButtonBuilder()
               .setCustomId(`${interaction.user.id}_configtermos`)
               .setLabel('Configurar os Termos de compra')
               .setEmoji(`1184105676545474631`)
               .setStyle(1)
             )
             
             const row2 = new ActionRowBuilder()
             .addComponents(
              new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_blacklist`)
                .setLabel('Personalizar BlackList')
                .setEmoji(`<:Pussy_membroban:1258081308307882024>`)
                .setStyle(2)
             )
             
             interaction.message.edit({ embeds: [embed], components: [row, row2] })
          }
          
          function embedpayment() {
             const embeded = new EmbedBuilder()
              .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
              .setDescription(`${emoji.get(`config`)} **| Painel de Configuração do Bot**\n\nSelecione o Sistema que Deseja configurar`)
              .setColor(General.get(`color.padrao`))
              
             const rowew = new ActionRowBuilder()
              .addComponents(
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_configmp`)
                  .setLabel(`Mercado Pago`)
                  .setEmoji(`1136636593592090634`)
                  .setStyle(1),
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_configsaldo`)
                  .setLabel(`Saldo`)
                  .setEmoji('💰')
                  .setStyle(1),
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_configsemiauto`)
                  .setLabel(`Pagamento Semiauto`)
                  .setEmoji(`1136604253062955008`)
                  .setStyle(1),
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_voltarbotconfig`)
                  .setLabel(`Voltar`)
                  .setEmoji('⬅️')
                  .setStyle(2),
              )
              
             interaction.message.edit({ embeds: [embeded], components: [rowew] })
          }
          
          function embedcanal() {
             const embed = new EmbedBuilder()
              .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
              .setDescription(`Canal de Logs Adm Atual: ${interaction.guild.channels.cache.get(General.get(`canais.logs_adm`)) || "Não configurado"}\nCanal de Logs Públicas Atual: ${interaction.guild.channels.cache.get(General.get(`canais.logs_publica`)) || "Não configurado"}\nCategoria de Carrinhos Atual: ${interaction.guild.channels.cache.get(General.get(`canais.categoria`)) || "Não configurado"}\nCargo Cliente Atual: ${interaction.guild.roles.cache.get(General.get(`canais.cargo_cliente`)) || "Não configurado "}\n\n**Você pode configurar os canais utilizando os botões abaixo:**`)
              .setColor(General.get(`color.padrao`))
              
             const roww = new ActionRowBuilder()
              .addComponents(
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_logsadm`)
                  .setLabel('Configurar Logs Adm')
                  .setEmoji(`1136607333204643931`)
                  .setStyle(1),
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_logspublica`)
                  .setLabel('Configurar Logs Pública')
                  .setEmoji(`1136607333204643931`)
                  .setStyle(1),
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_altcategoriacar`)
                  .setLabel('Alterar Categoria dos Carrinhos')
                  .setEmoji(`1136607333204643931`)
                  .setStyle(1),
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_cargocliente`)
                  .setLabel('Alterar Cargo Cliente')
                  .setEmoji(`1136607333204643931`)
                  .setStyle(1),
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_voltarbotconfig`)
                   .setLabel(`Voltar`)
                   .setEmoji('⬅️')
                   .setStyle(2),
              )
              
             interaction.message.edit({ embeds: [embed], components: [roww] })
          }
       }
       
       
       if (interaction.isModalSubmit()) {
          if (interaction.customId.endsWith("modaltermos")) {
             const novo = interaction.fields.getTextInputValue("novo")
             
             General.set(`termos`, novo)
             interaction.reply({ content: `CERTO: Você alterou o TERMO de comprade sua LOJA.`, ephemeral: true })
          }
          
          if (interaction.customId.endsWith("modaltempopagar")) {
             const novo = interaction.fields.getTextInputValue("novotempo")
             
             if (isNaN(novo) == true) return interaction.reply({ content: `${emoji.get(`emojix`)} | Tempo inválido!`, ephemeral: true })
             
             if (novo < 5) return interaction.reply({ content: `${emoji.get(`emojix`)} | O tempo deve ser acima de 5 minutos!`, ephemeral: true })
             
             General.set(`paymentauto.tempopagar`, novo)
             interaction.reply({ content: `${emoji.get(`certo`)} | Tempo para pagar alterado para ${novo} minutos!`, ephemeral: true })
             embedmp()
          }
          
          if (interaction.customId.endsWith("modalaccesstoken")) {
             const novo = interaction.fields.getTextInputValue("novotoken")
             
             const msg = await interaction.deferReply({ ephemeral: true })
             
             try {
             const response = await axios.get('https://api.mercadopago.com/users/me', {
               headers: {
                 Authorization: `Bearer ${novo}`
               }
             })
             
             if (response.status == 200) {
               General.set(`paymentauto.access_token`, novo)
               await msg.edit({ content: `${emoji.get(`certo`)} | Access Token alterado com sucesso!`, ephemeral: true })
             } else if (response.status == 400) {
               await msg.edit({ content: `${emoji.get(`alerta`)} | Access Token inválido!\n- MercadoPagoError: Must provide your acess-token to proceed!\n- Tutorial para pegar o Access Token: [Clique Aqui](https://youtu.be/w7kyGZUrkVY?si=RfGC7_MundXppWMl)\n> Lembre-se de cadastrar uma chave pix na sua conta mercado pago!`, ephemeral: true })
             }
             } catch (error) {
               if (error.response && error.response.status == 400) {
                 await msg.edit({ content: `${emoji.get(`alerta`)} | Access Token inválido!\n- MercadoPagoError: Must provide your acess-token to proceed!\n- Tutorial para pegar o Access Token: [Clique Aqui](https://youtu.be/w7kyGZUrkVY?si=RfGC7_MundXppWMl)\n> Lembre-se de cadastrar uma chave pix na sua conta mercado pago!`, ephemeral: true })
               } else {
                 await msg.edit({ content: `${emoji.get(`alerta`)} | Ocorreu um erro ao pegar as informações\nErro: ${error.message || error.toString() || "Erro desconhecido"}`, ephemeral: true })
               }
             }
          }
          
          if (interaction.customId.endsWith("modalbloquearbanco")) {
            const banco = interaction.fields.getTextInputValue('banco')
            
            if (banco.toLowerCase().includes('Nubank')) {
              General.set(`bancos_bloqueados.Nu Pagamentos S.A.`, 'Nu Pagamentos S.A.')
              await interaction.reply({
                content: `${emoji.get(`certo`)} | Banco \`${banco}\` bloqueado com sucesso!`,
                ephemeral: true
              })
              return;
            }
            
            General.set(`bancos_bloqueados.${banco}`, banco)
            await interaction.reply({
              content: `${emoji.get(`certo`)} | Banco \`${banco}\` bloqueado com sucesso!`,
              ephemeral: true
            })
          }
          
          if (interaction.customId.endsWith("modalbonusdeposito")) {
             const p1 = interaction.fields.getTextInputValue("porcentagem")
             const p2 = interaction.fields.getTextInputValue("valormin")
             
             if (isNaN(p1) == true || isNaN(p2) == true) return interaction.reply({ content: `ERROR: você inseriu em seus VALORES alguma letra`, ephemeral: true })
             
             General.set(`saldo.bonus`, p1)
             General.set(`saldo.minimo`, p2)
             interaction.reply({ content: `${emoji.get(`certo`)} | Você alterou o bonus do saldo.`, ephemeral: true })
             embedsaldo()
          }
          
          if (interaction.customId.endsWith("modalchavepix")) {
             const novo = interaction.fields.getTextInputValue("novo")
             const nova = interaction.fields.getTextInputValue("novoo")
             
             General.set(`paymentsemi.chavepix`, novo)
             General.set(`paymentsemi.tipochave`, nova)
             embedsemi()
          }
          
          if (interaction.customId.endsWith("modalqrcode")) {
             const novo = interaction.fields.getTextInputValue("novo")
             
             if (!link(novo)) return interaction.reply({ content: `${emoji.get(`emojix`)} | Qr Code Invalido!`, ephemeral: true })
             
             General.set(`paymentsemi.qrcode`, novo)
             embedsemi()
          }
          
          /*
          function toMilliseconds(time) {
            let ms = 0;
            if (time.endsWith('s')) {
              ms = parseInt(time.slice(0, -1)) * 1000
            } else if (time.endsWith('m')) {
              ms = parseInt(time.slice(0, -1)) * 60 * 1000
            } else if (time.endsWith('h')) {
              ms = parseInt(time.slice(0, -1)) * 60 * 60 * 1000
            } else if (time.endsWith('m')) {
              ms = parseInt(time.slice(0, -1)) * 24 * 60 * 60 * 1000
            }
            return ms
          }
          */
          function link(n) {
              const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;
              return urlRegex.test(n)
           }
          
          function embedmp() {
            const embed2 = new EmbedBuilder()
             .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
             .setDescription(`${emoji.get(`comprimento`)} **| Configurar Mercado Pago**\n\n${emoji.get(`link`)} | Pix: ${General.get(`paymentauto.pix`)}\n${emoji.get(`comprimento`)} | Pagar pelo Site: ${General.get(`paymentauto.pagarsite`)}\n${emoji.get(`relogio`)} | Tempo máximo para pagar: ${General.get(`paymentauto.tempopagar`)} Minutos\n${emoji.get(`config`)} | Access Token: ${General.get(`paymentauto.access_token`) == '' ? `Não definido` : `||${General.get(`paymentauto.access_token`)}||`}`)
             .setColor(General.get(`color.padrao`))
                
           interaction.message.edit({ embeds: [embed2] })
       }
       
       function embedsaldo() {
         const embed = new EmbedBuilder()
          .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
          .setDescription(`${emoji.get(`saco`)} **| Configurar Sistema de Saldo**\n\nSistema de Saldo: ${General.get(`saldo.saldo`)}\nBônus depósito: ${General.get(`saldo.bonus`)}%\nValor minimo para depósito: R$${General.get(`saldo.minimo`)}`)
          .setColor(General.get(`color.padrao`))
          
         interaction.message.edit({ embeds: [embed] })
       }
       
       function embedsemi() {
           const embed = new EmbedBuilder()
            .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
            .setDescription(`${emoji.get(`martelo`)} **| Sistema de Pagamento Semi Automático.**\n\n${emoji.get(`config`)} | Sistema: ${General.get(`paymentsemi.pix`)}\n${emoji.get(`link`)} | Chave Pix: ${General.get(`paymentsemi.chavepix`) == '' ? `Não definido` : General.get(`paymentsemi.chavepix`)}\n${emoji.get(`tabela`)} | Qr Code: ${General.get(`paymentsemi.qrcode`) == '' ? `Não definido` : `[QrCode](${General.get(`paymentsemi.qrcode`)})`}`)
            .setColor(General.get(`color.padrao`))
                
         interaction.update({ embeds: [embed] })
      }
       }
       
       if (interaction.isUserSelectMenu()) {
         if (interaction.customId.endsWith("_addblack")) {
           interaction.deferUpdate()
           if (interaction.user.id != interaction.customId.split("_")[0]) return
            
           const user = interaction.guild.members.cache.get(interaction.values[0])
           
           if (General.get(`blacklist`)?.includes(user.id)) {
             General.pull(`blacklist`, (element) => element == user.id)
           } else {
             General.push(`blacklist`, user.id)
           }
           
           embedblacklist()
         }
         
         if (interaction.customId.endsWith("_delblack")) {
           interaction.deferUpdate()
           if (interaction.user.id != interaction.customId.split("_")[0]) return
            
           const user = interaction.guild.members.cache.get(interaction.values[0])
           
           if (General.get(`blacklist`)?.includes(user.id)) {
             General.pull(`blacklist`, (element) => element == user.id)
           }
           
           embedblacklist()
         }
       }
       
       if (interaction.isModalSubmit()) {
          
          if (interaction.customId.endsWith("modalnomebot")) {
             const nome = interaction.fields.getTextInputValue("nome")
             
             await interaction.client.user.setUsername(nome)
             interaction.reply({ content: `${emoji.get(`certo`)} | Nome do Bot alterado!`, ephemeral: true })
             
             attembed()
          }
          
          if (interaction.customId.endsWith("modalavatarbot")) {
             const avatar = interaction.fields.getTextInputValue("avatar")
             
             if (!link(avatar)) return interaction.reply({ content: `${emoji.get(`emojix`)} | Link do avatar inválido!`, ephemeral: true })
             
             await interaction.client.user.setAvatar(avatar)
             interaction.reply({ content: `${emoji.get(`certo`)} | Avatar do Bot alterado!`, ephemeral: true })
             
             attembed()
          }
          
          if (interaction.customId.endsWith("modalcorbot")) {
             const cor = interaction.fields.getTextInputValue("color")
             
             if (!corregex(cor)) return interaction.reply({ content: `${emoji.get(`emojix`)} | Cor HEX inválida!`, ephemeral: true })
             
             General.set(`color.padrao`, cor)
             interaction.reply({ content: `${emoji.get(`certo`)} | Cor Padrão do Bot alterado!`, ephemeral: true })
             
             attembed()
          }
          
          if (interaction.customId.endsWith("modalstatusbot")) {
             const presence = interaction.fields.getTextInputValue("presenca")
             const atividade = interaction.fields.getTextInputValue("atividade")
             const texto = interaction.fields.getTextInputValue("texto")
             const url = interaction.fields.getTextInputValue("url")
             
             switch (presence) {
                case 'Online':
                  General.set(`status.presence`, 'online');
                  break;
                case 'Ausente':
                  General.set(`status.presence`, 'idle');
                  break;
                case 'Invisivel':
                  General.set(`status.presence`, 'invisible');
                  break;
                case 'Não Perturbar':
                  General.set(`status.presence`, 'dnd');
                  break;
                default: 
                  return interaction.reply({ content: `ERROR: Você inseriu um TIPO incorreto de STATUS`, ephemeral: true })
             }
             
             switch (atividade) {
                case 'Jogando':
                  General.set(`status.atividade`, 'Playing');
                  break;
                case 'Ouvindo':
                  General.set(`status.atividade`, 'Listening');
                  break;
                case 'Assistindo':
                  General.set(`status.atividade`, 'Watching');
                  break;
                case 'Transmitindo':
                  if (url != null) {
                    if (!link(url)) return interaction.reply({ content: `${emoji.get(`emojix`)} | Link da url inválido!`, ephemeral: true })
                    
                    General.set(`status.atividade`, 'Streaming');
                    General.set(`status.url`, url)
                  }
                  break;
                default: 
                  return interaction.reply({ content: `ERROR: Você inseriu um TIPO incorreto de STATUS`, ephemeral: true })
             }
             
             General.set(`status.texto`, texto);
             interaction.reply({ content: `${emoji.get(`certo`)} | Status do bot alterado com sucesso!`, ephemeral: true })
             
             attembed()
          }
          
          if (interaction.customId.endsWith("modalbannerbot")) {
             const banner = interaction.fields.getTextInputValue("banner")
             
             if (!link(banner)) return interaction.reply({ content: `${emoji.get(`emojix`)} | Link do banner inválido!`, ephemeral: true })
             
             General.set(`images.banner`, banner)
             interaction.reply({ content: `${emoji.get(`certo`)} | Banner do Bot alterado!`, ephemeral: true })
             
             attembed()
          }
          
          if (interaction.customId.endsWith("modalthumbbot")) {
             const thumb = interaction.fields.getTextInputValue("thumb")
             
             if (!link(thumb)) return interaction.reply({ content: `${emoji.get(`emojix`)} | Link da miniatura inválida!`, ephemeral: true })
             
             General.set(`images.thumbnail`, thumb)
             interaction.reply({ content: `${emoji.get(`certo`)} | Miniatura do Bot alterado!`, ephemeral: true })
             
             attembed()
          }
          
          function attembed() {
            const embed2 = new EmbedBuilder()
             .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
             .setDescription(`Nome Atual: **${interaction.client.user.username}**\nAvatar Atual: [Avatar](${interaction.client.user.displayAvatarURL({ dynamic: true })})\nCor Padrão do Bot Atual: ${General.get(`color.padrao`)}\nBanner Defalt do BOT: ${General.get(`images.banner`) == '' ? `Não definido!` : `[Banner](${General.get(`images.banner`)})`}\nMiniatura Defalt do BOT: ${General.get(`images.banner`) == '' ? `Não definido!` : `[Miniatura](${General.get(`images.thumbnail`)})`}\n\n**Você pode configurar o bot usando os botões abaixo:**`)
             .setColor(General.get(`color.padrao`))
             
             interaction.message.edit({ embeds: [embed2] })
          }
          
          function link(n) {
             const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;
             return urlRegex.test(n)
          }
          function corregex(cor) {
             const corRegex = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/
             return corRegex.test(cor)
          }  
       }
       
       
       if (interaction.isChannelSelectMenu()) {
          if (interaction.customId.endsWith("_altlogsadm")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return
             
             General.set(`canais.logs_adm`, interaction.values[0])
             
             embedcanal2()
          }
          
          if (interaction.customId.endsWith("_altlogspublica")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return
             
             General.set(`canais.logs_publica`, interaction.values[0])
             
             embedcanal2()
          }
          
          if (interaction.customId.endsWith("_altcategoriaselect")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return
             
             General.set(`canais.categoria`, interaction.values[0])
             
             embedcanal2()
          }
       }
       
       if (interaction.isRoleSelectMenu()) {
          if (interaction.customId.endsWith("_altcargocliente")) {
             interaction.deferUpdate()
             if (interaction.user.id != interaction.customId.split("_")[0]) return
             
             General.set(`canais.cargo_cliente`, interaction.values[0])
             
             embedcanal2()
          }
       }
       
       if (interaction.isStringSelectMenu()) {
         
         if (interaction.customId.endsWith("_blockbancos")) {
           interaction.deferUpdate()
           if (interaction.user.id != interaction.customId.split("_")[0]) return;
           
           const selectedValues = interaction.values;
           
           for (const value of selectedValues) {
             if (Object.keys(General.get(`bancos_bloqueados`))?.includes(value)) {
               General.delete(`bancos_bloqueados.${value}`)
             }
             
             General.delete(`bancos_bloqueados.nenhum`)
             General.set(`bancos_bloqueados.${value}`, value)
           }
           
           embedmp2(interaction.message)
         }
         
       }
       
       function embedcanal2() {
             const embed = new EmbedBuilder()
              .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
              .setDescription(`Canal de Logs Adm Atual: ${interaction.guild.channels.cache.get(General.get(`canais.logs_adm`)) || "Não configurado"}\nCanal de Logs Públicas Atual: ${interaction.guild.channels.cache.get(General.get(`canais.logs_publica`)) || "Não configurado"}\nCategoria de Carrinhos Atual: ${interaction.guild.channels.cache.get(General.get(`canais.categoria`)) || "Não configurado"}\nCargo Cliente Atual: ${interaction.guild.roles.cache.get(General.get(`canais.cargo_cliente`)) || "Não configurado "}\n\n**Você pode configurar os canais utilizando os botões abaixo:**`)
              .setColor(General.get(`color.padrao`))
              
             const roww = new ActionRowBuilder()
              .addComponents(
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_logsadm`)
                  .setLabel('Configurar Logs Adm')
                  .setEmoji(`1136607333204643931`)
                  .setStyle(1),
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_logspublica`)
                  .setLabel('Configurar Logs Pública')
                  .setEmoji(`1136607333204643931`)
                  .setStyle(1),
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_altcategoriacar`)
                  .setLabel('Alterar Categoria dos Carrinhos')
                  .setEmoji(`1136607333204643931`)
                  .setStyle(1),
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_cargocliente`)
                  .setLabel('Alterar Cargo Cliente')
                  .setEmoji(`1136607333204643931`)
                  .setStyle(1),
                 new ButtonBuilder()
                   .setCustomId(`${interaction.user.id}_voltarbotconfig`)
                   .setLabel(`Voltar`)
                   .setEmoji('⬅️')
                   .setStyle(2),
              )
              
             interaction.message.edit({ embeds: [embed], components: [roww] })
          }
          
          function embedblacklist() {
            const usersBlack = General.get(`blacklist`)?.map((x, index) => {
              return `**ID: ${index + 1} -** ${interaction.guild.members.cache.get(x) || "Não encontrado"} - \`(${x})\``
            }).join("\n")
            
            const embed = new EmbedBuilder()
            .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
            .setDescription(!General.has('blacklist') || !General.get(`blacklist`).length ? "Nenhum usuário se encontra na BlackList!" : `Usuários que está na BlackList:\n\n${usersBlack}`)
            .setColor(General.get(`color.padrao`))
            
            const row = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
               .setCustomId(`${interaction.user.id}_addblacklist`)
               .setLabel("Adicionar Membro na Black-List")
               .setEmoji(`1141020908069326871`)
               .setStyle(3),
              new ButtonBuilder()
               .setCustomId(`${interaction.user.id}_delblacklist`)
               .setLabel("Remover Membro da Black-List")
               .setEmoji(`1141020948909269054`)
               .setStyle(4),
              new ButtonBuilder()
               .setCustomId(`${interaction.user.id}_voltarbotconfig`)
               .setLabel(`Voltar`)
               .setEmoji('⬅️')
               .setStyle(2)
            )
            
            interaction.message.edit({ content: ``, embeds: [embed], components: [row] })
          }
          
          function embedmp2(msg) {
            const embed2 = new EmbedBuilder()
             .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
             .setDescription(`${emoji.get(`comprimento`)} **| Configurar Mercado Pago**\n\n${emoji.get(`link`)} | Pix: ${General.get(`paymentauto.pix`)}\n${emoji.get(`comprimento`)} | Pagar pelo Site: ${General.get(`paymentauto.pagarsite`)}\n${emoji.get(`relogio`)} | Tempo máximo para pagar: ${General.get(`paymentauto.tempopagar`)} Minutos\n${emoji.get(`config`)} | Access Token: ${General.get(`paymentauto.access_token`) == '' ? `Não definido` : `||${General.get(`paymentauto.access_token`)}||`}\n${emoji.get(`alerta`)} | Bancos Bloqueados: ${Object.entries(General.get(`bancos_bloqueados`)).map(([key, value]) => `${key}`).join(', ') || "Nenhum"}`)
             .setColor(General.get(`color.padrao`))
             
           const roww = new ActionRowBuilder()
              .addComponents(
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_pixonoff`)
                  .setLabel('Pix ON/OFF')
                  .setEmoji(`<a:onoff:1258076650650861661>`)
                  .setStyle(1),
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_siteonoff`)
                  .setLabel('Site ON/OFF')
                  .setEmoji(`<a:onoff:1258076650650861661>`)
                  .setStyle(1),
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_tempopagar`)
                  .setLabel('Tempo para Pagar')
                  .setEmoji(`1136607333204643931`)
                  .setStyle(2),
                 new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_altaccesstoken`)
                  .setLabel('Altera Access Token')
                  .setEmoji(`1136607333204643931`)
                  .setStyle(2),
              )
             
             const roww2 = new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                 .setCustomId(`${interaction.user.id}_bloquearbanco`)
                 .setLabel('Bloquear Bancos')
                 .setEmoji(`1136607825758527529`)
                 .setStyle(2),
                new ButtonBuilder()
                 .setCustomId(`${interaction.user.id}_voltarbotconfig2`)
                 .setLabel(`Voltar`)
                 .setEmoji('⬅️')
                 .setStyle(2),
              )
                
           msg.edit({ content: ``, embeds: [embed2], components: [roww, roww2] })
       }
   }
}