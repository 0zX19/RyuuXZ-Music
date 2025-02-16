const { EmbedBuilder, AttachmentBuilder, PermissionsBitField, ButtonStyle, ActionRowBuilder, ButtonBuilder, StringSelectMenuOptionBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = { 
    config: {
        name: "247",
        description: "24/7 Music!",
        accessableby: "Member",
        category: "Music"
    },
    cooldown: 10,
    run: async (client, message, args, user, language, prefix) => {
        const msg = await message.channel.send({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "music", "247_loading")}`)] })
        const player = client.manager.get(message.guild.id);
        if (!player) return msg.edit({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "music", "no_player")}`)]});
        const { channel } = message.member.voice;
        if (!channel) return msg.edit({ content: " ", embeds: [new EmbedBuilder()
        .setColor(client.color).setDescription(`${client.i18n.get(language, "music", "play_invoice")}`)]
    });

    if (!client.manager.nodes.some(node => node.connected)) {
        return msg.edit({
            content: " ",
            embeds: [new EmbedBuilder().setColor(client.color).setDescription("❌ No Lavalink nodes are available. Please try again later.")]
        });
    }

        if (!channel.permissionsFor(message.guild.members.me).has(PermissionsBitField.Flags.Connect)) return msg.edit({ content: " ", embeds: [new EmbedBuilder()
            .setColor(client.color)
            .setDescription(`${client.i18n.get(language, "music", "play_join")}`)]
        });
        if (!channel.permissionsFor(message.guild.members.me).has(PermissionsBitField.Flags.Speak)) return msg.edit({ content: " ", embeds: [new EmbedBuilder()
            .setColor(client.color).setDescription(`${client.i18n.get(language, "music", "play_speak")}`)]
        });
        if (!channel) { 
            return msg.edit({ content: " ", embeds: [new EmbedBuilder()
                .setColor(client.color).setDescription(`${client.i18n.get(language, "noplayer", "no_voice")}`)]
            });
        } else if (message.guild.members.me.voice.channel && !message.guild.members.me.voice.channel.equals(channel)) {
            return msg.edit({ content: " ", embeds: [new EmbedBuilder()
                .setColor(client.color)
                .setDescription(`${client.i18n.get(language, "noplayer", "no_voice", {
                    channel: channel.name
                })}`)]
            });
        }

    if (player.twentyFourSeven) {
        player.twentyFourSeven = false;
        const off = new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, "music", "247_off")}`)
        .setColor(client.color);

        msg.edit({ content: " ", embeds: [off] });
    } else {
        player.twentyFourSeven = true;
        const on = new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, "music", "247_on")}`)
        .setColor(client.color);

        msg.edit({ content: " ", embeds: [on] });
    }
    }
};