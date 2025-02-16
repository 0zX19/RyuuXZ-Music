const delay = require('delay');
const { EmbedBuilder, AttachmentBuilder, PermissionsBitField, ButtonStyle, ActionRowBuilder, ButtonBuilder, StringSelectMenuOptionBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = { 
    config: {
        name: "pop",
        description: "Turning on pop filter",
        category: "Filters",
        accessableby: "Member",
    },
    cooldown: 10,
    run: async (client, message, args, user, language, prefix) => {
        const msg = await message.channel.send(`${client.i18n.get(language, "filters", "filter_loading", {
            name: client.commands.get('pop').config.name
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
                equalizer: [
                    { band: 0, gain: 0.65 },
                    { band: 1, gain: 0.45 },
                    { band: 2, gain: -0.45 },
                    { band: 3, gain: -0.65 },
                    { band: 4, gain: -0.35 },
                    { band: 5, gain: 0.45 },
                    { band: 6, gain: 0.55 },
                    { band: 7, gain: 0.6 },
                    { band: 8, gain: 0.6 },
                    { band: 9, gain: 0.6 },
                    { band: 10, gain: 0 },
                    { band: 11, gain: 0 },
                    { band: 12, gain: 0 },
                    { band: 13, gain: 0 },
                ]
            }
    
            await player.node.send(data);

        const popped = new EmbedBuilder()
            .setDescription(`${client.i18n.get(language, "filters", "filter_on", {
                name: client.commands.get('pop').config.name
            })}`)
            .setColor(client.color);

        await delay(5000);
        msg.edit({ content: " ", embeds: [popped] });
   }
};