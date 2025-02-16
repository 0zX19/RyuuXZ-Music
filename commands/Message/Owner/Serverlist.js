const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  ownerOnly: true,
  config: {
    name: "serverlist",
    aliases: ["slt"],
    description: "Displays the list of servers the bot is in!",
    category: "Owner",
  },
  run: async (client, message) => {
    let i0 = 0;
    let i1 = 10;
    let page = 1;

    const totalServers = client.guilds.cache.size;
    const sortedGuilds = client.guilds.cache.sort((a, b) => b.memberCount - a.memberCount).map((r) => r);

    const generateDescription = () => {
      return `Total Servers - ${totalServers}\n\n` +
        sortedGuilds
          .slice(i0, i1)
          .map((r) => `${r.name} | ${r.memberCount} Members\nID - ${r.id}\n`)
          .join("\n");
    };

    const embed = new EmbedBuilder()
      .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
      .setColor(client.color || "#7289DA")
      .setFooter({ text: client.user.username })
      .setTitle(`Page - ${page}/${Math.ceil(totalServers / 10)}`)
      .setDescription(generateDescription());

    const updateButtons = () => {
      return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("⬅️")
          .setCustomId("previous_emoji")
          .setDisabled(i0 <= 0),
        new ButtonBuilder()
          .setStyle(ButtonStyle.Secondary)
          .setLabel("❌")
          .setCustomId("home"),
        new ButtonBuilder()
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("➡️")
          .setCustomId("next_emoji")
          .setDisabled(i1 >= totalServers)
      );
    };

    const msg = await message.channel.send({ embeds: [embed], components: [updateButtons()] });

    const filter = (i) => i.user.id === message.author.id;
    const collector = msg.createMessageComponentCollector({ filter, time: 300000, idle: 30000 });

    collector.on("collect", async (interaction) => {
      await interaction.deferUpdate().catch(() => {});

      if (interaction.customId === "previous_emoji") {
        i0 -= 10;
        i1 -= 10;
        page--;
      } else if (interaction.customId === "next_emoji") {
        i0 += 10;
        i1 += 10;
        page++;
      } else if (interaction.customId === "home") {
        return msg.delete().catch(() => {});
      }

      embed.setTitle(`Page - ${page}/${Math.ceil(totalServers / 10)}`).setDescription(generateDescription());
      await msg.edit({ embeds: [embed], components: [updateButtons()] });
    });

    collector.on("end", async () => {
      await msg.edit({ components: [updateButtons().setComponents(updateButtons().components.map((btn) => btn.setDisabled(true)))] }).catch(() => {});
    });
  },
};
