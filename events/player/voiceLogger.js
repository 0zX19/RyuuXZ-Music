const UserMusic = require('../../settings/models/UserMusicDatabase');
const moment = require('moment');

const voiceUsers = new Map();

module.exports = (client) => {
    client.on('voiceStateUpdate', async (oldState, newState) => {
        const member = newState.member;
        if (!member || member.user.bot) return; // Abaikan jika bot

        const userId = member.id;
        const guild = newState.guild;

        if (!oldState.channel && newState.channel) {
            // User JOIN voice channel
            voiceUsers.set(userId, { guildId: guild.id, startTime: moment() });
        } else if (oldState.channel && !newState.channel) {
            // User LEAVE voice channel
            const data = voiceUsers.get(userId);
            if (!data) return;

            const duration = moment().diff(data.startTime, 'seconds'); // Hitung dalam detik
            voiceUsers.delete(userId);

            let userData = await UserMusic.findOne({ userId });
            if (!userData) {
                userData = new UserMusic({ userId, topServers: [], topFriends: [], topTracks: [] });
            }

            // Cari server berdasarkan guildId, bukan name untuk mencegah duplikasi
            let server = userData.topServers.find(s => s.guildId === guild.id);
            if (server) {
                server.time += duration;
            } else {
                userData.topServers.push({ guildId: guild.id, name: guild.name, time: duration });
            }

            // Sort berdasarkan waktu & simpan hanya 5 server teratas
            userData.topServers.sort((a, b) => b.time - a.time);
            if (userData.topServers.length > 5) userData.topServers = userData.topServers.slice(0, 5);

            await userData.save();
        }
    });
};
