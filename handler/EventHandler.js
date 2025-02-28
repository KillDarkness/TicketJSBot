const fs = require('fs');
const path = require('path');

function loadEvents(client) {
    const eventsPath = path.join(__dirname, '..', 'events');
    
    // Cria a pasta events se não existir
    if (!fs.existsSync(eventsPath)) {
        fs.mkdirSync(eventsPath);
    }

    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const event = require(path.join(eventsPath, file));
        const eventName = file.split('.')[0];

        if (event.once) {
            client.once(eventName, (...args) => event.execute(client, ...args));
        } else {
            client.on(eventName, (...args) => event.execute(client, ...args));
        }
        
    }
}

module.exports = { loadEvents }; 