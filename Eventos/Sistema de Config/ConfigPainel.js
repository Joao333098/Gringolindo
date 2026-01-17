const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, StringSelectMenuBuilder, ButtonStyle } = require("discord.js")
const { perms, General, emoji, produto, tema, painel } = require("../../DataBaseJson")
const sessoesUsuario = new Map();
let collector = ''

module.exports = {
   name: "interactionCreate",
   run: async(interaction, client) => {
      // Verificar se a interação já foi respondida
      if (interaction.replied || interaction.deferred) {
         return;
      }
      
      if (interaction.isButton()) {
        const id = interaction.customId.split("_")[1]
        
        if (interaction.customId.endsWith("_configembed")) {
           interaction.deferUpdate()
           if (interaction.user.id != interaction.customId.split("_")[0]) return
           
           const fernanda = painel.get(id)
           const embednew = new EmbedBuilder()
            .setTitle(`Titulo atual: ${fernanda.titulo}`)
            .setDescription(`${emoji.get(`desc`)} **| Descrição Atual:**\n${fernanda.desc}\n\n${emoji.get(`cor`)} Cor da Embed: ${fernanda.cor}\n${emoji.get(`caderno`)} | Texto do Place Holder: ${fernanda.placeholder}\n${emoji.get(`pasta`)} | Banner: ${fernanda.banner == "null" ? `Painel sem Banner` : `[Banner](${fernanda.banner})`}\n${emoji.get(`quadro`)} | Miniatura: ${fernanda.thumb == "null" ? `Painel sem Miniatura` : `[Miniatura](${fernanda.thumb})`}`)
            .setColor(General.get(`color.padrao`))
            .setFooter({ text: `Rodapé atual: ${fernanda.rodape == "null" ? `Sem rodapé` : fernanda.rodape}.`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
            
           const rownew = new ActionRowBuilder()
            .addComponents(
               new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${id}_alttitulopainel`)
                .setLabel('Titulo da embed')
                .setEmoji(`1136607333204643931`)
                .setStyle(1),
               new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${id}_altdescpainel`)
                .setLabel('Descrição da embed')
                .setEmoji(`1136607333204643931`)
                .setStyle(1),
               new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${id}_altrodapepainel`)
                .setLabel('Rodapé da embed')
                .setEmoji(`1136607333204643931`)
                .setStyle(1),
               new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${id}_altplacepainel`)
                .setLabel('Place Holder')
                .setEmoji(`1136607333204643931`)
                .setStyle(1),
            )
            
           const rownew2 = new ActionRowBuilder()
            .addComponents(
               new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${id}_altcorpainel`)
                .setLabel('Cor Embed')
                .setEmoji(`🖌️`)
                .setStyle(1),
               new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${id}_altbannerpainel`)
                .setLabel('Banner')
                .setEmoji(`🖼️`)
                .setStyle(1),
               new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${id}_altthumbpainel`)
                .setLabel('Miniatura')
                .setEmoji(`🖼️`)
                .setStyle(1),
               new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${id}_attpainel`)
                .setLabel('Atualizar Painel')
                .setEmoji(`1148666021041950790`)
                .setStyle(1),
               new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${id}_voltarpainel`)
                .setLabel('Voltar')
                .setEmoji(`⬅️`)
                .setStyle(1),
            )
            
           interaction.message.edit({ embeds: [embednew], components: [rownew, rownew2] })
        }
        
        if (interaction.customId.endsWith("_configproduto")) {
           interaction.deferUpdate()
           if (interaction.user.id != interaction.customId.split("_")[0]) return
           
           const produtospainel = painel.get(`${id}.produtos`).map((product, index) => {
             return `${produto.get(`${product}.emoji`) || `🛒`} **| __${index+1}°__** - ${emoji.get(`caixa`)} | **ID:** ${product}`
           }).join('\n')
           
           const products = []
           painel.get(`${id}.produtos`).forEach(x => {
             const info = produto.get(x)
             products.push({
               label: info.nome,
               description: `💸 | Valor: R$${Number(info.preco).toFixed(2)} - 📦 | Estoque: ${info.estoque.length}`,
               emoji: info.emoji || "<:carrinho_Lgt:1161241239182651413>",
               value: `${interaction.user.id}_${x}_altemoji`
             })
           })
           
           const embednew = new EmbedBuilder()
            .setTitle('Estes são os produtos cadastrados no Painel:')
            .setDescription(produtospainel)
            .setColor(General.get(`color.padrao`))
            .setFooter({ text: `Caso queira trocar o emoji de algum produto, selecione ele no select menu abaixo:`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
            
           const rownew = new ActionRowBuilder()
            .addComponents(
               new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${id}_addprodutopainel`)
                .setLabel('Adicionar Produto')
                .setEmoji(`1141020908069326871`)
                .setStyle(3),
               new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${id}_delprodutopainel`)
                .setLabel('Remover Produto')
                .setEmoji(`1141020948909269054`)
                .setStyle(2),
               new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${id}_altsequencia`)
                .setLabel('Alterar Sequência')
                .setEmoji('💾')
                .setStyle(1),
            )
            
           const rownew2 = new ActionRowBuilder()
            .addComponents(
               new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${id}_attpainel`)
                .setLabel('Atualizar Painel')
                .setEmoji(`1148666021041950790`)
                .setStyle(1),
               new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${id}_voltarpainel`)
                .setLabel('Voltar')
                .setEmoji(`⬅️`)
                .setStyle(1),
            )
            
           const rowprodutos = new ActionRowBuilder()
            .addComponents(
               new StringSelectMenuBuilder()
                .setCustomId(`${interaction.user.id}_${id}_altemoji`)
                .setPlaceholder('Selecione o Produto para alterar o Emoji')
                .addOptions(products)
            )
            
           interaction.message.edit({ embeds: [embednew], components: [rownew, rowprodutos, rownew2] })
        }
        
        if (interaction.customId.endsWith("_attpainel")) {
            if (interaction.user.id != interaction.customId.split("_")[0]) return interaction.deferUpdate()
            
            // Deferir resposta para permitir tempo de coleta
            await interaction.deferReply({ ephemeral: true });

            const info = painel.get(id)
            
            // Objeto com a configuração atual do painel
            const configAtual = {
                titulo: info.titulo,
                desc: info.desc,
                cor: info.cor,
                placeholder: info.placeholder,
                banner: info.banner,
                thumb: info.thumb,
                rodape: info.rodape
            };

            const jsonString = JSON.stringify(configAtual, null, 2);
            
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`${interaction.user.id}_${id}_confirmar_att_json`)
                    .setLabel('Confirmar Atualização')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`${interaction.user.id}_${id}_cancelar_att_json`)
                    .setLabel('Cancelar')
                    .setStyle(ButtonStyle.Danger)
            );

            await interaction.editReply({
                content: `📝 **Configuração Atual do Painel (JSON):**\n\`\`\`json\n${jsonString}\n\`\`\`\n\nEnvie o **NOVO JSON** com as alterações no chat agora.\n*O bot irá atualizar a mensagem oficial após a sua confirmação.*`,
                components: [row]
            });

            const filter = m => m.author.id === interaction.user.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 300000 });

            collector.on('collect', async (message) => {
                try {
                    const novoJson = JSON.parse(message.content);
                    
                    sessoesUsuario.set(interaction.user.id, { 
                        painel_id: id,
                        dados_atualizar: novoJson 
                    });

                    await message.delete().catch(() => {});
                    await interaction.editReply({
                        content: `✅ **JSON recebido!** Verifique as alterações e clique em **Confirmar Atualização** para aplicar na mensagem oficial do canal.`,
                        components: [row]
                    });
                } catch (e) {
                    await interaction.followUp({ content: '❌ JSON inválido! Certifique-se de manter o formato correto.', ephemeral: true });
                }
            });
        }

        if (interaction.customId.endsWith("_confirmar_att_json")) {
            if (interaction.user.id != interaction.customId.split("_")[0]) return interaction.deferUpdate();
            
            const sessao = sessoesUsuario.get(interaction.user.id);
            if (!sessao || !sessao.dados_atualizar) return interaction.reply({ content: '❌ Nenhuma alteração pendente.', ephemeral: true });

            const painelId = sessao.painel_id;
            const dados = sessao.dados_atualizar;

            // Atualizar banco de dados
            if (dados.titulo) painel.set(`${painelId}.titulo`, dados.titulo);
            if (dados.desc) painel.set(`${painelId}.desc`, dados.desc);
            if (dados.cor) painel.set(`${painelId}.cor`, dados.cor);
            if (dados.placeholder) painel.set(`${painelId}.placeholder`, dados.placeholder);
            if (dados.banner) painel.set(`${painelId}.banner`, dados.banner);
            if (dados.thumb) painel.set(`${painelId}.thumb`, dados.thumb);
            if (dados.rodape) painel.set(`${painelId}.rodape`, dados.rodape);

            // Código original de atualização da mensagem física
            const info = painel.get(painelId);
            const embed = new EmbedBuilder()
                .setTitle(info.titulo)
                .setDescription(info.desc)
                .setColor(info.cor);
            
            if (info.banner != "null") embed.setImage(info.banner);
            if (info.thumb != "null") embed.setThumbnail(info.thumb);
            if (info.rodape != "null") embed.setFooter({ text: info.rodape });

            const products = [];
            painel.get(`${painelId}.produtos`).forEach(x => {
                const infoProd = produto.get(x);
                products.push({
                    label: infoProd.nome,
                    description: `💸 | Valor: R$${Number(infoProd.preco).toFixed(2)} - 📦 | Estoque: ${infoProd.estoque.length}`,
                    emoji: infoProd.emoji || "<:carrinho_Lgt:1161241239182651413>",
                    value: `${x}_comprar`
                });
            });

            const rowprodutos = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`${painelId}_comprar`)
                    .setPlaceholder(info.placeholder)
                    .addOptions(products)
            );

            try {
                const canal = interaction.guild.channels.cache.get(info.idcanal);
                const message = await canal.messages.fetch(info.idmsg);
                await message.edit({ embeds: [embed], components: [rowprodutos] });
                
                await interaction.update({ content: `${emoji.get(`certo`)} | Mensagem do painel atualizada com sucesso!`, components: [] });
            } catch (error) {
                await interaction.update({ content: `${emoji.get(`alerta`)} | Erro ao atualizar a mensagem no canal!\nError: \`${error.message}\``, components: [] });
            }
            
            sessoesUsuario.delete(interaction.user.id);
        }

        if (interaction.customId.endsWith("_cancelar_att_json")) {
            if (interaction.user.id != interaction.customId.split("_")[0]) return interaction.deferUpdate();
            sessoesUsuario.delete(interaction.user.id);
            await interaction.update({ content: '❌ Atualização cancelate.', components: [] });
        }
        
        if (interaction.customId.endsWith("_delpainel")) {
           if (interaction.user.id != interaction.customId.split("_")[0]) return interaction.deferUpdate()
           
           const modal = new ModalBuilder()
           .setCustomId(`${id}_modaldelpainel`)
           .setTitle('Confirmar')
           
           const text = new TextInputBuilder()
           .setCustomId('novo')
           .setLabel('Para continuar escreva: "SIM"')
           .setPlaceholder('SIM')
           .setRequired(true)
           .setStyle(1)
           
           modal.addComponents(new ActionRowBuilder().addComponents(text))
           
           interaction.showModal(modal)
        }
        
        if (interaction.customId.endsWith("_alttitulopainel")) {
           interaction.deferUpdate()
           if (interaction.user.id != interaction.customId.split("_")[0]) return
           
           const fernanda = painel.get(id)
           const embed2 = new EmbedBuilder()
            .setTitle(`${interaction.client.user.username} | Gerenciar Painel`)
            .setDescription(`**Título atual:**\n${fernanda.titulo}\nEnvie o novo título abaixo:`)
            .setColor(General.get(`color.padrao`))
            
           const rowcancelar = new ActionRowBuilder()
             .addComponents(
                new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_cancelarcoletor2`)
                  .setLabel('Cancelar')
                  .setEmoji(`1136612240217346092`)
                  .setStyle(4)
             )
           
            interaction.message.edit({ embeds: [embed2], components: [rowcancelar] })
            
            const collectorFilter = response => {
               return response.author.id === interaction.user.id;
             };
             collector = await interaction.channel.createMessageCollector({ filter: collectorFilter, max: 1, time: 120000 });
             collector.on('collect', async (message) => {
                painel.set(`${id}.titulo`, message.content)
                message.delete()
                embedpainel()
             })
        }
        
        if (interaction.customId.endsWith("_altdescpainel")) {
           interaction.deferUpdate()
           if (interaction.user.id != interaction.customId.split("_")[0]) return
           
           const fernanda = painel.get(id)
           const embed2 = new EmbedBuilder()
            .setTitle(`${interaction.client.user.username} | Gerenciar Painel`)
            .setDescription(`**Descrição atual:**\n${fernanda.desc}\nEnvie a nova descrição abaixo:`)
            .setColor(General.get(`color.padrao`))
            
           const rowcancelar = new ActionRowBuilder()
             .addComponents(
                new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_${id}_cancelarcoletor2`)
                  .setLabel('Cancelar')
                  .setEmoji(`1136612240217346092`)
                  .setStyle(4)
             )
           
            interaction.message.edit({ embeds: [embed2], components: [rowcancelar] })
            
            const collectorFilter = response => {
               return response.author.id === interaction.user.id;
             };
             collector = await interaction.channel.createMessageCollector({ filter: collectorFilter, max: 1, time: 120000 });
             collector.on('collect', async (message) => {
                painel.set(`${id}.desc`, message.content)
                message.delete()
                embedpainel()
             })
        }
        
        if (interaction.customId.endsWith("_altrodapepainel")) {
           interaction.deferUpdate()
           if (interaction.user.id != interaction.customId.split("_")[0]) return
           
           const fernanda = painel.get(id)
           const embed2 = new EmbedBuilder()
            .setTitle(`${interaction.client.user.username} | Gerenciar Painel`)
            .setDescription(`**Rodapé atual:**\n${fernanda.rodape == "null" ? `Sem rodapé` : fernanda.rodape}\nEnvie o novo rodapé abaixo:\n**Obs: Caso queira remover envie "remover"**`)
            .setColor(General.get(`color.padrao`))
            
           const rowcancelar = new ActionRowBuilder()
             .addComponents(
                new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_${id}_cancelarcoletor2`)
                  .setLabel('Cancelar')
                  .setEmoji(`1136612240217346092`)
                  .setStyle(4)
             )
           
            interaction.message.edit({ embeds: [embed2], components: [rowcancelar] })
            
            const collectorFilter = response => {
               return response.author.id === interaction.user.id;
             };
             collector = await interaction.channel.createMessageCollector({ filter: collectorFilter, max: 1, time: 120000 });
             collector.on('collect', async (message) => {
                message.delete()
                if (message.content == "remover") {
                  painel.set(`${id}.rodape`, "null")
                  embedpainel()
                  return
                }
                painel.set(`${id}.rodape`, message.content)
                embedpainel()
             })
        }
        
        if (interaction.customId.endsWith("_altplacepainel")) {
            if (interaction.user.id != interaction.customId.split("_")[0]) return interaction.deferUpdate()
            
            const modal = new ModalBuilder()
            .setCustomId(`${id}_modalplaceholder`)
            .setTitle('Alterar Texto do Place Holder')
            
            const text = new TextInputBuilder()
            .setCustomId('novo')
            .setLabel('Novo Texto do Place Holder:')
            .setPlaceholder('Ex: Selecione um Produto')
            .setRequired(true)
            .setStyle(1)
            
            modal.addComponents(new ActionRowBuilder().addComponents(text))
            
            interaction.showModal(modal)
        }
        
        if (interaction.customId.endsWith("_altcorpainel")) {
            if (interaction.user.id != interaction.customId.split("_")[0]) return interaction.deferUpdate()
            
            const modal = new ModalBuilder()
            .setCustomId(`${id}_modalcorpainel`)
            .setTitle('Alterar Cor do Painel')
            
            const text = new TextInputBuilder()
            .setCustomId('novo')
            .setLabel('Nova Cor:')
            .setPlaceholder('Ex: #ff0000')
            .setRequired(true)
            .setStyle(1)
            
            modal.addComponents(new ActionRowBuilder().addComponents(text))
            
            interaction.showModal(modal)
        }
        
        if (interaction.customId.endsWith("_altbannerpainel")) {
            if (interaction.user.id != interaction.customId.split("_")[0]) return interaction.deferUpdate()
            
            const modal = new ModalBuilder()
            .setCustomId(`${id}_modalbannerpainel`)
            .setTitle('Alterar Banner do Painel')
            
            const text = new TextInputBuilder()
            .setCustomId('novo')
            .setLabel('Link do Novo Banner:')
            .setPlaceholder('Caso queira remover, digite "remover"')
            .setRequired(true)
            .setStyle(1)
            
            modal.addComponents(new ActionRowBuilder().addComponents(text))
            
            interaction.showModal(modal)
        }
        
        if (interaction.customId.endsWith("_altthumbpainel")) {
            if (interaction.user.id != interaction.customId.split("_")[0]) return interaction.deferUpdate()
            
            const modal = new ModalBuilder()
            .setCustomId(`${id}_modalthumbpainel`)
            .setTitle('Alterar Miniatura do Painel')
            
            const text = new TextInputBuilder()
            .setCustomId('novo')
            .setLabel('Link da Nova Miniatura:')
            .setPlaceholder('Caso queira remover, digite "remover"')
            .setRequired(true)
            .setStyle(1)
            
            modal.addComponents(new ActionRowBuilder().addComponents(text))
            
            interaction.showModal(modal)
        }
        
        if (interaction.customId.endsWith("_addprodutopainel")) {
           if (interaction.user.id != interaction.customId.split("_")[0]) return interaction.deferUpdate()
           
           if (painel.get(`${id}.produtos`).length >= 25) return interaction.reply({ content: `${emoji.get(`emojix`)} | Máximo de produtos atingido (25 produtos por painel)!`, ephemeral: true })
           
           interaction.deferUpdate()
           const embed2 = new EmbedBuilder()
            .setTitle(`${interaction.client.user.username} | Gerenciar Painel`)
            .setDescription(`Envie o ID do produto que deseja adicionar no painel:`)
            .setColor(General.get(`color.padrao`))
            
           const rowcancelar = new ActionRowBuilder()
             .addComponents(
                new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_${id}_cancelarcoletor3`)
                  .setLabel('Cancelar')
                  .setEmoji(`1136612240217346092`)
                  .setStyle(4)
             )
           
            interaction.message.edit({ embeds: [embed2], components: [rowcancelar] })
            
            const collectorFilter = response => {
               return response.author.id === interaction.user.id;
             };
             collector = await interaction.channel.createMessageCollector({ filter: collectorFilter, max: 1, time: 120000 });
             collector.on('collect', async (message) => {
                message.delete()
                
                if (!produto.has(message.content)) {
                  interaction.channel.send(`${emoji.get(`emojix`)}| Error: Produto Inexistente!`).then(msg => { setTimeout(() => { msg.delete() }, 4000)})
                  embedprodutos()
                  return
                }
                
                if (painel.get(`${id}.produtos`).includes(message.content)) {
                  interaction.channel.send(`${emoji.get(`emojix`)}| Error: Produto já está cadastrado nesse painel!`).then(msg => { setTimeout(() => { msg.delete() }, 4000)})
                  embedprodutos()
                  return
                }
                
                painel.push(`${id}.produtos`, message.content)
                interaction.channel.send(`${emoji.get(`certo`)}| Produto ID \`${message.content}\` adicionado no painel.`).then(msg => { setTimeout(() => { msg.delete() }, 4000)})
                embedprodutos()
             })
        }
        
        if (interaction.customId.endsWith("_delprodutopainel")) {
           if (interaction.user.id != interaction.customId.split("_")[0]) return interaction.deferUpdate()
           
           if (painel.get(`${id}.produtos`).length <= 1) return interaction.reply({ content: `${emoji.get(`emojix`)} | O painel precisa ter no mínimo 1 produto!`, ephemeral: true })
           
           interaction.deferUpdate()
           const embed2 = new EmbedBuilder()
            .setTitle(`${interaction.client.user.username} | Gerenciar Painel`)
            .setDescription(`Envie o ID do produto que deseja remover no painel:`)
            .setColor(General.get(`color.padrao`))
            
           const rowcancelar = new ActionRowBuilder()
             .addComponents(
                new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_${id}_cancelarcoletor3`)
                  .setLabel('Cancelar')
                  .setEmoji(`1136612240217346092`)
                  .setStyle(4)
             )
           
            interaction.message.edit({ embeds: [embed2], components: [rowcancelar] })
            
            const collectorFilter = response => {
               return response.author.id === interaction.user.id;
             };
             collector = await interaction.channel.createMessageCollector({ filter: collectorFilter, max: 1, time: 120000 });
             collector.on('collect', async (message) => {
                message.delete()
                
                if (!produto.has(message.content)) {
                  interaction.channel.send(`${emoji.get(`emojix`)}| Error: Produto Inexistente!`).then(msg => { setTimeout(() => { msg.delete() }, 4000)})
                  embedprodutos()
                  return
                }
                
                if (!painel.get(`${id}.produtos`).includes(message.content)) {
                  interaction.channel.send(`${emoji.get(`emojix`)}| Error: Produto não está cadastrado nesse painel!`).then(msg => { setTimeout(() => { msg.delete() }, 4000)})
                  embedprodutos()
                  return
                }
                
                painel.pull(`${id}.produtos`, (element) => element == message.content)
                interaction.channel.send(`${emoji.get(`certo`)}| Produto ID \`${message.content}\` removido no painel.`).then(msg => { setTimeout(() => { msg.delete() }, 4000)})
                embedprodutos()
             })
        }
        
        if (interaction.customId.endsWith("_altsequencia")) {
            if (interaction.user.id != interaction.customId.split("_")[0]) return interaction.deferUpdate()
            
            const modal = new ModalBuilder()
            .setCustomId(`${id}_modalaltsequencia`)
            .setTitle('✏️ | Alterar Posição')
            
            const text = new TextInputBuilder()
            .setCustomId('ide')
            .setLabel('ID DO PRODUTO:')
            .setPlaceholder('Coloque o id do produto aqui.')
            .setRequired(true)
            .setStyle(1)
            
            const text2 = new TextInputBuilder()
            .setCustomId('nova')
            .setLabel('NOVA POSIÇÃO:')
            .setPlaceholder('Ex: 1')
            .setRequired(true)
            .setStyle(1)
            
            modal.addComponents(new ActionRowBuilder().addComponents(text), new ActionRowBuilder().addComponents(text2))
            
            interaction.showModal(modal)
        }
        
        if (interaction.customId.endsWith("_cancelarcoletor2")) {
            interaction.deferUpdate()
            if (interaction.user.id != interaction.customId.split("_")[0]) return
            
            if (collector) collector.stop()
            embedpainel()
         }
         
        if (interaction.customId.endsWith("_cancelarcoletor3")) {
            interaction.deferUpdate()
            if (interaction.user.id != interaction.customId.split("_")[0]) return
            
            if (collector) collector.stop()
            embedprodutos()
         }
         
         if (interaction.customId.endsWith("_voltarpainel")) {
            interaction.deferUpdate()
            if (interaction.user.id != interaction.customId.split("_")[0]) return
            
            attembed()
         }
        
        
        function attembed() {
          const embed = new EmbedBuilder()
           .setTitle(`${interaction.client.user.username} | Gerenciar Painel`)
           .setDescription(`Escolha oque deseja gerenciar:`)
           .setColor(General.get(`color.padrao`))
           .setFooter({ text: `${interaction.client.user.username} - Todos os direitos reservados.`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
           
          const row = new ActionRowBuilder()
           .addComponents(
              new ButtonBuilder()
               .setCustomId(`${interaction.user.id}_${id}_configembed`)
               .setLabel('Configurar Embed')
               .setEmoji(`1136604220246728754`)
               .setStyle(3),
              new ButtonBuilder()
               .setCustomId(`${interaction.user.id}_${id}_configproduto`)
               .setLabel('Configurar Produtos')
               .setEmoji(`1161241239182651413`)
               .setStyle(3),
              new ButtonBuilder()
               .setCustomId(`${interaction.user.id}_${id}_attpainel`)
               .setLabel('Atualizar Painel')
               .setEmoji(`1148666021041950790`)
               .setStyle(1),
              new ButtonBuilder()
               .setCustomId(`${interaction.user.id}_${id}_delpainel`)
               .setLabel('DELETAR')
               .setEmoji(`1140438393373872148`)
               .setStyle(4),
            )
             
           interaction.message.edit({ embeds: [embed], components: [row] })
        }
        
        function embedpainel() {
           const fernanda = painel.get(id)
           const embednew = new EmbedBuilder()
            .setTitle(`Titulo atual: ${fernanda.titulo}`)
            .setDescription(`${emoji.get(`desc`)} **| Descrição Atual:**\n${fernanda.desc}\n\n${emoji.get(`cor`)} Cor da Embed: ${fernanda.cor}\n${emoji.get(`caderno`)} | Texto do Place Holder: ${fernanda.placeholder}\n${emoji.get(`pasta`)} | Banner: ${fernanda.banner == "null" ? `Painel sem Banner` : `[Banner](${fernanda.banner})`}\n${emoji.get(`quadro`)} | Miniatura: ${fernanda.thumb == "null" ? `Painel sem Miniatura` : `[Miniatura](${fernanda.thumb})`}`)
            .setColor(General.get(`color.padrao`))
            .setFooter({ text: `Rodapé atual: ${fernanda.rodape == "null" ? `Sem rodapé` : fernanda.rodape}.`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
            
           const rownew = new ActionRowBuilder()
            .addComponents(
               new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${id}_alttitulopainel`)
                .setLabel('Titulo da embed')
                .setEmoji(`1136607333204643931`)
                .setStyle(1),
               new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${id}_altdescpainel`)
                .setLabel('Descrição da embed')
                .setEmoji(`1136607333204643931`)
                .setStyle(1),
               new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${id}_altrodapepainel`)
                .setLabel('Rodapé da embed')
                .setEmoji(`1136607333204643931`)
                .setStyle(1),
               new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${id}_altplacepainel`)
                .setLabel('Place Holder')
                .setEmoji(`1136607333204643931`)
                .setStyle(1),
            )
            
           const rownew2 = new ActionRowBuilder()
            .addComponents(
               new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${id}_altcorpainel`)
                .setLabel('Cor Embed')
                .setEmoji(`🖌️`)
                .setStyle(1),
               new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${id}_altbannerpainel`)
                .setLabel('Banner')
                .setEmoji(`🖼️`)
                .setStyle(1),
               new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${id}_altthumbpainel`)
                .setLabel('Miniatura')
                .setEmoji(`🖼️`)
                .setStyle(1),
               new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${id}_attpainel`)
                .setLabel('Atualizar Painel')
                .setEmoji(`1148666021041950790`)
                .setStyle(1),
               new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${id}_voltarpainel`)
                .setLabel('Voltar')
                .setEmoji(`⬅️`)
                .setStyle(1),
            )
            
           interaction.message.edit({ embeds: [embednew], components: [rownew, rownew2] })
        }
        
        function embedprodutos() {
           const produtospainel = painel.get(`${id}.produtos`).map((product, index) => {
             return `${produto.get(`${product}.emoji`) || `🛒`} **| __${index+1}°__** - ${emoji.get(`caixa`)} | **ID:** ${product}`
           }).join('\n')
           
           const products = []
           painel.get(`${id}.produtos`).forEach(x => {
             const info = produto.get(x)
             products.push({
               label: info.nome,
               description: `💸 | Valor: R$${Number(info.preco).toFixed(2)} - 📦 | Estoque: ${info.estoque.length}`,
               emoji: info.emoji || "<:carrinho_Lgt:1161241239182651413>",
               value: `${interaction.user.id}_${x}_altemoji`
             })
           })
           
           const embednew = new EmbedBuilder()
            .setTitle('Estes são os produtos cadastrados no Painel:')
            .setDescription(produtospainel)
            .setColor(General.get(`color.padrao`))
            .setFooter({ text: `Caso queira trocar o emoji de algum produto, selecione ele no select menu abaixo:`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
            
           const rownew = new ActionRowBuilder()
            .addComponents(
               new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${id}_addprodutopainel`)
                .setLabel('Adicionar Produto')
                .setEmoji(`1141020908069326871`)
                .setStyle(3),
               new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${id}_delprodutopainel`)
                .setLabel('Remover Produto')
                .setEmoji(`1141020948909269054`)
                .setStyle(2),
               new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${id}_altsequencia`)
                .setLabel('Alterar Sequência')
                .setEmoji('💾')
                .setStyle(1),
            )
            
           const rownew2 = new ActionRowBuilder()
            .addComponents(
               new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${id}_attpainel`)
                .setLabel('Atualizar Painel')
                .setEmoji(`1148666021041950790`)
                .setStyle(1),
               new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${id}_voltarpainel`)
                .setLabel('Voltar')
                .setEmoji(`⬅️`)
                .setStyle(1),
            )
            
           const rowprodutos = new ActionRowBuilder()
            .addComponents(
               new StringSelectMenuBuilder()
                .setCustomId(`${interaction.user.id}_${id}_altemoji`)
                .setPlaceholder('Selecione o Produto para alterar o Emoji')
                .addOptions(products)
            )
            
           interaction.message.edit({ embeds: [embednew], components: [rownew, rowprodutos, rownew2] })
        }
      }
      
      
      if (interaction.isModalSubmit()) {
        const id = interaction.customId.split("_")[0]
        
        if (interaction.customId.endsWith("_modalplaceholder")) {
          const novo = interaction.fields.getTextInputValue("novo")
          
          painel.set(`${id}.placeholder`, novo)
          embedpainel()
        }
        
        if (interaction.customId.endsWith("_modalcorpainel")) {
          const novo = interaction.fields.getTextInputValue("novo")
          
          if (!corregex(novo)) return interaction.reply({ content: `${emoji.get(`emojix`)} | Cor inválida!`, ephemeral: true })
          
          painel.set(`${id}.cor`, novo)
          embedpainel()
        }
        
        if (interaction.customId.endsWith("_modalbannerpainel")) {
          const novo = interaction.fields.getTextInputValue("novo")
          
          if (novo == "remover") {
            painel.set(`${id}.banner`, "null")
            embedpainel()
            return
          }
          
          if (!novo.startsWith("https://")) return interaction.reply({ content: `${emoji.get(`emojix`)} | Banner inválido!`, ephemeral: true })
          
          painel.set(`${id}.banner`, novo)
          embedpainel()
        }
        
        if (interaction.customId.endsWith("_modalthumbpainel")) {
          const novo = interaction.fields.getTextInputValue("novo")
          
          if (novo == "remover") {
            painel.set(`${id}.thumb`, "null")
            embedpainel()
            return
          }
          
          if (!novo.startsWith("https://")) return interaction.reply({ content: `${emoji.get(`emojix`)} | Miniatura inválida!`, ephemeral: true })
          
          painel.set(`${id}.thumb`, novo)
          embedpainel()
        }
        
        if (interaction.customId.endsWith("_modalaltsequencia")) {
           const ide = interaction.fields.getTextInputValue("ide")
           const pos = interaction.fields.getTextInputValue("nova")
           
           if (!painel.get(`${id}.produtos`).includes(ide) || !produto.has(ide)) return interaction.reply({ content: `${emoji.get(`emojix`)} | Error: Produto inexistente!`, ephemeral: true })
           
           if (isNaN(pos) == true || pos > painel.get(`${id}.produtos`).length) return interaction.reply({ content: `${emoji.get(`emojix`)} | Posição inválida!`, ephemeral: true })
           
           const produtosArray = painel.get(`${id}.produtos`)
           const indiceProduto = produtosArray.indexOf(ide)
           
           if (indiceProduto != -1) {
             produtosArray.splice(indiceProduto, 1)
           }
           
           produtosArray.splice(Number(pos) - 1, 0, ide)
           painel.set(`${id}.produtos`, produtosArray)
           interaction.reply({ content: `${emoji.get(`certo`)} | Posição alterada!`, ephemeral: true })
           embedprodutos()
        }
        
        if (interaction.customId.endsWith("_modaldelpainel")) {
          const pos = interaction.fields.getTextInputValue("novo")
          
          if (pos != 'SIM') return interaction.reply({ content: `${emoji.get(`lupa`)} | Ação Cancelada!`, ephemeral: true })
          
          const info = painel.get(id)
          try {
            const canal = await interaction.guild.channels.cache.get(info.idcanal)
            const message = await canal.messages.fetch(info.idmsg)
          
            message.delete()
          } catch (error) {
            if (error.code == 10008) {
              throw error;
            }
          }
          
          painel.delete(id)
          interaction.update({ content: `${emoji.get(`certo`)} | Painel ID \`${id}\` deletado com sucesso!`, embeds: [], components: [] })
        }
        
        function corregex(cor) {
          const corRegex = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/
          return corRegex.test(cor)
        }
        
        function embedpainel() {
           const fernanda = painel.get(id)
           const embednew = new EmbedBuilder()
            .setTitle(`Titulo atual: ${fernanda.titulo}`)
            .setDescription(`${emoji.get(`desc`)} **| Descrição Atual:**\n${fernanda.desc}\n\n${emoji.get(`cor`)} Cor da Embed: ${fernanda.cor}\n${emoji.get(`caderno`)} | Texto do Place Holder: ${fernanda.placeholder}\n${emoji.get(`pasta`)} | Banner: ${fernanda.banner == "null" ? `Painel sem Banner` : `[Banner](${fernanda.banner})`}\n${emoji.get(`quadro`)} | Miniatura: ${fernanda.thumb == "null" ? `Painel sem Miniatura` : `[Miniatura](${fernanda.thumb})`}`)
            .setColor(General.get(`color.padrao`))
            .setFooter({ text: `Rodapé atual: ${fernanda.rodape == "null" ? `Sem rodapé` : fernanda.rodape}.`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
            
           interaction.update({ embeds: [embednew] })
        }
        
        function embedprodutos() {
           const produtospainel = painel.get(`${id}.produtos`).map((product, index) => {
             return `${produto.get(`${product}.emoji`) || `🛒`} **| __${index+1}°__** - ${emoji.get(`caixa`)} | **ID:** ${product}`
           }).join('\n')
           
           const products = []
           painel.get(`${id}.produtos`).forEach(x => {
             const info = produto.get(x)
             products.push({
               label: info.nome,
               description: `💸 | Valor: R$${Number(info.preco).toFixed(2)} - 📦 | Estoque: ${info.estoque.length}`,
               emoji: info.emoji || "<:carrinho_Lgt:1161241239182651413>",
               value: `${interaction.user.id}_${x}_altemoji`
             })
           })
           
           const embednew = new EmbedBuilder()
            .setTitle('Estes são os produtos cadastrados no Painel:')
            .setDescription(produtospainel)
            .setColor(General.get(`color.padrao`))
            .setFooter({ text: `Caso queira trocar o emoji de algum produto, selecione ele no select menu abaixo:`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
            
           const rownew = new ActionRowBuilder()
            .addComponents(
               new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${id}_addprodutopainel`)
                .setLabel('Adicionar Produto')
                .setEmoji(`1141020908069326871`)
                .setStyle(3),
               new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${id}_delprodutopainel`)
                .setLabel('Remover Produto')
                .setEmoji(`1141020948909269054`)
                .setStyle(2),
               new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${id}_altsequencia`)
                .setLabel('Alterar Sequência')
                .setEmoji('💾')
                .setStyle(1),
            )
            
           const rownew2 = new ActionRowBuilder()
            .addComponents(
               new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${id}_attpainel`)
                .setLabel('Atualizar Painel')
                .setEmoji(`1148666021041950790`)
                .setStyle(1),
               new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${id}_voltarpainel`)
                .setLabel('Voltar')
                .setEmoji(`⬅️`)
                .setStyle(1),
            )
            
           const rowprodutos = new ActionRowBuilder()
            .addComponents(
               new StringSelectMenuBuilder()
                .setCustomId(`${interaction.user.id}_${id}_altemoji`)
                .setPlaceholder('Selecione o Produto para alterar o Emoji')
                .addOptions(products)
            )
            
           interaction.message.edit({ embeds: [embednew], components: [rownew, rowprodutos, rownew2] })
        }
      }
      
      if (interaction.isStringSelectMenu()) {
        const id = interaction.customId.split("_")[1]
        
        if (interaction.customId.endsWith("_altemoji")) {
          interaction.deferUpdate()
          if (interaction.user.id != interaction.customId.split("_")[0]) return
          
          const embed = new EmbedBuilder()
           .setTitle(`${interaction.client.user.username} | Personalizar Emoji do Produto de ID: ${interaction.values[0].split("_")[1]}`)
           .setDescription(`${emoji.get(`seta`)} | Envie o novo Emoji abaixo:\n**O emoji tem que estar no server que o bot também está!**`)
           .setColor(General.get(`color.padrao`))
          
          const rowcancelar = new ActionRowBuilder()
             .addComponents(
                new ButtonBuilder()
                  .setCustomId(`${interaction.user.id}_${id}_cancelarcoletor3`)
                  .setLabel('Cancelar')
                  .setEmoji(`1136612240217346092`)
                  .setStyle(4)
             )
           
          interaction.message.edit({ embeds: [embed], components: [rowcancelar] })
          
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
                 embedprodutos()
                 return
               }
               
               produto.set(`${interaction.values[0].split("_")[1]}.emoji`, message.content)
               interaction.channel.send(`${emoji.get(`certo`)} | Emoji alterado com sucesso!`).then(msgaa => { setTimeout(() => { msgaa.delete() }, 4000)})
               embedprodutos()
             })
        }
        
        function embedprodutos() {
           const produtospainel = painel.get(`${id}.produtos`).map((product, index) => {
             return `${produto.get(`${product}.emoji`) || `🛒`} **| __${index+1}°__** - ${emoji.get(`caixa`)} | **ID:** ${product}`
           }).join('\n')
           
           const products = []
           painel.get(`${id}.produtos`).forEach(x => {
             const info = produto.get(x)
             products.push({
               label: info.nome,
               description: `💸 | Valor: R$${Number(info.preco).toFixed(2)} - 📦 | Estoque: ${info.estoque.length}`,
               emoji: info.emoji || "<:carrinho_Lgt:1161241239182651413>",
               value: `${interaction.user.id}_${x}_altemoji`
             })
           })
           
           const embednew = new EmbedBuilder()
            .setTitle('Estes são os produtos cadastrados no Painel:')
            .setDescription(produtospainel)
            .setColor(General.get(`color.padrao`))
            .setFooter({ text: `Caso queira trocar o emoji de algum produto, selecione ele no select menu abaixo:`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
            
           const rownew = new ActionRowBuilder()
            .addComponents(
               new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${id}_addprodutopainel`)
                .setLabel('Adicionar Produto')
                .setEmoji(`1141020908069326871`)
                .setStyle(3),
               new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${id}_delprodutopainel`)
                .setLabel('Remover Produto')
                .setEmoji(`1141020948909269054`)
                .setStyle(2),
               new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${id}_altsequencia`)
                .setLabel('Alterar Sequência')
                .setEmoji('💾')
                .setStyle(1),
            )
            
           const rownew2 = new ActionRowBuilder()
            .addComponents(
               new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${id}_attpainel`)
                .setLabel('Atualizar Painel')
                .setEmoji(`1148666021041950790`)
                .setStyle(1),
               new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${id}_voltarpainel`)
                .setLabel('Voltar')
                .setEmoji(`⬅️`)
                .setStyle(1),
            )
            
           const rowprodutos = new ActionRowBuilder()
            .addComponents(
               new StringSelectMenuBuilder()
                .setCustomId(`${interaction.user.id}_${id}_altemoji`)
                .setPlaceholder('Selecione o Produto para alterar o Emoji')
                .addOptions(products)
            )
            
           interaction.message.edit({ embeds: [embednew], components: [rownew, rowprodutos, rownew2] })
        }
      }
   }
}