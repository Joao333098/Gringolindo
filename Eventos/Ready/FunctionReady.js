const { ActivityType } = require('discord.js');
const axios = require('axios');
const { JsonDatabase } = require('wio.db');
const config = new JsonDatabase({ databasePath: "./config.json" });
const General = new JsonDatabase({ databasePath: "./DataBaseJson/config.json" });

module.exports = {
    name: 'clientReady',
    run: async (client) => {
        console.clear()
        console.log(`[LOGS] ${client.user.tag} Foi iniciado \n [LOGS] - Atualmente ${client.guilds.cache.size} servidores!\n[LOGS] - Tendo acesso a ${client.channels.cache.size} canais!\n[LOGS] - Contendo ${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)} usuarios!`)
        
        var position = 0;
        setInterval(() => {
            const statusTexto = General.get(`status.texto`);
            const statusAtividade = General.get(`status.atividade`)
            const statusPresenca = General.get(`status.presence`);
            const messages = [
              `${statusTexto}`,
            ]
            client.user.setPresence({
               activities: [{
                  name: `${messages[position++ % messages.length]}`,
                  type: ActivityType.statusAtividade
               }]
            })
            client.user.setStatus(statusPresenca)
        }, 4000);

        setarbio();

        setInterval(() => {
            setarbio();
        }, 300000);

        function setarbio() {
            axios.patch('https://discord.com/api/v10/applications/@me', {
                description: "by vovo666",
            },
            {
                headers: {
                    Authorization: `Bot ${config.get(`token`)}`,
                    'Content-Type': 'application/json'
                }
            });
        }
    }
};
