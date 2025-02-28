const { Collection } = require('discord.js');

class TicketManager {
    constructor() {
        this.activeTickets = new Collection();
        this.ticketCreators = new Collection(); // channelId -> userId
    }

    addTicket(userId, channelId) {
        this.activeTickets.set(userId, channelId);
        this.ticketCreators.set(channelId, userId);
    }

    removeTicket(userId) {
        const channelId = this.activeTickets.get(userId);
        this.activeTickets.delete(userId);
        if (channelId) this.ticketCreators.delete(channelId);
    }

    hasActiveTicket(userId) {
        return this.activeTickets.has(userId);
    }

    getTicketCreator(channelId) {
        return this.ticketCreators.get(channelId);
    }
}

module.exports = new TicketManager(); 