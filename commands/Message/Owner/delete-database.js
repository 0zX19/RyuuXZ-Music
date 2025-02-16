const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const mongoose = require('mongoose');

module.exports = {
    ownerOnly: true,
    config: {
        name: "delete-database",
        description: "Delete the database",
        usage: "delete-database",
        aliases: ["delete-db"],
        category: 'Owner',
    },
    run: async (client, message) => {
        // Ensure message author exists
        if (!message.author) {
            const embed = new EmbedBuilder()
            .setColor(client.color)
            .setDescription("Error: Could not retrieve the message author.")
            return message.channel.send({ embeds: [embed] });
        }

        const confirmationEmbed = new EmbedBuilder()
            .setColor(client.color || 0xFF0000) // Fallback to red if client.color is undefined
            .setDescription('Are you sure you want to delete all data in the database? Click **Yes** to confirm or **No** to cancel.');

        const yesButton = new ButtonBuilder()
            .setCustomId('confirm-yes')
            .setLabel('Yes')
            .setStyle(ButtonStyle.Danger);

        const noButton = new ButtonBuilder()
            .setCustomId('confirm-no')
            .setLabel('No')
            .setStyle(ButtonStyle.Secondary);

        const actionRow = new ActionRowBuilder()
            .addComponents(yesButton, noButton);

        // Send confirmation message with buttons
        const confirmationMessage = await message.channel.send({ 
            embeds: [confirmationEmbed], 
            components: [actionRow] 
        });

        const filter = (interaction) => interaction.user.id === message.author.id;

        const collector = confirmationMessage.createMessageComponentCollector({ filter, time: 30000 });

        collector.on('collect', async (interaction) => {
            if (interaction.customId === 'confirm-yes') {
                try {
                    const collections = mongoose.connection.collections;
                    for (const key in collections) {
                        const collection = collections[key];
                        await collection.deleteMany({}); // Clear the collection
                    }

                    const successEmbed = new EmbedBuilder()
                        .setColor(client.color || 0x00FF00) // Use green for success
                        .setDescription('All data in the database has been successfully deleted.');

                    await interaction.update({ 
                        embeds: [successEmbed], 
                        components: [] // Disable buttons
                    });
                } catch (error) {
                    console.error('Error while resetting the database:', error);

                    const errorEmbed = new EmbedBuilder()
                        .setColor(client.color || 0xFF0000) // Red for error
                        .setDescription('An error occurred while deleting the data.');

                    await interaction.update({ 
                        embeds: [errorEmbed], 
                        components: [] // Disable buttons
                    });
                }
            } else if (interaction.customId === 'confirm-no') {
                // Cancel database deletion
                const cancelEmbed = new EmbedBuilder()
                    .setColor(client.color || 0xFFFF00) // Yellow for cancellation
                    .setDescription('Database deletion has been cancelled.');

                await interaction.update({ 
                    embeds: [cancelEmbed], 
                    components: [] // Disable buttons
                });
            }
        });

        collector.on('end', async (collected, reason) => {
            if (reason === 'time') {
                const timeoutEmbed = new EmbedBuilder()
                    .setColor(client.color || 0xFF0000)
                    .setDescription('Confirmation timed out. Database reset has been cancelled.');

                await confirmationMessage.edit({ 
                    embeds: [timeoutEmbed], 
                    components: [] // Disable buttons after timeout
                });
            }
        });
    },
};
