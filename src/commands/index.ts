import { Collection } from 'discord.js';
import type { Command } from './types';
import { speakCommand } from './speak';
import { speakAsCommand } from './speakAs';
import { setCommand } from './set';
import { joinCommand } from './join';
import { leaveCommand } from './leave';
import { rollCommand } from './roll';

const commands = new Collection<string, Command>();

commands.set(speakCommand.data.name, speakCommand);
commands.set(speakAsCommand.data.name, speakAsCommand);
commands.set(setCommand.data.name, setCommand);
commands.set(joinCommand.data.name, joinCommand);
commands.set(leaveCommand.data.name, leaveCommand);
commands.set(rollCommand.data.name, rollCommand);

export { commands };
