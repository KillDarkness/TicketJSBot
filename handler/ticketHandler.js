const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    const ticketPath = path.join(__dirname, '..', 'ticket');
    const ticketFiles = fs.readdirSync(ticketPath).filter(file => file.endsWith('.js'));

    for (const file of ticketFiles) {
        const ticket = require(`${ticketPath}/${file}`);
        if (ticket.execute) {
            client.ticketHandlers.set(ticket.name, ticket);
        }
    }
    console.log(`[Handler] ${ticketFiles.length} manipuladores de ticket carregados`);
}; 