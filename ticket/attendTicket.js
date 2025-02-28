const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const ticketManager = require('./ticketManager');

module.exports = {
    name: 'attendTicket',
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        const isStaff = interaction.member.roles.cache.has('1287081143186751550');
        
        if (!isStaff) {
            return interaction.editReply({
                content: '❌ Apenas membros da equipe podem atender tickets!',
                ephemeral: true
            });
        }

        const messages = await interaction.channel.messages.fetch();
        const firstMessage = messages.last();
        
        if (!firstMessage || !firstMessage.embeds.length) return;

        const currentAttendant = firstMessage.embeds[0].fields.find(f => f.name === '👨‍💼 Atendente')?.value;
        
        // Se o staff já está atendendo
        if (currentAttendant === `<@${interaction.user.id}>`) {
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`stopAttending_${interaction.channel.id}`)
                        .setLabel('Parar de Atender')
                        .setStyle(ButtonStyle.Danger)
                );

            return interaction.editReply({
                content: '❓ Você deseja parar de atender este ticket?',
                components: [row],
                ephemeral: true
            });
        }

        // Se outro staff já está atendendo
        if (currentAttendant !== '`Não assumido`') {
            return interaction.editReply({
                content: '❌ Este ticket já está sendo atendido por outro membro da equipe!',
                ephemeral: true
            });
        }

        // Atualizar a embed com o novo atendente
        const updatedEmbed = EmbedBuilder.from(firstMessage.embeds[0])
            .setFields(
                ...firstMessage.embeds[0].fields.map(field => {
                    if (field.name === '👨‍💼 Atendente') {
                        return { name: field.name, value: `<@${interaction.user.id}>`, inline: field.inline };
                    }
                    return field;
                })
            );

        await firstMessage.edit({ embeds: [updatedEmbed] });

        // Encontrar o usuário que abriu o ticket
        const userId = ticketManager.getTicketCreator(interaction.channel.id);
        if (userId) {
            try {
                const user = await client.users.fetch(userId);
                const dmEmbed = new EmbedBuilder()
                    .setTitle('🎫 Atualização do Ticket')
                    .setDescription(`Seu ticket está sendo atendido por ${interaction.user.tag}!`)
                    .setColor('#2f3136')
                    .setTimestamp();

                const dmRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel('Ir para o Ticket')
                            .setStyle(ButtonStyle.Link)
                            .setURL(`https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}`)
                    );

                await user.send({ embeds: [dmEmbed], components: [dmRow] });
            } catch (error) {
                console.error('Erro ao enviar DM:', error);
            }
        }

        await interaction.editReply({
            content: `✅ Você começou a atender este ticket!`,
            ephemeral: true
        });
    }
}; 