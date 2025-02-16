const { EmbedBuilder, AttachmentBuilder, PermissionsBitField, ButtonStyle, ActionRowBuilder, ButtonBuilder, StringSelectMenuOptionBuilder, StringSelectMenuBuilder } = require('discord.js');
const Playlist = require('../../../settings/models/Playlist.js');

const TrackAdd = [];

module.exports = { 
    config: {
        name: "savequeue",
        usage: "<playlist name>",
        description: "Save the current queue to a playlist",
        accessableby: "Premium",
        category: "Playlist",
    },
    cooldown: 10,
    run: async (client, message, args, user, language, prefix) => {

        try {
            if (user && user.isPremium) {

                if(!args[0]) return message.channel.send(`${client.i18n.get(language, "playlist", "savequeue_arg", {
                    prefix: prefix
                })}`);

                const Plist = args[0].replace(/_/g, ' ');

                const playlist = await Playlist.findOne({ name: Plist });
                if(!playlist) return message.channel.send(`${client.i18n.get(language, "playlist", "savequeue_notfound")}`);
                if(playlist.owner !== message.author.id) return message.channel.send(`${client.i18n.get(language, "playlist", "savequeue_owner")}`);

                const player = client.manager.get(message.guild.id);
                if (!player) return message.channel.send(`${client.i18n.get(language, "noplayer", "no_player")}`);
                const { channel } = message.member.voice;
                if (!channel || message.member.voice.channel !== message.guild.members.me.voice.channel) return message.channel.send(`${client.i18n.get(language, "noplayer", "no_voice")}`);

                const queue = player.queue.map(track => track);
                const current = player.queue.current;

                TrackAdd.push(current);
                TrackAdd.push(...queue);

                const embed = new EmbedBuilder()
                    .setDescription(`${client.i18n.get(language, "playlist", "savequeue_saved", {
                        name: Plist,
                        tracks: queue.length + 1
                        })}`)
                    .setColor(client.color)

                message.channel.send({ embeds: [embed] });

                playlist.tracks.push(...TrackAdd);
                playlist.save().then(() => {
                    TrackAdd.length = 0;
                });

    } else {
        const row = new ActionRowBuilder()
        .addComponents(new ButtonBuilder().setEmoji("<:premiercrafty:1269791654781386844> ").setURL("https://premier-crafty.my.id/").setStyle(ButtonStyle.Link))
        .addComponents(new ButtonBuilder().setEmoji("<:Haruka:1310909092469932102>  ").setURL("https://discord.com/oauth2/authorize?client_id=797688230869991456").setStyle(ButtonStyle.Link))
        .addComponents(new ButtonBuilder().setEmoji("<:paypal:1148981240695885837>").setURL("https://www.paypal.com/paypalme/andrih1997").setStyle(ButtonStyle.Link))
        .addComponents(new ButtonBuilder().setEmoji("<:saweria:1198559864209801216>").setURL("https://saweria.co/andrih/").setStyle(ButtonStyle.Link))
        .addComponents(new ButtonBuilder().setEmoji("🌐").setURL("https://haruka-bot.my.id/").setStyle(ButtonStyle.Link));

        const Premiumed = new EmbedBuilder()
            .setAuthor({ name: `${client.i18n.get(language, "nopremium", "premium_author")}`, iconURL: client.user.displayAvatarURL() })
            .setDescription(`${client.i18n.get(language, "nopremium", "premium_desc")}`)
            .setColor(client.color)
            .setTimestamp()

        return message.channel.send({ content: " ", embeds: [Premiumed], components: [row] });
      }
    } catch (err) {
        console.log(err)
        }
    }
};