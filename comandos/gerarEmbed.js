const { 
    EmbedBuilder, 
    ActionRowBuilder, 
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');

module.exports = {
    name: 'gerarembed',
    description: 'Gera uma embed personalizada com opções de ticket',
    async execute(client, message, args) {
        if (!message.member.permissions.has('ManageMessages')) {
            return message.reply('Você não tem permissão para usar este comando!');
        }

        const embedData = {
            title: '',
            description: '',
            thumbnail: '',
            image: '',
            footer: '',
            fields: [],
            ticketOptions: []
        };

        const mainButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('editEmbed')
                    .setLabel('Editar Embed')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📝'),
                new ButtonBuilder()
                    .setCustomId('addField')
                    .setLabel('Adicionar Campo')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('➕'),
                new ButtonBuilder()
                    .setCustomId('addTicketOption')
                    .setLabel('Adicionar Opção de Ticket')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🎫'),
                new ButtonBuilder()
                    .setCustomId('finish')
                    .setLabel('Finalizar')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('✅')
            );

        const embed = new EmbedBuilder()
            .setColor('#2f3136')
            .setDescription('Clique nos botões abaixo para configurar a embed');

        const msg = await message.channel.send({ 
            embeds: [embed], 
            components: [mainButton] 
        });

        const collector = msg.createMessageComponentCollector({ time: 600000 }); // 10 minutos

        collector.on('collect', async (interaction) => {
            if (interaction.user.id !== message.author.id) {
                return interaction.reply({ 
                    content: 'Apenas quem iniciou pode configurar!', 
                    ephemeral: true 
                });
            }

            switch (interaction.customId) {
                case 'editEmbed':
                    const mainModal = new ModalBuilder()
                        .setCustomId('embedModal')
                        .setTitle('Configurar Embed');

                    const titleInput = new TextInputBuilder()
                        .setCustomId('titleInput')
                        .setLabel('Título da Embed')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(false)
                        .setValue(embedData.title);

                    const descriptionInput = new TextInputBuilder()
                        .setCustomId('descriptionInput')
                        .setLabel('Descrição da Embed')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(false)
                        .setValue(embedData.description);

                    const thumbnailInput = new TextInputBuilder()
                        .setCustomId('thumbnailInput')
                        .setLabel('URL da Thumbnail')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(false)
                        .setValue(embedData.thumbnail);

                    const imageInput = new TextInputBuilder()
                        .setCustomId('imageInput')
                        .setLabel('URL da Imagem')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(false)
                        .setValue(embedData.image);

                    const footerInput = new TextInputBuilder()
                        .setCustomId('footerInput')
                        .setLabel('Texto do Footer')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(false)
                        .setValue(embedData.footer);

                    mainModal.addComponents(
                        new ActionRowBuilder().addComponents(titleInput),
                        new ActionRowBuilder().addComponents(descriptionInput),
                        new ActionRowBuilder().addComponents(thumbnailInput),
                        new ActionRowBuilder().addComponents(imageInput),
                        new ActionRowBuilder().addComponents(footerInput)
                    );

                    await interaction.showModal(mainModal);
                    break;

                case 'addField':
                    const fieldModal = new ModalBuilder()
                        .setCustomId('fieldModal')
                        .setTitle('Adicionar Campo');

                    const fieldName = new TextInputBuilder()
                        .setCustomId('fieldName')
                        .setLabel('Nome do Campo')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true);

                    const fieldValue = new TextInputBuilder()
                        .setCustomId('fieldValue')
                        .setLabel('Valor do Campo')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true);

                    const fieldInline = new TextInputBuilder()
                        .setCustomId('fieldInline')
                        .setLabel('Inline? (sim/não)')
                        .setStyle(TextInputStyle.Short)
                        .setValue('não')
                        .setRequired(true);

                    fieldModal.addComponents(
                        new ActionRowBuilder().addComponents(fieldName),
                        new ActionRowBuilder().addComponents(fieldValue),
                        new ActionRowBuilder().addComponents(fieldInline)
                    );

                    await interaction.showModal(fieldModal);
                    break;

                case 'addTicketOption':
                    const ticketModal = new ModalBuilder()
                        .setCustomId('ticketModal')
                        .setTitle('Adicionar Opção de Ticket');

                    const optionName = new TextInputBuilder()
                        .setCustomId('optionName')
                        .setLabel('Nome da Opção')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true);

                    const optionEmoji = new TextInputBuilder()
                        .setCustomId('optionEmoji')
                        .setLabel('Emoji')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true);

                    const optionDescription = new TextInputBuilder()
                        .setCustomId('optionDescription')
                        .setLabel('Descrição da Opção')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true);

                    ticketModal.addComponents(
                        new ActionRowBuilder().addComponents(optionName),
                        new ActionRowBuilder().addComponents(optionEmoji),
                        new ActionRowBuilder().addComponents(optionDescription)
                    );

                    await interaction.showModal(ticketModal);
                    break;

                case 'finish':
                    const finalEmbed = new EmbedBuilder()
                        .setColor('#2f3136');

                    if (embedData.title) finalEmbed.setTitle(embedData.title);
                    if (embedData.description) finalEmbed.setDescription(embedData.description);
                    if (embedData.thumbnail) finalEmbed.setThumbnail(embedData.thumbnail);
                    if (embedData.image) finalEmbed.setImage(embedData.image);
                    if (embedData.footer) finalEmbed.setFooter({ text: embedData.footer });

                    embedData.fields.forEach(field => {
                        finalEmbed.addFields({ 
                            name: field.name, 
                            value: field.value, 
                            inline: field.inline 
                        });
                    });

                    let ticketRow;
                    if (embedData.ticketOptions.length > 0) {
                        const ticketMenu = new StringSelectMenuBuilder()
                            .setCustomId('ticketMenu')
                            .setPlaceholder('Selecione uma opção para abrir ticket')
                            .addOptions(
                                embedData.ticketOptions.map(opt => ({
                                    label: opt.name,
                                    value: opt.name.toLowerCase().replace(/\s+/g, '_'),
                                    description: opt.description,
                                    emoji: opt.emoji
                                }))
                            );
                        ticketRow = new ActionRowBuilder().addComponents(ticketMenu);
                    }

                    await message.channel.send({
                        embeds: [finalEmbed],
                        components: ticketRow ? [ticketRow] : []
                    });
                    
                    await msg.delete().catch(() => {});
                    collector.stop();
                    break;
            }
        });

        // Tratamento das respostas dos modais
        client.on('interactionCreate', async (interaction) => {
            if (!interaction.isModalSubmit()) return;

            if (interaction.customId === 'embedModal') {
                embedData.title = interaction.fields.getTextInputValue('titleInput');
                embedData.description = interaction.fields.getTextInputValue('descriptionInput');
                embedData.thumbnail = interaction.fields.getTextInputValue('thumbnailInput');
                embedData.image = interaction.fields.getTextInputValue('imageInput');
                embedData.footer = interaction.fields.getTextInputValue('footerInput');

                await updatePreview();
                await interaction.reply({ content: 'Embed atualizada!', ephemeral: true });
            }

            if (interaction.customId === 'fieldModal') {
                const name = interaction.fields.getTextInputValue('fieldName');
                const value = interaction.fields.getTextInputValue('fieldValue');
                const inline = interaction.fields.getTextInputValue('fieldInline').toLowerCase() === 'sim';

                embedData.fields.push({ name, value, inline });
                await updatePreview();
                await interaction.reply({ content: 'Campo adicionado!', ephemeral: true });
            }

            if (interaction.customId === 'ticketModal') {
                const name = interaction.fields.getTextInputValue('optionName');
                const emoji = interaction.fields.getTextInputValue('optionEmoji');
                const description = interaction.fields.getTextInputValue('optionDescription');

                embedData.ticketOptions.push({ name, emoji, description });
                await interaction.reply({ 
                    content: 'Opção de ticket adicionada!', 
                    ephemeral: true 
                });
            }

            async function updatePreview() {
                const previewEmbed = new EmbedBuilder()
                    .setColor('#2f3136');

                if (embedData.title) previewEmbed.setTitle(embedData.title);
                if (embedData.description) previewEmbed.setDescription(embedData.description);
                if (embedData.thumbnail) previewEmbed.setThumbnail(embedData.thumbnail);
                if (embedData.image) previewEmbed.setImage(embedData.image);
                if (embedData.footer) previewEmbed.setFooter({ text: embedData.footer });

                embedData.fields.forEach(field => {
                    previewEmbed.addFields({ 
                        name: field.name, 
                        value: field.value, 
                        inline: field.inline 
                    });
                });

                await msg.edit({ embeds: [previewEmbed], components: [mainButton] });
            }
        });
    }
};