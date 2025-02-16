const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const GPrefix = require('../../../settings/models/Prefix');

module.exports = {
    config: {
        name: "playlist",
    },
    run: async (client, message, args) => {
        const GuildPrefix = await GPrefix.findOne({ guild: message.guild.id });
        const prefix = GuildPrefix.prefix;

    const dirPlaylist = client.commands.filter(c => c.config.category === "Playlist");
    const embed = new EmbedBuilder()
    .setColor(client.color)
    .setAuthor({ name: `Default Prefix: ${prefix}\nCommands for reports are: ${prefix}bugreport <text>` })
    .setThumbnail(message.guild.iconURL({ dynamic: true }))
    .setTitle(`📃 Playlist [${dirPlaylist.size}]:`)
    .setDescription(dirPlaylist.map(c => `**\`${c.config.name}\`**`).join(", "))
    
    return message.channel.send({ embeds: [embed] });
    }
}