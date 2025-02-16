const { EmbedBuilder } = require('discord.js');

module.exports = {
    ownerOnly: true,
    config: {
        name: "check",
        aliases: ["status", "health"],
        category: "Owner",
        accessibleby: "Owner",
    },
    run: async (client, message) => {
        try {
            const uptime = process.uptime();
            const embed = new EmbedBuilder()
                .setColor(client.color)
                .setTitle('🤖 Bot Status')
                .setDescription('✅ The bot is running smoothly!')
                .addFields(
                    { name: '⏱️ Uptime', value: `${Math.floor(uptime / 60)} minutes ${Math.floor(uptime % 60)} seconds`, inline: true },
                    { name: '📡 Ping', value: `${message.client.ws.ping}ms`, inline: true },
                )
                .setFooter({ text: 'All systems are operational 🚀' })
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            const errorEmbed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('⚠️ Error Detected!')
                .setDescription('❌ The bot encountered an issue. Please check the logs for details.')
                .addFields(
                    { name: '🛑 Error Message', value: `\`\`\`${error.message}\`\`\`` }
                )
                .setFooter({ text: 'Error encountered. Please resolve immediately!' })
                .setTimestamp();

            message.reply({ embeds: [errorEmbed] });
        }
    },
};
