import { Readable } from 'stream';
import { ElevenLabsClient } from 'elevenlabs';
import { config } from '../config/environment';
import { InvalidVoiceIdError, ElevenLabsAPIError } from '../utils/errors';
import logger from '../utils/logger';

class ElevenLabsService {
  private client: ElevenLabsClient;

  constructor() {
    console.log('config.elevenlabs.apiKey', config.elevenlabs.apiKey);
    this.client = new ElevenLabsClient({
      apiKey: config.elevenlabs.apiKey,
    });
    logger.info('ElevenLabs service initialized');
  }

  async validateApiKey(): Promise<void> {
    try {
      logger.info('Validating ElevenLabs API key...');

      // Make a simple API call to check if the key is valid
      // Using the user endpoint which is lightweight
      await this.client.user.getSubscription();

      logger.info('ElevenLabs API key is valid');
    } catch (error: any) {
      logger.error('ElevenLabs API key validation failed', { error: error.message });

      if (error.statusCode === 401) {
        throw new Error('Invalid ElevenLabs API key. Please check your ELEVENLABS_API_KEY in .env file');
      }

      throw new Error(`Failed to validate ElevenLabs API key: ${error.message}`);
    }
  }

  async generateSpeech(text: string, voiceId: string): Promise<Readable> {
    try {
      logger.info('Generating speech', { voiceId, textLength: text.length });

      const audioStream = await this.client.textToSpeech.convertAsStream(voiceId, {
        text: text,
      });

      logger.info('Speech generation successful');
      return audioStream;
    } catch (error: any) {
      console.log('Full error object:', JSON.stringify(error, null, 2));
      console.log('Error statusCode:', error.statusCode);
      console.log('Error message:', error.message);
      logger.error('ElevenLabs API error', {
        error: error.message,
        voiceId,
        statusCode: error.statusCode,
        fullError: error
      });

      if (error.statusCode === 401 || error.statusCode === '401') {
        throw new ElevenLabsAPIError('Invalid API key');
      } else if (error.statusCode === 404 || error.statusCode === '404') {
        throw new InvalidVoiceIdError(voiceId);
      } else if (error.statusCode === 429 || error.statusCode === '429') {
        throw new ElevenLabsAPIError('Rate limit exceeded');
      } else if (error.statusCode >= 500) {
        throw new ElevenLabsAPIError('Server error');
      }

      throw new ElevenLabsAPIError(error.message || 'Unknown error');
    }
  }
}

export default new ElevenLabsService();
