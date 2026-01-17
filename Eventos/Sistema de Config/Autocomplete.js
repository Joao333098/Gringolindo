const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ApplicationCommandType, ApplicationCommandOptionType } = require("discord.js")
const { perms, General, emoji, produto, painel, cupons } = require("../../DataBaseJson")

module.exports = {
   name: "interactionCreate",
   run: async(interaction) => {
       // Verificar se a interação já foi respondida
       if (interaction.replied || interaction.deferred) {
           return;
       }
       
       if (interaction.isAutocomplete()) {
          if (interaction.commandName == 'config' || interaction.commandName == 'del' || interaction.commandName == 'entregar' || interaction.commandName == 'set' || interaction.commandName == 'stockid' || interaction.commandName == 'criarpainel') {
             if (!perms.has(interaction.user.id)) return interaction.respond([{ name: `Você não possui permissão para utilizar esse comando!`, value: `nafaa` }])
             
             const a = produto.all()
             
             const nomeDigitando = interaction.options.getFocused().toString().toLowerCase();
             const produtosFiltrados = a.filter(x => {
             const nome = x.data.nome && x.data.nome.toString().toLowerCase();
               return nome && nome.includes(nomeDigitando);
             })
             const produtosSelecionados = produtosFiltrados.slice(0, 25)
              
              const config = produtosSelecionados.map(x => {
                return {
                  name: `ID - ${x.ID} | Nome: ${x.data.nome}`,
                  value: x.ID
                }
              })
              
              interaction.respond(!config.length ? [{ name: `Nenhum produto registrado foi encontrado`, value: `semvalor` }] : config)
          }
          
          if (interaction.commandName == 'configcupom') {
             if (!perms.has(interaction.user.id)) return interaction.respond([{ name: `Você não possui permissão para utilizar esse comando!`, value: `nafaa` }])
             
             const a = cupons.all()
             
             const nomeDigitando = interaction.options.getFocused().toString().toLowerCase();
             const produtosFiltrados = a.filter(x => {
             const nome = x.data.nome && x.data.nome.toString().toLowerCase();
               return nome && nome.includes(nomeDigitando);
             })
             const produtosSelecionados = produtosFiltrados.slice(0, 25)
              
              const config = produtosSelecionados.map(x => {
                return {
                  name: `ID - ${x.ID} | Nome: ${x.data.nome}`,
                  value: x.ID
                }
              })
              
              interaction.respond(!config.length ? [{ name: `Nenhum cupom registrado foi encontrado`, value: `semvalor` }] : config)
          }
          
          if (interaction.commandName == 'config_painel' || interaction.commandName == 'set_painel') {
             if (!perms.has(interaction.user.id)) return interaction.respond([{ name: `Você não possui permissão para utilizar esse comando!`, value: `nafaa` }])
             
             const a = painel.all()
             
             const nomeDigitando = interaction.options.getFocused().toString().toLowerCase();
             const produtosFiltrados = a.filter(x => {
             const nome = x.ID && x.ID.toString().toLowerCase();
               return nome && nome.includes(nomeDigitando);
             })
             const produtosSelecionados = produtosFiltrados.slice(0, 25)
              
              const config = produtosSelecionados.map(x => {
                return {
                  name: `🖥️ | Painel - ${x.data.titulo}`,
                  value: x.ID
                }
              })
              
              interaction.respond(!config.length ? [{ name: `Nenhum painel registrado foi encontrado`, value: `semvalor` }] : config)
          }
       }
   }
}