const { EmbedBuilder, AttachmentBuilder, PermissionsBitField, ButtonStyle, ActionRowBuilder, ButtonBuilder, StringSelectMenuOptionBuilder, StringSelectMenuBuilder } = require('discord.js');
const Playlist = require('../../../settings/models/Playlist.js');

module.exports = { 
    config: {
        name: "delete",
        usage: "<playlist name>",
        description: "Delete a playlist",
        accessableby: "Premium",
        category: "Playlist",
    },
    cooldown: 10,
    run: async (client, message, args, user, language, prefix) => {

        if(!args[0]) return message.channel.send(`${client.i18n.get(language, "playlist", "delete_arg", {
            prefix: prefix
        })}`);

    const Plist = args[0].replace(/_/g, ' ');

    const playlist = await Playlist.findOne({ name: Plist });
    if(!playlist) return message.channel.send(`${client.i18n.get(language, "playlist", "delete_notfound")}`);
    if(playlist.owner !== message.author.id) return message.channel.send(`${client.i18n.get(language, "playlist", "delete_owner")}`);

    await playlist.delete();

    const embed = new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, "playlist", "delete_deleted", {
            name: Plist
            })}`)
        .setColor(client.color)

    message.channel.send({ embeds: [embed] });
    }
};