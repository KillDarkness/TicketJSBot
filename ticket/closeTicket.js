const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const ticketManager = require('./ticketManager');

module.exports = {
    name: 'closeTicket',
    async execute(interaction, client) {
        const isStaff = interaction.member.roles.cache.has('1287081143186751550');
        
        if (!isStaff) {
            return interaction.reply({
                content: '❌ Apenas membros da equipe podem interagir com este botão!',
                ephemeral: true
            });
        }

        // Atualizar a embed original com o novo status
        const messages = await interaction.channel.messages.fetch({ limit: 1 });
        const firstMessage = messages.first();
        
        if (firstMessage && firstMessage.embeds.length > 0) {
            const originalEmbed = firstMessage.embeds[0];
            const updatedEmbed = EmbedBuilder.from(originalEmbed)
                .setFields(
                    ...originalEmbed.fields.map(field => {
                        if (field.name === '📌 Status') {
                            return { name: '📌 Status', value: '`🔴 Fechado`', inline: true };
                        }
                        return field;
                    })
                );
            
            await firstMessage.edit({ embeds: [updatedEmbed] });
        }

        const embed = new EmbedBuilder()
            .setDescription(`👤 Esse ticket foi Fechado por <@${interaction.user.id}>(${interaction.user.id})`)
            .setColor('Red');

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('reopenTicket')
                    .setLabel('Reabrir')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🔓'),
                new ButtonBuilder()
                    .setCustomId('deleteTicket')
                    .setLabel('Deletar')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('⛔')
            );

        const userId = ticketManager.activeTickets.findKey(channelId => channelId === interaction.channel.id);
        if (userId) {
            await interaction.channel.permissionOverwrites.edit(userId, {
                ViewChannel: false,
                SendMessages: false
            });
            ticketManager.removeTicket(userId);
        }

        await interaction.reply({ embeds: [embed], components: [row] });
    }
}; 