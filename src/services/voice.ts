import { Readable } from 'stream';
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  VoiceConnection,
  AudioPlayer,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  StreamType,
  entersState,
} from '@discordjs/voice';
import { VoiceConnectionError } from '../utils/errors';
import logger from '../utils/logger';

interface GuildVoiceState {
  connection: VoiceConnection;
  player: AudioPlayer;
  isPlaying: boolean;
}

class VoiceService {
  private connections: Map<string, GuildVoiceState> = new Map();

  async joinChannel(
    channelId: string,
    guildId: string,
    adapterCreator: any
  ): Promise<VoiceConnection> {
    logger.info('Joining voice channel', { channelId, guildId });

    const existing = this.connections.get(guildId);
    if (existing) {
      logger.info('Already connected to voice channel', { guildId });
      return existing.connection;
    }

    const connection = joinVoiceChannel({
      channelId: channelId,
      guildId: guildId,
      adapterCreator: adapterCreator,
    });

    const player = createAudioPlayer();

    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      logger.warn('Voice connection disconnected', { guildId });
      try {
        await Promise.race([
          entersState(connection, VoiceConnectionStatus.Signalling, 5000),
          entersState(connection, VoiceConnectionStatus.Connecting, 5000),
        ]);
      } catch (error) {
        logger.error('Failed to reconnect', { guildId });
        connection.destroy();
        this.cleanup(guildId);
      }
    });

    player.on(AudioPlayerStatus.Idle, () => {
      const state = this.connections.get(guildId);
      if (state) {
        state.isPlaying = false;
        logger.info('Audio playback finished', { guildId });
      }
    });

    player.on('error', (error) => {
      logger.error('Audio player error', { guildId, error: error.message });
      const state = this.connections.get(guildId);
      if (state) {
        state.isPlaying = false;
      }
    });

    connection.subscribe(player);

    this.connections.set(guildId, { connection, player, isPlaying: false });
    logger.info('Successfully joined voice channel', { guildId });

    return connection;
  }

  async playAudio(guildId: string, audioStream: Readable): Promise<void> {
    const state = this.connections.get(guildId);
    if (!state) {
      throw new VoiceConnectionError('No voice connection for guild');
    }

    logger.info('Playing audio', { guildId });

    const resource = createAudioResource(audioStream, {
      inputType: StreamType.Arbitrary,
    });

    state.player.play(resource);
    state.isPlaying = true;

    return new Promise((resolve, reject) => {
      const onIdle = () => {
        state.isPlaying = false;
        state.player.removeListener('error', onError);
        logger.info('Audio playback completed', { guildId });
        resolve();
      };

      const onError = (error: Error) => {
        state.isPlaying = false;
        state.player.removeListener(AudioPlayerStatus.Idle, onIdle);
        logger.error('Audio playback error', { guildId, error: error.message });
        reject(error);
      };

      state.player.once(AudioPlayerStatus.Idle, onIdle);
      state.player.once('error', onError);
    });
  }

  isConnected(guildId: string): boolean {
    return this.connections.has(guildId);
  }

  disconnect(guildId: string): void {
    const state = this.connections.get(guildId);
    if (!state) {
      return;
    }

    logger.info('Disconnecting from voice channel', { guildId });
    state.connection.destroy();
    this.cleanup(guildId);
  }

  private cleanup(guildId: string): void {
    this.connections.delete(guildId);
    logger.info('Cleaned up voice connection', { guildId });
  }
}

export default new VoiceService();
