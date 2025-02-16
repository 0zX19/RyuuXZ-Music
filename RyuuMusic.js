const { Client, 
Collection, 
GatewayIntentBits, 
Partials,
EmbedBuilder,
WebhookClient, } = require("discord.js");
const { Manager } = require("erela.js");
const Spotify = require("better-erela.js-spotify").default;
const { I18n } = require("locale-parser");
const { ClusterClient, getInfo } = require("discord-hybrid-sharding");
const Utils = require('./handlers/Utils.js');
const voiceLogger = require('./events/player/voiceLogger.js');


class MainClient extends Client {
	constructor() {
        super({
            shards: getInfo().SHARD_LIST,
            shardCount: getInfo().TOTAL_SHARDS,
            lastShard: getInfo().LAST_SHARD_ID,
            shardId: getInfo().SHARD_ID,
            allowedMentions: {
                parse: ["roles", "users", "everyone"],
                repliedUser: false
            },
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildBans,
                GatewayIntentBits.GuildEmojisAndStickers,
                GatewayIntentBits.GuildIntegrations,
                GatewayIntentBits.GuildWebhooks,
                GatewayIntentBits.GuildInvites,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.GuildMessageTyping,
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.DirectMessageReactions,
                GatewayIntentBits.DirectMessageTyping,
                GatewayIntentBits.GuildScheduledEvents,
                GatewayIntentBits.MessageContent
            ],
            partials: [
                Partials.Channel,
                Partials.GuildMember,
                Partials.Message,
                Partials.Reaction,
                Partials.User,
                Partials.GuildScheduledEvent
            ],
        });

    this.config = require("./settings/config.js");
    this.button = require("./settings/button.js");
    this.prefix = this.config.PREFIX;
    this.owner = this.config.OWNER_ID;
    this.aliases = new Collection();
    this.Cooldown = new Collection();
    this.util = new Utils(this);
    this.dev = this.config.DEV_ID;
    this.color = this.config.EMBED_COLOR;
    this.i18n = new I18n(this.config.LANGUAGE);
    if(!this.token) this.token = this.config.TOKEN;

    const WEBHOOK_URL = process.env.ERROR_LOGS_WEBHOOK; // Ganti dengan URL webhook Anda

    voiceLogger(this);

    
// Membuat client webhook
const webhookClient = new WebhookClient({ url: WEBHOOK_URL });

function sendErrorMessage(client, error, type) {
    if (!client || !client.user) {
        console.error('Client or client.user is not ready.');
        return;
    }

    const errorEmbed = new EmbedBuilder()
        .setTitle(`🚨 ${type} Detected`)
        .setDescription(`\`\`\`${error.stack || error.message || 'No stack trace available'}\`\`\``)
        .setColor('Red')
        .setTimestamp();

    try {
        // Kirim juga ke webhook
        webhookClient.send({
            username: client.user.username,
            avatarURL: client.user.displayAvatarURL(),
            embeds: [errorEmbed],
            content: `🚨 ${type} Detected in the bot!`
        });
    } catch (sendError) {
        console.error('Failed to send webhook message:', sendError);
    }
}

// Handling unhandledRejection
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
    sendErrorMessage(client, error, 'Unhandled Rejection');
    if (error instanceof Error) {
        console.error(`Stack Trace: ${error.stack}`);
    } else {
        console.error('Unhandled Rejection is not an Error instance:', error);
    }
});

// Handling uncaughtException
let uncaughtExceptionCount = 0; // Menggabungkan uncaughtException handler

process.on('uncaughtException', (error) => {
    uncaughtExceptionCount++;
    console.error('Uncaught Exception:', error);
    sendErrorMessage(client, error, 'Uncaught Exception');

    if (uncaughtExceptionCount >= 3) {
        console.error('Too many uncaught exceptions. Exiting...');
        process.exit(1); // Keluar jika terlalu banyak uncaught exceptions
    } else {
        // Graceful shutdown setelah uncaught exception
        setTimeout(() => {
            process.exit(1); // Keluar dari proses dengan kode error 1
        }, 1000);
    }
});

// Handling warning
process.on('warning', (warning) => {
    console.warn('Warning detected:', warning);
    sendErrorMessage(client, warning, 'Warning');
});

// Handling rejection handled
process.on('rejectionHandled', (promise) => {
    console.warn('Rejection handled for promise:', promise);
    sendErrorMessage(client, { message: 'A previously rejected promise was handled later.' }, 'Handled Rejection');
});
    

	const client = this;

    this.manager = new Manager({
        nodes: this.config.NODES,
        autoPlay: true,
        plugins: [
            new Spotify({
                clientID: process.env.SPOTIFY_CLIENT_ID,
                clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
            }),
        ],
        send(id, payload) {
        const guild = client.guilds.cache.get(id);
        if (guild) guild.shard.send(payload);
        },
    });


    ["aliases", "commands", "premiums"].forEach(x => client[x] = new Collection());
    ["loadCommand", "loadEvent", "loadPlayer", "loadDatabase"].forEach(x => require(`./handlers/${x}`)(client));

    this.cluster = new ClusterClient(this);
	}
		connect() {
        return super.login(this.token);
    };
};
module.exports = MainClient;
