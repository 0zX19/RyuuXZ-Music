const { EmbedBuilder } = require('discord.js');
const GPrefix = require('../../../settings/models/Prefix');

module.exports = {
    config: {
        name: "radio",
        description: "📻 Select a Radio Station to play 24/7",
        category: "Music",
        aliases: ["radio"],
        usage: "radio <value>",
        accessableby: "Member",
    },
    cooldown: 10,
    run: async (client, message, args) => {
        const GuildPrefix = await GPrefix.findOne({ guild: message.guild.id });
        const prefix = GuildPrefix ? GuildPrefix.prefix : '!';

        if (!args[0]) {
            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`
Choose a station:
- 70's Hits: **\`${prefix}radio radio70\`**
- 80's Hits: **\`${prefix}radio radio80\`**
- 90's Hits: **\`${prefix}radio radio90\`**
- Top #40 Hits: **\`${prefix}radio t40\`**
- R&B Hits: **\`${prefix}radio rbhits\`**
- Classic Rock: **\`${prefix}radio crock\`**
- Dubstep: **\`${prefix}radio dubstep\`**
- LoFi: **\`${prefix}radio lofi\`**
- Japanese Radio: **\`${prefix}radio jp\`**
- Rap Radio: **\`${prefix}radio rap\`**
- Ardan Radio: **\`${prefix}radio ardan\`**
- CapitalUK: **\`${prefix}radio capital\`**
- Deathcore Radio: **\`${prefix}radio deathcore\`**
- Chill Radio: **\`${prefix}radio chill\`**
- Hard Rock FM: **\`${prefix}radio bahana\`**
                    `)
                        .setColor(client.color)
                        .setAuthor({ name: "Radio Station 24/7", iconURL: client.user.displayAvatarURL() })
                        .setFooter({ text: `Usage: ${prefix}radio <value>` }),
                ],
            });
        }

        const radio = args.join(" ");
        const stationUrls = {
            radio70: "http://radio.idjstream.com:15018/stream",
            radio80: "http://radio.idjstream.com:15020/stream",
            radio90: "http://radio.idjstream.com:15022/stream",
            t40: "http://radio.idjstream.com:15006/stream",
            rbhits: "http://radio.idjstream.com:15008/stream",
            crock: "http://radio.idjstream.com:15012/stream",
            dubstep: "http://radio.idjstream.com:15030/stream",
            lofi: "http://stream.dar.fm/154980",
            jp: "https://audio.misproductions.com/japan128k",
            rap: "http://stream.dar.fm/141073",
            ardan: "https://stream.rcs.revma.com/ugpyzu9n5k3vv",
            capital: "https://media-ice.musicradio.com/CapitalUK",
            deathcore: "http://79.111.14.76:8002/deathcore",
            bahana: "https://n12.radiojar.com/7csmg90fuqruv?rj-ttl=5&rj-tok=AAABkgK_DmgAdMn3HzjGm5rW8A",
            chill: "https://streams.ilovemusic.de/iloveradio17.mp3",
        };

        const rurl = stationUrls[radio];

        if (!rurl) {
            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`Invalid radio station. Use \`${prefix}radio\` to see the available stations.`)
                        .setColor(client.color),
                ],
            });
        }

        const player = client.manager.create({
            guild: message.guild.id,
            voiceChannel: message.member.voice.channel?.id,
            textChannel: message.channel.id,
            selfDeafen: true,
        });

        if (!player.voiceChannel) {
            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setDescription("You must be in a voice channel to play a radio station.")
                        .setColor(client.color),
                ],
            });
        }

        if (player.state !== "CONNECTED") await player.connect();

        const result = await client.manager.search(rurl, message.author);

        if (result.loadType !== "TRACK_LOADED") {
            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`Failed to load the radio stream.`)
                        .setColor(client.color),
                ],
            });
        }

        const track = result.tracks[0];

        if (player.queue.current && player.queue.current.info.isStream) {
            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            `A radio stream is already playing. Stop the current stream with \`${prefix}stop\` before starting another.`
                        )
                        .setColor(client.color),
                ],
            });
        }

        player.queue.clear();
        player.queue.add(track);
        player.play();
    },
};
