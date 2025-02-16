const {
    EmbedBuilder,
    ButtonStyle,
    ActionRowBuilder,
    ButtonBuilder,
    PermissionsBitField
} = require('discord.js');

module.exports = {
    config: {
        name: "volume",
        aliases: ["vol", "v"],
        description: "Adjusts the volume of the bot.",
        accessableby: "Member",
        category: "Music",
        usage: "<input>"
    },
    cooldown: 10,
    run: async (client, message, args, user, language, prefix) => {
        const msg = await message.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`${client.i18n.get(language, "music", "volume_loading")}`)
            ]
        });

        const player = client.manager.get(message.guild.id);
        if (!player) return msg.edit({ content: ' ', embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "noplayer", "no_player")}`)]  });

        const { channel } = message.member.voice;
        if (!channel) return msg.edit({
            content: " ",
            embeds: [
                new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`${client.i18n.get(language, "music", "play_invoice")}`)
            ]
        });

        if (!channel.permissionsFor(message.guild.members.me).has(PermissionsBitField.Flags.Connect)) return msg.edit({
            content: " ",
            embeds: [
                new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`${client.i18n.get(language, "music", "play_join")}`)
            ]
        });

        if (!client.manager.nodes.some(node => node.connected)) {
            return msg.edit({
                content: " ",
                embeds: [new EmbedBuilder().setColor(client.color).setDescription("❌ No Lavalink nodes are available. Please try again later.")]
            });
        }

        if (!channel.permissionsFor(message.guild.members.me).has(PermissionsBitField.Flags.Speak)) return msg.edit({
            content: " ",
            embeds: [
                new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`${client.i18n.get(language, "music", "play_speak")}`)
            ]
        });

        if (!message.guild.members.me.voice.channel || !message.guild.members.me.voice.channel.equals(channel)) {
            return msg.edit({
                content: " ",
                embeds: [
                    new EmbedBuilder()
                        .setColor(client.color)
                        .setDescription(`${client.i18n.get(language, "noplayer", "no_voice", { channel: channel.name })}`)
                ]
            });
        }

        if (!args[0]) return msg.edit({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "music", "volume_usage", { volume: player.volume })}`)] });
        if (Number(args[0]) <= 0 || Number(args[0]) > 100) return msg.edit(`${client.i18n.get(language, "music", "volume_invalid")}`);

        await player.setVolume(Number(args[0]));

        const changevol = new EmbedBuilder()
            .setDescription(`${client.i18n.get(language, "music", "volume_msg", { volume: args[0] })}`)
            .setColor(client.color);

        msg.edit({ content: " ", embeds: [changevol] });

        // Adding volume control buttons
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('volume_decrease')
                    .setLabel('-')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('volume_increase')
                    .setLabel('+')
                    .setStyle(ButtonStyle.Secondary)
            );

        msg.edit({ components: [row] });

        const filter = i => ['volume_decrease', 'volume_increase'].includes(i.customId) && i.user.id === message.author.id;
        const collector = message.channel.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async i => {
            if (i.customId === 'volume_decrease') {
                if (player.volume > 0) {
                    await player.setVolume(player.volume - 10);
                    const newVolume = player.volume;
                    const newVolumeEmbed = new EmbedBuilder()
                        .setDescription(`${client.i18n.get(language, "music", "volume_msg", { volume: newVolume })}`)
                        .setColor(client.color);
                    await i.update({ embeds: [newVolumeEmbed] });
                }
            } else if (i.customId === 'volume_increase') {
                if (player.volume < 100) {
                    await player.setVolume(player.volume + 10);
                    const newVolume = player.volume;
                    const newVolumeEmbed = new EmbedBuilder()
                        .setDescription(`${client.i18n.get(language, "music", "volume_msg", { volume: newVolume })}`)
                        .setColor(client.color);
                    await i.update({ embeds: [newVolumeEmbed] });
                }
            }
        });

        collector.on('end', collected => {
            msg.edit({ components: [] }); // Remove buttons after collector ends
        });
    }
};
