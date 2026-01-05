import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import type { Command } from './types';
import logger from '../utils/logger';

function parseDiceNotation(notation: string): { count: number; sides: number; modifier: number } | null {
  // Match patterns like "1d20", "2d6+5", "1d20-10", "d20" (defaults to 1d)
  const match = notation.toLowerCase().match(/^(\d*)d(\d+)([+-]\d+)?$/);

  if (!match) {
    return null;
  }

  const count = match[1] ? parseInt(match[1], 10) : 1;
  const sides = parseInt(match[2], 10);
  const modifier = match[3] ? parseInt(match[3], 10) : 0;

  // Validate reasonable limits
  if (count < 1 || count > 100) return null;
  if (sides < 2 || sides > 1000) return null;

  return { count, sides, modifier };
}

function rollDice(count: number, sides: number): number[] {
  const rolls: number[] = [];
  for (let i = 0; i < count; i++) {
    rolls.push(Math.floor(Math.random() * sides) + 1);
  }
  return rolls;
}

export const rollCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Roll dice using standard notation (e.g., 1d20, 2d6+5)')
    .addStringOption(option =>
      option
        .setName('dice')
        .setDescription('Dice notation (e.g., 1d20, 2d6+5, 1d100-10)')
        .setRequired(true)
    ) as SlashCommandBuilder,

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      const notation = interaction.options.getString('dice', true);
      const parsed = parseDiceNotation(notation);

      if (!parsed) {
        await interaction.reply({
          content: 'Invalid dice notation! Use format like `1d20`, `2d6+5`, or `1d100-10`',
          ephemeral: true,
        });
        return;
      }

      const { count, sides, modifier } = parsed;
      const rolls = rollDice(count, sides);
      const sum = rolls.reduce((a, b) => a + b, 0);
      const total = sum + modifier;

      logger.info('Roll command executed', {
        userId: interaction.user.id,
        notation,
        rolls,
        modifier,
        total,
      });

      // Build the response message
      let response = `**${interaction.user.displayName}** rolled **${notation}**\n`;

      if (count > 1) {
        response += `Rolls: [${rolls.join(', ')}] = ${sum}`;
      } else {
        response += `Roll: ${rolls[0]}`;
      }

      if (modifier !== 0) {
        const modifierStr = modifier > 0 ? `+${modifier}` : `${modifier}`;
        response += ` (${modifierStr}) = **${total}**`;
      } else if (count > 1) {
        response += ` = **${total}**`;
      } else {
        response = `**${interaction.user.displayName}** rolled **${notation}**: **${total}**`;
      }

      await interaction.reply(response);

    } catch (error) {
      logger.error('Error in roll command', { error });
      await interaction.reply({ content: 'Failed to roll dice!', ephemeral: true });
    }
  },
};
