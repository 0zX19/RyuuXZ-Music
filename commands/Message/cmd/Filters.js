const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const GPrefix = require('../../../settings/models/Prefix');


module.exports = {
    config: {
        name: "filters",
        aliases: ["f"],
    },
    run: async (client, message, args) => {
        const GuildPrefix = await GPrefix.findOne({ guild: message.guild.id });
        const prefix = GuildPrefix.prefix;

    const dirFilters = client.commands.filter(c => c.config.category === "Filters");
    const embed = new EmbedBuilder()
    .setColor(client.color)
    .setAuthor({ name: `Default Prefix: ${prefix}\nCommands for reports are: ${prefix}bugreport <text>` })
    .setThumbnail(message.guild.iconURL({ dynamic: true }))
    .setTitle(`🎛️ Filters [${dirFilters.size}]:`)
    .setDescription(dirFilters.map(c => `**\`${c.config.name}\`**`).join(", "))
    
    return message.channel.send({ embeds: [embed] });
    }
}