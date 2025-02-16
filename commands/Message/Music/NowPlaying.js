const formatDuration = require("../../../structures/FormatDuration.js");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, MessageFlags } = require("discord.js");
const ytsr = require("youtube-sr").default;

module.exports = { 
    config: {
        name: "nowplaying",
        aliases: ["np", "now"],
        description: "Display the song currently playing.",
        accessableby: "Member",
        category: "Music",
    },
    cooldown: 10,
    run: async (client, message, args, user, language, prefix) => {

        
        const realtime = client.config.NP_REALTIME;
            const msg = await message.channel.send({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "music", "np_loading")}`)] })
        


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

        const song = player.queue.current;
        const CurrentDuration = formatDuration(player.position);
        const TotalDuration = formatDuration(song.duration);
        const Thumbnail = `https://img.youtube.com/vi/${song.identifier}/maxresdefault.jpg`;
        const songInfo = await ytsr.searchOne(song.uri);
        const views = songInfo.views;
        const uploadat = songInfo.uploadedAt;
        const Part = Math.floor(player.position / song.duration * 30);
        const Emoji = player.playing ? "▶️ |" : "⏸ |";
        const Emoji2 = "<a:nplaying:1149083622108844153>";

        const embeded = new EmbedBuilder()
            .setAuthor({ name: player.playing ? `${client.i18n.get(language, "music", "np_title")}` : `${client.i18n.get(language, "music", "np_title_pause")}`, iconURL: `${client.i18n.get(language, "music", "np_icon")}` })
            .setColor(client.color)
            .setDescription(`**[${song.title}](${song.uri})**`)
            .setThumbnail(Thumbnail)
            .addFields({ name: `${client.i18n.get(language, "music", "np_author")}`, value: `${song.author}`, inline: true })
            .addFields({ name: `${client.i18n.get(language, "music", "np_request")}`, value: `${song.requester}`, inline: true })
            .addFields({ name: `${client.i18n.get(language, "music", "np_volume")}`, value: `${player.volume}%`, inline: true })
            .addFields({ name: `${client.i18n.get(language, "music", "np_view")}`, value: `${views}`, inline: true })
            .addFields({ name: `${client.i18n.get(language, "music", "np_upload")}`, value: `${uploadat}`, inline: true })
            .addFields({ name: `${client.i18n.get(language, "music", "np_download")}`, value: `**[Click Here](https://www.y2mate.com/youtube/${song.identifier})**`, inline: true })
            .addFields({ name: `${client.i18n.get(language, "music", "np_current_duration", {
                current_duration: CurrentDuration,
                total_duration: TotalDuration
            })}`, value: `${Emoji} ${'─'.repeat(Part) + `${Emoji2}` + '─'.repeat(30 - Part)}`, inline: false })
            .setTimestamp();

        const button = client.button.nowplaying;

        const row = new  ActionRowBuilder()
            .addComponents(
            new ButtonBuilder()
                .setCustomId("pause")
                .setEmoji(`${button.pause.emoji}`)
                .setStyle(ButtonStyle[button.pause.style])
            )
            .addComponents(
            new ButtonBuilder()
                .setCustomId("replay")
                .setEmoji(`${button.replay.emoji}`)
                .setStyle(ButtonStyle[button.replay.style])
            )
            .addComponents(
            new ButtonBuilder()
                .setCustomId("stop")
                .setEmoji(`${button.stop.emoji}`)
                .setStyle(ButtonStyle[button.stop.style])
            )
            .addComponents(
            new ButtonBuilder()
                .setCustomId("skip")
                .setEmoji(`${button.skip.emoji}`)
                .setStyle(ButtonStyle[button.skip.style])
            )
            .addComponents(
            new ButtonBuilder()
                .setCustomId("loop")
                .setEmoji(`${button.loop.emoji}`)
                .setStyle(ButtonStyle[button.loop.style])
            )

        const NEmbed = await msg.edit({ content: " ", embeds: [embeded], components: [row] });

        /// RUN THIS ON SET TO TRUE
        if (realtime === 'true') {
                client.interval = setInterval(async () => {
                    if (!player.playing) return;
                    const CurrentDuration = formatDuration(player.position);
                    const Part = Math.floor(player.position / song.duration * 30);
                    const Emoji = player.playing ? "▶️ |" : "⏸ |";

                    embeded.data.fields[6] = { name: `${client.i18n.get(language, "music", "np_current_duration", {
                        current_duration: CurrentDuration,
                        total_duration: TotalDuration
                    })}`, value: `${Emoji} ${'─'.repeat(Part) + `${Emoji2}` + '─'.repeat(30 - Part)}` };

                if (NEmbed) NEmbed.edit({ content: " ", embeds: [embeded], components: [row] })
            }, 5000);
            /// RUN THIS ON SET TO FALSE
        } else if (realtime === 'false') {
            if (!player.playing) return;
            if (NEmbed) NEmbed.edit({ content: " ", embeds: [embeded], components: [row] });
        }

        const filter = (message) => {
            if(message.guild.members.me.voice.channel && message.guild.members.me.voice.channelId === message.member.voice.channelId) return true;
            else {
              message.reply({ content: `${client.i18n.get(language, "music", "np_invoice")}`, flags: MessageFlags.Ephemeral });
            }
          };
        const collector = msg.createMessageComponentCollector({ filter, time: song.duration });
        
        collector.on('collect', async (interaction) => {
            const id = interaction.customId;

            if(id === "pause") {
            if(!player) {
                collector.stop();
            }
            await player.pause(!player.paused);
            const uni = player.paused ? `${client.i18n.get(language, "music", "np_switch_pause")}` : `${client.i18n.get(language, "music", "np_switch_resume")}`;
      
            const embed = new EmbedBuilder()
                .setDescription(`${client.i18n.get(language, "music", "np_pause_msg", {
                    pause: uni
                })}`)
                .setColor(client.color);
            
            embeded.setAuthor({ name: player.playing ? `${client.i18n.get(language, "music", "np_title")}` : `${client.i18n.get(language, "music", "np_title_pause")}`, iconURL: `${client.i18n.get(language, "music", "np_icon")}` })
            embeded.data.fields[6] = { name: `${client.i18n.get(language, "music", "np_current_duration", {
                current_duration: formatDuration(player.position),
                total_duration: TotalDuration
            })}`, value: `${player.playing ? "▶️ |" : "⏸ |"} ${'─'.repeat(Math.floor(player.position / song.duration * 30)) + `${Emoji2}` + '─'.repeat(30 - Math.floor(player.position / song.duration * 30))}` };

            if(NEmbed) await NEmbed.edit({ embeds: [embeded] });
            interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            } else if(id === "replay") {
            if(!player) {
                collector.stop();
            }

            await player.seek(0);
          
            const embed = new EmbedBuilder()
                .setDescription(`${client.i18n.get(language, "music", "np_replay_msg")}`)
                .setColor(client.color);;
      
            interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            } else if(id === "stop") {
            if(!player) {
                collector.stop();
            }
      
            await player.stop();
            await player.destroy();
      
            const embed = new EmbedBuilder()
                .setDescription(`${client.i18n.get(language, "music", "np_stop_msg")}`)
                .setColor(client.color);

            await client.clearInterval(client.interval);
            if (NEmbed) await NEmbed.edit({ components: [] })
            interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            } else if (id === "skip") {
            if(!player) {
                collector.stop();
            }
            await player.stop();
      
            const embed = new EmbedBuilder()
                .setDescription(`${client.i18n.get(language, "music", "np_skip_msg")}`)
                .setColor(client.color);

            await client.clearInterval(client.interval);
            if (NEmbed) await NEmbed.edit({ components: [] });
            interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            } else if(id === "loop") {
            if(!player) {
                collector.stop();
            }
            await player.setTrackRepeat(!player.trackRepeat);
            const uni = player.trackRepeat ? `${client.i18n.get(language, "music", "np_switch_enable")}` : `${client.i18n.get(language, "music", "np_switch_disable")}`;
      
            const embed = new EmbedBuilder()
                .setDescription(`${client.i18n.get(language, "music", "np_repeat_msg", {
                    loop: uni
                    })}`)
                .setColor(client.color);
      
            interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }
        });

        collector.on('end', async (collected, reason) => {
            if(reason === "time") {
                if (NEmbed) await NEmbed.edit({ components: [] });
                await client.clearInterval(client.interval);
            }
        });
    }
}