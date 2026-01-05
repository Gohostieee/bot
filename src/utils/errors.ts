export class UserNotInVoiceChannelError extends Error {
  constructor() {
    super('User is not in a voice channel');
    this.name = 'UserNotInVoiceChannelError';
  }
}

export class InvalidVoiceIdError extends Error {
  constructor(public voiceId: string) {
    super(`Invalid voice ID: ${voiceId}`);
    this.name = 'InvalidVoiceIdError';
  }
}

export class ElevenLabsAPIError extends Error {
  constructor(message: string) {
    super(`ElevenLabs API error: ${message}`);
    this.name = 'ElevenLabsAPIError';
  }
}

export class VoiceConnectionError extends Error {
  constructor(message: string) {
    super(`Voice connection error: ${message}`);
    this.name = 'VoiceConnectionError';
  }
}
