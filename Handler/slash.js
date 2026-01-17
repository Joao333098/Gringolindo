const fs = require("fs")

module.exports = async (client) => {

const SlashsArray = []

  fs.readdir(`./ComandosSlash`, (error, folder) => {
  if (error) return console.error('Erro ao ler pasta ComandosSlash:', error);
  
  folder.forEach(subfolder => {
    fs.readdir(`./ComandosSlash/${subfolder}/`, (error, files) => { 
      if (error) return console.error(`Erro ao ler pasta ComandosSlash/${subfolder}:`, error);
      
      files.forEach(file => {
      
        if(!file.endsWith('.js')) return;
        const command = require(`../ComandosSlash/${subfolder}/${file}`);
        
        if(!command?.data?.name) {
          console.log(`⚠️ Comando ${file} não tem estrutura válida`);
          return;
        }
        
        client.slashCommands.set(command.data.name, command);
        console.log(`✅ Comando ${command.data.name} carregado!`);
        
        SlashsArray.push(command.data);
      });
    });
  });
});

  client.on("ready", async () => {
    try {
      console.log('🔄 Sincronizando comandos slash...');
      
      // Limpa comandos de todos os servidores onde o bot está (Guild Commands)
      // Isso remove comandos de outros bots que possam estar registrados na guilda do bot
      const guilds = client.guilds.cache;
      for (const [id, guild] of guilds) {
        await guild.commands.set([]).catch(() => {});
        console.log(`🧹 Comandos de guilda limpos em: ${guild.name}`);
      }

      // Registra apenas os comandos atuais globalmente
      // O Discord substituirá qualquer comando global antigo pelo novo array
      await client.application.commands.set(SlashsArray);
      console.log(`✅ ${SlashsArray.length} comandos registrados globalmente!`);
      
    } catch (error) {
      console.error('❌ Erro ao sincronizar comandos slash:', error);
    }
  });
};