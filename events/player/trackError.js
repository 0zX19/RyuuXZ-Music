const { EmbedBuilder } = require("discord.js");
const GLang = require("../../settings/models/Language.js");

module.exports = async (client, player, track, payload) => {

    console.error(payload.error);

    const channel = client.channels.cache.get(player.textChannel);
    if (!channel) return;

    const guildModel = await GLang.findOne({ guild: channel.guild.id });
    const { language } = guildModel;

    /////////// Update Music Setup ///////////

    await client.UpdateMusic(player);
    await client.clearInterval(client.interval);

    ////////// End Update Music Setup //////////

    // const embed = new EmbedBuilder()
    //     .setColor(client.color)
    //     .setDescription(`${client.i18n.get(language, "player", "error_desc")}`);

    // channel.send({ embeds: [embed] }).then((message) => setTimeout(() => message.delete(), 1000));
    if (!player.voiceChannel) player.destroy();

}