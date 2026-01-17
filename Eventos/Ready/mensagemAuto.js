const { ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { moder } = require("../../DataBaseJson");

module.exports = {
  name: "ready",
  run: async(client) => {
    
    setInterval(mensagemAuto, 10 * 60 * 1000)
    
    async function mensagemAuto() {
      const db = moder.all()
      if (!Array.isArray(db)) return;
      
      for (const msg of db) {
        const channel = await client.channels.cache.get(msg.data.canal)
        
        if (channel) {
          const message = await channel.send({
            content: msg.data.mensagem,
            components: [new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                 .setCustomId('abcdfghijklmnop')
                 .setLabel('Mensagem automática')
                 .setDisabled(true)
                 .setStyle(2)
              )
            ]
          })
          .catch(err => console.error('Erro ao enviar a mensagem automática:', err))
          
          if (msg.data.tempo != "infinito") {
            setTimeout(async() => {
              await message.delete()
              .catch(err => {return})
            }, msg.data.tempo)
          }
        }
      }
    }
    
  }
}