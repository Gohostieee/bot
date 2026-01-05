import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import type { Command } from './types';
import voiceService from '../services/voice';
import logger from '../utils/logger';

export const leaveCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Leave the voice channel') as SlashCommandBuilder,

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      logger.info('Leave command executed', {
        guildId: interaction.guildId,
        userId: interaction.user.id,
      });

      const wasConnected = voiceService.isConnected(interaction.guildId!);

      if (!wasConnected) {
        await interaction.reply({ content: 'I am not in a voice channel!', ephemeral: true });
        return;
      }

      voiceService.disconnect(interaction.guildId!);

      await interaction.reply('Left the voice channel!');

      logger.info('Leave command completed successfully', { guildId: interaction.guildId });
    } catch (error) {
      logger.error('Error in leave command', { error });
      await interaction.reply({ content: 'Failed to leave voice channel!', ephemeral: true });
    }
  },
};
