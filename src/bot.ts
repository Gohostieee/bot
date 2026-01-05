import { Client, Events, GatewayIntentBits, Interaction } from 'discord.js';
import { config } from './config/environment';
import { commands } from './commands';
import logger from './utils/logger';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

client.once(Events.ClientReady, (readyClient) => {
  logger.info(`Logged in as ${readyClient.user.tag}`);
  logger.info(`Bot is ready and serving ${readyClient.guilds.cache.size} guilds`);
});

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);

  if (!command) {
    logger.warn(`Command not found: ${interaction.commandName}`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    logger.error('Error executing command', {
      command: interaction.commandName,
      error,
    });

    const errorMessage = 'There was an error executing this command!';
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: errorMessage, ephemeral: true });
    } else {
      await interaction.reply({ content: errorMessage, ephemeral: true });
    }
  }
});

export async function startBot() {
  try {
    await client.login(config.discord.token);
  } catch (error) {
    logger.error('Failed to login to Discord', { error });
    throw error;
  }
}

export { client };
