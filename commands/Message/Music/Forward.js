const { EmbedBuilder, AttachmentBuilder, PermissionsBitField, ButtonStyle, ActionRowBuilder, ButtonBuilder, StringSelectMenuOptionBuilder, StringSelectMenuBuilder } = require('discord.js');
const formatDuration = require('../../../structures/FormatDuration.js')

const fastForwardNum = 10;

module.exports = { 
    config: {
        name: "forward",
        description: "Forward timestamp in the song!",
        accessableby: "Member",
        category: "Music",
        usage: "<seconds>"
    },
    cooldown: 10,
    run: async (client, message, args, user, language, prefix) => {
                const msg = await message.channel.send({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "music", "forward_loading")}`)] })

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

        const song = player.queue.current;
        const CurrentDuration = formatDuration(player.position);

		if (args[0] && !isNaN(args[0])) {
			if((player.position + args[0] * 1000) < song.duration) {

                player.seek(player.position + args[0] * 1000);
                
                const forward1 = new EmbedBuilder()
                .setDescription(`${client.i18n.get(language, "music", "forward_msg", {
                    duration: CurrentDuration
                })}`)
                .setColor(client.color);

                msg.edit({ content: " ", embeds: [forward1] });

			} else { 
                return msg.edit(`${client.i18n.get(language, "music", "forward_beyond")}`);
            }
		}
		else if (args[0] && isNaN(args[0])) { 
            return message.reply(`${client.i18n.get(language, "music", "forward_invalid", {
                prefix: prefix
            })}`);
        }

		if (!args[0]) {
			if((player.position + fastForwardNum * 1000) < song.duration) {
                player.seek(player.position + fastForwardNum * 1000);
                
                const forward2 = new EmbedBuilder()
                .setDescription(`${client.i18n.get(language, "music", "forward_msg", {
                    duration: CurrentDuration
                    })}`)
                .setColor(client.color);

                msg.edit({ content: " ", embeds: [forward2] });

			} else {
				return msg.edit(`${client.i18n.get(language, "music", "forward_beyond")}`);
			}
		}
	}
};