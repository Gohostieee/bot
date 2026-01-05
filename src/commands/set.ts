import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import type { Command } from './types';
import userPreferencesService from '../services/userPreferences';
import logger from '../utils/logger';

export const setCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('set')
    .setDescription('Set your default ElevenLabs voice ID')
    .addStringOption((option) =>
      option
        .setName('voiceid')
        .setDescription('ElevenLabs voice ID to use by default')
        .setRequired(true)
    ) as SlashCommandBuilder,

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      const voiceId = interaction.options.getString('voiceid', true);

      logger.info('Processing set command', {
        userId: interaction.user.id,
        voiceId,
      });

      userPreferencesService.setDefaultVoice(interaction.user.id, voiceId);

      await interaction.reply({
        content: `Default voice set to: ${voiceId}\nYou can now use \`/speak [text]\` without specifying a voice ID!`,
        ephemeral: true,
      });

      logger.info('Set command completed successfully', { userId: interaction.user.id });
    } catch (error) {
      logger.error('Error in set command', { error });
      await interaction.reply({
        content: 'Failed to set default voice!',
        ephemeral: true,
      });
    }
  },
};
