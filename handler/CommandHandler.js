const fs = require('fs');
const path = require('path');
const config = require('../config');

function loadCommands(client) {
    const commandsPath = path.join(__dirname, '..', 'comandos');
    
    // Cria a pasta comandos se não existir
    if (!fs.existsSync(commandsPath)) {
        fs.mkdirSync(commandsPath);
    }

    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(path.join(commandsPath, file));
        client.commands.set(command.name, command);
    }

    // Adiciona o evento messageCreate para processar comandos
    client.on('messageCreate', async message => {
        if (message.author.bot) return;
        if (!message.content.startsWith(config.prefix)) return;

        const args = message.content.slice(config.prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = client.commands.get(commandName);
        if (!command) return;

        try {
            command.execute(client, message, args);
        } catch (error) {
            console.error(error);
            message.reply('Houve um erro ao executar o comando!');
        }
    });
}

module.exports = { loadCommands }; 