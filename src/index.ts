import { startBot } from './bot';
import elevenLabsService from './services/elevenlabs';
import logger from './utils/logger';

async function main() {
  try {
    logger.info('Starting Discord ElevenLabs TTS Bot...');

    // Validate ElevenLabs API key before starting the bot
    await elevenLabsService.validateApiKey();

    await startBot();
  } catch (error) {
    logger.error('Failed to start bot', { error });
    process.exit(1);
  }
}

process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

main();
