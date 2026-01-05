import { REST, Routes } from 'discord.js';
import { config } from '../src/config/environment';
import { commands } from '../src/commands';

const rest = new REST().setToken(config.discord.token);

async function deployCommands() {
  try {
    console.log('Started refreshing application (/) commands.');

    const commandData = Array.from(commands.values()).map((cmd) => cmd.data.toJSON());

    await rest.put(Routes.applicationCommands(config.discord.clientId), {
      body: commandData,
    });

    console.log(`Successfully reloaded ${commandData.length} application (/) commands.`);
  } catch (error) {
    console.error('Error deploying commands:', error);
    process.exit(1);
  }
}

deployCommands();
