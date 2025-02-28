const { Client, GatewayIntentBits, Partials, Collection, EmbedBuilder } = require('discord.js');
require('dotenv').config();
const { loadCommands } = require('./handler/CommandHandler');
const { loadEvents } = require('./handler/EventHandler');
const config = require('./config');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.GuildScheduledEvents
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
        Partials.User,
        Partials.GuildMember,
        Partials.ThreadMember
    ]
});

client.commands = new Map();
client.ticketHandlers = new Collection();

loadEvents(client);
loadCommands(client);

// Carregar o handler de tickets
require('./handlers/ticketHandler')(client);

client.login(process.env.BOT_TOKEN);

// Adicionar este evento para lidar com as interações
client.on('interactionCreate', async interaction => {
    if (interaction.isStringSelectMenu()) {
        if (interaction.customId === 'ticketMenu') {
            const handler = client.ticketHandlers.get('ticketMenu');
            if (handler) await handler.execute(interaction, client);
        }
    }

    if (interaction.isButton()) {
        if (interaction.customId === 'closeTicket') {
            const handler = client.ticketHandlers.get('closeTicket');
            if (handler) await handler.execute(interaction, client);
        } else if (interaction.customId === 'reopenTicket') {
            const handler = client.ticketHandlers.get('reopenTicket');
            if (handler) await handler.execute(interaction, client);
        } else if (interaction.customId === 'deleteTicket') {
            const embed = new EmbedBuilder()
                .setTitle('⛔ Deletando Ticket')
                .setDescription('Este ticket será deletado em 5 segundos...')
                .setColor('Red');
            
            await interaction.reply({ embeds: [embed] });
            setTimeout(() => interaction.channel.delete(), 5000);
        } else if (interaction.customId === 'attendTicket') {
            const handler = client.ticketHandlers.get('attendTicket');
            if (handler) await handler.execute(interaction, client);
        } else if (interaction.customId.startsWith('stopAttending_')) {
            const channelId = interaction.customId.split('_')[1];
            const channel = interaction.guild.channels.cache.get(channelId);
            
            if (channel) {
                const messages = await channel.messages.fetch();
                const firstMessage = messages.last();
                
                if (firstMessage && firstMessage.embeds.length > 0) {
                    const updatedEmbed = EmbedBuilder.from(firstMessage.embeds[0])
                        .setFields(
                            ...firstMessage.embeds[0].fields.map(field => {
                                if (field.name === '👨‍💼 Atendente') {
                                    return { name: field.name, value: '`Não assumido`', inline: field.inline };
                                }
                                return field;
                            })
                        );
                    
                    await firstMessage.edit({ embeds: [updatedEmbed] });
                    await interaction.update({
                        content: '✅ Você parou de atender este ticket!',
                        components: [],
                        ephemeral: true
                    });
                }
            }
        } else if (interaction.customId.startsWith('confirmTicket_')) {
            const ticketType = interaction.customId.split('_')[1];
            const category = await interaction.guild.channels.cache.find(c => c.name === "tickets" && c.type === 4);
            await client.ticketHandlers.get('createTicket').execute(interaction, client, ticketType, category);
        }
    }
});

