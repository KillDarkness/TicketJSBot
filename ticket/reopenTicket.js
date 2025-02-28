const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const ticketManager = require('./ticketManager');

module.exports = {
    name: 'reopenTicket',
    async execute(interaction, client) {
        // Verificar se o ticket já está aberto
        const messages = await interaction.channel.messages.fetch();
        const firstMessage = messages.last();

        if (firstMessage && firstMessage.embeds.length > 0) {
            const statusField = firstMessage.embeds[0].fields.find(field => field.name === '📌 Status');
            if (statusField && statusField.value === '`🟢 Aberto`') {
                return interaction.reply({
                    content: '❌ Este ticket já está aberto!',
                    ephemeral: true
                });
            }
        }

        try {
            // Pegar o username do nome do canal
            const channelName = interaction.channel.name;
            const username = channelName.split('-')[1];

            if (!username) {
                return interaction.reply({
                    content: '❌ Não foi possível identificar o usuário deste ticket.',
                    ephemeral: true
                });
            }

            // Encontrar o usuário através da primeira mensagem
            if (firstMessage && firstMessage.mentions.users.first()) {
                const user = firstMessage.mentions.users.first();

                await interaction.channel.permissionOverwrites.edit(user.id, {
                    ViewChannel: true,
                    SendMessages: true,
                    ReadMessageHistory: true
                });

                ticketManager.addTicket(user.id, interaction.channel.id);

                if (firstMessage.embeds.length > 0) {
                    const originalEmbed = firstMessage.embeds[0];
                    const updatedEmbed = EmbedBuilder.from(originalEmbed)
                        .setFields(
                            ...originalEmbed.fields.map(field => {
                                if (field.name === '📌 Status') {
                                    return { name: '📌 Status', value: '`🟢 Aberto`', inline: true };
                                }
                                return field;
                            })
                        );
                    
                    await firstMessage.edit({ embeds: [updatedEmbed] });
                }

                await interaction.reply({
                    content: `🔓 Ticket reaberto por ${interaction.user}! ${user} agora tem acesso novamente ao ticket.`,
                    ephemeral: false
                });
            } else {
                return interaction.reply({
                    content: '❌ Não foi possível encontrar o usuário do ticket.',
                    ephemeral: true
                });
            }
        } catch (error) {
            console.error('Erro ao reabrir ticket:', error);
            return interaction.reply({
                content: '❌ Erro ao reabrir o ticket. Por favor, contate um administrador.',
                ephemeral: true
            });
        }
    }
}; 