import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import type { Command } from './types';
import elevenLabsService from '../services/elevenlabs';
import voiceService from '../services/voice';
import {
  InvalidVoiceIdError,
  ElevenLabsAPIError,
  VoiceConnectionError,
} from '../utils/errors';
import logger from '../utils/logger';

export const speakAsCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('speakas')
    .setDescription('Text-to-speech using ElevenLabs with a specific voice ID')
    .addStringOption((option) =>
      option
        .setName('voiceid')
        .setDescription('ElevenLabs voice ID')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('text')
        .setDescription('Text to speak')
        .setRequired(true)
        .setMaxLength(5000)
    ) as SlashCommandBuilder,

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      // Check if bot is connected to a voice channel
      if (!voiceService.isConnected(interaction.guildId!)) {
        await interaction.editReply('I am not in a voice channel! Use `/join` first.');
        return;
      }

      const voiceId = interaction.options.getString('voiceid', true);
      const text = interaction.options.getString('text', true);

      logger.info('Processing speakAs command', {
        guildId: interaction.guildId,
        userId: interaction.user.id,
        voiceId,
        textLength: text.length,
      });

      const audioStream = await elevenLabsService.generateSpeech(text, voiceId);

      await voiceService.playAudio(interaction.guildId!, audioStream);

      await interaction.editReply('Speaking!');

      logger.info('SpeakAs command completed successfully', { guildId: interaction.guildId });
    } catch (error) {
      logger.error('Error in speakAs command', { error });

      if (error instanceof InvalidVoiceIdError) {
        await interaction.editReply(`Invalid voice ID: ${error.voiceId}`);
      } else if (error instanceof ElevenLabsAPIError) {
        await interaction.editReply(`ElevenLabs API error: ${error.message}`);
      } else if (error instanceof VoiceConnectionError) {
        await interaction.editReply(`Voice connection error: ${error.message}`);
      } else {
        await interaction.editReply('An unexpected error occurred. Please try again.');
      }
    }
  },
};
