const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skip current track'),
	async execute(interaction) {
        const queue = player.getQueue(interaction.guildId);
		if (!queue || !queue.playing) {
            return interaction.reply({ content:`No music currently playing...`, ephemeral: true });
        } 

        const skipped = queue.skip();
        if (skipped) {
            return interaction.reply(`Skipping current track...`);
        } else {
            return interaction.reply(`Something went wrong. Please try again!`);
        }
	},
};




