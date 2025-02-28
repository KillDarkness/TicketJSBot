const { Collection } = require('discord.js');

class TicketManager {
    constructor() {
        this.activeTickets = new Collection();
    }

    addTicket(userId, channelId) {
        this.activeTickets.set(userId, channelId);
    }

    removeTicket(userId) {
        this.activeTickets.delete(userId);
    }

    hasActiveTicket(userId) {
        return this.activeTickets.has(userId);
    }
}

module.exports = new TicketManager(); 