const { EmbedBuilder } = require('discord.js');
const Blacklist = require('../../../settings/models/Blacklist');

module.exports = {
    config: {
        name: 'blacklist',
        description: 'Manage user blacklist.',
        usage: '<add|remove|list> <user> [reason]',
        category: 'Owner',
        aliases: ['bl'],
    },
    ownerOnly: true,
    run: async (client, message, args) => {
        const subcommand = args[0];
        const targetUser = message.mentions.users.first() || await message.client.users.fetch(args[1]).catch(() => null);
        const reason = args.slice(2).join(' ') || 'No reason provided.';

        if (!subcommand || !['add', 'remove', 'list'].includes(subcommand)) {
            return message.channel.send({ embeds: [new EmbedBuilder().setColor(client.color).setDescription('❌ Invalid subcommand. Use `add`, `remove`, or `list`.')] });
        }

        if (subcommand === 'add') {
            if (!targetUser) {
                return message.channel.send({ embeds: [new EmbedBuilder().setColor(client.color).setDescription('❌ Please mention or provide a valid user ID.')] });
            }

            // Check if the user is already blacklisted
            const isBlacklisted = await Blacklist.findOne({ userId: targetUser.id });
            if (isBlacklisted) {
                return message.channel.send({ embeds: [new EmbedBuilder().setColor(client.color).setDescription('❌ This user is already blacklisted.')] });
            }

            // Add the user to the blacklist
            const newBlacklist = new Blacklist({
                userId: targetUser.id,
                reason,
                addedBy: message.author.id,
            });
            await newBlacklist.save();

            return message.channel.send({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`✅ **${targetUser.tag}** has been successfully added to the blacklist.\n**Reason:** ${reason}`)] });
        }

        if (subcommand === 'remove') {
            if (!targetUser) {
                return message.channel.send({ embeds: [new EmbedBuilder().setColor(client.color).setDescription('❌ Please mention or provide a valid user ID.')] });
            }

            // Remove the user from the blacklist
            const removed = await Blacklist.findOneAndDelete({ userId: targetUser.id });
            if (!removed) {
                return message.channel.send({ embeds: [new EmbedBuilder().setColor(client.color).setDescription('❌ This user is not blacklisted.')] });
            }

            return message.channel.send({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`✅ **${targetUser.tag}** has been successfully removed from the blacklist.`)] });
        }

        if (subcommand === 'list') {
            // Display the list of blacklisted users
            const blacklist = await Blacklist.find();
            if (blacklist.length === 0) {
                return message.channel.send({ embeds: [new EmbedBuilder().setColor(client.color).setDescription('✅ There are no users in the blacklist.')] });
            }

            // Fetch all users from the blacklist to correctly display "Added By" as mentions
            const users = await Promise.all(blacklist.map(async (user) => {
                const addedByUser = `<@795708124442918913>`;
                return {
                    userId: user.userId,
                    reason: user.reason,
                    addedBy: addedByUser,
                };
            }));

            const embed = new EmbedBuilder()
                .setColor(client.color)
                .setTitle('User Blacklist Register')
                .setDescription(users.map((user, index) => `**${index + 1}.** ${user.userId} - **Reason:** ${user.reason} - **Added By:** ${user.addedBy}`).join('\n'))
                .setTimestamp();

            return message.channel.send({ embeds: [embed] });
        }
    },
};
