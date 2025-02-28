const { ActivityType } = require('discord.js');

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`😃 Online como ${client.user.tag}!`);

        // Define o status do bot
        client.user.setPresence({
            activities: [{
                name: 'seus comandos',
                type: ActivityType.Watching,
                // Outros tipos disponíveis:
                // Playing, Streaming, Listening, Watching, Competing
            }],
            status: 'online'
            // Outros status disponíveis:
            // 'online', 'idle', 'dnd', 'invisible'
        });

        // Status rotativo (opcional)
        const activities = [
            { name: 'seus comandos', type: ActivityType.Watching },
            { name: 'você', type: ActivityType.Listening },
            { name: `${client.guilds.cache.size} servidores`, type: ActivityType.Watching },
            { name: 'digite !help', type: ActivityType.Playing }
        ];

        let i = 0;
        setInterval(() => {
            if (i >= activities.length) i = 0;
            client.user.setActivity(activities[i]);
            i++;
        }, 15000); // Muda a cada 15 segundos
    }
}; 