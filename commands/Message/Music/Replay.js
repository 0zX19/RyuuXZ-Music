const { EmbedBuilder, AttachmentBuilder, PermissionsBitField, ButtonStyle, ActionRowBuilder, ButtonBuilder, StringSelectMenuOptionBuilder, StringSelectMenuBuilder } = require('discord.js');



module.exports = { 
    config: {
        name: "replay",
        description: "Replay current song!",
        accessableby: "Member",
        category: "Music"
    },
    cooldown: 10,
    run: async (client, message, args, user, language, prefix) => {
        const msg = await message.channel.send({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "music", "replay_loading")}`)] })

		const player = client.manager.get(message.guild.id);
        if (!player) return msg.edit({ content: ' ', embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "noplayer", "no_player")}`)]  });
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

        await player.seek(0);

        const embed = new EmbedBuilder()
            .setDescription(`${client.i18n.get(language, "music", "replay_msg")}`)
            .setColor(client.color);

        msg.edit({ content: " ", embeds: [embed] });
    }
}