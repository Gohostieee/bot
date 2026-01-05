import logger from '../utils/logger';

interface UserPreference {
  defaultVoiceId: string;
}

class UserPreferencesService {
  private preferences: Map<string, UserPreference> = new Map();

  setDefaultVoice(userId: string, voiceId: string): void {
    const existing = this.preferences.get(userId) || { defaultVoiceId: '' };
    existing.defaultVoiceId = voiceId;
    this.preferences.set(userId, existing);

    logger.info('Set default voice for user', { userId, voiceId });
  }

  getDefaultVoice(userId: string): string | null {
    const preference = this.preferences.get(userId);
    return preference?.defaultVoiceId || null;
  }

  hasDefaultVoice(userId: string): boolean {
    const voiceId = this.getDefaultVoice(userId);
    return voiceId !== null && voiceId !== '';
  }
}

export default new UserPreferencesService();
