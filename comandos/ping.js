module.exports = {
    name: 'ping',
    description: 'Mostra a latência do bot',
    execute(client, message, args) {
        message.reply(`🏓 Pong! Latência: ${client.ws.ping}ms`);
    }
}; 