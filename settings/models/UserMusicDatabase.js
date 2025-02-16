const mongoose = require('mongoose');

const UserMusicSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true }, // Hanya untuk member, bukan bot
    topServers: [{ guildId: String, name: String, time: Number }], // Waktu dalam detik
    topFriends: [{ userId: String, name: String, time: Number }], // Waktu dalam detik
    topTracks: [{ trackId: String, title: String, time: Number }], // Waktu dalam detik
});

module.exports = mongoose.model('UserMusic', UserMusicSchema);
