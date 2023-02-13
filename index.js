const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, GuildMember } = require('discord.js');
const { Player } = require("discord-player");
const { token } = require('./config.json');

global.client = new Client({intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent
]})

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, () => {
	console.log('Start!');
});
client.on("error", console.error);
client.on("warn", console.warn);

client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand() || !interaction.guildId) {
        return;
    } else if (!(interaction.member instanceof GuildMember) || !interaction.member.voice.channel) {
        return void interaction.reply({ content: "You are not in a voice channel!", ephemeral: true });
    } 

	const command = client.commands.get(interaction.commandName);
	if (!command) {
        return;
    }

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error("!!!", error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.login(token);

// Discord player
global.player = new Player(client, { ytdlOptions: { quality: 'highestaudio' } });


// Error messages
player.on("error", (queue, error) => {
    console.log(`[${queue.guild.name}] Error emitted from the queue: ${error.message}`);
});
player.on("connectionError", (queue, error) => {
    console.log(`[${queue.guild.name}] Error emitted from the connection: ${error.message}`);
});



// Event listeners
player.on("trackStart", (queue, track) => {
    queue.metadata.channel.send(`🎶 | Started playing: **${track.title}** in **${queue.connection.channel.name}**!`);
});

player.on("trackAdd", (queue, track) => {
    queue.metadata.channel.send(`🎶 | Added to queue: **${track.title}**!`);
});

player.on("botDisconnect", (queue) => {
    queue.metadata.channel.send("❗ | Disconnected from the voice channel. Queue cleared!");
});

player.on("channelEmpty", (queue) => {
    queue.metadata.channel.send("❗ | Nobody is in the voice channel. Leaving...");
});

player.on("queueEnd", (queue) => {
    queue.metadata.channel.send("🍵 | Queue finished!");
});