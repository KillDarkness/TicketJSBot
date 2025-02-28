const { PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const ticketManager = require('./ticketManager');
const { generateTicketCode } = require('./utils');

module.exports = {
    name: 'createTicket',
    async execute(interaction, client, ticketType, category) {
        // Verificar novamente se já não existe um ticket ativo
        if (ticketManager.hasActiveTicket(interaction.user.id)) {
            return interaction.reply({
                content: '❌ Você já possui um ticket aberto! Aguarde ele ser fechado para abrir outro.',
                ephemeral: true
            });
        }

        // Adicionar o deferReply aqui
        await interaction.deferReply({ ephemeral: true });

        const capitalizedType = ticketType.charAt(0).toUpperCase() + ticketType.slice(1).toLowerCase();
        const ticketCode = generateTicketCode();
        
        const channel = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username.toLowerCase()}`,
            type: 0,
            parent: category,
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: interaction.user.id,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ReadMessageHistory,
                    ],
                },
                {
                    id: '1287081143186751550',
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ReadMessageHistory,
                        PermissionsBitField.Flags.ManageChannels,
                    ],
                },
            ],
        });

        ticketManager.addTicket(interaction.user.id, channel.id);

        const embed = new EmbedBuilder()
            .setTitle('🎫 Novo Ticket Criado')
            .setDescription(`${interaction.user}, bem-vindo ao seu ticket!\n\n⚠️ **Aviso Importante:**\nPor favor, aguarde pacientemente a resposta de um membro da nossa equipe. Lembre-se que mensagens em massa ou menções desnecessárias podem resultar em punição. Mantenha sempre o respeito com todos os membros e forneça o máximo de informações possível sobre sua solicitação. Tickets criados sem motivo válido serão fechados imediatamente.`)
            .addFields(
                { name: '👤 Criado por', value: `${interaction.user.tag}`, inline: true },
                { name: '📅 Duração do ticket', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                { name: '📝 Tipo do ticket', value: capitalizedType, inline: true },
                { name: '📌 Status', value: '`🟢 Aberto`', inline: true },
                { name: '🔖 Código', value: `\`${ticketCode}\``, inline: true },
                { name: '👨‍💼 Atendente', value: '`Não assumido`', inline: true }
            )
            .setColor('#2f3136')
            .setTimestamp()
            .setFooter({ text: 'Sistema de Tickets', iconURL: client.user.displayAvatarURL() });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('closeTicket')
                    .setLabel('Fechar Ticket')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔒'),
                new ButtonBuilder()
                    .setCustomId('attendTicket')
                    .setLabel('Atender')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('👨‍💼')
            );

        const mainMessage = await channel.send({ 
            content: `||${interaction.user} | <@&1287081143186751550>||`, 
            embeds: [embed], 
            components: [row] 
        });

        // Fixar a mensagem e deletar a notificação do sistema
        await mainMessage.pin();
        const fetchedMessages = await channel.messages.fetch({ limit: 1 });
        const systemMessage = fetchedMessages.first();
        if (systemMessage.type === 6) {
            await systemMessage.delete();
        }

        // Editar a mensagem de confirmação
        await interaction.editReply({
            content: `✅ Ticket criado com sucesso em ${channel}!`,
            components: [new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('Abrir Ticket')
                        .setStyle(ButtonStyle.Link)
                        .setURL(`https://discord.com/channels/${interaction.guild.id}/${channel.id}`)
                )],
        });
    }
}; 