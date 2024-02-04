// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const util = require('minecraft-server-util');

const { command, timeBeforeUpdate, servers, timeout, token } = require('./config.json');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, async (c) => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
	for(const server of Object.values(servers)) {
		fetchServerData(server);
	}
});

client.on(Events.MessageCreate, async (m) => {
	if(command.aliases.includes(m.content.trim())) {
		m.reply({ embeds: [ await getListEmbed() ] });
	}
});

var data = [];

for(const s of Object.values(servers)) {
	data[s.name] = {
		online: false,
		name: s.name,
	}
}

var dataTimestamp = 0;

async function getListEmbed() {
	if((Date.now() - dataTimestamp) / 1000 >= timeBeforeUpdate) {
		for(const server of Object.values(servers)) {
			fetchServerData(server);
		}
	}

	return new EmbedBuilder()
		.setTitle("RaMc Status")
		.setDescription(
			`Bedrock IP: \`Play.RaMc.Pro:19132\`\nJava IP: \`Play.RaMc.Pro\`\n\nRedstone IP: \`RaMc.Pro\`\nRedstone Port: \`19132\`\n\`Bedrock Only!\`\n\n` +  // <- Your server ip addres | ايبي سيرفرك
			Object.values(data).map(server =>
				`**• ${server.name}**\n` +
				(server.online ? '╰ <:emoji_9:1154626849993932851> Online' : '╰ <:offline1:1154672750867255306> Offline') + // <- Your discord server emoji id | ايدي ايموجيات سيرفرك دس
				(server.online ? `\n╰ <:ra_member:1154663372726489148> ${server.count} Players` : '') + '\n'
			).join('\n')
		)
		.setColor(Object.values(data).some(s => s.online) ? "#120a8a" : "#ff0000")
		.setTimestamp(dataTimestamp);
}

async function fetchServerData(server) {
	dataTimestamp = new Date();

	try {
		if(server.mode.toLowerCase() === "java") {
			const raw = await util.status(server.ip, server.port, { timeout: timeout });

			data[server.name] = {
				name: server.name,
				max: raw.players.max,
				count: raw.players.online,
				list: raw.players.sample ? Object.values(raw.players.sample).map(e => e.name): [],
				online: true,
			}
		}else if(server.mode.toLowerCase() === "bedrock") {
			const raw = await util.queryFull(server.ip, server.port, { sessionID: 1, timeout: timeout });

			data[server.name] = {
				name: server.name,
				max: raw.players.max,
				count: raw.players.online,
				list: raw.players.list,
				online: true,
			}
		}
	}catch(e) {
		console.log(e);

		data[server.name] = {
			name: server.name,
			online: false
		};
	}
}

// Log in to Discord with your client's token
client.login(token);

// اي مساعده كلمني في خاص الدسكورد | any help just dm me on discord : P8ML