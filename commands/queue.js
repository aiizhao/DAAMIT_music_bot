const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('View songs currently in the queue'),

    execute(interaction) {
      
        const queue = player.getQueue(interaction.guildId);

        if (!queue) {
          return interaction.reply({ content: `No music currently playing...`, ephemeral: true });
        } else if (!queue.tracks[0]) {
          return interaction.reply({ content: `No music in the queue after the current one...`, ephemeral: true });
        }

        const methods = ['', '🔁', '🔂'];

        const songs = queue.tracks.length;
        const nextSongs = songs > 5 ? `Additional Tracks: **${songs - 5}**` : `Tracks: **${songs}**`;

        const tracks = queue.tracks.map((track, i) => `**${i + 1}**: ${track.title} • ${track.author} (requested by: **${track.requestedBy.username}**)`)

        const embed = new EmbedBuilder()
        .setColor('#000000')
        .setThumbnail(interaction.guild.iconURL({ size: 2048, dynamic: true }))
        .setAuthor({name: `Queue - ${interaction.guild.name} ${methods[queue.repeatMode]}`, iconURL: client.user.displayAvatarURL({ size: 1024, dynamic: true })})
        .setDescription(`Current: ${queue.current.title}\n\n${tracks.slice(0, 5).join('\n')}\n\n${nextSongs}`)
        .setTimestamp()
        .setFooter({ text: '❤️', iconURL: interaction.member.avatarURL({ dynamic: true })})

        interaction.reply({ embeds: [embed] });
    },
};