const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { convertTime } = require("../../../structures/ConvertTime.js");

module.exports = { 
    config: {
        name: "move",
        description: "Move position song in queue!",
        usage: "<3 1>",
        category: "Music",
        accessableby: "Member"
    },
    cooldown: 10,
    run: async (client, message, args, user, language, prefix) => {
        const msg = await message.channel.send({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "music", "move_loading")}`)] })

        
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

        const tracks = args[0];
        const position = args[1];

        if (isNaN(tracks) || isNaN(position)) return msg.edit({ content: '  ', embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "music", "move_arg")}`)] });

        if (tracks == 0 && position == 0) return msg.edit(`${client.i18n.get(language, "music", "move_already")}`);
        if (tracks > player.queue.length || (tracks && !player.queue[tracks - 1])) return msg.edit(`${client.i18n.get(language, "music", "move_notfound")}`);
        if ((position > player.queue.length) || !player.queue[position - 1]) return msg.edit(`${client.i18n.get(language, "music", "move_notfound")}`);

        const song = player.queue[tracks - 1];

        player.queue.splice(tracks - 1, 1);
        player.queue.splice(position - 1, 0, song);

        const embed = new EmbedBuilder()
            .setDescription(`${client.i18n.get(language, "music", "move_desc", {
                name: song.title,
                url: song.uri,
                pos: position
            })
        }`)

        return msg.edit({ content: " ", embeds: [embed] });
    }
}