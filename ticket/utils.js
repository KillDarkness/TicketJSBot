function generateTicketCode() {
    return Math.random().toString(16).substring(2, 8).toUpperCase();
}

module.exports = { generateTicketCode }; 