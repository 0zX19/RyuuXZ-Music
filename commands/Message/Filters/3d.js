const delay = require('delay');
const { EmbedBuilder, AttachmentBuilder, PermissionsBitField, ButtonStyle, ActionRowBuilder, ButtonBuilder, StringSelectMenuOptionBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = { 
    config: {
        name: "3d",
        description: "Turning on 3d filter",
        category: "Filters",
        accessableby: "Member",
    },
    cooldown: 10,
    run: async (client, message, args, user, language, prefix) => {
        const msg = await message.channel.send(`${client.i18n.get(language, "filters", "filter_loading", {
            name: client.commands.get('3d').config.name
        })}`);

            const player = client.manager.get(message.guild.id);
            if (!player) return msg.edit({ content: ' ', embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "noplayer", "no_player")}`)]  });
            const { channel } = message.member.voice;
            if (!channel) return msg.edit({ content: " ", embeds: [new EmbedBuilder()
            .setColor(client.color).setDescription(`${client.i18n.get(language, "music", "play_invoice")}`)]
        });
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

            const data = {
                op: 'filters',
                guildId: message.guild.id,
                rotation: { rotationHz: 0.2 }
            }

            await player.node.send(data);

        const embed = new EmbedBuilder()
            .setDescription(`${client.i18n.get(language, "filters", "filter_on", {
                name: client.commands.get('3d').config.name
            })}`)
            .setColor(client.color);

        await delay(5000);
        msg.edit({ content: " ", embeds: [embed] });
   }
};