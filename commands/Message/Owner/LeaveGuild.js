module.exports = {
  ownerOnly: true,
  config: {
      name: 'leave-guild',
      aliases: ['guild-leave', 'lg'],
      description: 'Forces the bot to leave a guild',
      usage: '<guildID>',
      category: 'Owner',
  },
  run: async (client, message, args) => {

      const guildId = args[0];

      // Periksa apakah ID guild disediakan
      if (!guildId) {
          return message.channel.send("Please provide a guild ID.");
      }

      // Temukan guild berdasarkan ID
      const guild = client.guilds.cache.get(guildId);

      // Periksa apakah guild ditemukan
      if (!guild) {
          return message.channel.send("Guild not found. Please check the provided ID.");
      }

      // Coba tinggalkan guild
      try {
          await guild.leave();
          return message.channel.send(`Successfully left the guild: **${guild.name}**`);
      } catch (error) {
          console.error(`Error leaving guild: ${error.message}`);
          return message.channel.send("An error occurred while trying to leave the guild.");
      }
  },
};
