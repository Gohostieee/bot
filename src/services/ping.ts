import { config } from '../config/environment';
import logger from '../utils/logger';

const PING_INTERVAL_MS = 60 * 1000; // 1 minute

let intervalId: NodeJS.Timeout | null = null;

async function ping(): Promise<void> {
  if (!config.pingUrl) return;

  try {
    const response = await fetch(config.pingUrl);
    logger.debug('Ping successful', { url: config.pingUrl, status: response.status });
  } catch (error) {
    logger.warn('Ping failed', { url: config.pingUrl, error });
  }
}

export function startPingService(): void {
  if (!config.pingUrl) {
    logger.debug('No PING_URL configured, skipping ping service');
    return;
  }

  logger.info('Starting ping service', { url: config.pingUrl, intervalMs: PING_INTERVAL_MS });

  // Ping immediately on start
  ping();

  // Then ping every minute
  intervalId = setInterval(ping, PING_INTERVAL_MS);
}

export function stopPingService(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    logger.info('Ping service stopped');
  }
}
