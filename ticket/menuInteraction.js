const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const ticketManager = require('./ticketManager');

module.exports = {
    name: 'ticketMenu',
    async execute(interaction, client) {
        if (ticketManager.hasActiveTicket(interaction.user.id)) {
            return interaction.reply({
                content: '❌ Você já possui um ticket aberto! Aguarde ele ser fechado para abrir outro.',
                ephemeral: true
            });
        }

        const category = await interaction.guild.channels.cache.find(c => c.name === "tickets" && c.type === 4);
        
        if (!category) {
            return interaction.reply({
                content: "⚠️ Categoria de tickets não encontrada! Contate um administrador.",
                ephemeral: true
            });
        }

        const ticketType = interaction.values[0];
        const capitalizedType = ticketType.charAt(0).toUpperCase() + ticketType.slice(1).toLowerCase();

        await interaction.reply({
            content: `📩 **Confirmação de Ticket**\n\n**Tipo:** ${capitalizedType}\n\n• Forneça informações claras e detalhadas\n• Seja paciente aguardando resposta\n• Respeite a equipe de suporte\n\nDeseja prosseguir com a abertura do ticket?`,
            components: [
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`confirmTicket_${ticketType}`)
                            .setLabel('Abrir Ticket')
                            .setStyle(ButtonStyle.Success)
                            .setEmoji('✅')
                    )
            ],
            ephemeral: true
        });
    }
}; 