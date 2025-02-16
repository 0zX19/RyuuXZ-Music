module.exports = {
    ownerOnly: true,
    config: {
        name: 'leave-guild-all',
        aliases: ['guild-leave-all', 'lga'],
        description: 'Forces the bot to leave all guilds',
        category: 'Owner',
    },
    run: async (client, message) => {
        // Konfirmasi kepada pemilik sebelum memproses
        const confirmationMessage = await message.channel.send(
            "Are you sure you want the bot to leave all guilds? Type `confirm` to proceed."
        );

        // Tunggu balasan dari pemilik
        const filter = (response) => response.author.id === message.author.id && response.content.toLowerCase() === 'confirm';
        const collector = message.channel.createMessageCollector({ filter, time: 15000, max: 1 });

        collector.on('collect', async () => {
            // Mulai keluar dari semua guild
            try {
                const guilds = client.guilds.cache;
                for (const [id, guild] of guilds) {
                    await guild.leave();
                    console.log(`Left guild: ${guild.name} (${id})`);
                }
                return message.channel.send("The bot has successfully left all guilds.");
            } catch (error) {
                console.error(`Error leaving guilds: ${error.message}`);
                return message.channel.send("An error occurred while trying to leave all guilds.");
            }
        });

        collector.on('end', (collected) => {
            if (collected.size === 0) {
                confirmationMessage.edit("Command cancelled. No confirmation received.");
            }
        });
    },
};
