const { EmbedBuilder } = require("discord.js");
const GPrefix = require('../../../settings/models/Prefix');

module.exports = {
    config: {
        name: "help",
        aliases: ["commands"],
        usage: "(command)",
        category: "Utility",
        description: "Displays all commands that the bot has.",
        accessableby: "Members",
    },
    cooldown: 10,
    run: async (client, message, args) => {
        const GuildPrefix = await GPrefix.findOne({ guild: message.guild.id });
        const prefix = GuildPrefix ? GuildPrefix.prefix : "!";
        const categories = {};

        client.commands.forEach((command) => {
            const category = command.config.category || "Misc";
            if (!categories[category]) categories[category] = [];
            categories[category].push(command.config.name);
        });

        const emo = {
            Filters: "🎛️",
            Music: "🎵",
            Playlist: "📃",
            Utility: "🔩",
        };

        if (!args[0]) {
            const embed = new EmbedBuilder()
                .setColor(client.color)
                .setAuthor({ name: `❓ ${message.guild.name} Command List!`, iconURL: message.guild.iconURL({ dynamic: true }) })
                .setDescription(
                    `**Command Categories:**\n\n` +
                    Object.entries(emo)
                        .map(([category, emoji]) => `${emoji} **${category}**: **\`${prefix}${category.toLowerCase()}\`**`)
                        .join('\n')
                )
            
            return message.channel.send({ embeds: [embed] });
        } else {
            let command = client.commands.get(client.aliases.get(args[0].toLowerCase()) || args[0].toLowerCase());

            if (!command) {
                return message.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(client.color)
                            .setDescription(`No information found for the command \`${args[0].toLowerCase()}\``)
                    ],
                });
            }

            const commandEmbed = new EmbedBuilder()
                .setColor(client.color)
                .setAuthor({ name: `${message.guild.name} Help Command`, iconURL: message.guild.iconURL({ dynamic: true }) })
                .setTitle(`Command: \`${command.config.name}\``)
                .addFields(
                    { name: "Description", value: `${command.config.description || "No description provided."}` },
                    { name: "Usage", value: `\`${prefix}${command.config.usage}\`` },
                    { name: "Category", value: `${command.config.category || "No category provided."}` }
                );

            return message.channel.send({ embeds: [commandEmbed] });
        }
    }
};
