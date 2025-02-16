const { createCanvas, loadImage } = require('@napi-rs/canvas');
const UserMusic = require('../../../settings/models/UserMusicDatabase');
const { EmbedBuilder } = require("discord.js")

module.exports = {
    config: {
        name: 'profile-music',
        description: 'Generate user music statistics with a custom background color.',
        category: 'Music',
        accessableby: 'Members',
    },
    cooldown: 10,
    run: async (client, message) => {
        try {
            const fetch = (await import('node-fetch')).default;
            const mentionedUser = message.mentions.users.first() || message.author;

            const userData = await UserMusic.findOne({ userId: mentionedUser.id });

            if (!userData) return message.reply({ embeds: [new EmbedBuilder().setColor(client.color).setDescription("⚠️ No music data found for this user.")] });

            const { topServers = [], topFriends = [], topTracks = [] } = userData;

            // Fungsi konversi waktu ke format yang sesuai
            const formatDuration = (seconds) => {
                if (seconds < 60) return `${seconds}s`;
                if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`;
                if (seconds < 86400) return `${(seconds / 3600).toFixed(1)}h`;
                if (seconds < 604800) return `${(seconds / 86400).toFixed(1)}d`;
                if (seconds < 2419200) return `${(seconds / 604800).toFixed(1)}w`;
                if (seconds < 29030400) return `${(seconds / 2419200).toFixed(1)}m`;
                return `${(seconds / 29030400).toFixed(1)}y`;
            };

            const validateData = (data, defaultText, isTrack = false) => {
                if (!Array.isArray(data) || data.length === 0) {
                    return [{ name: defaultText, time: isTrack ? '0x' : '0' }];
                }
                return data.slice(0, 3).map(item => ({
                    name: item.name || item.title,
                    time: isTrack ? `${item.count}x` : formatDuration(item.time)
                }));
            };

            const validTopServers = validateData(topServers, "There is no server yet");
            const validTopFriends = validateData(topFriends, "There are no friends yet");
            const validTopTracks = validateData(topTracks, "There is no song yet", true);

            // Buat canvas
            const canvas = createCanvas(750, 500);
            const ctx = canvas.getContext('2d');

            // Background
            ctx.fillStyle = "#1E1E2E";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Load avatar
            let avatarUrl = mentionedUser.displayAvatarURL({ extension: 'png', size: 256 });
            let avatarArrayBuffer = await fetch(avatarUrl).then(res => res.arrayBuffer());
            let avatar = await loadImage(Buffer.from(avatarArrayBuffer));

            // Avatar melingkar
            ctx.save();
            ctx.beginPath();
            ctx.arc(80, 80, 50, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatar, 30, 30, 100, 100);
            ctx.restore();

            // Nama User
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 30px Arial';
            ctx.fillText(mentionedUser.username, 160, 70);

            // Fungsi menggambar box statistik
            const drawBox = (x, y, width, height, title, items) => {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                ctx.fillRect(x, y, width, height);
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, width, height);

                ctx.fillStyle = '#fff';
                ctx.font = 'bold 20px Arial';
                ctx.fillText(title, x + 15, y + 30);

                items.forEach((item, index) => {
                    const colors = ['#D32F2F', '#FF9800', '#4CAF50'];
                    const rankX = x + 15;
                    const rankY = y + 50 + index * 30;

                    ctx.fillStyle = colors[index] || '#fff';
                    ctx.fillRect(rankX, rankY, 20, 20);
                    ctx.strokeStyle = '#000';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(rankX, rankY, 20, 20);

                    ctx.fillStyle = '#fff';
                    ctx.font = '16px Arial';
                    ctx.fillText(`${index + 1}`, rankX + 5, rankY + 15);
                    ctx.fillText(`${item.name} - ${item.time}`, rankX + 30, rankY + 15);
                });
            };

            // Gambar statistik musik
            drawBox(30, 150, 340, 140, 'TOP SERVERS', validTopServers);
            drawBox(380, 150, 340, 140, 'TOP FRIENDS', validTopFriends);
            drawBox(30, 310, 690, 140, 'TOP TRACKS', validTopTracks);

            // Kirim ke Discord
            const canvasBuffer = canvas.toBuffer('image/png');
            await message.channel.send({ files: [{ attachment: canvasBuffer, name: 'profile-music.png' }] });

        } catch (error) {
            console.error('❌ Error generating profile music image:', error);
            message.channel.send('⚠️ Terjadi kesalahan saat menghasilkan gambar profil musik.');
        }
    },
};
