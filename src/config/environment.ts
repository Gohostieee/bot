import dotenv from 'dotenv';

dotenv.config();

interface EnvironmentConfig {
  discord: {
    token: string;
    clientId: string;
  };
  elevenlabs: {
    apiKey: string;
  };
  nodeEnv: string;
  logLevel: string;
}

function validateEnvironment(): EnvironmentConfig {
  const required = ['DISCORD_TOKEN', 'DISCORD_CLIENT_ID', 'ELEVENLABS_API_KEY'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    discord: {
      token: process.env.DISCORD_TOKEN!,
      clientId: process.env.DISCORD_CLIENT_ID!,
    },
    elevenlabs: {
      apiKey: process.env.ELEVENLABS_API_KEY!,
    },
    nodeEnv: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
  };
}

export const config = validateEnvironment();
