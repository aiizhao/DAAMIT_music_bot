const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('End current queue'),
	async execute(interaction) {
        const queue = player.getQueue(interaction.guildId);
        console.log(queue.playing);
		if (!queue || !queue.playing) {
            return interaction.reply({ content:`No music currently playing...`, ephemeral: true });
        } 

        queue.destroy();
        return interaction.reply({ content: `Music stopped. Queue finished!`});
	},
};