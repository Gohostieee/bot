import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from 'discord.js';
import type { Command } from './types';
import voiceService from '../services/voice';
import logger from '../utils/logger';

export const joinCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('join')
    .setDescription('Join your current voice channel') as SlashCommandBuilder,

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      const member = interaction.member as GuildMember;
      const voiceChannel = member?.voice?.channel;

      if (!voiceChannel) {
        await interaction.reply({ content: 'You must be in a voice channel!', ephemeral: true });
        return;
      }

      logger.info('Join command executed', {
        guildId: interaction.guildId,
        userId: interaction.user.id,
        channelId: voiceChannel.id,
      });

      await voiceService.joinChannel(
        voiceChannel.id,
        interaction.guildId!,
        voiceChannel.guild.voiceAdapterCreator
      );

      await interaction.reply(`Joined ${voiceChannel.name}!`);

      logger.info('Join command completed successfully', { guildId: interaction.guildId });
    } catch (error) {
      logger.error('Error in join command', { error });
      await interaction.reply({ content: 'Failed to join voice channel!', ephemeral: true });
    }
  },
};
