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

        const queue = await player.createQueue(interaction.guild, { 
            metadata: interaction, 
            async onBeforeCreateStream(track, source, _queue) {
                if (source === "youtube") {
                    return (await playdl.stream(track.url, { discordPlayerCompatibility : true })).stream;
                } 
            } 
        });

        try {
            if (!queue.connection) {
                await queue.connect(interaction.member.voice.channel);
            }
        } catch {
            queue.destroy();
            return void interaction.followUp({ content: "❗ | Could not join your voice channel!" });
        }

        if (!searchResult.tracks) {
            return await interaction.followUp({ content: `❗ | Track **${query}** not found!` });
        }

        await interaction.followUp({ content: `⏱ | Loading ${searchResult.playlist ? "playlist" : "track"}...` });

        searchResult.playlist ? queue.addTracks(searchResult.tracks) : queue.addTrack(searchResult.tracks[0]);
        if (!queue.playing) {
            await queue.play();
        }
	}
};


