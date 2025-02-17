const delay = require('delay');
const { EmbedBuilder, AttachmentBuilder, PermissionsBitField, ButtonStyle, ActionRowBuilder, ButtonBuilder, StringSelectMenuOptionBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = { 
    config: {
        name: "rate",
        description: "Sets the rate of the song.",
        category: "Filters",
		accessableby: "Member",
		usage: '<pitch>',
	},
	cooldown: 10,
	run: async (client, message, args, user, language, prefix) => {
		const player = client.manager.get(message.guild.id);
		            if (!player) return msg.edit({ content: ' ', embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(language, "noplayer", "no_player")}`)]  });

		const { channel } = message.member.voice;
		if (!channel || message.member.voice.channel !== message.guild.members.me.voice.channel) return message.channel.send(`${client.i18n.get(language, "noplayer", "no_voice")}`);

		if (isNaN(args[0])) return message.channel.send(`${client.i18n.get(language, "filters", "filter_number")}`);
		if (args[0] < 0) return message.channel.send(`${client.i18n.get(language, "filters", "filter_greater")}`);
		if (args[0] > 10) return message.channel.send(`${client.i18n.get(language, "filters", "filter_less")}`);

		const data = {
			op: 'filters',
			guildId: message.guild.id,
			timescale: { rate: args[0] },
		}

		await player.node.send(data);
		
		const msg = await message.channel.send(`${client.i18n.get(language, "filters", "rate_loading", {
			amount: args[0]
			})}`);
		const embed = new EmbedBuilder()
			.setDescription(`${client.i18n.get(language, "filters", "rate_on", {
				amount: args[0]
			})}`)
			.setColor(client.color);
		await delay(5000);
		msg.edit({ content: " ", embeds: [embed] });
	}
};