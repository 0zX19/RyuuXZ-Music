const { Client: GeniusClient } = require('genius-lyrics');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    config: {
        name: "lyrics",
        description: "Display lyrics of a song",
        accessibleby: "Member",
        category: "Music",
        aliases: ["ly"]
    },
    cooldown: 10,
    run: async (client, message, args, language) => {
        // Initial loading message
        const loadingMessage = await message.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`${client.i18n.get(language, "music", "join_loading")}`)
            ]
        });

        // Check for active music player
        const player = client.manager.get(message.guild.id);
        if (!player) {
            return loadingMessage.edit({
                embeds: [
                    new EmbedBuilder()
                        .setColor(client.color)
                        .setDescription(`${client.i18n.get(language, "noplayer", "no_player")}`)
                ]
            });
        }

        // Validate Genius API Key
        if (!process.env.GENIUS_API_KEY) {
            return loadingMessage.edit({
                embeds: [
                    new EmbedBuilder()
                        .setColor(client.color)
                        .setDescription('Genius API key is not configured. Please check your environment variables.')
                ]
            });
        }

        const geniusClient = new GeniusClient(process.env.GENIUS_API_KEY);
        let songTitle = args.join(' ');

        // Use the currently playing song if no title is provided
        if (!songTitle) {
            if (!player.queue.current) {
                return loadingMessage.edit({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(client.color)
                            .setDescription('There is no song currently playing.')
                    ]
                });
            }
            songTitle = player.queue.current.title;
        }

        try {
            // Fetch song details from Genius API
            const searches = await geniusClient.songs.search(songTitle);
            if (!searches || !searches.length) {
                return loadingMessage.edit({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(client.color)
                            .setDescription('Could not find lyrics for that song.')
                    ]
                });
            }

            const song = searches[0];
            const lyrics = await song.lyrics();

            if (!lyrics) {
                return loadingMessage.edit({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(client.color)
                            .setDescription('Lyrics could not be retrieved.')
                    ]
                });
            }

            // Split lyrics if they exceed embed character limit
            const lyricChunks = lyrics.match(/[\s\S]{1,2000}/g);

            // Send each chunk as a separate message
            for (const chunk of lyricChunks) {
                await message.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(client.color)
                            .setDescription(chunk)
                    ]
                });
            }

            // Clean up loading message
            return loadingMessage.delete();
        } catch (error) {
            console.error("Lyrics retrieval error:", error);
            loadingMessage.edit({
                embeds: [
                    new EmbedBuilder()
                        .setColor(client.color)
                        .setDescription('An error occurred while retrieving the lyrics. Please try again later.')
                ]
            });
        }
    }
};
