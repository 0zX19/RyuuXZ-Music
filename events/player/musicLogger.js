const UserMusic = require('../../settings/models/UserMusicDatabase');
const moment = require('moment');

const voiceUsers = new Map();
const userTracks = new Map(); // Simpan lagu yang sedang diputar per user

module.exports = (client) => {
    // Event saat lagu mulai diputar
    client.manager.on('trackStart', async (player, track) => {
        const userId = player.get('requester')?.id;
        if (!userId) return;

        userTracks.set(userId, { title: track.title, startTime: moment() });
    });

    // Event voiceStateUpdate untuk mendeteksi kapan user keluar dari VC
    client.on('voiceStateUpdate', async (oldState, newState) => {
        try {
            const member = newState.member || oldState.member;
            if (!member || member.user.bot) return; // Abaikan bot

            const userId = member.id;
            const guildId = newState.guild?.id || oldState.guild?.id;
            const guildName = newState.guild?.name || oldState.guild?.name;

            if (!userId || !guildId) return;

            // Jika user JOIN voice channel
            if (!oldState.channel && newState.channel) {
                voiceUsers.set(userId, { guildId, guildName, startTime: moment() });
            }
            // Jika user LEAVE voice channel
            else if (oldState.channel && !newState.channel) {
                const voiceData = voiceUsers.get(userId);
                if (!voiceData) return;

                const duration = moment().diff(voiceData.startTime, 'seconds'); // Hitung dalam detik
                voiceUsers.delete(userId);

                if (duration <= 0) return;

                let userData = await UserMusic.findOne({ userId });
                if (!userData) {
                    userData = new UserMusic({ userId, topServers: [], topFriends: [], topTracks: [] });
                }

                // Update topServers
                let server = userData.topServers.find(s => s.guildId === guildId);
                if (server) {
                    server.time += duration;
                } else {
                    userData.topServers.push({ guildId, name: guildName, time: duration });
                }

                // Update topTracks jika user memainkan lagu
                const trackData = userTracks.get(userId);
                if (trackData) {
                    const trackDuration = moment().diff(trackData.startTime, 'seconds');

                    let track = userData.topTracks.find(t => t.title === trackData.title);
                    if (track) {
                        track.time += trackDuration;
                    } else {
                        userData.topTracks.push({ title: trackData.title, time: trackDuration });
                    }

                    userData.topTracks.sort((a, b) => b.time - a.time);
                    userData.topTracks = userData.topTracks.slice(0, 5);

                    userTracks.delete(userId); // Hapus setelah disimpan
                }

                // Sort berdasarkan waktu terbesar dan ambil hanya top 5
                userData.topServers.sort((a, b) => b.time - a.time);
                userData.topServers = userData.topServers.slice(0, 5);

                await userData.save();
            }
        } catch (error) {
            console.error('❌ Error on voiceStateUpdate:', error);
        }
    });
};
