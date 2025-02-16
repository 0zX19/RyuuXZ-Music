const { EmbedBuilder, AttachmentBuilder, PermissionsBitField, ButtonStyle, ActionRowBuilder, ButtonBuilder, StringSelectMenuOptionBuilder, StringSelectMenuBuilder } = require('discord.js');
const Playlist = require('../../../settings/models/Playlist.js');

module.exports = { 
    config: {
        name: "public",
        usage: "<playlist name>",
        description: "Public a playlist",
        accessableby: "Premium",
        category: "Playlist",
    },
    cooldown: 10,
    run: async (client, message, args, user, language, prefix) => {

        if(!args[0]) return message.channel.send(`${client.i18n.get(language, "playlist", "public_arg", {
            prefix: prefix
        })}`);

        const PName = args[0].replace(/_/g, ' ');

        const playlist = await Playlist.findOne({ name: PName });
        if(!playlist) return message.channel.send(`${client.i18n.get(language, "playlist", "public_notfound")}`);
        if(playlist.owner !== message.author.id) return message.channel.send(`${client.i18n.get(language, "playlist", "public_owner")}`);

        const Public = await Playlist.findOne({ name: PName, private: false });
        if(Public) return message.channel.send(`${client.i18n.get(language, "playlist", "public_already")}`);

        const msg = await message.channel.send(`${client.i18n.get(language, "playlist", "public_loading")}`);

        playlist.private = false;

        playlist.save().then(() => {
            const embed = new EmbedBuilder()
                .setDescription(`${client.i18n.get(language, "playlist", "public_success")}`)
                .setColor(client.color)
            msg.edit({ content: " ", embeds: [embed] });
        });

    }
};