const { SlashCommandBuilder } = require('discord.js');
const { QueryType } = require("discord-player");
const playdl = require("play-dl");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Plays a song from a YouTube link')
        .addStringOption(option =>
            option.setName('youtube')
                .setDescription('Use YouTube link')
                .setRequired(true)),
	async execute(interaction) {
		await interaction.deferReply();

        const query = interaction.options.get('youtube').value;
        const searchResult = await player.search(query, {
            requestedBy: interaction.user,
            searchEngine: QueryType.AUTO
        }).catch(() => {});

        if (!searchResult || !searchResult.tracks.length) {
            return void interaction.followUp({ content: "No results were found!" });
        } 

        const queue = await player.createQueue(interaction.guild, { metadata: interaction.channel, async onBeforeCreateStream(track, source, _queue) {
            // only trap youtube source
            if (source === "youtube") {
                // track here would be youtube track
                return (await playdl.stream(track.url, { discordPlayerCompatibility : true })).stream;
                // we must return readable stream or void (returning void means telling discord-player to look for default extractor)
            } 
        } } );

        try {
            if (!queue.connection) {
                await queue.connect(interaction.member.voice.channel);
            }
        } catch {
            void player.deleteQueue(interaction.guildId);
            return void interaction.followUp({ content: "Could not join your voice channel!" });
        }

        await interaction.followUp({ content: `⏱ | Loading your ${searchResult.playlist ? "playlist" : "track"}...` });
        searchResult.playlist ? queue.addTracks(searchResult.tracks) : queue.addTrack(searchResult.tracks[0]);
        if (!queue.playing) await queue.play();
	}
};


